#!/usr/bin/perl

use strict;
use POSIX qw(strftime);

my $BROOT = '/backup';
my $op = shift;

if ($op eq 'backup') {
  my $vm = shift;
  exit 1 if (! -d "$BROOT/$vm"); # vm doesn't exist
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
  my $file = shift;
  $file .= '.tar.gz';
  exit 1 if (!($file =~ /^([^_]+)_(.+)\.tar\.gz$/));
  my $vm = $1;
  exit 1 if (! -f "$BROOT/$file"); # file doesn't exist
  exit 1 if (! -d "$BROOT/$vm"); # vm doesn't exist
  my $tdir = "tmp-$$";
  my $cmd = "cd $BROOT ; sg users -c ";
  $cmd .= "\"mkdir $tdir ; cd $tdir ; tar -xzf ../$file\"";
  system("$cmd");
  exit 1 if (! -d "$BROOT/$tdir/$vm"); # vm dir doesn't exist
  system("mkdir $BROOT/$vm/.restore >&/dev/null");
  exit 1 if ($? >> 8); # restore in progress
  $cmd = "sudo mv $BROOT/$tdir/$vm $BROOT/$vm/restore ; ";
  $cmd .= "sudo chown -R nobody:users $BROOT/$vm/restore";
  system("$cmd");
  
  # wait for domU restore
  my ($i, $done) = (0, 0);
  while (1) {
    sleep 1;
    if (-d "$BROOT/$vm/restore/success") {
      # success
      $done = 1;
      last;
    }
    last if (-d "$BROOT/$vm/restore/failure"); # failed
    last if ((++$i) >= 30);
  }

  system("rm -rf $BROOT/{$vm/restore,$tdir} ; rm -rf $BROOT/$vm/.restore");
  exit (($done) ? 0 : 1);
}

# invalid op
exit 1;

