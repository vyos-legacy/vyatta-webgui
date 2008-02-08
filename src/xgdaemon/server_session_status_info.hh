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
 *  Module:       server_session_status_info.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code for server-side encapsulation of user session information.
 *
 */


#ifndef __INCLUDE_XGDAEMON_SESSION_STATUS_INFO__
#define __INCLUDE_XGDAEMON_SESSION_STATUS_INFO__


#include "xgdaemon_module.hh"

#include "common/common_session_status_info.hh"

#include "libxorp/eventloop.hh"
#include "libxipc/xrl_std_router.hh"
#include "server_time_info.hh"
//#include "xrl/interfaces/rtrmgr_xif.hh"

#include "rtrmgr/conf_tree.hh"
#include "rtrmgr/generic_module_manager.hh"
#include "rtrmgr/slave_conf_tree.hh"
#include "rtrmgr/template_tree.hh"
#include "rtrmgr/template_tree_node.hh"
#include "rtrmgr/xorpsh_base.hh"

#include "xgdaemon_current_task_info.hh"

class XGDaemonXorpLink;


class ServerSessionStatusInfo : public CommonSessionStatusInfo {
public:
	ServerSessionStatusInfo(const XorpShellBase::Mode mode, const XGDaemonXorpLink * p_xlink);

	bool getFlagCanCommit() const;
	bool getFlagConfigChanged() const;
	bool getFlagConfigInvalid() const;
	bool getFlagInvalidState() const;

	unsigned long getTotalConfigChanges() const;

	void incrementTotalCycles();
	void setMode(XorpShellBase::Mode mode);

	void updateTimeLastActivity();

	XGDaemonCurrentTaskInfo & getCurrentTaskInfo();
	std::string getPhase() const;

	const XGDaemonCurrentTaskInfo & getConstCurrentTaskInfo() const;
	const TimeInfo & getTimeNow() const;
	const XorpShellBase::Mode & getMode() const;


protected:
	mutable ServerTimeInfo     m_sti;

	XGDaemonCurrentTaskInfo    m_cti;
	XorpShellBase::Mode        m_mode;

	const XGDaemonXorpLink *   m_p_xlink;
};

#endif

