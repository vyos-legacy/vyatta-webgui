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
 *  Module:       client_time_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility for storing time on client-side.
 *
 */

#ifndef __INCLUDE_CLIENT_TIME_INFO_HH__
#define __INCLUDE_CLIENT_TIME_INFO_HH__

#include "common/time_info.hh"

class ClientTimeInfo : public TimeInfo {
public:
	ClientTimeInfo();

	void clear();

	void setAsc(const std::string & strAsc);
	void setAscHour24(const std::string & strAscHour24);
	void setAscMinute(const std::string & strAscMinute);

	void setTimeUEpoch(const time_t timeUEpoch);
	void setTimeZone(const std::string & strTimeZone);
};

#endif

