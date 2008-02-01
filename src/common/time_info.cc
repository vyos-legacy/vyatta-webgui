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
 *  Module:       time_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility for storing time.
 *
 */


#include "time_info.hh"

TimeInfo::TimeInfo() : m_timeUEpoch(0) {
}
TimeInfo::~TimeInfo() {
}
const time_t TimeInfo::getTimeUEpoch() const {
	return m_timeUEpoch;
}
const std::string & TimeInfo::getAsc() const {
	return m_strAsc;
}
const std::string & TimeInfo::getAscHour24() const {
	return m_strAscHour24;
}
const std::string & TimeInfo::getAscMinute() const {
	return m_strAscMinute;
}

const std::string & TimeInfo::getTimeZone() const {
	return m_strTimeZone;
}

