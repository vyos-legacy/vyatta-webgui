#!/usr/bin/perl

use strict;
use lib "/opt/vyatta/share/perl5";
use OpenApp::VMDeploy;

# VMID: the ID of VM
# VER: the version of VM
my $VMID = $ARGV[0];
my $VER = $ARGV[1];

my $err = OpenApp::VMDeploy::installNewVM($VMID, $VER);

if (defined($err)) {
  print "$err\n";
  exit 1;
}

exit 0;

