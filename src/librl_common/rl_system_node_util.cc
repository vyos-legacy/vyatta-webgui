/*
 * Module: rl_system_node_util.cc
 *
 * **** License ****
 * Version: VPL 1.0
 *
 * The contents of this file are subject to the Vyatta Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.vyatta.com/vpl
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * This code was originally developed by Vyatta, Inc.
 * Portions created by Vyatta are Copyright (C) 2005, 2006, 2007 Vyatta, Inc.
 * All Rights Reserved.
 *
 * Author: Michael Larson
 * Date: 2005
 * Description:
 *
 * **** End License ****
 *
 */

#include <stdlib.h>
#include <stdio.h>


#include <stdexcept>

#include "librl_common_module.h"
#include "libxorp/xlog.h"

//#include "rl_fileaccess.hh"
//#include "rl_validate.hh"
//#include "rl_command.hh"

#include "rl_system_node_util.hh"

XrlCmdError RLSystemNodeUtil::set_system_login_user(
	const string & user,
	const string & full_name,
	const string & encrypted_pw,
	const string & plaintext_pw,
	const string & shadow_pw_file) {

	UNUSED(shadow_pw_file);
	
	if (encrypted_pw.empty() && plaintext_pw.empty()) {
	  return XrlCmdError::OKAY();
	}

	if (user.empty() == true) {
	  return XrlCmdError::COMMAND_FAILED("Bad argument received: user name is empty");
	}
	std::string cmd("moduser");
	if (full_name.empty() == false) {
		cmd += " -n '" + full_name + "'";
	}

	if (plaintext_pw.empty() == false) {
	  cmd += " -c '" + plaintext_pw + "' ";
	}
	else if (encrypted_pw.empty() == false) {
	  cmd += " -e '" + encrypted_pw + "' ";
	}

	if (user.empty() == false) {
	  cmd += " " + user;
	}

throw std::logic_error("NYI");
//	if (rl_command::execute(cmd, false, false) == false) {
//	  XLOG_ERROR("RLSystemNode: failed to execute command: %s", cmd.c_str());
//	  return XrlCmdError::COMMAND_FAILED();
//	}
//
//	return XrlCmdError::OKAY();
}

