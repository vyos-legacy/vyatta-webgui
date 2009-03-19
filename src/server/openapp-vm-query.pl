#!/usr/bin/perl

use strict;
use Getopt::Long;
use lib "/opt/vyatta/share/perl5";
use OpenApp::VMMgmt;

my ($list) = ('NO_VALUE');
GetOptions(
  'list:s' => \$list
);

if ($list ne 'NO_VALUE') {
  do_list($list);
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

