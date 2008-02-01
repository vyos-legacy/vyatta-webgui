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
 *  Module:       xorp_mod_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Server-side code for encapsulation of changes to XORP configuration nodes.
 *
 */

#include <stdexcept>

#include "xgdaemon_module.hh"

#include "xorp_mod_info.hh"

#include "basic/xgdaemon_util.hh"
#include "xgdaemon_xorp_util.hh"

XorpBasicContextInfo::XorpBasicContextInfo(const ConfigTreeNode & ctn) : m_p_ctn(&ctn) {
}
bool XorpBasicContextInfo::compareIfALessThanB(XorpBasicContextInfo * p_xbciA, XorpBasicContextInfo * p_xbciB) {
	return XGDaemonUtil::compareIfALessThanB(p_xbciA->getName(), p_xbciB->getName());
}
const std::string & XorpBasicContextInfo::getName() const {
	if (m_p_ctn != NULL) return m_p_ctn->segname();
	return XGDaemonUtil::getBlankString();
}
const std::string & XorpBasicContextInfo::getPath() const {
	if (m_p_ctn != NULL) return m_p_ctn->path();
	return XGDaemonUtil::getBlankString();
}
XorpBasicContextInfos::~XorpBasicContextInfos() {
	std::vector<XorpBasicContextInfo*>::iterator i = m_vector.begin();
	const std::vector<XorpBasicContextInfo*>::const_iterator iEnd = m_vector.end();
	while (i != iEnd) {
		XorpBasicContextInfo * & p_xbci = *i;
		if (p_xbci != NULL) {
			delete  p_xbci;
			p_xbci = NULL;
		}
		i++;
	}
}
XorpBasicContextInfos::XorpBasicContextInfos() {
}
int XorpBasicContextInfos::getTotal() const {
	return m_vector.size();
}
void XorpBasicContextInfos::add(XorpBasicContextInfo * p_xbci) {
	m_vector.push_back(p_xbci);
}
const XorpBasicContextInfo & XorpBasicContextInfos::get(int index) const {
	return *m_vector[index];
}

XorpModContextInfo::XorpModContextInfo(
	const ModType mt,
	const ConfigTreeNode & ctn, 
	const TemplateTree & tt,
	const ConfigTree & ctSync,
	const ConfigTree & ctEdit)
	:
	ModContextInfo(mt),
	XorpBasicContextInfo(ctn),
	m_p_ctnContext(NULL),
	m_p_ttnContext(NULL)
	{
	std::list<PSegment> listPath;
	XGDaemonXorpUtil::retrPSegments(listPath, ctn);
	if (XGDaemonXorpUtil::setContextLocationToPathSegments(
			  m_cl,
			  listPath,
			  tt,
			  ctSync,
			  ctEdit,
			  m_p_ttnContext,
			  m_p_ctnContext,
			  false) == false) throw std::logic_error("Expected context to exist.");
}
const ConfigTreeNode * XorpModContextInfo::getNode() const {
	return m_p_ctn;
}
const ContextLocation & XorpModContextInfo::getConstContextLocation() const {
	return m_cl;
}
const XorpModContextInfo & XorpModContextInfos::get(int index) const {
	return dynamic_cast<const XorpModContextInfo&>(XorpBasicContextInfos::get(index));
}

XorpModSegment::XorpModSegment() : ModSegment() {
}
XorpModSegment::XorpModSegment(
	const bool flagInvalid,
	const bool flagMissReq,
	const bool flagMultiCh,
	const ModType mt,
	const std::string & strName)
	:
	ModSegment(flagInvalid, flagMissReq, flagMultiCh, mt, strName) {
}
XorpModSegment * XorpModSegment::createPath(const ContextLocation & cl, const ModType mt) {
	return createPath(cl, 0, mt);
}
XorpModSegment * XorpModSegment::createPath(const ContextLocation & cl, const unsigned int indexSegment, const ModType mt) {
	const ContextSegment & cs = cl.getContextSegment(indexSegment);
	const ContextSegment * p_csNext = NULL;
	if (indexSegment < cl.getLength() - 1) {
		p_csNext = &cl.getContextSegment(indexSegment+1);
	}

	const std::string & strSegmentName = cs.getName();

	XorpModSegment * p_xmsChild = findChild(strSegmentName);
	if (p_xmsChild == NULL) {
		ModType mtChild = MOD_NONE;
		if (indexSegment == cl.getLength() - 1) mtChild = mt;
		p_xmsChild = new XorpModSegment(
		                   cs.getNStatInfo().getFlagInvalid(),
		                   cs.getNStatInfo().getFlagMissingRequired(),
				   (p_csNext != NULL && p_csNext->getFlagMulti()),
				   mtChild,
				   strSegmentName);
		m_listChildren.push_back(p_xmsChild);
	}
	if (indexSegment < cl.getLength() - 1) {
		return p_xmsChild->createPath(cl, indexSegment + 1, mt);
	} else {
		return p_xmsChild;
	}
}
XorpModSegment * XorpModSegment::findChild(const std::string & strName) {
	return dynamic_cast<XorpModSegment*>(ModSegment::findChild(strName));
}
