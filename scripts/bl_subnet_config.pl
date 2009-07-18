#!/usr/bin/perl
#
# Module: bl_subnet_config.pl
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
# Author: Mohit Mehta
# Date: July 2009
# Description: backend<->frontend subnet config for LAN, LAN2 and DMZ intfs
#
# **** End License ****
#

use lib "/opt/vyatta/share/perl5";
use warnings;
use strict;
use Switch;
use Getopt::Long;
use Vyatta::Config;
use Vyatta::Misc;
use OpenApp::Conf;
use XML::Simple;
use Data::Dumper;
use POSIX;

my %func = (
    'get_dhcp_static_mapping'     => \&get_dhcp_static_mapping,
    'set_dhcp_static_mapping'     => \&set_dhcp_static_mapping,
    'get_dhcp_server_config'	  => \&get_dhcp_server_config,
    'set_dhcp_server_config'	  => \&set_dhcp_server_config,
);

# mapping for interface names to dom-U interfaces
my %name_to_domU_intfhash = ( 'LAN'      => 'eth1',
                              'LAN2'     => 'eth5',
                              'DMZ'      => 'eth3');

my $sc_log = '/tmp/subnet_config';

sub sc_log {
    my $timestamp = strftime("%Y%m%d-%H:%M.%S", localtime);
    open my $fh, '>>', $sc_log
        or die "Can't open $sc_log: $!";
    print $fh "$timestamp: ", @_ , "\n";
    close $fh;
}

sub get_dhcp_server_config {
    my ($data) = @_;
    my @ip = Vyatta::Misc::getIP($name_to_domU_intfhash{$data});
    my $msg;
    $msg  = "<form name='dhcp-server-config' code='0'>" . "<dhcp-server-config>" .
            "<interface>$data</interface>";
    my $config = new Vyatta::Config;
    my $path = "service dhcp-server shared-network-name $data subnet $ip[0]";
    my @start_ip = $config->listNodes("$path start"); # should only be one start
    my $stop_ip = $config->returnValue("$path start $start_ip[0] stop");
    my $description = $config->returnValue("service dhcp-server shared-network-name $data description");
    # description format - 'dns-mode primary-dns-server secondary-dns-server'
    my @dns_values = split(' ', $description);
    my $enabled = '';
    my $disabled_val = $config->exists("service dhcp-server shared-network-name $data disable");
    if (defined($disabled_val)) {
       $enabled = 'false';
    } else {
       $enabled = 'true';
    }
    $msg .= "<enable>$enabled</enable>" . "<start>$start_ip[0]</start>" .
            "<end>$stop_ip</end>" . "<dns_mode>$dns_values[0]</dns_mode>" .
            "<primary_dns>$dns_values[1]</primary_dns>";
    $msg .= "<secondary_dns>$dns_values[2]</secondary_dns>" if defined $dns_values[2];
    $msg .= "</dhcp-server-config></form>";
    print $msg;
}

sub set_dhcp_server_config {
    my ($data) = @_;
    my $xs  = XML::Simple->new();
    my $xml = $xs->XMLin($data);
    my ($msg, $err);
    my @cmds = ();
    my @ip = Vyatta::Misc::getIP($name_to_domU_intfhash{$xml->{interface}});
    my $path = "service dhcp-server shared-network-name $xml->{interface}";

    push @cmds,
"delete $path subnet $ip[0] start",
"delete $path subnet $ip[0] dns-server",
"delete $path description",
"delete $path disable",
"set $path subnet $ip[0] start $xml->{start} stop $xml->{end}",
"set $path description \"$xml->{dns_mode} $xml->{primary_dns} $xml->{secondary_dns}\"";

    if ($xml->{dns_mode} eq 'static') {
        push @cmds,
"set $path subnet $ip[0] dns-server $xml->{primary_dns}",
"set $path subnet $ip[0] dns-server $xml->{secondary_dns}";
    } elsif ($xml->{dns_mode} eq 'dynamic') {
        my @values = split('/', $ip[0]);
        push @cmds,
"set $path subnet $ip[0] dns-server $values[0]";
    }

    if ($xml->{enable} eq 'false') {
        push @cmds,
"set $path disable";
    }

    push @cmds, "commit", "save";
    $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
       $msg = "<form name='dhcp-static-mapping' code='2'>";
       $msg .= "<dhcp-server-config>" . "</dhcp-server-config>";
       $msg .= "<errmsg>" . "Set DHCP server config error" . "</errmsg>";
       $msg = "</form>";
       print $msg;
       exit 1;
    }
    $msg = "<form name='dhcp-server-config' code='0'></form>";
    print $msg;
}

sub get_dhcp_static_mapping {
    my ($data) = @_;
    my @ip = Vyatta::Misc::getIP($name_to_domU_intfhash{$data});
    my $msg;
    $msg  = "<form name='dhcp-static-mapping' code='0'>";
    $msg  .= "<mapping-config>";
    $msg  .= "<interface>$data</interface>";
    my $config = new Vyatta::Config;
    my $path = "service dhcp-server shared-network-name $data subnet $ip[0]";
    my @static_mappings = $config->listNodes("$path static-mapping");
    foreach my $static_mapping (sort @static_mappings) {
       my $ip_address = $config->returnValue(
"$path static-mapping $static_mapping ip-address");
       my $mac_address = $config->returnValue(
"$path static-mapping $static_mapping mac-address");
       my $mapping_disabled = $config->exists(
"$path static-mapping $static_mapping disable");

       $msg  .= "<mapping>";
       $msg  .= "<tagname>$static_mapping</tagname>";
       $msg  .= "<ip>$ip_address</ip>";
       $msg  .= "<mac>$mac_address</mac>";
       $msg  .= "<enable>true</enable>" if !defined $mapping_disabled;
       $msg  .= "<enable>false</enable>" if defined $mapping_disabled;
       $msg  .= "</mapping>";
    }
    $msg  .= "</mapping-config>" . "</form>";
    print $msg;
}

sub set_dhcp_static_mapping {
    my ($data) = @_;
    my $xs  = XML::Simple->new(ForceArray => [ 'mapping' ]);
    my $xml = $xs->XMLin($data);
    my ($msg, $err);
    my @cmds = ();
    my @ip = Vyatta::Misc::getIP($name_to_domU_intfhash{$xml->{interface}});
    my $path = "service dhcp-server shared-network-name $xml->{interface} subnet $ip[0]";
    foreach my $mapping (@{$xml->{mapping}}) {
       switch ($mapping->{action}) {

          case 'add'
          {
             push @cmds,
"set $path static-mapping $mapping->{tagname} ip-address $mapping->{ip}",
"set $path static-mapping $mapping->{tagname} mac-address $mapping->{mac}";

             push @cmds, "set $path static-mapping $mapping->{tagname} disable"
		if $mapping->{enable} eq 'false';
          }

          case 'update'
          {
             push @cmds,
"set $path static-mapping $mapping->{tagname} ip-address $mapping->{ip} ",
"set $path static-mapping $mapping->{tagname} mac-address $mapping->{mac} ";

             if ($mapping->{enable} eq 'false') {
                push @cmds, "set $path static-mapping $mapping->{tagname} disable";
             } else {
                push @cmds, "delete $path static-mapping $mapping->{tagname} disable";
             }
          }

          case 'delete'
          {
             push @cmds,
                "delete $path static-mapping $mapping->{tagname}";
          }

       }
    }
    push @cmds, "commit", "save";
    $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
       $msg = "<form name='dhcp-static-mapping' code='1'>";
       $msg .= "<dhcp-static-mapping>" . "</dhcp-static-mapping>";
       $msg .= "<errmsg>" . "Set DHCP reserved IP pool error" . "</errmsg>";
       $msg = "</form>";
       print $msg;
       exit 1;
    }
    $msg = "<form name='dhcp-static-mapping' code='0'></form>";
    print $msg;
}

#
# main
#
my ($action, $data);
GetOptions("action=s"    => \$action,
           "data=s"      => \$data,
);

die "Error: undefined action"       if ! defined $action;
die "Error: undefined data"       if ! defined $data;
my $call_func = $func{"$action"};
die "Error: undefined function" if ! defined $call_func;
$call_func->($data) if defined $data;
exit 0;

# end of file
