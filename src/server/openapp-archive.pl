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

    #first let's process the list
    my %hash_arr;
    my $hash_arr;
    my $archive;
    my @archive = split(',',$backup);
    for $archive (@archive) {
	my @bu = split(':',$archive);
	$hash_arr->{$bu[0]} = $bu[1];
    }


    my $VMs = ();
    my @VMs = OpenApp::VMMgmt::getVMList();
    foreach my $vmkey (keys %hash_arr) {
	my $vm = new OpenApp::VMMgmt($vmkey);
	my $ip = '';
	$ip = $vm->getIP();
	if (defined $ip && $ip ne '') {
	    my $cmd = "http://$ip/notifications/backup/$hash_arr{$vmkey}";
	    my $rc = `curl -q -I $cmd 2>&1`;
	    #if error returned from curl, remove from list here and notify of error??
	    
	}
    }

#	$vm->do_list();

#what happens if a vm fails to backup???? how are we to identify this???

    #now that each are started, let's sequentially iterate through and retrieve
    foreach my $vmkey (keys %hash_arr) {
	my $vm = new OpenApp::VMMgmt($vmkey);
	my $ip = '';
	$ip = $vm->getIP();
	if (defined $ip && $ip ne '') {
	    my $cmd = "GET /url/backup-file";
	    #writes to specific location on disk
	    my $bufile = "/backup/$vmkey/$hash_arr{$vmkey}";
	    my $rc = `curl -q -I $cmd -O $bufile 2>&1`;

	    #now encrypt command--NEED MAC ADDR OF ETH0
	    my $mac = 'cat /opt/vyatta/config/active/interfaces/ethernet/eth0/hw-id/node.val';
	    #probably need to eat the cr here
	    $mac = chomp($mac);

	    my $resp = 'openssl enc -aes-256-cbc -salt $mac -in /backup/$vmkey/$hash_arr{$vmkey} -out /backup/$vmkey/$hash_arr{$vmkey}.enc';
	}
    }

    #now create metadata file

    #finally tar up the proceedings...
    my $date = 'foo';
    my $time = 'foo';
    my $datamodel = '1';
    'tar -cvs /backup/$date_$time_$datamodel.tar';

    #needs to clean out old files or files past limit at this point....

}

#
#
#
sub restore_archive {

    #Need to send rest messages, but how will the vm get the bu file?

    #NEED MORE CLARIFICATION HERE

}

#
# Generates xml listing...
#
# Generates the following xml
# <archive>
#   <name>name</name>
#   <file>file</file>
#   <date>date</date>
#   <contents>
#     <entry>
#       <vm>vm</vm>
#       <type>data|conf</type>
#     </entry>
#   </contents>
# </archive>
#
#

sub list_archive {
    #get a directory listing of /backup/.
    
    my $hash_arr = {};

    print "VERBATIM_OUTPUT\n";

    my $file;
    my @files = <"/backup/*.tar">;
    foreach $file (@files) {
	#on each listing read the metadata header
	print "<archive>";
	print "<file>$file</file>";
	#need to print date,contents and name
	print "</archive>"
    } 
    #done
}

#
# delete archive...
#
sub delete_archive {
    my $file = "/backup/$delete";
    unlink($file);
}


####main
sub usage() {
    print "Usage: $0 --backup=<backup>\n";
    print "       $0 --restore=<restore>\n";
    print "       $0 --list=<list>\n";
    print "       $0 --delete=<delete>\n";
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
elsif ( defined $restore ) {
    restore_archive();
    exit 0;
}
elsif (defined $list ) {
    list_archive();
}
elsif (defined $delete ) {
    delete_archive();
}
exit 0;
