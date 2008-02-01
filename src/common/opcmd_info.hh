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
 *  Module:       opcmd_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulating operational command information.
 *
 */


#ifndef __INCLUDE_OPCMD_INFO_HH__
#define __INCLUDE_OPCMD_INFO_HH__


#include <list>
#include <vector>
#include <string>

typedef enum OpCmdType {
	OCT_REGULAR = 0,
	OCT_EXPANDED,
	OCT_NON_EXPANDED
};

class BasicCmdSegment {
public:
	virtual ~BasicCmdSegment();
	BasicCmdSegment(unsigned int index);
	BasicCmdSegment(unsigned int index, const std::string & strName);
	unsigned int getIndex() const;
	const std::string & getName() const;
protected:
	unsigned int  m_index;
	std::string   m_strName;
};

class ActionSegment : public BasicCmdSegment {
public:
	ActionSegment(unsigned int index, const std::string & strName);

	bool isVariableExpression(std::string & strVariableExpression, int & arg) const;
};

class NOCommandNameSegment : public BasicCmdSegment {
public:
	NOCommandNameSegment(unsigned int index, bool flagDynamic);
	NOCommandNameSegment(unsigned int index, bool flagDynamic, const std::string & strName);

	bool getFlagNoValues() const;
	bool isDynamic() const;
	void addAllowedValue(const std::string & strValue);
	void clearAllowedValues();
	void setFlagNoValues();

	const std::list<std::string> & getConstListAllowedValues() const;

protected:
	bool                    m_flagDynamic;
	bool                    m_flagNoValues;
	std::list<std::string>  m_listAllowedValues;
};

class CommandNameSegment : public NOCommandNameSegment {
public:
	CommandNameSegment(unsigned int index, bool flagDynamic);
	CommandNameSegment(unsigned int index, bool flagDynamic, const std::string & strName);
	CommandNameSegment(unsigned int index, const std::string & strName, const std::string & strOverride);

	bool isChanged() const;
	void changeTo(const std::string & strOverride);
	const std::string & getCommandSegment() const;
	const std::string & getOverride() const;

protected:
	bool         m_flagChanged;
	std::string  m_strOverride;
};

class OpCmd;

class OpCmdName {
public:
	virtual ~OpCmdName();
	OpCmdName();
	OpCmdName(const std::string & strName, const OpCmd * p_oc);

	bool areAllDynamicCNSEmpty() const;
	unsigned int getTotalSegments() const;
	void addSegment(CommandNameSegment * p_nocns);
	void changeIndexTo(unsigned int index, const std::string & strOverride);
	void clear();
	void clone(const OpCmdName & ocn);
	void retrCommandLine(std::string & strCommandLine) const;
	void retrListCommandLine(std::list<std::string> & listCommandLine) const;
	void set(const std::string & strName, const OpCmd * p_oc);

	CommandNameSegment * getSegment(unsigned int index);
	std::string getName() const;
	std::string getNameSegment(unsigned int index) const;

	const CommandNameSegment * getConstSegment(unsigned int index) const;

protected:
	std::vector<CommandNameSegment*> m_vectorCommandNameSegments;

	void processLineCommandName(const std::string & strLine, const OpCmd * p_oc);
	CommandNameSegment * getNewSegment(unsigned int index, bool flagDynamic, const std::string & strName);
};

class OpCmd {
public:
	virtual ~OpCmd();
	OpCmd();
	OpCmd(const std::string & strName, const std::string & strHelpString, const std::string & strAction, const std::string & strModule, OpCmdType oct);

	bool determineIfCNSDynamic(unsigned int indexCheck) const;
	bool hasDynamicParts() const;
	bool isUserInputSatisfied() const;
	void retrAction(std::string & strAction) const;
	void retrListAction(std::list<std::string> & listAction) const;
	void retrListUserInputUnsatisfied(std::list<std::pair<int, std::string> > & listUnsatisfied) const;
	void set(const std::string & strName, const std::string & strHelpString, const std::string & strAction, const std::string & strModule);
	void setType(OpCmdType oct);

	OpCmdType getType() const;

	const std::string & getAction() const;
	const std::string & getHelpString() const;
	const std::string & getModule() const;
	const OpCmdName & getConstOpCmdName() const;

	virtual unsigned long getId() const = 0;

protected:
	std::list<ActionSegment>  m_listActionSegments;
	std::string               m_strHelpString;
	std::string               m_strAction;
	std::string               m_strModule;

	OpCmdName                 m_ocn;
	OpCmdType                 m_oct;

	void processLineAction(const std::string & strLine);
};



#endif

