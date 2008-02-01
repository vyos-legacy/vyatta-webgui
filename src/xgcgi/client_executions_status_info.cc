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
 *  Module:       client_executions_status_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Keeps track of a list of operational commands that have been executed for the client-side.
 *
 */


#include "client_executions_status_info.hh"

int ClientExecutionsStatusInfo::getTotalExecutions() const {
	return m_vectorBrief.size();
}
unsigned long ClientExecutionsStatusInfo::getExecId(int index) const {
	return m_vectorBrief[index].getId();
}
void ClientExecutionsStatusInfo::clear() {
	m_vectorBrief.clear();
}
void ClientExecutionsStatusInfo::add(const ClientBriefExecStatusInfo & cbesi) {
	m_vectorBrief.push_back(cbesi);
}
const BriefExecStatusInfo & ClientExecutionsStatusInfo::getBrief(int index) const {
	return m_vectorBrief[index];
}
