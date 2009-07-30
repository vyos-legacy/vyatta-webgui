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
Manager::Manager(SessionExchange *se, bool strip_error_message, bool debug) : 
  _debug(debug),
  _strip_err_msg(strip_error_message),
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
    new_session.init(&_processor);
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
	if (_strip_err_msg) {
	  //strip this out, but leave error message, only for debugging purposes
	  iter->second._processor->_msg._custom_error_msg = string("");
	}
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
  syslog(LOG_DEBUG,"dom0: registering new session for: %lu",session.get_id());
  SessionIter iter = _session_coll.find(session.get_id());
  if (iter != _session_coll.end()) {
    //close and remove this session
    _session_coll.erase(iter);
    iter->second.close_session();
  }

  _session_coll.insert(pair<unsigned long,Session>(session.get_id(),session));

  //NEED TO FIX THIS BELOW--MAP ISN'T CALL COPY CONSTRUCTOR.
  //hack debug code here
  iter = _session_coll.find(session.get_id());
  iter->second._authenticate._proc = session._authenticate._proc;
  iter->second._configuration._proc = session._configuration._proc;
  iter->second._command._proc = session._command._proc;
}
