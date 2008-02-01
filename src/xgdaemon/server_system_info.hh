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
 *  Module:       server_system_info.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code for server-side encapsulation of system information.
 *
 */


#ifndef	__INCLUDE_SERVER_SYSTEM_INFO__
#define	__INCLUDE_SERVER_SYSTEM_INFO__

#include "server_net_data_info.hh"
#include "server_stat_info.hh"
#include "server_time_info.hh"
#include "common/system_info.hh"

#define	PROC_UPTIME_COLS	2
#define	PROC_UPTIME_COL_TOTAL	0
#define	PROC_UPTIME_COL_IDLE	1
#define	PROC_UPTIME_LINES	1

class ServerSystemInfo : public SystemInfo {
public:	
	const NetDataInfo & getConstNDI() const;
	const ServerStatInfo & getConstSSI() const;
	const TimeInfo & getConstTimeGMT() const;
	const TimeInfo & getConstTimeLocal() const;

	NetDataInfo & getNDI();
	ServerNetDataInfo & getSNDI();
	ServerStatInfo & getSSI();
	TimeInfo & getTimeGMT();
	TimeInfo & getTimeLocal();


	bool readProc();
	void determineTime();


protected:
	ServerNetDataInfo  m_sndi;
	ServerStatInfo     m_ssi;
	ServerTimeInfo     m_stiGMT;
	ServerTimeInfo     m_stiLocal;
};

#endif

