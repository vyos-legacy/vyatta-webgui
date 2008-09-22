#!/usr/bin/perl

use strict;

my $VM_LIST_FILE = '/opt/vyatta/etc/gui/vmlist';
my $LIBVIRT_CFG_DIR = '/opt/vyatta/etc/libvirt';

my $vmname = shift;
my $action = shift;

# take care of forked processes
$SIG{CHLD} = 'IGNORE';
sub fdRedirect {
  open STDOUT, '>', '/dev/null';
  open STDERR, '>&STDOUT';
  open STDIN, '<', '/dev/null';
}

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
    fdRedirect();
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

sub waitVmShutOff {
  my $vm = shift;
  # max 180 seconds
  for my $i (0 .. 90) {
    sleep 2;
    my $st = `sudo virsh -c xen:/// domstate $vm`;
    last if ($st =~ /shut off/ || $st =~ /error: failed to get domain/);
  }
}

sub shutdownVm {
  my $vm = shift;
  system("sudo virsh -c xen:/// shutdown $vm");
  waitVmShutOff($vm);
  system("sudo virsh -c xen:/// destroy $vm");
}

if ($action eq 'start') {
  system("sudo virsh -c xen:/// create $LIBVIRT_CFG_DIR/$xml");
  # this always returns -1
  exit 0;
} elsif ($action eq 'stop') {
  if (fork()) {
    # parent: return success after delay
    sleep 5;
    exit 0;
  } else {
    # child: shutdown
    fdRedirect();
    shutdownVm($vmname);
    exit 0;
  }
} elsif ($action eq 'restart') {
  if (fork()) {
    # parent: return success after delay
    sleep 5;
    exit 0;
  } else {
    # child: restart
    fdRedirect();
    shutdownVm($vmname);
    system("sudo virsh -c xen:/// create $LIBVIRT_CFG_DIR/$xml");
    exit 0;
  }
}

exit 0;

