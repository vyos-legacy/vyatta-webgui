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
 *  Module:       stat_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  This class encapsulates various cpu utilization counters used to output statistics.
 *
 */


#ifndef __INCLUDE_STAT_INFO__
#define __INCLUDE_STAT_INFO__

#include <vector>


class CPUStatInfo {
public:
	virtual ~CPUStatInfo();
	CPUStatInfo();

	virtual long long getDeltaUse() const = 0;
	virtual long long getDeltaNic() const = 0;
	virtual long long getDeltaSys() const = 0;
	virtual long long getDeltaIdl() const = 0;
	virtual long long getDeltaIow() const = 0;
	virtual long long getDeltaXxx() const = 0;
	virtual long long getDeltaYyy() const = 0;

protected:
};

class StatInfo {
public:
	virtual ~StatInfo();
	StatInfo();

	const std::vector<CPUStatInfo*> & getCPUs() const;

protected:
	std::vector<CPUStatInfo*> m_vectorCPUs;
};

#endif

