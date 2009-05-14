package OpenApp::Rest;
use lib '/opt/vyatta/share/perl5';
use strict;
use XML::Simple;

my $_rest_code;


my %fields = (
    _success => undef,
    _http_code => "0",
    _rest_code => undef,
    _body => undef,
    _header => undef
);

sub _setup {
    my $self;
    return $self;
}

sub new
{
    my $class = shift;
    my $self = {
	%fields,
    };
    bless $self, $class;
    $self->_setup();
    return $self
}

##############################################################################
#
# Takes rest path and action, sends request and validates response.
#
##############################################################################
sub send {
    
  my $self;
  my ($tmp, $ACTION, $CMD) = @_;
  #send out message
  #need to double quote cmd otherwise params will get dropped
  my @out = `curl -X $ACTION -q --connect-timeout 3 -i \"$CMD\" 2>&1`; 
  $self->{_success} = 0;

  #let's iterate over the response line by line and grab the dirt
  foreach my $out (@out) {
      if ($out =~ /^curl: \(/) {
	  $self->{_success} = 1;
	  return $self;
      }
      if ($out =~ /Status:/) {
	  my @tmp = split(" ", $out);
	  my $tmp;
	  $self->{_http_code} = $tmp[1];
	  last;
      }
  }

  #convert to flat string
  my $out = join(" ",@out);

  #need to chop off at first tag, which should be <openappliance>
  my $pos = index($out, "<openappliance>");
  if ($pos < 0) {
      $self->{_header} = substr $out, 0, $pos-1;
      return $self;
  }
  
  $self->{_header} = substr $out, 0, $pos-1;

  my $body =  substr $out, $pos;
  if (length($body) > 0) {
      my $opt = XMLin($body);
      #now parse the rest code
      $self->{_rest_code} = $opt->{error}->{code};
      $self->{_body} = $opt->{error}->{msg};
  }
  return $self;
}

1;
