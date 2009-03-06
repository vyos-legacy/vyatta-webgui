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

my ($delete,$add,$password,$lastname,$firstname,$email,$role,$rights);

sub add_user {
    #write temp file.
    my $conf_file = "/tmp/user-".$$;

    print "$conf_file\n";

    open(FILE, ">$conf_file") or die "Can't open temp user file"; 

    print FILE "dn: cn=".$add.",dc=nodomain\n";
    print FILE "changetype: modify\n";
    print FILE "add: userPassword\n";
    print FILE "userPassword: ".$password."\n";
    #todo: email,role,rights,lastname,firstname
    close FILE;

    system('ldapadd -x -D \"cn=admin,dc=nodomain\" -W -f $conf_file');
    #clean up temp file here.
    unlink($conf_file);
}

sub del_user {
    system('ldapdelete -x -D \"cn=admin,dc=nodomain\" \"cn=$delete,dc=nodomain');
}

sub list_user {
    #if $list is empty then list all
#
    system('ldapsearch -x -b \"dc=nodomain\" \"cn=$list,dc=nodomain');

#   now construct and print out xml response
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
           "list=s"          => \$list,
           "lastname=s"      => \$lastname,
           "firstname=s"     => \$firstname,
           "email=s"         => \$email,
           "role=s"          => \$role,
           "rights=s"        => \$rights,
           "delete=s"        => \$delete,

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
