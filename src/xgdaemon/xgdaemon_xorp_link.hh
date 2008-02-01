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
 *  Module:       xgdaemon_xorp_link.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  One of the main linkage sections between xgdaemon and the rest of XORP. 
 *
 */


#ifndef __INCLUDE_XGDAEMON_XORP_LINK_HH__
#define	__INCLUDE_XGDAEMON_XORP_LINK_HH__


#include <sstream>
#include <string>


#include "xgdaemon_error.hh"

#include "libxorp/eventloop.hh"
#include "libxipc/xrl_std_router.hh"
#include "xrl/interfaces/rtrmgr_xif.hh"


#include "rtrmgr/conf_tree.hh"
#include "rtrmgr/generic_module_manager.hh"
#include "rtrmgr/slave_conf_tree.hh"
#include "rtrmgr/template_tree.hh"
#include "rtrmgr/template_tree_node.hh"
#include "rtrmgr/xorpsh_base.hh"


#include "common/context_info.hh"
#include "common/session_id.hh"
#include "common/xgdaemon_common_xml.hh"

#include "generic_xorp_link.hh"
#include "inter_session_info.hh"
#include "server_session_status_info.hh"
#include "xorp_dir_info.hh"
#include "xorp_opcmd_info.hh"
#include "xrl_xgdaemon_interface.hh"


class XGDaemon;
class XmlInfo;
class XmlNodeElement;

class XGDaemonXorpLink : public GenericXorpLink, public XorpShellBase {
public:
	~XGDaemonXorpLink();
	XGDaemonXorpLink(InterSessionInfo & isi, uid_t uid) throw (XorpReasonedException);

	bool commit_changes(const string& deltas, const string& deletions, GENERIC_CALLBACK cb, CallBack final_cb);
	bool determineIfCanCommit() const;
	bool determineIfConfigChanged() const;
	bool determineIfConfigInvalid() const;
	bool doCommit();
	bool doLoad(const std::string & strFilename);
	bool doSave(const std::string & strFilename);
	bool enter_config_mode(bool exclusive, GENERIC_CALLBACK cb);
	bool get_config_users(GET_USERS_CALLBACK cb);
	bool get_rtrmgr_pid(PID_CALLBACK cb);
	bool isError() const;
	bool isXrlRouterReady();
	bool leave_config_mode(GENERIC_CALLBACK cb);
	bool load_from_file(const string& filename, GENERIC_CALLBACK cb, CallBack final_cb);
	bool lock_config(LOCK_CALLBACK cb);
	bool revert(std::string & strResponse);
	bool run();
	bool save_to_file(const string& filename, GENERIC_CALLBACK cb, CallBack final_cb);
	bool unlock_config(GENERIC_CALLBACK cb);

	void commit_done(bool success, const string errmsg);
	void commit_done2(bool success, const string errmsg);
	void config_changed(uid_t idUnixUser, const string& strDeltas, const string& strDeletions);
	void config_saved_done(bool success, const string& errmsg);
	void generic_done(const XrlError& e);
	void load_communicated(const XrlError& e);
	void load_done(bool flagSuccess, std::string strError);
	void load_lock_achieved(const XrlError& e, const bool* locked, const uint32_t* /* lock_holder */, const string filename, GENERIC_CALLBACK cb);
	void module_status_change(const string& modname, GenericModule::ModuleStatus status) {
		UNUSED(modname);
		UNUSED(status);
	}
	void new_config_user(uid_t user_id) {
		UNUSED(user_id);
	}
	void register_done(const XrlError& e, const string* file, const uint32_t* pid, const uint32_t* clientid);
	void resetCommitStatus();
	void save_communicated(const XrlError& e);
	void save_done(bool flagSuccess, std::string strError);
	void save_lock_achieved(const XrlError& e, const bool* locked, const uint32_t* /* lock_holder */, const string filename, GENERIC_CALLBACK cb);
	void set_mode(XorpShellBase::Mode mode);

	uid_t getUid() const;

	uint32_t clientid() const {
		return m_idClient;
	}

	uint32_t rtrmgr_pid() const {
		return m_pidRtrmgr;
	}

	uint32_t getIdClient() const;

	unsigned long getTotalConfigChanges() const;

	const CommitStatus & getConstCommitStatus() const;
	const ServerSessionStatusInfo & getConstSessionStatusInfo() const;
	const SlaveConfigTree & getConstSlaveConfigTreeEdit() const;
	const SlaveConfigTree & getConstSlaveConfigTreeSync() const;
	const TemplateTree & getConstTemplateTree() const;
	const XorpOpCmds & getConstXorpOpCmds() const;

	EventLoop& eventloop();
	OpCommandList * op_cmd_list();
//	OpCommandList & getOpCommandList();
	ServerSessionStatusInfo & getSessionStatusInfo();
	SlaveConfigTree * config_tree();
	SlaveConfigTree & getSlaveConfigTreeEdit();
	SlaveConfigTree & getSlaveConfigTreeSync();
	TemplateTree * template_tree();
	TemplateTree & getTemplateTree();
	XorpOpCmds & getXorpOpCmds();

private:

	InterSessionInfo &		m_isi;

	std::string             	m_strAuthFile;
	std::string             	m_strAuthToken;

	bool                    	m_flag_01_Sent_send_register_client;
	bool            	        m_flag_02_Here_Ready4FileAuth;
	bool				m_flag_03_Here_ReadAuthFile;
	bool				m_flag_04_Sent_send_authenticate_client;
	bool            	        m_flag_05_Here_GenericDone;
	bool				m_flag_06_Here_AuthSuccess;
	bool            	        m_flag_07_Here_GotConfig;

	bool                            m_flag_11_Sent_commit_changes;

	bool				m_flagError;

	ServerSessionStatusInfo 	m_ssi;

	// Used to store the callback during a commit until we get called
	// with the response
	CallBack			m_commit_callback;

	// Used to store the callback during saving a file until we get called
	// with the response
	CallBack			m_config_save_callback;

	XorpClient			m_xclient;
	XrlRtrmgrV0p1Client		m_rtrmgr_client;
	XrlXGDaemonInterface		m_interface;

	OpCommandList			m_ocl;

	SlaveConfigTree			m_sctEdit;
	SlaveConfigTree			m_sctSync;

	XorpOpCmds			m_xoc;

	uid_t				m_uid;
	uint32_t			m_pidRtrmgr;
	uint32_t			m_idClient;

	unsigned long                   m_totalConfigChanges;
};

#endif

