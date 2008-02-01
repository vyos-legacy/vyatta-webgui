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
 *  Module:       session_id.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for session id information
 *
 */


#include <string.h>
#include <uuid/uuid.h>

#include "session_id.hh"

SessionId::SessionId() {
	clear();
}
SessionId::SessionId(const char * strSessionID) {
	clear();
	setSessionID(strSessionID);
}
bool SessionId::doesMatch(const std::string & strSessionID) const {
	return (strcmp(m_strSessionID, strSessionID.c_str()) == 0);
}
bool SessionId::doesMatch(const SessionId & si) const {
	return (strcmp(m_strSessionID, si.m_strSessionID) == 0);
}
bool SessionId::isSet() const {
	return (m_strSessionID[0] != 0);
}
const char * SessionId::getStr() const {
	return m_strSessionID;
}

void SessionId::clear() {
	for (unsigned int i = 0; i < sizeof(m_strSessionID); i++) m_strSessionID[i] = 0;
}
void SessionId::createUniqueID() {
	uuid_t uu;
	uuid_generate(uu);
	uuid_unparse(uu, m_strSessionID);
}

void SessionId::setSessionID(const char * strSessionID) {
	for (int i = 0; i < SESSION_ID_SIZE; i++) {
		char c = strSessionID[i];
		m_strSessionID[i] = c;

		if (c == 0) break;
	}
	m_strSessionID[SESSION_ID_SIZE-1] = 0;
}
void SessionId::setTo(const SessionId & si) {
	setSessionID(si.m_strSessionID);
}


