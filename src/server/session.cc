#include <iostream>
#include <unistd.h>
#include <vector>
#include <string>
#include "common.hh"
#include "processor.hh"
#include "session.hh"

using namespace std;

Session::Session(int sock, bool debug) : 
  _valid(false),
  _debug(debug), 
  _sock(sock)
{
  _processor = NULL;
}

void
Session::init(Processor *proc)
{
  _processor = proc;
}

void
Session::set_sock(int sock) 
{
  _sock = sock;
  if (_sock > 0) {
    _valid = true;
  }
}

void
Session::set_message(vector<uint8_t> &buf)
{
  _processor->set_request(buf);
}

void
Session::set_message(string &str)
{
  _processor->set_request(str);
}

bool
Session::process_message()
{
  //hack
  _debug = true;

  //parse the message, and compute the response back
  if (_processor->parse() == true) {
    if (_debug) {
      cout << "Session::process_message(), session received valid request" << endl;
    }

    CmdData data;
    ConfigData config_data;
    Message msg = _processor->get_msg();
    switch (msg._type) {
    case WebGUI::NEWSESSION:
      if (_debug) {
	cout << "Session::process_message(): NEWSESSION" << endl;
      }
      create_new_cli_session();
      break;

    case WebGUI::CLICMD:
      if (_debug) {
	cout << "Session::process_message(): CLICMD" << endl;
      }
      //      data = execute_command(_processor.get_command());
      //      _processor.set_response(data);
      break;

    case WebGUI::GETCONFIG:
      if (_debug) {
	cout << "Session::process_message(): GETCONFIG" << endl;
      }
      //      config_data = _processor.get_config_request();

      //parses the trees????
      //      get_config(config_data);
      //      _processor.set_response(config_data);
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
    cerr << "Session::process_message(): message is unknown" << endl;
    return false;
  }
  //  _processor->set_session_id(_id);

  return true;
}

CmdData
Session::execute_command(const string &cmd)
{
  //execute this command in the remote session now

  //make sure to strip off any unexpected characters here

  //make sure that the shell environment is set up correctly
  int err = execl(cmd.c_str(),"");

  

  //capture the response, stdout, stderr, errcode and return
  CmdData cmd_data;
  cmd_data._err = err;
  return cmd_data;
}

int
Session::create_new_cli_session()
{

}

void
Session::clear_message()
{
  _processor->clear_message();
}

