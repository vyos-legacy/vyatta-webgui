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
 *  Module:       generic_xorp_link.cc
 *
 *  Author(s):    Marat Nepomnyashy, based on XORP
 *  Date:         2006
 *  Description:  Code for connecting to the XORP event loop
 *
 */

#include "xgdaemon_module.hh"

#include "generic_xorp_link.hh"

GenericXorpLink::GenericXorpLink(EventLoop & eventloop, XorpDirInfo & dir_info)
	:
	m_strIPCname(dir_info.generateUniqueIPCname()),
	m_eventloop(eventloop),
	m_smm(m_eventloop),
	m_xrl_router(m_eventloop, m_strIPCname.c_str())
	{
}

XrlStdRouter & GenericXorpLink::getXrlStdRouter() {
	return m_xrl_router;
}

