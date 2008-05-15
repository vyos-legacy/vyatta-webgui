#include <iostream>
#include <security/pam_appl.h>
#include <security/pam_misc.h>
#include <pwd.h>
#include <sys/types.h>
#include <stdio.h>
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
void
Authenticate::create_new_session()
{
  Message msg = _proc->get_msg();
  uid_t id = test_auth(msg._user, msg._pswd);

  if (id > 0) {
    //these commands are from vyatta-cfg-cmd-wrapper script when entering config mode
    string cmd;
    char buf[20];
    sprintf(buf, "%d", id);

    cmd = "mkdir -p /opt/vyatta/config/active";
    WebGUI::execute(cmd);

    cmd = "mkdir -p /tmp/changes_only_" + string(buf);
    WebGUI::execute(cmd);
    //exec

    cmd = "mkdir -p /opt/vyatta/config/tmp/new_config_" + string(buf);
    WebGUI::execute(cmd);
    //exec

    cmd = "grep -q union=aufs /proc/cmdline || grep -q aufs /proc/filesystems";
    string unionfs = "unionfs";
    if (WebGUI::execute(cmd, true)) {
      unionfs = "aufs";
    }

    cmd = "sudo mount -t "+unionfs+" -o dirs=/tmp/changes_only_"+string(buf)+"=rw:/opt/vyatta/config/active=ro "+unionfs+" /opt/vyatta/config/tmp/new_config_" + string(buf);

    WebGUI::execute(cmd);

    cmd = "mkdir -p /opt/vyatta/config/tmp/new_config_" + string(buf);
    WebGUI::execute(cmd);
    
    //need to verify that system is set up correctly here to provide proper return code.
    _proc->_msg._id = id;
  }
}

/**
 *
 **/
uid_t Authenticate::test_auth(const std::string & username, const std::string & password) 
{
  passwd * passwd = getpwnam(username.c_str());
  if (passwd == NULL) {
    //    cerr << "failed to retreive user" << endl;
    return 0;
  }
  
  pam_conv conv = { conv_fun, const_cast<void*>((const void*)&password) };
  
  pam_handle_t *pam = NULL;
  int result = pam_start("login", passwd->pw_name, &conv, &pam);
  if (result != PAM_SUCCESS) {
    cerr << "pam_start" << endl;
    return 0;
  }
  
  result = pam_authenticate(pam, 0);
  if (result != PAM_SUCCESS) {
    cerr << "failed on pam_authenticate for: " << username << ", " << password << ", " << result << endl;
    return 0;
  }
  
  result = pam_acct_mgmt(pam, 0);
  if (result != PAM_SUCCESS) {
    cerr << "pam_acct_mgmt" << endl;
    return 0;
  }
  
  result = pam_end(pam, result);
  if (result != PAM_SUCCESS) {
    cerr << "pam_end" << endl;
    return 0;
  }
  return WebGUI::ID_START + 1;//passwd->pw_uid;
}

