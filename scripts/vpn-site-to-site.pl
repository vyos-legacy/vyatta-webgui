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
# Date: August 2009
# Description: Script to support vpn configuration on the utm
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
use Vyatta::Misc;

my ($set,$get,$disable,$delete);

#NOTE: need to run a collision detection on newly added configurations.

##########################################################################
#
# hash_code
#
##########################################################################
sub hash_code {
    #base code off of peer ip since there is a one to one mapping between 
    #tunnel and peer ip.

    #convert ipv4 to u32
    my ($ip_address) = @_;
    my @octets = split(/\./, $ip_address);
    return ($octets[0]*1<<24)+($octets[1]*1<<16)+($octets[2]*1<<8)+($octets[3]);
}

##########################################################################
#
# tunnel status
#
##########################################################################
sub get_status {
    my ($peerip) = @_;
    my $out = `/opt/vyatta/sbin/vyatta-output-config.pl run show vpn ipsec sa`;
    my $ct = 0;
    my $v;
    my @values = split(' ', $out);
    for $v (@values) {
	if ($v eq $peerip) {
	    if ($values[$ct+3] ne 'n/a') {
		return "up";
	    }
	    $ct++;
	}
    }
    return "down";
}

##########################################################################
#
# tunnel_exists
#
##########################################################################
sub tunnel_exists {
    my ($p,$t) = @_;
    my $h = hash_code($p);
    my $out = `/opt/vyatta/sbin/vyatta-output-config.pl vpn ipsec site-to-site peer $p`;
    my @values = split(' ', $out);
    my $v;
    my @v;
    my $ct = 0;
    for $v (@values) {
	$ct++;
	if ($v eq 'tunnel' && $values[$ct] ne $h) {
	    return "true";
	}
    }
    return "false";
}

##########################################################################
#
# get_tunnel_count
#
##########################################################################
sub get_tunnel_count {
    my ($p) = @_;
    my $ct = 0;
    my $config = get();
    if (!defined $config) {
	return $ct;
    }
    #let's use the xmlin parser here to handle this.
    my $xs = new XML::Simple(forcearray=>1);
    my $opt = $xs->XMLin($config);
    my $peerip = $opt->{"peerip"};
    for (my $i = 0; $i < @$peerip; $i++) {
	if ($opt->{"peerip"}->[0] eq $p) {
	    $ct++;
	}
    }
    return $ct;
}

##########################################################################
#
# get_current_peer
#
##########################################################################
sub get_current_peer {
    my ($h) = @_;
    my $config = get($h);
    if (!defined $config || $config eq '') {
	return;
    }
    #let's use the xmlin parser here to handle this.
    my $xs = new XML::Simple(forcearray=>1);
    my $opt = $xs->XMLin($config);
    return $opt->{"peerip"}->[0];
}

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
# execute_disable
#
##########################################################################
sub execute_disable {
    my ($s) = @_;
    #let's use the xmlin parser here to handle this.
    $s =~ s/^\s+//;

    if (!defined $s) {
	print ("<form name='disable' code=1></form>");
	exit 1;
    }
    my $xs = new XML::Simple(forcearray=>1);
    my $opt = $xs->XMLin($s);
    my $peerip = $opt->{"peerip"}->[0];
    my $disable = $opt->{"disable"}->[0];

    if (!defined $peerip || !$disable) {
	print ("<form name='disable' code=1></form>");
    }

    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	print("<form name='disable' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    my $h = hash_code($peerip);

    #now find the peerip for this tunnel, if different delete current configuration
    my $peerip = get_current_peer($h);
    if ($peerip eq '') {
	print ("<form name='disable' code=1></form>");
	exit 1;
    }


    my $cmd;
    if ($disable eq 'true') {
	$cmd = "/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h disable"
    }
    else {
	$cmd = "/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete vpn ipsec site-to-site peer $peerip tunnel $h disable"
    }
    $err = system($cmd);
    if ($err != 0) {
	print("<form name='disable' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    if ($err != 0) {
	print("<form name='disable' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit");
    if ($err != 0) {
	print("<form name='disable' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # set up config session
    system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");

}


##########################################################################
#
# execute_delete
#
##########################################################################
sub execute_delete {
    my ($s) = @_;
    #let's use the xmlin parser here to handle this.
    $s =~ s/^\s+//;

    if (!defined $s) {
	print ("<form name='delete' code=1></form>");
	exit 1;
    }
    my $xs = new XML::Simple(forcearray=>1);
    my $opt = $xs->XMLin($s);
    my $peerip = $opt->{"peerip"}->[0];

    if (!defined $peerip) {
	print ("<form name='delete' code=1></form>");
	exit 1;
    }
    del($peerip);
}

##########################################################################
#
# del
#
##########################################################################
sub del {
    my ($peerip) = @_;
    my $h = hash_code($peerip);

    #now find the peerip for this tunnel, if different delete current configuration
    my $peerip = get_current_peer($h);
    if ($peerip eq '') {
	print ("<form name='delete' code=1></form>");
	exit 1;
    }

    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	print("<form name='delete' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    my $cmd;

    #NEED TO REMOVE THE PEER IF THIS IS THE LAST ENTRY...
    my $ct = get_tunnel_count($peerip);
    if ($ct > 1) {
	$cmd = "/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete vpn ipsec site-to-site peer $peerip tunnel $h";	
    }
    else {
	$cmd = "/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete vpn ipsec site-to-site peer $peerip";
    }
    $err = system($cmd);
    if ($err != 0) {
	print("<form name='delete' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    #NEED TO DELETE AND COMMIT THIS FIRST
    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit");
    if ($err != 0) {
	print("<form name='delete' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # set up config session
    system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");

    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	print("<form name='delete' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    $cmd = "/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete vpn ipsec ike-group ike_$h";
    $err = system($cmd);
    if ($err != 0) {
	print("<form name='delete' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    $cmd = "/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete vpn ipsec esp-group esp_$h";
    $err = system($cmd);
    if ($err != 0) {
	print("<form name='delete' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit");
    if ($err != 0) {
	print("<form name='delete' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # set up config session
    system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");

}

##########################################################################
#
# execute_set_expert
#
##########################################################################
sub execute_set_expert {
    my ($opt) = @_;

    my $peerip = $opt->{peerip}->[0];
    my $presharedkey = $opt->{presharedkey}->[0];
    my $tunnelname = $opt->{tunnelname}->[0];
    my $lnet = $opt->{lnet}->[0];
    my $rnet = $opt->{rnet}->[0];
    my $type = $opt->{type}->[0];
    my $emode = $opt->{emode}->[0];
    my $ikeencrypt = $opt->{ikeencrypt}->[0];
    my $espencrypt = $opt->{espencrypt}->[0];
    my $dhgroup = $opt->{dhgroup}->[0];
    my $ikeltime = $opt->{ikeltime}->[0];
    my $espltime = $opt->{espltime}->[0];
    my $ikeauth = $opt->{ikeauth}->[0];
    my $espauth = $opt->{espauth}->[0];

    my $err_str = '';
    if (!defined $tunnelname) {
	$err_str .= "<key>tunnelname</key>";
    }
    if (!defined $peerip) {
	$err_str .= "<key>peerip</key>";
    }
    if (!defined $presharedkey) {
	$err_str .= "<key>presharedkey</key>";
    }
    if (!defined $lnet) {
	$err_str .= "<key>lnet</key>";
    }
    if (!defined $rnet) {
	$err_str .= "<key>rnet</key>";
    }
    if (!defined $type) {
	$err_str .= "<key>type</key>";
    }
    if (!defined $emode) {
	$err_str .= "<key>emode</key>";
    }
    if (!defined $ikeencrypt && ($ikeencrypt ne '3des' || $ikeencrypt ne 'aes128' || $ikeencrypt ne 'aes256')) {
	$err_str .= "<key>ikeencrypt</key>";
    }
    if (!defined $espencrypt && ($espencrypt ne '3des' || $espencrypt ne 'aes128' || $espencrypt ne 'aes256')) {
	$err_str .= "<key>espencrypt</key>";
    }
    if (!defined $dhgroup && ($dhgroup ne '2' || $dhgroup ne '5')) {
	$err_str = "<key>dhgroup</key>";
    }
    if (!defined $ikeltime) {
	$err_str .= "<key>ikeltime</key>";
    }
    if (!defined $espltime) {
	$err_str .= "<key>espltime</key>";
    }
    if (!defined $ikeauth && ($ikeauth ne 'md5' || $ikeauth ne 'sha1')) {
	$err_str .= "<key>ikeauth</key>";
    }
    if (!defined $espauth && ($espauth ne 'md5' || $espauth ne 'sha1')) {
	$err_str .= "<key>espauth</key>";
    }

    if ($err_str ne '') {
	print ("<form name='expert' code=1>");
	print $err_str;
	print ("</form>");
	exit 1;
    }

    #now check if peerip exists with a different tunnel name, then reject
    if (tunnel_exists($peerip,$tunnelname) eq "true") {
	print ("<form name='expert' code=3>");
	print ("</form>");
	exit 1;
    }

    my $h = hash_code($peerip);

    #now find the peerip for this tunnel, if different delete current configuration
    my $cur_peerip = get_current_peer($h);
    if ($cur_peerip ne $peerip) {
	del($cur_peerip);
    }

    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group esp_$h proposal 1 encryption $espencrypt");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group esp_$h proposal 1 hash $espauth");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group esp_$h lifetime $espltime");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group esp_$h proposal 1 hash $espauth");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group ike_$h proposal 1 encryption $ikeencrypt");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group ike_$h proposal 1 dh-group $dhgroup");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group ike_$h lifetime $ikeltime");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip authentication mode $ikeauth");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h");
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
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h local-subnet $lnet");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h remote-subnet $rnet");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip ike-group ike_$h");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h esp-group esp_$h");
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
    
    my @foo = Vyatta::Misc::getIP("eth0");
    my @l_ip = split("/",$foo[0]);
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip local-ip $l_ip[0]");
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
# execute_set_easy
#
##########################################################################
sub execute_set_easy {
    my ($opt) = @_;

    my $peerip = $opt->{peerip}->[0];
    my $presharedkey = $opt->{presharedkey}->[0];
    my $tunnelname = $opt->{tunnelname}->[0];
    my $lnet = $opt->{lnet}->[0];
    my $rnet = $opt->{rnet}->[0];

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

    #now check if peerip exists with a different tunnel name, then reject
    if (tunnel_exists($peerip,$tunnelname) eq "true") {
	print ("<form name='easy' code=3>");
	print ("</form>");
	exit 1;
    }

    my $h = hash_code($peerip);

    #now find the peerip for this tunnel, if different delete current configuration
    my $cur_peerip = get_current_peer($h);
    if (defined($cur_peerip) && $cur_peerip ne '' && $cur_peerip ne $peerip) {
	del($cur_peerip);
    }



    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group esp_$h proposal 1");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group ike_$h proposal 1");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h");
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
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h local-subnet $lnet");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h remote-subnet $rnet");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }


    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip ike-group ike_$h");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h esp-group esp_$h");
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
    my @foo = Vyatta::Misc::getIP("eth0");
    my @l_ip = split("/",$foo[0]);
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip local-ip $l_ip[0]");
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

    #these are used to grab a specific instance.
    my ($s) = @_;
    $s =~ s/^\s+//;
    #let's use the xmlin parser here to handle this.
    if (defined $s && $s ne '') {
	my $xs = new XML::Simple(forcearray=>1);
	my $opt = $xs->XMLin($s);
	my $peerip = $opt->{"peerip"}->[0];
	return get($peerip);
    }
    return get();
}

##########################################################################
#
# get
#
##########################################################################
sub get {
    my ($peerip_filt) = @_;

    my $out = `/opt/vyatta/sbin/vyatta-output-config.pl vpn ipsec site-to-site`;
    my @values = split(' ', $out);
    my $v;
    my @v;
    my $ct = 0;
    my $tmp;
    my $peerip;
    my $ret;
    my $type = "easy";
    for $v (@values) {
	$ct++;
	if ($v eq 'peer') {
	    if ($tmp ne '') {
		my $status = get_status($peerip);
		$ret .= "<site-to-site><$type/>$tmp<status>$status</status></site-to-site>";
		$tmp = "";
	    }
	    $peerip = $values[$ct];
	    $tmp .= "<peerip>$peerip</peerip>";
	}
	elsif ($v eq 'description') {
	    #let's overload this with the form type as well (easy|expert)
	    my $desc = $values[$ct];
	    my @tmp2 = split(':', $desc);
	    if ($tmp2[1] ne '' && ($tmp2[1] eq 'easy' || $tmp2[1] eq 'expert')) {
		$type = $tmp2[1];
	    }
	    $tmp .= "<tunnelname>$tmp2[0]</tunnelname>";
	    if ($tmp2[1] eq 'expert') {
		$tmp .= get_expert_params($peerip);
	    }
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
	elsif ($v eq 'disable') {
	    $tmp .= "<disable/>";
	}
    }

    #let's catch the last one here
    if ($tmp ne '') {
	my $status = get_status($peerip);
	$ret .= "<site-to-site><$type/>$tmp<status>$status</status></site-to-site>";
    }
    return $ret;
}

##########################################################################
#
# get_expert_params
#
##########################################################################
sub get_expert_params {
    my ($peerip) = @_;
    my $h = get_hash_code($peerip);

    #grab the additional details out of the ike/esp configuration areas
    my $out = `/opt/vyatta/sbin/vyatta-output-config.pl vpn ipsec ike-group ike_$h`;
    my @values = split(' ', $out);
    my $v;
    my @v;
    my $ct = 0;
    my $tmp;
    for $v (@values) {
	$ct++;
	if ($v eq "dh-group") {
	    $tmp .= "<dh-group>$values[$ct]</dh-group>";
	}
	elsif ($v eq "encryption") {
	    $tmp .= "<ikeencrypt>$values[$ct]</ikencrypt>";
	}
	elsif ($v eq "agressive-mode") {
	    $tmp .= "<emode>$values[$ct]</emode>";
	}
	elsif ($v eq "lifetime") {
	    $tmp .= "<ikeltime>$values[$ct]</ikeltime>";
	}
    }

    #grab the additional details out of the ike/esp configuration areas
    $out = `/opt/vyatta/sbin/vyatta-output-config.pl vpn ipsec esp-group esp_$h`;
    @values = split(' ', $out);
    $ct = 0;
    for $v (@values) {
	if ($v eq "lifetime") {
	    $tmp .= "<espltime>$values[$ct]</espltime>";
	}
	elsif ($v eq "encryption") {
	    $tmp .= "<espencrypt>$values[$ct]</espencrypt>";
	}
	elsif ($v eq "hash") {
	    $tmp .= "<espauth>$values[$ct]</espauth>";
	}
	$ct++;
    }
    return $tmp;
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
    print "       $0 --get <tunnelname>name</tunnelname>\n";
    print "       $0 --delete <tunnelname>name</tunnelname>\n";
    print "       $0 --disable <tunnelname>name</tunnelname><disable>true|false</disable>\n";
    exit 0;
}

#pull commands and call command
GetOptions(
    "set=s"                => \$set,
    "get:s"                => \$get,
    "delete=s"             => \$delete,
    "disable=s"            => \$disable,
    ) or usage();

if (defined $set ) {
    execute_set($set);
}
elsif (defined $disable) {
    execute_disable($disable);
}
elsif (defined $delete) {
    execute_delete($delete);
}
else {
    my $out = execute_get($get);
    print $out;
}
exit 0;
