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
 *  Module:       server_stat_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  This server-side class encapsulates various cpu utilization counters used to output statistics.
 *
 */

#ifndef __INCLUDE_SERVER_STAT_INFO__
#define __INCLUDE_SERVER_STAT_INFO__

#define PROC_COLUMN_HEAD	0
#define PROC_COLUMN_USE		1
#define PROC_COLUMN_NIC		2
#define PROC_COLUMN_SYS		3
#define PROC_COLUMN_IDL		4
#define PROC_COLUMN_IOW		5
#define PROC_COLUMN_XXX		6
#define PROC_COLUMN_YYY		7


#include "common/stat_info.hh"

class ServerCPUStatInfo : public CPUStatInfo {
public:
	ServerCPUStatInfo();

	long long getDeltaUse() const;
	long long getDeltaNic() const;
	long long getDeltaSys() const;
	long long getDeltaIdl() const;
	long long getDeltaIow() const;
	long long getDeltaXxx() const;
	long long getDeltaYyy() const;

	void updateUse(long long use);
	void updateNic(long long nic);
	void updateSys(long long sys);
	void updateIdl(long long idl);
	void updateIow(long long iow);
	void updateXxx(long long xxx);
	void updateYyy(long long yyy);

protected:
	long long m_use;
	long long m_nic;
	long long m_sys;
	long long m_idl;
	long long m_iow;
	long long m_xxx;
	long long m_yyy;
	
	long long m_useOld;
	long long m_nicOld;
	long long m_sysOld;
	long long m_idlOld;
	long long m_iowOld;
	long long m_xxxOld;
	long long m_yyyOld;
};

class ServerStatInfo : public StatInfo {
public:
	bool readProc();

protected:
	
};

#endif

