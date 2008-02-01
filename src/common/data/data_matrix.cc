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
 *  Module:       data_matrix.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility class for storing tabular data.
 *
 */


#include "data_matrix.hh"

std::string DataMatrix::m_strBlank;
std::string DataRow::m_strBlank;

DataMatrix::DataMatrix(unsigned long totalRows, unsigned long totalColumns) : m_drHeaders(totalColumns), m_vectorRows(totalRows) {	
}
unsigned long DataMatrix::getTotalColumns() const {
	return m_drHeaders.getTotalColumns();
}
unsigned long DataMatrix::getTotalRows() const {
	return m_vectorRows.size();
}
void DataMatrix::setHeader(unsigned long col, const std::string & strName) {
	m_drHeaders.setColumn(col, strName);
}
void DataMatrix::setRowColumn(unsigned long row, unsigned long col, const std::string & strValue) {
	if (m_vectorRows[row] == NULL) m_vectorRows[row] = new DataRow(m_drHeaders.getTotalColumns());
	if (m_vectorRows[row] == NULL) throw std::bad_alloc();	
	m_vectorRows[row]->setColumn(col, strValue);
}
const std::string & DataMatrix::getHeader(unsigned long col) const {
	return m_drHeaders.getColumn(col);
}
const std::string & DataMatrix::getRowColumn(unsigned long row, unsigned long col) const {
	if (m_vectorRows[row] == NULL) {
		return m_strBlank;
	} else {
		return m_vectorRows[row]->getColumn(col);
	}
}

DataRow::~DataRow() {
	unsigned long totalColumns = m_vectorColumns.size();
	for (unsigned long i = 0; i < totalColumns; i++) {
		if (m_vectorColumns[i] != NULL) {
			delete m_vectorColumns[i];
			m_vectorColumns[i] = NULL;
		}
	}
}
DataRow::DataRow(unsigned long totalColumns) : m_vectorColumns(totalColumns) {
}
unsigned long DataRow::getTotalColumns() const {
	return m_vectorColumns.size();
}
void DataRow::setColumn(unsigned long i, const std::string & strValue) {
	m_vectorColumns[i] = new std::string(strValue);
	if (m_vectorColumns[i] == NULL) throw std::bad_alloc();
}
const std::string & DataRow::getColumn(unsigned long i) const {
	if (m_vectorColumns[i] == NULL) {
		return m_strBlank;
	} else {
		return *m_vectorColumns[i];
	}
}

