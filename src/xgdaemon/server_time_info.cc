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
 *  Module:       server_time_info.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code for server-side encapsulation of system time information.
 *
 */


#include "server_time_info.hh"

#define BUFLENGTH       80

static char * strBuffer = new char[BUFLENGTH];

ServerTimeInfo::ServerTimeInfo() {
}

void ServerTimeInfo::determineGMTime() {
	tzset();
	time(&m_timeUEpoch);
	gmtime_r(&m_timeUEpoch, &m_tm);
	setFields();
}
void ServerTimeInfo::determineLocalTime() {
	tzset();
	time(&m_timeUEpoch);
	localtime_r(&m_timeUEpoch, &m_tm);
	setFields();
}
void ServerTimeInfo::setFields() {
	strftime(strBuffer, BUFLENGTH, "%Y-%m-%d %I:%M:%S %p", &m_tm);
	m_strAsc = strBuffer;

	strftime(strBuffer, BUFLENGTH, "%H", &m_tm);
	m_strAscHour24 = strBuffer;

	strftime(strBuffer, BUFLENGTH, "%M", &m_tm);
	m_strAscMinute = strBuffer;

	strftime(strBuffer, BUFLENGTH, "%Z", &m_tm);
	m_strTimeZone = strBuffer;
}

