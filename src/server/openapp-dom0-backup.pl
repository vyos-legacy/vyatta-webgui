#!/usr/bin/perl

use strict;
use Getopt::Long;
use File::Temp qw(mkdtemp);
use File::Path qw(rmtree);
use lib '/opt/vyatta/share/perl5';
use OpenApp::LdapUser;

my $OA_CFG_DIR = '/opt/vyatta/etc/config';
my $OA_CFG_FILE = 'config.boot';
my $OA_CFG_PATH = "$OA_CFG_DIR/$OA_CFG_FILE";
my $OA_LDAP_DUMP_FILE = 'ldap.ldif';

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
    print "Must specify filename for backup\n";
    exit 1;
  }
  do_backup($backup, $filename);
  exit 0;
}

if (defined($restore)) {
  if (!defined($filename)) {
    print "Must specify filename for restore\n";
    exit 1;
  }
  do_restore($restore, $filename);
  exit 0;
}

exit 1;

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
      print "Cannot create temp dir\n";
      exit 1;
    }
    my $err = undef;
    while (1) {
      # preserve ownership and mode
      system("cp -p '$OA_CFG_PATH' '$tdir/files/$OA_CFG_FILE'");
      if ($? >> 8) {
        $err = 'Cannot backup OA config file';
        last;
      }
      my $bfiles = "$OA_CFG_FILE";
      system("tar -cf \"$file\" -C \"$tdir/files\" $bfiles");
      if ($? >> 8) {
        $err = 'Cannot create OA backup';
        last;
      }
      last;
    }
    rmtree($tdir);
    if (defined($err)) {
      print "$err\n";
      exit 1;
    }
  }
}

sub do_restore {
  my ($what, $file) = @_;
  if (!($what =~ m/config=true/)) {
    # nothing to restore
    return;
  }
}

