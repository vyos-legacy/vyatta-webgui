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
 *  Module:       client_mod_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Client-side encapsulation of information related to added/changed/deleted/invalid nodes.
 *
 */


#ifndef __CLIENT_MOD_INFO_HH__
#define __CLIENT_MOD_INFO_HH__

#include <list>
#include <string>

#include "common/mod_info.hh"

class ClientModContextInfo : public ModContextInfo {
public:
	ClientModContextInfo(const ModType mt, const std::string & strPath);
	const std::string & getPath() const;
protected:
	std::string m_strPath;
};

class ClientModsInfo {
public:
	static const std::string & getDescr(ModType mt);

	std::list<ClientModContextInfo> & getListNodesAdded();
	std::list<ClientModContextInfo> & getListNodesChanged();
	std::list<ClientModContextInfo> & getListNodesDeleted();
	std::list<ClientModContextInfo> & getListNodesInvalid();
	std::list<ClientModContextInfo> & getListNodesMissing();

	void clear();

	const std::list<ClientModContextInfo> & getConstListNodes(ModType mt) const;
	const std::list<ClientModContextInfo> & getConstListNodesAdded() const;
	const std::list<ClientModContextInfo> & getConstListNodesChanged() const;
	const std::list<ClientModContextInfo> & getConstListNodesDeleted() const;
	const std::list<ClientModContextInfo> & getConstListNodesInvalid() const;
	const std::list<ClientModContextInfo> & getConstListNodesMissing() const;

private:
	std::list<ClientModContextInfo> m_listNodesAdded;
	std::list<ClientModContextInfo> m_listNodesChanged;
	std::list<ClientModContextInfo> m_listNodesDeleted;
	std::list<ClientModContextInfo> m_listNodesInvalid;
	std::list<ClientModContextInfo> m_listNodesMissing;
};

#endif

