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
 *  Module:       xgdaemon_xorp_link.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  One of the main linkage sections between xgdaemon and the rest of XORP. 
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

#include "xgdaemon_module.hh"

#include "libxorp/xlog.h"

#include "basic/xgdaemon_socket.hh"
#include "basic/xgdaemon_util.hh"
#include "basic/xml_info.hh"

#include "rtrmgr/op_commands.hh"
#include "rtrmgr/slave_conf_tree.hh"
#include "rtrmgr/slave_conf_tree_node.hh"
#include "rtrmgr/util.hh"

#include "xgdaemon_xorp_link.hh"
#include "xgdaemon_xorp_util.hh"

static const string default_config_boot = SYSCONFDIR "/config/config.boot";

XGDaemonXorpLink::~XGDaemonXorpLink() {
}

XGDaemonXorpLink::XGDaemonXorpLink(InterSessionInfo & isi, uid_t uid) throw (XorpReasonedException)
	:
	GenericXorpLink(isi.getEventLoop(), isi.getXorpDirInfo()),
	m_isi(isi),

	m_flag_01_Sent_send_register_client(false),
	m_flag_02_Here_Ready4FileAuth(false),
	m_flag_03_Here_ReadAuthFile(false),
	m_flag_04_Sent_send_authenticate_client(false),
	m_flag_05_Here_GenericDone(false),
	m_flag_06_Here_AuthSuccess(false),
	m_flag_07_Here_GotConfig(false),
	m_flag_11_Sent_commit_changes(false),

	m_flagError(false),

	m_ssi(XorpShellBase::MODE_INITIALIZING, this),

	m_xclient(m_eventloop, m_xrl_router),
	m_rtrmgr_client(&m_xrl_router),
	m_interface(&m_xrl_router, *this, isi.getFlagXorpVerbose()),

	m_ocl(isi.getXorpDirInfo().getXorpTemplateDir(), &isi.getTemplateTree(), m_smm),

	m_sctEdit("", &isi.getTemplateTree(), m_xclient, m_idClient, isi.getFlagXorpVerbose()),
	m_sctSync("", &isi.getTemplateTree(), m_xclient, m_idClient, isi.getFlagXorpVerbose()),

	m_uid(uid),
	m_pidRtrmgr(0),
	m_idClient(0),
	m_totalConfigChanges(0)
	{

}
bool XGDaemonXorpLink::commit_changes(const string& deltas, const string& deletions, GENERIC_CALLBACK cb, CallBack final_cb) {
	m_commit_callback = final_cb;
	return m_rtrmgr_client.send_apply_config_change("rtrmgr", m_strAuthToken, m_strIPCname, deltas, deletions, cb);
}
bool XGDaemonXorpLink::determineIfCanCommit() const {
	if (determineIfConfigInvalid()) return false;

	std::string strResult;
	return m_sctEdit.const_root_node().check_config_tree(strResult);
}
bool XGDaemonXorpLink::determineIfConfigChanged() const {
	return !XGDaemonXorpUtil::determineIfConfTreesEqual(m_sctSync, m_sctEdit); 
}
bool XGDaemonXorpLink::determineIfConfigInvalid() const {
	const ConfigTreeNode & ctnRoot = m_sctEdit.const_root_node();
	return XGDaemonXorpUtil::determineIfHasInvalidChildren(ctnRoot) || XGDaemonXorpUtil::determineIfHasMissingRequiredChildren(ctnRoot); 
}
bool XGDaemonXorpLink::doCommit() {
	if (m_ssi.getMode() != XorpShellBase::MODE_IDLE || !m_ssi.getCurrentTaskInfo().setTask(TASK_COMMIT)) return false;

	m_sctEdit.reset_commit_status();
	m_flag_11_Sent_commit_changes = false;
	m_ssi.setMode(XorpShellBase::MODE_COMMITTING);
	return true;
}
bool XGDaemonXorpLink::doLoad(const std::string & strFilename) {

	if (!m_ssi.getCurrentTaskInfo().setTask(TASK_LOAD)) return false;
	m_ssi.setMode(XorpShellBase::MODE_LOADING);

	if (load_from_file(
	    strFilename.length() == 0 ? default_config_boot : strFilename,
	    callback(this, &XGDaemonXorpLink::load_communicated),
	    callback(this, &XGDaemonXorpLink::load_done)) != true) {
	      load_done(false, "Cannot send file to rtrmgr. No Finder?\n");
	      return false;
	}

	return true;
}
bool XGDaemonXorpLink::doSave(const std::string & strFilename) {
	if (determineIfConfigChanged()) return false;

	if (!m_ssi.getCurrentTaskInfo().setTask(TASK_SAVE)) return false;
	m_ssi.setMode(XorpShellBase::MODE_SAVING);

	if (save_to_file(
	    strFilename.length() == 0 ? default_config_boot : strFilename,
	    callback(this, &XGDaemonXorpLink::save_communicated),
	    callback(this, &XGDaemonXorpLink::save_done)) != true) {
	      save_done(false, "Cannot send file to rtrmgr. No Finder?\n");
	      return false;
	}

	return true;
}
bool XGDaemonXorpLink::enter_config_mode(bool exclusive, GENERIC_CALLBACK cb) {
	return m_rtrmgr_client.send_enter_config_mode("rtrmgr", m_strAuthToken, exclusive, cb);
}
bool XGDaemonXorpLink::get_config_users(GET_USERS_CALLBACK cb) {
	return m_rtrmgr_client.send_get_config_users("rtrmgr", m_strAuthToken, cb);
}
bool XGDaemonXorpLink::get_rtrmgr_pid(PID_CALLBACK cb) {
	return m_rtrmgr_client.send_get_pid("rtrmgr", cb);
}
bool XGDaemonXorpLink::isError() const {
	return m_flagError;
}
bool XGDaemonXorpLink::isXrlRouterReady() {
	return m_xrl_router.ready();
}
bool XGDaemonXorpLink::leave_config_mode(GENERIC_CALLBACK cb) {
	return m_rtrmgr_client.send_leave_config_mode("rtrmgr", m_strAuthToken, cb);
}
bool XGDaemonXorpLink::load_from_file(const string& filename, GENERIC_CALLBACK cb, CallBack final_cb) {
	m_commit_callback = final_cb;
	LOCK_CALLBACK locked_cb = callback(this, &XGDaemonXorpLink::load_lock_achieved, filename, cb);
	return m_rtrmgr_client.send_lock_config("rtrmgr", m_strAuthToken, 60000, locked_cb);
}
bool XGDaemonXorpLink::lock_config(LOCK_CALLBACK cb) {
    // Lock for 60 seconds - this should be sufficient
    return m_rtrmgr_client.send_lock_config("rtrmgr", m_strAuthToken, 60000, cb);
}
bool XGDaemonXorpLink::revert(std::string & strResponse) {
	ConfigTreeNode & ctnRootNode = m_sctEdit.root_node();
	ctnRootNode.delete_subtree_silently();

	return ctnRootNode.merge_deltas(m_uid, m_sctSync.root_node(), false, true, strResponse);
}
bool XGDaemonXorpLink::run() {
	m_ssi.incrementTotalCycles();

	if (m_flagError == false) {
		if (m_xrl_router.failed() == true) {
			std::cout << "XRL Router failed." << std::endl;
			m_flagError = true;
		}
	}

	if (m_flagError == false) {
		if (m_xrl_router.ready() == false) {
			std::cout << "XRL Router not ready." << std::endl;
		} else {
			if (m_ssi.getMode() == XorpShellBase::MODE_INITIALIZING) {
				if (m_flag_01_Sent_send_register_client == false) {
					std::cout << "About to send registration request to xorp_rtrmgr..." << std::endl;
					bool flagR = m_rtrmgr_client.send_register_client("rtrmgr", m_uid, m_strIPCname, callback(this, &XGDaemonXorpLink::register_done));
					m_flag_01_Sent_send_register_client = true;
					if (flagR == false) {
						m_flagError = true;
						std::cout << "Encountered error sending registration request to xorp_rtrmgr." << std::endl;
					} else {
						std::cout << "Successfully sent registeration request to xorp_rtrmgr." << std::endl;
					}
				} else {
					if (m_flag_02_Here_Ready4FileAuth == true) {
						if (m_flag_03_Here_ReadAuthFile == false) {
							std::cout << "Registration authentication filename: " << m_strAuthFile << "  xorp_rtrmgr pid: " << m_pidRtrmgr << std::endl;
					
							bool flagContentsAcquired = XGDaemonUtil::retrFileContents(m_strAuthFile, m_strAuthToken);
							if (flagContentsAcquired == false) {
								m_flagError = true;
								std::cout << "Encountered error reading authentication file token." << std::endl;
							} else {
								std::cout << "Successfully read authentication file token: " << m_strAuthToken << endl;
							}
					
							if (unlink(m_strAuthFile.c_str()) == 0) {
								std::cout << "Successfully deleted authentication file." << std::endl;
							} else {
								std::cout << "Encountered error deleting authentication file." << std::endl;
							}
							m_flag_03_Here_ReadAuthFile = true;
						}
		
						if (m_flagError == false) {
							if (m_flag_04_Sent_send_authenticate_client == false) {
								m_flag_05_Here_GenericDone = false;
								m_rtrmgr_client.send_authenticate_client("rtrmgr", m_uid, m_strIPCname, m_strAuthToken, callback(this, &XGDaemonXorpLink::generic_done));
								m_flag_04_Sent_send_authenticate_client = true;
							} else {
								if (m_flag_05_Here_GenericDone) {
									if (m_flag_06_Here_AuthSuccess == false) {
										m_flag_06_Here_AuthSuccess = true;
										std::cout << "Successfully authenticated with xorp_rtrmgr." << std::endl;
									}
									//
									// We wait now to receive the configuration and list of running
									// modules from the rtrmgr.  We don't have to ask for these - we
									// just get them automatically as a result of authenticating.
									//
									if (m_flag_07_Here_GotConfig) {}
		
									//std::string str = m_p_ct->show_tree(true);
									//std::cout << "TREE:" << std::endl << str << std::endl;
		
									if (m_flag_06_Here_AuthSuccess && m_flag_07_Here_GotConfig) {
										m_ssi.setMode(XorpShellBase::MODE_IDLE);
									}
								}
							}
						}
					}
				}
			}

			if (m_ssi.getMode() == XorpShellBase::MODE_IDLE) {
			}

			if (m_ssi.getMode() == XorpShellBase::MODE_COMMITTING) {
				if (!m_flagError && !m_flag_11_Sent_commit_changes) {
					std::string strResult;
					bool flagR = m_sctEdit.commit_changes(strResult, *this, callback(this, &XGDaemonXorpLink::commit_done2));
					if (flagR) {
						m_flag_11_Sent_commit_changes = true;
						std::cout << "Successfully sent commit request to xorp_rtrmgr." << std::endl;
					} else {
						m_flagError = true;
						std::cout << "Encountered error sending commit request to xorp_rtrmgr." << std::endl;
						m_ssi.setMode(XorpShellBase::MODE_IDLE);
					}
				}
			}
		}
	}

	return !m_flagError;
}
bool XGDaemonXorpLink::save_to_file(const string& filename, GENERIC_CALLBACK cb, CallBack final_cb) {
	m_config_save_callback = final_cb;
	LOCK_CALLBACK locked_cb = callback(this, &XGDaemonXorpLink::save_lock_achieved, filename, cb);
	return m_rtrmgr_client.send_lock_config("rtrmgr", m_strAuthToken, 60000, locked_cb);
}
bool XGDaemonXorpLink::unlock_config(GENERIC_CALLBACK cb) {
	return m_rtrmgr_client.send_unlock_config("rtrmgr", m_strAuthToken, cb);
}

void XGDaemonXorpLink::commit_done(bool success, const string errmsg) {
//	m_sctEdit.commit_phase4(success, errmsg, callback(this, &XGDaemonXorpLink::commit_done2), this);
	m_sctEdit.commit_phase4(success, errmsg, m_commit_callback, this);
}
void XGDaemonXorpLink::commit_done2(bool success, const string errmsg) {
	if (success) {
		std::string strResponse;
		revert(strResponse);
		//XGDaemonXorpUtil::pruneEditTree(m_sctSync, m_sctEdit);
		
		std::cout << "Commit process has completed successfully." << std::endl;
	} else {
		std::cout << "Commit process has completed unsuccessfully with error: " << errmsg << std::endl;
	}

	m_ssi.setMode(XorpShellBase::MODE_IDLE);
	m_ssi.getCurrentTaskInfo().setDone(!success, errmsg);
	m_flag_11_Sent_commit_changes = false;
}
void XGDaemonXorpLink::config_changed(uid_t uid, const string& strDeltas, const string& strDeletions) {
	std::cout << "Received Configuration Changed event.  User id: " << uid << "  deltas=" << strDeltas << "  deletions=" << strDeletions << std::endl;

	if (uid == m_uid) {
		std::cout << "User IDs match." << std::endl;
	} else {
		std::cout << "Encontered error.  User ID missmatch.  Correct ID: " << m_uid << "  Received ID: " << uid << std::endl;
	}

	std::cout << "Applying deltas to sync tree..." << std::endl;
	std::string strDeltasResponse;
	bool flagAD = m_sctSync.apply_deltas(m_uid, strDeltas, false, true, strDeltasResponse);
	std::cout << "Deltas to sync response: " << std::endl << strDeltasResponse << std::endl;
	if (flagAD) {
		std::cout << "Successfully applied deltas to sync tree." << std::endl;
	} else {
		std::cout << "Encountered error.  Unable to apply deltas to sync tree." << std::endl;
		std::cout << "Exiting." << std::endl;
		exit(1);
	}

	std::cout << "Applying deletions to sync tree..." << std::endl;
	std::string strDeletionsResponse;
	flagAD = m_sctSync.apply_deletions(m_uid, strDeletions, false, strDeletionsResponse);
	std::cout << "Deletions to sync response: " << std::endl << strDeletionsResponse << std::endl;
	if (flagAD) {
		std::cout << "Successfully applied deletions to sync tree." << std::endl;
	} else {
		std::cout << "Encountered error.  Unable to apply deletions to sync tree." << std::endl;
		std::cout << "Exiting." << std::endl;
		exit(1);
	}

	if (m_flag_07_Here_GotConfig) {
		std::cout << "Initial configuration has been loaded previously." << std::endl;
	} else {
		std::cout << "Initial configuration has not yet been loaded." << std::endl;
		/*
		std::cout << "Applying deltas to edit tree..." << std::endl;
		flagAD = m_sctEdit.apply_deltas(m_uid, strDeltas, false, true, strDeltasResponse);
		std::cout << "Deltas to edit response: " << std::endl << strDeltasResponse << std::endl;
		if (flagAD) {
			std::cout << "Successfully applied deltas to edit tree." << std::endl;
		} else {
			std::cout << "Encountered error.  Unable to apply deltas to edit tree." << std::endl;
			std::cout << "Exiting." << std::endl;
			exit(1);
		}
		std::cout << "Applying deletions to edit tree..." << std::endl;
		flagAD = m_sctEdit.apply_deletions(m_uid, strDeletions, false, strDeletionsResponse);
		if (flagAD) {
			std::cout << "Successfully applied deletions to edit tree." << std::endl;
		} else {
			std::cout << "Encountered error.  Unable to apply deletions to edit tree." << std::endl;
			std::cout << "Exiting." << std::endl;
			exit(1);
		}
		*/
		std::string strResponse;
		if (revert(strResponse)) {
//			m_sctEdit.root_node().mark_subtree_as_committed();
		} else {
			std::cout << "Encountered error synching initial configuration:  " << strResponse << std::endl;
		}

		m_flag_07_Here_GotConfig = true;
	}

	m_xoc.processLists(m_ocl, m_sctSync);
	m_totalConfigChanges++;
}
void XGDaemonXorpLink::config_saved_done(bool success, const string& errmsg) {
	// Call unlock_config. The callback from unlock will finally clear
	// things up.
	m_sctEdit.save_phase4(success, errmsg, m_config_save_callback, this);
}
void XGDaemonXorpLink::generic_done(const XrlError& e) {
	if (e == XrlError::OKAY()) {
		m_flag_05_Here_GenericDone = true;
	} else {
		if ((e == XrlError::COMMAND_FAILED()) && (e.note() == "AUTH_FAIL")) {
			fprintf(stderr, "Authentication Failure\n");
		} else {
			fprintf(stderr, "XRL failed\n");
			fprintf(stderr, "%s\n", e.str().c_str());
		}
		exit(1);
	}
}
void XGDaemonXorpLink::load_communicated(const XrlError& e) {
	if (e != XrlError::OKAY()) {
		m_ssi.setMode(XorpShellBase::MODE_IDLE);
		m_ssi.getCurrentTaskInfo().setDone(true, e.str());
	}
}
void XGDaemonXorpLink::load_done(bool flagSuccess, std::string strError) {
	std::string strResponse;
	revert(strResponse);

	m_ssi.setMode(XorpShellBase::MODE_IDLE);
	m_ssi.getCurrentTaskInfo().setDone(!flagSuccess, strError);
}
void XGDaemonXorpLink::load_lock_achieved(const XrlError& e, const bool* locked, const uint32_t* /* lock_holder */, const string filename, GENERIC_CALLBACK cb) {
	if (!locked || (e != XrlError::OKAY())) {
		m_commit_callback->dispatch(false, "Failed to get configuration lock");
		return;
	}

	if (m_rtrmgr_client.send_load_config("rtrmgr", m_strAuthToken, m_strIPCname, filename, cb) != true) {
		m_commit_callback->dispatch(false, "Failed to load the configuration. No Finder?");
		return;
	}
}
void XGDaemonXorpLink::register_done(const XrlError& e, const string* file, const uint32_t* pid, const uint32_t* clientid) {
	if (e == XrlError::OKAY()) {
		if (file == NULL || pid == NULL) throw std::bad_exception();
		m_strAuthFile = *file;
		if (pid != NULL) m_pidRtrmgr = *pid;
		if (clientid != NULL) m_idClient = *clientid;
		m_flag_02_Here_Ready4FileAuth = true;
		XLOG_TRACE(m_isi.getFlagXorpVerbose(), "rtrmgr PID=%u\n", XORP_UINT_CAST(m_pidRtrmgr));
		return;
	} else {
		fprintf(stderr, "Failed to register with router manager process\n");
		fprintf(stderr, "%s\n", e.str().c_str());
		exit(1);
	}
}
void XGDaemonXorpLink::resetCommitStatus() {
	m_sctEdit.reset_commit_status();
}
void XGDaemonXorpLink::save_communicated(const XrlError& e) {
	if (e != XrlError::OKAY()) {
		m_ssi.setMode(XorpShellBase::MODE_IDLE);
		m_ssi.getCurrentTaskInfo().setDone(true, e.str());
	}
}
void XGDaemonXorpLink::save_done(bool flagSuccess, std::string strError) {
	m_ssi.setMode(XorpShellBase::MODE_IDLE);
	m_ssi.getCurrentTaskInfo().setDone(!flagSuccess, strError);
}
void XGDaemonXorpLink::save_lock_achieved(const XrlError& e, const bool* locked, const uint32_t* /* lock_holder */, const string filename, GENERIC_CALLBACK cb) {
	if (!locked || (e != XrlError::OKAY())) {
		m_config_save_callback->dispatch(false, "Failed to get configuration lock");
		return;
	}

	if (m_rtrmgr_client.send_save_config("rtrmgr", m_strAuthToken, m_strIPCname, filename, cb) != true) {
		m_config_save_callback->dispatch(false, "Failed to send configuration. No Finder?");
		return;
	}
}
void XGDaemonXorpLink::set_mode(XorpShellBase::Mode mode) {
	m_ssi.setMode(mode);
}

const CommitStatus & XGDaemonXorpLink::getConstCommitStatus() const {
	return m_sctEdit.commit_status();
}
const ServerSessionStatusInfo & XGDaemonXorpLink::getConstSessionStatusInfo() const {
	return m_ssi;
}
const SlaveConfigTree & XGDaemonXorpLink::getConstSlaveConfigTreeEdit() const {
	return m_sctEdit;
}
const SlaveConfigTree & XGDaemonXorpLink::getConstSlaveConfigTreeSync() const {
	return m_sctSync;
}
const TemplateTree & XGDaemonXorpLink::getConstTemplateTree() const {
	return m_isi.getConstTemplateTree();
}
const XorpOpCmds & XGDaemonXorpLink::getConstXorpOpCmds() const {
	return m_xoc;
}
uid_t XGDaemonXorpLink::getUid() const {
	return m_uid;
}
uint32_t XGDaemonXorpLink::getIdClient() const {
	return m_idClient;
}
unsigned long XGDaemonXorpLink::getTotalConfigChanges() const {
	return m_totalConfigChanges;
}
EventLoop& XGDaemonXorpLink::eventloop() {
	return m_isi.getEventLoop();
}
OpCommandList * XGDaemonXorpLink::op_cmd_list() {
	return &m_ocl;
}
/*
OpCommandList & XGDaemonXorpLink::getOpCommandList() {
	return m_ocl;
}
*/
ServerSessionStatusInfo & XGDaemonXorpLink::getSessionStatusInfo() {
	return m_ssi;
}
SlaveConfigTree * XGDaemonXorpLink::config_tree() {
	return &m_sctEdit;
}
SlaveConfigTree & XGDaemonXorpLink::getSlaveConfigTreeEdit() {
	return m_sctEdit;
}
SlaveConfigTree & XGDaemonXorpLink::getSlaveConfigTreeSync() {
	return m_sctSync;
}
TemplateTree * XGDaemonXorpLink::template_tree() {
	return &m_isi.getTemplateTree();
}
TemplateTree & XGDaemonXorpLink::getTemplateTree() {
	return m_isi.getTemplateTree();
}
XorpOpCmds & XGDaemonXorpLink::getXorpOpCmds() {
	return m_xoc;
}

