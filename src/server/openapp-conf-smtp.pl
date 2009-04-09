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

my ($address,$email,$username,$password,$list);

my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer') {
  # not authorized
  exit 1;
}

sub set_smtp {
    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app smtp address $address");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app smtp email $email");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app smtp username $username");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app smtp password $password");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # commit
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit"); 
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
   
}

sub list_smtp() {
    print "VERBATIM_OUTPUT\n";
    my @out = `/opt/vyatta/sbin/vyatta-output-config.pl system open-app smtp client`;
    
#output will look something like this:
# address 1.1.1.1
# name foo
# password bar
# server 2.3.4.2
# username harry
    my @address = split(" ",$out[0]);
    my @name = split(" ",$out[1]);
    my @password = split(" ",$out[2]);
    my @server = split(" ",$out[3]);
    my @username = split(" ",$out[4]);

    print "<smtp-client>";
    print "<address>$address[1]</address>";
    print "<name>$name[1]</name>";
    print "<password>$password[1]</password>";
    print "<server>$server[1]</server>";
    print "<username>$username[1]</username>";
    print "</smpt-client>";
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
    print "       $0 --list\n";
    exit 0;
}

#pull commands and call command
GetOptions(
    "address=s"               => \$address,
    "email=s"                 => \$email,
    "username=s"              => \$username,
    "password=s"              => \$password,
    "list:s"                  => \$list,
    ) or usage();

if (defined $address && defined $email && defined $username && defined $password ) {
    set_smtp();
}
else {
    list_smtp();
}
exit 0;
