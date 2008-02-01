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
 *  Module:       server_system_info.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code for server-side encapsulation of system information.
 *
 */

#include "server_system_info.hh"
#include "basic/xgdaemon_util.hh"
#include "common/textparse/text_parse_util.hh"
#include "xgdaemon_proc_util.hh"

const NetDataInfo & ServerSystemInfo::getConstNDI() const {
	return m_sndi;
}
const ServerStatInfo & ServerSystemInfo::getConstSSI() const {
	return m_ssi;
}
const TimeInfo & ServerSystemInfo::getConstTimeGMT() const {
	return m_stiGMT;
}
const TimeInfo & ServerSystemInfo::getConstTimeLocal() const {
	return m_stiLocal;
}

NetDataInfo & ServerSystemInfo::getNDI() {
	return m_sndi;
}
ServerNetDataInfo & ServerSystemInfo::getSNDI() {
	return m_sndi;
}
ServerStatInfo & ServerSystemInfo::getSSI() {
	return m_ssi;
}
TimeInfo & ServerSystemInfo::getTimeGMT() {
	return m_stiGMT;
}
TimeInfo & ServerSystemInfo::getTimeLocal() {
	return m_stiLocal;
}

bool ServerSystemInfo::readProc() {
	ANTokenizedStrings ants;
	if (XGDaemonProcUtil::readProcUptime(ants) == false) return false;

	if (ants.getTotalLines() != PROC_UPTIME_LINES) return false;

	const ANTokenizedString * p_antFirst = ants.getFirstLine();
	if (p_antFirst == NULL) return false;

	TableRow tr(*p_antFirst);
	if (tr.getTotalColumns() != PROC_UPTIME_COLS) return false;

	const std::string & strUptimeTotal = tr.getColumn(PROC_UPTIME_COL_TOTAL);
	const std::string & strUptimeIdle = tr.getColumn(PROC_UPTIME_COL_IDLE);

	const std::string::size_type indexDotUptimeTotal = strUptimeTotal.find('.');
	if (indexDotUptimeTotal == std::string::npos) return false;

	const std::string::size_type indexDotUptimeIdle = strUptimeIdle.find('.');
	if (indexDotUptimeIdle == std::string::npos) return false;

	const std::string & strUptimeTotalSecs = strUptimeTotal.substr(0, indexDotUptimeTotal);
	const std::string & strUptimeIdleSecs = strUptimeIdle.substr(0, indexDotUptimeIdle); 

	m_uptimeTotal = XGDaemonUtil::getValueStrUL(strUptimeTotalSecs, 0);
	m_uptimeIdle = XGDaemonUtil::getValueStrUL(strUptimeIdleSecs, 0);

	return true;
}
void ServerSystemInfo::determineTime() {
	m_stiGMT.determineGMTime();
	m_stiLocal.determineLocalTime();
}

