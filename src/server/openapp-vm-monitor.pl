#!/usr/bin/perl

use strict;

use POSIX qw(setsid);
use Net::SNMP;
use lib '/opt/vyatta/share/perl5';
use OpenApp::VMMgmt;
use OpenApp::VMDeploy;

my $INTERVAL_ACTIVE = 5;
my $INTERVAL_INACTIVE = 120;
my $INACTIVE_TIMEOUT = 60;
my $OA_ID = $OpenApp::VMMgmt::OPENAPP_ID;
my $OA_SNMP_COMM = $OpenApp::VMMgmt::OPENAPP_SNMP_COMM;
my $STATE_FILE = '/var/run/vm-monitor.state';

sub fdRedirect {
  open STDOUT, '>', '/dev/null';
  open STDERR, '>&STDOUT';
  open STDIN, '<', '/dev/null';
}

sub updateOAStatus {
  # cpu
  # XXX this takes 1 second (can't use 1st sample)
  my @cpu = `vmstat 1 2`;
  splice @cpu, 0, 3;
  my $cpu_util = (100 - (split / +/, $cpu[0])[15]);

  # mem
  my @mem = `free`;
  shift @mem;
  my $mem_total = (split / +/, $mem[0])[1];
  chomp $mem[1];
  my $mem_free = (split / +/, $mem[1])[3];
  $mem_total = int($mem_total / 1024);
  $mem_free = int($mem_free / 1024);
 
  # disk
  # TODO: mounts other than '/'
  my @disk = `df -k`;
  my $disk_total = 0;
  my $disk_free = 0;
  shift @disk;
  foreach (@disk) {
    chomp;
    my @part = split / +/;
    next if ($part[5] ne '/');
    $disk_total += $part[1];
    $disk_free += $part[3];
    last;
  }
  $disk_total = int($disk_total / 1024);
  $disk_free = int($disk_free / 1024);

  # XXX hardwired state, updateAvail, and updCritTime
  OpenApp::VMMgmt::updateStatus($OA_ID, 'up', $cpu_util, $disk_total,
                                $disk_free, $mem_total, $mem_free, '', '');
}

sub vmStatus {
  my ($s, $status_oid) = @_;

  # query status
  my $r = $s->get_request(-varbindlist => [ $status_oid ]);
  # TODO implement result mapping
  return 'unknown' if (!defined($r));
  return 'up';
}

sub vmCpuUtil {
  my $s = shift;

  # ucdavis.11.ssCpuIdle
  my $oid = '.1.3.6.1.4.1.2021.11.11.0';
  my $r = $s->get_request(-varbindlist => [ $oid ]);
  return 0 if (!defined($r));
  return (100 - $r->{$oid});
}

sub vmMem {
  my $s = shift;

  # ucdavis.4.memTotalReal.0
  # ucdavis.4.memTotalFree.0
  # ucdavis.4.memBuffer.0
  # ucdavis.4.memCached.0
  my ($total, $free, $buf, $cache) = ('.1.3.6.1.4.1.2021.4.5.0',
                                      '.1.3.6.1.4.1.2021.4.11.0',
                                      '.1.3.6.1.4.1.2021.4.14.0',
                                      '.1.3.6.1.4.1.2021.4.15.0');
  my $r = $s->get_request(-varbindlist => [ $total, $free, $buf, $cache ]);
  return (0, 0) if (!defined($r));
  return (int($r->{$total} / 1024),
          int(($r->{$free} + $r->{$buf} + $r->{$cache}) / 1024));
}

sub vmDisk {
  my $s = shift;

  # HOST-RESOURCES-MIB
  my $r = $s->get_table(-baseoid => '.1.3.6.1.2.1.25');
  return (0, 0) if (!defined($r));
  
  # find description oid for /
  my $rdesc = undef;
  foreach (grep /^\.1\.3\.6\.1\.2\.1\.25\.2\.3\.1\.3/, (keys %$r)) {
    if ($r->{$_} eq '/') {
      $rdesc = $_;
      last;
    }
  }
  return (0, 0) if (!defined($rdesc));
  $rdesc =~ /^(.+)\.3\.(\d+)$/;
  my ($pfx, $idx) = ($1, $2);
  my ($unit, $size, $used) = ($r->{"$pfx.4.$idx"}, $r->{"$pfx.5.$idx"},
                              $r->{"$pfx.6.$idx"});
  return (0, 0) if (!defined($unit) || !defined($size) || !defined($used));
  return (int($size * $unit / 1048576),
          int(($size - $used) * $unit / 1048576));
}

sub updateVMStatus {
  my $vid = shift;
  my $vm = new OpenApp::VMMgmt($vid);
  my ($status, $cpu_util, $mem_total, $mem_free, $disk_total, $disk_free,
      $upd_avail, $upd_crit) = ('unknown', 0, 0, 0, 0, 0, '', '');

  # check update availability
  ($upd_avail, $upd_crit) = OpenApp::VMDeploy::vmCheckUpdate($vid);
  
  # check libvirt status.
  # can't use system() when ignoring SIGCHLD (wrong exit status).
  my $lvs = `sudo virsh -c xen:/// domstate $vid 2>&1`;
  if ($lvs =~ /^error:/) {
    # vm doesn't exist
    $status = 'down';
  }
  while ($status eq 'unknown') {
    last if (!defined($vm));

    my $ip = $vm->getIP();
    my $status_oid = $vm->getStatusOid();
    my ($s, $err) = Net::SNMP->session(-hostname => "$ip",
                                       -community => $OA_SNMP_COMM,
                                       -timeout => 1,
                                       -retries => 1,
                                       -version => '2c');
    last if (!defined($s));
    
    $status = vmStatus($s, $status_oid);
    # if no status, don't try the others
    last if ($status eq 'unknown');

    $cpu_util = vmCpuUtil($s);
    ($mem_total, $mem_free) = vmMem($s);
    ($disk_total, $disk_free) = vmDisk($s);
    last;
  }

  OpenApp::VMMgmt::updateStatus($vid, $status, $cpu_util, $disk_total,
                                $disk_free, $mem_total, $mem_free,
                                $upd_avail, $upd_crit);
}

sub getHw1Nic {
  my $dev = shift;
  my $out;
  return 'unknown' if (!open($out, '-|', "/sbin/ip link show $dev"));
  my @res = grep { /^\d+:\s+$dev:/ } <$out>;
  return 'unknown' if (scalar(@res) != 1);
  return ($res[0] =~ /,UP,/) ? 'good' : 'bad';
}

sub getHwNic {
  # assume 'ethX'
  my $ndir;
  return 'unknown' if (!opendir($ndir, '/sys/class/net'));
  my @nics = grep { /^eth\d+$/ } readdir($ndir);
  closedir($ndir);
  return 'unknown' if (scalar(@nics) < 1);

  my $ret = 'good';
  foreach (@nics) {
    my $nret = getHw1Nic($_);
    if ($nret ne 'good') {
      $ret = $nret;
      last;
    }
  }
  return $ret;
}

sub getHw1Disk {
  my $dev = shift;
  my $out;
  return 'unknown' if (!open($out, '-|', "sudo /usr/sbin/smartctl -H $dev"));
  my @res = grep { /(self-assessment|Status)/ } <$out>;
  return 'unknown' if (scalar(@res) != 1);
  return ($res[0] =~ /(PASSED|OK)/) ? 'good' : 'bad';
}

sub getHwDisk {
  # assume 'sdX' or 'hdX'
  my $ddir;
  return 'unknown' if (!opendir($ddir, '/dev'));
  my @disks = grep { /^[sh]d[a-z]$/ } readdir($ddir);
  closedir($ddir);
  return 'unknown' if (scalar(@disks) < 1);

  my $ret = 'good';
  foreach (@disks) {
    my $dret = getHw1Disk("/dev/$_");
    if ($dret ne 'good') {
      $ret = $dret;
      last;
    }
  }
  return $ret;
}

sub getHw1Cpu {
  my $path = shift;
  return 'unknown' if (! -d $path);
 
  # current temperature
  my $f;
  return 'unknown' if (!open($f, '<', "$path/temp1_input"));
  my $temp = <$f>;
  close($f);
 
  # max threshold
  return 'unknown' if (!open($f, '<', "$path/temp1_crit"));
  my $max = <$f>;
  close($f);
  
  chomp $temp;
  chomp $max;
  return ($temp < $max) ? 'good' : 'bad';
}

sub getHwCpu {
  # assume recent Intel CPU (coretemp)
  # TODO: support AMD (k8temp)
  my $sdir;
  return 'unknown' if (!opendir($sdir, '/sys/devices/platform'));
  my @cores = grep { /^coretemp\.\d+$/ } readdir($sdir);
  closedir($sdir);
  return 'unknown' if (scalar(@cores) < 1);

  my $ret = 'good';
  foreach (@cores) {
    my $cret = getHw1Cpu("/sys/devices/platform/$_");
    if ($cret ne 'good') {
      $ret = $cret;
      last;
    }
  }
  return $ret;
}

sub getHwFan {
  # TODO: actually get fan info (if sensor available)
  return 'unknown';
}

sub updateHwMon {
  my $nic = getHwNic();
  my $disk = getHwDisk();
  my $cpu = getHwCpu();
  my $fan = getHwFan();
  OpenApp::VMMgmt::updateHwMon($nic, $disk, $cpu, $fan);
}

sub get_last_act_time {
  if (! -r $STATE_FILE) {
    return 0;
  } else {
    return (stat($STATE_FILE))[8];
  }
}

sub installNewVMs {
  my $uref = OpenApp::VMDeploy::getUpdateList();
  for my $aref (@{$uref}) {
    my ($vmid, $ver) = @{$aref};
    next if ("$vmid" eq '' || OpenApp::VMMgmt::isValidId($vmid));
    # we've got a new VM to install
    my $pid = undef;
    next if (!defined($pid = fork()) || $pid);
    # child process here. exec the newinst script.
    fdRedirect();
    setsid();
    exec('/opt/vyatta/sbin/openapp-vimg-newinst.pl', $vmid, $ver)
      or exit 1;
  }
}

sub processCriticalUpdates {
  OpenApp::VMDeploy::recordCriticalUpdates();
 
  # get the list of critical updates that should be installed now
  my $uref = OpenApp::VMDeploy::getCritUpdateInstList();
  for my $aref (@{$uref}) {
    # install critical update
    my ($vmid, $ver) = @{$aref};
    my $pid = undef;
    next if (!defined($pid = fork()) || $pid);
    # child process here. exec the upgrade script.
    fdRedirect();
    setsid();
    exec('/opt/vyatta/sbin/openapp-vm-upgrade.pl', '--action=upgrade',
         "--vm=$vmid", "--ver=$ver")
      or exit 1;
  }
}

while (1) {
  updateOAStatus();
  # install new VMs (may be critical) before processing critical
  installNewVMs();
  # process critical before updating updAvail for VMs
  processCriticalUpdates();
  my @VMs = OpenApp::VMMgmt::getVMList();
  for my $vm (@VMs) {
    updateVMStatus($vm);
  }
  updateHwMon();

  my $cur_time = time();
  my $to_sleep = $INTERVAL_ACTIVE;
  if (($cur_time - get_last_act_time()) > $INACTIVE_TIMEOUT) {
    # it's been too long since last GUI activity. use inactive interval.
    $to_sleep = $INTERVAL_INACTIVE;
  }
  my $slept = 0;
  # inactive interval should be multiples of active interval
  while ($slept < $to_sleep) {
    sleep($INTERVAL_ACTIVE);
    $slept += $INTERVAL_ACTIVE;
    if ($cur_time < get_last_act_time()) {
      # something happened while we were asleep. wake up.
      last;
    }
  }
}

