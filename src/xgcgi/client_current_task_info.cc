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
 *  Module:       client_current_task_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Class for encapsulation of information related to XORP tasks client-side.
 *
 */

#include "client_current_task_info.hh"

ClientCurrentTaskInfo::ClientCurrentTaskInfo() : CurrentTaskInfo(), m_stageCurrent(0), m_stageMax(0) {
}
int ClientCurrentTaskInfo::getStageCurrent() const {
	return m_stageCurrent;
}
int ClientCurrentTaskInfo::getStageMax() const {
	return m_stageMax;
}
void ClientCurrentTaskInfo::setDone(bool flagDone) {
	m_flagDone = flagDone;
}
void ClientCurrentTaskInfo::setError(bool flagError) {
	m_flagError = flagError;
}
void ClientCurrentTaskInfo::setMessage(const std::string & strMessage) {
	m_strMessage = strMessage;
}
void ClientCurrentTaskInfo::setName(const std::string & strName) {
	if (strName == NAME_TASK_NONE) {
		m_task = TASK_NONE;
	} else if (strName == NAME_TASK_COMMIT) {
		m_task = TASK_COMMIT;
	} else if (strName == NAME_TASK_LOAD) {
		m_task = TASK_LOAD;
	} else if (strName == NAME_TASK_SAVE) {
		m_task = TASK_SAVE;
	} else {
		m_task = TASK_NONE;
	}
}
void ClientCurrentTaskInfo::setStageCurrent(int stageCurrent) {
	m_stageCurrent = stageCurrent;
}
void ClientCurrentTaskInfo::setStageMax(int stageMax) {
	m_stageMax = stageMax;
}
void ClientCurrentTaskInfo::setTask(XGDaemonTask task) {
	m_task = task;
}

