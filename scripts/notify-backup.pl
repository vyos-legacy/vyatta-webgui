#!/usr/bin/perl 

use CGI; 
my $cgi = new CGI; 

my $conf = $cgi->param('config');
my $data = $cgi->param('data');

#if PUT this is a restore request, GET=backup

if ($cgi->request_method() eq 'GET') { #backup request

    `rm -fr /tmp/build/*`;
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
    #retrieve file
    if ($conf eq 'true') {
	my $bufile = '/tmp/restore/bu';
	`rm -f /tmp/restore/bu`;
	`mkdir -p /tmp/restore/`;
	
	`sudo wget --no-check-certificate $file -O $bufile >&/dev/null`;
	
	if (-e $bufile) {
	    `sudo tar xf $bufile -C /tmp/restore/`;
	
	    `sudo cp /tmp/restore/tmp/build/config.boot /opt/vyatta/etc/config/config.boot`;
	    
	    `sudo chgrp vyattacfg /opt/vyatta/etc/config/config.boot`;
	    
	    `sudo chmod 660 /opt/vyatta/etc/config/config.boot`;
	    
	    `sudo sg vyattacfg  "/usr/lib/cgi-bin/web-load >&/dev/null"`;
	}
    }
    print $cgi->header(-status=>200);
    print '<?xml version="1.0" encoding="utf-8"?><openappliance><error><code>0</code><msg></msg></error></openappliance>';
}
exit 0;
