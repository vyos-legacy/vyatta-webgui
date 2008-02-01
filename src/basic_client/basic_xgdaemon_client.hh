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
 *  Module:       basic_xgdaemon_client.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2007
 *  Description:  Base class encapsulating communication with the xgdaemon.
 *
 */

#ifndef __INCLUDE_BASIC_XGDAEMON_CLIENT_HH__
#define __INCLUDE_BASIC_XGDAEMON_CLIENT_HH__

#include "basic/xgdaemon_socket.hh"
#include "basic/xml_info.hh"

class BasicXGDaemonClient {
public:
	BasicXGDaemonClient();

	bool receiveResponse(std::string & strXMLResponse);
	bool receiveResponse(XmlInfo & xi, XmlParseStatus & status);

	bool sendRequest(const std::string & strXMLRequest);
	bool sendRequest(const std::string & strXMLRequest, const std::string & strHost, const int port);
	bool sendRequest(const XmlInfo & xiRequest);

private:
	XGDaemonClientSocket m_socket;

	bool connectInet();
	bool connectInet(const std::string & strHost, const int port);
};

#endif

