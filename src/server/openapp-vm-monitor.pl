#!/usr/bin/perl

use strict;
use threads;
use threads::shared;

use POSIX qw(mkfifo);
use Net::SNMP;
use lib '/opt/vyatta/share/perl5';
use OpenApp::VMMgmt;

my $INTERVAL_ACTIVE = 5;
my $INTERVAL_INACTIVE = 30;
my $INACTIVE_TIMEOUT = 60;
my $OA_ID = $OpenApp::VMMgmt::OPENAPP_ID;
my $OA_SNMP_COMM = $OpenApp::VMMgmt::OPENAPP_SNMP_COMM;
my $STATE_DIR = '/opt/vyatta/var/run';
my $FIFO_NAME = "$STATE_DIR/vm-monitor-sock";

# the time that the last GUI activity occurred
my $LAST_ACT_TIME :shared;
$LAST_ACT_TIME = 0;

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

  # XXX hardwired state and updateAvail
  OpenApp::VMMgmt::updateStatus($OA_ID, 'up', $cpu_util, $disk_total,
                                $disk_free, $mem_total, $mem_free, 'no');
}

sub vmStatus {
  my $s = shift;

  # XXX use uptime for now
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

sub updateVMStatus {
  my $vid = shift;
  my $vm = new OpenApp::VMMgmt($vid);
  my $ip = $vm->getIP();
  my ($status, $cpu_util, $mem_total, $mem_free, $disk_total, $disk_free)
    = ('unknown', 0, 0, 0, 0, 0);
  
  # check libvirt status
  system("sudo virsh -c xen:/// domstate $vid >&/dev/null");
  if ($? >> 8) {
    # vm doesn't exist
    $status = 'down';
  }
  while ($status eq 'unknown') {
    my ($s, $err) = Net::SNMP->session(-hostname => "$ip",
                                       -community => $OA_SNMP_COMM,
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

  # XXX hardwired updateAvail
  OpenApp::VMMgmt::updateStatus($vid, $status, $cpu_util, $disk_total,
                                $disk_free, $mem_total, $mem_free, 'no');
}

sub fifo_thread {
  if (! -p $FIFO_NAME) {
    unlink($FIFO_NAME);
    my ($d1, $d2, $gid, $d3) = getgrnam('operator');
    umask(007);
    mkfifo($FIFO_NAME, 0770) or return;
    chown -1, $gid, $FIFO_NAME;
  }
  my $fd = undef;
  while (1) {
    open($fd, '<', $FIFO_NAME) or return;
    my $line = <$fd>;
    close($fd);
    $LAST_ACT_TIME = time();
  } 
}

my $th = threads->create('fifo_thread');
while (1) {
  updateOAStatus();
  my @VMs = OpenApp::VMMgmt::getVMList();
  for my $vm (@VMs) {
    updateVMStatus($vm);
  }

  my $cur_time = time();
  my $to_sleep = $INTERVAL_ACTIVE;
  if (($cur_time - $LAST_ACT_TIME) > $INACTIVE_TIMEOUT) {
    # it's been too long since last GUI activity. use inactive interval.
    $to_sleep = $INTERVAL_INACTIVE;
  }
  my $slept = 0;
  # inactive interval should be multiples of active interval
  while ($slept < $to_sleep) {
    sleep($INTERVAL_ACTIVE);
    $slept += $INTERVAL_ACTIVE;
    if ($cur_time < $LAST_ACT_TIME) {
      # something happened while we are asleep. wake up.
      last;
    }
  }
}

