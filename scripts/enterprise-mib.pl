#!/usr/bin/perl
#
# This is an example of perl module support for the net-snmp agent.
#
# To load this into a running agent with embedded perl support turned
# on, simply put the following line (without the leading # mark) your
# snmpd.conf file:
#
#   perl do "/path/to/perl_module.pl";
#

#
# Implements the Vyatta enterprise MIB for the Open Appliance
#
# OA-MIB vyattaNA             node         1.3.6.1.4.1.30803.1
# OA-MIB vyattaNAStatus       scalar       1.3.6.1.4.1.30803.1.1
# OA-MIB vyattaOA             node         1.3.6.1.4.1.30803.2
# OA-MIB domainTable          table        1.3.6.1.4.1.30803.2.1
# OA-MIB domainEntry          row          1.3.6.1.4.1.30803.2.1.1
# OA-MIB domainID             column       1.3.6.1.4.1.30803.2.1.1.1
# OA-MIB domainName           column       1.3.6.1.4.1.30803.2.1.1.2
# OA-MIB domainStatus         column       1.3.6.1.4.1.30803.2.1.1.3
# OA-MIB domainCPU            column       1.3.6.1.4.1.30803.2.1.1.4
# OA-MIB domainCPUPct         column       1.3.6.1.4.1.30803.2.1.1.5
# OA-MIB domainMem            column       1.3.6.1.4.1.30803.2.1.1.6
# OA-MIB domainMemPct         column       1.3.6.1.4.1.30803.2.1.1.7
# OA-MIB domainMaxMem         column       1.3.6.1.4.1.30803.2.1.1.8
# OA-MIB domainMaxMemPct      column       1.3.6.1.4.1.30803.2.1.1.9
# OA-MIB domainVCPUs          column       1.3.6.1.4.1.30803.2.1.1.10
# OA-MIB domainNets           column       1.3.6.1.4.1.30803.2.1.1.11
# OA-MIB domainNetTX          column       1.3.6.1.4.1.30803.2.1.1.12
# OA-MIB domainNetRX          column       1.3.6.1.4.1.30803.2.1.1.13
# OA-MIB domainVBDs           column       1.3.6.1.4.1.30803.2.1.1.14
# OA-MIB domainVBDRd          column       1.3.6.1.4.1.30803.2.1.1.15
# OA-MIB domainVBDWr          column       1.3.6.1.4.1.30803.2.1.1.16

my $regat = '.1.3.6.1.4.1.30803';

BEGIN {
    print STDERR "Starting enterprise-mib.pl\n";
}

use NetSNMP::OID (':all');
use NetSNMP::agent (':all');
use NetSNMP::ASN (':all');

print STDERR "enterprise-mib.pl loaded ok\n";

# set to 1 to get extra debugging information
$debugging = 0;

# if we're not embedded, this will get auto-set below to 1
$subagent = 0;

# where we are going to hook onto
my $regoid = new NetSNMP::OID($regat);
print STDERR "Registering at ",$regoid,"\n" if ($debugging);

# If we're not running embedded within the agent, then try to start
# our own subagent instead.
if (!$agent) {
    $agent = new NetSNMP::agent('Name' => 'test', # reads test.conf
				'AgentX' => 1);   # make us a subagent
    $subagent = 1;
    print STDERR "Started us as a subagent ($agent)\n" if ($debugging);
}

# we register ourselves with the master agent we're embedded in.  The
# global $agent variable is how we do this:
$agent->register('myname',$regoid, \&my_snmp_handler);


if ($subagent) {
    # We need to perform a loop here waiting for snmp requests.  We
    # aren't doing anything else here, but we could.
    $SIG{'INT'} = \&shut_it_down;
    $SIG{'QUIT'} = \&shut_it_down;
    $running = 1;
    while($running) {
	$agent->agent_check_and_process(1);  # 1 = block
	print STDERR "mainloop excercised\n" if ($debugging);
    }
    $agent->shutdown();
}

######################################################################
# define a subroutine to actually handle the incoming requests to our
# part of the OID tree.  This subroutine will get called for all
# requests within the OID space under the registration oid made above.
sub my_snmp_handler {
    my ($handler, $registration_info, $request_info, $requests) = @_;
    my $request;

    print STDERR "refs: ",join(", ", ref($handler), ref($registration_info), 
			       ref($request_info), ref($requests)),"\n"
	if ($debugging);

    print STDERR "Processing a request of type " . $request_info->getMode() . "\n"
	if ($debugging);

    for($request = $requests; $request; $request = $request->next()) {
      my $oid = $request->getOID();
      print STDERR "  Processing request of $oid\n" if ($debugging);

      #
      # Network or open appliance?
      #

      $status = system("grep -qs control_d /proc/xen/capabilities");
      if ($status) {

	#
	# Network appliance
	#

        print STDERR "  Network appliance\n" if ($debugging);

        if ($request_info->getMode() == MODE_GET) {
          print STDERR "  MODE_GET\n" if ($debugging);

	  #
          # If the requested OID is equals to ours, then return the data
	  #

          if ($oid == new NetSNMP::OID($regat . ".1.1")) {
            print STDERR "   -> $oid 2\n" if ($debugging);
            $request->setOID($regat . ".1.1");
            $request->setValue(ASN_INTEGER, 2);		# If we can respond, we're running
          }
        } elsif ($request_info->getMode() == MODE_GETNEXT) {
          print STDERR "  MODE_NEXT\n" if ($debugging);

	  #
          # If the requested OID is lower than ours, then return ours
	  #

          if ($oid < new NetSNMP::OID($regat . ".1.1")) {
            print STDERR "   -> $oid 2\n" if ($debugging);
            $request->setOID($regat . ".1.1");
            $request->setValue(ASN_INTEGER, 2);		# If we can respond, we're running
          }
        }
      } else {

	#
	# Open appliance dom0
	#

	#
	# Get the appliance type
	#

	# Remove the enterprise object

	$obj = substr($oid, 18);
	$app = substr($obj, 0, 1);

	#
	# Get the table, entry, request and domain ID
	#

	@objects = split(/\./, $obj);
	print STDERR "Objects '@objects'\n" if ($debugging);
	$table = $objects[1];
	$entry = $objects[2];
	$req = $objects[3];
	$id = $objects[4];

	print STDERR "  Input enterprise object is '$obj' appliance '$app' table '$table' entry '$entry' req '$req' id '$id'\n" if ($debugging);

	#
	# Get maximum domain index
	#

	$domcnt = maxdomain();

	#
	# Determine the OID
	# If GET-NEXT, increment the OID appropriately
	# Otherwise, use the OID as specified
	#

	if ($request_info->getMode() == MODE_GETNEXT) {
	  print STDERR "  GET-NEXT\n" if ($debugging);

	  #
	  # Is the appliance specified?
	  #

	  if ($app == "" || $app < 2) {
	    $app = 2;				# Open appliance by default
	    $table = 1;
	    $entry = 1;
	    $req = 1;
	    $id = 0;
	  } else {

	    #
	    # Is the table specified?
	    #

	    if (!defined($table) || $table < 1) {
	      $table = 1;				# Only one table
	      $entry = 1;
	      $req = 1;
	      $id = 0;
	    } else {

	      #
	      # Is the entry specified?
	      #

	      if (!defined($entry) || $entry < 1) {
		$entry = 1;			# Only one entry
		$req = 1;
		$id = 0;
	      } else {

		#
		# Is the request specified?
		#

		if (!defined($req) || $req < 1) {
		  $req = 1;			# Start with the first request
		  $id = 0;
		} else {

		  #
		  # Is the domain specified?
		  #

		  if (!defined($id)) {
		    $id = 0;
		  } else {

		    #
		    # Everything is specified; increment OID
		    #

		    $id = $id + 1;

		    #
		    # Move to next object if required
		    #

		    if ($id > $domcnt) {
		      $req = $req + 1;
		      $id = 0;
		    }
		    if ($req > 16) {
		      $entry = $entry + 1;
		      $req = 1;
		      $id = 0;
		    }
		    if ($entry > 1) {
		      $table = $table + 1;
		      $entry = 1;
		      $req = 1;
		      $id = 0;
		    }
		    if ($table > 1) {
		      $app = $app + 1;
		      $table = 1;
		      $entry = 1;
		      $req = 1;
		      $id = 0;
		    }
		  }
		}
	      }
	    }
	  }
	} else {
	  print STDERR "  GET-NEXT\n" if ($debugging);
      }

      #
      # Valid appliance, table, entry and domain?
      #

      print STDERR "  Appliance '$app' table '$table' entry '$entry' id '$id'\n" if ($debugging);

      if ($app == 2 && $table == 1 && $entry == 1 && $req <= 16 && $id <= $domcnt) {
	$val = domainval($id, $req);
	print STDERR "  domainval '$val'\n" if ($debugging);
	if ($val != -1) {

	  #
	  # Map valid response
	  #

	  $request->setOID($regat . sprintf(".%d.%d.%d.%d.%d", $app, $table, $entry, $req, $id));
	  if ($req == 2) {				# domainName
	    $request->setValue(ASN_OCTET_STR, $val);
	  } elsif ($req == 3) {				# domainStatus
	    $request->setValue(ASN_INTEGER, $val);
	  } elsif ($req == 12 || $req == 13 || $req == 15 || $req == 16) {	# domainNetTX, domainNetRX,
										  # domanVBDRd, domainVBDWr
	    $request->setValue(ASN_COUNTER, $val);
	  } else {
	    $request->setValue(ASN_GAUGE, $val);	# Everything else is 32 bit integer
	  }
	}
      }
    }
  }

  print STDERR "  Finished processing\n"
      if ($debugging);
}

sub shut_it_down {
  $running = 0;
  print STDERR "Shutting down\n" if ($debugging);
}

#
# Get an entry for a specific domain
#

sub domainval {
    my($domainID, $oid) = @_;
    print STDERR "  domainval ID '$domainID' oid '$oid'\n" if ($debugging);

    #
    # Get current statistics from xentop
    #
    # Output format:
    #       NAME  STATE   CPU(sec) CPU(%)     MEM(k) MEM(%)  MAXMEM(k) MAXMEM(%) VCPUS NETS NETTX(k) NETRX(k) VBDS   VBD_OO   VBD_RD   VBD_WR SSID
    # Domain-0 -----r        560    0.0    1000448   47.7   no limit       n/a     2    4        0        0    0        0        0        0    0
    #      jvm --b---        236    0.0     524288   25.0     524288      25.0     1    1     7551     1447    1        0     6142    43020    0
    #      utm --b---        179    0.0     524288   25.0     524288      25.0     1    7    17630    10866    1        0     6180    17994    0
    #

    @result = split(/\n/, `xentop -b -i 1`);

    # Remove the header line

    shift(@result);

    #
    # Does the domain exist?
    #

    if (exists($result[$domainID])) {

	#
	# Get the domain values
	#

	$line = $result[$domainID];
	print STDERR "  line '$line'\n" if ($debugging);
	@entries = split(/[\t ]+/, $line);

	#
	# Join "no limit"
	#

	if ($entries[7] =~ 'no' && $entries[8] =~ 'limit') {
	    splice(@entries, 7, 2, "no limit");
	}

	#
	# Get the specified value
	#       NAME  STATE   CPU(sec) CPU(%)     MEM(k) MEM(%)  MAXMEM(k) MAXMEM(%) VCPUS NETS NETTX(k) NETRX(k) VBDS   VBD_OO   VBD_RD   VBD_WR SSID
	#

	if ($oid == 1) {		# domainID             1.3.6.1.4.1.30803.2.1.1.1
	    print STDERR "  Domain id '$domainID'\n" if ($debugging);
	    return $domainID;
	} elsif ($oid == 2) {		# domainName           1.3.6.1.4.1.30803.2.1.1.2
	    print STDERR "  Domain name '$entries[1]'\n" if ($debugging);
	    return $entries[1];
	} elsif ($oid == 3) {		# domainStatus         1.3.6.1.4.1.30803.2.1.1.3
	    return cvtstatus($entries[2]);
	} elsif ($oid == 4) {		# domainCPU            1.3.6.1.4.1.30803.2.1.1.4
	    return $entries[3];
	} elsif ($oid == 5) {		# domainCPUPct         1.3.6.1.4.1.30803.2.1.1.5
	    return sprintf("%d", $entries[4] + .5);	# Rounded to integer value
	} elsif ($oid == 6) {		# domainMem            1.3.6.1.4.1.30803.2.1.1.6
	    return $entries[5];
	} elsif ($oid == 7) {		# domainMemPct         1.3.6.1.4.1.30803.2.1.1.7
	    return sprintf("%d", $entries[6] + .5);	# Rounded to integer value
	} elsif ($oid == 8) {		# domainMaxMem         1.3.6.1.4.1.30803.2.1.1.8
	    if ($entries[7] =~ "no limit") {
		return 0;
	    } else {
		return $entries[7];
	    }
	} elsif ($oid == 9) {		# domainMaxMemPct      1.3.6.1.4.1.30803.2.1.1.9
	    if ($entries[8] =~ "n/a") {
		return 0;
	    } else {
		return sprintf("%d", $entries[8] + .5);
	    }
	} elsif ($oid == 10) {	# domainVCPUs          1.3.6.1.4.1.30803.2.1.1.10
	    return $entries[9];
	} elsif ($oid == 11) {	# domainNets           1.3.6.1.4.1.30803.2.1.1.11
	    return $entries[10];
	} elsif ($oid == 12) {	# domainNetTX          1.3.6.1.4.1.30803.2.1.1.12
	    return $entries[11];
	} elsif ($oid == 13) {	# domainNetRX          1.3.6.1.4.1.30803.2.1.1.13
	    return $entries[12];
	} elsif ($oid == 14) {	# domainVBDs           1.3.6.1.4.1.30803.2.1.1.14
	    return $entries[13];
	} elsif ($oid == 15) {	# domainVBDRd          1.3.6.1.4.1.30803.2.1.1.15
	    return $entries[15];
	} elsif ($oid == 16) {	# domainVBDWr          1.3.6.1.4.1.30803.2.1.1.16
	    return $entries[16];
	} else {

	    #
	    # No such OID
	    #

	    return -1;
	}
    } else {

	#
	# No such domain
	#

	return -1;
    }
}

#
# Get UTM status
#

sub utmstatus {
    print STDERR "Requesting UTM status\n" if ($debugging);

    #
    # Get current statistics from xentop
    #
    # Output format:
    #       NAME  STATE   CPU(sec) CPU(%)     MEM(k) MEM(%)  MAXMEM(k) MAXMEM(%) VCPUS NETS NETTX(k) NETRX(k) VBDS   VBD_OO   VBD_RD   VBD_WR SSID
    # Domain-0 -----r        560    0.0    1000448   47.7   no limit       n/a     2    4        0        0    0        0        0        0    0
    #      jvm --b---        236    0.0     524288   25.0     524288      25.0     1    1     7551     1447    1        0     6142    43020    0
    #      utm --b---        179    0.0     524288   25.0     524288      25.0     1    7    17630    10866    1        0     6180    17994    0
    #

    @result = split(/\n/, `xentop -b -i 1`);

    # Remove the header line

    shift(@result);

    #
    # Find the UTM
    #

    foreach $line (@result) {

	#
	# Get the status
	#

	@entries = split(/[\t ]+/, $line);

	if ($entries[1] =~ 'utm') {
	    print STDERR "UTM found; status is '$entries[2]'\n" if ($debugging);
	    return cvtstatus($entries[2]);
	}
    }

    #
    # Not found
    #

    return -1;
}

#
# Convert domain status to integer value
#

sub cvtstatus {
    #
    # Status codes
    #

    # r - running 
    # b - blocked 
    # p - paused 
    # s - shutdown 
    # c - crashed 
    # d - dying 

    #
    # MIB syntax
    #

    # SYNTAX      INTEGER {
    #               unknown(1),
    #               running(2),
    #               blocked(3),
    #               paused(4),
    #               crashed(5),
    #               dying(6),
    #               shutdown(7)
    #           }

    my($status) = @_;

    if ($status =~ /r/) {
	return 2;
    } elsif ($status =~ /b/) {
	return 3;
    } elsif ($status =~ /p/) {
	return 4;
    } elsif ($status =~ /s/) {
	return 5;
    } elsif ($status =~ /c/) {
	return 6;
    } elsif ($status =~ /d/) {
	return 7;
    } else {
	return 1;
    }
}

#
# Get maximum domain index
#

sub maxdomain {
    @result = split(/\n/, `xentop -b -i 1`);
    return $#result - 1;
}
