#!/usr/bin/perl

use strict;
use Getopt::Long;
use lib "/opt/vyatta/share/perl5";
use OpenApp::VMMgmt;
use OpenApp::VMDeploy;
use OpenApp::LdapUser;

# authenticated user
my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

my ($sched, $ver, $time, $cancel, $restore, $list)
  = (undef, undef, undef, undef, undef, undef);
GetOptions(
  'sched=s' => \$sched,
  'ver=s' => \$ver,
  'time=s' => \$time,
  'cancel=s' => \$cancel,
  'restore=s' => \$restore,
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

if (defined($restore)) {
  if (!defined($ver)) {
    print "Invalid command\n";
    exit 1;
  }
  do_restore($restore, $ver);
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

sub do_restore {
  my ($id, $ver) = @_;
  my $vm = new OpenApp::VMDeploy($id);
  if (!defined($vm)) {
    print "Invalid VM ID '$id'\n";
    exit 1;
  }
  my $err = $vm->schedRestore($ver);
  if (defined($err)) {
    print "$err\n";
    exit 1;
  }
  print "'$id' restore initiated successfully\n";
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
      my $id = $href->{_id};
      my $ver = $href->{_ver};
      my $status = $href->{_status};
      my $msg = $href->{_msg};
      my $prev = OpenApp::VMDeploy::vmCheckPrev($vid);
      print <<EOF;
      <record>
        <time>$time</time>
        <id>$id</id>
        <ver>$ver</ver>
        <prevVer>$prev</prevVer>
        <status>$status</status>
        <msg>$msg</msg>
      </record>
EOF
    }
  }
}

