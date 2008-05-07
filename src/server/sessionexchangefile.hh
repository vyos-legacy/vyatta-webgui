#ifndef __SESSIONEXCHANGEFILE_HH__
#define __SESSIONEXCHANGEFILE_HH__

#include <string>
#include "session.hh"
#include "sessionexchange.hh"

class SessionExchangeFile : public SessionExchange
{
public:
  SessionExchangeFile(const std::string &file, bool debug);
  ~SessionExchangeFile();

  void
  init();

  Session
  check_for_new_connection();

  bool
  read(Session &session);

  bool
  write(Session &session);

private:
  std::string _file;
};

#endif //__SESSIONEXCHANGEFILE_HH__
