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
 *  Module:       system_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulation of data related to the system.
 *
 */


#ifndef	__INCLUDE_SYSTEM_INFO_HH__
#define	__INCLUDE_SYSTEM_INFO_HH__

#include "net_data_info.hh"
#include "time_info.hh"


class SystemInfo {
public:
	SystemInfo();
	virtual ~SystemInfo();

	virtual const NetDataInfo & getConstNDI() const = 0;
	virtual const TimeInfo & getConstTimeGMT() const = 0;
	virtual const TimeInfo & getConstTimeLocal() const = 0;

	virtual NetDataInfo & getNDI() = 0;
	virtual TimeInfo & getTimeGMT() = 0;
	virtual TimeInfo & getTimeLocal() = 0;

	unsigned long getUptimeIdle() const;
	unsigned long getUptimeTotal() const;	

protected:
	unsigned long m_uptimeIdle;
	unsigned long m_uptimeTotal;
};

#endif

