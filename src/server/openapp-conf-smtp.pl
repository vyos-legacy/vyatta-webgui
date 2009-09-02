#!/usr/bin/perl
#
# Module: openapp-conf-smtp.pl
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

my ($server,$email,$username,$pswd,$name,$list);

my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

sub set_smtp {
    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app smtp client address $server");
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app smtp client email $email");
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    if (defined $username && $username ne '') {
	$err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app smtp client username $username");
    }
    else {
	$err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete system open-app smtp client username");
    }
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }
    
    # apply config command
    if (defined $pswd && $pswd ne '') {
	$err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app smtp client password $pswd");
    }
    else {
	$err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete system open-app smtp client password");
    }
    if ($err != 0) {
	`logger -p debug 'dom0: system command error: $err'`;
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app smtp client name $name");
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

##########################################################################
#
# list_smtp
#
##########################################################################
sub list_smtp() {
    my $cmdline = $ENV{OA_CMD_LINE};
    if (!defined $cmdline) {
	print "VERBATIM_OUTPUT\n";
    }
    my @out = `/opt/vyatta/sbin/vyatta-output-config.pl system open-app smtp client`;
    
#output will look something like this:
# address 1.1.1.1
# name foo
# password bar
# server 2.3.4.2
# username harry
    my $out;
    my $address = "";
    my $email = "";
    my $name = "";
    my $password = "";
    my $username = "";

    my $ct = 0;
    $out = join(" ",@out);
    @out = split(" ",$out);
    for $out (@out) {
	$ct++;
	if ($out eq 'address') {
	    $address = $out[$ct];
	}
	elsif ($out eq 'name') {
	    $name = $out[$ct];
	}
	elsif ($out eq 'password') {
	    $password = $out[$ct];
	}
	elsif ($out eq 'email') {
	    $email = $out[$ct];
	}
	elsif ($out eq 'username') {
	    $username = $out[$ct];
	}
    }

    if ($address eq '' || 
	$email eq '') {
	if (!defined $cmdline) {
	    print "<smtp-client><address></address><email></email><name></name><password></password><username></username></smtp-client>";
	}
    }
    else {
	if (!defined $cmdline) {
	    print "<smtp-client>";
	    print "<address>$address</address>";
	    print "<email>$email</email>";
	    print "<name>$name</name>";
	    print "<password>$password</password>";
	    print "<username>$username</username>";
	    print "</smtp-client>";
	}
	else {
	    print "SMTP:\n";
	    print "\taddress:\t$address\n";
	    print "\temail:\t\t$email\n";
	    print "\tname:\t\t$name\n";
	    print "\tpassword:\t$password\n";
	    print "\tusername:\t$username\n";
	}
    }
}

##########################################################################
#
# start of main
#
##########################################################################
sub usage() {
    print "       $0 --address=<address>\n";
    print "       $0 --email=<email>\n";
    print "       $0 --username=<username>\n";
    print "       $0 --password=<password>\n";
    print "       $0 --name=<name>\n";
    print "       $0 --list\n";
    exit 0;
}

#pull commands and call command
GetOptions(
    "server=s"                => \$server,
    "email=s"                 => \$email,
    "username:s"              => \$username,
    "pswd:s"                  => \$pswd,
    "name=s"                  => \$name,
    "list:s"                  => \$list,
    ) or usage();

if (defined $server && defined $email && defined $name) {
    set_smtp();
}
else {
    list_smtp();
}
exit 0;
