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
 *  Module:       client_opcmd_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Client class for encapsulating operational command information.
 *
 */


#include "client_opcmd_info.hh"

ClientOpCmd::ClientOpCmd() : m_id(0) {
}
ClientOpCmd::ClientOpCmd(unsigned long id, const std::string & strName, const std::string & strHelpString, const std::string & strAction, const std::string & strModule, OpCmdType oct) : m_id(0) {
	set(id, strName, strHelpString, strAction, strModule, oct);
}
unsigned long ClientOpCmd::getId() const {
	return m_id;
}
void ClientOpCmd::set(unsigned long id, const std::string & strName, const std::string & strHelpString, const std::string & strAction, const std::string & strModule, OpCmdType oct) {
	m_id = id;
	OpCmd::set(strName, strHelpString, strAction, strModule);
	setType(oct);
}
OpCmdName & ClientOpCmd::getOpCmdName() {
	return m_ocn;
}
ClientOpCmds::~ClientOpCmds() {
	std::list<ClientOpCmd*>::iterator i = m_listOpCmd.begin();
	const std::list<ClientOpCmd*>::const_iterator iEnd = m_listOpCmd.end();

	while (i != iEnd) {
		ClientOpCmd* p_oc = *i;
		if (p_oc != NULL) {
			delete p_oc;
			*i = NULL;
		}
		i++;
	}
}
ClientOpCmds::ClientOpCmds() {
}
void ClientOpCmds::push(ClientOpCmd * p_oc) {
	if (p_oc != NULL) m_listOpCmd.push_back(p_oc);
}
const std::list<ClientOpCmd*> & ClientOpCmds::getList() const {
	return m_listOpCmd;
}

