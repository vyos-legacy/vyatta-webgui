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
  my $lock = "$BROOT/$vm/.lock";
  while (1) {
    system("mkdir $lock >&/dev/null");
    if ($? >> 8) {
      sleep 1;
    } else {
      last;
    }
  }
  system("cd $BROOT ; tar -czf '$fname.tar.gz' '$vm'; rmdir $lock");
  exit 1 if (! -f "$BROOT/$fname.tar.gz");
  print "$fname";
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
  system("cd $BROOT ; mkdir $tdir ; cd $tdir ; tar -xzf ../$file");
  exit 1 if (! -d "$BROOT/$tdir/$vm"); # vm dir doesn't exist
  system("mkdir $BROOT/$vm/.restore >&/dev/null");
  exit 1 if ($? >> 8); # restore in progress
  system("mv $BROOT/$tdir/$vm $BROOT/$vm/restore");
  
  # wait for domU restore
  my ($i, $done, $err) = (0, 0, 'Restore failed');
  while (1) {
    sleep 1;
    if (-d "$BROOT/$vm/restore/success") {
      # success
      $done = 1;
      last;
    }
    if (-d "$BROOT/$vm/restore/failure") {
      # failed
      $err = `cat $BROOT/$vm/restore/error`;
      last;
    }
    last if ((++$i) >= 30);
  }

  system("rm -rf $BROOT/{$vm/restore,$tdir} ; rm -rf $BROOT/$vm/.restore");
  if (!$done) {
    print $err;
    exit 1;
  } else {
    exit 0;
  }
}

# invalid op
exit 1;

