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
 *  Module:       xgdaemon.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Main XORP GUI Daemon (xgdaemon) module
 *
 */

#ifndef INCLUDE_XGDAEMON_HH
#define INCLUDE_XGDAEMON_HH

#include <string>

#include "xgdaemon_server.hh"
#include "xgdaemon_xorp_link.hh"
#include "xorp_dir_info.hh"

class ConfigTreeNode;
class OpCommandList;
class SlaveConfigTree;


class XGDaemon  {
public:

	~XGDaemon();
	XGDaemon(
		XorpDirInfo & dir_info,
		bool flagXorpVerbose) throw (XorpReasonedException);
		
		
	bool start();
	void run();


private:

	bool                    m_flagRunning;

	InterSessionInfo        m_isi;
	GenericXorpLink         m_gxl;
	ServerSessions		m_sessions;
	XGDaemonServer          m_xgds;
};

const char * getSignalName(int signal);
int main(int argc, char ** argv);
void add_cmd_adaptor(char *cmd, TemplateTree* tt);
void add_cmd_action_adaptor(const string& cmd, const list<string>& action, TemplateTree* tt);
void signalHandler(int signal);

#endif

