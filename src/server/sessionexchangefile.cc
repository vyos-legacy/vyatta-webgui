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
SessionExchangeFile::SessionExchangeFile(const string &file, bool debug) :
  SessionExchange(debug),
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

