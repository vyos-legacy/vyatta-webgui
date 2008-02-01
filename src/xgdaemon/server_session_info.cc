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
 *  Module:       server_session_info.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code for server-side encapsulation of user sessions.
 *
 */

#include <iostream>
#include <stdexcept>

#include "xgdaemon_module.hh"
#include "libxorp/callback.hh"

#include "server_session_info.hh"
#include "xgdaemon_xorp_util.hh"

#include "basic/xgdaemon_util.hh"
#include "common/textparse/text_parse_util.hh"


ServerSessionInfo::~ServerSessionInfo() {
	killExecutions();
}
ServerSessionInfo::ServerSessionInfo(InterSessionInfo & isi, uid_t uid, const std::string & strUsername)
	:
	m_flagClosed(false),
	m_totalCommands(0),
	m_strUsername(strUsername),
	m_xlink(isi, uid)
	{
}

bool ServerSessionInfo::isActive() const {
	if (m_id.isSet() == false) return false;
	if (m_flagClosed) return false;
	if (isExpired()) return false;
	return true;
}
bool ServerSessionInfo::isClosed() const {
	return m_flagClosed;
}
bool ServerSessionInfo::isExpired() const {
	return m_xlink.getConstSessionStatusInfo().isExpired();
}
int ServerSessionInfo::getTotalExecutions() const {
	return m_vectorCommands.size();
}
unsigned long ServerSessionInfo::getExecId(int index) const {
	XorpExecStatusInfo * p_xesi = m_vectorCommands[index];
	if (p_xesi == NULL) {
		return EXEC_ID_NONE;
	} else {
		return p_xesi->getId();
	}
}
void ServerSessionInfo::killExecutions() {
	std::vector<XorpExecStatusInfo*>::iterator i = m_vectorCommands.begin();
	std::vector<XorpExecStatusInfo*>::iterator iEnd = m_vectorCommands.end();
	while (i != iEnd) {
		XorpExecStatusInfo * p_xesi = *i;
		if (p_xesi != NULL && !p_xesi->getFlagDone()) p_xesi->killExecution();
		i++;
	}
}
void ServerSessionInfo::killExecutionsIfExpired() {
	if (isExpired()) killExecutions();
}
void ServerSessionInfo::setClosed(bool flagClosed) {
	m_flagClosed = flagClosed;
	if (m_flagClosed) killExecutions(); else m_xlink.getSessionStatusInfo().updateTimeLastActivity();
}
const BriefExecStatusInfo & ServerSessionInfo::getBrief(int index) const {
	XorpExecStatusInfo * p_xesi = m_vectorCommands[index];
	return *p_xesi;
}
const SessionId & ServerSessionInfo::getConstSessionId() const {
	return m_id;
}
const XGDaemonXorpLink & ServerSessionInfo::getConstXLink() const {
	return m_xlink;
}
const XorpShellBase::Mode & ServerSessionInfo::getSessionMode() const {
	return m_xlink.getConstSessionStatusInfo().getMode();
}
const std::string & ServerSessionInfo::getUsername() const {
	return m_strUsername;
}
SessionId & ServerSessionInfo::getSessionId() {
	return m_id;
}
XGDaemonXorpLink & ServerSessionInfo::getXLink() {
	return m_xlink;
}
XorpExecStatusInfo * ServerSessionInfo::execute(ExecutableXorpOpCmd * p_exoc, EventLoop& eventloop) {
	if (m_totalCommands == 0) ++m_totalCommands;

	XorpExecStatusInfo * p_xesi = new XorpExecStatusInfo(m_totalCommands, p_exoc);
	if (p_xesi == NULL) return NULL;

	++m_totalCommands;

	if (p_xesi->execute(eventloop) == NULL) {
		delete p_xesi;
		return NULL;
	} else {
		m_vectorCommands.push_back(p_xesi);
		return p_xesi;
	}
}
XorpExecStatusInfo * ServerSessionInfo::getCommandProcessing(unsigned long idExec) {
	return const_cast<XorpExecStatusInfo*>(getConstCommandProcessing(idExec));
}

const XorpExecStatusInfo * ServerSessionInfo::getConstCommandProcessing(unsigned long idExec) const {
	std::vector<XorpExecStatusInfo*>::const_iterator i = m_vectorCommands.begin();
	const std::vector<XorpExecStatusInfo*>::const_iterator iEnd = m_vectorCommands.end();
	while (i != iEnd) {
		const XorpExecStatusInfo * p_xesi = *i;
		if (p_xesi != NULL && p_xesi->getId() == idExec) {
			return p_xesi;
		}
		i++;
	}
	return NULL;
}

ServerSessions::~ServerSessions() {
	while (m_listSessions.size() > 0) {
		ServerSessionInfo * p_ssi = m_listSessions.front();
		if (p_ssi != NULL) {
			m_listSessions.pop_front();
			delete p_ssi;
		}
	}
}
ServerSessions::ServerSessions() {
}
bool ServerSessions::revert(ServerSessionInfo & ssi, std::string & strResponse) {
	return ssi.getXLink().revert(strResponse);
}
int ServerSessions::getTotal() {
	return m_listSessions.size();
}
void ServerSessions::killExecutionsOfExpired() {
	std::list<ServerSessionInfo*>::iterator i = m_listSessions.begin();
	const std::list<ServerSessionInfo*>::const_iterator iEnd = m_listSessions.end();
	while (i != iEnd) {
		ServerSessionInfo * p_ssi = *i;
		if (p_ssi != NULL) p_ssi->killExecutionsIfExpired();
		i++;
	}
}
ServerSessionInfo * ServerSessions::createNew(InterSessionInfo & isi, uid_t uid, const std::string & strUsername) {

	ServerSessionInfo * p_ssi = new ServerSessionInfo(isi, uid, strUsername);
	if (p_ssi == NULL) return NULL;

	std::string strResponse;
	if (p_ssi->getXLink().revert(strResponse) == false) {
		delete p_ssi;
		return NULL;
	}

	p_ssi->getSessionId().createUniqueID();
	m_listSessions.push_back(p_ssi);

	return p_ssi;
}
ServerSessionInfo * ServerSessions::findSession(const std::string & strSessionID) const {
	std::list<ServerSessionInfo*>::const_iterator i = m_listSessions.begin();
	std::list<ServerSessionInfo*>::const_iterator iEnd = m_listSessions.end();
	while (i != iEnd) {
		ServerSessionInfo * p_ssi = *i;
		if (p_ssi != NULL) {
			if (p_ssi->getSessionId().doesMatch(strSessionID)) return p_ssi;
		}
		i++;
	}
	return NULL;
}
ServerSessionInfo * ServerSessions::findSession(const uid_t uid) const {
	std::list<ServerSessionInfo*>::const_iterator i = m_listSessions.begin();
	std::list<ServerSessionInfo*>::const_iterator iEnd = m_listSessions.end();
	while (i != iEnd) {
		ServerSessionInfo * p_ssi = *i;
		if (p_ssi != NULL) {
			if (p_ssi->getConstXLink().getUid() == uid) return p_ssi;
		}
		i++;
	}
	return NULL;
}
std::list<ServerSessionInfo*>::iterator ServerSessions::begin() {
	return m_listSessions.begin();
}
std::list<ServerSessionInfo*>::iterator ServerSessions::end() {
	return m_listSessions.end();
}

XorpExecStatusInfo::~XorpExecStatusInfo() {
	if (m_p_exoc != NULL) {
		delete m_p_exoc;
		m_p_exoc = NULL;
	}
}
XorpExecStatusInfo::XorpExecStatusInfo(unsigned long id, ExecutableXorpOpCmd * p_exoc) : BriefExecStatusInfo(id), m_p_exoc(p_exoc), m_p_oi(NULL) {
}
const unsigned long XorpExecStatusInfo::getTotalLines() const {
	return TextParseUtil::getTotalLines(m_strOutput);
}

const TimeInfo & XorpExecStatusInfo::getConstTimeStart() const {
	return m_stiStart;
}
const TimeInfo & XorpExecStatusInfo::getConstTimeEnd() const {
	return m_stiEnd;
}
const ExecutableXorpOpCmd & XorpExecStatusInfo::getConstXorpOpCmd() const {
	return *m_p_exoc;
}
const std::string & XorpExecStatusInfo::getCachedCommandLine() const {
	if (m_p_exoc == NULL) throw std::logic_error("Expected NON-null.");
	return m_p_exoc->getCachedCommandLine();
}
const std::string & XorpExecStatusInfo::getOutputPre() const {
	return m_strOutputPre;
}
bool XorpExecStatusInfo::killExecution() {
	m_flagKillInvoked = true;
	if (m_p_oi == NULL) {
		return false;
	} else {
		m_p_oi->terminate_with_prejudice();
		return true;
	}
}
void XorpExecStatusInfo::callbackDone(bool flagSuccess, const std::string & strMsg) {
	m_stiEnd.determineLocalTime();
	m_flagDone = true;
	m_flagDoneSuccess = flagSuccess;
	m_strDoneMsg = strMsg;  
}
void XorpExecStatusInfo::callbackPrint(const std::string & strMsg) {
	m_strOutput += strMsg;
	m_strOutputPre += XGDaemonUtil::getStrEscapedPre(strMsg);
}
OpInstance * XorpExecStatusInfo::execute(EventLoop& eventloop) {
	if (m_p_exoc == NULL) throw std::logic_error("Expected NON-null.");
	m_p_oi = m_p_exoc->execute(eventloop, callback(this, &XorpExecStatusInfo::callbackPrint), callback(this, &XorpExecStatusInfo::callbackDone));
	if (m_p_oi != NULL) m_stiStart.determineLocalTime();
	return m_p_oi;
}

