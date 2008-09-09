#!/usr/bin/perl

use strict;

my $VM_LIST_FILE = '/opt/vyatta/etc/gui/vmlist';
my $LIBVIRT_CFG_DIR = '/opt/vyatta/etc/libvirt';

my $vmname = shift;
my $action = shift;

# TODO: dom0 "name"
if ($vmname eq 'OpenAppliance') {
  if ($action ne 'restart') {
    print "Invalid action \"$action\" for \"$vmname\"";
    exit 1;
  }
  if (fork()) {
    # parent: return success
    exit 0;
  } else {
    # child: reboot
    system('sleep 5 ; sudo /sbin/reboot >&/dev/null');
    exit 0;
  }
}

my $vf;
my ($name, $ip, $xml) = ('', '', '');
if ((-r $VM_LIST_FILE) && open($vf, "<", "$VM_LIST_FILE")) {
  while (<$vf>) {
    chomp;
    ($name, $ip, $xml) = split / +/;
    last if ($name eq $vmname);
  }
}

if (($name ne $vmname) || (! -f "$LIBVIRT_CFG_DIR/$xml")) {
  print "Cannot find configuration for \"$vmname\"";
  exit 1;
}

if ($action eq 'start') {
  system("sudo virsh -c xen:/// create $LIBVIRT_CFG_DIR/$xml");
  exit 1 if ($? >> 8);
} elsif ($action eq 'stop') {
  system("sudo virsh -c xen:/// shutdown $vmname");
  exit 1 if ($? >> 8);
} elsif ($action eq 'restart') {
  system("sudo virsh -c xen:/// reboot $vmname");
  exit 1 if ($? >> 8);
}

exit 0;

