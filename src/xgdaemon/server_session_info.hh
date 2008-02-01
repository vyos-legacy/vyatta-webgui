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
 *  Module:       server_session_info.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Code for server-side encapsulation of user sessions.
 *
 */


#ifndef __INCLUDE_XORP_SESSION_INFO__
#define	__INCLUDE_XORP_SESSION_INFO__

#include <list>

#include "rtrmgr/cli.hh"
#include "rtrmgr/slave_conf_tree.hh"
#include "rtrmgr/op_commands.hh"
#include "rtrmgr/template_tree.hh"
#include "rtrmgr/xorp_client.hh"
#include "rtrmgr/xorpsh_base.hh"

#include "common/exec_status_info.hh"
#include "common/executions_status_info.hh"
#include "common/session_id.hh"

#include "server_time_info.hh"
#include "xgdaemon_xorp_link.hh"
#include "xorp_dir_info.hh"
#include "xorp_opcmd_info.hh"


class XorpExecStatusInfo : public BriefExecStatusInfo, public DetailedExecStatusInfo {
public:
	~XorpExecStatusInfo();
	XorpExecStatusInfo(unsigned long id, ExecutableXorpOpCmd * p_exoc);

	const unsigned long getTotalLines() const;

	const TimeInfo & getConstTimeStart() const;
	const TimeInfo & getConstTimeEnd() const;

	const ExecutableXorpOpCmd & getConstXorpOpCmd() const;
	const std::string & getCachedCommandLine() const;

	const std::string & getOutputPre() const;

	bool killExecution();

	void callbackDone(bool flagSuccess, const std::string & strMsg);
	void callbackPrint(const std::string & strMsg);

	OpInstance * execute(EventLoop& eventloop);

private:
	ExecutableXorpOpCmd *  m_p_exoc;
	OpInstance *           m_p_oi;

	ServerTimeInfo         m_stiStart;
	ServerTimeInfo         m_stiEnd;

	std::string            m_strOutputPre;
};


class ServerSessionInfo : public ExecutionsStatusInfo {
public:
	~ServerSessionInfo();
	ServerSessionInfo(InterSessionInfo & isi, uid_t uid, const std::string & strUsername);

	bool isActive() const;
	bool isClosed() const;
	bool isExpired() const;

	int getTotalExecutions() const;
	unsigned long getExecId(int index) const;

	void killExecutions();
	void killExecutionsIfExpired();
	void setClosed(bool flagClosed);

	const BriefExecStatusInfo & getBrief(int index) const;
	const SessionId & getConstSessionId() const;
	const XGDaemonXorpLink & getConstXLink() const;
	const XorpExecStatusInfo * getConstCommandProcessing(unsigned long idExec) const;
	const XorpShellBase::Mode & getSessionMode() const;
	const std::string & getUsername() const;

	SessionId & getSessionId();
	XGDaemonXorpLink & getXLink();
	XorpExecStatusInfo * execute(ExecutableXorpOpCmd * p_exoc, EventLoop& eventloop);
	XorpExecStatusInfo * getCommandProcessing(unsigned long idExec);


private:
	bool                              m_flagClosed;                
	unsigned long                     m_totalCommands;
	std::vector<XorpExecStatusInfo*>  m_vectorCommands;
	std::string                       m_strUsername;
	SessionId                         m_id;
	XGDaemonXorpLink                  m_xlink;
};

class ServerSessions {
public:
	~ServerSessions();
	ServerSessions();

	bool revert(ServerSessionInfo & ssi, std::string & strResponse);
	int getTotal();
	void killExecutionsOfExpired();

	ServerSessionInfo * createNew(InterSessionInfo & isi, uid_t uid, const std::string & strUsername);
	ServerSessionInfo * findSession(const std::string & strSessionID) const;
	ServerSessionInfo * findSession(const uid_t uid) const;

	std::list<ServerSessionInfo*>::iterator begin();
	std::list<ServerSessionInfo*>::iterator end();

private:
	std::list<ServerSessionInfo*>  m_listSessions;
};

#endif


