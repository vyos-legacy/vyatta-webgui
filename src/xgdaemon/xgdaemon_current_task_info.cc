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
 *  Module:       xgdaemon_current_task_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Class for encapsulation of information related to XORP tasks xgdaemon-side.
 *
 */

#include "xgdaemon_module.hh"

#include "xgdaemon_current_task_info.hh"

XGDaemonCurrentTaskInfo::XGDaemonCurrentTaskInfo(const CommitStatus & cs) : m_cs(cs) {
}
bool XGDaemonCurrentTaskInfo::isTaskInProgress() const {
	return (m_task != TASK_NONE && !m_flagDone);
}
bool XGDaemonCurrentTaskInfo::setTask(const XGDaemonTask task) {
	if (isTaskInProgress()) return false;
	resetTask();
	m_task = task;
	return true;
}
int XGDaemonCurrentTaskInfo::getStageCurrent() const {
	if (m_task == TASK_COMMIT) {
		return m_cs.commit_phase();
	} else {
		return 0;
	}
}
int XGDaemonCurrentTaskInfo::getStageMax() const {
	if (m_task == TASK_COMMIT) {
		return CommitStatus::COMMIT_PHASE_DONE;
	} else {
		return 0;
	}
}
void XGDaemonCurrentTaskInfo::resetTask() {
	m_flagDone = false;
	m_flagError = false;
	m_task = TASK_NONE;
	m_strMessage.clear();
}
void XGDaemonCurrentTaskInfo::setDone(const bool flagError, const std::string & strMessage) {
	m_flagDone = true;
	m_flagError = flagError;
	m_strMessage = strMessage;
}


