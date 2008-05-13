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
#include <expat.h>
#include "processor.hh"

using namespace std;

int Processor::_REQ_BUFFER_SIZE = 2048;

std::string
TemplateParams::get_xml() 
{
  string out;
  if (_multi) {
    out += "<multi/>";
  }

  if (_type == WebGUI::TEXT) {
    out += "<type name='text'/>";
  }
  else if (_type == WebGUI::IPV4) {
    out += "<type name='ivp4'/>";    
  }
  else if (_type == WebGUI::IPV4NET) {
    out += "<type name='ivp4net'/>";    
  }
  else if (_type == WebGUI::U32) {
    out += "<type name='u32'/>";    
  }

  if (_help.empty() == false) {
    out += "<help>" + _help + "</help>";
  }

  return out;
}


extern "C" void
data_hndl(void *data, const XML_Char *s, int len) {
  Message *m = (Message*)data;
  if (m->_type == WebGUI::GETCONFIG) {
    char* buf = (char*)malloc( len + sizeof( char ) );
    memset( buf, '\0', len + sizeof( char ) );
    strncpy( buf, s, len );
    m->_root_node = string(buf);
    free(buf);
  }
}

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
}    
    
extern "C" void
end_hndl(void *data, const XML_Char *el) {
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
    cerr << "Processor::parse(), error in parsing request" << endl;
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
    if (_msg._mode_template == true) {
      _msg._response = get_template();
    }
    else {
      _msg._response = get_configuration();
    }
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
  //now parse the request to form: attribute: mode, attribute: depth, value: root
  string req(_msg._request);

  //recurse directory structure here to grab configuration
  long depth = _msg._depth;
  string out = "<?xml version='1.0' encoding='utf-8'?><vyatta>";
  //note that this will need to replace template directory path with a back-check of multi-nodes
  parse_configuration(_msg._root_node,_msg._root_node, depth,out);
  out += "</vyatta>";
  return out;
}


/**
 *
 **/
string
Processor::get_template()
{
  //now parse the request to form: attribute: mode, attribute: depth, value: root
  string req(_msg._request);
  
  //parses all template nodes (or until depth to provide full template tree


  //recurse directory structure here to grab configuration
  long depth = _msg._depth;
  string out = "<?xml version='1.0' encoding='utf-8'?><vyatta>";
  parse_template(_msg._root_node,depth,out);
  out += "</vyatta>";
  return out;
}

/**
 *
 **/
void
Processor::get_template_node(const string &path, TemplateParams &params)
{
  string root_template("/opt/vyatta/share/vyatta-cfg/templates");
  string tmpl_file = root_template + "/" + path + "/node.def";
  
  //open the file here and parse
  FILE *fp = fopen(tmpl_file.c_str(), "r");
  if (fp) {
    char buf[1025];
    //read value in her....
    while (fgets(buf, 1024, fp) != 0) {
      string line = string(buf);
      if (line.find("tag:") != string::npos) {
	params._multi = true;
      }
      else if (line.find("type:") != string::npos) {
	if (line.find("txt") != string::npos) {
	  params._type = WebGUI::TEXT;
	}
	else if (line.find("ipv4") != string::npos) {
	  params._type = WebGUI::IPV4;
	}
	else if (line.find("u32") != string::npos) {
	  params._type = WebGUI::U32;
	}

      }
      else if (line.find("help:") != string::npos) {
	//need to escape out '<' and '>'
	params._help = line.substr(5,line.length()-6);
	string help = mass_replace(params._help, "<", "&#60;");
	help = mass_replace(help, ">", "&#62;");
	params._help = help;
      }
    }

    fclose(fp);
  }
}



/**
 *
 **/
void
Processor::parse_configuration(string &rel_config_path, string &rel_tmpl_path, long &depth, string &out)
{
  static string root_config("/opt/vyatta/config/active");
  static string root_template("/opt/vyatta/share/vyatta-cfg/templates");
  DIR *dp;
  struct dirent *dirp;

  --depth;
  if (depth == 0) {
    return;
  }

  string full_config_path = root_config + "/" + rel_config_path;
  string full_template_path = root_template + "/" + rel_tmpl_path;

  if ((dp = opendir(full_config_path.c_str())) == NULL) {
    return;
  }

  //  cout << "Processor::parse_configuation: " << full_config_path << endl;
  //  cout << "Processor::parse_configuation: " << full_template_path << endl << endl;
  

  while ((dirp = readdir(dp)) != NULL) {
    if (dirp->d_name[0] != '.' && strcmp(dirp->d_name,"def") != 0) {
      string new_rel_config_path = rel_config_path + "/" + dirp->d_name;
      if (strcmp(dirp->d_name,"node.val") != 0) {
	out += string("<node name='") + string(dirp->d_name) + "'>";
	out += "<configured>active</configured>";
	long new_depth = depth;
	
	//at this point reach out to the template directory and retreive data on this node
	TemplateParams tmpl_params;
	string new_rel_tmpl_path = rel_tmpl_path;
	get_template_node(new_rel_tmpl_path, tmpl_params);
	if (tmpl_params._multi == true) {
	  new_rel_tmpl_path += "/node.tag";
	}
	else {
	  new_rel_tmpl_path += "/" + string(dirp->d_name);
	}
	out += tmpl_params.get_xml();


	parse_configuration(new_rel_config_path, new_rel_tmpl_path, new_depth, out);
	out += "</node>";
      }
      else {
	out += "<node>";
	parse_value(new_rel_config_path, out);
	TemplateParams tmpl_params;
	get_template_node(rel_tmpl_path, tmpl_params);
	out += tmpl_params.get_xml();
	out += "</node>";
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
Processor::parse_template(string &rel_tmpl_path, long &depth, string &out)
{
  static string root_template("/opt/vyatta/share/vyatta-cfg/templates");
  DIR *dp;
  struct dirent *dirp;

  --depth;
  if (depth == 0) {
    return;
  }

  string full_template_path = root_template + "/" + rel_tmpl_path;

  if ((dp = opendir(full_template_path.c_str())) == NULL) {
    return;
  }

  //  cout << "Processor::parse_template: " << full_template_path << endl << endl;

  while ((dirp = readdir(dp)) != NULL) {
    if (dirp->d_name[0] != '.') {
      string new_rel_tmpl_path = rel_tmpl_path + "/" + dirp->d_name;
      if (strcmp(dirp->d_name,"node.def") != 0) {
	out += string("<node name='") + string(dirp->d_name) + "'>";

	///only if this node is configured does this show up.
	long new_depth = depth;
	
	//at this point reach out to the template directory and retreive data on this node
	TemplateParams tmpl_params;
	string new_rel_tmpl_path = rel_tmpl_path;
	get_template_node(new_rel_tmpl_path, tmpl_params);
	if (tmpl_params._multi == true) {
	  new_rel_tmpl_path += "/node.tag";
	}
	else {
	  new_rel_tmpl_path += "/" + string(dirp->d_name);
	}
	out += tmpl_params.get_xml();

	parse_template(new_rel_tmpl_path, new_depth, out);
	out += "</node>";
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
Processor::parse_value(string &rel_path, string &out)
{
  string value;
  string root_config("/opt/vyatta/config/active");
  string file = root_config + "/" + rel_path;

  //  cout << "opening node.val file at: " << file << endl;  

  FILE *fp = fopen(file.c_str(), "r");
  if (fp) {
    char buf[1025];
    //read value in her....
    while (fgets(buf, 1024, fp) != 0) {
      value += buf;
    }
    out += value.substr(0,value.length()-1) + "<configured>active</configured>";
    fclose(fp);
  }
  return;
}

std::string // replace all instances of victim with replacement
Processor::mass_replace(const std::string &source, const std::string &victim, const
	     std::string &replacement)
{
  std::string answer = source;
  std::string::size_type j = 0;
  while ((j = answer.find(victim, j)) != std::string::npos )
    answer.replace(j, victim.length(), replacement);
  return answer;
}
