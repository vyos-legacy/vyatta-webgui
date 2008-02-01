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
 *  Module:       mod_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulating configuration node information.
 *
 */


#include "mod_info.hh"

BasicContextInfo::~BasicContextInfo() {
}
BasicContextInfo::BasicContextInfo() {
}

ModContextInfo::~ModContextInfo() {
}

ModContextInfo::ModContextInfo(const ModType mt) : m_mt(mt) {
}
ModType ModContextInfo::getModType() const {
	return m_mt;
}

ModSegment::~ModSegment() {
	std::list<ModSegment*>::iterator i = m_listChildren.begin();
	std::list<ModSegment*>::iterator iEnd = m_listChildren.end();
	while (i != iEnd) {
		ModSegment * p_msChild = *i;
		if (p_msChild != NULL) delete p_msChild;
		i++;
	}
}
ModSegment::ModSegment()
	:
	m_flagInvalid(false),
	m_flagMissReq(false),
	m_flagMultiCh(false),
	m_mt(MOD_NONE) {
}
ModSegment::ModSegment(
	const bool flagInvalid,
	const bool flagMissReq,
	const bool flagMultiCh,
	const ModType mt,
	const std::string & strName)
	:
	m_flagInvalid(flagInvalid),
	m_flagMissReq(flagMissReq),
	m_flagMultiCh(flagMultiCh),
	m_mt(mt),
	m_strName(strName),
	m_flagHasValue(false) {

}
bool ModSegment::getFlagInvalid() const {
	return m_flagInvalid;
}
bool ModSegment::getFlagMissReq() const {
	return m_flagMissReq;
}
bool ModSegment::getFlagMultiCh() const {
	return m_flagMultiCh;
}
bool ModSegment::hasValue() const {
	return m_flagHasValue;
}
void ModSegment::pushSegment(ModSegment * ms) {
	m_listChildren.push_back(ms);
}
void ModSegment::setValue(const std::string & strValue) {
	m_strValue = strValue;
	m_flagHasValue = true;
}
ModSegment * ModSegment::findChild(const std::string & strName) {
	std::list<ModSegment*>::iterator i = m_listChildren.begin();
	std::list<ModSegment*>::iterator iEnd = m_listChildren.end();
	while (i != iEnd) {
		ModSegment * p_msChild = *i;
		if (p_msChild != NULL && p_msChild->getName() == strName) return p_msChild;
		i++;
	}
	return NULL;
}
ModType ModSegment::getModType() const {
	return m_mt;
}
const std::list<ModSegment*> & ModSegment::getConstChildren() const {
	return m_listChildren;
}
const std::string & ModSegment::getName() const {
	return m_strName;
}
const std::string & ModSegment::getValue() const {
	return m_strValue;
}

