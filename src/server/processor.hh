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
#include <expat.h>
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

class TemplateParams
{
public:
  TemplateParams() : _multi(false), _type(WebGUI::NONE) {}
  bool _multi;
  WebGUI::NodeType _type;
  std::string _help;
  //enumeration goes here

  std::string
  get_xml();
};

class Message
{
public:
  Message() : _depth(2),_mode_template(false),_id(0) {}

  char *_request;
  std::string _response;
  WebGUI::MsgType _type;
  WebGUI::ParseNode _node;
  std::string _root_node; //will want to wrap this in a type specific container
  long _depth;
  bool _mode_template;
  std::string _user;
  std::string _pswd;
  unsigned long _id;
  std::string _command;
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

  void
  create_response();

  void
  set_request(std::vector<uint8_t> &buf);

  void
  set_request(std::string &buf);

  void
  set_response(std::string &resp);

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

public:
  Message _msg;
private:
  static int _REQ_BUFFER_SIZE;
  XML_Parser _xml_parser;
  bool _debug;
};

#endif //__PROCESSOR_HH__
