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
 *  Module:       misc_util.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility code for various miscellaneous functions.
 *
 */
 
#include "xgdaemon_misc_util.hh"

#include "librl_common/rl_encrypt_util.hh"
#include "librl_common/rl_system_node_util.hh"


bool MiscUtil::doAddUser(
	XrlRouter & xrl_router,
	EventLoop & eventloop,
	const std::string & finder_target,
	const std::string & strUser,
	const std::string & strPassword) {

	UNUSED(xrl_router);
	UNUSED(eventloop);
	UNUSED(finder_target);
	UNUSED(strUser);
	UNUSED(strPassword);
	
	char * strEncrypted = RLEncryptUtil::crypt(strPassword.c_str());
	UNUSED(strEncrypted);
	
	XrlCmdError xce = RLSystemNodeUtil::set_system_login_user(strUser, "", strEncrypted, strPassword, "/etc/shadow");
	if (xce != XrlCmdError::OKAY()) {
		return false;
	} else {
		return true;
	}

/*
	XrlRLSystemNodeNoRouter sn(xrl_router, eventloop, finder_target);

	XrlCmdError xce = sn.rl_system_0_1_set_system_login_user(strUser, "", strEncrypted, strPassword);
	*/
}

