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
 *  Module:       xgcgi.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Original XORP GUI CGI used for testing and debugging
 *
 */



#include <iostream>
#include <map>
#include <string>

#include "xgcgi.hh"
#include "html_util.hh"

#include "basic/xgdaemon_util.hh"
#include "common/context_info.hh"
#include "common/error_info.hh"
#include "common/opcmd_info.hh"
#include "common/xgdaemon_common_xml.hh"


XGCGI::XGCGI() {
}

void XGCGI::run() {

	retrPostArgs();

	SessionId siSession;
	siSession.setSessionID(getCookie(COOKIE_SESSION_ID).c_str());

	std::string strContext = m_mapParamsPost[HIDDEN_CONTEXT];
	if (strContext.length() == 0) strContext = m_mapParamsGet[XML_CLT_RL_CONTEXT];

	strContext = XGDaemonUtil::getStrUnEscapedPercent(strContext);

	const std::string & strControlCancel		= m_mapParamsPost[SUBMIT_CONTROL_CANCEL];
	const std::string & strControlCommit		= m_mapParamsPost[SUBMIT_CONTROL_COMMIT];
	const std::string & strControlExecCmd		= m_mapParamsPost[SUBMIT_CONTROL_EXEC_CMD];
	const std::string & strControlExecCmdArgs	= m_mapParamsPost[SUBMIT_CONTROL_EXEC_CMD_ARGS];
	const std::string & strControlExecKill		= m_mapParamsPost[SUBMIT_CONTROL_EXEC_KILL];
	const std::string & strControlLoad		= m_mapParamsPost[SUBMIT_CONTROL_LOAD];
	const std::string & strControlLogin		= m_mapParamsPost[SUBMIT_CONTROL_LOGIN];
	const std::string & strControlLogout		= m_mapParamsPost[SUBMIT_CONTROL_LOGOUT];
	const std::string & strControlShowConfig	= m_mapParamsPost[SUBMIT_CONTROL_SHOW_CONFIG];
	const std::string & strControlShowExecutions	= m_mapParamsPost[SUBMIT_CONTROL_SHOW_EXECUTIONS];
	const std::string & strControlShowOps		= m_mapParamsPost[SUBMIT_CONTROL_SHOW_OPS];
	const std::string & strControlRevert		= m_mapParamsPost[SUBMIT_CONTROL_REVERT];
	const std::string & strControlSave		= m_mapParamsPost[SUBMIT_CONTROL_SAVE];
	const std::string & strControlSubmit		= m_mapParamsPost[SUBMIT_CONTROL_SUBMIT];

	XGCGIErrorInfo xei = XGCGI_ERROR_UNK_ACTION;

	const std::string & strAction = m_mapParamsGet[XML_CLT_RL_ACTION];

	if (strControlCancel.length() > 0) {
		xei = doScreenActionChContext(siSession, strContext);
	} else if (strControlCommit.length() > 0) {
		xei = doScreenActionCommit(siSession, strContext);
	} else if (strControlExecCmd.length() > 0) {
		const std::string & strCommandId = m_mapParamsPost[HIDDEN_COMMAND_ID];
		unsigned long command_id = XGDaemonUtil::getValueStrUL_Hex(strCommandId, 0);
		xei = doScreenActionExecCmd(siSession, command_id);
	} else if (strControlExecCmdArgs.length() > 0) {
		const std::string & strCommandId = m_mapParamsPost[HIDDEN_COMMAND_ID];		
		unsigned long command_id = XGDaemonUtil::getValueStrUL_Hex(strCommandId, 0);

		std::map<unsigned int, std::string> mapArgs;

		const std::string & strTotalArgs =  m_mapParamsPost[HIDDEN_TOTAL_ARGS];
		unsigned int totalArgs = XGDaemonUtil::getValueStrUInt(strTotalArgs, 0);

		for (unsigned int i = 0; i < totalArgs; ++i) {
			std::string strArg = HIDDEN_ARG_ + XGDaemonUtil::getStrReprUInt(i + 1);
			const std::string & strArgValue = m_mapParamsPost[strArg];
			mapArgs[i+1] = strArgValue;
		}
		xei = doScreenActionExecCmdArgs(siSession, command_id, mapArgs);
	} else if (strControlExecKill.length() > 0) {
		const std::string & strExecId = m_mapParamsPost[HIDDEN_EXEC_ID];
		xei = doScreenActionExecKill(siSession, XGDaemonUtil::getValueStrUL_Hex(strExecId, 0));
	} else if (strControlLoad.length() > 0) {
		xei = doScreenActionLoadOrSave(true, siSession, strContext);
	} else if (strControlLogin.length() > 0) {
		xei = doScreenActionLogin(strContext);
	} else if (strControlLogout.length() > 0) {
		xei = doScreenActionLogout(siSession);
	} else if (strControlShowConfig.length() > 0) {
		xei = doScreenActionChContext(siSession, strContext);
	} else if (strControlShowExecutions.length() > 0) {
		xei = doScreenActionShowExecutions(siSession);
	} else if (strControlShowOps.length() > 0) {
		xei = doScreenActionOpCommands(siSession);
	} else if (strControlRevert.length() > 0) {
		xei = doScreenActionRevert(siSession, strContext);
	} else if (strControlSave.length() > 0) {
		xei = doScreenActionLoadOrSave(false, siSession, strContext);
	} else if (strControlSubmit.length() > 0) {
		xei = doScreenActionSubmit(siSession, strContext);
	} else {
		if (xei == XGCGI_ERROR_UNK_ACTION) {
			std::string & strCommands = m_mapParamsPost[HIDDEN_COMMANDS];
			std::list<std::string> listCommands;
			XGDaemonUtil::split_string(strCommands, ',', listCommands, true);

			std::list<std::string>::const_iterator i = listCommands.begin();
			std::list<std::string>::const_iterator iEnd = listCommands.end();
			while (i != iEnd) {
				const std::string & strCommandId = *i; 
				std::string strControlExecCmd = SUBMIT_CONTROL_EXEC_CMD_ + strCommandId;
				const std::string & strControlExecValue = m_mapParamsPost[strControlExecCmd];
				if (strControlExecValue.length() > 0) {
					unsigned long command_id = XGDaemonUtil::getValueStrUL_Hex(strCommandId, 0);
					xei = doScreenActionExecCmd(siSession, command_id);
					break;
				}

				std::string strControlExecQuery = SUBMIT_CONTROL_EXEC_CMD_QUERY_ + strCommandId;
				const std::string & strControlExecQueryValue = m_mapParamsPost[strControlExecQuery];
				if (strControlExecQueryValue.length() > 0) {
					unsigned long command_id = XGDaemonUtil::getValueStrUL_Hex(strCommandId, 0);
					xei = doScreenActionExecQuery(siSession, command_id);
					break;
				}
				i++;
			}
		}
		if (xei == XGCGI_ERROR_UNK_ACTION) {
			std::string & strFieldsExistant = m_mapParamsPost[HIDDEN_NODES_EXISTANT];

			std::list<std::string> listFieldsExistant;
			XGDaemonUtil::split_string(strFieldsExistant, ',', listFieldsExistant, true);

			std::list<std::string>::const_iterator i = listFieldsExistant.begin();
			std::list<std::string>::const_iterator iEnd = listFieldsExistant.end();
			while (i != iEnd) {
				const std::string & strFieldExistant = *i;
				
				std::string strControlRemoveExistantName = SUBMIT_CONTROL_REMOVE_ + strFieldExistant;
				const std::string & strControlRemoveExistant = m_mapParamsPost[strControlRemoveExistantName];
				if (strControlRemoveExistant.length() > 0) {
					xei = doScreenActionRemove(siSession, strContext, strFieldExistant);
					break;
				}
				
				i++;
			}
		}
		if (xei == XGCGI_ERROR_UNK_ACTION) {
			std::string & strFieldsNonExistant = m_mapParamsPost[HIDDEN_NODES_NON_EXISTANT];

			std::list<std::string> listFieldsNonExistant;
			XGDaemonUtil::split_string(strFieldsNonExistant, ',', listFieldsNonExistant, true);

			std::list<std::string>::const_iterator i = listFieldsNonExistant.begin();
			std::list<std::string>::const_iterator iEnd = listFieldsNonExistant.end();
			while (i != iEnd) {
				const std::string & strFieldNonExistantCompoundID = *i;
				std::string strFieldOp = SELECT_CONTROL_OP_ + strFieldNonExistantCompoundID;
				{
					std::string strControlAddNonExistantName = SUBMIT_CONTROL_ADD_ + strFieldNonExistantCompoundID;
					
					const std::string & strControlAddNonExistantValue = m_mapParamsPost[strControlAddNonExistantName];
					if (strControlAddNonExistantValue.length() > 0) {
						unsigned long idTemplateAdd = ContextUtil::getIdTemplateComponent(strFieldNonExistantCompoundID);
						if (idTemplateAdd != TEMPLATE_ID_UNKNOWN) {
							xei = doScreenActionAdd(siSession, strContext, idTemplateAdd, m_mapParamsPost[strFieldNonExistantCompoundID], m_mapParamsPost[strFieldOp]);
							break;
						}
					}
				}
				{
					std::string strControlUndeletePrevExistantName = SUBMIT_CONTROL_UNDELETE_ + strFieldNonExistantCompoundID;
					const std::string & strControlUndeletePrevNonExistantValue = m_mapParamsPost[strControlUndeletePrevExistantName];
					if (strControlUndeletePrevNonExistantValue.length() > 0) {
						unsigned long idConfigUndelete = ContextUtil::getIdConfigComponent(strFieldNonExistantCompoundID);
						if (idConfigUndelete != CONFIG_ID_UNKNOWN) {
							xei = doScreenActionUndelete(siSession, strContext, idConfigUndelete, m_mapParamsPost[strFieldNonExistantCompoundID], m_mapParamsPost[strFieldOp]);
							break;
						}
					}
				}

				i++;
			}
		}
		if (xei == XGCGI_ERROR_UNK_ACTION) {
			std::string & strFieldsSep = m_mapParamsPost[HIDDEN_NODES_SEP];

			std::list<std::string> listFieldsSep;
			XGDaemonUtil::split_string(strFieldsSep, ',', listFieldsSep, true);

			std::list<std::string>::const_iterator i = listFieldsSep.begin();
			std::list<std::string>::const_iterator iEnd = listFieldsSep.end();
			while (i != iEnd) {
				const std::string & strFieldSep = *i;

				std::string strControlAbsRemoveSepName = SUBMIT_CONTROL_ABS_REMOVE_ + strFieldSep;
				const std::string & strControlAbsRemoveSep = m_mapParamsPost[strControlAbsRemoveSepName];
				if (strControlAbsRemoveSep.length() > 0) {
					std::string strHiddenPathSepName = HIDDEN_PATH_ + strFieldSep;
					std::string strPathSepEscaped = m_mapParamsPost[strHiddenPathSepName];
					xei = doScreenActionAbsRemoveCommit(siSession, strContext, strPathSepEscaped);
					break;
				}
				i++;
			}
		}

		if (xei == XGCGI_ERROR_UNK_ACTION) {
			if (strAction.length() == 0 || strAction == ACTION_INIT) {
				xei = doScreenActionInit(strContext);
			} else if (strAction == ACTION_CH_CONTEXT) {
				xei = doScreenActionChContext(siSession, strContext);
			} else if (strAction == ACTION_EXEC_STATUS) {
				const std::string & strExecId = m_mapParamsGet[HIDDEN_EXEC_ID];
				xei = doScreenActionExecStatus(siSession, XGDaemonUtil::getValueStrUL_Hex(strExecId, 0));
			} else if (strAction == ACTION_OP_COMMANDS) {
				xei = doScreenActionOpCommands(siSession);
			} else if (strAction == ACTION_RESET_COMMIT) {
				xei = doScreenActionResetCommit(siSession, strContext);
			}
		}
	}

	if (xei != XGCGI_OK) generateHtmlForError(xei, strAction, strContext);
}

void XGCGI::doDisplayContextResponse(
		const SRExchangeInfo & srei,
		const ClientSessionInfo & siSession,
		const ContextLocation & clContext,
		const ErrorInfo & eiError) {

	setParamCookieSend(COOKIE_SESSION_ID, siSession.getConstSessionId().getStr());

	int codeError = eiError.getCodeError();
	if (codeError == ERROR_NONE) {

		ParentContextInfo pciContext(clContext);
		analyzeParentContextInfo(srei.m_xiReceive, pciContext);

		if (siSession.getConstSessionStatus().isIdleOrAbove() == false) {
			generateHtmlForSessionStatus(pciContext, siSession);
		} else {
			const ClientSessionStatusInfo & cssi = siSession.getConstSessionStatus();
			if (cssi.getConstCurrentTask().getTask() == TASK_COMMIT && !cssi.getConstCurrentTask().isDone()) {
				generateHtmlForCommitting(pciContext, cssi);
			} else {
				generateHtmlForContext(pciContext, siSession);
			}
		}
	} else if (codeError == ERROR_ID_UNABLE_TO_COMMIT_INV) {
		ClientSessionInfo siSession;

		std::list<GeneralContextInfo> listNodes;
		analyzeListGeneralNodes(srei.m_xiReceive, listNodes);

		generateHtmlForNodesInv(siSession.getConstSessionId(), listNodes);
	} else {
		generateHtmlForError(eiError);
	}
}
void XGCGI::doDisplayExecQuery(
//		const SRExchangeInfo & srei,
		const ClientSessionInfo & siSession,
		const OpCmd & oc,
//		unsigned long idOpCmd,
		const ErrorInfo & eiError) {

	setParamCookieSend(COOKIE_SESSION_ID, siSession.getConstSessionId().getStr());

	int codeError = eiError.getCodeError();
	if (codeError == ERROR_NONE) {		
		generateHtmlForExecQuery(siSession.getConstSessionId(), oc);
	} else {
		generateHtmlForError(eiError);
	}
}
void XGCGI::doDisplayExecResponse(
		const ClientSessionInfo & siSession,
		const ClientBriefExecStatusInfo & cbesi,
		const DetailedExecStatusInfo & desi,
		const ErrorInfo & eiError) {

	setParamCookieSend(COOKIE_SESSION_ID, siSession.getConstSessionId().getStr());

	int codeError = eiError.getCodeError();
	if (codeError == ERROR_NONE) {
		generateHtmlForExecStatus(siSession, cbesi, desi);
	} else {
		generateHtmlForError(eiError);
	}
}
void XGCGI::doDisplayExecutionsStatus(
		const ClientSessionInfo & siSession,
		const ClientExecutionsStatusInfo & cesi,
		const ErrorInfo & eiError)
	{
	setParamCookieSend(COOKIE_SESSION_ID, siSession.getConstSessionId().getStr());

	int codeError = eiError.getCodeError();
	if (codeError == ERROR_NONE) {
		generateHtmlForExecutionsStatus(siSession, cesi);
	} else {
		generateHtmlForError(eiError);
	}
}
void XGCGI::doDisplayOpCommands(
		const SessionId & siSession,
		const ClientOpCmds & oc,
		const ErrorInfo & eiError)
	{

	setParamCookieSend(COOKIE_SESSION_ID, siSession.getStr());

	int codeError = eiError.getCodeError();
	if (codeError == ERROR_NONE) {
		generateHtmlForOpCommands(siSession, oc);
	} else {
		generateHtmlForError(eiError);
	}
}

void XGCGI::generateHtml_BasicScreen() {
	XmlNodeElement & xneHtml = m_xiOutput.pushElement(ELEMENT_HTML);
	XmlNodeElement & xneHtmlHead = xneHtml.addChildElement(ELEMENT_HEAD);
	XmlNodeElement & xneHtmlHeadTitle = xneHtmlHead.addChildElement(ELEMENT_TITLE);
	XmlNodeElement & xneHtmlBody = xneHtml.addChildElement(ELEMENT_BODY);
	UNUSED(xneHtmlHeadTitle);UNUSED(xneHtmlBody);
}
void XGCGI::generateHtmlForButtonCancel(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_CANCEL);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_CANCEL);
}

void XGCGI::generateHtmlForButtonCommit(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_COMMIT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_COMMIT);
}
void XGCGI::generateHtmlForButtonLoad(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_LOAD);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_LOAD);
}
void XGCGI::generateHtmlForButtonLogin(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_LOGIN);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_LOGIN);
}
void XGCGI::generateHtmlForButtonLogout(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_LOGOUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_LOGOUT);
}
void XGCGI::generateHtmlForButtonRevert(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement("input");
	xneHtmlBodyFormInput.addAttribute("type", "submit");
	xneHtmlBodyFormInput.addAttribute("name", "control_revert");
	xneHtmlBodyFormInput.addAttribute("value", "Revert");
}
void XGCGI::generateHtmlForButtonSave(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement("input");
	xneHtmlBodyFormInput.addAttribute("type", "submit");
	xneHtmlBodyFormInput.addAttribute("name", "control_save");
	xneHtmlBodyFormInput.addAttribute("value", "Save");
}
void XGCGI::generateHtmlForButtonShowConfig(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_SHOW_CONFIG);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_SHOW_CONFIG);
}
void XGCGI::generateHtmlForButtonShowExecuted(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_SHOW_EXECUTIONS);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_SHOW_EXECUTIONS);
}
void XGCGI::generateHtmlForButtonShowOperations(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_SHOW_OPS);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_SHOW_OPS);
}
void XGCGI::generateHtmlForButtonSubmit(XmlNodeElement & xneContainer) {
	XmlNodeElement & xneHtmlBodyFormInput = xneContainer.addChildElement("input");
	xneHtmlBodyFormInput.addAttribute("type", "submit");
	xneHtmlBodyFormInput.addAttribute("name", "control_submit");
	xneHtmlBodyFormInput.addAttribute("value", "Submit");
}
void XGCGI::generateHtmlForClientModsInfo(XmlNodeElement & xneContainer, const ClientModsInfo & cmi) const {
	generateHtmlForClientModsInfo_MT(xneContainer, MOD_ADDED, cmi.getConstListNodesAdded());
	generateHtmlForClientModsInfo_MT(xneContainer, MOD_CHANGED, cmi.getConstListNodesChanged());
	generateHtmlForClientModsInfo_MT(xneContainer, MOD_DELETED, cmi.getConstListNodesDeleted());
//	generateHtmlForClientModsInfo_MT(xneContainer, MOD_INVALID, cmi.getConstListNodesInvalid());
}
void XGCGI::generateHtmlForClientModsInfo_MT(XmlNodeElement & xneContainer, ModType mt, const std::list<ClientModContextInfo> & listNodes) const {
	if (listNodes.size() > 0) {
		XmlNodeElement & xneContainerB = xneContainer.addChildElement(ELEMENT_B);
		xneContainerB.addTextNoEsc(ClientModsInfo::getDescr(mt));
		xneContainerB.addTextNoEsc(" nodes:");
		xneContainer.addChildElement(ELEMENT_BR);
		std::list<ClientModContextInfo>::const_iterator i = listNodes.begin();
		const std::list<ClientModContextInfo>::const_iterator iEnd = listNodes.end();
		while (i != iEnd) {
			const ClientModContextInfo & cmci = *i;
			xneContainer.addTextNoEsc(cmci.getPath());
			xneContainer.addChildElement(ELEMENT_BR);
			i++;
		}
		xneContainer.addChildElement(ELEMENT_P);
	}
}
void XGCGI::generateHtmlForCommitting(const ParentContextInfo & pciContext, const ClientSessionStatusInfo & cssi) {

	generateHtml_BasicScreen();

	bool flagSuccess = !cssi.getConstCurrentTask().isError();
	bool flagIsCommittingFinished = cssi.getConstCurrentTask().isDone();


	const ContextLocation clContext = pciContext.getConstContextLocation();

	XmlNodeElement & xneHtmlHead = m_xiOutput.surefind("html/head");
	if (flagIsCommittingFinished == false) {
		generateHtmlForMetaRefresh(xneHtmlHead, 3, getLinkActionChContext(clContext));
	}


	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("html/body");

	xneHtmlBody.addTextNoEsc("Committing phase ");
	xneHtmlBody.addTextNoEsc(XGDaemonUtil::getStrReprInt(cssi.getConstCurrentTask().getStageCurrent()));
	xneHtmlBody.addTextNoEsc(" of ");
	xneHtmlBody.addTextNoEsc(XGDaemonUtil::getStrReprInt(cssi.getConstCurrentTask().getStageMax()));
	xneHtmlBody.addChildElement("p");

	if (flagSuccess == false) {
		xneHtmlBody.addTextNoEsc("An error has been encountered during commit.");
		xneHtmlBody.addChildElement("p");
	}

	
	xneHtmlBody.addTextNoEsc(cssi.getConstCurrentTask().getMessage());
	xneHtmlBody.addChildElement("p");

	if (flagIsCommittingFinished == true) {
		xneHtmlBody.addTextNoEsc("Commit has finished ");
		xneHtmlBody.addTextNoEsc(flagSuccess ? "successfully." : "unsuccessfully.");
		xneHtmlBody.addChildElement("p");
		
		XmlNodeElement & xneHtmlBodyA = xneHtmlBody.addChildElement("a");
		xneHtmlBodyA.addAttribute("href", getLinkActionResetCommit(clContext));
		xneHtmlBodyA.addTextNoEsc("Click here to go back to context: ");
		xneHtmlBodyA.addTextNoEsc(clContext.getPathRepr(false));
		xneHtmlBody.addChildElement("br");
	}
}
void XGCGI::generateHtmlForContext(const ParentContextInfo& pciContext, const ClientSessionInfo & siSession) {
	generateHtml_BasicScreen();

	const ContextLocation & clContext = pciContext.getConstContextLocation();
	unsigned int lengthContext = clContext.getLength();
	const std::string & strContextPathRepr = clContext.getPathRepr(lengthContext, true);
	
	XmlNodeElement & xneHtmlHeadTitle = m_xiOutput.surefind("/html/head/title");
	xneHtmlHeadTitle.addTextNoEsc("Current context: " + strContextPathRepr);


	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("html/body");
	xneHtmlBody.addTextNoEsc("Current context: " + strContextPathRepr);

	xneHtmlBody.addChildElement("p");

	xneHtmlBody.addTextNoEsc("Config changed: ");
	xneHtmlBody.addTextNoEsc(siSession.getConstSessionStatus().getFlagConfigChanged() ? "YES" : "NO");
	xneHtmlBody.addChildElement("p");

	xneHtmlBody.addTextNoEsc("Config invalid: ");
	xneHtmlBody.addTextNoEsc(siSession.getConstSessionStatus().getFlagConfigInvalid() ? "YES" : "NO");
	xneHtmlBody.addChildElement("p");

	xneHtmlBody.addTextNoEsc("Can commit: ");
	xneHtmlBody.addTextNoEsc(siSession.getConstSessionStatus().getFlagCanCommit() ? "YES" : "NO");
	xneHtmlBody.addChildElement("p");

	XmlNodeElement & xneHtmlBodyForm = xneHtmlBody.addChildElement("form");
	xneHtmlBodyForm.addAttribute("action", "?");
	xneHtmlBodyForm.addAttribute("method", "post");


	XmlNodeElement & xneHtmlBodyFormPCommitTop = xneHtmlBodyForm.addChildElement("p");
	xneHtmlBodyFormPCommitTop.addAttribute("align", "right");
	generateHtmlForHeaderButtons(xneHtmlBodyFormPCommitTop);

	generateHtmlForHiddenField_SessionID(xneHtmlBodyForm, siSession.getConstSessionId());

	{
		XmlNodeElement & xneHtmlBodyFormInput = xneHtmlBodyForm.addChildElement("input");
		xneHtmlBodyFormInput.addAttribute("type", "hidden");
		xneHtmlBodyFormInput.addAttribute("name", "context");
		xneHtmlBodyFormInput.addAttribute("value", strContextPathRepr);
	}


	XmlNodeElement & xneHtmlBodyFormPExistant = xneHtmlBodyForm.addChildElement("p");
	unsigned int lengthExistant = clContext.getLengthExistant();
	for (unsigned int i = 0; i <= lengthExistant; i++) {
		xneHtmlBodyFormPExistant.addTextNoEsc(TEXT_TOKEN_NBSP, i*2, true);

		const ContextSegment * p_cs = (i == 0 ? NULL : & clContext.getContextSegmentExistant(i-1));
		const std::string & strPathSegment = (p_cs == NULL ? "/" : p_cs->getName());

		if (p_cs != NULL) {
			generateHtmlForSymbolsFront(xneHtmlBodyFormPExistant, *p_cs);
		}

		XmlNodeElement & xneHtmlBodyFormPExistantA = xneHtmlBodyFormPExistant.addChildElement("a");
		xneHtmlBodyFormPExistantA.addAttribute("href", getLinkActionChContext(clContext, i));
		xneHtmlBodyFormPExistantA.addTextNoEsc(strPathSegment);

		if (p_cs == NULL) {
			if (siSession.getConstSessionStatus().getFlagConfigInvalid()) {
				generateHtmlForSymbol_Invalid(xneHtmlBodyFormPExistant);
				xneHtmlBodyFormPExistant.addTextNoEsc("&nbsp;");
			}
		} else {
			generateHtmlForSymbolsBack(xneHtmlBodyFormPExistant, *p_cs);
		}

		xneHtmlBodyFormPExistant.addChildElement("br");
	}


	xneHtmlBodyForm.addChildElement("p");
	xneHtmlBodyForm.addTextNoEsc("---");
	xneHtmlBodyForm.addChildElement("p");


	XmlNodeElement & xneHtmlBodyFormPNonExistant = xneHtmlBodyForm.addChildElement("p");
	unsigned int lengthNonExistant = clContext.getLengthNonExistant();
	for (unsigned int i = 0; i < lengthNonExistant; i++) {
		xneHtmlBodyFormPNonExistant.addTextNoEsc(TEXT_TOKEN_NBSP, (lengthExistant + i) *2, true);

		const ContextSegment & cs = clContext.getContextSegmentNonExistant(i);
		const std::string & strPathSegment = cs.getName();

		generateHtmlForSymbolsFront(xneHtmlBodyFormPNonExistant, cs);

		XmlNodeElement & xneHtmlBodyFormPNonExistantA = xneHtmlBodyFormPNonExistant.addChildElement("a");
		xneHtmlBodyFormPNonExistantA.addAttribute("href", getLinkActionChContext(clContext, 1 + lengthExistant + i));
		xneHtmlBodyFormPNonExistantA.addTextNoEsc(strPathSegment);

		generateHtmlForSymbolsBack(xneHtmlBodyFormPNonExistant, cs);

		xneHtmlBodyFormPNonExistant.addChildElement("br");
	}


	generateHtmlForContext_ChildContextInfo(xneHtmlBodyFormPExistant, pciContext.getListChildrenExistant(), true, (lengthContext + 1) * 2);
	generateHtmlForContext_ChildContextInfo(xneHtmlBodyFormPExistant, pciContext.getListChildrenExistant(), false, (lengthContext + 1) * 2);


	generateHtmlForContext_ChildContextInfo(xneHtmlBodyFormPNonExistant, pciContext.getListChildrenNonExistant(), false, (lengthContext + 1) * 2);
	generateHtmlForContext_ChildContextInfo(xneHtmlBodyFormPNonExistant, pciContext.getListChildrenNonExistant(), true, (lengthContext + 1) * 2);



	XmlNodeElement & xneHtmlBodyFormPCommitBottom = xneHtmlBodyForm.addChildElement(ELEMENT_P);
	xneHtmlBodyFormPCommitBottom.addAttribute("align", "right");

	generateHtmlForHeaderButtons(xneHtmlBodyFormPCommitBottom);


	const std::string & strCompoundIDsExistant = pciContext.getCommaListWithCompoundIDs(true, false);

	XmlNodeElement & xneHtmlBodyFormInputNodesExistant = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInputNodesExistant.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_HIDDEN);
	xneHtmlBodyFormInputNodesExistant.addAttribute(ATTR_INPUT_NAME, HIDDEN_NODES_EXISTANT);
	xneHtmlBodyFormInputNodesExistant.addAttribute(ATTR_INPUT_VALUE, strCompoundIDsExistant);


	const std::string & strCompoundIDsNonExistant = pciContext.getCommaListWithCompoundIDs(false, true);

	XmlNodeElement & xneHtmlBodyFormInputNodesNonExistant = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInputNodesNonExistant.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_HIDDEN);
	xneHtmlBodyFormInputNodesNonExistant.addAttribute(ATTR_INPUT_NAME, HIDDEN_NODES_NON_EXISTANT);
	xneHtmlBodyFormInputNodesNonExistant.addAttribute(ATTR_INPUT_VALUE, strCompoundIDsNonExistant);


	XmlNodeElement & xneHtmlBodyFormPMods = xneHtmlBodyForm.addChildElement(ELEMENT_P);
	generateHtmlForClientModsInfo(xneHtmlBodyFormPMods, siSession.getConstClientModsInfo());
}
void XGCGI::generateHtmlForGeneralContextInfoTable(XmlNodeElement & xneContainer, GeneralContextInfo gci, unsigned int indentMargin) {
	const InnerContextInfo & ici = gci.getICI();

	bool flagContextSwitch = ici.getFlagContextSwitch();
	bool flagDeprecated = ici.getFlagDeprecated();
	bool flagExists = (gci.getContextLocation().getLengthNonExistant() == 0);
	bool flagRequired = ici.getFlagRequired();

	const ContextValueInfo & cvi = ici.getConstContextValueInfo();

	bool flagCurrentExists = cvi.getFlagCurrentExists();
	bool flagDefaultExists = cvi.getFlagDefaultExists();
	bool flagInvalid = cvi.getConstVV().getFlagInvalid();

	const std::list<std::string> & listAllowedOperators = cvi.getConstListAllowedOperators();
	const std::map<std::string, std::string> & mapAllowedValues = cvi.getConstMapAllowedValues();
	const std::map<std::pair<int64_t, int64_t>, std::string> & mapAllowedRanges = cvi.getConstMapAllowedRanges();

	const std::string & strCurrentOperator  = flagCurrentExists ? cvi.getConstCurrent().getConstOperator() : "";
	const std::string & strCurrentValue     = flagCurrentExists ? cvi.getConstCurrent().getConstValue() : "";
	const std::string & strDefaultValue     = flagDefaultExists ? cvi.getDefaultValue() : "";
	const std::string & strNameHere         = gci.getName();
	const std::string & strIdCompound       = gci.getStrIdCompound();

	std::string strHelp                     = ici.getHelpString();


	XmlNodeElement & xneContainerTable = xneContainer.addChildElement("table");
	xneContainerTable.addAttribute("width", "100%");
	XmlNodeElement & xneContainerTableTr = xneContainerTable.addChildElement("tr");

	XmlNodeElement & xneContainerTableTrTdName = xneContainerTableTr.addChildElement("td");
	xneContainerTableTrTdName.addAttribute("align", "left");
	xneContainerTableTrTdName.addAttribute("valign", "top");
	xneContainerTableTrTdName.addTextNoEsc(TEXT_TOKEN_NBSP, indentMargin, true);

	const ContextSegment * p_csLast = gci.getContextLocation().getPtrContextSegmentLast();
	if (p_csLast != NULL) {
		generateHtmlForSymbolsFront(xneContainerTableTrTdName, *p_csLast);
	}

	if (flagContextSwitch == false) {
		XmlNodeElement & xneContainerTableTrTdNameFont = xneContainerTableTrTdName.addChildElement("font");
		xneContainerTableTrTdNameFont.addAttribute("color", flagInvalid ? "red" : "black");

		xneContainerTableTrTdNameFont.addTextNoEsc(strNameHere);
		if (cvi.getFlagHide() == false) {
			xneContainerTableTrTdNameFont.addTextNoEsc("(");
			xneContainerTableTrTdNameFont.addTextNoEsc(ici.getDataType());
			xneContainerTableTrTdNameFont.addTextNoEsc(")");
			if (flagCurrentExists) {
				xneContainerTableTrTdNameFont.addTextNoEsc("=");
				xneContainerTableTrTdNameFont.addTextNoEsc(strCurrentValue);
			}
		}
	} else {
		bool flagMultiNode = gci.getFlagMultiNode();

		std::string strPathRepr = gci.getContextLocation().getPathRepr(false);
		if (strNameHere.length() > 0) {
			XmlNodeElement & xneContainerTableTrTdNameA = xneContainerTableTrTdName.addChildElement("a");
			xneContainerTableTrTdNameA.addAttribute("href", getLinkActionChContext(gci.getContextLocation()));
			xneContainerTableTrTdNameA.addTextNoEsc(strPathRepr);
		} else {
			xneContainerTableTrTdName.addTextNoEsc(strPathRepr);
		}

		if (flagMultiNode == true) {
			xneContainerTableTrTdName.addTextNoEsc("&nbsp;(");
			xneContainerTableTrTdName.addTextNoEsc(ici.getDataType());
			xneContainerTableTrTdName.addTextNoEsc(")");
		}

		if (p_csLast != NULL) {
			generateHtmlForSymbolsBack(xneContainerTableTrTdName, *p_csLast);
		}
	}

	if (flagDeprecated || flagRequired || flagInvalid) {
		xneContainerTableTrTdName.addChildElement("br");
		xneContainerTableTrTdName.addTextNoEsc(TEXT_TOKEN_NBSP, indentMargin, true);
		if (flagDeprecated) {
			XmlNodeElement & xneContainerTableTrTdNameB = xneContainerTableTrTdName.addChildElement("b");
			xneContainerTableTrTdNameB.addTextNoEsc("Deprecated");
			xneContainerTableTrTdNameB.addTextNoEsc(TEXT_TOKEN_NBSP, 4, true);
			XmlNodeElement & xneContainerTableTrTdNameBI = xneContainerTableTrTdNameB.addChildElement("i");
			xneContainerTableTrTdNameBI.addTextNoEsc(ici.getDeprecatedReason());
		}
		if (flagRequired) {
			XmlNodeElement & xneContainerTableTrTdNameI = xneContainerTableTrTdName.addChildElement("i");
			xneContainerTableTrTdNameI.addTextNoEsc("Required");
		}
		if (flagInvalid) {
			XmlNodeElement & xneContainerTableTrTdNameFont = xneContainerTableTrTdName.addChildElement("font");
			xneContainerTableTrTdNameFont.addAttribute("color", "red");
			xneContainerTableTrTdNameFont.addTextNoEsc(cvi.getConstVV().getConstInvalidValueDesc());
		}
	}

	XmlNodeElement & xneContainerTableTrTdInput = xneContainerTableTr.addChildElement("td");
	xneContainerTableTrTdInput.addAttribute("align", "right");
	xneContainerTableTrTdInput.addAttribute("valign", "top");

	bool flagMultiNode = gci.getFlagMultiNode();

	if ((!cvi.getFlagHide()) || (flagMultiNode && flagExists) || (flagMultiNode && strNameHere.length() == 0)) {
		if (listAllowedOperators.size() > 0) {
			std::string strIdOp = SELECT_CONTROL_OP_;
			strIdOp += strIdCompound;
			XmlNodeElement & xneContainerTableTrTdInputSelectOp = xneContainerTableTrTdInput.addChildElement(ELEMENT_SELECT);
			xneContainerTableTrTdInputSelectOp.addAttribute(ATTR_SELECT_NAME, strIdOp);
			if (flagDeprecated) xneContainerTableTrTdInputSelectOp.addAttribute(ATTR_SELECT_DISABLED, "true");

			XmlNodeElement & xneContainerTableTrTdInputSelectOpOptionNone = xneContainerTableTrTdInputSelectOp.addChildElement(ELEMENT_OPTION);
			xneContainerTableTrTdInputSelectOpOptionNone.addAttribute(ATTR_OPTION_VALUE, "");
			xneContainerTableTrTdInputSelectOpOptionNone.addTextNoEsc("-- none --");

			std::list<std::string>::const_iterator i = listAllowedOperators.begin();
			const std::list<std::string>::const_iterator iEnd = listAllowedOperators.end();
			while (i != iEnd) {
				XmlNodeElement & xneContainerTableTrTdInputSelectOpOption = xneContainerTableTrTdInputSelectOp.addChildElement(ELEMENT_OPTION);
				xneContainerTableTrTdInputSelectOpOption.addAttribute(ATTR_OPTION_VALUE, *i);
				xneContainerTableTrTdInputSelectOpOption.addTextNoEsc(*i);
				if (*i == strCurrentOperator) xneContainerTableTrTdInputSelectOpOption.addAttribute(ATTR_OPTION_SELECTED, "");
				i++;
			}
		}
		if (ici.getDataType() == "bool") {
			XmlNodeElement & xneContainerTableTrTdInputSelect = xneContainerTableTrTdInput.addChildElement("select");
			xneContainerTableTrTdInputSelect.addAttribute("name", strIdCompound);
			if (flagDeprecated) xneContainerTableTrTdInputSelect.addAttribute("disabled", "true");


			XmlNodeElement & xneContainerTableTrTdInputSelectOptionTrue = xneContainerTableTrTdInputSelect.addChildElement("option");
			xneContainerTableTrTdInputSelectOptionTrue.addAttribute("value", "true");
			xneContainerTableTrTdInputSelect.addTextNoEsc("true");


			XmlNodeElement & xneContainerTableTrTdInputSelectOptionFalse = xneContainerTableTrTdInputSelect.addChildElement("option");
			xneContainerTableTrTdInputSelectOptionFalse.addAttribute("value", "false");
			xneContainerTableTrTdInputSelect.addTextNoEsc("false");


			bool flagValue = XGDaemonUtil::getValueStrBool(strCurrentValue, false);
			if (flagValue) {
				xneContainerTableTrTdInputSelectOptionTrue.addAttribute("selected", "");
			} else {
				xneContainerTableTrTdInputSelectOptionFalse.addAttribute("selected", "");
			}
		} else {
			if (mapAllowedValues.size() == 0 /*&& mapAllowedRanges.size() == 0*/) {
				XmlNodeElement & xneContainerTableTrTdInputInput = xneContainerTableTrTdInput.addChildElement("input");
				xneContainerTableTrTdInputInput.addAttribute("type", "text");
				xneContainerTableTrTdInputInput.addAttribute("name", strIdCompound);
				xneContainerTableTrTdInputInput.addAttribute("value", flagMultiNode ? strNameHere : strCurrentValue);

				if (flagDeprecated) xneContainerTableTrTdInputInput.addAttribute("disabled", "true");
			} else {
				XmlNodeElement & xneContainerTableTrTdInputSelect = xneContainerTableTrTdInput.addChildElement("select");
				xneContainerTableTrTdInputSelect.addAttribute("name", strIdCompound);
				if (flagDeprecated) xneContainerTableTrTdInputSelect.addAttribute("disabled", "true");

				if (!flagDefaultExists) {
					XmlNodeElement & xneContainerTableTrTdInputSelectOptionValue = xneContainerTableTrTdInputSelect.addChildElement("option");
					xneContainerTableTrTdInputSelectOptionValue.addAttribute("value", "");
					xneContainerTableTrTdInputSelect.addTextNoEsc("-- none --");
					if (!flagCurrentExists) {
						xneContainerTableTrTdInputSelectOptionValue.addAttribute("selected", "");
					}
				}

				/*
					std::map<std::pair<int64_t, int64_t>, std::string>::const_iterator i = mapAllowedRanges.begin();
					const std::map<std::pair<int64_t, int64_t>, std::string>::const_iterator iEnd = mapAllowedRanges.end();
					while (i != iEnd) {
						const std::pair<int64_t, int64_t> range = i->first; 
	
						for (int64_t j = range.first; j <= range.second; j++) {
							const std::string & strValue = XGDaemonUtil::getStrReprInt(j);
							XmlNodeElement & xneContainerTableTrTdInputSelectOptionValue = xneContainerTableTrTdInputSelect.addChildElement("option");
							xneContainerTableTrTdInputSelectOptionValue.addAttribute("value", strValue);
							xneContainerTableTrTdInputSelect.addTextNoEsc(strValue);
		
							if ((flagCurrentExists && (strValue == strCurrentValue)) || (!flagCurrentExists && flagDefaultExists && (strValue == strDefaultValue))) {
								xneContainerTableTrTdInputSelectOptionValue.addAttribute("selected", "");
							}
						}

						const std::string & strHelpHere = i->second;
						if (i->second.length() > 0) {
							strHelp += "  ";
							strHelp += strHelpHere;
						}

						i++;					
					}
				*/
				{
					std::map<std::string, std::string>::const_iterator i = mapAllowedValues.begin();
					const std::map<std::string, std::string>::const_iterator iEnd = mapAllowedValues.end();
					while (i != iEnd) {
						const std::string & strValue = i->first;
	
						XmlNodeElement & xneContainerTableTrTdInputSelectOptionValue = xneContainerTableTrTdInputSelect.addChildElement("option");
						xneContainerTableTrTdInputSelectOptionValue.addAttribute("value", strValue);
						xneContainerTableTrTdInputSelect.addTextNoEsc(strValue);
	
						if ((flagCurrentExists && (strValue == strCurrentValue)) || (!flagCurrentExists && flagDefaultExists && (strValue == strDefaultValue))) {
							xneContainerTableTrTdInputSelectOptionValue.addAttribute("selected", "");
						}

						const std::string & strHelpHere = i->second;
						if (i->second.length() > 0) {
							strHelp += "<p>";
							strHelp += strValue;
							strHelp += "=";
							strHelp += strHelpHere;
						}

						i++;					
					}
				}
			}
		}
		xneContainerTableTrTdInput.addChildElement("br");
	}

	if (mapAllowedRanges.size() > 0) {
		std::map<std::pair<int64_t, int64_t>, std::string>::const_iterator i = mapAllowedRanges.begin();
		const std::map<std::pair<int64_t, int64_t>, std::string>::const_iterator iEnd = mapAllowedRanges.end();
		while (i != iEnd) {
			const std::string & strHelpHere = i->second;
			if (i->second.length() > 0) {
				if (i->second != ici.getHelpString()) {
					strHelp += "  ";
					strHelp += strHelpHere;
				}
			}
			i++;					
		}
	}

	xneContainerTableTrTdInput.addTextNoEsc(strHelp);


	XmlNodeElement & xneContainerTableTrTdButton = xneContainerTableTr.addChildElement("td");
	xneContainerTableTrTdButton.addAttribute("align", "center");
	xneContainerTableTrTdButton.addAttribute("valign", "top");
	xneContainerTableTrTdButton.addAttribute("width", "90");

	if (flagDeprecated == false) {
		if (flagExists) {
			XmlNodeElement & xneContainerTableTrTdButtonInput = xneContainerTableTrTdButton.addChildElement(ELEMENT_INPUT);
			xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);

			ChildContextInfo * p_cci = dynamic_cast<ChildContextInfo *>(&gci);
			if (p_cci == NULL) {
				xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_REMOVE_ + strIdCompound);
				xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_ABS_REMOVE);
			} else {
				xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_REMOVE_ + strIdCompound);
				xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_REMOVE);
			}
		} else {
			if (flagContextSwitch == false || flagMultiNode == true) {
				XmlNodeElement & xneContainerTableTrTdButtonInput = xneContainerTableTrTdButton.addChildElement(ELEMENT_INPUT);
				xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
				if (p_csLast != NULL && p_csLast->getNStatInfo().getFlagDeleted()) {
					xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_UNDELETE_ + strIdCompound);
					xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_UNDELETE);
				} else {
					xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_ADD_ + strIdCompound);
					xneContainerTableTrTdButtonInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_ADD);
				}
			}
		}
	}
}

void XGCGI::generateHtmlForContext_ChildContextInfo(XmlNodeElement & xneContainer, const std::list<ChildContextInfo*> &listChildren, bool flagDisplayContextSwitch, unsigned int indentMargin) {

	xneContainer.addChildElement("br");
	xneContainer.addChildElement("br");


	std::list<ChildContextInfo*>::const_iterator i = listChildren.begin();
	std::list<ChildContextInfo*>::const_iterator iEnd = listChildren.end();

	while (i != iEnd) {
		ChildContextInfo * p_cciChild  = *i;
		if (p_cciChild != NULL) {
			const struct InnerContextInfo & ici = p_cciChild->getICI();
			bool flagContextSwitch = ici.getFlagContextSwitch();
			if ((flagDisplayContextSwitch == true && flagContextSwitch == true) || (flagDisplayContextSwitch == false && flagContextSwitch == false)) {
				generateHtmlForGeneralContextInfoTable(xneContainer, *p_cciChild, indentMargin);
			}
		}
		i++;
	}
}

void XGCGI::generateHtmlForError(const ErrorInfo & eiError) {
	generateHtml_BasicScreen();

	int codeError = eiError.getCodeError();

	XmlNodeElement & xneHtmlHeadTitle = m_xiOutput.surefind("/html/head/title");
	xneHtmlHeadTitle.addTextNoEsc("Error: " + eiError.getDesc());

	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("html/body");
	xneHtmlBody.addTextNoEsc("xgdaemon returned error code: ");
	xneHtmlBody.addTextNoEsc(XGDaemonUtil::getStrReprInt(codeError));
	xneHtmlBody.addTextNoEsc("  description: ");
	xneHtmlBody.addTextNoEsc(eiError.getDesc());

	xneHtmlBody.addChildElement("p");

	if (codeError == ERROR_ID_AUTH_FAILED) {
		XmlNodeElement & xneHtmlBodyA = xneHtmlBody.addChildElement("a");
		xneHtmlBodyA.addAttribute("href", getLinkActionInit(m_mapParamsGet["context"] ));
		xneHtmlBodyA.addTextNoEsc("Click here to make a new login attempt.");
	} else if (codeError == ERROR_ID_NO_SESSION) {
		XmlNodeElement & xneHtmlBodyA = xneHtmlBody.addChildElement("a");
		xneHtmlBodyA.addAttribute("href", getLinkActionInit(m_mapParamsGet["context"] ));
		xneHtmlBodyA.addTextNoEsc("Click here to open new session.");
	} else if (codeError == ERROR_ID_INVALID_CONTEXT) {
		ContextLocation cl;
		XmlNodeElement & xneHtmlBodyA = xneHtmlBody.addChildElement("a");
		xneHtmlBodyA.addAttribute("href", getLinkActionChContext(cl));
		xneHtmlBodyA.addTextNoEsc("Click here to switch to root context.");
	}
}
void XGCGI::generateHtmlForError(const XGCGIErrorInfo xei, const std::string & strAction, const std::string & strContext) {
	generateHtml_BasicScreen();

	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("html/body");

	if (xei == XGCGI_ERROR_UNK_ACTION) {
		xneHtmlBody.addTextNoEsc("Unrecognised \"");
		xneHtmlBody.addTextNoEsc(XML_CLT_RL_ACTION);
		xneHtmlBody.addTextNoEsc("\" parameter \"");
		xneHtmlBody.addTextNoEsc(strAction);
		xneHtmlBody.addTextNoEsc("\".");
	} else if (xei == XGCGI_ERROR_COMMUNICATION) {
		xneHtmlBody.addTextNoEsc("Encountered communication error with xgdaemon.");
	} else if (xei == XGCGI_ERROR_EXEC_ID_MISSMATCH) {
		xneHtmlBody.addTextNoEsc("Encountered exec id missmatch error.");
		xneHtmlBody.addChildElement(ELEMENT_P);			
	} else if (xei == XGCGI_ERROR_SESSION_MISSMATCH) {
		xneHtmlBody.addTextNoEsc("Encountered session missmatch error.  Session does not exist or has expired.");
		xneHtmlBody.addChildElement(ELEMENT_P);			
		XmlNodeElement & xneHtmlBodyA = xneHtmlBody.addChildElement(ELEMENT_A);
		xneHtmlBodyA.addAttribute(ATTR_A_HREF, getLinkActionInit(strContext));
		xneHtmlBodyA.addTextNoEsc("Click here to re-login..."); 
	} else {
		xneHtmlBody.addTextNoEsc("Encountered unknown error.");
		xneHtmlBody.addTextNoEsc(XGDaemonUtil::getStrReprUInt(xei));
	}
}
void XGCGI::generateHtmlForExecQuery(const SessionId & siSession, const OpCmd & oc) {
	generateHtml_BasicScreen();

	XmlNodeElement & xneHtmlHeadTitle = m_xiOutput.surefind("/html/head/title");
	xneHtmlHeadTitle.addTextNoEsc("Operational command query");	

	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("html/body");

	xneHtmlBody.addTextNoEsc(oc.getConstOpCmdName().getName());
	xneHtmlBody.addChildElement("br");

	xneHtmlBody.addTextNoEsc(oc.getHelpString());
	xneHtmlBody.addChildElement("br");
	xneHtmlBody.addChildElement("p");

	XmlNodeElement & xneHtmlBodyForm = xneHtmlBody.addChildElement("form");
	xneHtmlBodyForm.addAttribute("action", "?");
	xneHtmlBodyForm.addAttribute("method", "post");

	unsigned int totalArgs = oc.getConstOpCmdName().getTotalSegments();	

	generateHtmlForHiddenField_SessionID(xneHtmlBodyForm, siSession);
	generateHtmlForHiddenField(xneHtmlBodyForm, HIDDEN_TOTAL_ARGS, XGDaemonUtil::getStrReprUInt(totalArgs)); 

	XmlNodeElement & xneHtmlBodyFormTableArgs = xneHtmlBodyForm.addChildElement("table");

	for (unsigned int i = 0; i < totalArgs; i++) {
		const CommandNameSegment * p_cns = oc.getConstOpCmdName().getConstSegment(i);
		if (p_cns != NULL) {
			bool flagDynamic = p_cns->isDynamic();

			const std::string & strArgNumber = XGDaemonUtil::getStrReprInt(i + 1);

			XmlNodeElement & xneHtmlBodyFormTableArgsTr = xneHtmlBodyFormTableArgs.addChildElement("tr");
			XmlNodeElement & xneHtmlBodyFormTableArgsTrTd1 = xneHtmlBodyFormTableArgsTr.addChildElement("td");
			xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc(TEXT_TOKEN_NBSP, 2, true);
			xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc("arg $");
			xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc(strArgNumber);
			xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc(TEXT_TOKEN_NBSP);
			xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc("(");
			xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc(flagDynamic ? "dynamic" : "static");
			if (p_cns->getCommandSegment().length() == 0) {
				xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc(TEXT_TOKEN_NBSP);
				xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc("please");
				xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc(TEXT_TOKEN_NBSP);
				xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc("specify");
			}
			xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc("):");
			xneHtmlBodyFormTableArgsTrTd1.addTextNoEsc(TEXT_TOKEN_NBSP, 2, true);
			XmlNodeElement & xneHtmlBodyFormTableArgsTrTd2 = xneHtmlBodyFormTableArgsTr.addChildElement(ELEMENT_TD);

			const std::list<std::string> & listAllowedValues = p_cns->getConstListAllowedValues();
			if (listAllowedValues.size() == 0) {
				XmlNodeElement & xneHtmlBodyFormTableArgsTrTd2Input = xneHtmlBodyFormTableArgsTrTd2.addChildElement(ELEMENT_INPUT);
				xneHtmlBodyFormTableArgsTrTd2Input.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_TEXT);
				xneHtmlBodyFormTableArgsTrTd2Input.addAttribute(ATTR_INPUT_SIZE, "20");
				xneHtmlBodyFormTableArgsTrTd2Input.addAttribute(ATTR_INPUT_NAME, HIDDEN_ARG_ + strArgNumber);
	
				if (!p_cns->getFlagNoValues()) {
					xneHtmlBodyFormTableArgsTrTd2Input.addAttribute(ATTR_INPUT_VALUE, p_cns->getName());
				}

				if (!flagDynamic) {
					xneHtmlBodyFormTableArgsTrTd2Input.addAttribute(ATTR_INPUT_READONLY, "true");
				}
			} else {
				XmlNodeElement & xneHtmlBodyFormTableArgsTrTd2Select = xneHtmlBodyFormTableArgsTrTd2.addChildElement(ELEMENT_SELECT);
				xneHtmlBodyFormTableArgsTrTd2Select.addAttribute(ATTR_INPUT_NAME, HIDDEN_ARG_ + strArgNumber);

				std::list<std::string>::const_iterator j = listAllowedValues.begin();
				const std::list<std::string>::const_iterator jEnd = listAllowedValues.end();
				while (j != jEnd) {
					std::string strAllowedValue = *j; 
					XmlNodeElement & xneHtmlBodyFormTableArgsTrTd2SelectOption = xneHtmlBodyFormTableArgsTrTd2Select.addChildElement(ELEMENT_OPTION);
					xneHtmlBodyFormTableArgsTrTd2SelectOption.addText(strAllowedValue);
					j++;
				}
			}
			if (flagDynamic) {
				if (p_cns->getFlagNoValues()) {
					XmlNodeElement & xneHtmlBodyFormTableArgsTr2 = xneHtmlBodyFormTableArgs.addChildElement("tr");
					xneHtmlBodyFormTableArgsTr2.addChildElement("td");
					XmlNodeElement & xneHtmlBodyFormTableArgsTr2Td2 = xneHtmlBodyFormTableArgsTr2.addChildElement("td");
					xneHtmlBodyFormTableArgsTr2Td2.addTextNoEsc("No matches for ");
					xneHtmlBodyFormTableArgsTr2Td2.addTextNoEsc(p_cns->getName());
				}
			}
		}
	}

	XmlNodeElement & xneHtmlBodyFormInputCommandId = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInputCommandId.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_HIDDEN);
	xneHtmlBodyFormInputCommandId.addAttribute(ATTR_INPUT_NAME, HIDDEN_COMMAND_ID);
	xneHtmlBodyFormInputCommandId.addAttribute(ATTR_INPUT_VALUE, XGDaemonUtil::getStrReprUL_Hex(oc.getId(), true));


	xneHtmlBodyForm.addChildElement(ELEMENT_BR);
	xneHtmlBodyForm.addChildElement(ELEMENT_P);
	xneHtmlBodyForm.addTextNoEsc(TEXT_TOKEN_NBSP, 5, true);


	XmlNodeElement & xneHtmlBodyFormInputExec = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInputExec.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
	xneHtmlBodyFormInputExec.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_EXEC_CMD_ARGS);
	xneHtmlBodyFormInputExec.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_EXEC_CMD_ARGS);


	xneHtmlBody.addChildElement("br");
	xneHtmlBody.addChildElement("p");
	XmlNodeElement & xneHtmlBodyA = xneHtmlBody.addChildElement("a");
	xneHtmlBodyA.addAttribute("href", getLinkActionOpCommands());
	xneHtmlBodyA.addTextNoEsc("Back to command list");
	xneHtmlBody.addChildElement("br");
}
void XGCGI::generateHtmlForExecStatus(
		const ClientSessionInfo & csi,
		const ClientBriefExecStatusInfo & cbesi,
		const DetailedExecStatusInfo & desi)
	{
	generateHtml_BasicScreen();

	XmlNodeElement & xneHtmlHead = m_xiOutput.surefind("/html/head");
	if (cbesi.getFlagDone() == false) {
		generateHtmlForMetaRefresh(xneHtmlHead, 2, getLinkActionExecStatus(cbesi.getId()));
	}

	XmlNodeElement & xneHtmlHeadTitle = m_xiOutput.surefind("/html/head/title");
	xneHtmlHeadTitle.addTextNoEsc("Operational command execution status");	

	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("html/body");

	XmlNodeElement & xneHtmlBodyForm = xneHtmlBody.addChildElement("form");
	xneHtmlBodyForm.addAttribute("action", "?");
	xneHtmlBodyForm.addAttribute("method", "post");

	generateHtmlForHiddenField_SessionID(xneHtmlBodyForm, csi.getConstSessionId());
	generateHtmlForHiddenField_ExecID(xneHtmlBodyForm, cbesi.getId());

	XmlNodeElement & xneHtmlBodyFormPTop = xneHtmlBodyForm.addChildElement(ELEMENT_P);
	xneHtmlBodyFormPTop.addAttribute("align", "right");
	generateHtmlForHeaderButtons(xneHtmlBodyFormPTop);

	bool flagDone = cbesi.getFlagDone();
	if (flagDone) {
		xneHtmlBodyForm.addTextNoEsc("Operational command has completed ");
		xneHtmlBodyForm.addTextNoEsc(cbesi.getFlagDoneSuccess() ? "successfully" : "unsuccessfully");
		xneHtmlBodyForm.addTextNoEsc(".");
		xneHtmlBodyForm.addChildElement("br");

		const std::string & strDoneMsg = cbesi.getDoneMsg();
		xneHtmlBodyForm.addTextNoEsc("Completion message: " + (strDoneMsg.length() == 0 ? "None" : strDoneMsg));
		xneHtmlBodyForm.addChildElement("br");

		xneHtmlBodyForm.addChildElement("p");
		XmlNodeElement & xneHtmlBodyFormB = xneHtmlBodyForm.addChildElement("b");
		xneHtmlBodyFormB.addTextNoEsc(cbesi.getCachedCommandLine());
		xneHtmlBodyForm.addChildElement("p");
	} else {
		xneHtmlBodyForm.addTextNoEsc("Operational command execution in progress...");

		xneHtmlBodyForm.addChildElement("p");
		XmlNodeElement & xneHtmlBodyFormB = xneHtmlBodyForm.addChildElement("b");
		xneHtmlBodyFormB.addTextNoEsc(cbesi.getCachedCommandLine());
		xneHtmlBodyForm.addChildElement("p");

		if (cbesi.getFlagKillInvoked()) {
			xneHtmlBodyForm.addTextNoEsc("Execution kill invoked...");
		} else {
			XmlNodeElement & xneHtmlBodyFormInputKill = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
			xneHtmlBodyFormInputKill.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
			xneHtmlBodyFormInputKill.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_EXEC_KILL);
			xneHtmlBodyFormInputKill.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_EXEC_KILL);
		}

		xneHtmlBodyForm.addChildElement("p");
		xneHtmlBodyForm.addTextNoEsc("Total cycles so far: ");
		xneHtmlBodyForm.addTextNoEsc(XGDaemonUtil::getStrReprUL(csi.getConstSessionStatus().getTotalCycles()));

		xneHtmlBodyForm.addChildElement("p");
		xneHtmlBodyForm.addTextNoEsc("Please wait...");
		xneHtmlBodyForm.addChildElement("p");
	}

	xneHtmlBodyForm.addChildElement("br");
	xneHtmlBodyForm.addTextNoEsc("Operational command output:");
	xneHtmlBodyForm.addChildElement("br");

	XmlNodeElement & xneHtmlBodyFormPre = xneHtmlBodyForm.addChildElement("pre");
	xneHtmlBodyFormPre.addTextNoEsc(XGDaemonUtil::addR(desi.getOutput()));

	xneHtmlBodyForm.addChildElement("br");

	if (flagDone == true) {
		xneHtmlBodyForm.addChildElement("br");
		XmlNodeElement & xneHtmlBodyFormA = xneHtmlBodyForm.addChildElement("a");
		xneHtmlBodyFormA.addAttribute("href", getLinkActionOpCommands());
		xneHtmlBodyFormA.addTextNoEsc("Back to command list");
		xneHtmlBodyForm.addChildElement("br");
	}
}
void XGCGI::generateHtmlForExecutionsStatus(
		const ClientSessionInfo & csi,
		const ClientExecutionsStatusInfo & cesi)
	{
	UNUSED(csi);

	generateHtml_BasicScreen();

	XmlNodeElement & xneHtmlHeadTitle = m_xiOutput.surefind("/html/head/title");
	xneHtmlHeadTitle.addTextNoEsc("Operational command executions");	

	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("html/body");

	XmlNodeElement & xneHtmlBodyForm = xneHtmlBody.addChildElement(ELEMENT_FORM);
	xneHtmlBodyForm.addAttribute(ATTR_FORM_ACTION, "?");
	xneHtmlBodyForm.addAttribute(ATTR_FORM_METHOD, ATTR_FORM_METHOD_POST);

	generateHtmlForHiddenField_SessionID(xneHtmlBodyForm, csi.getConstSessionId());	

	XmlNodeElement & xneHtmlBodyFormPTop = xneHtmlBodyForm.addChildElement(ELEMENT_P);
	xneHtmlBodyFormPTop.addAttribute("align", "right");
	generateHtmlForHeaderButtons(xneHtmlBodyFormPTop);

	XmlNodeElement & xneHtmlBodyFormTable = xneHtmlBodyForm.addChildElement(ELEMENT_TABLE);
	xneHtmlBodyFormTable.addAttribute(ATTR_TABLE_BORDER, "1");
	xneHtmlBodyFormTable.addAttribute(ATTR_TABLE_CELLPADDING, "4");
	{
		XmlNodeElement & xneHtmlBodyFormTableTr = xneHtmlBodyFormTable.addChildElement(ELEMENT_TR);
		XmlNodeElement & xneHtmlBodyFormTableTrThExecId = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TH);
		xneHtmlBodyFormTableTrThExecId.addTextNoEsc("exec_id");

		XmlNodeElement & xneHtmlBodyFormTableTrThCmdLine = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TH);
		xneHtmlBodyFormTableTrThCmdLine.addTextNoEsc("command line");

		XmlNodeElement & xneHtmlBodyFormTableTrThDone = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TH);
		xneHtmlBodyFormTableTrThDone.addTextNoEsc("done?");

		XmlNodeElement & xneHtmlBodyFormTableTrThSuccess = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TH);
		xneHtmlBodyFormTableTrThSuccess.addTextNoEsc("success?");

		XmlNodeElement & xneHtmlBodyFormTableTrThKillInvoked = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TH);
		xneHtmlBodyFormTableTrThKillInvoked.addTextNoEsc("kill invoked?");
	}	

	int totalExecutions = cesi.getTotalExecutions();
	for (int i = 0; i < totalExecutions; i++) {
		const BriefExecStatusInfo & besi = cesi.getBrief(i);


		XmlNodeElement & xneHtmlBodyFormTableTr = xneHtmlBodyFormTable.addChildElement(ELEMENT_TR);
		XmlNodeElement & xneHtmlBodyFormTableTrTdExecId = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TD);
		XmlNodeElement & xneHtmlBodyFormTableTrTdExecIdA = xneHtmlBodyFormTableTrTdExecId.addChildElement(ELEMENT_A);
		xneHtmlBodyFormTableTrTdExecIdA.addAttribute(ATTR_A_HREF, getLinkActionExecStatus(besi.getId()));
		xneHtmlBodyFormTableTrTdExecIdA.addTextNoEsc(XGDaemonUtil::getStrReprUL_Hex(besi.getId(), true));


		XmlNodeElement & xneHtmlBodyFormTableTrTdCmdLine = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TD);
		XmlNodeElement & xneHtmlBodyFormTableTrTdCmdLineA = xneHtmlBodyFormTableTrTdCmdLine.addChildElement(ELEMENT_A);
		xneHtmlBodyFormTableTrTdCmdLineA.addAttribute(ATTR_A_HREF, getLinkActionExecStatus(besi.getId()));
		xneHtmlBodyFormTableTrTdCmdLineA.addTextNoEsc(besi.getCachedCommandLine());

		XmlNodeElement & xneHtmlBodyFormTableTrTdDone = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TD);
		xneHtmlBodyFormTableTrTdDone.addTextNoEsc(besi.getFlagDone() ? "Y" : "N");

		XmlNodeElement & xneHtmlBodyFormTableTrTdSuccess = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TD);
		if (besi.getFlagDone()) xneHtmlBodyFormTableTrTdSuccess.addTextNoEsc(besi.getFlagDoneSuccess() ? "Y" : "N");

		XmlNodeElement & xneHtmlBodyFormTableTrTdKillInvoked = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TD);
		xneHtmlBodyFormTableTrTdKillInvoked.addTextNoEsc(besi.getFlagKillInvoked() ? "Y" : "N");
	}
}
void XGCGI::generateHtmlForHeaderButtons(XmlNodeElement & xneParent) {
	generateHtmlForButtonLoad(xneParent);
	generateHtmlForButtonSave(xneParent);
	generateHtmlForButtonRevert(xneParent);
	generateHtmlForButtonSubmit(xneParent);
	generateHtmlForButtonCommit(xneParent);
	generateHtmlForButtonShowConfig(xneParent);
	generateHtmlForButtonShowExecuted(xneParent);
	generateHtmlForButtonShowOperations(xneParent);
	generateHtmlForButtonLogout(xneParent);
}

void XGCGI::generateHtmlForHiddenField(XmlNodeElement & xneForm, const std::string & strName, const std::string & strValue) {
	XmlNodeElement & xneFormInput = xneForm.addChildElement(ELEMENT_INPUT);
	xneFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_HIDDEN);
	xneFormInput.addAttribute(ATTR_INPUT_NAME, strName);
	xneFormInput.addAttribute(ATTR_INPUT_VALUE, strValue);
}
void XGCGI::generateHtmlForHiddenField_ExecID(XmlNodeElement & xneForm, const unsigned long idExec) {
	generateHtmlForHiddenField(xneForm, HIDDEN_EXEC_ID, XGDaemonUtil::getStrReprInt(idExec));
}
void XGCGI::generateHtmlForHiddenField_SessionID(XmlNodeElement & xneForm, const SessionId & siSession) {	
	generateHtmlForHiddenField(xneForm, COOKIE_SESSION_ID, siSession.getStr());
}


void XGCGI::generateHtmlForLoadOrSave(bool flagLoadOrSave, const SessionId & siSession, const std::string & strContext) {
	generateHtml_BasicScreen();

	XmlNodeElement & xneHtml = m_xiOutput.sureroot();
	XmlNodeElement & xneHtmlBody = xneHtml.surefind1(ELEMENT_BODY);
	XmlNodeElement & xneHtmlHeadTitle = xneHtml.surefind2(ELEMENT_HEAD, ELEMENT_TITLE);

	xneHtmlHeadTitle.addTextNoEsc(flagLoadOrSave ? "Load Configuration" : "Save configuration");	
	xneHtmlBody.addTextNoEsc(flagLoadOrSave ? "Please specify filespec of configuration file to load:" : "Please specify filespec of configuration file to save:");
	
	XmlNodeElement & xneHtmlBodyForm = xneHtmlBody.addChildElement(ELEMENT_FORM);
	xneHtmlBodyForm.addAttribute(ATTR_FORM_ACTION, "?");
	xneHtmlBodyForm.addAttribute(ATTR_FORM_METHOD, ATTR_FORM_METHOD_POST);

	generateHtmlForHiddenField_SessionID(xneHtmlBodyForm, siSession);
	generateHtmlForHiddenField(xneHtmlBodyForm, HIDDEN_CONTEXT, strContext);

	{
		XmlNodeElement & xneHtmlBodyFormInput = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
		xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_HIDDEN);
		xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, HIDDEN_SCREEN);
		xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_VALUE, HIDDEN_SCREEN_VALUE_PROMPT);
	}


	XmlNodeElement & xneHtmlBodyFormInput = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_TEXT);
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_SIZE, "60");
	xneHtmlBodyFormInput.addAttribute(ATTR_INPUT_NAME, TEXT_FILESPEC);

	xneHtmlBodyForm.addTextNoEsc(TEXT_TOKEN_NBSP);

	if (flagLoadOrSave == true) {
		generateHtmlForButtonLoad(xneHtmlBodyForm);
	} else {
		generateHtmlForButtonSave(xneHtmlBodyForm);
	}
	generateHtmlForButtonCancel(xneHtmlBodyForm);
}
void XGCGI::generateHtmlForLogin(const std::string & strContext) {
	generateHtml_BasicScreen();

	XmlNodeElement & xneHtml = m_xiOutput.sureroot();
	XmlNodeElement & xneHtmlBody = xneHtml.surefind1(ELEMENT_BODY);
	XmlNodeElement & xneHtmlHeadTitle = xneHtml.surefind2(ELEMENT_HEAD, ELEMENT_TITLE);	

	xneHtmlHeadTitle.addTextNoEsc(LABEL_LOGIN_TITLE);
	
	xneHtmlBody.addTextNoEsc(LABEL_LOGIN_TITLE);
	xneHtmlBody.addChildElement(ELEMENT_BR);
	xneHtmlBody.addChildElement(ELEMENT_P);

	XmlNodeElement & xneHtmlBodyForm = xneHtmlBody.addChildElement(ELEMENT_FORM);
	xneHtmlBodyForm.addAttribute(ATTR_FORM_ACTION, "?");
	xneHtmlBodyForm.addAttribute(ATTR_FORM_METHOD, ATTR_FORM_METHOD_POST);

	generateHtmlForHiddenField(xneHtmlBodyForm, HIDDEN_CONTEXT, strContext);
	
	xneHtmlBodyForm.addTextNoEsc(LABEL_LOGIN_USERNAME);
	xneHtmlBodyForm.addTextNoEsc(TEXT_TOKEN_NBSP);

	XmlNodeElement & xneHtmlBodyFormInputUser = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInputUser.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_TEXT);
	xneHtmlBodyFormInputUser.addAttribute(ATTR_INPUT_SIZE, "30");
	xneHtmlBodyFormInputUser.addAttribute(ATTR_INPUT_NAME, TEXT_USER);
	xneHtmlBodyForm.addChildElement(ELEMENT_BR);
	xneHtmlBodyForm.addChildElement(ELEMENT_P);

	xneHtmlBodyForm.addTextNoEsc(LABEL_LOGIN_PASSWORD);
	xneHtmlBodyForm.addTextNoEsc(TEXT_TOKEN_NBSP);

	XmlNodeElement & xneHtmlBodyFormInputPwd = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInputPwd.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_PASSWORD);
	xneHtmlBodyFormInputPwd.addAttribute(ATTR_INPUT_SIZE, "30");
	xneHtmlBodyFormInputPwd.addAttribute(ATTR_INPUT_NAME, PASSWORD_PWD);
	xneHtmlBodyForm.addChildElement(ELEMENT_BR);
	xneHtmlBodyForm.addChildElement(ELEMENT_P);

	generateHtmlForButtonLogin(xneHtmlBodyForm);
}
void XGCGI::generateHtmlForMetaRefresh(XmlNodeElement & xneHtmlHead, int totalSeconds, const std::string & strUrl) {
	std::string strContent;
	strContent += XGDaemonUtil::getStrReprInt(totalSeconds);
	strContent += ";url=";
	strContent += strUrl;
	XmlNodeElement & xneHtmlHeadMeta = xneHtmlHead.addChildElement("meta");
	xneHtmlHeadMeta.addAttribute("http-equiv", "refresh");
	xneHtmlHeadMeta.addAttribute("content", strContent);	
}
void XGCGI::generateHtmlForNodesInv(const SessionId & siSession, std::list<GeneralContextInfo> listNodes) {

	generateHtml_BasicScreen();

	std::string strTitle = "Please correct invalid values before committing.";

	XmlNodeElement & xneHtmlHeadTitle = m_xiOutput.surefind("/html/head/title");
	xneHtmlHeadTitle.addTextNoEsc(strTitle);


	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("html/body");
	xneHtmlBody.addTextNoEsc(strTitle);

	XmlNodeElement & xneHtmlBodyForm = xneHtmlBody.addChildElement("form");
	xneHtmlBodyForm.addAttribute("action", "?");
	xneHtmlBodyForm.addAttribute("method", "post");

	generateHtmlForHiddenField_SessionID(xneHtmlBodyForm, siSession);


	XmlNodeElement & xneHtmlBodyFormPCommitTop = xneHtmlBodyForm.addChildElement("p");
	xneHtmlBodyFormPCommitTop.addAttribute("align", "right");
	generateHtmlForButtonCommit(xneHtmlBodyFormPCommitTop);
	generateHtmlForButtonLogout(xneHtmlBodyFormPCommitTop);

	std::string strNodesListed;

	std::list<GeneralContextInfo>::iterator i = listNodes.begin();
	std::list<GeneralContextInfo>::iterator iEnd = listNodes.end();
	while (i != iEnd) {
		generateHtmlForGeneralContextInfoTable(xneHtmlBodyForm, *i, 3);

		const std::string & strIdConfig = XGDaemonUtil::getStrReprUL_Hex(i->getIdConfig(), true);  
		if (strNodesListed.length() > 0) strNodesListed.append(", ");
		strNodesListed.append(strIdConfig);

		XmlNodeElement & xneHtmlBodyFormInputPath = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
		xneHtmlBodyFormInputPath.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_HIDDEN);
		xneHtmlBodyFormInputPath.addAttribute(ATTR_INPUT_NAME, HIDDEN_PATH_ + strIdConfig);
		xneHtmlBodyFormInputPath.addAttribute(ATTR_INPUT_VALUE, i->getContextLocation().getPathRepr(true));

		i++;
	}

	XmlNodeElement & xneHtmlBodyFormPCommitBottom = xneHtmlBodyForm.addChildElement("p");
	xneHtmlBodyFormPCommitBottom.addAttribute("align", "right");
	generateHtmlForButtonCommit(xneHtmlBodyFormPCommitBottom);
	generateHtmlForButtonLogout(xneHtmlBodyFormPCommitBottom);

	XmlNodeElement & xneHtmlBodyFormInputNodesExistant = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInputNodesExistant.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_HIDDEN);
	xneHtmlBodyFormInputNodesExistant.addAttribute(ATTR_INPUT_NAME, HIDDEN_NODES_SEP);
	xneHtmlBodyFormInputNodesExistant.addAttribute(ATTR_INPUT_VALUE, strNodesListed);
}
void XGCGI::generateHtmlForOpCommands(const SessionId & siSession, const ClientOpCmds & oc) {
	generateHtml_BasicScreen();


	XmlNodeElement & xneHtmlHeadTitle = m_xiOutput.surefind("/html/head/title");
	xneHtmlHeadTitle.addTextNoEsc("Operational Mode Commands");


	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("/html/body");

	XmlNodeElement & xneHtmlBodyForm = xneHtmlBody.addChildElement(ELEMENT_FORM);
	xneHtmlBodyForm.addAttribute(ATTR_FORM_ACTION, "?");
	xneHtmlBodyForm.addAttribute(ATTR_FORM_METHOD, ATTR_FORM_METHOD_POST);
	
	generateHtmlForHiddenField_SessionID(xneHtmlBodyForm, siSession);	

	XmlNodeElement & xneHtmlBodyFormPTop = xneHtmlBodyForm.addChildElement(ELEMENT_P);
	xneHtmlBodyFormPTop.addAttribute("align", "right");
	generateHtmlForHeaderButtons(xneHtmlBodyFormPTop);

	XmlNodeElement & xneHtmlBodyFormTable = xneHtmlBodyForm.addChildElement(ELEMENT_TABLE);
	xneHtmlBodyFormTable.addAttribute(ATTR_TABLE_WIDTH, "100%");
	xneHtmlBodyFormTable.addAttribute(ATTR_TABLE_CELLPADDING, "4");

	std::string strCommands;

	const std::list<ClientOpCmd*> & listOpCmd = oc.getList();
	std::list<ClientOpCmd*>::const_iterator iBegin = listOpCmd.begin();
	std::list<ClientOpCmd*>::const_iterator iEnd = listOpCmd.end();
	std::list<ClientOpCmd*>::const_iterator i = iBegin;
	while (i != iEnd) {
		const OpCmd * p_ocmd = *i; 

		if (p_ocmd != NULL) {
			XmlNodeElement & xneHtmlBodyFormTableTr = xneHtmlBodyFormTable.addChildElement(ELEMENT_TR);

			XmlNodeElement & xneHtmlBodyFormTableTrTdButton = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TD);
			xneHtmlBodyFormTableTrTdButton.addAttribute(ATTR_TD_ALIGN, ATTR_TD_ALIGN_LEFT);
			xneHtmlBodyFormTableTrTdButton.addAttribute(ATTR_TD_VALIGN, ATTR_TD_VALIGN_TOP);

			const std::string & strAction = p_ocmd->getAction();
			const std::string & strCommandId = XGDaemonUtil::getStrReprUL_Hex(p_ocmd->getId(), true);

			XmlNodeElement & xneHtmlBodyFormTableTrTdButtonInput = xneHtmlBodyFormTableTrTdButton.addChildElement(ELEMENT_INPUT);
			xneHtmlBodyFormTableTrTdButtonInput.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_SUBMIT);
			if (p_ocmd->hasDynamicParts()) {
				xneHtmlBodyFormTableTrTdButtonInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_EXEC_CMD_QUERY_ + strCommandId);
				xneHtmlBodyFormTableTrTdButtonInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_EXEC_CMD_QUERY_);
			} else {
				xneHtmlBodyFormTableTrTdButtonInput.addAttribute(ATTR_INPUT_NAME, SUBMIT_CONTROL_EXEC_CMD_ + strCommandId);
				xneHtmlBodyFormTableTrTdButtonInput.addAttribute(ATTR_INPUT_VALUE, TITLE_SUBMIT_CONTROL_EXEC_CMD_);
			}
		
			if (strCommands.length() > 0) strCommands += ", ";
			strCommands += strCommandId;
		
			
			if (strAction.length() == 0) xneHtmlBodyFormTableTrTdButtonInput.addAttribute(ATTR_INPUT_DISABLED, ATTR_INPUT_DISABLED_TRUE);
	
	
			XmlNodeElement & xneHtmlBodyFormTableTrTdName = xneHtmlBodyFormTableTr.addChildElement(ELEMENT_TD);
			xneHtmlBodyFormTableTrTdName.addAttribute(ATTR_TD_ALIGN, ATTR_TD_ALIGN_LEFT);
			xneHtmlBodyFormTableTrTdName.addAttribute(ATTR_TD_VALIGN, ATTR_TD_VALIGN_TOP);
			xneHtmlBodyFormTableTrTdName.addAttribute(ATTR_TD_WIDTH, "100%");
	
			xneHtmlBodyFormTableTrTdName.addTextNoEsc(p_ocmd->getConstOpCmdName().getName());
			xneHtmlBodyFormTableTrTdName.addChildElement(ELEMENT_BR);
			xneHtmlBodyFormTableTrTdName.addTextNoEsc(p_ocmd->getHelpString());
			xneHtmlBodyFormTableTrTdName.addChildElement(ELEMENT_BR);
			xneHtmlBodyFormTableTrTdName.addChildElement(ELEMENT_BR);
		}
		i++;
	}


	XmlNodeElement & xneHtmlBodyFormInputCommands = xneHtmlBodyForm.addChildElement(ELEMENT_INPUT);
	xneHtmlBodyFormInputCommands.addAttribute(ATTR_INPUT_TYPE, ATTR_INPUT_TYPE_HIDDEN);
	xneHtmlBodyFormInputCommands.addAttribute(ATTR_INPUT_NAME, HIDDEN_COMMANDS);
	xneHtmlBodyFormInputCommands.addAttribute(ATTR_INPUT_VALUE, strCommands);

	XmlNodeElement & xneHtmlBodyFormPBottom = xneHtmlBodyForm.addChildElement(ELEMENT_P);
	xneHtmlBodyFormPBottom.addAttribute("align", "right");
	generateHtmlForHeaderButtons(xneHtmlBodyFormPBottom);
}

void XGCGI::generateHtmlForSessionStatus(
		const ParentContextInfo & pciContext,
		const ClientSessionInfo & csi)
	{
	generateHtml_BasicScreen();

	bool flagIsIdleOrAbove = csi.getConstSessionStatus().isIdleOrAbove();

	const ContextLocation clContext = pciContext.getConstContextLocation();

	XmlNodeElement & xneHtmlHead = m_xiOutput.surefind("html/head");
	if (flagIsIdleOrAbove == false) {
		generateHtmlForMetaRefresh(xneHtmlHead, 3, getLinkActionChContext(clContext));
	}


	XmlNodeElement & xneHtmlHeadTitle = m_xiOutput.surefind("/html/head/title");
	xneHtmlHeadTitle.addTextNoEsc("XORP Web GUI Session Login In Progress...");


	XmlNodeElement & xneHtmlBody = m_xiOutput.surefind("html/body");
	
	xneHtmlBody.addTextNoEsc("Session id: ");
	xneHtmlBody.addTextNoEsc(csi.getConstSessionId().getStr());
	xneHtmlBody.addChildElement(ELEMENT_P);
	xneHtmlBody.addTextNoEsc("Session phase: ");
	xneHtmlBody.addTextNoEsc(csi.getConstSessionStatus().getPhase());
	xneHtmlBody.addChildElement(ELEMENT_P);
	xneHtmlBody.addTextNoEsc("Total cycles so far: ");
	xneHtmlBody.addTextNoEsc(XGDaemonUtil::getStrReprUL(csi.getConstSessionStatus().getTotalCycles()));
	xneHtmlBody.addChildElement(ELEMENT_P);
	xneHtmlBody.addTextNoEsc("Please wait...");
}
void XGCGI::generateHtmlForSymbolsFront(XmlNodeElement & xneParent, const ContextSegment & cs) {
	if (cs.getNStatInfo().getFlagInvalid()) {
		generateHtmlForSymbol_Invalid(xneParent);
		xneParent.addTextNoEsc("&nbsp;");
	}
	if (cs.getNStatInfo().getFlagAdded()) {
		generateHtmlForSymbol_Added(xneParent);
		xneParent.addTextNoEsc("&nbsp;");
	}
	if (cs.getNStatInfo().getFlagChanged()) {
		generateHtmlForSymbol_Changed(xneParent);
		xneParent.addTextNoEsc("&nbsp;");
	}
	if (cs.getNStatInfo().getFlagDeleted()) {
		generateHtmlForSymbol_Deleted(xneParent);
		xneParent.addTextNoEsc("&nbsp;");
	}
	if (cs.getNStatInfo().getFlagMissingRequired()) {
		generateHtmlForSymbol_MissingRequired(xneParent);
		xneParent.addTextNoEsc("&nbsp;");
	}
	if (cs.getFlagMulti()) xneParent.addTextNoEsc("@&nbsp;");
}
void XGCGI::generateHtmlForSymbolsBack(XmlNodeElement & xneParent, const ContextSegment & cs) {
	if (cs.getSubInfo().getFlagHasInvalidChildren()) {
		xneParent.addTextNoEsc("&nbsp;");
		generateHtmlForSymbol_Invalid(xneParent);
	}
	if (cs.getSubInfo().getFlagHasAddedChildren()) {
		xneParent.addTextNoEsc("&nbsp;");
		generateHtmlForSymbol_Added(xneParent);
	}
	if (cs.getSubInfo().getFlagHasChangedChildren()) {
		xneParent.addTextNoEsc("&nbsp;");
		generateHtmlForSymbol_Changed(xneParent);
	}
	if (cs.getSubInfo().getFlagHasDeletedChildren()) {
		xneParent.addTextNoEsc("&nbsp;");
		generateHtmlForSymbol_Deleted(xneParent);
	}

	if (cs.getSubInfo().getFlagHasMissingRequiredChildren()) {
		xneParent.addTextNoEsc("&nbsp;");
		generateHtmlForSymbol_MissingRequired(xneParent);
	}
}
void XGCGI::generateHtmlForSymbol_Added(XmlNodeElement & xneParent) {
	XmlNodeElement & xneParentFont = xneParent.addChildElement("font");
	xneParentFont.addAttribute("color", "orange");
	xneParentFont.addTextNoEsc("(A)");
}
void XGCGI::generateHtmlForSymbol_Changed(XmlNodeElement & xneParent) {
	XmlNodeElement & xneParentFont = xneParent.addChildElement("font");
	xneParentFont.addAttribute("color", "green");
	xneParentFont.addTextNoEsc("(C)");
}
void XGCGI::generateHtmlForSymbol_Deleted(XmlNodeElement & xneParent) {
	XmlNodeElement & xneParentFont = xneParent.addChildElement("font");
	xneParentFont.addAttribute("color", "brown");
	xneParentFont.addTextNoEsc("(D)");
}
void XGCGI::generateHtmlForSymbol_Invalid(XmlNodeElement & xneParent) {
	XmlNodeElement & xneParentFont = xneParent.addChildElement("font");
	xneParentFont.addAttribute("color", "red");
	xneParentFont.addTextNoEsc("(!)");
}
void XGCGI::generateHtmlForSymbol_MissingRequired(XmlNodeElement & xneParent) {
	XmlNodeElement & xneParentFont = xneParent.addChildElement("font");
	xneParentFont.addAttribute("color", "red");
	xneParentFont.addTextNoEsc("(MR)");
}
void XGCGI::printOutput() {
	printHeadersTextHtml();
	m_xiOutput.printXML();
}
void XGCGI::retrMapInputFieldsExistant(std::map<unsigned long, OpVal, std::greater<unsigned long> > & mapFieldsExistant) {
	const std::string & strFieldsExistant = m_mapParamsPost[HIDDEN_NODES_EXISTANT];

	std::list<std::string> listFieldsExistant;
	XGDaemonUtil::split_string(strFieldsExistant, ',', listFieldsExistant);

	std::list<std::string>::const_iterator i = listFieldsExistant.begin();
	const std::list<std::string>::const_iterator iEnd = listFieldsExistant.end();
	while (i != iEnd) {
		const std::string & strIdConfig = XGDaemonUtil::getTrimmedString(*i);
		const std::string * p_strValue = getPtrParamPost(strIdConfig);

		std::string strOp = SELECT_CONTROL_OP_;
		strOp += strIdConfig;
		const std::string * p_strOp = getPtrParamPost(strOp);

		if (p_strValue != NULL || p_strOp != NULL) {
			unsigned long idConfig = XGDaemonUtil::getValueStrUL_Hex(strIdConfig, CONFIG_ID_UNKNOWN);
			if (idConfig != CONFIG_ID_UNKNOWN) {
				if (p_strOp != NULL) mapFieldsExistant[idConfig].setOperator(*p_strOp);
				if (p_strValue != NULL) mapFieldsExistant[idConfig].setValue(*p_strValue);
			}
		}
		i++;
	}
}
void XGCGI::retrMapInputFieldsSep(std::map<std::string, std::string, std::greater<std::string> > & mapFieldsSep) {
	const std::string & strFieldsSep = m_mapParamsPost[HIDDEN_NODES_SEP];

	std::list<std::string> listFieldsSep;
	XGDaemonUtil::split_string(strFieldsSep, ',', listFieldsSep);

	std::list<std::string>::const_iterator i = listFieldsSep.begin();
	const std::list<std::string>::const_iterator iEnd = listFieldsSep.end();
	while (i != iEnd) {
		const std::string & strIdConfig = XGDaemonUtil::getTrimmedString(*i);
		const std::string & strValue = m_mapParamsPost[strIdConfig];
		
		const std::string & strNamePath = HIDDEN_PATH_ + strIdConfig;
		const std::string & strValuePath = m_mapParamsPost[strNamePath];

		if (strValuePath.length() > 0) {
			mapFieldsSep[strValuePath] = strValue;
		}
		i++;
	}	
}

std::string XGCGI::getLinkActionChContext(const ContextLocation & clContext) {
	std::string strLink= "?action=";
	strLink += ACTION_CH_CONTEXT;
	strLink += "&context=";
	strLink += clContext.getPathRepr(true);
	return strLink;
}
std::string XGCGI::getLinkActionChContext(const ContextLocation & clContext, int length) {
	std::string strLink = "?action=";
	strLink += ACTION_CH_CONTEXT;
	strLink += "&context=";
	strLink += clContext.getPathRepr(length, true);
	return strLink;
}
std::string XGCGI::getLinkActionExecStatus(const unsigned long exec_id) const {
	std::string strLink = "?action=";
	strLink += ACTION_EXEC_STATUS;
	strLink += "&exec_id=";
	strLink += XGDaemonUtil::getStrReprUL_Hex(exec_id, true);
	return strLink;
}
std::string XGCGI::getLinkActionInit(const std::string & strContextEscaped) {
	std::string strLink = "?action=";
	strLink += ACTION_INIT;
	strLink += "&context=";
	strLink += strContextEscaped;
	return strLink;
}
std::string XGCGI::getLinkActionInit(const ContextLocation & clContext) {
	return getLinkActionInit(clContext.getPathRepr(true));
}
std::string XGCGI::getLinkActionInit(const ContextLocation & clContext, int length) {
	return getLinkActionInit(clContext.getPathRepr(length, true));
}
std::string XGCGI::getLinkActionOpCommands() {
	std::string strLink = "?action=";
	strLink += ACTION_OP_COMMANDS;
	return strLink;
}
std::string XGCGI::getLinkActionResetCommit(const ContextLocation & clContext) {
	std::string strLink= "?action=";
	strLink += ACTION_RESET_COMMIT;
	strLink += "&context=";
	strLink += clContext.getPathRepr(true);
	return strLink;
}

XGCGIErrorInfo XGCGI::doScreenActionAbsRemoveCommit(
	const SessionId & siSessionRequest,
	const std::string & strContext,
	const std::string & strPathEscaped) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;

	if (doActionAbsRemoveCommit(
	      srei,
	      siSessionRequest,
	      strContext,
	      strPathEscaped,
	      siSession,
	      clContext,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}
	
	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionAdd(
	const SessionId & siSessionRequest,
	const std::string & strContext,
	unsigned long idTemplateFieldAdd,
	const std::string & strFieldValue,
	const std::string & strFieldOp) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;
	
	if (doActionAdd(
	      srei,
	      siSessionRequest,
	      strContext,
	      idTemplateFieldAdd,
	      strFieldValue,
	      strFieldOp,
	      siSession,
	      clContext,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionChContext(
		const SessionId & siSessionRequest,
		const std::string & strContext) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;

	if (doActionChContext(
	      srei,
	      siSessionRequest,
	      strContext,
	      siSession,
	      clContext,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;
}

XGCGIErrorInfo XGCGI::doScreenActionCommit(
		const SessionId & siSessionRequest,
		const std::string & strContext) {

	std::map<unsigned long, OpVal, std::greater<unsigned long> > mapFieldsExistant;
	retrMapInputFieldsExistant(mapFieldsExistant);

	std::map<std::string, std::string, std::greater<std::string> > mapFieldsSep;
	retrMapInputFieldsSep(mapFieldsSep);

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;

	if (doActionCommit(
	      srei,
	      siSessionRequest,
	      strContext,
	      mapFieldsExistant,
	      mapFieldsSep,
	      siSession,
	      clContext,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionExecCmd(
		const SessionId & siSessionRequest,
		unsigned long command_id)
	{
	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ClientBriefExecStatusInfo cbesi;
	DetailedExecStatusInfo desi;
	ErrorInfo eiError;

	if (doActionExecCmd(
	      srei,
	      siSessionRequest,
	      command_id,
	      siSession,
	      cbesi,
	      desi,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

/*	if (oc.getId() != command_id) {
		return XGCGI_ERROR_COMMAND_ID_MISSMATCH;
	}*/

	doDisplayExecResponse(siSession, cbesi, desi, eiError);
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionExecCmdArgs(
	const SessionId & siSessionRequest,
	const unsigned long command_id,
	const std::map<unsigned int, std::string> & mapArgs) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ClientBriefExecStatusInfo cbesi;
	DetailedExecStatusInfo desi;
	ErrorInfo eiError;

	if (doActionExecCmdArgs(
	      srei,
	      siSessionRequest,
	      command_id,
	      mapArgs,
	      siSession,
	      cbesi,
	      desi,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}
	
	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

	doDisplayExecResponse(siSession, cbesi, desi, eiError);
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionExecKill(
		const SessionId & siSessionRequest,
		unsigned long idExec) {
	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ClientBriefExecStatusInfo cbesi;
	DetailedExecStatusInfo desi;
	ErrorInfo eiError;

	if (doActionExecKill(
	      srei,
	      siSessionRequest,
	      idExec,
	      siSession,
	      cbesi,
	      desi,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

	if (cbesi.getId() != idExec) {
		return XGCGI_ERROR_EXEC_ID_MISSMATCH;
	}

	doDisplayExecResponse(siSession, cbesi, desi, eiError);
	return XGCGI_OK;	
}
XGCGIErrorInfo XGCGI::doScreenActionExecQuery(
		const SessionId & siSessionRequest,
		unsigned long command_id) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ClientOpCmd oc;
	ErrorInfo eiError;

	if (doActionExecQuery(
	      srei,
	      siSessionRequest,
	      command_id,
	      siSession,
	      oc,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

	if (oc.getId() != command_id) {
		return XGCGI_ERROR_COMMAND_ID_MISSMATCH;
	}		

	doDisplayExecQuery(siSession, oc, eiError);
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionExecStatus(
		const SessionId & siSessionRequest,
		unsigned long exec_id) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ClientBriefExecStatusInfo cbesi;
	DetailedExecStatusInfo desi;
	ErrorInfo eiError;

	if (doActionExecStatus(
	      srei,
	      siSessionRequest,
	      exec_id,	      
	      siSession,
	      cbesi,
	      desi,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

	if (cbesi.getId() != exec_id) {
		return XGCGI_ERROR_EXEC_ID_MISSMATCH;
	}

	doDisplayExecResponse(siSession, cbesi, desi, eiError);
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionInit(const std::string & strContext) {
	generateHtmlForLogin(strContext);
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionLoadOrSave(
	bool flagLoadOrSave,
	const SessionId & siSessionRequest,
	const std::string & strContext) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;

	const std::string & strScreen = m_mapParamsPost[HIDDEN_SCREEN];
	if (strScreen == HIDDEN_SCREEN_VALUE_PROMPT) {
		if (doActionLoadOrSave(
		      srei,
		      flagLoadOrSave,
		      siSessionRequest,
		      strContext,
		      m_mapParamsPost[HIDDEN_FILESPEC],
		      siSession,
		      clContext,
		      eiError) == false) {
			return XGCGI_ERROR_COMMUNICATION;
		}

		if (checkForSessionMissmatch(
		      srei.m_xiReceive,
		      siSessionRequest,
		      siSession) == false) {
			return XGCGI_ERROR_SESSION_MISSMATCH;
		}

		doDisplayContextResponse(srei, siSession, clContext, eiError);
	} else {
		generateHtmlForLoadOrSave(flagLoadOrSave, siSessionRequest, strContext);
	}
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionLogin(const std::string & strContext) {
	const std::string & strUser = m_mapParamsPost[TEXT_USER];
	const std::string & strPwd = m_mapParamsPost[PASSWORD_PWD];

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;

	if (doActionLogin(
		srei,
		strUser,
		strPwd,
		strContext,
		siSession,
		clContext,
		eiError) == false) return XGCGI_ERROR_COMMUNICATION;

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionLogout(const SessionId & siSessionRequest) {

	SRExchangeInfo srei;
	ErrorInfo eiError;

	if (doActionLogout(srei, siSessionRequest, eiError) == false) return XGCGI_ERROR_COMMUNICATION;

	generateHtmlForLogin("/");

	return XGCGI_OK;
}
XGCGIErrorInfo XGCGI::doScreenActionOpCommands(const SessionId & siSessionRequest) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ClientOpCmds oc;
	ErrorInfo eiError;

	if (doActionOpCommands(
		srei,
		siSessionRequest,
		siSession,
		oc,
		eiError) == false) return XGCGI_ERROR_COMMUNICATION;
	
	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) return XGCGI_ERROR_SESSION_MISSMATCH;

	doDisplayOpCommands(siSessionRequest, oc, eiError);
	return XGCGI_OK;
}	
XGCGIErrorInfo XGCGI::doScreenActionRemove(
	const SessionId & siSessionRequest,
	const std::string & strContext,
	const std::string & strFieldNameRemove) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;

	if (doActionRemove(
	      srei,
	      siSessionRequest,
	      strContext,
	      strFieldNameRemove,
	      siSession,
	      clContext,
	      eiError) == false) return XGCGI_ERROR_COMMUNICATION;

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) return XGCGI_ERROR_SESSION_MISSMATCH;

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;
}

XGCGIErrorInfo XGCGI::doScreenActionResetCommit(const SessionId & siSessionRequest, const std::string & strContext) {
	
	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;

	if (doActionResetCommit(
	      srei,
	      siSessionRequest,
	      strContext,
	      siSession,
	      clContext,
	      eiError) == false) return XGCGI_ERROR_COMMUNICATION;

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) return XGCGI_ERROR_SESSION_MISSMATCH;

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;
}

XGCGIErrorInfo XGCGI::doScreenActionRevert(const SessionId & siSessionRequest, const std::string & strContext) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;

	if (doActionRevert(
	      srei,
	      siSessionRequest,
	      strContext,
	      siSession,
	      clContext,
	      eiError) == false) return XGCGI_ERROR_COMMUNICATION;

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) return XGCGI_ERROR_SESSION_MISSMATCH;

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;	
}

XGCGIErrorInfo XGCGI::doScreenActionShowExecutions(const SessionId & siSessionRequest) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ClientExecutionsStatusInfo cesi;
	ErrorInfo eiError;

	if (doActionExecutionsStatus(
	      srei,
	      siSessionRequest,
	      siSession,
	      cesi,
	      eiError) == false) return XGCGI_ERROR_COMMUNICATION;

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) return XGCGI_ERROR_SESSION_MISSMATCH;

	doDisplayExecutionsStatus(siSession, cesi, eiError);
	return XGCGI_OK;
}

XGCGIErrorInfo XGCGI::doScreenActionSubmit(const SessionId & siSessionRequest, const std::string & strContext) {

	std::map<unsigned long, OpVal, std::greater<unsigned long> > mapFieldsExistant;
	retrMapInputFieldsExistant(mapFieldsExistant);

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;

	if (doActionSubmit(
	      srei,
	      siSessionRequest,
	      strContext,
	      mapFieldsExistant,
	      siSession,
	      clContext,
	      eiError) == false) return XGCGI_ERROR_COMMUNICATION;

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) return XGCGI_ERROR_SESSION_MISSMATCH;

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;
}

XGCGIErrorInfo XGCGI::doScreenActionUndelete(
	const SessionId & siSessionRequest,
	const std::string & strContext,
	unsigned long idConfigFieldUndelete,
	const std::string & strFieldValue,
	const std::string & strFieldOp) {

	SRExchangeInfo srei;
	ClientSessionInfo siSession;
	ContextLocation clContext;
	ErrorInfo eiError;
	
	if (doActionUndelete(
	      srei,
	      siSessionRequest,
	      strContext,
	      idConfigFieldUndelete,
	      strFieldValue,
	      strFieldOp,
	      siSession,
	      clContext,
	      eiError) == false) {
		return XGCGI_ERROR_COMMUNICATION;
	}

	if (checkForSessionMissmatch(
	      srei.m_xiReceive,
	      siSessionRequest,
	      siSession) == false) {
		return XGCGI_ERROR_SESSION_MISSMATCH;
	}

	doDisplayContextResponse(srei, siSession, clContext, eiError);
	return XGCGI_OK;
}

int main(int argc, char ** argv) {

	UNUSED(argc);
	UNUSED(argv);

//	CGIUtil::printCGIHeaderTextHtml();
	XGCGI cgi;
//	cgi.setParamCookieRecv("session_id", "570bde60-48b2-4107-a891-1635c5c24e7f");

//	cgi.setParamPost("total_args", "2");
//	cgi.setParamPost("args_1", "ping");
//	cgi.setParamPost("args_2", "");
//	cgi.setParamPost("command_id", "08708fe8");
//	cgi.setParamPost("control_exec_cmd_args", "Execute");

//	cgi.setParamPost("control_operational", "Operational Mode");

//	cgi.setParamGet("context", "/protocols/static/route4:%2010.0.0.0\\/24");

	cgi.run();
	cgi.printOutput();

	return 0;
}

