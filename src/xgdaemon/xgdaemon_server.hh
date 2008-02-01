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
 *  Module:       xgdaemon_server.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Main server code for processing client requests
 *
 */


#ifndef __INCLUDE_XGDAEMON_SERVER__
#define __INCLUDE_XGDAEMON_SERVER__

#include "basic/xml_info.hh"

#include "common/context_info.hh"
#include "common/error_info.hh"
#include "common/session_id.hh"

#include "rtrmgr/conf_tree.hh"
#include "rtrmgr/op_commands.hh"
#include "rtrmgr/template_tree.hh"
#include "rtrmgr/xorpsh_base.hh"

#include "server_session_info.hh"
#include "server_system_info.hh"
#include "xgdaemon_server_socket.hh"
#include "xorp_mod_info.hh"


class XGDaemonServer {
public:
	XGDaemonServer();

	bool doProcessClient(
		RemoteClientInfo & client,
		ServerSessions & sessions,
		InterSessionInfo & isi) const;

	bool generateXML_Context(
		XmlInfo & xiOutput,
		const std::string & strContextPath,
		const TemplateTree & tt,
		ServerSessionInfo & ssiSession,
		bool flagBestClosest) const;


	bool listenInet();
	bool receiveRequest(RemoteClientInfo * & p_clientWithRequest, bool flagVerbose);
	bool sendResponse(RemoteClientInfo & client, const std::string & strResponse, bool flagVerbose) const;

	void doPrepareResponse(
		XmlInfo & xiOutput,
		const RemoteClientInfo & client,
		ServerSessions & sessions,
		InterSessionInfo & isi) const;

	void doPrepareResponse_Add(
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ServerSessionInfo & ssiSession,
		ContextLocation & clContext,
		const TemplateTree & tt,
		SlaveConfigTree & sctEdit) const;

	void doPrepareResponse_AddContext(
		ErrorInfo & ei,
		ServerSessionInfo & ssiSession,
		ContextLocation & clContext,
		const TemplateTree & tt,
		SlaveConfigTree & sctEdit) const;

	void doPrepareResponse_LoadOrSave(
		bool flagLoadOrSave,
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ServerSessionInfo & ssiSession) const;

	void doPrepareResponse_Remove(
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ConfigTreeNode & ctnContext,
		uid_t uid) const;

	void doPrepareResponse_RemoveContext(
		ConfigTreeNode & ctnContext,
		uid_t uid) const;

	void doPrepareResponse_Revert(
		ErrorInfo & ei,
		ServerSessions & sessions,
		ServerSessionInfo & ssiSession) const;

	void doPrepareResponse_Set(
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ServerSessionInfo & ssiSession,
		ContextLocation & clContext,
		const TemplateTreeNode & ttnContext,
		SlaveConfigTreeNode * & p_sctnContext,
		const ConfigTree & ctSync,
		const bool flagRemoveDefault) const;

	void doPrepareResponse_Submit(
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ServerSessionInfo & ssiSession,
		ConfigTreeNode & ctnContext) const;

	void doPrepareResponse_Undelete(
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ConfigTreeNode & ctnContext,
		uid_t uid) const;


	void generateXML_ChildContextInfo(XmlNodeElement & xneRLSybNodes, const std::list<ChildContextInfo*> & listChildren) const;
	void generateXML_ContextValueInfo(XmlNodeElement & xneRL_SZZ_NODES_NODE, const ContextValueInfo & cvi) const;
	void generateXML_GeneralContextInfo(XmlNodeElement & xne_o_RL_SzzNodes, const GeneralContextInfo & gci, bool flagShallowPathOnly) const;
	void generateXML_InnerContextInfo(XmlNodeElement & xneRL_SZZ_NODES_NODE, const InnerContextInfo & ici) const;
	void generateXML_NStatInfo(XmlNodeElement & xneRL_SZZ_NODES_NODE, const NStatInfo & nsi) const;
	void generateXML_SubInfo(XmlNodeElement & xneRL_SZZ_NODES_NODE, const SubInfo & si) const;


	void generateXML_Context(
		XmlInfo & xiOutput,
		const ParentContextInfo & pciContext) const;

	void generateXML_Context_Segments(
		XmlNodeElement & xneRL_CONTEXT_ZZ_PATH,
		const std::vector<ContextSegment> & vectorContextSegments) const;


	void generateXML_Error(
		XmlInfo & xiOutput,
		const ErrorInfo & ei) const;

	void generateXML_Exec(
		XmlInfo & xiOutput,
		const XorpExecStatusInfo & xesi,
		const unsigned long indexOutputFrom,
		const bool flagOutputPre) const;

	void generateXML_Execs(
		XmlInfo & xiOutput,
		const ServerSessionInfo & ssiSession) const;

	void generateXML_ExecQuery(
		XmlInfo & xiOutput,
		const XorpOpCmd & xoc) const;

	void generateXML_Invalid(
		XmlInfo & xiOutput,
		const ServerSessionInfo & ssiSession) const;

	void generateXML_Invalid_Nodes(
		XmlNodeElement & xne_s_RL_SESSION_INVALID_NODES,
		const XorpBasicContextInfos & xbciNodes) const;

	void generateXML_Mods(
		XmlInfo & xiOutput,
		const ServerSessionInfo & ssiSession) const;

	void generateXML_Mods_Nodes(
		XmlNodeElement & xne_s_RL_SESSION_MODS_ZZ_NODES,
		const XorpModContextInfos & xmciNodes) const;

	void generateXML_Mods_Segment(
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT,
		ModSegment & ms) const;

	void generateXML_OpCommands(
		XmlInfo & xiOutput,
		const XorpOpCmds & xocs) const;

	void generateXML_OpCommands_List(
		XmlNodeElement & xne_s_RL_OP_COMMANDS,
		const std::list<XorpOpCmd*> & listXOCBasic) const;

	void generateXML_ServerSessionInfo(XmlInfo & xiOutput, const ServerSessionInfo & ssi) const;

	void generateXML_ServerSystemInfo(XmlInfo & xiOutput, ErrorInfo & ei) const;
	void generateXML_ServerSystemInfo(XmlInfo & xiOutput, const ServerSystemInfo & ssi) const;

	void generateXML_ShowConfig(XmlInfo & xiOutput, const SlaveConfigTree & sctEdit) const;

	void generateXML_Test(XmlInfo & xiOutput, const std::string & strTest) const;

	void generateXML_ZZ_Brief(XmlNodeElement & xne_s_RL_ZZ_BRIEF, const BriefExecStatusInfo & besi) const;
	void generateXML_ZZ_TimeInfo(XmlNodeElement & xne_s_RL_ZZ_TIME, const TimeInfo & ti) const;

	void retrMapSybNodes(
		const XmlNodeElement & xne_RL_NODES,
		const bool flagConfigOrTemplate,
		std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapSybNodesAll,
		std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapSybNodesBlank,
		std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapSybNodesNonBlank) const;

protected:
	XGDaemonServerSocket   m_socket;

};

#endif


