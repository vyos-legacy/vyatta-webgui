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

my ($list,$delete,$add,$password,$lastname,$firstname,$email,$role,$rights);

sub add_user {
    #write temp file.
    my $conf_file = "/tmp/user-".$$;

    print "$conf_file\n";

    open(FILE, ">$conf_file") or die "Can't open temp user file"; 

    print FILE "dn: uid=".$add.",ou=People,dc=nodomain\n";
    print FILE "changetype: modify\n";
    print FILE "replace: userPassword\n";
    print FILE "userPassword: ".$password."\n";
    print FILE "\n";
    print FILE "replace: gecos\n";
    print FILE "gecos: ".$lastname.",".$firstname.",".$email."\n";
    #todo: email,role,rights,lastname,firstname
    close FILE;

    #first add the user
    system("ldapadduser $add vyattacfg");

    #now modify the account
    system("ldapmodify -x -D \"cn=admin,dc=nodomain\" -w admin -f $conf_file");
    #clean up temp file here.
    unlink($conf_file);
}

sub del_user {
    system("ldapdelete -x -D \"cn=admin,dc=nodomain\" -w admin \"cn=$delete,dc=nodomain\"");
}

sub list_user {
    #if $list is empty then list all
#
    my @output;
    my $output;
    if ($list eq '') {
	@output = `ldapsearch -x -b "dc=nodomain" "uid=*"`;
    }
    else {
	@output = `ldapsearch -x -b "dc=nodomain" "uid=$list"`;
    }
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
    for $output (@output) {
	print $output;
	my @o = split(' ',$output);
	if ($o[0] eq "cn:") {
	    print "<user name='$o[1]'>";
	    #parse gecos field
	    if ($o[0] eq 'gecos:') {
		print "<email>$o[1]</email>";
		print "<name>";
		print "<first>$o[1]</first>";
		print "<last>$o[1]</last>";
		print "</name>";
	    }
	    print "<rights></rights>";
	    print "<role></role>";
	    print "</user>";
	}
    }
    


}

####main

sub usage() {
    print "Usage: $0 --delete=<username>\n";
    print "       $0 --add=<username>\n";
    print "       $0 --list=<username>\n";
    print "       $0 --password=<password>\n";
    print "       $0 --lastname=<lastname>\n";
    print "       $0 --firstname=<firstname>\n";
    print "       $0 --email=<email>\n";
    print "       $0 --role=<role>\n";
    print "       $0 --rights=<right>\n";
    exit 1;
}

my @delete_user = ();

#pull commands and call command
GetOptions(
           "add=s"           => \$add,
           "password=s"      => \$password,
           "lastname=s"      => \$lastname,
           "firstname=s"     => \$firstname,
           "email=s"         => \$email,
           "role=s"          => \$role,
           "rights=s"        => \$rights,
           "delete=s"        => \$delete,
           "list=s"          => \$list,

    ) or usage();


if ( defined $delete ) {
    del_user();
    exit 0;
}
if ( defined $add ) {
    add_user();
    exit 0;
}
if ( defined $list ) {
    list_user();
    exit 0;
}
