#include <string>
#include <map>
#include <iostream>
#include <sys/types.h>
#include <dirent.h>
#include "processor.hh"
#include "systembase.hh"
#include "configuration.hh"

using namespace std;

/**
 *
 **/
Configuration::Configuration() : SystemBase()
{

}

/**
 *
 **/
Configuration::~Configuration()
{

}

/**
 *
 **/
void
Configuration::get_config()
{
  //now check for directory
  if (!validate_session(_proc->get_msg().id_by_val())) {
    char buf[40];
    sprintf(buf, "%d", WebGUI::SESSION_FAILURE);
    string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[WebGUI::SESSION_FAILURE])+"</error></vyatta>";
    _proc->set_response(err);
    return;
  }

  if (_proc->get_msg()._mode_template == true) {
    string foo = get_template();
    _proc->set_response(foo);
  }
  else {
    string bar = get_configuration();
    _proc->set_response(bar);
  }
}

/**
 *
 **/
string
Configuration::get_configuration()
{
  //note, we'll also need to capture the temporary session changes

  //now parse the request to form: attribute: mode, attribute: depth, value: root
  Message msg = _proc->get_msg();
  string req(msg._request);

  //recurse directory structure here to grab configuration
  long depth = msg._depth;
  string out = "<?xml version='1.0' encoding='utf-8'?><vyatta>";
  //note that this will need to replace template directory path with a back-check of multi-nodes
  parse_configuration(msg._root_node,msg._root_node, depth,out);
  out += "</vyatta>";
  return out;
}


/**
 *
 **/
string
Configuration::get_template()
{
  Message msg = _proc->get_msg();
  //parses all template nodes (or until depth to provide full template tree
  //now parse the request to form: attribute: mode, attribute: depth, value: root
  string req(msg._request);

  //recurse directory structure here to grab configuration
  long depth = msg._depth;
  string out = "<?xml version='1.0' encoding='utf-8'?><vyatta>";
  parse_template(msg._root_node,depth,out);
  out += "</vyatta>";
  return out;
}

/**
 *
 **/
void
Configuration::get_template_node(const string &path, TemplateParams &params)
{
  string root_template(WebGUI::CFG_TEMPLATE_DIR);
  string tmpl_file = root_template + "/" + path + "/node.def";
  
  //open the file here and parse
  FILE *fp = fopen(tmpl_file.c_str(), "r");
  if (fp) {
    char buf[1025];
    //read value in here....
    while (fgets(buf, 1024, fp) != 0) {
      string line = string(buf);
      if (line.find("tag:") != string::npos) {
	params._multi = true;
      }
      else if (line.find("type:") != string::npos) {
	if (line.find("txt") != string::npos) {
	  params._type = WebGUI::TEXT;
	}
	else if (line.find("ipv4net") != string::npos) {
	  params._type = WebGUI::IPV4NET;
	}
	else if (line.find("ipv4") != string::npos) {
	  params._type = WebGUI::IPV4;
	}
	else if (line.find("ipv6net") != string::npos) {
	  params._type = WebGUI::IPV6NET;
	}
	else if (line.find("ipv6") != string::npos) {
	  params._type = WebGUI::IPV6;
	}
	else if (line.find("u32") != string::npos) {
	  params._type = WebGUI::U32;
	}
	else if (line.find("bool") != string::npos) {
	  params._type = WebGUI::BOOL;
	}
	else if (line.find("macaddr") != string::npos) {
	  params._type = WebGUI::MACADDR;
	}

      }
      else if (line.find("help:") != string::npos) {
	//need to escape out '<' and '>'
	params._help = line.substr(5,line.length()-6);
	string help = WebGUI::mass_replace(params._help, "<", "&#60;");
	help = WebGUI::mass_replace(help, ">", "&#62;");
	params._help = help;
      }
    }

    fclose(fp);
  }
}



/**
 *
 **/
/*
void
Configuration::parse_configuration(string &rel_config_path, string &rel_tmpl_path, long &depth, string &out)
{
  static string root_config(WebGUI::ACTIVE_CONFIG_DIR);
  static string root_template(WebGUI::CFG_TEMPLATE_DIR);
  DIR *dp;
  struct dirent *dirp;

  --depth;
  if (depth == 0) {
    return;
  }

  string full_config_path = root_config + "/" + rel_config_path;
  string full_template_path = root_template + "/" + rel_tmpl_path;

  //  cout << "Configuration::parse_configuation: " << full_config_path << endl;
  //  cout << "Configuration::parse_configuation: " << full_template_path << endl << endl;

  if ((dp = opendir(full_config_path.c_str())) == NULL) {
    return;
  }

  while ((dirp = readdir(dp)) != NULL) {
    if (dirp->d_name[0] != '.' && strcmp(dirp->d_name,"def") != 0) {
      string new_rel_config_path = rel_config_path + "/" + dirp->d_name;
      if (strcmp(dirp->d_name,"node.val") != 0) {
	out += string("<node name='") + string(dirp->d_name) + "'>";
	
	//check if node is deleted
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
*/
void
Configuration::parse_configuration(string &rel_config_path, string &rel_tmpl_path, long &depth, string &out)
{
  static string root_config(WebGUI::ACTIVE_CONFIG_DIR);
  static string root_template(WebGUI::CFG_TEMPLATE_DIR);

  --depth;
  if (depth == 0) {
    return;
  }

  string full_config_path = root_config + "/" + rel_config_path;
  string full_template_path = root_template + "/" + rel_tmpl_path;

  //  cout << "Configuration::parse_configuation: " << full_config_path << endl;
  //  cout << "Configuration::parse_configuation: " << full_template_path << endl << endl;

  map<string,WebGUI::NodeState> coll = get_conf_dir(rel_config_path);
  map<string,WebGUI::NodeState>::iterator iter = coll.begin();
  while (iter != coll.end()) {
    if (iter->first[0] != '.' && strcmp(iter->first.c_str(),"def") != 0) {
      string new_rel_config_path = rel_config_path + "/" + iter->first;
      if (strcmp(iter->first.c_str(),"node.val") != 0) {
	out += string("<node name='") + string(iter->first) + "'>";
	
	//check if node is deleted
	switch (iter->second) {
	case WebGUI::ACTIVE:
	  out += "<configured>active</configured>";
	  break;
	case WebGUI::SET:
	  out += "<configured>set</configured>";
	  break;
	case WebGUI::DELETE:
	  out += "<configured>delete</configured>";
	  break;
	}
	long new_depth = depth;
	
	//at this point reach out to the template directory and retreive data on this node
	TemplateParams tmpl_params;
	string new_rel_tmpl_path = rel_tmpl_path;
	get_template_node(new_rel_tmpl_path, tmpl_params);
	if (tmpl_params._multi == true) {
	  new_rel_tmpl_path += "/node.tag";
	}
	else {
	  new_rel_tmpl_path += "/" + string(iter->first);
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
    ++iter;
  }
  return;
}


/**
 *
 **/
void
Configuration::parse_template(string &rel_tmpl_path, long &depth, string &out)
{
  static string root_template(WebGUI::CFG_TEMPLATE_DIR);
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

  //  cout << "Configuration::parse_template: " << full_template_path << endl << endl;

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
Configuration::parse_value(string &rel_path, string &out)
{
  string value;
  string root_config(WebGUI::ACTIVE_CONFIG_DIR);
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

/**
 *
 **/
bool
Configuration::validate_session(unsigned long id)
{
  if (id <= WebGUI::ID_START) {
    return false;
  }
  //then add a directory check here for valid configuration
  char buf[40];
  sprintf(buf, "%u", id);
  string directory = WebGUI::LOCAL_CONFIG_DIR + string(buf);
  DIR *dp = opendir(directory.c_str());
  if (dp == NULL) {
    return false;
  }
  closedir(dp);


  //finally, we'll want to support a timeout value here

  return true;
}

/**
 *
 **/
std::map<string,WebGUI::NodeState>
Configuration::get_conf_dir(const std::string &rel_config_path)
{
  string active_config = WebGUI::ACTIVE_CONFIG_DIR + "/" + rel_config_path;
  string local_config = WebGUI::LOCAL_CHANGES_ONLY + _proc->get_msg().id() + "/" + rel_config_path;
  map<string,WebGUI::NodeState> coll;
  

  //iterate over active configuration
  DIR *dp;
  struct dirent *dirp;
  if ((dp = opendir(active_config.c_str())) == NULL) {
    cerr << "Configuration::get_conf_dir(), cannot open: " << active_config << endl;
    return coll;
  }

  while ((dirp = readdir(dp)) != NULL) {
    if (dirp->d_name[0] != '.' && strcmp(dirp->d_name,"def") != 0) {
      coll.insert(pair<string,WebGUI::NodeState>(dirp->d_name,WebGUI::ACTIVE));
    }
  }
  closedir(dp);

  //  cout << "Configruation::get_conf_dir(): " << active_config << ", " << coll.size() << endl;

  //iterate over changes only dir and identify set/delete states
  //iterate over temporary configuration
  if ((dp = opendir(local_config.c_str())) == NULL) {
    cerr << "Configuration::get_conf_dir(), cannot open: " << local_config << endl;
    return map<string,WebGUI::NodeState>();
  }

  while ((dirp = readdir(dp)) != NULL) {
    if (dirp->d_name[0] != '.' && strcmp(dirp->d_name,"def") != 0) {
      map<string,WebGUI::NodeState>::iterator iter = coll.find(dirp->d_name);
      if (iter != coll.end()) {
	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//need to still check whether this is a set/delete--the set could be a change of value at this point
	iter->second = WebGUI::DELETE;
      }
      else {
	//this means this is a new node
	coll.insert(pair<string,WebGUI::NodeState>(dirp->d_name,WebGUI::SET));
      }
    }
  }
  closedir(dp);
  //  cout << "Configruation::get_conf_dir(): " << local_config << ", " << coll.size() << endl;

  return coll;
}
