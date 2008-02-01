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
 *  Module:       nstat_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulating information related to config node changes.
 *
 */



#ifndef __INCLUDE_NSTAT_INFO_HH__
#define	__INCLUDE_NSTAT_INFO_HH__

class NStatInfo {
public:
	NStatInfo();
	NStatInfo(bool flagAdded, bool flagChanged, bool flagDeleted, bool flagInvalid, bool flagMissingMandatory);

	bool getFlagAdded() const;
	bool getFlagChanged() const;
	bool getFlagDeleted() const;
	bool getFlagInvalid() const;
	bool getFlagMissingRequired() const;

	void clear();

	void setFlagAdded(bool flagAdded);
	void setFlagChanged(bool flagChanged);
	void setFlagDeleted(bool flagDeleted);
	void setFlagInvalid(bool flagInvalid);
	void setFlagMissingRequired(bool flagMissingRequired);

protected:
	bool m_flagAdded;
	bool m_flagChanged;
	bool m_flagDeleted;
	bool m_flagInvalid;
	bool m_flagMissingRequired;
};

#endif


