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

my ($set,$get,$disable,$delete);



##########################################################################
#
# hash_code
#
##########################################################################
sub hash_code {
    my $hash = 0;
    use integer;
    foreach(split //,shift) {
	$hash = 31*$hash+ord($_);
    }
    return $hash;
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
	print ("<form name='' code=1></form>");
	exit 1;
    }
    my $xs = new XML::Simple(forcearray=>1);
    my $opt = $xs->XMLin($s);
    my $peerip = $opt->{"peerip"}->[0];
    my $tunnelname = $opt->{"tunnelname"}->[0];
    my $disable = $opt->{"disable"}->[0];

    if (!defined $peerip || !defined $tunnelname || !$disable) {
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
    my $thash = hash_code($tunnelname);

    my $cmd;
    if ($disable eq 'true') {
	$cmd = "/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $thash disable"
    }
    else {
	$cmd = "/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete vpn ipsec site-to-site peer $peerip tunnel $thash disable"
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
	print ("<form name='' code=1></form>");
	exit 1;
    }
    my $xs = new XML::Simple(forcearray=>1);
    my $opt = $xs->XMLin($s);
    my $peerip = $opt->{"peerip"}->[0];
    my $tunnelname = $opt->{"tunnelname"}->[0];

    if (!defined $peerip || !defined $tunnelname) {
	print ("<form name='disable' code=1></form>");
    }

    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	print("<form name='delete' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    my $thash = hash_code($tunnelname);

    my $cmd = "/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete vpn ipsec site-to-site peer $peerip tunnel $thash disable";

    $err = system($cmd);
    if ($err != 0) {
	print("<form name='delete' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

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




    my $h = hash_code($tunnelname);

    # set up config session
    my $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group esp_expert_$h proposal 1 encryption $espencrypt");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec esp-group esp_expert_$h proposal 1 hash $espauth");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group ike_expert_$h proposal 1 encryption $ikeencrypt");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group ike_expert_$h proposal 1 hash $ikeauth");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec ike-group ike_expert_$h proposal 1 dh-group $dhgroup");
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
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip ike-group ike_expert_$h");
    if ($err != 0) {
	print("<form name='expert' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h esp-group esp_expert_$h");
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
    my $h = hash_code($tunnelname);
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
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip ike-group ike_easy");
    if ($err != 0) {
	print("<form name='easy' code=2></form>");
	system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end");
	exit 1;
    }

    # apply config command
    $err = system("/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set vpn ipsec site-to-site peer $peerip tunnel $h esp-group esp_easy");
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

    #these are used to grab a specific instance.
    my ($s) = @_;
    $s =~ s/^\s+//;
    #let's use the xmlin parser here to handle this.
    if (defined $s && $s ne '') {
	my $xs = new XML::Simple(forcearray=>1);
	my $opt = $xs->XMLin($s);
	my $peerip = $opt->{"peerip"}->[0];
	my $tunnelname = $opt->{"tunnelname"}->[0];
    }

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
		print "<site-to-site><$type>$tmp</$type><status>tbd</status></site-to-site>";
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
	elsif ($v eq 'disable') {
	    $tmp .= "<disable/>";
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
    print "       $0 --delete <key>peer</key><tunnelname>name</tunnelname>\n";
    print "       $0 --disable <key>peer</key><tunnelname>name</tunnelname><disable>true|false</disable>\n";
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
    execute_disable($delete);
}
else {
    execute_get($get);
}
exit 0;
