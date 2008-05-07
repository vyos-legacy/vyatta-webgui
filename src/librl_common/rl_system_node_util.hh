/*
 * Module: rl_system_node_util.hh
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
#ifndef __INCLUDE_RL_SYSTEM_NODE_UTIL__
#define	__INCLUDE_RL_SYSTEM_NODE_UTIL__

#include <string>
#include <libxipc/xrl_error.hh>

using namespace std;

class RLSystemNodeUtil {
public:
	static XrlCmdError set_system_login_user(
		const string &user,
		const string &full_name,
		const string &encrypted_pw,
		const string &plaintext_pw,
		const string & shadow_pw_file);
};

#endif

