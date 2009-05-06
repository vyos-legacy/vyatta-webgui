package OpenApp::Rest;
use lib '/opt/vyatta/share/perl5';
use strict;

##############################################################################
#
# Takes rest path and action, sends request and validates response.
#
##############################################################################
sub send {
  my ($ACTION, $CMD) = @_;
    #perhaps want to set a common root: "notifications"

    #send out message
    my $out = `curl -X $ACTION -q --connect-timeout 3 -I $CMD 2>&1`;

  #process response
  #should be of the form: <openappliance><code>0</code>some message<msg></msg></openappliance>
  if ($out =~ /<code>0<\/code>/) {
      return 0;
  }
  return 1;
}

1;
