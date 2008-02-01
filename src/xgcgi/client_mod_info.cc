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
 *  Module:       client_mod_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Client-side encapsulation of information related to added/changed/deleted/invalid nodes.
 *
 */



#include "client_mod_info.hh"

#include <stdexcept>

const static std::string strDescr[4] = {"Added", "Changed", "Deleted", "Invalid"};


std::list<ClientModContextInfo> & ClientModsInfo::getListNodesAdded() {
	return m_listNodesAdded;
}
std::list<ClientModContextInfo> & ClientModsInfo::getListNodesChanged() {
	return m_listNodesChanged;
}
std::list<ClientModContextInfo> & ClientModsInfo::getListNodesDeleted() {
	return m_listNodesDeleted;
}
std::list<ClientModContextInfo> & ClientModsInfo::getListNodesInvalid() {
	return m_listNodesInvalid;
}
std::list<ClientModContextInfo> & ClientModsInfo::getListNodesMissing() {
	return m_listNodesMissing;
}

void ClientModsInfo::clear() {
	m_listNodesAdded.clear();
	m_listNodesChanged.clear();
	m_listNodesDeleted.clear();
	m_listNodesInvalid.clear();
}

const std::list<ClientModContextInfo> & ClientModsInfo::getConstListNodes(ModType mt) const {
	switch (mt) {
		case MOD_NONE:
			throw std::logic_error("MOD_NONE invalid argument.");
		case MOD_ADDED:
			return getConstListNodesAdded();
		case MOD_CHANGED:
			return getConstListNodesChanged();
		case MOD_DELETED:
			return getConstListNodesDeleted();
		case MOD_MISSING:
			return getConstListNodesMissing();
//		case MOD_INVALID:
//			return getConstListNodesInvalid();
		default:
			throw std::logic_error("Unknown mod type.");
	}
}
const std::list<ClientModContextInfo> & ClientModsInfo::getConstListNodesAdded() const {
	return m_listNodesAdded;
}
const std::list<ClientModContextInfo> & ClientModsInfo::getConstListNodesChanged() const {
	return m_listNodesChanged;
}
const std::list<ClientModContextInfo> & ClientModsInfo::getConstListNodesDeleted() const {
	return m_listNodesDeleted;
}
const std::list<ClientModContextInfo> & ClientModsInfo::getConstListNodesInvalid() const {
	return m_listNodesInvalid;
}
const std::list<ClientModContextInfo> & ClientModsInfo::getConstListNodesMissing() const {
	return m_listNodesMissing;
}
const std::string & ClientModsInfo::getDescr(ModType mt) {
	return strDescr[mt];
}

ClientModContextInfo::ClientModContextInfo(const ModType mt, const std::string & strPath) : ModContextInfo(mt), m_strPath(strPath) {
}
const std::string & ClientModContextInfo::getPath() const {
	return m_strPath;
}

