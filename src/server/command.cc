#include <sys/types.h>
#include <dirent.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>

#include <string>
#include "rl_str_proc.hh"
#include "systembase.hh"
#include "multirespcmd.hh"
#include "command.hh"

using namespace std;

Command::Command() : SystemBase()
{
}

Command::~Command()
{
}

void
Command::execute_command()
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
  if (!validate_session(_proc->get_msg().id_by_val())) {
    _proc->set_response(WebGUI::SESSION_FAILURE);
    return;
  }

  //strip off additional commands
  vector<string> coll = _proc->get_msg()._command_coll;
  vector<string>::iterator iter = coll.begin();
  while (iter != coll.end()) {
    string err;
    int err_code = WebGUI::SUCCESS;
    execute_single_command(*iter, err, err_code);
    if (err_code != WebGUI::SUCCESS) {
      //generate error response for this command and exit
      _proc->set_response(WebGUI::COMMAND_ERROR, err);
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
Command::execute_single_command(string &cmd, string &resp, int &err)
{
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

  if (strncmp(tmp.c_str(),"set",3) == 0 || strncmp(tmp.c_str(),"delete",6) == 0 || strncmp(tmp.c_str(),"commit",6) == 0) {
    tmp = "/opt/vyatta/sbin/my_" + cmd;
  }
  else if (strncmp(tmp.c_str(),"load",4) == 0) {
    tmp = "/opt/vyatta/sbin/vyatta-load-config.pl";
  }
  else if (strncmp(tmp.c_str(),"save",4) == 0) {
    tmp = "/opt/vyatta/sbin/vyatta-save-config.pl";
  }
  else if (strncmp(tmp.c_str(),"discard",7) == 0) {
    string tmp = _proc->get_msg().id();
    WebGUI::discard_session(tmp);
    resp = "";
    err = WebGUI::SUCCESS;
    return;
  }
  else {
    //treat this as an op mode command
    if (multi_part_op_cmd(cmd)) {
      return;
    }
    else if (validate_op_cmd(cmd)) {
      cmd = WebGUI::mass_replace(cmd,"'","'\\''");

      string opmodecmd = "/bin/bash -i -c '" + cmd + "'";
      string stdout;
      err = WebGUI::execute(opmodecmd,stdout,true);
      stdout = WebGUI::mass_replace(stdout, "<", "&lt;");
      stdout = WebGUI::mass_replace(stdout, ">", "&gt;");
      resp = stdout;
    }
    else {
      err = WebGUI::COMMAND_ERROR;
      _proc->set_response(WebGUI::COMMAND_ERROR);
    }
    return;
  }

  command += ";" + tmp;

  string stdout;
  err = WebGUI::execute(command,stdout,true);
  stdout = WebGUI::mass_replace(stdout, "\n", "&#xD;&#xA;");
  resp = stdout;
}

/**
 *
 **/
bool
Command::validate_session(unsigned long id)
{
  if (id <= WebGUI::ID_START) {
    return false;
  }
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
  return false;
  //does the cmd either equal an in-process bground op multi-part cmd
  //or is this the start of one?
  MultiResponseCommand multi_resp_cmd(cmd);
  //blocks until enough of a response is generated
  if (!multi_resp_cmd.process()) {
    //generate the error response
    return false;
  }
  string resp,token;
  multi_resp_cmd.get_resp(resp,token);
  return true;
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
