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
 *  Module:       common_session_status_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulation of information related to session information.
 *
 */


#ifndef	__INCLUDE_COMMON_SESSION_STATUS_INFO_HH__
#define __INCLUDE_COMMON_SESSION_STATUS_INFO_HH__

#include <string>
#include "time_info.hh"

#define	MAX_TIME_INACTIVITY		(20*60)

#define	SESSION_PHASE_AUTHENTICATING	"authenticating"
#define	SESSION_PHASE_INITIALIZING	"initializing"
#define	SESSION_PHASE_IDLE		"idle"
#define	SESSION_PHASE_COMMITTING	"committing"
#define	SESSION_PHASE_LOADING		"loading"
#define	SESSION_PHASE_SAVING		"saving"
#define	SESSION_PHASE_SHUTDOWN		"shutdown"
#define	SESSION_PHASE_UNKNOWN		"unknown"

class CommonSessionStatusInfo {
public:
	virtual ~CommonSessionStatusInfo();
	CommonSessionStatusInfo();

	virtual const TimeInfo & getTimeNow() const = 0;

	virtual bool getFlagCanCommit() const = 0;
	virtual bool getFlagConfigChanged() const = 0;
	virtual bool getFlagConfigInvalid() const = 0;
	virtual bool getFlagInvalidState() const = 0;
	virtual unsigned long getTotalConfigChanges() const = 0;

	virtual std::string getPhase() const = 0;

	bool isExpired() const;
	bool isIdleOrAbove() const;

	unsigned long getTotalCycles() const;
	
	time_t getTimeLastActivity() const;
	time_t getTimeStart() const;
	time_t getTotalTimeInactivity() const;

protected:
	unsigned long	m_totalCycles;
	time_t		m_timeLastActivity;
	time_t		m_timeStart;
};


#endif

