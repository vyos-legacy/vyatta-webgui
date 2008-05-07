#ifndef __SESSIONEXCHANGESOCKET_HH__
#define __SESSIONEXCHANGESOCKET_HH__

#include "session.hh"
#include "sessionexchange.hh"

class SessionExchangeSocket : public SessionExchange
{
public:
  SessionExchangeSocket(unsigned short port, bool debug);
  ~SessionExchangeSocket();

  void
  init();

  Session
  check_for_new_connection();

  bool
  read(Session &session);

  bool
  write(Session &session);

private:
  unsigned short _port;
  int _listen_sock;
};

#endif //__SESSIONEXCHANGESOCKET_HH__
