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
 *  Module:       text_parse_util.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility used for parsing text.
 *
 */


#ifndef __INCLUDE_TEXT_PARSE_UTIL__
#define	__INCLUDE_TEXT_PARSE_UTIL__

#include <list>
#include <string>
#include <vector>

class ANTokenizedString {
public:
	static bool isCharAN(const char c);

	unsigned long getTotalANTokens() const;

	void addToken();
	void parseChar(const char c);

	const std::list<std::string> & getConstList() const;

private:
	std::list<std::string>  m_listANTokens;
	std::string             m_strANToken;
};

class ANTokenizedStrings {
public:
	static bool isCharNL(const char c);
	~ANTokenizedStrings();
	ANTokenizedStrings();
	ANTokenizedStrings(const std::string & str);

	const ANTokenizedString * getFirstLine() const;

	unsigned long getTotalLines() const;
	unsigned long getUniformANTokens() const;
	void addANT();
	void parse(const std::string & str);
	void parseChar(const char c);
	void popFirst();

	const std::list<ANTokenizedString*> getConstList() const;
private:
	ANTokenizedString *            m_p_ant;
	std::list<ANTokenizedString*>  m_listANS;
};

class TableRow {
public:
	TableRow(const ANTokenizedString & ant);
	TableRow(const unsigned long totalColumns);

	long long getLLColumn(unsigned long index) const;
	long long getLLColumn(unsigned long index, unsigned long valueDefault) const;
	unsigned long getULColumn(unsigned long index) const;
	unsigned long getULColumn(unsigned long index, unsigned long valueDefault) const;
	
	unsigned long getTotalColumns() const;
	void print() const;
	const std::string & getColumn(unsigned long index) const;
private:
	std::vector<std::string> m_vectorColumns;
};

class TableRows {
public:
	virtual ~TableRows();
	TableRows(const ANTokenizedStrings & ants);
	TableRows(const unsigned long totalRows);
	const TableRow * getConstPtrRow(unsigned long index) const;
	unsigned long getTotalRows() const;
	void print() const;
	unsigned long getULRowColumn(unsigned long row, unsigned long column, unsigned long valueDefault) const;
	const std::string & getRowColumn(unsigned long row, unsigned long column) const;
protected:
	std::vector<TableRow*> m_vectorRows;
};

class UniformTableRows : public TableRows {
public:
	UniformTableRows(const ANTokenizedStrings & ants);

protected:
	unsigned long m_totalColumns;
};

class TextParseUtil {
public:
	static unsigned long getTotalLines(const std::string & str);
	static TableRows * parse(const std::string & str);
	static UniformTableRows * parseUniform(const std::string & str);
};

#endif

