#!/usr/bin/perl

use strict;
use lib "/opt/vyatta/share/perl5";
use OpenApp::VMDeploy;

# VMID: the ID of VM
# PREV_META: the metadata file of the previous version. 'NONE' if new install.
my $VMID = $ARGV[0];
my $PREV_META = $ARGV[1];

my $err = OpenApp::VMDeploy::oaVimgPostinst($VMID, $PREV_META);

if (defined($err)) {
  print "$err\n";
  exit 1;
}

exit 0;

