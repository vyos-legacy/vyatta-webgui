#!/usr/bin/perl

use strict;
use Getopt::Long;
use lib "/opt/vyatta/share/perl5";
use OpenApp::VMMgmt;
use OpenApp::LdapUser;

my $OA_ID = $OpenApp::VMMgmt::OPENAPP_ID;

# authenticated user
my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my %auth_user_rights = %{$auth_user->getRights()};
my $auth_user_role = $auth_user->getRole();

my ($list, $status, $hwmon, $lang) = ('NO_VALUE', 'NO_VALUE', 0, 'en');
GetOptions(
  'list:s' => \$list,
  'lang=s' => \$lang,
  'status:s' => \$status,
  'hwmon' => \$hwmon
);

if ($list ne 'NO_VALUE') {
  do_list($list, $lang);
  exit 0;
}
if ($status ne 'NO_VALUE') {
  if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
    # not authorized
    exit 1;
  }
  do_status($status);
  exit 0;
}
if ($hwmon) {
  if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
    # not authorized
    exit 1;
  }
  do_hwmon();
  exit 0;
}

sub do_list {
    
    my $cmdline = $ENV{OA_CMD_LINE};
    if (!defined $cmdline) {
	print "VERBATIM_OUTPUT\n";
    }
    my ($id, $lang) = @_;
    my @VMs = ();
    if ($id ne '') {
	@VMs = ( $id );
    } else {
	@VMs = OpenApp::VMMgmt::getVMList();
    }

  for my $vid (@VMs) {
    next if (($auth_user_role ne 'installer')
             && ($auth_user_role ne 'admin')
             && (!defined($auth_user_rights{$vid})));
    my $vm = new OpenApp::VMMgmt($vid);
    next if (!defined($vm));
    my $ip = $vm->getIP();
    my $port = $vm->getWuiPort();
    my $uri = $vm->getWuiUri();
    my $ver = $vm->getImgVer();
    my $dname = $vm->getDisplayNameLang($lang);
    if (!defined $cmdline) {
    print <<EOF;
      <vm id='$vid'>
        <ip>$ip</ip>
        <guiPort>$port</guiPort>
        <guiUri>$uri</guiUri>
        <version>$ver</version>
        <displayName>$dname</displayName>
      </vm>
EOF
    }
    else {
	print "\nvm id:\t$vid\n";
	print "\tip address:\t$ip\n";
	print "\turi:\t\t$uri\n";
	print "\tversion:\t$ver\n";
	print "\tdisplay name:\t$dname\n";
    }
  }
}

sub do_status {
  print "VERBATIM_OUTPUT\n";
  my $id = shift;
  my @VMs = ();
  if ($id ne '') {
    @VMs = ( $id );
  } else {
    @VMs = OpenApp::VMMgmt::getVMList();
    unshift @VMs, $OA_ID;
  }

  for my $vid (@VMs) {
    my $vm = new OpenApp::VMMgmt($vid);
    next if (!defined($vm));
    my $st = $vm->getState();
    my $cpu = $vm->getCpu();
    my $dall = $vm->getDiskAll();
    my $dfree = $vm->getDiskFree();
    my $mall = $vm->getMemAll();
    my $mfree = $vm->getMemFree();
    my ($upd, $crit) = $vm->getUpdateAvail();
    if ("$crit" ne '') {
      $crit = " critical='$crit'";
    }
    print <<EOF;
      <vmstatus id='$vid'>
        <state>$st</state>
        <cpu>$cpu</cpu>
        <diskAll>$dall</diskAll>
        <diskFree>$dfree</diskFree>
        <memAll>$mall</memAll>
        <memFree>$mfree</memFree>
        <updAvail$crit>$upd</updAvail>
      </vmstatus>
EOF
  }
}

sub do_hwmon {
  print "VERBATIM_OUTPUT\n";
  my ($nic, $disk, $cpu, $fan) = OpenApp::VMMgmt::getHwMonData();
  print <<EOF;
      <hwmon>
        <nic>$nic</nic>
        <disk>$disk</disk>
        <cpu>$cpu</cpu>
        <fan>$fan</fan>
      </hwmon>
EOF
}

