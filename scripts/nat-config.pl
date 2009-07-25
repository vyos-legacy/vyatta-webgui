#!/usr/bin/perl
#
# Module: nat-config.pl
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
# Description: backend<->frontend NAT configuration script
#
# **** End License ****
#

use lib "/opt/vyatta/share/perl5";
use warnings;
use strict;
use Switch;
use Getopt::Long;
use Vyatta::Config;
use OpenApp::Conf;
use Vyatta::NatRule;
use Vyatta::IpTables::AddressFilter;


my $max_rules = 400; # each for DNAT and SNAT
my $dnat_start_rules = 101;
my $snat_start_rules = 601;

sub numerically { $a <=> $b; }

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

# get rule info for given rule
sub get_dnat_rule {
  my ($rulenum) = @_;
  my $rule_string="rulenum=[$rulenum]";
  my $level = "service nat rule $rulenum";
  
  # get application name stored in description field of rule
  my $config = new Vyatta::Config;
  $config->setLevel("$level");
  my $application = $config->returnValue('description');
  if (!defined $application) {
    $rule_string .= ",application=[Others]";
  } else {
    $rule_string .= ",application=[$application]";
  }
  
  my $cli_rule = new Vyatta::NatRule;
  $cli_rule->setup("$level");
  
  if (defined $cli_rule->{_proto}) {
    $rule_string .= ",protocol=[$cli_rule->{_proto}]";
  } else {
    $rule_string .= ",protocol=[Any]";
  }
  
  my $destination_port = get_srcdst_port("$level destination", 'setup');
  my $inside_port = get_srcdst_port("$level inside-address", 'setup');
  my $inside_addr = get_srcdst_address("$level inside-address", 'setup');
  
  $rule_string .= ",dport=[$destination_port]";
  $rule_string .= ",iport=[$inside_port]";
  $rule_string .= ",iaddr=[$inside_addr]";
  
  if (defined $cli_rule->{_disable}) {
    $rule_string .= ",enable=[No]";
  } else {
    $rule_string .= ",enable=[Yes]";
  }
  
  $rule_string .= ':'; # end of rule info
  return $rule_string;
}

sub execute_get {

  my ($direction, $rulenum) = @_;
  my $return_string;
  my $rules_string='';
  my $config = new Vyatta::Config;

  # get a list of all rulenums for the given direction
  # ask for all rules one by one and keep appending to $rules_string
  $config->setLevel("service nat rule");
  my @rules = $config->listNodes();

  if ($rulenum eq 'all') {
    # ask for all rules one by one and keep appending to $rules_string
    foreach my $rule (sort numerically @rules) {
      if ($direction eq 'incoming') {
        next if ($rule < 101 || $rule > 500); # dnat rules are from 101-500
        $rules_string .= get_dnat_rule ($rule);
      } elsif ($direction eq 'outgoing') {
        next if ($rule < 601 || $rule > 1000); # dnat rules are from 601-1000
        # will add function to get snat rules if needed
      } else {
        # error invalid direction
        print "<nat-config>Invalid direction</nat-config>";
        return;
      }
    }
  } else {
      # proceed only if rule is a valid one
      if (!scalar(grep(/^$rulenum$/, @rules)) > 0) {
        print "<nat-config>Invalid rule number</nat-config>";
        return;
      }

      if ($direction eq 'incoming' && ($rulenum > 100 && $rulenum < 501)) {
        # ask for specific dnat rule and append to $rules_string
        $rules_string .= get_dnat_rule ($rulenum);
      } elsif ($direction eq 'outgoing' &&
                ($rulenum > 600 && $rulenum < 1001)) {
        # ask for specific snat rule and append to $rules_string
        # will add function to get snat rules if needed
      } else {
        print "<nat-config>Invalid direction" .
              "and rule number combination</nat-config>";
      }
  }

  $return_string =  "<nat-config>direction=[$direction]" . 
                    ":$rules_string</nat-config>";
  print $return_string;
  
}

sub execute_delete_rule {
 my ($direction, $rulenum) = @_;

}

sub execute_set_value {
  my ($direction, $rulenum, $key, $value) = @_;
  my $invalid_key='false';
  my @cmds=();

  # convert any capital letters to small caps to avoid any confusion
  $key =~ tr/A-Z/a-z/;
}

sub get_next_rulenum {
  my $direction = shift;
  my $config = new Vyatta::Config;
  my $max_rulenum = 1000;
  my $return_string;

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
# get, set, delete-rule, next-rulenum, save, cancel

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
# 1st arg direction, 2nd arg rulenum are needed always
my @arguments=split(/\]/,$args);

my (@direction, @rulenum, @key, @value);
@direction = split(/\[/,$arguments[0]);
@rulenum = split(/\[/,$arguments[1]);
@value = split(/\[/,$arguments[2]) if defined $arguments[2];
@key = split (/\=/, $value[0]) if defined $arguments[2];

# direction - $direction[1], rulenum - $rulenum[1], 
# key - substr($key[0], 1), value - $value[1]

switch ($action) {
  case 'get'
  {
    # do get action here
    # get could be for 'all' rules or a specific rulenum
    execute_get ($direction[1], $rulenum[1]);
  }
  case 'delete-rule'
  {
    # do delete action here
    execute_delete_rule ($direction[1], $rulenum[1]);
  }
  case 'set'
  {
    # do set action here
    execute_set_value ($direction[1], $rulenum[1], substr($key[0], 1), $value[1]);
  }
  case 'next-rulenum'
  {
    # get next-rulenum for new rule
    get_next_rulenum ($direction[1]);
  }
  else
  {
    # invalid action
    print "Invalid Action for $0\n";
    exit 1;
  }
}

exit 0;
