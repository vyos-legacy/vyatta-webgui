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
 *  Module:       error_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Class for error code encapsulation.
 *
 */


#include "error_info.hh"
#include "basic/xgdaemon_util.hh"

ErrorInfo::ErrorInfo() : BasicErrorInfo() {
}
ErrorInfo::ErrorInfo(int line, int codeError) : BasicErrorInfo(line, codeError) {
}
ErrorInfo::ErrorInfo(int line, int codeError, const std::string & strDesc) : BasicErrorInfo(line, codeError, strDesc) {
}

void ErrorInfo::setInfoAuthFailed(int line, const std::string & strUser) {
	m_line = line;
	m_codeError = ERROR_ID_AUTH_FAILED;
	m_strDesc = DESC_AUTH_FAILED;
	m_strDesc += " for user \"";
	m_strDesc += strUser;
	m_strDesc += "\".";
}
void ErrorInfo::setInfoConfigParseError(int line, const std::string & strFilespec, const std::string & strErrMsg) {
	m_line = line;
	m_codeError = ERROR_ID_INVALID_FILESPEC;
	m_strDesc = DESC_INVALID_FILESPEC;
	m_strDesc += ": ";
	m_strDesc += strFilespec;
	if (strErrMsg.length() > 0) {
		m_strDesc += "  ";
		m_strDesc += strErrMsg;
	}
}
void ErrorInfo::setInfoInvalidContext(int line, const std::string & strContext) {
	m_line = line;
	m_codeError = ERROR_ID_INVALID_CONTEXT;
	m_strDesc = DESC_INVALID_CONTEXT;
	m_strDesc += ": ";
	m_strDesc += strContext;
}
void ErrorInfo::setInfoInvalidExecId(int line, unsigned long idExec) {
	m_line = line;
	m_codeError = ERROR_ID_INVALID_EXEC_ID;
	m_strDesc = DESC_INVALID_EXEC_ID;
	m_strDesc += ": ";
	m_strDesc += XGDaemonUtil::getStrReprUL_Hex(idExec, true);
}
void ErrorInfo::setInfoInvalidFilespec(int line, const std::string & strFilespec, const std::string & strErrMsg) {
	m_line = line;
	m_codeError = ERROR_ID_INVALID_FILESPEC;
	m_strDesc = DESC_INVALID_FILESPEC;
	m_strDesc += ": ";
	m_strDesc += strFilespec;
	if (strErrMsg.length() > 0) {
		m_strDesc += "  ";
		m_strDesc += strErrMsg;
	}
}
void ErrorInfo::setInfoInvalidOperator(int line, const std::string & strOperator) {
	m_line = line;
	m_codeError = ERROR_ID_INVALID_OPERATOR;
	m_strDesc = DESC_INVALID_OPERATOR;
	m_strDesc += ": ";
	m_strDesc += strOperator;
}
void ErrorInfo::setInfoInvalidOpCommand(int line, unsigned long idOpCommand) {
	m_line = line;
	m_codeError = ERROR_ID_INVALID_OP_COMMAND;
	m_strDesc = DESC_INVALID_OP_COMMAND;
	m_strDesc += ": ";
	m_strDesc += XGDaemonUtil::getStrReprUL_Hex(idOpCommand, true);
}
void ErrorInfo::setInfoInvalidOpCommand(int line, const std::string & strOpCommandParts) {
	m_line = line;
	m_codeError = ERROR_ID_INVALID_OP_COMMAND;
	m_strDesc = DESC_INVALID_OP_COMMAND;
	m_strDesc += ": ";
	m_strDesc += strOpCommandParts;
}
void ErrorInfo::setInfoInvalidOpCommand(int line, const std::list<std::string> & listOpCommandParts) {
	m_line = line;
	m_codeError = ERROR_ID_INVALID_OP_COMMAND;
	m_strDesc = DESC_INVALID_OP_COMMAND;
	m_strDesc += ": ";
	
	std::list<std::string>::const_iterator i = listOpCommandParts.begin();
	const std::list<std::string>::const_iterator iEnd = listOpCommandParts.end();
	while (i != iEnd) {
		const std::string & strPart = *i;
		m_strDesc += " ";
		m_strDesc += strPart;
		i++;
	}
}
void ErrorInfo::setInfoInvalidType(int line, const std::string & strType, const std::string & strErrMsg) {
	m_line = line;
	m_codeError = ERROR_ID_INVALID_TYPE;
	m_strDesc = DESC_INVALID_TYPE;
	m_strDesc += ": ";
	m_strDesc += strType;
	if (strErrMsg.length() > 0) {
		m_strDesc += "  ";
		m_strDesc += strErrMsg;
	}
}
void ErrorInfo::setInfoLogicError(int line) {
	m_line = line;
	m_codeError = ERROR_ID_LOGIC_ERROR;
	m_strDesc = DESC_LOGIC_ERROR;
}
void ErrorInfo::setInfoNoData(int line) {
	m_line = line;
	m_codeError = ERROR_ID_NO_DATA;
	m_strDesc = DESC_NO_DATA;
}
void ErrorInfo::setInfoNoSession(int line) {
	m_line = line;
	m_codeError = ERROR_ID_NO_SESSION;
	m_strDesc = DESC_NO_SESSION;
}
void ErrorInfo::setInfoOutOfMemory(int line) {
	m_line = line;
	m_codeError = ERROR_ID_OUT_OF_MEMORY;
	m_strDesc = DESC_OUT_OF_MEMORY;
}
void ErrorInfo::setInfoParsingProc(int line, const std::string & strProc) {
	m_line = line;
	m_codeError = ERROR_ID_PARSING_PROC;
	m_strDesc = DESC_PARSING_PROC;
	if (strProc.length() > 0) {
		m_strDesc += "  ";
		m_strDesc += strProc;
	}
}
void ErrorInfo::setInfoParsingRequest(int line, const std::string & strDesc) {
	m_line = line;
	m_codeError = ERROR_ID_PARSING_REQUEST;
	m_strDesc = DESC_PARSING_REQUEST;
	if (strDesc.length() > 0) {
		m_strDesc += "  ";
		m_strDesc += strDesc;
	}
}
void ErrorInfo::setInfoReqConfigMissing(int line, const std::string & strDesc) {
	m_line = line;
	m_codeError = ERROR_ID_REQ_CONFIG_MISSING;
	m_strDesc = DESC_REQ_CONFIG_MISSING;
	if (strDesc.length() > 0) {
		m_strDesc += "  ";
		m_strDesc += strDesc;
	}	
}
void ErrorInfo::setInfoUnableToAdd(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_ADD;
	m_strDesc = DESC_UNABLE_TO_ADD;	
}
void ErrorInfo::setInfoUnableToAddCannotCreate(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_ADD_CANNOT_CREATE;
	m_strDesc = DESC_UNABLE_TO_ADD_CANNOT_CREATE;	
}
void ErrorInfo::setInfoUnableToAddDuplicate(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_ADD_DUPLICATE;
	m_strDesc = DESC_UNABLE_TO_ADD_DUPLICATE;	
}
void ErrorInfo::setInfoUnableToAddInvalidContext(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_ADD_INVALID_CONTEXT;
	m_strDesc = DESC_UNABLE_TO_ADD_INVALID_CONTEXT;	
}
void ErrorInfo::setInfoUnableToAddNoName(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_ADD_NO_NAME;
	m_strDesc = DESC_UNABLE_TO_ADD_NO_NAME;
}
void ErrorInfo::setInfoUnableToAddUser(
	int line,
	const std::string & strUser,
	const std::string & strPassword) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_ADD_USER;
	m_strDesc = DESC_UNABLE_TO_ADD_USER;
	m_strDesc += " user: \"";
	m_strDesc += strUser;
	m_strDesc += "\" password: \"";
	m_strDesc += strPassword;
	m_strDesc += "\"";
}
void ErrorInfo::setInfoUnableToCommit(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_COMMIT;
	m_strDesc = DESC_UNABLE_TO_COMMIT;	
}
void ErrorInfo::setInfoUnableToCommit_InvalidValues(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_COMMIT_INV;
	m_strDesc = DESC_UNABLE_TO_COMMIT_INV;	
}
void ErrorInfo::setInfoUnableToDelete(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_DELETE;
	m_strDesc = DESC_UNABLE_TO_DELETE;
}
void ErrorInfo::setInfoUnableToDeleteAD(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_DELETE_AD;
	m_strDesc = DESC_UNABLE_TO_DELETE_AD;
}
void ErrorInfo::setInfoUnableToDeleteMWN(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_DELETE_MWN;
	m_strDesc = DESC_UNABLE_TO_DELETE_MWN;
}
void ErrorInfo::setInfoUnableToExecute(int line) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_EXECUTE;
	m_strDesc = DESC_UNABLE_TO_EXECUTE;
}
void ErrorInfo::setInfoUnableToExecuteRUIU(int line, const std::list<std::pair<int, std::string> > & listUnsatisfied) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_EXECUTE_RUIU;
	m_strDesc = DESC_UNABLE_TO_EXECUTE_RUIU;

	std::list<std::pair<int, std::string> >::const_iterator i = listUnsatisfied.begin();
	const std::list<std::pair<int, std::string> >::const_iterator iStart = i;
	const std::list<std::pair<int, std::string> >::const_iterator iEnd = listUnsatisfied.end();
	while (i != iEnd) {
		if (i != iStart) m_strDesc += ", ";
		if (i->second.length() == 0) {
			m_strDesc += XGDaemonUtil::getStrReprInt(i->first);
		} else {
			m_strDesc += i->second;
		}
		i++;
	}
}
void ErrorInfo::setInfoUnableToKillExec(int line, unsigned long idExec) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_KILL_EXEC;
	m_strDesc = DESC_UNABLE_TO_KILL_EXEC;	
	m_strDesc += ": ";
	m_strDesc += XGDaemonUtil::getStrReprUL_Hex(idExec, true);
}
void ErrorInfo::setInfoUnableToRevert(int line, const std::string & strErrorMsg) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_REVERT;
	m_strDesc = DESC_UNABLE_TO_REVERT;
	
	if (strErrorMsg.length() > 0) {
		m_strDesc += "  ";
		m_strDesc += strErrorMsg;
	}
}
void ErrorInfo::setInfoUnableToSetValue(int line, const std::string & strErrorMsg) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_SET_VALUE;
	m_strDesc = DESC_UNABLE_TO_SET_VALUE;
	m_strDesc += "  ";
	m_strDesc += strErrorMsg;	
}
void ErrorInfo::setInfoUnableToSetValueCS(int line, const std::string & strErrorMsg) {
	m_line = line;
	m_codeError = ERROR_ID_UNABLE_TO_SET_VALUE_CS;
	m_strDesc = DESC_UNABLE_TO_SET_VALUE_CS;
	if (strErrorMsg.length() > 0) {
		m_strDesc += ":  ";
		m_strDesc += strErrorMsg;
	}
}
void ErrorInfo::setInfoUnknownAction(int line, const std::string & strAction) {
	m_line = line;
	m_codeError = ERROR_ID_UNK_ACTION;
	m_strDesc = DESC_UNK_ACTION;
	m_strDesc += "  ";
	m_strDesc += strAction;	
}

