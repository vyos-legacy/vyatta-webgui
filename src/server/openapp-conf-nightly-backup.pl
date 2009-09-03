#!/usr/bin/perl
#
# Module: openapp-conf-nightly-backup.pl
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
use OpenApp::LdapUser;
use Getopt::Long;
use Vyatta::Config;
use OpenApp::Conf;

# authenticated user
my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

my $update;

sub update
{
    #update crontab and restart
    if (defined $update) {
	#now validate the value
	my ($h,$m) = split(":",$update);
	if (($h =~ /^-?\d+$/) && ($m =~ /^-?\d+$/)) {
	    my $newentry = "$m $h * * * root /opt/vyatta/sbin/oa-nightly-backup >&/dev/null";

            ####main
	    my $conf_file = '/etc/crontab';
	    my $conf_lck_file = '/etc/crontab.lck';
	    
            #open file
	    open(FILE, "<$conf_file") or die "Can't open crontab file"; 
	    open(FILE_LCK, "+>$conf_lck_file") or die "Can't open crontab lock file";
	    
	    #read from conf and write to lock
	    my @f = <FILE>;
	    my $f;
	    my $ct = 0;
	    while (@f[$ct]) {
		if (@f[$ct] =~ /OA nightly backup/) {
		    print FILE_LCK @f[$ct];
		    print FILE_LCK $newentry;
		    print FILE_LCK "\n";
		    #skip the next entry...
		    $ct++;
		}
		else {
		    print FILE_LCK @f[$ct];
		}
		$ct++;
	    }

	    close FILE;
	    close FILE_LCK;
	    
	    `cp $conf_lck_file $conf_file`;
	    'rm $conf_lck_file';
	}
	`sudo /etc/init.d/cron restart`;
    }
}


##########################################################################
#
# start of main
#
##########################################################################
sub usage() {
    print "Usage: $0 --update=<backup>\n";
    exit 0;
}

#pull commands and call command
GetOptions(
    "update:s"              => \$update,
    ) or usage();

if ( defined $update ) {
    update();
}
exit 0;
