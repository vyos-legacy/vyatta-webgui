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
 *  Module:       sub_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Encapsulation of data related to sub-nodes
 *
 */


#ifndef __INCLUDE_SUB_INFO_HH__
#define	__INCLUDE_SUB_INFO_HH__

class SubInfo {
public:
	SubInfo();
	SubInfo(bool flagHasAddedChildren, bool flagHasChangedChildren, bool flagHasDeletedChildren, bool flagHasInvalidChildren);

	bool getFlagHasAddedChildren() const;
	bool getFlagHasChangedChildren() const;
	bool getFlagHasDeletedChildren() const;
	bool getFlagHasInvalidChildren() const;
	bool getFlagHasMissingRequiredChildren() const;

	void clear();
	void setFlagHasAddedChildren(bool flagHasAddedChildren);
	void setFlagHasChangedChildren(bool flagHasDeletedChildren);
	void setFlagHasDeletedChildren(bool flagHasDeletedChildren);
	void setFlagHasInvalidChildren(bool flagHasInvalidChildren);
	void setFlagHasMissingRequiredChildren(bool flagHasMissingMandatoryChildren);

protected:
	bool m_flagHasAddedChildren;
	bool m_flagHasChangedChildren;
	bool m_flagHasDeletedChildren;
	bool m_flagHasInvalidChildren;
	bool m_flagHasMissingRequiredChildren;
};

#endif

