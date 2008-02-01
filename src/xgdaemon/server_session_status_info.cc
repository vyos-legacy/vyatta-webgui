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
 *  Module:       server_session_status_info.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code for server-side encapsulation of user session information.
 *
 */

#include <stdexcept>

#include "server_session_status_info.hh"

#include "xgdaemon_xorp_link.hh"

ServerSessionStatusInfo::ServerSessionStatusInfo(const XorpShellBase::Mode mode, const XGDaemonXorpLink * p_xlink) : m_cti(p_xlink->getConstCommitStatus()), m_mode(mode), m_p_xlink(p_xlink) {
	if (m_p_xlink == NULL) throw std::logic_error("Expected non-NULL pointer.");
	updateTimeLastActivity();

	m_timeStart = m_sti.getTimeUEpoch();
}

bool ServerSessionStatusInfo::getFlagCanCommit() const {
	if (m_p_xlink == NULL) {
		throw std::logic_error("Expected non-NULL pointer.");
	} else {
		return m_p_xlink->determineIfCanCommit();
	}
}
bool ServerSessionStatusInfo::getFlagConfigChanged() const {
	if (m_p_xlink == NULL) {
		throw std::logic_error("Expected non-NULL pointer.");
	} else {
		return m_p_xlink->determineIfConfigChanged();
	}
}
bool ServerSessionStatusInfo::getFlagConfigInvalid() const {
	if (m_p_xlink == NULL) {
		throw std::logic_error("Expected non-NULL pointer.");
	} else {
		return m_p_xlink->determineIfConfigInvalid();
	}
}
bool ServerSessionStatusInfo::getFlagInvalidState() const {
	if (m_p_xlink == NULL) {
		throw std::logic_error("Expected non-NULL pointer.");
	} else {
		return m_p_xlink->isError();
	}
}
unsigned long ServerSessionStatusInfo::getTotalConfigChanges() const {
	if (m_p_xlink == NULL) {
		throw std::logic_error("Expected non-NULL pointer.");
	} else {
		return m_p_xlink->getTotalConfigChanges();
	}	
}
void ServerSessionStatusInfo::incrementTotalCycles() {
	m_totalCycles++;
}
void ServerSessionStatusInfo::setMode(XorpShellBase::Mode mode) {
	m_mode = mode;
}
void ServerSessionStatusInfo::updateTimeLastActivity() {
	m_sti.determineLocalTime();
	m_timeLastActivity = m_sti.getTimeUEpoch();
}
XGDaemonCurrentTaskInfo & ServerSessionStatusInfo::getCurrentTaskInfo() {
	return m_cti;
}
std::string ServerSessionStatusInfo::getPhase() const {
	switch (m_mode) {
	case XorpShellBase::MODE_AUTHENTICATING:
		return SESSION_PHASE_AUTHENTICATING;
	case XorpShellBase::MODE_INITIALIZING:
		return SESSION_PHASE_INITIALIZING;
	case XorpShellBase::MODE_IDLE:
		return SESSION_PHASE_IDLE;
	case XorpShellBase::MODE_COMMITTING:
		return SESSION_PHASE_COMMITTING;
	case XorpShellBase::MODE_LOADING:
		return SESSION_PHASE_LOADING;
	case XorpShellBase::MODE_SAVING:
		return SESSION_PHASE_SAVING;
	case XorpShellBase::MODE_SHUTDOWN:
		return SESSION_PHASE_SHUTDOWN;
	}
	return SESSION_PHASE_UNKNOWN;
}
const XGDaemonCurrentTaskInfo & ServerSessionStatusInfo::getConstCurrentTaskInfo() const {
	return m_cti;
}
const TimeInfo & ServerSessionStatusInfo::getTimeNow() const {
	m_sti.determineLocalTime();
	return m_sti;
}
const XorpShellBase::Mode & ServerSessionStatusInfo::getMode() const {
	return m_mode;
}

