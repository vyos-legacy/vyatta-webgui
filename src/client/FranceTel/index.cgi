#!/usr/bin/perl

use strict;

use lib '/opt/vyatta/share/perl5';
use Vyatta::Config;

print "Content-type: text/html\n";

# get BLB setting
my $cfg = new Vyatta::Config;
## workaround: need to set this because we don't have the environment
$cfg->{_active_dir_base} = '/opt/vyatta/config/active';
my $blb = 'no';
if ($cfg->existsOrig('system open-app blb-association')) {
  $blb = 'yes';
}
print "Set-Cookie: dom0_blb=$blb; Path=/\n\n";

# get the path name from the URI
my $uri = $ENV{'REQUEST_URI'};
$uri =~ /^.*\/([^\/]+)\/[^\/]*$/;
my $dir = $1;

my $ifile = "/var/www/$dir/ft_main.html";
my $lline = $ENV{'HTTP_COOKIE'};
if (defined($lline)) {
  $lline =~ m/(^|\W)dom0_lang=(\w+).*/;
  my $lang="$2";
  if ($lang eq 'fr') {
    $ifile = "/var/www/$dir/ft_main_fr.html";
  }
}

my $fd;
open($fd, '<', $ifile) or exit;
while (<$fd>) {
  print;
}
close($fd);

