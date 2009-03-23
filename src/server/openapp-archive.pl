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

my ($backup,$filename,$restore,$list,$delete);

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

    foreach my $vmkey (keys %hash_arr) {
	my $vm = new OpenApp::VMMgmt($vmkey);
	next if (!defined($vm));
	my $ip = '';
	$ip = $vm->getIP();
	if (defined $ip && $ip ne '') {
	    my $cmd = "http://$ip/notifications/archive/backup/$hash_arr{$vmkey}";
	    my $rc = `curl -X POST -q -I $cmd 2>&1`;
	    #if error returned from curl, remove from list here and notify of error??
	    
	}
    }

#	$vm->do_list();

#what happens if a vm fails to backup???? how are we to identify this???

    #now that each are started, let's sequentially iterate through and retrieve
    foreach my $vmkey (keys %hash_arr) {
	my $vm = new OpenApp::VMMgmt($vmkey);
	next if (!defined($vm));
	my $ip = '';
	$ip = $vm->getIP();
	if (defined $ip && $ip ne '') {
	    my $cmd = "/url/backup-file";
	    #writes to specific location on disk
	    my $bufile = "/backup/$vmkey/$hash_arr{$vmkey}";
	    my $rc = `curl -X POST -q -I $cmd -O $bufile 2>&1`;

	    #now encrypt command--NEED MAC ADDR OF ETH0
	    my $mac = 'cat /opt/vyatta/config/active/interfaces/ethernet/eth0/hw-id/node.val';
	    #probably need to eat the cr here
	    $mac = chomp($mac);

	    my $resp = 'openssl enc -aes-256-cbc -salt $mac -in /backup/$vmkey/$hash_arr{$vmkey} -out /backup/$vmkey/$hash_arr{$vmkey}.enc';
	}
    }

    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst);
    ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime(time);

    my $am_pm='AM';
    $hour >= 12 and $am_pm='PM'; # hours 12-23 are afternoon
    $hour > 12 and $hour=$hour-12; # 13-23 ==> 1-11 (PM)
    $hour == 0 and $hour=12; # convert day's first hour

    my $date = sprintf("%02d%02d%02d",$mday,$mon+1,$year-100);
    my $time = sprintf("%02dh%02d%s",$hour,$min,$am_pm);

    my $datamodel = '1';
#
#    my $filename = $date."_".$time."_".$datamodel;
#
    if (!defined($filename) || $filename eq '') {
	$filename = "/tmp/backup/".$date."_".$time."_".$datamodel;
    }

    #now create metadata file
    my $FILE;

    open FILE, ">", "$filename.txt" or die $!;
    #we'll write out xml descriptions--the same as what we display...
    print FILE "<archive>";
    print FILE "<name>name</name>";
    print FILE "<file>$filename</file>";                                                                             
    print FILE "<date>$date $time</date>";
    print FILE "<contents>";
    foreach my $vmkey (keys %hash_arr) {
	my $vm = new OpenApp::VMMgmt($vmkey);
	next if (!defined($vm));
	print FILE "<entry>";
	print FILE "<vm>$vmkey</vm>";
	print FILE "<type>$hash_arr{$vmkey}</type>";
	print FILE "</entry>";
    }    
    print FILE "</contents>";
    print FILE "</archive>";
    close FILE;

    #finally tar up the proceedings...
    `tar -C /tmp/backup/ -cf $filename.tar . 2>/dev/null`;

    #needs to clean out old files or files past limit at this point....

}

#
#
#
sub restore_archive {

    #Need to send rest messages, but how will the vm get the bu file?
    #first let's process the list
    my %hash_arr;
    my $hash_arr;
    my $archive;
    my @archive = split(',',$restore);
    for $archive (@archive) {
	my @bu = split(':',$archive);
	$hash_arr->{$bu[0]} = $bu[1];
    }

    foreach my $vmkey (keys %hash_arr) {
	my $vm = new OpenApp::VMMgmt($vmkey);
	next if (!defined($vm));
	my $ip = '';
	$ip = $vm->getIP();
	if (defined $ip && $ip ne '') {
	    my $cmd = "http://$ip/notifications/archive/restore/$hash_arr{$vmkey}";
	    my $rc = `curl -X POST -q -I $cmd 2>&1`;
	    #if error returned from curl, remove from list here and notify of error??
	    
	}
    }


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
    my @files = </tmp/backup/*.tar>;
    foreach $file (@files) {
	my @name = split('/',$file);
	#just open up meta data file and squirt out contents...
	my $metafile;
	my @metafile = split('\.',$name[3]);
	my $output;
	my @output = `tar -xf $file --wildcards -O ./$metafile[0].txt`;
	print $output[0];
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
    print "       $0 --name=<optional filename>\n";
    print "       $0 --restore=<restore>\n";
    print "       $0 --list=<list>\n";
    print "       $0 --delete=<delete>\n";
    exit 1;
}


#pull commands and call command
GetOptions(
    "backup:s"       => \$backup,
    "filename:s"     => \$filename,
    "restore=s"      => \$restore,
    "list:s"         => \$list,
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
