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
 *  Module:       cgi_util.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Various CGI-related utility code
 *
 */



#include <iostream>
#include <sstream>

#include "cgi_util.hh"
#include "basic/xgdaemon_util.hh"

BasicCGI::BasicCGI() {
	CGIUtil::retrEnvVar(CGI_ENV_QUERY_STRING, m_strRawQueryString);
	CGIUtil::retrCGIParamMap(m_strRawQueryString, m_mapParamsGet);

	CGIUtil::retrEnvVar(CGI_ENV_HTTP_COOKIE, m_strRawCookiesRecv);
	CGIUtil::retrCGICookieMap(m_strRawCookiesRecv, m_mapParamsCookiesRecv);
}
void BasicCGI::printHeadersCookies() {
	CGIUtil::printCGIHeaderCookies(m_mapParamsCookiesSend);
}
void BasicCGI::printHeadersTextHtml() {
	CGIUtil::printCGIHeaderCookies(m_mapParamsCookiesSend);
	CGIUtil::printCGIHeaderTextHtml();
}
void BasicCGI::printHeadersTextXml() {
	CGIUtil::printCGIHeaderTextXml();
}
void BasicCGI::retrPostArgs() {
	CGIUtil::retrProgramInputString(m_strRawInputPost);
	CGIUtil::retrCGIParamMap(m_strRawInputPost, m_mapParamsPost);
}
void BasicCGI::setParamCookieRecv(const std::string & strName, const std::string & strValue) {
	m_mapParamsCookiesRecv[strName] = strValue;
}
void BasicCGI::setParamCookieSend(const std::string & strName, const std::string & strValue) {
	m_mapParamsCookiesSend[strName] = strValue;
}
void BasicCGI::setParamGet(const std::string & strName, const std::string & strValue) {
	m_mapParamsGet[strName] = strValue;
}
void BasicCGI::setParamPost(const std::string & strName, const std::string & strValue) {
	m_mapParamsPost[strName] = strValue;
}
const std::string & BasicCGI::getCookie(const std::string & strName) const { 
	std::map<std::string, std::string, std::greater<std::string> >::const_iterator i = m_mapParamsCookiesRecv.begin();
	std::map<std::string, std::string, std::greater<std::string> >::const_iterator iEnd = m_mapParamsCookiesRecv.end();

	while (i != iEnd) {
		if (i->first == strName) return i->second;
		i++;
	}

	return XGDaemonUtil::getBlankString();
}
const std::string * BasicCGI::getPtrParamPost(const std::string & strParam) {
	const std::map<std::string, std::string, std::greater<std::string> >::const_iterator i = m_mapParamsPost.find(strParam);
	if (i == m_mapParamsPost.end()) {
		return NULL;
	} else {
		const std::string & strParamValue = i->second;
		return &strParamValue;
	}
}


bool CGIUtil::convertFromHex(const std::string & strHex, int & value) {
	value = 0;
	int length = strHex.length();
	for (int i = 0; i < length; i++) {
		int num = 0;
		char c = strHex[i];
		if (c >= '0' && c <= '9') {
			num = c - '0';			
		} else if (c >= 'a' && c <= 'f') {
			num = 10 + (c - 'a');
		} else if (c >= 'A' && c <= 'F') {
			num = 10 + (c - 'A');
		} else {
			return false;
		}
		value = value << 4;
		value += num;
	}
	return true;
}

bool CGIUtil::retrCGICookieMap(const std::string & strCGICookies, std::map<std::string, std::string, std::greater<std::string> > & mapCookies) {
	std::list<std::string> listInput;
        XGDaemonUtil::split_string(strCGICookies, ';', listInput);

        std::list<std::string>::iterator i = listInput.begin();
        while (i != listInput.end()) {
                std::string strCookieLine = (std::string)(*i);
                int indexEq = strCookieLine.find("=");
                std::string strCookieName = strCookieLine.substr(0, indexEq);
                std::string strCookieValue = strCookieLine.substr(indexEq+1);

		std::string strCookieNameUnescaped;
		std::string strCookieValueUnescaped;

		if (unescape_http(strCookieName, strCookieNameUnescaped) && unescape_http(strCookieValue, strCookieValueUnescaped)) {
			mapCookies[strCookieNameUnescaped] = strCookieValueUnescaped;
		}

                i++;
        }
	return true;
}

bool CGIUtil::retrCGIParamMap(const std::string & strCGIArgs, std::map<std::string, std::string, std::greater<std::string> > & mapParams) {

	std::list<std::string> listInput;
        XGDaemonUtil::split_string(strCGIArgs, '&', listInput);

        std::list<std::string>::iterator i = listInput.begin();
        while (i != listInput.end()) {
                std::string strParamLine = (std::string)(*i);
                int indexEq = strParamLine.find("=");
                std::string strParamName = strParamLine.substr(0, indexEq);
                std::string strParamValue = strParamLine.substr(indexEq+1);

		std::string strParamNameUnescaped;
		std::string strParamValueUnescaped;

		if (unescape_http(strParamName, strParamNameUnescaped) && unescape_http(strParamValue, strParamValueUnescaped)) {
			mapParams[strParamNameUnescaped] = strParamValueUnescaped;
		}

                i++;
        }
	return true;
}

bool CGIUtil::unescape_http(const std::string & strIn, std::string & strOut) {

	strOut.clear();
	
	int length = strIn.length();
	for (int i = 0; i < length; i++) {
		char c = strIn[i];
		if (c == '%') {
			if (i + 1 < length) {
				char d = strIn[i+1];
				if (d == '%') {
					strOut += '%';
					i++;
				} else {
					if (i+2 < length) {
						std::string strHex;
						strHex += d;
						strHex += strIn[i+2];
						i += 2;

						int value = 0;
						if (convertFromHex(strHex, value) == false) {
							return false;
						} else {
							strOut += (char)value;
						}
					} else {
						return false;
					}
				}
			} else {
				return false;
			}
		} else if (c == '+') {
			strOut += ' ';
		} else {
			strOut += c;
		}
	}

	return true;
}
void CGIUtil::printCGIHeader(const std::string & strMimeType) {
	std::cout << "Content-type: " << strMimeType << std::endl << std::endl;
}
void CGIUtil::printCGIHeaderCookies(const std::map<std::string, std::string, std::greater<std::string> > & mapParamsCookies) {
	if (mapParamsCookies.size() > 0) {
		std::cout << "Set-Cookie: ";

		std::map<std::string, std::string, std::greater<std::string> >::const_iterator i = mapParamsCookies.begin();
		std::map<std::string, std::string, std::greater<std::string> >::const_iterator iEnd = mapParamsCookies.end();

		while (i != iEnd) {
			std::cout << i->first;
			std::cout << '=';
			std::cout << i->second;
			std::cout << ';';

			i++;
		}

		std::cout << std::endl;
	}
}
void CGIUtil::printCGIHeaderTextHtml() {
	printCGIHeader(MIME_TYPE_TEXT_HTML);
}
void CGIUtil::printCGIHeaderTextXml() {
	printCGIHeader(MIME_TYPE_TEXT_XML);
}
void CGIUtil::retrEnvVar(const std::string & strEnvVar, std::string & strValue) {
	strValue.clear();
	const char * strVal = getenv(strEnvVar.c_str());
	if (strVal != NULL) strValue = strVal;
}

void CGIUtil::retrProgramInputString(std::string & strInputString) {
	strInputString.clear();

	std::istreambuf_iterator<char> inpos(std::cin);
	std::istreambuf_iterator<char> endpos;

	while (inpos != endpos) {
		char c = *inpos;
		strInputString += c;
		inpos++;
	}
}

std::string CGIUtil::convToString(const int value) {
	std::stringstream  stream;
	stream << value;
	return stream.str();
}


