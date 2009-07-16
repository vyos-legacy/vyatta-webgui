#include <sys/types.h>
#include <dirent.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
extern "C" {
#include <common/common.h>
}
#include <glib-2.0/glib.h>
#include <map>
#include <set>
#include <string>
#include "rl_str_proc.hh"
#include "systembase.hh"
#include "multirespcmd.hh"
#include "command.hh"

using namespace std;

gboolean
mandatory_func(GNode *node, gpointer data);


Command::Command() : SystemBase()
{
}

Command::~Command()
{
}

void
Command::execute_command(WebGUI::AccessLevel access_level)
{
  Message msg = _proc->get_msg();
  //parses all template nodes (or until depth to provide full template tree
  //now parse the request to form: attribute: mode, attribute: depth, value: root
  string req(msg._request);

  if (msg._command_coll.empty()) {
    _proc->set_response(WebGUI::MALFORMED_REQUEST);
    return;
  }

  //validate session id
  if (!validate_session(_proc->get_msg().id())) {
    _proc->set_response(WebGUI::SESSION_FAILURE);
    return;
  }
  //strip off additional commands
  vector<string> coll = _proc->get_msg()._command_coll;
  vector<string>::iterator iter = coll.begin();
  while (iter != coll.end()) {
    string err;
    WebGUI::Error err_code = WebGUI::SUCCESS;
    execute_single_command(*iter, access_level, err, err_code);
    if (err_code != WebGUI::SUCCESS) {
      //generate error response for this command and exit
      _proc->set_response(err_code, err);
      return;
    }
    else {
      _proc->set_response(WebGUI::SUCCESS, err);
    }
    ++iter;
  }
  return;
}

/**
 *
 **/
void
Command::execute_single_command(string &cmd, WebGUI::AccessLevel access_level, string &resp, WebGUI::Error &err)
{
  err = WebGUI::SUCCESS;

  if (cmd.empty()) {
    resp = "";
    err = WebGUI::MALFORMED_REQUEST;
    return;
  }

  //need to set up environment variables
  string command = "export VYATTA_ACTIVE_CONFIGURATION_DIR="+WebGUI::ACTIVE_CONFIG_DIR+"; \
export VYATTA_CONFIG_TMP=/opt/vyatta/config/tmp/tmp_" + _proc->get_msg().id() + "; \
export VYATTA_TEMPLATE_LEVEL=/; \
export VYATTA_MOD_NAME=.modified; \
export vyatta_datadir=/opt/vyatta/share; \
export vyatta_sysconfdir=/opt/vyatta/etc; \
export vyatta_sharedstatedir=/opt/vyatta/com; \
export VYATTA_TAG_NAME=node.tag; \
export vyatta_sbindir=/opt/vyatta/sbin; \
export VYATTA_CHANGES_ONLY_DIR="+WebGUI::LOCAL_CHANGES_ONLY + _proc->get_msg().id() + "; \
export vyatta_cfg_templates="+WebGUI::CFG_TEMPLATE_DIR+"; \
export VYATTA_CFG_GROUP_NAME=vyattacfg; \
export vyatta_bindir=/opt/vyatta/bin; \
export vyatta_libdir=/opt/vyatta/lib; \
export VYATTA_EDIT_LEVEL=/; \
export VYATTA_CONFIG_TEMPLATE="+WebGUI::CFG_TEMPLATE_DIR+"; \
export vyatta_libexecdir=/opt/vyatta/libexec; \
export vyatta_localstatedir=/opt/vyatta/var; \
export vyatta_prefix=/opt/vyatta; \
export vyatta_datarootdir=/opt/vyatta/share; \
export vyatta_configdir=/opt/vyatta/config; \
export vyatta_infodir=/opt/vyatta/share/info; \
export VYATTA_TEMP_CONFIG_DIR="+WebGUI::LOCAL_CONFIG_DIR+_proc->get_msg().id()+"; \
export UNIONFS="+WebGUI::unionfs()+";					\
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin; \
export vyatta_localedir=/opt/vyatta/share/locale";

  string tmp = cmd;

  //as a security precaution, lop off everything past the ";"
  size_t pos = tmp.find(";");
  if (pos != string::npos) {
    tmp = tmp.substr(0,pos);
  }

  bool validate_commit = false;
  if (_proc->get_msg()._conf_mode == WebGUI::CONF) { //configuration mode command
    //HACK,HACK,HACK
    //pre-process commit for mandatory nodes
    if (strncmp(tmp.c_str(),"commit",6) == 0) {
      validate_commit = true;
    }
  }
  if (_proc->get_msg()._conf_mode == WebGUI::CONF) { //configuration mode command
    if (strncmp(tmp.c_str(),"set",3) == 0 || strncmp(tmp.c_str(),"delete",6) == 0) {
      tmp = "/opt/vyatta/sbin/my_" + cmd;
    }
    else if (strncmp(tmp.c_str(),"commit",6) == 0) {
      tmp = "/opt/vyatta/sbin/my_" + cmd;// + " -e"; //add error location flag
    }
    else if (strncmp(tmp.c_str(),"load",4) == 0) {
      tmp = "/opt/vyatta/sbin/vyatta-load-config.pl";
      //grab filename is present
      StrProc str_proc(cmd, " ");
      tmp += " " + str_proc.get(1);
      tmp += " 2>&1";
    }
    else if (strncmp(tmp.c_str(),"merge",5) == 0) {
      tmp = "/opt/vyatta/sbin/vyatta-load-config.pl";
      //grab filename is present
      StrProc str_proc(cmd, " ");
      tmp += " " + str_proc.get(1) + " --merge";
      tmp += " 2>&1";
    }
    else if (strncmp(tmp.c_str(),"save",4) == 0) {
      tmp = "umask 0002 ; sudo /opt/vyatta/sbin/vyatta-save-config.pl";
      //grab filename is present
      StrProc str_proc(cmd, " ");
      tmp += " " + str_proc.get(1);
    }
    else if (strncmp(tmp.c_str(),"discard",7) == 0) {
      string tmp = _proc->get_msg().id();
      WebGUI::discard_session(tmp);
      resp = "";
      err = WebGUI::SUCCESS;
      return;
    }
    else if (strncmp(tmp.c_str(),"show session",12) == 0) {
      tmp = "/opt/vyatta/sbin/vyatta-output-config.pl -all";
    }
  }
  else { //operational mode command
    if (strcmp(tmp.c_str(),"reboot") == 0) {
      if (access_level == WebGUI::ACCESS_ALL) {
	tmp = "sudo /sbin/reboot";
      }
      else {
	err = WebGUI::COMMAND_ERROR;
	_proc->set_response(WebGUI::COMMAND_ERROR);
	return;
      }
    }
    else if (strncmp(tmp.c_str(),"set",3) == 0) {
      err = WebGUI::COMMAND_ERROR;
      _proc->set_response(WebGUI::COMMAND_ERROR);
      return;
    }
    else {
      //treat this as an op mode command
      if (multi_part_op_cmd(cmd)) {
	//success
	return;
      }
      else if (validate_op_cmd(cmd)) {
	cmd = WebGUI::mass_replace(cmd,"'","'\\''");
	//      cmd = string("shopt -s nullglob; ") + cmd;
	
	string opmodecmd = "/bin/bash -i -c '" + cmd + " 2>&1'";

	string stdout;
	if (WebGUI::execute(opmodecmd,stdout,true) == 0) {
	  err = WebGUI::SUCCESS;
	}
	else {
	  err = WebGUI::COMMAND_ERROR;
	}
	stdout = WebGUI::mass_replace(stdout, "&", "&amp;");
	stdout = WebGUI::mass_replace(stdout, "\"", "&quot;");
	stdout = WebGUI::mass_replace(stdout, "'", "&apos;");
	stdout = WebGUI::mass_replace(stdout, "<", "&lt;");
	stdout = WebGUI::mass_replace(stdout, ">", "&gt;");
	resp = stdout;
      }
      else {
	err = WebGUI::COMMAND_ERROR;
      }
      return;
    }
  }

  command += ";" + tmp;

  string stdout;
  /*
  if (WebGUI::execute(command,stdout,true) == 0) {
    err = WebGUI::SUCCESS;
  }
  else {
    err = WebGUI::COMMAND_ERROR;
    //now evaluate mandatory nodes
    if (validate_commit == true) {
      resp += "\n"; 
      resp += validate_commit_nodes();
      if (resp.empty() == false) {
	resp = WebGUI::mass_replace(resp, "\n", "&#xD;&#xA;");
	err = WebGUI::MANDATORY_NODE_ERROR;
	return;
      }
    }
  }
  */
  //NOTE error codes are not currently being returned via the popen call--temp fix until later investigation
  if (WebGUI::execute(command,stdout,true) == 0) {
    err = WebGUI::SUCCESS;
  } else {
    err = WebGUI::COMMAND_ERROR;
  }

  if (stdout.empty() == true) {
    err = WebGUI::SUCCESS;
  }
  else {
    //    err = WebGUI::COMMAND_ERROR;
    //now evaluate mandatory nodes
    if (validate_commit == true) {
      string mandatory = validate_commit_nodes();
      if (mandatory.empty() == false) {
	resp = stdout + "\n" + mandatory;
	resp = WebGUI::mass_replace(resp, "\n", "&#xD;&#xA;");
	err = WebGUI::MANDATORY_NODE_ERROR;
	return;
      }
    }
  }
  stdout = WebGUI::mass_replace(stdout, "&", "&amp;");
  stdout = WebGUI::mass_replace(stdout, "\"", "&quot;");
  stdout = WebGUI::mass_replace(stdout, "'", "&apos;");
  stdout = WebGUI::mass_replace(stdout, "<", "&lt;");
  stdout = WebGUI::mass_replace(stdout, ">", "&gt;");
  resp = WebGUI::mass_replace(stdout, "\n", "&#xD;&#xA;");
}

/**
 *
 **/
bool
Command::validate_session(string id)
{
  //then add a directory check here for valid configuration
  string directory = WebGUI::LOCAL_CONFIG_DIR + _proc->get_msg().id();
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
bool
Command::multi_part_op_cmd(std::string &cmd)
{
  //does the cmd either equal an in-process bground op multi-part cmd
  //or is this the start of one?
  MultiResponseCommand multi_resp_cmd(_proc->get_msg().id(),cmd);
  multi_resp_cmd.init();
  //blocks until enough of a response is generated
  if (!multi_resp_cmd.process()) {
    //generate the error response
    return false;
  }
  string resp,token;
  multi_resp_cmd.get_resp(token,resp);
  resp = WebGUI::mass_replace(resp, "&", "&amp;");
  resp = WebGUI::mass_replace(resp, "\"", "&quot;");
  resp = WebGUI::mass_replace(resp, "'", "&apos;");
  resp = WebGUI::mass_replace(resp, "<", "&lt;");
  resp = WebGUI::mass_replace(resp, ">", "&gt;");

  //will build out special response here:
  string msg = "<?xml version='1.0' encoding='utf-8'?><vyatta><token>"+_proc->_msg._token+"</token><error><code>0</code><msg segment='"+token+"'>"+resp+"</msg></error></vyatta>";  
  _proc->set_response(msg);
  return true;
}


/**
 * Hack--reads in mandatory nodes and compares merged directory to see if nodes are set.
 **/
string
Command::validate_commit_nodes()
{
  map< string,set<string> > mandatory_node_coll;

  //let's bring in the new cli code and call 
  string value = "/opt/vyatta/config/tmp/tmp_" + _proc->get_msg().id();
  setenv("VYATTA_CONFIG_TMP",value.c_str(),1);
  value = "/tmp/changes_only_" + _proc->get_msg().id();
  setenv("VYATTA_CHANGES_ONLY_DIR",value.c_str(),1);
  value = "/opt/vyatta/config/tmp/new_config_" + _proc->get_msg().id();
  setenv("VYATTA_TEMP_CONFIG_DIR",value.c_str(),1);
  setenv("vyatta_cfg_templates","/opt/vyatta/share/vyatta-cfg/templates",1);
  setenv("VYATTA_CONFIG_TEMPLATE","/opt/vyatta/share/vyatta-cfg/templates",1);

  //VYATTA_TEMP_CONFIG_DIR

  //read in file into map.
  //read in conf file and stuff values into set
  FILE *fp = fopen(WebGUI::MANDATORY_NODE_FILE.c_str(),"r"); 
  //  string hack = "echo \"validate_commit_nodes:B"+WebGUI::MANDATORY_NODE_FILE+"\" >> /tmp/foo";system(hack.c_str());
  if (fp) {
    //  hack = "echo \"validate_commit_nodes:C\" >> /tmp/foo";system(hack.c_str());
    char buf[1025];
    while (fgets(buf,1024,fp) != 0) {
      string tmp(buf);
      int pos = tmp.find('#');
      if (pos > 0) {
	tmp = tmp.substr(0,pos);
      }
      pos = tmp.find('\n');
      if (pos > 0) {
	tmp = tmp.substr(0,pos);
      }
      //now if empty skip and make sure to drop '/n'
      if (tmp.empty() == false) {
	size_t pos = tmp.rfind("/");
	string parent = tmp.substr(0,pos);
	string child = tmp.substr(pos+1,tmp.length());
	map< string,set<string> >::iterator iter = mandatory_node_coll.find(parent);
	if (iter == mandatory_node_coll.end()) {
	  mandatory_node_coll.insert(pair< string,set<string> >(parent,set<string>()));
	  iter = mandatory_node_coll.find(parent);
	}
	iter->second.insert(child);
      }
    }
    fclose(fp);
  }
  /*
  //let's bring in the new cli code and call 
  unsetenv("VYATTA_CONFIG_TMP");
  unsetenv("VYATTA_CHANGES_ONLY_DIR");
  unsetenv("VYATTA_TEMP_CONFIG_DIR");
  unsetenv("vyatta_cfg_templates");
  unsetenv("VYATTA_CONFIG_TEMPLATE");

  //VYATTA_TEMP_CONFIG_DIR
  */

  char buf2[30];
  sprintf(buf2,"%d",mandatory_node_coll.size());
  //  hack = "echo \"validate_commit_nodes:D: "+string(buf2)+"\" >> /tmp/foo";system(hack.c_str());
  
  if (mandatory_node_coll.empty()) {
    return string("");
  }
  //  hack = "echo \"validate_commit_nodes:E\" >> /tmp/foo";system(hack.c_str());

  MandatoryData data;
  GNode *config_root_node = common_get_local_session_data();
  //  hack = "echo \"validate_commit_nodes:F\" >> /tmp/foo";system(hack.c_str());
  if (config_root_node != NULL) {
    
    int ct = g_node_n_nodes(config_root_node,G_TRAVERSE_ALL);
    char buf[30];
    sprintf(buf,"%d",ct);
    //    hack = "echo \"validate_commit_nodes:"+string(buf)+"G\" >> /tmp/foo";system(hack.c_str());
    //iterate over config_data and dump...
    data._mandatory_node_coll = &mandatory_node_coll;
    data._err = "";
    data._session_id = _proc->get_msg().id();
    g_node_traverse(config_root_node,
		    G_PRE_ORDER,
		    G_TRAVERSE_ALL,
		    -1,
		    (GNodeTraverseFunc)mandatory_func,
		    (gpointer)&data);
  }
  //  hack = "echo \"validate_commit_nodes:"+data._err+"\" >> /tmp/foo";system(hack.c_str());
  return data._err;
}

/**
 *
 **/
gboolean
mandatory_func(GNode *node, gpointer data)
{
  struct MandatoryData *md = (struct MandatoryData*)data;
  gpointer gp = ((GNode*)node)->data;

  if (((struct VyattaNode*)gp) == NULL) {
    return false;
  }
  if (((struct VyattaNode*)gp)->_config._path == NULL || 
      ((struct VyattaNode*)gp)->_data._path == NULL) {
    return false;
  }

  if (IS_DELETE(((struct VyattaNode*)gp)->_data._operation)) {
    return false;
  }

  //strip off trailing slashes
  string config_path = ((struct VyattaNode*)gp)->_config._path;
  string data_path = ((struct VyattaNode*)gp)->_data._path;
  size_t pos = 1;
  while (config_path.rfind("/") == config_path.length()-pos && pos <= config_path.length()) {
    ++pos;
  }
  if (pos > 1) {
    config_path = config_path.substr(0,config_path.length()-pos);
  }
  map< string,set<string> >::iterator iter = md->_mandatory_node_coll->find(config_path);

  //  string hack = "echo \"mandatory_func ENTERED ON PATH:"+config_path+"\" >> /tmp/foot";system(hack.c_str());

  //match on root, now let's perform explicit checks on nodes in merged local directory
  if (iter != md->_mandatory_node_coll->end()) {
    set<string> children = iter->second;
    set<string>::iterator c_iter = children.begin();
    while (c_iter != children.end()) {
      struct stat s;
      string child_data_path = WebGUI::VYATTA_TEMP_CONFIG_DIR + md->_session_id + data_path + *c_iter;
      //      string hack = "echo \"mandatory_func TESTING PATH:"+child_data_path+"\" >> /tmp/foot";system(hack.c_str());
      if (lstat(child_data_path.c_str(),&s) != 0) {
	md->_err += data_path + *c_iter + "\n";
      }
      ++c_iter;
    }
    ++iter;
  }
  return false;
}

/**
 * replaces quoted values with node.tag and validates against cmd directory
 **/
bool
Command::validate_op_cmd(std::string &cmd)
{
  //convert to op directory
  //first let's replace all 'asdf asdf' with node.tag string
  string tmp = cmd;
  string out_cmd;
  bool quote_flag = false;
  string::size_type pos = string::npos;
  //replace everything in quotes with node.tag
  while ((pos = tmp.find("'")) != string::npos) {
    if (quote_flag == false) {
      out_cmd += tmp.substr(0,pos) + " node.tag ";
      tmp = tmp.substr(pos+1,tmp.length());
      quote_flag = true;
    }
    else {
      tmp = tmp.substr(pos+1,tmp.length());
      quote_flag = false;
    }
  }
  
  out_cmd += tmp;

  //now construct the relative path for validation
  StrProc str_proc(out_cmd, " ");
  vector<string> coll = str_proc.get();
  vector<string>::iterator iter = coll.begin();
  string path;
  while (iter != coll.end()) {
    path += "/" + *iter;
    ++iter;
  }

  path = WebGUI::OP_COMMAND_DIR + path;

  //now that we have a path let's compare this to the op cmds
  struct stat s;
  return (stat(path.c_str(), &s) == 0);
}
