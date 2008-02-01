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
 *  Module:       xgdaemon_common_xml.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Main utility class for parsing XML communication between xgdaemon and xgcgi
 *
 */


#include <stdexcept>

#include "xgdaemon_common_xml.hh"
#include "basic/xgdaemon_util.hh"


const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_ACTION(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_ACTION = getXNE_CLT_RL_ACTION(xi);
	if (p_xne_c_RL_ACTION == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_ACTION->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_ADD_TEMPLATE_ID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_ADD_TEMPLATE_ID = getXNE_CLT_RL_ADD_TEMPLATE_ID(xi);
	if (p_xne_c_RL_ADD_TEMPLATE_ID == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_ADD_TEMPLATE_ID->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_ADD_OP(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_ADD_OP = getXNE_CLT_RL_ADD_OP(xi);
	if (p_xne_c_RL_ADD_OP == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_ADD_OP->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_ADD_VALUE(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_ADD_VALUE = getXNE_CLT_RL_ADD_VALUE(xi);
	if (p_xne_c_RL_ADD_VALUE == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_ADD_VALUE->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_CONTEXT_PATH(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_CONTEXT_PATH = getXNE_CLT_RL_CONTEXT_PATH(xi);
	if (p_xne_c_RL_CONTEXT_PATH == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_CONTEXT_PATH->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_CMD_COMMAND_ID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_EXEC_CMD_COMMAND_ID = getXNE_CLT_RL_EXEC_CMD_COMMAND_ID(xi);
	if (p_xne_c_RL_EXEC_CMD_COMMAND_ID == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_EXEC_CMD_COMMAND_ID->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_CMD_NAME(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_EXEC_CMD_NAME =  xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_CMD, XML_CLT_RL_EXEC_CMD_NAME);
	if (p_xne_c_RL_EXEC_CMD_NAME == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_EXEC_CMD_NAME->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_KILL_EXEC_ID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_EXEC_KILL_EXEC_ID = xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_KILL, XML_CLT_RL_EXEC_KILL_EXEC_ID);
	if (p_xne_c_RL_EXEC_KILL_EXEC_ID == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_EXEC_KILL_EXEC_ID->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_KILL_OUTPUT_FROM(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_EXEC_KILL_OUTPUT_FROM = xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_KILL, XML_CLT_RL_EXEC_KILL_OUTPUT_FROM);
	if (p_xne_c_RL_EXEC_KILL_OUTPUT_FROM == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_EXEC_KILL_OUTPUT_FROM->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_QUERY_COMMAND_ID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_EXEC_QUERY_COMMAND_ID = getXNE_CLT_RL_EXEC_QUERY_COMMAND_ID(xi);
	if (p_xne_c_RL_EXEC_QUERY_COMMAND_ID == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_EXEC_QUERY_COMMAND_ID->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_QUERY_NAME(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_EXEC_QUERY_NAME = xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_QUERY, XML_CLT_RL_EXEC_QUERY_NAME);
	if (p_xne_c_RL_EXEC_QUERY_NAME == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_EXEC_QUERY_NAME->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_EXEC_ID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_EXEC_STATUS_EXEC_ID = getXNE_CLT_RL_EXEC_STATUS_EXEC_ID(xi);
	if (p_xne_c_RL_EXEC_STATUS_EXEC_ID == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_EXEC_STATUS_EXEC_ID->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_OUTPUT_FROM(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_EXEC_STATUS_OUTPUT_FROM = getXNE_CLT_RL_EXEC_STATUS_OUTPUT_FROM(xi);
	if (p_xne_c_RL_EXEC_STATUS_OUTPUT_FROM == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_EXEC_STATUS_OUTPUT_FROM->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_EXEC_STATUS_OUTPUT_PRE(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_EXEC_STATUS_OUTPUT_PRE = getXNE_CLT_RL_EXEC_STATUS_OUTPUT_PRE(xi);
	if (p_xne_c_RL_EXEC_STATUS_OUTPUT_PRE == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_EXEC_STATUS_OUTPUT_PRE->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_FILESPEC(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_FILESPEC = getXNE_CLT_RL_FILESPEC(xi);
	if (p_xne_c_RL_FILESPEC == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_FILESPEC->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_REMOVE(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_REMOVE = getXNE_CLT_RL_REMOVE(xi);
	if (p_xne_c_RL_REMOVE == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_REMOVE->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_REVERT(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_REVERT = getXNE_CLT_RL_REVERT(xi);
	if (p_xne_c_RL_REVERT == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_REVERT->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_SESSION_ID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_SESSION_ID = xi.find3(XML_CLT_RL, XML_CLT_RL_SESSION, XML_CLT_RL_SESSION_ID);
	if (p_xne_c_RL_SESSION_ID == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_SESSION_ID->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_TEST(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_TEST = xi.find2(XML_CLT_RL, XML_CLT_RL_TEST);
	if (p_xne_c_RL_TEST == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_TEST->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_TYPE(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_TYPE = xi.find2(XML_CLT_RL, XML_CLT_RL_TYPE);
	if (p_xne_c_RL_TYPE == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_c_RL_TYPE->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_UNDELETE_CONFIG_ID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_UNDELETE_CONFIG_ID = getXNE_CLT_RL_UNDELETE_CONFIG_ID(xi);
	return p_xne_c_RL_UNDELETE_CONFIG_ID == NULL ? XGDaemonUtil::getBlankString() : p_xne_c_RL_UNDELETE_CONFIG_ID->get1InternalText();
}
const std::string & XGDaemonCommonXmlUtil::get_CLT_RL_UNDELETE_VALUE(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_c_RL_UNDELETE_VALUE = getXNE_CLT_RL_UNDELETE_VALUE(xi);
	return p_xne_c_RL_UNDELETE_VALUE == NULL ? XGDaemonUtil::getBlankString() : p_xne_c_RL_UNDELETE_VALUE->get1InternalText();
}

const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_ACTION(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_EXEC_QUERY_ACTION = getXNE_SRV_RL_EXEC_QUERY_ACTION(xi);
	if (p_xne_s_RL_EXEC_QUERY_ACTION == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_EXEC_QUERY_ACTION->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_COMMAND_ID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_EXEC_QUERY_COMMAND_ID = getXNE_SRV_RL_EXEC_QUERY_COMMAND_ID(xi);
	if (p_xne_s_RL_EXEC_QUERY_COMMAND_ID == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_EXEC_QUERY_COMMAND_ID->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_COMMAND_TYPE(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_EXEC_QUERY_COMMAND_TYPE = xi.find3(XML_SRV_RL, XML_SRV_RL_EXEC_QUERY, XML_SRV_RL_EXEC_QUERY_COMMAND_TYPE);
	if (p_xne_s_RL_EXEC_QUERY_COMMAND_TYPE == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_EXEC_QUERY_COMMAND_TYPE->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_HELP_STRING(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_EXEC_QUERY_HELP_STRING = getXNE_SRV_RL_EXEC_QUERY_HELP_STRING(xi);
	if (p_xne_s_RL_EXEC_QUERY_HELP_STRING == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_EXEC_QUERY_HELP_STRING->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_MODULE(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_EXEC_QUERY_MODULE = getXNE_SRV_RL_EXEC_QUERY_MODULE(xi);
	if (p_xne_s_RL_EXEC_QUERY_MODULE == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_EXEC_QUERY_MODULE->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_EXEC_QUERY_NAME(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_EXEC_QUERY_NAME = getXNE_SRV_RL_EXEC_QUERY_NAME(xi);
	if (p_xne_s_RL_EXEC_QUERY_NAME == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_EXEC_QUERY_NAME->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_ID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_ID = xi.find3(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_ID);
	if (p_xne_s_RL_SESSION_ID == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_ID->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_CAN_COMMIT(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_STATUS_CAN_COMMIT = xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_CAN_COMMIT);
	if (p_xne_s_RL_SESSION_STATUS_CAN_COMMIT == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_STATUS_CAN_COMMIT->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_CONFIG_CHANGED(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_STATUS_CONFIG_CHANGES = xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_CONFIG_CHANGED);
	if (p_xne_s_RL_SESSION_STATUS_CONFIG_CHANGES == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_STATUS_CONFIG_CHANGES->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_CONFIG_INVALID(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_STATUS_CONFIG_INVALID = xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_CONFIG_INVALID);
	if (p_xne_s_RL_SESSION_STATUS_CONFIG_INVALID == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_STATUS_CONFIG_INVALID->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_INVALID_STATE(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_STATUS_INVALID_STATE = xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_INVALID_STATE);
	if (p_xne_s_RL_SESSION_STATUS_INVALID_STATE == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_STATUS_INVALID_STATE->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_PHASE(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_STATUS_PHASE = xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_PHASE);
	if (p_xne_s_RL_SESSION_STATUS_PHASE == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_STATUS_PHASE->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_TIME_LAST_ACTIVITY(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_STATUS_TIME_LAST_ACTIVITY = xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_TIME_LAST_ACTIVITY);
	if (p_xne_s_RL_SESSION_STATUS_TIME_LAST_ACTIVITY == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_STATUS_TIME_LAST_ACTIVITY->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_TIME_START(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_STATUS_TIME_START = xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_TIME_START);
	if (p_xne_s_RL_SESSION_STATUS_TIME_START == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_STATUS_TIME_START->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES = xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES);
	if (p_xne_s_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_STATUS_TOTAL_CYCLES(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_STATUS_TOTAL_CYCLES = xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_TOTAL_CYCLES);
	if (p_xne_s_RL_SESSION_STATUS_TOTAL_CYCLES == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_STATUS_TOTAL_CYCLES->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_SESSION_USERNAME(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_SESSION_USERNAME = xi.find3(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_USERNAME);
	if (p_xne_s_RL_SESSION_USERNAME == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_SESSION_USERNAME->get1InternalText();
	}
}
const std::string & XGDaemonCommonXmlUtil::get_SRV_RL_TEST(const XmlInfo & xi) {
	const XmlNodeElement * p_xne_s_RL_TEST = xi.find2(XML_SRV_RL, XML_SRV_RL_TEST);
	if (p_xne_s_RL_TEST == NULL) {
		return XGDaemonUtil::getBlankString();
	} else {
		return p_xne_s_RL_TEST->get1InternalText();
	}
}


XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL(const XmlInfo & xi) {
	return xi.find1(XML_CLT_RL);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_ACTION(const XmlInfo & xi) {
	return xi.find2(XML_CLT_RL, XML_CLT_RL_ACTION);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_ADD(const XmlInfo & xi) {
	return xi.find2(XML_CLT_RL, XML_CLT_RL_ADD);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_ADD_TEMPLATE_ID(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_ADD, XML_CLT_RL_ADD_TEMPLATE_ID);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_ADD_OP(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_ADD, XML_CLT_RL_ADD_OP);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_ADD_VALUE(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_ADD, XML_CLT_RL_ADD_VALUE);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_CONTEXT_PATH(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_CONTEXT, XML_CLT_RL_CONTEXT_PATH);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_CONTEXT_SYB_NODES(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_CONTEXT, XML_CLT_RL_CONTEXT_SYB_NODES);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_EXEC_CMD(const XmlInfo & xi) {
	return xi.find2(XML_CLT_RL, XML_CLT_RL_EXEC_CMD);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_EXEC_CMD_ARGS(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_CMD, XML_CLT_RL_EXEC_CMD_ARGS);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_EXEC_CMD_COMMAND_ID(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_CMD, XML_CLT_RL_EXEC_CMD_COMMAND_ID);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_EXEC_QUERY_COMMAND_ID(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_QUERY, XML_CLT_RL_EXEC_QUERY_COMMAND_ID);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_EXEC_STATUS_EXEC_ID(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_STATUS, XML_CLT_RL_EXEC_STATUS_EXEC_ID);	
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_EXEC_STATUS_OUTPUT_FROM(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_STATUS, XML_CLT_RL_EXEC_STATUS_OUTPUT_FROM);	
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_EXEC_STATUS_OUTPUT_PRE(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_STATUS, XML_CLT_RL_EXEC_STATUS_OUTPUT_PRE);	
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_FILESPEC(const XmlInfo & xi) {
	return xi.find2(XML_CLT_RL, XML_CLT_RL_FILESPEC);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_REMOVE(const XmlInfo & xi) {
	return xi.find2(XML_CLT_RL, XML_CLT_RL_REMOVE);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_REVERT(const XmlInfo & xi) {
	return xi.find2(XML_CLT_RL, XML_CLT_RL_REVERT);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_SEP_NODES(const XmlInfo & xi) {
	return xi.find2(XML_CLT_RL, XML_CLT_RL_SEP_NODES);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_UNDELETE_CONFIG_ID(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_UNDELETE, XML_CLT_RL_UNDELETE_CONFIG_ID);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_CLT_RL_UNDELETE_VALUE(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_UNDELETE, XML_CLT_RL_UNDELETE_VALUE);
}


XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL(const XmlInfo & xi) {
	return xi.find1(XML_SRV_RL);
}

XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_ERROR(const XmlInfo & xi) {
	return xi.find2(XML_SRV_RL, XML_SRV_RL_ERROR);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_ERROR_DESC(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_ERROR, XML_SRV_RL_ERROR_DESC);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_ERROR_ID(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_ERROR, XML_SRV_RL_ERROR_ID);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_ERROR_LINE(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_ERROR, XML_SRV_RL_ERROR_LINE);
}


XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_QUERY(const XmlInfo & xi) {
	return xi.find2(XML_SRV_RL, XML_SRV_RL_EXEC_QUERY);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_QUERY_ACTION(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_EXEC_QUERY, XML_SRV_RL_EXEC_QUERY_ACTION);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_QUERY_ARGS(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_EXEC_QUERY, XML_SRV_RL_EXEC_QUERY_ARGS);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_QUERY_COMMAND_ID(const XmlInfo & xi) {
	return xi.find3(XML_CLT_RL, XML_CLT_RL_EXEC_QUERY, XML_CLT_RL_EXEC_QUERY_COMMAND_ID);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_QUERY_HELP_STRING(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_EXEC_QUERY, XML_SRV_RL_EXEC_QUERY_HELP_STRING);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_QUERY_MODULE(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_EXEC_QUERY, XML_SRV_RL_EXEC_QUERY_MODULE);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_QUERY_NAME(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_EXEC_QUERY, XML_SRV_RL_EXEC_QUERY_NAME);
}


XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_STATUS(const XmlInfo & xi) {
	return xi.find2(XML_SRV_RL, XML_SRV_RL_EXEC_STATUS);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_STATUS_BRIEF(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_EXEC_STATUS, XML_SRV_RL_EXEC_STATUS_BRIEF);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXEC_STATUS_DETAILED_OUTPUT(const XmlInfo & xi) {
	return xi.find4(XML_SRV_RL, XML_SRV_RL_EXEC_STATUS, XML_SRV_RL_EXEC_STATUS_DETAILED, XML_SRV_RL_EXEC_STATUS_DETAILED_OUTPUT);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_EXECS(const XmlInfo & xi) {
	return xi.find2(XML_SRV_RL, XML_SRV_RL_EXECS);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_OP_COMMANDS(const XmlInfo & xi) {
	return xi.find2(XML_SRV_RL, XML_SRV_RL_OP_COMMANDS);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_SEP_NODES(const XmlInfo & xi) {
	return xi.find2(XML_SRV_RL, XML_SRV_RL_SEP_NODES);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_CONTEXT(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_CONTEXT);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_CONTEXT_EPATH(const XmlInfo & xi) {
	return xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_CONTEXT, XML_SRV_RL_SESSION_CONTEXT_EPATH);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_CONTEXT_NEPATH(const XmlInfo & xi) {
	return xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_CONTEXT, XML_SRV_RL_SESSION_CONTEXT_NEPATH);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_CONTEXT_SYB_NODES(const XmlInfo & xi) {
	return xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_CONTEXT, XML_SRV_RL_SESSION_CONTEXT_SYB_NODES);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_MODS(const XmlInfo & xi) {
	return xi.find3(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_MODS);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_STATUS_TASK(const XmlInfo & xi) {
	return xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_TASK);
}
XmlNodeElement * XGDaemonCommonXmlUtil::getXNE_SRV_RL_SESSION_STATUS_TIME_NOW(const XmlInfo & xi) {
	return xi.find4(XML_SRV_RL, XML_SRV_RL_SESSION, XML_SRV_RL_SESSION_STATUS, XML_SRV_RL_SESSION_STATUS_TIME_NOW);
}
