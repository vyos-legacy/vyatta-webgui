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
 *  Module:       xorp_mod_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Server-side code for encapsulation of changes to XORP configuration nodes.
 *
 */

#ifndef __XORP_MOD_INFO_HH__
#define __XORP_MOD_INFO_HH__

#include <vector>

#include "common/context_info.hh"
#include "common/mod_info.hh"

#include "rtrmgr/conf_tree.hh"
#include "rtrmgr/conf_tree_node.hh"

class XorpBasicContextInfo : public virtual BasicContextInfo {
public:
	static bool compareIfALessThanB(XorpBasicContextInfo * p_xbciA, XorpBasicContextInfo * p_xbciB);

	XorpBasicContextInfo(const ConfigTreeNode & ctn);
	virtual const std::string & getName() const;
	virtual const std::string & getPath() const;

protected:
	const ConfigTreeNode * m_p_ctn;
};

class XorpBasicContextInfos {
public:
	virtual ~XorpBasicContextInfos();
	XorpBasicContextInfos();

	int getTotal() const;
	virtual void add(XorpBasicContextInfo * p_xbci);
	virtual const XorpBasicContextInfo & get(int index) const;

protected:
	std::vector<XorpBasicContextInfo*> m_vector;
};

class XorpModContextInfo : public virtual ModContextInfo, public virtual XorpBasicContextInfo {
public:
	XorpModContextInfo(
	  const ModType mt,
	  const ConfigTreeNode & ctn,
	  const TemplateTree & tt,
	  const ConfigTree & ctSync,
	  const ConfigTree & ctEdit);

	const ConfigTreeNode * getNode() const;
	const ContextLocation & getConstContextLocation() const;

protected:
	ConfigTreeNode *          m_p_ctnContext;
	ContextLocation           m_cl;

	const TemplateTreeNode *  m_p_ttnContext;
};

class XorpModContextInfos : public XorpBasicContextInfos {
public:
	virtual const XorpModContextInfo & get(int index) const;
};

class XorpModSegment : public ModSegment {
public:
	XorpModSegment();
	XorpModSegment(
	  const bool flagInvalid,
	  const bool flagMissReq,
	  const bool flagMultiCh,
	  const ModType mt,
	  const std::string & strName);

	XorpModSegment * createPath(const ContextLocation & cl, const ModType mt);

protected:
	XorpModSegment * createPath(const ContextLocation & cl, const unsigned int indexSegment, const ModType mt);
	XorpModSegment * findChild(const std::string & strName);
};

#endif

