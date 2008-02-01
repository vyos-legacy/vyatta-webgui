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
 *  Module:       xgdaemon_proc_util.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility code for reading information from /proc
 *
 */

#include "xgdaemon_proc_util.hh"

#include "basic/xgdaemon_util.hh"

bool XGDaemonProcUtil::readProcNetDev(ANTokenizedStrings & ants) {
	std::string strContents;
	if (readProcNetDev(strContents) == false) return false;
	ants.parse(strContents);
	return true;
}
bool XGDaemonProcUtil::readProcNetDev(std::string & strContents) {
	return XGDaemonUtil::retrFileContents(PROC_NET_DEV, strContents);
}

bool XGDaemonProcUtil::readProcStat(ANTokenizedStrings & ants) {
	std::string strContents;
	if (readProcStat(strContents) == false) return false;
	ants.parse(strContents);
	return true;
}
bool XGDaemonProcUtil::readProcStat(std::string & strContents) {
	return XGDaemonUtil::retrFileContents(PROC_STAT, strContents);
}

bool XGDaemonProcUtil::readProcUptime(ANTokenizedStrings & ants) {
	std::string strContents;
	if (readProcUptime(strContents) == false) return false;
	ants.parse(strContents);
	return true;
}
bool XGDaemonProcUtil::readProcUptime(std::string & strContents) {
	return XGDaemonUtil::retrFileContents(PROC_UPTIME, strContents);
}

