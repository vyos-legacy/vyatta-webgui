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
 *  Module:       xgdaemon_server_socket.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Code related to TCP/IP socket communication between xgdaemon server and clients
 *
 */
 
#include <iostream>
#include <errno.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <stdio.h>
#include <sys/un.h>
#include <sys/ioctl.h>
#include <unistd.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netdb.h>


#include "xgdaemon_server_socket.hh"


RemoteClientInfo::RemoteClientInfo(const int hSocket) : XGDaemonBasicSocket(hSocket) {
}
bool RemoteClientInfo::readChars(const int totalToRead, bool & flagReceivedTerminator) {
	flagReceivedTerminator = false;

	char ch;
	for (int i = 0; i < totalToRead; i++) {
		int totalRead = read(&ch, 1);
		if (totalRead == 0) break;

		if (ch == 0 || ch == XGDAEMON_SOCKET_CHAR_EOF) {
			flagReceivedTerminator = true;
			break;
		} else {
			m_strReceived += ch;
		}
	}
	return true;
}
const std::string & RemoteClientInfo::getStrReceived() const {
	return m_strReceived;
}


XGDaemonServerSocket::XGDaemonServerSocket() {
}
bool XGDaemonServerSocket::listenInet() {
	sockaddr_in address;
	address.sin_family = AF_INET;
	address.sin_port = htons(XGDAEMON_SOCKET_PORT);
	address.sin_addr.s_addr = inet_addr(XGDAEMON_SOCKET_IP_127_0_0_1);
//	address.sin_addr.s_addr = htonl(INADDR_ANY);

	int server_len = sizeof(address);
	int codeBind = bind(m_hSocket, (struct sockaddr *) & address, server_len);
	if (codeBind < 0) {
		perror("bind");
		return false;
	}

	int codeListen = listen(m_hSocket, XGDAEMON_SOCKET_QUEUE);
	if (codeListen < 0) {
		perror("listen");
		return false;
	}

	FD_ZERO(&m_Read);
	FD_SET(m_hSocket, &m_Read);

	return true;
}
bool XGDaemonServerSocket::receiveRequest(RemoteClientInfo * & p_clientWithRequest) {
	fd_set testfds;

	struct timeval timeoutForSelect;
	timeoutForSelect.tv_sec = 0;
	timeoutForSelect.tv_usec = SELECT_TIMEOUT_USEC;

	testfds = m_Read;

	for (;;) {
		int result = select(FD_SETSIZE, &testfds, (fd_set *) 0, (fd_set *) 0, (struct timeval *) &timeoutForSelect);
		if (result < 0) {
			if (errno == EINTR) {
				usleep(XGDAEMON_SOCKET_SELECT_TIMEOUT_USEC);
				continue;
			} else {
				return false;
			}
		}
		break;
	}

	for (int fd = 0; fd < FD_SETSIZE; fd++) {
		if (FD_ISSET(fd, &testfds)) {
			if (fd == m_hSocket) {
				sockaddr_in client_address;
				socklen_t client_len = 0;
				int client_sockfd = accept(m_hSocket, (struct sockaddr *) &client_address, &client_len);
				if (client_sockfd < 0) {
				} else {
					RemoteClientInfo * p_clientNew = new RemoteClientInfo(client_sockfd);
					if (p_clientNew == NULL) throw std::bad_alloc();
					m_mapIncomming[client_sockfd] = p_clientNew;
					FD_SET(client_sockfd, &m_Read);
				}
			} else {
				RemoteClientInfo * p_client = m_mapIncomming[fd];
				if (p_client == NULL) throw std::logic_error("Expected non-NULL pointer.");
				int nread;
				ioctl(fd, FIONREAD, &nread);

				if (nread == 0) {
					p_client->close();
					m_mapIncomming.erase(fd);
					delete p_client;
					FD_CLR(fd, &m_Read);
				} else {
					bool flagReceivedTerminator = false;
					p_client->readChars(nread, flagReceivedTerminator);
					if (flagReceivedTerminator == true) {
						p_clientWithRequest = p_client;
						return true;
					}
				}
			}
		}
	}
	return true;
}
bool XGDaemonServerSocket::sendResponse(RemoteClientInfo & client, const std::string & strResponse) const {
	if (client.sendString(strResponse) == false) return false;
	if (client.sendChar(XGDAEMON_SOCKET_CHAR_EOF) == false) return false;
	return true;
}

