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
 *  Module:       xgdaemon_socket.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Code related to TCP/IP socket communication between xgdaemon and clients
 *
 */


#include <iostream>
#include <errno.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <stdio.h>
#include <sys/un.h>
#include <sys/ioctl.h>
#include <arpa/inet.h>
#include <netdb.h>

#include "xgdaemon_socket.hh"


XGDaemonBasicSocket::~XGDaemonBasicSocket() {
	if (m_hSocket >= 0) close();
}
XGDaemonBasicSocket::XGDaemonBasicSocket() : m_hSocket(-1) {
}
XGDaemonBasicSocket::XGDaemonBasicSocket(const int hSocket) : m_hSocket(hSocket) {
}
bool XGDaemonBasicSocket::close() {
	int codeClose = ::close(m_hSocket);
	if (codeClose >= 0) {
		m_hSocket = -1;
		return true;
	} else {
		return false;
	}
}
bool XGDaemonBasicSocket::sendChar(const char c) const {
	return (write(m_hSocket, &c, 1) == 1);
}
bool XGDaemonBasicSocket::sendString(const std::string & strSend) const {
	const char * str = strSend.c_str();
	int len = strSend.length();
	for (int totalSent = 0; totalSent < len;) {
		int totalToWrite = 1024;
		if (totalSent + totalToWrite > len) totalToWrite = len - totalSent;
		int totalWritten = write(m_hSocket, &str[totalSent], totalToWrite);

		if (totalWritten != totalToWrite) return false;
		totalSent += totalWritten;
	}
	return true;
}
int XGDaemonBasicSocket::read(char * str, const int totalToRead) {
	return ::read(m_hSocket, str, totalToRead);
}


XGDaemonClientSocket::XGDaemonClientSocket() {
}
bool XGDaemonClientSocket::connectToServerInet() {
	return connectToServerInet(XGDAEMON_SOCKET_IP_127_0_0_1, XGDAEMON_SOCKET_PORT);
}

bool XGDaemonClientSocket::connectToServerInet(const std::string & strServerIP, const int port) {
	sockaddr_in address;
	address.sin_family = AF_INET;
	address.sin_port = htons(port);
	address.sin_addr.s_addr = inet_addr(strServerIP.c_str());
	int len = sizeof(address);

	int result = connect(m_hSocket, (struct sockaddr *) & address, len);
	return (result >= 0);
}

bool XGDaemonClientSocket::connectToServerUnix() {
	sockaddr_un address;
	address.sun_family = AF_UNIX;
	strcpy(address.sun_path, XGDAEMON_SOCKET_PATH);
	int len = sizeof(address);

	int result = connect(m_hSocket, (struct sockaddr *) & address, len);
	return (result >= 0);
}
bool XGDaemonClientSocket::receiveResponse(std::string & strResponse) {
	strResponse.clear();
	
	if (m_hSocket == -1) return false;

	fd_set readfds, testfds;

	FD_ZERO(&readfds);
	FD_SET(m_hSocket, &readfds);

	while (1) {
		bool flagDone = false;

		testfds = readfds;

		int result = select(FD_SETSIZE, &testfds, (fd_set*)0, (fd_set*)0, (timeval*)&m_timeout);
		if (result < 0) {
			if (errno != EINTR) return false;
		} else {
			if (FD_ISSET(m_hSocket, &testfds)) {
				int nread = 0;
				ioctl(m_hSocket, FIONREAD, &nread);
				if (nread == 0) {
					FD_CLR(m_hSocket, &readfds);
					flagDone = true;
				}

				if (flagDone == false) {
					char ch;
					for (int i = 0; i < nread; i++) {
						int totalRead = read(&ch, 1);
						if (totalRead == 0 || ch == XGDAEMON_SOCKET_CHAR_EOF) {
							flagDone = true;
							break;
						}
						strResponse += ch;
					}
				}
			}
		}

		if (flagDone == true) break;

		usleep(XGDAEMON_SOCKET_SELECT_TIMEOUT_USEC);
	}
	return true;
}
bool XGDaemonClientSocket::sendRequest(const std::string & strRequest) const {
	if (sendString(strRequest) == false) return false;
	if (sendChar(0) == false) return false;
//	if (sendChar(XGDAEMON_SOCKET_CHAR_EOF) == false) return false;
	return true;
}

XGDaemonSocket::XGDaemonSocket() {
	m_timeout.tv_sec   = XGDAEMON_SOCKET_TIMEOUT_SEC;
	m_timeout.tv_usec  = XGDAEMON_SOCKET_TIMEOUT_USEC;
}
bool XGDaemonSocket::initializeInet() {
	m_hSocket = socket(AF_INET, SOCK_STREAM, 0);
	if (m_hSocket < 0) return false;

	return setOptions();
}
bool XGDaemonSocket::initializeUnix() {
	m_hSocket = socket(AF_UNIX, SOCK_STREAM, 0);
	if (m_hSocket < 0) return false;

	return setOptions();
}
bool XGDaemonSocket::setOptions() {
	int one = 1;
	int codeSetSockOpt = setsockopt(m_hSocket, SOL_SOCKET, SO_REUSEADDR, &one, sizeof(one));
	if (codeSetSockOpt < 0) return false;

	codeSetSockOpt = setsockopt(m_hSocket, SOL_SOCKET, SO_RCVTIMEO, &m_timeout, sizeof(m_timeout));
	if (codeSetSockOpt < 0) return false;

	codeSetSockOpt = setsockopt(m_hSocket, SOL_SOCKET, SO_SNDTIMEO, &m_timeout, sizeof(m_timeout));
	if (codeSetSockOpt < 0) return false;

	return true;
}


bool XGDaemonSocketUtil::resolveHostname(const std::string & hostname, std::string & hostaddr) {

	struct hostent * hp = gethostbyname(hostname.c_str());

	if (hp == NULL) return false;

	char** p = hp->h_addr_list;
	struct in_addr in;
	(void) memcpy(&in.s_addr, *p, sizeof (in.s_addr));
	char* addr_str = inet_ntoa(in);
	hostaddr = addr_str;

	return true;
}

