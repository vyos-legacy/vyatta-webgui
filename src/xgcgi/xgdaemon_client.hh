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
 *  Module:       xgdaemon_client.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class encapsulating communication with the xgdaemon.
 *
 */


#ifndef __INCLUDE_XGDAEMON_CLIENT_HH__
#define __INCLUDE_XGDAEMON_CLIENT_HH__

#include "client_exec_status_info.hh"
#include "client_executions_status_info.hh"
#include "client_mod_info.hh"
#include "client_opcmd_info.hh"
#include "client_time_info.hh"
#include "client_session_info.hh"

#include "basic_client/basic_xgdaemon_client.hh"
#include "common/common_session_status_info.hh"
#include "common/context_info.hh"
#include "common/error_info.hh"
#include "common/session_id.hh"
#include "common/xgdaemon_common_xml.hh"


class SRExchangeInfo {
public:
	XmlInfo m_xiSend;
	XmlInfo m_xiReceive;
	XmlParseStatus m_xstatus;
	void trimText();
};

class XGDaemonClient : public BasicXGDaemonClient {
public:
	XGDaemonClient();


	bool checkForSessionMissmatch(const XmlInfo & xiInput, const SessionId & siSessionRequest, ClientSessionInfo & siSession) const;

	bool doActionAbsRemoveCommit(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::string & strPathEscaped,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionAdd(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const unsigned long idTemplateFieldAdd,
		const std::string & strFieldValue,
		const std::string & strFieldOp,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionChContext(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionCommit(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsExistant,
		const std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep,		
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionCycleToDone(const SessionId & siSessionRequest, unsigned long exec_id, const int sleepsecs);
	bool doActionCycleToIdle(const SessionId & siSessionRequest, const int sleepsecs);

	bool doActionCycleToIdle(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ErrorInfo & eiError,
		const int sleepsecs);

	bool doActionExecCmd(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		unsigned long command_id,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError);

	bool doActionExecCmd_s_static_routes_ipv4(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError);

	bool doActionExecCmdArgs(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long command_id,
		const std::map<unsigned int, std::string> & mapArgs,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError);

	bool doActionExecKill(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long idExec,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError);

	bool doActionExecQuery(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long idOpCmd,
		ClientSessionInfo & siSession,
		ClientOpCmd & oc,
		ErrorInfo & eiError);

	bool doActionExecStatus(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long idExec,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError);

	bool doActionExecutionsStatus(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ClientExecutionsStatusInfo & cesi,
		ErrorInfo & eiError);

	bool doActionExecStatus_CycleToDone(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long idExec,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError,
		const int sleepsecs);

	bool doActionGetSession(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ErrorInfo & eiError);

	bool doActionGetSystem(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ErrorInfo & eiError);
		
	bool doActionLoadOrSave(
		SRExchangeInfo & srei,
		bool flagLoadOrSave,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::string & strFilespec,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionLogin(
		SRExchangeInfo & srei,
		const std::string & strUser,
		const std::string & strPwd,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);
		
	bool doActionLoginCycle(
		SRExchangeInfo & srei,
		const std::string & strUser,
		const std::string & strPwd,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError,
		const int sleepsecs);
		
	bool doActionLogout(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ErrorInfo & eiError);

	bool doActionOpCommands(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ClientOpCmds & oc,
		ErrorInfo & eiError);

	bool doActionRemove(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::string & strFieldNameRemove,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionResetCommit(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionRevert(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionSet(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsTemplate,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionSubmit(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsConfig,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool doActionSysAddUser(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strUser,
		const std::string & strPwd,
		ClientSessionInfo & siSession,
		ErrorInfo & eiError);

	bool doActionTest(
		const std::string & strTest,
		std::string & strTestResponse,
		XmlParseStatus & status);

	bool doActionUndelete(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const unsigned long idConfigFieldUndelete,
		const std::string & strFieldValue,
		const std::string & strFieldOp,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError);

	bool sendRequestActionAbsRemoveCommit(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::string & strPathEscaped);

	bool sendRequestActionAdd(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		unsigned long idTemplateFieldAdd,
		const std::string & strFieldValue,
		const std::string & strFieldOp);

	bool sendRequestActionChContext(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext);

	bool sendRequestActionCommit(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsExistant,
		const std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep);

	bool sendRequestActionExecCmd(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		unsigned long command_id);

	bool sendRequestActionExecCmd_s_static_routes_ipv4(
		XmlInfo & xiRequest,
		const SessionId & siSession);

	bool sendRequestActionExecCmdArgs(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		unsigned long command_id,
		const std::map<unsigned int, std::string> & mapArgs);

	bool sendRequestActionExecKill(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const unsigned long idExec);

	bool sendRequestActionExecQuery(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		unsigned long command_id);

	bool sendRequestActionExecStatus(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		unsigned long idExec);

	bool sendRequestActionExecutionsStatus(
		XmlInfo & xiRequest,
		const SessionId & siSession);

	bool sendRequestActionGetSession(XmlInfo & xiRequest, const SessionId & siSessionRequest);
	bool sendRequestActionGetSystem(XmlInfo & xiRequest, const SessionId & siSessionRequest);

	bool sendRequestActionLoadOrSave(
		XmlInfo & xiRequest,
		bool flagLoadOrSave,
		const SessionId & siSession,
		const std::string & strContext,
		const std::string & strFilespec);

	bool sendRequestActionLogin(
		XmlInfo & xiRequest,
		const std::string & strUser,
		const std::string & strPwd,
		const std::string & strContext);

	bool sendRequestActionLogout(
		XmlInfo & xiRequest,
		const SessionId & siSession);

	bool sendRequestActionOpCommands(
		XmlInfo & xiRequest,
		const SessionId & siSession);

	bool sendRequestActionRemove(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::string & strFieldNameRemove);

	bool sendRequestActionResetCommit(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext);

	bool sendRequestActionRevert(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext);

	bool sendRequestActionSet(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsTemplate);

	bool sendRequestActionSubmit(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsConfig);

	bool sendRequestActionSysAddUser(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strUser,
		const std::string & strPwd);

	bool sendRequestActionTest(XmlInfo & xiRequest, const std::string & strTest);

	bool sendRequestActionUndelete(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		unsigned long idConfigFieldUndelete,
		const std::string & strFieldValue,
		const std::string & strFieldOp);

	void analyzeClientBriefExecStatusInfo(
		const XmlNodeElement & xne_RL_ZZ_BRIEF,
		ClientBriefExecStatusInfo & cbesi) const;
	void analyzeClientCurrentTaskInfo(
		const XmlNodeElement & xne_ZZ_TASK,
		ClientCurrentTaskInfo & ccti) const;
	void analyzeClientExecStatusInfo(
		const XmlInfo & xiInput,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi) const;
	void analyzeClientExecutionsInfo(const XmlInfo & xiInput, ClientExecutionsStatusInfo & cesi) const;
	void analyzeClientSessionInfo(const XmlInfo & xiInput, ClientSessionInfo & siSession) const;
	void analyzeClientTimeInfo(const XmlNodeElement & xneRL_ZZ_TIME, ClientTimeInfo & cli) const;	
	void analyzeContextLocation(const XmlInfo& xiInput, ContextLocation & clContext) const;
	void analyzeContextLocation_Path(const XmlNodeElement & xne_RL_SESSION_CONTEXT_ZZ_PATH, std::vector<ContextSegment> & vectorContextSegments) const;
	void analyzeContextValueInfo(const XmlNodeElement & xneRL_ZZ_NODES_NODE_VALUE, ContextValueInfo & cvi) const;
	void analyzeErrorInfo(const XmlInfo & xiInput, ErrorInfo & eiError) const;
	void analyzeInnerContextInfo(const XmlNodeElement & xneRL_ZZ_NODES_NODE, InnerContextInfo & ici) const;
	void analyzeListGeneralNodes(const XmlInfo& xiInput, std::list<GeneralContextInfo> & listNodes) const;
	void analyzeMods(const XmlInfo & xiInput, ClientModsInfo & cmi) const;
	void analyzeMods(const XmlNodeElement & xne_s_RL_SESSION_MODS, ClientModsInfo & cmi) const;
	void analyzeMods_Nodes(const XmlNodeElement & xne_s_RL_SESSION_MODS_NODES, const ModType mt, std::list<ClientModContextInfo> & listNodes) const;
	void analyzeNStatInfo(const XmlNodeElement & xneRL_ZZ_NSTAT, NStatInfo & nsi) const;
	void analyzeOpCmdFromExecQuery(const XmlInfo& xiInput, ClientOpCmd & oc) const;
	void analyzeOpCmds(const XmlInfo& xiInput, ClientOpCmds & oc) const;
	void analyzeParentContextInfo(const XmlInfo& xiInput, ParentContextInfo & pciContext) const;
	void analyzeSubInfo(const XmlNodeElement & xneRL_ZZ_SUB, SubInfo & si) const;

	void generateXMLForAction(XmlNodeElement & xneRL, const std::string & strAction) const;

	void generateXMLForContext(
		XmlNodeElement & xneRL,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsConfig,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsTemplate) const;

	void generateXMLForContextFields(
		XmlNodeElement & xneRL_CONTEXT,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsConfig,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsTemplate) const;

	void generateXMLForSepFields(XmlNodeElement & xneRL, const std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep) const;
	void generateXMLForSession(XmlNodeElement & xneRL, const SessionId & siSession) const;

	void prepareRequestActionAbsRemoveCommit(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::string & strPathEscaped);

	void prepareRequestActionAdd(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, unsigned long idTemplateAdd, const std::string & strFieldValue, const std::string & strFieldOp) const;
	void prepareRequestActionChContext(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext) const;

	void prepareRequestActionCommit(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsExistant,
		const std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep) const;

	void prepareRequestActionExecCmd(XmlInfo & xiRequest, const SessionId & siSession, unsigned long command_id);	
	void prepareRequestActionExecCmd_s_static_routes_ipv4(XmlInfo & xiRequest, const SessionId & siSession);
	void prepareRequestActionExecCmdArgs(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const unsigned long command_id,
		const std::map<unsigned int, std::string> & mapArgs);
	void prepareRequestActionExecKill(XmlInfo & xiRequest, const SessionId & siSession, const unsigned long idExec);
	void prepareRequestActionExecQuery(XmlInfo & xiRequest, const SessionId & siSession, unsigned long command_id);
	void prepareRequestActionExecStatus(XmlInfo & xiRequest, const SessionId & siSession, unsigned long idExec);
	void prepareRequestActionExecutionsStatus(XmlInfo & xiRequest, const SessionId & siSession);	
	void prepareRequestActionGetSession(XmlInfo & xiRequest, const SessionId & siSessionRequest) const;
	void prepareRequestActionGetSystem(XmlInfo & xiRequest, const SessionId & siSessionRequest) const;
	void prepareRequestActionLoadOrSave(bool flagLoadOrSave, XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, const std::string & strFilespec) const;
	void prepareRequestActionLogin(XmlInfo & xiRequest, const std::string & strUser, const std::string & strPwd, const std::string & strContext) const;
	void prepareRequestActionLogout(XmlInfo & xiRequest, const SessionId & siSession) const;
	void prepareRequestActionOpCommands(XmlInfo & xiRequest, const SessionId & siSession) const;
	void prepareRequestActionRemove(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, const std::string & strFieldNameRemove) const;
	void prepareRequestActionResetCommit(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext) const;
	void prepareRequestActionRevert(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext) const;
	void prepareRequestActionSet(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, const std::map<unsigned long, std::string, std::greater<unsigned long> > & mapCTV);
	void prepareRequestActionSubmitSet(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsConfig,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsTemplate) const;

	void prepareRequestActionSysAddUser(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strUser,
		const std::string & strPwd);

	void prepareRequestActionTest(XmlInfo & xiRequest, const std::string & strTest);

	void prepareRequestActionUndelete(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		unsigned long idConfigAdd,
		const std::string & strFieldValue,
		const std::string & strFieldOp) const;
};


#endif

