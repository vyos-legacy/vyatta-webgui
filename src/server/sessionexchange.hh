#ifndef __SESSIONEXCHANGE_HH__
#define __SESSIONEXCHANGE_HH__

#include "session.hh"

class SessionExchange
{
public:
  SessionExchange(bool debug);
  virtual ~SessionExchange();

  void virtual
  init() = 0;

  Session virtual
  check_for_new_connection() = 0;

  bool virtual
  read(Session &session) = 0;

  bool virtual
  write(Session &session) = 0;

protected:
  bool _debug;
};

#endif //__SESSIONEXCHANGE_HH__
