#!/usr/bin/perl
#
# Module: firewall-security-level.pl
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
# Date: May 2009
# Description: backend<->frontend firewall security level script
#
# **** End License ****
#

use lib "/opt/vyatta/share/perl5";
use warnings;
use strict;
use Switch;
use Getopt::Long;
use Vyatta::Config;
use Vyatta::Zone;
use OpenApp::Conf;

sub set_rulesets_other_zones {
  my $customize = shift;
  my $zone_level="zone-policy zone";
  my $DMZ_from_Wan="DMZ from WAN firewall name";
  my $DMZ_from_Lan="DMZ from LAN firewall name";
  my $Lan_from_DMZ="LAN from DMZ firewall name";
  my $Wan_from_DMZ="WAN from DMZ firewall name";
  my @cmds = ();
  my $ruleset_prefix = '';

  if ($customize eq 'true') {
    $ruleset_prefix = 'Customized_';
  }

  my $Wan_to_DMZ_ruleset = $ruleset_prefix . 'WAN_to_DMZ';
  my $Lan_to_DMZ_ruleset = $ruleset_prefix . 'LAN_to_DMZ';
  my $DMZ_to_Lan_ruleset = $ruleset_prefix . 'DMZ_to_LAN';
  my $DMZ_to_Wan_ruleset = $ruleset_prefix . 'DMZ_to_WAN';

  @cmds = (
    "set $zone_level $DMZ_from_Wan $Wan_to_DMZ_ruleset",
    "set $zone_level $DMZ_from_Lan $Lan_to_DMZ_ruleset",
    "set $zone_level $Lan_from_DMZ $DMZ_to_Lan_ruleset",
    "set $zone_level $Wan_from_DMZ $DMZ_to_Wan_ruleset",
  );
  return @cmds;
}

sub execute_set {

    my $firewall_type = shift;
    my @cmds=();
    my $zone_level="zone-policy zone";
    my $Lan_from_Wan="LAN from WAN firewall name";
    my $Wan_from_Lan="WAN from LAN firewall name";
    my $invalid_arg='false';
    my $customized = 'false';    

    # depending on what you get from the frontend, map that to rulesets
    # in the backend and apply in both directions for Lan and Wan zones

    switch ($firewall_type) {
      case "Authorize All"
        {
          @cmds = (
          "set $zone_level $Lan_from_Wan Low_WAN_to_LAN",
          "set $zone_level $Wan_from_Lan Low_LAN_to_WAN",
          );
        }
      case "Standard"
        {
          @cmds = (
          "set $zone_level $Lan_from_Wan Medium_WAN_to_LAN",
          "set $zone_level $Wan_from_Lan Medium_LAN_to_WAN",
          );
        }
      case "Advanced"
        {
          @cmds = (
          "set $zone_level $Lan_from_Wan High_WAN_to_LAN",
          "set $zone_level $Wan_from_Lan High_LAN_to_WAN",
          );
        }
      case "Customized"
        {
          @cmds = (
          "set $zone_level $Lan_from_Wan Customized_WAN_to_LAN",
          "set $zone_level $Wan_from_Lan Customized_LAN_to_WAN",
          );
          $customized = 'true';
        }
      case "Block All"
        {
          @cmds = (
          "delete $zone_level $Lan_from_Wan",
          "delete $zone_level $Wan_from_Lan",
          );
        }
      else
        {
          $invalid_arg = 'true';
        }
    }

    # set default/customized filter policies for other zones
    if ($customized eq 'true') {
      # set customized rulesets for other user-controllable zones
      push (@cmds, set_rulesets_other_zones('true'));
    } else {
      # set default policies for other user-controllable zones
      push (@cmds, set_rulesets_other_zones('false'));
    }

    if ($invalid_arg eq 'false') {
      # append commit and save to @cmds if case not in else
      push (@cmds, "commit", "save");
      my $err = OpenApp::Conf::execute_session(@cmds);
      if (defined $err) {
        # print error and return
        print("<form name='firewall-security-level' code=1></form>");
        exit 1;
      }
    } else {
      # print error and return
      print("<form name='firewall-security-level' code=2></form>");
      exit 1;
    }
}

sub execute_get {

   my $Wan_to_Lan_fw=Vyatta::Zone::get_firewall_ruleset("returnOrigValue",
                        'LAN', 'WAN', 'name');
   my $Lan_to_Wan_fw=Vyatta::Zone::get_firewall_ruleset("returnOrigValue",
                        'WAN', 'LAN', 'name');

   my $firewall_type;
   my $return_string;

   if (!defined $Wan_to_Lan_fw && !defined $Lan_to_Wan_fw) {
      $firewall_type='Block All';
   } else {
     if ($Wan_to_Lan_fw =~ /^Low_/ && $Lan_to_Wan_fw =~ /^Low_/) {
        $firewall_type='Authorize All';
     } elsif ($Wan_to_Lan_fw =~ /^Medium_/ && $Lan_to_Wan_fw =~ /^Medium_/ ) {
        $firewall_type='Standard';
     } elsif ($Wan_to_Lan_fw =~ /^High_/ && $Lan_to_Wan_fw =~ /^High_/ ) {
        $firewall_type='Advanced';
     } elsif ($Wan_to_Lan_fw =~ /^Customized_/ && $Lan_to_Wan_fw =~ /^Customized_/) {
        $firewall_type='Customized';
     }
   }

   $return_string = "<firewall-security-level>$firewall_type</firewall-security-level>";
   print "$return_string\n";
}

sub usage() {
    print "       $0 --set=<firewall-type>\n";
    print "       $0 --get\n";
    exit 1;
}

#
# main
#

my ($set, $get);

GetOptions(
    "set=s"              => \$set,
    "get"                => \$get,
    ) or usage();

if (defined $set) {
    execute_set($set);
}
else {
    execute_get();
}

exit 0;
