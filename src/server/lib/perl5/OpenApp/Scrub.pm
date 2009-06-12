package OpenApp::Scrub;
use lib '/opt/vyatta/share/perl5';
use strict;


### "static" functions

sub clean_param {
    my @clean = @_;
    my $clean = @clean[0];

    #remove eol character
    chomp($clean);

    #remove everything after the first ;
    my $pos = index($clean,";");
    if ($pos >= 0) {
	$clean = substr($clean,0,$pos);
    }
    #filter non-printable ascii characters
    $clean =~ s/[^\x20-\x7F]//g;

    #filter for '..'
    $clean =~ s/\.\.//g;

    return $clean;
}

1;
