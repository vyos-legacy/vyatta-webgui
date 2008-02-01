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
 *  Module:       static_route_4u_data.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Encapsulation of IPV4 static routes data
 *
 */


#include "static_route_4u_data.hh"
#include "common/textparse/text_parse_util.hh"

StaticRoute4UData::StaticRoute4UData(
	const std::string & strNetwork,
	const std::string & strNexthop,
	const std::string & strInterface,
	const std::string & strVif,
	const std::string & strMetric,
	const std::string & strProtocol,
	const std::string & strAdminDistance)
	:
	m_strNetwork(strNetwork),
	m_strNexthop(strNexthop),
	m_strInterface(strInterface),
	m_strVif(strVif),
	m_strMetric(strMetric),
	m_strProtocol(strProtocol),
	m_strAdminDistance(strAdminDistance)
	{
}

const std::string & StaticRoute4UData::getNetwork() const {
	return m_strNetwork;
}
const std::string & StaticRoute4UData::getNexthop() const {
	return m_strNexthop;
}
const std::string & StaticRoute4UData::getInterface() const {
	return m_strInterface;
}
const std::string & StaticRoute4UData::getVif() const {
	return m_strVif;
}
const std::string & StaticRoute4UData::getMetric() const {
	return m_strMetric;
}
const std::string & StaticRoute4UData::getProtocol() const {
	return m_strProtocol;
}
const std::string & StaticRoute4UData::getAdminDistance() const {
	return m_strAdminDistance;
}
bool StaticRoute4UDataList::parse(const std::string & str) {

	TableRows * p_tr = TextParseUtil::parse(str);
	if (p_tr == NULL) return false;
	
	unsigned long totalRows = p_tr->getTotalRows();
	if (totalRows % 7 != 0) return false;	//Each record is 7 rows long.
	
	unsigned long currentRecordRow = 0;
	
	while (currentRecordRow < totalRows) {
		const std::string & strNetworkA       = p_tr->getRowColumn(currentRecordRow + 0, 1);
		const std::string & strNetworkB       = p_tr->getRowColumn(currentRecordRow + 0, 2);
		const std::string & strNetworkC       = p_tr->getRowColumn(currentRecordRow + 0, 3);
		const std::string & strNetworkD       = p_tr->getRowColumn(currentRecordRow + 0, 4);
		const std::string & strNetworkE       = p_tr->getRowColumn(currentRecordRow + 0, 5);
		const std::string & strNexthop        = p_tr->getRowColumn(currentRecordRow + 1, 1);
		const std::string & strInterface      = p_tr->getRowColumn(currentRecordRow + 2, 1);
		const std::string & strVif            = p_tr->getRowColumn(currentRecordRow + 3, 1);
		const std::string & strMetric         = p_tr->getRowColumn(currentRecordRow + 4, 1);
		const std::string & strProtocol       = p_tr->getRowColumn(currentRecordRow + 5, 1);
		const std::string & strAdminDistance  = p_tr->getRowColumn(currentRecordRow + 6, 2);
		
		std::string strNetwork = strNetworkA + "." + strNetworkB + "." + strNetworkC + "." + strNetworkD + "/" + strNetworkE;
		StaticRoute4UData data(
		                    strNetwork,
				    strNexthop,
				    strInterface,
				    strVif,
				    strMetric,
				    strProtocol,
				    strAdminDistance);
				    
		add(data);
		
		currentRecordRow += 7;
	}

	return true;
}
void StaticRoute4UDataList::add(const StaticRoute4UData & data) {
	m_list.push_back(data);
}
const std::list<StaticRoute4UData> & StaticRoute4UDataList::getConstList() const {
	return m_list;
}
DataMatrix * StaticRoute4UDataList::getDataMatrix() const {
	DataMatrix * p_dmRet = new DataMatrix(m_list.size(), SR4U_TOTAL_COLS);
	if (p_dmRet == NULL) return NULL;

	p_dmRet->setHeader(0, SR4U_COL_0);
	p_dmRet->setHeader(1, SR4U_COL_1);
	p_dmRet->setHeader(2, SR4U_COL_2);
	p_dmRet->setHeader(3, SR4U_COL_3);
	p_dmRet->setHeader(4, SR4U_COL_4);
	p_dmRet->setHeader(5, SR4U_COL_5);
	p_dmRet->setHeader(6, SR4U_COL_6);

	unsigned long counter = 0;
	std::list<StaticRoute4UData>::const_iterator i = m_list.begin();
	const std::list<StaticRoute4UData>::const_iterator iEnd = m_list.end();
	while (i != iEnd) {
		p_dmRet->setRowColumn(counter, 0, i->getNetwork());
		p_dmRet->setRowColumn(counter, 1, i->getNexthop());
		p_dmRet->setRowColumn(counter, 2, i->getInterface());
		p_dmRet->setRowColumn(counter, 3, i->getVif());
		p_dmRet->setRowColumn(counter, 4, i->getMetric());
		p_dmRet->setRowColumn(counter, 5, i->getProtocol());
		p_dmRet->setRowColumn(counter, 6, i->getAdminDistance());

		i++;
		counter++;
	}

	return p_dmRet;
}
