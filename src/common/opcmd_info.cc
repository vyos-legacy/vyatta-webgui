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
 *  Module:       opcmd_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulating operational command information.
 *
 */



#include <iostream>
#include <stdexcept>

#include "opcmd_info.hh"
#include "basic/xgdaemon_util.hh"

BasicCmdSegment::~BasicCmdSegment() {
}
BasicCmdSegment::BasicCmdSegment(unsigned int index) : m_index(index) {
}
BasicCmdSegment::BasicCmdSegment(unsigned int index, const std::string & strName) : m_index(index), m_strName(strName) {
}
unsigned int BasicCmdSegment::getIndex() const {
	return m_index;
}
const std::string & BasicCmdSegment::getName() const {
	return m_strName;
}

ActionSegment::ActionSegment(unsigned int index, const std::string & strName) : BasicCmdSegment(index, strName) {
}

bool ActionSegment::isVariableExpression(std::string & strVariableExpression, int & arg) const {
	strVariableExpression = "";
	arg = -1;

	if (m_strName.length() == 0) return false;
	if (m_strName[0] != '$') return false;

	strVariableExpression = m_strName.substr(1);

	if (XGDaemonUtil::isStrAllDigits(strVariableExpression)) {
		arg = XGDaemonUtil::getValueStrInt(strVariableExpression);
	}
	return true;
}

NOCommandNameSegment::NOCommandNameSegment(unsigned int index, bool flagDynamic) : BasicCmdSegment(index), m_flagDynamic(flagDynamic), m_flagNoValues(false) {
}
NOCommandNameSegment::NOCommandNameSegment(unsigned int index, bool flagDynamic, const std::string & strName) : BasicCmdSegment(index, strName), m_flagDynamic(flagDynamic), m_flagNoValues(false) {
}
bool NOCommandNameSegment::getFlagNoValues() const {
	return m_flagNoValues;
}
bool NOCommandNameSegment::isDynamic() const {
	return m_flagDynamic;
}
void NOCommandNameSegment::addAllowedValue(const std::string & strValue) {
	m_listAllowedValues.push_back(strValue);
}
void NOCommandNameSegment::clearAllowedValues() {
	m_flagNoValues = false;
	m_listAllowedValues.clear();
}
void NOCommandNameSegment::setFlagNoValues() {
	m_flagNoValues = true;
}
const std::list<std::string> & NOCommandNameSegment::getConstListAllowedValues() const {
	return m_listAllowedValues;
}


CommandNameSegment::CommandNameSegment(unsigned int index, bool flagDynamic) : NOCommandNameSegment(index, flagDynamic), m_flagChanged(false) {
}
CommandNameSegment::CommandNameSegment(unsigned int index, bool flagDynamic, const std::string & strName) : NOCommandNameSegment(index, flagDynamic, strName), m_flagChanged(false) {
}
CommandNameSegment::CommandNameSegment(unsigned int index, const std::string & strName, const std::string & strOverride) : NOCommandNameSegment(index, true, strName), m_flagChanged(false) {
	changeTo(strOverride);
}
bool CommandNameSegment::isChanged() const {
	return m_flagChanged;
}
void CommandNameSegment::changeTo(const std::string & strOverride) {
	m_strOverride = strOverride;
	m_flagChanged = true;
}
const std::string & CommandNameSegment::getCommandSegment() const {
	if (m_flagChanged) {
		return m_strOverride;
	} else {
		return m_strName;
	}
}
const std::string & CommandNameSegment::getOverride() const {
	return m_strOverride;
}


OpCmdName::~OpCmdName() {
	clear();
}
OpCmdName::OpCmdName() {
}
OpCmdName::OpCmdName(const std::string & strName, const OpCmd * p_oc) {
	set(strName, p_oc);
}
bool OpCmdName::areAllDynamicCNSEmpty() const {
	bool flagHasDynamic = false;
	for (unsigned int i = 0; i < getTotalSegments(); i++) {
		const CommandNameSegment * p_cns = getConstSegment(i);
		if (p_cns != NULL && p_cns->isDynamic()) {
			flagHasDynamic = true;
			if (p_cns->getCommandSegment().length() > 0) return false;
		}
	}
	return flagHasDynamic;
}
unsigned int OpCmdName::getTotalSegments() const {
	return m_vectorCommandNameSegments.size();
}
void OpCmdName::addSegment(CommandNameSegment * p_cns) {
	if (p_cns == NULL) throw std::logic_error("Expected non-NULL.");
	m_vectorCommandNameSegments[p_cns->getIndex()] = p_cns;
}
void OpCmdName::changeIndexTo(unsigned int index, const std::string & strOverride) {
	CommandNameSegment * p_cns = getSegment(index);
	if (p_cns == NULL) throw std::logic_error("Non-existant index.");
	p_cns->changeTo(strOverride);
}
void OpCmdName::clear() {
	std::vector<CommandNameSegment*>::iterator i = m_vectorCommandNameSegments.begin();
	std::vector<CommandNameSegment*>::iterator iEnd = m_vectorCommandNameSegments.end();
	while (i != iEnd) {
		CommandNameSegment * & p_cns = *i;
		if (p_cns != NULL) delete p_cns;
		p_cns = NULL;
		i++;
	}
	m_vectorCommandNameSegments.clear();	
}
void OpCmdName::clone(const OpCmdName & ocn) {
	clear();
	std::vector<CommandNameSegment*>::const_iterator i = ocn.m_vectorCommandNameSegments.begin();
	const std::vector<CommandNameSegment*>::const_iterator iEnd = ocn.m_vectorCommandNameSegments.end();
	while (i != iEnd) {
		const CommandNameSegment * p_cns = *i;
		CommandNameSegment * p_cnsNew = getNewSegment(p_cns->getIndex(), p_cns->isDynamic(), p_cns->getName());
		if (p_cns->getFlagNoValues()) p_cnsNew->setFlagNoValues();
		const std::list<std::string> & listAllowedValues = p_cnsNew->getConstListAllowedValues();
		std::list<std::string>::const_iterator j = listAllowedValues.begin();
		const std::list<std::string>::const_iterator jEnd = listAllowedValues.end();
		while (j != jEnd) {
			const std::string & strAllowedValue = *j;
			p_cnsNew->addAllowedValue(strAllowedValue);
			j++;
		}
		if (p_cns->isChanged()) {
			p_cnsNew->changeTo(p_cns->getOverride());
		}
		addSegment(p_cnsNew);
		i++;
	}	
}
void OpCmdName::processLineCommandName(const std::string & strLine, const OpCmd * p_oc) {
	m_vectorCommandNameSegments.clear();

	std::list<std::string> listNames;
	XGDaemonUtil::split_string(strLine, ' ', listNames, false);

	int totalPushed = 0;

	std::list<std::string>::const_iterator i = listNames.begin();
	const std::list<std::string>::const_iterator iEnd = listNames.end();
	while (i != iEnd) {
		bool flagDynamic = false;
		if (p_oc != NULL) {
			flagDynamic = p_oc->determineIfCNSDynamic(totalPushed);
		}
		m_vectorCommandNameSegments.push_back(getNewSegment(totalPushed, flagDynamic, *i));
		totalPushed++;
		i++;
	}	
}
void OpCmdName::retrCommandLine(std::string & strCommandLine) const {
	strCommandLine.clear();

	std::list<std::string> listCommandLine;
	retrListCommandLine(listCommandLine);

	std::list<std::string>::const_iterator i = listCommandLine.begin();
	const std::list<std::string>::const_iterator iBegin = i;
	const std::list<std::string>::const_iterator iEnd = listCommandLine.end();
	while (i != iEnd) {
		if (i != iBegin) strCommandLine += ' ';
		strCommandLine += *i;
		i++;
	}
}
void OpCmdName::retrListCommandLine(std::list<std::string> & listCommandLine) const {
	listCommandLine.clear();
	for (unsigned int i = 0; i < getTotalSegments(); i++) {
		const CommandNameSegment * p_cns = getConstSegment(i);
		if (p_cns != NULL) listCommandLine.push_back(p_cns->getCommandSegment());
	}
}
void OpCmdName::set(const std::string & strName, const OpCmd * p_oc) {
	processLineCommandName(strName, p_oc);
}
CommandNameSegment * OpCmdName::getNewSegment(unsigned int index, bool flagDynamic, const std::string & strName) {
	return new CommandNameSegment(index, flagDynamic, strName);
}
CommandNameSegment * OpCmdName::getSegment(unsigned int index) {
	if (index >= m_vectorCommandNameSegments.size()) return NULL;
	return m_vectorCommandNameSegments[index];
}
std::string OpCmdName::getName() const {
	std::string strName;
	std::vector<CommandNameSegment*>::const_iterator i = m_vectorCommandNameSegments.begin();
	std::vector<CommandNameSegment*>::const_iterator iEnd = m_vectorCommandNameSegments.end();
	while (i != iEnd) {
		const CommandNameSegment * p_cns = *i;
		if (p_cns != NULL) {
			if (strName.length() > 0) strName += ' ';
			strName += p_cns->getName();
		}
		i++;
	}

	return strName;
}
std::string OpCmdName::getNameSegment(unsigned int index) const {
	if (index < m_vectorCommandNameSegments.size()) {
		const CommandNameSegment * p_cns = m_vectorCommandNameSegments[index];
		if (p_cns == NULL) {
			return XGDaemonUtil::getBlankString();
		} else {
			return p_cns->getName();
		}
	} else {
		return XGDaemonUtil::getBlankString();
	}
}
const CommandNameSegment * OpCmdName::getConstSegment(unsigned int index) const {
	if (index >= m_vectorCommandNameSegments.size()) return NULL;
	return m_vectorCommandNameSegments[index];
}


OpCmd::~OpCmd() {
}
OpCmd::OpCmd() : m_oct(OCT_REGULAR) {
}
OpCmd::OpCmd(const std::string & strName, const std::string & strHelpString, const std::string & strAction, const std::string & strModule, OpCmdType oct)  : m_oct(oct) {
	set(strName, strHelpString, strAction, strModule);
}
bool OpCmd::determineIfCNSDynamic(unsigned int indexCheck) const {
	std::list<ActionSegment>::const_iterator i = m_listActionSegments.begin();
	const std::list<ActionSegment>::const_iterator iEnd = m_listActionSegments.end();
	while (i != iEnd) {
		std::string strVariableExpression;
		int arg = -1;
		if (i->isVariableExpression(strVariableExpression, arg)) {
			if (arg > 0) {
				unsigned int index = arg - 1;
				if (index == indexCheck) return true; 
			}
		}
		i++;
	}
	return false;
}
bool OpCmd::hasDynamicParts() const {
	for (unsigned int i = 0; i < m_ocn.getTotalSegments(); i++) {
		const NOCommandNameSegment * p_nocns = m_ocn.getConstSegment(i);
		if (p_nocns != NULL && p_nocns->isDynamic()) return true;
	}
	return false;
}
void OpCmd::processLineAction(const std::string & strLine) {
	m_listActionSegments.clear();

	std::list<std::string> listNames;
	XGDaemonUtil::split_string(strLine, ' ', listNames, false);

	int totalPushed = 0;

	std::list<std::string>::const_iterator i = listNames.begin();
	const std::list<std::string>::const_iterator iEnd = listNames.end();
	while (i != iEnd) {
		m_listActionSegments.push_back(ActionSegment(totalPushed, *i));
		totalPushed++;
		i++;
	}
}
void OpCmd::retrAction(std::string & strAction) const {
	strAction.clear();

	std::list<std::string> listAction;
	retrListAction(listAction);
	std::list<std::string>::const_iterator i = listAction.begin();
	const std::list<std::string>::const_iterator iBegin = i;
	const std::list<std::string>::const_iterator iEnd = listAction.end();
	while (i != iEnd) {
		if (i != iBegin) strAction += ' ';
		strAction += *i;
		i++;
	}
}
void OpCmd::retrListAction(std::list<std::string> & listAction) const {
	listAction.clear();

	std::list<ActionSegment>::const_iterator i = m_listActionSegments.begin();
	const std::list<ActionSegment>::const_iterator iEnd = m_listActionSegments.end();

	while (i != iEnd) {
		const ActionSegment & as = *i;
		std::string strVariableExpression;
		int arg;
		if (as.isVariableExpression(strVariableExpression, arg)) {
			if (arg > 0) {
				int indexCommandName = arg - 1;
				const CommandNameSegment * p_cns = m_ocn.getConstSegment(indexCommandName);
				if (p_cns != NULL) {
					if (p_cns->isChanged()) {
						listAction.push_back(p_cns->getCommandSegment());
					} else {
						listAction.push_back(as.getName());
					}
				}
			} else {
				listAction.push_back(as.getName());
			}
		} else {
			listAction.push_back(as.getName());
		}
		i++;
	}
}
void OpCmd::retrListUserInputUnsatisfied(std::list<std::pair<int, std::string> > & listUnsatisfied) const {
	listUnsatisfied.clear();

	std::list<ActionSegment>::const_iterator i = m_listActionSegments.begin();
	const std::list<ActionSegment>::const_iterator iEnd = m_listActionSegments.end();

	while (i != iEnd) {
		const ActionSegment & as = *i;
		std::string strVariableExpression;
		int arg;
		if (as.isVariableExpression(strVariableExpression, arg)) {
			if (arg > 0) {
				int indexCommandName = arg - 1;
				const CommandNameSegment * p_cns = m_ocn.getConstSegment(indexCommandName);
				if (p_cns != NULL && p_cns->getCommandSegment().length() == 0) {
					listUnsatisfied.push_back(std::pair<int, std::string>(indexCommandName, p_cns->getName()));
				}
			}
		}
		i++;
	}
}
void OpCmd::set(const std::string & strName, const std::string & strHelpString, const std::string & strAction, const std::string & strModule) {
	m_strHelpString = strHelpString;
	m_strAction = strAction;
	m_strModule = strModule;

	processLineAction(strAction);
	m_ocn.set(strName, this);
}
void OpCmd::setType(OpCmdType oct) {
	m_oct = oct;
}
OpCmdType OpCmd::getType() const {
	return m_oct;
}
const std::string & OpCmd::getAction() const {
	return m_strAction;
}
const std::string & OpCmd::getHelpString() const {
	return m_strHelpString;
}
const std::string & OpCmd::getModule() const {
	return m_strModule;
}
const OpCmdName & OpCmd::getConstOpCmdName() const {
	return m_ocn;
}


