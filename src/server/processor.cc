/**
 * Module: processor.cc
 *
 * Author: Michael Larson
 * Date: 2008
 */
#include <string>
#include <iostream>
#include <regex.h>
#include <sys/types.h>
#include <dirent.h>
#include "processor.hh"

using namespace std;

int Processor::_REQ_BUFFER_SIZE = 2048;

/**
 *
 **/
Processor::Processor(bool debug) : 
  _debug(debug)
{

}

/**
 *
 **/
Processor::~Processor()
{
  if (_debug) {
    cout << "Processor::~Processor(), shutting down processor" << endl;
  }
  regfree(&_auth_regex);
  regfree(&_command_regex);
  regfree(&_configuration_regex);
}

/**
 *
 **/
void
Processor::init()
{
  string match = "<auth>";
  int status = regcomp(&_auth_regex, match.c_str(), REG_EXTENDED | REG_ICASE);
  if (status != 0) {
    cerr << "Processor::init(), error in compiling regex" << endl;
  }
  
  match = "<command>";
  status = regcomp(&_command_regex, match.c_str(), REG_EXTENDED | REG_ICASE);
  if (status != 0) {
    cerr << "Processor::init(), error in compiling regex" << endl;
  }
  
  match = "<configuration>";
  status = regcomp(&_configuration_regex, match.c_str(), REG_EXTENDED | REG_ICASE);
  if (status != 0) {
    cerr << "Processor::init(), error in compiling regex" << endl;
  }

  _msg._request = (char*)malloc(_REQ_BUFFER_SIZE+1);
}

/**
 *
 **/
bool
Processor::parse()
{
  if (_debug) {
    cout << "Processor::parse(), processing message: " <<  endl;
  }

  //we'll cheat right now and just regex out the 3 different request types
  int status = regexec(&_auth_regex, (const char *)_msg._request, 0, 0, 0);
  if (status == 0) {
    _msg._type = WebGUI::NEWSESSION;
    //    cout << "match newsession" << endl;
    return true;
  }
  status = regexec(&_command_regex, (const char*)_msg._request, 0,0,0);
  if (status == 0) {
    _msg._type = WebGUI::CLICMD;
    //    cout << "match clicmd" << endl;
    return true;
  }
  status = regexec(&_configuration_regex, (const char*)_msg._request, 0,0,0);
  if (status == 0) {
    _msg._type = WebGUI::GETCONFIG;
    //    cout << "match getconfig" << endl;
    return true;
  }
  return false;
}

/**
 *
 **/
void
Processor::set_request(vector<uint8_t> &buf)
{
  int size = buf.size();
  if (size < 1) {
    buf.push_back(' ');
  }
  if (size > _REQ_BUFFER_SIZE) {
    size = _REQ_BUFFER_SIZE;
  }

  memcpy(_msg._request, &buf[0], size);
  *(_msg._request + size) = '\0';
  if (_debug) {
    cout << "Processor::set_request(): ";
    for (int i = 0; i < size; ++i) {
      cout << _msg._request[i];
    }
    cout << endl;
  }
}


/**
 *
 **/
void
Processor::set_request(string &buf)
{
  int size = buf.size();
  if (size < 1) {
    buf = " ";
  }
  if (size > _REQ_BUFFER_SIZE) {
    size = _REQ_BUFFER_SIZE;
  }

  for (int i = 0; i < size; ++i) {
    _msg._request[i] = buf[i];
  }
  if (_debug) {
    cout << "Processor::set_request(): ";
    for (int i = 0; i < size; ++i) {
      cout << _msg._request[i];
    }
    cout << endl;
  }
}


/**
 *
 **/
void
Processor::set_response(CmdData &cmd_data)
{
  //right now return dummy confirmation;

}

/**
 *
 **/
string
Processor::get_response()
{
  //dummy here for now
  string response;
  if (_msg._type == WebGUI::NEWSESSION) {
    _msg._response = "<?xml version='1.0' encoding='utf-8'?><vyatta><id>0123456789</id><error><code>code</code><desc>string</desc></error></vyatta>";
  }
  else if (_msg._type == WebGUI::GETCONFIG) {
    _msg._response = get_configuration();
  }
  else if (_msg._type == WebGUI::CLICMD) {
    _msg._response = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>0</code></error></vyatta>";
  }
  return _msg._response;
}


/**
 *
 **/
string
Processor::get_configuration()
{
  //  return "<?xml version='1.0' encoding='utf-8'?><vyatta><node name='firewall'><node name='broadcast-ping'><type name='text'><enum><match>enable</match><match>disable</match></enum></type></node></vyatta>";

  //now parse the request to form: attribute: mode, attribute: depth, value: root
  string req(_msg._request);
  /*
  int depth = 1;
  int pos = string::npos;
  if ((pos = req.find("depth")) != string::npos) {
    depth = 
  }
  */

  //skip attributes until I get a proper xml processor 
  string rel_root;
  int pos = req.find(">");
  if (pos != string::npos) {
    int endpos = req.substr(pos).find("<");
    rel_root = req.substr(pos+1,endpos-1);
  }
  
  string root("/opt/vyatta/config/active");

  if (!rel_root.empty()) {
    root += "/" + rel_root;
  }
  
  //recurse directory structure here to grab configuration
  string out = "<?xml version='1.0' encoding='utf-8'?><vyatta>";
  parse_configuration(root,out);
  out += "</vyatta>";
  return out;
}


/**
 *
 **/
void
Processor::parse_configuration(string &root, string &out)
{
  DIR *dp;
  struct dirent *dirp;

  if ((dp = opendir(root.c_str())) == NULL) {
    cout << "handle_default: opendir: " << root << endl;
    return;
  }
  while ((dirp = readdir(dp)) != NULL) {
    if (dirp->d_name[0] != '.' && strcmp(dirp->d_name,"def") != 0) {
      if (strcmp(dirp->d_name,"node.val") != 0) {
	string new_root = root + "/" + dirp->d_name;
	out += string("<node name='") + string(dirp->d_name) + "'>";
	out += "<configured>active</configured>";
	parse_configuration(new_root, out);
	out += "</node>";
      }
      else {
	parse_value(root, out);
      }
    }
  }
  closedir(dp);
  return;
}


/**
 *
 **/
void
Processor::parse_value(string &root, string &out)
{
  string value;
  string file = root + "/node.def";
  FILE *fp = fopen(file.c_str(), "r");
  if (fp) {
    char buf[1025];
    //read value in here....
    while (fgets(buf, 1024, fp) != 0) {
      value += buf;
    }
    out += "<node>" + value.substr(0,value.length()-1) + "<configured>active</configured></node>";
    fclose(fp);
  }
  return;
}
