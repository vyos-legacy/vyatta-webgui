#!/usr/bin/perl
#
# Module: zone-mgmt.pl
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
# Description: backend<->frontend zone management script
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

# mapping for dom-U to dom-0 interfaces
my %domU_to_dom0_intfhash = ( 'eth1'     => 'LAN (E1)',
                              'eth3'     => 'DMZ (E2)',
                              'eth5'     => 'LAN2 (E3)');

sub get_zoneinfo {
  my $zonename = shift;
  my $returnstring = "zone=[$zonename]";
  my $zoneintfs = "";
  my $description = "";

  my @zone_interfaces = Vyatta::Zone::get_zone_interfaces("returnValues", $zonename);
  my $index = 0;
  foreach my $intf (@zone_interfaces) {
    if ($intf eq $zonename) {
      # remove dummy interfaces i.e. zone name itself
      delete $zone_interfaces[$index];
    } else {
      # replace dom-U interface with dom-0 interface
      $zone_interfaces[$index] = $domU_to_dom0_intfhash{$intf};
    }
    $index++;
  }

  $zoneintfs = join(',', @zone_interfaces);
  $returnstring .= ",interfaces=[$zoneintfs]";

  my $config = new Vyatta::Config;
  $config->setLevel("zone-policy zone $zonename");
  $description = $config->returnValue('description');
  $returnstring .= ",description=[$description]" if defined $description;
  $returnstring .= ",description=[]" if ! defined $description;

  $returnstring .= ":";
  return $returnstring;
}

sub execute_get_zoneinfo {
  my $zonename = shift;
  my $return_string;
  my @internal_zones = ('DMZ2', 'Internal', 'JVM', 'Management', 'Voice', 'WAN');

  if ($zonename eq 'ALL') {
    # return info for all zones
    my @all_zones = Vyatta::Zone::get_all_zones("listNodes");
    foreach my $zone (sort @all_zones) {
      if (!scalar(grep(/^$zone$/, @internal_zones)) > 0) {
        $return_string .= get_zoneinfo($zone);
      }
    }
  } else {
    # return info for a particular zone
    $return_string .= get_zoneinfo($zonename);
  }

  $return_string = "<zone-mgmt>$return_string</zone-mgmt>";
  print "$return_string";

}

sub execute_get_avail_intfs {

  my @domU_intfs = ('eth1', 'eth3', 'eth5');
  my @available_intfs = ();
  my $return_string;

  foreach my $interface (@domU_intfs) {
    my $intf_in_zone='false';

    my $config = new Vyatta::Config;
    $config->setLevel("interfaces ethernet");
    my $intf_disabled = $config->exists("$interface disable");
    next if defined $intf_disabled;

    # check it is not under any of zone
    my @all_zones = Vyatta::Zone::get_all_zones("listNodes");
    foreach my $zone (@all_zones) {
      my @zone_interfaces =
                Vyatta::Zone::get_zone_interfaces("returnValues", $zone);
      if (scalar(grep(/^$interface$/, @zone_interfaces)) > 0) {
        $intf_in_zone='true';
      }
    }

    # interface not part of any zone and not disabled, add it available list
    if ($intf_in_zone eq 'false') {
      push (@available_intfs, $domU_to_dom0_intfhash{$interface});
    }
  }

  my $intfs_list = join(',', sort(@available_intfs));
  $return_string = "<zone-mgmt>available-interfaces=[$intfs_list]</zone-mgmt>";
  print "$return_string";

}

sub set_zone_description {
  my $args = shift;
  my @cmds=();
  my @arguments=split(/\]/,$args);
  my (@zone, @description);
  @zone = split(/\[/,$arguments[0]);
  @description = split(/\[/,$arguments[1]);
  $description[0] = '';
  my $zone_description = join (" ", @description);

  # zone - $zone[1], zone description - $zone_description

  if (defined $zone_description && !($zone_description eq '')) {
    # set zone description
    @cmds = (
       "set zone-policy zone $zone[1] description $zone_description",
    );
  } else {
    # delete zone description if any
    @cmds = (
       "delete zone-policy zone $zone[1] description",
    );
  }

  my $err = OpenApp::Conf::run_cmd_def_session(@cmds);
  if (defined $err) {
    # print error and return
    print("<form name='zone-mgmt' code=2>$err</form>");
    exit 1;
  }
}

sub usage() {
    print "     $0 --action='<action>' --args='<arguments>'\n";
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

# convert any capital letters to small caps to avoid any confusion
$action =~ tr/A-Z/a-z/;

switch ($action) {
  case 'get-zone-info'
  {
    execute_get_zoneinfo($args);
  }
  case 'get-available-interfaces'
  {
    execute_get_avail_intfs();
  }
  case 'set-zone-description'
  {
    set_zone_description($args);
  }
  case 'save'
  {
    my @cmds = ('commit', 'save');
    my $err = OpenApp::Conf::run_cmd_def_session(@cmds);
    if (defined $err) {
      # print error and return
      print("<form name='customize-firewall' code=1></form>");
      exit 1;
    }
  }
  else
  {
    # invalid action
    print "Invalid Action for $0\n";
    exit 1;
  }
}

exit 0;
