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
 *  Module:       test_client.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Test-app used for test-sending commands to xgdaemon
 *
 */


#ifndef	__INCLUDE_TEST_CLIENT_HH__
#define __INCLUDE_TEST_CLIENT_HH__

#include "xgdaemon_client.hh"
#include "common/session_id.hh"


#define USE_CASE_ADD					"Add a new configuration node by template ID"
#define USE_CASE_CH_CONTEXT				"Change context"
#define USE_CASE_GET_SESSION				"Obtain session information only"
#define USE_CASE_LOGIN					"Login"
#define USE_CASE_EXEC_CMD_S_STATIC_ROUTES_IPV4		"Execute operational mode command to obtain static routes"
#define USE_CASE_EXEC_STATUS				"Obtain operational mode command execution status"
#define	USE_CASE_GET_SYSTEM				"Obtain real-time system information only"
#define USE_CASE_OP_COMMANDS				"Obtain a listing of all available operational mode commands"
#define USE_CASE_SET					"Set configuration node(s) by template ID"
#define USE_CASE_SUBMIT					"Set configuration node(s) by config ID"
#define USE_CASE_SYS_ADD_USER				"Add a new user account to the system"


class TestClient : public XGDaemonClient {
public:
	TestClient();

	bool demonstrateUseCaseAdd(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const unsigned long idTemplateFieldAdd,
		const std::string & strFieldValue);

	bool demonstrateUseCaseChContext(
		const SessionId & siSessionRequest,
		const std::string & strContext);

	bool demonstrateUseCaseChContext(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		SRExchangeInfo & srei,
		ContextLocation & clContext);

	bool demonstrateUseCaseExecCmd_s_static_routes_ipv4(
		const SessionId & siSessionRequest,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi);

	bool demonstrateUseCaseExecStatus(
		const SessionId & siSessionRequest,
		const unsigned long idExec);
	bool demonstrateUseCaseGetSession(const SessionId & siSessionRequest);
	bool demonstrateUseCaseGetSystem(const SessionId & siSessionRequest);
	bool demonstrateUseCaseLogin(
		const std::string & strUser,
		const std::string & strPwd,
		const std::string & strContext,
		ClientSessionInfo & siSession);

	bool demonstrateUseCaseOpCommands(const SessionId & siSessionRequest);

	bool demonstrateUseCaseSet(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsTemplate);

	bool demonstrateUseCaseSet(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsTemplate,
		SRExchangeInfo & srei,
		ContextLocation & clContext);

	bool demonstrateUseCaseSubmit(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsConfig);

	bool demonstrateUseCaseSubmit(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsConfig,
		SRExchangeInfo & srei,
		ContextLocation & clContext);

	bool demonstrateUseCaseSysAddUser(
		const SessionId & siSessionRequest,
		const std::string & strUser,
		const std::string & strPwd);

	void printStats(
		const ClientSessionInfo & siSession,
		const ContextLocation & clContext,
		const ErrorInfo & eiError);

	void printUseCase(const std::string & strAction, const SRExchangeInfo &srei);

	void runTest();
	void runTest2();
	void runTest3(ClientSessionInfo & siSession);
	void runTest4(ClientSessionInfo & siSession);
	void runTest5(ClientSessionInfo & siSession);
};


#endif

