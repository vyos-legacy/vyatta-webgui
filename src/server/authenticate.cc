#include <iostream>
#include <security/pam_appl.h>
#include <security/pam_misc.h>
#include <pwd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <dirent.h>
#include <stdio.h>
#include <grp.h>
#include <string>
#include "rl_str_proc.hh"
#include "authenticate.hh"

using namespace std;

/**
 *
 **/
int conv_fun(int num_msg, const struct pam_message **msg, struct pam_response **resp, void *data) {
	*resp = (pam_response*) calloc(num_msg, sizeof(pam_response));
	if (data != NULL) {
		const string & password = *((const string*)data); 
		(*resp)->resp = x_strdup(password.c_str());
	}
	(*resp)->resp_retcode = 0;
	return PAM_SUCCESS;
}

/**
 *
 **/
Authenticate::Authenticate() : SystemBase()
{
}

/**
 *
 **/
Authenticate::~Authenticate()
{

}

/**
 *
 **/
bool
Authenticate::create_new_session()
{
  unsigned long id = 0;

  Message msg = _proc->get_msg();
  if (test_auth(msg._user, msg._pswd) == true) {
    //check for current session
    if ((id = reuse_session()) == 0) {
      id = create_new_id();
    }
  }
  else {
    _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
    return false;
  }

  if (id > 0) {
    //these commands are from vyatta-cfg-cmd-wrapper script when entering config mode
    string cmd;
    char buf[20];
    string stdout;
    sprintf(buf, "%lu", id);

    WebGUI::mkdir_p(WebGUI::ACTIVE_CONFIG_DIR.c_str());
    WebGUI::mkdir_p((WebGUI::LOCAL_CHANGES_ONLY + string(buf)).c_str());
    WebGUI::mkdir_p((WebGUI::LOCAL_CONFIG_DIR + string(buf)).c_str());

    string unionfs = WebGUI::unionfs();

    cmd = "sudo mount -t "+unionfs+" -o dirs="+WebGUI::LOCAL_CHANGES_ONLY+string(buf)+"=rw:"+WebGUI::ACTIVE_CONFIG_DIR+"=ro "+unionfs+" " +WebGUI::LOCAL_CONFIG_DIR+ string(buf);

    bool dummy;
    if (WebGUI::execute(cmd, stdout, dummy) != 0) {
      //syslog here
      _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
      return false;
    }
    
    WebGUI::mkdir_p((WebGUI::CONFIG_TMP_DIR+string(buf)).c_str());


    //apply password restriction policy here
    /*
      if the configuration shows that users or admin require non-default password
      then test for default password here, if default then set restricted bit on
      user session. Otherwise unset restricted bit.
      
      That should be enough. Note this means that an account will never be able
      to support a default password.
    */
    bool policy_pw_restricted = false;
    bool restricted = false;
    if (msg._user == "admin") {
      struct stat tmp;
      if (stat(WebGUI::OPENAPP_USER_RESTRICTED_POLICY_ADMIN.c_str(), &tmp) == 0) {
	policy_pw_restricted = true;
      }
    }
    else if (msg._user != "installer") { //then it's a user
      struct stat tmp;
      if (stat(WebGUI::OPENAPP_USER_RESTRICTED_POLICY_USER.c_str(), &tmp) == 0) {
	policy_pw_restricted = true;
      }
    }

    if (policy_pw_restricted) {
      if (msg._user == msg._pswd) {
	restricted = true;
      }
    }

    //now apply results of policy
    if (WebGUI::set_user(id,msg._user,restricted) == false) {
      _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
      return false;
    }
    else if (restricted == true) {
      _proc->_msg.set_id(id);
      _proc->set_response(WebGUI::RESTRICTED_ACCESS);
      return true;
    }

    //now generate successful response
    sprintf(buf, "%d", WebGUI::SUCCESS);
    char buf1[40];
    sprintf(buf1, "%lu", id);
    string tmpstr = "<?xml version='1.0' encoding='utf-8'?><vyatta><token>"+_proc->_msg._token+"</token><id>"+string(buf1)+"</id><error><code>"+string(buf)+"</code><msg/></error></vyatta>";
    _proc->set_response(tmpstr);
    
    //need to verify that system is set up correctly here to provide proper return code.
    _proc->_msg.set_id(id);
    return true;
  }
  _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
  return false;
}

/**
 *
 **/
bool
Authenticate::test_grp_membership(const std::string &username,
                                  const char *gname)
{
  bool found = false;
  struct group *g = getgrnam(gname);
  if (g != NULL) {
    char **m;
    for (m = g->gr_mem; *m != (char *)0; m++) {
      if (strcmp(*m, username.c_str()) == 0) {
	found = true;
	break;
      }
    }
  }
  return found;
}

/**
 *
 **/
bool
Authenticate::test_auth(const std::string & username, const std::string & password) 
{
  passwd * passwd = getpwnam(username.c_str());
  if (passwd == NULL) {
    //    cerr << "failed to retreive user" << endl;
    return false;
  }

  ////////////////////////////////////////////////////
  /*
  //without support for op cmds fail any non vyattacfg group member
  if (!test_grp_membership(username, "vyattacfg")) {
    return false; //rejecting as failed check or non vyattacfg member
  }
  */
  /*
 
  // open appliance: group requirement
  char *be_type = getenv("VYATTA_BACKEND_TYPE");
  if (be_type && strcmp(be_type, "OA") == 0) {
    if (!test_grp_membership(username, "vmadmin")) {
      return false;
    }
  }
  */
  pam_conv conv = { conv_fun, const_cast<void*>((const void*)&password) };
  
  pam_handle_t *pam = NULL;
  int result = pam_start("login", passwd->pw_name, &conv, &pam);
  if (result != PAM_SUCCESS) {
    cerr << "pam_start" << endl;
    return false;
  }
  
  result = pam_authenticate(pam, 0);
  if (result != PAM_SUCCESS) {
    cerr << "failed on pam_authenticate for: " << username << ", " << password << ", " << result << endl;
    return false;
  }
  
  result = pam_acct_mgmt(pam, 0);
  if (result != PAM_SUCCESS) {
    cerr << "pam_acct_mgmt" << endl;
    return false;
  }
  
  result = pam_end(pam, result);
  if (result != PAM_SUCCESS) {
    cerr << "pam_end" << endl;
    return false;
  }
  return true;
}

/**
 *
 **/
unsigned long
Authenticate::create_new_id()
{
  struct stat tmp;
  unsigned long id = 0;
  string file;
  unsigned long val;

  FILE *fp = fopen("/dev/urandom", "r");
  if (fp) {
    char *ptr = (char*)&val;

    do {
      *ptr = fgetc(fp); if (*ptr == EOF) return 0;
      *(ptr+1) = fgetc(fp); if (*(ptr+1) == EOF) return 0;
      *(ptr+2) = fgetc(fp); if (*(ptr+2) == EOF) return 0;
      *(ptr+3) = fgetc(fp); if (*(ptr+3) == EOF) return 0;
      
      id = WebGUI::ID_START + (float(val) / float(4294967296.)) * WebGUI::ID_RANGE;
      
      //now check for collision
      char buf[40];
      sprintf(buf, "%lu", id);
      file = WebGUI::VYATTA_MODIFY_FILE + string(buf);
    }
    while (stat(file.c_str(), &tmp) == 0);

    fclose(fp);
  }
  return id;  
}

/**
 *
 **/
unsigned long
Authenticate::reuse_session()
{
  //take username and look for a match in .vyattamodify project, if found return....

  DIR *dp;
  struct dirent *dirp;
  string id_str;
  unsigned long id = 0;
  if ((dp = opendir(WebGUI::VYATTA_MODIFY_DIR.c_str())) == NULL) {
    return 0;
  }

  while ((dirp = readdir(dp)) != NULL) {
    if (strncmp(dirp->d_name, ".vyattamodify_", 14) == 0) {
      id_str = string(dirp->d_name).substr(14,24);
      id = strtoul(id_str.c_str(),NULL,10);
      if (WebGUI::get_user(id) == _proc->get_msg()._user) {
	break;
      }
    }
  }
  closedir(dp);
  return id;
}

/**                                                                                                                                               
 *                                                                                                                                                
 **/
WebGUI::AccessLevel
Authenticate::get_access_level(const std::string &username)
{
  ////////////////////////////////////////////////////                                                                                            
  //Only allow users who are members of operator or vyattacfg groups to proceed                                                                   
  //get group membership via ldap...
  //first execute the ldap command
  
  //short-circuit installer access here
  if (strcmp(username.c_str(), "installer") == 0) {
    return WebGUI::ACCESS_INSTALLER;
  }

  string cmd = "/usr/bin/ldapsearch -x -b \"dc=localhost,dc=localdomain\" \"uid=" + username + "\"";
  string stdout;
  bool verbatim = false;
  int err = WebGUI::execute(cmd,stdout,verbatim,true);
  if (err != 0) {
    return WebGUI::ACCESS_NONE;
  }
  //now scan the output for the description field
  StrProc str_proc(stdout," ");
  vector<string> coll = str_proc.get();
  vector<string>::iterator iter = coll.begin();
  while (iter != coll.end()) {
    if (*iter == "description:") {
      ++iter;
      unsigned long id = _proc->_msg.id_by_val();
      if (WebGUI::is_restricted(id)) {
	return WebGUI::ACCESS_RESTRICTED;
      }
      else if (strncmp(iter->c_str(),"user",4) == 0) {
	return WebGUI::ACCESS_USER;
      }
      else if (strncmp(iter->c_str(),"admin",5) == 0) {
	return WebGUI::ACCESS_ADMIN;
      }
      return WebGUI::ACCESS_NONE;
    }
    ++iter;
  }
  return WebGUI::ACCESS_NONE;
}

