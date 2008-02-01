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
 *  Module:       current_task_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulation of information related to XORP tasks.
 *
 */

#ifndef __INCLUDE_CURRENT_TASK_INFO__
#define __INCLUDE_CURRENT_TASK_INFO__

#include <string>

#define NAME_TASK_NONE	  "none"
#define NAME_TASK_COMMIT  "commit"
#define NAME_TASK_LOAD	  "load"
#define NAME_TASK_SAVE	  "save"

enum XGDaemonTask {
	TASK_NONE,
	TASK_COMMIT,
	TASK_LOAD,
	TASK_SAVE
};

class CurrentTaskInfo {
public:
	virtual int getStageCurrent() const = 0;
	virtual int getStageMax() const = 0;

	virtual ~CurrentTaskInfo();
	CurrentTaskInfo();

	bool isDone() const;
	bool isError() const;

	void clear();

	XGDaemonTask getTask() const;

	std::string getName() const;
	const std::string & getMessage() const;

protected:
	bool          m_flagDone;
	bool          m_flagError;
	XGDaemonTask  m_task;
	std::string   m_strMessage;
};

#endif

