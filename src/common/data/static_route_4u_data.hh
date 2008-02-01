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
 *  Module:       static_route_4u_data.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Encapsulation of IPV4 static routes data
 *
 */


#ifndef __INCLUDE_STATIC_ROUTE_4U_DATA__
#define __INCLUDE_STATIC_ROUTE_4U_DATA__

#define SR4U_TOTAL_COLS		7
#define SR4U_COL_0		"Network"
#define SR4U_COL_1		"Nexthop"
#define SR4U_COL_2		"Interface"
#define SR4U_COL_3		"Vif"
#define SR4U_COL_4		"Metric"
#define SR4U_COL_5		"Protocol"
#define SR4U_COL_6		"Admin Distance"

#include "data_matrix.hh"

#include <list>
#include <string>

class StaticRoute4UData {
public:
	StaticRoute4UData(
		const std::string & strNetwork,
		const std::string & strNexthop,
		const std::string & strInterface,
		const std::string & strVif,
		const std::string & strMetric,
		const std::string & strProtocol,
		const std::string & strAdminDistance);

	const std::string & getNetwork() const;
	const std::string & getNexthop() const;
	const std::string & getInterface() const;
	const std::string & getVif() const;
	const std::string & getMetric() const;
	const std::string & getProtocol() const;
	const std::string & getAdminDistance() const;	

private:
	std::string m_strNetwork;
	std::string m_strNexthop;
	std::string m_strInterface;
	std::string m_strVif;
	std::string m_strMetric;
	std::string m_strProtocol;
	std::string m_strAdminDistance;	
};

class StaticRoute4UDataList {
public:
	bool parse(const std::string & str);
	void add(const StaticRoute4UData & data);
	
	const std::list<StaticRoute4UData> & getConstList() const;
	
	DataMatrix * getDataMatrix() const;

protected:
	std::list<StaticRoute4UData> m_list;
};

#endif

