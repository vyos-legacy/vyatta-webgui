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
 *  Module:       text_parse_util.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility used for parsing text.
 *
 */


#include "text_parse_util.hh"

#include <iostream>
#include <stdexcept>

#include "basic/xgdaemon_util.hh"


bool ANTokenizedString::isCharAN(const char c) {
	return ((c >= 'a' && c <= 'z') || ( c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || (c == '.'));
}
unsigned long ANTokenizedString::getTotalANTokens() const {
	return m_listANTokens.size();
}
void ANTokenizedString::addToken() {
	if (m_strANToken.length() > 0) {
		m_listANTokens.push_back(m_strANToken);
		m_strANToken.clear();
	}
}
void ANTokenizedString::parseChar(const char c) {
	if (isCharAN(c)) {
		m_strANToken += c;
	} else {
		addToken();
	}
}
const std::list<std::string> & ANTokenizedString::getConstList() const {
	return m_listANTokens;
}

ANTokenizedStrings::~ANTokenizedStrings() {
	std::list<ANTokenizedString*>::iterator i = m_listANS.begin();
	std::list<ANTokenizedString*>::const_iterator iEnd = m_listANS.end();
	
	while (i != iEnd) {
		ANTokenizedString * p_ans = *i;
		if (p_ans != NULL) {
			delete p_ans;
			*i = NULL;
		}
		i++;
	}
}
ANTokenizedStrings::ANTokenizedStrings() : m_p_ant(NULL) {
}
ANTokenizedStrings::ANTokenizedStrings(const std::string & str) : m_p_ant(NULL) {
	parse(str);
}
const ANTokenizedString * ANTokenizedStrings::getFirstLine() const {
	return m_listANS.front();
}
bool ANTokenizedStrings::isCharNL(const char c) {
	return (c == '\n' || c == '\r');
}
unsigned long ANTokenizedStrings::getTotalLines() const {
	return m_listANS.size();
}
unsigned long ANTokenizedStrings::getUniformANTokens() const {
	if (getTotalLines() == 0) {
		return 0;
	} else {
		bool flagHaveOne = false;
		unsigned long totalANTCompare = 0;
		const std::list<ANTokenizedString*> & listANS = getConstList();
		std::list<ANTokenizedString*>::const_iterator i = listANS.begin();
		const std::list<ANTokenizedString*>::const_iterator iEnd = listANS.end();
		while (i != iEnd) {
			ANTokenizedString * p_ant = *i;
			unsigned long totalANT = (p_ant == NULL) ? 0 : p_ant->getTotalANTokens();
			if (flagHaveOne == false) {
				totalANTCompare = totalANT;
				flagHaveOne = true;
			} else {
				if (totalANT != totalANTCompare) return 0;
			}
			i++;
		}
		
		if (flagHaveOne) {
			return totalANTCompare;
		} else {
			return 0;
		}
	}
}
void ANTokenizedStrings::addANT() {
	if (m_p_ant != NULL) {
		m_p_ant->addToken();
		m_listANS.push_back(m_p_ant);
		m_p_ant = NULL;
	}
}
void ANTokenizedStrings::parse(const std::string & str) {
	int length = str.length();
	for (int i = 0; i < length; i++) {
		char c = str[i];
		parseChar(c);
	}
	addANT();
}
void ANTokenizedStrings::parseChar(const char c) {
	if (isCharNL(c)) {
		addANT();
	} else {
		if (m_p_ant == NULL) m_p_ant = new ANTokenizedString();
		if (m_p_ant == NULL) throw std::bad_alloc();

		m_p_ant->parseChar(c);
	}
}
void ANTokenizedStrings::popFirst() {
	m_listANS.pop_front();
}
const std::list<ANTokenizedString*> ANTokenizedStrings::getConstList() const {
	return m_listANS;
}

TableRow::TableRow(const ANTokenizedString & ant) : m_vectorColumns(ant.getTotalANTokens()) {
	unsigned long col = 0;
	const std::list<std::string> & listANT = ant.getConstList();
	std::list<std::string>::const_iterator i = listANT.begin();
	std::list<std::string>::const_iterator iEnd = listANT.end();
	while (i != iEnd) {
		const std::string & strToken = *i;
		m_vectorColumns[col] = strToken;

		i++;col++;
	}
	
}
TableRow::TableRow(const unsigned long totalColumns) : m_vectorColumns(totalColumns) {
}
long long TableRow::getLLColumn(unsigned long index) const {
	return XGDaemonUtil::getValueStrLL(getColumn(index), 0);
}
long long TableRow::getLLColumn(unsigned long index, unsigned long valueDefault) const {
	return XGDaemonUtil::getValueStrLL(getColumn(index), valueDefault);
}
unsigned long TableRow::getULColumn(unsigned long index) const {
	return XGDaemonUtil::getValueStrUL(getColumn(index), 0);
}
unsigned long TableRow::getULColumn(unsigned long index, unsigned long valueDefault) const {
	return XGDaemonUtil::getValueStrUL(getColumn(index), valueDefault);
}
unsigned long TableRow::getTotalColumns() const {
	return m_vectorColumns.size();
}
void TableRow::print() const {
	int totalColumns = m_vectorColumns.size();
	for (int i = 0; i < totalColumns; i++) {
		if (i > 0) std::cout << ", ";
		std::cout << m_vectorColumns[i];
	}
	std::cout << std::endl;
}
const std::string & TableRow::getColumn(unsigned long index) const {
	if (index < m_vectorColumns.size()) {
		return m_vectorColumns[index];
	} else {
		return XGDaemonUtil::getBlankString();
	}
}

TableRows::~TableRows() {
	int totalRows = m_vectorRows.size();
	for (int i = 0; i < totalRows; i++) {
		TableRow * p_row = m_vectorRows[i];
		if (p_row != NULL) {
			delete p_row;
			m_vectorRows[i] = NULL;
		}
	}
}
TableRows::TableRows(const ANTokenizedStrings & ants) : m_vectorRows(ants.getTotalLines()) {
	unsigned long row = 0;
	const std::list<ANTokenizedString*> & listANTS = ants.getConstList();
	std::list<ANTokenizedString*>::const_iterator i = listANTS.begin();
	std::list<ANTokenizedString*>::const_iterator iEnd = listANTS.end();
	while (i != iEnd) {
		ANTokenizedString * p_ant = *i;
		if (p_ant == NULL) throw std::logic_error("Expected non-NULL ANTokenizedString.");

		TableRow * p_tr = new TableRow(*p_ant);
		if (p_tr == NULL) throw std::bad_alloc();
		m_vectorRows[row] = p_tr;

		i++;row++;
	}
}
TableRows::TableRows(const unsigned long totalRows) : m_vectorRows(totalRows) {
}
unsigned long TableRows::getTotalRows() const {
	return m_vectorRows.size();
}
void TableRows::print() const {
	int totalRows = m_vectorRows.size();
	for (int i = 0; i < totalRows; i++) {
		const TableRow * p_tr = m_vectorRows[i];
		if (p_tr == NULL) {
			std::cout << "NULL" << std::endl;
		} else {
			p_tr->print();
		}
	}
}
const TableRow * TableRows::getConstPtrRow(unsigned long index) const {
	return m_vectorRows[index];
}
unsigned long TableRows::getULRowColumn(unsigned long row, unsigned long column, unsigned long valueDefault) const {
	const std::string strRC = getRowColumn(row, column);
	return XGDaemonUtil::getValueStrUL(strRC, valueDefault);
}
const std::string & TableRows::getRowColumn(unsigned long row, unsigned long column) const {
	const TableRow * p_tr = getConstPtrRow(row);
	if (p_tr == NULL) return XGDaemonUtil::getBlankString();
	
	return p_tr->getColumn(column);
}

unsigned long TextParseUtil::getTotalLines(const std::string & str) {
	unsigned long totalLines = 0;
	bool flagNN = false;
	for (std::string::size_type i = 0; i < str.length(); i++) {
		char c = str[i];
		if (c == '\n') {
			totalLines++;
			flagNN = false;
		} else {
			flagNN = true;
		}
	}
	if (flagNN) totalLines++;
	return totalLines;
}
TableRows * TextParseUtil::parse(const std::string & str) {
	ANTokenizedStrings ants;
	ants.parse(str);
	return new TableRows(ants);
}
UniformTableRows * TextParseUtil::parseUniform(const std::string & str) {
	ANTokenizedStrings ants;
	ants.parse(str);
	unsigned long totalColumns = ants.getUniformANTokens();
	if (totalColumns == 0) {
		return NULL;
	} else {
		return new UniformTableRows(ants);
	}
}


UniformTableRows::UniformTableRows(const ANTokenizedStrings & ants) : TableRows(ants), m_totalColumns(0) {
	m_totalColumns = ants.getUniformANTokens();
}

