#!/usr/bin/perl

use strict;
use POSIX qw(strftime);

my $BROOT = '/backup';
my $op = shift;
my $vm = shift;
my $BPATH = "$BROOT/$vm";

exit 1 if (! -d "$BPATH");

if ($op eq 'backup') {
  my $stamp = strftime "%Y-%m-%d-%H%M%S", localtime;
  my $fname = "$vm\_$stamp";
  my $cmd = "cd $BROOT";
  $cmd .= " ; sg users -c \"tar -czf '$fname.tar.gz' '$vm'\"";
  system("$cmd");
  exit 1 if (! -f "$BROOT/$fname.tar.gz");
  exit 0;
} elsif ($op eq 'backup-list') {
  opendir(DIR, $BROOT) or exit 1;
  my @files = grep { /\.tar\.gz$/ } readdir(DIR);
  closedir(DIR);
  print "VERBATIM_OUTPUT\n";
  foreach (@files) {
    /^(.*)\.tar\.gz/;
    print "    <backup name='$1'/>\n";
  }
  exit 0;
} elsif ($op eq 'restore') {
  exit 0;
}

# invalid op
exit 1;

