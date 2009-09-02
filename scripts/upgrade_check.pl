#!/usr/bin/perl -w
#
# Module: upgrade_check.pl
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

my @sched = `sudo atq`;


my %mon2num = qw(
  jan 1  feb 2  mar 3  apr 4  may 5  jun 6
  jul 7  aug 8  sep 9  oct 10 nov 11 dec 12
);

foreach my $sched (@sched) {
    my ($id,$day,$mon,$dom,$time,$year) = split(" ",$sched);

    #now get epoch and compare
    my $t = "$time $dom $mon $year";

    if (!($t =~ /^(\d+):(\d+):(\d+) (\d+) (\S+) (\d+)/)) {
	exit 0;
    }
    my ($h, $m, $s, $D, $M, $Y) = ($1, $2, $3, $4, $5, $6);

    my $mn = $mon2num{ lc substr($M, 0, 3) };

    $time = POSIX::strftime('%s', $s, $m, $h, $D, $mn-1, $Y - 1900);


    my $curtime = time;

    #let's wait for 5 minutes to pass first
    if ($time < ($curtime - 300)) {
	my @cmd = `sudo at -c $id`;
	foreach my $cmd (@cmd) {
	    if ($cmd =~ '/opt/vyatta/sbin/openapp-vm-upgrade.pl') {

#		print "will execute\n";
		`sudo atrm $id`;
		
		#reschedule for now!
		`echo '$cmd' | sudo at 'now' 2>&1 | grep -v warning`;		
	    }
	}
    }
}

exit 0;


