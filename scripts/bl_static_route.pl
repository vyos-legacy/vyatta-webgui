#!/usr/bin/perl
#
# Module: bl_static_route.pl
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
# Date: August 2009
# Description: backend<->frontend static route config
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
    'get_static_route'     => \&get_static_route,
    'set_static_route'     => \&set_static_route,
);

my $sr_log = '/tmp/static_route';

sub sr_log {
    my $timestamp = strftime("%Y%m%d-%H:%M.%S", localtime);
    open my $fh, '>>', $sr_log
        or die "Can't open $sr_log: $!";
    print $fh "$timestamp: ", @_ , "\n";
    close $fh;
}

sub get_static_route {
  my ($data) = @_;    
  my $msg;
  $msg  = "<form name='static-route' code='0'>";
  $msg  .= "<static-route>";

  my $config = new Vyatta::Config;
  my $path = "protocols static route";
  my @static_routes = $config->listNodes("$path");

  foreach my $static_route (sort @static_routes) {
    my @gateways = $config->listNodes(
"$path $static_route next-hop");

    foreach my $gateway (sort @gateways) {
      my $distance = $config->returnValue(
"$path $static_route next-hop $gateway distance");
      $distance = 1 if !defined $distance;

      my $route_disabled = $config->exists(
"$path $static_route next-hop $gateway disable");

      $msg  .= "<route>";
      $msg  .= "<dest_network_mask>$static_route</dest_network_mask>";
      $msg  .= "<gateway>$gateway</gateway>";
      $msg  .= "<metric>$distance</metric>";
      $msg  .= "<enable>true</enable>" if !defined $route_disabled;
      $msg  .= "<enable>false</enable>" if defined $route_disabled;
      $msg  .= "</route>";
    }

  }

  $msg  .= "</static-route>" . "</form>";
  print $msg;
}

sub set_static_route {
  my ($data) = @_;
  my $xs  = XML::Simple->new(ForceArray => [ 'route' ]);
  my $xml = $xs->XMLin($data);
  my ($msg, $err);
  my @cmds = ();
  my $path = "protocols static route";
  foreach my $route (@{$xml->{route}}) {
    switch ($route->{action}) {

      case 'add'
      {
        push @cmds,
"set $path $route->{dest_network_mask} next-hop $route->{gateway} distance $route->{metric}";
        push @cmds, 
"set $path $route->{dest_network_mask} next-hop $route->{gateway} disable"
    if $route->{enable} eq 'false';
      }

      case 'update'
      {
         push @cmds,
"set $path $route->{dest_network_mask} next-hop $route->{gateway} distance $route->{metric}";
         if ($route->{enable} eq 'false') {
           push @cmds, 
"set $path $route->{dest_network_mask} next-hop $route->{gateway} disable";
         } else {
           push @cmds, 
"delete $path $route->{dest_network_mask} next-hop $route->{gateway} disable";
         }
      }

      case 'delete'
      {
        push @cmds,
"delete $path $route->{dest_network_mask} next-hop $route->{gateway}";
      }

    } # end of switch
  } # end of for loop

  $err = OpenApp::Conf::run_cmd_def_session(@cmds);
  if (defined $err) {
    $msg = "<form name='static-route' code='1'>";
    $msg .= "<errmsg>" . "Error updating static-routes" . "</errmsg>";
    $msg .= "</form>";
    print $msg;
    exit 1;
  }

  @cmds = ();
  my $config = new Vyatta::Config;
  my @static_routes = $config->listNodes("$path");
  foreach my $static_route (sort @static_routes) {
    my @gateways = $config->listNodes("$path $static_route next-hop");
    push @cmds, "delete $path $static_route" if scalar @gateways == 0;
  }

  push @cmds, "commit", "save";
  $err = OpenApp::Conf::run_cmd_def_session(@cmds);
  if (defined $err) {
    OpenApp::Conf::run_cmd_def_session('discard');
    $msg = "<form name='static-route' code='2'>";
    $msg .= "<errmsg>" . "Error updating static-routes" . "</errmsg>";
    $msg .= "</form>";
    print $msg;
    exit 1;
  }

  $msg = "<form name='static-route' code='0'></form>";
  print $msg;
}

#
# main
#
my ($action, $data);
GetOptions("action=s"    => \$action,
           "data=s"      => \$data,
);

die "Error: undefined action" if ! defined $action;
die "Error: undefined data"   if ! defined $data;
my $call_func = $func{"$action"};
die "Error: undefined function" if ! defined $call_func;
$call_func->($data) if defined $data;
exit 0;

# end of file
