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
 *  Module:       current_task_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulation of information related to XORP tasks.
 *
 */

#include <stdexcept>

#include "current_task_info.hh"

CurrentTaskInfo::~CurrentTaskInfo() {
}
CurrentTaskInfo::CurrentTaskInfo() : m_flagDone(false), m_flagError(false), m_task(TASK_NONE) {	
}

bool CurrentTaskInfo::isDone() const {
	return m_flagDone;
}
bool CurrentTaskInfo::isError() const {
	return m_flagError;
}
void CurrentTaskInfo::clear() {
	m_flagDone = false;
	m_flagError = false;
	m_task = TASK_NONE;
	m_strMessage.clear();
}
XGDaemonTask CurrentTaskInfo::getTask() const {
	return m_task;
}
std::string CurrentTaskInfo::getName() const {
	switch (m_task) {
		case TASK_NONE:
			return NAME_TASK_NONE;
		case TASK_COMMIT:
			return NAME_TASK_COMMIT;
		case TASK_LOAD:
			return NAME_TASK_LOAD;
		case TASK_SAVE:
			return NAME_TASK_SAVE;
		default:
			throw std::logic_error("Unknown task.");
	}
}
const std::string & CurrentTaskInfo::getMessage() const {
	return m_strMessage;
}

