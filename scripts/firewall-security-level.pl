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

    if ($zonepair eq 'LAN_to_WAN' || $zonepair eq 'WAN_to_LAN') {
      switch ($firewall_type) {
        case 'Authorize All'
        {
         my $fw_ruleset = 'Low_' . $zonepair;
         @cmds = (
         "set $zone_fw_level name $fw_ruleset"
         );
        }
        case 'Standard'
        {
         my $fw_ruleset = 'Medium_' . $zonepair;
         @cmds = (
         "set $zone_fw_level name $fw_ruleset"
         );
        }
        case 'Advanced'
        {
         my $fw_ruleset = 'High_' . $zonepair;
         @cmds = (
         "set $zone_fw_level name $fw_ruleset"
         );
        }
        case 'Customized'
        {
         my $fw_ruleset = 'Customized_' . $zonepair;
         @cmds = (
         "set $zone_fw_level name $fw_ruleset"
         );
        }
        case 'Block All'
        {
         @cmds = (
         "delete $zone_fw_level"
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
       case 'Customized'
       {
        my $fw_ruleset = 'Customized_' . $zonepair;
        @cmds = (
        "set $zone_fw_level name $fw_ruleset"
        );
       }
       case 'Default'
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

sub execute_get {
   my $zonepair = shift;
   my ($firewall_type, $return_string);

   my ($to_zone, $from_zone) = get_zone_names($zonepair);
   my $fw_ruleset=Vyatta::Zone::get_firewall_ruleset("returnValue",
                        "$to_zone", "$from_zone", 'name');

   if ($zonepair eq 'LAN_to_WAN' || $zonepair eq 'WAN_to_LAN') {
     if (!defined $fw_ruleset) {
       # this should only happen in case direction is LAN_to_WAN or WAN_to_LAN
       $firewall_type='Block All';
     } elsif ($fw_ruleset =~ /^Low_/) {
       $firewall_type='Authorize All';
     } elsif ($fw_ruleset =~ /^Medium_/) {
       $firewall_type='Standard';
     } elsif ($fw_ruleset =~ /^High_/) {
       $firewall_type='Advanced';
     } elsif ($fw_ruleset =~ /^Customized_/) {
       $firewall_type='Customized';
     }
   } else {
     # for all other directions there's jst 2 options - default or customized
     if ($fw_ruleset =~ /^Customized_/) {
       $firewall_type='Customized';
     } else {
       $firewall_type='Default';
     }
   }

   $return_string="<firewall-security-level>zonepair=[$zonepair]," .
                  "security-level=[$firewall_type]</firewall-security-level>";
   print "$return_string\n";
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
