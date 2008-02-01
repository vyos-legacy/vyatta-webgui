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
 *  Module:       client_time_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility for storing time on client-side.
 *
 */
 
#include "client_time_info.hh"
 
ClientTimeInfo::ClientTimeInfo() : TimeInfo() {
	 
}

void ClientTimeInfo::clear() {
	m_strAsc = "";
	m_strAscHour24 = "";
	m_strAscMinute = "";
	m_strTimeZone = "";

	m_timeUEpoch = 0;
}
void ClientTimeInfo::setAsc(const std::string & strAsc) {
	m_strAsc = strAsc;
}
void ClientTimeInfo::setAscHour24(const std::string & strAscHour24) {
	m_strAscHour24 = strAscHour24;
}
void ClientTimeInfo::setAscMinute(const std::string & strAscMinute) {
	m_strAscMinute = strAscMinute;
}

void ClientTimeInfo::setTimeUEpoch(const time_t timeUEpoch) {
	m_timeUEpoch = timeUEpoch;
}
void ClientTimeInfo::setTimeZone(const std::string & strTimeZone) {
	m_strTimeZone = strTimeZone;
}

