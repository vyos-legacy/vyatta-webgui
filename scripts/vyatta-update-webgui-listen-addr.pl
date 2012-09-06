#!/usr/bin/perl
#
# Module: vyatta-update-webgui-listen-addr.pl
# This code was originally developed by Vyatta, Inc.
# Portions created by Vyatta are Copyright (C) 2009, 2010 Vyatta, Inc.
# All Rights Reserved.                                                                                                                                                              
# Authors: Michael Larson
# Date: 2010
# Description: updates the ssl listen configuration
#

use strict;
use warnings;
use lib "/opt/vyatta/share/perl5/";

use Vyatta::Config;


my $config = new Vyatta::Config;

my @addrs = $config->returnValues("service https listen-address");
my $http_redir = $config->returnValue("service https http-redirect");

open my $fp, ">", "/etc/lighttpd/conf-enabled/10-ssl.conf";

print $fp "## lighttpd support for SSLv2 and SSLv3\n";
print $fp "## \n";
print $fp "## Documentation: /usr/share/doc/lighttpd-doc/ssl.txt\n";
print $fp "##http://www.lighttpd.net/documentation/ssl.html \n";
print $fp "\n";
print $fp "#### SSL engine\n";
print $fp "\n";
print $fp "ssl.engine                = \"enable\"\n";
print $fp "ssl.pemfile               = \"/etc/lighttpd/server.pem\"\n";
print $fp "ssl.use-sslv2             = \"disable\"\n";

if ($#addrs >= 0) {
	print $fp "server.bind               = \"127.0.0.1\"\n";
	foreach my $addr (@addrs) {
		if ($addr =~ /:/) {
		    print $fp "\$SERVER[\"socket\"] == \"[$addr]:443\" {\n";
		}
		else {
		    print $fp "\$SERVER[\"socket\"] == \"$addr:443\" {\n";
		}
		print $fp "                  ssl.engine                  = \"enable\"\n";
		print $fp "                  ssl.pemfile                 = \"/etc/lighttpd/server.pem\"\n";
		print $fp "}\n";
		if (defined($http_redir) && $http_redir eq "enable"){
			if ($addr =~ /:/) {
				print $fp "\$SERVER[\"socket\"] == \"[$addr]:80\" {\n";
			}
			else {
				print $fp "\$SERVER[\"socket\"] == \"$addr:80\" {\n";
			}
			print $fp "                  ssl.engine                  = \"disable\"\n";
			print $fp "}\n";
		}
	}
}
else {
	if (defined($http_redir) && $http_redir eq "enable"){
		print $fp "\$SERVER[\"socket\"] == \"0.0.0.0:80\" {\n";
		print $fp "                  ssl.engine                  = \"disable\"\n";
		print $fp "}\n";
	}
}

close $fp;

exit 0;
