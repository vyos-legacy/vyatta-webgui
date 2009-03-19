#!/usr/bin/perl

use strict;
use Getopt::Long;
use lib "/opt/vyatta/share/perl5";
use OpenApp::VMMgmt;

my ($list, $status) = ('NO_VALUE', 'NO_VALUE');
GetOptions(
  'list:s' => \$list,
  'status:s' => \$status
);

if ($list ne 'NO_VALUE') {
  do_list($list);
  exit 0;
}
if ($status ne 'NO_VALUE') {
  do_status($status);
  exit 0;
}

sub do_list {
  print "VERBATIM_OUTPUT\n";
  my $id = shift;
  my @VMs = ();
  if ($id ne '') {
    @VMs = ( $id );
  } else {
    @VMs = OpenApp::VMMgmt::getVMList();
  }

  for my $vid (@VMs) {
    my $vm = new OpenApp::VMMgmt($vid);
    my $ip = $vm->getIP();
    my $port = $vm->getWuiPort();
    my $uri = $vm->getWuiUri();
    my $ver = $vm->getImgVer();
    my $dname = $vm->getDisplayName();
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
}

sub do_status {
  print "VERBATIM_OUTPUT\n";
  my $id = shift;
  my @VMs = ();
  if ($id ne '') {
    @VMs = ( $id );
  } else {
    @VMs = OpenApp::VMMgmt::getVMList();
    unshift @VMs, 'openapp';
  }

  for my $vid (@VMs) {
    my $vm = new OpenApp::VMMgmt($vid);
    my $st = $vm->getState();
    my $cpu = $vm->getCpu();
    my $dall = $vm->getDiskAll();
    my $dfree = $vm->getDiskFree();
    my $mall = $vm->getMemAll();
    my $mfree = $vm->getMemFree();
    my $upd = $vm->getUpdateAvail();
    print <<EOF;
      <vmstatus id='$vid'>
        <state>$st</state>
        <cpu>$cpu</cpu>
        <diskAll>$dall</diskAll>
        <diskFree>$dfree</diskFree>
        <memAll>$mall</memAll>
        <memFree>$mfree</memFree>
        <updAvail>$upd</updAvail>
      </vmstatus>
EOF
  }
}

