#!/usr/bin/perl 
use lib "/opt/vyatta/share/perl5";
use CGI; 
use Vyatta::TypeChecker;
my $cgi = new CGI; 
my $file = $cgi->param('mypcfile');
if (!Vyatta::TypeChecker::validate_restrictive_filename($file)) {
    exit 1;
}
`touch /tmp/$file`;
open(LOCAL, ">/tmp/$file") or die $!; 
while(<$file>) { 
    print LOCAL $_; 
} 
