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
use XML::Simple;

my ($set,$get);


##########################################################################
#
# execute_set
#
##########################################################################
sub execute_set {
    my ($s) = @_;
    $s =~ s/^\s+//;

    if (!defined $s) {
	print ("<form name='' code=1></form>");
	exit 1;
    }
    #let's use the xmlin parser here to handle this.
    my $xs = new XML::Simple(forcearray=>1);
    my $opt = $xs->XMLin($s);
    #now parse the rest code
    if ( defined $opt->{"easy"}->[0] ) {
	execute_set_easy($opt);
    }
    elsif (defined $opt->{"expert"}->[0] ) {
	execute_set_expert($opt);
    }
    else {
	print ("<form name='' code=1></form>");
	exit 1;
    }
}

##########################################################################
#
# execute_set
#
##########################################################################
sub execute_set_expert {
    my ($opt) = @_;

    my $peerip = $opt->{expert}->[0]->{peerip}->[0];
    my $presharedkey = $opt->{expert}->[0]->{presharedkey}->[0];
    my $tunnelname = $opt->{expert}->[0]->{tunnelname}->[0];
    my $lnet = $opt->{expert}->[0]->{lnet}->[0];
    my $rnet = $opt->{expert}->[0]->{rnet}->[0];
    my $type = $opt->{expert}->[0]->{type}->[0];
    my $emode = $opt->{expert}->[0]->{emode}->[0];
    my $ikeencrypt = $opt->{expert}->[0]->{ikeencrypt}->[0];
    my $espencrypt = $opt->{expert}->[0]->{espencrypt}->[0];
    my $dhgroup = $opt->{expert}->[0]->{dhgroup}->[0];
    my $ikeltime = $opt->{expert}->[0]->{ikeltime}->[0];
    my $espltime = $opt->{expert}->[0]->{espltime}->[0];
    my $ikeauth = $opt->{expert}->[0]->{ikeauth}->[0];
    my $espauth = $opt->{expert}->[0]->{espauth}->[0];

    if (!defined $peerip ||
	!defined $presharedkey ||
	!defined $tunnelname ||
	!defined $lnet ||
	!defined $rnet ||
	!defined $type || 
	!defined $emode ||
	!defined $ikeencrypt ||
	!defined $espencrypt ||
	!defined $dhgroup ||
	!defined $ikeltime ||
	!defined $espltime ||
	!defined $ikeauth ||
	!defined $espauth) {
	print ("<form name='expert' code=1>");
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
	if (!defined $type) {
	    print ("<key>type</key>");
	}
	if (!defined $emode) {
	    print ("<key>emode</key>");
	}
	if (!defined $ikeencrypt) {
	    print ("<key>ikeencrypt</key>");
	}
	if (!defined $espencrypt) {
	    print ("<key>espencrypt</key>");
	}
	if (!defined $dhgroup) {
	    print ("<key>dhgroup</key>");
	}
	if (!defined $ikeltime) {
	    print ("<key>ikeltime</key>");
	}
	if (!defined $espltime) {
	    print ("<key>espltime</key>");
	}
	if (!defined $ikeauth) {
	    print ("<key>ikeauth</key>");
	}
	if (!defined $espauth) {
	    print ("<key>espauth</key>");
	}
	print ("</form>");
	exit 1;
    }

    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group esp_1 proposal 1");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group ike_1 proposal 1");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel 1");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip authentication pre-shared-secret $presharedkey");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel 1 local-subnet $lnet");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel 1 remote-subnet $rnet");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip ike-group ike_1");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel 1 esp-group esp_1");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    #now hack to get the configuration to commit--will need additional attention
    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ipsec-interfaces interface eth0");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip local-ip 192.168.0.1");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    my $tmp = "$tunnelname:expert";
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip description $tmp");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # commit
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit"); 
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
}

##########################################################################
#
# execute_set
#
##########################################################################
sub execute_set_easy {
    my ($opt) = @_;

    my $peerip = $opt->{easy}->[0]->{peerip}->[0];
    my $presharedkey = $opt->{easy}->[0]->{presharedkey}->[0];
    my $tunnelname = $opt->{easy}->[0]->{tunnelname}->[0];
    my $lnet = $opt->{easy}->[0]->{lnet}->[0];
    my $rnet = $opt->{easy}->[0]->{rnet}->[0];

    if (!defined $tunnelname || !defined $peerip || !defined $presharedkey || !defined $lnet || !defined $rnet) {
	print ("<form name='easy' code=1>");
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
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group esp_easy proposal 1");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group ike_easy proposal 1");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel 1");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip authentication pre-shared-secret $presharedkey");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel 1 local-subnet $lnet");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel 1 remote-subnet $rnet");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip ike-group ike_easy");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel 1 esp-group esp_easy");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    #now hack to get the configuration to commit--will need additional attention
    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ipsec-interfaces interface eth0");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip local-ip 192.168.0.1");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    my $tmp = "$tunnelname:easy";
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip description $tmp");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # commit
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit"); 
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
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
    my $tmp;
    my $type = "easy";
    for $v (@values) {
	$ct++;
	if ($v eq 'peer') {
	    if ($tmp ne '') {
		print "<site-to-site><$type>$tmp</$type></site-to-site>";
		$tmp = "";
	    }
	    $tmp .= "<peerip>$values[$ct]</peerip>";
	}
	elsif ($v eq 'description') {
	    #let's overload this with the form type as well (easy|expert)
	    my $desc = $values[$ct];
	    my @tmp2 = split(':', $desc);
	    if ($tmp2[1] ne '' && ($tmp2[1] eq 'easy' || $tmp2[1] eq 'expert')) {
		$type = $tmp2[1];
	    }
	    $tmp .= "<tunnelname>$tmp2[0]</tunnelname>";
	}
	elsif ($v eq 'local-subnet') {
	    $tmp.= "<lnet>$values[$ct]</lnet>";
	}
	elsif ($v eq 'remote-subnet') {
	    $tmp .= "<rnet>$values[$ct]</rnet>";
	}
	elsif ($v eq 'pre-shared-secret') {
	    $tmp .= "<presharedkey>$values[$ct]</presharedkey>";
	}
    }

    #let's catch the last one here
    if ($tmp ne '') {
	print "<site-to-site><$type>$tmp</$type></site-to-site>";
    }
}

##########################################################################
#
# start of main
#
# Handles both easy and expert modes
#
##########################################################################
sub usage() {
    print "       $0 --set <key>key</key><value>value</value><key>key</key><value>value</value>...>\n";
    print "       $0 --get [tunnelname]\n";
    exit 0;
}

#pull commands and call command
GetOptions(
    "set=s"                => \$set,
    "get:s"                => \$get,
    ) or usage();

if (defined $set ) {
    execute_set($set);
}
else {
    execute_get($get);
}
exit 0;
