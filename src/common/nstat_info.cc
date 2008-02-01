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
 *  Module:       nstat_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulating information related to config node changes.
 *
 */


#include "nstat_info.hh"

NStatInfo::NStatInfo() {
	clear();
}
NStatInfo::NStatInfo(bool flagAdded, bool flagChanged, bool flagDeleted, bool flagInvalid, bool flagMissingRequired) : m_flagAdded(flagAdded), m_flagChanged(flagChanged), m_flagDeleted(flagDeleted), m_flagInvalid(flagInvalid), m_flagMissingRequired(flagMissingRequired) {
}
bool NStatInfo::getFlagAdded() const {
	return m_flagAdded;
}
bool NStatInfo::getFlagChanged() const {
	return m_flagChanged;
}
bool NStatInfo::getFlagDeleted() const {
	return m_flagDeleted;
}
bool NStatInfo::getFlagInvalid() const {
	return m_flagInvalid;
}
bool NStatInfo::getFlagMissingRequired() const {
	return m_flagMissingRequired;
}
void NStatInfo::clear() {
	m_flagAdded = false;
	m_flagChanged = false;
	m_flagDeleted = false;
	m_flagInvalid = false;
	m_flagMissingRequired = false;
}
void NStatInfo::setFlagAdded(bool flagAdded) {
	m_flagAdded = flagAdded;
}
void NStatInfo::setFlagChanged(bool flagChanged) {
	m_flagChanged = flagChanged;
}
void NStatInfo::setFlagDeleted(bool flagDeleted) {
	m_flagDeleted = flagDeleted;
}
void NStatInfo::setFlagInvalid(bool flagInvalid) {
	m_flagInvalid = flagInvalid;
}
void NStatInfo::setFlagMissingRequired(bool flagMissingRequired) {
	m_flagMissingRequired = flagMissingRequired;
}


