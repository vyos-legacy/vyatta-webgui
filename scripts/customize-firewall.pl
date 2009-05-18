#!/usr/bin/perl
#
# Module: customize-firewall.pl
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
# Description: backend<->frontend customize firewall script
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
use Vyatta::IpTables::Rule;
use Vyatta::IpTables::AddressFilter;

sub get_srcdst_address {
 my ($level) = @_;
 my $address = "";
 my $addr = new Vyatta::IpTables::AddressFilter;
 $addr->setupOrig("$level");
 if (defined $addr->{_address}) {
  $address = $addr->{_address};
 } elsif (defined $addr->{_network}) {
   $address = $addr->{_network};
 } elsif (defined $addr->{_range_start} && defined $addr->{_range_stop}) {
   $address = $addr->{_range_start} . "-" . $addr->{_range_stop};
 }
 return $address;
}

sub get_srcdst_port {
 my ($level) = @_;
 my $portstr = "";
 my $port = new Vyatta::IpTables::AddressFilter;
 $port->setupOrig("$level");
 $portstr = $port->{_port} if defined $port->{_port};
 return $portstr;
}

sub get_zonepair_fwruleset {
  my $zonepair = shift;

  # assuming zone pair to be in this form 'fromzone_to_tozone'
  my @zones = split('_', $zonepair);

  # first get firewall ruleset name applied to that zone_pair
  my $fw_ruleset=Vyatta::Zone::get_firewall_ruleset("returnOrigValue",
                        "$zones[2]", "$zones[0]", 'name');

  return $fw_ruleset;
}

# get rule info for given ruleset, rulenum
sub get_rule {

 my ($ruleset, $rulenum) = @_;
 my $rule_string="rulenum=[$rulenum]";

 my $cli_rule = new Vyatta::IpTables::Rule;
 $cli_rule->setupOrig("firewall name $ruleset rule $rulenum");

 if (defined $cli_rule->{_protocol}) {
   $rule_string .= ",protocol=[$cli_rule->{_protocol}]";
 } else {
   $rule_string .= ",protocol=[Any]";
 }

 my $source_addr = get_srcdst_address("firewall name $ruleset rule $rulenum source");
 my $destination_addr = get_srcdst_address("firewall name $ruleset rule $rulenum destination");
 my $source_port = get_srcdst_port("firewall name $ruleset rule $rulenum source");
 my $destination_port = get_srcdst_port("firewall name $ruleset rule $rulenum destination");

 $rule_string .= ",saddr=[$source_addr]";
 $rule_string .= ",sport=[$source_port]";
 $rule_string .= ",daddr=[$destination_addr]";
 $rule_string .= ",dport=[$destination_port]";

 $rule_string .= ",action=[$cli_rule->{_action}]";

 if (defined $cli_rule->{_log} && "$cli_rule->{_log}" eq "enable") {
   $rule_string .= ",log=[Yes]";
 } else {
   $rule_string .= ",log=[No]";
 }

 if (defined $cli_rule->{_disable}) {
   $rule_string .= ",enable=[No]";
 } else {
   $rule_string .= ",enable=[Yes]";
 }

 $rule_string .= ':'; # end of rule info

 return $rule_string;

}

sub execute_get {

 # get firewall ruleset for zone pair
 # in GUI - it'll be 'LAN_to_WAN' (an example) which translates in our CLI to
 #
 # zone WAN {
 #   from LAN {
 #     firewall {
 #         name <>
 #     }
 #   }
 #   interface <>
 # }

 my ($zonepair, $rulenum) = @_;
 my $return_string;
 my $rules_string;
 my $config = new Vyatta::Config;

 # first get firewall ruleset name applied to that zone_pair
 my $fw_ruleset=get_zonepair_fwruleset($zonepair);

 # get a list of all rulenums in that ruleset
 # ask for all rules one by one and keep appending to $rules_string
 $config->setLevel("firewall name $fw_ruleset rule");
 my @rules = $config->listOrigNodes();

 if ($rulenum eq 'all') {
   # ask for all rules one by one and keep appending to $rules_string
   foreach (@rules) {
     $rules_string .= get_rule ($fw_ruleset, $_);
   }
 } else {
   # proced only if rule is a valid one
   if (!scalar(grep(/^$rulenum$/, @rules)) > 0) {
     print "<customize-firewall>Invalid rule number</customize-firewall>";
     return;
   }

   # ask for specific rule only and append to $rules_string
   $rules_string .= get_rule ($fw_ruleset, $rulenum);
 }

 $return_string = "<customize-firewall>zonepair=[$zonepair]:$rules_string</customize-firewall>";
 print "$return_string";

}

sub usage() {
    print "	$0 --action='<action>' --args='<arguments>'\n";
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

# list of possible actions :
# set, delete, get, order-rulenum, change-rulenum, save

# convert any capital letters to small caps to avoid any confusion
$action =~ tr/A-Z/a-z/;

# we need args for every action except for save-changes
if ($action eq 'save') {
  # simply commit and save changes
}

usage() if ! defined $args;

# parse out args. args in the form - key=[value],key=[value]
# 1st arg zonepair, 2nd arg rulenum are needed always
my @arguments=split(/\]/,$args);

my (@zonepair, @rulenum, @key, @value);
@zonepair = split(/\[/,$arguments[0]);
@rulenum = split(/\[/,$arguments[1]);
@value = split(/\[/,$arguments[2]) if defined $arguments[2];
@key = split (/\=/, $value[0]) if defined $arguments[2];

# zonepair - $zonepair[1], rulenum - $rulenum[1], 
# key - $key [0], value - $value [1]

switch ($action) {
  case 'get'
  {
    # do get action here
    # get could be for 'all' rules or a specific rulenum
    execute_get ($zonepair[1], $rulenum[1]);
  }
  else
  {
    # invalid action
    print "Invalid Action for $0\n";
    exit 1;
  }
}

exit 0;
