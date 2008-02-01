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



#ifndef	__INCLUDE_CLIENT_SESSION_INFO__
#define	__INCLUDE_CLIENT_SESSION_INFO__

#include "client_mod_info.hh"
#include "client_session_status_info.hh"
#include "common/session_id.hh"

class ClientSessionInfo {
public:
	ClientSessionInfo();

	const ClientModsInfo & getConstClientModsInfo() const;
	const ClientSessionStatusInfo & getConstSessionStatus() const;
	const SessionId & getConstSessionId() const;
	const std::string & getUsername() const;

	ClientModsInfo & getClientModsInfo();
	ClientSessionStatusInfo & getSessionStatus();
	SessionId & getSessionId();

	void setUsername(const std::string & strUsername);

private:
	ClientModsInfo			m_cmi;
	ClientSessionStatusInfo		m_session_status;
	SessionId			m_session_id;
	std::string                     m_strUsername;
};

#endif

