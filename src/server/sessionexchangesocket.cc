#include <unistd.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <string.h>
#include <syslog.h>
#include <errno.h>
#include <iostream>
#include <string>
#include "common.hh"
#include "session.hh"
#include "sessionexchange.hh"
#include "sessionexchangesocket.hh"

using namespace std;

/**
 *
 **/
SessionExchangeSocket::SessionExchangeSocket(unsigned short port, bool debug) :
  SessionExchange(debug),
  _port(port)
{

}

/**
 *
 **/
SessionExchangeSocket::~SessionExchangeSocket()
{
  if (_listen_sock) {
    close(_listen_sock);
  }
}

/**
 *
 **/
void
SessionExchangeSocket::init()
{
  int size = 1;
  struct sockaddr_in addr;
  memset( &addr, 0, sizeof( struct sockaddr_in ));
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = htonl(INADDR_ANY);
  addr.sin_port = htons(_port);

  _listen_sock = socket (AF_INET, SOCK_STREAM, 0);
  if (_listen_sock <= 0) {
    cerr << "SessionExchangeSocket::init(), can't create socket: " << _listen_sock << ", " << strerror(errno) << endl;
    return;
  }
  
  int ret = bind(_listen_sock, (struct sockaddr *)&addr, sizeof(struct sockaddr_in));
  if (ret < 0) {
    cerr << "SessionExchangeSocket::init() Can't bind to socket: " << strerror(errno) << endl;
    close(_listen_sock);
    return;
  }

  ret = ioctl(_listen_sock, FIONBIO, (char *)&size);
  if (ret < 0) {
    cout << "SessionExchangeSocket::init(): error on setting listen socket as non-blocking" << ret << endl;
    close(_listen_sock);
    return;
  }

  ret = listen(_listen_sock, 5);
  if (ret < 0) {
    cout << "SessionExchangeSocket::init(): error on listen: " << ret << endl;
    close(_listen_sock);
    return;
  }
  return;
}

/**
 *
 **/
Session 
SessionExchangeSocket::check_for_new_connection()
{
  Session session(0,_debug);
  struct sockaddr_in client_addr;

  if (_debug) {
    cout << "SessionExchangeSocket::check_for_new_connection()" << endl;
  }
  int clilen = sizeof(client_addr);
  int new_sock = accept(_listen_sock, 
			(struct sockaddr *) &client_addr, 
			(socklen_t*)&clilen);
  if (new_sock < 0 && _debug) {
    cerr << "SessionExchangeSocket::listen_for_new_session(): " << errno << endl;
    return session;
  }

  //parse message and authenticate
  session.set_sock(new_sock);

  //construct session object here
  return session;
}

/**
 *
 **/
bool
SessionExchangeSocket::read(Session &session)
{
  vector<uint8_t> message;
  vector<uint8_t> buffer(2048);
  size_t off = 0;
  ssize_t got = -1;

  if (_debug) {
    cout << "SessionExchangeSocket::read(): " << session.get_sock() << endl;
  }

  for ( ; ; ) {
    //don't block on recv
    do {
      got = recv(session.get_sock(), &buffer[0], buffer.size(), MSG_DONTWAIT | MSG_PEEK);
      cout << "got: " << got << endl;
      if ((got < 0) && (errno == EINTR))
	continue;	// XXX: the receive was interrupted by a signal
      if ((got < 0) || (got < (ssize_t)buffer.size()))
	break;	// The buffer is big enough
      if (got == 0) {
	return false; //orderly shutdown
      }
      buffer.resize(buffer.size() + 2048);
    } while (true);
    
    got = recv(session.get_sock(), &buffer[0], buffer.size(), MSG_DONTWAIT);
    if (got < 0) {
      if (errno == EINTR) {
	continue;
      }
      break;
    }
    if (got == 0) {
      return false; //orderly shutdown
    }

    message.resize(message.size() + got);
    memcpy(&message[off], &buffer[0], got);
    off += got;
  }

  if (_debug) {
    cout << "SessionExchangeSocket::read(): setting message of size: " << got << ", " << message.size() << endl;
  }
  if (message.size() > 0) {
    session.set_message(message);
    return true;
  }
  return false;
}

/**
 *
 **/
bool
SessionExchangeSocket::write(Session &session)
{
  int index = 0;
  int tries = 0;
  int ret = 1;
  string msg = session.get_message();
 
  while (ret > 0 && index != (int)msg.length() && tries < 5) {
    ret = send(session.get_sock(), msg.c_str(), msg.length(), 0);
    if (ret > 0) {
      index += ret;
    }
    ++tries;
  }
  return true;
}

