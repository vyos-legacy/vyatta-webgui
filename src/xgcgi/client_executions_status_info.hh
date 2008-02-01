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
 *  Module:       client_executions_status_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Keeps track of a list of operational commands that have been executed for the client-side.
 *
 */


#ifndef __INCLUDE_CLIENT_EXECUTION_STATUS_INFO__
#define	__INCLUDE_CLIENT_EXECUTION_STATUS_INFO__

#include <vector>

#include "common/exec_status_info.hh"
#include "common/executions_status_info.hh"

#include "client_exec_status_info.hh"

class ClientExecutionsStatusInfo : public ExecutionsStatusInfo {
public:
	int getTotalExecutions() const;
	unsigned long getExecId(int index) const;
	void clear();
	void add(const ClientBriefExecStatusInfo & cbesi);
	const BriefExecStatusInfo & getBrief(int index) const;
private:
	std::vector<ClientBriefExecStatusInfo> m_vectorBrief;
};

#endif

