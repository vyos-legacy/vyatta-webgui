/*
 *  Copyright 2007, Vyatta, Inc.
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
 *  Module:       basic_error_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2007
 *  Description:  Basic class for error code encapsulation.
 *
 */

#ifndef	__INCLUDE_BASIC_ERROR_INFO_HH__
#define __INCLUDE_BASIC_ERROR_INFO_HH__

#define ERROR_NONE 0

#include <string>

class BasicErrorInfo {
public:

	BasicErrorInfo();
	BasicErrorInfo(int line, int codeError);
	BasicErrorInfo(int line, int codeError, const std::string & strDesc);

	int getCodeError() const;
	int getLine() const;
	const std::string & getDesc() const;

	void setInfo(int line, int codeError);
	void setInfo(int line, int codeError, const std::string & strDesc);
	
protected:
	int           m_line;
	int           m_codeError;
	std::string   m_strDesc;
};

#endif

