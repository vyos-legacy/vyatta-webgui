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
 *  Module:       mod_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulating configuration node information.
 *
 */


#ifndef __MOD_INFO_HH__
#define __MOD_INFO_HH__

#include <string>
#include <list>

class BasicContextInfo {
public:
	virtual ~BasicContextInfo();
	BasicContextInfo();

	virtual const std::string & getPath() const = 0;

};

enum ModType {
	MOD_NONE = 0,
	MOD_ADDED,
	MOD_CHANGED,
	MOD_DELETED,
	MOD_MISSING
};

class ModContextInfo : public virtual BasicContextInfo {
public:
	virtual ~ModContextInfo();
	ModContextInfo(const ModType mt);

	ModType getModType() const;

protected:
	ModType m_mt;
};

class ModSegment {
public:
	virtual ~ModSegment();
	ModSegment();
	ModSegment(
	  const bool flagInvalid,
	  const bool flagMissReq,
	  const bool flagMultiCh,
	  const ModType mt,
	  const std::string & strName);

	bool getFlagInvalid() const;
	bool getFlagMissReq() const;
	bool getFlagMultiCh() const;
	bool hasValue() const;
	void pushSegment(ModSegment * ms);
	void setValue(const std::string & strValue);

	ModType getModType() const;

	const std::list<ModSegment*> & getConstChildren() const;
	const std::string & getName() const;
	const std::string & getValue() const;

protected:
	std::list<ModSegment*>  m_listChildren;
	bool                    m_flagInvalid;
	bool                    m_flagMissReq;
	bool                    m_flagMultiCh;
	ModType                 m_mt;
	std::string             m_strName;

	bool                    m_flagHasValue;
	std::string             m_strValue;

	virtual ModSegment * findChild(const std::string & strName);
};

#endif


