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
 *  Module:       sub_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Encapsulation of data related to sub-nodes
 *
 */


#include "sub_info.hh"

SubInfo::SubInfo() {
	clear();
}
SubInfo::SubInfo(bool flagHasAddedChildren, bool flagHasChangedChildren, bool flagHasDeletedChildren, bool flagHasInvalidChildren)
	:
	m_flagHasAddedChildren(flagHasAddedChildren),
	m_flagHasChangedChildren(flagHasChangedChildren), 
	m_flagHasDeletedChildren(flagHasDeletedChildren),
	m_flagHasInvalidChildren(flagHasInvalidChildren) {
}
bool SubInfo::getFlagHasAddedChildren() const {
	return m_flagHasAddedChildren;
}
bool SubInfo::getFlagHasChangedChildren() const {
	return m_flagHasChangedChildren;
}
bool SubInfo::getFlagHasDeletedChildren() const {
	return m_flagHasDeletedChildren;
}
bool SubInfo::getFlagHasInvalidChildren() const {
	return m_flagHasInvalidChildren;
}
bool SubInfo::getFlagHasMissingRequiredChildren() const {
	return m_flagHasMissingRequiredChildren;
}
void SubInfo::clear() {
	m_flagHasAddedChildren = false;
	m_flagHasChangedChildren = false;
	m_flagHasDeletedChildren = false;
	m_flagHasInvalidChildren = false;
	m_flagHasMissingRequiredChildren = false;
}
void SubInfo::setFlagHasAddedChildren(bool flagHasAddedChildren) {
	m_flagHasAddedChildren = flagHasAddedChildren;
}
void SubInfo::setFlagHasChangedChildren(bool flagHasChangedChildren) {
	m_flagHasChangedChildren = flagHasChangedChildren;
}
void SubInfo::setFlagHasDeletedChildren(bool flagHasDeletedChildren) {
	m_flagHasDeletedChildren = flagHasDeletedChildren;
}
void SubInfo::setFlagHasInvalidChildren(bool flagHasInvalidChildren) {
	m_flagHasInvalidChildren = flagHasInvalidChildren;
}
void SubInfo::setFlagHasMissingRequiredChildren(bool flagHasMissingRequiredChildren) {
	m_flagHasMissingRequiredChildren = flagHasMissingRequiredChildren;
}

