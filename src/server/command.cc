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


  if (msg._command.empty()) {
    sprintf(buf, "%d", WebGUI::MALFORMED_REQUEST);
    string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[WebGUI::MALFORMED_REQUEST])+"</error></vyatta>";
    _proc->set_response(err);
    return;
  }

  //validate session id
  if (!validate_session(_proc->get_msg()._id)) {
    sprintf(buf, "%d", WebGUI::SESSION_FAILURE);
    string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[WebGUI::SESSION_FAILURE])+"</error></vyatta>";
    _proc->set_response(err);
    return;
  }

  //strip off additional commands


  sprintf(buf, "%d", _proc->get_msg()._id);
  //need to set up environment variables
  //  string command = "export VYATTA_ACTIVE_CONFIGURATION_DIR=/opt/vyatta/config/active;export VYATTA_CONFIG_TMP=/opt/vyatta/config/tmp/tmp_" + string(buf) + ";export VYATTA_TEMPLATE_LEVEL=/;export vyatta_datadir=/opt/vyatta/share;export vyatta_sysconfdir=/opt/vyatta/etc;export vyatta_sharedstatedir=/opt/vyatta/com;export VYATTA_TAG_NAME=node.tag;export vyatta_sbindir=/opt/vyatta/sbin;export VYATTA_CHANGES_ONLY_DIR=/tmp/changes_only_" + string(buf) + ";export vyatta_cfg_templates=/opt/vyatta/share/vyatta-cfg/templates;export VYATTA_CFG_GROUP_NAME=vyattacfg;export vyatta_bindir=/opt/vyatta/bin;export vyatta_libdir=/opt/vyatta/lib;export VYATTA_CONFIG_TEMPLATE=/opt/vyatta/share/vyatta-cfg/templates;export vyatta_libexecdir=/opt/vyatta/libexec;export vyatta_prefix=/opt/vyatta;export vyatta_datarootdir=/opt/vyatta/share;export vyatta_configdir=/opt/vyatta/config;export vyatta_infodir=/opt/vyatta/share/info;export VYATTA_TEMP_CONFIG_DIR=/opt/vyatta/config/tmp/new_config_"+string(buf)+";export vyatta_localedir=/opt/vyatta/share/locale";  
  string command = "export VYATTA_ACTIVE_CONFIGURATION_DIR="+WebGUI::ACTIVE_CONFIG_DIR+"; \
export VYATTA_CONFIG_TMP=/opt/vyatta/config/tmp/tmp_" + string(buf) + "; \
export VYATTA_TEMPLATE_LEVEL=/; \
export vyatta_datadir=/opt/vyatta/share; \
export vyatta_sysconfdir=/opt/vyatta/etc; \
export vyatta_sharedstatedir=/opt/vyatta/com; \
export VYATTA_TAG_NAME=node.tag; \
export vyatta_sbindir=/opt/vyatta/sbin; \
export VYATTA_CHANGES_ONLY_DIR="+WebGUI::LOCAL_CHANGES_ONLY + string(buf) + "; \
export vyatta_cfg_templates="+WebGUI::CFG_TEMPLATE_DIR+"; \
export VYATTA_CFG_GROUP_NAME=vyattacfg; \
export vyatta_bindir=/opt/vyatta/bin; \
export vyatta_libdir=/opt/vyatta/lib; \
export VYATTA_CONFIG_TEMPLATE="+WebGUI::CFG_TEMPLATE_DIR+"; \
export vyatta_libexecdir=/opt/vyatta/libexec; \
export vyatta_prefix=/opt/vyatta; \
export vyatta_datarootdir=/opt/vyatta/share; \
export vyatta_configdir=/opt/vyatta/config; \
export vyatta_infodir=/opt/vyatta/share/info; \
export VYATTA_TEMP_CONFIG_DIR="+WebGUI::LOCAL_CONFIG_DIR+string(buf)+"; \
export vyatta_localedir=/opt/vyatta/share/locale";

  string tmp = msg._command;
  if (strncmp(tmp.c_str(),"set",3) == 0 || strncmp(tmp.c_str(),"delete",6) == 0 || strncmp(tmp.c_str(),"commit",6) == 0) {
    tmp = "/opt/vyatta/sbin/my_" + msg._command;
  }

  command += ";" + tmp;

  string stdout = WebGUI::execute(command,true);
  sprintf(buf, "%d", WebGUI::SUCCESS);
  string tmpstr = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><desc>"+stdout+"</desc></error></vyatta>";
  _proc->set_response(tmpstr);
  return;
}

bool
Command::validate_session(unsigned long id)
{
  if (id <= WebGUI::ID_START) {
    return false;
  }
  //then add a directory check here for valid configuration
  char buf[40];
  sprintf(buf, "%d", id);
  string directory = WebGUI::LOCAL_CONFIG_DIR + string(buf);
  DIR *dp = opendir(directory.c_str());
  if (dp == NULL) {
    return false;
  }
  closedir(dp);


  //finally, we'll want to support a timeout value here

  return true;
}
