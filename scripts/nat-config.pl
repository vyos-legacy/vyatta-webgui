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
my $dnat_rules_start_at = 101;
my $dnat_rules_end_at = 500;
my $snat_rules_start_at = 601;
my $snat_rules_end_at = 1000;

sub numerically { $a <=> $b; }

sub is_valid_direction_rulenum {
  my ($direction, $rulenum) = @_;
  if ($direction eq 'incoming' &&
     ($rulenum >= $dnat_rules_start_at && $rulenum <= $dnat_rules_end_at))
  {
    return 0;
  } elsif ($direction eq 'outgoing' &&
          ($rulenum >= $snat_rules_start_at && $rulenum <= $snat_rules_end_at))
  {
    return 0;
  } else {
    return 1;
  }
}

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
        "delete $clilevel $addr_or_port",
      );
    }
  } else {
    @cmds = (
      "set $clilevel $addr_or_port $value",
    );
  }

  return @cmds;
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
    my $protocol_str = "";
    $protocol_str = ",protocol=[$cli_rule->{_proto}]";
    $protocol_str = ",protocol=[both]" if $cli_rule->{_proto} eq 'tcp_udp';
    $rule_string .= $protocol_str;
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
        next if (is_valid_direction_rulenum($direction, $rule) == 1);
        $rules_string .= get_dnat_rule ($rule);
      } elsif ($direction eq 'outgoing') {
        next if (is_valid_direction_rulenum($direction, $rule) == 1);
        # will add function to get snat rules if needed
      } else {
        # error invalid direction
        print("<form name='nat-config' code=4>Invalid NAT direction</form>");
        exit 1;
      }
    }
  } else {
      # proceed only if rule is a valid one
      if (!scalar(grep(/^$rulenum$/, @rules)) > 0) {
        print("<form name='nat-config' code=4>Invalid rule number</form>");
        exit 1;
      }

      if (is_valid_direction_rulenum('incoming', $rulenum) == 0) {
        # ask for specific dnat rule and append to $rules_string
        $rules_string .= get_dnat_rule ($rulenum);
      } elsif (is_valid_direction_rulenum('outgoing', $rulenum) == 0) {
        # ask for specific snat rule and append to $rules_string
        # will add function to get snat rules if needed
      } else {
        print "<form name='nat-config' code=4>Invalid direction and " . 
              "rule number combination</form>";
        exit 1;
      }
  }

  $return_string =  "<nat-config>direction=[$direction]" . 
                    ":$rules_string</nat-config>";
  print $return_string;
  
}

sub execute_delete_rule {
  my ($direction, $rulenum) = @_;
  my (@cmds, $err);
  if (is_valid_direction_rulenum($direction, $rulenum) == 0) {
    @cmds = ("delete service nat rule $rulenum");
    $err = OpenApp::Conf::run_cmd_def_session(@cmds);
    if (defined $err) {
      # print error and return
      print("<form name='nat-config' code=5>Error deleting NAT rule</form>");
      exit 1;
    }
  } else {
    print "<form name='nat-config' code=5>Invalid direction and " .
          "rule number combination</form>";
    exit 1;
  }  

}

sub set_dnat_rule {
  my ($rulenum, $key, $value) = @_;
  my $invalid_key='false';
  my (@cmds, $err);
  my $nat_rule_level = "service nat rule $rulenum";  

  # convert any capital letters to small caps to avoid any confusion
  $key =~ tr/A-Z/a-z/;
  if (!($key eq 'application')) {
    $value =~ tr/A-Z/a-z/ if defined $value;
  }

  switch ($key) 
  {
    case 'protocol' {
      if ($value eq 'any') {
        $value = 'all';
      }
      if ($value eq 'both') {
        $value = 'tcp_udp';
      }
      @cmds = (
         "set $nat_rule_level protocol $value",
      );
    }
    case 'application' {
      if (!$value eq '') {
        @cmds = (
         "set $nat_rule_level description $value",
        );
      } else {
        @cmds = (
         "set $nat_rule_level description Others",
        );
      }
    }
    case 'iaddr' {
      @cmds = get_addr_port_cmds(
                $value, "$nat_rule_level inside-address", 'address');
    }
    case 'iport' {
      @cmds = get_addr_port_cmds(
                $value, "$nat_rule_level inside-address", 'port');
    }
    case 'dport' {
      @cmds = get_addr_port_cmds(
                $value, "$nat_rule_level destination", 'port');
    }
    case 'enable' {
      if ($value eq 'yes') {
        my $rule = new Vyatta::NatRule;
        $rule->setup("$nat_rule_level");
        if ($rule->is_disabled()) {
          @cmds = (
            "delete $nat_rule_level disable",
          );
        }
      } else {
        @cmds = (
          "set $nat_rule_level disable",
        );
      }
    }
    else {
      $invalid_key = 'true';
    }  
  }

  if ($invalid_key eq 'false') {
    push @cmds, "set $nat_rule_level inbound-interface eth0", 
                "set $nat_rule_level type destination";  
    $err = OpenApp::Conf::run_cmd_def_session(@cmds);
    if (defined $err) {
      # print error and return
      print("<form name='nat-config' code=7>Error setting $key - $value</form>");
      exit 1;
    }
  } else {
    # print error and return
    print("<form name='nat-config' code=7>Invalid field for NAT rule - $key</form>");
    exit 1;
  }
   
}

sub execute_set_value {
  my ($direction, $rulenum, $key, $value) = @_;
  if (is_valid_direction_rulenum($direction, $rulenum) == 1) {
    print "<form name='nat-config' code=6>Invalid direction and " .
          "rule number combination</form>";
    exit 1;  
  }

  switch ($direction) 
  {
    case 'incoming' 
    {
      set_dnat_rule($rulenum, $key, $value);
    }
    case 'outgoing'
    {
      # will create a set_snat_rule when needed
    }
    else
    {
      print "<form name='nat-config' code=6>Invalid direction</form>";
      exit 1;
    }
  }  
}

sub get_next_rulenum {
  my $direction = shift;
  my $config = new Vyatta::Config;
  my $return_string;
  my ($start_rulenum, $max_rulenum);
  
  # get a list of all NAT rules
  $config->setLevel("service nat rule");
  my @rules = $config->listNodes();
  my @origrules = $config->listOrigNodes();
  my @reverse_sort_all_rules = reverse sort numerically @rules;
  my @reverse_sort_all_origrules = reverse sort numerically @origrules;
  my @reverse_sort_rules = ();
  my @reverse_sort_origrules = ();

  if ($direction eq 'incoming') {
    $start_rulenum = $dnat_rules_start_at;
    $max_rulenum = $dnat_rules_end_at;
  } elsif ($direction eq 'outgoing') {
    $start_rulenum = $snat_rules_start_at;
    $max_rulenum = $snat_rules_end_at;
  } else {
    print("<form name='nat-config' code=8>Invalid NAT direction</form>");
    exit 1;
  }

  foreach my $rule (@reverse_sort_all_rules) {
    next if (is_valid_direction_rulenum($direction, $rule) == 1);
    push @reverse_sort_rules, $rule;
  }
  foreach my $rule (@reverse_sort_all_origrules) {
    next if (is_valid_direction_rulenum($direction, $rule) == 1);
    push @reverse_sort_origrules, $rule;
  }

  my $rulenum;

  if (defined $reverse_sort_rules[0] || defined $reverse_sort_origrules[0]) {
    if (!defined $reverse_sort_rules[0]) {
      $rulenum = $reverse_sort_origrules[0] + 1;
    } elsif (!defined $reverse_sort_origrules[0]) {
      $rulenum = $reverse_sort_rules[0] + 1;
    } elsif ($reverse_sort_rules[0] >= $reverse_sort_origrules[0]) {
      $rulenum = $reverse_sort_rules[0] + 1;
    } else {
      $rulenum = $reverse_sort_origrules[0] + 1;
    }
  } else {
    $rulenum = $start_rulenum;
  }

  if ($rulenum > $max_rulenum) {
    # reorder rules to get back unused rule numbers for this direction
    my $rule_cnt = $start_rulenum;
    foreach my $rulenumber (sort numerically @reverse_sort_rules) {
      if ($rulenumber != $rule_cnt) {
        my @cmds = (
          "rule-rename nat rule $rulenumber to rule $rule_cnt",
        );
        my $err = OpenApp::Conf::run_cmd_def_session(@cmds);
        if (defined $err) {
          # print error and return
          print("<form name='nat-config' code=8>$err</form>");
          exit 1;
        }
      }
      $rule_cnt++;
    }
    @rules = $config->listNodes();
    @reverse_sort_all_rules = reverse sort numerically @rules;
    @reverse_sort_rules = ();
    foreach my $rule (@reverse_sort_all_rules) {
      next if (is_valid_direction_rulenum($direction, $rule) == 1);
      push @reverse_sort_rules, $rule;
    }

    $rulenum = $reverse_sort_rules[0] + 1;
    $return_string = "<nat-config>direction=[$direction]:rulenum=[resync-$rulenum]:</nat-config>";
    print "$return_string";
    return;
  }

  $return_string = "<nat-config>direction=[$direction]:rulenum=[$rulenum]:</nat-config>";
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
    print("<form name='nat-config' code=1>Error applying changes</form>");
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
    print("<form name='nat-config' code=2>Error cancelling changes</form>");
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
    print("<form name='nat-config' code=3>Invalid Action for $0</form>");
    exit 1;
  }
}

exit 0;
