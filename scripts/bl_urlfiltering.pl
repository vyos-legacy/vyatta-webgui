#!/usr/bin/perl
#
# Module: bl_urlfiltering.pl
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
# Portions created by Vyatta are Copyright (C) 2009 Vyatta, Inc.
# All Rights Reserved.
#
# Author: Stig Thormodsrud
# Date: May 2009
# Description: backend<->frontend url filtering "buisness logic"
#
# **** End License ****
#

use lib "/opt/vyatta/share/perl5";
use warnings;
use strict;
use Switch;
use Getopt::Long;
use Vyatta::Config;
use OpenApp::Conf;
use XML::Simple;
use Data::Dumper;

my %dispatcher = (
    'filter_get'     => \&filter_get,
    'filter_set'     => \&filter_set,
    'whitelist_get'  => \&whitelist_get,
    'whitelist_set'  => \&whitelist_set,
    'keyword_get'    => \&keyword_get,
    'keyword_set'    => \&keyword_set,
);

my %days_hash = (
    'Sun'      => 's',
    'Mon'      => 'm',
    'Tue'      => 't',
    'Wed'      => 'w',
    'Thu'      => 'h',
    'Fri'      => 'f',
    'Sat'      => 'a',
);

my @cat_levels = ('strict', 'productivity', 'legal');

my @level_legal = qw(adult agressif dangerous_material drogue gambling hacking
phishing warez mixed_adult sexual_education sect malware);

my @level_productivity = qw(audio-video financial publicite radio tricheur 
games filehosting shopping dating marketingware astrology celebrity manga);
push @level_productivity, @level_legal;

my @level_strict = qw(blog cleaning forums redirector strict_redirector 
strong_redirector webmail reaffected child);
push @level_strict, @level_productivity;


sub filter_get {
    my $msg = '';
    $msg  = "<form name='url-filtering-easy-config' code='0'>";
    $msg .= "<url-filtering-easy-config>";
    my $config = new Vyatta::Config; 
    my $path = 'service webproxy url-filtering squidguard';
    $config->setLevel("$path group-policy NONE");
    $msg .= "<policy>";
    # check whitelist
    if ($config->existsOrig('local-ok')) {
	$msg .= "<whitelist status=\"true\"></whitelist>";
    } 

    # check keyword
    if ($config->existsOrig('local-block-keyword')) {
	$msg .= "<keyword status=\"true\"></keyword>";
    } 

    # check blacklist
    my @block_cats = $config->returnOrigValues('local-block-ok');
    if (scalar(@block_cats) > 0) {
	my %level_hash = map { $_ => 1} @cat_levels;
	my $level = undef;
	foreach my $cat (@block_cats) {
	    if ($level_hash{$cat}) {
		$level = $cat;
		last;
	    }
	}
	if ($level) {
	    $msg .= "<blacklist status=\"true\">";
	    $msg .= "<$level>true</$level>";
	    $msg .= "</blacklist>";
	}
    }
    $msg .= "</policy>";

    # check schedule
    $msg .= "<schedule>";
    $config->setLevel("$path time-period OA days");
    my @days = $config->listOrigNodes();
    if (scalar(@days) > 0) {
	foreach my $day (@days) {
	    if ($days_hash{$day}) {
		$config->setLevel("$path time-period OA days $day");
		my $times = $config->returnOrigValue('time');	
		if ($times) {
		    $msg .= "<$days_hash{$day}>$times</$days_hash{$day}>";
		}
	    }
	}
    }
    $msg .= "</schedule>";
    # footer
    $msg .= "</url-filtering-easy-config>";
    $msg .= "</form>";
    print $msg;
}

sub is_webproxy_configured {
    my $config = new Vyatta::Config; 
    my $path   = 'service webproxy url-filtering';
    if ($config->existsOrig('squidguard')) {   
	return 1;
    } 
    return;
}

sub configure_webproxy {
    my (@cmds, $path);

    $path = 'service webproxy url-filtering squidguard';

    push @cmds, "set service webproxy listen-address 127.0.0.1";
    push @cmds, "set service webproxy cache-size 0";
    push @cmds, "set $path source-group ALL address 0.0.0.0/0";
    push @cmds, "set $path source-group NONE address 255.255.255.255";
    push @cmds, "set $path group-policy OA source-group ALL";
    push @cmds, "set $path group-policy NONE source-group NONE";
    return @cmds;
}

sub get_blacklist_categories {
    my ($level) = @_;
    
    my @blocks = ();
    switch ($level) {
	case 'strict'       { @blocks = @level_strict; }
	case 'productivity' { @blocks = @level_productivity; }
	case 'legal'        { @blocks = @level_legal; }
    }
    my @cmds = ();
    my $path = 'service webproxy url-filtering squidguard group-policy OA';
    foreach my $block (@blocks) {
	push @cmds, "set $path block-category $block";
    }
    return @cmds;
}

sub filter_set {
    my ($data) = @_;
    
    my $xs  = new XML::Simple;
    my $xml = $xs->XMLin($data);
    my $whitelist = $xml->{policy}->{whitelist}->{status};
    my $blacklist = $xml->{policy}->{blacklist}->{status};
    my $keyword   = $xml->{policy}->{keyword}->{status};
    my $category;
    if ($blacklist and $blacklist eq 'true') {
	foreach my $cat (@cat_levels) {
	    my $x = $xml->{policy}->{blacklist}->{$cat};
	    if ($x and $x eq 'true') {
		$category = $cat;
		last;
	    }
	}
	if (! defined $category) {
	    my $msg = "<form name='url-filtering-easy-config' code='1'>";
	    $msg   .= "<key>blacklist<key>";
	    $msg   .= "<errmsg>Invalid block category</errmsg>";
	    $msg   .= "</form>";
	    print $msg;
	    return 1;
	}
    }
    
    my @cmds = ();
    if (!is_webproxy_configured) {
	@cmds = configure_webproxy();
    }

    my $path = 'service webproxy url-filtering squidguard';

    if ($whitelist and $whitelist eq 'true') {
	push @cmds, "set $path group-policy NONE local-ok OA";
    }
    if ($keyword and $keyword eq 'true') {
	push @cmds, "set $path group-policy NONE local-block-keyword OA";
    }
    if ($blacklist and $blacklist eq 'true') {
	push @cmds, "set $path group-policy NONE local-block $category";
	push @cmds, get_blacklist_categories($category);
    }

    # get time schedule
    my $time_period = undef;
    while (my ($k, $v) = each(%days_hash)) {
	my $day_time = $xml->{schedule}->{$v};
	if ($day_time) {
	    $time_period = "OA";
	    push @cmds, "set $path time-period OA days $k time \"$day_time\"";
	}
    }
    if ($time_period) {
	push @cmds, "set $path group-policy OA time-period OA";
    }
    
    push @cmds, ('commit', 'save');
    my $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
	my $msg = "<form name='url-filtering-easy-config' code='1'>";
	$msg   .= "<key>execute</key><errmsg>$err</errmsg></form>";
	print $msg;
	exit 1;
    }
    my $msg  = "<form name='url-filtering-easy-config' code='0'>";
    print $msg;
}

sub whitelist_get {
    my $msg = '';
    $msg  = "<form name='white-list-easy-config' code='0'>";
    my $config = new Vyatta::Config; 
    my $path   = 'service webproxy url-filtering squidguard';
    $config->setLevel("$path group-policy OA local-ok");
    $msg .= "<white-list-easy-config>";
    # get whitelist
    my @local_ok_sites = $config->returnOrigValues();
    foreach my $site (@local_ok_sites) {
	$msg .= "<url>$site</url>";
    }
    $msg .= "</white-list-easy-config>";
    $msg .= "</form>";
    print $msg;
}

sub whitelist_set {
    my ($data) = @_;

    my $xs  = new XML::Simple;
    my $xml = $xs->XMLin($data);
    my @cmds = ();
    my $i = 0;
    my $path   = 'service webproxy url-filtering squidguard group-policy OA';
    while ($i < 100) {
	my $whitelist = $xml->{url}[$i]->{content};
	my $action    = $xml->{url}[$i]->{action};
	if ($whitelist and $action) {
	    if ($action eq 'add') {
		push @cmds, "set $path local-ok \"$whitelist\" ";
	    } else {
		push @cmds, "delete $path local-ok \"$whitelist\" ";
	    }
	} else {
	    last;
	}
	$i++;
    }

    push @cmds, ('commit', 'save');
    my $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
	my $msg = "<form name='white-list-easy-config' code='1'>";
	$msg   .= "<key>execute</key><errmsg>$err</errmsg></form>";
	print $msg;
	exit 1;
    }
    my $msg  = "<form name='white-list-easy-config' code='0'></form>";
    print $msg;
}

sub keyword_get {
    my $msg = '';
    $msg  = "<form name='banned-list-easy-config' code='0'>";
    $msg .= "<banned-list-easy-config>";
    my $config = new Vyatta::Config; 
    my $path = 'service webproxy url-filtering squidguard';
    $config->setLevel("$path group-policy OA local-block-keyword");
    $msg .= "<banned-list-easy-config>";
    # get blocked keyword/regex
    my @block_keywords = $config->returnOrigValues();
    foreach my $keyword (@block_keywords) {
	$msg .= "<keyword>$keyword</keyword>";
    }
    $msg .= "</bannned-list-easy-config>";
    $msg .= "</form>";
    print $msg;
}

sub keyword_set {
    my ($data) = @_;
    print "keyword_set [$data]";
}

#
# main
#
my ($mode, $oper, $data);
GetOptions("mode=s"    => \$mode,
	   "oper=s"    => \$oper,
	   "data=s"    => \$data,
);

die "Error: undefined mode"       if ! defined $mode;
die "Error: undefined operation"  if ! defined $oper;
die "Error: undefined data"       if $oper eq 'set' and ! $data;

my $do = $dispatcher{"$mode\_$oper"};

die "Error: undefined dispatcher" if ! defined $do;

# make it so ...
my $rc = $do->($data);

exit $rc;

# end of file
