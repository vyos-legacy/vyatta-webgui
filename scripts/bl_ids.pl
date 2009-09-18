#!/usr/bin/perl
#
# Module: bl_ids.pl
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
# Date: September 2009
# Description: backend<->frontend ids "buisness logic"
#
# **** End License ****
#

use lib "/opt/vyatta/share/perl5";
use warnings;
use strict;
use Getopt::Long;
use Vyatta::Config;
use OpenApp::Conf;
use XML::Simple;
use Data::Dumper;
use POSIX;

my %dispatcher = (
    'get'     => \&ids_get,
    'set'     => \&ids_set,
);

my $ids_log   = '/tmp/ids';
my $snort_pid = '/var/run/snort_inline.pid';

sub ids_log {
    my $timestamp = strftime("%Y%m%d-%H:%M.%S", localtime);
    open my $fh, '>>', $ids_log
	or die "Can't open $ids_log: $!";
    print $fh "$timestamp: ", @_ , "\n";
    close $fh;
}

sub is_snort_running {
    my $pidfile = $snort_pid;
    if (-f $pidfile) {
	my $pid = `cat $pidfile`;
	return 0 if ! defined($pid);
	$pid =~ s/\s+$//;  # chomp doesn't remove nl
	my $ps = `ps -p $pid -o comm=`;
	if (defined($ps) && $ps ne "") {
	    return 1;
	} 
    }
    return 0;
}

sub is_snort_enabled {
    my $config = new Vyatta::Config; 
    $config->setLevel('content-inspection');
    if ($config->existsOrig('traffic-filter')) {
	return 'true';
    } else {
	return 'false';
    }
}

sub ids_exit_error {
    my ($form, $err) = @_;

    my $msg;
    $msg  = "<form name=\'$form\' code='1'>";
    $msg .= "<errmsg>$err</errmsg>";
    $msg .= "</form>";
    print $msg;
    exit 1; 
}

sub ids_get {
    ids_log("ids_get:");
    my $msg    = '';
    my $enable = is_snort_enabled();
    if ($enable eq 'true' and !is_snort_running()) {
	my $err = 'ids_get: config enable but not running';
	ids_log($err);
	ids_exit_error('ids_config get', $err);

    }
    $msg  = "<form name='ids_config get' code='0'>";
    $msg .= "<ids_config>";
    $msg .= "<enable>$enable</enable>";
    $msg .= "</ids_config></form>";
    print $msg;
}

sub ids_configure {

    my (@cmds, $path);
    if (is_snort_enabled() eq 'true') {
	ids_exit_error('ids_config set', "ids already configured");
    }

    # snort config
    $path = 'content-inspection';
    push @cmds, "set $path ips actions priority-1 drop";
    push @cmds, "set $path ips actions priority-2 alert";
    push @cmds, "set $path ips actions priority-3 alert";
    push @cmds, "set $path ips actions other pass";
    push @cmds, "set $path traffic-filter preset all";
    push @cmds, ('commit', 'save');
    my $tmp = join("\n", @cmds);
    ids_log("ids_configure: $tmp");
    my $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
	ids_exit_error('ids_config set', $err);
    }
    my $msg  = "<form name='ids_config set' code='0'>";
    print $msg;
}

sub ids_disable {
    
    my @cmds;
    push @cmds, 'delete content-inspection';
    push @cmds, ('commit', 'save');
    my $tmp = join("\n", @cmds);
    ids_log("ids_disable: $tmp");
    my $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
	ids_exit_error('ids_config set', $err);
    }
    my $msg  = "<form name='ids_config set' code='0'>";
    print $msg;
}

sub ids_set {
    my ($data) = @_;
    
    ids_log("ids_set:");
    my $xs  = new XML::Simple;
    my $xml = $xs->XMLin($data);
    my $enable = $xml->{enable};
    if (! defined($enable)) {
	my $err = 'ids_set: unable to parse xml';
	ids_log($err);
	ids_exit_error('ids_config set', $err);
    }
    if ($enable eq 'true') {
	ids_configure();
    } elsif ($enable eq 'false') {
	ids_disable();
    } else {
	ids_exit_error('ids_config set', "Undefined cmd [$enable]\n");
    }
}


#
# main
#
my ($oper, $data);
GetOptions("oper=s"    => \$oper,
	   "data=s"    => \$data,
);

die "Error: undefined operation"  if ! defined $oper;
die "Error: undefined data"       if $oper eq 'set' and ! $data;

my $do = $dispatcher{"$oper"};

die "Error: undefined dispatcher" if ! defined $do;

# make it so ...
$do->($data);

exit 0;

# end of file
