#!/usr/bin/perl

use strict;
use Getopt::Long;
use lib "/opt/vyatta/share/perl5";
use OpenApp::VMMgmt;
use OpenApp::VMDeploy;

my ($sched, $ver, $time, $cancel, $list)
  = (undef, undef, undef, undef, undef);
GetOptions(
  'sched=s' => \$sched,
  'ver=s' => \$ver,
  'time=s' => \$time,
  'cancel=s' => \$cancel,
  'list' => \$list
);

if (defined($sched)) {
  if (!defined($ver) || !defined($time)) {
    print "Invalid command\n";
    exit 1;
  }
  do_sched($sched, $ver, $time);
  exit 0;
}

if (defined($cancel)) {
  do_cancel($cancel);
  exit 0;
}

if ($list) {
  do_list();
  exit 0;
}

sub do_sched {
  my ($id, $ver, $time) = @_;
  my $vm = new OpenApp::VMDeploy($id);
  if (!defined($vm)) {
    print "Invalid VM ID '$id'\n";
    exit 1;
  }
  my $err = $vm->sched($ver, $time);
  if (defined($err)) {
    print "$err\n";
    exit 1;
  }
  print "'$id' update scheduled successfully\n";
}

sub do_cancel {
  my ($id) = @_;
  my $vm = new OpenApp::VMDeploy($id);
  if (!defined($vm)) {
    print "Invalid VM ID '$id'\n";
    exit 1;
  }
  my $err = $vm->cancel();
  if (defined($err)) {
    print "$err\n";
    exit 1;
  }
  print "'$id' update cancelled successfully\n";
}

sub do_list {
  print "VERBATIM_OUTPUT\n";
  my @VMs = OpenApp::VMMgmt::getVMList();
  for my $vid (@VMs) {
    my $vm = new OpenApp::VMDeploy($vid);
    next if (!defined($vm));
    my $aref = $vm->getHist();
    for my $href (@{$aref}) {
      my $time = $href->{_time};
      my $img = $href->{_img};
      my $status = $href->{_status};
      my $msg = $href->{_msg};
      print <<EOF;
      <record>
        <time>$time</time>
        <img>$img</img>
        <status>$status</status>
        <msg>$msg</msg>
      </record>
EOF
    }
  }
}

