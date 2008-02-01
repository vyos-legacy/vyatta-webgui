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
 *  Module:       time_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility for storing time.
 *
 */


#ifndef __INCLUDE_TIME_INFO_HH__
#define __INCLUDE_TIME_INFO_HH__

#include <time.h>
#include <string>

class TimeInfo {
public:
	TimeInfo();
	virtual ~TimeInfo();

	const time_t getTimeUEpoch() const;

	const std::string & getAsc() const;
	const std::string & getAscHour24() const;
	const std::string & getAscMinute() const;
	const std::string & getTimeZone() const;

protected:

	time_t       m_timeUEpoch;

	std::string  m_strAsc;
	std::string  m_strAscHour24;
	std::string  m_strAscMinute;
	std::string  m_strTimeZone;
};

#endif

