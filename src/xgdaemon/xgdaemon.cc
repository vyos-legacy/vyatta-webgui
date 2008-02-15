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
 *  Module:       xgdaemon.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Main XORP GUI Daemon (xgdaemon) module
 *
 */


#include <iostream>
#include <exception>
#include <signal.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <stdio.h>
#include <sys/un.h>
#include <sys/ioctl.h>
#include <unistd.h>

#include "nyiexcept.hh"

#include "xgdaemon_module.hh"
#include "xgdaemon.hh"



#include "libxorp/xlog.h"

#include "basic/xgdaemon_socket.hh"
#include "basic/xgdaemon_util.hh"
#include "basic/xml_info.hh"

#include "rtrmgr/op_commands.hh"
#include "rtrmgr/slave_conf_tree.hh"
#include "rtrmgr/slave_conf_tree_node.hh"
#include "rtrmgr/util.hh"

#include "xgdaemon_xorp_util.hh"


#define MAXHOSTNAMELEN 256


const char * getSignalName(int signal) {
	static const char * strUnknown   = "unknown";
//	static const char * strSIGABORT  = "SIGABORT";
	static const char * strSIGALRM   = "SIGALRM";
	static const char * strSIGFPE    = "SIGFPE";
	static const char * strSIGHUP    = "SIGHUP";
	static const char * strSIGILL    = "SIGILL";
	static const char * strSIGINT    = "SIGINT";
	static const char * strSIGKILL   = "SIGKILL";
	static const char * strSIGPIPE   = "SIGPIPE";
	static const char * strSIGQUIT   = "SIGQUIT";
	static const char * strSIGSEGV   = "SIGSEGV";
	static const char * strSIGTERM   = "SIGTERM";
	static const char * strSIGUSR1   = "SIGUSR1";
	static const char * strSIGUSR2   = "SIGUSR2";
	static const char * strSIGCHLD   = "SIGCHLD";
	static const char * strSIGCONT   = "SIGCONT";
	static const char * strSIGSTOP   = "SIGSTOP";
	static const char * strSIGTSTP   = "SIGTSTP";
	static const char * strSIGTTIN   = "SIGTTIN";
	static const char * strSIGTTOU   = "SIGTTOU";

//	if (signal == SIGABORT)  return strSIGABORT;
	if (signal == SIGALRM)   return strSIGALRM;
	if (signal == SIGFPE)    return strSIGFPE;
	if (signal == SIGHUP)    return strSIGHUP;
	if (signal == SIGILL)    return strSIGILL;
	if (signal == SIGINT)    return strSIGINT;
	if (signal == SIGKILL)   return strSIGKILL;
	if (signal == SIGPIPE)   return strSIGPIPE;
	if (signal == SIGQUIT)   return strSIGQUIT;
	if (signal == SIGSEGV)   return strSIGSEGV;
	if (signal == SIGTERM)   return strSIGTERM;
	if (signal == SIGUSR1)   return strSIGUSR1;
	if (signal == SIGUSR2)   return strSIGUSR2;
	if (signal == SIGCHLD)   return strSIGCHLD;
	if (signal == SIGCONT)   return strSIGCONT;
	if (signal == SIGSTOP)   return strSIGSTOP;
	if (signal == SIGTSTP)   return strSIGTSTP;
	if (signal == SIGTTIN)   return strSIGTTIN;
	if (signal == SIGTTOU)   return strSIGTTOU;
	
	return strUnknown;
}


int main(int argc, char ** argv) {	argc=argc;argv=argv;

	std::cout << "xgdaemon" << std::endl;
	std::cout << "Starting under user id " << getuid() << std::endl;

	signal(SIGPIPE, signalHandler);
	
	int errcode = 0;

	//
	// Initialize and start xlog
	//
	setvbuf(stdin, NULL, _IONBF, 0);
	setvbuf(stdout, NULL, _IONBF, 0);


	xlog_init(argv[0], NULL);
	xlog_set_verbose(XLOG_VERBOSE_LOW);         // Least verbose messages
	// XXX: verbosity of the error messages temporary increased
	xlog_level_set_verbose(XLOG_LEVEL_ERROR, XLOG_VERBOSE_HIGH);
	xlog_add_default_output();
	xlog_start();


	//
	// Install the handler for unexpected exceptions
	//
	XorpUnexpectedHandler eh(xorp_unexpected_handler);


	//
	// Expand the default variables to include the XORP root path
	//
	string strXorpRootDir       = xorp_binary_root_dir();
	string strXorpTemplateDir   = xorp_template_dir();
	string strXorpTargetsDir    = xorp_xrl_targets_dir();

	char strHostname[MAXHOSTNAMELEN];
	if (gethostname(strHostname, sizeof(strHostname)) < 0) {
		XLOG_FATAL("gethostname() failed: %s", strerror(errno));
	}
	strHostname[sizeof(strHostname) - 1] = '\0';
	cout << "Hostname:      " << strHostname << endl;

	string strXname = "xgdaemon" + c_format("-%d-%s", getpid(), strHostname);
	cout << "X name:        " << strXname << endl;

	cout << "Binary dir:    " << strXorpRootDir << endl;
	cout << "Template dir:  " << strXorpTemplateDir << endl;
	cout << "Targets dir:   " << strXorpTargetsDir << endl;



	try {
		XorpDirInfo dir_info(strXname, strXorpRootDir, strXorpTemplateDir, strXorpTargetsDir);
		XGDaemon xgd(dir_info, false);
		if (xgd.start()) {
			std::cout << "Successfully started XGDaemon." << std::endl;
			xgd.run();
		} else {
			std::cout << "Encountered error starting XGDaemon." << std::endl;
		}
	} catch (const XorpReasonedException & e) {

NYIEXCEPT;
//		XLOG_ERROR("xgdaemon exiting due to an init error: %s", e.why().c_str());
//		errcode = 1;
//		goto cleanup;
	}


cleanup:

	//
	// Gracefully stop and exit xlog
	//
	xlog_stop();
	xlog_exit();


	exit(errcode);
}


// the following two functions are an ugly hack to cause the C code in
// the parser to call methods on the right version of the TemplateTree

void add_cmd_adaptor(char *cmd, TemplateTree* tt)
{
    tt->add_cmd(cmd);
}


void add_cmd_action_adaptor(const string& cmd,
                            const list<string>& action, TemplateTree* tt)
{
    tt->add_cmd_action(cmd, action);
}


void signalHandler(int signal) {
	std::cout << "Received signal: " << signal << " (" << getSignalName(signal) << ')' << std::endl;
}


XGDaemon::~XGDaemon() {

}
XGDaemon::XGDaemon(
	XorpDirInfo & dir_info,
	bool flagXorpVerbose) throw (XorpReasonedException)
	:
	m_flagRunning(false),
	m_isi(dir_info, flagXorpVerbose),
	m_gxl(m_isi.getEventLoop(), m_isi.getXorpDirInfo())
	{
	m_gxl.getXrlStdRouter().finalize();
}



bool XGDaemon::start() {
	if (m_xgds.listenInet() == false) {
		std::cout << "Encountered error initializing server socket." << std::endl;
		return false;
	} else {
		std::cout << "Successfully initialized server socket." << std::endl;
		
		/*
		if (XGDaemonXorpUtil::wait_for_xrlrouter_ready(m_eventloop, m_xrlrouter) == false) {
			// RtrMgr contains finder
			std::cout << "Failed to connect to xorp_rtrmgr." << std::endl;
			return false;
		} else {
			std::cout << "Successfully connected to xorp_rtrmgr." << std::endl;
			return true;
		}
		*/
		return true;
	}
}

void XGDaemon::run() {
	XorpTimer announcer = m_isi.getEventLoop().new_oneoff_after_ms(3 * 1000, callback(&XGDaemonXorpUtil::announce_waiting));

	unsigned long counter = 0;

	for (;;) {
		std::list<ServerSessionInfo*>::iterator i = m_sessions.begin();
		std::list<ServerSessionInfo*>::iterator iEnd = m_sessions.end();
		while (i != iEnd) {
			ServerSessionInfo * p_ssi = *i;
			if (p_ssi != NULL) {
				XGDaemonXorpLink & xlink = p_ssi->getXLink();

				if (!xlink.isXrlRouterReady()) {
					for (int i = 0; i < 10; i++) m_isi.runEventLoop();
				}

				xlink.run();

				m_isi.runEventLoop();
			}
			i++;
		}
	
		RemoteClientInfo * p_client = NULL;
		if (m_xgds.receiveRequest(p_client, true) == false) {
			std::cout << "Encountered error receiving request." << std::endl;
			return;
		}
		if (p_client != NULL) {
			m_xgds.doProcessClient(
				*p_client,
				m_sessions,
				m_isi);
		}

		m_isi.runEventLoop();

		counter++;
		if (counter % 10 == 0) m_sessions.killExecutionsOfExpired();
	}
}


