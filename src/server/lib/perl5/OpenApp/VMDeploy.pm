package OpenApp::VMDeploy;

use strict;
use POSIX;
use File::Temp qw(mkdtemp);
use File::Copy 'mv';
use OpenApp::VMMgmt;

my $VIMG_DIR = '/var/oa/vimg';
my $NVIMG_DIR = '/var/oa/vimg-new';
my $CVIMG_DIR = '/var/oa/vimg-critical';
my $IMG_DIR = '/var/oa/xen';
my $LDAP_ROOT = '/var/oa/ldap';
my $STATUS_FILE = 'current/status';
my $SCHED_FILE = 'current/sched';
my $HIST_FILE = 'current/hist';
my $RUNNING_FILE = 'current/running_meta';

my $UPD_URG_CONTROL = 'OA-Update-Urgency';
my $CRITICAL_UPDATE_AUTO_INST_INTVL = 3600 * 24; # 24 hours

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

sub _checkSched {
  my ($vid) = @_;
  my $vdir = "$VIMG_DIR/$vid";
  my $sched_file = "$vdir/$SCHED_FILE";
  my $fd = undef;
  open($fd, '<', "$sched_file") or return (undef, undef, undef, undef);
  my $data = <$fd>;
  chomp($data);
  my ($sched, $job, $ver, $time) = split(/ /, $data, 4);
  return ($sched, $job, $ver, $time);
}

sub time2epoch {
  my ($t) = @_;
  if ($t eq 'now') {
    return time;
  }
  if (!($t =~ /^(\d+):(\d+) (\d+)\.(\d+)\.0?(\d)$/)) {
    return undef;
  }
  my ($h, $m, $D, $M, $Y) = ($1, $2, $3, $4, $5);
  return POSIX::strftime('%s', 0, $m, $h, $D, $M - 1, $Y + 100);
}

sub epoch2time {
  my ($e) = @_;
  return POSIX::strftime('%H:%M %d.%m.%y', localtime($e));
}

sub isCriticalPkg {
  my ($vid, $ver) = @_;
  my $vimg = "$NVIMG_DIR/oa-vimg-${vid}_${ver}_all.deb";
  return 0 if (! -r "$vimg");
  my $urg = `dpkg-deb -f $vimg $UPD_URG_CONTROL`;
  chomp $urg;
  return (($urg =~ /^critical/) ? 1 : 0);
}

sub isCriticalUpdate {
  my ($vid, $ver) = @_;
  my $vimg = "$NVIMG_DIR/oa-vimg-${vid}_${ver}_all.deb";
  my $ln = "$CVIMG_DIR/oa-vimg-${vid}_${ver}_all.deb";
  return ((-r "$vimg" && -l "$ln") ? 1 : 0);
}

sub recordCriticalUpdate {
  my ($vid, $ver) = @_;
  my $vimg = "oa-vimg-${vid}_${ver}_all.deb";
  return if (! -r "$NVIMG_DIR/$vimg"); # package doesn't exist
  return if (-l "$CVIMG_DIR/$vimg"); # already recorded
  symlink("$NVIMG_DIR/$vimg", "$CVIMG_DIR/$vimg");
}

sub recordCriticalUpdates {
  my $uref = getUpdateList();
  for my $aref (@{$uref}) {
    my ($vmid, $ver) = @{$aref};
    next if (!OpenApp::VMMgmt::isValidId($vmid));
    next if (!isCriticalPkg($vmid, $ver));
    # we've got a critical update package.
    # record it, i.e., keep the receive time. if it's already recorded,
    # this should be nop.
    recordCriticalUpdate($vmid, $ver);
  }
}

sub getCritUpdateDeadline {
  my ($vid, $ver) = @_;
  my $ln = "$CVIMG_DIR/oa-vimg-${vid}_${ver}_all.deb";
  my $mtime = (lstat($ln))[9];
  return ($mtime + $CRITICAL_UPDATE_AUTO_INST_INTVL);
}

sub getCritUpdateInstList {
  my $dd = undef;
  opendir($dd, "$CVIMG_DIR") or return [];
  my @V = grep { /^oa-vimg-.*\.deb$/
                 && -l "$CVIMG_DIR/$_" } readdir($dd);
  closedir($dd);

  my @ret = ();
  my $curtime = time;
  for my $v (@V) {
    my @st;
    if (!(@st = stat("$CVIMG_DIR/$v"))) {
      # update no longer there (probably installed). clean it up.
      unlink("$CVIMG_DIR/$v");
      next;
    }

    $v =~ /^oa-vimg-([^_]+)_([^_]+)_all.deb$/;
    my ($vid, $ver) = ($1, $2);
    
    my ($sched, $job, $sver, $time) = _checkSched($vid);
    # skip it if this particular version is already scheduled.
    next if ($sched eq 'Scheduled' && $sver eq $ver);
    # TODO define how to handle scenario where a different version is
    # scheduled. for now install the critical update anyway.

    my $dl = getCritUpdateDeadline($vid, $ver);
    next if ($curtime < $dl); # not yet

    # the critical update was received more than X seconds ago (X is the
    # fixed interval for critical update auto install). return it to be
    # installed.
    push @ret, [ $vid, $ver ];
  }
  return \@ret;
}

sub getUpdateList {
  my $dd = undef;
  opendir($dd, "$NVIMG_DIR") or return [];
  my @V = grep { /^oa-vimg-.*\.deb$/
                 && -f "$NVIMG_DIR/$_" } readdir($dd);
  closedir($dd);
  my @ret = ();
  for my $v (@V) {
    $v =~ /^oa-vimg-([^_]+)_([^_]+)_all.deb$/;
    push @ret, [ $1, $2 ];
  }
  return \@ret;
}

sub installNewVM {
  my ($vid, $ver) = @_;
  my $vimg = "oa-vimg-${vid}_${ver}_all.deb";
  return "VM $vid version $ver does not exist" if (! -r "$NVIMG_DIR/$vimg");

  my $vdir = "$VIMG_DIR/$vid";
  # ignore any mkdir errors
  mkdir($vdir);
  mkdir("$vdir/current");
  mkdir("$vdir/prev");

  return "Failed to move package file: $!"
    if (!mv("$NVIMG_DIR/$vimg","$vdir/current"));

  # install package
  system("dpkg -i $vdir/current/$vimg");
  return "Failed to install package $vdir/current/$vimg" if ($? >> 8);
 
  # run postinst 
  return oaVimgPostinst($vid, 'NONE');
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

sub _inChroot {
  return (-r '/proc/version') ? 0 : 1;
}

my $ldap_init = '/etc/init.d/slapd';
sub _startLdapServer {
  # don't do it in chroot
  return undef if (_inChroot());

  my $cmd = "$ldap_init start";
  _system($cmd);
  return 'Cannot start LDAP server' if ($? >> 8);
  return undef;
}
sub _stopLdapServer {
  # don't do it in chroot
  return undef if (_inChroot());

  my $cmd = "$ldap_init stop";
  _system($cmd);
  return 'Cannot stop LDAP server' if ($? >> 8);
  return undef;
}

# LDAP-related postinst tasks
# $1: vmid
# $2: previous metadata file ('NONE' if new install)
sub _postinstLdap {
  my ($vid, $prev_meta) = @_;
  my $cur_meta = "$OpenApp::VMMgmt::META_DIR/$vid";
  
  # default (e.g., new install) assume prev ldapFormat is NONE
  my $prev_lform = 'NONE';
  if (defined($prev_meta) && $prev_meta ne 'NONE' && -r "$prev_meta") {
    my $prev = new OpenApp::VMMgmt($vid, $prev_meta);
    $prev_lform = $prev->getLdapFormat();
  }

  return 'Cannot find current VM metadata' if (! -r "$cur_meta");
  my $cur = new OpenApp::VMMgmt($vid, $cur_meta);
  my $cur_lform = $cur->getLdapFormat();
  
  if ($prev_lform eq 'NONE' && $cur_lform eq 'NONE') {
    # neither uses LDAP. done.
    return undef;
  }
 
  if ($prev_lform eq $cur_lform) {
    # both use LDAP and ldapFormat has not changed. no further action needed.
    return undef;
  }
 
  my $server_conf = '/etc/ldap/slapd.conf';
  my $domU_confdir = '/etc/ldap/domU';
  my $domU_conf = "$domU_confdir/$vid.conf";
  my $domU_dbdir = "/var/oa/ldap/$vid/db";
  my ($cmd, $err) = (undef, undef);
  
  if ($prev_lform ne 'NONE' && $cur_lform eq 'NONE') {
    # used LDAP before but now does not.
    ## remove generated config
    $cmd = "rm -f $domU_conf";
    _system($cmd);
    return 'Cannot remove domU LDAP configuration' if ($? >> 8);

    ## remove include from server config
    $cmd = "sed -i '/^# BEGIN $vid/,/^# END $vid/{d}' $server_conf"; 
    _system($cmd);
    return 'Cannot remove previous LDAP server config' if ($? >> 8);

    ## stop LDAP server
    $err = _stopLdapServer();
    return $err if (defined($err));

    ## remove sub-database
    $cmd = "rm -rf $domU_dbdir";
    _system($cmd);
    return 'Cannot remove domU LDAP sub-database' if ($? >> 8);
    
    ## start LDAP server
    $err = _startLdapServer();
    return $err if (defined($err));

    return undef;
  }

  # at this point there are two scenarios left.
  #   1. prev == NONE and cur != NONE (e.g., new install)
  #   2. neither is NONE and prev != cur (ldapFormat changed)
  
  # either way, generate the domU config first.
  my $ip = $cur->getIP();
  my $icfg = "$LDAP_ROOT/$vid/include.conf";
  my $ocfg = "$LDAP_ROOT/$vid/other.conf";
  my ($inc, $other) = ('', '');
  if (-r "$icfg") {
    $inc =<<EOF
include $icfg
EOF
  }
  if (-r "$ocfg") {
    $other =<<EOF
include $ocfg
EOF
  } else {
    $other =<<EOF;
index objectClass eq
access to *
  by peername.regex=IP:$ip write
EOF
  }

  if (! -d $domU_confdir) {
    mkdir($domU_confdir) or return 'Cannot create domU LDAP config directory';
  }

  my $fd = undef;
  open($fd, '>', $domU_conf) or return 'Cannot generate domU LDAP config';
  print $fd <<EOF;
database hdb
suffix "dc=$vid,dc=localdomain"
rootdn "cn=admin,dc=$vid,dc=localdomain"
directory "$domU_dbdir"
dbconfig set_cachesize 0 2097152 0
${inc}${other}
EOF
  close($fd);

  # add 'include' to server config
  $cmd = "sed -i '/^# BEGIN $vid/,/^# END $vid/{d}' $server_conf"; 
  _system($cmd);
  return 'Cannot remove previous LDAP server config' if ($? >> 8);
  open($fd, '>>', $server_conf) or return 'Cannot modify LDAP server config';
  print $fd <<EOF;
# BEGIN $vid
include $domU_conf
# END $vid
EOF
  close($fd);
  
  # stop LDAP server
  $err = _stopLdapServer();
  return $err if (defined($err));

  # remove sub-database if exists
  if (-d "$domU_dbdir") {
    $cmd = "rm -rf $domU_dbdir";
    _system($cmd);
    return 'Cannot remove domU LDAP sub-database' if ($? >> 8);
  }

  # create sub-database dir
  if (! -d $domU_dbdir) {
    mkdir($domU_dbdir) or return 'Cannot create domU LDAP sub-database';
  }

  # create initial db if it's new install and init.ldif is provided
  my $initdb = "$LDAP_ROOT/$vid/init.ldif";
  if ($prev_lform eq 'NONE' && -r "$initdb") {
    $cmd = "slapadd -b 'dc=$vid,dc=localdomain' -l $initdb";
    _system($cmd);
    return 'Cannot initialize domU LDAP sub-database' if ($? >> 8);
  }

  # set db permission
  $cmd = "chown -R openldap:openldap $domU_dbdir"; 
  _system($cmd);
  return 'Cannot set domU LDAP sub-database permissions' if ($? >> 8);
  
  ## start LDAP server
  $err = _startLdapServer();
  return $err if (defined($err));

  # done
  return undef;  
}

# notify lighttpd to reconfigure reverse proxy
sub _notifyWuiProcess {
  my $LIGHTTPD_PID_FILE = '/var/run/lighttpd.pid';
  return if (! -r "$LIGHTTPD_PID_FILE");
  my $fd = undef;
  open($fd, '<', $LIGHTTPD_PID_FILE) or return;
  my $pid = <$fd>;
  close($fd);
  chomp($pid);
  kill('USR2', $pid);
}

# WUI-related postinst tasks
sub _postinstWui {
  # notify lighttpd to reconfigure reverse proxy
  _notifyWuiProcess();

#  _configureDomUAccess();
 
  # done 
  return undef;
}

sub _configureDomUAccess {
    my @VMs = OpenApp::VMMgmt::getVMList();

    my $fd_read;
    my $fd_write;
    if (open($fd_read, '<', "/etc/lighttpd/lighttpd.conf")) {
	#need to replace entry already there...
	if (open($fd_write, '>', "/etc/lighttpd/lighttpd.conf.lck")) {
	    my @in = <$fd_read>;
	    my $in;
	    my $write_out = "true";
	    for $in (@in) {
		if ($in =~ "^####vmaccesslist-start####") {
		    $write_out = "false";
		}
		elsif($in =~ "^####vmaccesslist-end####") {
		    $write_out = "true";
		    next;
		}
		if ($write_out eq "true") {
		    print $fd_write $in;
		}
	    }
	    #now prepend our vm access list section
	    print $fd_write "####vmaccesslist-start####\n";
	    my $vid;
	    for $vid (@VMs) {
		my $vm = new OpenApp::VMMgmt($vid);
		next if (!defined($vm));
		
		#need to escape out the ip address for perl processing
		my $domU = $vm->getIP();
		$domU =~ s/\./\\\./g;

		print $fd_write "\$HTTP[\"remoteip\"] !~ \"(".$domU.")\" {\n";
		print $fd_write "\t\$HTTP[\"url\"] =~ \"^/".$vm->getId()."-root/\" {\n";
		print $fd_write "\t\turl.access-deny = (\"\")\n";
		print $fd_write "\t}\n";
		print $fd_write "}\n";
	    }
	    print $fd_write "####vmaccesslist-end####\n";
	}
    }
    
    #now restart the server
    `cp /etc/lighttpd/lighttpd.conf.lck /etc/lighttpd/lighttpd.conf`;
    `/etc/init.d/lighttpd restart`;
}

# generic postinst tasks for oa-vimg packages
# $1: vmid
# $2: previous metadata file ('NONE' if new install)
# return error message or undef if success
sub oaVimgPostinst {
  my ($vid, $prev_meta) = @_;
  
  # remove previous image
  my $img = "$IMG_DIR/$vid.img";
  my $cmd = "rm -f $img";
  _system($cmd);
  return 'Failed to remove previous VM image' if ($? >> 8);

  # uncompress image
  my $gzimg = "$IMG_DIR/$vid.img.gz";
  return 'Compressed VM image not found' if (! -f "$gzimg");

  $cmd = "gzip -f -d $gzimg";
  _system($cmd);
  return 'Failed to extract new VM image' if ($? >> 8);

  # do LDAP-related tasks
  my $err = _postinstLdap($vid, $prev_meta);
  return $err if (defined($err));

  # do WUI-related tasks
  $err = _postinstWui();
  return $err if (defined($err));

  return undef;
}

my $debug_log = '';

sub _system {
  my $cmd = $_[0];
  if ("$debug_log" ne '') {
    $cmd .= " >>$debug_log 2>&1";
    my $fd = undef;
    if (open($fd, '>>', $debug_log)) {
      print $fd "$cmd\n";
      close($fd);
    }
  } else {
    $cmd .= ' >&/dev/null';
  }
  system($cmd);
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

sub checkSched {
  my ($self) = @_;
  return _checkSched($self->{_vmId});
}

sub checkStatus {
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
  # TODO move sched entry to history?
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  my $sched_file = "$vdir/$SCHED_FILE";
  my $fd = undef;
  open($fd, '>', "$sched_file") or return;
  print $fd "$sched $job $vver $time\n";
  close($fd);
}

sub _writeStatus {
  my ($self, $st, $vver, $time, $msg) = @_;
  # TODO move status entry to history?
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
  my ($scheduled) = $self->checkSched();
  return "'$self->{_vmId}' update already scheduled"
    if ($scheduled eq 'Scheduled');

  if (isCriticalUpdate($self->{_vmId}, $ver)) {
    # critical update. make sure scheduled time is before the deadline.
    my $dl = getCritUpdateDeadline($self->{_vmId}, $ver);
    my $stime = time2epoch($time);
    my $deadline = epoch2time($dl);
    if (!defined($stime) || $stime > $dl) {
      $time = $deadline;
    }
  }

  # schedule update
  my $upg_cmd = '/opt/vyatta/sbin/openapp-vm-upgrade.pl --action=upgrade '
                . " --vm=\"$self->{_vmId}\" --ver=\"$ver\"";
  my @atouts = `echo '$upg_cmd' | sudo at '$time' 2>&1 | grep -v warning`;
  my ($j, $t, $err) = (undef, undef, undef);
  for my $at (@atouts) {
    if ($at =~ /^job\s+(\d+)\s+at\s+(\w+\s+\w+\s+\d+\s+[\d:]+\s+\d+)$/) {
      ($j, $t) = ($1, $2);
      last;
    }
    $at =~ s/^at: //;
    $err .= $at;
  }
  return "Failed to schedule update: $err" if (!defined($j));
  my $tstr = `date -d '$t' +'%H:%M %d.%m.%y'`;
  chomp($tstr);

  $self->_writeSched('Scheduled', $j, $ver, $tstr);
  # success
  return undef;
}

sub cancel {
  my ($self) = @_;
  my ($scheduled, $job, $ver, $time) = $self->checkSched();
  return "No scheduled update for '$self->{_vmId}'"
    if ($scheduled ne 'Scheduled');
  
  # cancel update
  my $cmd = "sudo atrm '$job'";
  _system($cmd);
  return 'Failed to cancel scheduled update' if ($? >> 8);
  
  $self->_writeSched('Canceled', '0', $ver, $time);
  # success
  return undef;
}

sub schedRestore {
  my ($self, $ver) = @_;
  my ($scheduled) = $self->checkSched();
  return "'$self->{_vmId}' update already scheduled"
    if ($scheduled eq 'Scheduled');

  # schedule restore
  my $upg_cmd = '/opt/vyatta/sbin/openapp-vm-upgrade.pl --action=restore'
                . " --vm=\"$self->{_vmId}\" --ver=\"$ver\"";
  my @atouts = `echo '$upg_cmd' | sudo at now 2>&1 | grep -v warning`;
  my ($j, $t, $err) = (undef, undef, undef);
  for my $at (@atouts) {
    if ($at =~ /^job\s+(\d+)\s+at\s+(\w+\s+\w+\s+\d+\s+[\d:]+\s+\d+)$/) {
      ($j, $t) = ($1, $2);
      last;
    }
    $at =~ s/^at: //;
    $err .= $at;
  }
  return "Failed to initiate restore: $err" if (!defined($j));

  # remove sched entry
  # TODO move to history?
  $self->_clearSched();

  # success
  return undef;
}

sub getHist {
  my ($self) = @_;
  my @records = ();

  # get sched record
  my ($scheduled, $job, $ver, $time) = $self->checkSched();
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
  ($st, $ver, $time, $msg) = $self->checkStatus();
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
  $self->_writeStatus('Upgrading', $vver, $time, '');

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
  $self->_writeStatus('Restoring', $vver, $time, '');

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
  my $running = "$VIMG_DIR/$self->{_vmId}/$RUNNING_FILE";

  my $cmd = "rm -f $running";
  _system($cmd);
  return 'Failed to remove previous state file' if ($? >> 8);
 
  # keep the metadata
  my $meta_file = "$OpenApp::VMMgmt::META_DIR/$self->{_vmId}";
  $cmd = "cp -p $meta_file $running";
  _system($cmd);
  return 'Failed to save current state file' if ($? >> 8);

  # check if it is running 
  $cmd = "sudo virsh -c xen:/// domstate $self->{_vmId} >&/dev/null";
  _system($cmd);
  if ($? >> 8) {
    # not running. done.
    return undef;
  }
 
  # TODO do backup

  # stop the VM
  OpenApp::VMMgmt::shutdownVM($self->{_vmId});
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

  return undef;
}

# post-install processing.
# return error message or undef if success.
sub _postInstProc {
  my ($self, $vver) = @_;
  my $running = "$VIMG_DIR/$self->{_vmId}/$RUNNING_FILE";

  my $err = oaVimgPostinst($self->{_vmId}, $running);
  return $err if (defined($err));

  # start the VM
  OpenApp::VMMgmt::startVM($self->{_vmId});
  return 'Failed to start VM' if ($? >> 8);

  # check if it was running before install
  # TODO change this to check presence of backup
  if (! -f "$running") {
    # wasn't running. done.
    return undef;
  }
  
  # TODO restore backup
  ## need to check vendor/backupFormat. don't restore if different.
  ## need to wait until VM can respond to restore command.

  # done. remove metadata of previous running VM.
  unlink($running) or return 'Failed to remove previous metadata';
  
  return undef;
}

# perform upgrade. return error message or undef if success.
sub upgrade {
  my ($self, $vver) = @_;

  # remove sched entry
  # TODO move to history?
  $self->_clearSched();

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
    $self->_writeStatus('Failed', $vver, $time, $err);
    return $err;
  } else {
    # success. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('Succeeded', $vver, $time, "Upgrade $vver succeeded");
    return undef;
  } 
}

# perform restore. return error message or undef if success.
sub restore {
  my ($self, $vver) = @_;

  # remove sched entry
  # TODO move to history?
  $self->_clearSched();

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
    $self->_writeStatus('Failed', $vver, $time, $err);
    return $err;
  } else {
    # success. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('Succeeded', $vver, $time, "Restore $vver succeeded");
    return undef;
  } 
}

1;
