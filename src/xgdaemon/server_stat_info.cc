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
 *  Module:       server_stat_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  This server-side class encapsulates various cpu utilization counters used to output statistics.
 *
 */


#include "server_stat_info.hh"

#include <iostream>
#include <stdexcept>

#include "xgdaemon_proc_util.hh"
#include "common/textparse/text_parse_util.hh"

ServerCPUStatInfo::ServerCPUStatInfo() : m_use(0), m_nic(0), m_sys(0), m_idl(0), m_iow(0), m_xxx(0), m_yyy(0), m_useOld(0), m_nicOld(0), m_sysOld(0), m_idlOld(0), m_iowOld(0), m_xxxOld(0), m_yyyOld(0) {
}

long long ServerCPUStatInfo::getDeltaUse() const {
	return m_use - m_useOld;
}
long long ServerCPUStatInfo::getDeltaNic() const {
	return m_nic - m_nicOld;
}
long long ServerCPUStatInfo::getDeltaSys() const {
	return m_sys - m_sysOld;
}
long long ServerCPUStatInfo::getDeltaIdl() const {
	return m_idl - m_idlOld;
}
long long ServerCPUStatInfo::getDeltaIow() const {
	return m_iow - m_iowOld;
}
long long ServerCPUStatInfo::getDeltaXxx() const {
	return m_xxx - m_xxxOld;
}
long long ServerCPUStatInfo::getDeltaYyy() const {
	return m_yyy - m_yyyOld;
}

void ServerCPUStatInfo::updateUse(long long use) {
	m_useOld = m_use;
	m_use = use;
}
void ServerCPUStatInfo::updateNic(long long nic) {
	m_nicOld = m_nic;
	m_nic = nic;
}
void ServerCPUStatInfo::updateSys(long long sys) {
	m_sysOld = m_sys;
	m_sys = sys;
}
void ServerCPUStatInfo::updateIdl(long long idl) {
	m_idlOld = m_idl;
	m_idl = idl;
}
void ServerCPUStatInfo::updateIow(long long iow) {
	m_iowOld = m_iow;
	m_iow = iow;
}
void ServerCPUStatInfo::updateXxx(long long xxx) {
	m_xxxOld = m_xxx;
	m_xxx = xxx;
}
void ServerCPUStatInfo::updateYyy(long long yyy) {
	m_yyyOld = m_yyy;
	m_yyy = yyy;
}

bool ServerStatInfo::readProc() {

	ANTokenizedStrings ants;
	if (XGDaemonProcUtil::readProcStat(ants) == false) return false;
	TableRows * p_trows = new TableRows(ants);
	if (p_trows == NULL) return false;

	for (unsigned long i = 1; i < p_trows->getTotalRows(); i++) {
		const TableRow * p_trow = p_trows->getConstPtrRow(i);
		if (p_trow == NULL) throw std::logic_error("Expected non-NULL TableRow.");

		const std::string & strHead = p_trow->getColumn(PROC_COLUMN_HEAD);
		if (strHead.length() < 4) break;
		if (strHead.substr(0, 3) != "cpu") break;

		long long use = p_trow->getLLColumn(PROC_COLUMN_USE);
		long long nic = p_trow->getLLColumn(PROC_COLUMN_NIC);
		long long sys = p_trow->getLLColumn(PROC_COLUMN_SYS);
		long long idl = p_trow->getLLColumn(PROC_COLUMN_IDL);
		long long iow = p_trow->getLLColumn(PROC_COLUMN_IOW);
		long long xxx = p_trow->getLLColumn(PROC_COLUMN_XXX);
		long long yyy = p_trow->getLLColumn(PROC_COLUMN_YYY);
		
		unsigned long index = i - 1;

		while (m_vectorCPUs.size() <= index) {
			m_vectorCPUs.push_back(new ServerCPUStatInfo());
		}

		ServerCPUStatInfo * p_cpu = dynamic_cast<ServerCPUStatInfo*>(m_vectorCPUs[index]);
		if (p_cpu == NULL) throw std::logic_error("Expected non-NULL ServerCPUStatInfo.");

		p_cpu->updateUse(use);
		p_cpu->updateNic(nic);
		p_cpu->updateSys(sys);
		p_cpu->updateIdl(idl);
		p_cpu->updateIow(iow);
		p_cpu->updateXxx(xxx);
		p_cpu->updateYyy(yyy);
	}

	return true;
}


