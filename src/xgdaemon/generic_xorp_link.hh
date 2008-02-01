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
 *  Module:       generic_xorp_link.hh
 *
 *  Author(s):    Marat Nepomnyashy, based on XORP
 *  Date:         2006
 *  Description:  Code for connecting to the XORP event loop
 *
 */


#ifndef __INCLUDE_GENERIC_XORP_LINK__
#define __INCLUDE_GENERIC_XORP_LINK__

#include <string>

#include "libxorp/eventloop.hh"
#include "libxipc/xrl_std_router.hh"
#include "rtrmgr/slave_module_manager.hh"

#include "xorp_dir_info.hh"

class GenericXorpLink {
public:
	GenericXorpLink(EventLoop & eventloop, XorpDirInfo & dir_info);

	XrlStdRouter & getXrlStdRouter();
protected:
	std::string             m_strIPCname;
	EventLoop &		m_eventloop;
	SlaveModuleManager	m_smm;
	XrlStdRouter		m_xrl_router;
};

#endif

