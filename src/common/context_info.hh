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
 *  Module:       context_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulation of information related to context information.
 *
 */

#ifndef __INCLUDE_CONTEXT_INFO_HH__
#define __INCLUDE_CONTEXT_INFO_HH__

#include <list>
#include <map>
#include <string>
#include <vector>

#define	CONFIG_ID_NONE		0x00000000
#define	CONFIG_ID_UNKNOWN	0xffffffff

#define	TEMPLATE_ID_NONE	CONFIG_ID_NONE
#define TEMPLATE_ID_UNKNOWN	CONFIG_ID_UNKNOWN

#include "nstat_info.hh"
#include "sub_info.hh"

class ChildContextInfo;

class ContextSegment {
public:
	ContextSegment(unsigned long idTemplate, unsigned long idConfig, const std::string & strName, bool flagMulti, const NStatInfo & nsi, const SubInfo & si);

	bool determineIfExistant() const;
	bool getFlagMulti() const;

	unsigned long getIdConfig() const;
	unsigned long getIdTemplate() const;

	void setName(const std::string & strName);
	void updateIDs(unsigned long idTemplate, unsigned long idConfig);

	const NStatInfo & getNStatInfo() const;
	const SubInfo & getSubInfo() const;

	const std::string & getName() const;

	const std::string getStrIdConfig() const;
	const std::string getStrIdCompound() const;
	const std::string getStrIdTemplate() const;

protected:

	NStatInfo       m_nsi;
	SubInfo         m_si;

	unsigned long   m_idTemplate;
	unsigned long   m_idConfig;

	std::string     m_strName;

	bool            m_flagMulti;
};

class PSegment;

class ContextLocation {
public:
	static void printContextSegments(const std::vector<ContextSegment> & vectorContextSegments);
	static void separateContextPathIntoPathSegments(const std::string & strPathEscaped, std::list<PSegment> & listPathSegments);


	static std::string getContextPathRepr(const std::list<std::string> & listPathSegments, unsigned int length, bool flagEscape);
	static std::string getContextPathRepr(const std::vector<ContextSegment> & vectorPathSegments, unsigned int length, bool flagEscape);


	ContextLocation();
	ContextLocation(const ContextLocation & clParent, const ContextSegment & csChild);;

	const ContextSegment & getContextSegment(unsigned int indexSegment) const;
	const ContextSegment & getContextSegmentExistant(unsigned int indexSegment) const;
	const ContextSegment & getContextSegmentNonExistant(unsigned int indexSegment) const;
	const ContextSegment * getPtrContextSegmentLast() const;

	const std::vector<ContextSegment> & getConstVectorContextSegmentsExistant() const;
	const std::vector<ContextSegment> & getConstVectorContextSegmentsNonExistant() const;


	unsigned int getLength() const;
	unsigned int getLengthExistant() const;
	unsigned int getLengthNonExistant() const;

	unsigned long getIdConfig() const;
	unsigned long getIdTemplate() const;

	void addContextSegmentExistant(const ContextSegment & cs);
	void addContextSegmentNonExistant(const ContextSegment & cs);
	void clear();
	void printPath() const;
	void setPath(const ContextLocation & clParent, const ContextSegment & csChild);

	std::string getPathExistantRepr(bool flagEscape) const;
	std::string getPathNonExistantRepr(bool flagEscape) const;

	std::string getPathRepr(bool flagEscape) const;
	std::string getPathRepr(unsigned int length, bool flagEscape) const;

	std::string getStrIdCompound() const;
	std::string getStrIdConfig() const;
	std::string getStrIdTemplate() const;

	std::vector<ContextSegment> & getVectorContextSegmentsExistant();
	std::vector<ContextSegment> & getVectorContextSegmentsNonExistant();

private:
	std::vector<ContextSegment>  m_vectorContextSegmentsExistant;
	std::vector<ContextSegment>  m_vectorContextSegmentsNonExistant;
};

class ValueValidityInfo {
public:
	ValueValidityInfo();
	ValueValidityInfo(const bool flagValid, const std::string & strInvalidValueDesc);

	const bool getFlagInvalid() const;
	const std::string & getConstInvalidValueDesc() const;

	std::string & getInvalidValueDesc();

	void clear();

	void setFlagInvalid(const bool flagInvalid);
	void setInvalidValueDesc(const std::string & strInvalidValueDesc);

protected:
	bool            m_flagInvalid;
	std::string     m_strInvalidValueDesc;
};

class OpVal {
public:
	OpVal();
	OpVal(const std::string & strOperator, const std::string & strValue);

	const std::string & getConstOperator() const;
	const std::string & getConstValue() const;

	void setOperator(const std::string & strOperator);
	void setValue(const std::string & strValue);

protected:
	std::string m_strOperator;
	std::string m_strValue;
};

class ContextValueInfo {
public:
	ContextValueInfo();
	ContextValueInfo(
	  bool flagHide,
	  bool flagCurrentExists,
	  const OpVal & ovCurrent,
	  bool flagDefaultExists,
	  const std::string & strDefault,
	  const std::list<std::string> & listAllowedOperators,
	  const std::map<std::pair<int64_t, int64_t>, std::string> & mapAllowedRanges,
	  const std::map<std::string, std::string> & mapAllowedValues,
	  const ValueValidityInfo & vvi);

	ValueValidityInfo & getVV();

	bool getFlagCurrentExists() const;
	bool getFlagDefaultExists() const;
	bool getFlagHide() const;

	OpVal & getCurrent();
	std::list<std::string> & getListAllowedOperators();
	std::map<std::pair<int64_t, int64_t>, std::string> & getMapAllowedRanges();
	std::map<std::string, std::string> & getMapAllowedValues();

	const OpVal & getConstCurrent() const;
	const ValueValidityInfo & getConstVV() const;
	const std::list<std::string> & getConstListAllowedOperators() const;
	const std::map<std::pair<int64_t, int64_t>, std::string> & getConstMapAllowedRanges() const;
	const std::map<std::string, std::string> & getConstMapAllowedValues() const;

	const std::string & getDefaultValue() const;


	void print() const;

	void setDefaultValue(const std::string & strDefault);
	void setErrorDesc(const std::string & strErrorDesc);
	void setFlagCurrentExists(bool flagCurrentExists);
	void setFlagDefaultExists(bool flagDefaultExists);
	void setFlagHideValue(bool flagHideValue);
	void setFlagValid(bool flagValid);

private:

	ValueValidityInfo					m_vvi;

	bool							m_flagHide;

	bool							m_flagCurrentExists;
	OpVal							m_ovCurrent;

	bool							m_flagDefaultExists;
	std::string						m_strDefault;

	std::list<std::string>                                  m_listAllowedOperators;
	std::map<std::pair<int64_t, int64_t>, std::string>	m_mapAllowedRanges;
	std::map<std::string, std::string>			m_mapAllowedValues;
};



class InnerContextInfo {
public:
	InnerContextInfo();
	InnerContextInfo(
		bool flagContextSwitch,
		bool flagDeprecated,
		bool flagMandatory,
		bool flagRequired,
		bool flagUserHidden,
		unsigned long totalEChildren,
		unsigned long totalEChildrenCS,
		unsigned long totalNEChildren,
		unsigned long totalNEChildrenCS,
		const std::string & strDataType,
		const std::string & strDeprecatedReason,
		const std::string & strHelpString,
		const ContextValueInfo & cvi,
		const NStatInfo & nsi,
		const SubInfo & si);

	ContextValueInfo & getContextValueInfo();
	NStatInfo & getNStatInfo();
	SubInfo & getSubInfo();

	bool getFlagContextSwitch() const;
	bool getFlagDeprecated() const;
	bool getFlagHideValue() const;
	bool getFlagMandatory() const;
	bool getFlagRequired() const;
	bool getFlagUserHidden() const;
	bool getFlagValid() const;

	unsigned long getTotalEChildren() const;
	unsigned long getTotalEChildrenCS() const;
	unsigned long getTotalNEChildren() const;
	unsigned long getTotalNEChildrenCS() const;

	const ContextValueInfo & getConstContextValueInfo() const;
	const NStatInfo & getConstNStatInfo() const;
	const SubInfo & getConstSubInfo() const;
	const std::string & getDataType() const;
	const std::string & getDeprecatedReason() const;
	const std::string & getHelpString() const;
	const std::string & getValue() const;


	void setFlagContextSwitch(bool flagContextSwitch);
	void setFlagDeprecated(bool flagDeprecated);
	void setFlagHideValue(bool flagHideValue);
	void setFlagMandatory(bool flagMandatory);
	void setFlagRequired(bool flagRequired);
	void setFlagUserHidden(bool flagUserHidden);
	void setFlagValid(bool flagValid);

	void setDataType(const std::string & strDataType);
	void setDeprecatedReason(const std::string & strDeprecatedReason);
	void setHelpString(const std::string & strHelpString);
	void setTotalEChildren(int totalEChildren);
	void setTotalEChildrenCS(int totalEChildrenCS);
	void setTotalNEChildren(int totalNEChildren);
	void setTotalNEChildrenCS(int totalNEChildrenCS);

private:
	ContextValueInfo   m_cvi;
	NStatInfo          m_nsi;
	SubInfo            m_si;

	bool               m_flagContextSwitch;
	bool               m_flagDeprecated;
	bool               m_flagMandatory;
	bool               m_flagRequired;
	bool               m_flagUserHidden;

	unsigned long      m_totalEChildren;
	unsigned long      m_totalEChildrenCS;
	unsigned long      m_totalNEChildren;
	unsigned long      m_totalNEChildrenCS;

	std::string        m_strDataType;
	std::string        m_strDeprecatedReason;
	std::string        m_strHelpString;
};

class GeneralContextInfo {
public:
	static bool compareIfALessThanB(GeneralContextInfo * p_gciA, GeneralContextInfo * p_gciB);

	virtual ~GeneralContextInfo();
	GeneralContextInfo(const ContextLocation & cl, const InnerContextInfo & ici);

	const ContextLocation & getContextLocation() const;
	const InnerContextInfo & getICI() const;

	bool getFlagMultiNode() const;

	unsigned long getIdConfig() const;
	unsigned long getIdTemplate() const;

	const std::string & getName() const;

	std::string getStrIdCompound() const;
	std::string getStrIdConfig() const;
	std::string getStrIdTemplate() const;

protected:
	ContextLocation   m_clHere;
	InnerContextInfo  m_ici;
};

class ParentContextInfo {
public:
	static std::string getCommaListWithNodeNames(const std::list<ChildContextInfo*> & listChildren, bool flagLeafsAndMultiOnly);

	~ParentContextInfo();
	ParentContextInfo(const ContextLocation & cl);

	const ContextLocation & getConstContextLocation() const;

	void addChild(const ContextSegment & csChild, const InnerContextInfo & ici);
	void doSortChildren();
	void retrListChildrenAll(std::list<ChildContextInfo*> & listChildrenAll) const;

	const std::list<ChildContextInfo*> & getListChildrenExistant() const;
	const std::list<ChildContextInfo*> & getListChildrenNonExistant() const;

	std::string getCommaListWithCompoundIDs(bool flagExistantOrNot, bool flagLeafsAndMultiOnly) const;

	std::string getCommaListWithNodeNamesExistant() const;
	std::string getCommaListWithNodeNamesNonExistant() const;

	const ChildContextInfo * findChildByName(const std::string & strName) const;

protected:
	const ContextLocation &        m_cl;

	std::list<ChildContextInfo*>   m_listChildrenExistant;
	std::list<ChildContextInfo*>   m_listChildrenNonExistant;

	void deleteChildren(std::list<ChildContextInfo*> & listChildren);
	const ChildContextInfo * findChildByName(const std::list<ChildContextInfo*> listChildren, const std::string & strName) const;
};

class ChildContextInfo : public GeneralContextInfo {
public:
	ChildContextInfo(const ParentContextInfo & pci, const ContextSegment & csChild, const InnerContextInfo & ici);
	const ContextSegment & getContextSegment() const;

protected:
	const ParentContextInfo &  m_pci;
	ContextSegment             m_csChild;
};


class ContextUtil {
public:
	static unsigned long getIdConfigComponent(const std::string & strIdCompound);
	static unsigned long getIdTemplateComponent(const std::string & strIdCompound);
};

class PSegment {
public:
	PSegment(const std::string & strName);
	PSegment(const std::string & strName, const std::string & strType);

	bool isTypeKnown() const;
	const std::string & getName() const;
	const std::string & getType() const;

protected:
	bool         m_flagTypeKnown;
	std::string  m_strName;
	std::string  m_strType;
};

#endif


