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
 *  Module:       client_session_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Client-side encapsulation of information related to user sessions.
 *
 */


#include "client_session_info.hh"

ClientSessionInfo::ClientSessionInfo() {
}

const ClientModsInfo & ClientSessionInfo::getConstClientModsInfo() const {
	return m_cmi;
}
const ClientSessionStatusInfo & ClientSessionInfo::getConstSessionStatus() const {
	return m_session_status;
}
const SessionId & ClientSessionInfo::getConstSessionId() const {
	return m_session_id;
}
const std::string & ClientSessionInfo::getUsername() const {
	return m_strUsername;
}

ClientModsInfo & ClientSessionInfo::getClientModsInfo() {
	return m_cmi;
}
ClientSessionStatusInfo & ClientSessionInfo::getSessionStatus() {
	return m_session_status;
}
SessionId & ClientSessionInfo::getSessionId() {
	return m_session_id;
}

void ClientSessionInfo::setUsername(const std::string & strUsername) {
	m_strUsername = strUsername;
}

