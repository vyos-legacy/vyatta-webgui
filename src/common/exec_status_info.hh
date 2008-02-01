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
 *  Module:       exec_status_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Class for execution status encapsulation.
 *
 */


#ifndef __INCLUDE_EXEC_STATUS_INFO_HH__
#define __INCLUDE_EXEC_STATUS_INFO_HH__

#include <string>

#include "time_info.hh"

#define	EXEC_ID_NONE		0x00000000
#define	EXEC_ID_UNKNOWN		0xffffffff

class BriefExecStatusInfo {
public:

	virtual const unsigned long getTotalLines() const = 0;
	virtual const TimeInfo & getConstTimeStart() const = 0;
	virtual const TimeInfo & getConstTimeEnd() const = 0;

	virtual const std::string & getCachedCommandLine() const = 0;

	virtual ~BriefExecStatusInfo();
	BriefExecStatusInfo();
	BriefExecStatusInfo(unsigned long id);

	bool getFlagDone() const;
	bool getFlagDoneSuccess() const;
	bool getFlagKillInvoked() const;

	unsigned long getId() const;

	const std::string & getDoneMsg() const;

	void setFlagDone(bool flagDone);
	void setFlagDoneSuccess(bool flagDoneSuccess);
	void setId(unsigned long id);
	void setDoneMsg(const std::string & strDoneMsg);

protected:
	unsigned long  m_id;

	bool           m_flagDone;
	bool           m_flagDoneSuccess;
	bool           m_flagKillInvoked;

	std::string    m_strDoneMsg;
};

class DetailedExecStatusInfo {
public:
	const std::string & getOutput() const;
	void setOutput(const std::string & strOutput);

protected:
	std::string    m_strOutput;
};

#endif

