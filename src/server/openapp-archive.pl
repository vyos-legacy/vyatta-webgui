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

use lib "/opt/vyatta/share/perl5/";

use warnings;
use strict;
use POSIX;
use File::Copy;
use Getopt::Long;

my ($backup,$restore,$list,$delete);

#
# Run through the list of VM's and
# sequentially perform backup
#
sub backup_archive {
    #get list of VMs from argument list 
    #the format is: vmkey:type,vmkey:type...
    my $archive;
    my @archive = split(',',$backup);
    for $archive (@archive) {
	#have a vm:type pair right now
	my @bu = split(':',$archive);
	
	#now look up vm
	#my $ip = getVMIP($bu[0]);
	#my $cmd = "PUT /archive/backup/$bu[1]"
	#post command
	

	#on receiving data start writing out to file and return filename
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
