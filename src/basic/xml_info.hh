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
 *  Module:       xml_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  XML parsing & encapsulation
 *
 */



#ifndef __INCLUDE_XML_UTIL__
#define __INCLUDE_XML_UTIL__

#include <list>
#include <sstream>
#include <string>

#include <expat.h>

enum TextToken {
	TEXT_TOKEN_NBSP = 0,
	
};

class XmlAttribute {
public:
	XmlAttribute(const std::string strName, const std::string & strValue);

	const std::string & getName() const;
	const std::string & getValue() const;
private:
	std::string m_strName;
	std::string m_strValue;

};

class XmlNodeElement;

class XmlNode {
public:
	friend class XmlNodeElement;
	XmlNode(XmlNodeElement * p_xneParent);
	virtual ~XmlNode();

	bool getFlagOverrideNiceFormat() const;
	int getDepth() const;

	virtual void generateXML(std::ostringstream & os, const bool flagNiceFormat, const int indent, const XmlNode * p_xnPrev, const XmlNode * p_xnNext) const = 0;
	void linkToParent(XmlNodeElement & xneNewParent);
	virtual void print() const = 0;
	void unlinkFromParent();

	XmlNodeElement * getParent() const;

protected:
	XmlNodeElement *  m_p_xneParent;
	bool              m_flagOverrideNiceFormat;
};

class XmlNodeText : public XmlNode {
public:
	XmlNodeText(XmlNodeElement * p_xneParent);
	XmlNodeText(XmlNodeElement * p_xneParent, const std::string & strText);
	XmlNodeText(XmlNodeElement * p_xneParent, TextToken token);

	bool isEmpty() const;
	bool isNotEmpty() const;

	void appendText(const std::string & strAppendText);
	void appendText(const std::string & strAppendText, bool flagOverrideNiceFormat);

	void appendTextNoEsc(const TextToken token);
	void appendTextNoEsc(const TextToken token, bool flagOverrideNiceFormat);
	
	void appendTextNoEsc(const std::string & strAppendText);
	void appendTextNoEsc(const std::string & strAppendText, bool flagOverrideNiceFormat);

	void appendTextO(const std::string & strAppendText);

	void generateXML(std::ostringstream & os, const bool flagNiceFormat, const int indent, const XmlNode * p_xnPrev, const XmlNode * p_xnNext) const;
	void print() const;
	void setText(const std::string & strText);
	void trim();
	const std::string & getText() const;

protected:
	std::string  m_strText;
};

class XmlNodeElement : public XmlNode {
public:
	XmlNodeElement(XmlNodeElement * p_xnParent, const std::string & strName);
	~XmlNodeElement();

	bool get1InternalText_Bool(bool flagDefault) const;

	bool has1InternalText() const;

	unsigned long get1InternalText_UL(unsigned long valueDefault) const;
	unsigned long get1InternalText_UL_Hex(unsigned long valueDefault) const;

	void addAttribute(const std::string & strAttributeName, const std::string & strAttributeValue);
	void addAttribute(const XmlAttribute & attr);
	void generateXML(std::ostringstream & os, const bool flagNiceFormat, const int indent, const XmlNode * p_xnPrev, const XmlNode * p_xnNext) const;
	void linkChild(XmlNode & xnChild);
	void print() const;
	void trimText();
	void unlinkChild(XmlNode & xnChild);

	const std::list<XmlNode*> & getChildren() const;


	const std::string & getName() const;
	const std::string & get1InternalText() const;

	const std::string & get1InternalText_Child1(const std::string & strName1) const;
	const std::string & get1InternalText_Child2(const std::string & strName1, const std::string & strName2) const;
	const std::string & get1InternalText_Child3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const;	

	std::string get1InternalText_Trimmed() const;
	std::string get1InternalText_Trimmed_Child1(const std::string & strName1) const;
	std::string get1InternalText_Trimmed_Child2(const std::string & strName1, const std::string & strName2) const;
	std::string get1InternalText_Trimmed_Child3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const;
	std::string get1InternalText_UnEscaped() const;

	std::string getPathRepr() const;

	XmlNodeElement & addChildElement(const std::string & strName);
	XmlNodeElement * findChildElementWithName(const std::string & strName) const;
	XmlNodeElement * find1(const std::string & strName1) const;
	XmlNodeElement * find2(const std::string & strName1, const std::string & strName2) const;
	XmlNodeElement * find3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const;
	XmlNodeElement & obtainChildElement(const std::string & strName);

	XmlNodeElement & surefind1(const std::string & strName1) const;
	XmlNodeElement & surefind2(const std::string & strName1, const std::string & strName2) const;
	XmlNodeElement & surefind3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const;

	XmlNodeText * addText(const std::string & strText);
	XmlNodeText * addText(const std::string & strText, bool flagOverrideNiceFormat);
	XmlNodeText * addText(const std::string & strText, int totalTimes, bool flagOverrideNiceFormat);
	XmlNodeText * addTextNoEsc(TextToken token);
	XmlNodeText * addTextNoEsc(TextToken token, bool flagOverrideNiceFormat);
	XmlNodeText * addTextNoEsc(TextToken token, int totalTimes, bool flagOverrideNiceFormat);
	XmlNodeText * addTextNoEsc(const std::string & strText);
	XmlNodeText * addTextNoEsc(const std::string & strText, bool flagOverrideNiceFormat);
	XmlNodeText * getTheOnlyChildTextNode() const;

protected:
	std::list<XmlAttribute>  m_listAttributes;
	std::list<XmlNode *>     m_listChildren;
	std::string              m_strName;
	
	XmlNodeText * getXmlTextNodeLast();
private:
	std::string              m_strEmptyString;
};


class XmlInfo {
public:
	~XmlInfo();
	XmlInfo();

	bool doesRootElementMatch(const std::string & strElementName) const;

	int getCurrentDepth() const;

	void appendInternalText(const std::string & strAppend);
	void appendInternalTextNoEsc(const std::string & strAppend);
	void clear();
	void generateXML(std::ostringstream & os, const bool flagNiceFormat, const int indent) const;
	void generateXML(std::string & str, const bool flagNiceFormat, const int indent) const;
	void popElement(const std::string & strElementName);
	void print() const;
	void printXML() const;
	void retrCurrentPathRepr(std::string & strPath) const;
	void trimText();

	const std::string * getCurrentElement() const;
	std::string getXMLRepr(const bool flagNiceFormat, const int indent) const;
	XmlNodeElement * find(const std::list<std::string> listPath) const;
	XmlNodeElement * find(const std::string strPath) const;
	XmlNodeElement * find1(const std::string & strName1) const;
	XmlNodeElement * find2(const std::string & strName1, const std::string & strName2) const;
	XmlNodeElement * find3(const std::string & strName1, const std::string & strName2, const std::string & strName3) const;
	XmlNodeElement * find4(const std::string & strName1, const std::string & strName2, const std::string & strName3, const std::string & strName4) const;
	XmlNodeElement * getRoot() const;
	XmlNodeElement & pushElement(const std::string & strElementName);
	XmlNodeElement & reparentRoot(const std::string & strName);
	XmlNodeElement & setRootElement(const std::string & strElementName);
	XmlNodeElement & surefind(const std::list<std::string> listPath) const;
	XmlNodeElement & surefind(const std::string strPath) const;
	XmlNodeElement & sureroot() const;

private:
	XmlNodeElement * m_p_xneCurrent;
	XmlNodeElement * m_p_xneRoot;

};

class XmlParseStatus {
public:
	XmlParseStatus();

	bool gotParseError() const;
	int getLine() const;
	void printDesc() const;
	void setLine(const int line);
	void setMessage(const std::string & strMessage);
	std::string getDesc() const;
	const std::string & getMessage() const;
	

private:
	int m_line;
	std::string m_strMessage;
};

class XmlParser {
public:
	static bool parse(const std::string & str, XmlInfo & xi, XmlParseStatus & status);
	XmlParser();
};

class XmlUtil {
public:
	static void generateXML_Indent(std::ostringstream & os, const int indent);
	static void throwLogicErrorExpectedChildNotFound(const XmlNodeElement & xne, const std::string & strChildName);
};

#endif

