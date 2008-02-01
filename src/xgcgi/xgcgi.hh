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
 *  Module:       xgcgi.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Original XORP GUI CGI used for testing and debugging
 *
 */


#ifndef __INCLUDE_XGCGI_HH__
#define __INCLUDE_XGCGI_HH__

#include "client_exec_status_info.hh"
#include "client_session_status_info.hh"
#include "xgdaemon_client.hh"

#include "cgi/cgi_util.hh"
#include "common/context_info.hh"
#include "common/session_id.hh"



#define	ACTION_INIT				"init"


#define	COOKIE_SESSION_ID			"session_id"

#define	HIDDEN_ARG_				"arg_"
#define	HIDDEN_COMMAND_ID			"command_id"
#define	HIDDEN_COMMANDS				"commands"
#define	HIDDEN_CONTEXT				"context"
#define	HIDDEN_EXEC_ID				"exec_id"
#define	HIDDEN_FILESPEC				"filespec"
#define	HIDDEN_NODES_EXISTANT			"nodes_existant"
#define	HIDDEN_NODES_NON_EXISTANT		"nodes_non_existant"
#define	HIDDEN_NODES_SEP			"nodes_sep"
				
#define	HIDDEN_PATH_				"path_"
#define HIDDEN_SCREEN				"screen"
#define HIDDEN_SCREEN_VALUE_PROMPT		"prompt"
#define	HIDDEN_TOTAL_ARGS			"total_args"

#define	LABEL_LOGIN_TITLE			"XORP Web GUI Login"
#define	LABEL_LOGIN_PASSWORD			"Password:"
#define	LABEL_LOGIN_USERNAME			"Username:"

#define PASSWORD_PWD				"pwd"

#define SELECT_CONTROL_OP_			"op_"

#define	SUBMIT_CONTROL_ABS_REMOVE_		"control_abs_remove_"
#define	SUBMIT_CONTROL_ADD_			"control_add_"
#define	SUBMIT_CONTROL_CANCEL			"control_cancel"
#define	SUBMIT_CONTROL_COMMIT			"control_commit"
#define	SUBMIT_CONTROL_EXEC_CMD			"control_exec_cmd"
#define	SUBMIT_CONTROL_EXEC_CMD_		"control_exec_cmd_"
#define	SUBMIT_CONTROL_EXEC_CMD_ARGS		"control_exec_cmd_args"
#define	SUBMIT_CONTROL_EXEC_CMD_QUERY_		"control_exec_cmd_query_"
#define	SUBMIT_CONTROL_EXEC_KILL		"control_exec_kill"
#define	SUBMIT_CONTROL_LOAD			"control_load"
#define	SUBMIT_CONTROL_LOGIN			"control_login"
#define	SUBMIT_CONTROL_LOGOUT			"control_logout"
#define	SUBMIT_CONTROL_SHOW_CONFIG		"control_show_config"
#define	SUBMIT_CONTROL_SHOW_EXECUTIONS		"control_show_executions"
#define	SUBMIT_CONTROL_SHOW_OPS			"control_show_ops"
#define	SUBMIT_CONTROL_REMOVE_			"control_remove_"
#define	SUBMIT_CONTROL_REVERT			"control_revert"
#define	SUBMIT_CONTROL_SAVE			"control_save"
#define	SUBMIT_CONTROL_SUBMIT			"control_submit"
#define	SUBMIT_CONTROL_UNDELETE_		"control_undelete_"

#define	TEXT_FILESPEC				"filespec"
#define	TEXT_USER				"user"


#define	TITLE_SUBMIT_CONTROL_ABS_REMOVE		"Remove"
#define	TITLE_SUBMIT_CONTROL_ADD		"Add"
#define	TITLE_SUBMIT_CONTROL_CANCEL		"Cancel"
#define	TITLE_SUBMIT_CONTROL_COMMIT		"Commit"
#define	TITLE_SUBMIT_CONTROL_EXEC_CMD_		"   Execute    "
#define	TITLE_SUBMIT_CONTROL_EXEC_CMD_ARGS	"   Execute    "
#define	TITLE_SUBMIT_CONTROL_EXEC_CMD_QUERY_	"   Execute... "
#define	TITLE_SUBMIT_CONTROL_EXEC_KILL		"   Kill Execution  "
#define	TITLE_SUBMIT_CONTROL_LOAD		"Load"
#define	TITLE_SUBMIT_CONTROL_LOGIN		"Login"
#define	TITLE_SUBMIT_CONTROL_LOGOUT		"Logout"
#define	TITLE_SUBMIT_CONTROL_SHOW_CONFIG	"Show Config"
#define	TITLE_SUBMIT_CONTROL_SHOW_EXECUTIONS	"Show Executions"
#define	TITLE_SUBMIT_CONTROL_SHOW_OPS		"Show Operations"
#define	TITLE_SUBMIT_CONTROL_REMOVE		"Remove"
#define	TITLE_SUBMIT_CONTROL_UNDELETE		"Undelete"


enum XGCGIErrorInfo {
	XGCGI_OK = 0,
	XGCGI_ERROR_COMMUNICATION,
	XGCGI_ERROR_SESSION_MISSMATCH,
	XGCGI_ERROR_COMMAND_ID_MISSMATCH,
	XGCGI_ERROR_EXEC_ID_MISSMATCH,
	XGCGI_ERROR_UNK_ACTION
};


class XGCGI : public BasicCGI, public XGDaemonClient {
public:
	XGCGI();

	void run();

	void doDisplayContextResponse(
		const SRExchangeInfo & srei,
		const ClientSessionInfo & siSession,
		const ContextLocation & clContext,
		const ErrorInfo & eiError);

	void doDisplayExecQuery(
		const ClientSessionInfo & siSession,
		const OpCmd & oc,
		const ErrorInfo & eiError);

	void doDisplayExecResponse(
		const ClientSessionInfo & siSession,
		const ClientBriefExecStatusInfo & cbesi,
		const DetailedExecStatusInfo & desi,
		const ErrorInfo & eiError);

	void doDisplayExecutionsStatus(
		const ClientSessionInfo & siSession,
		const ClientExecutionsStatusInfo & cesi,
		const ErrorInfo & eiError);

	void doDisplayOpCommands(
		const SessionId & siSession,
		const ClientOpCmds & oc,
		const ErrorInfo & eiError);


	void generateHtml_BasicScreen();
	void generateHtmlForButtonCancel(XmlNodeElement & xneContainer);
	void generateHtmlForButtonCommit(XmlNodeElement & xneContainer);
	void generateHtmlForButtonLoad(XmlNodeElement & xneContainer);
	void generateHtmlForButtonLogin(XmlNodeElement & xneContainer);
	void generateHtmlForButtonLogout(XmlNodeElement & xneContainer);
	void generateHtmlForButtonRevert(XmlNodeElement & xneContainer);
	void generateHtmlForButtonSave(XmlNodeElement & xneContainer);
	void generateHtmlForButtonShowConfig(XmlNodeElement & xneContainer);
	void generateHtmlForButtonShowExecuted(XmlNodeElement & xneContainer);
	void generateHtmlForButtonShowOperations(XmlNodeElement & xneContainer);
	void generateHtmlForButtonSubmit(XmlNodeElement & xneContainer);
	void generateHtmlForClientModsInfo(XmlNodeElement & xneContainer, const ClientModsInfo & cmi) const;
	void generateHtmlForClientModsInfo_MT(XmlNodeElement & xneContainer, ModType mt, const std::list<ClientModContextInfo> & listNodes) const;
	void generateHtmlForCommitting(const ParentContextInfo & pciContext, const ClientSessionStatusInfo & cssi);

	void generateHtmlForContext(const ParentContextInfo & pciContext, const ClientSessionInfo & siSession);
	void generateHtmlForContext_ChildContextInfo(XmlNodeElement & xneContainer, const std::list<ChildContextInfo*>  &listChildren, bool flagDisplayContextSwitch, unsigned int indentMargin);

	void generateHtmlForError(const ErrorInfo & eiError);
	void generateHtmlForError(const XGCGIErrorInfo xei, const std::string & strAction, const std::string & strContext);

	void generateHtmlForExecQuery(const SessionId & siSession, const OpCmd & oc);

	void generateHtmlForExecStatus(
		const ClientSessionInfo & csi,
		const ClientBriefExecStatusInfo & cbesi,
		const DetailedExecStatusInfo & desi);

	void generateHtmlForExecutionsStatus(
		const ClientSessionInfo & csi,
		const ClientExecutionsStatusInfo & cesi);

	void generateHtmlForGeneralContextInfoTable(XmlNodeElement & xneContainer, GeneralContextInfo gci, unsigned int indentMargin);

	void generateHtmlForHeaderButtons(XmlNodeElement & xneParent);
	void generateHtmlForHiddenField(XmlNodeElement & xneForm, const std::string & strName, const std::string & strValue);
	void generateHtmlForHiddenField_ExecID(XmlNodeElement & xneForm, const unsigned long idExec);
	void generateHtmlForHiddenField_SessionID(XmlNodeElement & xneForm, const SessionId & siSession);


	void generateHtmlForLoadOrSave(bool flagLoadOrSave, const SessionId & siSession, const std::string & strContext);
	void generateHtmlForLogin(const std::string & strContext);
	void generateHtmlForMetaRefresh(XmlNodeElement & xneHtmlHead, int totalSeconds, const std::string & strUrl);
	void generateHtmlForNodesInv(const SessionId & siSession, std::list<GeneralContextInfo> listNodes);
	void generateHtmlForOpCommands(const SessionId & siSession, const ClientOpCmds & oc);
	void generateHtmlForSessionStatus(const ParentContextInfo & pciContext, const ClientSessionInfo & csi);
	void generateHtmlForSymbolsFront(XmlNodeElement & xneParent, const ContextSegment & cs);
	void generateHtmlForSymbolsBack(XmlNodeElement & xneParent, const ContextSegment & cs);
	void generateHtmlForSymbol_Added(XmlNodeElement & xneParent);
	void generateHtmlForSymbol_Changed(XmlNodeElement & xneParent);
	void generateHtmlForSymbol_Deleted(XmlNodeElement & xneParent);
	void generateHtmlForSymbol_Invalid(XmlNodeElement & xneParent);
	void generateHtmlForSymbol_MissingRequired(XmlNodeElement & xneParent);

	void printOutput();

	void retrMapInputFieldsExistant(std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsExistant);
	void retrMapInputFieldsSep(std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep);


	std::string getLinkActionChContext(const ContextLocation & clContext);
	std::string getLinkActionChContext(const ContextLocation & clContext, int length);
	std::string getLinkActionExecStatus(const unsigned long exec_id) const;

	std::string getLinkActionInit(const std::string & strContextEscaped);
	std::string getLinkActionInit(const ContextLocation & clContext);
	std::string getLinkActionInit(const ContextLocation & clContext, int length);

	std::string getLinkActionOpCommands();
	std::string getLinkActionResetCommit(const ContextLocation & clContext);


	XGCGIErrorInfo doScreenActionAbsRemoveCommit(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::string & strPathEscaped);
		
	XGCGIErrorInfo doScreenActionAdd(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		unsigned long idTemplateFieldAdd,
		const std::string & strFieldValue,
		const std::string & strFieldOp);

	XGCGIErrorInfo doScreenActionChContext(
		const SessionId & siSessionRequest,
		const std::string & strContext);
		
	XGCGIErrorInfo doScreenActionCommit(
		const SessionId & siSessionRequest,
		const std::string & strContext);

	XGCGIErrorInfo doScreenActionExecCmd(
		const SessionId & siSessionRequest,
		unsigned long command_id);
		
	XGCGIErrorInfo doScreenActionExecCmdArgs(
		const SessionId & siSessionRequest,
		const unsigned long command_id,
		const std::map<unsigned int, std::string> & mapArgs);

	XGCGIErrorInfo doScreenActionExecKill(
		const SessionId & siSessionRequest,
		unsigned long idExec);

	XGCGIErrorInfo doScreenActionExecQuery(
		const SessionId & siSessionRequest,
		unsigned long command_id);

	XGCGIErrorInfo doScreenActionExecStatus(
		const SessionId & siSessionRequest,
		unsigned long command_id);

	XGCGIErrorInfo doScreenActionInit(const std::string & strContext);

	XGCGIErrorInfo doScreenActionLoadOrSave(
		bool flagLoadOrSave,
		const SessionId & siSessionRequest,
		const std::string & strContext);
		
	XGCGIErrorInfo doScreenActionLogin(const std::string & strContext);

	XGCGIErrorInfo doScreenActionLogout(const SessionId & siSessionRequest);

	XGCGIErrorInfo doScreenActionOpCommands(const SessionId & siSessionRequest);

	XGCGIErrorInfo doScreenActionRemove(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::string & strFieldNameRemove);

	XGCGIErrorInfo doScreenActionResetCommit(
		const SessionId & siSessionRequest,
		const std::string & strContext);

	XGCGIErrorInfo doScreenActionRevert(
		const SessionId & siSessionRequest,
		const std::string & strContext);

	XGCGIErrorInfo doScreenActionShowExecutions(const SessionId & siSessionRequest);

	XGCGIErrorInfo doScreenActionSubmit(
		const SessionId & siSessionRequest,
		const std::string & strContext);

	XGCGIErrorInfo doScreenActionUndelete(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		unsigned long idConfigFieldUndelete,
		const std::string & strFieldValue,
		const std::string & strFieldOp);
protected:
	XmlInfo m_xiOutput;
};

#endif

