package OpenApp::VMDeploy;

use strict;

my $VIMG_DIR = '/var/vimg';
my $NVIMG_DIR = '/var/vimg-new';
my $STATUS_FILE = 'current/status';
my $SCHED_FILE = 'current/sched';
my $HIST_FILE = 'current/hist';

### "static" functions
sub vmCheckUpdate {
  my $vid = shift;
  my $dd = undef;
  opendir($dd, "$NVIMG_DIR") or return '';
  my @v = grep { /^oa-vimg-${vid}_.*\.deb$/
                 && -f "$NVIMG_DIR/$_" } readdir($dd);
  closedir($dd);
  return '' if (!defined($v[0]));
  $v[0] =~ /^oa-vimg-${vid}_([^_]+)_all.deb$/;
  return "$1";
}

### data
my %fields = (
  _vmId => undef
);

sub new {
  my ($that, $id) = @_;
  my $class = ref ($that) || $that;
  my $self = {
    %fields,
  };

  bless $self, $class;
  $self->{_vmId} = $id;
  return ((-d "$VIMG_DIR/$id/current") ? $self : undef);
}

sub _checkSched {
  my ($self) = @_;
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  my $sched_file = "$vdir/$SCHED_FILE";
  my $fd = undef;
  open($fd, '<', "$sched_file") or return (undef, undef, undef, undef);
  my $data = <$fd>;
  chomp($data);
  my ($sched, $job, $ver, $time) = split(/ /, $data, 4);
  return ($sched, $job, $ver, $time);
}

sub _appendHist {
  my ($self, $data) = @_;
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  my $hist_file = "$vdir/$HIST_FILE";
  my $fd = undef;
  open($fd, '>>', "$hist_file") or return;
  print $fd $data;
  close($fd);
}

sub _writeSched {
  my ($self, $sched, $job, $vver, $time) = @_;
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  my $sched_file = "$vdir/$SCHED_FILE";
  my $fd = undef;
  open($fd, '>', "$sched_file") or return;
  print $fd "$sched $job $vver $time\n";
  close($fd);
}

sub _clearSched {
  my ($self) = @_;
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  my $sched_file = "$vdir/$SCHED_FILE";
  my $fd = undef;
  open($fd, '>', "$sched_file") or return;
  close($fd);
}

sub sched {
  my ($self, $ver, $time) = @_;
  my ($scheduled) = $self->_checkSched();
  return "'$self->{_vmId}' update already scheduled"
    if ($scheduled eq 'scheduled');

  # TODO schedule update

  $self->_writeSched('scheduled', '100', $ver, $time);
  # success
  return undef;
}

sub cancel {
  my ($self) = @_;
  my ($scheduled, $job, $ver, $time) = $self->_checkSched();
  return "No scheduled update for '$self->{_vmId}'"
    if ($scheduled ne 'scheduled');
  
  # TODO cancel update
  
  $self->_writeSched('cancelled', '0', $ver, $time);
  # success
  return undef;
}

sub getHist {
  my ($self) = @_;
  my @records = ();

  # get sched record
  my ($scheduled, $job, $ver, $time) = $self->_checkSched();
  if (defined($scheduled)) {
    my %shash = (
                  _time => $time,
                  _img => "$self->{_vmId} $ver",
                  _status => $scheduled,
                  _msg => ''
                );
    push @records, \%shash;
  }

  # TODO get status record
  # TODO get history records

  return \@records;
}

