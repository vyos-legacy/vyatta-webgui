#include <iostream>
#include <security/pam_appl.h>
#include <security/pam_misc.h>
#include <pwd.h>
#include <sys/types.h>
#include <stdio.h>
#include "authenticate.hh"

using namespace std;

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
uid_t Authenticate::test_auth(const std::string & username, const std::string & password) 
{
  passwd * passwd = getpwnam(username.c_str());
  if (passwd == NULL) {
    cerr << "failed to retreive user" << endl;
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
  return 1;//passwd->pw_uid;
}

