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
 *  Module:       xml_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  XML parsing & encapsulation
 *
 */



#include <iostream>
#include <stdexcept>

#include "xgdaemon_util.hh"
#include "xml_info.hh"


static void XMLCALL handlerCharacter(void *p_userData, const XML_Char *str, int len) {
	XmlInfo * p_xi = static_cast<XmlInfo*>(p_userData);
	if (p_xi == NULL) throw std::logic_error("User data not received.");

	std::string strCopy(str, len);
	std::string strUnEscaped = XGDaemonUtil::getStrUnEscapedCaret(strCopy);
	p_xi->appendInternalTextNoEsc(strUnEscaped);
}

static void XMLCALL handlerDefault(void *p_userData, const XML_Char *str, int len) {
	UNUSED(p_userData);
	UNUSED(str);
	UNUSED(len);
}

static void XMLCALL handlerDefaultExpand(void *p_userData, const XML_Char *str, int len) {
	UNUSED(p_userData);
	UNUSED(str);
	UNUSED(len);
}

static void XMLCALL handlerElementStart(void *p_userData, const char *strNameConst, const char **atts) {

	std::string strName(strNameConst);

	XmlInfo * p_xi = static_cast<XmlInfo*>(p_userData);
	if (p_xi == NULL) throw std::logic_error("User data not received.");
	p_xi->pushElement(strName);

	UNUSED(atts);
}

static void XMLCALL handlerElementEnd(void *p_userData, const char *strNameConst) {

	std::string strName(strNameConst);

	XmlInfo * p_xi = static_cast<XmlInfo*>(p_userData);
	if (p_xi == NULL) throw std::logic_error("User data not received.");

	const std::string * p_strNameOnStack = p_xi->getCurrentElement();
	if (p_strNameOnStack == NULL || p_strNameOnStack->compare(strName) != 0) {
		std::string strDescriptionOfException("XML Element string missmatch.");
		strDescriptionOfException += "  String in memory: ";
		strDescriptionOfException += (p_strNameOnStack == NULL ? "<none>" : *p_strNameOnStack);
		strDescriptionOfException += "  String passed to XML end element handler: ";
		strDescriptionOfException += strName;
		throw std::logic_error(strDescriptionOfException.c_str());
	}

	p_xi->popElement(strName);
}

XmlAttribute::XmlAttribute(const std::string strName, const std::string & strValue) : m_strName(strName), m_strValue(strValue) {
}
const std::string & XmlAttribute::getName() const {
	return m_strName;
}
const std::string & XmlAttribute::getValue() const {
	return m_strValue;
}

XmlInfo::~XmlInfo() {
	clear();	
}
XmlInfo::XmlInfo() : m_p_xneCurrent(NULL), m_p_xneRoot(NULL) {
}
bool XmlInfo::doesRootElementMatch(const std::string & strElementName) const {
	if (m_p_xneRoot != NULL) {
		if (m_p_xneRoot->getName() == strElementName) return true;
	}
	return false;
}
int XmlInfo::getCurrentDepth() const {
	return m_p_xneCurrent == NULL ? 0 : m_p_xneCurrent->getDepth();
}
void XmlInfo::appendInternalText(const std::string & strAppend) {
	if (m_p_xneCurrent == NULL) throw std::logic_error("Expected current node to be non-NULL.");
	m_p_xneCurrent->addText(strAppend);
}
void XmlInfo::appendInternalTextNoEsc(const std::string & strAppend) {
	if (m_p_xneCurrent == NULL) throw std::logic_error("Expected current node to be non-NULL.");
	m_p_xneCurrent->addTextNoEsc(strAppend);
}
void XmlInfo::clear() {
	m_p_xneCurrent = NULL;
	if (m_p_xneRoot != NULL) {
		delete m_p_xneRoot;
		m_p_xneRoot = NULL;
	}
}
void XmlInfo::generateXML(std::ostringstream & os, const bool flagNiceFormat, const int indent) const {
	if (flagNiceFormat) XmlUtil::generateXML_Indent(os, indent);
	os << "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" << std::endl;
	if (m_p_xneRoot != NULL) m_p_xneRoot->generateXML(os, flagNiceFormat, indent, NULL, NULL);
}
void XmlInfo::generateXML(std::string & str, const bool flagNiceFormat, const int indent) const {
	std::ostringstream os;
	generateXML(os, flagNiceFormat, indent);
//	os.str(str);	
	str = os.str();
}
void XmlInfo::print() const {
	if (m_p_xneRoot != NULL) m_p_xneRoot->print();
}
void XmlInfo::printXML() const {
	std::string str;
	generateXML(str, true, 0);
	std::cout << str;
}
void XmlInfo::popElement(const std::string & strElementName) {
	if (m_p_xneCurrent == NULL) throw std::logic_error("Expected current node to be non-NULL.");
	if (m_p_xneCurrent->getName() != strElementName) throw std::logic_error("Push/pop name missmatch.");
	m_p_xneCurrent = dynamic_cast<XmlNodeElement*>(m_p_xneCurrent->getParent());
}
void XmlInfo::retrCurrentPathRepr(std::string & strPath) const {
	strPath.clear();
	if (m_p_xneCurrent != NULL) strPath = m_p_xneCurrent->getPathRepr();
}
void XmlInfo::trimText() {
	if (m_p_xneRoot != NULL) m_p_xneRoot->trimText();
}
const std::string * XmlInfo::getCurrentElement() const {
	return m_p_xneCurrent == NULL ? NULL : &m_p_xneCurrent->getName();	
}
std::string XmlInfo::getXMLRepr(const bool flagNiceFormat, const int indent) const {
	std::string strXMLRepr;
	generateXML(strXMLRepr, flagNiceFormat, indent);
	return strXMLRepr;
}
XmlNodeElement * XmlInfo::find(const std::list<std::string> listPath) const {

	XmlNodeElement * p_xne = NULL;

	std::list<std::string>::const_iterator i = listPath.begin();
	const std::list<std::string>::const_iterator iBegin = i;
	const std::list<std::string>::const_iterator iEnd = listPath.end();
	while (i != iEnd) {
		const std::string & strSegmentName = *i;

		if (i == iBegin) {
			if (m_p_xneRoot->getName() != strSegmentName) break;
			p_xne = m_p_xneRoot;
		} else {
			if (p_xne == NULL) break;
			p_xne = p_xne->findChildElementWithName(strSegmentName);
		}

		i++;
	}

	return p_xne;
}
XmlNodeElement * XmlInfo::find(const std::string strPath) const {
	std::list<std::string> listPath;
	XGDaemonUtil::split_string(strPath, '/', listPath);
	return find(listPath);
}
XmlNodeElement * XmlInfo::find1(const std::string & strName1) const {
	if (doesRootElementMatch(strName1)) {
		return m_p_xneRoot;
	} else {
		return NULL;
	}
}
XmlNodeElement * XmlInfo::find2(const std::string & strName1, const std::string & strName2) const {
	if (doesRootElementMatch(strName1)) {
		return m_p_xneRoot->find1(strName2);
	} else {
		return NULL;
	}
}
XmlNodeElement * XmlInfo::find3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const {
	if (doesRootElementMatch(strName1)) {
		return m_p_xneRoot->find2(strName2, strName3);
	} else {
		return NULL;
	}
}
XmlNodeElement * XmlInfo::find4(const std::string & strName1, const std::string & strName2, const std::string & strName3, const std::string & strName4) const {
	if (doesRootElementMatch(strName1)) {
		return m_p_xneRoot->find3(strName2, strName3, strName4);
	} else {
		return NULL;
	}
}

XmlNodeElement * XmlInfo::getRoot() const {
	return m_p_xneRoot;
}
XmlNodeElement & XmlInfo::pushElement(const std::string & strElementName) {
	if (m_p_xneRoot == NULL) {
		return setRootElement(strElementName);
	} else {
		if (m_p_xneCurrent == NULL) throw std::logic_error("Expected current node to be non-NULL.");
		XmlNodeElement & xneCurrentNew = m_p_xneCurrent->addChildElement(strElementName);
		m_p_xneCurrent = &xneCurrentNew;
		return *m_p_xneCurrent;
	}
}
XmlNodeElement & XmlInfo::reparentRoot(const std::string & strName)
{
	XmlNodeElement * p_xneNewRoot = new XmlNodeElement(NULL, strName);
	if (p_xneNewRoot == NULL) throw std::bad_alloc();

	if (m_p_xneRoot != NULL) p_xneNewRoot->linkChild(*m_p_xneRoot);

	m_p_xneRoot = p_xneNewRoot;
	return *m_p_xneRoot;
}
XmlNodeElement & XmlInfo::setRootElement(const std::string & strElementName) {
	bool flagSetRoot = false;

	if (m_p_xneRoot == NULL) {
		flagSetRoot = true;
	} else {
		flagSetRoot = (m_p_xneRoot->getName() != strElementName);
	}

	if (flagSetRoot) {
		if (m_p_xneRoot != NULL) clear(); 
		if (m_p_xneRoot != NULL) throw std::logic_error("Expected pointer to be NULL.");

		m_p_xneRoot = new XmlNodeElement(NULL, strElementName);
		if (m_p_xneRoot == NULL) throw std::bad_alloc();

		m_p_xneCurrent = m_p_xneRoot;
	}

	if (m_p_xneRoot == NULL) throw std::logic_error("Expected pointer to be non-NULL.");
	return *m_p_xneRoot;
}
XmlNodeElement & XmlInfo::surefind(const std::list<std::string> listPath) const {
	XmlNodeElement * p_xneFound = find(listPath);
	if (p_xneFound == NULL) {
		std::string strXmlPath;
		XGDaemonUtil::unsplit_string(strXmlPath, "/", listPath);
		std::string strDescription = "Expected XML path \"" + strXmlPath + "\" does not exist.";
		throw std::logic_error(strDescription);
	} else {
		return *p_xneFound;
	}
}
XmlNodeElement & XmlInfo::surefind(const std::string strPath) const {
	std::list<std::string> listPath;
	XGDaemonUtil::split_string(strPath, '/', listPath);
	return surefind(listPath);
}
XmlNodeElement & XmlInfo::sureroot() const {
	XmlNodeElement * p_xneRoot = getRoot();
	if (p_xneRoot == NULL) {
		throw std::logic_error("Expected root node does not exist.");
	} else {
		return *p_xneRoot;
	}
}

XmlNode::XmlNode(XmlNodeElement * p_xneParent) : m_p_xneParent(p_xneParent), m_flagOverrideNiceFormat(false) {
}
XmlNode::~XmlNode() {
}
bool XmlNode::getFlagOverrideNiceFormat() const {
	return m_flagOverrideNiceFormat;
}
int XmlNode::getDepth() const {
	if (m_p_xneParent == NULL) {
		return 0;
	} else {
		return 1 + m_p_xneParent->getDepth();
	}
}
void XmlNode::linkToParent(XmlNodeElement & xneNewParent) {
	xneNewParent.linkChild(*this);
}
void XmlNode::unlinkFromParent() {
	if (m_p_xneParent == NULL) throw std::logic_error("No parent to unlink from.");
	m_p_xneParent->unlinkChild(*this);
}
XmlNodeElement * XmlNode::getParent() const {
	return m_p_xneParent;
}



XmlNodeElement::XmlNodeElement(XmlNodeElement * p_xneParent, const std::string & strName) : XmlNode(p_xneParent), m_strName(strName) {
}
XmlNodeElement::~XmlNodeElement() {
	while (m_listChildren.size() > 0) {
		XmlNode * p_xnFirst = m_listChildren.front();
		if (p_xnFirst != NULL) delete p_xnFirst;
		m_listChildren.pop_front();
	}
}
bool XmlNodeElement::get1InternalText_Bool(bool flagDefault) const {
	const std::string & str1InternalTextTrimmedLower = XGDaemonUtil::getToLowerString(get1InternalText_Trimmed());

	if (str1InternalTextTrimmedLower == "true") {
		return true;
	} else if (str1InternalTextTrimmedLower == "false") {
		return false;
	} else {
		return flagDefault;
	}
}
bool XmlNodeElement::has1InternalText() const {
	XmlNodeText * p_xnt1AndOnly = getTheOnlyChildTextNode();
	return (p_xnt1AndOnly != NULL);
}

unsigned long XmlNodeElement::get1InternalText_UL(unsigned long valueDefault) const {
	const std::string & str1InternalTextTrimmed = get1InternalText_Trimmed();
	return XGDaemonUtil::getValueStrUL(str1InternalTextTrimmed, valueDefault);
}
unsigned long XmlNodeElement::get1InternalText_UL_Hex(unsigned long valueDefault) const {
	const std::string & str1InternalTextTrimmed = get1InternalText_Trimmed();
	return XGDaemonUtil::getValueStrUL_Hex(str1InternalTextTrimmed, valueDefault);
}

void XmlNodeElement::addAttribute(const std::string & strAttributeName, const std::string & strAttributeValue) {
	XmlAttribute attr(strAttributeName, strAttributeValue);
	addAttribute(attr);
}
void XmlNodeElement::addAttribute(const XmlAttribute & attr) {
	m_listAttributes.push_back(attr);
}
void XmlNodeElement::generateXML(std::ostringstream & os, const bool flagNiceFormat, const int indent, const XmlNode * p_xnPrev, const XmlNode * p_xnNext) const {
	bool flagDoTheOnlyChildTextNode = false;
	XmlNodeText * p_xntOnlyChild = getTheOnlyChildTextNode();
	if (p_xntOnlyChild != NULL && p_xntOnlyChild->isNotEmpty()) flagDoTheOnlyChildTextNode = true;
	

	if (flagNiceFormat && (p_xnPrev == NULL || p_xnPrev->getFlagOverrideNiceFormat() == false)) XmlUtil::generateXML_Indent(os, getDepth() + indent);

	os << '<' << m_strName;

	if (m_listAttributes.size() > 0) {
		std::list<XmlAttribute>::const_iterator i = m_listAttributes.begin();
		std::list<XmlAttribute>::const_iterator iEnd = m_listAttributes.end();
		while (i != iEnd) {
			XmlAttribute attr = *i;
			os << ' ' << attr.getName();
			std::string strValue = attr.getValue();
			if (strValue.length() > 0) os << "=\"" << strValue << '"';
			i++;
		}
		
	}

	if (m_listChildren.size() == 0 || (p_xntOnlyChild != NULL && flagDoTheOnlyChildTextNode == false)) {
		os << "/";
	}

	os << '>';

	if (p_xntOnlyChild != NULL) {
		if (flagDoTheOnlyChildTextNode) p_xntOnlyChild->generateXML(os, false, indent, NULL, NULL);
	} else {
		if (m_listChildren.size() > 0) {
			std::list<XmlNode*>::const_iterator iPrev = (std::list<XmlNode*>::const_iterator)NULL;
			std::list<XmlNode*>::const_iterator i = m_listChildren.begin();
			std::list<XmlNode*>::const_iterator iNext = i;
			std::list<XmlNode*>::const_iterator iEnd = m_listChildren.end();
			if (iNext == iEnd) iNext = (std::list<XmlNode*>::const_iterator)NULL; else iNext++;

			if (i != iEnd) {
				XmlNode * p_xnChildFirst = *i;
				if (p_xnChildFirst != NULL) {
					if (flagNiceFormat && p_xnChildFirst->getFlagOverrideNiceFormat() == false) os << std::endl;
				}
			}

			while (i != iEnd) {
				XmlNode * p_xnChild = *i;
				if (p_xnChild != NULL) {
					XmlNode * p_xnChildPrev = NULL;
					XmlNode * p_xnChildNext = NULL;
					if (iPrev != (std::list<XmlNode*>::const_iterator)NULL && iPrev != iEnd) {
						p_xnChildPrev = *iPrev;
					}
					if (iNext != (std::list<XmlNode*>::const_iterator)NULL && iNext != iEnd) {
						p_xnChildNext = *iNext;
					}
					p_xnChild->generateXML(os, flagNiceFormat, indent, p_xnChildPrev, p_xnChildNext);
				}
				iPrev = i;
				i = iNext;
				if (iNext != iEnd) iNext++;
			}

			if (iPrev != (std::list<XmlNode*>::const_iterator)NULL && iPrev != iEnd) {
				XmlNode * p_xnChildLast = *iPrev;
				if (p_xnChildLast != NULL) {
					if (flagNiceFormat && p_xnChildLast->getFlagOverrideNiceFormat() == false) XmlUtil::generateXML_Indent(os, getDepth() + indent);
				}
			}
		}
	}
	if (m_listChildren.size() > 0) {
		if (p_xntOnlyChild == NULL || (p_xntOnlyChild != NULL && flagDoTheOnlyChildTextNode)) {
			os << "</" << m_strName << '>';
		}
	}

	if (flagNiceFormat && (p_xnNext == NULL || p_xnNext->getFlagOverrideNiceFormat() == false)) os << std::endl;
}
void XmlNodeElement::linkChild(XmlNode & xnChild) {
	if (xnChild.m_p_xneParent != NULL) throw std::logic_error("Child must unlink from its current parent first.");

	m_listChildren.push_back(&xnChild);
	xnChild.m_p_xneParent = this;
}
void XmlNodeElement::print() const {
	int depth = getDepth();
	for (int i = 0; i < depth; i++) std::cout << ' ';

	std::cout << m_strName << std::endl;

	std::list<XmlNode*>::const_iterator i = m_listChildren.begin();
	std::list<XmlNode*>::const_iterator iEnd = m_listChildren.end();
	while (i != iEnd) {
		XmlNode * p_xnChild = *i;
		if (p_xnChild != NULL) p_xnChild->print();
		i++;
	}
}
void XmlNodeElement::trimText() {
	std::list<XmlNode*>::iterator i = m_listChildren.begin();
	std::list<XmlNode*>::const_iterator iEnd = m_listChildren.end();
	while (i != iEnd) {
		XmlNode * p_xnChild = *i;
		XmlNodeElement * p_xneChild = dynamic_cast<XmlNodeElement*>(p_xnChild);
		if (p_xneChild != NULL) {
			p_xneChild->trimText();
		} else {
			XmlNodeText * p_xntChild = dynamic_cast<XmlNodeText*>(p_xnChild);
			if (p_xntChild != NULL) {
				p_xntChild->trim();
				if (p_xntChild->isEmpty()) {
					*i = NULL;
					delete p_xntChild;
				}
			}
		}
		if (*i == NULL) {
			std::list<XmlNode*>::iterator iDelete = i;
			i++;
			m_listChildren.erase(iDelete);
		} else {
			i++;
		}
	}
	
}
void XmlNodeElement::unlinkChild(XmlNode & xnChild) {
	m_listChildren.remove(&xnChild);
	xnChild.m_p_xneParent = NULL;
}
const std::list<XmlNode*> & XmlNodeElement::getChildren() const {
	return m_listChildren;
}
const std::string & XmlNodeElement::getName() const {
	return m_strName;
}
const std::string & XmlNodeElement::get1InternalText() const {
	XmlNodeText * p_xnt = getTheOnlyChildTextNode();
	if (p_xnt == NULL) {
		return m_strEmptyString;
	} else {
		return p_xnt->getText();
	}
}
const std::string & XmlNodeElement::get1InternalText_Child1(const std::string & strName1) const {
	const XmlNodeElement * p_xne1 = find1(strName1);
	if (p_xne1 == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne1->get1InternalText();
	}
}
const std::string & XmlNodeElement::get1InternalText_Child2(const std::string & strName1, const std::string & strName2) const {
	const XmlNodeElement * p_xne2 = find2(strName1, strName2);
	if (p_xne2 == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne2->get1InternalText();
	}
}
const std::string & XmlNodeElement::get1InternalText_Child3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const {
	const XmlNodeElement * p_xne3 = find3(strName1, strName2, strName3);
	if (p_xne3 == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne3->get1InternalText();
	}
}
std::string XmlNodeElement::get1InternalText_Trimmed() const {
	const std::string & str1InternalText = get1InternalText();
	return XGDaemonUtil::getTrimmedString(str1InternalText);
}
std::string XmlNodeElement::get1InternalText_Trimmed_Child1(const std::string & strName1) const {
	const std::string & str1InternalText = get1InternalText_Child1(strName1);
	return XGDaemonUtil::getTrimmedString(str1InternalText);
}
std::string XmlNodeElement::get1InternalText_Trimmed_Child2(const std::string & strName1, const std::string & strName2) const {
	const std::string & str1InternalText = get1InternalText_Child2(strName1, strName2);
	return XGDaemonUtil::getTrimmedString(str1InternalText);	
}
std::string XmlNodeElement::get1InternalText_Trimmed_Child3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const {
	const std::string & str1InternalText = get1InternalText_Child3(strName1, strName2, strName3);
	return XGDaemonUtil::getTrimmedString(str1InternalText);
}
std::string XmlNodeElement::get1InternalText_UnEscaped() const {
	const std::string & str1InternalText = get1InternalText();
	return XGDaemonUtil::getStrUnEscapedAmpersand(str1InternalText);
}

std::string XmlNodeElement::getPathRepr() const {
	std::string strPathRepr;
	if (m_p_xneParent != NULL) strPathRepr = m_p_xneParent->getPathRepr();
	strPathRepr += '/';
	strPathRepr += m_strName;
	return strPathRepr;
}
XmlNodeElement & XmlNodeElement::addChildElement(const std::string & strName) {
	XmlNodeElement * p_xneChild = new XmlNodeElement(this, strName);
	if (p_xneChild == NULL) throw std::bad_alloc();
	m_listChildren.push_back(p_xneChild);
	return *p_xneChild;
}
XmlNodeElement * XmlNodeElement::findChildElementWithName(const std::string & strName) const {
	std::list<XmlNode*>::const_iterator i = m_listChildren.begin();
	std::list<XmlNode*>::const_iterator iEnd = m_listChildren.end();
	while (i != iEnd) {
		XmlNode * p_xnChild = *i;
		XmlNodeElement * p_xnChildElement = dynamic_cast<XmlNodeElement*>(p_xnChild);
		if (p_xnChildElement != NULL) {
			if (p_xnChildElement->getName() == strName) return p_xnChildElement;
		}
		i++;
	}
	return NULL;
}
XmlNodeElement * XmlNodeElement::find1(const std::string & strName1) const {
	return findChildElementWithName(strName1);
}
XmlNodeElement * XmlNodeElement::find2(const std::string & strName1, const std::string & strName2) const {
	XmlNodeElement * p_xne1 = findChildElementWithName(strName1);
	if (p_xne1 == NULL) {
		return NULL;
	} else {
		return p_xne1->find1(strName2);
	}
}
XmlNodeElement * XmlNodeElement::find3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const {
	XmlNodeElement * p_xne1 = findChildElementWithName(strName1);
	if (p_xne1 == NULL) {
		return NULL;
	} else {
		return p_xne1->find2(strName2, strName3);
	}
}
XmlNodeElement & XmlNodeElement::obtainChildElement(const std::string & strName) {
	XmlNodeElement * p_xneChild = findChildElementWithName(strName);
	if (p_xneChild != NULL) return *p_xneChild;

	return addChildElement(strName);
}
XmlNodeElement & XmlNodeElement::surefind1(const std::string & strName1) const {
	XmlNodeElement * p_xne1 = findChildElementWithName(strName1);
	if (p_xne1 == NULL) XmlUtil::throwLogicErrorExpectedChildNotFound(*this, strName1);

	return *p_xne1;
}
XmlNodeElement & XmlNodeElement::surefind2(const std::string & strName1, const std::string & strName2) const {
	XmlNodeElement * p_xne1 = findChildElementWithName(strName1);
	if (p_xne1 == NULL) XmlUtil::throwLogicErrorExpectedChildNotFound(*this, strName1);

	return p_xne1->surefind1(strName2);
}
XmlNodeElement & XmlNodeElement::surefind3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const {
	XmlNodeElement * p_xne1 = findChildElementWithName(strName1);
	if (p_xne1 == NULL) XmlUtil::throwLogicErrorExpectedChildNotFound(*this, strName1);

	return p_xne1->surefind2(strName2, strName3);
}
XmlNodeText * XmlNodeElement::addText(const std::string & strText) {
	return addText(strText, false);
}
XmlNodeText * XmlNodeElement::addText(const std::string & strText, bool flagOverrideNiceFormat) {
	XmlNodeText * p_xnChildLastText = getXmlTextNodeLast();
	if (p_xnChildLastText != NULL) p_xnChildLastText->appendText(strText, flagOverrideNiceFormat);
	return p_xnChildLastText;
}
XmlNodeText * XmlNodeElement::addText(const std::string & strText, int totalTimes, bool flagOverrideNiceFormat) {
	if (totalTimes == 0) {
		return NULL;
	} else {
		XmlNodeText * p_xnt = addText(strText);
		if (p_xnt != NULL) {
			for (int i = 1; i < totalTimes; i++) {
				p_xnt->appendText(strText, flagOverrideNiceFormat);
			}
		}
		return p_xnt;
	}
}
XmlNodeText * XmlNodeElement::addTextNoEsc(TextToken token) {
	return addTextNoEsc(token, false);
}
XmlNodeText * XmlNodeElement::addTextNoEsc(TextToken token, bool flagOverrideNiceFormat) {
	XmlNodeText * p_xnChildLastText = getXmlTextNodeLast();
	if (p_xnChildLastText != NULL) p_xnChildLastText->appendTextNoEsc(token, flagOverrideNiceFormat);
	return p_xnChildLastText;
}
XmlNodeText * XmlNodeElement::addTextNoEsc(TextToken token, int totalTimes, bool flagOverrideNiceFormat) {
	if (totalTimes == 0) {
		return NULL;
	} else {
		XmlNodeText * p_xnt = addTextNoEsc(token);
		if (p_xnt != NULL) {
			for (int i = 1; i < totalTimes; i++) {
				p_xnt->appendTextNoEsc(token, flagOverrideNiceFormat);
			}
		}
		return p_xnt;
	}
}
XmlNodeText * XmlNodeElement::addTextNoEsc(const std::string & strText) {
	return addTextNoEsc(strText, false);
}
XmlNodeText * XmlNodeElement::addTextNoEsc(const std::string & strText, bool flagOverrideNiceFormat) {
	XmlNodeText * p_xnChildLastText = getXmlTextNodeLast();
	if (p_xnChildLastText != NULL) p_xnChildLastText->appendTextNoEsc(strText, flagOverrideNiceFormat);
	return p_xnChildLastText;
}

XmlNodeText * XmlNodeElement::getTheOnlyChildTextNode() const {
	if (m_listChildren.size() == 1) {
		XmlNode * p_xnFirst  = m_listChildren.front();
		XmlNodeText * p_xnt = dynamic_cast<XmlNodeText*>(p_xnFirst);
		return p_xnt;
	} else {
		return NULL;
	}
}
XmlNodeText * XmlNodeElement::getXmlTextNodeLast() {
	XmlNodeText * p_xnChildLastText = NULL;
	if (m_listChildren.size() > 0) {
		XmlNode * p_xnChildLast = m_listChildren.back();
		p_xnChildLastText = dynamic_cast<XmlNodeText*>(p_xnChildLast);
	}

	if (p_xnChildLastText == NULL) {
		XmlNodeText * p_xntNew = new XmlNodeText(this);
		if (p_xntNew != NULL) {
			m_listChildren.push_back(p_xntNew);
		}
		p_xnChildLastText = p_xntNew;  
	}

	return p_xnChildLastText;
}



XmlNodeText::XmlNodeText(XmlNodeElement * p_xneParent) : XmlNode(p_xneParent) {
}
XmlNodeText::XmlNodeText(XmlNodeElement * p_xneParent, const std::string & strText) : XmlNode(p_xneParent) {
	appendText(strText);
}
XmlNodeText::XmlNodeText(XmlNodeElement * p_xneParent, TextToken token) : XmlNode(p_xneParent) {
	appendTextNoEsc(token);
}
bool XmlNodeText::isEmpty() const {
	return (m_strText.length() == 0);
}
bool XmlNodeText::isNotEmpty() const {
	return (m_strText.length() > 0);
}
void XmlNodeText::appendText(const std::string & strAppendText) {
	m_strText += XGDaemonUtil::getStrEscapedAmpersand(strAppendText);
}
void XmlNodeText::appendText(const std::string & strAppendText, bool flagOverrideNiceFormat) {
	appendText(strAppendText);
	m_flagOverrideNiceFormat = flagOverrideNiceFormat;
}
void XmlNodeText::appendTextNoEsc(const TextToken token) {
	if (token == TEXT_TOKEN_NBSP) {
		m_strText += "&nbsp;";
	} else {
		throw std::logic_error("Invalid text token.");
	}
}
void XmlNodeText::appendTextNoEsc(const TextToken token, bool flagOverrideNiceFormat) {
	appendTextNoEsc(token);
	m_flagOverrideNiceFormat = flagOverrideNiceFormat;
}
void XmlNodeText::appendTextNoEsc(const std::string & strAppendText) {
	m_strText += strAppendText;	
}
void XmlNodeText::appendTextNoEsc(const std::string & strAppendText, bool flagOverrideNiceFormat) {
	appendTextNoEsc(strAppendText);
	m_flagOverrideNiceFormat = flagOverrideNiceFormat;
}
void XmlNodeText::appendTextO(const std::string & strAppendText) {
	appendText(strAppendText, true);
}

void XmlNodeText::generateXML(std::ostringstream & os, const bool flagNiceFormat, const int indent, const XmlNode * p_xnPrev, const XmlNode * p_xnNext) const {
	if (flagNiceFormat && m_flagOverrideNiceFormat == false && (p_xnPrev == NULL || p_xnPrev->getFlagOverrideNiceFormat() == false)) XmlUtil::generateXML_Indent(os, getDepth() + indent);
	os << m_strText;
	if (flagNiceFormat && m_flagOverrideNiceFormat == false && (p_xnNext == NULL || p_xnNext->getFlagOverrideNiceFormat() == false)) os << std::endl;
}
void XmlNodeText::print() const {
	int depth = getDepth();
	for (int i = 0; i < depth; i++) std::cout << ' ';
	std::cout << '"' << m_strText << '"';
	if (XGDaemonUtil::isStrAllWhitespace(m_strText)) std::cout << "  WS";
	std::cout << std::endl;
}
void XmlNodeText::setText(const std::string & strText) {
	m_strText = strText;
}
void XmlNodeText::trim() {
	m_strText = XGDaemonUtil::getTrimmedString(m_strText);
}
const std::string & XmlNodeText::getText() const {
	return m_strText;
}

XmlParseStatus::XmlParseStatus() : m_line(0) {
}
bool XmlParseStatus::gotParseError() const {
	return (m_line > 0);
}
int XmlParseStatus::getLine() const {
	return m_line;
}
void XmlParseStatus::printDesc() const {
	std::cout << getDesc();
}
void XmlParseStatus::setLine(const int line) {
	m_line = line;
}
void XmlParseStatus::setMessage(const std::string & strMessage) {
	m_strMessage = strMessage;
}
std::string XmlParseStatus::getDesc() const {
	std::ostringstream os;
	os << "Encountered error parsing XML." << std::endl;
	os << "Specific error: " << m_strMessage << std::endl;
	os << "Line number: " << m_line << std::endl;
	return os.str();
}
const std::string & XmlParseStatus::getMessage() const {
	return m_strMessage;
}
XmlParser::XmlParser() {
}
bool XmlParser::parse(const std::string & str, XmlInfo & xi, XmlParseStatus & status) {
	unsigned int len = str.length();
	if (len == 0) return false;

	std::string strParse = XGDaemonUtil::getStrEscapedCaret(str);

	XML_Parser parser = XML_ParserCreate(NULL);
	XML_SetUserData(parser, &xi);
	XML_SetCharacterDataHandler(parser, handlerCharacter);
	XML_SetElementHandler(parser, handlerElementStart, handlerElementEnd);
	XML_SetDefaultHandler(parser, handlerDefault);
	XML_SetDefaultHandlerExpand(parser, handlerDefaultExpand);


	int codeParse = XML_Parse(parser, strParse.c_str(), strParse.length(), 1);
	if (codeParse == XML_STATUS_ERROR) {
		status.setLine(XML_GetCurrentLineNumber(parser));
		status.setMessage(XML_ErrorString(XML_GetErrorCode(parser)));
	}
	XML_ParserFree(parser);

	if (codeParse == XML_STATUS_ERROR) {
		return false;
	} else {
		return true;
	}
}

void XmlUtil::generateXML_Indent(std::ostringstream & os, const int indent) {
	for (int i = 0; i < indent; i++) {
		os << ' ';
	}
}
void XmlUtil::throwLogicErrorExpectedChildNotFound(const XmlNodeElement & xne, const std::string & strChildName) {
	std::string strDesc;
	strDesc += "Expected child \"";
	strDesc += strChildName;
	strDesc += "\" not found at: ";
	strDesc += xne.getPathRepr();
	throw std::logic_error(strDesc);
}

