/**
 * Module: processor.cc
 *
 * Author: Michael Larson
 * Date: 2008
 */
#include <string>
#include <iostream>
#include <sys/types.h>
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
Message::set_id(unsigned long id)
{
  _id = id;
}

/**
 *
 **/
string
Message::id()
{
  char buf[40];
  sprintf(buf, "%u", _id);
  return string(buf);
}

unsigned long
Message::id_by_val()
{
  return _id;
}

/**
 *
 **/
std::string
TemplateParams::get_xml() 
{
  string out;
  if (_multi) {
    out += "<multi/>";
  }

  if (_enum.empty() == false) {
    out += "<enum>";
    vector<string>::iterator iter = _enum.begin();
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
  }

  if (_help.empty() == false) {
    out += "<help>" + _help + "</help>";
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
    str = WebGUI::trim_whitespace(str);

    if (m->_node == WebGUI::GETCONFIG_ID) {
      char val[40];
      m->set_id(strtoul(str.c_str(), NULL, 10));
    }
    else {
      //value between configuration tags
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
      char val[40];
      m->set_id(strtoul(str.c_str(), NULL, 10));
    }
    m->_command = str;
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
  
  if (m->_type == WebGUI::GETCONFIG) {
    if (strcmp(el, "id") == 0) {
      m->_node = WebGUI::GETCONFIG_ID;
    }
    //set root search node here
    for (int i = 0; attr[i]; i += 2) {
      if (strcmp(attr[i],"mode") == 0) {
	if (strcmp(attr[i+1],"template") == 0) {
	  m->_mode_template = true;
	}
      }
      else if (strcmp(attr[i],"depth") == 0) {
	long val = strtol(attr[i+1],NULL,10);
	if (val > 64 || val < 0) {
	  val = 0;
	}
	m->_depth = val;
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
    _msg._response = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[WebGUI::MALFORMED_REQUEST])+"</error></vyatta>";
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
Processor::set_response(string &resp)
{
  _msg._response = resp;
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
    uid_t id = _msg.id_by_val();

    char buf[20];
    if (id == 0) {
      sprintf(buf, "%d", WebGUI::AUTHENTICATION_FAILURE);
      _msg._response = "<?xml version='1.0' encoding='utf-8'?><vyatta><error>"+string(buf)+"</error><code>code</code><desc>"+string(WebGUI::ErrorDesc[WebGUI::AUTHENTICATION_FAILURE])+"</desc></error></vyatta>";
    }
    else {
      //now at this point generate the new configuration tree and environment settings
      _msg._response = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><id>"+_msg.id()+"</id><code>0</code><error></error></vyatta>";
    }
  }
  else if (_msg._type == WebGUI::GETCONFIG) {
    //build out response here
    //    assert(false);
  }
  else if (_msg._type == WebGUI::CLICMD) {
    _msg._response = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>0</code></error></vyatta>";
  }
  return _msg._response;
}


