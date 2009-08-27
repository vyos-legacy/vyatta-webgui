#!/usr/bin/perl
#
# Module: openapp-conf-ntp.pl
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

use lib "/opt/vyatta/share/perl5";
#use warnings;
use strict;
use POSIX;
use File::Copy;
use Getopt::Long;
use OpenApp::VMMgmt;
use OpenApp::LdapUser;

my ($set,$delete,$list);

my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

sub set_password_policy {
    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app password-policy $set true");
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # commit
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit"); 
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
   
    #save configuration
    system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save"); 
}


sub delete_password_policy {
    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete system open-app password-policy $delete");
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # commit
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit"); 
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
   
    #save configuration
    system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save"); 
}

sub list_password_policy {
    my $cmdline = $ENV{OA_CMD_LINE};

    my $admin = "false";
    my $user = "false";
    if (-e "/opt/vyatta/config/active/system/open-app/password-policy/user/node.val") {
	$user = "true";
    }
    if (-e "/opt/vyatta/config/active/system/open-app/password-policy/admin/node.val") {
	$admin = "true";
    }

    if (!defined $cmdline) {
	print "VERBATIM_OUTPUT\n";
	print "<password-policy>";
	print "<user>$user</user>";
	#don't let the admin see the installer settings.
	if ($auth_user_role eq 'installer') {
	    print "<admin>$admin</admin>";
	}
	print "</password-policy>";
    }
    else {
	print "password policy for admin:\t$admin\n";
	print "password policy for user:\t$user\n";
    }
}

##########################################################################
#
# start of main
#
##########################################################################
sub usage() {
    print "       $0 --set=<role>\n";
    print "       $0 --delete=<role>\n";
    print "       $0 --list\n";
    exit 0;
}

#pull commands and call command
GetOptions(
    "set=s"                 => \$set,
    "delete=s"              => \$delete,
    "list"                  => \$list,
    ) or usage();


if (defined $set ) {
    set_password_policy();
    exit 0;
}
elsif (defined $delete ) {
    delete_password_policy();
    exit 0;
}
else {
    list_password_policy();
    exit 0;
}
exit 0;
