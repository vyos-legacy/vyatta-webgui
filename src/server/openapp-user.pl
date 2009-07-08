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

my ($list,$delete,$modify,$add,$password,$oldpassword,$lastname,$firstname,$email,$role,$rights);

#
# Add user <account>
# Add user rights
#
sub add_user {
    #write temp file.

    my $conf_file = "/tmp/user-".$$;
#    print "$conf_file\n";
    open(FILE, ">$conf_file") or die "Can't open temp user file"; 
	
    if (defined($password) && $password ne NULL && defined($email) && $email ne NULL && defined($lastname) && $lastname ne NULL && defined($firstname) && $firstname ne NULL) {

	print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "replace: userPassword\n";
	my @output = `/usr/sbin/slappasswd -s $password`;
	print FILE "userPassword: ".$output[0]."\n";
	print FILE "\n";
	print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "replace: description\n";
	print FILE "description: user\n";
	print FILE "\n";
	print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "replace: mail\n";
	print FILE "mail: ".$email."\n";
	print FILE "\n";
	print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "replace: surname\n";
	print FILE "surname: ".$lastname."\n";
	print FILE "\n";
	print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "replace: commonname\n";
	print FILE "commonname: ".$firstname."\n";
	
	close FILE;
	
	#first add the user
	system("ldapadduser $add operator");
	
	#post message to all registered VMs:
	#POST /notifications/users/[username]

	
	
    }
    elsif (defined($rights) && $rights ne NULL){
	#need to validate entry here!
	my @VMs = OpenApp::VMMgmt::getVMList();
	my $vm = new OpenApp::VMMgmt($rights);
	if (defined($vm) && $vm ne NULL) {
	    #modify rights on local system
	    print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	    print FILE "changetype: modify\n";
	    print FILE "add: memberUid\n";
	    print FILE "memberUid: ".$rights."\n";

	    my $ip = $vm->getIP();
	    my $port = $vm->getWuiPort();
	    if (defined $ip && $ip ne '') {
		my $cmd;
		if (defined $port && $port ne '') {
		    $cmd = "http://$ip:$port/notifications/users/$add";
		}
		else {
		    $cmd = "http://$ip/notifications/users/$add";
		}
		my $obj = new OpenApp::Rest();
		my $err = $obj->send("POST",$cmd);
		if ($err->{_success} != 0) {
		    `logger 'Rest notification error in response from $ip when adding user $add, $err->{_http_code}'`;
		}
	    }
	}
    }
    #now modify the account
    system("ldapmodify -x -D \"cn=admin,dc=localhost,dc=localdomain\" -w admin -f $conf_file");
    #clean up temp file here.
    unlink($conf_file);
}

#
# Modify user password
# Modify user email
# Modify user lastname
# Modify user firstname
#
sub modify_user {
    #write temp file.
    my $conf_file = "/tmp/user-".$$;

#    print "$conf_file\n";

    open(FILE, ">$conf_file") or die "Can't open temp user file"; 

    print FILE "dn: uid=".$modify.",ou=People,dc=localhost,dc=localdomain\n";
    print FILE "changetype: modify\n";
    if (defined($email) && $email ne NULL) {
	print FILE "replace: mail\n";
	print FILE "mail: ".$email."\n";
    }
    elsif (defined($lastname) && $lastname ne NULL) {
	print FILE "replace: surname\n";
	print FILE "surname: ".$lastname."\n";
    }
    elsif (defined($firstname) && $firstname ne NULL) {
	print FILE "replace: commonname\n";
	print FILE "commonname: ".$firstname."\n";
    }
    elsif (defined($password) && $password ne NULL) {
	if (defined($oldpassword) && $oldpassword ne NULL) {
	    if ($modify eq 'installer') {
		#go through system cmds
                my $epass = `mkpasswd -m md5 '$password'`;
                chomp($epass);
                system("usermod -p '$epass' installer");
	    }
	    else {
		my $err = system(" ldappasswd -x -w admin -D \"cn=admin,dc=localhost,dc=localdomain\" -a '$oldpassword' -s '$password' -S \"uid=$modify,ou=People,dc=localhost,dc=localdomain\"");
		close FILE;
		unlink($conf_file);
		if ($err != 0) {
		    exit 1;
		}
		return;
	    }
	}
	else {
	    #this is a reset operation then
	    if ($modify eq 'installer') {
		#go through system cmds
                my $epass = `mkpasswd -m md5 installer`;
                chomp($epass);
                system("usermod -p '$epass' installer");
	    }
	    else {
		my $err = system(" ldappasswd -x -w admin -D \"cn=admin,dc=localhost,dc=localdomain\" -s '$password' -S \"uid=$modify,ou=People,dc=localhost,dc=localdomain\"");
		close FILE;
		unlink($conf_file);
		if ($err != 0) {
		    exit 1;
		}
		return;
	    }
	}
    }
    print FILE "\n";

    close FILE;

    #now modify the account
    system("ldapmodify -x -D \"cn=admin,dc=localhost,dc=localdomain\" -w admin -f $conf_file");
    #clean up temp file here.
    unlink($conf_file);
}

#
# delete user <account>
# delete user rights
#
sub del_user {
    # post notification to VMs: 
    # DELETE /notifications/users/[username]
    if (defined($rights) && $rights ne NULL) {
	my $conf_file = "/tmp/user-".$$;
#    print "$conf_file\n";
	open(FILE, ">$conf_file") or die "Can't open temp user file"; 
	
	#modify rights on local system
	print FILE "dn: uid=".$delete.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "delete: memberUid\n";
	print FILE "memberUid: ".$rights."\n";

	close FILE;
	
	#first add the user
	system("ldapmodify -x -D \"cn=admin,dc=localhost,dc=localdomain\" -w admin -f $conf_file");

	my @VMs = OpenApp::VMMgmt::getVMList();
	my $vm = new OpenApp::VMMgmt($rights);
	my $ip = undef;
	my $port;
	if (defined($vm)) {
	    $ip = $vm->getIP();
	    $port = $vm->getWuiPort();
	}
	if (defined $ip && $ip ne '') {
	    my $cmd;
	    if (defined $port && $port ne '') {
		$cmd = "http://$ip:$port/notifications/users/$delete";
	    }
	    else {
		$cmd = "http://$ip/notifications/users/$delete";
	    }
	    my $obj = new OpenApp::Rest();
	    my $err = $obj->send("PUT",$cmd);
	    if ($err->{_success} != 0) {
		`logger 'Rest notification error in response from $ip when removing user $delete, $err->{_http_code}'`;
	    }
	}

    }
    else {
	system("ldapdeleteuser $delete");
	my @VMs = OpenApp::VMMgmt::getVMList();
	for my $vid (@VMs) {
	    my $vm = new OpenApp::VMMgmt($vid);
	    if (defined($vm)) {
		my $ip = $vm->getIP();
		my $port = $vm->getWuiPort();
		if (defined $ip && $ip ne '') {
		    my $cmd;
		    if (defined $port && $port ne '') {
			$cmd = "http://$ip:$port/notifications/users/$delete";
		    }
		    else {
			$cmd = "http://$ip/notifications/users/$delete";
		    }
		    my $obj = new OpenApp::Rest();
		    my $err = $obj->send("DELETE",$cmd);
		    if ($err->{_success} != 0) {
			`logger Rest notification error in response from $ip when deleting user $delete, $err->{_http_code}'`;
		    }
		}
	    }
	}
    }
}

sub list_user {
    #if $list is empty then list all
#
    print "VERBATIM_OUTPUT\n";
    
    if ($list eq '') {
	my $users = OpenApp::LdapUser::listAllUsers();
	for my $u (@{$users}) {
	    my $user = new OpenApp::LdapUser($u);
	    
	    print "<user name='".$user->getName()."'>";
	    print "<name>";
	    print "<first>".$user->getFirst()."</first>";
	    print "<last>".$user->getLast()."</last>";
	    print "</name>";
	    print "<email>".$user->getMail()."</email>";
	    for my $r (keys %{$user->getRights()}) {
		print "<rights>$r</rights>";
	    }
	    print "<role>".$user->getRole()."</role>";
	    print "</user>";
	}
    }
    else {
	my $user = new OpenApp::LdapUser($list);
	print "<user name='".$user->getName()."'>";
	print "<name>";
	if (defined $user->getFirst()) {
	    print "<first>".$user->getFirst()."</first>";
	}
	else {
	    print "<first></first>";
	}

	if (defined $user->getLast()) {
	    print "<last>".$user->getLast()."</last>";
	}
	else {
	    print "<last></last>";
	}
	print "</name>";
	if (defined $user->getMail()) {
	    print "<email>".$user->getMail()."</email>";
	}
	else {
	    print "<email></email>";
	}
	for my $r (keys %{$user->getRights()}) {
	    print "<rights>$r</rights>";
	}
	print "<role>".$user->getRole()."</role>";
	print "</user>";
    }
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
