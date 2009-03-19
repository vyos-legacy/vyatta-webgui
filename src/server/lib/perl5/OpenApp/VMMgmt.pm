package OpenApp::VMMgmt;

use strict;
our @EXPORT = qw(getVMList);
use base qw(Exporter);

my $VMDIR = '/opt/vyatta/etc/gui/VM';

sub getVMList {
  my $dd = undef;
  opendir($dd, "$VMDIR") or return;
  my @v = grep { !/^\./ && -f "$VMDIR/$_" } readdir($dd);
  closedir($dd);
  return @v;
}

my %fields = (
  _vmId => undef,
  _vmIP => undef,
  _vmWuiPort => undef,
  _vmWuiUri => undef,
  _vmImgVer => undef,
  _vmDisplayName => undef
);

sub _setup {
  my ($self, $id) = @_;
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

1;

