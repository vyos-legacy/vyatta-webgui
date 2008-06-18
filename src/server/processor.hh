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
  TemplateParams() : _multi(false), _end(false), _type(WebGUI::NONE) {}
  bool _multi;
  bool _end;
  WebGUI::NodeType _type;
  std::string _help;
  std::string _default;
  std::vector<std::string> _enum;
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
  Message() : _mode(0),_id(0) {}
  
  void
  set_id(unsigned long id);

  std::string
  id();

  unsigned long
  id_by_val();

public:
  char *_request;
  std::string _response;
  WebGUI::MsgType _type;
  WebGUI::ParseNode _node;
  std::string _root_node; //will want to wrap this in a type specific container
  int _mode;
  std::string _user;
  std::string _pswd;
  std::vector<std::string> _command_coll;
  WebGUI::Error _error_code;
  std::string _custom_error_msg;
  std::string _custom_response;

private:
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
  set_session_id(unsigned long id) {_msg.set_id(id);}

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
