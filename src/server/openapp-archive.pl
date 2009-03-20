#!/usr/bin/perl
#
# Module: openapp-archive.pl
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

use lib "/opt/vyatta/share/perl5";
use warnings;
use strict;
use POSIX;
use File::Copy;
use Getopt::Long;
use OpenApp::VMMgmt;

my ($backup,$restore,$list,$delete);

#
# Run through the list of VM's and
# sequentially perform backup
#
sub backup_archive {
    #get list of VMs from argument list 
    #the format is: vmkey:type,vmkey:type...

    my $VMs = ();
    my @VMs = OpenApp::VMMgmt::getVMList();

    my $archive;
    my @archive = split(',',$backup);
    print "A\n";

    for $archive (@archive) {
	#have a vm:type pair right now
	my @bu = split(':',$archive);
	print "B: $bu[0]\n";

	
	#now look up vm
	my $vm = new OpenApp::VMMgmt($bu[0]);
#	$vm->do_list();
	my $ip = '';
	$ip = $vm->getIP();
	if (defined $ip && $ip ne '') {
	    print "c: $ip\n";

	    my $cmd = "http://$ip/notifications/backup/$bu[1]";
	    my $rc = `curl -q -I $cmd 2>&1`;
	}
    }

    #now that each are started, let's sequentially iterate through and retrieve
    for $archive (@archive) {
	#have a vm:type pair right now
	my @bu = split(':',$archive);
	
	#now look up vm
	#my $ip = getVMIP($bu[0]);
	#my $cmd = "GET /url/backup-file
	#post command
	
	#now save to temporary location while processing....


	#encrypt each file, key is dom0 mac addr

	#see rest of brick backup operations.
	
    }

}

sub restore_archive {


}


####main
sub usage() {
    print "Usage: $0 --backup=<backup>\n";
    print "       $0 --restore=<restore>\n";
    print "       $0 --vm=<vm>\n";
    exit 1;
}


#pull commands and call command
GetOptions(
           "backup:s"       => \$backup,
           "restore=s"      => \$restore,
           "list=s"         => \$list,
           "delete=s"       => \$delete,
    ) or usage();


if ( defined $backup ) {
    backup_archive();
    exit 0;
}
if ( defined $restore ) {
    restore_archive();
    exit 0;
}
exit 0;
