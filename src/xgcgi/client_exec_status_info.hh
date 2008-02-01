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
 *  Module:       client_exec_status_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Encapsulation of operational command execution status on the client-side
 *
 */


#ifndef __INCLUDE_CLIENT_EXEC_STATUS_INFO_HH__
#define __INCLUDE_CLIENT_EXEC_STATUS_INFO_HH__

#include "common/exec_status_info.hh"

class ClientBriefExecStatusInfo : public BriefExecStatusInfo {

public:
	ClientBriefExecStatusInfo();

	const unsigned long getTotalLines() const;
	const TimeInfo & getConstTimeStart() const;
	const TimeInfo & getConstTimeEnd() const;
	const std::string & getCachedCommandLine() const;

	void setCachedCommandLine(const std::string & strCachedCommandLine);
	void setFlagKillInvoked(bool flagKillInvoked);
	void setTotalLines(const unsigned long totalLines);

	TimeInfo & getTimeStart();
	TimeInfo & getTimeEnd();


protected:

	unsigned long  m_totalLines;
	TimeInfo       m_tiStart;
	TimeInfo       m_tiEnd;

	std::string    m_strCachedCommandLine;
};

#endif

