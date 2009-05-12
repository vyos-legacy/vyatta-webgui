#!/usr/bin/perl 

use CGI; 
my $cgi = new CGI; 

my $conf = $cgi->param('config');
my $data = $cgi->param('data');

#if PUT this is a restore request, GET=backup

if ($cgi->request_method() eq 'GET') { #backup request

    `rm -fr /tmp/build/.`;
    `mkdir /tmp/build/`;
    if ($conf eq 'true') {
	`cp /opt/vyatta/etc/config/config.boot /tmp/build/.`;
    }
    
    if ($conf eq 'true') {
	`cp /var/log/messages /tmp/build/.`;
    }
    
    `tar -cf /tmp/build/utm.tar /tmp/build/`;
    
    `rm /tmp/www/archive/*`;
    
    `mv /tmp/build/utm.tar /var/www/archive/.`;
    
    
    print '<?xml version="1.0" encoding="utf-8"?><openappliance><error><code>0</code><msg></msg></error></openappliance>';
}
elsif ($cgi->request_method() eq 'PUT') { #restore request
    my $params = $ENV{QUERY_STRING};
    #need to parse the params myself
    my @p = split("&",$params);
    #looking for 'file', 'config', and 'data'
    my $file;
    my $conf;
    my $data;
    foreach $p (@p) {
	my $vals;
	my @vals = split("=",$p);
	if ($vals[0] eq 'file') {
	    $file = $vals[1];
	}
	elsif ($vals[0] eq 'config') {
	    $conf = $vals[1];
	}
	elsif ($vals[0] eq 'data') {
	    $data = $vals[1];
	}
    }

#    `logger file: $file`;
#    `logger conf: $conf`;
#    `logger data: $data`;
    
    #retrieve file
    if ($conf eq 'true') {
	`sudo wget --no-check-certificate $file -O /tmp/restore/bu`;
	
	`sudo tar xf /tmp/restore/bu`;
	
	`sudo cp /tmp/build/config.boot /opt/vyatta/etc/config/config.boot`;
	
	`sudo chgrp vyattacfg /opt/vyatta/etc/config/config.boot`;
	
	`sudo chmod 660 /opt/vyatta/etc/config/config.boot`;

	`/usr/lib/cgi-bin/web-load`;

#	`sh -c "source /etc/bash_completion.d/20vyatta-cfg && /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper load"`;
#	
#	my $out = `source /etc/bash_completion.d/20vyatta-cfg`;
#	`logger "A: $out"`;
#	$out = `/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin`;
#	`logger "B: $out"`;
#	$out = `/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper load`;
#	`logger "C: $out"`;
#	$out = `/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end`;
#	`logger "D: $out"`;
    }
    print '<?xml version="1.0" encoding="utf-8"?><openappliance><error><code>0</code><msg></msg></error></openappliance>';
}
exit 0;
