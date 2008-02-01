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
 *  Module:       xgdaemon_server_socket.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Code related to TCP/IP socket communication between xgdaemon server and clients
 *
 */
 
 
#ifndef __INCLUDE_XGDAEMON_SERVER_SOCKET__
#define __INCLUDE_XGDAEMON_SERVER_SOCKET__

 
#include "basic/xgdaemon_socket.hh"

#define SELECT_TIMEOUT_USEC	200000

class RemoteClientInfo : public XGDaemonBasicSocket {
public:
	RemoteClientInfo(const int hSocket);
	bool readChars(const int totalToRead, bool & flagReceivedTerminator);
	const std::string & getStrReceived() const;

private:
	std::string          m_strReceived;
};

class XGDaemonServerSocket : public XGDaemonSocket {
public:
	XGDaemonServerSocket();

	bool listenInet();
	bool receiveRequest(RemoteClientInfo * & p_clientWithRequest);
	bool sendResponse(RemoteClientInfo & client, const std::string & strResponse) const;

private:
	fd_set                                                m_Read;
	std::map<int, RemoteClientInfo*, std::greater<int> >  m_mapIncomming;
};

#endif

