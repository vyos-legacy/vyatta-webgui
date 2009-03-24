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

my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

my $ARCHIVE_ROOT_DIR = "/tmp/backup/$auth_user_role";
my $REST_BACKUP = "/notification/archive/backup";
my $REST_RESTORE = "/notification/archive/restore";
my $MAC_ADDR = "/sys/class/net/eth0/address";
my $WEB_RESTORE_ROOT="/var/www/restore";


my ($backup,$filename,$restore,$list,$delete);

#
# Run through the list of VM's and
# sequentially perform backup
#
sub backup_archive {
    #need to enforce 2 backup limit for admin and 3 backup limit for installer
    my $limit_ct = `ls $ARCHIVE_ROOT_DIR | wc -w`;
    if ($auth_user_role eq 'installer' && $limit_ct > 2) {
	print STDERR "Your backup directory is full. Please delete an archive to make room.";
	exit 1;
    }
    elsif ($auth_user_role eq 'installer' && $limit_ct > 1) {
	print STDERR "Your backup directory is full. Please delete an archive to make room.";
	exit 1;
    }

    #first let's process the list
    my @coll;
    my $coll;
    my $archive;
    my @archive = split(',',$backup);
    my $i = 0;
    for $archive (@archive) {
	my @bu = split(':',$archive);
	$coll[$i] = [ @bu ];
	$i = $i + 1;
    }
    foreach $i (0..$#coll) {
	my $vm = new OpenApp::VMMgmt($coll[$i][0]);
	next if (!defined($vm));
	my $ip = '';
	$ip = $vm->getIP();
	if (defined $ip && $ip ne '') {
	    my $cmd = "http://$ip$REST_BACKUP/$coll[$i][1]";
	    my $rc = `curl -X POST -q -I $cmd 2>&1`;
	    #if error returned from curl, remove from list here and notify of error??
	    
	}
    }
    
    #what happens if a vm fails to backup???? how are we to identify this???

    my @new_coll = @coll;
    #now that each are started, let's sequentially iterate through and retrieve
    while ($#new_coll > -1) {
	foreach $i (0..$#new_coll) {
	    my $vm = new OpenApp::VMMgmt($new_coll[$i][0]);
	    next if (!defined($vm));
	    my $ip = '';
	    $ip = $vm->getIP();
	    if (defined $ip && $ip ne '') {
		my $cmd = "http://$ip/archive/$new_coll[$i][1]";
		#writes to specific location on disk
		my $bufile = "$ARCHIVE_ROOT_DIR/$new_coll[$i][0]/$new_coll[$i][1]";
		`rm -f $ARCHIVE_ROOT_DIR/$new_coll[$i][0] 2>/dev/null`;
		`mkdir -p $ARCHIVE_ROOT_DIR/$new_coll[$i][0]`;

		my $rc = `wget $cmd -O $bufile 2>&1`;
#		print "$rc";
		if ($rc =~ /200 OK/) {
#		    print "SUCCESS\n";
		    #now encrypt command--NEED MAC ADDR OF ETH0
#		    my $mac = `cat /sys/class/net/eth0/address`;
		    #probably need to eat the cr here
#		    $mac = chomp($mac);
		    
		    my $resp = `openssl enc -aes-256-cbc -kfile $MAC_ADDR -in $ARCHIVE_ROOT_DIR/$new_coll[$i][0]/$new_coll[$i][1] -out $ARCHIVE_ROOT_DIR/$new_coll[$i][0]/$new_coll[$i][1].enc`;
#		    print "openssl enc -aes-256-cbc -salt $mac -in /tmp/backup/$new_coll[$i][0]/$new_coll[$i][1] -out /tmp/backup/$new_coll[$i][0]/$new_coll[$i][1].enc";
#		    print "$resp\n";
		    #remove from new_collection
		    delete $new_coll[$i];
		}
	    }
	}
	sleep 1;
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

    if (!defined($filename) || $filename eq '') {
	$filename = $ARCHIVE_ROOT_DIR."/".$date."_".$time."_".$datamodel;
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
    foreach $i (0..$#coll) {
	my $vm = new OpenApp::VMMgmt($coll[$i][0]);
	next if (!defined($vm));
	print FILE "<entry>";
	print FILE "<vm>$coll[$i][0]</vm>";
	print FILE "<type>$coll[$i][1]</type>";
	print FILE "</entry>";
    }    
    print FILE "</contents>";
    print FILE "</archive>";
    close FILE;

    #finally tar up the proceedings...
    `tar -C $ARCHIVE_ROOT_DIR -cf $filename.tar . 2>/dev/null`;

    #needs to clean out old files or files past limit at this point....

}

#
#
#
sub restore_archive {

    #Need to send rest messages, but how will the vm get the bu file?
    #first let's process the list
    #first let's process the list
    my @coll;
    my $coll;
    my $archive;
    my @archive = split(',',$restore);
    my $i = 0;
    for $archive (@archive) {
	my @bu = split(':',$archive);
	$coll[$i] = [ @bu ];
	$i = $i + 1;
    }
    
    #untar archive
    `tar xf $ARCHIVE_ROOT_DIR/$restore $WEB_RESTORE_ROOT/.`;
    
    foreach $i (0..$#coll) {
	my $vm = new OpenApp::VMMgmt($coll[$i][0]);
	next if (!defined($vm));
	my $ip = '';
	$ip = $vm->getIP();
	if (defined $ip && $ip ne '') {
	    my $cmd = "http://$ip$REST_RESTORE/$coll[$i][1]";
	    my $rc = `curl -X POST -q -I $cmd 2>&1`;
	    #if error returned from curl, remove from list here and notify of error??
	    
	}
    }

    #now poll for completion
#what happens if a vm fails to backup???? how are we to identify this???
    my @new_coll = @coll;
    #now that each are started, let's sequentially iterate through and retrieve
    while ($#new_coll > -1) {
	foreach $i (0..$#new_coll) {
	    my $vm = new OpenApp::VMMgmt($new_coll[$i][0]);
	    next if (!defined($vm));
	    my $ip = '';
	    $ip = $vm->getIP();
	    if (defined $ip && $ip ne '') {
		my $cmd = "http://$ip/archive/restore/status";
		#writes to specific location on disk
		my $rc = `curl -X POST -q -I $cmd 2>&1`;
#		print "$rc";
		if ($rc =~ /200 OK/) {
#		    print "SUCCESS\n";
		    #remove from new_collection
		    delete $new_coll[$i];
		}
	    }
	}
	sleep 1;

	#what is a reasonable time to kick out of this command?
	#let's kick out of this command after 1/2 hour--which should be done by the chunker
    }

    #now we are done and this is a success
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
    print "VERBATIM_OUTPUT\n";
    my $file;
    my @files = <$ARCHIVE_ROOT_DIR/*.tar>;
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
    my $file = "$ARCHIVE_ROOT_DIR/$delete";
    unlink($file);
}


####main
sub usage() {
    print "Usage: $0 --backup=<backup>\n";
    print "       $0 --name=<optional filename>\n";
    print "       $0 --restore=<restore>\n";
    print "       $0 --list=<list>\n";
    print "       $0 --delete=<delete>\n";
    exit 0;
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
}
elsif ( defined $restore ) {
    restore_archive();
}
elsif (defined $list ) {
    list_archive();
}
elsif (defined $delete ) {
    delete_archive();
}
exit 0;
