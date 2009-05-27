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


my $auth_user_role = "admin";

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

my $option = $config->returnValue("system open-app archive installer");
if (defined $option) {
    $INSTALLER_BU_LIMIT = $option;
}
	
my $option = $config->returnValue("system open-app archive admin");
if (defined $option) {
    $ADMIN_BU_LIMIT = $option;
}

my $option = $config->returnValue("system open-app archive backup timeout");
if (defined $option) {
    $BACKUP_TIMEOUT = $option;
}

my ($backup,$backup_get,$filename,$restore,$restore_target,$restore_status,$backup_status,$list,$get,$get_archive,$put_archive,$delete);

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
	    $hash_coll{$bu[0]} != 1;
	}
	elsif ($bu[1] eq 'config') {
	    $hash_coll{$bu[0]} |= 2;
	}
    }

    my $key;
    foreach $key (keys (%hash_coll)) {
	my $vm = new OpenApp::VMMgmt($key);
	next if (!defined($vm));
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
		`logger 'Rest notification error in response from $ip when starting backup: $err->{_http_code}'`;
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

    #need to loop forever until either time expired, or vm error received or bu received.
    while (1) {
	foreach $key (keys (%new_hash_coll)) {
	    #now need to iterate over hash here...
	    
	    my $vm = new OpenApp::VMMgmt($key);
	    next if (!defined($vm));
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
		    my $archive_location = get_archive_location($header);
		    
		    #and retrieve the archive
		    #writes to specific location on disk
		    my $bufile = "$BACKUP_WORKSPACE_DIR/$key";
		    `mkdir -p $BACKUP_WORKSPACE_DIR`;
		    my $rc = `wget $archive_location -O $bufile 2>&1`;
		    
		    if ($rc =~ /200 OK/) {
			my $resp = `openssl enc -aes-256-cbc -salt -pass file:$MAC_ADDR -in $bufile -out $BACKUP_WORKSPACE_DIR/$key.enc`;
			`rm -f $bufile`;  #now remove source file
			#and remove from poll collection
			delete $new_hash_coll{$key};
		    }		
		    else {
			`logger 'error when retrieve archiving from $key: $rc'`;
		    }
		}
		elsif ($err->{_http_code} == 200 && defined($err->{_body})) {
		    #we'll now interpret this as including the archive in the response
		    my $bufile = "$BACKUP_WORKSPACE_DIR/$key";
		    open (MYFILE, '>$bufile');
		    print (MYFILE $err->{_body});
		    close (MYFILE);

		    my $resp = `openssl enc -aes-256-cbc -salt -pass file:$MAC_ADDR -in $bufile -out $BACKUP_WORKSPACE_DIR/$key.enc`;
		    `rm -f $bufile`;  #now remove source file
		    #and remove from poll collection
		    delete $new_hash_coll{$key};
		}
		elsif ($err->{_success} != 0 || $err->{_http_code} == 500 || $err->{_http_code} == 501) {
		    #log error and delete backup request
		    `logger 'error received from $key, canceling backup of this VM: $err->{_http_code}'`;
		    delete $new_hash_coll{$key};
		    
		    #also remove this from the original list so it is not included in the backup
		    delete $hash_coll{$key};
		}
		else {
		    next;
		}
	    }
	}
	if (keys (%new_hash_coll) == 0) { #finished up my work
	    last;
	}
	sleep $SLEEP_POLL_INTERVAL;
	if (time() > $end_time) {
	    `logger 'backup was unable to retrieve all requested backups'`;
	    last;
	}
    }

    if (keys (%hash_coll) == 0) {
	`logger 'backup is empty, exiting'`;
	exit 0;
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
    foreach $key (keys (%hash_coll)) {
	my $value = $hash_coll{$key};
	my $vm = new OpenApp::VMMgmt($key);
	next if (!defined($vm));
	print FILE "<entry>";
	print FILE "<vm>$key</vm>";
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
}

##########################################################################
#
# Infer location from response header parameter
#
##########################################################################
sub get_archive_location {
    my ($header) = @_;
    
    #looking for Location: in header
    my @tmp = split " ",$header;
    my $flag = 0;
    foreach my $tmp (@tmp) {
	if ($flag == 1) {
	    return $tmp;
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
   #first perform backup w/o normal limit
    $backup = $backup_get;
    backup();

    $get_archive = $filename;

    #then a get accessor
    my $OA_SESSION_ID = $ENV{OA_SESSION_ID};
    get_archive();
#    `mkdir -p /var/www/archive/$OA_SESSION_ID`;
    
    #will move to a common name now to manage bu archives with single image for now.
    `mv /var/www/archive/$OA_SESSION_ID/$get_archive.tar /var/www/archive/bu.tar`;

    #now remove archive
    `rm -f $ARCHIVE_ROOT_DIR/$filename.tar`;
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
    my $err = `tar xf $ARCHIVE_ROOT_DIR/$restore.tar -C $RESTORE_WORKSPACE_DIR/.`;
    if ($err =~ /No such file/) {
	my $err = `tar xf $ARCHIVE_BASE_DIR/admin/$restore.tar -C $RESTORE_WORKSPACE_DIR/.`;
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
    my %hash_coll;
    my $hash_coll;
    my $archive;
    if (defined($restore_target) && $restore_target ne '') {
	my @archive = split(',',$restore_target);
	my $i = 0;
	for $archive (@archive) {
	    my $bu;
	    my @bu = split(':',$archive);
	    if ($bu[1] eq 'data') {
		$hash_coll{$bu[0]} != 1;
	    }
	    elsif ($bu[1] eq 'config') {
		$hash_coll{$bu[0]} |= 2;
	    }
	}
    }
    else {
	#not currently used by the restore cmd
	#instead use the xml file to fill out hash_coll...
	my $metafile = $BACKUP_WORKSPACE_DIR."/".$restore;

	my @output = `tar -xf $metafile -O ./$restore_target.txt 2>/dev/null`;
	my $text = join("",@output);
	my $opt = XMLin($text);
	#now parse the rest code
	
	#now something like for each instance
	$hash_coll{ $opt->{archive}->{contents}->{vm} } = $opt->{archive}->{contents}->{type};
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

	my $ip = '';
	my $ip = $vm->getIP();
	my $port = $vm->getWuiPort();
	if (defined $ip && $ip ne '') {
	    my $resp = `openssl enc -aes-256-cbc -d -salt -pass file:$MAC_ADDR -in $RESTORE_WORKSPACE_DIR/$key.enc -out /var/www/backup/restore/$key`;
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
	    $cmd .= "&file=http://192.168.0.101/backup/restore/$key";
	    my $obj = new OpenApp::Rest();
	    my $err = $obj->send("PUT",$cmd);
	    if ($err->{_success} != 0 || $err->{_http_code} == 500 || $err->{_http_code} == 501) {
		`logger 'Rest notification error in response from $ip when starting restore: $err->{_http_code}'`;
	    }
	}
    }

    ##########################################################################
    #
    # now poll for response from VM in restore process. just looking for 200
    # success. updating status based on number of finished archive units. 
    # continue until all are done or chunker kills me.
    #
    ##########################################################################
#    my $progress_ct = 0;
#    `echo '0' > $RESTORE_WORKSPACE_DIR/status`;
    #now that each are started, let's sequentially iterate through and retrieve
#    while ($#new_coll > -1) {
#	foreach $i (0..$#new_coll) {
#	    my $vm = new OpenApp::VMMgmt($new_coll[$i][0]);
#	    next if (!defined($vm));
#	    my $ip = '';
#	    $ip = $vm->getIP();
#	    if (defined $ip && $ip ne '') {
#		my $cmd = "http://$ip/archive/restore/$new_coll[$i][1]/status/";
#		#writes to specific location on disk
#		my $rc = `curl -X GET -q -I $cmd 2>&1`;
#		if ($rc =~ /200 OK/) {
#		    print "SUCCESS\n";
#		    #remove from new_collection
#		    $progress_ct = $progress_ct + 1;
#		    #when done write
#		    my $progress = 100;
#		    if ($coll_ct != 0) {
#			$progress = (100 * $progress_ct) / $coll_ct;
#		    }
#		    `echo '$progress' > $RESTORE_WORKSPACE_DIR/status`;
#		    delete $new_coll[$i];
#		}
#	    }
#	}
#	sleep 1;

	#what is a reasonable time to kick out of this command?
	#let's kick out of this command after 1/2 hour--which should be done by the chunker
#    }

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
    `cp /var/www/archive/$OA_SESSION_ID/$put_archive.tar $ARCHIVE_ROOT_DIR/.`;
    `rm -fr /var/www/archive/$OA_SESSION_ID/*`;
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
    "backup-get:s"          => \$backup_get,
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
