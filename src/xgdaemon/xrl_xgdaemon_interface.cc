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
 *  Module:              xrl_xgdaemon_interface.cc
 *
 *  Original Author(s):  XORP Development team -- Atanu Ghosh, Pavlin Radoslavov, & others
 *  Other Author(s):     Marat Nepomnyashy, based on XORP
 *  Date:                2006
 *  Description:         This is used for XRL communication between xgdaemon and the rest of XORP
 *
 */

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

	//#ident "$XORP$"

#include "xgdaemon_module.hh"

#include "libxorp/xorp.h"
#include "libxorp/xlog.h"
#include "libxorp/debug.h"
#include "libxorp/status_codes.h"

#include "libxipc/xrl_router.hh"

#include "rtrmgr/generic_module_manager.hh"

#include "xgdaemon_xorp_link.hh"
#include "xrl_xgdaemon_interface.hh"


XrlXGDaemonInterface::XrlXGDaemonInterface(XrlRouter* r, XGDaemonXorpLink& xlink, bool flagVerbose)
    : XrlRlXgdaemonTargetBase(r),
      m_xlink(xlink),
      m_verbose(flagVerbose)
{	
}

XrlCmdError 
XrlXGDaemonInterface::common_0_1_get_target_name(// Output values, 
					       string& name)
{
    name = XrlRlXgdaemonTargetBase::name();
    return XrlCmdError::OKAY();
}

XrlCmdError 
XrlXGDaemonInterface::common_0_1_get_version(// Output values, 
					   string& v)
{
    v = string(version());
    return XrlCmdError::OKAY();
}

XrlCmdError
XrlXGDaemonInterface::common_0_1_get_status(// Output values, 
					  uint32_t& status,
					  string& reason)
{
    // XXX placeholder only
    status = PROC_READY;
    reason = "Ready";
    return XrlCmdError::OKAY();
}

XrlCmdError
XrlXGDaemonInterface::common_0_1_shutdown()
{
    // TODO: XXX: implement it!!
    exit(0);
}

XrlCmdError 
XrlXGDaemonInterface::rtrmgr_client_0_2_new_config_user(// Input values, 
						      const uint32_t& user_id)
{
    m_xlink.new_config_user((uid_t)user_id);
    return XrlCmdError::OKAY();
}

XrlCmdError 
XrlXGDaemonInterface::rtrmgr_client_0_2_config_saved_done(// Input values, 
							 const bool& success, 
							 const string& errmsg)
{
    if (success) {
	XLOG_TRACE(m_verbose, "Configuration saved: success");
    } else {
	XLOG_TRACE(m_verbose, "Failure saving the configuration: %s",
		   errmsg.c_str());
    }
    m_xlink.config_saved_done(success, errmsg);
    return XrlCmdError::OKAY();
}

XrlCmdError 
XrlXGDaemonInterface::rtrmgr_client_0_2_config_change_done(// Input values, 
							 const bool& success, 
							 const string& errmsg)
{
    if (success) {
	XLOG_TRACE(m_verbose, "Configuration changed: success");
    } else {
	XLOG_TRACE(m_verbose, "Failure changing the configuration: %s",
		   errmsg.c_str());
    }
    m_xlink.commit_done(success, errmsg);
    return XrlCmdError::OKAY();
}

XrlCmdError 
XrlXGDaemonInterface::rtrmgr_client_0_2_config_changed(// Input values, 
						     const uint32_t& user_id, 
						     const string& deltas, 
						     const string& deletions)
{
    XLOG_TRACE(m_verbose,
	       "config changed: user_id: %u\nDELTAS:\n%sDELETIONS:\n%s\n",
	       XORP_UINT_CAST(user_id), deltas.c_str(), deletions.c_str());
    m_xlink.config_changed(user_id, deltas, deletions);
    return XrlCmdError::OKAY();
}

XrlCmdError 
XrlXGDaemonInterface::rtrmgr_client_0_2_module_status(// Input values,
						    const string&   modname,
						    const uint32_t& status)
{
    XLOG_TRACE(m_verbose,
	       "module status: %s changed to status %u\n",
	       modname.c_str(), XORP_UINT_CAST(status));
    m_xlink.module_status_change(modname, (GenericModule::ModuleStatus)status);
    return XrlCmdError::OKAY();
}
