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
 *  Module:       xgdaemon_current_task_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Class for encapsulation of information related to XORP tasks xgdaemon-side.
 *
 */

#ifndef __INCLUDE_XGDAEMON_CURRENT_TASK_INFO__
#define __INCLUDE_XGDAEMON_CURRENT_TASK_INFO__

#include "../../rtrmgr/slave_conf_tree.hh"

#include "../common/current_task_info.hh"

class XGDaemonCurrentTaskInfo : public CurrentTaskInfo {
public:
	XGDaemonCurrentTaskInfo(const CommitStatus & cs);

	bool isTaskInProgress() const;
	bool setTask(const XGDaemonTask task);

	int getStageCurrent() const;
	int getStageMax() const;

	void resetTask();
	void setDone(const bool flagError, const std::string & strMessage);

protected:
	const CommitStatus & m_cs;
};


#endif

