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
Command::execute_command(const string &username, WebGUI::AccessLevel user_access_level)
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
    WebGUI::Error err_code = WebGUI::SUCCESS;
    execute_single_command(*iter, username, user_access_level, err, err_code);
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
Command::execute_single_command(string &cmd, const string &username, WebGUI::AccessLevel user_access_level, string &resp, WebGUI::Error &err)
{
  if (cmd.empty()) {
    resp = "";
    err = WebGUI::MALFORMED_REQUEST;
    return;
  }

  //now enforce role restrictions using the "access:" attribute in templates.
  //first parse the template file, then find tag, use role level and compare.
  string opmodecmd;
  if (user_access_level >= validate_op_cmd(username,user_access_level,cmd)) {
    //capture the backup command and direct to the chunker
//    cmd = WebGUI::mass_replace(cmd,"'","'\\''");

    opmodecmd = "export " + WebGUI::OA_GUI_ENV_AUTH_USER + "=" + username + "; " + cmd;
    if (multi_part_op_cmd(cmd,opmodecmd)) {
      //success
      return;
    }

    cmd = WebGUI::mass_replace(cmd,"'","'\\''");
    opmodecmd = "/bin/bash --rcfile /etc/bash_completion -i -c '"
                + cmd + " 2>&1'";

    string stdout;
    bool verbatim = false;

    setenv(WebGUI::OA_GUI_ENV_AUTH_USER.c_str(), username.c_str(), 1);
    setenv(WebGUI::OA_GUI_ENV_SESSION_ID.c_str(),
           _proc->get_msg().id().c_str(), 1);

    if (WebGUI::execute(opmodecmd,stdout,verbatim,true) == 0) {
      err = WebGUI::SUCCESS;
    } else {
      err = WebGUI::COMMAND_ERROR;
    }

    unsetenv(WebGUI::OA_GUI_ENV_SESSION_ID.c_str());

    if (!verbatim) {
      stdout = WebGUI::mass_replace(stdout, "&", "&amp;");
      stdout = WebGUI::mass_replace(stdout, "\"", "&quot;");
      stdout = WebGUI::mass_replace(stdout, "'", "&apos;");
      stdout = WebGUI::mass_replace(stdout, "<", "&lt;");
      stdout = WebGUI::mass_replace(stdout, ">", "&gt;");
    }
    resp = stdout;
  } else {
    err = WebGUI::COMMAND_ERROR;
  }
}


/**                                                                                                                                                   
 *                                                                                                                                                    
 **/
bool
Command::multi_part_op_cmd(std::string &orig_cmd,std::string &mod_cmd)
{
  //only eat "openapp archive backup commands" right now
  StrProc str_proc(orig_cmd," ");

  //allow the multiple response to be processed here too
  if (strncmp(orig_cmd.c_str(),WebGUI::CHUNKER_RESP_TOK_BASE.c_str(),WebGUI::CHUNKER_RESP_TOK_BASE.length()) != 0) {
    if (str_proc.get(0) != "open-app") {
      return false;
    }
    if (str_proc.get(1) != "archive") {
      return false;
    }
    if (str_proc.get(2) != "backup" && str_proc.get(2) != "restore") {
      return false;
    }
  }

  //does the cmd either equal an in-process bground op multi-part cmd                                                                                 
  //or is this the start of one?                                                                                                                      
  MultiResponseCommand multi_resp_cmd(_proc->get_msg().id(),orig_cmd,mod_cmd);
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
  string msg = "<?xml version='1.0' encoding='utf-8'?><openappliance><error><code>0</code><msg segment='"+token+"'>"+resp+"</msg></error></openappliance>";
  _proc->set_response(msg);
  return true;
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
 * replaces quoted values with node.tag and validates against cmd directory
 **/
WebGUI::AccessLevel
Command::validate_op_cmd(const string &username, WebGUI::AccessLevel user_access_level, std::string &cmd)
{
  //create hole for multi-resp access
  if (strncmp(cmd.c_str(),WebGUI::CHUNKER_RESP_TOK_BASE.c_str(),WebGUI::CHUNKER_RESP_TOK_BASE.length()) == 0) {
    return WebGUI::ACCESS_USER;
  }

  WebGUI::AccessLevel cmd_access_level = WebGUI::ACCESS_NONE;
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
  //let's open this and parse out the access level
  path += "/node.def";
  FILE *fp = fopen(path.c_str(),"r");
  cmd_access_level = WebGUI::ACCESS_INSTALLER;
  if (fp) {
    char buf[1025];
    //read value in here....
    while (fgets(buf, 1024, fp) != 0) {
      string tmp = string(buf);
      if (tmp.find("access:installer") != string::npos) {
	cmd_access_level = WebGUI::ACCESS_INSTALLER;
	break;
      }
      else if (tmp.find("access:admin") != string::npos) {
	cmd_access_level = WebGUI::ACCESS_ADMIN;
	break;
      }
      else if (tmp.find("access:user") != string::npos) {
	cmd_access_level = WebGUI::ACCESS_USER;
	break;
      }
      else if (tmp.find("access:restricted") != string::npos) {
	cmd_access_level = WebGUI::ACCESS_RESTRICTED;
	break;
      }
    }
    fclose(fp);
  }

  //finally a special restriction on user modification given access level
  if (user_access_level == WebGUI::ACCESS_USER) {
    //can only modify themselves
    StrProc str_proc(cmd," ");
    if (str_proc.get(1) == "user" && (str_proc.get(2) == "add" ||
				      str_proc.get(2) == "modify" ||
				      str_proc.get(2) == "delete")) {
  if (str_proc.get(3) != string("'" + username + "'")) {
	return WebGUI::ACCESS_NONE; //you are dropped!
      }
    }
  }
  return cmd_access_level;
}
