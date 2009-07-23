package OpenApp::LdapUser;

use strict;
use File::Temp qw(mkstemp);
use Net::LDAP qw(LDAP_NO_SUCH_ATTRIBUTE);
use IPC::Open2;

### constants
my $OA_LDAP_SERVER = 'ldap://localhost';
my $OA_LDAP_SUFFIX = 'dc=localhost,dc=localdomain';
my $OA_LDAP_USER_SUFFIX = "ou=People,$OA_LDAP_SUFFIX";
my $OA_LDAP_ROOTDN = "cn=admin,$OA_LDAP_SUFFIX";
my $OA_LDAP_ROOT_PASSWORD_FILE = '/etc/ldap.secret';
my $OA_LDAP_READDN = 'cn=readonly,dc=readonly';
my $OA_LDAP_READ_PASSWORD = 'readonly';
my $OA_LDAP_ATTR_UID = 'uid';
my $OA_LDAP_ATTR_MAIL = 'mail';
my $OA_LDAP_ATTR_LAST = 'sn';
my $OA_LDAP_ATTR_FIRST = 'cn';
my $OA_LDAP_ATTR_RIGHT = 'memberUid';
my $OA_LDAP_ATTR_ROLE = 'description';
my $OA_LDAP_ATTR_PASSWORD = 'userPassword';

### "static" functions
sub listAllUsers {
  # set up LDAP
  my $ldap = Net::LDAP->new("$OA_LDAP_SERVER");
  return [] if (!defined($ldap));
  my $res;
  if (!defined($OA_LDAP_READDN)) {
    # bind anonymously
    $res = $ldap->bind();
  } else {
    # bind with readonly credential
    $res = $ldap->bind("$OA_LDAP_READDN",
                       password => "$OA_LDAP_READ_PASSWORD");
  }
  if ($res->is_error()) {
    # bind failed
    $ldap->disconnect();
    return [];
  }

  # do query
  $res = $ldap->search(base => "$OA_LDAP_USER_SUFFIX",
                       filter => "$OA_LDAP_ATTR_UID=*",
                       attrs => [ "$OA_LDAP_ATTR_UID" ]);
  if ($res->is_error()) {
    $ldap->disconnect();
    return [];
  }
  my @ret = ();
  for my $ent ($res->entries()) {
    my $uid = $ent->get_value($OA_LDAP_ATTR_UID);
    next if (!defined($uid));
    push @ret, $uid;
  }
  $ldap->disconnect();
  return \@ret;
}

sub _setupRootBind {
  # set up LDAP (with root bind)
  my $ldap = Net::LDAP->new("$OA_LDAP_SERVER");
  return undef if (!defined($ldap));
  my $rpw = `sudo cat $OA_LDAP_ROOT_PASSWORD_FILE 2>/dev/null`;
  if ($? >> 8) {
    $ldap->disconnect();
    return undef;
  }
  chomp($rpw);
  my $res = $ldap->bind("$OA_LDAP_ROOTDN", password => "$rpw");
  if ($res->is_error()) {
    $ldap->disconnect();
    return undef;
  }
  return $ldap;
}

sub _deleteUserAttr {
  my ($user, $attr) = @_;
  my $ldap = _setupRootBind();
  return 'Failed to bind to LDAP database' if (!defined($ldap));
  my $res = $ldap->modify("$OA_LDAP_ATTR_UID=$user,$OA_LDAP_USER_SUFFIX",
                          delete => [ $attr ]);
  $ldap->disconnect();
  return undef if (!$res->is_error()
                   || $res->code() == LDAP_NO_SUCH_ATTRIBUTE());
  return 'Failed to delete user attribute';
}

sub _replaceUserAttr {
  my ($user, $attr, $value) = @_;
  my $ldap = _setupRootBind();
  return 'Failed to bind to LDAP database' if (!defined($ldap));
  my $res = $ldap->modify("$OA_LDAP_ATTR_UID=$user,$OA_LDAP_USER_SUFFIX",
                          replace => { "$attr" => "$value" });
  $ldap->disconnect();
  return 'Failed to replace user attribute' if ($res->is_error());
  return undef;
}

# add one value to an attribute
sub _addUserAttrVal {
  my ($user, $attr, $value) = @_;
  my $ldap = _setupRootBind();
  return 'Failed to bind to LDAP database' if (!defined($ldap));
  my $res = $ldap->modify("$OA_LDAP_ATTR_UID=$user,$OA_LDAP_USER_SUFFIX",
                          add => { "$attr" => [ "$value" ] });
  $ldap->disconnect();
  return 'Failed to add user attribute value' if ($res->is_error());
  return undef;
}

# delete one value from an attribute
sub _delUserAttrVal {
  my ($user, $attr, $value) = @_;
  my $ldap = _setupRootBind();
  return 'Failed to bind to LDAP database' if (!defined($ldap));
  my $res = $ldap->modify("$OA_LDAP_ATTR_UID=$user,$OA_LDAP_USER_SUFFIX",
                          delete => { "$attr" => [ "$value" ] });
  $ldap->disconnect();
  return 'Failed to delete user attribute value' if ($res->is_error());
  return undef;
}

# set installer password
sub _setPasswordInstaller {
  my ($newpass) = @_;
  my ($rfd, $wfd) = (undef, undef);
  my $pid = open2($rfd, $wfd, '/usr/bin/mkpasswd', '-m', 'md5', '-s');
  print $wfd "$newpass";
  close($wfd);
  my $epass = <$rfd>;
  waitpid($pid, 0);
  chomp($epass);
  return 'Failed to encrypt installer password' if (!($epass =~ /^\$1\$/));
  system("sudo /usr/sbin/usermod -p '$epass' installer");
  return 'Failed to change installer password' if ($? >> 8);
  return undef;
}

# create a new user from scratch. return error message or undef on success.
sub createUser {
  my ($user, $pass, $mail, $last, $first) = @_;

  # check if user already exists
  my $u = new OpenApp::LdapUser($user);
  return 'User already exists' if ($u->isExisting());

  # create the user
  my $err = `sudo ldapadduser '$user' operator 2>&1`;
  return "Failed to create user: $err" if ($? >> 8);

  # set the attributes
  return "$err" if (defined($err = $u->setPassword($pass)));
  return "$err" if (defined($err = $u->setMail($mail)));
  return "$err" if (defined($err = $u->setLast($last)));
  return "$err" if (defined($err = $u->setFirst($first)));
  ## always 'user' role
  return "$err" if (defined($err = $u->setRole('user')));

  # done
  return undef;
}

# delete an existing user. return error message or undef on success.
sub deleteUser {
  my ($user) = @_;
  
  # check if user exists
  my $u = new OpenApp::LdapUser($user);
  return 'User does not exists' if (!$u->isExisting());

  # check user name
  return 'Cannot delete system accounts'
    if ($user eq 'admin' || $user eq 'installer');

  # delete the user
  my $err = `sudo ldapdeleteuser '$user' 2>&1`;
  return "Failed to delete user: $err" if ($? >> 8);

  return undef;
}

### data
my %fields = (
  _ldapObj => undef,
  _uname => undef,
  _umail => undef,
  _ulast => undef,
  _ufirst => undef,
  _urights => undef,
  _urole => undef
);

sub _setup {
  my ($self, $uname) = @_;
  $self->{_uname} = $uname;
 
  # special case for installer
  if ($uname eq 'installer') {
    $self->{_urole} = 'installer';
    $self->{_urights} = {};
    return;
  }

  # set up LDAP
  $self->{_ldapObj} = Net::LDAP->new("$OA_LDAP_SERVER");
  return if (!defined($self->{_ldapObj}));
  my $res;
  if (!defined($OA_LDAP_READDN)) {
    # bind anonymously
    $res = $self->{_ldapObj}->bind();
  } else {
    # bind with readonly credential
    $res = $self->{_ldapObj}->bind("$OA_LDAP_READDN",
                                   password => "$OA_LDAP_READ_PASSWORD");
  }
  if ($res->is_error()) {
    # bind failed
    $self->{_ldapObj}->disconnect();
    $self->{_ldapObj} = undef;
    return;
  }

  # do query
  $res = $self->{_ldapObj}->search(base => "$OA_LDAP_USER_SUFFIX",
                                   filter => "$OA_LDAP_ATTR_UID=$uname");
  return if ($res->is_error());
  return if ($res->count() != 1);
  my $entry = $res->entry(0);
  $self->{_umail} = ($entry->get_value($OA_LDAP_ATTR_MAIL))[0];
  $self->{_ulast} = ($entry->get_value($OA_LDAP_ATTR_LAST))[0];
  $self->{_ufirst} = ($entry->get_value($OA_LDAP_ATTR_FIRST))[0];
  $self->{_urole} = ($entry->get_value($OA_LDAP_ATTR_ROLE))[0];
  my %rights = ();
  map { $rights{$_} = 1 } $entry->get_value($OA_LDAP_ATTR_RIGHT);
  $self->{_urights} = \%rights;
}

sub new {
  my ($that, $uname) = @_;
  my $class = ref ($that) || $that;
  my $self = {
    %fields,
  };

  bless $self, $class;
  $self->_setup($uname);
  return $self;
}

### getters for user attributes
sub isExisting {
  my ($self) = @_;
  return (defined($self->{_urole}));
}

sub getName {
  my ($self) = @_;
  return $self->{_uname};
}

sub getMail {
  my ($self) = @_;
  return $self->{_umail};
}

sub getLast {
  my ($self) = @_;
  return $self->{_ulast};
}

sub getFirst {
  my ($self) = @_;
  return $self->{_ufirst};
}

sub getRights {
  my ($self) = @_;
  # this is a hashref
  return $self->{_urights};
}

sub getRole {
  my ($self) = @_;
  return $self->{_urole};
}

sub passwordExists {
  my ($self) = @_;
 
  # special case for installer
  return 1 if ($self->{_uname} eq 'installer');

  my $ldap = _setupRootBind();
  my $ret = 0;
  while (defined($ldap)) {
    my $res;
    $res = $ldap->search(base => "$OA_LDAP_USER_SUFFIX",
                         filter => "$OA_LDAP_ATTR_UID=$self->{_uname}",
                         attrs => [ "$OA_LDAP_ATTR_PASSWORD" ]);
    last if ($res->is_error());
    last if ($res->count() != 1);
    my $entry = $res->entry(0);
    $ret = (defined($entry->get_value($OA_LDAP_ATTR_PASSWORD)) ? 1 : 0);
    last;
  }
  $ldap->disconnect() if (defined($ldap));
  return $ret;
}

### setters for user attributes
sub setMail {
  my ($self, $mail) = @_;
  return _replaceUserAttr($self->{_uname}, $OA_LDAP_ATTR_MAIL, $mail);
}

sub setLast {
  my ($self, $last) = @_;
  return _replaceUserAttr($self->{_uname}, $OA_LDAP_ATTR_LAST, $last);
}

sub setFirst {
  my ($self, $first) = @_;
  return _replaceUserAttr($self->{_uname}, $OA_LDAP_ATTR_FIRST, $first);
}

# add one right for the user
sub addRight {
  my ($self, $right) = @_;
  return _addUserAttrVal($self->{_uname}, $OA_LDAP_ATTR_RIGHT, $right);
}

# remove one right for the user
sub delRight {
  my ($self, $right) = @_;
  return _delUserAttrVal($self->{_uname}, $OA_LDAP_ATTR_RIGHT, $right);
}

sub setRole {
  my ($self, $role) = @_;
  return _replaceUserAttr($self->{_uname}, $OA_LDAP_ATTR_ROLE, $role);
}

sub deletePassword {
  my ($self) = @_;
  return _deleteUserAttr($self->{_uname}, $OA_LDAP_ATTR_PASSWORD);
}

sub resetPassword {
  my ($self) = @_;
  return $self->setPassword($self->{_uname});
}

sub setPassword {
  my ($self, $newpass) = @_;
 
  # special case for installer 
  return _setPasswordInstaller($newpass) if ($self->{_uname} eq 'installer');
  
  my ($fh, $fname) = mkstemp('/tmp/oaldapuser.XXXXXX');
  chmod(0600, $fname);
  print $fh "$newpass";
  close($fh);
  my $ep;
  if (!open($ep, '-|', "/usr/sbin/slappasswd -T '$fname' 2>/dev/null")) {
    unlink($fname);
    return 'Failed to encrypt new password';
  }
  my $epass = <$ep>;
  close($ep);
  unlink($fname);
  chomp($epass);
  return _replaceUserAttr($self->{_uname}, $OA_LDAP_ATTR_PASSWORD, $epass);
}

1;

