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


#include <fstream>
#include <map>
#include <string>
#include <iostream>

#include "xgcgi2.hh"
#include "basic/common_xml.hh"
#include "basic/xgdaemon_socket.hh"
#include "basic/xgdaemon_util.hh"


#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>


XGCGI2::XGCGI2() {
}

void XGCGI2::logXMLResponse(std::string& log_output)
{
	std::string log_msg = "Response:\n";
	log_msg += log_output;
	m_log.log(LOG_DEBUG, log_msg);
}

void XGCGI2::cgiError( const BasicErrorInfo & error )
{
	// unpack error
	std::string desc = error.getDesc();
	std::string codeStr = CGIUtil::convToString(error.getCodeError());
	std::string lineStr = CGIUtil::convToString(error.getLine());
		
	// log detailed error message
	std::string logMsg = lineStr + "/" + codeStr + ": " + desc;
	m_log.log(LOG_ERROR, logMsg);	

	// Build XML output tree.  A detailed error message is not output to the
	// web client for security reasons.  (Errors originating from the xgdaemon
	// rather than the CGI *are* passed through to the web client).
	XmlInfo xiOutput;
	XmlNodeElement& xneErrorRoot = xiOutput.setRootElement(XML_ELEMENT_RL_WEB);
	XmlNodeElement& xneError = xneErrorRoot.addChildElement(XML_SRV_RL_ERROR);
	XmlNodeElement& xneErrorDesc = xneError.addChildElement(XML_SRV_RL_ERROR_DESC);
	xneErrorDesc.addText("An error has occurred processing your request. Please see the server log file for details.");
	
	// log the response
	std::string log_output;
	xiOutput.generateXML(log_output, true, 0);
	logXMLResponse(log_output);
	
	// print response out to web client
	printHeadersTextXml();
	std::cout << log_output << std::endl;
}

bool XGCGI2::doReceiveAndDisplayContextResponse() { 

	// Receive response from xgdaemon
	std::string xgdResponseStr;
	if (receiveResponse(xgdResponseStr) == false) {
		BasicErrorInfo err(__LINE__, ERROR_ID_CGI_XGD_RECV,
			"Error receiving response from xgdaemon server." );
		cgiError(err);
		return false;
	}
	
	// Parse response from xgdaemon
	XmlParseStatus status;
	XmlInfo xgdResponse;
	if (XmlParser::parse( xgdResponseStr, xgdResponse, status ) == false)
	{
		std::string log_msg = "Error parsing XML response from xgdaemon server: ";
		log_msg += status.getMessage();
		BasicErrorInfo err(__LINE__, ERROR_ID_CGI_XGD_RECV, log_msg);
		cgiError(err);
		return false;
	}
	
	// Determine if response should be logged, based on its contents
	bool logResponse = true;
	if (!m_responseExcludePath.empty())
	{
		if (xgdResponse.find(m_responseExcludePath) != NULL)
		{
			logResponse = false;
		}
	}
	
	// Wrap xgdaemon response in an enclosing XML element
	xgdResponse.reparentRoot( XML_ELEMENT_RL_WEB );	
	xgdResponse.trimText();
	std::string reponse_output;
	xgdResponse.generateXML(reponse_output, true, 0);
	
	// Log reponse, if desired
	if (logResponse)
	{
		logXMLResponse(reponse_output);
	}
	
	// Print XML to browser client as CGI response.
	printHeadersTextXml();
	std::cout << reponse_output << std::endl;

	return true;
}

bool XGCGI2::parseBrowserRequest(XmlInfo& browserRequest, XmlNodeElement*& rlNodeElement)
{

	// Parse XML from browser
	XmlParseStatus parseStatus;
	if ( XmlParser::parse(m_strRawInputPost, browserRequest, parseStatus) == false )
	{
		std::string msg = "Could not parse XML payload sent by browser in POST: ";
		msg += parseStatus.getMessage();
		BasicErrorInfo err(__LINE__, ERROR_ID_CGI_XML_PARSE, msg);
		cgiError(err);
		return false;
	}
	
	// Check top-level element for validity
	if ( browserRequest.doesRootElementMatch(XML_ELEMENT_RL_WEB) == false )
	{
		BasicErrorInfo err(__LINE__, ERROR_ID_CGI_XML_INVALID, 
			"XML payload sent by browser does not contain proper root-level <" XML_ELEMENT_RL_WEB "> element.");
		cgiError(err);
		return false;
	}

	browserRequest.trimText();

	// Find the 'rl' element (xgdaemon request top-level) embedded within payload
	std::list<std::string> rlPathList;
	rlPathList.push_back(XML_ELEMENT_RL_WEB);
	rlPathList.push_back(XML_SRV_RL);
	rlNodeElement = browserRequest.find(rlPathList);
	if ( rlNodeElement == NULL )
	{
		BasicErrorInfo err(__LINE__, ERROR_ID_CGI_XML_INVALID, 
			"XML payload sent by browser does not contain an embedded <" XML_SRV_RL "> element.");
		cgiError(err);
		return false;
	}

	// Check to see if this request is for an action we want to log
	bool logRequest = true;
	if (!m_requestExcludeAction.empty())
	{
		XmlNodeElement* actionElement = rlNodeElement->find1(XGCGI_CONFIG_ACTION_ELEMENT);
		if (actionElement != NULL)
		{
			if ( m_requestExcludeAction == (actionElement->get1InternalText_Trimmed()))
			{
				logRequest = false;
			}
		}
	}
	
	// Log request string if desired
	if (logRequest == true)
	{
		std::string log_msg = "Request:\n";
		log_msg += m_strRawInputPost;
		m_log.log( LOG_DEBUG, log_msg );
	}

	return true;
}

bool XGCGI2::readConfigFile()
{
	// look for config file in current working directory
	struct stat statInfo;
	if (stat(DEFAULT_CONFIG_FILE, &statInfo) == 0)
	{
		// read entire config file into string
		std::string configStr;
		XGDaemonUtil::retrFileContents(DEFAULT_CONFIG_FILE, configStr);

		// parse xml and extract config options
		XmlInfo xiConfig;
		XmlParseStatus parseStatus;
		if ( XmlParser::parse(configStr, xiConfig, parseStatus) == true )
		{
			xiConfig.trimText();
			
			// xgdaemon host (currently restricted to an IP address)
			XmlNodeElement* host = xiConfig.find(XGCGI_CONFIG_CONNECT_HOST);
			if (host != NULL)
			{
				std::string hostname = host->get1InternalText_Trimmed();
				if (!hostname.empty())
				{
					if (XGDaemonSocketUtil::resolveHostname( hostname, m_host) == false)
					{
						BasicErrorInfo err(__LINE__, ERROR_ID_CGI_XGD_CONNECT, 
							"Cannot resolve hostname " + hostname + " for xgdaemon server.");
						cgiError( err );
						return false;
					}
				}
			}
			
			// xgdaemon port
			XmlNodeElement* port = xiConfig.find(XGCGI_CONFIG_CONNECT_PORT);
			if (port != NULL)
			{
				std::string portnumber = port->get1InternalText_Trimmed();
				if (!portnumber.empty())
				{
					m_port = XGDaemonUtil::getValueStrUInt(portnumber, XGDAEMON_SOCKET_PORT);
				}
			}
			
			// log file path
			XmlNodeElement* logFile = xiConfig.find(XGCGI_CONFIG_LOGFILE_PATH);
			if (logFile != NULL)
			{
				std::string logFilePath = logFile->get1InternalText_Trimmed();
				if (!logFilePath.empty())
				{
					m_log.setLogFile(logFilePath);
				}
			}

			// logging severity level
			XmlNodeElement* severity = xiConfig.find(XGCGI_CONFIG_SEVERITY_PATH);
			if (severity != NULL)
			{
				std::string severityText = severity->get1InternalText_Trimmed();
				if (!severityText.empty())
				{
					m_log.setSeverity(severityText);
				}
			}
			
			// logging response excludes (xgdaemon responses that should not be logged)
			XmlNodeElement* responseExcludes = xiConfig.find(XGCGI_CONFIG_LOGRESPEXC_PATH);
			if (responseExcludes != NULL)
			{
				XmlNodeElement* excludesPaths = responseExcludes->findChildElementWithName(XGCGI_CONFIG_XMLPATH_ELEMENT);
				std::string thisExcludePath = excludesPaths->get1InternalText_Trimmed();
				if ( !thisExcludePath.empty() )
				{
					m_responseExcludePath = thisExcludePath;
				}
			}
			
			// logging request excludes (browser requests that should not be logged)	
			XmlNodeElement* requestExcludes = xiConfig.find(XGCGI_CONFIG_LOGREQPEXC_PATH);
			if (requestExcludes != NULL)
			{
				XmlNodeElement* excludesActions = requestExcludes->findChildElementWithName(XGCGI_CONFIG_ACTION_ELEMENT);
				std::string thisExcludeAction = excludesActions->get1InternalText_Trimmed();
				if ( !thisExcludeAction.empty() )
				{
					m_requestExcludeAction = thisExcludeAction;
				}
			}
		}
	}
	
	return true;	
}

bool XGCGI2::run() {	

	// Set application defaults and read config file
	m_host = XGDAEMON_SOCKET_IP_127_0_0_1;
	m_port = XGDAEMON_SOCKET_PORT;
	m_log.setSeverity( DEFAULT_LOG_LEVEL );
	m_log.setLogFile( DEFAULT_LOG_FILE );
	if ( readConfigFile() == false )
	{
		return false;
	}

	// Read command payload, stored in the body of the POST
	retrPostArgs();
// for debugging
//	m_strRawInputPost = "<rlweb><rl><action>ch_context</action><context><path>/protocols/static</path></context><session_id>23202711-5bfb-4551-a879-aef7e7756ddb</session_id></rl></rlweb>";	

	// Unwrap the xgdaemon message from the POST payload
	XmlInfo browserRequest;
	XmlNodeElement* rlNodeElement; 
	if (parseBrowserRequest(browserRequest, rlNodeElement) == false )
	{
		return false;
	}		

	// Connect to xgdaemon
//	if (connectToServerInet(m_host, m_port) == false) {
//		ErrorInfo err(__LINE__, ERROR_ID_CGI_XGD_CONNECT, "Error connecting to the xgdaemon server.");
//		cgiError( err );
//		return false;
//	}

	// Submit XML request to xgdaemon
	std::ostringstream os;
	rlNodeElement->generateXML(os, false, 0, NULL, NULL);
	std::string xmlRequestStr = os.str();
	if ( sendRequest(xmlRequestStr, m_host, m_port) == false )
	{
		BasicErrorInfo err(__LINE__, ERROR_ID_CGI_XGD_SEND, "Error sending request to the xgdaemon server.");
		cgiError( err );
		return false;
	}
	
	// Retrieve response from xgdaemon and forward back to browser
	return doReceiveAndDisplayContextResponse();	
}


int main(int argc, char ** argv) {

	UNUSED(argc);
	UNUSED(argv);

	XGCGI2 cgi2;
	cgi2.run();

	return 0;
}

