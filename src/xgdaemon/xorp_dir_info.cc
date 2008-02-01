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
 *  Module:       xorp_dir_info.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code to keep track of certain directories used internally by XORP 
 *
 */



#include "xorp_dir_info.hh"
#include "xgdaemon_module.hh"

#include "basic/xgdaemon_util.hh"

XorpDirInfo::XorpDirInfo(
		const std::string& strBaseIPCname,
		const std::string& strXorpRootDir,
		const std::string& strXorpTemplateDir,
		const std::string& strXorpTargetsDir)
	:
	m_totalUnique(0),
	m_strBaseIPCname(strBaseIPCname),
	m_strXorpRootDir(strXorpRootDir),
	m_strXorpTemplateDir(strXorpTemplateDir),
	m_strXorpTargetsDir(strXorpTargetsDir) {
}

const std::string & XorpDirInfo::getBaseIPCname() const {
	return m_strBaseIPCname;
}
const std::string & XorpDirInfo::getXorpRootDir() const {
	return m_strXorpRootDir;
}
const std::string & XorpDirInfo::getXorpTemplateDir() const {
	return m_strXorpTemplateDir;
}
const std::string & XorpDirInfo::getXorpTargetsDir() const {
	return m_strXorpTargetsDir;
}
std::string XorpDirInfo::generateUniqueIPCname() {
	std::string strUniqueName = m_strBaseIPCname;
	strUniqueName += '-';
	strUniqueName += XGDaemonUtil::getStrReprUInt(m_totalUnique++);
	return strUniqueName;
}

