package OpenApp::LdapUser;

use strict;

### "static" functions

### data
my %fields = (
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
  my $ldap = undef;
  open($ldap, '-|',
       "ldapsearch -x -b 'dc=localhost,dc=localdomain' 'uid=$uname'")
    or return;
  my %rights = ();
  while (<$ldap>) {
    chomp;
    my @fields = split(/ /);
    next if (!defined($fields[0]) || !defined($fields[1])
             || $fields[0] eq '#');
    if ($fields[0] eq 'uid:') {
    } elsif ($fields[0] eq 'mail:') {
      $self->{_umail} = $fields[1];
    } elsif ($fields[0] eq 'sn:') {
      $self->{_ulast} = $fields[1];
    } elsif ($fields[0] eq 'cn:') {
      $self->{_ufirst} = $fields[1];
    } elsif ($fields[0] eq 'memberUid:') {
      $rights{$fields[1]} = 1;
    } elsif ($fields[0] eq 'description:') {
      $self->{_urole} = $fields[1];
    }
  }
  close($ldap);
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

1;

