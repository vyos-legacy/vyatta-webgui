#!/usr/bin/perl
#
# Module: openapp-conf-ldap.pl
# 
# **** License ****
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 2 as
# published by the Free Software Foundation.
# 
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
# 
# This code was originally developed by Vyatta, Inc.
# Portions created by Vyatta are Copyright (C) 2007 Vyatta, Inc.
# All Rights Reserved.
# 
# Author: Michael Larson
# Date: March 2009
# Description: Script to archive backup and restore
# 
# **** End License ****
#

use strict;
use lib '/opt/vyatta/share/perl5';
use File::Temp qw(mkstemp);
use Getopt::Long;
use Vyatta::Config;
use OpenApp::LdapUser;
use OpenApp::Conf;

# authenticated user
my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

my ($confext, $confint, $external, $internal, $status)
  = (undef, undef, undef, undef, undef);
GetOptions(
  'conf-external=s' => \$confext,
  'conf-internal' => \$confint,
  'external=s' => \$external,
  'internal' => \$internal,
  'status' => \$status
);

my $cli_mode = 0;
if ("$ENV{OA_CMD_LINE}" eq 'yes') {
  $cli_mode = 1;
}
my $LDAP_CONF_ROOT = 'system open-app ldap';
my $SLAPD_INIT = '/etc/init.d/slapd';
my $SLAPD_CONF_DIR = '/etc/ldap';
my $SLAPD_OA_CONF = "$SLAPD_CONF_DIR/openapp.conf";
my $SLAPD_OA_INTERNAL_CONF = "$SLAPD_CONF_DIR/openapp-internal.conf";

my $PAM_SECRET_FILE = '/etc/pam_ldap.secret';
my $NSS_SECRET_FILE = '/etc/libnss-ldap.secret';

if (defined($status)) {
  do_status();
  exit 0;
}
if (defined($confint)) {
  do_conf_internal();
  exit 0;
}
if (defined($internal)) {
  do_internal();
  exit 0;
}
if (defined($confext)) {
  # check if the parameter file exists
  exit 1 if (! -r "$confext");
  do_conf_external($confext);
  exit 0;
}
if (defined($external)) {
  # check if the parameter file exists
  exit 1 if (! -r "$external");
  do_external($external);
  exit 0;
}

exit 1;

sub restart_ldap {
  system("sudo sh -c '$SLAPD_INIT stop && $SLAPD_INIT start' >&/dev/null");
  return (($? >> 8) ? 0 : 1);
}

sub do_status {
  my $cfg = new Vyatta::Config;
  if (!$cfg->existsOrig("$LDAP_CONF_ROOT")) {
    # internal LDAP is used
    if ($cli_mode) {
      print "Internal OA LDAP server is used\n";
    } else {
      print <<EOF;
VERBATIM_OUTPUT
<ldap><local>true</local></ldap>
EOF
    }
    exit 0;
  }
  # external LDAP is used
  my $addr = $cfg->returnOrigValue("$LDAP_CONF_ROOT address");
  my $sfx = $cfg->returnOrigValue("$LDAP_CONF_ROOT suffix");
  my $rwuser = $cfg->returnOrigValue("$LDAP_CONF_ROOT rw-username");
  my $rwpass = $cfg->returnOrigValue("$LDAP_CONF_ROOT rw-password");
  my $ruser = $cfg->returnOrigValue("$LDAP_CONF_ROOT r-username");
  my $rpass = $cfg->returnOrigValue("$LDAP_CONF_ROOT r-password");
  if ($cli_mode) {
    print <<EOF;
External LDAP server is configured (passwords are not displayed):
  Address:         $addr
  Suffix:          $sfx
  Read/write user: $rwuser
  Readonly user:   $ruser
EOF
  } else {
    print <<EOF;
VERBATIM_OUTPUT
<ldap>
  <local>false</local>
  <address>$addr</address>
  <suffix>$sfx</suffix>
  <rw-username>$rwuser</rw-username>
  <rw-password>$rwpass</rw-password>
  <r-username>$ruser</r-username>
  <r-password>$rpass</r-password>
</ldap>
EOF
  }
  exit 0;
}

sub do_conf_internal {
  my $cfg = new Vyatta::Config;
  if (!$cfg->existsOrig("$LDAP_CONF_ROOT")) {
      `logger -p debug 'dom0: Already configured to use Internal LDAP server'`;
      print "Already configured to use Internal LDAP server\n";
      exit 1;
  }
  my @cmds = ("delete $LDAP_CONF_ROOT", 'commit', 'save');
  my $err = OpenApp::Conf::execute_session(@cmds);
  if (defined($err)) {
      `logger -p debug 'dom0: LDAP configuration failed: $err'`;
      print "LDAP configuration failed: $err\n";
      exit 1;
  }
  exit 0;
}

sub update_secret {
  my ($secret) = @_;

  # currently the CLI does not allow "'" in values anyway
  return "Secret cannot include single-quote (') character"
    if ($secret =~ /'/);

  system("sudo sh -c \"echo -n '$secret' >$PAM_SECRET_FILE\"");
  return "Failed to update PAM secret" if ($? >> 8);
  system("sudo sh -c \"echo -n '$secret' >$NSS_SECRET_FILE\"");
  return "Failed to update NSS secret" if ($? >> 8);

  return undef;
}

sub do_internal {
  # restore openapp.conf from openapp-internal.conf
  system("sudo cp $SLAPD_OA_INTERNAL_CONF $SLAPD_OA_CONF");
  if ($? >> 8) {
      `logger -p debug 'dom0: Failed to update LDAP configuration file'`;
      print "Failed to update LDAP configuration file\n";
      exit 1;
  }
  
  # restart slapd
  if (!restart_ldap()) {
      `logger -p error 'dom0: Failed to restart LDAP server'`;
      print "Failed to restart LDAP server\n";
      exit 1;
  }

  # restore PAM and NSS secrets
  my $err = update_secret('admin');
  if (defined($err)) {
      `logger -p debug 'dom0: restore PAM and NSS secrets error: $err'`;
      print "$err\n";
      exit 1;
  }
  exit 0;
}

sub do_conf_external {
  my ($param_file) = @_;
  my $fd = undef;

  # read params from file
  if (!open($fd, '<', $param_file)) {
      `logger -p alert 'dom0: Failed to open param file'`;
      print "Failed to open param file\n";
      exit 1;
  }
  my $addr = <$fd>;
  my $sfx = <$fd>;
  my $rwuser = <$fd>;
  my $rwpass = <$fd>;
  my $ruser = <$fd>;
  my $rpass = <$fd>;
  close($fd);
  chomp($addr);
  chomp($sfx);
  chomp($rwuser);
  chomp($rwpass);
  chomp($ruser);
  chomp($rpass);

  # change/save the configuration
  my @cmds = (
    "set $LDAP_CONF_ROOT address '$addr'",
    "set $LDAP_CONF_ROOT suffix '$sfx'",
    "set $LDAP_CONF_ROOT rw-username '$rwuser'",
    "set $LDAP_CONF_ROOT rw-password '$rwpass'",
    "set $LDAP_CONF_ROOT r-username '$ruser'",
    "set $LDAP_CONF_ROOT r-password '$rpass'",
    'commit',
    'save'
  );
  my $err = OpenApp::Conf::execute_session(@cmds);
  if (defined($err)) {
      `logger -p alert 'dom0: Failed to configure external LDAP server: $err'`;
      print "Failed to configure external LDAP server: $err\n";
      exit 1;
  }
  exit 0;
}

sub do_external {
  my ($param_file) = @_;
  my $fd = undef;

  # read params from file
  if (!open($fd, '<', $param_file)) {
      `logger -p alert 'dom0: Failed to open param file'`;
      print "Failed to open param file\n";
      exit 1;
  }
  my $addr = <$fd>;
  my $sfx = <$fd>;
  my $rwuser = <$fd>;
  my $rwpass = <$fd>;
  my $ruser = <$fd>;
  my $rpass = <$fd>;
  close($fd);
  chomp($addr);
  chomp($sfx);
  chomp($rwuser);
  chomp($rwpass);
  chomp($ruser);
  chomp($rpass);

  # generate new openapp.conf based on external LDAP server params
  my ($fh, $fname) = mkstemp('/tmp/ldap-conf.XXXXXX');
  chmod(0600, $fname);
  if (! -f "$fname") {
      `logger -p alert 'dom0: Failed to create LDAP configuration file'`;
      print "Failed to create LDAP configuration file\n";
      exit 1;
  }
  print $fh <<EOF;
# main database (external)
database        meta
suffix          "dc=localhost,dc=localdomain"
uri             "ldap://$addr/dc=localhost,dc=localdomain"
suffixmassage   "dc=localhost,dc=localdomain" "$sfx"
idassert-bind   bindmethod=simple
                binddn="$ruser"
                credentials=$rpass
                mode=none
rewriteEngine on
rewriteContext bindDN
rewriteRule "^cn=admin,dc=localhost,dc=localdomain\$"
            "$rwuser" ":"
rewriteRule "^(.*),dc=localhost,dc=localdomain\$"
            "%1,$sfx" ":"
EOF
  close($fh);
  system("sudo cp $fname $SLAPD_OA_CONF");
  my $ret = ($? >> 8);
  unlink($fname);
  if ($ret) {
      `logger -p alert 'dom0: Failed to update LDAP configuration file'`;
      print "Failed to update LDAP configuration file\n";
      exit 1;
  }

  # restart slapd
  if (!restart_ldap()) {
      `logger -p error 'dom0: Failed to restart LDAP server'`;
      print "Failed to restart LDAP server\n";
      exit 1;
  }

  # update PAM and NSS secrets
  my $err = update_secret($rwpass);
  if (defined($err)) {
      `logger -p debug 'dom0: restore PAM and NSS secrets error: $err'`;
      print "$err\n";
      exit 1;
  }
  exit 0;
}

