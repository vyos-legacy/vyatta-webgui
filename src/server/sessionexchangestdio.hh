#ifndef __SESSIONEXCHANGESTDIO_HH__
#define __SESSIONEXCHANGESTDIO_HH__

#include <string>
#include "session.hh"
#include "sessionexchange.hh"

class SessionExchangeStdIO : public SessionExchange
{
public:
  SessionExchangeStdIO(bool debug);
  ~SessionExchangeStdIO();

  void
  init();

  Session
  check_for_new_connection();

  bool
  read(Session &session);

  bool
  write(Session &session);

private:
  const static unsigned long _request_limit;
};

#endif //__SESSIONEXCHANGESTDIO_HH__
