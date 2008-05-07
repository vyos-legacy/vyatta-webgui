#include <unistd.h>
#include <syslog.h>
#include <errno.h>
#include <iostream>
#include <string>
#include "common.hh"
#include "session.hh"
#include "sessionexchange.hh"
#include "sessionexchangestdio.hh"

using namespace std;

/**
 *
 **/
SessionExchangeStdIO::SessionExchangeStdIO(bool debug) :
  SessionExchange(debug)
{

}

/**
 *
 **/
SessionExchangeStdIO::~SessionExchangeStdIO()
{
}

/**
 *
 **/
void
SessionExchangeStdIO::init()
{
}

/**
 *
 **/
Session
SessionExchangeStdIO::check_for_new_connection()
{
  if (_debug) {
    cout << "SessionExchangeStdIO::check_for_new_connection()" << endl;
  }
  
  Session s(0,_debug);
  s.set_sock(9999);
  return s;
}

bool
SessionExchangeStdIO::read(Session &session)
{
  string req;
  //read from stdin here
  char buf[1025];
  cout << "starting to read input" << endl;
  while (fgets(buf, 1024, stdin) != 0) {
    string tmp(buf);
    req += tmp.substr(0,tmp.length()-1);
    cout << "buf: " << req << endl;
  }
  session.set_message(req);
  return true;
}

bool
SessionExchangeStdIO::write(Session &session)
{
  //write to std out here
  if (session.get_message().empty() == false) {
    string msg = session.get_message();
    fputs(msg.c_str(), stdout);
    return true;
  }
  return false;
}

