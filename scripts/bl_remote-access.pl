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
  $msg .= "<mode>easy</mode>";
  $msg .= "<name>$group</name>";
  $msg .= "<vpnsw>Microsoft</vpnsw>";
  $msg .= "<users>" . $user_msg . "</users>";
  $msg .= "<groupauth>l2tp</groupauth>";
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
    # else group is not a valid one, return error code='1' with error message
  } else {
    # check if L2TP group else check for XAUTH groups to get info
    if (is_group_l2tp($grp_name) == 0) {
      # get l2tp specific info
      $msg .= get_l2tp_grp_info($grp_name);
    } else {
      # get XAUTH group info
    }
    # else group is not a valid one, return error code '1' with error message
  }
  
  $msg  .= "</form>";
  print $msg;
}

sub set_group {
  my ($data) = @_;
  my $msg = "<form name='vpn remote-access set_group' code='0'></form>";
  my $xs  = XML::Simple->new();
  my $xml = $xs->XMLin($data);
  my $grp_name = $xml->{name};
  my $err;
  my @cmds = ();
  my $wan_interface = 'eth0';
  
  # set global vpn settings
  push @cmds, "set vpn ipsec ipsec-interfaces interface $wan_interface",
              "set vpn ipsec nat-networks allowed-network 0.0.0.0/0",
              "set vpn ipsec nat-traversal enable";
  
  if ($xml->{groupauth} eq 'l2tp') {
    
    my $l2tp_path = "vpn l2tp remote-access";
    # get IP on WAN interface
    my @ip = Vyatta::Misc::getIP($wan_interface, '4');
    if (scalar(@ip) == 0) {
      # no IP on WAN interface
      $msg = "<form name='vpn remote-access set_group' code='4'></form>";
      $msg .= "<errmsg>" . "No IP address configured on WAN interface"
              . "</errmsg>";
      print $msg;
      exit 1;
    }
    my @ip_and_mask = split('/', $ip[0]);
    my $wan_ip = $ip_and_mask[0];

    # get next-hop for WAN interface
    my @next_hops = undef;
    @next_hops = `/opt/vyatta/bin/vtyshow.pl show ip route | grep -v '^C' | \
        grep '*' | grep $wan_interface | grep -v directly | awk {'print \$5'}`;
    if (scalar(@next_hops) == 0) {
      # no next-hop for WAN interface
      $msg = "<form name='vpn remote-access set_group' code='4'></form>";
      $msg .= "<errmsg>" . "No next-hop for WAN interface"
              . "</errmsg>";
      print $msg;
      exit 1;
    }
    $next_hops[0] =~ s/,//;
    my $next_hop = $next_hops[0]; # right now just get the 1st next-hop u got
    
    # set default l2tp settings
    push @cmds, "set $l2tp_path dns-servers server-1 $wan_ip",
                "set $l2tp_path outside-address $wan_ip",
                "set $l2tp_path outside-nexthop $next_hop",
                "set $l2tp_path authentication mode local";
    
    if ($xml->{mode} eq 'easy') {
      # set easy mode l2tp ipsec server
      push @cmds,
        "set $l2tp_path description $grp_name", 
        "set $l2tp_path ipsec-settings authentication mode pre-shared-secret",
        "set $l2tp_path ipsec-settings authentication pre-shared-secret $xml->{presharedkey}",
        "set $l2tp_path client-ip-pool start $xml->{ipalloc}->{static}->{start}",
        "set $l2tp_path client-ip-pool stop $xml->{ipalloc}->{static}->{stop}";
    } elsif ($xml->{mode} eq 'expert') {
      # set expert mode l2tp ipsec server
      # currently not supported so error out
      $msg = "<form name='vpn remote-access set_group' code='4'></form>";
      $msg .= "<errmsg>" . "Unsupported mode for l2tp authentication"
              . "</errmsg>";
      $msg .= "</form>";
      print $msg;
      exit 1;
    } else {
      # undefined mode, print error with code='4' and exit 1
    }
  } else {
    # group must be an XAUTH group
  }
  # else invalid group - return error code='4' with error message
  
  push @cmds, "commit", "save";
  $err = OpenApp::Conf::execute_session(@cmds);
  if (defined $err) {
    $msg = "<form name='vpn remote-access set_group' code='4'>";
    $msg .= "<errmsg>Error setting remote-access group $grp_name</errmsg>";
    $msg .= "</form>";
    print $msg;
    exit 1;
  }
  print $msg;
}

sub disable_group {
  my ($data) = @_;
  my $msg = "<form name='vpn remote-access disable_group' code='0'></form>";
  my $xs  = XML::Simple->new();
  my $xml = $xs->XMLin($data);
  my $grp_name = $xml->{name};
  my $disable = $xml->{disable};
  $disable = undef if $disable eq 'no';
  if (is_group_l2tp($grp_name) == 0) {
    my $config = new Vyatta::Config;
    my $localusers_path = "vpn l2tp remote-access authentication local-users";
    my @users = $config->listNodes("$localusers_path username");
    foreach my $user (@users) {
      my $ret = disable_enable_l2tp_user($user, $disable);
      if ($ret == 1) {
        $msg = "<form name='vpn remote-access disable_group' code='2'>";
        $msg .= "<errmsg>" . "Error disabling remote-access group $grp_name" .
                "</errmsg>";
        $msg .= "</form>";
        print $msg;
        exit 1;
      }
    }    
  } else {
    # group must be an XAUTH group
  }
  # else invalid group - return error code='2' with error message
  print $msg;
}

sub delete_group {
  my ($data) = @_;
  my $msg = "<form name='vpn remote-access delete_group' code='0'></form>";
  my $xs  = XML::Simple->new();
  my $xml = $xs->XMLin($data);
  my $grp_name = $xml->{name};
  my $err;
  my @cmds = ();
  if (is_group_l2tp($grp_name) == 0) {
    $err = OpenApp::Conf::execute_session("delete vpn l2tp", "commit", "save");
    if (defined $err) {
      $msg = "<form name='vpn remote-access delete_group' code='3'>";
      $msg .= "<errmsg>Error deleting remote-access group $grp_name</errmsg>";
      $msg .= "</form>";
      print $msg;
      exit 1;
    }
  } else {
    # group must be an XAUTH group
  }
  # else invalid group - return error code='3' with error message
  
  # TODO : delete global vpn settings if no ravpn group or site-to-site vpn
  print $msg;
}

sub disable_enable_l2tp_user {
  my ($user, $disable) = @_;
  my @cmds = ();
  my $l2tp_localusers_path =  "vpn l2tp remote-access authentication " . 
                              "local-users username";
  my $config = new Vyatta::Config;
  my @l2tp_users = $config->listNodes("$l2tp_localusers_path");
  if (scalar(grep(/^$user$/, @l2tp_users)) == 0) {
    # user not in l2tp group
    return 1;
  }

  if (defined $disable) {
    # disable user
    push @cmds, "set $l2tp_localusers_path $user disable";
  } else {
    # enable user
    push @cmds, "delete $l2tp_localusers_path $user disable" 
      if $config->exists("$l2tp_localusers_path $user  disable");
  }
  push (@cmds, "commit", "save");
  my $err = OpenApp::Conf::execute_session(@cmds);
  return 1 if defined $err;
  return 0;
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
