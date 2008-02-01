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
 *  Module:           cgi_log.hh
 *
 *  Original Author:  DHAP Digital, Inc.  Michael Portuesi & others
 *  Date:             2006
 *  Description:      Logger utility for CGI
 *
 */


#ifndef CGI_LOG_HH_
#define CGI_LOG_HH_

#include <string>

//
// Logging levels, chosen to match those used by syslog.
//
#define LOG_DISABLED		-1
#define LOG_EMERGENCY		0
#define LOG_ALERT		1
#define LOG_CRITICAL		2
#define LOG_ERROR		3
#define LOG_WARNING		4
#define LOG_NOTICE		5
#define LOG_INFO		6
#define LOG_DEBUG		7


//
// Very basic logging class.
//
class CGILog
{
public:
	CGILog();
	CGILog( int severity );
	virtual ~CGILog();
	
	void log( int severity, const char* message );	
	void log( int severity, const char* file, int line, const char* message );	
	void log( int severity, const std::string& message );	
	void log( int severity, const char* file, int line, const std::string& message );	

	// current implementation provides for only one log file destination.
	void setLogFile( const char* filename );
	void setLogFile( const std::string& filename );
	
	// only messages of specified severity or lower are written to logfile.
	void setSeverity( int severity );
	void setSeverity( const char* severity );
    void setSeverity( const std::string& severity );
	int getSeverity();
	
	const char* getSeverityLabel( int severity );

protected:
	std::string m_logFile;
	int	  		m_severity;
	
	void format( int severity, std::string& message );
	void format( int severity, const char* file, int line, std::string& message );
	void output( std::string& message );
	
};

#endif /*CGI_LOG_HH_*/
