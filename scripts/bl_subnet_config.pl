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

sub shared_ntwrk_range_or_mapping_exist {
    my $interface_name = shift;
    my @ip = Vyatta::Misc::getIP($name_to_domU_intfhash{$interface_name});
    my $config = new Vyatta::Config;
    my $path = "service dhcp-server shared-network-name $interface_name subnet $ip[0]";
    my @start_ip = $config->listNodes("$path start");
    my @static_mappings = $config->listNodes("$path static-mapping");
    if ((scalar(@start_ip) > 0) || (scalar(@static_mappings) > 0)) {
      return 0; # true
    } else {
      return 1; # false
    }
}

sub more_than1_shared_ntwrks {
    my $config = new Vyatta::Config;
    my $path = "service dhcp-server";
    my @shared_ntwrks = $config->listNodes("$path shared-network-name");
    if (scalar(@shared_ntwrks) > 1) {
      return 0; # true
    } else {
      return 1; # false
    }
}

sub delete_sharedntwrk_or_dhcpserver {
    my $interface = shift;
    my @cmds = ();

    # if no dhcp ranges or mapping exist, delete shared-network-name
    my $delete_dhcp = shared_ntwrk_range_or_mapping_exist($interface);
    if ($delete_dhcp == 1) {
       # if no other shared-network-names, delete dhcp-server config
       my $any_shared_ntwrks = more_than1_shared_ntwrks();
       if ($any_shared_ntwrks == 1) {
           push @cmds, "delete service dhcp-server";
       } else {
           push @cmds, "delete service dhcp-server shared-network-name $interface";
       }
    }

    return @cmds;
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
    my $stop_ip = $config->returnValue("$path start $start_ip[0] stop") if scalar(@start_ip) > 0;
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

    $msg .= "<enable>$enabled</enable>";
    if (scalar(@start_ip) > 0) {
      $msg .= "<start>$start_ip[0]</start>" . "<end>$stop_ip</end>";
    } else {
      $msg .= "<start></start>" . "<end></end>";
    }

    $msg .= "<dns_mode>$dns_values[0]</dns_mode>";
    if (defined $dns_values[1]) {
      $msg .= "<primary_dns>$dns_values[1]</primary_dns>";
    } else {
      $msg .= "<primary_dns></primary_dns>";
    }
    if (defined $dns_values[2]) {
      $msg .= "<secondary_dns>$dns_values[2]</secondary_dns>";
    } else {
      $msg .= "<secondary_dns></secondary_dns>";
    }
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
    my @ip_without_mask = split('/', $ip[0]);
    my $path = "service dhcp-server shared-network-name $xml->{interface}";
    my $scnd_dns_exists = 1;

    push @cmds,
"delete $path subnet $ip[0] start",
"delete $path subnet $ip[0] dns-server",
"delete $path description",
"delete $path disable",
"set $path authoritative enable",
"set $path subnet $ip[0] default-router $ip_without_mask[0]",
"set $path description \"$xml->{dns_mode}\"";

    if ($xml->{start} =~ m/\w/) {
      push @cmds,
"set $path subnet $ip[0] start $xml->{start} stop $xml->{end}";
    }

    if (!($xml->{primary_dns} eq '')) {
      push @cmds, 
"set $path description \"$xml->{dns_mode} $xml->{primary_dns}\"";
    }
    if (!($xml->{secondary_dns} eq '')) {
      push @cmds, 
"set $path description \"$xml->{dns_mode} $xml->{primary_dns} $xml->{secondary_dns}\"";
      $scnd_dns_exists = 0;
    }

    if ($xml->{dns_mode} eq 'static') {
        push @cmds,
"set $path subnet $ip[0] dns-server $xml->{primary_dns}";
	push @cmds,
"set $path subnet $ip[0] dns-server $xml->{secondary_dns}" if $scnd_dns_exists == 1;
    } elsif ($xml->{dns_mode} eq 'dynamic') {
        push @cmds,
"set $path subnet $ip[0] dns-server $ip_without_mask[0]";
    }

    if ($xml->{enable} eq 'false') {
        push @cmds,
"set $path disable";
    }

    $err = OpenApp::Conf::run_cmd_def_session(@cmds);
    if (defined $err) {
       $msg = "<form name='dhcp-server-config' code='3'>";
       $msg .= "<dhcp-server-config>" . "</dhcp-server-config>";
       $msg .= "<errmsg>" . "Set DHCP server config error" . "</errmsg>";
       $msg .= "</form>";
       print $msg;
       exit 1;
    }

    @cmds = delete_sharedntwrk_or_dhcpserver($xml->{interface});
    push @cmds, "commit", "save";
    $err = OpenApp::Conf::run_cmd_def_session(@cmds);
    if (defined $err) {
       $msg = "<form name='dhcp-server-config' code='4'>";
       $msg .= "<dhcp-server-config>" . "</dhcp-server-config>";
       $msg .= "<errmsg>" . "Set DHCP server config error" . "</errmsg>";
       $msg .= "</form>";
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
    my @ip_without_mask = split('/', $ip[0]);    
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

    push @cmds, 
"set service dhcp-server shared-network-name $xml->{interface} authoritative enable",
"set $path default-router $ip_without_mask[0]";

    $err = OpenApp::Conf::run_cmd_def_session(@cmds);
    if (defined $err) {
       $msg = "<form name='dhcp-static-mapping' code='1'>";
       $msg .= "<dhcp-static-mapping>" . "</dhcp-static-mapping>";
       $msg .= "<errmsg>" . "Set DHCP static mapping error" . "</errmsg>";
       $msg .= "</form>";
       print $msg;
       exit 1;
    }

    @cmds = delete_sharedntwrk_or_dhcpserver($xml->{interface});;
    push @cmds, "commit", "save";
    $err = OpenApp::Conf::run_cmd_def_session(@cmds);
    if (defined $err) {
       $msg = "<form name='dhcp-static-mapping' code='2'>";
       $msg .= "<dhcp-static-mapping>" . "</dhcp-static-mapping>";
       $msg .= "<errmsg>" . "Set DHCP static mapping error" . "</errmsg>";
       $msg .= "</form>";
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
