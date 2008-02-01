/*
 *  Copyright 2006, Vyatta, Inc.
 *
 *  GNU General Public License
 * 
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License, version 2, 
 *  as published by the Free Software Foundation.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 *  02110-1301 USA
 *
 *  Module:       xgdaemon_pam_util.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility code for authentication via PAM.
 *
 */


#include <security/pam_appl.h>
#include <security/pam_misc.h>
#include <pwd.h>
#include <sys/types.h>
#include <stdio.h>


#include "xgdaemon_pam_util.hh"
#include "basic/xgdaemon_util.hh"


#define	MY_CONFIG	"login"


XGDaemonPamUtil::XGDaemonPamUtil() {
}

int XGDaemonPamUtil::convFun(int num_msg, const struct pam_message ** pp_msg, struct pam_response ** pp_resp, void * p_appdata) {
	*pp_resp = (pam_response*) calloc(num_msg, sizeof(pam_response));
	if (p_appdata != NULL) {
		const std::string & strPassword = *((const std::string*)p_appdata); 
		(*pp_resp)->resp = x_strdup(strPassword.c_str());
	}
	(*pp_resp)->resp_retcode = 0;
	
	UNUSED(pp_msg);

	return PAM_SUCCESS;
}

uid_t XGDaemonPamUtil::testAuth(const std::string & strUsername, const std::string & strPassword) {
	passwd * p_passwd = getpwnam(strUsername.c_str());
	if (p_passwd == NULL) return 0;

	pam_conv conv = { convFun, const_cast<void*>((const void*)&strPassword) };

	pam_handle_t *pamh = NULL;
	int result = pam_start(MY_CONFIG, p_passwd->pw_name, &conv, &pamh);
	if (result != PAM_SUCCESS) {
		perror("pam_start");
		printf("result =  %x\n", result);
		return 0;
	}

	result = pam_authenticate(pamh, 0);
	if (result != PAM_SUCCESS) {
		perror("pam_authenticate");
		printf("result =  %x\n", result);
		return 0;
	}

	result = pam_acct_mgmt(pamh, 0);
	if (result != PAM_SUCCESS) {
		perror("pam_acct_mgmt");
		printf("result =  %x\n", result);
		return 0;
	}

	result = pam_end(pamh, result);
	if (result != PAM_SUCCESS) {
		perror("pam_end");
		printf("result =  %x\n", result);
		return 0;
	}

	return p_passwd->pw_uid;
}


