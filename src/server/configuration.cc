#include <string>
#include <map>
#include <iostream>
#include <sys/types.h>
#include <sys/stat.h>
#include <string.h>
#include <unistd.h>
#include <dirent.h>
#include "rl_str_proc.hh"
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
  if (!validate_session(_proc->get_msg().id())) {
    _proc->set_response(WebGUI::SESSION_FAILURE);
    return;
  }

  //new combined mode here
  string foobar;
  if (_proc->get_msg()._conf_mode == WebGUI::OP) {
    foobar = get_full_op_level();
  }/*
  else if (_proc->get_msg()._conf_mode == WebGUI::CONF) {
    string root_node = _proc->get_msg()._root_node;
    foobar = "<?xml version='1.0' encoding='utf-8'?><vyatta><token>"+_proc->get_msg()._token+"</token>";
    get_full_level(root_node,foobar,true); //make this recursive
    foobar += "</vyatta>";
    }*/
  else {
    string root_node = _proc->get_msg()._root_node;
    foobar = "<?xml version='1.0' encoding='utf-8'?><vyatta><token>"+_proc->get_msg()._token+"</token>";
    get_full_level(root_node,foobar,false);
    foobar += "</vyatta>";
  }
  _proc->set_response(foobar);
}

/**
 *
 **/
string
Configuration::get_full_op_level()
{
  string rel_tmpl_path;
  DIR *dp;
  struct dirent *dirp;
  string out = "<?xml version='1.0' encoding='utf-8'?><vyatta><token>"+_proc->get_msg()._token+"</token>";

  //first convert root request into template path
  StrProc str_proc(_proc->get_msg()._root_node, "/");
  vector<string> coll = str_proc.get();
  vector<string>::iterator iter = coll.begin();
  while (iter != coll.end()) {
    string tmp = WebGUI::OP_TEMPLATE_DIR + "/" + rel_tmpl_path + "/" + *iter;
    struct stat stmp;
    if (stat(tmp.c_str(), &stmp) != 0) {
      rel_tmpl_path += "/node.tag";
    }
    else {
      rel_tmpl_path += "/" + *iter;
    }
    ++iter;
  }

  //NOW WE HAVE OUR CURRENT WORKING DIRECTORY STRUCTURE
    string rel_config_path = _proc->get_msg()._root_node;


  //rework get_conf_dir to work off of get_templ_dir...

  //get_conf_dir collection
  //iterate over template directory
  //call get_template_node on each node
  //build out response...

  string tmpl_path = WebGUI::OP_TEMPLATE_DIR + "/" + rel_tmpl_path;
  if ((dp = opendir(tmpl_path.c_str())) == NULL) {
    out += "</vyatta>";
    return out;
  }

  while ((dirp = readdir(dp)) != NULL) {
    if (dirp->d_name[0] != '.' && 
	strcmp(dirp->d_name,"node.def") != 0 &&
	strcmp(dirp->d_name,"node.tag") != 0) {
      //now build out response...
      out += string("<node name='") + string(dirp->d_name) + string("'>");

      //now add template parameters
      TemplateParams tmpl_params;
      string tmp = WebGUI::OP_TEMPLATE_DIR + "/" + rel_tmpl_path + "/" + dirp->d_name;
      get_template_node(tmp, tmpl_params);
      string value;
      if (tmpl_params._end == true) {
	tmp = rel_config_path + "/" + dirp->d_name + "/node.val";
	string node_name("value");
	parse_value(tmp, node_name, value);
      }
      out += tmpl_params.get_xml(value);
      out += "</node>";
    }

  }

  //now handle multinodes here!
  TemplateParams multi_params;
  //only do this once!!!
  string tmp = WebGUI::OP_TEMPLATE_DIR + "/" + rel_tmpl_path + "/node.tag";

  get_template_node(tmp, multi_params);
  string tag_node_str = multi_params.get_xml();

  if (tag_node_str.empty() == false) {
    //escape out "%2F" here for non-terminal multi-nodes
    /*
    string str = string(m_iter->first);
    str = WebGUI::mass_replace(str, "%2F", "/");
    out += string("<node name='") + str + string("'>");
    */
    out += string("<node name='node.tag'>");
    out += tag_node_str;
    /*
    string value;
    if (multi_params._end == true) {
      string tmp = rel_config_path + "/" + m_iter->first + "/node.val";
      string node_name("value");
      parse_value(tmp, node_name, value);
      }*/
    out += "</node>";
  }

  closedir(dp);
  out += "</vyatta>";
  return out;
}

/**
 *
 **/
void
Configuration::get_full_level(const std::string &root_node, std::string &out, bool recursive)
{
  string rel_tmpl_path;
  DIR *dp;
  struct dirent *dirp;

  //first convert root request into template path
  StrProc str_proc(root_node, "/");
  vector<string> coll = str_proc.get();
  vector<string>::iterator iter = coll.begin();
  while (iter != coll.end()) {
    string tmp = WebGUI::CFG_TEMPLATE_DIR + "/" + rel_tmpl_path + "/" + *iter;
    struct stat stmp;
    if (stat(tmp.c_str(), &stmp) != 0) {
      rel_tmpl_path += "/node.tag";
    }
    else {
      rel_tmpl_path += "/" + *iter;
    }
    ++iter;
  }

  string rel_config_path = root_node;

  //rework get_conf_dir to work off of get_templ_dir...

  //get_conf_dir collection
  //iterate over template directory
  //call get_template_node on each node
  //build out response...

  map<string,WebGUI::NodeState> dir_coll = get_conf_dir(rel_config_path);
  string tmpl_path = WebGUI::CFG_TEMPLATE_DIR + "/" + rel_tmpl_path;
  if ((dp = opendir(tmpl_path.c_str())) == NULL) {
    out += "</vyatta>";
    return;
  }

  while ((dirp = readdir(dp)) != NULL) {
    if (dirp->d_name[0] != '.' && 
	strcmp(dirp->d_name,"node.def") != 0 &&
	strcmp(dirp->d_name,"node.tag") != 0) {
      //now build out response...

      out += string("<node name='") + string(dirp->d_name) + string("'>");
      map<string,WebGUI::NodeState>::iterator iter = dir_coll.find(dirp->d_name);
      if (iter != dir_coll.end()) {
	//check if node is deleted
	switch (iter->second) {
	case WebGUI::ACTIVE:
	  out += "<configured>active</configured>";
	  break;
	case WebGUI::ACTIVE_PLUS:
	  out += "<configured>active_plus</configured>";
	  break;
	case WebGUI::SET:
	  out += "<configured>set</configured>";
	  break;
	case WebGUI::DELETE:
	  out += "<configured>delete</configured>";
	  break;
	}
	dir_coll.erase(iter);
      }	
      //now add template parameters
      TemplateParams tmpl_params;
      string tmp = WebGUI::CFG_TEMPLATE_DIR + "/" + rel_tmpl_path + "/" + dirp->d_name;
      get_template_node(tmp, tmpl_params);
      string value;
      if (tmpl_params._end == true) {
	tmp = rel_config_path + "/" + dirp->d_name + "/node.val";
	string node_name("value");
	parse_value(tmp, node_name, value);
      }
      else {
	if (recursive == true) {
	  tmp = rel_config_path + "/" + dirp->d_name;
	  get_full_level(tmp,out,true);
	}
      }
      //skip the parameters on a recursive walkthrough
      if (recursive == false) {
	out += tmpl_params.get_xml(value);
      }
      out += "</node>";
    }  
  }    
  closedir(dp);

  //now handle multinodes here!
  TemplateParams multi_params;
  map<string,WebGUI::NodeState>::iterator m_iter = dir_coll.begin();
  if (m_iter != dir_coll.end()) {
    //only do this once!!!
    string tmp = WebGUI::CFG_TEMPLATE_DIR + "/" + rel_tmpl_path + "/node.tag";

    get_template_node(tmp, multi_params);
  }
  
  while (m_iter != dir_coll.end()) {
    //escape out "%2F" here for non-terminal multi-nodes
    string str = string(m_iter->first);
    str = WebGUI::mass_replace(str, "%2F", "/");
    
    out += string("<node name='") + str + string("'>");
    
    switch (m_iter->second) {
    case WebGUI::ACTIVE:
      out += "<configured>active</configured>";
      break;
    case WebGUI::ACTIVE_PLUS:
      out += "<configured>active_plus</configured>";
      break;
    case WebGUI::SET:
      out += "<configured>set</configured>";
      break;
    case WebGUI::DELETE:
      out += "<configured>delete</configured>";
      break;
    }
    if (recursive == false) {
      out += multi_params.get_xml();
    }
    string value;
    if (multi_params._end == true) {
      string tmp = rel_config_path + "/" + m_iter->first + "/node.val";
      string node_name("value");
      parse_value(tmp, node_name, value);
    }
    if (recursive == false) {
      out += multi_params.get_xml(value);
    }
    out += "</node>";

    ++m_iter;
  }
  return;
}

/**
 *
 **/
void
Configuration::get_template_node(const string &path, TemplateParams &params)
{
  string allowed, mode;
  string tmpl_file = path + "/node.def";

  //open the file here and parse
  FILE *fp = fopen(tmpl_file.c_str(), "r");
  if (fp) {
    char buf[1025];
    //read value in here....
    while (fgets(buf, 1024, fp) != 0) {
      if (buf[0] == '#') {
	continue;
      }

      string line = string(buf);

      //first strip off the whitespace
      line = WebGUI::trim_whitespace(line);

      if (line.find("default:") != string::npos || 
	  line.find("delete:") != string::npos || 
	  line.find("commit:") != string::npos || 
	  line.find("create:") != string::npos || 
	  line.find("update:") != string::npos || 
	  line.find("activate:") != string::npos ||
	  line.find("begin:") != string::npos ||
	  line.find("end:") != string::npos ||
	  line.find("tag:") != string::npos ||
	  line.find("multi:") != string::npos ||
	  line.find("type:") != string::npos ||
	  line.find("help:") != string::npos ||
	  line.find("syntax:") != string::npos ||
	  line.find("allowed:") != string::npos ||
	  line.find("run:") != string::npos || //for op mode, drop right now
	  line.find("comp_help:") != string::npos) {
	mode = "";
      }

      if ((strncmp(line.c_str(),"tag:",4) == 0)) {
	mode = "tag:";
	params._multi = true;
      }
      else if ((strncmp(line.c_str(),"multi:",6) == 0)) {
	mode = "tag:";
	params._multi = true;
	params._end = true;
      }
      else if (strncmp(line.c_str(),"default:",8) == 0 || mode == "default:") {
	string def;

	if (mode.empty()) {
	  def = line.substr(8,line.length()-9);
	}
	else {
	  def = line;
	}
	mode = "default:";

	def = WebGUI::trim_whitespace(def);
	if (def[0] == '"') {
	  def = def.substr(1,def.length()-2);
	}
	
	if (params._default.empty()) {
	  params._default = def; //assumes default does not span a line
	}
      }
      else if (strncmp(line.c_str(),"type:",5) == 0 || mode == "type:") {
	//upgrade to handle two types.
	mode = "type:";

	StrProc str_proc(line, ",");
	string e1 = str_proc.get(0);

	if (e1.find("txt") != string::npos) {
	  params._type = WebGUI::TEXT;
	}
	else if (e1.find("ipv4net") != string::npos) {
	  params._type = WebGUI::IPV4NET;
	}
	else if (e1.find("ipv4") != string::npos) {
	  params._type = WebGUI::IPV4;
	}
	else if (e1.find("ipv6net") != string::npos) {
	  params._type = WebGUI::IPV6NET;
	}
	else if (e1.find("ipv6") != string::npos) {
	  params._type = WebGUI::IPV6;
	}
	else if (e1.find("u32") != string::npos) {
	  params._type = WebGUI::U32;
	}
	else if (e1.find("bool") != string::npos) {
	  params._type = WebGUI::BOOL;
	}
	else if (e1.find("macaddr") != string::npos) {
	  params._type = WebGUI::MACADDR;
	}

	string e2 = str_proc.get(1);
	if (e2.empty() == false) {
	  if (e2.find("txt") != string::npos) {
	    params._type2 = WebGUI::TEXT;
	  }
	  else if (e2.find("ipv4net") != string::npos) {
	    params._type2 = WebGUI::IPV4NET;
	  }
	  else if (e2.find("ipv4") != string::npos) {
	    params._type2 = WebGUI::IPV4;
	  }
	  else if (e2.find("ipv6net") != string::npos) {
	    params._type2 = WebGUI::IPV6NET;
	  }
	  else if (e2.find("ipv6") != string::npos) {
	    params._type2 = WebGUI::IPV6;
	  }
	  else if (e2.find("u32") != string::npos) {
	    params._type2 = WebGUI::U32;
	  }
	  else if (e2.find("bool") != string::npos) {
	    params._type2 = WebGUI::BOOL;
	  }
	  else if (e2.find("macaddr") != string::npos) {
	    params._type2 = WebGUI::MACADDR;
	  }
	}
      }
      else if (strncmp(line.c_str(),"comp_help:",10) == 0 || mode == "comp_help:") {
	//need to escape out '<' and '>'
	string comp_help;
	if (mode.empty()) {
	  comp_help = line.substr(10,line.length()-11);
	}
	else {
	  comp_help = line;
	}
	mode = "comp_help:";
	comp_help = WebGUI::mass_replace(comp_help, "&", "&#38;");
	comp_help = WebGUI::mass_replace(comp_help, "<", "&#60;");
	comp_help = WebGUI::mass_replace(comp_help, ">", "&#62;");
	comp_help = WebGUI::mass_replace(comp_help, "\n", "&#xD;&#xA;");

	params._comp_help += comp_help;
      }
      else if (strncmp(line.c_str(),"help:",5) == 0 || mode == "help:") {
	//need to escape out '<' and '>'
	string help;
	if (mode.empty()) {
	  help = line.substr(5,line.length()-6);
	}
	else {
	  help = line;
	}
	mode = "help:";

	if (help.find("[REQUIRED]") != string::npos) {
	  params._mandatory = true;
	}

	help = WebGUI::mass_replace(help, "&", "&#38;");
	help = WebGUI::mass_replace(help, "<", "&#60;");
	help = WebGUI::mass_replace(help, ">", "&#62;");
	help = WebGUI::mass_replace(help, "\n", "");

	params._help += help;
      }
      else if (strncmp(line.c_str(),"syntax:",7) == 0 || mode == "syntax:") {
	//need to escape out '<' and '>'
	string tmp;
	if (mode.empty()) {
	  tmp = line.substr(7,line.length()-8);
	}
	else {
	  tmp = line;
	}
	mode = "syntax:";
	StrProc str_proc(tmp, " ");
	if (str_proc.size() > 3 && str_proc.get(2) == "in") {
	  string meat_str = str_proc.get(3,str_proc.size());
	  
	  //now delimit on ","
	  StrProc meat_str_proc(meat_str, ",");
	  vector<string> meat_coll = meat_str_proc.get();
	  vector<string>::iterator b = meat_coll.begin();
	  while (b != meat_coll.end()) {
	    bool end = false;
	    string tmp = *b;


	    size_t pos;
	    if ((pos = tmp.find(";")) != string::npos) {
	      tmp = tmp.substr(0,pos);
	      end = true;
	    }

	    tmp = WebGUI::trim_whitespace(tmp);

	    if (!tmp.empty()) {
	      //now remove leading, trailing quote
	      if (tmp[0] == '"') {
		tmp = tmp.substr(1,tmp.length()-2);
	      }
	      params._enum.insert(tmp);
	    }
	    if (end) {
	      break;
	    }
	    ++b;
	  }
	}
      }
      else if (strncmp(line.c_str(),"allowed:",8) == 0 || mode == "allowed:") {
	//note, will need to support multi-line entry
	//we'll need to execute this statement and scrape the results
	if (!line.empty()) {
	  if (mode.empty()) {
	    allowed += line.substr(8,line.length()-9) + "\n";
	    //	    allowed += line.substr(8,line.length()-9);
	  }
	  else {
	    //	    allowed += line + "\n";
	    allowed += line;
	  }
	}
	mode = "allowed:";

      }
      //at some point expand this to conf mode to denote a node with an action associated with it.
      else if (strncmp(line.c_str(),"run:",4) == 0) {
	params._action = true;
      }
    }
    fclose(fp);
  }
  else {
    return; //file does not exist return here
  }

  //infer end node from leaf
  if (params._type != WebGUI::NONE && params._multi == false) {
    params._end = true;
  }

  //now let's process the allowed statement here
  if (allowed.empty() == false && params._enum.empty() == true) {
    string stdout;
    string cmd;

    allowed = string("shopt -s nullglob; ") + allowed;

    if (allowed.find("local ") != string::npos) {
      cmd = "function foo () { " + allowed + " } ; foo;";
    }
    else {
      cmd = allowed;
    }

    //    cout << "INPUT COMMAND: %>" << endl << cmd << endl << "<%" << endl;

    int err = WebGUI::execute(cmd, stdout, true);

    //    cout << "OUTPUT ERROR CODE: " << err << ", " << stdout << endl;

    if (err == 0) {
      //      cout << "allowed(OUT): '" << stdout.substr(0,stdout.length()-1) << "', ERROR CODE: " << err << endl;
      //now fill out enumeration now
      
      //if stdout is multiline use '\n' delimiter otherwise use space
      string delimit = " ";
      
      size_t pos = stdout.find('\n');

      if (pos != stdout.rfind('\n')) {
	delimit = '\n';
      }

      StrProc str_proc(stdout, delimit);
      vector<string> orig_coll = str_proc.get();
      vector<string>::iterator iter = orig_coll.begin();
      while (iter != orig_coll.end()) {

	if (iter->empty() == false) {
	  string tmp = WebGUI::mass_replace(*iter, "<>", "*"); //handle special case for wildcard

	  //strip out all values enclosed in <*>
	  string::size_type start_pos = 0;
	  while ((start_pos = tmp.find("<")) != string::npos) {
	    int end_pos = tmp.find(">");
	    if (end_pos == string::npos) {
	      break;
	    }
	    tmp = tmp.substr(0,start_pos) + tmp.substr(end_pos+1,tmp.length());
	  }

	  tmp = WebGUI::mass_replace(tmp, "<", "&#60;");
	  tmp = WebGUI::mass_replace(tmp, ">", "&#62;");
	  tmp = WebGUI::mass_replace(tmp, " & ", " &#38; ");

	  tmp = WebGUI::trim_whitespace(tmp);
	  //now remove leading, trailing quote
	  if (tmp[0] == '"') {
	    tmp = tmp.substr(1,tmp.length()-2);
	  }
	  
	  if (tmp.empty() == false) {
	    params._enum.insert(tmp);
	  }
	}
	++iter;
      }
      //      cout << endl;
    }
    //    cout << endl;
  }
}


/**
 *
 **/
void
Configuration::parse_value(string &rel_path, string &node, string &out)
{
  //now need to upgrade this to compare the contents of the two files. needs to work for multinode
  string active_path = WebGUI::ACTIVE_CONFIG_DIR + "/" + rel_path;
  string local_path = WebGUI::LOCAL_CONFIG_DIR + _proc->get_msg().id() + "/" + rel_path;

  //get map of each file and compare contents
  map<string,WebGUI::NodeState> state_coll;
  vector<string> order_coll;

  FILE *fp = fopen(active_path.c_str(), "r");
  if (fp) {
    char buf[1025];
    //read value in her....
    while (fgets(buf, 1024, fp) != 0) {
      string tmp(buf);
      tmp = tmp.substr(0,tmp.length()-1);
      state_coll.insert(pair<string,WebGUI::NodeState>(tmp,WebGUI::DELETE));
      order_coll.push_back(tmp);
    }
    fclose(fp);
  }

  //now compare
  fp = fopen(local_path.c_str(), "r");
  if (fp) {
    char buf[1025];
    //read value in her....
    while (fgets(buf, 1024, fp) != 0) {
      string tmp(buf);
      tmp = tmp.substr(0,tmp.length()-1);
      map<string,WebGUI::NodeState>::iterator iter = state_coll.find(tmp);
      if (iter != state_coll.end()) {
	iter->second = WebGUI::ACTIVE;
      }
      else {
	state_coll.insert(pair<string,WebGUI::NodeState>(tmp,WebGUI::SET));
	order_coll.push_back(tmp);
      }   
    }
    fclose(fp);
  }


  vector<string>::iterator o_iter = order_coll.begin();
  while (o_iter != order_coll.end()) {
    map<string,WebGUI::NodeState>::iterator s_iter = state_coll.find(*o_iter);
    if (s_iter == state_coll.end()) {
      ++o_iter;
      continue; //should never happen
    }

    out += "<"+node+" name='" + s_iter->first + "'>";
    switch (s_iter->second) {
    case WebGUI::ACTIVE:
      out += "<configured>active</configured>";
      break;
    case WebGUI::ACTIVE_PLUS:
      out += "<configured>active_plus</configured>";
      break;
    case WebGUI::SET:
      out += "<configured>set</configured>";
      break;
    case WebGUI::DELETE:
      out += "<configured>delete</configured>";
      break;
    }
    out += "</"+node+">";
    ++o_iter;
  }
  return;
}

/**
 *
 **/
bool
Configuration::validate_session(string id)
{
  //then add a directory check here for valid configuration
  string directory = WebGUI::LOCAL_CONFIG_DIR + id;
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
  string local_config = WebGUI::LOCAL_CONFIG_DIR + _proc->get_msg().id() + "/" + rel_config_path;
  string changes_only_config = WebGUI::LOCAL_CHANGES_ONLY + _proc->get_msg().id() + "/" + rel_config_path;
  map<string,WebGUI::NodeState> coll;
  

  //iterate over active configuration
  DIR *dp;
  struct dirent *dirp;

  if ((dp = opendir(active_config.c_str())) != NULL) {
    //    cerr << "Configuration::get_conf_dir(), cannot open: " << active_config << endl;
    while ((dirp = readdir(dp)) != NULL) {
      if (dirp->d_name[0] != '.' && strcmp(dirp->d_name,"def") != 0) {
	coll.insert(pair<string,WebGUI::NodeState>(dirp->d_name,WebGUI::DELETE));
      }
    }
    closedir(dp);
  }

  //iterate over changes only dir and identify set/delete states
  //iterate over temporary configuration
  if ((dp = opendir(local_config.c_str())) == NULL) {
    //    cerr << "Configuration::get_conf_dir(), cannot open: " << local_config << endl;
    return coll;
    //    return map<string,WebGUI::NodeState>();
  }


  while ((dirp = readdir(dp)) != NULL) {
    if (dirp->d_name[0] != '.' && strcmp(dirp->d_name,"def") != 0) {
      map<string,WebGUI::NodeState>::iterator iter = coll.find(dirp->d_name);
      if (iter != coll.end()) {
	//correct handling of delete is if it is only present in the active config
	//is this an active or active_plus?
	//need to check tmp dir
	struct stat s;
	string tmp = changes_only_config + "/" + string(dirp->d_name);
	lstat(tmp.c_str(), &s);
	if ((lstat(tmp.c_str(),&s) == 0)) {
	  iter->second = WebGUI::ACTIVE_PLUS; //DOES THIS SHOW UP IN THE CHANGES ONLY DIR?
	}
	else {
	  iter->second = WebGUI::ACTIVE;
	}
      }
      else {
	//this means this is a new node
	coll.insert(pair<string,WebGUI::NodeState>(dirp->d_name,WebGUI::SET));
      }
    }
  }
  closedir(dp);
  return coll;
}
