#!/usr/bin/perl 

use CGI; 
my $cgi = new CGI; 



#need to set header here for redirect


##########################################################################
#
# Build out archive filename according to spec. Also build out metadata
# format and write to metadata file.
#
##########################################################################
my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst);
($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime(time);

my $am_pm='AM';
$hour >= 12 and $am_pm='PM'; # hours 12-23 are afternoon
$hour > 12 and $hour=$hour-12; # 13-23 ==> 1-11 (PM)
$hour == 0 and $hour=12; # convert day's first hour

my $date = sprintf("%02d%02d%02d",$mday,$mon+1,$year-100);
my $time = sprintf("%02dh%02d%s",$hour,$min,$am_pm);

my $datamodel = '1';

$filename = $date."_".$time."_".$datamodel;

#move filename to 
`rm -f /var/www/archive/*_1.tar`;
`mv /var/www/archive/utm.tar /var/www/archive/$filename.tar`;

print $cgi->redirect("http://192.168.1.1/archive/$filename.tar");
