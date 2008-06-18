#ifndef __MANAGER_HH__
#define __MANAGER_HH__

#include <map>
#include "session.hh"
#include "sessionexchange.hh"
#include "processor.hh"
#include "common.hh"

class Manager 
{
public:
  typedef std::map<unsigned long,Session> SessionColl;
  typedef std::map<unsigned long,Session>::iterator SessionIter;

  Manager(SessionExchange *se, bool strip_error_message, bool debug);
  ~Manager();
  
  bool 
  init();

  bool
  process();

private:
  void 
  register_session(Session &session);

  Session
  listen_for_new_session();

private:
  bool _debug;
  bool _strip_err_msg;
  SessionColl _session_coll;
  SessionExchange *_se;
  Processor _processor;
};
#endif //__MANAGER_HH__ 
