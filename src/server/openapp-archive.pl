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
use XML::Simple;
use OpenApp::Rest;

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

my $REST_BACKUP = "/notifications/archive/backup";
my $REST_RESTORE = "/backup/backupArchive";
my $MAC_ADDR = "/sys/class/net/eth0/address";
my $WEB_RESTORE_ROOT="/var/www/restore";

my $SLEEP_POLL_INTERVAL = 5;
my $INSTALLER_BU_LIMIT = 2;
my $ADMIN_BU_LIMIT = 3;
my $BACKUP_TIMEOUT = 3600; #one hour

##########################################################################
#
# override these values if found in the configuration tree
#
##########################################################################
my $config = new Vyatta::Config;

my $limit = `perl /opt/vyatta/sbin/vyatta-output-config.pl system open-app archive installer`;
if (defined $limit) {
    my @tmp = split " ",$limit;
    if (defined $tmp[1] && (($tmp[1] * 1) eq $tmp[1])) {
	$INSTALLER_BU_LIMIT = $tmp[1];
    }
}
	
my $limit = `perl /opt/vyatta/sbin/vyatta-output-config.pl system open-app archive admin`;
if (defined $limit) {
    my @tmp = split " ",$limit;
    if (defined $tmp[1] && (($tmp[1] * 1) eq $tmp[1])) {
	$ADMIN_BU_LIMIT = $tmp[1];
    }
}

my $timeout = `perl /opt/vyatta/sbin/vyatta-output-config.pl system open-app archive backup timeout`;
if (defined $timeout) {
    my @tmp = split " ",$timeout;
    if (defined $tmp[1] && (($tmp[1] * 1) eq $tmp[1])) {
	$BACKUP_TIMEOUT = $tmp[1];
    }
}

my ($backup,$backup_get,$backup_auto,$filename,$file,$restore,$restore_target,$restore_status,$backup_status,$list,$get,$get_archive,$put_archive,$delete);

sub backup_archive {
    ##########################################################################
    #
    # Apply bu limit for installer and admin user
    #
    ##########################################################################
    `sudo rm -fr $ARCHIVE_ROOT_DIR/tmp`;

    my $limit_ct = `ls $ARCHIVE_ROOT_DIR | wc -w`;
    if ($auth_user_role eq 'installer' && $limit_ct >= $INSTALLER_BU_LIMIT+1) {
	print STDERR "Your backup directory is full. Please delete an archive to make room.";
	exit 1;
    }
    elsif ($auth_user_role eq 'admin' && $limit_ct >= $ADMIN_BU_LIMIT+1) {
	print STDERR "Your backup directory is full. Please delete an archive to make room.";
	exit 1;
    }

    backup();

    #backup is now complete, let's send an email out to admin
    my $email = $auth_user->getMail();
    `echo -e 'To: $email\nSubject: backup is finished: $filename' | /usr/sbin/ssmtp $email 2>/dev/null`;
}

##########################################################################
#
# Run through the list of VM's and
# sequentially perform backup
#
#
##########################################################################
sub backup {

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
    my $time = sprintf("%02dh%02dm%02d%s",$hour,$min,$sec,$am_pm);

    my $datamodel = '1';

    my $metafile = $BACKUP_WORKSPACE_DIR."/".$date."_".$time."_".$datamodel;
    if (!defined($filename) || $filename eq '') {
	$filename = $date."_".$time."_".$datamodel;
    }
    if (-e "$ARCHIVE_ROOT_DIR/$filename.tar") {
	`logger -p notice 'dom0: backup is in progress, exiting...'`;
	print STDERR "Backup in progress.";
	exit 1;
    }

    `touch $metafile.tar`;

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
    my %hash_coll;
    my $hash_coll;
    my $archive;
    my @archive = split(',',$backup);
    my $i = 0;
    for $archive (@archive) {
	my $bu;
	my @bu = split(':',$archive);
	if ($bu[1] eq 'data') {
	    $hash_coll{$bu[0]} |= 1;
	}
	elsif ($bu[1] eq 'config') {
	    $hash_coll{$bu[0]} |= 2;
	}
    }

    my $key;
    foreach $key (keys (%hash_coll)) {
	my $vm = new OpenApp::VMMgmt($key);
	next if (!defined($vm));

	if ($key =~ /openapp/) {
	    next; #don't send rest message to myself
	}

	my $ip = $vm->getIP();
	my $port = $vm->getWuiPort();
	if (defined $ip && $ip ne '') {
	    my $value = $hash_coll{$key};
	    my $cmd;
	    if (defined $port && $port ne '') {
		$cmd = "http://$ip:$port/backup/backupArchive?";
	    }
	    else {
		$cmd = "http://$ip/backup/backupArchive?";
	    }
	    if ($value == 1) {
		$cmd .= "data=true&config=false";
	    }
	    elsif ($value == 2) {
		$cmd .= "data=false&config=true";
	    }
	    else {
		$cmd .= "data=true&config=true";
	    }
	    my $obj = new OpenApp::Rest();
	    my $err = $obj->send("GET",$cmd);
	    if ($err->{_success} != 0 || $err->{_http_code} == 500 || $err->{_http_code} == 501) {
		#delete from hash coll
		delete $hash_coll{$key};
		#and log
		`logger -p alert 'dom0: Rest notification error in response from $ip when starting backup: $err->{_http_code}'`;
	    }
	}
    }

#    print "KEY COUNT" . (keys (%hash_coll)) . "\n";
    
    ##########################################################################
    #
    # Poll for bu completion, when complete pull bu and encrypt bu. Continue
    # polling until all bu's have been pulled.
    #
    ##########################################################################
    my %new_hash_coll = %hash_coll;
    #now that each are started, let's sequentially iterate through and retrieve
    `rm -fr $BACKUP_WORKSPACE_DIR/* 2>/dev/null`;

    #now need overall time for this process
    my $end_time = time() + $BACKUP_TIMEOUT;

    my %domu_archive_names;

    #need to loop forever until either time expired, or vm error received or bu received.
    while (1) {
	foreach $key (keys (%new_hash_coll)) {
	    #now need to iterate over hash here...
	    
	    my $vm = new OpenApp::VMMgmt($key);
	    next if (!defined($vm));

	    if ($key =~ /openapp/) {
		#run dom0 backup script
		my $value = $hash_coll{$key};
		if ($value != 1) {
		    my $bufile = "$BACKUP_WORKSPACE_DIR/$key";
		    `sudo /opt/vyatta/sbin/openapp-dom0-backup.pl --backup=config=true --filename=$bufile`;
		    my $resp = `openssl enc -aes-256-cbc -salt -pass file:$MAC_ADDR -in $bufile -out $BACKUP_WORKSPACE_DIR/$key.enc`;
		    `rm -f $bufile`;  #now remove source file
		    #and remove from poll collection
		}
		delete $new_hash_coll{$key};
	    }
	    else {
		my $ip = '';
		my $ip = $vm->getIP();
		my $port = $vm->getWuiPort();
		if (defined $ip && $ip ne '') {
		    my $cmd;
		    if (defined $port && $port ne '') {
			$cmd = "http://$ip:$port/backup/getArchive";		
		    }
		    else {
			$cmd = "http://$ip/backup/getArchive";		
		    }
		    my $obj = new OpenApp::Rest();
		    my $err = $obj->send("GET",$cmd);
		    if ($err->{_http_code} == 302) { #redirect means server is done with archive
			#now parse the new location...
			my $header = $err->{_header};
			my $filename;
			my ($archive_location,$filename) = get_archive_location($header);

			$domu_archive_names{$key} = $filename;
			
			#and retrieve the archive
			#writes to specific location on disk
			my $bufile = "$BACKUP_WORKSPACE_DIR/$filename.tar";
			`mkdir -p $BACKUP_WORKSPACE_DIR`;
			my $rc = `wget $archive_location -O $bufile 2>&1`;
			
			if ($rc =~ /200 OK/) {
			    my $resp = `openssl enc -aes-256-cbc -salt -pass file:$MAC_ADDR -in $bufile -out $BACKUP_WORKSPACE_DIR/$filename.enc`;
			    `rm -f $bufile`;  #now remove source file
			    #and remove from poll collection
			    delete $new_hash_coll{$key};
			}		
			else {
			    `logger -p alert 'dom0: error when retrieving archive from $key: $rc'`;
			}
		    }
		    elsif ($err->{_http_code} == 200 && defined($err->{_body})) {
			#we'll now interpret this as including the archive in the response
			my $bufile = "$BACKUP_WORKSPACE_DIR/$filename.tar";
			open (MYFILE, '>$bufile');
			print (MYFILE $err->{_body});
			close (MYFILE);
			
			$domu_archive_names{$key} = $filename;

			my $resp = `openssl enc -aes-256-cbc -salt -pass file:$MAC_ADDR -in $bufile -out $BACKUP_WORKSPACE_DIR/$filename.enc`;
			`rm -f $bufile`;  #now remove source file
			#and remove from poll collection
			delete $new_hash_coll{$key};
		    }
		    elsif ($err->{_success} != 0 || $err->{_http_code} == 500 || $err->{_http_code} == 501 || $err->{_http_code} == 404) {
			#log error and delete backup request
			`logger -p notice 'dom0: error received from $key, canceling backup of this VM: $err->{_http_code}'`;
			delete $new_hash_coll{$key};
			
			#also remove this from the original list so it is not included in the backup
			delete $hash_coll{$key};
		    }
		    else {
			next;
		    }
		}
	    }
	}
	if (keys (%new_hash_coll) == 0) { #finished up my work
	    last;
	}
	sleep $SLEEP_POLL_INTERVAL;
	if (time() > $end_time) {
	    `logger -p alert 'dom0: backup was unable to retrieve all requested backups'`;
	    last;
	}
    }

    if (keys (%hash_coll) == 0) {
	`logger -p alert 'dom0: backup is empty, exiting'`;
	exit 0;
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
    foreach $key (keys (%hash_coll)) {
	my $value = $hash_coll{$key};
	my $vm = new OpenApp::VMMgmt($key);
	next if (!defined($vm));
	print FILE "<entry>";
	print FILE "<vm>$key</vm>";
	print FILE "<name>".$domu_archive_names{$key}."</name>";
	if ($value == 1) {
	    print FILE "<type>data</type>";
	}
	elsif ($value == 2) {
	    print FILE "<type>config</type>";
	}
	else {
	    print FILE "<type>all</type>";
	}
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
    `tar -C $BACKUP_WORKSPACE_DIR -cf $ARCHIVE_ROOT_DIR/$filename.tar . 2>/dev/null`;

    ##########################################################################
    #
    # Set the status of the backup to 100%
    #
    ##########################################################################
    `echo '100' > $BACKUP_WORKSPACE_DIR/status`;
    `logger -p info 'dom0: Backup operation has successfully finished'`;
}

##########################################################################
#
# Infer location from response header parameter
#
##########################################################################
sub get_archive_location {
    my ($header) = @_;
    my $filename;
    
    #looking for Location: in header
    my @tmp = split " ",$header;
    my $flag = 0;
    foreach my $tmp (@tmp) {
	if ($flag == 1) {
	    #strip out the filename
	    my @a = split "/",$tmp;
	    $filename = $a[$#a];
	    substr($filename,-4) = ""; #remove '.tar'
	    return ($tmp,$filename);
	}
	if ($tmp =~ /Location:/) {
	    $flag = 1;
	}
    }
    return "";
}

##########################################################################
#
# Same as a separate backup and get except archive doesn't reside on dom0
#
##########################################################################
sub backup_and_get_archive {
# The behavior is:
# 1) client requests backup-and-get archive
# 2) server spins off request as background process (chunker)
# 3) server performs backup and sets status flag to false
# 4) upon completion of backup archive is copied to location
# 5) status flag is set to true
# 6) no provision is enabled to remove file.
#
    #then a get accessor
    my $OA_SESSION_ID = $ENV{OA_SESSION_ID};
    `mkdir -p /var/www/archive/$OA_SESSION_ID`;
    #now remove archive
    `rm -f /var/www/archive/$OA_SESSION_ID/*.tar`;
   #first perform backup w/o normal limit
    $backup = $backup_get;
    backup();

    $get_archive = $filename;

    get_archive();
    
    #will move to a common name now to manage bu archives with single image for now.
#    `mv /var/www/archive/$OA_SESSION_ID/$get_archive.tar /var/www/archive/$OA_SESSION_ID/bu/.`;
    #now let's remove this archive from the archive location
    `rm -f $ARCHIVE_ROOT_DIR/$get_archive.tar`;
}


##########################################################################
#
# Same as a separate backup and get except archive doesn't reside on dom0
#
##########################################################################
sub backup_auto {
# The behavior is:
# 1) client requests backup-and-get archive
# 2) server spins off request as background process (chunker)
# 3) server performs backup and sets status flag to false
# 4) upon completion of backup archive is copied to location
# 5) status flag is set to true
# 6) no provision is enabled to remove file.
#
    #then a get accessor
    my $OA_SESSION_ID = $ENV{OA_SESSION_ID};
    #now remove archive
   #first perform backup w/o normal limit
    $backup = $backup_auto; #backup list is expected
    backup();

    #now relocate and rename the archive
    `mv $ARCHIVE_ROOT_DIR/$filename.tar $file`;
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
    `rm -fr /var/www/backup/restore`;
    `mkdir -p /var/www/backup/restore`;
    `mkdir -p $WEB_RESTORE_ROOT/`;
    `mkdir -p $RESTORE_WORKSPACE_DIR/`;
    #test for failure here
    my $tfile = '';
    if (defined($file) && -f "$file") {
      $tfile = "$file";
    } elsif (-f "$ARCHIVE_ROOT_DIR/$restore.tar") {
      $tfile = "$ARCHIVE_ROOT_DIR/$restore.tar";
    } elsif (-f "$ARCHIVE_BASE_DIR/admin/$restore.tar") {
      $tfile = "$ARCHIVE_BASE_DIR/admin/$restore.tar";
    } else {
      return;
    }
    my $err = `tar xf $tfile -C $RESTORE_WORKSPACE_DIR/. 2>&1`;
    return if ($? >> 8);

    ##########################################################################
    #
    # Now build out an archive list as provided in the argument list, or if
    # not supplied build out from archive
    #
    ##########################################################################
    my %hash_coll;
    my $hash_coll;

    my %archive_name_coll;
    my $archive_name_coll;


    my $metafile = $ARCHIVE_ROOT_DIR."/".$restore;
    my @output = `tar -xf $metafile.tar -O ./$restore.txt 2>/dev/null`;
    my $text = join("",@output);
    my $xs = new XML::Simple(forcearray=>1);
    my $opt = $xs->XMLin($text);
    #now parse the rest code
    
    my $arrayref = $opt->{contents}->[0]->{entry};
    for (my $i = 0; $i < @$arrayref; $i++) {
	my $vm = $opt->{contents}->[0]->{entry}->[$i]->{vm}->[0];
	my $ar_name = $opt->{contents}->[0]->{entry}->[$i]->{name}->[0];
	$archive_name_coll{ $vm } = $ar_name;
    }


    my $archive;
    if (defined($restore_target) && $restore_target ne '') {
	my @archive = split(',',$restore_target);
	my $i = 0;
	for $archive (@archive) {
	    my $bu;
	    my @bu = split(':',$archive);
	    if ($bu[1] eq 'data') {
		$hash_coll{ $bu[0] } |= 1;
	    }
	    elsif ($bu[1] eq 'config') {
		$hash_coll{ $bu[0] } |= 2;
	    }
	}
    }
    else {
	#used with restore from my pc command
	#instead use the xml file to fill out hash_coll...
	my $arrayref = $opt->{contents}->[0]->{entry};
	for (my $i = 0; $i < @$arrayref; $i++) {
	    
	    my $vm = $opt->{contents}->[0]->{entry}->[$i]->{vm}->[0];
	    my $ar_name = $opt->{contents}->[0]->{entry}->[$i]->{name}->[0];
	    my $ar_type = $opt->{contents}->[0]->{entry}->[$i]->{type}->[0];

	    $archive_name_coll{ $vm } = $ar_name;

	    if ($ar_type eq 'data') {
		$hash_coll{ $vm } = 1;
	    }
	    elsif ($ar_type eq 'config') {
		$hash_coll{ $vm } = 2;
	    }
	    else {
		$hash_coll{ $vm } = 3;
	    }
	}
    }

    ##########################################################################
    #
    # for each VM:type decrypt archive
    #
    # for each VM:type send REST message to VM to restore. web root is a 
    # well known location.
    #
    ##########################################################################
    my $key;
    foreach $key (keys (%hash_coll)) {
	my $vm = new OpenApp::VMMgmt($key);
	next if (!defined($vm));

	my $ar_name = $archive_name_coll{ $key };

	if ($key =~ /openapp/) {
	    my $value = $hash_coll{$key};
	    if ($value != 1) {
		my $restorefile = "/tmp/$ar_name";
		#call dom0 backup script here
		my $resp = `openssl enc -aes-256-cbc -d -salt -pass file:$MAC_ADDR -in $RESTORE_WORKSPACE_DIR/$ar_name.enc -out $restorefile`;
		`sudo /opt/vyatta/sbin/openapp-dom0-backup.pl --restore=config=true --filename=$restorefile`;
	    }
	}
	else {
	    my $ip = '';
	    my $ip = $vm->getIP();
	    my $port = $vm->getWuiPort();
	    if (defined $ip && $ip ne '') {
		my $resp = `openssl enc -aes-256-cbc -d -salt -pass file:$MAC_ADDR -in $RESTORE_WORKSPACE_DIR/$ar_name.enc -out /var/www/backup/restore/$ar_name`;
		my $cmd;
		if (defined $port && $port ne '') {
		    $cmd = "http://$ip:$port/backup/backupArchive?";
		}
		else {
		    $cmd = "http://$ip/backup/backupArchive?";
		}
		my $value = $hash_coll{$key};
		if ($value == 1) {
		    $cmd .= "data=true&config=false";
		}
		elsif ($value == 2) {
		    $cmd .= "data=false&config=true";
		}
		else {
		    $cmd .= "data=true&config=true";
		}
		$cmd .= "&file=http://192.168.0.101/backup/restore/$ar_name";
		my $obj = new OpenApp::Rest();
		my $err = $obj->send("PUT",$cmd);
		if ($err->{_success} != 0 || $err->{_http_code} == 500 || $err->{_http_code} == 501) {
		    `logger -p notice 'dom0: Rest notification error in response from $ip when starting restore: $err->{_http_code}'`;
		}
	    }
	}
    }
    `logger -p info 'dom0: Restore operation has successfully finished'`;
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
    my $cmdline = $ENV{OA_CMD_LINE};
    
    if (!defined $cmdline) {
	print "VERBATIM_OUTPUT\n";
    }
    my $file;
    my $cmd;
    my @files = <$ARCHIVE_ROOT_DIR/*.tar>;
    foreach $file (@files) {
	my @name = split('/',$file);
	#just open up meta data file and squirt out contents...
	#now chop off the last period
	my @name2 = split('\.',$name[4]);
	
	my $output;
	my @output = `tar -xf $file -O ./$name2[0].txt 2>/dev/null`;
	if (defined $cmdline) {
	    $cmd .= $output[0];
	}
	else {
	    print $output[0];
	}
    } 
    
#if installer than also return admin archives
    if ($auth_user_role eq 'installer') {
	my @files = <$ARCHIVE_BASE_DIR/admin/*.tar>;
	foreach $file (@files) {
	    my @name = split('/',$file);
	    #just open up meta data file and squirt out contents...
	    #now chop off the last period
	    my @name2 = split('\.',$name[4]);
	    
	    my $output;
	    my @output = `tar -xf $file -O ./$name2[0].txt 2>/dev/null`;
	    if (defined $cmdline) {
		$cmd .= $output[0];
	    }
	    else {
		print $output[0];
	    }
	} 
    }

    if (!defined $cmdline) {
	if ($auth_user_role eq 'installer' && $#files+1 >= $INSTALLER_BU_LIMIT) {
	    print "<limit>true</limit>";
	}
	elsif ($auth_user_role eq 'admin' && $#files+1 >= $ADMIN_BU_LIMIT) {
	    print "<limit>true</limit>";
	}
	else {
	    print "<limit>false</limit>";
	}
    }
    else {

	$cmd = "<foo>" . $cmd . "</foo>";
	#now process the output here
        my $xs = new XML::Simple(forcearray=>1);
        my $opt = $xs->XMLin($cmd);
        #now parse the rest code


	my $archiveref = $opt->{archive};
	if (!defined $archiveref) {
	    print "no archives\n";
	    return;
	}
	for (my $i = 0; $i < @$archiveref; $i++) {

	    my $arrayref = $opt->{archive}->[$i]->{contents}->[0]->{entry};
	    
	    print "owner:\t" . $opt->{archive}->[$i]->{owner}->[0] . "\n";
	    print "file:\t" . $opt->{archive}->[$i]->{file}->[0] . ".tar\n";
	    print "date:\t" . $opt->{archive}->[$i]->{date}->[0] . "\n";
	    print "contents:\t\n";
	    for (my $j = 0; $j < @$arrayref; $j++) {
		print "\t" . $opt->{archive}->[$i]->{contents}->[0]->{entry}->[$j]->{vm}->[0] . ":" . $opt->{archive}->[$i]->{contents}->[0]->{entry}->[$j]->{type}->[0] . "\n";
	    }
	    print "\n";
	}
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

    `sudo rm -fr $ARCHIVE_ROOT_DIR/tmp`;

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
#    `mkdir -p /var/www/archive/$OA_SESSION_ID`;

    `cp /tmp/$put_archive.tar $ARCHIVE_ROOT_DIR/.`;
    `rm -f /tmp/$put_archive.tar`;

    #also restore this now.
    $restore = $put_archive;
    restore_archive();
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
    my $time = sprintf("%02dh%02dm%02d%s",$hour,$min,$sec,$am_pm);

    my $datamodel = '1';

    $filename = $date."_".$time."_".$datamodel;
    if (-e "$ARCHIVE_ROOT_DIR/$filename.tar") {
	print "0";
	exit 0;
    }

#    my $file = "$BACKUP_WORKSPACE_DIR/status";
#    if (-e $file) {
#	my $out = `cat $file`;
#	print $out;
#	return;
#    }
    print "100";
}



##########################################################################
#
# start of main
#
##########################################################################
sub usage() {
    print "Usage: $0 --backup=<backup>\n";
    print "       $0 --backup-get=<backup>\n";
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
    "backup-auto:s"         => \$backup_auto,
    "backup-get:s"          => \$backup_get,
    "file=s"                => \$file,
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
elsif ( defined $backup_get ) {
    backup_and_get_archive();
}
elsif ( defined $backup_auto ) {
    #backup-auto has list
    #file has path and filename
    backup_auto();
}
elsif ( defined $restore ) {
    # if file is specified, it's for "auto restore"
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
