package OpenApp::BLB;

use strict;
use File::Temp qw(mkstemp);
use lib '/opt/vyatta/share/perl5';
use Vyatta::Config;

my $OA_BLB_INTERFACE = 'br0';
my $OA_BLB_LEASE_FILE = "/var/lib/dhcp3/dhclient_${OA_BLB_INTERFACE}_lease";
my $OA_BLB_CONF_ROOT = 'system open-app blb-association';

### "static" functions

# return (blb_ip, err)
sub getBLBIP {
  my ($fd, $blb_ip) = (undef, undef);
  return (undef, 'Cannot find BLB DHCP lease')
    if (!open($fd, '<', $OA_BLB_LEASE_FILE));
  while (<$fd>) {
    next if (!/^new_routers='(.*)'$/);
    $blb_ip = $1;
    last;
  }
  close($fd);
  return (undef, 'Cannot find BLB IP') if (!defined($blb_ip));
  return ($blb_ip, undef); 
}

# return (blb_token, err)
sub authBLB {
  my ($user, $pass) = (@_);
  my ($blb_ip, $err) = getBLBIP();
  return (undef, $err) if (defined($err));
  my ($fh, $fname) = mkstemp('/tmp/blb-pm.XXXXXX');
  chmod(0600, $fname);
  print $fh "$user\n$pass\n$blb_ip\n";
  close($fh);
  my $blb_token = `/opt/vyatta/sbin/blb-login '$fname'`;
  my $ret = ($? >> 8);
  unlink($fname);
  return (undef, 'BLB login failed') if ($ret != 0);
  return ($blb_token, undef);
}

sub isStandalone {
  my $cfg = new Vyatta::Config;
  return (!$cfg->existsOrig("$OA_BLB_CONF_ROOT"));
}

1;

