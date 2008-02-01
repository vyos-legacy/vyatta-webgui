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
 *  Module:       server_net_data_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Code for server-side encapsulation of data related to net statistics.
 *
 */


#ifndef __INCLUDE_SERVER_NET_DATA_INFO__
#define	__INCLUDE_SERVER_NET_DATA_INFO__


#define	PROC_COLUMN_INTF		0
#define	PROC_COLUMN_INTF_LO		"lo"
#define	PROC_COLUMN_IN_BYTES		1
#define	PROC_COLUMN_IN_PACKETS		2
#define	PROC_COLUMN_IN_ERRS		3
#define	PROC_COLUMN_IN_DROP		4
#define	PROC_COLUMN_IN_FIFO		5
#define	PROC_COLUMN_IN_FRAME		6
#define	PROC_COLUMN_IN_COMPRESSED	7
#define	PROC_COLUMN_IN_MULTICAST	8

#define	PROC_COLUMN_OUT_BYTES		9
#define	PROC_COLUMN_OUT_PACKETS		10
#define	PROC_COLUMN_OUT_ERRS		11
#define	PROC_COLUMN_OUT_DROP		12
#define	PROC_COLUMN_OUT_FIFO		13
#define	PROC_COLUMN_OUT_COLLS		14
#define	PROC_COLUMN_OUT_CARRIER		15
#define	PROC_COLUMN_OUT_COMPRESSED	16


#include "common/net_data_info.hh"

class ServerNetDataInfo : public NetDataInfo {
public:
	ServerNetDataInfo();
	
	bool readProc();

private:
};

#endif

