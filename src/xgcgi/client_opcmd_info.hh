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
 *  Module:       client_opcmd_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Client class for encapsulating operational command information.
 *
 */

#ifndef __INCLUDE_CLIENT_OPCMD_INFO_HH__
#define __INCLUDE_CLIENT_OPCMD_INFO_HH__

#include "../common/opcmd_info.hh"

class ClientOpCmd : public OpCmd {
public:
	ClientOpCmd();
	ClientOpCmd(unsigned long id, const std::string & strName, const std::string & strHelpString, const std::string & strAction, const std::string & strModule, OpCmdType oct);

	unsigned long getId() const;
	void set(unsigned long id, const std::string & strName, const std::string & strHelpString, const std::string & strAction, const std::string & strModule, OpCmdType oct);

	OpCmdName & getOpCmdName();

protected:
	unsigned long m_id;
};

class ClientOpCmds {
public:
	~ClientOpCmds();
	ClientOpCmds();

	void push(ClientOpCmd * p_oc);

	const std::list<ClientOpCmd*> & getList() const; 

private:
	std::list<ClientOpCmd*> m_listOpCmd;
};


#endif

