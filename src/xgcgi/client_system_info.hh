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
 *  Module:       client_system_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Client-side encapsulation of information related to misc system information.
 *
 */


#ifndef	__INCLUDE_CLIENT_SYSTEM_INFO__
#define	__INCLUDE_CLIENT_SYSTEM_INFO__

#include "common/net_data_info.hh"
#include "common/system_info.hh"


class ClientSystemInfo : public SystemInfo {
public:	
	const NetDataInfo & getConstNDI() const;
	NetDataInfo & getNDI();

protected:
	NetDataInfo  m_ndi;
};

#endif

