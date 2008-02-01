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
 *  Module:       client_session_status_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Client-side encapsulation of information related to user sessions.
 *
 */



#ifndef __INCLUDE_CLIENT_SESSION_STATUS_INFO__
#define	__INCLUDE_CLIENT_SESSION_STATUS_INFO__

#include <string>

#include "client_current_task_info.hh"
#include "client_time_info.hh"

#include "common/common_session_status_info.hh"
#include "common/time_info.hh"

class ClientSessionStatusInfo : public CommonSessionStatusInfo {
public:
	ClientSessionStatusInfo();

	bool getFlagCanCommit() const;
	bool getFlagConfigChanged() const;
	bool getFlagConfigInvalid() const;
	bool getFlagInvalidState() const;

	unsigned long getTotalConfigChanges() const;

	void setFlagCanCommit(bool flagCanCommit);
	void setFlagConfigChanged(bool flagConfigChanged);
	void setFlagConfigInvalid(bool flagConfigChanged);
	void setFlagInvalidState(bool flagInvalidState);

	void setPhase(const std::string & strPhase);
	void setTimeLastActivity(const time_t timeLastActivity);
//	void setTimeNow(const TimeInfo & timeNow);
	void setTimeStart(const time_t timeStart);
	void setTotalConfigChanges(const unsigned long totalConfigChanges);
	void setTotalCycles(const unsigned long totalCycles);

	ClientCurrentTaskInfo & getCurrentTask();
	ClientTimeInfo & getClientTimeInfo();

	std::string getPhase() const;

	const ClientCurrentTaskInfo & getConstCurrentTask() const;
	const TimeInfo & getTimeNow() const;

protected:
	bool                   m_flagCanCommit;
	bool                   m_flagConfigChanged;
	bool                   m_flagConfigInvalid;
	bool                   m_flagInvalidState;

	unsigned long          m_totalConfigChanges;

	ClientCurrentTaskInfo  m_ccti;
	ClientTimeInfo         m_timeNow;

	std::string            m_strPhase;
};


#endif

