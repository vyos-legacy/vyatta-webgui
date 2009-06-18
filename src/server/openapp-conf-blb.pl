#!/usr/bin/perl

use strict;
use Getopt::Long;
use FileHandle;
use IPC::Open2;
use lib '/opt/vyatta/share/perl5';
use OpenApp::LdapUser;
use OpenApp::Conf;
use Vyatta::Config;

# authenticated user
my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer') {
  # not authorized
  exit 1;
}

my $BLB_CONF_ROOT = 'system open-app blb-association';

my ($status, $standalone, $user, $pass) = (undef, undef, undef, undef);
GetOptions(
  'status' => \$status,
  'standalone' => \$standalone,
  'user:s' => \$user,
  'pass:s' => \$pass
);

if (defined($status)) {
  do_status();
  exit 0;
}

if (defined($standalone)) {
  do_standalone();
  exit 0;
}

if (defined($user) && defined($pass)) {
  do_blb($user, $pass);
  exit 0;
} else {
  print "BLB association requires username and password\n";
  exit 1;
}

sub do_status {
  print "VERBATIM_OUTPUT\n";
  my $cfg = new Vyatta::Config;
  if ($cfg->existsOrig("$BLB_CONF_ROOT")) {
    my $u = $cfg->returnOrigValue("$BLB_CONF_ROOT username");
    print <<EOF;
<blbconf mode='association'>
  <username>$u</username>
</blbconf>
EOF
  } else {
    print <<EOF;
<blbconf mode='standalone'>
</blbconf>
EOF
  }
}

sub do_standalone {
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
  
sub do_blb {
  my ($user, $pass) = @_;
  
  # TODO do BLB association. check credential.
 
  # login succeeded. change installer password.
  my ($rfd, $wfd) = (undef, undef);
  my $pid = open2($rfd, $wfd, '/usr/bin/mkpasswd', '-m', 'md5', '-s');
  print $wfd "$pass";
  close($wfd);
  my $epass = <$rfd>;
  waitpid($pid, 0);
  chomp($epass);
  if (!($epass =~ /^\$1\$/)) {
    print "Failed to encrypt BLB password\n";
    exit 1;
  }
  system("sudo /usr/sbin/usermod -p '$epass' installer");
  if ($? >> 8) {
    print "Failed to change installer password to match BLB\n";
    exit 1;
  }

  # now reset "admin" account
  my $adm = new OpenApp::LdapUser('admin');
  my $err = $adm->deletePassword();
  if (defined($err)) {
    print "Failed to reset admin account: $err\n";
    exit 1;
  }
  
  # finally, save the configuration. 
  my @cmds = (
    "set $BLB_CONF_ROOT username '$user'",
    'commit',
    'save'
  );
  $err = OpenApp::Conf::execute_session(@cmds);
  if (defined($err)) {
    print "Failed to save BLB configuration: $err\n";
    exit 1;
  }
}

exit 1;

