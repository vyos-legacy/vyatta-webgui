#!/usr/bin/perl -w
#
# Module: vyatta-smtp.pl
# 
# This program is free software; you can redistribute it and/or modify it
# under the terms of the GNU General Public License version 2 as published
# by the Free Software Foundation.
# 
# **** End License ****
#
use lib "/opt/vyatta/share/perl5/";
use Vyatta::Config;
use Vyatta::Misc;
use Vyatta::TypeChecker;

use warnings;
use strict;
use POSIX;
use File::Copy;

sub write_smtp {
#open conf
    my $config = new Vyatta::Config;

    $config->setLevel("system open-app smtp client");
    my @children = $config->listNodes();

	
    my $option = $config->returnValue("address");
    if (defined $option) {
	print FILE_LCK "Mailhub=" . $option . "\n";
    }
    
    $option = $config->returnValue("email");
    if (defined $option) {
	print FILE_LCK "FromLineOverride=" . $option . "\n";
    }

    $option = $config->returnValue("username");
    if (defined $option && $option ne '') {
	$option =~ s/^\s+//;
	if (length($option) > 0)  {
	    print FILE_LCK "AuthUser=" . $option . "\n";
	}
    }
    
    $option = $config->returnValue("password");
    if (defined $option && $option ne '') {
	$option =~ s/^\s+//;
	if (length($option) > 0)  {
	    print FILE_LCK "AuthPass=" . $option . "\n";
	}
    }
    
    $option = $config->returnValue("name");
    if (defined $option) {
	print FILE_LCK "Hostname=" . $option . "\n";
    }
}



####main
my $conf_file = '/etc/ssmtp/ssmtp.conf';
my $conf_lck_file = '/etc/ssmtp/ssmtp.conf.lck';

#open file
open(FILE, "<$conf_file") or die "Can't open smtp config file"; 
open(FILE_LCK, "+>$conf_lck_file") or die "Can't open smtp lock file";

my $success = write_smtp();
if ($success eq "false") {
    exit 1;
}

close FILE;
close FILE_LCK;

copy ($conf_lck_file,$conf_file);
unlink($conf_lck_file);

exit 0;
