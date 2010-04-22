/**
 * Module: processor.cc
 *
 * Author: Michael Larson
 * Date: 2008
 */
#include <string>
#include <iostream>
#include <ctype.h>
#include <sys/types.h>
#include <string.h>
#include <dirent.h>
#include <expat.h>
#include <assert.h>
#include "authenticate.hh"
#include "processor.hh"

using namespace std;

int Processor::_REQ_BUFFER_SIZE = 2048;

/**
 *
 **/
void
Message::set_id(string &id)
{
  _id = id;
}

/**
 *
 **/
std::string
Message::id()
{
  return _id;
}

/**
 *
 **/
std::string
TemplateParams::get_xml()
{
  string empty;
  return get_xml(empty);
}

/**
 *
 **/
std::string
TemplateParams::get_xml(const string &value) 
{
  string out;
  if (_multi) {
    char buf[512];
    sprintf(buf,"%d",_multi_limit);
    out += "<multi>" +string(buf)+ "</multi>";
  }


  //currently only enabled for op mode, but can be used in a configuration context to denote an "active" node
  if (_action) {
    out += "<action/>";
  }

  if (_end) {
    if (value.empty()) {
      out += "<terminal/>";
    }
    else {
      out += "<terminal>" + value + "</terminal>";
    }
  }

  if (_enum.empty() == false) {
    out += "<enum>";
    set<string>::iterator iter = _enum.begin();
    while (iter != _enum.end()) {
      out += "<match>" + *iter + "</match>";
      ++iter;
    }
    out += "</enum>";
  }

  switch (_type) {
  case WebGUI::TEXT:
    out += "<type name='text'/>";
    break;
  case WebGUI::IPV4:
    out += "<type name='ivp4'/>";    
    break;
  case WebGUI::IPV4NET:
    out += "<type name='ivp4net'/>";    
    break;
  case WebGUI::IPV6:
    out += "<type name='ivp6'/>";    
    break;
  case WebGUI::IPV6NET:
    out += "<type name='ivp6net'/>";    
    break;
  case WebGUI::U32:
    out += "<type name='u32'/>";    
    break;
  case WebGUI::BOOL:
    out += "<type name='bool'/>";    
    break;
  case WebGUI::MACADDR:
    out += "<type name='macaddr'/>";    
    break;
  case WebGUI::NONE:
    break;
  }
  switch (_type2) {
  case WebGUI::TEXT:
    out += "<type name='text'/>";
    break;
  case WebGUI::IPV4:
    out += "<type name='ivp4'/>";    
    break;
  case WebGUI::IPV4NET:
    out += "<type name='ivp4net'/>";    
    break;
  case WebGUI::IPV6:
    out += "<type name='ivp6'/>";    
    break;
  case WebGUI::IPV6NET:
    out += "<type name='ivp6net'/>";    
    break;
  case WebGUI::U32:
    out += "<type name='u32'/>";    
    break;
  case WebGUI::BOOL:
    out += "<type name='bool'/>";    
    break;
  case WebGUI::MACADDR:
    out += "<type name='macaddr'/>";    
    break;
  case WebGUI::NONE:
    break;
  }

  if (_help.empty() == false) {
    out += "<help>";
    out += _help;
    out += "</help>";
  }

  if (_mandatory == true) {
    out += "<mandatory/>";
  }

  if (_comp_help.empty() == false) {
    out += "<comp_help>";
    _comp_help = WebGUI::mass_replace(_comp_help, "&", "&amp;");
    _comp_help = WebGUI::mass_replace(_comp_help, "\"", "&quot;");
    _comp_help = WebGUI::mass_replace(_comp_help, "'", "&apos;");
    _comp_help = WebGUI::mass_replace(_comp_help, "<", "&lt;");
    _comp_help = WebGUI::mass_replace(_comp_help, ">", "&gt;");
    out += _comp_help;
    out += "</comp_help>";
  }


  if (_default.empty() == false) {
    out += "<default>" + _default + "</default>";
  }
  return out;
}


/**
 *
 **/
extern "C" void
data_hndl(void *data, const XML_Char *s, int len) {
  Message *m = (Message*)data;
  if (m->_type == WebGUI::GETCONFIG) {
    char* buf = (char*)malloc( len + sizeof( char ) );
    memset( buf, '\0', len + sizeof( char ) );
    strncpy( buf, s, len );


    string str = string(buf);
    if (str.empty()) {
      return;
    }

    str = WebGUI::trim_whitespace(str);

    if (m->_node == WebGUI::GETCONFIG_ID) {
      m->set_id(str);
    }
    else if (m->_node == WebGUI::GETCONFIG_NODE) {
      //value between configuration tags

      str = WebGUI::mass_replace(str, "/", "%2F");
      str = WebGUI::mass_replace(str, " ", "/");

      m->_root_node = str;
    }
    free(buf);
  }
  else if (m->_type == WebGUI::NEWSESSION) {
    char* buf = (char*)malloc( len + sizeof( char ) );
    memset( buf, '\0', len + sizeof( char ) );
    strncpy( buf, s, len );

    string str = string(buf);
    str = WebGUI::trim_whitespace(str);

    if (m->_node == WebGUI::NEWSESSION_USER) {
      m->_user = str;
    }
    else if (m->_node == WebGUI::NEWSESSION_PSWD) {
      m->_pswd = str;
    }
    m->_root_node = str;
    free(buf);
  }
  else if (m->_type == WebGUI::CLICMD) {
    char* buf = (char*)malloc( len + sizeof( char ) );
    memset( buf, '\0', len + sizeof( char ) );
    strncpy( buf, s, len );

    string str = string(buf);
    str = WebGUI::trim_whitespace(str);

    if (m->_node == WebGUI::CLICMD_ID) {
      m->set_id(str);
    }
    else {
      m->_command_coll.push_back(str);
    }
    free(buf);
  }
  else if (m->_type == WebGUI::TOKEN) {
    char* buf = (char*)malloc( len + sizeof( char ) );
    memset( buf, '\0', len + sizeof( char ) );
    strncpy( buf, s, len );

    string str = string(buf);
    str = WebGUI::trim_whitespace(str);
    m->_token = str;
    free(buf);
  }
}

/**
 *
 **/
extern "C" void
start_hndl(void *data, const XML_Char *el, const XML_Char **attr) 
{
  Message *m = (Message*)data;
  if (strcmp(el,"configuration") == 0) {
    m->_type = WebGUI::GETCONFIG; 
  }
  else if (strcmp(el, "command") == 0) {
    m->_type = WebGUI::CLICMD; 
  }
  else if (strcmp(el, "auth") == 0) {
    m->_type = WebGUI::NEWSESSION; 
  }
  else if (strcmp(el, "token") == 0) {
    m->_type = WebGUI::TOKEN;
  }
  
  if (m->_type == WebGUI::GETCONFIG) {
    if (strcmp(el, "id") == 0) {
      m->_node = WebGUI::GETCONFIG_ID;
    }
    else if (strcmp(el, "node") == 0) {
      m->_node = WebGUI::GETCONFIG_NODE;

      //looking for op mode attribute
      for (int i=0;attr[i];i+=2) {
	if (strcmp(attr[i],"mode") == 0) {
	  if (strcmp(attr[i+1],"op") == 0) {
	    m->_conf_mode = WebGUI::OP;
	  }
	  else if (strcmp(attr[i+1],"app") == 0) {
	    m->_conf_mode = WebGUI::APP;
	  }
	  else {
	    m->_conf_mode = WebGUI::CONF;
	  }
	}
      }
    }
  }
  else if (m->_type == WebGUI::NEWSESSION) {
    if (strcmp(el, "user") == 0) {
      m->_node = WebGUI::NEWSESSION_USER;
    }
    else if (strcmp(el, "pswd") == 0) {
      m->_node = WebGUI::NEWSESSION_PSWD;
    }
  }
  else if (m->_type == WebGUI::CLICMD) {
    if (strcmp(el, "id") == 0) {
      m->_node = WebGUI::CLICMD_ID;
    }
    else if (strcmp(el, "statement") == 0) {
      m->_node = WebGUI::CLICMD_STATEMENT;
      for (int i=0;attr[i];i+=2) {
	if (strcmp(attr[i],"mode") == 0) {
	  if (strcmp(attr[i+1],"op") == 0) {
	    m->_conf_mode = WebGUI::OP;
	  }
	  else {
	    m->_conf_mode = WebGUI::CONF;
	  }
	}
      }
    }
  }
}    
    
/**
 *
 **/
extern "C" void
end_hndl(void *data, const XML_Char *el) {
  Message *m = (Message*)data;
  m->_node = WebGUI::EMPTY;
}  


/**
 *
 **/
Processor::Processor(bool debug) : 
  _debug(debug)
{

  _xml_parser = XML_ParserCreate(NULL);
  if (!_xml_parser) {
    cerr << "error setting up xml parser()" << endl;
  }

  void *foo = (void*)&(this->_msg);
  XML_SetUserData(_xml_parser, foo);

  XML_SetElementHandler(_xml_parser, start_hndl, end_hndl);
  XML_SetCharacterDataHandler(_xml_parser, data_hndl);

}

/**
 *
 **/
Processor::~Processor()
{
  if (_debug) {
    cout << "Processor::~Processor(), shutting down processor" << endl;
  }
}

/**
 *
 **/
void
Processor::init()
{
  _msg._request = (char*)malloc(_REQ_BUFFER_SIZE+1);
}

/**
 *
 **/
bool
Processor::parse()
{
  if (_debug) {
    cout << "Processor::parse(), processing message: " <<  _msg._request << endl;
  }

  //use expat to parse request.
  if (!XML_Parse(_xml_parser, _msg._request, strlen(_msg._request), true)) {
    char buf[20];
    sprintf(buf, "%d", WebGUI::MALFORMED_REQUEST);
    _msg._response = "<?xml version='1.0' encoding='utf-8'?><vyatta><token>"+_msg._token+"</token><error><code>"+string(buf)+"</code><msg>"+string(WebGUI::ErrorDesc[WebGUI::MALFORMED_REQUEST])+"</msg></error></vyatta>";
    return false;
  }

  if (_debug) {
    cout << "Processor::parse() request type: " << _msg._type << endl;
  }

  return true;
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
Processor::set_response(WebGUI::Error err)
{
  _msg._error_code = err;
}

/**
 *
 **/
void
Processor::set_response(WebGUI::Error err, std::string &resp)
{
  //will need to optimize this, remove string iteration

  //hook to remove control characters from response
  string::iterator iter = resp.begin();
  while (iter != resp.end()) {
    if (iscntrl(*iter) != 0) {
      *iter = ' ';
    }
    ++iter;
  }

  _msg._error_code = err;
  _msg._custom_error_msg = resp;
}

/**
 *
 **/
void
Processor::set_response(std::string &resp)
{
  //will need to optimize this, remove string iteration

  //hook to remove control characters from response
  string::iterator iter = resp.begin();
  while (iter != resp.end()) {
    if (iscntrl(*iter) != 0 && (*iter != '\n' && *iter != '\t' && *iter != '\r')) {
      *iter = ' ';
    }
    ++iter;
  }
  _msg._custom_response = resp;
}

/**
 *
 **/
string
Processor::get_response()
{
  if (_msg._custom_response.empty() == false) {
    _msg._response = _msg._custom_response;
  }
  else if (_msg._custom_error_msg.empty() == false) {
    char buf[20];
    sprintf(buf, "%d", _msg._error_code);
    _msg._response = "<?xml version='1.0' encoding='utf-8'?><vyatta><token>"+_msg._token+"</token><error><code>"+string(buf)+"</code><msg>"+_msg._custom_error_msg+"</msg></error></vyatta>";
    return _msg._response;
  }
  else {
    char buf[20];
    sprintf(buf, "%d", _msg._error_code);
    _msg._response = "<?xml version='1.0' encoding='utf-8'?><vyatta><token>"+_msg._token+"</token><error><code>"+string(buf)+"</code><msg>"+string(WebGUI::ErrorDesc[_msg._error_code])+"</msg></error></vyatta>";
  }
  return _msg._response;
}


