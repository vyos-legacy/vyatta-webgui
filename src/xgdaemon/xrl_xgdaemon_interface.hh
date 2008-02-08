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
 *  Module:              xrl_xgdaemon_interface.hh
 *
 *  Original Author(s):  XORP Development team -- Atanu Ghosh, Pavlin Radoslavov, & others
 *  Other Author(s):     Marat Nepomnyashy, based on XORP
 *  Date:                2006
 *  Description:         This is used for XRL communication between xgdaemon and the rest of XORP
 *
 */


// The file from which this file derives (xrl_xorpsh_interface.hh)
// was initially obtained from the XORP source code.

	// -*- c-basic-offset: 4; tab-width: 8; indent-tabs-mode: t -*-

	// Copyright (c) 2001-2005 International Computer Science Institute
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the "Software")
	// to deal in the Software without restriction, subject to the conditions
	// listed in the XORP LICENSE file. These conditions include: you must
	// preserve this copyright notice, and you cannot mention the copyright
	// holders in advertising related to the Software without their permission.
	// The Software is provided WITHOUT ANY WARRANTY, EXPRESS OR IMPLIED. This
	// notice is a summary of the XORP LICENSE file; the license in that file is
	// legally binding.

	// $XORP$

#ifndef __XGDAEMON_XRL_XGDAEMON_INTERFACE_HH__
#define __XGDAEMON_XRL_XGDAEMON_INTERFACE_HH__


//#include "xrl/targets/rl_xgdaemon_base.hh"


class XGDaemonXorpLink;

class XrlXGDaemonInterface { //: public XrlRlXgdaemonTargetBase {
public:
    XrlXGDaemonInterface(XrlRouter* r, XGDaemonXorpLink& xlink, bool flagVerbose);

    XrlCmdError common_0_1_get_target_name(
	// Output values, 
	string&	name);

    XrlCmdError common_0_1_get_version(
	// Output values, 
	string&	version);

    /**
     *  Get status from Xrl Target
     */
    XrlCmdError common_0_1_get_status(// Output values,
				      uint32_t& status,
				      string&	reason);
    
    /**
     * Shutdown cleanly
     */
    XrlCmdError common_0_1_shutdown();

    XrlCmdError rtrmgr_client_0_2_new_config_user(
	// Input values, 
	const uint32_t&	user_id);

    XrlCmdError rtrmgr_client_0_2_config_saved_done(
	// Input values,
	const bool&	success,
	const string&	errmsg);

    XrlCmdError rtrmgr_client_0_2_config_change_done(
	// Input values, 
	const bool&	success, 
	const string&	errmsg);

    XrlCmdError rtrmgr_client_0_2_config_changed(
	// Input values, 
	const uint32_t&	user_id, 
	const string&	deltas, 
	const string&	deletions);

    XrlCmdError rtrmgr_client_0_2_module_status(
	// Input values,
        const string&   modname,
        const uint32_t& status);

private:
    XGDaemonXorpLink&	m_xlink;

    bool		m_verbose;		// Set to true if output is verbose
};

#endif // __XGDAEMON_XRL_XORPSH_INTERFACE_HH__
