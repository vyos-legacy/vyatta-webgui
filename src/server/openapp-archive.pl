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
use Vyatta::Config;
use Vyatta::Misc;
use Vyatta::TypeChecker;

my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}


##########################################################################
# Directory layout is as follows:
# /var/archive                               #root directory
#             /installer                     #installer root and install bu/res
#                       /tmp/backup          #install bu workspace
#                       /tmp/restore         #install res workspace
#             /admin                         #admin root and admin bu/res
#                       /tmp/backup          #admin bu workspace
#                       /tmp/restore         #admin res workspace
#
#
##########################################################################
my $ARCHIVE_BASE_DIR = "/var/archive";
my $ARCHIVE_ROOT_DIR = "$ARCHIVE_BASE_DIR/$auth_user_role";
my $BACKUP_WORKSPACE_DIR = "$ARCHIVE_ROOT_DIR/tmp/backup";
my $RESTORE_WORKSPACE_DIR = "$ARCHIVE_ROOT_DIR/tmp/restore";

my $REST_BACKUP = "/notification/archive/backup";
my $REST_RESTORE = "/notification/archive/restore";
my $MAC_ADDR = "/sys/class/net/eth0/address";
my $WEB_RESTORE_ROOT="/var/www/restore";


my $INSTALLER_BU_LIMIT = 2;
my $ADMIN_BU_LIMIT = 3;
##########################################################################
#
# override these values if found in the configuration tree
#
##########################################################################
my $config = new Vyatta::Config;

my $option = $config->returnValue("system open-app archive installer");
if (defined $option) {
    $INSTALLER_BU_LIMIT = $option;
}
	
my $option = $config->returnValue("system open-app archive admin");
if (defined $option) {
    $ADMIN_BU_LIMIT = $option;
}

my ($backup,$filename,$restore,$restore_target,$restore_status,$backup_status,$list,$get,$get_archive,$put_archive,$delete);

##########################################################################
#
# Run through the list of VM's and
# sequentially perform backup
#
#
##########################################################################
sub backup_archive {
    ##########################################################################
    #
    # Apply bu limit for installer and admin user
    #
    ##########################################################################
    my $limit_ct = `ls $ARCHIVE_ROOT_DIR | wc -w`;
    if ($auth_user_role eq 'installer' && $limit_ct >= $INSTALLER_BU_LIMIT+1) {
	print STDERR "Your backup directory is full. Please delete an archive to make room.";
	exit 1;
    }
    elsif ($auth_user_role eq 'admin' && $limit_ct >= $ADMIN_BU_LIMIT+1) {
	print STDERR "Your backup directory is full. Please delete an archive to make room.";
	exit 1;
    }

    ##########################################################################
    #
    # Set the status of the backup to 0%
    #
    ##########################################################################
    `mkdir -p $BACKUP_WORKSPACE_DIR`;
    `echo '0' > $BACKUP_WORKSPACE_DIR/status`;


    ##########################################################################
    #
    # Parse passed in backup list and send out REST message to VMs
    #
    ##########################################################################
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
	    my $rc = `curl -X GET -q -I $cmd 2>&1`;
	    #if error returned from curl, remove from list here and notify of error??
	    
	}
    }
    
    ##########################################################################
    #
    # Poll for bu completion, when complete pull bu and encrypt bu. Continue
    # polling until all bu's have been pulled.
    #
    ##########################################################################
    my @new_coll = @coll;
    #now that each are started, let's sequentially iterate through and retrieve
    `rm -fr $BACKUP_WORKSPACE_DIR/* 2>/dev/null`;
    while ($#new_coll > -1) {
	foreach $i (0..$#new_coll) {
	    my $vm = new OpenApp::VMMgmt($new_coll[$i][0]);
	    next if (!defined($vm));
	    my $ip = '';
	    $ip = $vm->getIP();
	    if (defined $ip && $ip ne '') {
		my $cmd = "http://$ip/archive/backup/$new_coll[$i][1]";
		#writes to specific location on disk
		my $bufile = "$BACKUP_WORKSPACE_DIR/$new_coll[$i][0]/$new_coll[$i][1]";
		`mkdir -p $BACKUP_WORKSPACE_DIR/$new_coll[$i][0]`;

		my $rc = `wget $cmd -O $bufile 2>&1`;
		if ($rc =~ /200 OK/) {
#		    print "SUCCESS\n";
#		    print "openssl enc -aes-256-cbc -kfile $MAC_ADDR -in $BACKUP_WORKSPACE_DIR/$new_coll[$i][0]/$new_coll[$i][1] -out $BACKUP_WORKSPACE_DIR/$new_coll[$i][0]/$new_coll[$i][1].enc";
		    my $resp = `openssl enc -aes-256-cbc -salt -pass file:$MAC_ADDR -in $BACKUP_WORKSPACE_DIR/$new_coll[$i][0]/$new_coll[$i][1] -out $BACKUP_WORKSPACE_DIR/$new_coll[$i][0]/$new_coll[$i][1].enc`;
		    #what happens if a vm fails to backup???? how are we to identify this???

		    #remove from new_collection
		    delete $new_coll[$i];
		}
	    }
	}
	sleep 1;
    }

    ##########################################################################
    #
    # Build out archive filename according to spec. Also build out metadata
    # format and write to metadata file.
    #
    ##########################################################################
    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst);
    ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime(time);

    my $am_pm='AM';
    $hour >= 12 and $am_pm='PM'; # hours 12-23 are afternoon
    $hour > 12 and $hour=$hour-12; # 13-23 ==> 1-11 (PM)
    $hour == 0 and $hour=12; # convert day's first hour

    my $date = sprintf("%02d%02d%02d",$mday,$mon+1,$year-100);
    my $time = sprintf("%02dh%02d%s",$hour,$min,$am_pm);

    my $datamodel = '1';

    my $metafile = $BACKUP_WORKSPACE_DIR."/".$date."_".$time."_".$datamodel;
    if (!defined($filename) || $filename eq '') {
	$filename = $date."_".$time."_".$datamodel;
    }

    #now create metadata file
    my $FILE;

    open FILE, ">", "$metafile.txt" or die $!;
    #we'll write out xml descriptions--the same as what we display...
    print FILE "<archive>";
    print FILE "<owner>$auth_user_role</owner>";
    print FILE "<name>$filename</name>";
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

    ##########################################################################
    #
    # Now suck up everything in the directory and tar up. Done.
    #
    ##########################################################################
#    print "tar -C $BACKUP_WORKSPACE_DIR -cf $ARCHIVE_ROOT_DIR/$filename.tar . 2>/dev/null";
    `tar -C $BACKUP_WORKSPACE_DIR -cf $ARCHIVE_ROOT_DIR/$filename.tar . 2>/dev/null`;

    #grab admin email address...
    my $admin_email;
    my @output;
    my $output;
    @output = `ldapsearch -x -b "dc=localhost,dc=localdomain" "uid=admin"`;
    for $output (@output) {
#	print $output;
	my @o = split(' ',$output);
	if (defined $o[0] && defined $o[1]) {
	    if ($o[0] eq 'mail:') {
		$admin_email = $o[1];
		last;
	    }
	}
    }

    ##########################################################################
    #
    # Set the status of the backup to 100%
    #
    ##########################################################################
    `echo '100' > $BACKUP_WORKSPACE_DIR/status`;

    #backup is now complete, let's send an email out to admin
    #echo -e "To: mike@lrlart.com\nSubject: backup is finished" | /usr/sbin/ssmtp mike@lrlart.com

    `echo -e 'To: $admin_email\nSubject: backup is finished: $filename' | /usr/sbin/ssmtp $admin_email 2>/dev/null`;
}

##########################################################################
#
#
#
##########################################################################
sub restore_archive {
    ##########################################################################
    #
    # clear out web restore directory and untar into web restore root 
    #
    ##########################################################################
    `rm -fr $WEB_RESTORE_ROOT/`;
    `mkdir -p $WEB_RESTORE_ROOT/`;
    `mkdir -p $RESTORE_WORKSPACE_DIR/`;

    #test for failure here
    my $err = `tar xf $ARCHIVE_ROOT_DIR/$restore.tar -C $WEB_RESTORE_ROOT/.`;
    if ($err =~ /No such file/) {
	my $err = `tar xf $ARCHIVE_BASE_DIR/admin/$restore.tar -C $WEB_RESTORE_ROOT/.`;
	if ($err =~ /No such file/) {
	    return;
	}
    }

    ##########################################################################
    #
    # Now build out an archive list as provided in the argument list, or if
    # not supplied build out from archive
    #
    ##########################################################################
    my @coll;
    my $coll;
    my $i = 0;
    if (defined($restore_target) && $restore_target ne '') {
	my $archive;
	my @archive = split(',',$restore_target);
	for $archive (@archive) {
	    my @bu = split(':',$archive);
	    $coll[$i] = [ @bu ];
	    $i = $i + 1;
	}
    }
    else {
	my $filename;
	opendir ( DIR, $WEB_RESTORE_ROOT ) || die "Error in opening dir $WEB_RESTORE_ROOT\n";
	while( ($filename = readdir(DIR))){
	    if (lstat("$WEB_RESTORE_ROOT/$filename/data")) {
		$coll[$i] = [ $filename,"data" ];
		$i = $i + 1;
	    }
	    if (lstat("$WEB_RESTORE_ROOT/$filename/conf")) {
		$coll[$i] = {$filename,"conf"};
		$i = $i + 1;
	    }
	    if (lstat("$WEB_RESTORE_ROOT/$filename/all")) {
		$coll[$i] = {$filename,"all"};
		$i = $i + 1;
	    }
	}
	closedir(DIR);
    }

    ##########################################################################
    #
    # for each VM:type decrypt archive
    #
    # for each VM:type send REST message to VM to restore. web root is a 
    # well known location.
    #
    ##########################################################################
    my @new_coll = @coll;
    my $coll_ct = $#new_coll;
    foreach $i (0..$#coll) {
	my $vm = new OpenApp::VMMgmt($coll[$i][0]);
	next if (!defined($vm));
	my $ip = '';
	$ip = $vm->getIP();
	if (defined $ip && $ip ne '') {
	    my $resp = `openssl enc -aes-256-cbc -d -salt -pass file:$MAC_ADDR -in $BACKUP_WORKSPACE_DIR/$new_coll[$i][0]/$new_coll[$i][1].enc -out $BACKUP_WORKSPACE_DIR/$new_coll[$i][0]/$new_coll[$i][1]`;
	    my $cmd = "http://$ip$REST_RESTORE/$coll[$i][1]";
	    my $rc = `curl -X GET -q -I $cmd 2>&1`;
	    #if error returned from curl, remove from list here and notify of error??
	    
	}
    }

    ##########################################################################
    #
    # now poll for response from VM in restore process. just looking for 200
    # success. updating status based on number of finished archive units. 
    # continue until all are done or chunker kills me.
    #
    ##########################################################################
    my $progress_ct = 0;
    `echo '0' > $RESTORE_WORKSPACE_DIR/status`;
    #now that each are started, let's sequentially iterate through and retrieve
    while ($#new_coll > -1) {
	foreach $i (0..$#new_coll) {
	    my $vm = new OpenApp::VMMgmt($new_coll[$i][0]);
	    next if (!defined($vm));
	    my $ip = '';
	    $ip = $vm->getIP();
	    if (defined $ip && $ip ne '') {
		my $cmd = "http://$ip/archive/restore/$new_coll[$i][1]/status/";
		#writes to specific location on disk
		my $rc = `curl -X GET -q -I $cmd 2>&1`;
		if ($rc =~ /200 OK/) {
#		    print "SUCCESS\n";
		    #remove from new_collection
		    $progress_ct = $progress_ct + 1;
		    #when done write
		    my $progress = 100;
		    if ($coll_ct != 0) {
			$progress = (100 * $progress_ct) / $coll_ct;
		    }
		    `echo '$progress' > $RESTORE_WORKSPACE_DIR/status`;
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

##########################################################################
#
#
#
# Generates xml listing...
#
# Generates the following xml
# <archive>
#   <owner>owner</owner>
#   <name>name</name>
#   <file>file</file>
#   <date>date</date>
#   <contents>
#     <entry>
#       <vm>vm</vm>
#       <type>data|conf|all</type>
#     </entry>
#   </contents>
# </archive>
#
#
#
##########################################################################
sub list_archive {
    #get a directory listing of /backup/.
    print "VERBATIM_OUTPUT\n";
    my $file;
    my @files = <$ARCHIVE_ROOT_DIR/*.tar>;
    foreach $file (@files) {
	my @name = split('/',$file);
	#just open up meta data file and squirt out contents...
	#now chop off the last period
	my @name2 = split('\.',$name[4]);

	my $metafile;
	my @metafile = split('\.',$name[3]);
	my $output;
	my @output = `tar -xf $file -O ./$name2[0].txt 2>/dev/null`;
	print $output[0];
    } 
    
#if installer than also return admin archives
    if ($auth_user_role eq 'installer') {
	my @files = <$ARCHIVE_BASE_DIR/admin/*.tar>;
	foreach $file (@files) {
	    my @name = split('/',$file);
	    #just open up meta data file and squirt out contents...
	    #now chop off the last period
	    my @name2 = split('\.',$name[4]);
	    
	    my $metafile;
	    my @metafile = split('\.',$name[3]);
	    my $output;
	    my @output = `tar -xf $file -O ./$name2[0].txt 2>/dev/null`;
	    print $output[0];
	} 
    }

    if ($auth_user_role eq 'installer' && $#files+1 >= $INSTALLER_BU_LIMIT) {
	print "<limit>true</limit>";
    }
    elsif ($auth_user_role eq 'admin' && $#files+1 >= $ADMIN_BU_LIMIT) {
	print "<limit>true</limit>";
    }
    else {
	print "<limit>false</limit>";
    }

    #done
}

##########################################################################
#
# get archive: return archive to host
#
##########################################################################
sub get_archive {

#NEED TO ADD THE FOLLOWING HEADERS TO THE RESPONSE
#    header("Content-type: application/octet-stream");
#    header("Content-Disposition: attachment; filename=\"testfile.zip\"");

    my $OA_SESSION_ID = $ENV{OA_SESSION_ID};

# ?? header("Content-Length:
    #let's clean out directory first
    `rm -fr /var/www/archive/$OA_SESSION_ID/*`;
    `mkdir -p /var/www/archive/$OA_SESSION_ID`;

    print "VERBATIM_OUTPUT\n";
    my $file = "$ARCHIVE_ROOT_DIR/$get_archive.tar";
    if (-e $file) {
	`cp $file /var/www/archive/$OA_SESSION_ID/$get_archive.tar`;
	print "archive/$OA_SESSION_ID/$get_archive.tar";
    }
    elsif ($auth_user_role eq 'installer') { #will blindly try admin as well
	my $file = "$ARCHIVE_BASE_DIR/admin/$get_archive.tar";
	if (-e $file) {
	    `cp $file /var/www/archive/$OA_SESSION_ID/$get_archive.tar`;
	    print "archive/$OA_SESSION_ID/$get_archive.tar";
	}
    }
}

##########################################################################
#
# put archive: client has uploaded a file, now put in archive directory
#
##########################################################################
sub put_archive {
    my $OA_SESSION_ID = $ENV{OA_SESSION_ID};

    #first check for archive limit
    my $limit_ct = `ls $ARCHIVE_ROOT_DIR | wc -w`;
    if ($auth_user_role eq 'installer' && $limit_ct >= $INSTALLER_BU_LIMIT+1) {
	print STDERR "Your backup directory is full. Please delete an archive to make room.";
	exit 1;
    }
    elsif ($auth_user_role eq 'admin' && $limit_ct >= $ADMIN_BU_LIMIT+1) {
	print STDERR "Your backup directory is full. Please delete an archive to make room.";
	exit 1;
    }

    #very simple now, copy to archive directory and that's it!
    `mkdir -p /var/www/archive/$OA_SESSION_ID`;

    print "VERBATIM_OUTPUT\n";
    `cp /tmp/$put_archive.tar $ARCHIVE_ROOT_DIR/.`;
    `rm -f /tmp/$put_archive.tar`;
#   `cp /var/www/archive/$OA_SESSION_ID/$put_archive.tar $ARCHIVE_ROOT_DIR/.`;
#    `rm -fr /var/www/archive/$OA_SESSION_ID/*`;
}

##########################################################################
#
# delete archive...
#
##########################################################################
sub delete_archive {
    my $file = "$ARCHIVE_ROOT_DIR/$delete.tar";
    unlink($file);
    if ($auth_user_role eq 'installer') { #will blindly try admin as well
	my $file = "$ARCHIVE_BASE_DIR/admin/$delete.tar";
	unlink($file);
    }
}

##########################################################################
#
# status of restore
#
##########################################################################
sub restore_status {
    my $file = "$RESTORE_WORKSPACE_DIR/status";
    if (-e $file) {
	my $out = `cat $file`;
	print $out;
	return;
    }
    print "100";
}

##########################################################################
#
# status of backup
#
##########################################################################
sub backup_status {
    my $file = "$BACKUP_WORKSPACE_DIR/status";
    if (-e $file) {
	my $out = `cat $file`;
	print $out;
	return;
    }
    print "100";
}



##########################################################################
#
# start of main
#
##########################################################################
sub usage() {
    print "Usage: $0 --backup=<backup>\n";
    print "       $0 --name=<optional filename>\n";
    print "       $0 --restore=<restore>\n";
    print "       $0 --restore-target=<restore_target>\n";
    print "       $0 --restore-status\n";
    print "       $0 --backup-status\n";
    print "       $0 --list=<list>\n";
    print "       $0 --get=<get>\n";
    print "       $0 --get-archive=<get-archive>\n";
    print "       $0 --put-archive=<put-archive>\n";
    print "       $0 --delete=<delete>\n";
    exit 0;
}

#pull commands and call command
GetOptions(
    "backup:s"              => \$backup,
    "filename:s"            => \$filename,
    "restore=s"             => \$restore,
    "restore-target:s"      => \$restore_target,
    "restore-status:s"      => \$restore_status,
    "backup-status:s"       => \$backup_status,
    "list:s"                => \$list,
    "get:s"                 => \$get,
    "get-archive:s"         => \$get_archive,
    "put-archive:s"         => \$put_archive,
    "delete=s"              => \$delete,
    ) or usage();

if ( defined $backup ) {
    backup_archive();
}
elsif ( defined $restore ) {
    restore_archive();
}
elsif ( defined $restore_status ) {
    restore_status();
}
elsif ( defined $backup_status ) {
    backup_status();
}
elsif (defined $list ) {
    list_archive();
}
elsif (defined $delete ) {
    delete_archive();
}
elsif (defined $get_archive ) {
    get_archive();
}
elsif (defined $put_archive ) {
    put_archive();
}
exit 0;
