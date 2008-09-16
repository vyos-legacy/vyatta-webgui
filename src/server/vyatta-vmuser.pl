#!/usr/bin/perl

use strict;

my $VMUSER_GRP = 'vmadmin';
my $VMUSER_ADMIN = 'admin';

if ($ARGV[0] eq '--list') {
  my $outstr = <<'EOS';
<?xml version='1.0' encoding='utf-8'?>
<vyatta>
EOS
  
  # output user listing
  my ($name, $passwd, $gid, $members) = getgrnam($VMUSER_GRP);
  if (defined($members)) {
    my @users = split /[,\s]/, $members;
    foreach (@users) {
      my ($name, $passwd, $uid, $gid, $quota, $comment, $gcos, $dir,
          $shell, $expire) = getpwnam($_);
      next if (!defined($name));
      my ($first, $last) = split / +/, $gcos;
      $outstr .= "<vmuser user='$_' last='$last' first='$first'/>\n";
    }
  }

  $outstr .= <<'EOS';
</vyatta>
EOS

  print $outstr;
  exit 0;
}

my $op = <STDIN>;

chomp $op;
$op =~ m/^([^,]+),([^,]+),([^,]*),([^,]*),(.*)$/;
my ($action, $user, $last, $first, $password) = ($1, $2, $3, $4, $5);

# check permission (only admin and self allowed)
my ($cuser) = getpwuid($>);
exit 2 if ($cuser ne $VMUSER_ADMIN && $cuser ne $user);

sub encrypt_password {
  my $p = shift;
  
  # get random salt
  my $dummy = `/usr/bin/mkpasswd -m md5 foo`;
  $dummy =~ /^(\$1\$[^\$]+\$)/;
  my $salt = $1;

  return crypt($p, $salt);
}

my $cmd = '';
if ($action eq 'add') {
  my $epassword = encrypt_password($password);
  $cmd = "sudo /usr/sbin/useradd -c '$first $last' -g $VMUSER_GRP ";
  $cmd .= "-G $VMUSER_GRP,vyattacfg,sudo -N -p '$epassword' -s /bin/false ";
  $cmd .= "$user";
} elsif ($action eq 'delete') {
  $cmd = "sudo /usr/sbin/userdel $user";
} elsif ($action eq 'change') {
  my $epassword = encrypt_password($password);
  $cmd = "sudo /usr/sbin/usermod -c '$first $last' -p '$epassword' $user";
} else {
  # invalid action
  exit 1;
}

system($cmd);
exit 3 if ($? >> 8);

exit 0;

