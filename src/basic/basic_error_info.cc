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
 *  Module:       basic_error_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2007
 *  Description:  Basic class for error code encapsulation.
 *
 */

#include "basic_error_info.hh"

BasicErrorInfo::BasicErrorInfo() : m_line(0), m_codeError(ERROR_NONE) {
}
BasicErrorInfo::BasicErrorInfo(int line, int codeError) : m_line(line), m_codeError(codeError) {
}
BasicErrorInfo::BasicErrorInfo(int line, int codeError, const std::string & strDesc) : m_line(line), m_codeError(codeError), m_strDesc(strDesc) {
}

int BasicErrorInfo::getCodeError() const {
	return m_codeError;
}
int BasicErrorInfo::getLine() const {
	return m_line;
}
const std::string & BasicErrorInfo::getDesc() const {
	return m_strDesc;
}

void BasicErrorInfo::setInfo(int line, int codeError) {
	m_line = line;
	m_codeError = codeError;
}
void BasicErrorInfo::setInfo(int line, int codeError, const std::string & strDesc) {
	m_line = line;
	m_codeError = codeError;
	m_strDesc = strDesc;
}

