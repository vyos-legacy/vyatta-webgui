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
 my ($level, $orig_or_active) = @_;
 my $address = "";
 my $addr = new Vyatta::IpTables::AddressFilter;
 $addr->$orig_or_active("$level");
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
 my ($level, $orig_or_active) = @_;
 my $portstr = "";
 my $port = new Vyatta::IpTables::AddressFilter;
 $port->$orig_or_active("$level");
 $portstr = $port->{_port} if defined $port->{_port};
 return $portstr;
}

sub get_zonepair_fwruleset {
  my $zonepair = shift;

  # add 'Customized_' in front of zonepair
  my $fw_ruleset = 'Customized_' . $zonepair; 

  return $fw_ruleset;
}

# get rule info for given ruleset, rulenum
sub get_rule {

 my ($ruleset, $rulenum) = @_;
 my $rule_string="rulenum=[$rulenum]";
 my $level = "firewall name $ruleset rule $rulenum";

 # get application name stored in description field of rule
 my $config = new Vyatta::Config;
 $config->setLevel("$level");
 my $application = $config->returnValue('description');
 if (!defined $application) {
   $rule_string .= ",application=[Others]";
 } else {
   $rule_string .= ",application=[$application]";
 }

 my $cli_rule = new Vyatta::IpTables::Rule;
 $cli_rule->setup("$level");

 if (defined $cli_rule->{_protocol}) {
   $rule_string .= ",protocol=[$cli_rule->{_protocol}]";
 } else {
   $rule_string .= ",protocol=[Any]";
 }

 my $source_addr = get_srcdst_address("firewall name $ruleset rule $rulenum source", 'setup');
 my $destination_addr = get_srcdst_address("firewall name $ruleset rule $rulenum destination", 'setup');
 my $source_port = get_srcdst_port("firewall name $ruleset rule $rulenum source", 'setup');
 my $destination_port = get_srcdst_port("firewall name $ruleset rule $rulenum destination", 'setup');

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
 my $rules_string='';
 my $config = new Vyatta::Config;

 # first get firewall ruleset name applied to that zone_pair
 my $fw_ruleset=get_zonepair_fwruleset($zonepair);

 # get a list of all rulenums in that ruleset
 # ask for all rules one by one and keep appending to $rules_string
 $config->setLevel("firewall name $fw_ruleset rule");
 my @rules = $config->listNodes();

 if ($rulenum eq 'all') {
   # ask for all rules one by one and keep appending to $rules_string
   foreach (sort @rules) {
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

sub execute_delete_rule {
 my ($zonepair, $rulenum) = @_;

 # get firewall ruleset name applied to that zone_pair
 my $fw_ruleset=get_zonepair_fwruleset($zonepair);

 my @cmds = ("delete firewall name $fw_ruleset rule $rulenum");
 my $err = OpenApp::Conf::run_cmd_def_session(@cmds);
 if (defined $err) {
   # print error and return
   print("<form name='customize-firewall' code=3></form>");
   exit 1;
 }
}

sub get_addr_port_cmds {
  my ($value, $clilevel, $addr_or_port) = @_;
  my @cmds = ();
  my ($func, $clival);

  if ($addr_or_port eq 'address') {
    $func="get_srcdst_address(\"$clilevel\", 'setup')";
  } else {
    $func="get_srcdst_port(\"$clilevel\", 'setup')";
  }

  if ($value eq '') {
    # check if there exists a value in CLI
    # if yes then delete it
    $clival = $func;
    if (!($clival eq '')) {
      @cmds = (
        "delete $clilevel",
      );
    }
  } else {
    @cmds = (
      "set $clilevel $addr_or_port $value",
    );
  }

  return @cmds;
}

sub execute_set_value {
  my ($zonepair, $rulenum, $key, $value) = @_;
  my $invalid_key='false';
  my @cmds=();

  my $fw_ruleset=get_zonepair_fwruleset($zonepair);
  my $fw_rule_level = "firewall name $fw_ruleset rule $rulenum";

  # convert any capital letters to small caps to avoid any confusion
  $key =~ tr/A-Z/a-z/;
  $value =~ tr/A-Z/a-z/ if ! $key eq 'application';

  switch ($key) {
    case 'protocol' {
      if ($value eq 'any') {
        $value = 'all';
      }
      @cmds = (
         "set $fw_rule_level protocol $value",
      );
    }
    case 'application' {
      if (!$value eq '') {
        @cmds = (
         "set $fw_rule_level description $value",
        );
      } else {
        @cmds = (
         "set $fw_rule_level description Others",
        );       
      }
    }
    case 'saddr' {
      @cmds = get_addr_port_cmds(
                $value, "$fw_rule_level source", 'address');
    }
    case 'sport' {
      @cmds = get_addr_port_cmds(
                $value, "$fw_rule_level source", 'port');
    }
    case 'daddr' {
      @cmds = get_addr_port_cmds(
                $value, "$fw_rule_level destination", 'address');
    }
    case 'dport' {
      @cmds = get_addr_port_cmds(
                $value, "$fw_rule_level destination", 'port');
    }
    case 'action' {
      @cmds = (
         "set $fw_rule_level action $value",
      );
    }
    case 'log' {
      if ($value eq 'yes') {
        @cmds = (
          "set $fw_rule_level log enable",
        );
      } else {
        @cmds = (
          "set $fw_rule_level log disable",
        );
      }
    }
    case 'enable' {
      if ($value eq 'yes') {
        my $rule = new Vyatta::IpTables::Rule;
        $rule->setup("$fw_rule_level");
        if ($rule->is_disabled()) {
          @cmds = (
            "delete $fw_rule_level disable",
          );
        }
      } else {
        @cmds = (
          "set $fw_rule_level disable",
        );
      }
    }
    else {
      $invalid_key = 'true';
    }
  }

  if ($invalid_key eq 'false') {
    my $err = OpenApp::Conf::run_cmd_def_session(@cmds);
    if (defined $err) {
      # print error and return
      print("<form name='customize-firewall' code=4></form>");
      exit 1;
    }
  } else {
    # print error and return
    print("<form name='customize-firewall' code=5></form>");
    exit 1;
  }

}

sub execute_reset_fw_ruleset {
  my ($zonepair, $rule) = @_;
  my $config = new Vyatta::Config;

  # get customized firewall ruleset applied to that zone_pair
  my $fw_ruleset=get_zonepair_fwruleset($zonepair);

  # delete all rules in this firewall ruleset
  my $err = OpenApp::Conf::run_cmd_def_session("delete firewall name $fw_ruleset rule",);
  if (defined $err) {
    # print error and return
    print("<form name='customize-firewall' code=6>$err</form>");
    exit 1;
  }

  my $default_fwruleset = $zonepair;
  # if LAN_to_WAN|WAN_to_LAN default ruleset - High_LAN_to_WAN|High_WAN_to_LAN
  if ($zonepair eq 'LAN_to_WAN' || $zonepair eq 'WAN_to_LAN'){
    $default_fwruleset = "High_" . $default_fwruleset;
  }

  # for all rules in default ruleset copy those rules over
  $config->setLevel("firewall name $default_fwruleset rule");
  my @rules = $config->listNodes();
  foreach my $rulenum (sort @rules) {
    my $cli_rule = new Vyatta::IpTables::Rule;
    $cli_rule->setup("firewall name $default_fwruleset rule $rulenum");

    execute_set_value ($zonepair, $rulenum, 'action', $cli_rule->{_action});

    execute_set_value ($zonepair, $rulenum, 'protocol', $cli_rule->{_protocol})
                        if defined $cli_rule->{_protocol};

    my $source_addr =
        get_srcdst_address("firewall name $default_fwruleset rule $rulenum source", 'setup');
    my $destination_addr =
        get_srcdst_address("firewall name $default_fwruleset rule $rulenum destination", 'setup');
    my $source_port =
        get_srcdst_port("firewall name $default_fwruleset rule $rulenum source", 'setup');
    my $destination_port =
        get_srcdst_port("firewall name $default_fwruleset rule $rulenum destination", 'setup');

    if (!($source_addr eq '')) {
      execute_set_value ($zonepair, $rulenum, 'saddr', $source_addr);
    }

    if (!($source_port eq '')) {
      execute_set_value ($zonepair, $rulenum, 'sport', $source_port);
    }

    if (!($destination_addr eq '')) {
      execute_set_value ($zonepair, $rulenum, 'daddr', $destination_addr);
    }

    if (!($destination_port eq '')) {
      execute_set_value ($zonepair, $rulenum, 'dport', $destination_port);
    }

    if (defined $cli_rule->{_log} && "$cli_rule->{_log}" eq "enable") {
      execute_set_value ($zonepair, $rulenum, 'log', 'Yes');
    }

    if (defined $cli_rule->{_disable}) {
      execute_set_value ($zonepair, $rulenum, 'enable', 'No');
    }

    # rules in default ruleset might be stateful. add state nodes
    my @states = qw(established new related invalid);
    foreach (@states) {
      if (defined($cli_rule->{_state}->{"_$_"})
         && $cli_rule->{_state}->{"_$_"} eq "enable") {
         $err = OpenApp::Conf::run_cmd_def_session(
                "set firewall name $fw_ruleset rule $rulenum state $_ enable",);
         if (defined $err) {
           # print error and return
           print("<form name='customize-firewall' code=99></form>");
           exit 1;
         }
      }
    }

  } # end of foreach loop
 
  # save config on reset
  $err = OpenApp::Conf::run_cmd_def_session('commit', 'save');
  if (defined $err) {
    # print error and return
    print("<form name='customize-firewall' code=1></form>");
    exit 1;
  }
}

sub get_next_rulenum {
  my $zonepair = shift;
  my $config = new Vyatta::Config;

  # get customized firewall ruleset applied to that zone_pair
  my $fw_ruleset=get_zonepair_fwruleset($zonepair);

  # get a list of all rulenums in that ruleset
  $config->setLevel("firewall name $fw_ruleset rule");
  my @rules = $config->listNodes();
  my @origrules = $config->listOrigNodes();
  my @reverse_sort_rules = reverse sort @rules;
  my @reverse_sort_origrules = reverse sort @origrules;

  my $rulenum;

  if ($reverse_sort_rules[0] >= $reverse_sort_origrules[0]) {
    $rulenum = $reverse_sort_rules[0] + 1;
  } else {
    $rulenum = $reverse_sort_origrules[0] + 1;
  }

  my $return_string = "<customize-firewall>zonepair=[$zonepair]:rulenum=[$rulenum]:</customize-firewall>";
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
# set, delete, get, order-rulenum, change-rulenum, save, cancel

# convert any capital letters to small caps to avoid any confusion
$action =~ tr/A-Z/a-z/;

# do not need any args for save
if ($action eq 'save') {
  # simply commit and save changes
  my @cmds = ('commit', 'save');
  my $err = OpenApp::Conf::run_cmd_def_session(@cmds);
  if (defined $err) {
    # print error and return
    print("<form name='customize-firewall' code=1></form>");
    exit 1;
  }
  exit;
}

# do not need any args for cancel
if ($action eq 'cancel') {
  # discard changes
  my @cmds = ('discard');
  my $err = OpenApp::Conf::run_cmd_def_session(@cmds);
  if (defined $err) {
    # print error and return
    print("<form name='customize-firewall' code=2></form>");
    exit 1;
  }
  exit;
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
# key - substr($key[0], 1), value - $value[1]

switch ($action) {
  case 'get'
  {
    # do get action here
    # get could be for 'all' rules or a specific rulenum
    execute_get ($zonepair[1], $rulenum[1]);
  }
  case 'delete-rule'
  {
    # do delete action here
    execute_delete_rule ($zonepair[1], $rulenum[1]);
  }
  case 'set'
  {
    # do set action here
    execute_set_value ($zonepair[1], $rulenum[1], substr($key[0], 1), $value[1]);
  }
  case 'reset'
  {
    # do reset action here
    execute_reset_fw_ruleset ($zonepair[1], $rulenum[1]);
  }
  case 'next-rulenum'
  {
    # get next-rulenum for new rule
    get_next_rulenum ($zonepair[1]);
  }
  else
  {
    # invalid action
    print "Invalid Action for $0\n";
    exit 1;
  }
}

exit 0;
