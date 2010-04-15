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
#include <set>
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
  TemplateParams() : 
    _multi(false), 
    _end(false), 
    _action(false),
    _type(WebGUI::NONE), 
    _type2(WebGUI::NONE), 
    _conf_mode(WebGUI::NOATTR),
    _mandatory(false) {}
  bool _multi;
  bool _end;
  bool _action;
  WebGUI::NodeType _type;
  WebGUI::NodeType _type2;
  WebGUI::Attributes _conf_mode;
  std::string _help;
  std::string _comp_help;
  bool        _mandatory;
  std::string _default;
  std::set<std::string> _enum;
  std::string _allowed; //matches the allowed in node.def
  //enumeration goes here

  std::string
  get_xml(const std::string &value);
  std::string
  get_xml();
};

class Message
{
public:
  Message() : _mode(0) {}
  
  void
  set_id(std::string &id);

  std::string
  id();

public:
  char *_request;
  std::string _response;
  WebGUI::MsgType _type;
  WebGUI::Attributes _conf_mode;
  WebGUI::ParseNode _node;
  std::string _root_node; //will want to wrap this in a type specific container
  int _mode;
  std::string _user;
  std::string _pswd;
  std::vector<std::string> _command_coll;
  WebGUI::Error _error_code;
  std::string _custom_error_msg;
  std::string _custom_response;
  std::string _token;


private:
  std::string _id;
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
  set_response(WebGUI::Error err, std::string &msg);

  void
  set_response(WebGUI::Error err);

  void
  set_response(std::string &resp);

  std::string
  get_response();

  Message
  get_msg() {return _msg;}

  void
  set_session_id(std::string id) {_msg.set_id(id);}

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
