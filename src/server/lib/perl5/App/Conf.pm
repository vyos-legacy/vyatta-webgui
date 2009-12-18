package App::Conf;

use strict;

my $CMD_ENV = "export CMD_WRAPPER_SESSION_ID=$$";
my $CMD_WRAPPER = '/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper';
my $CMD = "$CMD_ENV ; $CMD_WRAPPER";

# default session (GUI backend authenticated session)
my ($DSID, $DSCMD) = (undef, undef);
if (defined($ENV{'APP_SESSION_ID'})) {
  $DSID = "$ENV{'AP_SESSION_ID'}";
  $DSCMD = "export CMD_WRAPPER_SESSION_ID=$DSID ; $CMD_WRAPPER";
}

### "static" functions

# set up a config session.
# returns error message or undef if sucessful.
sub _begin_session {
  my $err = `$CMD begin 2>&1`;
  return "Cannot set up config session: $err" if ($? >> 8);
  return undef;
}

# tear down a config session.
# returns error message or undef if sucessful.
sub _end_session {
  my $err = `$CMD end 2>&1`;
  return "Cannot tear down config session: $err" if ($? >> 8);
  return undef;
}

# run a config command.
# returns error message or undef if sucessful.
sub _run_cmd {
  my ($cmd) = @_;
  my $err = `$CMD $cmd 2>&1`;
  return "\"$cmd\" failed: $err" if ($? >> 8);
  return undef;
}

# run a config command in the default session.
# returns error message or undef if sucessful.
sub _run_cmd_def_session {
  my ($cmd) = @_;
  my $err = `$DSCMD $cmd 2>&1`;
  return "\"$cmd\" failed: $err" if ($? >> 8);
  return undef;
}

# set up a config session and execute an array of config commands.
# returns error message or undef if sucessful.
sub execute_session {
  my @cmds = @_;
  my $err = undef;
  while (1) {
    $err = _begin_session();
    last if (defined($err));
   
    for my $cmd (@cmds) {
      $err = _run_cmd($cmd);
      last if (defined($err));
    } 
    last;
  }
 
  _end_session();
  return $err;
}

sub run_cmd_def_session {
  my @cmds = @_;
  return 'Cannot find default session' if (!defined($DSCMD));
  my $err = undef;
  for my $cmd (@cmds) {
    $err = _run_cmd_def_session($cmd);
    last if (defined($err));
  } 
  return $err;
}

1;

