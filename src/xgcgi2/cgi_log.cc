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
 *  Module:           cgi_log.cc
 *
 *  Original Author:  DHAP Digital, Inc.  Michael Portuesi & others
 *  Date:             2006
 *  Description:      Logger utility for CGI
 *
 */


#include "cgi_log.hh"
#include "cgi/cgi_util.hh"

#include <fstream>
#include <iomanip>

#include <string.h>
#include <assert.h>
#include <stdlib.h>

// text labels describing each of the log severity states.
static const char* severityLabels[] =
{
	"emergency",
	"alert",
	"critical",
	"error",
	"warning",
	"notice",
	"info",
	"debug"
};

// disabling log access altogether is handled as a special case.
#define LOG_DISABLED_LABEL "disabled"
#define LOG_UNDEFINED_LABEL "undefined"

CGILog::CGILog()
{
	m_severity = LOG_WARNING;
}

CGILog::CGILog(int severity)
{
	setSeverity( severity );
}

CGILog::~CGILog()
{
}

void CGILog::log( int severity, const char* message )
{
	assert(!m_logFile.empty());
	if (m_severity >= severity)
	{
		std::string msg = message;
		format(severity, msg);
		output(msg);
	}
}

void CGILog::log( int severity, const char* file, int line, const char* message )
{
	assert(!m_logFile.empty());
	if (m_severity >= severity)
	{
		std::string msg = message;
		format(severity, file, line, msg);
		output(msg);
	}
}

void CGILog::log( int severity, const std::string& message )
{
	assert(!m_logFile.empty());
	if (m_severity >= severity)
	{
		std::string msg = message;
		format(severity, msg);
		output(msg);
	}
}
	
void CGILog::log( int severity, const char* file, int line, const std::string& message )
{
	assert(!m_logFile.empty());
	if (m_severity >= severity)
	{
		std::string msg = message;
		format(severity, file, line, msg);
		output(msg);
	}
}	

void CGILog::format( int severity, const char* file, int line, std::string& message )
{
	// line number
	std::string lineString = CGIUtil::convToString(line);
	message.insert(0, " ");
	message.insert(0, lineString);
    
	// file name
	message.insert(0, " ");
	message.insert(0, file);
	
	format( severity, message );
}

void CGILog::format( int severity, std::string& message )
{
	// severity label
	const char* sevString = getSeverityLabel(severity);
	message.insert(0, "] ");
	message.insert(0, sevString);
	message.insert(0, " [");
	
	// remote IP address of request
	std::string remoteAddrStr;
	CGIUtil::retrEnvVar("REMOTE_ADDR", remoteAddrStr);
	if (!remoteAddrStr.empty())
	{
		message.insert(0, remoteAddrStr);
		message.insert(0, " ");
	}
	
	// timestamp
	const char* timeFormat = "%F %T";
	char timeString[80];
	struct tm lTime;
	time_t now;
	time(&now);
	localtime_r(&now, &lTime);
	strftime( timeString, 80, timeFormat, &lTime );	
	message.insert(0, " ");
	message.insert(0, timeString);
}

void CGILog::output( std::string& message )
{
	std::ofstream outFile( m_logFile.c_str(), std::ios::app );
	outFile << message << std::endl;
	outFile.close();
}
	
void CGILog::setLogFile( const char* filename )
{
	m_logFile = filename;
}

void CGILog::setLogFile( const std::string& filename )
{
	m_logFile = filename;
}

void CGILog::setSeverity( int severity )
{
	m_severity = severity;
}

void CGILog::setSeverity( const char* severity )
{
	if (strcmp(severity, LOG_DISABLED_LABEL) == 0)
	{
		setSeverity(LOG_DISABLED);
	}
	else
	{
		int level_count = sizeof(severityLabels) / sizeof (const char*);
		
		for (int i = 0; i < level_count; i++)
		{
			if (strcmp(severity, severityLabels[i]) == 0)
			{
				setSeverity(i);
				break;
			}
		}
	}	
}

void CGILog::setSeverity( const std::string& severity )
{
	setSeverity( severity.c_str() );
}

int CGILog::getSeverity()
{
	return m_severity;
}


const char* CGILog::getSeverityLabel( int severity )
{
	if (severity < 0)
	{
		return LOG_DISABLED_LABEL;
	}
	int level_count = sizeof(severityLabels) / sizeof (const char*);
	assert(severity < level_count);
	if (severity >= level_count)
	{
		return LOG_UNDEFINED_LABEL;
	}
	return severityLabels[ severity ];
}
