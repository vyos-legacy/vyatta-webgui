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
 *  Module:       inter_session_info.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code that keeps track of a list of user sessions
 *
 */


#ifndef __INCLUDE_INTER_SESSION_INFO__
#define	__INCLUDE_INTER_SESSION_INFO__


#include "libxorp/eventloop.hh"
#include "rtrmgr/op_commands.hh"
#include "rtrmgr/slave_module_manager.hh"
#include "rtrmgr/template_tree.hh"
#include "rtrmgr/xorp_client.hh"

#include "xorp_dir_info.hh"


class InterSessionInfo {
public:
	InterSessionInfo(XorpDirInfo & dir_info, bool flagXorpVerbose);

	bool getFlagXorpVerbose();

	void runEventLoop();

	EventLoop & getEventLoop();
//	OpCommandList & getOpCommandList();
	TemplateTree & getTemplateTree();
	XorpDirInfo & getXorpDirInfo();

	const TemplateTree & getConstTemplateTree() const;

private:
	bool		m_flagXorpVerbose;

	EventLoop&	m_eventloop;
	TemplateTree	m_tt;

	XorpDirInfo &	m_dir_info;
};

#endif

