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
 *  Module:       xgdaemon_socket.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Code related to TCP/IP socket communication between xgdaemon and clients
 *
 */


#ifndef __INCLUDE_XGDAEMON_SOCKET__
#define __INCLUDE_XGDAEMON_SOCKET__

#include <map>
#include <stdexcept>
#include <string>

#define XGDAEMON_SOCKET_CHAR_EOF		0x04
//#define XGDAEMON_SOCKET_PATH			"/tmp/xgdaemon_socket"
#define XGDAEMON_SOCKET_PATH			"/var/www/cgi-bin/xgdaemon_socket"
#define XGDAEMON_SOCKET_IP_127_0_0_1		"127.0.0.1"
#define XGDAEMON_SOCKET_PORT			34281
#define XGDAEMON_SOCKET_QUEUE			5
#define XGDAEMON_SOCKET_TIMEOUT_SEC		5
#define XGDAEMON_SOCKET_TIMEOUT_USEC		500
#define XGDAEMON_SOCKET_SELECT_TIMEOUT_USEC	100000


class XGDaemonBasicSocket {
public:
	~XGDaemonBasicSocket();
	XGDaemonBasicSocket();
	XGDaemonBasicSocket(const int hSocket);
	bool close();
	bool sendChar(const char c) const;
	bool sendString(const std::string & strSend) const;
	int read(char * str, const int totalToRead);

protected:
	int m_hSocket;
};

class XGDaemonSocket : public XGDaemonBasicSocket {
public:
	XGDaemonSocket();

	bool initializeInet();
	bool initializeUnix();
	bool setOptions();
protected:
	timeval m_timeout;
};

class XGDaemonClientSocket : public XGDaemonSocket {
public:
	XGDaemonClientSocket();
	bool connectToServerInet();
	bool connectToServerInet(const std::string &  strServerIP, const int port);
	bool connectToServerUnix();
	bool receiveResponse(std::string & strResponse);
	bool sendRequest(const std::string & strRequest) const;
};

class XGDaemonSocketUtil {
public:
	static bool resolveHostname(const std::string & hostname, std::string & hostaddr);
};

#endif

