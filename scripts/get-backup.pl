#!/usr/bin/perl 

use CGI; 
my $cgi = new CGI; 


my $conf = $cgi->param('config');
my $data = $cgi->param('data');



#need to set header here for redirect
print $cgi->redirect("http://192.168.1.1/archive/utm.tar");
