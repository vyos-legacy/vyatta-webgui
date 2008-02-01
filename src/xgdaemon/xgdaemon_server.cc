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
 *  Module:       xgdaemon_server.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Main server code for processing client requests
 *
 */


#include <iostream>

#include "xgdaemon_module.hh"

#include "basic/xgdaemon_util.hh"

#include "common/xgdaemon_common_xml.hh"

#include "common/data/static_route_4u_data.hh"

#include "rtrmgr/master_conf_tree.hh"
#include "rtrmgr/slave_conf_tree_node.hh"

#include "xgdaemon_misc_util.hh"
#include "server_net_data_info.hh"
#include "xgdaemon_pam_util.hh"
#include "xgdaemon_proc_util.hh"
#include "xgdaemon_server.hh"
#include "xgdaemon_xorp_util.hh"
#include "xorp_opcmd_info.hh"
#include "server_session_info.hh"

#define CHARS_ABSPATH_LOAD_SAVE		"~/"
#define PATH_CONFIG_0			"rtrmgr"
#define PATH_CONFIG_1			"config-directory"

XGDaemonServer::XGDaemonServer() {
}

bool XGDaemonServer::doProcessClient(
	RemoteClientInfo & client,
	ServerSessions & sessions,
	InterSessionInfo & isi) const {

	XmlInfo xiOutput;

	doPrepareResponse(
		xiOutput,
		client,
		sessions,
		isi);

	std::string strRepr = xiOutput.getXMLRepr(true, 0);
	if (sendResponse(client, strRepr, true) == false) {
		std::cout << "Encountered error sending response XML." << std::endl;
		return false;
	} else {
		return true;
	}
}

bool XGDaemonServer::generateXML_Context(
	XmlInfo & xiOutput,
	const std::string & strContextPathEscaped,
	const TemplateTree & tt,
	ServerSessionInfo & ssiSession,
	bool flagBestClosest) const {

	ContextLocation clContext;
	const TemplateTreeNode * p_ttnContext = NULL;
	ConfigTreeNode * p_ctnContext = NULL;
	if ((XGDaemonXorpUtil::setContextLocationToPath(
				clContext,
				strContextPathEscaped,
				tt,
				ssiSession.getXLink().getSlaveConfigTreeSync(),
				ssiSession.getXLink().getSlaveConfigTreeEdit(),
				p_ttnContext,
				p_ctnContext,
				false) == false) && (flagBestClosest == false)) return false;

	if (p_ttnContext == NULL) return false;

	ParentContextInfo pciContext(clContext);
	XGDaemonXorpUtil::readChildren(pciContext, ssiSession.getXLink().getSlaveConfigTreeSync(), *p_ttnContext, p_ctnContext);

	generateXML_Context(xiOutput, pciContext);

	return true;
}

bool XGDaemonServer::listenInet() {
	if (m_socket.initializeInet() == false) return false;
	if (m_socket.listenInet() == false) return false;

	return true;
}
bool XGDaemonServer::receiveRequest(RemoteClientInfo * & p_clientWithRequest, bool flagVerbose) {
	if (m_socket.receiveRequest(p_clientWithRequest) == false) return false;
	if (p_clientWithRequest != NULL && flagVerbose) {
		std::cout << std::endl << "Received Request:" << std::endl << p_clientWithRequest->getStrReceived() << std::endl;
	}
	return true;
}

bool XGDaemonServer::sendResponse(RemoteClientInfo & client, const std::string & strResponse, bool flagVerbose) const {
	if (flagVerbose) {
		std::cout << std::endl << "Sending Response:" << std::endl << strResponse << std::endl;
	}
	bool flagSR = m_socket.sendResponse(client, strResponse);

	if (flagSR) {
		std::cout << "Successfully sent response." << std::endl;
	} else {
		std::cout << "Encountered error sending response." << std::endl;
	}

	return flagSR;
}

void XGDaemonServer::doPrepareResponse(
	XmlInfo & xiOutput,
	const RemoteClientInfo & client,
	ServerSessions & sessions,
	InterSessionInfo & isi) const {

	ErrorInfo ei;

	XmlInfo xiInput;

	if (ei.getCodeError() == ERROR_NONE) {
		std::string strCommand = client.getStrReceived();
		std::cout << std::endl << "Processing Request:" << std::endl << strCommand << std::endl;
		XmlParseStatus xstatus;
		if (XmlParser::parse(strCommand, xiInput, xstatus) == false) {
			ei.setInfoParsingRequest(__LINE__, xstatus.getDesc());
		} else {
			if (xiInput.doesRootElementMatch(XML_CLT_RL) == false) {
				ei.setInfoParsingRequest(__LINE__, "Root does not match.");
			}
		}
	}

	const XmlNodeElement & xne_i_RL = xiInput.sureroot();

	if (ei.getCodeError() == ERROR_NONE) {
		const std::string & strAction = XGDaemonCommonXmlUtil::get_CLT_RL_ACTION(xiInput);

		EventLoop & eventloop = isi.getEventLoop();
		TemplateTree & tt = isi.getTemplateTree();

		if (strAction == ACTION_LOGIN) {
			const std::string & strContextEscaped = XGDaemonCommonXmlUtil::get_CLT_RL_CONTEXT_PATH(xiInput);
			const std::string strUser = xne_i_RL.get1InternalText_Trimmed_Child2(XML_CLT_RL_AUTH, XML_CLT_RL_AUTH_USER);
			const std::string strPwd = xne_i_RL.get1InternalText_Trimmed_Child2(XML_CLT_RL_AUTH, XML_CLT_RL_AUTH_PWD);

			uid_t uid = XGDaemonPamUtil::testAuth(strUser, strPwd); 
			if (uid == 0) {
				ei.setInfoAuthFailed(__LINE__, strUser);
			} else {
				ServerSessionInfo * p_ssi = sessions.findSession(uid);
				if (p_ssi != NULL && p_ssi->getConstXLink().isError()) p_ssi = NULL;
				if (p_ssi == NULL) {
					p_ssi = sessions.createNew(isi, uid, strUser);
				} else {
					p_ssi->setClosed(false);
					p_ssi->getXLink().getSessionStatusInfo().getCurrentTaskInfo().resetTask();
				}
				if (p_ssi == NULL) {
					ei.setInfoOutOfMemory(__LINE__);
				} else {
					if (generateXML_Context(xiOutput, strContextEscaped, tt, *p_ssi, false) == false) {
						ei.setInfoInvalidContext(__LINE__, strContextEscaped);
					}
					generateXML_ServerSessionInfo(xiOutput, *p_ssi);
				}
			}
		} else {
			ServerSessionInfo * p_ssiSession = NULL;

			const std::string & strSessionID = XGDaemonCommonXmlUtil::get_CLT_RL_SESSION_ID(xiInput);
			if (strSessionID.length() > 0) p_ssiSession = sessions.findSession(strSessionID);

			if (p_ssiSession == NULL || (p_ssiSession->isActive()==false)) {
				ei.setInfoNoSession(__LINE__);
			} else {
				if (strAction == ACTION_TEST) {
					generateXML_Test(xiOutput, "Testing&#x000A;123");
				} else {					
					const std::string & strContextEscaped = XGDaemonCommonXmlUtil::get_CLT_RL_CONTEXT_PATH(xiInput);
					if (strAction == ACTION_LOGOUT) {
						p_ssiSession->setClosed(true);
					} else if (strAction == ACTION_CH_CONTEXT || strAction == ACTION_CH_CONTEXT_CLOSEST || strAction == ACTION_RESET_COMMIT) {
						if (strAction == ACTION_RESET_COMMIT) {
							p_ssiSession->getXLink().resetCommitStatus();						
						}

						if (generateXML_Context(xiOutput, strContextEscaped, tt, *p_ssiSession, (strAction == ACTION_CH_CONTEXT_CLOSEST)) == false) {
							ei.setInfoInvalidContext(__LINE__, strContextEscaped);
						}
					} else if (strAction == ACTION_RESET_TASK) {
						p_ssiSession->getXLink().getSessionStatusInfo().getCurrentTaskInfo().resetTask();
					} else if (strAction == ACTION_SHOW_CONFIG) {
						generateXML_ShowConfig(xiOutput, p_ssiSession->getXLink().getSlaveConfigTreeEdit());
					} else if (strAction == ACTION_ABS_REMOVE_COMMIT || strAction == ACTION_ADD || strAction == ACTION_ADD_CONTEXT || strAction == ACTION_COMMIT || strAction == ACTION_REMOVE || strAction == ACTION_REMOVE_CONTEXT || strAction == ACTION_SET || strAction == ACTION_SET_RD || strAction == ACTION_SUBMIT || strAction == ACTION_LOAD || strAction == ACTION_SAVE || strAction == ACTION_REVERT || strAction == ACTION_UNDELETE) {
						ContextLocation clContext;
						const TemplateTreeNode * p_ttnContext = NULL;
						ConfigTreeNode * p_ctnContext = NULL;

						SlaveConfigTree & sctSync = p_ssiSession->getXLink().getSlaveConfigTreeSync();
						SlaveConfigTree & sctEdit = p_ssiSession->getXLink().getSlaveConfigTreeEdit();

						if ((XGDaemonXorpUtil::setContextLocationToPath(clContext, strContextEscaped, tt, sctSync, sctEdit, p_ttnContext, p_ctnContext, false) == false) || (p_ttnContext == NULL)) {
							ei.setInfoInvalidContext(__LINE__, strContextEscaped);
						} else {
							if (strAction == ACTION_ADD) {
								doPrepareResponse_Add(
								  ei,
								  xiInput,
								  *p_ssiSession,
								  clContext,
								  tt,
								  sctEdit);
							} else if (strAction == ACTION_ADD_CONTEXT) {
								doPrepareResponse_AddContext(
								  ei,
								  *p_ssiSession,
								  clContext,
								  tt,
								  sctEdit);
							} else if (strAction == ACTION_COMMIT || strAction == ACTION_ABS_REMOVE_COMMIT) {
								if (strAction == ACTION_COMMIT) {
									doPrepareResponse_Submit(ei, xiInput, *p_ssiSession, *p_ctnContext);

									const XmlNodeElement * p_xne_c_RL_SEP_NODES = XGDaemonCommonXmlUtil::getXNE_CLT_RL_SEP_NODES(xiInput);
									if (p_xne_c_RL_SEP_NODES != NULL) {
										std::list<XmlNode*> listChildren = p_xne_c_RL_SEP_NODES->getChildren();
										std::list<XmlNode*>::const_iterator i = listChildren.begin();
										const std::list<XmlNode*>::const_iterator iEnd = listChildren.end();
										while (i != iEnd) {
											XmlNode * p_xn_c_Child = *i;
											XmlNodeElement * p_xne_c_Child = dynamic_cast<XmlNodeElement*>(p_xn_c_Child);
											if (p_xne_c_Child != NULL) {
												if (p_xne_c_Child->getName() == XML_CLT_RL_SEP_NODES_NODE) {
													std::string strPathEscaped;
													XmlNodeElement * p_xne_c_NodePath = p_xne_c_Child->findChildElementWithName(XML_CLT_RL_SEP_NODES_NODE_PATH);
													if (p_xne_c_NodePath != NULL) strPathEscaped = p_xne_c_NodePath->get1InternalText();
								
													std::string strPathValue;
													XmlNodeElement * p_xne_c_NodeValue = p_xne_c_Child->findChildElementWithName(XML_CLT_RL_SEP_NODES_NODE_VALUE);
													if (p_xne_c_NodeValue != NULL) strPathValue = p_xne_c_NodeValue->get1InternalText();

													if (strPathEscaped.length() > 0) {
														ContextLocation clPathSet;
														const TemplateTreeNode * p_ttnSet = NULL;
														ConfigTreeNode * p_ctnSet = NULL;
														if ((XGDaemonXorpUtil::setContextLocationToPath(clPathSet, strPathEscaped, tt, sctSync, sctEdit, p_ttnSet, p_ctnSet, false) == false) || (p_ttnSet == NULL)) {
															ei.setInfoInvalidContext(__LINE__, strPathEscaped);
														} else {
															if (p_ctnSet == NULL) {
																ei.setInfoInvalidContext(__LINE__, strPathEscaped);
															} else {
																std::string strErrorMsg;
																if (XGDaemonXorpUtil::setValue(*p_ctnSet, strPathValue, p_ssiSession->getXLink().getUid(), strErrorMsg) == false) {
																	ei.setInfoUnableToSetValue(__LINE__, strErrorMsg);
																}
															}
														}
													}
												}
											}
											i++;
										}
									}
								} else if (strAction == ACTION_ABS_REMOVE_COMMIT) {
									const std::string & strPathEscaped = XGDaemonCommonXmlUtil::get_CLT_RL_REMOVE(xiInput);
									ContextLocation clPathRemove;
									const TemplateTreeNode * p_ttnRemove = NULL;
									ConfigTreeNode * p_ctnRemove = NULL;
									if ((XGDaemonXorpUtil::setContextLocationToPath(clPathRemove, strPathEscaped, tt, sctSync, sctEdit, p_ttnRemove, p_ctnRemove, false) == false) || (p_ttnRemove == NULL)) {
										ei.setInfoInvalidContext(__LINE__, strPathEscaped);
									} else {
										if (p_ctnRemove == NULL) {
											ei.setInfoInvalidContext(__LINE__, strPathEscaped);
										} else {
											ConfigTreeNode * p_ctnParent = p_ctnRemove->parent();
											if (p_ctnParent == NULL) {
												ei.setInfoUnableToDelete(__LINE__);
											} else {
												p_ctnParent->remove_child(p_ctnRemove);
											}
										}
									}
								}

								if (ei.getCodeError() == ERROR_NONE) {	
									std::list<GeneralContextInfo> listNodes;
									XGDaemonXorpUtil::determineNodesWithInvalidValues(sctSync, sctEdit, listNodes);
	
									if (listNodes.size() > 0) {
										ei.setInfoUnableToCommit_InvalidValues(__LINE__);
	
										XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);

										XmlNodeElement & xne_s_RL_SEP_NODES = xne_s_RL.addChildElement(XML_SRV_RL_SEP_NODES);

										std::list<GeneralContextInfo>::const_iterator i = listNodes.begin();
										std::list<GeneralContextInfo>::const_iterator iEnd = listNodes.end();
										while (i != iEnd) {
											generateXML_GeneralContextInfo(xne_s_RL_SEP_NODES, *i, false);
											i++;
										}
									} else {
										if (p_ssiSession->getXLink().doCommit() == false) {
											ei.setInfoUnableToCommit(__LINE__);
										}
									}
								}
							} else if (strAction == ACTION_REMOVE) {
								if (p_ctnContext == NULL) {
									ei.setInfoInvalidContext(__LINE__, clContext.getPathRepr(false));
								} else {
									doPrepareResponse_Remove(ei, xiInput, *p_ctnContext, p_ssiSession->getXLink().getUid());
								}
							} else if (strAction == ACTION_REMOVE_CONTEXT) {
								if (p_ctnContext == NULL) {
									ei.setInfoInvalidContext(__LINE__, clContext.getPathRepr(false));
								} else {
									doPrepareResponse_RemoveContext(*p_ctnContext, p_ssiSession->getXLink().getUid());
								}
							} else if (strAction == ACTION_SET || strAction == ACTION_SET_RD) {
								SlaveConfigTreeNode * p_sctnContext = NULL;
								doPrepareResponse_Set(ei, xiInput, *p_ssiSession, clContext, *p_ttnContext, p_sctnContext, p_ssiSession->getXLink().getSlaveConfigTreeSync(), (strAction == ACTION_SET_RD) ? true : false);
								p_ctnContext = p_sctnContext;
							} else if (strAction == ACTION_SUBMIT) {
								doPrepareResponse_Submit(ei, xiInput, *p_ssiSession, *p_ctnContext);
							} else if (strAction == ACTION_LOAD || strAction == ACTION_SAVE) {
								bool flagLoadOrSave = (strAction == ACTION_LOAD);
								if (strAction == ACTION_SAVE) {
									doPrepareResponse_Submit(ei, xiInput, *p_ssiSession, *p_ctnContext);	
								}
								if (ei.getCodeError() == ERROR_NONE) {
									doPrepareResponse_LoadOrSave(flagLoadOrSave, ei, xiInput, *p_ssiSession);
								}

								if (ei.getCodeError() == ERROR_NONE && flagLoadOrSave) {
									SlaveConfigTree & sctSync = p_ssiSession->getXLink().getSlaveConfigTreeSync();
									SlaveConfigTree & sctEdit = p_ssiSession->getXLink().getSlaveConfigTreeEdit();
									if ((XGDaemonXorpUtil::setContextLocationToPath(clContext, strContextEscaped, tt, sctSync, sctEdit, p_ttnContext, p_ctnContext, false) == false) || (p_ttnContext == NULL)) {
										if ((XGDaemonXorpUtil::setContextLocationToPath(clContext, "/", tt, sctSync, sctEdit, p_ttnContext, p_ctnContext, false) == false) || (p_ttnContext == NULL)) {
											ei.setInfoLogicError(__LINE__);
										}
									}
								}
							} else if (strAction == ACTION_REVERT) {
								if (ei.getCodeError() == ERROR_NONE) {
									doPrepareResponse_Revert(ei, sessions, *p_ssiSession);
								}

								if (ei.getCodeError() == ERROR_NONE) {
									p_ssiSession->getXLink().getSessionStatusInfo().getCurrentTaskInfo().resetTask();
								}

								if (ei.getCodeError() == ERROR_NONE) {
									SlaveConfigTree & sctSync = p_ssiSession->getXLink().getSlaveConfigTreeSync();
									SlaveConfigTree & sctEdit = p_ssiSession->getXLink().getSlaveConfigTreeEdit();
									if ((XGDaemonXorpUtil::setContextLocationToPath(clContext, strContextEscaped, tt, sctSync, sctEdit, p_ttnContext, p_ctnContext, false) == false) || (p_ttnContext == NULL)) {
										if ((XGDaemonXorpUtil::setContextLocationToPath(clContext, "/", tt, sctSync, sctEdit, p_ttnContext, p_ctnContext, false) == false) || (p_ttnContext == NULL)) {
											ei.setInfoLogicError(__LINE__);
										}
									}
								}
							} else if (strAction == ACTION_UNDELETE) {
								doPrepareResponse_Undelete(ei, xiInput, *p_ctnContext, p_ssiSession->getXLink().getUid());
							}

							ContextLocation clContextRepeated;
							XGDaemonXorpUtil::repeatContextLocation(clContext, tt, sctSync, sctEdit, clContextRepeated, p_ttnContext, p_ctnContext);

							ParentContextInfo pciContext(clContextRepeated);
							XGDaemonXorpUtil::readChildren(pciContext, sctSync, *p_ttnContext, p_ctnContext);
							generateXML_Context(xiOutput, pciContext);
						}
					} else if (strAction == ACTION_EXEC_CMD_ID) {
						unsigned long command_id = XGDaemonUtil::getValueStrUL_Hex(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_CMD_COMMAND_ID(xiInput), 0);
						const bool flagOutputPre = XGDaemonUtil::getValueStrBool(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_OUTPUT_PRE(xiInput), false);
						XorpOpCmd * p_xoc = p_ssiSession->getXLink().getXorpOpCmds().findXorpOpCmd(command_id);
						if (p_xoc == NULL) {
							ei.setInfoInvalidOpCommand(__LINE__, command_id);
						} else {
							ExecutableXorpOpCmd * p_exoc = new ExecutableXorpOpCmd(p_xoc->getOpCommand(), p_ssiSession->getXLink().getSlaveConfigTreeSync(), p_xoc->getConstOpCmdName().getName(), p_xoc->getAction(), p_xoc->getType()); 
							XorpExecStatusInfo * p_xesi = p_ssiSession->execute(p_exoc, eventloop);
							if (p_xesi == NULL) {
								ei.setInfoUnableToExecute(__LINE__);
							} else {
								generateXML_Exec(xiOutput, *p_xesi, 0, flagOutputPre);
							}
						}
					} else if (strAction == ACTION_EXEC_CMD_ARGS_ID || strAction == ACTION_EXEC_CMD_ARGS_NAME) {
						XorpOpCmd * p_xoc = NULL;

						if (strAction == ACTION_EXEC_CMD_ARGS_ID) {
							unsigned long command_id = XGDaemonUtil::getValueStrUL_Hex(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_CMD_COMMAND_ID(xiInput), 0);
							p_xoc = p_ssiSession->getXLink().getXorpOpCmds().findXorpOpCmd(command_id);
							if (p_xoc == NULL) ei.setInfoInvalidOpCommand(__LINE__, command_id);
						} else {
							const std::string & strCommandName = XGDaemonUtil::getStrUnEscapedAmpersand(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_CMD_NAME(xiInput));
							p_xoc = p_ssiSession->getXLink().getXorpOpCmds().findXorpOpCmdByName(strCommandName);
							if (p_xoc == NULL) ei.setInfoInvalidOpCommand(__LINE__, strCommandName);
						}

						if (ei.getCodeError() == ERROR_NONE) {
							ExecutableXorpOpCmd * p_exoc = new ExecutableXorpOpCmd(p_xoc->getOpCommand(), p_ssiSession->getXLink().getSlaveConfigTreeSync(), p_xoc->getConstOpCmdName().getName(), p_xoc->getAction(), p_xoc->getType());

							XmlNodeElement * p_xne_c_RL_EXEC_CMD_ARGS = XGDaemonCommonXmlUtil::getXNE_CLT_RL_EXEC_CMD_ARGS(xiInput);
							if (p_xne_c_RL_EXEC_CMD_ARGS != NULL) {
								const std::list<XmlNode*> & listChildren = p_xne_c_RL_EXEC_CMD_ARGS->getChildren();
								std::list<XmlNode*>::const_iterator i = listChildren.begin();
								const std::list<XmlNode*>::const_iterator iEnd = listChildren.end();
								while (i != iEnd) {
									const XmlNodeElement * p_xne_c = dynamic_cast<const XmlNodeElement *>(*i);
									if (p_xne_c != NULL && p_xne_c->getName() == XML_CLT_RL_EXEC_CMD_ARGS_ARG) {
										const XmlNodeElement * p_xne_c_ArgNum = p_xne_c->findChildElementWithName(XML_CLT_RL_EXEC_CMD_ARGS_ARG_NUM);
										const XmlNodeElement * p_xne_c_ArgValue = p_xne_c->findChildElementWithName(XML_CLT_RL_EXEC_CMD_ARGS_ARG_VALUE);
										if (p_xne_c_ArgNum != NULL && p_xne_c_ArgValue != NULL) {
											unsigned long num = p_xne_c_ArgNum->get1InternalText_UL(0);
											const std::string & strValue = p_xne_c_ArgValue->get1InternalText_UnEscaped();
											if (num > 0) {
												p_exoc->getOpCmdName().changeIndexTo(num - 1, strValue);
											}
										}
									}
									i++;
								}
							}

							const bool flagOutputPre = XGDaemonUtil::getValueStrBool(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_OUTPUT_PRE(xiInput), false);

							std::list<std::pair<int, std::string> > listUnsatisfied;
							p_exoc->retrListUserInputUnsatisfied(listUnsatisfied);
							if (listUnsatisfied.size() > 0) { 
								ei.setInfoUnableToExecuteRUIU(__LINE__, listUnsatisfied);
							} else {
								XorpExecStatusInfo * p_xesi = p_ssiSession->execute(p_exoc, eventloop);
								if (p_xesi == NULL) {
									ei.setInfoUnableToExecute(__LINE__);
								} else {
									generateXML_Exec(xiOutput, *p_xesi, 0, flagOutputPre);
								}
							}
						}
					} else if (strAction == ACTION_EXEC_CMD_S_SR4U) {
						const bool flagOutputPre = XGDaemonUtil::getValueStrBool(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_OUTPUT_PRE(xiInput), false);

						std::list<std::string> listCmdParts;
						listCmdParts.push_back("show");
						listCmdParts.push_back("route");
						listCmdParts.push_back("table");
						listCmdParts.push_back("ipv4");
						listCmdParts.push_back("unicast");
						listCmdParts.push_back("static");
						listCmdParts.push_back("detail");

						XorpOpCmd * p_xoc = p_ssiSession->getXLink().getXorpOpCmds().findXorpOpCmdByParts(listCmdParts);
						if (p_xoc == NULL) {
							ei.setInfoInvalidOpCommand(__LINE__, listCmdParts);
						} else {
							ExecutableXorpOpCmd * p_exoc = new ExecutableXorpOpCmd(p_xoc->getOpCommand(), p_ssiSession->getXLink().getSlaveConfigTreeSync(), p_xoc->getConstOpCmdName().getName(), p_xoc->getAction(), p_xoc->getType());
							XorpExecStatusInfo * p_xesi = p_ssiSession->execute(p_exoc, eventloop);
							if (p_xesi == NULL) {
								ei.setInfoUnableToExecute(__LINE__);
							} else {
								generateXML_Exec(xiOutput, *p_xesi, 0, flagOutputPre);
							}
						}
					} else if (strAction == ACTION_EXEC_QUERY_ID) {	
						unsigned long command_id = XGDaemonUtil::getValueStrUL_Hex(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_QUERY_COMMAND_ID(xiInput), 0);
						XorpOpCmd * p_xoc = p_ssiSession->getXLink().getXorpOpCmds().findXorpOpCmd(command_id);

						if (p_xoc == NULL) {
							ei.setInfoInvalidOpCommand(__LINE__, command_id);
						} else {
							generateXML_ExecQuery(xiOutput, *p_xoc);
						}
					} else if (strAction == ACTION_EXEC_QUERY_NAME) {
						const std::string & strCommandName = XGDaemonUtil::getStrUnEscapedAmpersand(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_QUERY_NAME(xiInput));
						XorpOpCmd * p_xoc = p_ssiSession->getXLink().getXorpOpCmds().findXorpOpCmdByName(strCommandName);

						if (p_xoc == NULL) {
							ei.setInfoInvalidOpCommand(__LINE__, strCommandName);
						} else {
							generateXML_ExecQuery(xiOutput, *p_xoc);
						}
					} else if (strAction == ACTION_EXEC_STATUS) {
						const unsigned long idExec = XGDaemonUtil::getValueStrUL_Hex(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_EXEC_ID(xiInput), 0);
						const unsigned long indexOutputFrom = XGDaemonUtil::getValueStrUL(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_OUTPUT_FROM(xiInput), 0);
						const bool flagOutputPre = XGDaemonUtil::getValueStrBool(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_OUTPUT_PRE(xiInput), false);

						const XorpExecStatusInfo * p_xesi = p_ssiSession->getConstCommandProcessing(idExec);
						if (p_xesi == NULL) {
							ei.setInfoInvalidExecId(__LINE__, idExec);
						} else {
							generateXML_Exec(xiOutput, *p_xesi, indexOutputFrom, flagOutputPre);
						}
					} else if (strAction == ACTION_EXECS_STATUS) {
						generateXML_Execs(xiOutput, *p_ssiSession);
					} else if (strAction == ACTION_EXEC_KILL) {
						const unsigned long idExec = XGDaemonUtil::getValueStrUL_Hex(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_KILL_EXEC_ID(xiInput), 0);
						const unsigned long indexOutputFrom = XGDaemonUtil::getValueStrUL(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_KILL_OUTPUT_FROM(xiInput), 0);
						const bool flagOutputPre = XGDaemonUtil::getValueStrBool(XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_OUTPUT_PRE(xiInput), false);

						XorpExecStatusInfo * p_xesi = p_ssiSession->getCommandProcessing(idExec);
						if (p_xesi == NULL) {
							ei.setInfoInvalidExecId(__LINE__, idExec);
						} else {
							if (p_xesi->killExecution()) {
								generateXML_Exec(xiOutput, *p_xesi, indexOutputFrom, flagOutputPre);
							} else {
								ei.setInfoUnableToKillExec(__LINE__, idExec);
							}
						}
					} else if (strAction == ACTION_GET_SESSION) {
					
					} else if (strAction == ACTION_GET_SYSTEM) {
						generateXML_ServerSystemInfo(xiOutput, ei);
					} else if (strAction == ACTION_OP_COMMANDS) {
						if (ei.getCodeError() == ERROR_NONE) {
							generateXML_OpCommands(xiOutput, p_ssiSession->getXLink().getXorpOpCmds());
						}
					} else if (strAction == ACTION_SYS_ADD_USER) {
						if (ei.getCodeError() == ERROR_NONE) {
							XrlStdRouter & xrl_router = p_ssiSession->getXLink().getXrlStdRouter();
							EventLoop & event_loop = isi.getEventLoop();
							const std::string & strTargetsDir = isi.getXorpDirInfo().getXorpTargetsDir();

							const std::string strUser = xne_i_RL.get1InternalText_Trimmed_Child2(XML_CLT_RL_AUTH, XML_CLT_RL_AUTH_USER);
							const std::string strPassword = xne_i_RL.get1InternalText_Trimmed_Child2(XML_CLT_RL_AUTH, XML_CLT_RL_AUTH_PWD);

							if (MiscUtil::doAddUser(
								xrl_router,
								event_loop,
								strTargetsDir,
								strUser,
								strPassword) == false) {
								ei.setInfoUnableToAddUser(__LINE__, strUser, strPassword);
							}
						}
					} else {
						ei.setInfoUnknownAction(__LINE__, strAction);
					}
				}
				p_ssiSession->getXLink().getSessionStatusInfo().updateTimeLastActivity();
			}
			if (p_ssiSession != NULL) generateXML_ServerSessionInfo(xiOutput, *p_ssiSession);
		}
	}

	generateXML_Error(xiOutput, ei);
}

void XGDaemonServer::doPrepareResponse_Add(
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ServerSessionInfo & ssiSession,
		ContextLocation & clContext,
		const TemplateTree & tt,
		SlaveConfigTree & sctEdit) const
	{

	TemplateTreeNode * p_ttnLast = XGDaemonXorpUtil::findTemplateTreeNodeLast(tt, clContext);

	if (p_ttnLast == NULL) {
		ei.setInfoUnableToAdd(__LINE__);
	} else {
		const std::string & strAddChildIdTemplate = XGDaemonCommonXmlUtil::get_CLT_RL_ADD_TEMPLATE_ID(xiInput);
		const std::string & strAddChildOp = XGDaemonUtil::getStrUnEscapedAmpersand(XGDaemonUtil::getTrimmedString(XGDaemonCommonXmlUtil::get_CLT_RL_ADD_OP(xiInput)));
		const std::string & strAddChildValue = XGDaemonUtil::getTrimmedString(XGDaemonCommonXmlUtil::get_CLT_RL_ADD_VALUE(xiInput));

		unsigned long idTemplateAdd = XGDaemonUtil::getValueStrUL_Hex(strAddChildIdTemplate, CONFIG_ID_UNKNOWN);

		TemplateTreeNode * p_ttnAdd = XGDaemonXorpUtil::findChildByIdTemplate(*p_ttnLast, idTemplateAdd);
		if (p_ttnAdd == NULL) {
			ei.setInfoUnableToAdd(__LINE__);
		} else {
			NStatInfo nsi;
			SubInfo si;
			ContextSegment csAdd(XGDaemonXorpUtil::getIdTemplate(p_ttnAdd), CONFIG_ID_NONE, p_ttnAdd->segname(), XGDaemonXorpUtil::isMultiNode(*p_ttnAdd), nsi, si);
			if (csAdd.getFlagMulti()) csAdd.setName(strAddChildValue);
			ContextLocation clAdd(clContext, csAdd);

			NodeAdditionError nae;
			ConfigTreeNode * p_ctnAdded = XGDaemonXorpUtil::createPath(
							clAdd,
							tt,
							sctEdit,
							ssiSession.getXLink().getIdClient(),
							ssiSession.getXLink().getUid(),
							nae);
			if (p_ctnAdded == NULL) {
				XGDaemonXorpUtil::setErrorInfoUnableToAdd(__LINE__, ei, nae);
			} else {
				if (!csAdd.getFlagMulti()) {
					ConfigOperator co = OP_ASSIGN;
					try {
						if (strAddChildOp.length() > 0) co = lookup_operator(strAddChildOp);
						p_ctnAdded->set_operator_without_verification(co, ssiSession.getXLink().getUid());
					} catch (ParseError e) {
						ei.setInfoInvalidOperator(__LINE__, strAddChildOp);
					}
					p_ctnAdded->set_value_without_verification(strAddChildValue, ssiSession.getXLink().getUid());
				}
			}
		}
	}
}
void XGDaemonServer::doPrepareResponse_AddContext(
		ErrorInfo & ei,
		ServerSessionInfo & ssiSession,
		ContextLocation & clContext,
		const TemplateTree & tt,
		SlaveConfigTree & sctEdit) const
	{

	NodeAdditionError nae;
	ConfigTreeNode * p_ctnAdded = XGDaemonXorpUtil::createPath(
					clContext,
					tt,
					sctEdit,
					ssiSession.getXLink().getIdClient(),
					ssiSession.getXLink().getUid(),
					nae);
	if (p_ctnAdded == NULL) {
		XGDaemonXorpUtil::setErrorInfoUnableToAdd(__LINE__, ei, nae);
	}
}

/*
void XGDaemonServer::doPrepareResponse_Exec(ErrorInfo & ei, const XmlInfo & xiInput, XorpSessionInfo & xsiSession, EventLoop & eventloop, OpCommandList & ocl, XorpExecStatusInfo * & p_xesi) const {
	unsigned long idOpCommand = XGDaemonUtil::getValueStrUL_Hex(XGDaemonCommonXmlUtil::get_RL_EXEC(xiInput), 0);
	OpCommand * p_oc = XGDaemonXorpUtil::findOpCommandById(ocl, idOpCommand);
	if (p_oc == NULL) {
		ei.setInfoInvalidOpCommand(__LINE__, idOpCommand);
	} else {
		XorpOpCmd xoc(*p_oc);
		if (xoc.getCmdSegmentsAction().isUserInputRequired()) {
		}
		p_xesi = xsiSession.execute(xoc, eventloop);
	}
}
*/
void XGDaemonServer::doPrepareResponse_LoadOrSave(
		bool flagLoadOrSave,
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ServerSessionInfo & ssiSession) const {

	std::string strFilespec = XGDaemonCommonXmlUtil::get_CLT_RL_FILESPEC(xiInput);

	if (flagLoadOrSave) {
		ssiSession.getXLink().doLoad(strFilespec);
	} else {
		ssiSession.getXLink().doSave(strFilespec);
	}

	UNUSED(ei);

/*
	if (strFilespec.length() == 0) {
		ei.setInfoInvalidFilespec(__LINE__, strFilespec, "Filespec not specified.");
		return;
	}

	bool flagAbsPath = false;
	{
		int lengthNotAllowed = strlen(CHARS_ABSPATH_LOAD_SAVE);
		for (int i = 0; i < lengthNotAllowed; i++) {
			char cCheck = CHARS_ABSPATH_LOAD_SAVE[i];
			std::string::size_type iCheck = strFilespec.find(cCheck); 
			if (iCheck != std::string::npos) {
				flagAbsPath = true;
				break;
			}
		}
	}

	if (!flagAbsPath) {
		const SlaveConfigTree & sctSync = ssiSession.getConstXLink().getConstSlaveConfigTreeSync();
		std::vector<std::string> vectorConfigPath;
		vectorConfigPath.push_back(PATH_CONFIG_0);
		vectorConfigPath.push_back(PATH_CONFIG_1);
		const ConfigTreeNode * p_ctnConfigDir = XGDaemonXorpUtil::walkContextPath(sctSync, vectorConfigPath);
		if (p_ctnConfigDir == NULL || !p_ctnConfigDir->has_value() || p_ctnConfigDir->value().length() == 0) {
			std::string strErrorMsg = "Could not ";
			strErrorMsg += flagLoadOrSave ? "load" : "save";
			strErrorMsg += " configuration because could not find node \"";
			strErrorMsg += "/";
			strErrorMsg += PATH_CONFIG_0;
			strErrorMsg += "/";
			strErrorMsg += PATH_CONFIG_1;
			strErrorMsg += "\" in the active runtime configuration that is needed to determine the server directory where configuration files are stored.";
			ei.setInfoReqConfigMissing(__LINE__, strErrorMsg);
			return;
		} else {
			strFilespec.insert(0, "/");
			strFilespec.insert(0, p_ctnConfigDir->value());
		}
	}


	if (flagLoadOrSave) {
		std::string strFileContents, strError;

		if (XGDaemonUtil::retrFileContents(strFilespec, strFileContents, strError, ssiSession.getXLink().getUid()) == false) {
			ei.setInfoInvalidFilespec(__LINE__, strFilespec, strError);
		}

		if (ei.getCodeError() == ERROR_NONE) {
			SlaveConfigTree & sct = ssiSession.getXLink().getSlaveConfigTreeEdit();
			sct.root_node().delete_subtree_silently();

			std::string strErrMsg;
			if (sct.parse(strFileContents, strFilespec, strErrMsg) == false) {
				ei.setInfoConfigParseError(__LINE__, strFilespec, strErrMsg);
			}
		}
	} else {
		if (XGDaemonUtil::doesExist(strFilespec) && !XGDaemonUtil::isConfigFile(strFilespec)) {
			ei.setInfoInvalidFilespec(__LINE__, strFilespec, "Cannot overwrite non-config file.");
		} else {
			std::string strType = XGDaemonCommonXmlUtil::get_CLT_RL_TYPE(xiInput);
			if (!(strType == "" || strType == XML_CLT_RL_TYPE_EDITED || strType == XML_CLT_RL_TYPE_RUNTIME)) {
				std::string strDesc = "Allowed types: ";
				strDesc += XML_CLT_RL_TYPE_EDITED;
				strDesc += ", ";
				strDesc += XML_CLT_RL_TYPE_RUNTIME;
				ei.setInfoInvalidType(__LINE__, strType, strDesc);
			} else {
				std::string strError;
				const std::string strHeader = XORP_CONFIG_FILE_HEADER;
				const std::string & strConfig = (strType == XML_CLT_RL_TYPE_RUNTIME) ? ssiSession.getXLink().getSlaveConfigTreeSync().show_unannotated_tree(false) : ssiSession.getXLink().getSlaveConfigTreeEdit().show_unannotated_tree(false);
				std::string strSave = strHeader + strConfig;
				if (XGDaemonUtil::saveFileContents(strFilespec, strSave, strError) == false) {
					ei.setInfoInvalidFilespec(__LINE__, strFilespec, strError);
				} else {
					chown(strFilespec.c_str(), ssiSession.getXLink().getUid(), XGDaemonXorpUtil::getGidXorp());
				}
			}
		}
	}
	*/
}
void XGDaemonServer::doPrepareResponse_Remove(ErrorInfo & ei, const XmlInfo & xiInput, ConfigTreeNode & ctnContext, uid_t uid) const {
	const std::string & strRemoveChildIdConfig = XGDaemonCommonXmlUtil::get_CLT_RL_REMOVE(xiInput);
	unsigned long idConfig = XGDaemonUtil::getValueStrUL_Hex(strRemoveChildIdConfig, CONFIG_ID_UNKNOWN);
	if (idConfig == CONFIG_ID_UNKNOWN) {
		ei.setInfoNoData(__LINE__);
	} else {
		ConfigTreeNode * p_ctnChild = XGDaemonXorpUtil::findChildByIdConfig(ctnContext, idConfig);
		if (p_ctnChild == NULL) {
			ei.setInfoInvalidContext(__LINE__, ctnContext.path() + "/ID=" + strRemoveChildIdConfig);
		} else {
			if (p_ctnChild->deleted()) {
				ei.setInfoUnableToDeleteAD(__LINE__);
			} else {
				p_ctnChild->mark_subtree_for_deletion(uid);
			}
		}
	}
}
void XGDaemonServer::doPrepareResponse_RemoveContext(ConfigTreeNode & ctnContext, uid_t uid) const {
	ctnContext.mark_subtree_for_deletion(uid);
}
void XGDaemonServer::doPrepareResponse_Revert(
		ErrorInfo & ei,
		ServerSessions & sessions,
		ServerSessionInfo & ssiSession) const {
	std::string strResponse;
	if (sessions.revert(ssiSession, strResponse) == false) {
		ei.setInfoUnableToRevert(__LINE__, strResponse);
	}
}
void XGDaemonServer::doPrepareResponse_Set(
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ServerSessionInfo & ssiSession,
		ContextLocation & clContext,
		const TemplateTreeNode & ttnContext,
		SlaveConfigTreeNode * & p_sctnContext,
		const ConfigTree & ctSync,
		const bool flagRemoveDefault) const {

	const XmlNodeElement * p_xne_c_RL_CONTEXT_SYB_NODES = XGDaemonCommonXmlUtil::getXNE_CLT_RL_CONTEXT_SYB_NODES(xiInput);
	if (p_xne_c_RL_CONTEXT_SYB_NODES == NULL) return;

	std::map<unsigned long, OpVal, std::greater<unsigned long> > mapSetAll, mapSetBlank, mapSetNonBlank;
	retrMapSybNodes(*p_xne_c_RL_CONTEXT_SYB_NODES, false, mapSetAll, mapSetBlank, mapSetNonBlank);

	int idClient = ssiSession.getXLink().getIdClient();
	uid_t uid = ssiSession.getXLink().getUid();
	{
		NodeAdditionError nae;
		p_sctnContext = XGDaemonXorpUtil::createPath(clContext, ssiSession.getXLink().getTemplateTree(), ssiSession.getXLink().getSlaveConfigTreeEdit(), idClient, uid, nae);
		if (p_sctnContext == NULL) {
			XGDaemonXorpUtil::setErrorInfoUnableToAdd(__LINE__, ei, nae);
			return;
		}
	}
	{
		std::map<unsigned long, OpVal, std::greater<std::string> >::const_iterator i = mapSetAll.begin();
		const std::map<unsigned long, OpVal, std::greater<std::string> >::const_iterator iEnd = mapSetAll.end();
		while (i != iEnd) {
			unsigned long idTemplateSet = i->first;
			const std::string & strValue = i->second.getConstValue();
			TemplateTreeNode * p_ttnTarget = XGDaemonXorpUtil::findChildByIdTemplate(ttnContext, idTemplateSet);
			if (p_ttnTarget == NULL) {
				std::string strContextHere = ttnContext.path();
				strContextHere += "/ID=";
				strContextHere += XGDaemonUtil::getStrReprUL_Hex(idTemplateSet, true);
				ei.setInfoInvalidContext(__LINE__, strContextHere);
			} else {
				bool flagMultiNode = XGDaemonXorpUtil::isMultiNode(*p_ttnTarget);
				if (flagMultiNode) {
					if (strValue.length() == 0) {
						if (flagRemoveDefault) {
							ei.setInfoUnableToDeleteMWN(__LINE__);
						} else {
							ei.setInfoUnableToAddNoName(__LINE__);
						}
					} else {
						NodeAdditionError nae;
						ConfigTreeNode * p_ctnNew = XGDaemonXorpUtil::createSlaveConfigTreeNode(
										*p_sctnContext,
										*p_ttnTarget,
										strValue,
										idClient,
										uid,
										nae);
						if (p_ctnNew == NULL) {
							XGDaemonXorpUtil::setErrorInfoUnableToAdd(__LINE__, ei, nae);
						}
					}
				} else {
					ConfigTreeNode * p_ctnTarget = XGDaemonXorpUtil::findChildByTemplateTreeNode(*p_sctnContext, *p_ttnTarget);
					if (p_ctnTarget == NULL) {
						if ((!flagRemoveDefault) || (((!p_ttnTarget->has_default() && strValue.length() > 0) || (p_ttnTarget->has_default() && strValue != p_ttnTarget->default_str())) || i->second.getConstOperator().length() > 0)) {
							NodeAdditionError nae;
							ConfigTreeNode * p_ctnNew = XGDaemonXorpUtil::createSlaveConfigTreeNode(
												*p_sctnContext,
												*p_ttnTarget,
												p_ttnTarget->segname(),
												idClient,
												uid,
												nae);
							if (p_ctnNew == NULL) {
								XGDaemonXorpUtil::setErrorInfoUnableToAdd(__LINE__, ei, nae);
							} else {
								std::string strErrorMsg;
								if (XGDaemonXorpUtil::setOpVal(*p_ctnNew, i->second, uid) == false) {
									ei.setInfoUnableToSetValue(__LINE__, strErrorMsg);
								}

							}
						}
					} else {
						std::string strErrorMsg;
						if (XGDaemonXorpUtil::setOpVal(*p_ctnTarget, i->second, uid) == false) {
							ei.setInfoUnableToSetValue(__LINE__, strErrorMsg);
						} else {
							if (flagRemoveDefault) {
								if (((!p_ttnTarget->has_default() && strValue.length() == 0) || (p_ttnTarget->has_default() && strValue == p_ttnTarget->default_str())) && ((p_ctnTarget->get_operator() == OP_NONE) || (p_ctnTarget->get_operator() == OP_ASSIGN && XGDaemonXorpUtil::isAssignOpOnly(*p_ctnTarget)))) {
									const ConfigTreeNode * p_ctnSync = XGDaemonXorpUtil::findSyncNode(ctSync, *p_ctnTarget);
									if (p_ctnSync == NULL || p_ctnSync->value() != strValue) p_ctnTarget->mark_subtree_for_deletion(uid);
								} else if (p_ctnTarget->deleted()) {
									p_ctnTarget->undelete();
								}
							}
						}
					}
				}
			}
			i++;
		}
	}
}
void XGDaemonServer::doPrepareResponse_Submit(
		ErrorInfo & ei,
		const XmlInfo & xiInput,
		ServerSessionInfo & ssiSession,
		ConfigTreeNode & ctnContext) const {

	const XmlNodeElement * p_xne_c_RL_CONTEXT_SYB_NODES = XGDaemonCommonXmlUtil::getXNE_CLT_RL_CONTEXT_SYB_NODES(xiInput);
	if (p_xne_c_RL_CONTEXT_SYB_NODES != NULL) {
		std::map<unsigned long, OpVal, std::greater<unsigned long> > mapSubmitAll, mapSubmitBlank, mapSubmitNonBlank;
		retrMapSybNodes(*p_xne_c_RL_CONTEXT_SYB_NODES, true, mapSubmitAll, mapSubmitBlank, mapSubmitNonBlank);

		int idClient = ssiSession.getXLink().getIdClient();
		uid_t uid = ssiSession.getXLink().getUid();

		std::map<unsigned long, OpVal, std::greater<std::string> >::const_iterator i = mapSubmitAll.begin();
		const std::map<unsigned long, OpVal, std::greater<std::string> >::const_iterator iEnd = mapSubmitAll.end();
		while (i != iEnd) {
			unsigned long idConfig = i->first;
			const std::string & strValue = i->second.getConstValue();

			ConfigTreeNode * p_ctnChild = NULL;
			p_ctnChild = XGDaemonXorpUtil::findChildByIdConfig(ctnContext, idConfig);

			if (p_ctnChild == NULL) {
				std::string strContextHere = ctnContext.path();
				strContextHere += "/ID=";
				strContextHere += idConfig;
				ei.setInfoInvalidContext(__LINE__, strContextHere);
			} else {
				if (XGDaemonXorpUtil::isMultiNode(*p_ctnChild)) {
					const std::string strNewName = strValue;
					if (strNewName != p_ctnChild->segname()) {	// Name changed.
						SlaveConfigTreeNode * p_sctnChild = dynamic_cast<SlaveConfigTreeNode*>(p_ctnChild);
						if (p_sctnChild == NULL) throw std::logic_error("Expected non-NULL SlaveConfigTreeNode");

						if (strNewName.length() == 0) {
							ei.setInfoUnableToAddNoName(__LINE__);
						} else {
							NodeAdditionError nae;
							ConfigTreeNode * p_ctn = XGDaemonXorpUtil::copyConfigTreeNode(*p_sctnChild, strNewName, idClient, uid, nae);
							if (p_ctn == NULL) {
								XGDaemonXorpUtil::setErrorInfoUnableToAdd(__LINE__, ei, nae);
							} else {
								p_ctnChild->mark_subtree_for_deletion(uid);
							}
						}
					}
				} else {
					if (XGDaemonXorpUtil::isContextSwitch(*p_ctnChild)) {
						ei.setInfoUnableToSetValueCS(__LINE__, p_ctnChild->path());
					} else {
						std::string strErrorMsg;
						if (XGDaemonXorpUtil::setOpVal(*p_ctnChild, i->second, uid) == false) {
							ei.setInfoUnableToSetValue(__LINE__, strErrorMsg);
						}
					}
				}
			}
			i++;
		}
	}
}

void XGDaemonServer::doPrepareResponse_Undelete(ErrorInfo & ei, const XmlInfo & xiInput, ConfigTreeNode & ctnContext, uid_t uid) const {
	const std::string & strUndeleteChildIdConfig = XGDaemonCommonXmlUtil::get_CLT_RL_UNDELETE_CONFIG_ID(xiInput);
	const std::string & strUndeleteChildValue = XGDaemonCommonXmlUtil::get_CLT_RL_UNDELETE_VALUE(xiInput);

	unsigned long idConfig = XGDaemonUtil::getValueStrUL_Hex(strUndeleteChildIdConfig, CONFIG_ID_UNKNOWN);
	if (idConfig == CONFIG_ID_UNKNOWN) {
		ei.setInfoNoData(__LINE__);
	} else {
		ConfigTreeNode * p_ctnChild = XGDaemonXorpUtil::findChildByIdConfig(ctnContext, idConfig);
		if (p_ctnChild == NULL) {
			ei.setInfoInvalidContext(__LINE__, ctnContext.path() + "/ID=" + strUndeleteChildIdConfig);
		} else {
			if ((!XGDaemonXorpUtil::isMultiNode(*p_ctnChild)) && (!p_ctnChild->is_tag())) p_ctnChild->set_value_without_verification(strUndeleteChildValue, uid);

			ConfigTreeNode * p_ctnUndelete = p_ctnChild;
			while (p_ctnUndelete != NULL) {
				p_ctnUndelete->undelete();
				p_ctnUndelete = p_ctnUndelete->parent();
			}
		}
	}
}


void XGDaemonServer::generateXML_ChildContextInfo(XmlNodeElement & xneRLSybNodes, const std::list<ChildContextInfo*> & listChildren) const {
	std::list<ChildContextInfo*>::const_iterator i = listChildren.begin();
	const std::list<ChildContextInfo*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		const ChildContextInfo * p_cciChild = *i;
		if (p_cciChild != NULL) {
			generateXML_GeneralContextInfo(xneRLSybNodes, *p_cciChild, true);
		}
		i++;
	}
}
void XGDaemonServer::generateXML_ContextValueInfo(XmlNodeElement & xne_s_RL_SZZ_NODES_NODE, const ContextValueInfo & cvi) const {
	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE);

	const std::list<std::string> & listAllowedOperators = cvi.getConstListAllowedOperators();
	const std::map<std::pair<int64_t, int64_t>, std::string> & mapAllowedRanges = cvi.getConstMapAllowedRanges();
	const std::map<std::string, std::string> & mapAllowedValues = cvi.getConstMapAllowedValues();
	if (listAllowedOperators.size() > 0 || mapAllowedRanges.size() > 0 || mapAllowedValues.size() > 0) {
		XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED);
		{
			std::list<std::string>::const_iterator i = listAllowedOperators.begin();
			const std::list<std::string>::const_iterator iEnd = listAllowedOperators.end();
			while (i != iEnd) {
				const std::string & strAllowedOperator = *i;
				XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_OP = xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_OP);
				xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_OP.addText(strAllowedOperator);
				i++;
			}
		}
		{
			std::map<std::pair<int64_t, int64_t>, std::string>::const_iterator i = mapAllowedRanges.begin();
			const std::map<std::pair<int64_t, int64_t>, std::string>::const_iterator iEnd = mapAllowedRanges.end();
			while (i != iEnd) {
				const std::pair<int64_t, int64_t> & range = i->first;
				const std::string & strHelp = i->second;

				XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE = xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE);

				XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MIN = xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MIN);
				xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MIN.addText(XGDaemonUtil::getStrReprInt(range.first));

				XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MAX = xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MAX);
				xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MAX.addText(XGDaemonUtil::getStrReprInt(range.second));

				XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE_HELP = xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_HELP);
				xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_RANGE_HELP.addText(strHelp);

				i++;
			}
		}
		{
			std::map<std::string, std::string>::const_iterator i = mapAllowedValues.begin();
			const std::map<std::string, std::string>::const_iterator iEnd = mapAllowedValues.end();
			while (i != iEnd) {
				const std::string & strValue = i->first;
				const std::string & strHelp = i->second;
	
				XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_ITEM = xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM);
	
				XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_ITEM_VALUE = xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_ITEM.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_VALUE);
				xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_ITEM_VALUE.addText(strValue);
	
				XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_ITEM_HELP = xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_ITEM.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_HELP);
				xne_s_RL_SZZ_NODES_NODE_VALUE_ALLOWED_ITEM_HELP.addText(strHelp);
	
				i++;
			}
		}
	}

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_CURRENT = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_CURRENT);
	xne_s_RL_SZZ_NODES_NODE_VALUE_CURRENT.addText(cvi.getConstCurrent().getConstValue());

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_CURRENT_OP = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_CURRENT_OP);
	xne_s_RL_SZZ_NODES_NODE_VALUE_CURRENT_OP.addText(cvi.getConstCurrent().getConstOperator());

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_CURRENT_EXISTS = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_CURRENT_EXISTS);
	xne_s_RL_SZZ_NODES_NODE_VALUE_CURRENT_EXISTS.addText(XGDaemonUtil::getStrReprBool(cvi.getFlagCurrentExists()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_DEF = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_DEF);
	xne_s_RL_SZZ_NODES_NODE_VALUE_DEF.addText(cvi.getDefaultValue());

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_DEF_EXISTS = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_DEF_EXISTS);
	xne_s_RL_SZZ_NODES_NODE_VALUE_DEF_EXISTS.addText(XGDaemonUtil::getStrReprBool(cvi.getFlagDefaultExists()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_ERROR_DESC = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_ERROR_DESC);
	xne_s_RL_SZZ_NODES_NODE_VALUE_ERROR_DESC.addText(cvi.getConstVV().getConstInvalidValueDesc());

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_HIDE = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_HIDE);
	xne_s_RL_SZZ_NODES_NODE_VALUE_HIDE.addText(XGDaemonUtil::getStrReprBool(cvi.getFlagHide()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_INVALID = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_INVALID);
	xne_s_RL_SZZ_NODES_NODE_VALUE_INVALID.addText(XGDaemonUtil::getStrReprBool(cvi.getConstVV().getFlagInvalid()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_VALUE_INVALID_DESC = xne_s_RL_SZZ_NODES_NODE_VALUE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_VALUE_INVALID_DESC);
	xne_s_RL_SZZ_NODES_NODE_VALUE_INVALID_DESC.addText(cvi.getConstVV().getConstInvalidValueDesc());
}
void XGDaemonServer::generateXML_GeneralContextInfo(XmlNodeElement & xne_s_RL_SzzNodes, const GeneralContextInfo & gci, bool flagShallowPathOnly) const {
	XmlNodeElement & xne_s_RL_SzzNodesNode = xne_s_RL_SzzNodes.addChildElement(XML_SRV_RL_ZZ_NODES_NODE);

	XmlNodeElement & xne_s_RL_SzzNodesNodeName = xne_s_RL_SzzNodesNode.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_NAME);
	xne_s_RL_SzzNodesNodeName.addText(gci.getName());

	XmlNodeElement & XML_s_RL_ZZ_NODES_NODE_PATH = xne_s_RL_SzzNodesNode.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_PATH);
	XML_s_RL_ZZ_NODES_NODE_PATH.addText(gci.getContextLocation().getPathRepr(true));

	if (!flagShallowPathOnly) {
		XmlNodeElement & XML_s_RL_ZZ_NODES_NODE_EPATH = xne_s_RL_SzzNodesNode.obtainChildElement(XML_SRV_RL_ZZ_NODES_NODE_EPATH);
		generateXML_Context_Segments(XML_s_RL_ZZ_NODES_NODE_EPATH, gci.getContextLocation().getConstVectorContextSegmentsExistant());

		XmlNodeElement & XML_s_RL_ZZ_NODES_NODE_NEPATH = xne_s_RL_SzzNodesNode.obtainChildElement(XML_SRV_RL_ZZ_NODES_NODE_NEPATH);
		generateXML_Context_Segments(XML_s_RL_ZZ_NODES_NODE_NEPATH, gci.getContextLocation().getConstVectorContextSegmentsNonExistant());
	}

	XmlNodeElement & xne_s_RL_SzzNodesNodeTemplateId = xne_s_RL_SzzNodesNode.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_TEMPLATE_ID);
	xne_s_RL_SzzNodesNodeTemplateId.addText(gci.getStrIdTemplate(), true);

	XmlNodeElement & xne_s_RL_SzzNodesNodeConfigId = xne_s_RL_SzzNodesNode.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_CONFIG_ID);
	xne_s_RL_SzzNodesNodeConfigId.addText(gci.getStrIdConfig(), true);

	XmlNodeElement & xne_s_RL_SzzNodesNodeMultiNode = xne_s_RL_SzzNodesNode.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_MULTI_NODE);
	xne_s_RL_SzzNodesNodeMultiNode.addText(XGDaemonUtil::getStrReprBool(gci.getFlagMultiNode()));

	generateXML_InnerContextInfo(xne_s_RL_SzzNodesNode, gci.getICI());
}
void XGDaemonServer::generateXML_InnerContextInfo(XmlNodeElement & xne_s_RL_SZZ_NODES_NODE, const InnerContextInfo & ici) const {
	bool flagContextSwitch  = ici.getFlagContextSwitch();
	bool flagMandatory      = ici.getFlagMandatory();
	bool flagRequired       = ici.getFlagRequired();
	bool flagUserHidden     = ici.getFlagUserHidden();

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_CONTEXT_SWITCH = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_CONTEXT_SWITCH);
	xne_s_RL_SZZ_NODES_NODE_CONTEXT_SWITCH.addText(XGDaemonUtil::getStrReprBool(flagContextSwitch));

	if (flagContextSwitch) {
		XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_TOTAL_E_CHILDREN = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_TOTAL_ECHILDREN);
		xne_s_RL_SZZ_NODES_NODE_TOTAL_E_CHILDREN.addText(XGDaemonUtil::getStrReprInt(ici.getTotalEChildren()));

		XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_TOTAL_E_CHILDREN_CS = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_TOTAL_ECHILDREN_CS);
		xne_s_RL_SZZ_NODES_NODE_TOTAL_E_CHILDREN_CS.addText(XGDaemonUtil::getStrReprInt(ici.getTotalEChildrenCS()));

		XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_TOTAL_NE_CHILDREN = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_TOTAL_NECHILDREN);
		xne_s_RL_SZZ_NODES_NODE_TOTAL_NE_CHILDREN.addText(XGDaemonUtil::getStrReprInt(ici.getTotalNEChildren()));

		XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_TOTAL_NE_CHILDREN_CS = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_TOTAL_NECHILDREN_CS);
		xne_s_RL_SZZ_NODES_NODE_TOTAL_NE_CHILDREN_CS.addText(XGDaemonUtil::getStrReprInt(ici.getTotalNEChildrenCS()));
	}

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_DATA_TYPE = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_DATA_TYPE);
	xne_s_RL_SZZ_NODES_NODE_DATA_TYPE.addText(ici.getDataType());

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_DEPRECATED = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_DEPRECATED);
	xne_s_RL_SZZ_NODES_NODE_DEPRECATED.addText(XGDaemonUtil::getStrReprBool(ici.getFlagDeprecated()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_DEPRECATED_REASON = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_DEPRECATED_REASON);
	xne_s_RL_SZZ_NODES_NODE_DEPRECATED_REASON.addText(ici.getDeprecatedReason());

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_HELP_STRING = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_HELP_STRING);
	xne_s_RL_SZZ_NODES_NODE_HELP_STRING.addText(ici.getHelpString());

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_MANDATORY = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_MANDATORY);
	xne_s_RL_SZZ_NODES_NODE_MANDATORY.addText(XGDaemonUtil::getStrReprBool(flagMandatory));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_REQUIRED = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_REQUIRED);
	xne_s_RL_SZZ_NODES_NODE_REQUIRED.addText(XGDaemonUtil::getStrReprBool(flagRequired));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_USER_HIDDEN = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_USER_HIDDEN);
	xne_s_RL_SZZ_NODES_NODE_USER_HIDDEN.addText(XGDaemonUtil::getStrReprBool(flagUserHidden));

	generateXML_ContextValueInfo(xne_s_RL_SZZ_NODES_NODE, ici.getConstContextValueInfo());
	generateXML_NStatInfo(xne_s_RL_SZZ_NODES_NODE, ici.getConstNStatInfo());
	generateXML_SubInfo(xne_s_RL_SZZ_NODES_NODE, ici.getConstSubInfo());
}
void XGDaemonServer::generateXML_NStatInfo(XmlNodeElement & xne_s_RL_SZZ_NODES_NODE, const NStatInfo & nsi) const {
	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_NSTAT = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_NSTAT);

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_NSTAT_ADDED = xne_s_RL_SZZ_NODES_NODE_NSTAT.addChildElement(XML_SRV_RL_ZZ_NSTAT_ADDED);
	xne_s_RL_SZZ_NODES_NODE_NSTAT_ADDED.addText(XGDaemonUtil::getStrReprBool(nsi.getFlagAdded()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_NSTAT_CHANGED = xne_s_RL_SZZ_NODES_NODE_NSTAT.addChildElement(XML_SRV_RL_ZZ_NSTAT_CHANGED);
	xne_s_RL_SZZ_NODES_NODE_NSTAT_CHANGED.addText(XGDaemonUtil::getStrReprBool(nsi.getFlagChanged()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_NSTAT_DELETED = xne_s_RL_SZZ_NODES_NODE_NSTAT.addChildElement(XML_SRV_RL_ZZ_NSTAT_DELETED);
	xne_s_RL_SZZ_NODES_NODE_NSTAT_DELETED.addText(XGDaemonUtil::getStrReprBool(nsi.getFlagDeleted()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_NSTAT_INVALID = xne_s_RL_SZZ_NODES_NODE_NSTAT.addChildElement(XML_SRV_RL_ZZ_NSTAT_INVALID);
	xne_s_RL_SZZ_NODES_NODE_NSTAT_INVALID.addText(XGDaemonUtil::getStrReprBool(nsi.getFlagInvalid()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_NSTAT_MISSING_REQUIRED = xne_s_RL_SZZ_NODES_NODE_NSTAT.addChildElement(XML_SRV_RL_ZZ_NSTAT_MISSING_REQUIRED);
	xne_s_RL_SZZ_NODES_NODE_NSTAT_MISSING_REQUIRED.addText(XGDaemonUtil::getStrReprBool(nsi.getFlagMissingRequired()));

}
void XGDaemonServer::generateXML_SubInfo(XmlNodeElement & xne_s_RL_SZZ_NODES_NODE, const SubInfo & si) const {
	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_SUB = xne_s_RL_SZZ_NODES_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_NODE_SUB);

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_SUB_ADDED = xne_s_RL_SZZ_NODES_NODE_SUB.addChildElement(XML_SRV_RL_ZZ_SUB_ADDED);
	xne_s_RL_SZZ_NODES_NODE_SUB_ADDED.addText(XGDaemonUtil::getStrReprBool(si.getFlagHasAddedChildren()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_SUB_CHANGED = xne_s_RL_SZZ_NODES_NODE_SUB.addChildElement(XML_SRV_RL_ZZ_SUB_CHANGED);
	xne_s_RL_SZZ_NODES_NODE_SUB_CHANGED.addText(XGDaemonUtil::getStrReprBool(si.getFlagHasChangedChildren()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_SUB_DELETED = xne_s_RL_SZZ_NODES_NODE_SUB.addChildElement(XML_SRV_RL_ZZ_SUB_DELETED);
	xne_s_RL_SZZ_NODES_NODE_SUB_DELETED.addText(XGDaemonUtil::getStrReprBool(si.getFlagHasDeletedChildren()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_SUB_INVALID = xne_s_RL_SZZ_NODES_NODE_SUB.addChildElement(XML_SRV_RL_ZZ_SUB_INVALID);
	xne_s_RL_SZZ_NODES_NODE_SUB_INVALID.addText(XGDaemonUtil::getStrReprBool(si.getFlagHasInvalidChildren()));

	XmlNodeElement & xne_s_RL_SZZ_NODES_NODE_SUB_MISSING_REQUIRED = xne_s_RL_SZZ_NODES_NODE_SUB.addChildElement(XML_SRV_RL_ZZ_SUB_MISSING_REQUIRED);
	xne_s_RL_SZZ_NODES_NODE_SUB_MISSING_REQUIRED.addText(XGDaemonUtil::getStrReprBool(si.getFlagHasMissingRequiredChildren()));
}

void XGDaemonServer::generateXML_Context(
		XmlInfo & xiOutput,
		const ParentContextInfo & pciContext) const {

	const ContextLocation & clContext = pciContext.getConstContextLocation();

	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);
	XmlNodeElement & xne_s_RL_SESSION = xne_s_RL.obtainChildElement(XML_SRV_RL_SESSION);
	XmlNodeElement & xne_s_RL_SESSION_CONTEXT = xne_s_RL_SESSION.obtainChildElement(XML_SRV_RL_SESSION_CONTEXT);

	XmlNodeElement & xne_s_RL_SESSION_CONTEXT_PATH = xne_s_RL_SESSION_CONTEXT.obtainChildElement(XML_SRV_RL_SESSION_CONTEXT_PATH);
	xne_s_RL_SESSION_CONTEXT_PATH.addText(clContext.getPathRepr(true));

	XmlNodeElement & xne_s_RL_SESSION_CONTEXT_EPATH = xne_s_RL_SESSION_CONTEXT.obtainChildElement(XML_SRV_RL_SESSION_CONTEXT_EPATH);
	generateXML_Context_Segments(xne_s_RL_SESSION_CONTEXT_EPATH, clContext.getConstVectorContextSegmentsExistant());

	XmlNodeElement & xne_s_RL_SESSION_CONTEXT_NEPATH = xne_s_RL_SESSION_CONTEXT.obtainChildElement(XML_SRV_RL_SESSION_CONTEXT_NEPATH);
	generateXML_Context_Segments(xne_s_RL_SESSION_CONTEXT_NEPATH, clContext.getConstVectorContextSegmentsNonExistant());


	std::list<ChildContextInfo*> listChildrenAll;
	pciContext.retrListChildrenAll(listChildrenAll);

	XmlNodeElement & xne_s_RL_SESSION_CONTEXT_SYB_NODES = xne_s_RL_SESSION_CONTEXT.obtainChildElement(XML_SRV_RL_SESSION_CONTEXT_SYB_NODES);
	generateXML_ChildContextInfo(xne_s_RL_SESSION_CONTEXT_SYB_NODES, listChildrenAll);
}
void XGDaemonServer::generateXML_Context_Segments(
	XmlNodeElement & xne_s_RL_CONTEXT_ZZ_PATH,
	const std::vector<ContextSegment> & vectorContextSegments) const {

	std::vector<ContextSegment>::const_iterator i = vectorContextSegments.begin();
	const std::vector<ContextSegment>::const_iterator iEnd = vectorContextSegments.end();

	while (i != iEnd) {
		const ContextSegment & csChild = *i;		
		const NStatInfo & nsi = csChild.getNStatInfo();
		const SubInfo & si = csChild.getSubInfo();

		XmlNodeElement & xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT = xne_s_RL_CONTEXT_ZZ_PATH.addChildElement(XML_SRV_RL_ZZ_PATH_SEGMENT);

		XmlNodeElement & xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT_NAME = xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT.addChildElement(XML_SRV_RL_ZZ_PATH_SEGMENT_NAME);
		xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT_NAME.addText(csChild.getName());

		XmlNodeElement & xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT_MULTI = xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT.addChildElement(XML_SRV_RL_ZZ_PATH_SEGMENT_MULTI);
		xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT_MULTI.addText(XGDaemonUtil::getStrReprBool(csChild.getFlagMulti()));

		XmlNodeElement & xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT_CONFIG_ID = xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT.addChildElement(XML_SRV_RL_ZZ_PATH_SEGMENT_CONFIG_ID);
		xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT_CONFIG_ID.addText(XGDaemonUtil::getStrReprUL_Hex(csChild.getIdConfig(), true));

		XmlNodeElement & xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT_TEMPLATE_ID = xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT.addChildElement(XML_SRV_RL_ZZ_PATH_SEGMENT_TEMPLATE_ID);
		xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT_TEMPLATE_ID.addText(XGDaemonUtil::getStrReprUL_Hex(csChild.getIdTemplate(), true));

		generateXML_NStatInfo(xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT, nsi);
		generateXML_SubInfo(xne_s_RL_CONTEXT_ZZ_PATH_SEGMENT, si);

		i++;
	}
}
void XGDaemonServer::generateXML_Error(XmlInfo & xiOutput, const ErrorInfo & ei) const {

	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);

	XmlNodeElement & xne_s_RL_ERROR = xne_s_RL.addChildElement(XML_SRV_RL_ERROR);

	XmlNodeElement & xne_s_RL_ERROR_LINE = xne_s_RL_ERROR.addChildElement(XML_SRV_RL_ERROR_LINE);
	xne_s_RL_ERROR_LINE.addText(XGDaemonUtil::getStrReprInt(ei.getLine()));

	XmlNodeElement & xne_s_RL_ERROR_ID = xne_s_RL_ERROR.addChildElement(XML_SRV_RL_ERROR_ID);
	xne_s_RL_ERROR_ID.addText(XGDaemonUtil::getStrReprInt(ei.getCodeError()));

	XmlNodeElement & xne_s_RL_ERROR_DESC = xne_s_RL_ERROR.addChildElement(XML_SRV_RL_ERROR_DESC);
	xne_s_RL_ERROR_DESC.addText(ei.getDesc());
}
void XGDaemonServer::generateXML_Exec(
		XmlInfo & xiOutput,
		const XorpExecStatusInfo & xesi,
		const unsigned long indexOutputFrom,
		const bool flagOutputPre) const {

	const std::string & strOutputRaw = flagOutputPre ? xesi.getOutputPre() : xesi.getOutput();
	std::string strOutput;

	if (indexOutputFrom < strOutputRaw.length()) {
		 strOutput = strOutputRaw.substr(indexOutputFrom);
	}

	xiOutput.clear();

	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);

	XmlNodeElement & xne_s_RL_EXEC_STATUS = xne_s_RL.addChildElement(XML_SRV_RL_EXEC_STATUS);

	XmlNodeElement & xne_s_RL_EXEC_STATUS_BRIEF = xne_s_RL_EXEC_STATUS.addChildElement(XML_SRV_RL_EXEC_STATUS_BRIEF);
	generateXML_ZZ_Brief(xne_s_RL_EXEC_STATUS_BRIEF, xesi);

	XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED = xne_s_RL_EXEC_STATUS.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED);

	XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_OUTPUT = xne_s_RL_EXEC_STATUS_DETAILED.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_OUTPUT);
	xne_s_RL_EXEC_STATUS_DETAILED_OUTPUT.addText("." + strOutput + ".");

	XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_OUTPUT_FROM = xne_s_RL_EXEC_STATUS_DETAILED.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_OUTPUT_FROM);
	xne_s_RL_EXEC_STATUS_DETAILED_OUTPUT_FROM.addText(XGDaemonUtil::getStrReprUL(indexOutputFrom));

	const XorpOpCmd & xoc = xesi.getConstXorpOpCmd();
	const OpCmdName & ocn = xoc.getConstOpCmdName();
	
	if (ocn.getNameSegment(0) == "show" &&
		ocn.getNameSegment(1) == "route" &&
		ocn.getNameSegment(2) == "table" &&
		ocn.getNameSegment(3) == "ipv4" &&
		ocn.getNameSegment(4) == "unicast" &&
		ocn.getNameSegment(5) == "static" &&
		ocn.getNameSegment(6) == "detail") {
			
		StaticRoute4UDataList dl;
		dl.parse(strOutput);

		XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_DATA = xne_s_RL_EXEC_STATUS_DETAILED.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_DATA);

		const std::list<StaticRoute4UData> & listSR4U = dl.getConstList();
		std::list<StaticRoute4UData>::const_iterator i = listSR4U.begin();
		const std::list<StaticRoute4UData>::const_iterator iEnd = listSR4U.end();
		while (i != iEnd) {
			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U = xne_s_RL_EXEC_STATUS_DETAILED_DATA.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U);

			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_NETWORK = xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_NETWORK);
			xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_NETWORK.addText(i->getNetwork());

			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_NEXTHOP = xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_NEXTHOP);
			xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_NEXTHOP.addText(i->getNexthop());

			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_INTERFACE = xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_INTERFACE);
			xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_INTERFACE.addText(i->getInterface());

			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_VIF = xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_VIF);
			xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_VIF.addText(i->getVif());

			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_METRIC = xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_METRIC);
			xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_METRIC.addText(i->getMetric());

			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_PROTOCOL = xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_PROTOCOL);
			xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_PROTOCOL.addText(i->getProtocol());

			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_ADMIN_DISTANCE = xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_ADMIN_DISTANCE);
			xne_s_RL_EXEC_STATUS_DETAILED_DATA_SR4U_ADMIN_DISTANCE.addText(i->getAdminDistance());

			i++;
		}

		DataMatrix * p_dm = dl.getDataMatrix();
		if (p_dm != NULL) {
			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA = xne_s_RL_EXEC_STATUS_DETAILED.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA);

			unsigned long totalColumns = p_dm->getTotalColumns();
			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_TOTAL_COLS = xne_s_RL_EXEC_STATUS_DETAILED_TDATA.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_TOTAL_COLS);
			xne_s_RL_EXEC_STATUS_DETAILED_TDATA_TOTAL_COLS.addText(XGDaemonUtil::getStrReprUL(totalColumns));

			unsigned long totalRows = p_dm->getTotalRows();
			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_TOTAL_ROWS = xne_s_RL_EXEC_STATUS_DETAILED_TDATA.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_TOTAL_ROWS);
			xne_s_RL_EXEC_STATUS_DETAILED_TDATA_TOTAL_ROWS.addText(XGDaemonUtil::getStrReprUL(totalRows));

			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_HEADER = xne_s_RL_EXEC_STATUS_DETAILED_TDATA.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_HEADER);
			for (unsigned long i = 0 ; i < totalColumns; i++) {
				XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL = xne_s_RL_EXEC_STATUS_DETAILED_TDATA_HEADER.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL);

				XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL_NUM = xne_s_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL_NUM);
				xne_s_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL_NUM.addText(XGDaemonUtil::getStrReprUL(i+1));

				XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL_NAME = xne_s_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL_NAME);
				xne_s_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL_NAME.addText(p_dm->getHeader(i));
			}

			XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS = xne_s_RL_EXEC_STATUS_DETAILED_TDATA.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS);
			for (unsigned long i = 0 ; i < totalRows; i++) {
				XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW = xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW);

				XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_NUM = xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_NUM);
				xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_NUM.addText(XGDaemonUtil::getStrReprUL(i+1));

				XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS = xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS);

				for (unsigned long j = 0 ; j < totalColumns; j++) {
					XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL = xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL);

					XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL_NUM = xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL_NUM);
					xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL_NUM.addText(XGDaemonUtil::getStrReprUL(j+1));

					XmlNodeElement & xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL_VAL = xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL.addChildElement(XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL_VAL);
					xne_s_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL_VAL.addText(p_dm->getRowColumn(i, j));
				}
			}
		}
	}
}
void XGDaemonServer::generateXML_Execs(
		XmlInfo & xiOutput,
		const ServerSessionInfo & ssiSession) const {

	xiOutput.clear();

	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);

	XmlNodeElement & xne_s_RL_EXECS = xne_s_RL.addChildElement(XML_SRV_RL_EXECS);

	int totalExecutions = ssiSession.getTotalExecutions();
	for (int i = 0; i < totalExecutions; i++) {
		const BriefExecStatusInfo & besi = ssiSession.getBrief(i);

		XmlNodeElement & xne_s_RL_EXECS_BRIEF = xne_s_RL_EXECS.addChildElement(XML_SRV_RL_EXECS_BRIEF);
		generateXML_ZZ_Brief(xne_s_RL_EXECS_BRIEF, besi);
	}
}
void XGDaemonServer::generateXML_ExecQuery(
		XmlInfo & xiOutput,
		const XorpOpCmd & xoc) const
	{

	xiOutput.clear();

	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);

	XmlNodeElement & xne_s_RL_EXEC_QUERY = xne_s_RL.addChildElement(XML_SRV_RL_EXEC_QUERY);

	XmlNodeElement & xne_s_RL_EXEC_QUERY_ACTION = xne_s_RL_EXEC_QUERY.addChildElement(XML_SRV_RL_EXEC_QUERY_ACTION);
	xne_s_RL_EXEC_QUERY_ACTION.addText(xoc.getAction());

	XmlNodeElement & xne_s_RL_EXEC_QUERY_COMMAND_ID = xne_s_RL_EXEC_QUERY.addChildElement(XML_SRV_RL_EXEC_QUERY_COMMAND_ID);
	xne_s_RL_EXEC_QUERY_COMMAND_ID.addText(XGDaemonUtil::getStrReprUL_Hex(xoc.getId(), true));

	XmlNodeElement & xne_s_RL_EXEC_QUERY_COMMAND_TYPE = xne_s_RL_EXEC_QUERY.addChildElement(XML_SRV_RL_EXEC_QUERY_COMMAND_TYPE);
	switch (xoc.getType()) {
	case OCT_EXPANDED:
		xne_s_RL_EXEC_QUERY_COMMAND_TYPE.addText(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_EXPANDED);
		break;
	case OCT_NON_EXPANDED:
		xne_s_RL_EXEC_QUERY_COMMAND_TYPE.addText(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_NON_EXPANDED);
		break;
	default:
		xne_s_RL_EXEC_QUERY_COMMAND_TYPE.addText(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_REGULAR);
	}

	XmlNodeElement & xne_s_RL_EXEC_QUERY_HELP_STRING = xne_s_RL_EXEC_QUERY.addChildElement(XML_SRV_RL_EXEC_QUERY_HELP_STRING);
	xne_s_RL_EXEC_QUERY_HELP_STRING.addText(xoc.getHelpString());

	XmlNodeElement & xne_s_RL_EXEC_QUERY_MODULE = xne_s_RL_EXEC_QUERY.addChildElement(XML_SRV_RL_EXEC_QUERY_MODULE);
	xne_s_RL_EXEC_QUERY_MODULE.addText(xoc.getModule());

	XmlNodeElement & xne_s_RL_EXEC_QUERY_NAME = xne_s_RL_EXEC_QUERY.addChildElement(XML_SRV_RL_EXEC_QUERY_NAME);
	xne_s_RL_EXEC_QUERY_NAME.addText(xoc.getConstOpCmdName().getName());


	XmlNodeElement & xne_s_RL_EXEC_QUERY_ARGS = xne_s_RL_EXEC_QUERY.addChildElement(XML_SRV_RL_EXEC_QUERY_ARGS);

	unsigned int totalCNS = xoc.getConstOpCmdName().getTotalSegments();
	for (unsigned int i = 0; i < totalCNS; i++) {
		const CommandNameSegment * p_cns = xoc.getConstOpCmdName().getConstSegment(i);
		if (p_cns != NULL) {
			XmlNodeElement & xne_s_RL_EXEC_QUERY_ARGS_ARG = xne_s_RL_EXEC_QUERY_ARGS.addChildElement(XML_SRV_RL_EXEC_QUERY_ARGS_ARG);

			XmlNodeElement & xne_s_RL_EXEC_QUERY_ARGS_ARG_DYNAMIC = xne_s_RL_EXEC_QUERY_ARGS_ARG.addChildElement(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_DYNAMIC);
			xne_s_RL_EXEC_QUERY_ARGS_ARG_DYNAMIC.addText(XGDaemonUtil::getStrReprBool(p_cns->isDynamic()));

			XmlNodeElement & xne_s_RL_EXEC_QUERY_ARGS_ARG_NAME = xne_s_RL_EXEC_QUERY_ARGS_ARG.addChildElement(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_NAME);
			xne_s_RL_EXEC_QUERY_ARGS_ARG_NAME.addText(p_cns->getName());

			XmlNodeElement & xne_s_RL_EXEC_QUERY_ARGS_ARG_NO_VALUES = xne_s_RL_EXEC_QUERY_ARGS_ARG.addChildElement(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_NO_VALUES);
			xne_s_RL_EXEC_QUERY_ARGS_ARG_NO_VALUES.addText(XGDaemonUtil::getStrReprBool(p_cns->getFlagNoValues()));

			XmlNodeElement & xne_s_RL_EXEC_QUERY_ARGS_ARG_NUM = xne_s_RL_EXEC_QUERY_ARGS_ARG.addChildElement(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_NUM);
			xne_s_RL_EXEC_QUERY_ARGS_ARG_NUM.addText(XGDaemonUtil::getStrReprUInt(i+1));

			const std::list<std::string> & listAllowedValues = p_cns->getConstListAllowedValues();
			if (listAllowedValues.size() > 0) {
				XmlNodeElement & xne_s_RL_EXEC_QUERY_ARGS_ARG_ALLOWED = xne_s_RL_EXEC_QUERY_ARGS_ARG.addChildElement(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED);

				std::list<std::string>::const_iterator i = listAllowedValues.begin();
				std::list<std::string>::const_iterator iEnd = listAllowedValues.end();
				while (i != iEnd) {
					XmlNodeElement & xne_s_RL_EXEC_QUERY_ARGS_ARG_ALLOWED_ITEM = xne_s_RL_EXEC_QUERY_ARGS_ARG_ALLOWED.addChildElement(XML_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED_ITEM);
					xne_s_RL_EXEC_QUERY_ARGS_ARG_ALLOWED_ITEM.addText(*i);
					i++;
				}
			}
		}
	}
}
void XGDaemonServer::generateXML_Invalid(
		XmlInfo & xiOutput,
		const ServerSessionInfo & ssiSession) const
	{
	XorpBasicContextInfos xbciInvalid;
	XGDaemonXorpUtil::retrInvalid(
				xbciInvalid,
				ssiSession.getConstXLink().getConstSlaveConfigTreeEdit().const_root_node());

	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);
	XmlNodeElement & xne_s_RL_SESSION = xne_s_RL.obtainChildElement(XML_SRV_RL_SESSION);
	XmlNodeElement & xne_s_RL_SESSION_INVALID_NODES = xne_s_RL_SESSION.obtainChildElement(XML_SRV_RL_SESSION_INVALID_NODES);

	generateXML_Invalid_Nodes(xne_s_RL_SESSION_INVALID_NODES, xbciInvalid);
}
void XGDaemonServer::generateXML_Invalid_Nodes(
		XmlNodeElement & xne_s_RL_SESSION_INVALID_NODES,
		const XorpBasicContextInfos & xbciNodes) const
	{
	for (int i = 0; i < xbciNodes.getTotal(); i++) {
		const XorpBasicContextInfo & xbci = xbciNodes.get(i);
		XmlNodeElement & xne_s_RL_SESSION_MODS_INVALID_NODES_INVALID_NODE = xne_s_RL_SESSION_INVALID_NODES.addChildElement(XML_SRV_RL_SESSION_INVALID_NODES_INVALID_NODE);
		XmlNodeElement & xne_s_RL_SESSION_MODS_INVALID_NODES_INVALID_NODE_PATH = xne_s_RL_SESSION_MODS_INVALID_NODES_INVALID_NODE.addChildElement(XML_SRV_RL_SESSION_INVALID_NODES_INVALID_NODE_PATH);
		xne_s_RL_SESSION_MODS_INVALID_NODES_INVALID_NODE_PATH.addText(xbci.getPath());
	}
}

void XGDaemonServer::generateXML_Mods(
		XmlInfo & xiOutput,
		const ServerSessionInfo & ssiSession) const
	{
	XorpModContextInfos xmciAdded;
	XGDaemonXorpUtil::retrMods(
				MOD_ADDED,
				xmciAdded,
				ssiSession.getConstXLink().getConstTemplateTree(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeSync(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeEdit(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeEdit().const_root_node());

	XorpModContextInfos xmciChanged;
	XGDaemonXorpUtil::retrMods(
				MOD_CHANGED,
				xmciChanged,
				ssiSession.getConstXLink().getConstTemplateTree(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeSync(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeEdit(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeEdit().const_root_node());

	XorpModContextInfos xmciDeleted;
	XGDaemonXorpUtil::retrMods(
				MOD_DELETED,
				xmciDeleted,
				ssiSession.getConstXLink().getConstTemplateTree(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeSync(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeEdit(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeEdit().const_root_node());

	XorpModContextInfos xmciMissing;
	XGDaemonXorpUtil::retrModsMissing(
				xmciMissing,
				ssiSession.getConstXLink().getConstTemplateTree(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeSync(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeEdit(),
				ssiSession.getConstXLink().getConstSlaveConfigTreeSync().const_root_node());

	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);
	XmlNodeElement & xne_s_RL_SESSION = xne_s_RL.obtainChildElement(XML_SRV_RL_SESSION);
	XmlNodeElement & xne_s_RL_SESSION_MODS = xne_s_RL_SESSION.obtainChildElement(XML_SRV_RL_SESSION_MODS);

	XmlNodeElement & xne_s_RL_SESSION_MODS_ADDED_NODES = xne_s_RL_SESSION_MODS.obtainChildElement(XML_SRV_RL_SESSION_MODS_ADDED_NODES);
	generateXML_Mods_Nodes(xne_s_RL_SESSION_MODS_ADDED_NODES, xmciAdded);

	XmlNodeElement & xne_s_RL_SESSION_MODS_CHANGED_NODES = xne_s_RL_SESSION_MODS.obtainChildElement(XML_SRV_RL_SESSION_MODS_CHANGED_NODES);
	generateXML_Mods_Nodes(xne_s_RL_SESSION_MODS_CHANGED_NODES, xmciChanged);

	XmlNodeElement & xne_s_RL_SESSION_MODS_DELETED_NODES = xne_s_RL_SESSION_MODS.obtainChildElement(XML_SRV_RL_SESSION_MODS_DELETED_NODES);
	generateXML_Mods_Nodes(xne_s_RL_SESSION_MODS_DELETED_NODES, xmciDeleted);

	XmlNodeElement & xne_s_RL_SESSION_MODS_MISSING_NODES = xne_s_RL_SESSION_MODS.obtainChildElement(XML_SRV_RL_SESSION_MODS_MISSING_NODES);
	generateXML_Mods_Nodes(xne_s_RL_SESSION_MODS_MISSING_NODES, xmciMissing);

	XorpModSegment xmsRoot;
	XGDaemonXorpUtil::retrModSegments(xmciAdded, xmsRoot);
	XGDaemonXorpUtil::retrModSegments(xmciChanged, xmsRoot);
	XGDaemonXorpUtil::retrModSegments(xmciDeleted, xmsRoot);
	XGDaemonXorpUtil::retrModSegments(xmciMissing, xmsRoot);

	generateXML_Mods_Segment(xne_s_RL_SESSION_MODS, xmsRoot);
}
void XGDaemonServer::generateXML_Mods_Nodes(
		XmlNodeElement & xne_s_RL_SESSION_MODS_ZZ_NODES,
		const XorpModContextInfos & xmciNodes) const
	{
	for (int i = 0; i < xmciNodes.getTotal(); i++) {
		const XorpBasicContextInfo & xmci = xmciNodes.get(i);
		XmlNodeElement & xne_s_RL_SESSION_MODS_ZZ_NODES_MOD_NODE = xne_s_RL_SESSION_MODS_ZZ_NODES.addChildElement(XML_SRV_RL_ZZ_NODES_MOD_NODE);
		XmlNodeElement & xne_s_RL_SESSION_MODS_ZZ_NODES_MOD_NODE_PATH = xne_s_RL_SESSION_MODS_ZZ_NODES_MOD_NODE.addChildElement(XML_SRV_RL_ZZ_NODES_MOD_NODE_PATH);
		xne_s_RL_SESSION_MODS_ZZ_NODES_MOD_NODE_PATH.addText(xmci.getPath());
	}
}
void XGDaemonServer::generateXML_Mods_Segment(
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT,
		ModSegment & ms) const
	{
	XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT = xne_s_RL_SESSION_MODS_PARENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT);

	XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_NAME = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_NAME);
	xne_s_RL_SESSION_MODS_PARENT_SEGMENT_NAME.addText(ms.getName());

	ModType mt =  ms.getModType();
	if (mt != MOD_NONE) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MOD = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_MOD);
		switch (mt) {
		case MOD_ADDED:
			xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MOD.addText(XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_ADDED);
			break;
		case MOD_CHANGED:
			xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MOD.addText(XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_CHANGED);
			break;
		case MOD_DELETED:
			xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MOD.addText(XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_DELETED);
			break;
		case MOD_MISSING:
			xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MOD.addText(XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_MISSING);
			break;
		default:
			throw std::logic_error("Unknown type.");
		}
	}

	if (ms.getFlagInvalid()) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_INVALID = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_INVALID);
		xne_s_RL_SESSION_MODS_PARENT_SEGMENT_INVALID.addText(XGDaemonUtil::getStrReprBool(true));
	}
	if (ms.getFlagMissReq()) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MISS_REQ = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_MISS_REQ);
		xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MISS_REQ.addText(XGDaemonUtil::getStrReprBool(true));
	}
	if (ms.getFlagMultiCh()) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MULTI_CH = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_MULTI_CH);
		xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MULTI_CH.addText(XGDaemonUtil::getStrReprBool(true));
	}
	if (ms.hasValue()) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_VALUE = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_VALUE);
		xne_s_RL_SESSION_MODS_PARENT_SEGMENT_VALUE.addText(ms.getValue());
	}

	const std::list<ModSegment*> & listChildren = ms.getConstChildren();
	std::list<ModSegment*>::const_iterator i = listChildren.begin();
	const std::list<ModSegment*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		ModSegment * p_msChild = *i;
		if (p_msChild != NULL) {
			generateXML_Mods_Segment(xne_s_RL_SESSION_MODS_PARENT_SEGMENT, *p_msChild);
		}
		i++;
	}
}
/*
void XGDaemonServer::generateXML_Mods_Segment(
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT,
		const ConfigTree & ctSync,
		const ConfigTreeNode & ctnSegment) const
	{

	NStatInfo nsi;
	XGDaemonXorpUtil::retrNStatInfo(ctSync, ctnSegment, nsi);
	if (!nsi.getFlagAdded() && !nsi.getFlagChanged() && !nsi.getFlagDeleted() && !nsi.getFlagInvalid() && !nsi.getFlagMissingRequired()) {
		SubInfo si;
		XGDaemonXorpUtil::retrSubInfo(ctSync, ctnSegment, si);
		if (!si.getFlagHasAddedChildren() && !si.getFlagHasChangedChildren() && !si.getFlagHasDeletedChildren() && !si.getFlagHasInvalidChildren() && !si.getFlagHasMissingRequiredChildren()) return;		
	}

	XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT = xne_s_RL_SESSION_MODS_PARENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT);

	const std::string & strSegment = ctnSegment.segname();
	if (strSegment.length() > 0) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_NAME = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_NAME);
		xne_s_RL_SESSION_MODS_PARENT_SEGMENT_NAME.addText(strSegment);
	}

	if (nsi.getFlagAdded() || nsi.getFlagChanged() || nsi.getFlagDeleted()) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MOD = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_MOD);
		if (nsi.getFlagAdded()) {
			xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MOD.addText(XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_ADDED);
		} else if (nsi.getFlagChanged()) {
			xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MOD.addText(XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_CHANGED);
		} else if (nsi.getFlagDeleted()) {
			xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MOD.addText(XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_DELETED);
		}
	}
	if (nsi.getFlagInvalid()) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_INVALID = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_INVALID);
		xne_s_RL_SESSION_MODS_PARENT_SEGMENT_INVALID.addText(XGDaemonUtil::getStrReprBool(true));
	}
	if (nsi.getFlagMissingRequired()) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MISS_REQ = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_MISS_REQ);
		xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MISS_REQ.addText(XGDaemonUtil::getStrReprBool(true));
	}

	if (ctnSegment.has_value()) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_VALUE = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_VALUE);
		xne_s_RL_SESSION_MODS_PARENT_SEGMENT_VALUE.addText(ctnSegment.value());
	}

	if (XGDaemonXorpUtil::determineIfChildrenMulti(ctnSegment)) {
		XmlNodeElement & xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MULTICH = xne_s_RL_SESSION_MODS_PARENT_SEGMENT.addChildElement(XML_SRV_RL_SESSION_MODS_SEGMENT_MULTICH);
		xne_s_RL_SESSION_MODS_PARENT_SEGMENT_MULTICH.addText(XGDaemonUtil::getStrReprBool(true));
	}

	std::list<ConfigTreeNode*> listChildren = ctnSegment.const_children();
	listChildren.sort(XGDaemonXorpUtil::compareIfALessThanB);
	std::list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
	std::list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		const ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			generateXML_Mods_Segment(xne_s_RL_SESSION_MODS_PARENT_SEGMENT, ctSync, *p_ctnChild);
		}
		i++;
	}
}
*/
void XGDaemonServer::generateXML_OpCommands(
		XmlInfo & xiOutput,
		const XorpOpCmds & xocs) const
	{
	xiOutput.clear();

	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);
	XmlNodeElement & xne_s_RL_OP_COMMANDS = xne_s_RL.addChildElement(XML_SRV_RL_OP_COMMANDS);

	generateXML_OpCommands_List(xne_s_RL_OP_COMMANDS, xocs.getConstListBasic());
	generateXML_OpCommands_List(xne_s_RL_OP_COMMANDS, xocs.getConstListExtra());
}
void XGDaemonServer::generateXML_OpCommands_List(
		XmlNodeElement & xne_s_RL_OP_COMMANDS,
		const std::list<XorpOpCmd*> & listXOC) const
	{

	std::list<XorpOpCmd*>::const_iterator i = listXOC.begin();
	std::list<XorpOpCmd*>::const_iterator iEnd = listXOC.end();

	while (i != iEnd) {
		XorpOpCmd * p_xoc = *i;

		if (p_xoc != NULL) {
			XmlNodeElement & xne_s_RL_OP_COMMANDS_OP_COMMAND = xne_s_RL_OP_COMMANDS.addChildElement(XML_SRV_RL_OP_COMMANDS_OP_COMMAND);			

			XmlNodeElement & xne_s_RL_OP_COMMANDS_OP_COMMAND_COMMAND_ID = xne_s_RL_OP_COMMANDS_OP_COMMAND.addChildElement(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_COMMAND_ID);
			xne_s_RL_OP_COMMANDS_OP_COMMAND_COMMAND_ID.addText(XGDaemonUtil::getStrReprUL_Hex(p_xoc->getId(), true));

			XmlNodeElement & xne_s_RL_OP_COMMANDS_OP_COMMAND_NAME = xne_s_RL_OP_COMMANDS_OP_COMMAND.addChildElement(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_NAME);
			xne_s_RL_OP_COMMANDS_OP_COMMAND_NAME.addText(p_xoc->getConstOpCmdName().getName());

			XmlNodeElement & xne_s_RL_OP_COMMANDS_OP_COMMAND_HELP_STRING = xne_s_RL_OP_COMMANDS_OP_COMMAND.addChildElement(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_HELP_STRING);
			xne_s_RL_OP_COMMANDS_OP_COMMAND_HELP_STRING.addText(p_xoc->getHelpString());

			XmlNodeElement & xne_s_RL_OP_COMMANDS_OP_COMMAND_MODULE = xne_s_RL_OP_COMMANDS_OP_COMMAND.addChildElement(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_MODULE);
			xne_s_RL_OP_COMMANDS_OP_COMMAND_MODULE.addText(p_xoc->getModule());

			XmlNodeElement & xne_s_RL_OP_COMMANDS_OP_COMMAND_ACTION = xne_s_RL_OP_COMMANDS_OP_COMMAND.addChildElement(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_ACTION);
			xne_s_RL_OP_COMMANDS_OP_COMMAND_ACTION.addText(p_xoc->getAction());

			XmlNodeElement & xne_s_RL_OP_COMMANDS_OP_COMMAND_TYPE = xne_s_RL_OP_COMMANDS_OP_COMMAND.addChildElement(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE);
			OpCmdType oct = p_xoc->getType();
			switch (oct) {
			case OCT_EXPANDED:
				xne_s_RL_OP_COMMANDS_OP_COMMAND_TYPE.addText(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_EXPANDED);
				break;
			case OCT_NON_EXPANDED:
				xne_s_RL_OP_COMMANDS_OP_COMMAND_TYPE.addText(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_NON_EXPANDED);
				break;
			default:
				xne_s_RL_OP_COMMANDS_OP_COMMAND_TYPE.addText(XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_REGULAR);
			}
		}
		i++;
	}
}
void XGDaemonServer::generateXML_ServerSessionInfo(XmlInfo & xiOutput, const ServerSessionInfo & ssi) const {

	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);

	XmlNodeElement & xne_s_RL_SESSION = xne_s_RL.obtainChildElement(XML_SRV_RL_SESSION);

	XmlNodeElement &  xne_s_RL_SESSION_ID = xne_s_RL_SESSION.addChildElement(XML_SRV_RL_SESSION_ID);
	xne_s_RL_SESSION_ID.addText(ssi.getConstSessionId().getStr());
	
	XmlNodeElement & xne_s_RL_SESSION_STATUS = xne_s_RL_SESSION.obtainChildElement(XML_SRV_RL_SESSION_STATUS);

	XmlNodeElement & xne_s_RL_SESSION_STATUS_CAN_COMMIT = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_CAN_COMMIT);
	xne_s_RL_SESSION_STATUS_CAN_COMMIT.addText(XGDaemonUtil::getStrReprBool(ssi.getConstXLink().getConstSessionStatusInfo().getFlagCanCommit()));

	XmlNodeElement & xne_s_RL_SESSION_STATUS_CONFIG_CHANGED = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_CONFIG_CHANGED);
	xne_s_RL_SESSION_STATUS_CONFIG_CHANGED.addText(XGDaemonUtil::getStrReprBool(ssi.getConstXLink().getConstSessionStatusInfo().getFlagConfigChanged()));

	XmlNodeElement & xne_s_RL_SESSION_STATUS_CONFIG_INVALID = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_CONFIG_INVALID);
	xne_s_RL_SESSION_STATUS_CONFIG_INVALID.addText(XGDaemonUtil::getStrReprBool(ssi.getConstXLink().getConstSessionStatusInfo().getFlagConfigInvalid()));

	XmlNodeElement & xne_s_RL_SESSION_STATUS_INVALID_STATE = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_INVALID_STATE);
	xne_s_RL_SESSION_STATUS_INVALID_STATE.addText(XGDaemonUtil::getStrReprBool(ssi.getConstXLink().getConstSessionStatusInfo().getFlagInvalidState()));

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_PHASE = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_PHASE);
	xne_s_RL_SESSION_STATUS_PHASE.addText(ssi.getConstXLink().getConstSessionStatusInfo().getPhase());

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TASK = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_TASK);

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TASK_DONE = xne_s_RL_SESSION_STATUS_TASK.addChildElement(XML_SRV_RL_SESSION_STATUS_TASK_DONE);
	xne_s_RL_SESSION_STATUS_TASK_DONE.addText(XGDaemonUtil::getStrReprBool(ssi.getConstXLink().getConstSessionStatusInfo().getConstCurrentTaskInfo().isDone()));

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TASK_ERROR = xne_s_RL_SESSION_STATUS_TASK.addChildElement(XML_SRV_RL_SESSION_STATUS_TASK_ERROR);
	xne_s_RL_SESSION_STATUS_TASK_ERROR.addText(XGDaemonUtil::getStrReprBool(ssi.getConstXLink().getConstSessionStatusInfo().getConstCurrentTaskInfo().isError()));

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TASK_MESSAGE = xne_s_RL_SESSION_STATUS_TASK.addChildElement(XML_SRV_RL_SESSION_STATUS_TASK_MESSAGE);
	xne_s_RL_SESSION_STATUS_TASK_MESSAGE.addText(ssi.getConstXLink().getConstSessionStatusInfo().getConstCurrentTaskInfo().getMessage());

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TASK_NAME = xne_s_RL_SESSION_STATUS_TASK.addChildElement(XML_SRV_RL_SESSION_STATUS_TASK_NAME);
	xne_s_RL_SESSION_STATUS_TASK_NAME.addText(ssi.getConstXLink().getConstSessionStatusInfo().getConstCurrentTaskInfo().getName());

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TASK_STAGE = xne_s_RL_SESSION_STATUS_TASK.addChildElement(XML_SRV_RL_SESSION_STATUS_TASK_STAGE);

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TASK_STAGE_CURRENT = xne_s_RL_SESSION_STATUS_TASK_STAGE.addChildElement(XML_SRV_RL_SESSION_STATUS_TASK_STAGE_CURRENT);
	xne_s_RL_SESSION_STATUS_TASK_STAGE_CURRENT.addText(XGDaemonUtil::getStrReprInt(ssi.getConstXLink().getConstSessionStatusInfo().getConstCurrentTaskInfo().getStageCurrent()));

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TASK_STAGE_MAX = xne_s_RL_SESSION_STATUS_TASK_STAGE.addChildElement(XML_SRV_RL_SESSION_STATUS_TASK_STAGE_MAX);
	xne_s_RL_SESSION_STATUS_TASK_STAGE_MAX.addText(XGDaemonUtil::getStrReprInt(ssi.getConstXLink().getConstSessionStatusInfo().getConstCurrentTaskInfo().getStageMax()));

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TIME_LAST_ACTIVITY = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_TIME_LAST_ACTIVITY);
	xne_s_RL_SESSION_STATUS_TIME_LAST_ACTIVITY.addText(XGDaemonUtil::getStrReprUInt(ssi.getConstXLink().getConstSessionStatusInfo().getTimeLastActivity()));

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TIME_NOW = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_TIME_NOW);
	generateXML_ZZ_TimeInfo(xne_s_RL_SESSION_STATUS_TIME_NOW, ssi.getConstXLink().getConstSessionStatusInfo().getTimeNow());
	
	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TIME_START = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_TIME_START);
	xne_s_RL_SESSION_STATUS_TIME_START.addText(XGDaemonUtil::getStrReprUInt(ssi.getConstXLink().getConstSessionStatusInfo().getTimeStart()));	

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES);
	xne_s_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES.addText(XGDaemonUtil::getStrReprUInt(ssi.getConstXLink().getConstSessionStatusInfo().getTotalConfigChanges()));

	XmlNodeElement &  xne_s_RL_SESSION_STATUS_TOTAL_CYCLES = xne_s_RL_SESSION_STATUS.addChildElement(XML_SRV_RL_SESSION_STATUS_TOTAL_CYCLES);
	xne_s_RL_SESSION_STATUS_TOTAL_CYCLES.addText(XGDaemonUtil::getStrReprUInt(ssi.getConstXLink().getConstSessionStatusInfo().getTotalCycles()));

	XmlNodeElement &  xne_s_RL_SESSION_USERNAME = xne_s_RL_SESSION.addChildElement(XML_SRV_RL_SESSION_USERNAME);
	xne_s_RL_SESSION_USERNAME.addText(ssi.getUsername());

	generateXML_Invalid(xiOutput, ssi);

	generateXML_Mods(xiOutput, ssi);
}
void XGDaemonServer::generateXML_ServerSystemInfo(XmlInfo & xiOutput, ErrorInfo & ei) const {
	static ServerSystemInfo ssi;
	if (ssi.getSNDI().readProc() == false) ei.setInfoParsingProc(__LINE__, PROC_NET_DEV);
	if (ssi.getSSI().readProc() == false) ei.setInfoParsingProc(__LINE__, PROC_STAT);
	if (ssi.readProc() == false) ei.setInfoParsingProc(__LINE__, PROC_UPTIME);
	ssi.determineTime();
	if (ei.getCodeError() == ERROR_NONE) {
		generateXML_ServerSystemInfo(xiOutput, ssi);	
	}
}
void XGDaemonServer::generateXML_ServerSystemInfo(XmlInfo & xiOutput, const ServerSystemInfo & ssi) const {
	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);

	XmlNodeElement & xne_s_RL_SYSTEM = xne_s_RL.obtainChildElement(XML_SRV_RL_SYSTEM);

	XmlNodeElement & xne_s_RL_SYSTEM_TIME = xne_s_RL_SYSTEM.addChildElement(XML_SRV_RL_SYSTEM_TIME);

	XmlNodeElement & xne_s_RL_SYSTEM_GMT_TIME = xne_s_RL_SYSTEM_TIME.addChildElement(XML_SRV_RL_SYSTEM_TIME_GMT_TIME);
	generateXML_ZZ_TimeInfo(xne_s_RL_SYSTEM_GMT_TIME, ssi.getConstTimeGMT());

	XmlNodeElement & xne_s_RL_SYSTEM_LOCAL_TIME = xne_s_RL_SYSTEM_TIME.addChildElement(XML_SRV_RL_SYSTEM_TIME_LOCAL_TIME);
	generateXML_ZZ_TimeInfo(xne_s_RL_SYSTEM_LOCAL_TIME, ssi.getConstTimeLocal());

	XmlNodeElement & xne_s_RL_SYSTEM_TIME_UPTIME = xne_s_RL_SYSTEM_TIME.addChildElement(XML_SRV_RL_SYSTEM_TIME_UPTIME);
	
	XmlNodeElement & xne_s_RL_SYSTEM_TIME_UPTIME_IDLE = xne_s_RL_SYSTEM_TIME_UPTIME.addChildElement(XML_SRV_RL_SYSTEM_TIME_UPTIME_IDLE);
	xne_s_RL_SYSTEM_TIME_UPTIME_IDLE.addText(XGDaemonUtil::getStrReprTimeT(ssi.getUptimeIdle()));
	
	XmlNodeElement & xne_s_RL_SYSTEM_TIME_UPTIME_TOTAL = xne_s_RL_SYSTEM_TIME_UPTIME.addChildElement(XML_SRV_RL_SYSTEM_TIME_UPTIME_TOTAL);
	xne_s_RL_SYSTEM_TIME_UPTIME_TOTAL.addText(XGDaemonUtil::getStrReprTimeT(ssi.getUptimeTotal()));


	XmlNodeElement & xne_s_RL_SYSTEM_NET = xne_s_RL_SYSTEM.addChildElement(XML_SRV_RL_SYSTEM_NET);
	
	XmlNodeElement & xne_s_RL_SYSTEM_NET_IN = xne_s_RL_SYSTEM_NET.addChildElement(XML_SRV_RL_SYSTEM_NET_IN);
	
	XmlNodeElement & xne_s_RL_SYSTEM_NET_IN_BYTES = xne_s_RL_SYSTEM_NET_IN.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_BYTES);
	xne_s_RL_SYSTEM_NET_IN_BYTES.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstIn().getBytes()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_IN_COMPRESSED = xne_s_RL_SYSTEM_NET_IN.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_COMPRESSED);
	xne_s_RL_SYSTEM_NET_IN_COMPRESSED.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstIn().getCompressed()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_IN_DROP = xne_s_RL_SYSTEM_NET_IN.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_DROP);
	xne_s_RL_SYSTEM_NET_IN_DROP.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstIn().getDrop()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_IN_ERRS = xne_s_RL_SYSTEM_NET_IN.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_ERRS);
	xne_s_RL_SYSTEM_NET_IN_ERRS.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstIn().getErrs()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_IN_FIFO = xne_s_RL_SYSTEM_NET_IN.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_FIFO);
	xne_s_RL_SYSTEM_NET_IN_FIFO.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstIn().getFifo()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_IN_PACKETS = xne_s_RL_SYSTEM_NET_IN.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_PACKETS);
	xne_s_RL_SYSTEM_NET_IN_PACKETS.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstIn().getPackets()));


	XmlNodeElement & xne_s_RL_SYSTEM_NET_OUT = xne_s_RL_SYSTEM_NET.addChildElement(XML_SRV_RL_SYSTEM_NET_OUT);
	XmlNodeElement & xne_s_RL_SYSTEM_NET_OUT_BYTES = xne_s_RL_SYSTEM_NET_OUT.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_BYTES);
	xne_s_RL_SYSTEM_NET_OUT_BYTES.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstOut().getBytes()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_OUT_COMPRESSED = xne_s_RL_SYSTEM_NET_OUT.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_COMPRESSED);
	xne_s_RL_SYSTEM_NET_OUT_COMPRESSED.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstOut().getCompressed()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_OUT_DROP = xne_s_RL_SYSTEM_NET_OUT.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_DROP);
	xne_s_RL_SYSTEM_NET_OUT_DROP.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstOut().getDrop()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_OUT_ERRS = xne_s_RL_SYSTEM_NET_OUT.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_ERRS);
	xne_s_RL_SYSTEM_NET_OUT_ERRS.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstOut().getErrs()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_OUT_FIFO = xne_s_RL_SYSTEM_NET_OUT.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_FIFO);
	xne_s_RL_SYSTEM_NET_OUT_FIFO.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstOut().getFifo()));

	XmlNodeElement & xne_s_RL_SYSTEM_NET_OUT_PACKETS = xne_s_RL_SYSTEM_NET_OUT.addChildElement(XML_SRV_RL_SYSTEM_NET_INO_PACKETS);
	xne_s_RL_SYSTEM_NET_OUT_PACKETS.addText(XGDaemonUtil::getStrReprUL(ssi.getConstNDI().getConstOut().getPackets()));

	const std::vector<CPUStatInfo*> & vectorCPUs = ssi.getConstSSI().getCPUs();
	if (vectorCPUs.size() > 0) {
		XmlNodeElement & xne_s_RL_SYSTEM_STAT = xne_s_RL_SYSTEM.addChildElement(XML_SRV_RL_SYSTEM_STAT);

		int index = 0;
		std::vector<CPUStatInfo*>::const_iterator i = vectorCPUs.begin();
		const std::vector<CPUStatInfo*>::const_iterator iEnd = vectorCPUs.end();
		while (i != iEnd) {
			CPUStatInfo * p_cpu = *i;
			if (p_cpu != NULL) {
				XmlNodeElement & xne_s_RL_SYSTEM_STAT_CPU = xne_s_RL_SYSTEM_STAT.addChildElement(XML_SRV_RL_SYSTEM_STAT_CPU);

				XmlNodeElement & xne_s_RL_SYSTEM_STAT_CPU_INDEX = xne_s_RL_SYSTEM_STAT_CPU.addChildElement(XML_SRV_RL_SYSTEM_STAT_CPU_INDEX);
				xne_s_RL_SYSTEM_STAT_CPU_INDEX.addText(XGDaemonUtil::getStrReprInt(index));

				XmlNodeElement & xne_s_RL_SYSTEM_STAT_CPU_USE = xne_s_RL_SYSTEM_STAT_CPU.addChildElement(XML_SRV_RL_SYSTEM_STAT_CPU_USE);
				xne_s_RL_SYSTEM_STAT_CPU_USE.addText(XGDaemonUtil::getStrReprLL(p_cpu->getDeltaUse()));

				XmlNodeElement & xne_s_RL_SYSTEM_STAT_CPU_NIC = xne_s_RL_SYSTEM_STAT_CPU.addChildElement(XML_SRV_RL_SYSTEM_STAT_CPU_NIC);
				xne_s_RL_SYSTEM_STAT_CPU_NIC.addText(XGDaemonUtil::getStrReprLL(p_cpu->getDeltaNic()));

				XmlNodeElement & xne_s_RL_SYSTEM_STAT_CPU_SYS = xne_s_RL_SYSTEM_STAT_CPU.addChildElement(XML_SRV_RL_SYSTEM_STAT_CPU_SYS);
				xne_s_RL_SYSTEM_STAT_CPU_SYS.addText(XGDaemonUtil::getStrReprLL(p_cpu->getDeltaSys()));

				XmlNodeElement & xne_s_RL_SYSTEM_STAT_CPU_IDL = xne_s_RL_SYSTEM_STAT_CPU.addChildElement(XML_SRV_RL_SYSTEM_STAT_CPU_IDL);
				xne_s_RL_SYSTEM_STAT_CPU_IDL.addText(XGDaemonUtil::getStrReprLL(p_cpu->getDeltaIdl()));

				XmlNodeElement & xne_s_RL_SYSTEM_STAT_CPU_IOW = xne_s_RL_SYSTEM_STAT_CPU.addChildElement(XML_SRV_RL_SYSTEM_STAT_CPU_IOW);
				xne_s_RL_SYSTEM_STAT_CPU_IOW.addText(XGDaemonUtil::getStrReprLL(p_cpu->getDeltaIow()));

				XmlNodeElement & xne_s_RL_SYSTEM_STAT_CPU_XXX = xne_s_RL_SYSTEM_STAT_CPU.addChildElement(XML_SRV_RL_SYSTEM_STAT_CPU_XXX);
				xne_s_RL_SYSTEM_STAT_CPU_XXX.addText(XGDaemonUtil::getStrReprLL(p_cpu->getDeltaXxx()));

				XmlNodeElement & xne_s_RL_SYSTEM_STAT_CPU_YYY = xne_s_RL_SYSTEM_STAT_CPU.addChildElement(XML_SRV_RL_SYSTEM_STAT_CPU_YYY);
				xne_s_RL_SYSTEM_STAT_CPU_YYY.addText(XGDaemonUtil::getStrReprLL(p_cpu->getDeltaYyy()));
			}
			i++;
			index++;
		}
	}
}
void XGDaemonServer::generateXML_ShowConfig(XmlInfo & xiOutput, const SlaveConfigTree & sctEdit) const {
	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);
	XmlNodeElement & xne_s_RL_OUTPUT = xne_s_RL.obtainChildElement(XML_SRV_RL_OUTPUT);
	xne_s_RL_OUTPUT.addText(XGDaemonUtil::getStrEscapedPre(sctEdit.show_tree(false)));
}
void XGDaemonServer::generateXML_Test(XmlInfo & xiOutput, const std::string & strTest) const {
	XmlNodeElement & xne_s_RL = xiOutput.setRootElement(XML_SRV_RL);

	XmlNodeElement & xne_s_RL_TEST = xne_s_RL.addChildElement(XML_SRV_RL_TEST);
	xne_s_RL_TEST.addTextNoEsc(strTest);
}
void XGDaemonServer::generateXML_ZZ_Brief(
		XmlNodeElement & xne_s_RL_ZZ_BRIEF,
		const BriefExecStatusInfo & besi) const
	{
	XmlNodeElement & xne_s_RL_ZZ_BRIEF_CACHED_CMD_LINE = xne_s_RL_ZZ_BRIEF.addChildElement(XML_SRV_RL_ZZ_BRIEF_CACHED_CMD_LINE);
	xne_s_RL_ZZ_BRIEF_CACHED_CMD_LINE.addText(besi.getCachedCommandLine());	

	XmlNodeElement & xne_s_RL_ZZ_BRIEF_EXEC_ID = xne_s_RL_ZZ_BRIEF.addChildElement(XML_SRV_RL_ZZ_BRIEF_EXEC_ID);
	xne_s_RL_ZZ_BRIEF_EXEC_ID.addText(XGDaemonUtil::getStrReprUL_Hex(besi.getId(), true));

	XmlNodeElement & xne_s_RL_ZZ_BRIEF_DONE = xne_s_RL_ZZ_BRIEF.addChildElement(XML_SRV_RL_ZZ_BRIEF_DONE);
	xne_s_RL_ZZ_BRIEF_DONE.addText(XGDaemonUtil::getStrReprBool(besi.getFlagDone()));

	XmlNodeElement & xne_s_RL_ZZ_BRIEF_DONE_MSG = xne_s_RL_ZZ_BRIEF.addChildElement(XML_SRV_RL_ZZ_BRIEF_DONE_MSG);
	xne_s_RL_ZZ_BRIEF_DONE_MSG.addText(besi.getDoneMsg());

	XmlNodeElement & xne_s_RL_ZZ_BRIEF_DONE_SUCCESS = xne_s_RL_ZZ_BRIEF.addChildElement(XML_SRV_RL_ZZ_BRIEF_DONE_SUCCESS);
	xne_s_RL_ZZ_BRIEF_DONE_SUCCESS.addText(XGDaemonUtil::getStrReprBool(besi.getFlagDoneSuccess()));

	XmlNodeElement & xne_s_RL_ZZ_BRIEF_KILL_INVOKED = xne_s_RL_ZZ_BRIEF.addChildElement(XML_SRV_RL_ZZ_BRIEF_KILL_INVOKED);
	xne_s_RL_ZZ_BRIEF_KILL_INVOKED.addText(XGDaemonUtil::getStrReprBool(besi.getFlagKillInvoked()));

	XmlNodeElement & xne_s_RL_ZZ_BRIEF_TIME_START = xne_s_RL_ZZ_BRIEF.addChildElement(XML_SRV_RL_ZZ_BRIEF_TIME_START);
	generateXML_ZZ_TimeInfo(xne_s_RL_ZZ_BRIEF_TIME_START, besi.getConstTimeStart());

	if (besi.getFlagDone()) {
		XmlNodeElement & xne_s_RL_ZZ_BRIEF_TIME_END = xne_s_RL_ZZ_BRIEF.addChildElement(XML_SRV_RL_ZZ_BRIEF_TIME_END);
		generateXML_ZZ_TimeInfo(xne_s_RL_ZZ_BRIEF_TIME_END, besi.getConstTimeEnd());
	}

	XmlNodeElement & xne_s_RL_ZZ_BRIEF_TOTAL_LINES = xne_s_RL_ZZ_BRIEF.addChildElement(XML_SRV_RL_ZZ_BRIEF_TOTAL_LINES);
	xne_s_RL_ZZ_BRIEF_TOTAL_LINES.addText(XGDaemonUtil::getStrReprUL(besi.getTotalLines()));
}
void XGDaemonServer::generateXML_ZZ_TimeInfo(XmlNodeElement & xne_s_RL_ZZ_TIME, const TimeInfo & ti) const {
	XmlNodeElement & xne_s_RL_ZZ_TIME_ASC = xne_s_RL_ZZ_TIME.addChildElement(XML_SRV_RL_ZZ_TIME_ASC);
	xne_s_RL_ZZ_TIME_ASC.addText(ti.getAsc());

	XmlNodeElement & xne_s_RL_ZZ_TIME_ASC_HOUR24 = xne_s_RL_ZZ_TIME.addChildElement(XML_SRV_RL_ZZ_TIME_ASC_HOUR24);
	xne_s_RL_ZZ_TIME_ASC_HOUR24.addText(ti.getAscHour24());

	XmlNodeElement & xne_s_RL_ZZ_TIME_ASC_MINUTE = xne_s_RL_ZZ_TIME.addChildElement(XML_SRV_RL_ZZ_TIME_ASC_MINUTE);
	xne_s_RL_ZZ_TIME_ASC_MINUTE.addText(ti.getAscMinute());

	XmlNodeElement & xne_s_RL_ZZ_TIME_UEPOCH = xne_s_RL_ZZ_TIME.addChildElement(XML_SRV_RL_ZZ_TIME_UEPOCH);
	xne_s_RL_ZZ_TIME_UEPOCH.addText(XGDaemonUtil::getStrReprTimeT(ti.getTimeUEpoch()));

	XmlNodeElement & xne_s_RL_ZZ_TIME_ZONE = xne_s_RL_ZZ_TIME.addChildElement(XML_SRV_RL_ZZ_TIME_ZONE);
	xne_s_RL_ZZ_TIME_ZONE.addText(ti.getTimeZone());
}

void XGDaemonServer::retrMapSybNodes(
	const XmlNodeElement & xne_RL_NODES,
	const bool flagConfigOrTemplate,
	std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapSybNodesAll,
	std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapSybNodesBlank,
	std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapSybNodesNonBlank) const {
	const std::list<XmlNode*> & listNodes = xne_RL_NODES.getChildren();
	std::list<XmlNode*>::const_iterator i = listNodes.begin();
	const std::list<XmlNode*>::const_iterator iEnd = listNodes.end();

	while (i != iEnd) {
		const XmlNode * p_xn = *i;
		const XmlNodeElement * p_xne = dynamic_cast<const XmlNodeElement*>(p_xn);

		if (p_xne != NULL) {
			if (p_xne->getName() == XML_SRV_RL_ZZ_NODES_NODE) {
				std::string strIdConfig;
				std::string strIdTemplate;
				std::string strOperator;
				std::string strValue;

				XmlNodeElement * p_xneConfigID = p_xne->findChildElementWithName(XML_CLT_RL_ZZ_NODES_NODE_CONFIG_ID);
				if (p_xneConfigID != NULL && p_xneConfigID->has1InternalText()) {
					strIdConfig = p_xneConfigID->get1InternalText();
				}
				XmlNodeElement * p_xneTemplateID = p_xne->findChildElementWithName(XML_CLT_RL_ZZ_NODES_NODE_TEMPLATE_ID);
				if (p_xneTemplateID != NULL && p_xneTemplateID->has1InternalText()) {
					strIdTemplate = p_xneTemplateID->get1InternalText();
				}

				XmlNodeElement * p_xneOperator = p_xne->findChildElementWithName(XML_CLT_RL_ZZ_NODES_NODE_OP);
				if (p_xneOperator != NULL && p_xneOperator->has1InternalText()) {
					strOperator = p_xneOperator->get1InternalText_UnEscaped();
				}

				XmlNodeElement * p_xneValue = p_xne->findChildElementWithName(XML_CLT_RL_ZZ_NODES_NODE_VALUE);
				if (p_xneValue != NULL && p_xneValue->has1InternalText()) {
					strValue = p_xneValue->get1InternalText();
				}

				if (flagConfigOrTemplate) {
					unsigned long idConfig = XGDaemonUtil::getValueStrUL_Hex(strIdConfig, CONFIG_ID_UNKNOWN);
					if (idConfig != CONFIG_ID_UNKNOWN) {
						mapSybNodesAll[idConfig].setOperator(strOperator);
						mapSybNodesAll[idConfig].setValue(strValue);
						if (strValue.length() == 0) {
							mapSybNodesBlank[idConfig].setOperator(strOperator);
							mapSybNodesBlank[idConfig].setValue(strValue);
						} else {
							mapSybNodesNonBlank[idConfig].setOperator(strOperator);
							mapSybNodesNonBlank[idConfig].setValue(strValue);
						}
					}
				} else {
					unsigned long idTemplate = XGDaemonUtil::getValueStrUL_Hex(strIdTemplate, CONFIG_ID_UNKNOWN);
					if (idTemplate != CONFIG_ID_UNKNOWN) {
						mapSybNodesAll[idTemplate].setOperator(strOperator);
						mapSybNodesAll[idTemplate].setValue(strValue);
						if (strValue.length() == 0) {
							mapSybNodesBlank[idTemplate].setOperator(strOperator);
							mapSybNodesBlank[idTemplate].setValue(strValue);
						} else {
							mapSybNodesNonBlank[idTemplate].setOperator(strOperator);
							mapSybNodesNonBlank[idTemplate].setValue(strValue);
						}
					}
				}
			}
		}
		i++;
	}
}


