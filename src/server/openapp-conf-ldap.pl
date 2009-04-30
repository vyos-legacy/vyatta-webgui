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

use lib "/opt/vyatta/share/perl5";
#use warnings;
use strict;
use POSIX;
use File::Copy;
use Getopt::Long;
use OpenApp::VMMgmt;
use OpenApp::LdapUser;

my $slap_file = "/etc/ldap/openapp.conf";

my ($address,$rpswd,$ruser,$rwpswd,$rwuser,$local_db,$list);

my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

sub set_ldap {
    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app ldap address $address");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app ldap r-password $rpswd");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app ldap r-username $ruser");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app ldap rw-password $rwpswd");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app ldap rw-username $rwuser");
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

    #this shouldn't be set w/o being active according to wireframe
    #NEED to pull this from the configuration tree and insert....
    my @out = `/opt/vyatta/sbin/vyatta-output-config.pl system open-app ldap address`;
    my @address = split(" ",$out[0]);
    `sudo echo -e "overlay transluscent\nuri ldap://$address[1]:389\n" > $slap_file`;
}


##########################################################################
#
# change ldap target (true or false) for local
#
##########################################################################
sub set_ldap_target() {
    if ($local_db ne 'true' && $local_db ne 'false') {
	exit 1;
    }

    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system open-app ldap local $local_db");
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

    #now create the file.
    if ($local_db eq 'true') {
	#should clear file that is included by slapd.conf
	`sudo echo '' > $slap_file`;
    }
    else {
	#should write into file that is include by slapd.conf
	#will write into file the following:
	my @out = `/opt/vyatta/sbin/vyatta-output-config.pl system open-app ldap address`;
    	my @address = split(" ",$out[0]);
	`sudo echo -e "overlay transluscent\nuri ldap://$address[1]:389\n" > $slap_file`;

#haven't figured out password access yet....

    }
}

##########################################################################
#
# return ldap configuration values
#
##########################################################################
sub list_ldap() {
    print "VERBATIM_OUTPUT\n";
    my @out = `/opt/vyatta/sbin/vyatta-output-config.pl system open-app ldap`;
    
    my @address = split(" ",$out[0]);
    my @local_db = split(" ",$out[1]);
    my @r_password = split(" ",$out[2]);
    my @r_username = split(" ",$out[3]);
    my @rw_password = split(" ",$out[4]);
    my @rw_username = split(" ",$out[5]);

    my $o;
    print "<ldap>";
    for $o (@out) {
	my @vals = split(" ",$o);
	if ($vals[0] eq "address") {
	    print "<address>$vals[1]</address>";
	}
	elsif ($vals[0] eq "local") {
	    print "<local>$vals[1]</local>";
	}
	elsif ($vals[0] eq "r-password") {
	    print "<r-password>$vals[1]</r-password>";
	}
	elsif ($vals[0] eq "r-username") {
	    print "<r-username>$vals[1]</r-username>";
	}
	elsif ($vals[0] eq "rw-password") {
	    print "<rw-password>$vals[1]</rw-password>";
	}
	elsif ($vals[0] eq "rw-username") {
	    print "<rw-username>$vals[1]</rw-username>";
	}
    }
    print "</ldap>";
}

##########################################################################
#
# start of main
#
##########################################################################
sub usage() {
    print "       $0 --address=<address>\n";
    print "       $0 --rpswd=<read-pswd>\n";
    print "       $0 --ruser=<read-user>\n";
    print "       $0 --rwpswd=<readwrite-pswd>\n";
    print "       $0 --rwuser=<readwrite-user>\n";
    print "       $0 --list\n";
    exit 0;
}

#pull commands and call command
GetOptions(
    "address=s"               => \$address,
    "rpswd=s"                => \$rpswd,
    "ruser=s"                => \$ruser,
    "rwpswd=s"               => \$rwpswd,
    "rwuser=s"               => \$rwuser,
    "local=s"                 => \$local_db,
    "list:s"                  => \$list,
    ) or usage();

if (defined $address && defined $rpswd && defined $ruser && defined $rwpswd && defined $rwuser ) {
    set_ldap();
}
elsif (defined $local_db) {
    set_ldap_target();
}
else {
    list_ldap();
}
exit 0;
