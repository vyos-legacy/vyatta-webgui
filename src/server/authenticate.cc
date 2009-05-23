#include <iostream>
#include <security/pam_appl.h>
#include <security/pam_misc.h>
#include <pwd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/stat.h>
#include <unistd.h>
#include <dirent.h>
#include <stdio.h>
#include <grp.h>
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
  string id;
  bool init_session = false;

  Message msg = _proc->get_msg();
  if (test_auth(msg._user, msg._pswd) == true) {
    //check for current session
    id = reuse_session();
    if (id.empty()) {
      id = create_new_id();
      init_session = true;
    }
  }
  else {
    usleep(WebGUI::SLEEP_ON_AUTH_FAILURE);
    _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
    return false;
  }

  if (!id.empty()) {
    //these commands are from vyatta-cfg-cmd-wrapper script when entering config mode
    string cmd;
    string stdout;

    if (init_session == true) {
      WebGUI::mkdir_p(WebGUI::ACTIVE_CONFIG_DIR.c_str());
      WebGUI::mkdir_p((WebGUI::LOCAL_CHANGES_ONLY + id).c_str());
      WebGUI::mkdir_p((WebGUI::LOCAL_CONFIG_DIR + id).c_str());
      
      string unionfs = WebGUI::unionfs();
      
      cmd = "sudo mount -t "+unionfs+" -o dirs="+WebGUI::LOCAL_CHANGES_ONLY+id+"=rw:"+WebGUI::ACTIVE_CONFIG_DIR+"=ro "+unionfs+" " +WebGUI::LOCAL_CONFIG_DIR+ id;
      cout << "cmd: " << cmd << endl;
      if (WebGUI::execute(cmd, stdout) != 0) {
	//syslog here
	_proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
	return false;
      }
      
      WebGUI::mkdir_p((WebGUI::CONFIG_TMP_DIR+id).c_str());
      
      //write the username here to modify file
      string file = WebGUI::VYATTA_MODIFY_FILE + id;
      FILE *fp = fopen(file.c_str(), "w");
      if (!fp) {
	_proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
	return false;
      }
      fputs(msg._user.c_str(), fp);
      fclose(fp);
    }

    //now generate successful response
    char buf[80];
    sprintf(buf, "%d", WebGUI::SUCCESS);
    string tmpstr = "<?xml version='1.0' encoding='utf-8'?><vyatta><token>"+_proc->_msg._token+"</token><id>"+id+"</id><error><code>"+string(buf)+"</code><msg/></error></vyatta>";
    _proc->set_response(tmpstr);
    
    //need to verify that system is set up correctly here to provide proper return code.
    _proc->_msg.set_id(id);
    return true;
  }
  _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
  return false;
}

bool
Authenticate::is_grp_member(struct group *grp, const std::string &username)
{
  for (char **m = grp->gr_mem; *m; m++) {
    if (strcmp(*m, username.c_str()) == 0) {
      return true;
    }
  }
  return false;
}

bool
Authenticate::is_group_member(const char *grpname, const std::string &username)
{
  setgrent();
  struct group *grp = NULL;
  bool ret = false;
  while ((grp = getgrent())) {
    if (strcmp(grpname, grp->gr_name) != 0) {
      continue;
    }
    if (is_grp_member(grp, username)) {
      ret = true;
      break;
    }
  }
  endgrent();
  return ret;
}

/**
 *
 **/
WebGUI::AccessLevel
Authenticate::get_access_level(const std::string &username, gid_t &gid)
{
  ////////////////////////////////////////////////////
  //Only allow users who are members of operator or vyattacfg groups to proceed
  WebGUI::AccessLevel ret = WebGUI::ACCESS_NONE;
  const char *gname = NULL;
  if (is_group_member("vyattacfg", username)) {
    gname = "vyattacfg";
    ret = WebGUI::ACCESS_ALL;
  }
  if (is_group_member("operator", username)) {
    gname = "operator";
    ret = WebGUI::ACCESS_OPER;
  }
  if (ret != WebGUI::ACCESS_NONE) {
    struct group *gr = getgrnam(gname);
    if (gr) {
      gid = gr->gr_gid;
    } else {
      ret = WebGUI::ACCESS_NONE;
    }
  }
  return ret;
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

  gid_t dummy = 0;
  WebGUI::AccessLevel level = get_access_level(username, dummy);
  if (level == WebGUI::ACCESS_NONE) {
    return false;
  }

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
string
Authenticate::create_new_id()
{
  struct stat tmp;
  string file;
  unsigned long val;
  char buf[40];
  string id;

  //let's grab the src ip of the request first
  unsigned long src_ip = 0;

  //  string hack = "echo \"" + string(getenv("REMOTE_ADDR")) + "\" >> /tmp/BAR";system(hack.c_str());
  string ip = string(getenv("REMOTE_ADDR"));
  if (!ip.empty()) {
    in_addr_t addr = inet_addr(ip.c_str());
    src_ip = (unsigned long)addr;
  }

  FILE *fp = fopen("/dev/urandom", "r");
  if (fp) {
    char *ptr = (char*)&val;
    
    do {
      *ptr = fgetc(fp); if (*ptr == EOF) return id;
      *(ptr+1) = fgetc(fp); if (*(ptr+1) == EOF) return id;
      *(ptr+2) = fgetc(fp); if (*(ptr+2) == EOF) return id;
      *(ptr+3) = fgetc(fp); if (*(ptr+3) == EOF) return id;
      
      unsigned long id = WebGUI::ID_START + (float(val) / float(WebGUI::ID_MAX)) * WebGUI::ID_RANGE;
      
      //now check for collision
      
      //need to pad out src_ip to fill up 10 characters
      sprintf(buf, "%.8lX%.8lX",src_ip,id);
      //      sprintf(buf, "%*lu%lu",10,src_ip,id);
      file = WebGUI::VYATTA_MODIFY_FILE + string(buf);
    }
    while (stat(file.c_str(), &tmp) == 0);

    fclose(fp);
  }

  id = string(buf);
  return id;  
}

/**
 *
 **/
std::string
Authenticate::reuse_session()
{
  //take username and look for a match in .vyattamodify project, if found return....

  DIR *dp;
  struct dirent *dirp;
  string id_str;
  if ((dp = opendir(WebGUI::VYATTA_MODIFY_DIR.c_str())) == NULL) {
    return id_str;
  }

  while ((dirp = readdir(dp)) != NULL) {
    if (strncmp(dirp->d_name, ".vyattamodify_", 14) == 0) {
      string tmp = WebGUI::VYATTA_MODIFY_DIR + string(dirp->d_name);
      FILE *fp = fopen(tmp.c_str(),"r");
      if (fp) {
	char buf[1025];
	//read value in here....
	if (fgets(buf, 1024, fp) != 0) {
	  if (string(buf) == _proc->get_msg()._user) {
	    id_str = string(dirp->d_name).substr(14,24);
	    break;
	  }
	}
	fclose(fp);
      }
    }
  }  
  closedir(dp);
  return id_str;
}
