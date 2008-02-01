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
 *  Module:       client_exec_status_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Encapsulation of operational command execution status on the client-side
 *
 */


#include "client_exec_status_info.hh"

ClientBriefExecStatusInfo::ClientBriefExecStatusInfo() {
}

const unsigned long ClientBriefExecStatusInfo::getTotalLines() const {
	return m_totalLines;
}
const TimeInfo & ClientBriefExecStatusInfo::getConstTimeStart() const {
	return m_tiStart;
}
const TimeInfo & ClientBriefExecStatusInfo::getConstTimeEnd() const {
	return m_tiEnd;
}
const std::string & ClientBriefExecStatusInfo::getCachedCommandLine() const {
	return m_strCachedCommandLine;
}
void ClientBriefExecStatusInfo::setCachedCommandLine(const std::string & strCachedCommandLine) {
	m_strCachedCommandLine = strCachedCommandLine;
}
void ClientBriefExecStatusInfo::setFlagKillInvoked(bool flagKillInvoked) {
	m_flagKillInvoked = flagKillInvoked;
}
void ClientBriefExecStatusInfo::setTotalLines(const unsigned long totalLines) {
	m_totalLines = totalLines;
}
TimeInfo & ClientBriefExecStatusInfo::getTimeStart() {
	return m_tiStart;
}
TimeInfo & ClientBriefExecStatusInfo::getTimeEnd() {
	return m_tiEnd;
}

