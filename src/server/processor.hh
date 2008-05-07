/**
 * Module: processor.hh
 *
 * Author: Michael Larson
 * Date: 2008
 */
#ifndef __PROCESSOR_HH__
#define __PROCESSOR_HH__

#include <list>
#include <string>
#include <vector>
#include <utility>
//#include <sablot.h>
#include <regex.h>
#include "common.hh"

class ConfigData
{

};

class ConfigRequestData
{

};

class CmdData
{
public:
  int _err;
};

class Message
{
public:
  char *_request;
  std::string _response;
  WebGUI::MsgType _type;
  unsigned long _id;
};

class Processor
{
public:
  Processor(bool debug);
  ~Processor();

  void
  init();

  bool
  parse();

  std::string
  get_command();

  ConfigData
  get_config_request();

  void
  create_response();

  void
  set_request(std::vector<uint8_t> &buf);

  void
  set_request(std::string &buf);

  void
  set_response(CmdData &cmd_data);

  void
  set_response(ConfigData &config_data);

  std::string
  get_response();

  Message
  get_msg() {return _msg;}

  void
  set_session_id(unsigned long id) {_msg._id = id;}

  void
  clear_message() {_msg = Message();}

  std::string
  get_configuration();

  void
  parse_configuration(std::string &root, std::string &out);

private:
  Message _msg;
  regex_t _auth_regex;
  regex_t _command_regex;
  regex_t _configuration_regex;
  bool _debug;
};

#endif //__PROCESSOR_HH__
