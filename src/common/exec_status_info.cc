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
 *  Module:       exec_status_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Class for execution status encapsulation.
 *
 */

#include "exec_status_info.hh"

BriefExecStatusInfo::~BriefExecStatusInfo() {
}
BriefExecStatusInfo::BriefExecStatusInfo() : m_id(0), m_flagDone(false), m_flagDoneSuccess(false) {
}
BriefExecStatusInfo::BriefExecStatusInfo(unsigned long id) : m_id(id), m_flagDone(false), m_flagDoneSuccess(false), m_flagKillInvoked(false) {
}

bool BriefExecStatusInfo::getFlagDone() const {
	return m_flagDone;
}
bool BriefExecStatusInfo::getFlagDoneSuccess() const {
	return m_flagDoneSuccess;
}
bool BriefExecStatusInfo::getFlagKillInvoked() const {
	return m_flagKillInvoked;
}

unsigned long BriefExecStatusInfo::getId() const {
	return m_id;
}

const std::string & BriefExecStatusInfo::getDoneMsg() const {
	return m_strDoneMsg;
}

void BriefExecStatusInfo::setFlagDone(bool flagDone) {
	m_flagDone = flagDone;
}
void BriefExecStatusInfo::setFlagDoneSuccess(bool flagDoneSuccess) {
	m_flagDoneSuccess = flagDoneSuccess;
}
void BriefExecStatusInfo::setId(unsigned long id) {
	m_id = id;
}
void BriefExecStatusInfo::setDoneMsg(const std::string & strDoneMsg) {
	m_strDoneMsg = strDoneMsg;
}

const std::string & DetailedExecStatusInfo::getOutput() const {
	return m_strOutput;
}
void DetailedExecStatusInfo::setOutput(const std::string & strOutput) {
	m_strOutput = strOutput;
}

