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
 *  Module:       data_matrix.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility class for storing tabular data.
 *
 */


#ifndef __INCLUDE_DATA_MATRIX__
#define __INCLUDE_DATA_MATRIX__

#include <string>
#include <vector>

//typedef std::vector<std::string*>::size_type  sz_data_matrix;

class DataRow {
public:
	~DataRow();
	DataRow(unsigned long totalColumns);

	unsigned long getTotalColumns() const;
	void setColumn(unsigned long i, const std::string & strValue);
	const std::string & getColumn(unsigned long i) const;

protected:
	static std::string         m_strBlank;
	std::vector<std::string*>  m_vectorColumns;
};

class DataMatrix {
public:
	DataMatrix(unsigned long totalRows, unsigned long totalColumns);
	unsigned long getTotalColumns() const;
	unsigned long getTotalRows() const;
	void setHeader(unsigned long col, const std::string & strName);
	void setRowColumn(unsigned long row, unsigned long col, const std::string & strValue);
	
	const std::string & getHeader(unsigned long col) const;
	const std::string & getRowColumn(unsigned long row, unsigned long col) const;

protected:
	static std::string     m_strBlank;
	DataRow                m_drHeaders;
	std::vector<DataRow*>  m_vectorRows;
};

#endif

