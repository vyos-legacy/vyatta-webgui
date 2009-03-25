package OpenApp::VMDeploy;

use strict;
use POSIX;
use File::Temp qw(mkdtemp);

my $VMDIR = '/opt/vyatta/etc/gui/VM';
my $VIMG_DIR = '/var/vimg';
my $NVIMG_DIR = '/var/vimg-new';
my $IMG_DIR = '/var/xen';
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

sub vmCheckPrev {
  my $vid = shift;
  my $dd = undef;
  opendir($dd, "$VIMG_DIR/$vid/prev") or return '';
  my @v = grep { /^oa-vimg-${vid}_.*\.deb$/
                 && -f "$VIMG_DIR/$vid/prev/$_" } readdir($dd);
  closedir($dd);
  return '' if (!defined($v[0]));
  $v[0] =~ /^oa-vimg-${vid}_([^_]+)_all.deb$/;
  return "$1";
}

sub _system {
  print (join(' ', @_) . "\n");
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

sub _checkStatus {
  my ($self) = @_;
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  my $st_file = "$vdir/$STATUS_FILE";
  my $fd = undef;
  open($fd, '<', "$st_file") or return (undef, undef, undef, undef);
  my $data = <$fd>;
  chomp($data);
  my ($st, $ver, $t1, $t2, $msg) = split(/ /, $data, 5);
  return ($st, $ver, "$t1 $t2", $msg);
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

sub _writeStatus {
  my ($self, $st, $vver, $time, $msg) = @_;
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  my $st_file = "$vdir/$STATUS_FILE";
  my $fd = undef;
  open($fd, '>', "$st_file") or return;
  print $fd "$st $vver $time $msg\n";
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
                  _id => "$self->{_vmId}",
                  _ver => "$ver",
                  _status => $scheduled,
                  _msg => ''
                );
    push @records, \%shash;
  }

  # get status record
  my ($st, $ver, $msg);
  ($st, $ver, $time, $msg) = $self->_checkStatus();
  if (defined($st)) {
    my %shash = (
                  _time => $time,
                  _id => "$self->{_vmId}",
                  _ver => "$ver",
                  _status => $st,
                  _msg => $msg
                );
    push @records, \%shash;
  }

  # TODO get history records

  return \@records;
}

# upgrade-specific pre-processing.
# return error message or undef if success.
sub _preUpgradeProc {
  my ($self, $vver) = @_;
  # write status
  my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
  $self->_writeStatus('upgrading', $vver, $time, '');

  # arrange new/current/prev packages
  my $new_pkg = "oa-vimg-$self->{_vmId}_${vver}_all.deb";
  my $new_dir = "$NVIMG_DIR";
  my $cur_dir = "$VIMG_DIR/$self->{_vmId}/current";
  my $prev_dir = "$VIMG_DIR/$self->{_vmId}/prev";
  
  my $cmd = "rm -f $prev_dir/oa-vimg-$self->{_vmId}_*_all.deb";
  _system($cmd);
  return 'Failed to remove previous package' if ($? >> 8);

  $cmd = "mv $cur_dir/oa-vimg-$self->{_vmId}_*_all.deb $prev_dir/";
  _system($cmd);
  return 'Failed to save current package' if ($? >> 8);

  $cmd = "mv $new_dir/$new_pkg $cur_dir/";
  _system($cmd);
  return 'Failed to move new package' if ($? >> 8);

  return undef;
}

# restore-specific pre-processing.
# return error message or undef if success.
sub _preRestoreProc {
  my ($self, $vver) = @_;
  # write status
  my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
  $self->_writeStatus('restoring', $vver, $time, '');

  # arrange current/prev packages
  my $cur_dir = "$VIMG_DIR/$self->{_vmId}/current";
  my $prev_dir = "$VIMG_DIR/$self->{_vmId}/prev";
  my $tmp_dir = mkdtemp('/tmp/restoreXXXXXX');
  
  my $cmd = "mv $cur_dir/oa-vimg-$self->{_vmId}_*_all.deb $tmp_dir/";
  _system($cmd);
  return 'Failed to move current package' if ($? >> 8);
  
  $cmd = "mv $prev_dir/oa-vimg-$self->{_vmId}_${vver}_all.deb $cur_dir/";
  _system($cmd);
  return 'Failed to move prev package' if ($? >> 8);
  
  $cmd = "mv $tmp_dir/oa-vimg-$self->{_vmId}_*_all.deb $prev_dir/";
  _system($cmd);
  return 'Failed to save current package' if ($? >> 8);
 
  rmdir($tmp_dir); 
  
  return undef;
}

# pre-install processing.
# return error message or undef if success.
sub _preInstProc {
  my ($self, $vver) = @_;
  my $cur_dir = "$VIMG_DIR/$self->{_vmId}/current";

  my $cmd = "rm -f $cur_dir/running_meta";
  _system($cmd);
  return 'Failed to remove previous state file' if ($? >> 8);
 
  # check if it is running 
  $cmd = "sudo virsh -c xen:/// domstate $self->{_vmId} >&/dev/null";
  _system($cmd);
  if ($? >> 8) {
    # not running. done.
    return undef;
  }
 
  # keep the metadata
  my $meta_file = "$VMDIR/$self->{_vmId}";
  $cmd = "cp -p $meta_file $VIMG_DIR/$self->{_vmId}/current/running_meta";
  _system($cmd);
  return 'Failed to save current state file' if ($? >> 8);

  # TODO do backup

  # stop the VM
  $cmd = '/opt/vyatta/sbin/openapp-vm-op.pl --action=stop '
         . "--vm='$self->{_vmId}'"; 
  _system($cmd);
  return 'Failed to stop VM' if ($? >> 8);
    
  return undef;
}

# install processing.
# return error message or undef if success.
sub _installProc {
  my ($self, $vver) = @_;
  
  my $new_pkg = "oa-vimg-$self->{_vmId}_${vver}_all.deb";
  my $cur_dir = "$VIMG_DIR/$self->{_vmId}/current";
  return 'Cannot find package to install' if (! -f "$cur_dir/$new_pkg");

  # install new package
  my $cmd = "dpkg -i $cur_dir/$new_pkg";
  _system($cmd);
  return 'Failed to install package' if ($? >> 8);

  # uncompress image
  my $gzimg = "$IMG_DIR/$self->{_vmId}.img.gz";
  return 'Compressed VM image not found' if (! -f "$gzimg");

  $cmd = "gzip -d $gzimg";
  _system($cmd);
  return 'Failed to extract new VM image' if ($? >> 8);

  return undef;
}

# post-install processing.
# return error message or undef if success.
sub _postInstProc {
  my ($self, $vver) = @_;
  my $cur_dir = "$VIMG_DIR/$self->{_vmId}/current";

  # start the VM
  my $cmd = '/opt/vyatta/sbin/openapp-vm-op.pl --action=start '
            . "--vm='$self->{_vmId}'"; 
  _system($cmd);
  return 'Failed to start VM' if ($? >> 8);

  # check if it was running before install
  if (! -f "$cur_dir/running_meta") {
    # wasn't running. done.
    return undef;
  }
  
  # TODO restore backup
  ## need to check vendor/backupFormat. don't restore if different.
  ## need to wait until VM can respond to restore command.
  
  return undef;
}

# perform upgrade. return error message or undef if success.
sub upgrade {
  my ($self, $vver) = @_;

  # TODO move "scheduled" entry to history.

  my $err = undef;
  while (1) {
    $err = $self->_preUpgradeProc($vver);
    last if (defined($err));
    $err = $self->_preInstProc($vver);
    last if (defined($err));
    $err = $self->_installProc($vver);
    last if (defined($err));
    $err = $self->_postInstProc($vver);
    last;
  }
  if (defined($err)) {
    # error. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('failed', $vver, $time, $err);
    return $err;
  } else {
    # success. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('succeeded', $vver, $time, '');
    return undef;
  } 
}

# perform restore. return error message or undef if success.
sub restore {
  my ($self, $vver) = @_;

  # TODO handle "sched" entry

  my $err = undef;
  while (1) {
    $err = $self->_preRestoreProc($vver);
    last if (defined($err));
    $err = $self->_preInstProc($vver);
    last if (defined($err));
    $err = $self->_installProc($vver);
    last if (defined($err));
    $err = $self->_postInstProc($vver);
    last;
  }
  if (defined($err)) {
    # error. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('failed', $vver, $time, $err);
    return $err;
  } else {
    # success. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('succeeded', $vver, $time, '');
    return undef;
  } 
}

1;
