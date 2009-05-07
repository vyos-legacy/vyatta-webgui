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
  bool init_session = false;

  Message msg = _proc->get_msg();
  if (test_auth(msg._user, msg._pswd) == true) {
    //check for current session
    if ((id = reuse_session()) == 0) {
      id = create_new_id();
      init_session = true;
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

    if (init_session == true) {
      WebGUI::mkdir_p(WebGUI::ACTIVE_CONFIG_DIR.c_str());
      WebGUI::mkdir_p((WebGUI::LOCAL_CHANGES_ONLY + string(buf)).c_str());
      WebGUI::mkdir_p((WebGUI::LOCAL_CONFIG_DIR + string(buf)).c_str());
      
      string unionfs = WebGUI::unionfs();
      
      cmd = "sudo mount -t "+unionfs+" -o dirs="+WebGUI::LOCAL_CHANGES_ONLY+string(buf)+"=rw:"+WebGUI::ACTIVE_CONFIG_DIR+"=ro "+unionfs+" " +WebGUI::LOCAL_CONFIG_DIR+ string(buf);
      
      if (WebGUI::execute(cmd, stdout) != 0) {
	//syslog here
	_proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
	return false;
      }
      
      WebGUI::mkdir_p((WebGUI::CONFIG_TMP_DIR+string(buf)).c_str());
      
      //write the username here to modify file
      string file = WebGUI::VYATTA_MODIFY_FILE + buf;
      FILE *fp = fopen(file.c_str(), "w");
      if (!fp) {
	_proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
	return false;
      }
      fputs(msg._user.c_str(), fp);
      fclose(fp);
    }

    //now generate successful response
    sprintf(buf, "%d", WebGUI::SUCCESS);
    char buf1[40];
    sprintf(buf1, "%lu", id);
    string tmpstr = "<?xml version='1.0' encoding='utf-8'?><openappliance><token>"+_proc->_msg._token+"</token><id>"+string(buf1)+"</id><userName>"+msg._user+"</userName><error><code>"+string(buf)+"</code><msg/></error></openappliance>";
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
#if 0
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
#endif

  // instead of pam_authenticate/etc. the user, we need to authenticate the
  // request, i.e., make sure it is from dom0.
  // TODO: authenticate request, e.g., using information from cgi environment
  //       (e.g., remote host, etc.) and request headers (e.g., extra headers
  //       added by dom0).
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
      
      id = WebGUI::ID_START + (float(val) / float(WebGUI::ID_MAX)) * WebGUI::ID_RANGE;
      
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
  if ((dp = opendir(WebGUI::VYATTA_MODIFY_DIR.c_str())) == NULL) {
    return 0;
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
  return strtoul(id_str.c_str(),NULL,10);
}
