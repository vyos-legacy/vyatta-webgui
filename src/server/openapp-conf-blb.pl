#!/usr/bin/perl

use strict;
use Getopt::Long;
use FileHandle;
use lib '/opt/vyatta/share/perl5';
use OpenApp::LdapUser;
use OpenApp::Conf;
use OpenApp::BLB;
use Vyatta::Config;
use OpenApp::VMDeploy;

# authenticated user
my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer') {
  # not authorized
  exit 1;
}

# TODO move BLB-related conf into BLB.pm
my $BLB_CONF_ROOT = 'system open-app blb-association';

my ($status, $standalone, $blb, $confsa, $confblb)
  = (undef, undef, undef, undef, undef);
GetOptions(
  'status' => \$status,
  'standalone' => \$standalone,
  'blb=s' => \$blb,
  'conf-standalone' => \$confsa,
  'conf-blb=s' => \$confblb
);

if (defined($status)) {
  do_status();
  exit 0;
}

if (defined($standalone)) {
  do_standalone();
  exit 0;
}

if (defined($confsa)) {
  do_conf_standalone();
  exit 0;
}

if (defined($confblb)) {
  exit 1 if (! -r "$confblb");
  do_conf_blb($confblb);
  exit 0;
}

if (defined($blb)) {
  exit 1 if (! -r "$blb");
  do_blb($blb);
  exit 0;
}

sub do_status {
  my $cmdline = $ENV{OA_CMD_LINE};
  if (!defined $cmdline) {
      print "VERBATIM_OUTPUT\n";
  }
  my $cfg = new Vyatta::Config;
  if ($cfg->existsOrig("$BLB_CONF_ROOT")) {
    my $u = $cfg->returnOrigValue("$BLB_CONF_ROOT username");
    if (!defined $cmdline) { 
    print <<EOF;
<blbconf mode='association'>
  <username>$u</username>
</blbconf>
EOF
    }
    else {
	print "mode:\tassociation\tuser:\t$u\n";
    }
  } else {
      if (!defined $cmdline) {
    print <<EOF;
<blbconf mode='standalone'>
</blbconf>
EOF
      }
      else {
	print "mode:\tstandalone\n";
      }
  }
}

sub do_conf_standalone {
  my $cfg = new Vyatta::Config;
  if (!$cfg->existsOrig("$BLB_CONF_ROOT")) {
    print "Standalone mode is already configued\n";
    exit 1;
  }
  
  my @cmds = (
    "delete $BLB_CONF_ROOT",
    'commit',
    'save'
  );
  my $err = OpenApp::Conf::execute_session(@cmds);
  if (defined($err)) {
    print "BLB configuration failed: $err\n";
    exit 1;
  }
}
  
sub do_standalone {
  my $cfg = new Vyatta::Config;
  if (!$cfg->existsOrig("$BLB_CONF_ROOT")) {
    print "Standalone mode is already configued\n";
    exit 1;
  }
  
  # if admin has no LDAP password, restore default password
  my $adm = new OpenApp::LdapUser('admin');
  if (!$adm->passwordExists()) {
    my $err = $adm->resetPassword();
    if (defined($err)) {
      print "Failed to restore default admin password: $err\n";
      exit 1;
    }
  }
  
  # notify lighttpd to reconfigure reverse proxy
  OpenApp::VMDeploy::notifyWuiProcess();
}
  
sub do_conf_blb {
  my ($file) = @_;
  my $fd = undef;
 
  # read user/pass from file
  if (!open($fd, '<', $file)) {
    print "Failed to open user/pass file\n";
    exit 1;
  }
  my $user = <$fd>;
  my $pass = <$fd>;
  close($fd);
  chomp($user);
  chomp($pass);

  # change/save the configuration. 
  my @cmds = (
    "set $BLB_CONF_ROOT username '$user'",
    "set $BLB_CONF_ROOT password '$pass'",
    'commit',
    'save'
  );
  my $err = OpenApp::Conf::execute_session(@cmds);
  if (defined($err)) {
    print "Failed to save BLB configuration: $err\n";
    exit 1;
  }
}

sub do_blb {
  my ($file) = @_;
  my $fd = undef;
  
  # read user/pass from file
  if (!open($fd, '<', $file)) {
    print "Failed to open user/pass file\n";
    exit 1;
  }
  my $user = <$fd>;
  my $pass = <$fd>;
  close($fd);
  chomp($user);
  chomp($pass);

  # do BLB association
  ## check credential
  my ($blb_token, $err) = OpenApp::BLB::authBLB($user, $pass);
  if (defined($err)) {
    print "$err\n";
    exit 1;
  } 
 
  ## login succeeded. change installer password.
  my $inst = new OpenApp::LdapUser('installer');
  $err = $inst->setPassword($pass);
  if (defined($err)) {
    print "Failed to update installer password: $err\n";
    exit 1;
  }

  ## reset "admin" account
  my $adm = new OpenApp::LdapUser('admin');
  $err = $adm->deletePassword();
  if (defined($err)) {
    print "Failed to reset admin account: $err\n";
    exit 1;
  }
  
  # notify lighttpd to reconfigure reverse proxy
  OpenApp::VMDeploy::notifyWuiProcess();
}

exit 1;

