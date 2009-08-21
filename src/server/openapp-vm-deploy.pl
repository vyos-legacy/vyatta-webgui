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
  if (!OpenApp::VMMgmt::isValidId($sched) 
      || !OpenApp::VMDeploy::isValidNewVer($sched, $ver) 
      || !OpenApp::VMDeploy::isValidSchedTime($time)) {
      `logger -p info 'dom0: Invalid command'`;
      print "Invalid command\n";
      exit 1;
  }
  do_sched($sched, $ver, $time);
  exit 0;
}

if (defined($cancel)) {
  if (!OpenApp::VMMgmt::isValidId($cancel)) {
      `logger -p info 'dom0: Invalid command'`;
      print "Invalid command\n";
      exit 1;
  }
  do_cancel($cancel);
  exit 0;
}

if (defined($restore)) {
  if (!OpenApp::VMMgmt::isValidId($restore) 
      || !OpenApp::VMDeploy::isValidPrevVer($restore, $ver)) {
      `logger -p info 'dom0: Invalid command'`;
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

`logger -p info 'dom0: Invalid command'`;
print "Invalid command\n";
exit 1;

sub do_sched {
  my ($id, $ver, $time) = @_;
  my $vm = new OpenApp::VMDeploy($id);
  if (!defined($vm)) {
      `logger -p info 'dom0: Invalid VM ID $id'`;
      print "Invalid VM ID '$id'\n";
      exit 1;
  }
  my $err = $vm->sched($ver, $time);
  if (defined($err)) {
      `logger -p info 'dom0: $err'`;
      print "$err\n";
      exit 1;
  }
  print "'$id' update scheduled successfully\n";
}

sub do_cancel {
  my ($id) = @_;
  my $vm = new OpenApp::VMDeploy($id);
  if (!defined($vm)) {
      `logger -p info 'dom0: Invalid VM ID $id'`;
      print "Invalid VM ID '$id'\n";
      exit 1;
  }
  my $err = $vm->cancel();
  if (defined($err)) {
      `logger -p info 'dom0: $err'`;
      print "$err\n";
      exit 1;
  }
  print "'$id' update cancelled successfully\n";
}

sub do_restore {
  my ($id, $ver) = @_;
  my $vm = new OpenApp::VMDeploy($id);
  if (!defined($vm)) {
      `logger -p info 'dom0: Invalid VM ID $id'`;
      print "Invalid VM ID '$id'\n";
      exit 1;
  }
  my $err = $vm->schedRestore($ver);
  if (defined($err)) {
      `logger -p info 'dom0: $err'`;
      print "$err\n";
      exit 1;
  }
  print "'$id' restore initiated successfully\n";
}

sub do_list {
  my $cmdline = $ENV{OA_CMD_LINE};

  if (!defined $cmdline) {
    print "VERBATIM_OUTPUT\n";
  }
  my @VMs = OpenApp::VMMgmt::getVMList();
  push @VMs, $OpenApp::VMMgmt::OPENAPP_ID; # include dom0 itself
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
      my $old = (defined($href->{_old})) ? " old='true'" : '';
      my $prev = OpenApp::VMDeploy::vmCheckPrev($vid);

      #convert time to speced format
      my $epoch = OpenApp::VMDeploy::time2epoch($time);
      $time = POSIX::strftime('%Y/%m/%d %H:%M',localtime($epoch));

      if (!defined($cmdline)) {
        print <<EOF;
<record$old>
  <time>$time</time>
  <id>$id</id>
  <ver>$ver</ver>
  <prevVer>$prev</prevVer>
  <status>$status</status>
  <msg>$msg</msg>
</record>
EOF
	    } else {
        print <<EOF;
entry:
    time:     $time
    id:       $id
    version:  $ver
    previous: $prev
    status:   $status
    message:  $msg
EOF
	    }
    }
  }
}

