#!/usr/bin/perl
#
# Module: openapp-user.pl
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
# Portions created by Vyatta are Copyright (C) 2007 Vyatta, Inc.
# All Rights Reserved.
# 
# Author: Michael Larson
# Date: March 2009
# Description: Script to modify user accounts
# 
# **** End License ****
#

use lib "/opt/vyatta/share/perl5/";

use warnings;
use strict;
use POSIX;
use File::Copy;
use Getopt::Long;
use OpenApp::VMMgmt;
use OpenApp::Rest;
use OpenApp::LdapUser;

my ($list, $delete, $modify, $add, $password, $oldpassword, $lastname, 
    $firstname, $email, $role, $rights)
   = (undef, undef, undef, undef, undef, undef, undef,
      undef, undef, undef, undef);

sub sendRest {
  # vm: VMMgmt object
  # method: HTTP method
  # user: username
  my ($vm, $method, $user) = @_;

  # send REST notification
  # <METHOD> http://<domU>/notifications/users/<user>
  my $ip = $vm->getIP();
  my $port = $vm->getWuiPort();
  if (!defined($ip)) {
    `logger -p alert 'dom0: Cannot send REST notification ($method $user)'`;
    return;
  }
  my $host = (("$port" eq '') ? "$ip" : "$ip:$port");
  my $url = "http://$host/notifications/users/$user";
  my $rest = new OpenApp::Rest();
  my $err = $rest->send($method, $url);
  if ($err->{_success} != 0) {
    my $msg = "REST notification error in response from $ip "
	. "($method $user)";
    if (defined $err->{_http_code}) {
	$msg .= "status=$err->{_http_code}";
    }
    `logger -p notice 'dom0: $msg'`;
  }
}

#
# Add user <account>
# Add user rights
#
sub add_user {
  if (defined($password) && defined($email) && defined($lastname) 
      && defined($firstname)) {
    # create new user
    $email =~ s/ //g; # email is ' ' if not specified.
    my $err = OpenApp::LdapUser::createUser($add, $password, $email,
                                            $lastname, $firstname);
    if (defined($err)) {
	`logger -p debug 'dom0: error adding user: $err'`;
	print "$err\n";
	exit 1;
    }
  } elsif (defined($rights)) {
    # add user right
    my $u = new OpenApp::LdapUser($add);
    if (!$u->isExisting()) {
	`logger -p debug 'dom0: user does not exist'`;
	print "User does not exist\n";
	exit 1;
    }
    my $vm = new OpenApp::VMMgmt($rights);
    if (!defined($vm)) {
	`logger -p debug 'dom0: Invalid VM ID'`;
	print "Invalid VM ID\n";
	exit 1;
    }
    my $err = $u->addRight($rights);
    if (defined($err)) {
	`logger -p debug 'dom0: Error in adding rights: $err'`;
	print "$err\n";
	exit 1;
    }

    # send REST notification
    # POST http://<domU>/notifications/users/<user>
    sendRest($vm, 'POST', $add);
  } else {
      `logger -p alert 'dom0: Invalid add command'`;
      print "Invalid \"add\" command\n";
      exit 1;
  }
  exit 0;
}

#
# Modify user password
# Modify user email
# Modify user lastname
# Modify user firstname
#
sub modify_user {
  my $u = new OpenApp::LdapUser($modify);
  if (!$u->isExisting()) {
      `logger -p debug 'dom0: user does not exist: $modify'`;
      print "User does not exist\n";
      exit 1;
  }

  my $err = undef;
  if ("$modify" eq 'installer') {
    # installer can only change password
    if (defined($email) || defined($lastname) || defined($firstname)
        || !defined($password)) {
	`logger -p alert 'dom0: Invalid modify command for installer'`;
	print "Invalid modify command for \"installer\"\n";
	exit 1;
    }
  }

  if (defined($email)) {
    $email =~ s/ //g;
    $err = $u->setMail($email); 
  } elsif (defined($lastname)) {
    $err = $u->setLast($lastname); 
  } elsif (defined($firstname)) {
    $err = $u->setFirst($firstname); 
  } elsif (defined($password)) {
    if (defined($oldpassword)) {
      # set new password
      $err = $u->setPassword($password);  
    } else {
      # password reset
      $err = $u->resetPassword();
    }
  }
  if (defined($err)) {
    print "$err\n";
    exit 1;
  }
  exit 0;
}

#
# delete user <account>
# delete user rights
#
sub del_user {
  if (defined($rights)) {
    # delete user right
    my $u = new OpenApp::LdapUser($delete);
    if (!$u->isExisting()) {
      `logger -p debug 'dom0: user does not exist'`;
      print "User does not exist\n";
      exit 1;
    }
    my $vm = new OpenApp::VMMgmt($rights);
    if (!defined($vm)) {
      `logger -p debug 'dom0: Invalid VM ID'`;
      print "Invalid VM ID\n";
      exit 1;
    }
    my $err = $u->delRight($rights);
    if (defined($err)) {
      `logger -p debug 'dom0: error removing rights: $err'`;
      print "$err\n";
      exit 1;
    }

    # send REST notification
    # PUT http://<domU>/notifications/users/<user>
    sendRest($vm, 'PUT', $delete);
  } else {
    # delete user
    my $err = OpenApp::LdapUser::deleteUser($delete);
    if (defined($err)) {
      print "$err\n";
      `logger -p alert 'dom0: error deleting user: $delete'`;
      exit 1;
    }
    # send REST notification
    # DELETE http://<domU>/notifications/users/<user>
    my @VMs = OpenApp::VMMgmt::getVMList();
    for my $vid (@VMs) {
      my $vm = new OpenApp::VMMgmt($vid);
      next if (!defined($vm));
      sendRest($vm, 'DELETE', $delete);
    }
  }
  exit 0;
}

sub list_user {
    my $cmdline = $ENV{OA_CMD_LINE};
    
    # if $list is empty then list all
    no warnings qw(uninitialized);
    my @users = ( $list );
    if ("$list" eq '') {
	my $uref = OpenApp::LdapUser::listAllUsers();
	@users = @{$uref};
    }
    if (!defined $cmdline) {
	print "VERBATIM_OUTPUT\n";
    }
    for my $u (@users) {
	my $user = new OpenApp::LdapUser($u);
	next if (!$user->isExisting());
	my $first = $user->getFirst();
	my $last = $user->getLast();
	my $mail = $user->getMail();
	my $role = $user->getRole();
	my $rights = '';
	my $rights_plain = '';
	for my $r (keys %{$user->getRights()}) {
	    $rights .= "  <rights>$r</rights>\n";
	    $rights_plain .= "$r ";
	}
    if (!defined $cmdline) {
	print "<user name='$u'>
	    <name>
	    <first>$first</first>
	    <last>$last</last>
	    </name>
	    <email>$mail</email>
	    $rights  <role>$role</role>
	    </user>";
        }
	else {
	    print "username:\t$u\n";
	    print "\tfirst:\t$first\n";
	    print "\tlast:\t$last\n";
	    print "\temail:\t$mail\n";
	    print "\trights:\t$rights_plain\n";
	    print "\trole:\t$role\n\n";
	}
    }
    exit 0;
}

####main

sub usage() {
    print "Usage: $0 --delete=<username>\n";
    print "       $0 --add=<username>\n";
    print "       $0 --list=<username>\n";
    print "       $0 --password=<password>\n";
    print "       $0 --oldpassword=<oldpassword>\n";
    print "       $0 --lastname=<lastname>\n";
    print "       $0 --firstname=<firstname>\n";
    print "       $0 --email=<email>\n";
    print "       $0 --role=<role>\n";
    print "       $0 --rights=<right>\n";
    exit 1;
}

my @delete_user = ();

# Here are the forms of the command:
#
# modify [user] [password]
# modify [user] [email]
# modify [user] [lastname]
# modify [user] [firstname]
# add [user] [password] [lastname] [firstname] [email] [role] [rights]
# add [user] [rights]
# delete [user] [rights]
# delete [user]
# list 
# list [user]


#pull commands and call command
GetOptions(
    "add=s"           => \$add,
    "modify=s"        => \$modify,
    "password=s"      => \$password,
    "oldpassword=s"   => \$oldpassword,
    "lastname=s"      => \$lastname,
    "firstname=s"     => \$firstname,
    "email=s"         => \$email,
    "role=s"          => \$role,
    "rights=s"        => \$rights,
    "delete=s"        => \$delete,
    "list:s"          => \$list,
    ) or usage();


if ( defined $modify ) {
    modify_user();
    exit 0;
}
elsif ( defined $add ) {
    add_user();
    exit 0;
}
elsif ( defined $delete ) {
    del_user();
    exit 0;
}
elsif ( defined $list ) {
    list_user();
    exit 0;
}
