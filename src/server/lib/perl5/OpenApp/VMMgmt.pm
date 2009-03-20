package OpenApp::VMMgmt;

use strict;
our @EXPORT = qw(getVMList);
use base qw(Exporter);

our $OPENAPP_ID = 'openapp';
our $OPENAPP_DNAME = 'OpenAppliance';
our $OPENAPP_SNMP_COMM = 'openappliance';

my $VMDIR = '/opt/vyatta/etc/gui/VM';
my $STATUS_DIR = '/opt/vyatta/var/run/vmstatus';

sub getVMList {
  my $dd = undef;
  opendir($dd, "$VMDIR") or return;
  my @v = grep { !/^\./ && -f "$VMDIR/$_" } readdir($dd);
  closedir($dd);
  return @v;
}

sub _lockStatus {
}

sub _unlockStatus {
}

sub updateStatus {
  my ($id, $st, $cpu, $dall, $dfree, $mall, $mfree, $upd) = @_;
  _lockStatus();
  my $fd = undef;
  open($fd, '>', "$STATUS_DIR/$id") or return;
  print $fd "$st $cpu $dall $dfree $mall $mfree $upd\n";
  close($fd);
  _unlockStatus();
}

my %fields = (
  # metadata
  _vmId => undef,
  _vmIP => undef,
  _vmWuiPort => undef,
  _vmWuiUri => undef,
  _vmImgVer => undef,
  _vmDisplayName => undef,

  # status
  _vmState => undef,
  _vmCpu => undef,
  _vmDiskAll => undef,
  _vmDiskFree => undef,
  _vmMemAll => undef,
  _vmMemFree => undef,
  _vmNewUpdate => undef
);

sub _setupMeta {
  my ($self, $id) = @_;
  if ($id eq $OPENAPP_ID) {
    # dom0
    $self->{_vmId} = $OPENAPP_ID;
    $self->{_vmDisplayName} = $OPENAPP_DNAME;
    return;
  }
  if (! -r "$VMDIR/$id") {
    return;
  }
  my $fd = undef;
  open($fd, '<', "$VMDIR/$id") or return;
  my $data = <$fd>;
  close($fd);
  chomp($data);
  my ($ip, $port, $uri, $ver, $dname) = split(/ /, $data, 5);
  $self->{_vmId} = $id;
  $self->{_vmIP} = $ip;
  $self->{_vmWuiPort} = $port;
  $self->{_vmWuiUri} = $uri;
  $self->{_vmImgVer} = $ver;
  $self->{_vmDisplayName} = $dname;
}

sub refreshStatus {
  my ($self) = @_;
  _lockStatus();
  my $id = $self->{_vmId};
  if (! -r "$STATUS_DIR/$id") {
    return;
  }
  my $fd = undef;
  open($fd, '<', "$STATUS_DIR/$id") or return;
  my $data = <$fd>;
  close($fd);
  _unlockStatus();
  chomp($data);
  my ($st, $cpu, $dall, $dfree, $mall, $mfree, $upd) = split(/ /, $data);
  $self->{_vmState} = $st;
  $self->{_vmCpu} = $cpu;
  $self->{_vmDiskAll} = $dall;
  $self->{_vmDiskFree} = $dfree;
  $self->{_vmMemAll} = $mall;
  $self->{_vmMemFree} = $mfree;
  $self->{_vmNewUpdate} = $upd;
}

sub _setup {
  my ($self, $id) = @_;
  $self->_setupMeta($id);
  $self->refreshStatus();
}

sub new {
  my ($that, $id) = @_;
  my $class = ref ($that) || $that;
  my $self = {
    %fields,
  };

  bless $self, $class;
  $self->_setup($id);
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

sub getDisplayName {
  my ($self) = @_;
  return $self->{_vmDisplayName};
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
  return $self->{_vmNewUpdate};
}

1;

