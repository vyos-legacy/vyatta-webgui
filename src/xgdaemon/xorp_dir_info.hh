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
 *  Module:       xorp_dir_info.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code to keep track of certain directories used internally by XORP 
 *
 */


#ifndef __INCLUDE_XORP_DIR_INFO_HH__
#define	__INCLUDE_XORP_DIR_INFO_HH__

#include <string>

class XorpDirInfo {
public:
	XorpDirInfo(
		const std::string& strBaseIPCname,
		const std::string& strXorpRootDir,
		const std::string& strXorpTemplateDir,
		const std::string& strXorpTargetsDir);
	
	const std::string & getBaseIPCname() const;
	const std::string & getXorpRootDir() const;
	const std::string & getXorpTemplateDir() const;
	const std::string & getXorpTargetsDir() const;
	
	std::string generateUniqueIPCname();

private:
	unsigned int	m_totalUnique;
	std::string	m_strBaseIPCname;
	std::string	m_strXorpRootDir;
	std::string	m_strXorpTemplateDir;
	std::string	m_strXorpTargetsDir;
};

#endif

