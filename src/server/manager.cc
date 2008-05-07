#include <unistd.h>
#include <syslog.h>
#include <errno.h>
#include <iostream>
#include "session.hh"
#include "processor.hh"
#include "manager.hh"

using namespace std;

/**
 *
 **/
Manager::Manager(SessionExchange *se, bool debug) : 
  _debug(debug),
  _se(se),
  _processor(debug)
{
  //initialize processor object
  _processor.init();

}

/**
 *
 **/
Manager::~Manager()
{
}

/**
 *
 **/
bool
Manager::process() 
{
  Session new_session = _se->check_for_new_connection();
  if (new_session.is_valid()) {
    if (_debug) {
      cout << "Manager::process(), received new valid connection" << endl;
    }
    register_session(new_session);
  }

  SessionIter iter = _session_coll.begin();
  while (iter != _session_coll.end()) {
    if (iter->second.is_valid()) {
      if (_se->read(iter->second)) {
	iter->second.process_message();
	_se->write(iter->second);
	iter->second.clear_message();
      }
      ++iter;
    }
    else {
      _session_coll.erase(iter++);
    }
  }
  return true;
}

/**
 *
 **/
void
Manager::register_session(Session &session)
{
  if (_debug) {
    cout << "Manager::register_session(): registering new session for: " << session.get_id() << ", " << session.get_sock() << endl;
  }

  SessionIter iter = _session_coll.find(session.get_id());
  if (iter != _session_coll.end()) {
    //close and remove this session
    _session_coll.erase(iter);
    iter->second.close_session();
  }
  session.init(&_processor);
  _session_coll.insert(pair<unsigned long,Session>(session.get_id(),session));

}
