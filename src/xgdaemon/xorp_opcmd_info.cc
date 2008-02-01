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
 *  Module:       xorp_node_info.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Server-side code for encapsulation of XORP operational commands
 *
 */

#include "xgdaemon_module.hh"

#include <iostream>

#include "basic/xgdaemon_util.hh"

#include "xorp_opcmd_info.hh"
#include "xgdaemon_xorp_util.hh"

XorpOpCmd::XorpOpCmd(OpCommand & oc, const ConfigTree & ctSync) : OpCmd(oc.command_name(), oc.help_string(), oc.command_action(), oc.module(), OCT_REGULAR), m_oc(oc) {
	determineAllowedValues(ctSync);
}
XorpOpCmd::XorpOpCmd(OpCommand & oc, const ConfigTree & ctSync, const std::string & strName, const std::string & strAction, OpCmdType oct) : OpCmd(strName, oc.help_string(), strAction, oc.module(), oct), m_oc(oc) {
	determineAllowedValues(ctSync);
}
unsigned long XorpOpCmd::getId() const {
	return (unsigned long)((const void*)this);
}
void XorpOpCmd::determineAllowedValues(const ConfigTree & ctSync) {
	for (unsigned int i = 0; i < m_ocn.getTotalSegments(); i++) {
		CommandNameSegment * p_cns = m_ocn.getSegment(i);
		if (p_cns != NULL && p_cns->isDynamic()) {
			const std::string & strName = p_cns->getName();
			if (XGDaemonXorpUtil::isXorpVariableExpression(strName)) {
				setType(OCT_NON_EXPANDED);

				std::string strExpressionBody = strName.substr(2, strName.length() - 3);

				std::list<const ConfigTreeNode*> listMatches;
				XGDaemonXorpUtil::retrListMatches(ctSync, strExpressionBody, listMatches);

				p_cns->clearAllowedValues();
				if (listMatches.size() == 0) {
					p_cns->setFlagNoValues();
				} else {
					std::list<const ConfigTreeNode*>::const_iterator j = listMatches.begin();
					const std::list<const ConfigTreeNode*>::const_iterator jEnd = listMatches.end();

					while (j != jEnd) {
						const ConfigTreeNode * p_ctn = *j;
						if (p_ctn != NULL) {
							if (XGDaemonXorpUtil::isMultiNode(*p_ctn)) {
								p_cns->addAllowedValue(p_ctn->segname());
							} else {
								if (p_ctn->has_value()) {
									p_cns->addAllowedValue(p_ctn->value());
								}
							}
						}
						j++;
					}
				}
			}
		}
	}
}
void XorpOpCmd::retrCommandLine(const std::list<std::string> & listCommandLine, std::string & strCommandLine) const {
	strCommandLine.clear();
	std::list<std::string>::const_iterator i = listCommandLine.begin();
	const std::list<std::string>::const_iterator iBegin = i;
	const std::list<std::string>::const_iterator iEnd = listCommandLine.end();
	while (i != iEnd) {
		const std::string & strSegment = *i;

		if (i != iBegin) strCommandLine += ' ';
		strCommandLine += strSegment;

		i++;
	}
}
void XorpOpCmd::retrListCommandLine(std::list<std::string> & listCommandLine) const {
	listCommandLine.clear();

	for (unsigned int i = 0; i < m_ocn.getTotalSegments(); i++) {
		const CommandNameSegment * p_cns = m_ocn.getConstSegment(i);
		if (p_cns != NULL) {
			std::string strSet;
			if (p_cns->isDynamic() && p_cns->isChanged()) {
				strSet = p_cns->getOverride();
			} else {
				strSet = p_cns->getName();
			}

			if (strSet.length() == 0) break;

			listCommandLine.push_back(strSet);
		}
	}
}
OpCommand & XorpOpCmd::getOpCommand() {
	return m_oc;
}
const OpCommand & XorpOpCmd::getConstOpCommand() const {
	return m_oc;
}
const std::string & XorpOpCmd::getCachedCommandLine() const {
	return m_strCachedCommandLine;
}

ModXorpOpCmd::ModXorpOpCmd(OpCommand & oc, const ConfigTree & ctSync) : XorpOpCmd(oc, ctSync) {
}
ModXorpOpCmd::ModXorpOpCmd(OpCommand & oc, const ConfigTree & ctSync, const std::string & strName, const std::string & strAction, OpCmdType oct) : XorpOpCmd(oc, ctSync, strName, strAction, oct) {
}
unsigned long ModXorpOpCmd::getId() const {
	return 0;
}
OpCmdName & ModXorpOpCmd::getOpCmdName() {
	return m_ocn;
}

ExecutableXorpOpCmd::ExecutableXorpOpCmd(OpCommand & oc, const ConfigTree & ctSync) : ModXorpOpCmd(oc, ctSync) {
}
ExecutableXorpOpCmd::ExecutableXorpOpCmd(OpCommand & oc, const ConfigTree & ctSync, const std::string & strName, const std::string & strAction, OpCmdType oct) : ModXorpOpCmd(oc, ctSync, strName, strAction, oct) {
}
OpInstance * ExecutableXorpOpCmd::execute(EventLoop& eventloop, RouterCLI::OpModePrintCallback print_cb, RouterCLI::OpModeDoneCallback done_cb) {
	std::list<std::string> listCommandLine;
	retrListCommandLine(listCommandLine);
	retrCommandLine(listCommandLine, m_strCachedCommandLine);
	return m_oc.execute(eventloop, listCommandLine, print_cb, done_cb);
}


XorpOpCmds::~XorpOpCmds() {
	clear();
}
XorpOpCmds::XorpOpCmds() {
}
unsigned long XorpOpCmds::doExpand(ModXorpOpCmd & mxocBase, std::vector<CommandNameSegment*>::size_type pos, unsigned long totalAllowedHops, OpCommand & oc, const ConfigTree & ctSync) {
	OpCmdName & ocn = mxocBase.getOpCmdName();
	if (pos == ocn.getTotalSegments()) {
		if (totalAllowedHops > 0) {
			std::string strCommandLine;
			ocn.retrCommandLine(strCommandLine);

			std::string strAction;
			mxocBase.retrAction(strAction);

			XorpOpCmd * p_xocExpanded = new XorpOpCmd(oc, ctSync, strCommandLine, strAction, OCT_EXPANDED);
			m_cmdsExtra.push_back(p_xocExpanded);

			return 1;
		} else {
			return 0;
		}
	} else {
		unsigned long totalExpanded = 0;
		CommandNameSegment * p_cns = ocn.getSegment(pos);
		if (p_cns != NULL && !p_cns->getFlagNoValues()) {
			const std::list<std::string> & listAllowedValues = p_cns->getConstListAllowedValues();
			if (listAllowedValues.size() == 0) {
				totalExpanded += doExpand(mxocBase, pos + 1, totalAllowedHops, oc, ctSync);
			} else {
				std::list<std::string>::const_iterator i = listAllowedValues.begin();
				const std::list<std::string>::const_iterator iEnd = listAllowedValues.end();
				while (i != iEnd) {
					p_cns->changeTo(*i);
					totalExpanded += doExpand(mxocBase, pos + 1, totalAllowedHops + 1, oc, ctSync);
					i++;
				}
			}
		}
		return totalExpanded;
	}
}
void XorpOpCmds::checkBasicList(const ConfigTree & ctSync) {
	std::list<XorpOpCmd*>::const_iterator i = m_cmdsBasic.begin();
	std::list<XorpOpCmd*>::const_iterator iEnd = m_cmdsBasic.end();
	while (i != iEnd) {
		XorpOpCmd * p_xoc = *i;
		if (p_xoc != NULL) {
			p_xoc->determineAllowedValues(ctSync);
		}
		i++;
	}
}
void XorpOpCmds::clear() {
	clearList(m_cmdsBasic);
	clearList(m_cmdsExtra);
}
void XorpOpCmds::clearList(std::list<XorpOpCmd*> & cmds) {
	std::list<XorpOpCmd*>::iterator i = cmds.begin();
	const std::list<XorpOpCmd*>::const_iterator iEnd = cmds.end();
	while (i != iEnd) {
		XorpOpCmd * p_xoc = *i;
		if (p_xoc != NULL) {
			delete p_xoc;
			*i = NULL;
		}
		i++;
	}
	cmds.clear();
}
void XorpOpCmds::loadBasicList(OpCommandList & ocl, const ConfigTree & ctSync) {
	const std::list<OpCommand*> & listOC = ocl.op_commands();
	std::list<OpCommand*>::const_iterator i = listOC.begin();
	const std::list<OpCommand*>::const_iterator iEnd = listOC.end();
	while (i != iEnd) {
		OpCommand * p_oc = *i;
		if (p_oc != NULL) {
			XorpOpCmd * p_xoc = new XorpOpCmd(*p_oc, ctSync);
			m_cmdsBasic.push_back(p_xoc);
		}
		i++;
	}
}
void XorpOpCmds::loadExtraList(const ConfigTree & ctSync) {
	std::list<XorpOpCmd*>::const_iterator i = m_cmdsBasic.begin();
	std::list<XorpOpCmd*>::const_iterator iEnd = m_cmdsBasic.end();
	while (i != iEnd) {
		XorpOpCmd * p_xoc = *i;
		if (p_xoc != NULL && p_xoc->hasDynamicParts()) {
			ExecutableXorpOpCmd exoc(p_xoc->getOpCommand(), ctSync, p_xoc->getConstOpCmdName().getName(), p_xoc->getAction(), p_xoc->getType());
			doExpand(exoc, 0, 0, p_xoc->getOpCommand(), ctSync);
		}
		i++;
	}
}
void XorpOpCmds::processLists(OpCommandList & ocl, const ConfigTree & ctSync) {
	if (m_cmdsBasic.size() == 0) {
		loadBasicList(ocl, ctSync);
	} else {
		checkBasicList(ctSync);
	}

	clearList(m_cmdsExtra);
	loadExtraList(ctSync);
}
const std::list<XorpOpCmd*> & XorpOpCmds::getConstListBasic() const {
	return m_cmdsBasic;
}
const std::list<XorpOpCmd*> & XorpOpCmds::getConstListExtra() const {
	return m_cmdsExtra;
}
XorpOpCmd * XorpOpCmds::findXorpOpCmd(unsigned long command_id) {
	XorpOpCmd * p_xoc = findXorpOpCmd(m_cmdsBasic, command_id);
	if (p_xoc != NULL) return p_xoc;
	return findXorpOpCmd(m_cmdsExtra, command_id);
}
XorpOpCmd * XorpOpCmds::findXorpOpCmd(std::list<XorpOpCmd*> & cmds, unsigned long command_id) {
	std::list<XorpOpCmd*>::iterator i = cmds.begin();
	const std::list<XorpOpCmd*>::const_iterator iEnd = cmds.end();
	while (i != iEnd) {
		XorpOpCmd * p_xoc = *i;
		if (p_xoc != NULL && p_xoc->getId() == command_id) return p_xoc;
		i++;
	}
	return NULL;
}
XorpOpCmd * XorpOpCmds::findXorpOpCmdByName(const std::string & strCommandName) {
	std::list<std::string> listCmdParts;
	XGDaemonUtil::split_string(strCommandName, ' ', listCmdParts);
	return findXorpOpCmdByParts(listCmdParts);
}
XorpOpCmd * XorpOpCmds::findXorpOpCmdByParts(const std::list<std::string> & listCmdParts) {
	XorpOpCmd * p_xoc = findXorpOpCmdByParts(m_cmdsBasic, listCmdParts);
	if (p_xoc != NULL) return p_xoc;
	return findXorpOpCmdByParts(m_cmdsExtra, listCmdParts);
}
XorpOpCmd * XorpOpCmds::findXorpOpCmdByParts(std::list<XorpOpCmd*> & cmds, const std::list<std::string> & listCmdParts) {
	std::vector<std::string> vectorCmdParts(listCmdParts.size());

	std::list<std::string>::const_iterator i = listCmdParts.begin();
	std::list<std::string>::const_iterator iEnd = listCmdParts.end();
	unsigned long counter = 0;
	while (i != iEnd) {
		const std::string & strPart = *i;
		vectorCmdParts[counter] = strPart;
		i++;
		counter++;
	}
	return findXorpOpCmdByParts(cmds, vectorCmdParts);
}
XorpOpCmd * XorpOpCmds::findXorpOpCmdByParts(std::list<XorpOpCmd*> & cmds, const std::vector<std::string> & vectorCmdParts) {
	std::list<XorpOpCmd*>::const_iterator i = cmds.begin();
	const std::list<XorpOpCmd*>::const_iterator iEnd = cmds.end();	
	while (i != iEnd) {
		XorpOpCmd * p_xoc = *i;
		if (p_xoc != NULL) {
			bool flagCommandMatches = true;
			const OpCmdName & ocn = p_xoc->getConstOpCmdName();
			unsigned long counter = 0;
			for (unsigned int j = 0; j < ocn.getTotalSegments() && counter < vectorCmdParts.size(); j++, counter++) {
				const CommandNameSegment * p_cns = ocn.getConstSegment(j);
				if (p_cns != NULL && p_cns->getName() != vectorCmdParts[counter]) {
					flagCommandMatches = false;
					break;
				}
			}
			if (counter == vectorCmdParts.size() && flagCommandMatches == true) return p_xoc;
		}
		i++;
	}
	return NULL;
}

