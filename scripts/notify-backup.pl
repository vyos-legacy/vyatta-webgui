#!/usr/bin/perl 

use CGI; 
my $cgi = new CGI; 


#if POST return 302 redirect, otherwise continue
my $conf = $cgi->param('conf');
my $data = $cgi->param('data');

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


print '<?xml version="1.0" encoding="utf-8"?><openappliance><token></token><error><code>0</code><msg></msg></error></openappliance>';

exit 0;
