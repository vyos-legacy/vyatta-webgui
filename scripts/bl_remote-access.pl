#!/usr/bin/perl
#
# Module: bl_remote-access.pl
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
# Description: backend<->frontend remote-access vpn
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
    'get_group'         => \&get_group,
    'set_group'         => \&set_group,
    'disable_group'     => \&disable_group,
    'delete_group'      => \&delete_group,
);

my $ravpn_log = '/tmp/remote_access_vpn';

sub ravpn_log {
    my $timestamp = strftime("%Y%m%d-%H:%M.%S", localtime);
    open my $fh, '>>', $ravpn_log
        or die "Can't open $ravpn_log: $!";
    print $fh "$timestamp: ", @_ , "\n";
    close $fh;
}

sub is_group_l2tp {
  my $group = shift;
  my $path = "vpn l2tp remote-access description";
  my $config = new Vyatta::Config;
  my $description = $config->returnValue("$path");
  if (defined $description && $description eq $group) {
    return 0; # true
  } 
  return 1;   # false
}

sub get_l2tp_grp_users {
  my $config = new Vyatta::Config;
  my $path = "vpn l2tp remote-access";
  return $config->listNodes("$path authentication local-users username");
}

sub is_l2tp_grp_disabled {
  my $config = new Vyatta::Config;
  my $path = "vpn l2tp remote-access";
  my @users = $config->listNodes("$path authentication local-users username");
  foreach my $user (@users) {
    my $user_path = "$path authentication local-users username";
    my $user_disabled = $config->exists("$user_path $user disable");
    return 1 if !defined $user_disabled; # group enabled
  }
  return 0; # group disabled
}

sub get_l2tp_grp_info {
  my $group = shift;
  my $config = new Vyatta::Config;
  my $path = "vpn l2tp remote-access";
  my $client_pool_start_ip = $config->returnValue("$path client-ip-pool start");
  my $client_pool_stop_ip = $config->returnValue("$path client-ip-pool stop");
  my $presharedkey = $config->returnValue(
                      "$path ipsec-settings authentication pre-shared-secret");
  my $is_grp_disabled = is_l2tp_grp_disabled();
  my $user_msg = "";
  my @local_users = get_l2tp_grp_users();
  foreach my $user (@local_users) {
    my $user_path = "$path authentication local-users username";
    my $user_disabled = $config->exists("$user_path $user disable");
    $user_msg .= "<user>$user</user>";
  }
  my $msg = "<remote_group>";
  $msg .= "<easy/>";
  $msg .= "<name>$group</name>";
  $msg .= "<vpnsw>Microsoft</vpnsw>";
  $msg .= "<users>" . $user_msg . "</users>";
  $msg .= "<auth>l2tp</auth>";
  $msg .= "<ipalloc><static><start>$client_pool_start_ip</start>" .
          "<stop>$client_pool_stop_ip</stop></static></ipalloc>";
  $msg .= "<iaccess>directly</iaccess>";
  $msg .= "<presharedkey>$presharedkey</presharedkey>";
  if ($is_grp_disabled == 0) {
    $msg .= "<enable>no</enable>";
  } else {
    $msg .= "<enable>yes</enable>";
  }
  $msg .= "</remote_group>";
  # add expert mode info later if it is added
  return $msg;
}

sub get_group {
  my ($data) = @_;
  my $grp_name = undef;
  my $xs  = XML::Simple->new() if defined $data;
  my $xml = $xs->XMLin($data) if defined $data;
  $grp_name = $xml->{name} if defined $data;
  my $msg;
  $msg  = "<form name='vpn remote-access get_group' code='0'>";
  my $config = new Vyatta::Config;

  if (!defined $grp_name) {
    # get l2tp remote-access vpn info
    my $l2tp_grp = $config->returnValue("vpn l2tp remote-access description");
    if (defined $l2tp_grp && !($l2tp_grp eq '')) {
      # get l2tp specific info
      $msg .= get_l2tp_grp_info($l2tp_grp);
    }
    # get XAUTH remote-access info
  } else {
    # check if L2TP group else check for XAUTH groups to get info
    if (is_group_l2tp($grp_name) == 0) {
      # get l2tp specific info
      $msg .= get_l2tp_grp_info($grp_name);
    } else {
      # get XAUTH group info
    }
  }
  
  $msg  .= "</form>";
  print $msg;
}

sub set_group {
  my ($data) = @_;
  # depending on whether group is L2TP or XAUTH, set group info
}

sub disable_group {
  my ($data) = @_;
  # 
  
}

sub delete_group {
  my ($data) = @_;
  
}

#
# main
#

my ($action, $data);
GetOptions("action=s"    => \$action,
           "data=s"      => \$data,
);

die "Error: undefined action" if ! defined $action;
my $call_func = $func{"$action"};
die "Error: undefined function" if ! defined $call_func;
if (defined $data) {
  $call_func->($data);
} else {
  $call_func->();
}
exit 0;

# end of file
