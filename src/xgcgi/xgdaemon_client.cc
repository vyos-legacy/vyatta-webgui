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
 *  Module:       xgdaemon_client.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Base class encapsulating communication with the xgdaemon.
 *
 */


#include <stdexcept>
#include <iostream>

#include "xgdaemon_client.hh"
#include "basic/xgdaemon_socket.hh"
#include "basic/xgdaemon_util.hh"

void SRExchangeInfo::trimText() {
	m_xiSend.trimText();
	m_xiReceive.trimText();
}

XGDaemonClient::XGDaemonClient() {
}

bool XGDaemonClient::checkForSessionMissmatch(const XmlInfo & xiInput, const SessionId & siSessionRequest, ClientSessionInfo & siSession) const {
	analyzeClientSessionInfo(xiInput, siSession);

	bool flagSessionOK = true;
	if (siSession.getConstSessionId().isSet() == false) flagSessionOK = false;
	if (siSessionRequest.isSet() == true && siSessionRequest.doesMatch(siSession.getConstSessionId()) == false) flagSessionOK = false;

	return flagSessionOK;
}

bool XGDaemonClient::doActionAbsRemoveCommit(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::string & strPathEscaped,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionAbsRemoveCommit(
		srei.m_xiSend,
		siSessionRequest,
		strContext,
		strPathEscaped) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;			
}

bool XGDaemonClient::doActionAdd(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const unsigned long idTemplateFieldAdd,
		const std::string & strFieldValue,
		const std::string & strFieldOp,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {
			
	if (sendRequestActionAdd(
		srei.m_xiSend,
		siSessionRequest,
		strContext,
		idTemplateFieldAdd,
		strFieldValue,
		strFieldOp) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionChContext(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionChContext(srei.m_xiSend, siSessionRequest, strContext) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionCommit(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsExistant,
		const std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep,		
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionCommit(srei.m_xiSend, siSessionRequest, strContext, mapFieldsExistant, mapFieldsSep) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}
bool XGDaemonClient::doActionCycleToDone(const SessionId & siSessionRequest, unsigned long exec_id, const int sleepsecs) {
	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ClientBriefExecStatusInfo cbesi;
	DetailedExecStatusInfo desi;
	ErrorInfo eiError;
	return doActionExecStatus_CycleToDone(srei, siSessionRequest, exec_id, siSession, cbesi, desi, eiError, sleepsecs);
}
bool XGDaemonClient::doActionCycleToIdle(const SessionId & siSessionRequest, const int sleepsecs) {
	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ErrorInfo eiError;
	return doActionCycleToIdle(srei, siSessionRequest, siSession, eiError, sleepsecs);
}
bool XGDaemonClient::doActionCycleToIdle(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ErrorInfo & eiError,
		const int sleepsecs) {
	do {
		sleep(sleepsecs);
		if (doActionGetSession(
			srei,
			siSessionRequest,
			siSession,
			eiError) == false) return false;
	} while (siSession.getConstSessionStatus().isIdleOrAbove() == false);
	return true;
}

bool XGDaemonClient::doActionExecCmd(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		unsigned long command_id,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError) {

	if (sendRequestActionExecCmd(srei.m_xiSend, siSessionRequest, command_id) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientExecStatusInfo(srei.m_xiReceive, cbesi, desi);
	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;		
}

bool XGDaemonClient::doActionExecCmd_s_static_routes_ipv4(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError) {

	if (sendRequestActionExecCmd_s_static_routes_ipv4(srei.m_xiSend, siSessionRequest) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientExecStatusInfo(srei.m_xiReceive, cbesi, desi);
	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionExecCmdArgs(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long command_id,
		const std::map<unsigned int, std::string> & mapArgs,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError) {

	if (sendRequestActionExecCmdArgs(srei.m_xiSend, siSessionRequest, command_id, mapArgs) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientExecStatusInfo(srei.m_xiReceive, cbesi, desi);
	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
//	analyzeOpCmdFromExecQuery(srei.m_xiReceive, oc);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}
bool XGDaemonClient::doActionExecKill(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long idExec,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError) {

	if (sendRequestActionExecKill(srei.m_xiSend, siSessionRequest, idExec) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientExecStatusInfo(srei.m_xiReceive, cbesi, desi);
	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;			
}

bool XGDaemonClient::doActionExecQuery(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long idOpCmd,
		ClientSessionInfo & siSession,
		ClientOpCmd & oc,
		ErrorInfo & eiError) {

	if (sendRequestActionExecQuery(srei.m_xiSend, siSessionRequest, idOpCmd) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeOpCmdFromExecQuery(srei.m_xiReceive, oc);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;			
}

bool XGDaemonClient::doActionExecStatus(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long idExec,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError) {

	if (sendRequestActionExecStatus(srei.m_xiSend, siSessionRequest, idExec) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientExecStatusInfo(srei.m_xiReceive, cbesi, desi);
	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionExecutionsStatus(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ClientExecutionsStatusInfo & cesi,
		ErrorInfo & eiError)
	{
	if (sendRequestActionExecutionsStatus(srei.m_xiSend, siSessionRequest) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientExecutionsInfo(srei.m_xiReceive, cesi);
	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionExecStatus_CycleToDone(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const unsigned long idExec,
		ClientSessionInfo & siSession,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi,
		ErrorInfo & eiError,
		const int sleepsecs) {
	do {
		sleep(sleepsecs);
		if (doActionExecStatus(srei, siSessionRequest, idExec, siSession, cbesi, desi, eiError) == false) return false;
	} while (cbesi.getFlagDone() == false);
	
	return true;
}

bool XGDaemonClient::doActionGetSession(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ErrorInfo & eiError) {

	if (sendRequestActionGetSession(srei.m_xiSend, siSessionRequest) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionGetSystem(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ErrorInfo & eiError) {

	if (sendRequestActionGetSystem(srei.m_xiSend, siSessionRequest) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}
bool XGDaemonClient::doActionLoadOrSave(
		SRExchangeInfo & srei,
		bool flagLoadOrSave,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::string & strFilespec,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionLoadOrSave(
		srei.m_xiSend,
		flagLoadOrSave,
		siSessionRequest,
		strContext,
		strFilespec) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}
bool XGDaemonClient::doActionLogin(
		SRExchangeInfo & srei,
		const std::string & strUser,
		const std::string & strPwd,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionLogin(srei.m_xiSend, strUser, strPwd, strContext) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionLogout(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ErrorInfo & eiError) {
	if (sendRequestActionLogout(srei.m_xiSend, siSessionRequest) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;			
}

bool XGDaemonClient::doActionLoginCycle(
		SRExchangeInfo & srei,
		const std::string & strUser,
		const std::string & strPwd,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError,
		const int sleepsecs) {

	if (doActionLogin(srei, strUser, strPwd, strContext, siSession, clContext, eiError) == false) return false;
	if (doActionCycleToIdle(srei, siSession.getConstSessionId(), siSession, eiError, sleepsecs) == false) return false;
	return true;
}

bool XGDaemonClient::doActionOpCommands(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		ClientSessionInfo & siSession,
		ClientOpCmds & oc,
		ErrorInfo & eiError) {

	if (sendRequestActionOpCommands(srei.m_xiSend, siSessionRequest) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeOpCmds(srei.m_xiReceive, oc);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;			
}

bool XGDaemonClient::doActionRemove(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::string & strFieldNameRemove,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionRemove(srei.m_xiSend, siSessionRequest, strContext, strFieldNameRemove) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionResetCommit(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionResetCommit(srei.m_xiSend, siSessionRequest, strContext) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionRevert(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionRevert(srei.m_xiSend, siSessionRequest, strContext) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionSet(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsTemplate,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionSet(srei.m_xiSend, siSessionRequest, strContext, mapFieldsTemplate) == false) return false;

	receiveResponse(srei.m_xiReceive, srei.m_xstatus);

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;			
}

bool XGDaemonClient::doActionSubmit(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsConfig,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {

	if (sendRequestActionSubmit(srei.m_xiSend, siSessionRequest, strContext, mapFieldsConfig) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionSysAddUser(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strUser,
		const std::string & strPwd,
		ClientSessionInfo & siSession,
		ErrorInfo & eiError) {

	if (sendRequestActionSysAddUser(
		srei.m_xiSend,
		siSessionRequest,
		strUser,
		strPwd) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}

bool XGDaemonClient::doActionTest(
		const std::string & strTest,
		std::string & strTestResponse,
		XmlParseStatus & status) {

	strTestResponse.clear();

	XmlInfo xiSend;
	if (sendRequestActionTest(xiSend, strTest) == false) return false;

	XmlInfo xi;
	if (receiveResponse(xi, status) == false) return false;

	strTestResponse = XGDaemonCommonXmlUtil::get_SRV_RL_TEST(xi);
	return true;
}
bool XGDaemonClient::doActionUndelete(
		SRExchangeInfo & srei,
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const unsigned long idConfigFieldUndelete,
		const std::string & strFieldValue,
		const std::string & strFieldOp,
		ClientSessionInfo & siSession,
		ContextLocation & clContext,
		ErrorInfo & eiError) {
			
	if (sendRequestActionUndelete(
		srei.m_xiSend,
		siSessionRequest,
		strContext,
		idConfigFieldUndelete,
		strFieldValue,
		strFieldOp) == false) return false;
	if (receiveResponse(srei.m_xiReceive, srei.m_xstatus) == false) return false;

	analyzeClientSessionInfo(srei.m_xiReceive, siSession);
	analyzeContextLocation(srei.m_xiReceive, clContext);
	analyzeErrorInfo(srei.m_xiReceive, eiError);

	return true;
}


bool XGDaemonClient::sendRequestActionAbsRemoveCommit(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, const std::string & strPathEscaped) {
	prepareRequestActionAbsRemoveCommit(xiRequest, siSession, strContext, strPathEscaped);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionAdd(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, unsigned long idTemplateFieldAdd, const std::string & strFieldValue, const std::string & strFieldOp) {
	prepareRequestActionAdd(xiRequest, siSession, strContext, idTemplateFieldAdd, strFieldValue, strFieldOp);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionChContext(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext) {
	prepareRequestActionChContext(xiRequest, siSession, strContext);
	return sendRequest(xiRequest);
}

bool XGDaemonClient::sendRequestActionCommit(
	XmlInfo & xiRequest,
	const SessionId & siSession,
	const std::string & strContext,
	const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsExistant,
	const std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep) {
	prepareRequestActionCommit(xiRequest, siSession, strContext, mapFieldsExistant, mapFieldsSep);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionExecCmd(XmlInfo & xiRequest, const SessionId & siSession, unsigned long command_id) {
	prepareRequestActionExecCmd(xiRequest, siSession, command_id);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionExecCmd_s_static_routes_ipv4(XmlInfo & xiRequest, const SessionId & siSession) {
	prepareRequestActionExecCmd_s_static_routes_ipv4(xiRequest, siSession);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionExecCmdArgs(XmlInfo & xiRequest, const SessionId & siSession, unsigned long command_id, const std::map<unsigned int, std::string> & mapArgs) {
	prepareRequestActionExecCmdArgs(xiRequest, siSession, command_id, mapArgs);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionExecKill(XmlInfo & xiRequest, const SessionId & siSession, const unsigned long idExec) {
	prepareRequestActionExecKill(xiRequest, siSession, idExec);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionExecQuery(XmlInfo & xiRequest, const SessionId & siSession, unsigned long command_id) {
	prepareRequestActionExecQuery(xiRequest, siSession, command_id);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionExecStatus(XmlInfo & xiRequest, const SessionId & siSession, unsigned long idExec) {
	prepareRequestActionExecStatus(xiRequest, siSession, idExec);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionExecutionsStatus(XmlInfo & xiRequest, const SessionId & siSession) {
	prepareRequestActionExecutionsStatus(xiRequest, siSession);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionGetSession(XmlInfo & xiRequest, const SessionId & siSessionRequest) {
	prepareRequestActionGetSession(xiRequest, siSessionRequest);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionGetSystem(XmlInfo & xiRequest, const SessionId & siSessionRequest) {
	prepareRequestActionGetSystem(xiRequest, siSessionRequest);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionLoadOrSave(XmlInfo & xiRequest, bool flagLoadOrSave, const SessionId & siSession, const std::string & strContext, const std::string & strFilespec) {
	prepareRequestActionLoadOrSave(flagLoadOrSave, xiRequest, siSession, strContext, strFilespec);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionLogin(XmlInfo & xiRequest, const std::string & strUser, const std::string & strPwd, const std::string & strContext) {
	prepareRequestActionLogin(xiRequest, strUser, strPwd, strContext);
	return sendRequest(xiRequest);	
}
bool XGDaemonClient::sendRequestActionLogout(XmlInfo & xiRequest, const SessionId & siSession) {
	prepareRequestActionLogout(xiRequest, siSession);
	return sendRequest(xiRequest);	
}
bool XGDaemonClient::sendRequestActionOpCommands(XmlInfo & xiRequest, const SessionId & siSession) {
	prepareRequestActionOpCommands(xiRequest, siSession);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionRemove(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, const std::string & strFieldNameRemove) {
	prepareRequestActionRemove(xiRequest, siSession, strContext, strFieldNameRemove);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionResetCommit(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext) {
	prepareRequestActionResetCommit(xiRequest, siSession, strContext);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionRevert(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext) {
	prepareRequestActionRevert(xiRequest, siSession, strContext);
	return sendRequest(xiRequest);
}
bool XGDaemonClient::sendRequestActionSet(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsTemplate) {
	prepareRequestActionSubmitSet(xiRequest, siSession, strContext, NULL, &mapFieldsTemplate);
	return sendRequest(xiRequest);	
}
bool XGDaemonClient::sendRequestActionSubmit(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsConfig) {
	prepareRequestActionSubmitSet(xiRequest, siSession, strContext, &mapFieldsConfig, NULL);
	return sendRequest(xiRequest);
}

bool XGDaemonClient::sendRequestActionSysAddUser(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strUser,
		const std::string & strPwd) {
	prepareRequestActionSysAddUser(xiRequest, siSession, strUser, strPwd);
	return sendRequest(xiRequest);
}

bool XGDaemonClient::sendRequestActionTest(XmlInfo & xiRequest, const std::string & strTest) {
	prepareRequestActionTest(xiRequest, strTest);
	return sendRequest(xiRequest);	
}
bool XGDaemonClient::sendRequestActionUndelete(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, unsigned long idConfigFieldUndelete, const std::string & strFieldValue, const std::string & strFieldOp) {
	prepareRequestActionUndelete(xiRequest, siSession, strContext, idConfigFieldUndelete, strFieldValue, strFieldOp);
	return sendRequest(xiRequest);
}
void XGDaemonClient::analyzeClientBriefExecStatusInfo(
		const XmlNodeElement & xne_RL_ZZ_BRIEF,
		ClientBriefExecStatusInfo & cbesi) const
	{
	XmlNodeElement * p_xne_RL_ZZ_BRIEF_CACHED_CMD_LINE = xne_RL_ZZ_BRIEF.findChildElementWithName(XML_SRV_RL_ZZ_BRIEF_CACHED_CMD_LINE);
	if (p_xne_RL_ZZ_BRIEF_CACHED_CMD_LINE != NULL) {
		cbesi.setCachedCommandLine(p_xne_RL_ZZ_BRIEF_CACHED_CMD_LINE->get1InternalText());
	}
	XmlNodeElement * p_xne_RL_ZZ_BRIEF_DONE = xne_RL_ZZ_BRIEF.findChildElementWithName(XML_SRV_RL_ZZ_BRIEF_DONE);
	if (p_xne_RL_ZZ_BRIEF_DONE != NULL) {
		cbesi.setFlagDone(XGDaemonUtil::getValueStrBool(p_xne_RL_ZZ_BRIEF_DONE->get1InternalText(), false));
	}
	XmlNodeElement * p_xne_RL_ZZ_BRIEF_DONE_MSG = xne_RL_ZZ_BRIEF.findChildElementWithName(XML_SRV_RL_ZZ_BRIEF_DONE_MSG);
	if (p_xne_RL_ZZ_BRIEF_DONE_MSG != NULL) {
		cbesi.setDoneMsg(p_xne_RL_ZZ_BRIEF_DONE_MSG->get1InternalText());
	}
	XmlNodeElement * p_xne_RL_ZZ_BRIEF_DONE_SUCCESS = xne_RL_ZZ_BRIEF.findChildElementWithName(XML_SRV_RL_ZZ_BRIEF_DONE_SUCCESS);
	if (p_xne_RL_ZZ_BRIEF_DONE_SUCCESS != NULL) {
		cbesi.setFlagDoneSuccess(XGDaemonUtil::getValueStrBool(p_xne_RL_ZZ_BRIEF_DONE_SUCCESS->get1InternalText(), false));
	}
	XmlNodeElement * p_xne_RL_ZZ_BRIEF_EXEC_ID = xne_RL_ZZ_BRIEF.findChildElementWithName(XML_SRV_RL_ZZ_BRIEF_EXEC_ID);
	if (p_xne_RL_ZZ_BRIEF_EXEC_ID != NULL) {
		cbesi.setId(XGDaemonUtil::getValueStrUL_Hex(p_xne_RL_ZZ_BRIEF_EXEC_ID->get1InternalText(), 0));
	}
	XmlNodeElement * p_xne_RL_ZZ_BRIEF_KILL_INVOKED = xne_RL_ZZ_BRIEF.findChildElementWithName(XML_SRV_RL_ZZ_BRIEF_KILL_INVOKED);
	if (p_xne_RL_ZZ_BRIEF_KILL_INVOKED != NULL) {
		cbesi.setFlagKillInvoked(XGDaemonUtil::getValueStrBool(p_xne_RL_ZZ_BRIEF_KILL_INVOKED->get1InternalText(), false));
	}
}
void XGDaemonClient::analyzeClientCurrentTaskInfo(
	const XmlNodeElement & xne_ZZ_TASK,
	ClientCurrentTaskInfo & ccti) const
	{
	ccti.clear();

	XmlNodeElement * p_xne_ZZ_TASK_DONE = xne_ZZ_TASK.findChildElementWithName(XML_SRV_RL_SESSION_STATUS_TASK_DONE);
	if (p_xne_ZZ_TASK_DONE != NULL) {
		ccti.setDone(XGDaemonUtil::getValueStrBool(p_xne_ZZ_TASK_DONE->get1InternalText(), false));
	}

	XmlNodeElement * p_xne_ZZ_TASK_ERROR = xne_ZZ_TASK.findChildElementWithName(XML_SRV_RL_SESSION_STATUS_TASK_ERROR);
	if (p_xne_ZZ_TASK_ERROR != NULL) {
		ccti.setError(XGDaemonUtil::getValueStrBool(p_xne_ZZ_TASK_ERROR->get1InternalText(), false));
	}

	XmlNodeElement * p_xne_ZZ_TASK_MESSAGE = xne_ZZ_TASK.findChildElementWithName(XML_SRV_RL_SESSION_STATUS_TASK_MESSAGE);
	if (p_xne_ZZ_TASK_MESSAGE != NULL) {
		ccti.setMessage(p_xne_ZZ_TASK_MESSAGE->get1InternalText());
	}

	XmlNodeElement * p_xne_ZZ_TASK_NAME = xne_ZZ_TASK.findChildElementWithName(XML_SRV_RL_SESSION_STATUS_TASK_NAME);
	if (p_xne_ZZ_TASK_NAME != NULL) {
		ccti.setName(p_xne_ZZ_TASK_NAME->get1InternalText());
	}

	XmlNodeElement * p_xne_ZZ_TASK_STAGE = xne_ZZ_TASK.findChildElementWithName(XML_SRV_RL_SESSION_STATUS_TASK_STAGE);
	if (p_xne_ZZ_TASK_STAGE != NULL) {
		XmlNodeElement * p_xne_ZZ_TASK_STAGE_CURRENT = p_xne_ZZ_TASK_STAGE->findChildElementWithName(XML_SRV_RL_SESSION_STATUS_TASK_STAGE_CURRENT);
		if (p_xne_ZZ_TASK_STAGE_CURRENT != NULL) {
			ccti.setStageCurrent(XGDaemonUtil::getValueStrInt(p_xne_ZZ_TASK_STAGE_CURRENT->get1InternalText()));
		}
		XmlNodeElement * p_xne_ZZ_TASK_STAGE_MAX = p_xne_ZZ_TASK_STAGE->findChildElementWithName(XML_SRV_RL_SESSION_STATUS_TASK_STAGE_MAX);
		if (p_xne_ZZ_TASK_STAGE_MAX != NULL) {
			ccti.setStageMax(XGDaemonUtil::getValueStrInt(p_xne_ZZ_TASK_STAGE_MAX->get1InternalText()));
		}
	}
}
void XGDaemonClient::analyzeClientExecStatusInfo(const XmlInfo & xiInput, ClientBriefExecStatusInfo & cbesi, DetailedExecStatusInfo & desi) const {
	XmlNodeElement * p_xne_RL_EXEC_STATUS_BRIEF = XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_STATUS_BRIEF(xiInput);
	if (p_xne_RL_EXEC_STATUS_BRIEF != NULL) {
		analyzeClientBriefExecStatusInfo(*p_xne_RL_EXEC_STATUS_BRIEF, cbesi);
	}
	
	XmlNodeElement * p_xne_RL_EXEC_STATUS_DETAILED_OUTPUT = XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_STATUS_DETAILED_OUTPUT(xiInput);
	if (p_xne_RL_EXEC_STATUS_DETAILED_OUTPUT != NULL) {
		desi.setOutput(p_xne_RL_EXEC_STATUS_DETAILED_OUTPUT->get1InternalText());
	}
}
void XGDaemonClient::analyzeClientExecutionsInfo(const XmlInfo & xiInput, ClientExecutionsStatusInfo & cesi) const {
	cesi.clear();

	XmlNodeElement * p_xne_RL_EXECS = XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXECS(xiInput);
	if (p_xne_RL_EXECS != NULL) {
		const std::list<XmlNode*> & listChildren = p_xne_RL_EXECS->getChildren();
		std::list<XmlNode*>::const_iterator i = listChildren.begin();
		const std::list<XmlNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			XmlNode * p_xn = *i;
			XmlNodeElement * p_xne_RL_EXECS_BRIEF = dynamic_cast<XmlNodeElement*>(p_xn);
			if (p_xne_RL_EXECS_BRIEF != NULL && p_xne_RL_EXECS_BRIEF->getName() == XML_SRV_RL_EXECS_BRIEF) {
				ClientBriefExecStatusInfo cbesi;
				analyzeClientBriefExecStatusInfo(*p_xne_RL_EXECS_BRIEF, cbesi);
				cesi.add(cbesi);
			}
			i++;
		}
	}
}
void XGDaemonClient::analyzeClientSessionInfo(const XmlInfo & xiInput, ClientSessionInfo & siSession) const {

	const std::string & strSessionID = XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_ID(xiInput);
	const std::string & strPhase = XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_PHASE(xiInput);
	const std::string & strUsername = XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_USERNAME(xiInput);

	bool flagCanCommit = XGDaemonUtil::getValueStrBool(XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_CAN_COMMIT(xiInput), false);
	bool flagConfigChanged = XGDaemonUtil::getValueStrBool(XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_CONFIG_CHANGED(xiInput), false);
	bool flagConfigInvalid = XGDaemonUtil::getValueStrBool(XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_CONFIG_INVALID(xiInput), false);
	bool flagInvalidState = XGDaemonUtil::getValueStrBool(XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_INVALID_STATE(xiInput), false);

	unsigned long totalConfigChanges = XGDaemonUtil::getValueStrUL(XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES(xiInput), 0);
	unsigned long totalCycles = XGDaemonUtil::getValueStrUL(XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_TOTAL_CYCLES(xiInput), 0);

	unsigned long timeLastActivity  = XGDaemonUtil::getValueStrUL(XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_TIME_LAST_ACTIVITY(xiInput), 0);
	unsigned long timeStart         = XGDaemonUtil::getValueStrUL(XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_TIME_START(xiInput), 0);

	siSession.getSessionId().setSessionID(strSessionID.c_str());

	siSession.getSessionStatus().setFlagCanCommit(flagCanCommit);
	siSession.getSessionStatus().setFlagConfigChanged(flagConfigChanged);
	siSession.getSessionStatus().setFlagConfigInvalid(flagConfigInvalid);
	siSession.getSessionStatus().setFlagInvalidState(flagInvalidState);

	siSession.getSessionStatus().setPhase(strPhase);
	siSession.getSessionStatus().setTotalConfigChanges(totalConfigChanges);
	siSession.getSessionStatus().setTotalCycles(totalCycles);

	siSession.getSessionStatus().setTimeLastActivity(timeLastActivity);
	siSession.getSessionStatus().setTimeStart(timeStart);

	siSession.setUsername(strUsername);

	XmlNodeElement * p_xne_s_RL_SESSION_STATUS_TASK = XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_STATUS_TASK(xiInput);
	if (p_xne_s_RL_SESSION_STATUS_TASK != NULL) {
		analyzeClientCurrentTaskInfo(*p_xne_s_RL_SESSION_STATUS_TASK, siSession.getSessionStatus().getCurrentTask());
	}

	XmlNodeElement * p_xne_s_RL_SESSION_STATUS_TIME_NOW = XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_STATUS_TIME_NOW(xiInput);
	if (p_xne_s_RL_SESSION_STATUS_TIME_NOW != NULL) {
		analyzeClientTimeInfo(*p_xne_s_RL_SESSION_STATUS_TIME_NOW, siSession.getSessionStatus().getClientTimeInfo());
	}
	analyzeMods(xiInput, siSession.getClientModsInfo());
}
void XGDaemonClient::analyzeClientTimeInfo(const XmlNodeElement & xneRL_ZZ_TIME, ClientTimeInfo & cli) const {
	cli.clear();

	XmlNodeElement * p_xneRL_ZZ_TIME_ASC = xneRL_ZZ_TIME.findChildElementWithName(XML_SRV_RL_ZZ_TIME_ASC);
	if (p_xneRL_ZZ_TIME_ASC != NULL) {
		cli.setAsc(p_xneRL_ZZ_TIME_ASC->get1InternalText());
	}
	XmlNodeElement * p_xneRL_ZZ_TIME_ASC_HOUR24 = xneRL_ZZ_TIME.findChildElementWithName(XML_SRV_RL_ZZ_TIME_ASC_HOUR24);
	if (p_xneRL_ZZ_TIME_ASC_HOUR24 != NULL) {
		cli.setAscHour24(p_xneRL_ZZ_TIME_ASC_HOUR24->get1InternalText());
	}
	XmlNodeElement * p_xneRL_ZZ_TIME_ASC_MINUTE = xneRL_ZZ_TIME.findChildElementWithName(XML_SRV_RL_ZZ_TIME_ASC_MINUTE);
	if (p_xneRL_ZZ_TIME_ASC_MINUTE != NULL) {
		cli.setAscHour24(p_xneRL_ZZ_TIME_ASC_MINUTE->get1InternalText());
	}

	XmlNodeElement * p_xneRL_ZZ_TIME_UEPOCH = xneRL_ZZ_TIME.findChildElementWithName(XML_SRV_RL_ZZ_TIME_UEPOCH);
	if (p_xneRL_ZZ_TIME_UEPOCH != NULL) {
		const std::string & timeUEpoch = p_xneRL_ZZ_TIME_UEPOCH->get1InternalText();
		if (timeUEpoch.length() > 0) {
			time_t time = XGDaemonUtil::getValueStrTime(timeUEpoch, 0);
			cli.setTimeUEpoch(time);
		}
	}

	XmlNodeElement * p_xneRL_ZZ_TIME_ZONE = xneRL_ZZ_TIME.findChildElementWithName(XML_SRV_RL_ZZ_TIME_ZONE);
	if (p_xneRL_ZZ_TIME_ZONE != NULL) {
		cli.setTimeZone(p_xneRL_ZZ_TIME_ZONE->get1InternalText());
	}
}
void XGDaemonClient::analyzeContextLocation(const XmlInfo& xiInput, ContextLocation & clContext) const {
	XmlNodeElement * p_xne_RL_SESSION_CONTEXT_EPATH = XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_CONTEXT_EPATH(xiInput);
	if (p_xne_RL_SESSION_CONTEXT_EPATH != NULL) {
		analyzeContextLocation_Path(*p_xne_RL_SESSION_CONTEXT_EPATH, clContext.getVectorContextSegmentsExistant());
	}

	XmlNodeElement * p_xne_RL_SESSION_CONTEXT_NEPATH = XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_CONTEXT_NEPATH(xiInput);
	if (p_xne_RL_SESSION_CONTEXT_NEPATH != NULL) {
		analyzeContextLocation_Path(*p_xne_RL_SESSION_CONTEXT_NEPATH, clContext.getVectorContextSegmentsNonExistant());
	}
}

void XGDaemonClient::analyzeContextLocation_Path(const XmlNodeElement & xne_RL_SESSION_CONTEXT_ZZ_PATH, std::vector<ContextSegment> & vectorContextSegments) const {

	const std::list<XmlNode*> & listChildren = xne_RL_SESSION_CONTEXT_ZZ_PATH.getChildren();
	std::list<XmlNode*>::const_iterator i = listChildren.begin();
	const std::list<XmlNode*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		XmlNode * p_xn = *i;
		XmlNodeElement * p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT = dynamic_cast<XmlNodeElement*>(p_xn);
		if (p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT != NULL && p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT->getName() == XML_SRV_RL_ZZ_PATH_SEGMENT) {

			unsigned long idTemplate = TEMPLATE_ID_UNKNOWN;
			XmlNodeElement * p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_TEMPLATE_ID = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_TEMPLATE_ID);
			if (p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_TEMPLATE_ID != NULL && p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_TEMPLATE_ID->has1InternalText()) {
				idTemplate = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_TEMPLATE_ID->get1InternalText_UL_Hex(TEMPLATE_ID_UNKNOWN);
			}


			unsigned long idConfig = CONFIG_ID_UNKNOWN;
			XmlNodeElement * p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_CONFIG_ID = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_CONFIG_ID);
			if (p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_CONFIG_ID != NULL && p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_CONFIG_ID->has1InternalText()) {
				idConfig = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_CONFIG_ID->get1InternalText_UL_Hex(CONFIG_ID_UNKNOWN);
			}


			bool flagMulti = false;
			XmlNodeElement * p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_MULTI = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT->findChildElementWithName(XML_SRV_RL_ZZ_PATH_SEGMENT_MULTI);
			flagMulti = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_MULTI->get1InternalText_Bool(false);


			std::string strName;
			XmlNodeElement * p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_NAME = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT->findChildElementWithName(XML_SRV_RL_ZZ_PATH_SEGMENT_NAME);
			if (p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_NAME != NULL) {
				strName = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_NAME->get1InternalText();
			}


			NStatInfo nsi;
			XmlNodeElement * p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_NSTAT = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT->findChildElementWithName(XML_SRV_RL_ZZ_PATH_SEGMENT_NSTAT);
			if (p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_NSTAT != NULL) {
				analyzeNStatInfo(*p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_NSTAT, nsi);
			}

			SubInfo si;
			XmlNodeElement * p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_SUB = p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT->findChildElementWithName(XML_SRV_RL_ZZ_PATH_SEGMENT_SUB);
			if (p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_SUB != NULL) {
				analyzeSubInfo(*p_xne_SRV_RL_SESSION_CONTEXT_ZZ_PATH_SEGMENT_SUB, si);
			}

			vectorContextSegments.push_back(ContextSegment(idTemplate, idConfig, XGDaemonUtil::getStrUnEscapedBackSlash(strName), flagMulti, nsi, si));
		}
		i++;
	}
}

void XGDaemonClient::analyzeErrorInfo(const XmlInfo& xiInput, ErrorInfo & eiError) const {

	int line = -1;
	XmlNodeElement * p_xne_RL_ERROR_LINE = XGDaemonCommonXmlUtil::getXNE_SRV_RL_ERROR_LINE(xiInput);
	if (p_xne_RL_ERROR_LINE != NULL) {
		line = XGDaemonUtil::getValueStrInt(p_xne_RL_ERROR_LINE->get1InternalText());
	}

	int codeError = ERROR_NONE;
	XmlNodeElement * p_xne_RL_ERROR_ID = XGDaemonCommonXmlUtil::getXNE_SRV_RL_ERROR_ID(xiInput);
	if (p_xne_RL_ERROR_ID != NULL) {
		codeError = XGDaemonUtil::getValueStrInt(p_xne_RL_ERROR_ID->get1InternalText());
	}

	std::string strErrorDesc;
	XmlNodeElement * p_xne_RL_ERROR_DESC = XGDaemonCommonXmlUtil::getXNE_SRV_RL_ERROR_DESC(xiInput);
	if (p_xne_RL_ERROR_DESC != NULL) {
		strErrorDesc = p_xne_RL_ERROR_DESC->get1InternalText();
	}

	eiError.setInfo(line, codeError, strErrorDesc);
}
void XGDaemonClient::analyzeOpCmdFromExecQuery(const XmlInfo& xiInput, ClientOpCmd & oc) const {
	unsigned long idOpCmd = XGDaemonUtil::getValueStrUL_Hex(XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_COMMAND_ID(xiInput), 0);
	const std::string & strAction = XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_ACTION(xiInput);
	const std::string & strHelpString = XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_HELP_STRING(xiInput);
	const std::string & strModule = XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_MODULE(xiInput);
	const std::string & strName = XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_NAME(xiInput);
	const std::string & strType = XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_COMMAND_TYPE(xiInput);

	OpCmdType oct = OCT_REGULAR;
	if (strType == XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_EXPANDED) {
		oct = OCT_EXPANDED;
	} else if (strType == XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_NON_EXPANDED) {
		oct = OCT_NON_EXPANDED;
	}

	oc.set(idOpCmd, strName, strHelpString, strAction, strModule, oct);

	XmlNodeElement * p_xne_SRV_RL_EXEC_QUERY_ARGS = XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_QUERY_ARGS(xiInput);
	if (p_xne_SRV_RL_EXEC_QUERY_ARGS != NULL) {
		const std::list<XmlNode*> listNodes = p_xne_SRV_RL_EXEC_QUERY_ARGS->getChildren();
		std::list<XmlNode*>::const_iterator i = listNodes.begin();
		const std::list<XmlNode*>::const_iterator iEnd = listNodes.end();
		while (i != iEnd) {
			XmlNode * p_xn = *i;
			XmlNodeElement * p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG = dynamic_cast<XmlNodeElement*>(p_xn);
			if (p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG != NULL && p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG->getName() == XML_SRV_RL_EXEC_QUERY_ARGS_ARG) {

				XmlNodeElement * p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG->findChildElementWithName(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED);

				XmlNodeElement * p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_DYNAMIC = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG->findChildElementWithName(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_DYNAMIC);
				const bool flagDynamic = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_DYNAMIC->get1InternalText_Bool(false);

				XmlNodeElement * p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_NAME = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG->findChildElementWithName(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_NAME);
				const std::string & strName = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_NAME->get1InternalText();

				XmlNodeElement * p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_NO_VALUES = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG->findChildElementWithName(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_NO_VALUES);
				const bool flagNoValues = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_NO_VALUES->get1InternalText_Bool(false);

				XmlNodeElement * p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_NUM = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG->findChildElementWithName(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_NUM);
				const int num = XGDaemonUtil::getValueStrInt(p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_NUM->get1InternalText());

				if (num > 0) {
					int index = num-1;
					CommandNameSegment * p_cns = new CommandNameSegment(index, flagDynamic, strName);

					if (flagNoValues) p_cns->setFlagNoValues();

					if (p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED != NULL) {
						const std::list<XmlNode*> listAllowedNodes = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED->getChildren();
						std::list<XmlNode*>::const_iterator j = listAllowedNodes.begin();
						const std::list<XmlNode*>::const_iterator jEnd = listAllowedNodes.end();
						while (j != jEnd) {
							XmlNode * p_xn = *j;
							XmlNodeElement * p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED_ITEM = dynamic_cast<XmlNodeElement*>(p_xn);
							if (p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED_ITEM != NULL && p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED_ITEM->getName() == XML_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED_ITEM) {
								std::string strAllowedItem = p_xne_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED_ITEM->get1InternalText();
								p_cns->addAllowedValue(strAllowedItem);
							}
							j++;
						}
					}
					oc.getOpCmdName().addSegment(p_cns);
				}
			}
			i++;
		}
	}
}
void XGDaemonClient::analyzeOpCmds(const XmlInfo& xiInput, ClientOpCmds & oc) const {
	XmlNodeElement * p_xne_RL_OP_COMMANDS = XGDaemonCommonXmlUtil::getXNE_SRV_RL_OP_COMMANDS(xiInput);
	if (p_xne_RL_OP_COMMANDS != NULL) {
		const std::list<XmlNode*> listNodes = p_xne_RL_OP_COMMANDS->getChildren();
		std::list<XmlNode*>::const_iterator i = listNodes.begin();
		const std::list<XmlNode*>::const_iterator iEnd = listNodes.end();
		
		while (i != iEnd) {
			XmlNode * p_xn = *i;
			XmlNodeElement * p_xneRL_OP_COMMANDS_OP_COMMAND = dynamic_cast<XmlNodeElement*>(p_xn);
			if (p_xneRL_OP_COMMANDS_OP_COMMAND != NULL) {
				if (p_xneRL_OP_COMMANDS_OP_COMMAND->getName() == XML_SRV_RL_OP_COMMANDS_OP_COMMAND) {
					unsigned long id = 0;
					std::string strName, strHelpString, strAction, strModule, strType; 

					XmlNodeElement * p_xneRL_OP_COMMANDS_OP_COMMAND_COMMAND_ID = p_xneRL_OP_COMMANDS_OP_COMMAND->findChildElementWithName(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_COMMAND_ID);
					if (p_xneRL_OP_COMMANDS_OP_COMMAND_COMMAND_ID != NULL && p_xneRL_OP_COMMANDS_OP_COMMAND_COMMAND_ID->has1InternalText()) {
						std::string strId = p_xneRL_OP_COMMANDS_OP_COMMAND_COMMAND_ID->get1InternalText();
						id = XGDaemonUtil::getValueStrUL_Hex(strId, 0);
					}

					XmlNodeElement * p_xneRL_OP_COMMANDS_OP_COMMAND_NAME = p_xneRL_OP_COMMANDS_OP_COMMAND->findChildElementWithName(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_NAME);
					if (p_xneRL_OP_COMMANDS_OP_COMMAND_NAME != NULL && p_xneRL_OP_COMMANDS_OP_COMMAND_NAME->has1InternalText()) {
						strName = p_xneRL_OP_COMMANDS_OP_COMMAND_NAME->get1InternalText();
					}

					XmlNodeElement * p_xneRL_OP_COMMANDS_OP_COMMAND_HELP_STRING = p_xneRL_OP_COMMANDS_OP_COMMAND->findChildElementWithName(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_HELP_STRING);
					if (p_xneRL_OP_COMMANDS_OP_COMMAND_HELP_STRING != NULL && p_xneRL_OP_COMMANDS_OP_COMMAND_HELP_STRING->has1InternalText()) {
						strHelpString = p_xneRL_OP_COMMANDS_OP_COMMAND_HELP_STRING->get1InternalText();
					}

					XmlNodeElement * p_xneRL_OP_COMMANDS_OP_COMMAND_ACTION = p_xneRL_OP_COMMANDS_OP_COMMAND->findChildElementWithName(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_ACTION);
					if (p_xneRL_OP_COMMANDS_OP_COMMAND_ACTION != NULL && p_xneRL_OP_COMMANDS_OP_COMMAND_ACTION->has1InternalText()) {
						strAction = p_xneRL_OP_COMMANDS_OP_COMMAND_ACTION->get1InternalText();
					}

					XmlNodeElement * p_xneRL_OP_COMMANDS_OP_COMMAND_MODULE = p_xneRL_OP_COMMANDS_OP_COMMAND->findChildElementWithName(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_MODULE);
					if (p_xneRL_OP_COMMANDS_OP_COMMAND_MODULE != NULL && p_xneRL_OP_COMMANDS_OP_COMMAND_MODULE->has1InternalText()) {
						strModule = p_xneRL_OP_COMMANDS_OP_COMMAND_MODULE->get1InternalText();
					}

					XmlNodeElement * p_xneRL_OP_COMMANDS_OP_COMMAND_TYPE = p_xneRL_OP_COMMANDS_OP_COMMAND->findChildElementWithName(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE);
					if (p_xneRL_OP_COMMANDS_OP_COMMAND_TYPE != NULL && p_xneRL_OP_COMMANDS_OP_COMMAND_TYPE->has1InternalText()) {
						strType = p_xneRL_OP_COMMANDS_OP_COMMAND_TYPE->get1InternalText();
					}

					OpCmdType oct = OCT_REGULAR;
					if (strType == XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_EXPANDED) {
						oct = OCT_EXPANDED;
					} else if (strType == XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_NON_EXPANDED) {
						oct = OCT_NON_EXPANDED;
					}
					oc.push(new ClientOpCmd(id, strName, strHelpString, strAction, strModule, oct));
				}
			}
			i++;
		}
	}
}
void XGDaemonClient::analyzeContextValueInfo(const XmlNodeElement & xneRL_ZZ_NODES_NODE_VALUE, ContextValueInfo & cvi) const {
	bool flagHide = true;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_HIDE = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_HIDE);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_HIDE != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_HIDE->has1InternalText()) {
		flagHide = p_xneRL_ZZ_NODES_NODE_VALUE_HIDE->get1InternalText_Bool(flagHide);
	}
	cvi.setFlagHideValue(flagHide);

	bool flagInvalid = false;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_INVALID = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_INVALID);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_INVALID != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_INVALID->has1InternalText()) {
		flagInvalid = p_xneRL_ZZ_NODES_NODE_VALUE_INVALID->get1InternalText_Bool(flagInvalid);
	}
	cvi.getVV().setFlagInvalid(flagInvalid);

	std::string strInvalidDesc;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_INVALID_DESC = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_INVALID_DESC);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_INVALID_DESC != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_INVALID_DESC->has1InternalText()) {
		strInvalidDesc = p_xneRL_ZZ_NODES_NODE_VALUE_INVALID_DESC->get1InternalText();
	}
	cvi.getVV().setInvalidValueDesc(strInvalidDesc);

	bool flagCurrentExists = false;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT_EXISTS = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_CURRENT_EXISTS);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT_EXISTS != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT_EXISTS->has1InternalText()) {
		flagCurrentExists = p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT_EXISTS->get1InternalText_Bool(flagCurrentExists);
	}
	cvi.setFlagCurrentExists(flagCurrentExists);

	std::string strCurrentValue;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_CURRENT);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT->has1InternalText()) {
		strCurrentValue = p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT->get1InternalText();
	}
	cvi.getCurrent().setValue(strCurrentValue);

	std::string strCurrentOperator;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT_OP = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_CURRENT_OP);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT_OP != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT_OP->has1InternalText()) {
		strCurrentOperator = p_xneRL_ZZ_NODES_NODE_VALUE_CURRENT_OP->get1InternalText();
	}
	cvi.getCurrent().setOperator(strCurrentOperator);

	bool flagDefaultExists = false;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_DEF_EXISTS = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_DEF_EXISTS);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_DEF_EXISTS != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_DEF_EXISTS->has1InternalText()) {
		flagDefaultExists = p_xneRL_ZZ_NODES_NODE_VALUE_DEF_EXISTS->get1InternalText_Bool(flagDefaultExists);
	}
	cvi.setFlagDefaultExists(flagDefaultExists);

	std::string strDefaultValue;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_DEF = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_DEF);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_DEF != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_DEF->has1InternalText()) {
		strDefaultValue = p_xneRL_ZZ_NODES_NODE_VALUE_DEF->get1InternalText();
	}
	cvi.setDefaultValue(strDefaultValue);

	std::string strErrorDesc;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_ERROR_DESC = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ERROR_DESC);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_ERROR_DESC != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_ERROR_DESC->has1InternalText()) {
		strErrorDesc = p_xneRL_ZZ_NODES_NODE_VALUE_ERROR_DESC->get1InternalText();
	}
	cvi.getVV().setInvalidValueDesc(strErrorDesc);


	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED = xneRL_ZZ_NODES_NODE_VALUE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED);
	if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED != NULL) {
		std::list<std::string> & listAllowedOperators = cvi.getListAllowedOperators();
		std::map<std::pair<int64_t, int64_t>, std::string> & mapAllowedRanges = cvi.getMapAllowedRanges();
		std::map<std::string, std::string> & mapAllowedValues = cvi.getMapAllowedValues();

		const std::list<XmlNode*> listItems = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED->getChildren();
		std::list<XmlNode*>::const_iterator i = listItems.begin();
		const std::list<XmlNode*>::const_iterator iEnd = listItems.end();

		while (i != iEnd) {
			XmlNode * p_xn = *i;
			XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI = dynamic_cast<XmlNodeElement*>(p_xn);
			if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI != NULL) {
				if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI->getName() == XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_OP) {
					const std::string & strAllowedItem = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI->get1InternalText();
					listAllowedOperators.push_back(strAllowedItem);
				} else if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI->getName() == XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM) {
					std::string strHelp;
					XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_HELP = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_HELP);
					if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_HELP != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_HELP->has1InternalText()) {
						strHelp = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_HELP->get1InternalText();
					}

					std::string strValue;
					XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_VALUE = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_VALUE);
					if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_VALUE != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_VALUE->has1InternalText()) {
						strValue = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_VALUE->get1InternalText();
					}

					if (strValue.length() > 0) {
						mapAllowedValues[strValue] = strHelp;
					}
				} else if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI->getName() == XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE) {
					std::string strHelp;
					XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_HELP = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_HELP);
					if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_HELP != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_HELP->has1InternalText()) {
						strHelp = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_HELP->get1InternalText();
					}

					std::pair<bool, bool> flagsSet;
					flagsSet.first = false;
					flagsSet.second = false;
					std::pair<int64_t, int64_t> range;
					XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MIN = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MIN);
					if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MIN != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MIN->has1InternalText()) {
						flagsSet.first = true;
						range.first = XGDaemonUtil::getValueStrInt(p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MIN->get1InternalText());
					}
					XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MAX = p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RI->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MAX);
					if (p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MAX != NULL && p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MAX->has1InternalText()) {
						flagsSet.second = true;
						range.second = XGDaemonUtil::getValueStrInt(p_xneRL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MAX->get1InternalText());
					}

					if (flagsSet.first && flagsSet.second) {
						mapAllowedRanges[range] = strHelp;
					}
				}
			}
			i++;
		}
	}
}
void XGDaemonClient::analyzeInnerContextInfo(const XmlNodeElement & xneRL_ZZ_NODES_NODE, InnerContextInfo & ici) const {

	bool flagContextSwitch = false;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_CONTEXT_SWITCH = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_CONTEXT_SWITCH);
	if (p_xneRL_ZZ_NODES_NODE_CONTEXT_SWITCH != NULL && p_xneRL_ZZ_NODES_NODE_CONTEXT_SWITCH->has1InternalText()) {
		flagContextSwitch = p_xneRL_ZZ_NODES_NODE_CONTEXT_SWITCH->get1InternalText_Bool(flagContextSwitch);
	}
	ici.setFlagContextSwitch(flagContextSwitch);

	bool flagDeprecated = false;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_DEPRECATED = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_DEPRECATED);
	if (p_xneRL_ZZ_NODES_NODE_DEPRECATED != NULL && p_xneRL_ZZ_NODES_NODE_DEPRECATED->has1InternalText()) {
		flagDeprecated = p_xneRL_ZZ_NODES_NODE_DEPRECATED->get1InternalText_Bool(flagDeprecated);
	}
	ici.setFlagDeprecated(flagDeprecated);

	bool flagMandatory = false;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_MANDATORY = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_MANDATORY);
	if (p_xneRL_ZZ_NODES_NODE_MANDATORY != NULL && p_xneRL_ZZ_NODES_NODE_MANDATORY->has1InternalText()) {
		flagMandatory = p_xneRL_ZZ_NODES_NODE_MANDATORY->get1InternalText_Bool(flagMandatory);
	}
	ici.setFlagMandatory(flagMandatory);

	bool flagRequired = false;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_REQUIRED = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_REQUIRED);
	if (p_xneRL_ZZ_NODES_NODE_REQUIRED != NULL && p_xneRL_ZZ_NODES_NODE_REQUIRED->has1InternalText()) {
		flagRequired = p_xneRL_ZZ_NODES_NODE_REQUIRED->get1InternalText_Bool(flagRequired);
	}
	ici.setFlagRequired(flagRequired);


	unsigned long totalEChildren = 0;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_TOTAL_ECHILDREN = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_TOTAL_ECHILDREN);
	if (p_xneRL_ZZ_NODES_NODE_TOTAL_ECHILDREN != NULL && p_xneRL_ZZ_NODES_NODE_TOTAL_ECHILDREN->has1InternalText()) {
		totalEChildren = p_xneRL_ZZ_NODES_NODE_TOTAL_ECHILDREN->get1InternalText_UL(0);
	}
	ici.setTotalEChildren(totalEChildren);


	unsigned long totalEChildrenCS = 0;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_TOTAL_ECHILDREN_CS = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_TOTAL_ECHILDREN_CS);
	if (p_xneRL_ZZ_NODES_NODE_TOTAL_ECHILDREN_CS != NULL && p_xneRL_ZZ_NODES_NODE_TOTAL_ECHILDREN_CS->has1InternalText()) {
		totalEChildrenCS = p_xneRL_ZZ_NODES_NODE_TOTAL_ECHILDREN_CS->get1InternalText_UL(0);
	}
	ici.setTotalEChildrenCS(totalEChildrenCS);	


	unsigned long totalNEChildren = 0;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_TOTAL_NECHILDREN = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_TOTAL_NECHILDREN);
	if (p_xneRL_ZZ_NODES_NODE_TOTAL_NECHILDREN != NULL && p_xneRL_ZZ_NODES_NODE_TOTAL_NECHILDREN->has1InternalText()) {
		totalNEChildren = p_xneRL_ZZ_NODES_NODE_TOTAL_NECHILDREN->get1InternalText_UL(0);
	}
	ici.setTotalNEChildren(totalNEChildren);


	unsigned long totalNEChildrenCS = 0;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_TOTAL_NECHILDREN_CS = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_TOTAL_NECHILDREN_CS);
	if (p_xneRL_ZZ_NODES_NODE_TOTAL_NECHILDREN_CS != NULL && p_xneRL_ZZ_NODES_NODE_TOTAL_NECHILDREN_CS->has1InternalText()) {
		totalNEChildrenCS = p_xneRL_ZZ_NODES_NODE_TOTAL_NECHILDREN_CS->get1InternalText_UL(0);
	}
	ici.setTotalNEChildrenCS(totalNEChildrenCS);


	std::string strDataType;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_DATA_TYPE = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_DATA_TYPE);
	if (p_xneRL_ZZ_NODES_NODE_DATA_TYPE != NULL && p_xneRL_ZZ_NODES_NODE_DATA_TYPE->has1InternalText()) {
		strDataType = p_xneRL_ZZ_NODES_NODE_DATA_TYPE->get1InternalText();
	}
	ici.setDataType(strDataType);


	std::string strDeprecatedReason;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_DEPRECATED_REASON = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_DEPRECATED_REASON);
	if (p_xneRL_ZZ_NODES_NODE_DEPRECATED_REASON != NULL && p_xneRL_ZZ_NODES_NODE_DEPRECATED_REASON->has1InternalText()) {
		strDeprecatedReason = p_xneRL_ZZ_NODES_NODE_DEPRECATED_REASON->get1InternalText();
	}
	ici.setDeprecatedReason(strDeprecatedReason);


	std::string strHelpString;
	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_HELP_STRING = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_HELP_STRING);
	if (p_xneRL_ZZ_NODES_NODE_HELP_STRING != NULL && p_xneRL_ZZ_NODES_NODE_HELP_STRING->has1InternalText()) {
		strHelpString = p_xneRL_ZZ_NODES_NODE_HELP_STRING->get1InternalText();
	}
	ici.setHelpString(strHelpString);


	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_VALUE = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_VALUE);
	if (p_xneRL_ZZ_NODES_NODE_VALUE != NULL) {
		analyzeContextValueInfo(*p_xneRL_ZZ_NODES_NODE_VALUE, ici.getContextValueInfo());
	}


	XmlNodeElement * p_xneRL_ZZ_NODES_NODE_SUB = xneRL_ZZ_NODES_NODE.findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_SUB);
	if (p_xneRL_ZZ_NODES_NODE_SUB != NULL) {
		analyzeSubInfo(*p_xneRL_ZZ_NODES_NODE_SUB, ici.getSubInfo());
	}
	
}
void XGDaemonClient::analyzeListGeneralNodes(const XmlInfo& xiInput, std::list<GeneralContextInfo> & listNodes) const {
	XmlNodeElement * p_xne_s_RL_SEP_NODES = XGDaemonCommonXmlUtil::getXNE_SRV_RL_SEP_NODES(xiInput);
	if (p_xne_s_RL_SEP_NODES != NULL) {
		std::list<XmlNode *> listChildren = p_xne_s_RL_SEP_NODES->getChildren();
		std::list<XmlNode *>::const_iterator i = listChildren.begin();
		std::list<XmlNode *>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			XmlNode * p_xn_s_RL_SEP_NODES = *i;
			XmlNodeElement * p_xne_s_RL_SEP_NODES_NODE = dynamic_cast<XmlNodeElement*>(p_xn_s_RL_SEP_NODES);
			if (p_xne_s_RL_SEP_NODES_NODE != NULL) {				
				if (p_xne_s_RL_SEP_NODES_NODE->getName() == XML_SRV_RL_ZZ_NODES_NODE) {

					InnerContextInfo ici;
					analyzeInnerContextInfo(*p_xne_s_RL_SEP_NODES_NODE, ici);

					unsigned long idTemplate = TEMPLATE_ID_UNKNOWN;
					XmlNodeElement * p_xne_s_RL_SEP_NODES_NODE_TEMPLATE_ID = p_xne_s_RL_SEP_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_TEMPLATE_ID);
					if (p_xne_s_RL_SEP_NODES_NODE_TEMPLATE_ID != NULL && p_xne_s_RL_SEP_NODES_NODE_TEMPLATE_ID->has1InternalText()) {
						idTemplate = p_xne_s_RL_SEP_NODES_NODE_TEMPLATE_ID->get1InternalText_UL_Hex(TEMPLATE_ID_UNKNOWN);
					}


					unsigned long idConfig = CONFIG_ID_UNKNOWN;
					XmlNodeElement * p_xne_s_RL_SEP_NODES_NODE_CONFIG_ID = p_xne_s_RL_SEP_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_CONFIG_ID);
					if (p_xne_s_RL_SEP_NODES_NODE_CONFIG_ID != NULL && p_xne_s_RL_SEP_NODES_NODE_CONFIG_ID->has1InternalText()) {
						idConfig = p_xne_s_RL_SEP_NODES_NODE_CONFIG_ID->get1InternalText_UL_Hex(CONFIG_ID_UNKNOWN);
					}

					ContextLocation clNode;

					XmlNodeElement * p_xne_s_RL_SEP_NODES_NODE_EPATH = p_xne_s_RL_SEP_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_EPATH);
					if (p_xne_s_RL_SEP_NODES_NODE_EPATH != NULL && p_xne_s_RL_SEP_NODES_NODE_EPATH->has1InternalText()) {						
						analyzeContextLocation_Path(*p_xne_s_RL_SEP_NODES_NODE_EPATH, clNode.getVectorContextSegmentsExistant());
					}

					XmlNodeElement * p_xne_s_RL_SEP_NODES_NODE_NEPATH = p_xne_s_RL_SEP_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_NEPATH);
					if (p_xne_s_RL_SEP_NODES_NODE_NEPATH != NULL && p_xne_s_RL_SEP_NODES_NODE_NEPATH->has1InternalText()) {						
						analyzeContextLocation_Path(*p_xne_s_RL_SEP_NODES_NODE_NEPATH, clNode.getVectorContextSegmentsNonExistant());
					}

					GeneralContextInfo gci(clNode, ici);
					listNodes.push_back(gci);
				}
			}
			i++;
		}
	}
}
void XGDaemonClient::analyzeMods(const XmlInfo & xiInput, ClientModsInfo & cmi) const {
	cmi.clear();

	XmlNodeElement * p_xne_s_RL_SESSION_MODS = XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_MODS(xiInput);
	if (p_xne_s_RL_SESSION_MODS != NULL) analyzeMods(*p_xne_s_RL_SESSION_MODS, cmi);
}
void XGDaemonClient::analyzeMods(const XmlNodeElement & xne_s_RL_SESSION_MODS, ClientModsInfo & cmi) const {
	cmi.clear();

	XmlNodeElement * p_xne_s_RL_SESSION_MODS_ADDED_NODES = xne_s_RL_SESSION_MODS.findChildElementWithName(XML_SRV_RL_SESSION_MODS_ADDED_NODES);
	if (p_xne_s_RL_SESSION_MODS_ADDED_NODES != NULL) {
		analyzeMods_Nodes(*p_xne_s_RL_SESSION_MODS_ADDED_NODES, MOD_ADDED, cmi.getListNodesAdded());
	}

	XmlNodeElement * p_xne_s_RL_SESSION_MODS_CHANGED_NODES = xne_s_RL_SESSION_MODS.findChildElementWithName(XML_SRV_RL_SESSION_MODS_CHANGED_NODES);
	if (p_xne_s_RL_SESSION_MODS_CHANGED_NODES != NULL) {
		analyzeMods_Nodes(*p_xne_s_RL_SESSION_MODS_CHANGED_NODES, MOD_CHANGED, cmi.getListNodesChanged());
	}

	XmlNodeElement * p_xne_s_RL_SESSION_MODS_DELETED_NODES = xne_s_RL_SESSION_MODS.findChildElementWithName(XML_SRV_RL_SESSION_MODS_DELETED_NODES);
	if (p_xne_s_RL_SESSION_MODS_DELETED_NODES != NULL) {
		analyzeMods_Nodes(*p_xne_s_RL_SESSION_MODS_DELETED_NODES, MOD_ADDED, cmi.getListNodesDeleted());
	}

	XmlNodeElement * p_xne_s_RL_SESSION_MODS_MISSING_NODES = xne_s_RL_SESSION_MODS.findChildElementWithName(XML_SRV_RL_SESSION_MODS_MISSING_NODES);
	if (p_xne_s_RL_SESSION_MODS_MISSING_NODES != NULL) {
		analyzeMods_Nodes(*p_xne_s_RL_SESSION_MODS_MISSING_NODES, MOD_MISSING, cmi.getListNodesMissing());
	}

/*	XmlNodeElement * p_xne_s_RL_SESSION_MODS_INVALID_NODES = xne_s_RL_SESSION_MODS.findChildElementWithName(XML_SRV_RL_SESSION_MODS_INVALID_NODES);
	if (p_xne_s_RL_SESSION_MODS_INVALID_NODES != NULL) {
		analyzeMods_Nodes(*p_xne_s_RL_SESSION_MODS_INVALID_NODES, MOD_INVALID, cmi.getListNodesInvalid());
	}
*/
}
void XGDaemonClient::analyzeMods_Nodes(const XmlNodeElement & xne_s_RL_SESSION_MODS_NODES, const ModType mt, std::list<ClientModContextInfo> & listNodes) const {
	listNodes.clear();

	std::list<XmlNode *> listChildren = xne_s_RL_SESSION_MODS_NODES.getChildren();
	std::list<XmlNode *>::const_iterator i = listChildren.begin();
	std::list<XmlNode *>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		XmlNode * p_xn_s_RL_SESSION_MODS_NODES_NODE = *i;
		XmlNodeElement * p_xne_s_RL_SESSION_MODS_NODES_NODE = dynamic_cast<XmlNodeElement*>(p_xn_s_RL_SESSION_MODS_NODES_NODE);
		if (p_xne_s_RL_SESSION_MODS_NODES_NODE != NULL && p_xne_s_RL_SESSION_MODS_NODES_NODE->getName() == XML_SRV_RL_ZZ_NODES_MOD_NODE) {

			XmlNodeElement * p_xne_s_RL_SESSION_MODS_NODES_NODE_PATH = p_xne_s_RL_SESSION_MODS_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_MOD_NODE_PATH);
			if (p_xne_s_RL_SESSION_MODS_NODES_NODE_PATH != NULL) {
				const std::string & strPath = p_xne_s_RL_SESSION_MODS_NODES_NODE_PATH->get1InternalText();
				ClientModContextInfo cmci(mt, strPath);
				listNodes.push_back(cmci);
			}
		}
		i++;
	}
}
void XGDaemonClient::analyzeNStatInfo(const XmlNodeElement & xneRL_ZZ_NSTAT, NStatInfo & nsi) const {
	nsi.clear();

	XmlNodeElement * p_xneRL_ZZ_NSTAT_ADDED = xneRL_ZZ_NSTAT.findChildElementWithName(XML_SRV_RL_ZZ_NSTAT_ADDED);
	if (p_xneRL_ZZ_NSTAT_ADDED != NULL) {
		nsi.setFlagAdded(p_xneRL_ZZ_NSTAT_ADDED->get1InternalText_Bool(false));
	}

	XmlNodeElement * p_xneRL_ZZ_NSTAT_CHANGED = xneRL_ZZ_NSTAT.findChildElementWithName(XML_SRV_RL_ZZ_NSTAT_CHANGED);
	if (p_xneRL_ZZ_NSTAT_CHANGED != NULL) {
		nsi.setFlagChanged(p_xneRL_ZZ_NSTAT_CHANGED->get1InternalText_Bool(false));
	}

	XmlNodeElement * p_xneRL_ZZ_NSTAT_DELETED = xneRL_ZZ_NSTAT.findChildElementWithName(XML_SRV_RL_ZZ_NSTAT_DELETED);
	if (p_xneRL_ZZ_NSTAT_DELETED != NULL) {
		nsi.setFlagDeleted(p_xneRL_ZZ_NSTAT_DELETED->get1InternalText_Bool(false));
	}

	XmlNodeElement * p_xneRL_ZZ_NSTAT_INVALID = xneRL_ZZ_NSTAT.findChildElementWithName(XML_SRV_RL_ZZ_NSTAT_INVALID);
	if (p_xneRL_ZZ_NSTAT_INVALID != NULL) {
		nsi.setFlagInvalid(p_xneRL_ZZ_NSTAT_INVALID->get1InternalText_Bool(false));
	}

	XmlNodeElement * p_xneRL_ZZ_NSTAT_MISSING_REQUIRED = xneRL_ZZ_NSTAT.findChildElementWithName(XML_SRV_RL_ZZ_NSTAT_MISSING_REQUIRED);
	if (p_xneRL_ZZ_NSTAT_MISSING_REQUIRED != NULL) {
		nsi.setFlagMissingRequired(p_xneRL_ZZ_NSTAT_MISSING_REQUIRED->get1InternalText_Bool(false));
	}
}
void XGDaemonClient::analyzeParentContextInfo(const XmlInfo& xiInput, ParentContextInfo & pciContext) const {
	
	XmlNodeElement * p_xne_s_RL_SESSION_CONTEXT_SYB_NODES = XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_CONTEXT_SYB_NODES(xiInput);
	if (p_xne_s_RL_SESSION_CONTEXT_SYB_NODES != NULL) {
		std::list<XmlNode *> listChildren = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES->getChildren();
		std::list<XmlNode *>::const_iterator i = listChildren.begin();
		std::list<XmlNode *>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			XmlNode * p_xn_s_RL_SESSION_CONTEXT_SYB_NODES = *i;
			XmlNodeElement * p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE = dynamic_cast<XmlNodeElement*>(p_xn_s_RL_SESSION_CONTEXT_SYB_NODES);
			if (p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE != NULL) {				
				if (p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE->getName() == XML_SRV_RL_ZZ_NODES_NODE) {

					InnerContextInfo ici;
					analyzeInnerContextInfo(*p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE, ici);


					unsigned long idTemplate = TEMPLATE_ID_UNKNOWN;
					XmlNodeElement * p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_TEMPLATE_ID = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_TEMPLATE_ID);
					if (p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_TEMPLATE_ID != NULL && p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_TEMPLATE_ID->has1InternalText()) {
						idTemplate = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_TEMPLATE_ID->get1InternalText_UL_Hex(TEMPLATE_ID_UNKNOWN);
					}


					unsigned long idConfig = CONFIG_ID_UNKNOWN;
					XmlNodeElement * p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_CONFIG_ID = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_CONFIG_ID);
					if (p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_CONFIG_ID != NULL && p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_CONFIG_ID->has1InternalText()) {
						idConfig = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_CONFIG_ID->get1InternalText_UL_Hex(CONFIG_ID_UNKNOWN);
					}


					std::string strNameHere;
					XmlNodeElement * p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_NAME = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_NAME);
					if (p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_NAME != NULL && p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_NAME->has1InternalText()) {
						strNameHere = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_NAME->get1InternalText();
					}

					bool flagMultinode = false;
					XmlNodeElement * p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_MULTINODE = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_MULTI_NODE);
					if (p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_MULTINODE != NULL && p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_MULTINODE->has1InternalText()) {
						flagMultinode = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_MULTINODE->get1InternalText_Bool(flagMultinode);
					}

					NStatInfo nsi;
					XmlNodeElement * p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_NSTAT = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_NSTAT);
					if (p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_NSTAT != NULL) {
						analyzeNStatInfo(*p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_NSTAT, nsi);
					}

					SubInfo si;
					XmlNodeElement * p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_SUB = p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE->findChildElementWithName(XML_SRV_RL_ZZ_NODES_NODE_SUB);
					if (p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_SUB != NULL) {
						analyzeSubInfo(*p_xne_s_RL_SESSION_CONTEXT_SYB_NODES_NODE_SUB, si);
					}

					pciContext.addChild(ContextSegment(idTemplate, idConfig, strNameHere, flagMultinode, nsi, si), ici);
				}
			}
			i++;
		}
	}
}
void XGDaemonClient::analyzeSubInfo(const XmlNodeElement & xneRL_ZZ_SUB, SubInfo & si) const {
	si.clear();

	XmlNodeElement * p_xneRL_ZZ_SUB_ADDED = xneRL_ZZ_SUB.findChildElementWithName(XML_SRV_RL_ZZ_SUB_ADDED);
	if (p_xneRL_ZZ_SUB_ADDED != NULL) {
		si.setFlagHasAddedChildren(p_xneRL_ZZ_SUB_ADDED->get1InternalText_Bool(false));
	}

	XmlNodeElement * p_xneRL_ZZ_SUB_CHANGED = xneRL_ZZ_SUB.findChildElementWithName(XML_SRV_RL_ZZ_SUB_CHANGED);
	if (p_xneRL_ZZ_SUB_CHANGED != NULL) {
		si.setFlagHasChangedChildren(p_xneRL_ZZ_SUB_CHANGED->get1InternalText_Bool(false));
	}

	XmlNodeElement * p_xneRL_ZZ_SUB_DELETED = xneRL_ZZ_SUB.findChildElementWithName(XML_SRV_RL_ZZ_SUB_DELETED);
	if (p_xneRL_ZZ_SUB_DELETED != NULL) {
		si.setFlagHasDeletedChildren(p_xneRL_ZZ_SUB_DELETED->get1InternalText_Bool(false));
	}

	XmlNodeElement * p_xneRL_ZZ_SUB_INVALID = xneRL_ZZ_SUB.findChildElementWithName(XML_SRV_RL_ZZ_SUB_INVALID);
	if (p_xneRL_ZZ_SUB_INVALID != NULL) {
		si.setFlagHasInvalidChildren(p_xneRL_ZZ_SUB_INVALID->get1InternalText_Bool(false));
	}

	XmlNodeElement * p_xneRL_ZZ_SUB_MISSING_REQUIRED = xneRL_ZZ_SUB.findChildElementWithName(XML_SRV_RL_ZZ_SUB_MISSING_REQUIRED);
	if (p_xneRL_ZZ_SUB_MISSING_REQUIRED != NULL) {
		si.setFlagHasMissingRequiredChildren(p_xneRL_ZZ_SUB_MISSING_REQUIRED->get1InternalText_Bool(false));
	}
}

void XGDaemonClient::generateXMLForAction(XmlNodeElement & xne_c_RL, const std::string & strAction) const {
	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(strAction);
}

void XGDaemonClient::generateXMLForContext(
		XmlNodeElement & xne_c_RL,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsConfig,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsTemplate) const {

	XmlNodeElement & xne_c_RL_CONTEXT = xne_c_RL.addChildElement(XML_CLT_RL_CONTEXT);
	XmlNodeElement & xne_c_RL_CONTEXT_PATH = xne_c_RL_CONTEXT.addChildElement(XML_CLT_RL_CONTEXT_PATH);
	xne_c_RL_CONTEXT_PATH.addText(strContext);

	if (p_mapFieldsConfig != NULL || p_mapFieldsTemplate != NULL) generateXMLForContextFields(xne_c_RL_CONTEXT, p_mapFieldsConfig, p_mapFieldsTemplate);
}
void XGDaemonClient::generateXMLForContextFields(
		XmlNodeElement & xne_c_RL_CONTEXT,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsConfig,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsTemplate) const {

	XmlNodeElement & xne_c_RL_CONTEXT_SYB_NODES = xne_c_RL_CONTEXT.addChildElement(XML_CLT_RL_CONTEXT_SYB_NODES);

	if (p_mapFieldsConfig != NULL) {
		std::map<unsigned long, OpVal, std::greater<unsigned long> >::const_iterator i = p_mapFieldsConfig->begin();
		const std::map<unsigned long, OpVal, std::greater<unsigned long> >::const_iterator iEnd = p_mapFieldsConfig->end();

		while (i != iEnd) {
			unsigned long idConfig = i->first;
			const std::string & strOp = i->second.getConstOperator();
			const std::string & strValue = i->second.getConstValue();

			XmlNodeElement & xne_c_RL_CONTEXT_SYB_NODES_NODE = xne_c_RL_CONTEXT_SYB_NODES.addChildElement(XML_CLT_RL_ZZ_NODES_NODE);

			XmlNodeElement & xne_c_RL_CONTEXT_SYB_NODES_NODE_CONFIG_ID = xne_c_RL_CONTEXT_SYB_NODES_NODE.addChildElement(XML_CLT_RL_ZZ_NODES_NODE_CONFIG_ID);
			xne_c_RL_CONTEXT_SYB_NODES_NODE_CONFIG_ID.addText(XGDaemonUtil::getStrReprUL_Hex(idConfig, true));

			if (strOp.length() > 0) {
				XmlNodeElement & xne_c_RL_CONTEXT_SYB_NODES_NODE_OP = xne_c_RL_CONTEXT_SYB_NODES_NODE.addChildElement(XML_CLT_RL_ZZ_NODES_NODE_OP);
				xne_c_RL_CONTEXT_SYB_NODES_NODE_OP.addText(strOp);
			}
			if (strValue.length() > 0) {
				XmlNodeElement & xne_c_RL_CONTEXT_SYB_NODES_NODE_VALUE = xne_c_RL_CONTEXT_SYB_NODES_NODE.addChildElement(XML_CLT_RL_ZZ_NODES_NODE_VALUE);
				xne_c_RL_CONTEXT_SYB_NODES_NODE_VALUE.addText(strValue);
			}
			i++;
		}
	}

	if (p_mapFieldsTemplate != NULL) {
		std::map<unsigned long, OpVal, std::greater<unsigned long> >::const_iterator i = p_mapFieldsTemplate->begin();
		const std::map<unsigned long, OpVal, std::greater<unsigned long> >::const_iterator iEnd = p_mapFieldsTemplate->end();

		while (i != iEnd) {
			unsigned long idTemplate = i->first;
			const std::string & strOp = i->second.getConstOperator();
			const std::string & strValue = i->second.getConstValue();

			XmlNodeElement & xne_c_RL_CONTEXT_SYB_NODES_NODE = xne_c_RL_CONTEXT_SYB_NODES.addChildElement(XML_CLT_RL_ZZ_NODES_NODE);

			XmlNodeElement & xne_c_RL_CONTEXT_SYB_NODES_NODE_TEMPLATE_ID = xne_c_RL_CONTEXT_SYB_NODES_NODE.addChildElement(XML_CLT_RL_ZZ_NODES_NODE_TEMPLATE_ID);
			xne_c_RL_CONTEXT_SYB_NODES_NODE_TEMPLATE_ID.addText(XGDaemonUtil::getStrReprUL_Hex(idTemplate, true));

			if (strOp.length() > 0) {
				XmlNodeElement & xne_c_RL_CONTEXT_SYB_NODES_NODE_OP = xne_c_RL_CONTEXT_SYB_NODES_NODE.addChildElement(XML_CLT_RL_ZZ_NODES_NODE_OP);
				xne_c_RL_CONTEXT_SYB_NODES_NODE_OP.addText(strOp);
			}
			if (strValue.length() > 0) {
				XmlNodeElement & xne_c_RL_CONTEXT_SYB_NODES_NODE_VALUE = xne_c_RL_CONTEXT_SYB_NODES_NODE.addChildElement(XML_CLT_RL_ZZ_NODES_NODE_VALUE);
				xne_c_RL_CONTEXT_SYB_NODES_NODE_VALUE.addText(strValue);
			}
			i++;
		}
	}
}
void XGDaemonClient::generateXMLForSepFields(XmlNodeElement & xne_c_RL, const std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep) const {
	XmlNodeElement & xne_c_RL_SEP_NODES = xne_c_RL.addChildElement(XML_CLT_RL_SEP_NODES);
	
	std::map<std::string, std::string, std::greater<std::string> >::const_iterator i = mapFieldsSep.begin();
	const std::map<std::string, std::string, std::greater<std::string> >::const_iterator iEnd = mapFieldsSep.end();

	while (i != iEnd) {
		const std::string & strPath = i->first;
		const std::string & strValue = i->second;

		XmlNodeElement & xne_c_RL_SEP_NODES_NODE = xne_c_RL_SEP_NODES.addChildElement(XML_CLT_RL_ZZ_NODES_NODE);
		
		XmlNodeElement & xne_c_RL_SEP_NODES_NODE_PATH = xne_c_RL_SEP_NODES_NODE.addChildElement(XML_CLT_RL_SEP_NODES_NODE_PATH);
		xne_c_RL_SEP_NODES_NODE_PATH.addText(strPath);

		XmlNodeElement & xne_c_RL_SEP_NODES_NODE_VALUE = xne_c_RL_SEP_NODES_NODE.addChildElement(XML_CLT_RL_ZZ_NODES_NODE_VALUE);
		xne_c_RL_SEP_NODES_NODE_VALUE.addText(strValue);
		
		i++;
	}	
}
void XGDaemonClient::generateXMLForSession(XmlNodeElement & xne_c_RL, const SessionId & siSession) const {
	XmlNodeElement & xne_c_RL_SESSION = xne_c_RL.addChildElement(XML_CLT_RL_SESSION);

	XmlNodeElement & xne_c_RL_SESSION_ID = xne_c_RL_SESSION.addChildElement(XML_CLT_RL_SESSION_ID);
	xne_c_RL_SESSION_ID.addText(siSession.getStr());
}
void XGDaemonClient::prepareRequestActionAbsRemoveCommit(
	XmlInfo & xiRequest,
	const SessionId & siSession,
	const std::string & strContext,
	const std::string & strPathEscaped) {

	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);
	
	generateXMLForSession(xne_c_RL, siSession);
	generateXMLForContext(xne_c_RL, strContext, NULL, NULL);

	XmlNodeElement & xne_c_RL_ACTION = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RL_ACTION.addText(ACTION_ABS_REMOVE_COMMIT);

	XmlNodeElement & xne_c_RL_REMOVE = xne_c_RL.addChildElement(XML_CLT_RL_REMOVE);
	xne_c_RL_REMOVE.addText(strPathEscaped);
}
void XGDaemonClient::prepareRequestActionAdd(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, unsigned long idTemplateAdd, const std::string & strFieldValue, const std::string & strFieldOp) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	generateXMLForContext(xne_c_RL, strContext, NULL, NULL);
	generateXMLForSession(xne_c_RL, siSession);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_ADD);

	XmlNodeElement & xne_c_RLAdd = xne_c_RL.addChildElement(XML_CLT_RL_ADD);

	XmlNodeElement & xne_RL_ADD_TEMPLATE_ID = xne_c_RLAdd.addChildElement(XML_CLT_RL_ADD_TEMPLATE_ID);
	xne_RL_ADD_TEMPLATE_ID.addText(XGDaemonUtil::getStrReprUL_Hex(idTemplateAdd, true));

	if (strFieldOp.length() > 0) {
		XmlNodeElement & xne_RL_ADD_OP = xne_c_RLAdd.addChildElement(XML_CLT_RL_ADD_OP);
		xne_RL_ADD_OP.addText(strFieldOp);
	}
	if (strFieldValue.length() > 0) {
		XmlNodeElement & xne_RL_ADD_VALUE = xne_c_RLAdd.addChildElement(XML_CLT_RL_ADD_VALUE);
		xne_RL_ADD_VALUE.addText(strFieldValue);
	}
}

void XGDaemonClient::prepareRequestActionChContext(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext) const {

	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_CH_CONTEXT);

	generateXMLForContext(xne_c_RL, strContext, NULL, NULL);
	generateXMLForSession(xne_c_RL, siSession);
}
void XGDaemonClient::prepareRequestActionCommit(
	XmlInfo & xiRequest,
	const SessionId & siSession,
	const std::string & strContext,
	const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsExistant,
	const std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep) const {

	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_COMMIT);

	generateXMLForSession(xne_c_RL, siSession);
	generateXMLForContext(xne_c_RL, strContext, &mapFieldsExistant, NULL);
	generateXMLForSepFields(xne_c_RL, mapFieldsSep);
	
}
void XGDaemonClient::prepareRequestActionExecCmd(XmlInfo & xiRequest, const SessionId & siSession, unsigned long command_id) {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_EXEC_CMD_ID);

	XmlNodeElement & xne_c_RL_EXEC_CMD = xne_c_RL.addChildElement(XML_CLT_RL_EXEC_CMD);
	XmlNodeElement & xne_c_RL_EXEC_CMD_COMMAND_ID = xne_c_RL_EXEC_CMD.addChildElement(XML_CLT_RL_EXEC_CMD_COMMAND_ID);

	xne_c_RL_EXEC_CMD_COMMAND_ID.addText(XGDaemonUtil::getStrReprUL_Hex(command_id, true));
	generateXMLForSession(xne_c_RL, siSession);
}

void XGDaemonClient::prepareRequestActionExecCmd_s_static_routes_ipv4(XmlInfo & xiRequest, const SessionId & siSession) {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_EXEC_CMD_S_SR4U);

	generateXMLForSession(xne_c_RL, siSession);
}

void XGDaemonClient::prepareRequestActionExecCmdArgs(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const unsigned long command_id,
		const std::map<unsigned int, std::string> & mapArgs)
	{
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_EXEC_CMD_ARGS_ID);

	XmlNodeElement & xne_c_RL_EXEC_CMD = xne_c_RL.addChildElement(XML_CLT_RL_EXEC_CMD);
	XmlNodeElement & xne_c_RL_EXEC_CMD_COMMAND_ID = xne_c_RL_EXEC_CMD.addChildElement(XML_CLT_RL_EXEC_CMD_COMMAND_ID);

	xne_c_RL_EXEC_CMD_COMMAND_ID.addText(XGDaemonUtil::getStrReprUL_Hex(command_id, true));

	XmlNodeElement & xne_c_RL_EXEC_CMD_ARGS = xne_c_RL_EXEC_CMD.addChildElement(XML_CLT_RL_EXEC_CMD_ARGS);

	std::map<unsigned int, std::string>::const_iterator i = mapArgs.begin();
	const std::map<unsigned int, std::string>::const_iterator iEnd = mapArgs.end();
	while (i != iEnd) {
		const unsigned int number = i->first;
		const std::string & strArg = i->second;

		XmlNodeElement & xne_c_RL_EXEC_CMD_ARGS_ARG = xne_c_RL_EXEC_CMD_ARGS.addChildElement(XML_CLT_RL_EXEC_CMD_ARGS_ARG);

		XmlNodeElement & xne_c_RL_EXEC_CMD_ARGS_ARG_NUM = xne_c_RL_EXEC_CMD_ARGS_ARG.addChildElement(XML_CLT_RL_EXEC_CMD_ARGS_ARG_NUM);
		xne_c_RL_EXEC_CMD_ARGS_ARG_NUM.addText(XGDaemonUtil::getStrReprUInt(number));

		XmlNodeElement & xne_c_RL_EXEC_CMD_ARGS_ARG_VALUE = xne_c_RL_EXEC_CMD_ARGS_ARG.addChildElement(XML_CLT_RL_EXEC_CMD_ARGS_ARG_VALUE);
		xne_c_RL_EXEC_CMD_ARGS_ARG_VALUE.addText(strArg);
		
		i++;
	}

	generateXMLForSession(xne_c_RL, siSession);
}
void XGDaemonClient::prepareRequestActionExecKill(XmlInfo & xiRequest, const SessionId & siSessionRequest, const unsigned long idExec) {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_EXEC_KILL);

	XmlNodeElement & xne_c_RL_EXEC_KILL = xne_c_RL.addChildElement(XML_CLT_RL_EXEC_KILL);
	XmlNodeElement & xne_c_RL_EXEC_KILL_EXEC_ID = xne_c_RL_EXEC_KILL.addChildElement(XML_CLT_RL_EXEC_KILL_EXEC_ID);

	xne_c_RL_EXEC_KILL_EXEC_ID.addText(XGDaemonUtil::getStrReprUL_Hex(idExec, true));

	generateXMLForSession(xne_c_RL, siSessionRequest);	
}
void XGDaemonClient::prepareRequestActionExecQuery(XmlInfo & xiRequest, const SessionId & siSessionRequest, const unsigned long command_id) {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_EXEC_QUERY_ID);

	XmlNodeElement & xne_c_RL_EXEC_QUERY = xne_c_RL.addChildElement(XML_CLT_RL_EXEC_QUERY);
	XmlNodeElement & xne_c_RL_EXEC_QUERY_COMMAND_ID = xne_c_RL_EXEC_QUERY.addChildElement(XML_CLT_RL_EXEC_QUERY_COMMAND_ID);

	xne_c_RL_EXEC_QUERY_COMMAND_ID.addText(XGDaemonUtil::getStrReprUL_Hex(command_id, true));

	generateXMLForSession(xne_c_RL, siSessionRequest);
}

void XGDaemonClient::prepareRequestActionExecStatus(XmlInfo & xiRequest, const SessionId & siSessionRequest, const unsigned long idExec) {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_EXEC_STATUS);

	XmlNodeElement & xne_c_RL_EXEC_STATUS = xne_c_RL.addChildElement(XML_CLT_RL_EXEC_STATUS);
	XmlNodeElement & xne_c_RL_EXEC_STATUS_EXEC_ID = xne_c_RL_EXEC_STATUS.addChildElement(XML_CLT_RL_EXEC_STATUS_EXEC_ID);
	xne_c_RL_EXEC_STATUS_EXEC_ID.addText(XGDaemonUtil::getStrReprUL_Hex(idExec, true));

	generateXMLForSession(xne_c_RL, siSessionRequest);
}
void XGDaemonClient::prepareRequestActionExecutionsStatus(XmlInfo & xiRequest, const SessionId & siSessionRequest) {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_EXECS_STATUS);

	generateXMLForSession(xne_c_RL, siSessionRequest);
}

void XGDaemonClient::prepareRequestActionGetSession(XmlInfo & xiRequest, const SessionId & siSessionRequest) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);
	generateXMLForAction(xne_c_RL, ACTION_GET_SESSION);
	generateXMLForSession(xne_c_RL, siSessionRequest);
}
void XGDaemonClient::prepareRequestActionGetSystem(XmlInfo & xiRequest, const SessionId & siSessionRequest) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);
	generateXMLForAction(xne_c_RL, ACTION_GET_SYSTEM);
	generateXMLForSession(xne_c_RL, siSessionRequest);
}

/*
void XGDaemonClient::prepareRequestActionInitialize(XmlInfo & xiRequest, const std::string & strContext) const {

	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_INITIALIZE);

	generateXMLForContext(xne_c_RL, strContext);
}
*/
void XGDaemonClient::prepareRequestActionLoadOrSave(bool flagLoadOrSave, XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, const std::string & strFilespec) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(flagLoadOrSave ? ACTION_LOAD : ACTION_SAVE);

	XmlNodeElement & xne_c_RLFilespec = xne_c_RL.addChildElement(XML_CLT_RL_FILESPEC);
	xne_c_RLFilespec.addText(strFilespec);

	generateXMLForContext(xne_c_RL, strContext, NULL, NULL);
	generateXMLForSession(xne_c_RL, siSession);
}
void XGDaemonClient::prepareRequestActionLogin(XmlInfo & xiRequest, const std::string & strUser, const std::string & strPwd, const std::string & strContext) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_LOGIN);

	XmlNodeElement & xne_c_RLAuth = xne_c_RL.addChildElement(XML_CLT_RL_AUTH);
	XmlNodeElement & xne_c_RLAuthUser = xne_c_RLAuth.addChildElement(XML_CLT_RL_AUTH_USER);
	xne_c_RLAuthUser.addText(strUser);

	XmlNodeElement & xne_c_RLAuthPwd = xne_c_RLAuth.addChildElement(XML_CLT_RL_AUTH_PWD);
	xne_c_RLAuthPwd.addText(strPwd);
	
	generateXMLForContext(xne_c_RL, strContext, NULL, NULL);
}
void XGDaemonClient::prepareRequestActionLogout(XmlInfo & xiRequest, const SessionId & siSession) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_LOGOUT);

	generateXMLForSession(xne_c_RL, siSession);
}
void XGDaemonClient::prepareRequestActionOpCommands(XmlInfo & xiRequest, const SessionId & siSession) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	generateXMLForSession(xne_c_RL, siSession);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_OP_COMMANDS);
	
}
void XGDaemonClient::prepareRequestActionRemove(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, const std::string & strFieldNameRemove) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	generateXMLForContext(xne_c_RL, strContext, NULL, NULL);
	generateXMLForSession(xne_c_RL, siSession);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_REMOVE);

	XmlNodeElement & xne_c_RLRemove = xne_c_RL.addChildElement(XML_CLT_RL_REMOVE);
	xne_c_RLRemove.addText(strFieldNameRemove);
}

void XGDaemonClient::prepareRequestActionResetCommit(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_RESET_COMMIT);

	generateXMLForContext(xne_c_RL, strContext, NULL, NULL);
	generateXMLForSession(xne_c_RL, siSession);	
}
void XGDaemonClient::prepareRequestActionRevert(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_REVERT);

	generateXMLForContext(xne_c_RL, strContext, NULL, NULL);
	generateXMLForSession(xne_c_RL, siSession);		
}
void XGDaemonClient::prepareRequestActionSubmitSet(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsConfig,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > * p_mapFieldsTemplate) const {

	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	if (p_mapFieldsConfig != NULL) {
		xne_c_RLAction.addText(ACTION_SUBMIT);
	} else {
		xne_c_RLAction.addText(ACTION_SET);
	}

	generateXMLForContext(xne_c_RL, strContext, p_mapFieldsConfig, p_mapFieldsTemplate);
	generateXMLForSession(xne_c_RL, siSession);
}

void XGDaemonClient::prepareRequestActionSysAddUser(
		XmlInfo & xiRequest,
		const SessionId & siSession,
		const std::string & strUser,
		const std::string & strPwd) {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_SYS_ADD_USER);

	XmlNodeElement & xne_c_RLAuth = xne_c_RL.addChildElement(XML_CLT_RL_AUTH);
	XmlNodeElement & xne_c_RLAuthUser = xne_c_RLAuth.addChildElement(XML_CLT_RL_AUTH_USER);
	xne_c_RLAuthUser.addText(strUser);

	XmlNodeElement & xne_c_RLAuthPwd = xne_c_RLAuth.addChildElement(XML_CLT_RL_AUTH_PWD);
	xne_c_RLAuthPwd.addText(strPwd);

	generateXMLForSession(xne_c_RL, siSession);
}

void XGDaemonClient::prepareRequestActionTest(XmlInfo & xiRequest, const std::string & strTest) {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_TEST);

	XmlNodeElement & xne_c_RLTest = xne_c_RL.addChildElement(XML_CLT_RL_TEST);
	xne_c_RLTest.addText(strTest);	
}

void XGDaemonClient::prepareRequestActionUndelete(XmlInfo & xiRequest, const SessionId & siSession, const std::string & strContext, unsigned long idConfigUndelete, const std::string & strFieldValue, const std::string & strFieldOp) const {
	XmlNodeElement & xne_c_RL = xiRequest.setRootElement(XML_CLT_RL);

	generateXMLForContext(xne_c_RL, strContext, NULL, NULL);
	generateXMLForSession(xne_c_RL, siSession);

	XmlNodeElement & xne_c_RLAction = xne_c_RL.addChildElement(XML_CLT_RL_ACTION);
	xne_c_RLAction.addText(ACTION_UNDELETE);

	XmlNodeElement & xne_c_RL_UNDELETE = xne_c_RL.addChildElement(XML_CLT_RL_UNDELETE);

	XmlNodeElement & xne_c_RL_UNDELETE_CONFIG_ID = xne_c_RL_UNDELETE.addChildElement(XML_CLT_RL_UNDELETE_CONFIG_ID);
	xne_c_RL_UNDELETE_CONFIG_ID.addText(XGDaemonUtil::getStrReprUL_Hex(idConfigUndelete, true));

	if (strFieldOp.length() > 0) {
		XmlNodeElement & xne_c_RL_UNDELETE_OP = xne_c_RL_UNDELETE.addChildElement(XML_CLT_RL_UNDELETE_OP);
		xne_c_RL_UNDELETE_OP.addText(strFieldOp);
	}
	if (strFieldValue.length() > 0) {
		XmlNodeElement & xne_c_RL_UNDELETE_VALUE = xne_c_RL_UNDELETE.addChildElement(XML_CLT_RL_UNDELETE_VALUE);
		xne_c_RL_UNDELETE_VALUE.addText(strFieldValue);
	}
}


