#include <unistd.h>
#include <syslog.h>
#include <errno.h>
#include <iostream>
#include <string>
#include "common.hh"
#include "session.hh"
#include "sessionexchange.hh"
#include "sessionexchangefile.hh"

using namespace std;

/**
 *
 **/
SessionExchangeFile::SessionExchangeFile(const string &file, bool req_resp_log_file, bool debug) :
  SessionExchange(req_resp_log_file, debug),
  _file(file)
{

}

/**
 *
 **/
SessionExchangeFile::~SessionExchangeFile()
{
}

/**
 *
 **/
void
SessionExchangeFile::init()
{
}

/**
 *
 **/
Session
SessionExchangeFile::check_for_new_connection()
{
  return Session(0,_debug);
}

bool
SessionExchangeFile::read(Session &session)
{
  return true;
}

bool
SessionExchangeFile::write(Session &session)
{
  return true;
}

