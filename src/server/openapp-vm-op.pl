#!/usr/bin/perl

use strict;
use Getopt::Long;
use POSIX qw(setsid);
use lib '/opt/vyatta/share/perl5';
use OpenApp::VMMgmt;
use OpenApp::LdapUser;

# authenticated user
my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

sub fdRedirect {
  open STDOUT, '>', '/dev/null';
  open STDERR, '>&STDOUT';
  open STDIN, '<', '/dev/null';
}

my ($action, $vmid) = (undef, undef);
GetOptions(
  'action=s' => \$action,
  'vm=s' => \$vmid
);
if (!defined($action) || !defined($vmid)) {
    `logger -p info 'dom0: Must specify action and VM ID'`;
    print "Must specify action and VM ID\n";
    exit 1;
}
my $vmObj = new OpenApp::VMMgmt($vmid);
if (!defined($vmObj)) {
    `logger -p info 'dom0: Invalid VM ID $vmid'`;
    print "Invalid VM ID '$vmid'\n";
    exit 1;
}

# OA dom0
if ($vmid eq $OpenApp::VMMgmt::OPENAPP_ID) {
  if ($action ne 'restart') {
      `logger -p info 'dom0: Invalid operation for $vmid'`;
      print "Invalid operation for '$vmid'\n";
      exit 1;
  }

  my $pid = undef;
  if (!defined($pid = fork())) {
      `logger -p info 'dom0: Cannot create process for operation'`;
      print "Cannot create process for operation\n";
      exit 1;
  } elsif ($pid) {
    # parent: return success
    exit 0;
  } else {
    # child: reboot
    fdRedirect();
    setsid();
    system('sleep 5 ; sudo /sbin/reboot >&/dev/null');
    exit 0;
  }
}

my $lv_cfg = $vmObj->getLibvirtCfg();
if (! -f "$lv_cfg") {
    `logger -p info 'dom0: Cannot find configuration for $vmid'`;
    print "Cannot find configuration for '$vmid'";
    exit 1;
}

# TODO: make sure start/stop/restart are disallowed during upgrade/restore

if ($action eq 'start') {
  OpenApp::VMMgmt::startVM($vmid);
  exit 0;
} elsif ($action eq 'stop') {
  OpenApp::VMMgmt::shutdownVM($vmid);
  exit 0;
} elsif ($action eq 'restart') {
  OpenApp::VMMgmt::shutdownVM($vmid);
  OpenApp::VMMgmt::startVM($vmid);
  exit 0;
}

exit 0;

