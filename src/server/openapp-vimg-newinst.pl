#!/usr/bin/perl

use strict;
use lib "/opt/vyatta/share/perl5";
use OpenApp::VMDeploy;

# VMID: the ID of VM
# VER: the version of VM
my $VMID = $ARGV[0];
my $VER = $ARGV[1];

my $err = undef;
while (1) {
  $err = OpenApp::VMDeploy::installNewVM($VMID, $VER);
  last if (defined($err));

  # don't start if we are not running already. this is xen-specific.
  last if (! -f '/proc/xen/capabilities');
  
  # start the new VM
  my $vmObj = new OpenApp::VMMgmt($VMID);
  if (!defined($vmObj)) {
    $err = "Invalid VM ID $VMID";
    last;
  }
  my $lv_cfg = $vmObj->getLibvirtCfg();
  if (! -f "$lv_cfg") {
    $err = "Cannot find configuration for '$VMID'";
    last;
  }
  system("sudo virsh -c xen:/// create $lv_cfg");
  last;
}

if (defined($err)) {
  print "$err\n";
  exit 1;
}

exit 0;

