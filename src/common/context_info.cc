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
 *  Module:       context_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class for encapsulation of information related to context information.
 *
 */


#include <iostream>
#include <stdexcept>

#include "context_info.hh"
#include "basic/xgdaemon_util.hh"


ChildContextInfo::ChildContextInfo(const ParentContextInfo & pci, const ContextSegment & csChild, const InnerContextInfo & ici)
	:
	GeneralContextInfo(ContextLocation(pci.getConstContextLocation(), csChild), ici), m_pci(pci), m_csChild(csChild) {
}
const ContextSegment & ChildContextInfo::getContextSegment() const {
	return m_csChild;
}

ContextLocation::ContextLocation() {
}
ContextLocation::ContextLocation(const ContextLocation & clParent, const ContextSegment & csChild) {
	setPath(clParent, csChild);
}
const ContextSegment & ContextLocation::getContextSegment(unsigned int indexSegment) const {
	unsigned int sizeExistant = m_vectorContextSegmentsExistant.size();
	if (indexSegment < sizeExistant) {
		return getContextSegmentExistant(indexSegment);
	} else {
		return getContextSegmentNonExistant(indexSegment - sizeExistant);
	}
}
const ContextSegment & ContextLocation::getContextSegmentExistant(unsigned int indexSegment) const {
	if (indexSegment >= m_vectorContextSegmentsExistant.size()) throw std::logic_error("Index specified exceeds actual size.");
	return m_vectorContextSegmentsExistant[indexSegment];
}
const ContextSegment & ContextLocation::getContextSegmentNonExistant(unsigned int indexSegment) const {
	if (indexSegment >= m_vectorContextSegmentsNonExistant.size()) throw std::logic_error("Index specified exceeds actual size.");
	return m_vectorContextSegmentsNonExistant[indexSegment];
}
const ContextSegment * ContextLocation::getPtrContextSegmentLast() const {
	const std::vector<ContextSegment> & vector = m_vectorContextSegmentsNonExistant.size() > 0 ? m_vectorContextSegmentsNonExistant : m_vectorContextSegmentsExistant;
	if (vector.size() == 0) {
		return NULL;
	} else {
		return &vector.back();
	}
}

const std::vector<ContextSegment> & ContextLocation::getConstVectorContextSegmentsExistant() const {
	return m_vectorContextSegmentsExistant;
}
const std::vector<ContextSegment> & ContextLocation::getConstVectorContextSegmentsNonExistant() const {
	return m_vectorContextSegmentsNonExistant;
}
unsigned int ContextLocation::getLength() const {
	return m_vectorContextSegmentsExistant.size() + m_vectorContextSegmentsNonExistant.size();
}
unsigned int ContextLocation::getLengthExistant() const {
	return m_vectorContextSegmentsExistant.size();
}
unsigned int ContextLocation::getLengthNonExistant() const {
	return m_vectorContextSegmentsNonExistant.size();
}
unsigned long ContextLocation::getIdConfig() const {
	const ContextSegment * p_csLast = getPtrContextSegmentLast();
	if (p_csLast == NULL) {
		return CONFIG_ID_NONE;
	} else {
		return p_csLast->getIdConfig();
	}
}
unsigned long ContextLocation::getIdTemplate() const {
	const ContextSegment * p_csLast = getPtrContextSegmentLast();
	if (p_csLast == NULL) {
		return TEMPLATE_ID_NONE;
	} else {
		return p_csLast->getIdTemplate();
	}
}
void ContextLocation::addContextSegmentExistant(const ContextSegment & cs) {
	m_vectorContextSegmentsExistant.push_back(cs);
}
void ContextLocation::addContextSegmentNonExistant(const ContextSegment & cs) {
	m_vectorContextSegmentsNonExistant.push_back(cs);
}
void ContextLocation::clear() {
	m_vectorContextSegmentsExistant.clear();
	m_vectorContextSegmentsNonExistant.clear();
}
void ContextLocation::printContextSegments(const std::vector<ContextSegment> & vectorContextSegments) {
	std::vector<ContextSegment>::const_iterator i = vectorContextSegments.begin();
	std::vector<ContextSegment>::const_iterator iEnd = vectorContextSegments.end();

	while (i != iEnd) {
		const ContextSegment & cs = *i;

		if (cs.getFlagMulti()) {
			std::cout << ": ";
		} else {
			std::cout << "/";
		}
		std::cout << cs.getName();

		i++;
	}
}
void ContextLocation::printPath() const {
	printContextSegments(m_vectorContextSegmentsExistant);
	std::cout << "  --  ";
	printContextSegments(m_vectorContextSegmentsNonExistant);
	std::cout << std::endl;
}

void ContextLocation::setPath(const ContextLocation & clParent, const ContextSegment & csChild) {

	m_vectorContextSegmentsExistant.clear();
	m_vectorContextSegmentsNonExistant.clear();

	std::vector<ContextSegment>::const_iterator i = clParent.m_vectorContextSegmentsExistant.begin();
	std::vector<ContextSegment>::const_iterator iEnd = clParent.m_vectorContextSegmentsExistant.end();
	while (i != iEnd) {
		m_vectorContextSegmentsExistant.push_back(*i);
		i++;
	}

	i = clParent.m_vectorContextSegmentsNonExistant.begin();
	iEnd = clParent.m_vectorContextSegmentsNonExistant.end();
	while (i != iEnd) {
		m_vectorContextSegmentsNonExistant.push_back(*i);
		i++;
	}

	if (csChild.determineIfExistant()) {
		if (m_vectorContextSegmentsNonExistant.size() > 0) throw std::logic_error("This context is also non-existant but marked as existant.");
		m_vectorContextSegmentsExistant.push_back(csChild);
	} else {
		m_vectorContextSegmentsNonExistant.push_back(csChild);
	}
}
void ContextLocation::separateContextPathIntoPathSegments(const std::string & strPathEscaped, std::list<PSegment> & listPathSegments) {
	listPathSegments.clear();

	std::string strSegment;

	int i, lengthPath = strPathEscaped.length();
	for (i = 0; i <= lengthPath; i++) {
		char c = strPathEscaped[i];
		if (c == '\\') {
			i++;
			if (i < lengthPath) {
				c = strPathEscaped[i];
				switch (c) {
				case 'n':
					strSegment += '\n';
					break;
				case 'r':
					strSegment += '\r';
					break;
				case 't':
					strSegment += '\t';
					break;
				default:
					strSegment += c;
				}
			}
		} else {
			if (c == 0 || c == ' ' || c == ':' || c == '/') {
				if (strSegment.length() > 0) {
					listPathSegments.push_back(PSegment(strSegment));
					strSegment.clear();
				}
			} else {
				strSegment += c;
			}
		}
	}
}
std::string ContextLocation::getContextPathRepr(const std::list<std::string> & listPathSegments, unsigned int length, bool flagEscape) {
	if (length > listPathSegments.size()) throw std::logic_error("Length specified exceeds actual length.");

	std::string strPathRepr;

	if (length == 0) {
		strPathRepr = "/";
	} else {
		unsigned int counter = 0;

		std::list<std::string>::const_iterator i = listPathSegments.begin();
		std::list<std::string>::const_iterator iEnd = listPathSegments.end();

		while (i != iEnd) {
			if (counter == length) break;
			strPathRepr += '/';
			if (flagEscape) {
				strPathRepr += XGDaemonUtil::getStrEscapedBackSlash(*i);
			} else {
				strPathRepr += *i;
			}

			counter++;
			i++;
		}
	}
	return strPathRepr;
}
std::string ContextLocation::getContextPathRepr(const std::vector<ContextSegment> & vectorPathSegments, unsigned int length, bool flagEscape) {
	if (length > vectorPathSegments.size()) throw std::logic_error("Length specified exceeds actual length.");

	std::string strPathRepr;

	if (length == 0) {
		strPathRepr = "/";
	} else {
		unsigned int counter = 0;

		std::vector<ContextSegment>::const_iterator i = vectorPathSegments.begin();
		std::vector<ContextSegment>::const_iterator iEnd = vectorPathSegments.end();

		while (i != iEnd) {
			if (counter == length) break;

			if ((*i).getFlagMulti() == false) {
				strPathRepr += '/';
				if (flagEscape) {
					strPathRepr += XGDaemonUtil::getStrEscapedBackSlash((*i).getName());
				} else {
					strPathRepr += (*i).getName();
				}
			} else {
				strPathRepr += ": ";
				if (flagEscape) {
					strPathRepr += XGDaemonUtil::getStrEscapedBackSlash((*i).getName());
				} else {
					strPathRepr += (*i).getName();
				}
			}
			counter++;
			i++;
		}
	}
	return strPathRepr;
}
std::string ContextLocation::getPathExistantRepr(bool flagEscape) const {
	return getContextPathRepr(m_vectorContextSegmentsExistant, m_vectorContextSegmentsExistant.size(), flagEscape);
}
std::string ContextLocation::getPathNonExistantRepr(bool flagEscape) const {
	unsigned int sizeNonExistant = m_vectorContextSegmentsNonExistant.size();
	if (sizeNonExistant == 0) {
		return "";
	} else {
		return getContextPathRepr(m_vectorContextSegmentsNonExistant, sizeNonExistant, flagEscape);
	}
}
std::string ContextLocation::getPathRepr(bool flagEscape) const {
	return getPathRepr(getLength(), flagEscape);
}
std::string ContextLocation::getPathRepr(unsigned int length, bool flagEscape) const {
	std::string strPathRepr;

	unsigned int lengthExistant = m_vectorContextSegmentsExistant.size();

	unsigned int lengthGetExistant = length < lengthExistant ? length : lengthExistant;
	unsigned int lengthGetNonExistant = length <= lengthExistant ? 0 : length - lengthExistant;

	if (lengthGetExistant == 0 && lengthGetNonExistant == 0) {
		strPathRepr = "/";
	} else {
		if (lengthGetExistant > 0) strPathRepr = getContextPathRepr(m_vectorContextSegmentsExistant, lengthGetExistant, flagEscape);
		if (lengthGetNonExistant > 0) strPathRepr += getContextPathRepr(m_vectorContextSegmentsNonExistant, lengthGetNonExistant, flagEscape);
	}

	return strPathRepr;
}
std::string ContextLocation::getStrIdCompound() const {
	std::string strIdCompound = getStrIdTemplate();
	strIdCompound += getStrIdConfig();
	return strIdCompound;
}
std::string ContextLocation::getStrIdConfig() const {
	return XGDaemonUtil::getStrReprUL_Hex(getIdConfig(), true);
}
std::string ContextLocation::getStrIdTemplate() const {
	return XGDaemonUtil::getStrReprUL_Hex(getIdTemplate(), true);
}
std::vector<ContextSegment> & ContextLocation::getVectorContextSegmentsExistant() {
	return m_vectorContextSegmentsExistant;
}
std::vector<ContextSegment> & ContextLocation::getVectorContextSegmentsNonExistant() {
	return m_vectorContextSegmentsNonExistant;
}

ContextSegment::ContextSegment(unsigned long idTemplate, unsigned long idConfig, const std::string & strName, bool flagMulti, const NStatInfo & nsi, const SubInfo & si) : m_nsi(nsi), m_si(si), m_idTemplate(idTemplate), m_idConfig(idConfig), m_strName(strName), m_flagMulti(flagMulti) {
}
bool ContextSegment::determineIfExistant() const {
	if (m_idConfig == CONFIG_ID_NONE) return false;
	return !m_nsi.getFlagDeleted();
}
bool ContextSegment::getFlagMulti() const {
	return m_flagMulti;
}
unsigned long ContextSegment::getIdConfig() const {
	return m_idConfig;
}
unsigned long ContextSegment::getIdTemplate() const {
	return m_idTemplate;
}
void ContextSegment::setName(const std::string & strName) {
	m_strName = strName;
}
void ContextSegment::updateIDs(unsigned long idTemplate, unsigned long idConfig) {
	m_idTemplate = idTemplate;
	m_idConfig = idConfig;
}
const NStatInfo & ContextSegment::getNStatInfo() const {
	return m_nsi;
}
const SubInfo & ContextSegment::getSubInfo() const {
	return m_si;
}
const std::string & ContextSegment::getName() const {
	return m_strName;
}
const std::string ContextSegment::getStrIdConfig() const {
	return XGDaemonUtil::getStrReprUL_Hex(m_idConfig, true);
}
const std::string ContextSegment::getStrIdCompound() const {
	std::string strIdCompound = getStrIdTemplate();
	strIdCompound += getStrIdConfig();
	return strIdCompound;
}
const std::string ContextSegment::getStrIdTemplate() const {
	return XGDaemonUtil::getStrReprUL_Hex(m_idTemplate, true);
}

unsigned long ContextUtil::getIdConfigComponent(const std::string & strIdCompound) {
	if (strIdCompound.length() != 16) return CONFIG_ID_UNKNOWN;

	const std::string & strIdConfig = strIdCompound.substr(8, 8);
	return XGDaemonUtil::getValueStrUL_Hex(strIdConfig, CONFIG_ID_UNKNOWN);
}
unsigned long ContextUtil::getIdTemplateComponent(const std::string & strIdCompound) {
	if (strIdCompound.length() != 16) return TEMPLATE_ID_UNKNOWN;

	const std::string & strIdTemplate = strIdCompound.substr(0, 8);
	return XGDaemonUtil::getValueStrUL_Hex(strIdTemplate, TEMPLATE_ID_UNKNOWN);
}

ContextValueInfo::ContextValueInfo() : m_flagHide(false), m_flagCurrentExists(false), m_flagDefaultExists(false) {
}
ContextValueInfo::ContextValueInfo(
	bool flagHide,
	bool flagCurrentExists,
	const OpVal & ovCurrent,
	bool flagDefaultExists,
	const std::string & strDefault,
	const std::list<std::string> & listAllowedOperators,
	const std::map<std::pair<int64_t, int64_t>, std::string> & mapAllowedRanges,
	const std::map<std::string, std::string> & mapAllowedValues,
	const ValueValidityInfo & vvi)
	:
	m_vvi(vvi),
	m_flagHide(flagHide),
	m_flagCurrentExists(flagCurrentExists),
	m_ovCurrent(ovCurrent),
	m_flagDefaultExists(flagDefaultExists),
	m_strDefault(strDefault),
	m_listAllowedOperators(listAllowedOperators),
	m_mapAllowedRanges(mapAllowedRanges),
	m_mapAllowedValues(mapAllowedValues) {
}

ValueValidityInfo & ContextValueInfo::getVV() {
	return m_vvi;
}

bool ContextValueInfo::getFlagCurrentExists() const {
	return m_flagCurrentExists;
}
bool ContextValueInfo::getFlagDefaultExists() const {
	return m_flagDefaultExists;
}
bool ContextValueInfo::getFlagHide() const {
	return m_flagHide;
}
OpVal & ContextValueInfo::getCurrent() {
	return m_ovCurrent;
}
std::list<std::string> & ContextValueInfo::getListAllowedOperators() {
	return m_listAllowedOperators;
}
std::map<std::pair<int64_t, int64_t>, std::string> & ContextValueInfo::getMapAllowedRanges() {
	return m_mapAllowedRanges;
}
std::map<std::string, std::string> & ContextValueInfo::getMapAllowedValues() {
	return m_mapAllowedValues;
}
const OpVal & ContextValueInfo::getConstCurrent() const {
	return m_ovCurrent;
}
const ValueValidityInfo & ContextValueInfo::getConstVV() const {
	return m_vvi;
}
const std::list<std::string> & ContextValueInfo::getConstListAllowedOperators() const {
	return m_listAllowedOperators;
}
const std::map<std::pair<int64_t, int64_t>, std::string> & ContextValueInfo::getConstMapAllowedRanges() const {
	return m_mapAllowedRanges;
}
const std::map<std::string, std::string> & ContextValueInfo::getConstMapAllowedValues() const {
	return m_mapAllowedValues;
}
const std::string & ContextValueInfo::getDefaultValue() const {
	return m_strDefault;
}

void ContextValueInfo::print() const {
	std::cout << "m_flagHide                        = " << m_flagHide << std::endl;
	std::cout << "m_flagCurrentExists               = " << m_flagCurrentExists << std::endl;
	std::cout << "m_ovCurrent.getConstOperator()    = " << m_ovCurrent.getConstOperator() << std::endl;
	std::cout << "m_ovCurrent.getConstValue()       = " << m_ovCurrent.getConstValue() << std::endl;
	std::cout << "m_flagDefaultExists               = " << m_flagDefaultExists << std::endl;
	std::cout << "m_strDefault                      = " << m_strDefault << std::endl;
	std::cout << "m_vvi.getFlagInvalid()            = " << m_vvi.getFlagInvalid() << std::endl;
	std::cout << "m_vvi.getConstInvalidValueDesc()  = " << m_vvi.getConstInvalidValueDesc() << std::endl;
}
void ContextValueInfo::setDefaultValue(const std::string & strDefault) {
	m_strDefault = strDefault;
}
void ContextValueInfo::setFlagCurrentExists(bool flagCurrentExists) {
	m_flagCurrentExists = flagCurrentExists;
}
void ContextValueInfo::setFlagDefaultExists(bool flagDefaultExists) {
	m_flagDefaultExists = flagDefaultExists;
}
void ContextValueInfo::setFlagHideValue(bool flagHideValue) {
	m_flagHide = flagHideValue;
}


GeneralContextInfo::~GeneralContextInfo() {
}
GeneralContextInfo::GeneralContextInfo(const ContextLocation & cl, const InnerContextInfo & ici)
    :
    m_clHere(cl),
    m_ici(ici) {
}
const ContextLocation & GeneralContextInfo::getContextLocation() const {
	return m_clHere;
}
const InnerContextInfo & GeneralContextInfo::getICI() const {
	return m_ici;
}
bool GeneralContextInfo::compareIfALessThanB(GeneralContextInfo * p_gciA, GeneralContextInfo * p_gciB) {
	if (p_gciA == NULL || p_gciB == NULL) return false;

	const InnerContextInfo iciA = p_gciA->getICI();
	const InnerContextInfo iciB = p_gciB->getICI();

	if ((iciA.getFlagContextSwitch() == false) && iciB.getFlagContextSwitch()) return true;
	if (iciA.getFlagContextSwitch() && (iciB.getFlagContextSwitch() == false)) return false;

	return XGDaemonUtil::compareIfALessThanB(p_gciA->getName(), p_gciB->getName());
}
bool GeneralContextInfo::getFlagMultiNode() const {
	const ContextSegment * p_csLast = m_clHere.getPtrContextSegmentLast();
	if (p_csLast == NULL) throw std::logic_error("Expected a pointer to ContextSegment.");
	return p_csLast->getFlagMulti();
}
unsigned long GeneralContextInfo::getIdConfig() const {
	return m_clHere.getIdConfig();
}
unsigned long GeneralContextInfo::getIdTemplate() const {
	return m_clHere.getIdTemplate();
}
const std::string & GeneralContextInfo::getName() const {
	const ContextSegment * p_csLast = m_clHere.getPtrContextSegmentLast();
	if (p_csLast == NULL) throw std::logic_error("Expected a pointer to ContextSegment.");
	return p_csLast->getName();
}
std::string GeneralContextInfo::getStrIdCompound() const {
	return m_clHere.getStrIdCompound();
}
std::string GeneralContextInfo::getStrIdConfig() const {
	return m_clHere.getStrIdConfig();
}
std::string GeneralContextInfo::getStrIdTemplate() const {
	return m_clHere.getStrIdTemplate();
}

InnerContextInfo::InnerContextInfo() : m_flagContextSwitch(false), m_flagDeprecated(false), m_flagMandatory(false), m_flagRequired(false), m_flagUserHidden(false) {
}
InnerContextInfo::InnerContextInfo(
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
	const SubInfo & si)
	:
	m_cvi(cvi),
	m_nsi(nsi),
	m_si(si),
	m_flagContextSwitch(flagContextSwitch),
	m_flagDeprecated(flagDeprecated),
	m_flagMandatory(flagMandatory),
	m_flagRequired(flagRequired),
	m_flagUserHidden(flagUserHidden),
	m_totalEChildren(totalEChildren),
	m_totalEChildrenCS(totalEChildrenCS),
	m_totalNEChildren(totalNEChildren),
	m_totalNEChildrenCS(totalNEChildrenCS),
	m_strDataType(strDataType),
	m_strDeprecatedReason(strDeprecatedReason),
	m_strHelpString(strHelpString) {
}
ContextValueInfo & InnerContextInfo::getContextValueInfo() {
	return m_cvi;
}
NStatInfo & InnerContextInfo::getNStatInfo() {
	return m_nsi;
}
SubInfo & InnerContextInfo::getSubInfo() {
	return m_si;
}
bool InnerContextInfo::getFlagContextSwitch() const {
	return m_flagContextSwitch;
}
bool InnerContextInfo::getFlagDeprecated() const {
	return m_flagDeprecated;
}
bool InnerContextInfo::getFlagMandatory() const {
	return m_flagMandatory;
}
bool InnerContextInfo::getFlagRequired() const {
	return m_flagRequired;
}
bool InnerContextInfo::getFlagUserHidden() const {
	return m_flagUserHidden;
}
unsigned long InnerContextInfo::getTotalEChildren() const {
	return m_totalEChildren;
}
unsigned long InnerContextInfo::getTotalEChildrenCS() const {
	return m_totalEChildrenCS;
}
unsigned long InnerContextInfo::getTotalNEChildren() const {
	return m_totalNEChildren;
}
unsigned long InnerContextInfo::getTotalNEChildrenCS() const {
	return m_totalNEChildrenCS;
}
const ContextValueInfo & InnerContextInfo::getConstContextValueInfo() const {
	return m_cvi;
}
const NStatInfo & InnerContextInfo::getConstNStatInfo() const {
	return m_nsi;
}
const SubInfo & InnerContextInfo::getConstSubInfo() const {
	return m_si;
}
const std::string & InnerContextInfo::getDataType() const {
	return m_strDataType;
}
const std::string & InnerContextInfo::getDeprecatedReason() const {
	return m_strDeprecatedReason;
}
const std::string & InnerContextInfo::getHelpString() const {
	return m_strHelpString;
}

void InnerContextInfo::setFlagContextSwitch(bool flagContextSwitch) {
	m_flagContextSwitch = flagContextSwitch;
}
void InnerContextInfo::setFlagDeprecated(bool flagDeprecated) {
	m_flagDeprecated = flagDeprecated;
}
void InnerContextInfo::setFlagMandatory(bool flagMandatory) {
	m_flagMandatory = flagMandatory;
}
void InnerContextInfo::setFlagRequired(bool flagRequired) {
	m_flagRequired = flagRequired;
}
void InnerContextInfo::setFlagUserHidden(bool flagUserHidden) {
	m_flagUserHidden = flagUserHidden;
}
void InnerContextInfo::setDataType(const std::string & strDataType) {
	m_strDataType = strDataType;
}
void InnerContextInfo::setDeprecatedReason(const std::string & strDeprecatedReason) {
	m_strDeprecatedReason = strDeprecatedReason;
}
void InnerContextInfo::setHelpString(const std::string & strHelpString) {
	m_strHelpString = strHelpString;
}
void InnerContextInfo::setTotalEChildren(int totalEChildren) {
	m_totalEChildren = totalEChildren;
}
void InnerContextInfo::setTotalEChildrenCS(int totalEChildrenCS) {
	m_totalEChildrenCS = totalEChildrenCS;
}
void InnerContextInfo::setTotalNEChildren(int totalNEChildren) {
	m_totalNEChildren = totalNEChildren;
}
void InnerContextInfo::setTotalNEChildrenCS(int totalNEChildrenCS) {
	m_totalNEChildrenCS = totalNEChildrenCS;
}
OpVal::OpVal() {
}
OpVal::OpVal(const std::string & strOperator, const std::string & strValue) : m_strOperator(strOperator), m_strValue(strValue) {
}
void OpVal::setOperator(const std::string & strOperator) {
	m_strOperator = strOperator;
}
void OpVal::setValue(const std::string & strValue) {
	m_strValue = strValue;
}
const std::string & OpVal::getConstOperator() const {
	return m_strOperator;
}
const std::string & OpVal::getConstValue() const {
	return m_strValue;
}


ParentContextInfo::~ParentContextInfo() {
	deleteChildren(m_listChildrenExistant);
	deleteChildren(m_listChildrenNonExistant);

}
ParentContextInfo::ParentContextInfo(const ContextLocation & cl) : m_cl(cl) {
}
const ContextLocation & ParentContextInfo::getConstContextLocation() const {
	return m_cl;
}
void ParentContextInfo::addChild(const ContextSegment & csChild, const InnerContextInfo & ici) {
	ChildContextInfo * p_cci = new ChildContextInfo(*this, csChild, ici);

	if (csChild.determineIfExistant()) {
		m_listChildrenExistant.push_back(p_cci);
	} else {
		m_listChildrenNonExistant.push_back(p_cci);
	}
}


void ParentContextInfo::deleteChildren(std::list<ChildContextInfo*> & listChildren) {
	while (listChildren.size() > 0) {
		ChildContextInfo * p_cci = listChildren.front();
		if (p_cci != NULL) delete p_cci;

		listChildren.pop_front();
	}
}

void ParentContextInfo::doSortChildren() {
	m_listChildrenExistant.sort(GeneralContextInfo::compareIfALessThanB);
	m_listChildrenNonExistant.sort(GeneralContextInfo::compareIfALessThanB);
}
void ParentContextInfo::retrListChildrenAll(std::list<ChildContextInfo*> & listChildrenAll) const {

	listChildrenAll.clear();

	std::list<ChildContextInfo*>::const_iterator iE = m_listChildrenExistant.begin();
	const std::list<ChildContextInfo*>::const_iterator iEEnd = m_listChildrenExistant.end();
	while (iE != iEEnd) {
		listChildrenAll.push_back(*iE);		
		iE++;
	}

	std::list<ChildContextInfo*>::const_iterator iNE = m_listChildrenNonExistant.begin();
	const std::list<ChildContextInfo*>::const_iterator iNEEnd = m_listChildrenNonExistant.end();
	while (iNE != iNEEnd) {
		listChildrenAll.push_back(*iNE);
		iNE++;
	}

	listChildrenAll.sort(GeneralContextInfo::compareIfALessThanB);
}
const std::list<ChildContextInfo*> & ParentContextInfo::getListChildrenExistant() const {
	return m_listChildrenExistant;
}
const std::list<ChildContextInfo*> & ParentContextInfo::getListChildrenNonExistant() const {
	return m_listChildrenNonExistant;
}
std::string ParentContextInfo::getCommaListWithCompoundIDs(bool flagExistantOrNot, bool flagLeafsAndMultiOnly) const {
	std::string strCommaList;

	bool flagGotAtLeastOne = false;

	std::list<ChildContextInfo*>::const_iterator i;
	std::list<ChildContextInfo*>::const_iterator iEnd;

	if (flagExistantOrNot == true) {
		i = m_listChildrenExistant.begin();
		iEnd = m_listChildrenExistant.end();
	} else {
		i = m_listChildrenNonExistant.begin();
		iEnd = m_listChildrenNonExistant.end();
	}

	while (i != iEnd) {
		const ChildContextInfo * p_cci = *i;
		if (p_cci != NULL && p_cci->getICI().getFlagDeprecated() == false) {
			if (flagLeafsAndMultiOnly == false || (flagLeafsAndMultiOnly && (p_cci->getICI().getFlagContextSwitch() == false || p_cci->getFlagMultiNode()))) {
				if (flagGotAtLeastOne == true) strCommaList += ", ";

				strCommaList += p_cci->getStrIdTemplate();
				strCommaList += p_cci->getStrIdConfig();

				flagGotAtLeastOne = true;
			}
		}
		i++;
	}
	return strCommaList;
}
std::string ParentContextInfo::getCommaListWithNodeNames(const std::list<ChildContextInfo*> & listChildren, bool flagLeafsAndMultiOnly) {

	std::string strCommaList;

	bool flagGotAtLeastOne = false;

	std::list<ChildContextInfo*>::const_iterator i = listChildren.begin();
	const std::list<ChildContextInfo*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		const ChildContextInfo * p_cci = *i;
		if (p_cci != NULL && p_cci->getICI().getFlagDeprecated() == false) {
			if (flagLeafsAndMultiOnly == false || (flagLeafsAndMultiOnly && (p_cci->getICI().getFlagContextSwitch() == false || p_cci->getFlagMultiNode()))) {
				if (flagGotAtLeastOne) strCommaList += ", ";
				strCommaList += p_cci->getName();
				flagGotAtLeastOne = true;
			}
		}
		i++;
	}
	return strCommaList;
}


std::string ParentContextInfo::getCommaListWithNodeNamesExistant() const {
	return getCommaListWithNodeNames(m_listChildrenExistant, false);
}
std::string ParentContextInfo::getCommaListWithNodeNamesNonExistant() const {
	return getCommaListWithNodeNames(m_listChildrenNonExistant, true);
}
const ChildContextInfo * ParentContextInfo::findChildByName(const std::string & strName) const {
	const ChildContextInfo * p_cciExistant = findChildByName(m_listChildrenExistant, strName);
	if (p_cciExistant != NULL) {
		return p_cciExistant;
	} else {
		return findChildByName(m_listChildrenNonExistant, strName);
	}
}
const ChildContextInfo * ParentContextInfo::findChildByName(const std::list<ChildContextInfo*> listChildren, const std::string & strName) const {
	std::list<ChildContextInfo*>::const_iterator i = listChildren.begin();
	std::list<ChildContextInfo*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		ChildContextInfo * p_cci = *i;
		if (p_cci != NULL) {
			if (p_cci->getContextSegment().getName() == strName) return p_cci;
		}
		i++;
	}
	return NULL;
}

ValueValidityInfo::ValueValidityInfo() {
	clear();
}

ValueValidityInfo::ValueValidityInfo(const bool flagInvalid, const std::string & strInvalidValueDesc) : m_flagInvalid(flagInvalid) , m_strInvalidValueDesc(strInvalidValueDesc) {
}

const bool ValueValidityInfo::getFlagInvalid() const {
	return m_flagInvalid;
}
const std::string & ValueValidityInfo::getConstInvalidValueDesc() const {
	return m_strInvalidValueDesc;
}

std::string & ValueValidityInfo::getInvalidValueDesc() {
	return m_strInvalidValueDesc;
}
void ValueValidityInfo::clear() {
	m_flagInvalid = false;	//Assume valid
	m_strInvalidValueDesc.clear();
	
}
void ValueValidityInfo::setFlagInvalid(const bool flagInvalid) {
	m_flagInvalid = flagInvalid;
}
void ValueValidityInfo::setInvalidValueDesc(const std::string & strInvalidValueDesc) {
	m_strInvalidValueDesc = strInvalidValueDesc;
}

PSegment::PSegment(const std::string & strName) : m_flagTypeKnown(false), m_strName(strName) {
}
PSegment::PSegment(const std::string & strName, const std::string & strType) : m_flagTypeKnown(strType.length() > 0), m_strName(strName), m_strType(strType) {
}
bool PSegment::isTypeKnown() const {
	return m_flagTypeKnown;
}
const std::string & PSegment::getName() const {
	return m_strName;
}
const std::string & PSegment::getType() const {
	return m_strType;
}


