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
 *  Module:       client_session_status_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Client-side encapsulation of information related to user sessions.
 *
 */



#include "client_session_status_info.hh"

ClientSessionStatusInfo::ClientSessionStatusInfo() : m_flagCanCommit(false), m_flagConfigChanged(false), m_flagConfigInvalid(false), m_flagInvalidState(false) {
}

bool ClientSessionStatusInfo::getFlagCanCommit() const {
	return m_flagCanCommit;
}
bool ClientSessionStatusInfo::getFlagConfigChanged() const {
	return m_flagConfigChanged;
}
bool ClientSessionStatusInfo::getFlagConfigInvalid() const {
	return m_flagConfigInvalid;
}
bool ClientSessionStatusInfo::getFlagInvalidState() const {
	return m_flagInvalidState;
}
unsigned long ClientSessionStatusInfo::getTotalConfigChanges() const {
	return m_totalConfigChanges;
}
void ClientSessionStatusInfo::setFlagCanCommit(bool flagCanCommit) {
	m_flagCanCommit = flagCanCommit;
}
void ClientSessionStatusInfo::setFlagConfigChanged(bool flagConfigChanged) {
	m_flagConfigChanged = flagConfigChanged;
}
void ClientSessionStatusInfo::setFlagConfigInvalid(bool flagConfigInvalid) {
	m_flagConfigInvalid = flagConfigInvalid;
}
void ClientSessionStatusInfo::setFlagInvalidState(bool flagInvalidState) {
	m_flagInvalidState = flagInvalidState;
}
void ClientSessionStatusInfo::setPhase(const std::string & strPhase) {
	m_strPhase = strPhase;
}
void ClientSessionStatusInfo::setTimeLastActivity(const time_t timeLastActivity) {
	m_timeLastActivity = timeLastActivity;
}
/*
void ClientSessionStatusInfo::setTimeNow(const TimeInfo & timeNow) {
	m_timeNow = timeNow;
}
*/
void ClientSessionStatusInfo::setTimeStart(const time_t timeStart) {
	m_timeStart = timeStart;
}
void ClientSessionStatusInfo::setTotalConfigChanges(const unsigned long totalConfigChanges) {
	m_totalConfigChanges = totalConfigChanges;
}
void ClientSessionStatusInfo::setTotalCycles(const unsigned long totalCycles) {
	m_totalCycles = totalCycles; 
}
ClientCurrentTaskInfo & ClientSessionStatusInfo::getCurrentTask() {
	return m_ccti;
}
ClientTimeInfo & ClientSessionStatusInfo::getClientTimeInfo() {
	return m_timeNow;
}
std::string ClientSessionStatusInfo::getPhase() const {
	return m_strPhase;
}
const ClientCurrentTaskInfo & ClientSessionStatusInfo::getConstCurrentTask() const {
	return m_ccti;
}
const TimeInfo & ClientSessionStatusInfo::getTimeNow() const {
	return m_timeNow;
}

