#!/usr/bin/perl
#
# Module: site-to-site-easy.pl
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
# Date: April 2009
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

my ($set,$get);


##########################################################################
#
# execute_set
#
##########################################################################
sub execute_set {
    my ($tunnelname,$peerip,$presharedkey,$lnet,$rnet);

    #parse the key value pairs
    my $pair;
    my @pair = split(",",$set);
    my $p;
    for $p (@pair) {
	my @vals = split(":",$p);
	if ($vals[0] eq 'tunnelname') {
	    $tunnelname = $vals[1];
	}
	elsif ($vals[0] eq 'peerip') {
	    $peerip = $vals[1];
	}
	elsif ($vals[0] eq 'presharedkey') {
	    $presharedkey = $vals[1];
	}
	elsif ($vals[0] eq 'lnet') {
	    $lnet = $vals[1];
	}
	elsif ($vals[0] eq 'rnet') {
	    $rnet = $vals[1];
	}
    }

    if (!defined $tunnelname || !defined $peerip || !defined $presharedkey || !defined $lnet || !defined $rnet) {
	print ("<form name='site-to-site-easy' code=1>");
	if (!defined $tunnelname) {
	    print("<key>tunnelname</key>");
	}
	if (!defined $peerip) {
	    print ("<key>peerip</key>");
	}
	if (!defined $presharedkey) {
	    print ("<key>presharedkey</key>");
	}
	if (!defined $lnet) {
	    print ("<key>lnet</key>");
	}
	if (!defined $rnet) {
	    print ("<key>rnet</key>");
	}
	print ("</form>");
	exit 1;
    }

    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group utm proposal 1");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group utm proposal 1");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $tunnelname");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip authentication pre-shared-secret $presharedkey");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $tunnelname local-subnet $lnet");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $tunnelname remote-subnet $rnet");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip ike-group utm");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $tunnelname esp-group utm");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    #now hack to get the configuration to commit--will need additional attention
    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ipsec-interfaces interface eth0");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip local-ip 192.168.0.1");
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # commit
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit"); 
    if ($err != 0) {
	print("<form name='site-to-site-easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
   
}

##########################################################################
#
# execute_get
#
##########################################################################
sub execute_get {
    #pull these values from the configuration
    my @values;
    my $out;
    $out = `/opt/vyatta/sbin/vyatta-output-config.pl vpn ipsec site-to-site`;
    @values = split(' ', $out);
    my $v;
    my @v;
    my $ct = 0;
    print "<site-to-site-easy>";
    for $v (@values) {
	$ct++;
	if ($v eq 'peer') {
	    print "<peerip>$values[$ct]</peerip>";
	}
	elsif ($v eq 'tunnel') {
	    print "<tunnelname>$values[$ct]</tunnelname>";
	}
	elsif ($v eq 'local-subnet') {
	    print "<lnet>$values[$ct]</lnet>";
	}
	elsif ($v eq 'remote-subnet') {
	    print "<rnet>$values[$ct]</rnet>";
	}
	elsif ($v eq 'pre-shared-secret') {
	    print "<presharedkey>$values[$ct]</presharedkey>";
	}
    }
    print "</site-to-site-easy>";
}

##########################################################################
#
# start of main
#
# Handles both easy and expert modes
#
##########################################################################
sub usage() {
    print "       $0 --set=<key:value,key:value...>\n";
    print "       $0 --get\n";
    exit 0;
}

#pull commands and call command
GetOptions(
    "set=s"              => \$set,
    "get"                => \$get,
    ) or usage();

if (defined $set ) {
    execute_set();
}
else {
    execute_get();
}
exit 0;
