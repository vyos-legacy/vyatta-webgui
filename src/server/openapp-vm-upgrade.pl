#!/usr/bin/perl

use strict;
use Getopt::Long;
use lib '/opt/vyatta/share/perl5';
use OpenApp::VMMgmt;
use OpenApp::VMDeploy;

my ($action, $vmid, $vver) = (undef, undef, undef);
GetOptions(
  'action=s' => \$action,
  'vm=s' => \$vmid,
  'ver=s' => \$vver
);
if (!defined($action) || !defined($vmid) || !defined($vver)) {
    `logger -p debug 'dom0: Must specify action, VM ID, and version'`;
    print "Must specify action, VM ID, and version\n";
    exit 1;
}
my $vmObj = new OpenApp::VMMgmt($vmid);
if (!defined($vmObj)) {
    `logger -p debug 'dom0: Invalid VM ID '$vmid'`;
    print "Invalid VM ID '$vmid'\n";
    exit 1;
}

my $vmDeploy = new OpenApp::VMDeploy($vmid);
if ($action eq 'upgrade') {
  $vmDeploy->upgrade($vver);
  exit 0;
} elsif ($action eq 'restore') {
  $vmDeploy->restore($vver);
  exit 0;
}

exit 0;

