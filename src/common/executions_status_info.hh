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
 *  Module:       executions_status_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Class for executions list encapsulation.
 *
 */


#ifndef __INCLUDE_EXECUTION_STATUS_INFO__
#define	__INCLUDE_EXECUTION_STATUS_INFO__

#include "exec_status_info.hh"

class ExecutionsStatusInfo {
public:
	virtual ~ExecutionsStatusInfo();
	virtual int getTotalExecutions() const = 0;
	virtual unsigned long getExecId(int index) const = 0;
	virtual const BriefExecStatusInfo & getBrief(int index) const = 0;
};


#endif

