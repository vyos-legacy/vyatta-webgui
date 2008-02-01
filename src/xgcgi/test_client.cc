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
 *  Module:       test_client.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Test-app used for test-sending commands to xgdaemon
 *
 */



#include <iostream>
#include <map>
#include <string>

#include "test_client.hh"

#include "basic/xgdaemon_util.hh"
#include "common/error_info.hh"
#include "common/misc_util.hh"
#include "common/opcmd_info.hh"

TestClient::TestClient() {
}

bool TestClient::demonstrateUseCaseAdd(
	const SessionId & siSessionRequest,
	const std::string & strContext,
	const unsigned long idTemplateFieldAdd,
	const std::string & strFieldValue) {

	SRExchangeInfo     srei;
	ContextLocation    clContext;
	ClientSessionInfo  siSession;
	ErrorInfo          eiError;

	if (doActionAdd(
		srei,
		siSessionRequest,
		strContext,
		idTemplateFieldAdd,
		strFieldValue,
		"",
		siSession,
		clContext,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_ADD, srei);
	return true;
	
}
bool TestClient::demonstrateUseCaseChContext(
	const SessionId & siSessionRequest,
	const std::string & strContext) {

	SRExchangeInfo     srei;
	ContextLocation    clContext;

	return demonstrateUseCaseChContext(siSessionRequest, strContext, srei, clContext);
}
bool TestClient::demonstrateUseCaseChContext(
	const SessionId & siSessionRequest,
	const std::string & strContext,
	SRExchangeInfo & srei,
	ContextLocation & clContext) {

	ClientSessionInfo  siSession;
	ErrorInfo          eiError;

	if (doActionChContext(
		srei,
		siSessionRequest,
		strContext,
		siSession,
		clContext,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_CH_CONTEXT, srei);
	return true;	
}
bool TestClient::demonstrateUseCaseExecCmd_s_static_routes_ipv4(
		const SessionId & siSessionRequest,
		ClientBriefExecStatusInfo & cbesi,
		DetailedExecStatusInfo & desi)
	{

	SRExchangeInfo     srei;
	ClientSessionInfo  siSession;
	ErrorInfo          eiError;

	if (doActionExecCmd_s_static_routes_ipv4(
		srei,
		siSessionRequest,
		siSession,
		cbesi,
		desi,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_EXEC_CMD_S_STATIC_ROUTES_IPV4, srei);
	return true;
}
bool TestClient::demonstrateUseCaseExecStatus(
	const SessionId & siSessionRequest,
	const unsigned long idExec) {

	SRExchangeInfo			srei;
	ClientSessionInfo		siSession;
	ClientBriefExecStatusInfo	cbesi;
	DetailedExecStatusInfo		desi;
	ErrorInfo			eiError;

	if (doActionExecStatus(
		srei,
		siSessionRequest,
		idExec,
		siSession,
		cbesi,
		desi,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_EXEC_STATUS, srei);
	return true;

}
bool TestClient::demonstrateUseCaseGetSession(const SessionId & siSessionRequest) {

	SRExchangeInfo     srei;
	ClientSessionInfo  siSession;
	ErrorInfo          eiError;

	if (doActionGetSession(
		srei,
		siSessionRequest,
		siSession,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_GET_SESSION, srei);
	return true;
}
bool TestClient::demonstrateUseCaseGetSystem(const SessionId & siSessionRequest) {

	SRExchangeInfo     srei;
	ClientSessionInfo  siSession;
	ErrorInfo          eiError;

	if (doActionGetSystem(
		srei,
		siSessionRequest,
		siSession,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_GET_SYSTEM, srei);
	return true;
}
bool TestClient::demonstrateUseCaseLogin(
	const std::string & strUser,
	const std::string & strPwd,
	const std::string & strContext,
	ClientSessionInfo & siSession) {

	SRExchangeInfo     srei;
	ContextLocation    clContext;
	ErrorInfo          eiError;

	if (doActionLogin(
		srei,
		strUser,
		strPwd,
		strContext,
		siSession,
		clContext,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_LOGIN, srei);
	return true;
}
bool TestClient::demonstrateUseCaseOpCommands(const SessionId & siSessionRequest) {
	SRExchangeInfo     srei;
	ClientSessionInfo  siSession;
	ClientOpCmds       oc;
	ErrorInfo          eiError;

	if (doActionOpCommands(
		srei,
		siSessionRequest,
		siSession,
		oc,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_OP_COMMANDS, srei);
	return true;
}
bool TestClient::demonstrateUseCaseSet(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsTemplate) {

	SRExchangeInfo     srei;
	ContextLocation    clContext;
	
	return demonstrateUseCaseSet(siSessionRequest, strContext, mapFieldsTemplate, srei, clContext);
}
bool TestClient::demonstrateUseCaseSet(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsTemplate,
		SRExchangeInfo & srei,
		ContextLocation & clContext) {

	ClientSessionInfo  siSession;
	ErrorInfo          eiError;

	if (doActionSet(
		srei,
		siSessionRequest,
		strContext,
		mapFieldsTemplate,
		siSession,
		clContext,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_SET, srei);
	return true;			
}
bool TestClient::demonstrateUseCaseSubmit(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsConfig) {

	SRExchangeInfo     srei;
	ContextLocation    clContext;

	return demonstrateUseCaseSubmit(siSessionRequest, strContext, mapFieldsConfig, srei, clContext);
}
bool TestClient::demonstrateUseCaseSubmit(
		const SessionId & siSessionRequest,
		const std::string & strContext,
		const std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsConfig,
		SRExchangeInfo & srei,
		ContextLocation & clContext) {

	ClientSessionInfo  siSession;
	ErrorInfo          eiError;

	if (doActionSubmit(
		srei,
		siSessionRequest,
		strContext,
		mapFieldsConfig,
		siSession,
		clContext,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_SUBMIT, srei);
	return true;
}
bool TestClient::demonstrateUseCaseSysAddUser(
	const SessionId & siSessionRequest,
	const std::string & strUser,
	const std::string & strPwd) {

	SRExchangeInfo     srei;
	ClientSessionInfo  siSession;
	ClientOpCmds       oc;
	ErrorInfo          eiError;

	if (doActionSysAddUser(
		srei,
		siSessionRequest,
		strUser,
		strPwd,
		siSession,
		eiError) == false) return false;
	srei.trimText();

	printUseCase(USE_CASE_SYS_ADD_USER, srei);
	return true;
}

void TestClient::printStats(
		const ClientSessionInfo & siSession,
		const ContextLocation & clContext,
		const ErrorInfo & eiError) {

			
	std::cout << "    session_id    = " << siSession.getConstSessionId().getStr() << std::endl;
	std::cout << "    phase         = " << siSession.getConstSessionStatus().getPhase() << std::endl;
	std::cout << "    total cycles  = " << siSession.getConstSessionStatus().getTotalCycles() << std::endl;
	std::cout << "    context       = " << clContext.getPathRepr(false) << std::endl;
	std::cout << "    error code    = " << eiError.getCodeError() << std::endl;
	std::cout << "    error desc    = " << eiError.getDesc() << std::endl;
}

void TestClient::printUseCase(const std::string & strAction, const SRExchangeInfo &srei) {
	std::cout << "------ Use case: " << strAction << std::endl;
	std::cout << "------ Send:" << std::endl;
	std::cout << srei.m_xiSend.getXMLRepr(true, 8);
	std::cout << "------ Receive:" << std::endl;
	std::cout << srei.m_xiReceive.getXMLRepr(true, 8);
	std::cout << "-" << std::endl << std::endl;
}

void TestClient::runTest() {
	std::string strTestResponse;


	ClientSessionInfo  siSession;
	ContextLocation    clContext;
	ErrorInfo          eiError;


	SRExchangeInfo srei;
	
	bool flagAL = doActionLoginCycle(srei, "", "", "/", siSession, clContext, eiError, 4);
	std::cout << "*** flagAL        = " << flagAL << std::endl;
	printStats(siSession, clContext, eiError);


	bool flagACC = doActionChContext(srei, siSession.getConstSessionId(), "/interfaces/interface: eth0", siSession, clContext, eiError);
	std::cout << "*** flagACC       = " << flagACC << std::endl;
	printStats(siSession, clContext, eiError);


	ParentContextInfo pciContext(clContext);
	analyzeParentContextInfo(srei.m_xiReceive, pciContext);


	const ChildContextInfo * p_cciDescription = pciContext.findChildByName("description");
	const ChildContextInfo * p_cciMtu = pciContext.findChildByName("mtu");

	if (p_cciDescription != NULL && p_cciMtu != NULL) {
		std::map<unsigned long, OpVal, std::greater<unsigned long> > mapFieldsTemplates;
		mapFieldsTemplates[p_cciDescription->getIdTemplate()].setValue("testing123");
		mapFieldsTemplates[p_cciMtu->getIdTemplate()].setValue("700");

		bool flagAS = doActionSet(srei, siSession.getConstSessionId(), "/interfaces/interface: eth0", mapFieldsTemplates, siSession, clContext, eiError);
		std::cout << "*** flagAS        = " << flagAS << std::endl;
		printStats(siSession, clContext, eiError);
	}


	doActionGetSession(srei, siSession.getConstSessionId(), siSession, eiError);
	printStats(siSession, clContext, eiError);

	doActionGetSystem(srei, siSession.getConstSessionId(), siSession, eiError);
	printStats(siSession, clContext, eiError);

}

void TestClient::runTest2() {
	XmlInfo xiTest;
	xiTest.pushElement("root");
	xiTest.pushElement("a");
	xiTest.pushElement("b");
	xiTest.pushElement("c");
	xiTest.pushElement("d");
	xiTest.pushElement("e");
	xiTest.pushElement("f");

	xiTest.appendInternalText("this is a <test>.");

	std::string str;
	xiTest.generateXML(str, true, 0);
	std::cout << "str: " << std::endl << str << std::endl;


	XmlInfo xiInput;
	XmlParseStatus xstatus;
	XmlParser::parse(str, xiInput, xstatus);

	xiInput.trimText();

	xiInput.print();

	std::string str2;
	xiInput.generateXML(str2, true, 0);
	std::cout << "str2: " << std::endl << str2 << std::endl;
}

void TestClient::runTest3(ClientSessionInfo & siSession) {
	SRExchangeInfo   srei1;
	ContextLocation  clContext1;
	demonstrateUseCaseChContext(siSession.getConstSessionId(), "/interfaces/interface: eth0", srei1, clContext1);

	ParentContextInfo pci1(clContext1);
	analyzeParentContextInfo(srei1.m_xiReceive, pci1);

	const ChildContextInfo * p_cci1 = pci1.findChildByName("description");
	if  (p_cci1 != NULL) {
		std::map<unsigned long, OpVal, std::greater<unsigned long> > mapFieldsTemplate;
		mapFieldsTemplate[p_cci1->getIdTemplate()].setValue("testing123");
		
		SRExchangeInfo   srei2;
		ContextLocation  clContext2;			
		demonstrateUseCaseSet(siSession.getConstSessionId(), "/interfaces/interface: eth0", mapFieldsTemplate, srei2, clContext2);
		
		ParentContextInfo pci2(clContext2);
		analyzeParentContextInfo(srei2.m_xiReceive, pci2);

		const ChildContextInfo * p_cci2 = pci2.findChildByName("description");
		if  (p_cci2 != NULL) {
			std::map<unsigned long, OpVal, std::greater<unsigned long> > mapFieldsConfig;
			mapFieldsConfig[p_cci2->getIdConfig()].setValue("testing456");
			
			SRExchangeInfo   srei3;
			ContextLocation  clContext3;			
			demonstrateUseCaseSubmit(siSession.getConstSessionId(), "/interfaces/interface: eth0", mapFieldsConfig, srei3, clContext3);

			ParentContextInfo pci3(clContext2);
			analyzeParentContextInfo(srei3.m_xiReceive, pci3);

			const ChildContextInfo * p_cci3 = pci3.findChildByName("mtu");
			if  (p_cci3 != NULL) {
				demonstrateUseCaseAdd(siSession.getConstSessionId(), "/interfaces/interface: eth0", p_cci3->getIdTemplate(), "1500");
			}
		}
	}
}

void TestClient::runTest4(ClientSessionInfo & siSession) {
	SRExchangeInfo   srei1;
	ContextLocation  clContext1;
	demonstrateUseCaseChContext(siSession.getConstSessionId(), "/protocols/snmp", srei1, clContext1);

	ParentContextInfo pci1(clContext1);
	analyzeParentContextInfo(srei1.m_xiReceive, pci1);

	std::map<unsigned long, OpVal, std::greater<unsigned long> > mapFieldsTemplate;

	const ChildContextInfo * p_cci1 = pci1.findChildByName("contact");
	if  (p_cci1 != NULL) mapFieldsTemplate[p_cci1->getIdTemplate()].setValue("test contact value");

	p_cci1 = pci1.findChildByName("description");
	if  (p_cci1 != NULL) mapFieldsTemplate[p_cci1->getIdTemplate()].setValue("test description value");

	p_cci1 = pci1.findChildByName("location");
	if  (p_cci1 != NULL) mapFieldsTemplate[p_cci1->getIdTemplate()].setValue("test location value");

	p_cci1 = pci1.findChildByName("targetname");
	if  (p_cci1 != NULL) mapFieldsTemplate[p_cci1->getIdTemplate()].setValue("test targetname value");


	SRExchangeInfo   srei2;
	ContextLocation  clContext2;			
	demonstrateUseCaseSet(siSession.getConstSessionId(), "/protocols/snmp", mapFieldsTemplate, srei2, clContext2);

	ParentContextInfo pci2(clContext2);
	analyzeParentContextInfo(srei2.m_xiReceive, pci2);
}

void TestClient::runTest5(ClientSessionInfo & siSession) {
	SRExchangeInfo   srei1;
	ContextLocation  clContext1;
	demonstrateUseCaseChContext(siSession.getConstSessionId(), "/", srei1, clContext1);

	ParentContextInfo pci1(clContext1);
	analyzeParentContextInfo(srei1.m_xiReceive, pci1);

	std::cout << "*** pci1.getListChildrenExistant().size()=" << pci1.getListChildrenExistant().size() << std::endl;
	std::cout << "*** pci1.getListChildrenNonExistant().size()=" << pci1.getListChildrenNonExistant().size() << std::endl;
	
	std::list<ChildContextInfo*>::const_iterator i = pci1.getListChildrenExistant().begin();
	std::list<ChildContextInfo*>::const_iterator iEnd = pci1.getListChildrenExistant().end();
	while (i != iEnd) {
		ChildContextInfo * p_cci = *i;
		if (p_cci != NULL) {
			std::cout << "*** p_cci->getContextSegment().getName()  =              " << p_cci->getContextSegment().getName() << std::endl;
			std::cout << "*** p_cci->getContextSegment().determineIfExistant()  =  " << p_cci->getContextSegment().determineIfExistant() << std::endl;
			std::cout << "*** " << std::endl;
		}
		i++;
	}
	
}
int main(int argc, char ** argv) {

	UNUSED(argc);
	UNUSED(argv);

	TestClient tc;

	std::cout << "Enter username: ";
	std::string strUsername = MiscUtil::getInputLine(true, true);

	std::cout << "Enter password: ";
	std::string strPassword = MiscUtil::getInputLine(false, true);

	std::cout << "Processing..." << std::endl;

	ClientSessionInfo siSession;
	tc.demonstrateUseCaseLogin(strUsername, strPassword, "/", siSession);

	std::cout << "Session id: " << siSession.getConstSessionId().getStr() << std::endl;

	tc.doActionCycleToIdle(siSession.getConstSessionId(), 3);
	tc.demonstrateUseCaseGetSession(siSession.getConstSessionId());
	tc.demonstrateUseCaseGetSystem(siSession.getConstSessionId());
	tc.runTest5(siSession);
	return 0;
}

