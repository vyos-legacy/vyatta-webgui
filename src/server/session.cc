#include <iostream>
#include <unistd.h>
#include <vector>
#include <string>
#include "common.hh"
#include "processor.hh"
#include "session.hh"

using namespace std;

/**
 *
 **/
Session::Session(int sock, bool debug) : 
  _valid(false),
  _debug(debug), 
  _sock(sock)
{
  _processor = NULL;
}

/**
 *
 **/
void
Session::init(Processor *proc)
{
  _processor = proc;

  _authenticate.init(_processor);
  _configuration.init(_processor);
  _command.init(_processor);
}

/**
 *
 **/
void
Session::set_sock(int sock) 
{
  _sock = sock;
  if (_sock > 0) {
    _valid = true;
  }
}

/**
 *
 **/
void
Session::set_message(vector<uint8_t> &buf)
{
  _processor->set_request(buf);
}

/**
 *
 **/
void
Session::set_message(string &str)
{
  _processor->set_request(str);
}

std::string
Session::get_message() 
{
  return _processor->get_response();
}

/**
 *
 **/
bool
Session::process_message()
{
  if (_debug) {
    cout << "Session::process_message(), entering" << endl;
  }

  //parse the message, and compute the response back
  if (_processor->parse() == true) {
    if (_debug) {
      cout << "Session::process_message(), session received valid request" << endl;
    }

    Message msg = _processor->get_msg();
    switch (msg._type) {
    case WebGUI::NEWSESSION:
      if (_debug) {
	cout << "Session::process_message(): NEWSESSION" << endl;
      }
      _authenticate.create_new_session();
      break;

    case WebGUI::CLICMD:
      if (_debug) {
	cout << "Session::process_message(): CLICMD" << endl;
      }
      _command.execute_command();
      break;

    case WebGUI::GETCONFIG:
      if (_debug) {
	cout << "Session::process_message(): GETCONFIG" << endl;
      }
      _configuration.get_config();
      break;

    case WebGUI::CLOSESESSION:
      if (_debug) {
	cout << "Session::process_message(): CLOSESESSION" << endl;
      }
      close_session();
      break;

    default:
      cerr << "Session::process_message(): message type is unknown: " << endl;
      return false;
    }
  }
  else {
    if (_debug) {
      cerr << "Session::process_message(): message is unknown" << endl;
    }
    return false;
  }
  return true;
}

/**
 *
 **/
void
Session::clear_message()
{
  _processor->clear_message();
}

