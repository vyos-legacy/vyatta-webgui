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

sub filter_get {
    my $msg = '';
    $msg = "<form name='url-filtering-easy-config' code=0";
    $msg .= "<url-filtering-easy-config>";
    my $config = new Vyatta::Config; 
    my $path = 'service webproxy url-filtering squidguard';
    $config->setLevel("$path group-policy OA");
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
    my @block_cats = $config->returnOrigValues('block-category');
    if (scalar(@block_cats) > 0) {
	my %cat_hash = map { $_ => 1} @block_cats;
	my $level = undef;
	if ($cat_hash{'blog'}) {
	    $level = 'strict';
	} elsif ($cat_hash{'audio-video'}) {
	    $level = 'productivity';
	} elsif ($cat_hash{'adult'}) {
	    $level = 'legal';
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

sub filter_set {
    my ($data) = @_;
    print "filter_set [$data]\n";
}

sub whitelist_get {
    print "whitelist_get\n";
}

sub whitelist_set {
    my ($data) = @_;
    print "whitelist_set [$data]\n";
}

sub keyword_get {
    print "keyword_get\n";
}

sub keyword_set {
    my ($data) = @_;
    print "keyword_set [$data]\n";
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
die "Error: no data"              if $oper eq 'set' and ! $data;

my $do = $dispatcher{"$mode\_$oper"};

die "Error: undefined dispatcher" if ! defined $do;

# make it so ...
my $rc = $do->($data);

exit $rc;

# end of file
