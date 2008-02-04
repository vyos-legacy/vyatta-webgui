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
 *  Module:       inter_session_info.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code that keeps track of a list of user sessions
 *
 */



#include <iostream>

#include "xgdaemon_module.hh"

#include "inter_session_info.hh"


#include "xgdaemon_xorp_util.hh"
#include "libxorp/eventloop_factory.hh"


InterSessionInfo::InterSessionInfo(XorpDirInfo & dir_info, bool flagXorpVerbose)
	:
	m_flagXorpVerbose(flagXorpVerbose),
	m_eventloop(*EventLoopFactory::instance().create(eventloop_st)),
	
	m_tt(dir_info.getXorpRootDir().c_str(), flagXorpVerbose),
	m_dir_info(dir_info)
	{
	std::string strErrorMsg;
	XGDaemonXorpUtil::loadTemplateTree(m_tt, dir_info.getXorpTemplateDir(), strErrorMsg);
}
bool InterSessionInfo::getFlagXorpVerbose() {
	return m_flagXorpVerbose;
}
void InterSessionInfo::runEventLoop() {
	if (m_eventloop.timers_pending() || m_eventloop.descriptor_count() > 0) {
		std::cout << '(';
		m_eventloop.run();	
		std::cout << ")";
	} else {
		std::cout << ".";
	}
}
EventLoop & InterSessionInfo::getEventLoop() {
	return m_eventloop;
}

TemplateTree & InterSessionInfo::getTemplateTree() {
	return m_tt;
}
XorpDirInfo & InterSessionInfo::getXorpDirInfo() {
	return m_dir_info;
}
const TemplateTree & InterSessionInfo::getConstTemplateTree() const {
	return m_tt;
}

