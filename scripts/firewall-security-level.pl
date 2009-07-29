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

sub get_zone_names {
   my $zonepair = shift;

   # split the zonepair to get to_zone and from_zone
   my @zonenames = split('to', $zonepair);
   $zonenames[0] =~ s/_//;
   $zonenames[1] =~ s/_//;

   return ($zonenames[1], $zonenames[0]);
}

sub execute_set {

    my ($zonepair, $firewall_type) = @_;
    my @cmds=();
    my ($to_zone, $from_zone) = get_zone_names($zonepair);
    my $zone_fw_level="zone-policy zone $to_zone from $from_zone firewall";
    my $invalid_arg='false';
    $firewall_type =~ tr/A-Z/a-z/;

    if ($zonepair eq 'LAN_to_WAN') {
      switch ($firewall_type) {
        case 'authorize all'
        {
         my $fw_ruleset = 'Low_' . $zonepair;
         @cmds = (
         "set $zone_fw_level name $fw_ruleset"
         );
        }
        case 'standard'
        {
         my $fw_ruleset = 'Medium_' . $zonepair;
         @cmds = (
         "set $zone_fw_level name $fw_ruleset"
         );
        }
        case 'advanced'
        {
         my $fw_ruleset = 'High_' . $zonepair;
         @cmds = (
         "set $zone_fw_level name $fw_ruleset"
         );
        }
        case 'customized'
        {
         my $fw_ruleset = 'Customized_' . $zonepair;
         @cmds = (
         "set $zone_fw_level name $fw_ruleset"
         );
        }
        case 'block all'
        {
         my $fw_ruleset = 'Block_' . $zonepair;
         @cmds = (
         "set $zone_fw_level name $fw_ruleset"
         );
        }
        else
        {
          $invalid_arg = 'true';
        }
     }
   } else {
     # for all other directions
     switch ($firewall_type) {
       case 'customized'
       {
        my $fw_ruleset = 'Customized_' . $zonepair;
        @cmds = (
        "set $zone_fw_level name $fw_ruleset"
        );
       }
       case 'default'
       {
        @cmds = (
        "set $zone_fw_level name $zonepair"
        );
       }
       else
       {
        $invalid_arg = 'true';
       }
     }
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

sub execute_getzonelevel {
   my $zonepair = shift;
   my ($firewall_type, $return_string);

   my ($to_zone, $from_zone) = get_zone_names($zonepair);
   my $fw_ruleset=Vyatta::Zone::get_firewall_ruleset("returnValue",
                        "$to_zone", "$from_zone", 'name');

   if ($zonepair eq 'LAN_to_WAN') {
     if ($fw_ruleset =~ /^Block_/) {
       # this should only happen in case direction is LAN_to_WAN
       $firewall_type='block all';
     } elsif ($fw_ruleset =~ /^Low_/) {
       $firewall_type='authorize all';
     } elsif ($fw_ruleset =~ /^Medium_/) {
       $firewall_type='standard';
     } elsif ($fw_ruleset =~ /^High_/) {
       $firewall_type='advanced';
     } elsif ($fw_ruleset =~ /^Customized_/) {
       $firewall_type='customized';
     }
   } else {
     # for all other directions there's jst 2 options - default or customized
     if ($fw_ruleset =~ /^Customized_/) {
       $firewall_type='customized';
     } else {
       $firewall_type='default';
     }
   }

   $return_string="zonepair=[$zonepair],security-level=[$firewall_type]:";
   return $return_string;
}

sub execute_get {
   my $zonepair = shift;
   my $return_string = '<firewall-security-level>';

   if ($zonepair eq 'ALL') {
     my @active_zonepairs = get_active_zonepairs();
     foreach my $zonepairs (@active_zonepairs) {
       $return_string .= execute_getzonelevel ($zonepairs);
     }
   } else {
     $return_string .= execute_getzonelevel ($zonepair);
   }

   $return_string .= '</firewall-security-level>';
   print "$return_string\n";
}

sub is_intf_disabled {
  my $interface = shift;
  my $config = new Vyatta::Config;
  $config->setLevel("interfaces ethernet");
  return $config->exists("$interface disable");
}

sub get_active_zonepairs {

  my @zonepairs = ("LAN_to_DMZ", "LAN_to_LAN2", "LAN_to_WAN",
                   "LAN2_to_DMZ", "LAN2_to_LAN", "LAN2_to_WAN",
                   "WAN_to_DMZ", "WAN_to_LAN", "WAN_to_LAN2",
                   "DMZ_to_LAN", "DMZ_to_LAN2", "DMZ_to_WAN");

  my @user_zones = ('DMZ', 'LAN', 'LAN2');
  my @all_inactive_zonepairs = ();

  # remove zonepairs that involve a disabled zone i.e. zone with no active intfs
  foreach my $zone (@user_zones) {

    my @active_interfaces = ();
    my $zone_underscore_suffix = $zone . '_to_';
    my $zone_underscore_prefix = '_to_' . $zone;
    my @zone_interfaces =
        Vyatta::Zone::get_zone_interfaces("returnValues", $zone);

    foreach my $intf (@zone_interfaces) {
      my $intf_disabled = is_intf_disabled($intf);
      if (!($intf eq $zone || defined $intf_disabled)) {
        push (@active_interfaces, $intf);
      }
    }

    if (scalar(@active_interfaces) == 0) {
      # this is an inactive zone, remove its zonepairs
      my @inactive_zonepairs = grep (/$zone_underscore_suffix|$zone_underscore_prefix$/, @zonepairs);
      push (@all_inactive_zonepairs, @inactive_zonepairs);
    }

  }

  my @intersection = ();
  my @difference = ();
  my %count = ();
  foreach my $element (@zonepairs, @all_inactive_zonepairs) { $count{$element}++ }
  foreach my $element (keys %count) {
    push @{ $count{$element} > 1 ? \@intersection : \@difference }, $element;
  }

  return sort @difference;

}

sub usage() {
    print "       $0 --action='<action>' --args='<arguments>'\n";
    exit 1;
}

#
# main
#

my ($action, $args);

GetOptions(
    "action=s"                  => \$action,
    "args=s"                    => \$args,
    );

usage() if ! defined $action;
usage() if ! defined $args;

# parse out args. args in the form - key=[value],key=[value]
# 1st arg is zonepair, if action is set 2nd arg is security level
my @arguments=split(/\]/,$args);

my (@zonepair, @security_level);
@zonepair = split(/\[/,$arguments[0]);
@security_level = split(/\[/,$arguments[1]) if defined $arguments[1];

# zonepair - $zonepair[1], security_level - $security_level[1]

switch ($action) {
  case 'get'
  {
    execute_get ($zonepair[1]);
  }
  case 'set'
  {
    execute_set ($zonepair[1], $security_level[1]);
  }
  else
  {
    # invalid action
    print "Invalid Action for $0\n";
    exit 1;
  }
}

exit 0;
