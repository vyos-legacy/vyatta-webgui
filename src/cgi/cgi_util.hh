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
 *  Module:       cgi_util.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Various CGI-related utility code
 *
 */


#ifndef INCLUDE_cgi_util_hh
#define INCLUDE_cgi_util_hh

#include <list>
#include <map>
#include <string>
#include <stdlib.h>

#define	CGI_ENV_QUERY_STRING	"QUERY_STRING"
#define CGI_ENV_HTTP_COOKIE	"HTTP_COOKIE"

#define	MIME_TYPE_TEXT_HTML	"text/html"
#define	MIME_TYPE_TEXT_XML	"text/xml"


class BasicCGI {
public:
	BasicCGI();
	void retrPostArgs();
	void printHeadersCookies();
	void printHeadersTextHtml();
	void printHeadersTextXml();
	void setParamCookieRecv(const std::string & strName, const std::string & strValue);
	void setParamCookieSend(const std::string & strName, const std::string & strValue);
	void setParamGet(const std::string & strName, const std::string & strValue);
	void setParamPost(const std::string & strName, const std::string & strValue);

	const std::string & getCookie(const std::string & strName) const;
	
	const std::string * getPtrParamPost(const std::string & strParam);

protected:

	std::map<std::string, std::string, std::greater<std::string> >   m_mapParamsCookiesRecv;
	std::map<std::string, std::string, std::greater<std::string> >   m_mapParamsCookiesSend;
	std::map<std::string, std::string, std::greater<std::string> >   m_mapParamsGet;
	std::map<std::string, std::string, std::greater<std::string> >   m_mapParamsPost;


	std::string                                                      m_strRawCookiesRecv;
	std::string                                                      m_strRawQueryString;
	std::string                                                      m_strRawInputPost;
};


class CGIUtil {
public:
	static bool convertFromHex(const std::string & strHex, int & value);
	static bool retrCGICookieMap(const std::string & strCGICookies, std::map<std::string, std::string, std::greater<std::string> > & mapCookies);
	static bool retrCGIParamMap(const std::string & strCGIArgs, std::map<std::string, std::string, std::greater<std::string> > & mapParams);


	static bool unescape_http(const std::string & strIn, std::string & strOut);

	static void printCGIHeader(const std::string & strMimeType);
	static void printCGIHeaderCookies(const std::map<std::string, std::string, std::greater<std::string> > & mapParamsCookies);
	static void printCGIHeaderTextHtml();
	static void printCGIHeaderTextXml();
	static void retrEnvVar(const std::string & strEnvVar, std::string & strValue);
	static void retrProgramInputString(std::string & strInputString);

	static std::string convToString(const int value);
};


#endif

