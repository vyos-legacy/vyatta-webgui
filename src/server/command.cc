#include <sys/types.h>
#include <dirent.h>

#include <string>
#include "systembase.hh"
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
  char buf[80];
  Message msg = _proc->get_msg();
  //parses all template nodes (or until depth to provide full template tree
  //now parse the request to form: attribute: mode, attribute: depth, value: root
  string req(msg._request);


  if (msg._command_coll.empty()) {
    sprintf(buf, "%d", WebGUI::MALFORMED_REQUEST);
    string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><msg>"+string(WebGUI::ErrorDesc[WebGUI::MALFORMED_REQUEST])+"</msg></error></vyatta>";
    _proc->set_response(err);
    return;
  }

  //validate session id
  if (!validate_session(_proc->get_msg().id_by_val())) {
    sprintf(buf, "%d", WebGUI::SESSION_FAILURE);
    string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><msg>"+string(WebGUI::ErrorDesc[WebGUI::SESSION_FAILURE])+"</msg></error></vyatta>";
    _proc->set_response(err);
    return;
  }

  //strip off additional commands
  vector<string> coll = _proc->get_msg()._command_coll;
  vector<string>::iterator iter = coll.begin();
  while (iter != coll.end()) {
    string err = execute_single_command(*iter);
    if (!err.empty()) {
      //generate error response for this command and exit
      sprintf(buf, "%d", WebGUI::COMMAND_ERROR);
      string rtn_str = "<?xml version='1.0' encoding='utf-8'?><vyatta><desc>"+*iter+"</desc><error><code>"+string(buf)+"</code><msg>"+err+"</msg></error></vyatta>";
      _proc->set_response(rtn_str);
      return;
    }
    ++iter;
  }
  sprintf(buf, "%d", WebGUI::SUCCESS);
  string tmpstr = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><msg/></error></vyatta>";
  _proc->set_response(tmpstr);
  return;
}


string
Command::execute_single_command(string &cmd)
{
  if (cmd.empty()) {
    return string();
  }

  //need to set up environment variables
  //  string command = "export VYATTA_ACTIVE_CONFIGURATION_DIR=/opt/vyatta/config/active;export VYATTA_CONFIG_TMP=/opt/vyatta/config/tmp/tmp_" + string(buf) + ";export VYATTA_TEMPLATE_LEVEL=/;export vyatta_datadir=/opt/vyatta/share;export vyatta_sysconfdir=/opt/vyatta/etc;export vyatta_sharedstatedir=/opt/vyatta/com;export VYATTA_TAG_NAME=node.tag;export vyatta_sbindir=/opt/vyatta/sbin;export VYATTA_CHANGES_ONLY_DIR=/tmp/changes_only_" + string(buf) + ";export vyatta_cfg_templates=/opt/vyatta/share/vyatta-cfg/templates;export VYATTA_CFG_GROUP_NAME=vyattacfg;export vyatta_bindir=/opt/vyatta/bin;export vyatta_libdir=/opt/vyatta/lib;export VYATTA_CONFIG_TEMPLATE=/opt/vyatta/share/vyatta-cfg/templates;export vyatta_libexecdir=/opt/vyatta/libexec;export vyatta_prefix=/opt/vyatta;export vyatta_datarootdir=/opt/vyatta/share;export vyatta_configdir=/opt/vyatta/config;export vyatta_infodir=/opt/vyatta/share/info;export VYATTA_TEMP_CONFIG_DIR=/opt/vyatta/config/tmp/new_config_"+string(buf)+";export vyatta_localedir=/opt/vyatta/share/locale";  
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
export UNIONFS=unionfs; \
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin; \
export vyatta_localedir=/opt/vyatta/share/locale";

  string tmp = cmd;

  //as a security precaution, lop off everything past the ";"
  int pos = tmp.find(";");
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
    //umount, rm -fr changes_only, mount
    tmp = "sudo umount " + WebGUI::LOCAL_CONFIG_DIR + _proc->get_msg().id();
    tmp += ";rm -fr " + WebGUI::LOCAL_CHANGES_ONLY + _proc->get_msg().id();
    tmp += ";mkdir -p " + WebGUI::LOCAL_CHANGES_ONLY + _proc->get_msg().id();
    tmp += ";sudo mount -t unionfs -o dirs=" + WebGUI::LOCAL_CHANGES_ONLY+_proc->get_msg().id()+"=rw:"+WebGUI::ACTIVE_CONFIG_DIR+"=ro unionfs " +WebGUI::LOCAL_CONFIG_DIR+_proc->get_msg().id();
  }

  command += ";" + tmp;

  string stdout;
  WebGUI::execute(command,stdout,true);
  stdout = WebGUI::mass_replace(stdout, "\n", "&#xD;&#xA;");
  return stdout;
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
