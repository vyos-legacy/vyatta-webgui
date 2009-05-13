#!/usr/bin/perl 

use CGI; 
my $cgi = new CGI; 



#need to set header here for redirect
print $cgi->redirect("http://192.168.1.1/archive/utm.tar");
