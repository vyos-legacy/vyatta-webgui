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
 *  Module:       basic_xgdaemon_client.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2007
 *  Description:  Base class encapsulating communication with the xgdaemon.
 *
 */

#include "basic_xgdaemon_client.hh"

BasicXGDaemonClient::BasicXGDaemonClient() {
}
bool BasicXGDaemonClient::connectInet() {
	if (m_socket.initializeInet() == false) return false; 
	if (m_socket.connectToServerInet() == false) return false;
	return true;
}
bool BasicXGDaemonClient::connectInet(const std::string & strHost, const int port) {
	if (m_socket.initializeInet() == false) return false; 
	if (m_socket.connectToServerInet(strHost, port) == false) return false;
	return true;
}
bool BasicXGDaemonClient::receiveResponse(std::string & strXMLResponse) {
	return m_socket.receiveResponse(strXMLResponse);
}
bool BasicXGDaemonClient::receiveResponse(XmlInfo & xi, XmlParseStatus & status) {
	xi.clear();
	std::string strXMLResponse;
	if (receiveResponse(strXMLResponse) == false) return false;
	if (XmlParser::parse(strXMLResponse, xi, status) == false) return false;
	return true;
}
bool BasicXGDaemonClient::sendRequest(const std::string & strXMLRequest) {
	if (connectInet() == false) return false;
	return m_socket.sendRequest(strXMLRequest);
}
bool BasicXGDaemonClient::sendRequest(const std::string & strXMLRequest, const std::string & strHost, const int port) {
	if (connectInet(strHost, port) == false) return false;
	return m_socket.sendRequest(strXMLRequest);
}
bool BasicXGDaemonClient::sendRequest(const XmlInfo & xiRequest) {
	std::string strXMLRequest;
	xiRequest.generateXML(strXMLRequest, true, 0);
	return sendRequest(strXMLRequest);
}

