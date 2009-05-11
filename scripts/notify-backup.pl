#!/usr/bin/perl 

use CGI; 
my $cgi = new CGI; 

my $conf = $cgi->param('conf');
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
    my $file = $cgi->param('file');
    
    #retrieve file
    if ($conf eq 'true') {
	`wget $file -O /tmp/restore/`;
	
	`tar xf /tmp/restore/*`;
	
	`cp /tmp/restore/config.boot /opt/vyatta/etc/config/config.boot`;
	
	`sudo chgrp vyattacfg /opt/vyatta/etc/config/config.boot`;
	
	`sudo chmod 660 /opt/vyatta/etc/config/config.boot`;
	
	`source /etc/bash_completion && /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin && /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper load && /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end`;
    }
    print '<?xml version="1.0" encoding="utf-8"?><openappliance><error><code>0</code><msg></msg></error></openappliance>';
}
exit 0;
