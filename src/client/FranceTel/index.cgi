#!/usr/bin/perl

use strict;

print "Content-type: text/html\n";

# TODO actually get BLB setting
print "Set-Cookie: dom0_blb=no\n\n";

my $ifile = '/var/www/FranceTel/ft_main.html';
my $lline = $ENV{'HTTP_COOKIE'};
if (defined($lline)) {
  $lline =~ m/(^|\W)dom0_lang=(\w+).*/;
  my $lang="$2";
  if ($lang eq 'fr') {
    $ifile = '/var/www/FranceTel/ft_main_fr.html';
  }
}

my $fd;
open($fd, '<', $ifile) or exit;
while (<$fd>) {
  print;
}
close($fd);

