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
 *  Module:       error_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Class for error code encapsulation.
 *
 */


#ifndef	__INCLUDE_ERROR_INFO_HH__
#define __INCLUDE_ERROR_INFO_HH__

#define	DESC_AUTH_FAILED			"Authentication failed"
#define	DESC_CONFIG_PARSE_ERROR			"Configuration parse error"
#define DESC_INVALID_CONTEXT			"Invalid context path"
#define	DESC_INVALID_EXEC_ID			"Invalid execution id"
#define DESC_INVALID_FILESPEC			"Invalid filespec"
#define DESC_INVALID_OP_COMMAND			"Invalid operational command"
#define DESC_INVALID_OPERATOR			"Invalid operator"
#define DESC_INVALID_TYPE			"Invalid type"
#define	DESC_LOGIC_ERROR			"Encountered internal logic error"
#define	DESC_NO_DATA				"No data"
#define	DESC_NO_SESSION				"No session"
#define	DESC_OUT_OF_MEMORY			"Out of memory"
#define	DESC_PARSING_PROC			"Encountered error parsing proc "
#define	DESC_PARSING_REQUEST			"Encountered error parsing command XML"
#define DESC_REQ_CONFIG_MISSING			"Required configuration not available"
#define DESC_UNABLE_TO_ADD			"Unable to add node"
#define DESC_UNABLE_TO_ADD_CANNOT_CREATE	"Unable to create new node to add"
#define DESC_UNABLE_TO_ADD_DUPLICATE		"Unable to add duplicate node with the same name"
#define	DESC_UNABLE_TO_ADD_INVALID_CONTEXT	"Unable to add node with invalid context"
#define DESC_UNABLE_TO_ADD_NO_NAME		"Unable to add node with no name"
#define DESC_UNABLE_TO_ADD_USER			"Unable to add user"
#define	DESC_UNABLE_TO_COMMIT			"Unable to commit"
#define	DESC_UNABLE_TO_COMMIT_INV		"Unable to commit due to invalid values"
#define	DESC_UNABLE_TO_DELETE			"Unable to delete"
#define	DESC_UNABLE_TO_DELETE_AD		"Unable to delete already deleted node"
#define	DESC_UNABLE_TO_DELETE_MWN		"Unable to delete multinode without name"
#define	DESC_UNABLE_TO_EXECUTE			"Unable to execute"
#define	DESC_UNABLE_TO_EXECUTE_RUIU		"Unable to execute because required user input has not been satisfied for arguments: "
#define	DESC_UNABLE_TO_KILL_EXEC		"Unable to kill execution"

#define DESC_UNABLE_TO_REVERT			"Unable to revert"
#define	DESC_UNABLE_TO_SET_VALUE		"Unable to set value"
#define	DESC_UNABLE_TO_SET_VALUE_CS		"Unable to set value to context-switch non-multi-node"
#define	DESC_UNK_ACTION				"Unknown action"


#define ERROR_ID_AUTH_FAILED			1
#define	ERROR_ID_CONFIG_PARSE_ERROR		2
#define	ERROR_ID_INVALID_CONTEXT		3
#define	ERROR_ID_INVALID_EXEC_ID		4
#define ERROR_ID_INVALID_FILESPEC		5
#define ERROR_ID_INVALID_OP_COMMAND		6
#define ERROR_ID_INVALID_OPERATOR		7
#define ERROR_ID_INVALID_TYPE			8
#define ERROR_ID_LOGIC_ERROR			9
#define	ERROR_ID_NO_DATA			10
#define ERROR_ID_NO_SESSION			11
#define ERROR_ID_OUT_OF_MEMORY			12
#define	ERROR_ID_PARSING_PROC			13
#define	ERROR_ID_PARSING_REQUEST		14
#define ERROR_ID_REQ_CONFIG_MISSING		15
#define	ERROR_ID_UNABLE_TO_ADD			16
#define	ERROR_ID_UNABLE_TO_ADD_CANNOT_CREATE	17
#define	ERROR_ID_UNABLE_TO_ADD_DUPLICATE	18
#define ERROR_ID_UNABLE_TO_ADD_INVALID_CONTEXT	19
#define	ERROR_ID_UNABLE_TO_ADD_NO_NAME		20
#define ERROR_ID_UNABLE_TO_ADD_USER		21
#define	ERROR_ID_UNABLE_TO_COMMIT		22
#define	ERROR_ID_UNABLE_TO_COMMIT_INV		23
#define	ERROR_ID_UNABLE_TO_DELETE		24
#define	ERROR_ID_UNABLE_TO_DELETE_AD		25
#define	ERROR_ID_UNABLE_TO_DELETE_MWN		26
#define	ERROR_ID_UNABLE_TO_EXECUTE		27
#define	ERROR_ID_UNABLE_TO_EXECUTE_RUIU		28
#define	ERROR_ID_UNABLE_TO_KILL_EXEC		29
#define	ERROR_ID_UNABLE_TO_REVERT		30
#define	ERROR_ID_UNABLE_TO_SET_VALUE		31
#define	ERROR_ID_UNABLE_TO_SET_VALUE_CS		32
#define ERROR_ID_UNK				33
#define ERROR_ID_UNK_ACTION			34


#include <list>
#include <string>
#include "basic/basic_error_info.hh"

class ErrorInfo : public BasicErrorInfo {
public:

	ErrorInfo();
	ErrorInfo(int line, int codeError);
	ErrorInfo(int line, int codeError, const std::string & strDesc);

	void setInfoAuthFailed(int line, const std::string & strUser);
	void setInfoConfigParseError(int line, const std::string & strFilespec, const std::string & strErrMsg);
	void setInfoInvalidContext(int line, const std::string & strErrorMsg);
	void setInfoInvalidExecId(int line, unsigned long idExec);
	void setInfoInvalidFilespec(int line, const std::string & strFilespec, const std::string & strErrMsg);
	void setInfoInvalidOperator(int line, const std::string & strOperator);
	void setInfoInvalidOpCommand(int line, unsigned long idOpCommand);
	void setInfoInvalidOpCommand(int line, const std::string & strOpCommandParts);
	void setInfoInvalidOpCommand(int line, const std::list<std::string> & listOpCommandParts);
	void setInfoInvalidType(int line, const std::string & strType, const std::string & strErrMsg); 

	void setInfoLogicError(int line);
	void setInfoNoData(int line);
	void setInfoNoSession(int line);
	void setInfoOutOfMemory(int line);
	void setInfoParsingProc(int line, const std::string & strProc);
	void setInfoParsingRequest(int line, const std::string & strDesc);
	void setInfoReqConfigMissing(int line, const std::string & strDesc);
	void setInfoUnableToAdd(int line);
	void setInfoUnableToAddCannotCreate(int line);
	void setInfoUnableToAddDuplicate(int line);
	void setInfoUnableToAddInvalidContext(int line);
	void setInfoUnableToAddNoName(int line);
	void setInfoUnableToAddUser(int line, const std::string & strUser, const std::string & strPassword);
	void setInfoUnableToCommit(int line);
	void setInfoUnableToCommit_InvalidValues(int line);
	void setInfoUnableToDelete(int line);
	void setInfoUnableToDeleteAD(int line);
	void setInfoUnableToDeleteMWN(int line);
	void setInfoUnableToExecute(int line);
	void setInfoUnableToExecuteRUIU(int line, const std::list<std::pair<int, std::string> > & listUnsatisfied);
	void setInfoUnableToKillExec(int line, unsigned long idExec);
	void setInfoUnableToRevert(int line, const std::string & strErrorMsg);
	void setInfoUnableToSetValue(int line, const std::string & strErrorMsg);
	void setInfoUnableToSetValueCS(int line, const std::string & strErrorMsg);
	void setInfoUnknownAction(int line, const std::string & strAction);
};

#endif

