#!/usr/bin/perl

use strict;
use Getopt::Long;
use lib '/opt/vyatta/share/perl5';
use OpenApp::LdapUser;
use OpenApp::BLB;

my ($pexists, $user, $setp, $authb, $issa)
  = (undef, undef, undef, undef, undef);
GetOptions(
  'pass-exists' => \$pexists,
  'user=s' => \$user,
  'set-pass' => \$setp,
  'auth-blb=s' => \$authb,
  'is-standalone' => \$issa
);

if (defined($pexists)) {
  if (!defined($user)) {
    print "Must specify \"user\"\n";
    exit 1;
  }
  checkPasswordExists($user);
}

if (defined($setp)) {
  if (!defined($user)) {
    print "Must specify \"user\"\n";
    exit 1;
  }
  setPassword($user);
}

if (defined($authb)) {
  if (! -r "$authb") {
    print "Must specify a file for auth-blb\n";
    exit 1;
  }
  do_auth_blb($authb);
}

if (defined($issa)) {
  # NOTE cannot use BLB::isStandalone() since we don't have a session
  my $cfg = new Vyatta::Config;
  $cfg->{_active_dir_base} = '/opt/vyatta/config/active';
  exit 0 if (!$cfg->existsOrig("$OpenApp::BLB::OA_BLB_CONF_ROOT"));
  exit 1;
}

exit 1;

sub checkPasswordExists {
  my ($user) = @_;
  my $u = new OpenApp::LdapUser($user);
  if ($u->passwordExists()) {
    exit 0;
  } else {
    exit 1;
  }
}

sub setPassword {
  my ($user) = @_;
  my $u = new OpenApp::LdapUser($user);
  my $pass = <STDIN>;
  chomp($pass);
  my $err = $u->setPassword($pass);
  if (defined($err)) {
    # no output
    exit 1;
  }
  exit 0;
}

sub do_auth_blb {
  my ($file) = @_;
  my $fd;
  exit 1 if (!open($fd, '<', "$file"));
  my $user = <$fd>;
  my $pass = <$fd>;
  close($fd);
  chomp($user);
  chomp($pass);
  my ($blb_token, $err) = OpenApp::BLB::authBLB($user, $pass);
  exit 1 if (defined($err));
  print "$blb_token";
  exit 0;
}

