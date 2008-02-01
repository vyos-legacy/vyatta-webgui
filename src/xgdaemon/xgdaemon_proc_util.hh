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
 *  Module:       xgdaemon_proc_util.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility code for reading information from /proc
 *
 */


#ifndef __INCLUDE_XGDAEMON_PROC_UTIL__
#define	__INCLUDE_XGDAEMON_PROC_UTIL__

#include "../common/textparse/text_parse_util.hh"

#define	PROC_NET_DEV	"/proc/net/dev"
#define	PROC_STAT	"/proc/stat"
#define	PROC_UPTIME	"/proc/uptime"

class XGDaemonProcUtil {
public:
	static bool readProcNetDev(ANTokenizedStrings & ants);
	static bool readProcNetDev(std::string & strContents);

	static bool readProcStat(ANTokenizedStrings & ants);
	static bool readProcStat(std::string & strContents);

	static bool readProcUptime(ANTokenizedStrings & ants);
	static bool readProcUptime(std::string & strContents);

};


#endif

