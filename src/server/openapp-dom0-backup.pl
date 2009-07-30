#!/usr/bin/perl

use strict;
use Getopt::Long;
use File::Temp qw(mkdtemp);
use File::Path qw(rmtree);
use lib '/opt/vyatta/share/perl5';
use OpenApp::LdapUser;
use OpenApp::Conf;

my $OA_CFG_DIR = '/opt/vyatta/etc/config';
my $OA_CFG_FILE = 'config.boot';
my $OA_CFG_PATH = "$OA_CFG_DIR/$OA_CFG_FILE";
my $OA_LDAP_DUMP_FILE = 'ldap.ldif';

my $SLAPD_INIT = '/etc/init.d/slapd';
my $LDAP_DB_DIR = '/var/lib/ldap';
my $LDAP_DB_OWNER = 'openldap';
my $LDAP_DB_SUFFIX = 'dc=localhost,dc=localdomain';
my $LDAP_GROUP = 'openldap';

# authenticated user
my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

# --backup <config_data_all>
# --restore <config_data_all>
# --filename <filename>
my ($backup, $restore, $filename) = (undef, undef, undef);
GetOptions(
  'backup=s' => \$backup,
  'restore=s' => \$restore,
  'filename=s' => \$filename
);

if (defined($backup)) {
  if (!defined($filename)) {
      `logger -p debug 'dom0: Must specify filename for backup'`;
      print "Must specify filename for backup\n";
      exit 1;
  }
  do_backup($backup, $filename);
  exit 0;
}

if (defined($restore)) {
  if (!defined($filename)) {
      `logger -p debug 'dom0: Must specify filename for restore'`;
      print "Must specify filename for restore\n";
      exit 1;
  }
  do_restore($restore, $filename);
  exit 0;
}

exit 1;

# copy a file while preserving ownership and mode
sub cp_p {
  my ($src, $dst) = @_;
  system("cp -p '$src' '$dst'");
  return (($? >> 8) ? 0 : 1);
}

sub in_chroot {
  return (! -r '/proc/version');
}

sub stop_ldap {
  return 1 if in_chroot();

  system("$SLAPD_INIT stop >&/dev/null");
  return (($? >> 8) ? 0 : 1);
}

sub start_ldap {
  return 1 if in_chroot();

  system("$SLAPD_INIT start >&/dev/null");
  return (($? >> 8) ? 0 : 1);
}

sub save_ldap {
  my ($file) = @_;
  system("slapcat -b '$LDAP_DB_SUFFIX' >'$file'");
  return (($? >> 8) ? 0 : 1);
}

sub load_ldap {
  my ($file) = @_;
  return 0 if (! -d "$LDAP_DB_DIR");
  system("rm -rf $LDAP_DB_DIR/* "
         . "&& sudo -u $LDAP_DB_OWNER "
         . "slapadd -b '$LDAP_DB_SUFFIX' -l \"$file\"");
  return (($? >> 8) ? 0 : 1);
}

sub do_backup {
  my ($what, $file) = @_;
  my $fd;
  if (!open($fd, '>', "$file")) {
    print "Cannot create $file\n";
    exit 1;
  }
  close($fd);
  if ($what =~ m/config=true/) {
    # backup config files
    my $tdir = mkdtemp('/tmp/dom0-backup.XXXXXX');
    if (! -d "$tdir" || !mkdir("$tdir/files")) {
      `logger -p alert 'dom0: Cannot create temp dir'`;
      print "Cannot create temp dir\n";
      exit 1;
    }
    my $err = undef;
    while (1) {
      if (!cp_p("$OA_CFG_PATH", "$tdir/files/$OA_CFG_FILE")) {
        $err = 'Cannot backup OA config file';
        last;
      }
      if (!cp_p('/etc/passwd', "$tdir/files/passwd")
          || !cp_p('/etc/shadow', "$tdir/files/shadow")) {
        $err = 'Cannot backup OA local accounts';
        last;
      }
      if (!stop_ldap()) {
        $err = 'Failed to stop OA LDAP database';
        last;
      }
      if (!save_ldap("$tdir/files/$OA_LDAP_DUMP_FILE")) {
        $err = 'Cannot backup OA LDAP database';
        last;
      }
      if (!start_ldap()) {
        $err = 'Failed to start OA LDAP database';
        last;
      }
      system("tar -cf \"$file\" -C \"$tdir\" files/");
      if ($? >> 8) {
        $err = 'Cannot create OA backup';
        last;
      }
      last;
    }
    rmtree($tdir);
    if (defined($err)) {
      `logger -p alert 'dom0: $err'`;
      print "$err\n";
      exit 1;
    }
  }
}

sub do_restore {
  my ($what, $file) = @_;
  if (! -r "$file") {
      `logger -p alert 'dom0: Cannot find $file'`;
      print "Cannot find $file\n";
      exit 1;
  }
  if (!($what =~ m/config=true/)) {
    # nothing to restore
    return;
  }
  my $tdir = mkdtemp('/tmp/dom0-restore.XXXXXX');
  if (! -d "$tdir" || !mkdir("$tdir/files")) {
      `logger -p alert 'dom0: Cannot create temp dir'`;
      print "Cannot create temp dir\n";
      exit 1;
  }
  my $ol_gid = getgrnam($LDAP_GROUP);
  chown -1, $ol_gid, $tdir;
  chmod 0750, $tdir;
  my $err = undef;
  while (1) {
    system("tar -xf \"$file\" -C \"$tdir/\"");
    if ($? >> 8) {
      $err = 'Cannot extract OA backup';
      last;
    }
    if (! -r "$tdir/files/$OA_CFG_FILE"
        || ! -r "$tdir/files/$OA_LDAP_DUMP_FILE"
        || ! -r "$tdir/files/passwd" || ! -r "$tdir/files/shadow") {
      $err = 'Incomplete OA backup';
      last;
    }
    if (!cp_p("$tdir/files/$OA_CFG_FILE", "$OA_CFG_PATH")) {
      $err = "Cannot copy OA config file";
      last;
    }
    if (!cp_p("$tdir/files/passwd", '/etc/passwd')
        || !cp_p("$tdir/files/shadow", '/etc/shadow')) {
      $err = 'Cannot restore OA local accounts';
      last;
    }
    my @cmds = ( 'load' );
    last if (defined(($err = OpenApp::Conf::execute_session(@cmds))));
    if (!stop_ldap()) {
      $err = 'Failed to stop OA LDAP database';
      last;
    }
    if (!load_ldap("$tdir/files/$OA_LDAP_DUMP_FILE")) {
      $err = 'Cannot restore OA LDAP database';
      last;
    }
    if (!start_ldap()) {
      $err = 'Failed to start OA LDAP database';
      last;
    }
    last;
  }
  rmtree($tdir);
  if (defined($err)) {
      `logger -p alert 'dom0: $err'`;
      print "$err\n";
      exit 1;
  }
}

