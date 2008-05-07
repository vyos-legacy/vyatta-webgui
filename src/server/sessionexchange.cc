#include <unistd.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <syslog.h>
#include <errno.h>
#include <iostream>
#include <string>
#include "common.hh"
#include "session.hh"
#include "sessionexchange.hh"

using namespace std;

/**
 *
 **/
SessionExchange::SessionExchange(bool debug) :
  _debug(debug)
{

}

/**
 *
 **/
SessionExchange::~SessionExchange()
{
}


