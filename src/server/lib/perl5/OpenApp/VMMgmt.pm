package OpenApp::VMMgmt;

use strict;
use lib '/opt/vyatta/share/perl5';
use OpenApp::VMDeploy;
use Vyatta::Config;

our $OPENAPP_ID = 'openapp';
our $OPENAPP_DNAME = 'OpenAppliance';
our $OPENAPP_SNMP_COMM = 'openappliance';
our $OPENAPP_VENDOR = 'Vyatta';
our $OPENAPP_BFORMAT = '1';

our $META_DIR = '/var/oa/gui/VM';
our $LIBVIRT_DIR = '/var/oa/libvirt';

my $STATUS_DIR = '/var/run/vmstatus';
my $HWMON_FILE = '/var/run/vmstatus.hw';
my $STATUS_LOCK = "$STATUS_DIR/.lock";

my $OA_VERSION_FILE = '/opt/vyatta/etc/version';
my $OA_GRUB_CFG = '/live/image/boot/grub/grub.cfg';

my $CFG_VM_START_TIMEOUT = 'system open-app parameters vm-start-timeout';
my $CFG_VM_RESP_TIMEOUT = 'system open-app parameters vm-response-timeout';

### "static" functions
sub _lockStatus {
  system("sudo mkdir $STATUS_DIR");
  while (1) {
    system("sudo mkdir $STATUS_LOCK >&/dev/null");
    last if (!($? >> 8));
    sleep 1;
  }
}

sub _unlockStatus {
  system("sudo rmdir $STATUS_LOCK");
}

my %status_hash = (
  'starting' => 1,
  'stopped' => 1,
  'restart' => 1,
  'restart-failed' => 1,
  'out' => 1
);

sub _isValidStatus {
  my ($st) = @_;
  return 0 if (!defined($st));
  return (defined($status_hash{$st}));
}

sub _statusSet {
  my ($status, $id) = @_;
  return if (!defined($status) || !defined($id));
  return if (!_isValidStatus($status));
  return if (! -f "$STATUS_DIR/$id");
  system("sudo touch '$STATUS_DIR/.$status.$id'");
}

sub _statusRm {
  my ($status, $id) = @_;
  return if (!defined($status) || !defined($id));
  return if (!_isValidStatus($status));
  return if (! -f "$STATUS_DIR/$id");
  system("sudo rm -f '$STATUS_DIR/.$status.$id'");
}

sub _isStatus {
  my ($status, $id) = @_;
  return 0 if (!defined($status) || !defined($id));
  return 0 if (!_isValidStatus($status));
  return 0 if (! -f "$STATUS_DIR/$id");
  return (-f "$STATUS_DIR/.$status.$id");
}

sub _statusTime {
  my ($status, $id) = @_;
  return undef if (!defined($status) || !defined($id));
  return undef if (!_isValidStatus($status));
  return undef if (! -f "$STATUS_DIR/.$status.$id");
  return ((stat("$STATUS_DIR/.$status.$id"))[9]);
}

sub getVMList {
  my $dd = undef;
  opendir($dd, "$META_DIR") or return;
  my @v = grep { !/^\./ && -f "$META_DIR/$_" } readdir($dd);
  closedir($dd);
  return @v;
}

sub _getVMStartingWait {
  my $cfg = new Vyatta::Config;
  $cfg->{_active_dir_base} = '/opt/vyatta/config/active';
  my $to = $cfg->returnOrigValue($CFG_VM_START_TIMEOUT);
  return (defined($to) ? $to : 300);
}

sub _getVMStatusTimeout {
  my $cfg = new Vyatta::Config;
  $cfg->{_active_dir_base} = '/opt/vyatta/config/active';
  my $to = $cfg->returnOrigValue($CFG_VM_RESP_TIMEOUT);
  return (defined($to) ? $to : 180);
}

sub readStatus {
  my ($id) = @_;
  return () if (! -r "$STATUS_DIR/$id");
  my $fd = undef;
  open($fd, '<', "$STATUS_DIR/$id") or return ();
  my $data = <$fd>;
  close($fd);
  chomp($data);
  my ($st, $cpu, $dall, $dfree, $mall, $mfree, $upd, $crit)
    = split(/ /, $data, 8);
  return ($st, $cpu, $dall, $dfree, $mall, $mfree, $upd, $crit);
}

sub updateStatus {
  my ($id, $st, $cpu, $dall, $dfree, $mall, $mfree, $upd, $crit) = @_;
  _lockStatus();
  my ($ost) = readStatus($id); # old state
  while (1) {
    if ("$ost" ne 'up' && "$st" eq 'up') {
      # transition to up
      _statusRm('starting', $id);
      _statusRm('out', $id);
      _statusRm('restart', $id);
      _statusRm('restart-failed', $id);
      # new status will be updated below
    } elsif (_isStatus('starting', $id)) {
      # it has been starting
      my $start_wait = _getVMStartingWait();
      my $start_time = _statusTime('starting', $id);
      my $cur_time = time();
      if (($cur_time - $start_time) <= $start_wait) {
        # still starting. not updating status.
        last;
      }
      # starting should be done by now. but it's not up yet.
      # mark it as out.
      _statusRm('starting', $id);
      _statusSet('out', $id);
      # new status will be updated below
    }
    
    if (!_isStatus('out', $id) && "$ost" eq 'up' && "$st" ne 'up') {
      # transition from up. mark it as out.
      _statusSet('out', $id);
    }

    my $fd = undef;
    if (open($fd, '>', "$STATUS_DIR/$id")) {
      print $fd "$st $cpu $dall $dfree $mall $mfree $upd $crit\n";
      close($fd);
    }
    last;
  }
  _unlockStatus();
}

sub updateHwMon {
  my ($nic, $disk, $cpu, $fan) = @_;
  my $fd = undef;
  open($fd, '>', "$HWMON_FILE") or return;
  print $fd <<EOF;
nic $nic
disk $disk
cpu $cpu
fan $fan
EOF
  close($fd);
}

sub getHwMonData {
  my ($nic, $disk, $cpu, $fan) = ('unknown', 'unknown', 'unknown', 'unknown');
  my $fd = undef;
  open($fd, '<', "$HWMON_FILE") or return;
  while (<$fd>) {
    chomp;
    my @words = split(/ /);
    if ($words[0] eq 'nic') {
      $nic = $words[1];
    } elsif ($words[0] eq 'disk') {
      $disk = $words[1];
    } elsif ($words[0] eq 'cpu') {
      $cpu = $words[1];
    } elsif ($words[0] eq 'fan') {
      $fan = $words[1];
    }
  }
  close($fd);
  return ($nic, $disk, $cpu, $fan);
}

sub isValidId {
  my ($id) = @_;
  return ($id eq $OPENAPP_ID || -r "$META_DIR/$id") ? 1 : 0;
}

sub isDom0Id {
  my ($id) = @_;
  return ($id eq $OPENAPP_ID);
}

sub getDom0BootVer {
  my $fd = undef;
  return undef if (!open($fd, '<', $OA_VERSION_FILE));
  my $ver = undef;
  while (<$fd>) {
    if (/^Version +: +(.*)$/) {
      $ver = $1;
      last;
    }
  }
  close($fd);
  return $ver;
}

sub getDom0GrubDefVer {
  my $fd = undef;
  return undef if (!open($fd, '<', $OA_GRUB_CFG));
  my $defv = undef;
  my @entries = ();
  my $in_entry = 0;
  while (<$fd>) {
    if (/^set default=(\d+)$/) {
      $defv = $1;
    } elsif (/^menuentry /) {
      $in_entry = 1; 
    } elsif (/^}/) {
      $in_entry = 0; 
    } elsif ($in_entry && /^\s+multiboot \/boot\/([^\/]+)\//) {
      push @entries, $1;
    }
  }
  close($fd);
  return $entries[$defv]; # this could be undef
}

sub setDom0GrubDefVer {
  my ($newv) = @_;
  my $fd = undef;
  return undef if (!open($fd, '<', $OA_GRUB_CFG));
  my ($in_entry, $idx, $newdef) = (0, 0, undef);
  while (<$fd>) {
    if (/^menuentry /) {
      $in_entry = 1; 
    } elsif (/^}/) {
      $in_entry = 0; 
      ++$idx;
    } elsif ($in_entry && /^\s+multiboot \/boot\/([^\/]+)\//) {
        if ("$newv" eq "$1") {
          $newdef = $idx;
          last;
        }
    }
  }
  close($fd);
  if (defined($newdef)) {
    system("sudo sed -i 's/^set default=.*\$/set default=$newdef/' "
           . "$OA_GRUB_CFG");
    if ($? >> 8) {
      $newdef = undef;
    }
  }
  return $newdef;
}

sub _getLibvirtCfg {
  my ($id) = @_;
  my $dd;
  opendir($dd, "$LIBVIRT_DIR") or return '';
  my @v = grep { /^(\d\d-)?$id\.xml$/ } readdir($dd);
  closedir($dd);
  return '' if ("$v[0]" eq '');
  return "$LIBVIRT_DIR/$v[0]";
}

sub startVM {
  my ($id) = @_;

  _lockStatus();
  if (_isStatus('starting', $id)) {
    # already starting. do nothing.
    _unlockStatus();
    return;
  }
  
  _statusSet('starting', $id);
  _statusRm('stopped', $id);
  _statusRm('out', $id);
  
  # change status to unknown
  system("sudo sh -c 'echo \"unknown 0 0 0 0 0  \" >\"$STATUS_DIR/$id\"'");
  _unlockStatus();

  my $lv_cfg = _getLibvirtCfg($id);
  system("sudo virsh -c xen:/// create $lv_cfg");
}

sub _waitVmShutOff {
  my $vm = shift;
  # max 180 seconds
  for my $i (0 .. 90) {
    sleep 2;
    my $st = `sudo virsh -c xen:/// domstate $vm`;
    last if ($st =~ /shut off/ || $st =~ /error: failed to get domain/);
  }
}

sub shutdownVM {
  my ($id) = @_;
  
  _lockStatus();
  my $starting = _isStatus('starting', $id);
  _unlockStatus();
  return if ($starting); # it's starting. do nothing.

  system("sudo virsh -c xen:/// shutdown $id");
  _waitVmShutOff($id);
  system("sudo virsh -c xen:/// destroy $id");
  
  _lockStatus();
  _statusSet('stopped', $id);
  _unlockStatus();
}

sub needRestart {
  my ($id) = @_;

  my $ret = 0;
  _lockStatus();
  while (1) {
    # XXX special case:
    # if this is not UTM, and UTM is out, don't do auto-restart.
    # (can't get a domU's status if UTM is out or starting.)
    last if ("$id" ne 'utm' && (_isStatus('out', 'utm')
                                || _isStatus('starting', 'utm')));

    last if (!_isStatus('out', $id));

    my $out_time = _statusTime('out', $id);
    last if (!defined($out_time));

    my $timeout = _getVMStatusTimeout();
    my $cur_time = time();
    last if (($cur_time - $out_time) <= $timeout);

    # don't restart if already starting
    last if (_isStatus('starting', $id));
  
    # don't restart if stopped
    last if (_isStatus('stopped', $id));

    if (_isStatus('restart', $id)) {
      # already started once and never reached 'up'.
      if (!_isStatus('restart-failed', $id)) {
        # TODO log message
        _statusSet('restart-failed', $id);
      }
      last;
    }

    $ret = 1;
    last;
  }
  _unlockStatus();
  return $ret;
}

sub tryAutoRestart {
  my ($id) = @_;

  _lockStatus();
  _statusSet('restart', $id);
  _statusRm('starting', $id);
  _statusRm('stopped', $id);
  _statusRm('out', $id);
  _unlockStatus();

  shutdownVM($id);
  startVM($id);
}

### data
my %fields = (
  # metadata
  _vmId => undef,
  _vmIP => undef,
  _vmWuiPort => undef,
  _vmWuiUri => undef,
  _vmImgVer => undef,
  _vmVendor => undef,
  _vmBackupFormat => undef,
  _vmLdapFormat => undef,
  _vmStatusOid => undef,
  _vmDisplayName => undef,
  _vmDnameLang => {},

  # status
  _vmState => undef,
  _vmCpu => undef,
  _vmDiskAll => undef,
  _vmDiskFree => undef,
  _vmMemAll => undef,
  _vmMemFree => undef,
  _vmNewUpdate => undef,
  _vmCritUpdate => undef
);

sub _setupMeta {
  my ($self, $id, $meta_file) = @_;
  if ($id eq $OPENAPP_ID) {
    # dom0
    $self->{_vmId} = $OPENAPP_ID;
    $self->{_vmVendor} = $OPENAPP_VENDOR;
    $self->{_vmBackupFormat} = $OPENAPP_BFORMAT;
    $self->{_vmDisplayName} = $OPENAPP_DNAME;
    return;
  }
  my $fd = undef;
  if (defined($meta_file)) {
    open($fd, '<', "$meta_file") or return;
  } else {
    open($fd, '<', "$META_DIR/$id") or return;
  }
  my $data = <$fd>;
  my @dnames = <$fd>;
  close($fd);
  chomp($data);
  $self->{_vmDnameLang} = {};
  foreach (@dnames) {
    next if (!/^displayName\.([^:]+): +(.+)$/);
    $self->{_vmDnameLang}->{$1} = $2;
  }
  my ($ip, $port, $uri, $ver, $vend, $bform, $lform, $oid, $dname)
    = split(/ /, $data, 9);
  $self->{_vmId} = $id;
  $self->{_vmIP} = $ip;
  $self->{_vmWuiPort} = $port;
  $self->{_vmWuiUri} = $uri;
  $self->{_vmImgVer} = $ver;
  $self->{_vmVendor} = $vend;
  $self->{_vmBackupFormat} = $bform;
  $self->{_vmLdapFormat} = $lform;
  $self->{_vmStatusOid} = $oid;
  $self->{_vmDisplayName} = $dname;
}

sub refreshStatus {
  my ($self) = @_;
  _lockStatus();
  my ($st, $cpu, $dall, $dfree, $mall, $mfree, $upd, $crit)
    = readStatus($self->{_vmId});
  _unlockStatus();
  $self->{_vmState} = $st;
  $self->{_vmCpu} = $cpu;
  $self->{_vmDiskAll} = $dall;
  $self->{_vmDiskFree} = $dfree;
  $self->{_vmMemAll} = $mall;
  $self->{_vmMemFree} = $mfree;
  $self->{_vmNewUpdate} = $upd;
  $self->{_vmCritUpdate} = $crit;
}

# if $meta_file is defined, just parse the file to get the metadata
sub _setup {
  my ($self, $id, $meta_file) = @_;
  $self->_setupMeta($id, $meta_file);
  if (!defined($meta_file)) {
    $self->refreshStatus();
  }
}

sub new {
  my ($that, $id, $meta_file) = @_;
  if (!isValidId($id)) {
    return undef;
  }
  my $class = ref ($that) || $that;
  my $self = {
    %fields,
  };

  bless $self, $class;
  $self->_setup($id, $meta_file);
  return $self;
}

### getters for VM metadata
sub getId {
  my ($self) = @_;
  return $self->{_vmId};
}

sub getIP {
  my ($self) = @_;
  return $self->{_vmIP};
}

sub getWuiPort {
  my ($self) = @_;
  return $self->{_vmWuiPort};
}

sub getWuiUri {
  my ($self) = @_;
  return $self->{_vmWuiUri};
}

sub getImgVer {
  my ($self) = @_;
  return $self->{_vmImgVer};
}

sub getVendor {
  my ($self) = @_;
  return $self->{_vmVendor};
}

sub getBackupFormat {
  my ($self) = @_;
  return $self->{_vmBackupFormat};
}

sub getLdapFormat {
  my ($self) = @_;
  return $self->{_vmLdapFormat};
}

sub getStatusOid {
  my ($self) = @_;
  return $self->{_vmStatusOid};
}

sub getDisplayName {
  my ($self) = @_;
  return $self->{_vmDisplayName};
}

sub getDisplayNameLang {
  my ($self, $lang) = @_;
  return (defined($self->{_vmDnameLang}->{$lang})
          ? $self->{_vmDnameLang}->{$lang} : $self->{_vmDisplayName});
}

sub getLibvirtCfg {
  my ($self) = @_;
  return _getLibvirtCfg($self->{_vmId});
}

### getters for VM status
sub getState {
  my ($self) = @_;
  return $self->{_vmState};
}

sub getCpu {
  my ($self) = @_;
  return $self->{_vmCpu};
}

sub getDiskAll {
  my ($self) = @_;
  return $self->{_vmDiskAll};
}

sub getDiskFree {
  my ($self) = @_;
  return $self->{_vmDiskFree};
}

sub getMemAll {
  my ($self) = @_;
  return $self->{_vmMemAll};
}

sub getMemFree {
  my ($self) = @_;
  return $self->{_vmMemFree};
}

sub getUpdateAvail {
  my ($self) = @_;
  my $dep = new OpenApp::VMDeploy($self->{_vmId});
  if (defined($dep)) {
    my ($sched) = $dep->checkSched();
    my ($st) = $dep->checkStatus();
    if ("$sched" eq 'Scheduled' || "$st" eq 'Upgrading'
        || "$st" eq 'Restoring') {
      # in these cases, pretend there is no update.
      return ('', '');
    }
  }
  return ($self->{_vmNewUpdate}, $self->{_vmCritUpdate});
}

1;

