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
    'get_user'          => \&get_user,
    'set_user'          => \&set_user,
    'disable_user'      => \&disable_user,
    'delete_user'       => \&delete_user,
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
  my @val_description = split(':', $description) if defined $description;
  if (defined $description && $val_description[0] eq $group) {
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
  my $description = $config->returnValue("$path description");
  my @val_description = split (':', $description);
  my $mode = 'easy';
  $mode = $val_description[1] if defined $val_description[1];
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
  $msg .= "<mode>$mode</mode>";
  $msg .= "<name>$group</name>";
  $msg .= "<vpnsw>Microsoft</vpnsw>";
  $msg .= "<users>" . $user_msg . "</users>";
  $msg .= "<groupauth>l2tp</groupauth>";
  $msg .= "<ipalloc><static><start>$client_pool_start_ip</start>" .
          "<stop>$client_pool_stop_ip</stop></static></ipalloc>";
  $msg .= "<iaccess>through the OA</iaccess>";
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
    my @val_l2tp_grp = split (':', $l2tp_grp);
    if (defined $l2tp_grp && !($l2tp_grp eq '')) {
      # get l2tp specific info
      $msg .= get_l2tp_grp_info($val_l2tp_grp[0]);
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
              "set vpn ipsec nat-networks allowed-network 10.0.0.0/8",
              "set vpn ipsec nat-networks allowed-network 192.168.0.0/16",
              "set vpn ipsec nat-networks allowed-network 172.16.0.0/12",
              "set vpn ipsec nat-traversal enable";
  
  if ($xml->{groupauth} eq 'l2tp') {
    
    my $l2tp_path = "vpn l2tp remote-access";
    # get IP on WAN interface
    my @ip = Vyatta::Misc::getIP($wan_interface, '4');
    if (scalar(@ip) == 0) {
      # no IP on WAN interface
      $msg = "<form name='vpn remote-access set_group' code='4'>";
      $msg .= "<errmsg>" . "No IP address configured on WAN interface"
              . "</errmsg></form>";
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
      $msg = "<form name='vpn remote-access set_group' code='4'>";
      $msg .= "<errmsg>" . "No next-hop for WAN interface"
              . "</errmsg></form>";
      print $msg;
      exit 1;
    }
    $next_hops[0] =~ s/,//;
    my $next_hop = $next_hops[0]; # right now just get the 1st next-hop u got
    
    # start-stop range should be inside LAN subnet 
    my @lan_ips = Vyatta::Misc::getIP('eth1', '4');
    if (!defined $lan_ips[0]) {
      # no IP on LAN interface
      $msg = "<form name='vpn remote-access set_group' code='4'>";
      $msg .= "<errmsg>" . "No IP address configured on LAN interface." 
              . " Remote Access IP range should lie inside the LAN subnet" 
              . "</errmsg></form>";
      print $msg;
      exit 1;
    }
    
    my $lan_ip_object = new NetAddr::IP($lan_ips[0]);
    my $start_ip_object = new NetAddr::IP($xml->{ipalloc}->{static}->{start});
    my $stop_ip_object = new NetAddr::IP($xml->{ipalloc}->{static}->{stop});

    push @cmds, "delete vpn ipsec nat-networks allowed-network 192.168.0.0/16"
                . " exclude";
    my $lan_network = $lan_ip_object->network();
    push @cmds, "set vpn ipsec nat-networks allowed-network 192.168.0.0/16" 
                . " exclude $lan_network";    
    if ( !($lan_ip_object->contains($start_ip_object) && 
           $lan_ip_object->contains($stop_ip_object)) ) {
      # start-stop range outside of LAN subnet
      $msg = "<form name='vpn remote-access set_group' code='4'>";
      $msg .= "<errmsg>" 
              . "Remote Access IP range should lie inside the LAN subnet"
              . "</errmsg></form>";
      print $msg;
      exit 1;
    }
    
    # Remote IP start-stop range shud not overlap with LAN's DHCP range
    my $config = new Vyatta::Config;
    my $path = "service dhcp-server shared-network-name LAN subnet $lan_ips[0]";
    my @start_ip = $config->listNodes("$path start"); # shud only be one start
    if (scalar(@start_ip) > 0) {
      my $stop_ip = $config->returnValue("$path start $start_ip[0] stop");
      my $dhcp_startip_object = new NetAddr::IP($start_ip[0]);
      my $dhcp_stopip_object = new NetAddr::IP($stop_ip);
      if (  ( ($dhcp_startip_object <= $start_ip_object) && 
              ($start_ip_object <= $dhcp_stopip_object) ) 
            ||
            ( ($dhcp_startip_object <= $stop_ip_object) && 
              ($stop_ip_object <= $dhcp_stopip_object) ) 
            ||
            ( ($start_ip_object <= $dhcp_startip_object) &&
              ($dhcp_startip_object <= $stop_ip_object) )
            ||
            ( ($start_ip_object <= $dhcp_stopip_object) &&
              ($dhcp_stopip_object <= $stop_ip_object) )
         ) {      
        # remote IP range overlaps with DHCP LAN range
        $msg = "<form name='vpn remote-access set_group' code='4'>";
        $msg .= "<errmsg>"
                . "LAN DHCP range and Remote Access IP range shouldn't overlap"
                . "</errmsg></form>";
        print $msg;
        exit 1;
      }
    }
    
    # set default l2tp settings
    push @cmds, "set $l2tp_path dns-servers server-1 $wan_ip",
                "set $l2tp_path outside-address $wan_ip",
                "set $l2tp_path outside-nexthop $next_hop",
                "set $l2tp_path authentication mode local";
    
    if ($xml->{mode} eq 'easy' || $xml->{mode} eq 'expert') {
      # set l2tp ipsec server
      push @cmds,
        "set $l2tp_path ipsec-settings authentication mode pre-shared-secret",
        "set $l2tp_path ipsec-settings authentication pre-shared-secret $xml->{presharedkey}",
        "set $l2tp_path client-ip-pool start $xml->{ipalloc}->{static}->{start}",
        "set $l2tp_path client-ip-pool stop $xml->{ipalloc}->{static}->{stop}";
    } 
    
    if ($xml->{mode} eq 'easy') {
      push @cmds, "set $l2tp_path description $grp_name:easy";
    } elsif ($xml->{mode} eq 'expert') {
      push @cmds, "set $l2tp_path description $grp_name:expert";
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
    $err = OpenApp::Conf::execute_session("delete vpn l2tp", 
    "delete vpn ipsec nat-networks allowed-network 192.168.0.0/16 exclude", 
    "commit", "save");
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

sub set_user {
  my ($data) = @_;
  my $msg = "<form name='vpn remote-access set_user' code='0'></form>";
  my $xs  = XML::Simple->new();
  my $xml = $xs->XMLin($data);
  my $user = $xml->{username};
  my $user_pass = $xml->{passwd};
  my $grp_name = $xml->{groupname};
  my $err;
  my @cmds = ();

  if (is_group_l2tp($grp_name) == 0) {
    my $l2tp_users_path = "vpn l2tp remote-access authentication local-users";
    push @cmds, "set $l2tp_users_path username $user password $user_pass";
    push @cmds, "commit", "save";
    $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
      $msg = "<form name='vpn remote-access set_user' code='7'>";
      $msg .= "<errmsg>Error setting remote-access user $user</errmsg>";
      $msg .= "</form>";
      print $msg;
      exit 1;		
    }
  } else {
    # group must be an XAUTH group
  }
  # else invalid group - return error code='7' with error message
  print $msg;	
}

sub get_l2tp_user_info {
  my ($user) = @_;
  my $config = new Vyatta::Config;
  my $msg = "";
  my $l2tp_user_path =  "vpn l2tp remote-access authentication local-users" .
                        " username $user";
  $msg .= "<remote_user>";
  $msg .= "<username>$user</username>";
  my $user_pass = $config->returnValue("$l2tp_user_path password");
  $msg .= "<passwd>$user_pass</passwd>";
  my $grp_name = $config->returnValue("vpn l2tp remote-access description");
  my @val_grp_name = split (':', $grp_name);
  $msg .= "<groupname>$val_grp_name[0]</groupname>";
  my $user_disabled = $config->exists("$l2tp_user_path disable");
  $msg .= "<enable>no</enable>" if defined $user_disabled;
  $msg .= "<enable>yes</enable>" if !defined $user_disabled;
  my $user_stats = undef;
  $user_stats = `/opt/vyatta/sbin/vyatta-show-ravpn.pl \| grep \"^$user \"`;
  if (defined $user_stats && $user_stats =~ /\w/) {
    my @values = split(/\s+/, $user_stats);
    my $remoteip = $values[4];
    my $ppp_intf = $values[3];
    $msg .= "<remoteip>$remoteip</remoteip>";
    my $localip = `/opt/vyatta/bin/vyatta-show-interfaces.pl --action=show-brief | grep \"^$ppp_intf \" | awk {'print \$2'}`;
    chomp $localip;
    $msg .= "<localip>$localip</localip>";
    $msg .= "<status>connected</status>";
  } else {
    $msg .= "<remoteip></remoteip>";
    $msg .= "<localip></localip>";
    $msg .= "<status>disconnected</status>";
  }

  $msg .= "<mode>$val_grp_name[1]</mode>";
  $msg .= "</remote_user>";
  return $msg;
}

sub get_user {
  my ($data) = @_;
  my ($grp_name, $user) = (undef, undef);
  my $xs  = XML::Simple->new() if defined $data;
  my $xml = $xs->XMLin($data) if defined $data;
  $grp_name = $xml->{groupname} if defined $data;
  $user = $xml->{username} if defined $data;
  my $msg;
  $msg  = "<form name='vpn remote-access get_user' code='0'>";
  my $config = new Vyatta::Config;

  if (!defined $user && !defined $grp_name) {
    # get all remote-access users
    
    # get l2tp remote-access users
    my @l2tp_users = get_l2tp_grp_users();
    if (scalar(@l2tp_users) > 0) {
      foreach my $l2tp_user (@l2tp_users) {
        $msg .= get_l2tp_user_info($l2tp_user);
      }
    }
    
    # get XAUTH remote-access users
    
  } else {
    # get given user info
    
    if (is_group_l2tp($grp_name) == 0) {
      # get l2tp group user info
      $msg .= get_l2tp_user_info($user);      
    } else {
      # get XAUTH group user info
    }
    # else group is not a valid one, return error code '8' with error message
  }

  $msg  .= "</form>";
  print $msg;
}

sub delete_user {
  my ($data) = @_;
  my $msg = "<form name='vpn remote-access delete_user' code='0'></form>";
  my $xs  = XML::Simple->new();
  my $xml = $xs->XMLin($data);
  my $grp_name = $xml->{groupname};
  my $user = $xml->{username};
  my $err;
  my @cmds = ();
  
  if (is_group_l2tp($grp_name) == 0) {

    my $l2tp_user_path = "vpn l2tp remote-access authentication local-users";
    if (scalar(grep(/^$user$/, get_l2tp_grp_users())) == 0) {
      # user not in l2tp group
      $msg = "<form name='vpn remote-access delete_user' code='6'>";
      $msg .= "<errmsg>User $user is not a member of group $grp_name</errmsg>";
      $msg .= "</form>";
      print $msg;
      exit 1;
    }

    push @cmds, "delete $l2tp_user_path username $user", "commit", "save";
    $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
      $msg = "<form name='vpn remote-access delete_user' code='6'>";
      $msg .= "<errmsg>Error deleting remote-access user $user</errmsg>";
      $msg .= "</form>";
      print $msg;
      exit 1;
    }
  
  } else {
    # group must be an XAUTH group
  }
  # else invalid group - return error code='6' with error message

  print $msg;
}

sub disable_user {
  my ($data) = @_;
  my $msg = "<form name='vpn remote-access disable_user' code='0'></form>";
  my $xs  = XML::Simple->new();
  my $xml = $xs->XMLin($data);
  my $user = $xml->{username};
  my $grp_name = $xml->{groupname};
  my $disable = $xml->{disable};
  $disable = undef if $disable eq 'no';
  if (is_group_l2tp($grp_name) == 0) {
    my $ret = disable_enable_l2tp_user($user, $disable);
    if ($ret == 1) {
      $msg = "<form name='vpn remote-access disable_user' code='5'>";
      $msg .= "<errmsg>" . "Error disabling remote-access user $user" .
              "</errmsg>";
      $msg .= "</form>";
      print $msg;
      exit 1;
    }
  } else {
    # group must be an XAUTH group
  }
  # else invalid group - return error code='5' with error message
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
