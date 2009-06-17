#!/usr/bin/perl

use strict;
use lib '/opt/vyatta/share/perl5';
use Getopt::Long;
use XML::Simple;
use Vyatta::Config;
use OpenApp::Conf;

my %port_map = (
                '1' => 'eth5',
                '2' => 'eth3',
                '3' => 'eth1',
                '4' => 'eth0'
               );

my $dbg_log = undef;

my ($get, $set) = (undef);
GetOptions(
  'get' => \$get,
  'set=s' => \$set
);

if (defined($get)) {
  do_get();
  exit 0;
}

if (defined($set)) {
  do_set($set);
  exit 0;
}

print "Invalid port configuration operation\n";
exit 1;

sub dlog {
  return if (!defined($dbg_log));
  my $fh = undef;
  return if (!open($fh, '>>', $dbg_log));
  print $fh @_;
  close($fh);
}

sub do_get {
  my $cfg = new Vyatta::Config;
  my %pstatus = ();
  foreach (keys %port_map) {
    $pstatus{$_}
      = ($cfg->existsOrig("interfaces ethernet $port_map{$_} disable"))
        ? 'false' : 'true';
  }
  print <<EOF;
<form name='port-config' code='0'>
  <port-group>
    <group>LAN</group>
    <group>LAN2</group>
    <group>DMZ</group>
    <group>WAN</group>
  </port-group>
  <port-config>
    <port>
      <num>1</num>
      <name>Port E3</name>
      <group>LAN2</group>
      <enable>$pstatus{1}</enable>
    </port>
    <port>
      <num>2</num>
      <name>Port E2</name>
      <group>DMZ</group>
      <enable>$pstatus{2}</enable>
    </port>         
    <port>
      <num>3</num>
      <name>Port E1</name>
      <group>LAN</group>
      <enable>$pstatus{3}</enable>
    </port>                     
    <port>
      <num>4</num>
      <name>Port E0</name>
      <group>WAN</group>
      <enable>$pstatus{4}</enable>
    </port>
  </port-config>
</form>
EOF
}

sub do_set {
  my ($data) = @_;
  my $xs  = XML::Simple->new(ForceArray => [ 'port' ]);
  my $xml = $xs->XMLin($data);
  if (!defined($xml->{port})) {
    print "No ports to configure\n";
    exit 1;
  }
  my @cmds = ();
  for my $port (@{$xml->{port}}) {
    my ($num, $enable) = ($port->{num}, $port->{enable});
    if (!defined($num) || !defined($enable) || !defined($port_map{$num})
        || ($enable ne 'true' && $enable ne 'false')) {
      print "Invalid port configuration\n";
      exit 1;
    }
    my $cmd = (($enable eq 'true') ? 'delete' : 'set')
              . " interfaces ethernet $port_map{$num} disable";
    push @cmds, $cmd;
  }
  push @cmds, ('commit', 'save');
  foreach (@cmds) {
    dlog("$_\n");
  }
  my $err = OpenApp::Conf::execute_session(@cmds);
  if (defined($err)) {
    print "Port configuration failed: $err\n";
    exit 1;
  }
  print "Port configuration succeeded\n";
}

