#!/usr/bin/perl

use strict;
use Net::SNMP;

my $VM_LIST_FILE = '/opt/vyatta/etc/gui/vmlist';

sub exitError {
  print $_[0];
  exit 1;
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

sub getHwStatus {
  my $nic = getHwNic();
  my $disk = getHwDisk();
  my $cpu = getHwCpu();
  my $fan = getHwFan();

  my $ret =<<EOS;
  <hw>
    <nic>$nic</nic>
    <disk>$disk</disk>
    <cpu>$cpu</cpu>
    <fan>$fan</fan>
  </hw>
EOS
}

sub getDom0Status {
  # TODO: dom0 "name"
  my $name = 'OpenAppliance';

  # TODO: dom0 "status"
  my $status = 'up';

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

  # TODO: dom0 "version" stuff
  my $ver = <<'EOS';
    <version>
      <current>1.0</current>
      <avail>1.0</avail>
    </version>
EOS

  my $ret = <<EOS;
  <vm name='$name'>
    <status>$status</status>
    <cpu util='$cpu_util'/>
    <mem total='$mem_total' free='$mem_free'/>
    <disk total='$disk_total' free='$disk_free'/>
$ver  </vm>
EOS
  return $ret;
}

sub vmStatus {
  my $s = shift;

  # uptime
  # TODO: actual status
  my $oid = '.1.3.6.1.2.1.25.1.1.0';
  my $r = $s->get_request(-varbindlist => [ $oid ]);
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

sub getVmStatus {
  my ($name, $ip, $url) = @_;

  my ($status, $cpu_util, $mem_total, $mem_free, $disk_total, $disk_free)
    = ('unknown', 0, 0, 0, 0, 0);

  # check libvirt status
  system("sudo virsh -c xen:/// domstate $name >&/dev/null");
  if ($? >> 8) {
    # vm doesn't exist
    $status = 'down';
  }

  # TODO: domU "version" stuff
  my $ver = <<'EOS';
    <version>
      <current>1.1</current>
      <avail>1.1</avail>
    </version>
EOS

  while ($status eq 'unknown') {
    my ($s, $err) = Net::SNMP->session(-hostname => "$ip",
                                       -community => 'vyatta',
                                       -timeout => 1,
                                       -retries => 1,
                                       -version => '2c');
    last if (!defined($s));
    
    $status = vmStatus($s);
    # if no status, don't try the others
    last if ($status eq 'unknown');

    $cpu_util = vmCpuUtil($s);
    ($mem_total, $mem_free) = vmMem($s);
    ($disk_total, $disk_free) = vmDisk($s);

    last;
  }

  my $ret = <<EOS;
  <vm name='$name'>
    <status>$status</status>
    <cpu util='$cpu_util'/>
    <mem total='$mem_total' free='$mem_free'/>
    <disk total='$disk_total' free='$disk_free'/>
    <guiUrl>$url</guiUrl>
$ver  </vm>
EOS
  return $ret;
}

# header
my $outstr = <<'EOS';
<?xml version='1.0' encoding='utf-8'?>
<vyatta>
EOS

# hw status
$outstr .= getHwStatus();

# Dom0
$outstr .= getDom0Status();

# DomUs
my $vf;
if ((-r $VM_LIST_FILE) && open($vf, "<", "$VM_LIST_FILE")) {
  while (<$vf>) {
    chomp;
    my ($name, $ip, $xml, $url) = split / +/;
    $outstr .= getVmStatus($name, $ip, $url);
  }
}

# footer
$outstr .= <<'EOS';
</vyatta>
EOS

print $outstr;
exit 0;

