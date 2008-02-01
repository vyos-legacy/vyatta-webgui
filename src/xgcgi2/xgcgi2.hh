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
 *  Module:       xgcgi.cc
 *
 *  Author(s):    DHAP Digital Inc. Michael Portuesi, Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Parts of original XORP GUI CGI modified to act as a proxy between AJAX GUI and xgdaemon
 *
 */


#ifndef __INCLUDE_XGCGI_HH__
#define __INCLUDE_XGCGI_HH__

#include "config.h"
#include "cgi_log.hh"
#include "basic/basic_error_info.hh"
#include "basic/xml_info.hh"
#include "basic_client/basic_xgdaemon_client.hh"
#include "cgi/cgi_util.hh"


//
// CGI-specific XML elements
//
#define XML_ELEMENT_RL_WEB			"rlweb"

//
// CGI-specific error codes
//
#define ERROR_ID_CGI_UNK			1000
#define ERROR_ID_CGI_XML_PARSE		1001
#define ERROR_ID_CGI_XML_INVALID	1002
#define ERROR_ID_CGI_XGD_CONNECT	1003
#define ERROR_ID_CGI_XGD_SEND		1004
#define ERROR_ID_CGI_XGD_RECV		1005

//
// default config file location.
//
#define DEFAULT_CONFIG_FILE		SYSCONFDIR "/xgcgi2.conf"

//
// XML paths to options within config file
//
#define XGCGI_CONFIG_CONNECT_HOST	"xgcgiconfig/connection/host"
#define XGCGI_CONFIG_CONNECT_PORT	"xgcgiconfig/connection/port"
#define XGCGI_CONFIG_LOGFILE_PATH	"xgcgiconfig/logging/logfile"
#define XGCGI_CONFIG_SEVERITY_PATH	"xgcgiconfig/logging/severity"
#define XGCGI_CONFIG_LOGRESPEXC_PATH "xgcgiconfig/logging/response_excludes"
#define XGCGI_CONFIG_LOGREQPEXC_PATH "xgcgiconfig/logging/request_excludes"
#define XGCGI_CONFIG_XMLPATH_ELEMENT "xmlpath"
#define XGCGI_CONFIG_ACTION_ELEMENT "action"


//
// default settings for configuration
//
#define DEFAULT_LOG_FILE  			"/var/log/xgcgi2.log"
#define DEFAULT_LOG_LEVEL			"debug"


class XGCGI2 : public BasicCGI, public BasicXGDaemonClient {
public:
	XGCGI2();

	bool run();

protected:
	CGILog			m_log;
	unsigned int	m_port;
	std::string		m_host;
	std::string		m_responseExcludePath;
	std::string		m_requestExcludeAction;	

	void cgiError( const BasicErrorInfo & error );
	bool parseBrowserRequest(XmlInfo& browserRequest, XmlNodeElement*& rlNodeElement);
	bool doReceiveAndDisplayContextResponse();	
	void logXMLResponse(std::string& log_output);	
	bool readConfigFile();
};

#endif

