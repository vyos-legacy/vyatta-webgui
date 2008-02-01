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
 *  Module:       common_session_status_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulation of information related to session information.
 *
 */

#include "common_session_status_info.hh"

CommonSessionStatusInfo::~CommonSessionStatusInfo() {
}
CommonSessionStatusInfo::CommonSessionStatusInfo() : m_totalCycles(0), m_timeLastActivity(0), m_timeStart(0) {
}

bool CommonSessionStatusInfo::isExpired() const {
	return (getTotalTimeInactivity() > MAX_TIME_INACTIVITY);
}
bool CommonSessionStatusInfo::isIdleOrAbove() const {
	std::string strPhase = getPhase();
	if (strPhase == SESSION_PHASE_AUTHENTICATING || strPhase == SESSION_PHASE_INITIALIZING) return false;
	return true;
}
unsigned long CommonSessionStatusInfo::getTotalCycles() const {
	return m_totalCycles;
}
time_t CommonSessionStatusInfo::getTimeLastActivity() const {
	return m_timeLastActivity;
}
time_t CommonSessionStatusInfo::getTimeStart() const {
	return m_timeStart;
}
time_t CommonSessionStatusInfo::getTotalTimeInactivity() const {
	return getTimeNow().getTimeUEpoch() - m_timeLastActivity;
}


