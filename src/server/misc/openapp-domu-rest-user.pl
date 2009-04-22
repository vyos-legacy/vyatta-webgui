#!/usr/bin/perl
#
# Module: openapp-user.pl
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
# Description: Script to modify user accounts
# 
# **** End License ****
#

use lib "/opt/vyatta/share/perl5/";

use warnings;
use strict;
use POSIX;
use File::Copy;
use Getopt::Long;
use OpenApp::VMMgmt;

my ($list,$delete,$modify,$add,$password,$oldpassword,$lastname,$firstname,$email,$role,$rights);


sub list_user {
    #if $list is empty then list all
#
    my @output;
    my $output;
    @output = `ldapsearch -x -b "dc=localhost,dc=localdomain" "uid=*"`;

#   now construct and print out xml response
# foo, People, nodomain
#dn: uid=foo,ou=People,dc=nodomain
#objectClass: account
#objectClass: posixAccount
#cn: foo
#uid: foo
#uidNumber: 1001
#gidNumber: 1001
#homeDirectory: /home/foo
#loginShell: /bin/bash
#gecos: foo
#description: User account

#how to parse the stdout

# cn: foo

    #iterate by line
    my $open_entry = 0;
    my $hash_arr = {};
    print "VERBATIM_OUTPUT\n";
    print "<active>";
    for $output (@output) {
#	print $output;
	my @o = split(' ',$output);
	if (defined $o[0] && defined $o[1]) {
	    if ($o[0] eq "uid:") {
		$open_entry = 1;
		$hash_arr->{'name'} = $o[1];
	    }
	    if ($o[0] eq 'memberUid:') {
		#if $o[1] == this utm then print out user
		if ($o[1] eq $list) {
		    print "<user name='$hash_arr->{'name'}'></user>";
		}
		$hash_arr->{'rights'} .= "<rights>$o[1]</rights>";
		#let's clear the entry now
		$hash_arr->{'name'} = "";
	    }
	}
    }
    print "</active>";
}

####main

sub usage() {
    print "       $0 --list=<utm-name>\n";
    exit 1;
}


#pull commands and call command
GetOptions(
    "list:s"          => \$list,
    ) or usage();

list_user();
exit 0;

