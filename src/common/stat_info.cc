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
 *  Module:       stat_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  This class encapsulates various cpu utilization counters used to output statistics.
 *
 */

#include "stat_info.hh"

CPUStatInfo::~CPUStatInfo() {
}
CPUStatInfo::CPUStatInfo() {
}

StatInfo::~StatInfo() {
	std::vector<CPUStatInfo*>::iterator i = m_vectorCPUs.begin();
	const std::vector<CPUStatInfo*>::const_iterator iEnd = m_vectorCPUs.end();
	while (i != iEnd) {
		CPUStatInfo * p_cpu = *i;
		if (p_cpu != NULL) delete p_cpu;
		i++;
	}
}
StatInfo::StatInfo() {
}
const std::vector<CPUStatInfo*> & StatInfo::getCPUs() const {
	return m_vectorCPUs;
}

