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
 *  Module:       xgdaemon_common_xml.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Main utility class for parsing XML communication between xgdaemon and xgcgi
 *
 */

#ifndef __INCLUDE_XGDAEMON_COMMON_XML_HH__
#define __INCLUDE_XGDAEMON_COMMON_XML_HH__


#define	ACTION_ABS_REMOVE_COMMIT					"abs_remove_commit"
#define	ACTION_ADD							"add"
#define	ACTION_ADD_CONTEXT						"add_context"
#define	ACTION_CH_CONTEXT						"ch_context"
#define	ACTION_CH_CONTEXT_CLOSEST					"ch_context_closest"
#define	ACTION_COMMIT							"commit"
#define	ACTION_EXEC_CMD_ID						"exec_cmd_id"
#define	ACTION_EXEC_CMD_ARGS_ID						"exec_cmd_args_id"
#define	ACTION_EXEC_CMD_ARGS_NAME					"exec_cmd_args_name"
#define	ACTION_EXEC_CMD_S_SR4U						"exec_cmd_s_sr4u"
#define	ACTION_EXEC_KILL						"exec_kill"
#define	ACTION_EXEC_QUERY_ID						"exec_query_id"
#define	ACTION_EXEC_QUERY_NAME						"exec_query_name"
#define	ACTION_EXEC_STATUS						"exec_status"
#define	ACTION_EXECS_STATUS						"execs_status"
#define	ACTION_GET_SESSION						"get_session"
#define	ACTION_GET_SYSTEM						"get_system"
#define	ACTION_LOAD							"load"
#define	ACTION_LOGIN							"login"
#define	ACTION_LOGOUT							"logout"
#define	ACTION_LS_CONTEXT						"ls_context"
#define	ACTION_OP_COMMANDS						"op_commands"
#define	ACTION_REMOVE							"remove"
#define	ACTION_REMOVE_CONTEXT						"remove_context"
#define	ACTION_RESET_COMMIT						"reset_commit"
#define	ACTION_RESET_TASK						"reset_task"
#define	ACTION_REVERT							"revert"
#define	ACTION_SAVE							"save"
#define	ACTION_SET							"set"
#define	ACTION_SET_RD							"set_rd"
#define ACTION_SHOW_CONFIG						"show_config"
#define	ACTION_SUBMIT							"submit"
#define ACTION_SYS_ADD_USER						"sys_add_user"
#define	ACTION_TEST							"test"
#define	ACTION_UNDELETE							"undelete"


#define XML_CLT_RL							"rl"

#define XML_CLT_RL_ACTION						"action"
#define XML_CLT_RL_ADD							"add"
#define XML_CLT_RL_ADD_TEMPLATE_ID					"template_id"
#define XML_CLT_RL_ADD_OP						"op"
#define XML_CLT_RL_ADD_VALUE						"value"
#define	XML_CLT_RL_AUTH							"auth"
#define	XML_CLT_RL_AUTH_USER						"user"
#define	XML_CLT_RL_AUTH_PWD						"pwd"
#define XML_CLT_RL_CONTEXT						"context"
#define XML_CLT_RL_CONTEXT_PATH						"path"
#define XML_CLT_RL_CONTEXT_SYB_NODES					"syb_nodes"
#define	XML_CLT_RL_EXEC_CMD						"exec_cmd"
#define	XML_CLT_RL_EXEC_CMD_ARGS					"args"
#define	XML_CLT_RL_EXEC_CMD_ARGS_ARG					"arg"
#define	XML_CLT_RL_EXEC_CMD_ARGS_ARG_NUM				"num"
#define	XML_CLT_RL_EXEC_CMD_ARGS_ARG_VALUE				"value"
#define	XML_CLT_RL_EXEC_CMD_COMMAND_ID					"command_id"
#define	XML_CLT_RL_EXEC_CMD_NAME					"name"
#define	XML_CLT_RL_EXEC_KILL						"exec_kill"
#define	XML_CLT_RL_EXEC_KILL_EXEC_ID					"exec_id"
#define	XML_CLT_RL_EXEC_KILL_OUTPUT_FROM				"output_from"
#define	XML_CLT_RL_EXEC_QUERY						"exec_query"
#define	XML_CLT_RL_EXEC_QUERY_COMMAND_ID				"command_id"
#define	XML_CLT_RL_EXEC_QUERY_NAME					"name"
#define	XML_CLT_RL_EXEC_STATUS						"exec_status"
#define	XML_CLT_RL_EXEC_STATUS_EXEC_ID					"exec_id"
#define	XML_CLT_RL_EXEC_STATUS_OUTPUT_FROM				"output_from"
#define XML_CLT_RL_EXEC_STATUS_OUTPUT_PRE				"output_pre"
#define	XML_CLT_RL_FILESPEC						"filespec"
#define	XML_CLT_RL_REMOVE						"remove"
#define	XML_CLT_RL_REVERT						"revert"
#define XML_CLT_RL_SEP_NODES						"nodes"
#define XML_CLT_RL_SEP_NODES_NODE					"node"
#define XML_CLT_RL_SEP_NODES_NODE_PATH					"path"
#define XML_CLT_RL_SEP_NODES_NODE_VALUE					"value"
#define	XML_CLT_RL_SESSION						"session"
#define	XML_CLT_RL_SESSION_ID						"id"
#define	XML_CLT_RL_TEST							"test"
#define	XML_CLT_RL_TYPE							"type"
#define	XML_CLT_RL_TYPE_EDITED						"edited"
#define	XML_CLT_RL_TYPE_RUNTIME						"runtime"
#define XML_CLT_RL_UNDELETE						"undelete"
#define XML_CLT_RL_UNDELETE_CONFIG_ID					"config_id"
#define XML_CLT_RL_UNDELETE_OP						"op"
#define XML_CLT_RL_UNDELETE_VALUE					"value"

#define	XML_CLT_RL_ZZ_NODES_NODE					"node"
#define	XML_CLT_RL_ZZ_NODES_NODE_CONFIG_ID				"config_id"
#define	XML_CLT_RL_ZZ_NODES_NODE_TEMPLATE_ID				"template_id"
#define	XML_CLT_RL_ZZ_NODES_NODE_OP					"op"
#define	XML_CLT_RL_ZZ_NODES_NODE_VALUE					"value"


#define	XML_SRV_RL_EXEC_QUERY						"exec_query"
#define	XML_SRV_RL_EXEC_QUERY_ACTION					"action"
#define	XML_SRV_RL_EXEC_QUERY_ARGS					"args"
#define	XML_SRV_RL_EXEC_QUERY_ARGS_ARG					"arg"
#define	XML_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED				"allowed"
#define	XML_SRV_RL_EXEC_QUERY_ARGS_ARG_ALLOWED_ITEM			"item"
#define	XML_SRV_RL_EXEC_QUERY_ARGS_ARG_DYNAMIC				"dynamic"
#define	XML_SRV_RL_EXEC_QUERY_ARGS_ARG_NAME				"name"
#define XML_SRV_RL_EXEC_QUERY_ARGS_ARG_NO_VALUES			"no_values"
#define	XML_SRV_RL_EXEC_QUERY_ARGS_ARG_NUM				"num"
#define	XML_SRV_RL_EXEC_QUERY_COMMAND_ID				"command_id"
#define	XML_SRV_RL_EXEC_QUERY_COMMAND_TYPE				"command_type"
#define	XML_SRV_RL_EXEC_QUERY_HELP_STRING				"help_string"
#define	XML_SRV_RL_EXEC_QUERY_MODULE					"module"
#define	XML_SRV_RL_EXEC_QUERY_NAME					"name"
#define	XML_SRV_RL_EXEC_STATUS						"exec_status"
#define	XML_SRV_RL_EXEC_STATUS_BRIEF					"brief"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED					"detailed"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_DATA				"data"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U			"sr4u"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_NETWORK		"network"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_NEXTHOP		"nexthop"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_INTERFACE		"interface"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_VIF			"vif"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_METRIC		"metric"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_PROTOCOL		"protocol"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_DATA_SR4U_ADMIN_DISTANCE	"admin_distance"

#define	XML_SRV_RL_EXEC_STATUS_DETAILED_OUTPUT				"output"
#define	XML_SRV_RL_EXEC_STATUS_DETAILED_OUTPUT_FROM			"output_from"

#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA				"tdata"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_HEADER			"header"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL		"col"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL_NUM		"num"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_HEADER_COL_NAME		"name"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_TOTAL_COLS		"total_cols"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_TOTAL_ROWS		"total_rows"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS			"rows"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW			"row"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_NUM		"num"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS		"cols"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL		"col"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL_NUM	"num"
#define XML_SRV_RL_EXEC_STATUS_DETAILED_TDATA_ROWS_ROW_COLS_COL_VAL	"val"

#define	XML_SRV_RL_EXECS						"execs"
#define	XML_SRV_RL_EXECS_BRIEF						"brief"


#define	XML_SRV_RL_OP_COMMANDS						"op_commands"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND				"op_command"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND_ACTION			"action"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND_COMMAND_ID			"command_id"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND_HELP_STRING			"help_string"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND_MODULE			"module"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND_NAME				"name"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE				"type"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_EXPANDED			"exp"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_NON_EXPANDED		"nexp"
#define	XML_SRV_RL_OP_COMMANDS_OP_COMMAND_TYPE_REGULAR			"reg"

#define XML_SRV_RL_OUTPUT						"output"
#define XML_SRV_RL_SEP_NODES						"sep_nodes"
#define XML_SRV_RL_SEP_NODES_NODE_PATH					"path"

#define	XML_SRV_RL_SESSION						"session"

#define	XML_SRV_RL_SESSION_MODS						"mods"

#define	XML_SRV_RL_SESSION_INVALID_NODES				"invalid_nodes"
#define XML_SRV_RL_SESSION_INVALID_NODES_INVALID_NODE			"invalid_node"
#define XML_SRV_RL_SESSION_INVALID_NODES_INVALID_NODE_PATH		"path"
#define	XML_SRV_RL_SESSION_MODS_ADDED_NODES				"added_nodes"
#define	XML_SRV_RL_SESSION_MODS_CHANGED_NODES				"changed_nodes"
#define	XML_SRV_RL_SESSION_MODS_DELETED_NODES				"deleted_nodes"
#define	XML_SRV_RL_SESSION_MODS_MISSING_NODES				"missing_nodes"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT					"segment"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_NAME				"name"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_MOD				"mod"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_ADDED			"added"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_CHANGED			"changed"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_DELETED			"deleted"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_MOD_MISSING			"missing"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_INVALID				"invalid"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_MISS_REQ			"miss_req"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_MULTI_CH			"multi_ch"
#define	XML_SRV_RL_SESSION_MODS_SEGMENT_VALUE				"value"

#define XML_SRV_RL_SESSION_CONTEXT					"context"
#define XML_SRV_RL_SESSION_CONTEXT_PATH					"path"
#define XML_SRV_RL_SESSION_CONTEXT_EPATH				"epath"
#define XML_SRV_RL_SESSION_CONTEXT_NEPATH				"nepath"
#define XML_SRV_RL_SESSION_CONTEXT_SYB_NODES				"syb_nodes"

#define	XML_SRV_RL_SESSION_ID						"id"
#define	XML_SRV_RL_SESSION_STATUS					"status"
#define	XML_SRV_RL_SESSION_STATUS_CAN_COMMIT				"can_commit"
#define	XML_SRV_RL_SESSION_STATUS_CONFIG_CHANGED			"config_changed"
#define	XML_SRV_RL_SESSION_STATUS_CONFIG_INVALID			"config_invalid"
#define	XML_SRV_RL_SESSION_STATUS_INVALID_STATE				"invalid_state"
#define	XML_SRV_RL_SESSION_STATUS_PHASE					"phase"
#define	XML_SRV_RL_SESSION_STATUS_TASK					"task"
#define	XML_SRV_RL_SESSION_STATUS_TASK_DONE				"done"
#define	XML_SRV_RL_SESSION_STATUS_TASK_ERROR				"error"
#define	XML_SRV_RL_SESSION_STATUS_TASK_MESSAGE				"message"
#define	XML_SRV_RL_SESSION_STATUS_TASK_NAME				"name"
#define	XML_SRV_RL_SESSION_STATUS_TASK_STAGE				"stage"
#define	XML_SRV_RL_SESSION_STATUS_TASK_STAGE_CURRENT			"current"
#define	XML_SRV_RL_SESSION_STATUS_TASK_STAGE_MAX			"max"
#define	XML_SRV_RL_SESSION_STATUS_TIME_LAST_ACTIVITY			"time_last_activity"
#define	XML_SRV_RL_SESSION_STATUS_TIME_NOW				"time_now"
#define	XML_SRV_RL_SESSION_STATUS_TIME_START				"time_start"
#define XML_SRV_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES			"total_config_changes"
#define	XML_SRV_RL_SESSION_STATUS_TOTAL_CYCLES				"total_cycles"
#define XML_SRV_RL_SESSION_USERNAME					"username"

#define	XML_SRV_RL_SYSTEM						"system"
#define	XML_SRV_RL_SYSTEM_NET						"net"
#define	XML_SRV_RL_SYSTEM_NET_IN					"in"
#define	XML_SRV_RL_SYSTEM_NET_INO_BYTES					"bytes"
#define	XML_SRV_RL_SYSTEM_NET_INO_COMPRESSED				"compressed"
#define	XML_SRV_RL_SYSTEM_NET_INO_DROP					"drop"
#define	XML_SRV_RL_SYSTEM_NET_INO_ERRS					"errs"
#define	XML_SRV_RL_SYSTEM_NET_INO_FIFO					"fifo"
#define	XML_SRV_RL_SYSTEM_NET_INO_PACKETS				"packets"
#define	XML_SRV_RL_SYSTEM_NET_OUT					"out"
#define XML_SRV_RL_SYSTEM_STAT						"stat"
#define XML_SRV_RL_SYSTEM_STAT_CPU					"cpu"
#define XML_SRV_RL_SYSTEM_STAT_CPU_INDEX				"index"
#define XML_SRV_RL_SYSTEM_STAT_CPU_USE					"use"
#define XML_SRV_RL_SYSTEM_STAT_CPU_NIC					"nic"
#define XML_SRV_RL_SYSTEM_STAT_CPU_SYS					"sys"
#define XML_SRV_RL_SYSTEM_STAT_CPU_IDL					"idl"
#define XML_SRV_RL_SYSTEM_STAT_CPU_IOW					"iow"
#define XML_SRV_RL_SYSTEM_STAT_CPU_XXX					"xxx"
#define XML_SRV_RL_SYSTEM_STAT_CPU_YYY					"yyy"
#define	XML_SRV_RL_SYSTEM_TIME						"time"
#define	XML_SRV_RL_SYSTEM_TIME_GMT_TIME					"gmt_time"
#define	XML_SRV_RL_SYSTEM_TIME_LOCAL_TIME				"local_time"

#define	XML_SRV_RL_SYSTEM_TIME_UPTIME					"uptime"
#define	XML_SRV_RL_SYSTEM_TIME_UPTIME_IDLE				"idle"
#define	XML_SRV_RL_SYSTEM_TIME_UPTIME_TOTAL				"total"

#define	XML_SRV_RL_TEST							"test"

#define	XML_SRV_RL_ZZ_BRIEF						"brief"
#define	XML_SRV_RL_ZZ_BRIEF_CACHED_CMD_LINE				"cached_cmd_line"
#define	XML_SRV_RL_ZZ_BRIEF_DONE					"done"
#define	XML_SRV_RL_ZZ_BRIEF_DONE_MSG					"done_msg"
#define	XML_SRV_RL_ZZ_BRIEF_DONE_SUCCESS				"done_success"
#define	XML_SRV_RL_ZZ_BRIEF_EXEC_ID					"exec_id"
#define XML_SRV_RL_ZZ_BRIEF_KILL_INVOKED				"kill_invoked"
#define XML_SRV_RL_ZZ_BRIEF_TIME_START					"time_start"
#define XML_SRV_RL_ZZ_BRIEF_TIME_END					"time_end"
#define XML_SRV_RL_ZZ_BRIEF_TOTAL_LINES					"total_lines"

#define XML_SRV_RL_ZZ_NODES_MOD_NODE					"mod_node"
#define XML_SRV_RL_ZZ_NODES_MOD_NODE_PATH				"path"

#define XML_SRV_RL_ZZ_NODES_NODE					"node"
#define	XML_SRV_RL_ZZ_NODES_NODE_CONFIG_ID				"config_id"
#define XML_SRV_RL_ZZ_NODES_NODE_CONTEXT_SWITCH				"context_switch"
#define XML_SRV_RL_ZZ_NODES_NODE_DEPRECATED				"deprecated"
#define XML_SRV_RL_ZZ_NODES_NODE_DEPRECATED_REASON			"deprecated_reason"
#define	XML_SRV_RL_ZZ_NODES_NODE_DATA_TYPE				"data_type"
#define XML_SRV_RL_ZZ_NODES_NODE_EPATH					"epath"
#define	XML_SRV_RL_ZZ_NODES_NODE_HELP_STRING				"help_string"
#define	XML_SRV_RL_ZZ_NODES_NODE_MANDATORY				"mandatory"
#define	XML_SRV_RL_ZZ_NODES_NODE_MULTI_NODE				"multi_node"
#define XML_SRV_RL_ZZ_NODES_NODE_NAME					"name"
#define XML_SRV_RL_ZZ_NODES_NODE_NEPATH					"nepath"
#define XML_SRV_RL_ZZ_NODES_NODE_NSTAT					"nstat"
#define XML_SRV_RL_ZZ_NODES_NODE_PATH					"path"
#define	XML_SRV_RL_ZZ_NODES_NODE_REQUIRED				"required"
#define XML_SRV_RL_ZZ_NODES_NODE_SUB					"sub"
#define	XML_SRV_RL_ZZ_NODES_NODE_TEMPLATE_ID				"template_id"
#define	XML_SRV_RL_ZZ_NODES_NODE_TOTAL_ECHILDREN			"total_echildren"
#define	XML_SRV_RL_ZZ_NODES_NODE_TOTAL_ECHILDREN_CS			"total_echildren_cs"
#define	XML_SRV_RL_ZZ_NODES_NODE_TOTAL_NECHILDREN			"total_nechildren"
#define	XML_SRV_RL_ZZ_NODES_NODE_TOTAL_NECHILDREN_CS			"total_nechildren_cs"
#define	XML_SRV_RL_ZZ_NODES_NODE_USER_HIDDEN				"user_hidden"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE					"value"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED				"allowed"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_OP			"op"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM			"item"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_HELP		"help"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_ITEM_VALUE		"value"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE			"range"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_HELP		"help"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MAX		"max"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ALLOWED_RANGE_MIN		"min"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_CURRENT				"current"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_CURRENT_OP			"current_op"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_CURRENT_EXISTS			"current_exists"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_DEF				"def"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_DEF_EXISTS			"def_exists"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_ERROR_DESC			"error_desc"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_HIDE				"hide"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_INVALID				"invalid"
#define	XML_SRV_RL_ZZ_NODES_NODE_VALUE_INVALID_DESC			"invalid_desc"

#define XML_SRV_RL_ZZ_PATH_SEGMENT					"segment"
#define XML_SRV_RL_ZZ_PATH_SEGMENT_CONFIG_ID				"config_id"
#define XML_SRV_RL_ZZ_PATH_SEGMENT_MULTI				"multi"
#define XML_SRV_RL_ZZ_PATH_SEGMENT_NAME					"name"
#define	XML_SRV_RL_ZZ_PATH_SEGMENT_NSTAT				"nstat"
#define XML_SRV_RL_ZZ_PATH_SEGMENT_SUB					"sub"
#define XML_SRV_RL_ZZ_PATH_SEGMENT_TEMPLATE_ID				"template_id"

#define XML_SRV_RL_ZZ_SUB_ADDED						"added"
#define XML_SRV_RL_ZZ_SUB_CHANGED					"changed"
#define XML_SRV_RL_ZZ_SUB_DELETED					"deleted"
#define XML_SRV_RL_ZZ_SUB_INVALID					"invalid"
#define XML_SRV_RL_ZZ_SUB_MISSING_REQUIRED				"miss_req"

#define XML_SRV_RL_ZZ_NSTAT_ADDED					"added"
#define XML_SRV_RL_ZZ_NSTAT_CHANGED					"changed"
#define XML_SRV_RL_ZZ_NSTAT_DELETED					"deleted"
#define XML_SRV_RL_ZZ_NSTAT_INVALID					"invalid"
#define XML_SRV_RL_ZZ_NSTAT_MISSING_REQUIRED				"miss_req"

#define	XML_SRV_RL_ZZ_TIME_ASC						"asc"
#define	XML_SRV_RL_ZZ_TIME_ASC_HOUR24					"asc_hour24"
#define	XML_SRV_RL_ZZ_TIME_ASC_MINUTE					"asc_minute"
#define	XML_SRV_RL_ZZ_TIME_UEPOCH					"uepoch"
#define	XML_SRV_RL_ZZ_TIME_ZONE						"zone"


#include "basic/xml_info.hh"
#include "basic/common_xml.hh"


class XGDaemonCommonXmlUtil : public CommonXmlUtil {
public:
	static const std::string & get_CLT_RL_ACTION(const XmlInfo & xi);
	static const std::string & get_CLT_RL_ADD_TEMPLATE_ID(const XmlInfo & xi);
	static const std::string & get_CLT_RL_ADD_OP(const XmlInfo & xi);
	static const std::string & get_CLT_RL_ADD_VALUE(const XmlInfo & xi);
	static const std::string & get_CLT_RL_CONTEXT_PATH(const XmlInfo & xi);
	static const std::string & get_CLT_RL_EXEC_CMD_COMMAND_ID(const XmlInfo & xi);
	static const std::string & get_CLT_RL_EXEC_CMD_NAME(const XmlInfo & xi);
	static const std::string & get_CLT_RL_EXEC_KILL_EXEC_ID(const XmlInfo & xi);
	static const std::string & get_CLT_RL_EXEC_KILL_OUTPUT_FROM(const XmlInfo & xi);
	static const std::string & get_CLT_RL_EXEC_QUERY_COMMAND_ID(const XmlInfo & xi);
	static const std::string & get_CLT_RL_EXEC_QUERY_NAME(const XmlInfo & xi);
	static const std::string & get_CLT_RL_EXEC_STATUS_EXEC_ID(const XmlInfo & xi);
	static const std::string & get_CLT_RL_EXEC_STATUS_OUTPUT_FROM(const XmlInfo & xi);
	static const std::string & get_CLT_RL_EXEC_STATUS_OUTPUT_PRE(const XmlInfo & xi);
	static const std::string & get_CLT_RL_FILESPEC(const XmlInfo & xi);
	static const std::string & get_CLT_RL_REMOVE(const XmlInfo & xi);
	static const std::string & get_CLT_RL_REVERT(const XmlInfo & xi);
	static const std::string & get_CLT_RL_SESSION_ID(const XmlInfo & xi);
	static const std::string & get_CLT_RL_TEST(const XmlInfo & xi);
	static const std::string & get_CLT_RL_TYPE(const XmlInfo & xi);
	static const std::string & get_CLT_RL_UNDELETE_CONFIG_ID(const XmlInfo & xi);
	static const std::string & get_CLT_RL_UNDELETE_VALUE(const XmlInfo & xi);

	static const std::string & get_SRV_RL_EXEC_QUERY_ACTION(const XmlInfo & xi);
	static const std::string & get_SRV_RL_EXEC_QUERY_COMMAND_ID(const XmlInfo & xi);
	static const std::string & get_SRV_RL_EXEC_QUERY_COMMAND_TYPE(const XmlInfo & xi);
	static const std::string & get_SRV_RL_EXEC_QUERY_HELP_STRING(const XmlInfo & xi);
	static const std::string & get_SRV_RL_EXEC_QUERY_MODULE(const XmlInfo & xi);
	static const std::string & get_SRV_RL_EXEC_QUERY_NAME(const XmlInfo & xi);

	static const std::string & get_SRV_RL_SESSION_ID(const XmlInfo & xi);
	static const std::string & get_SRV_RL_SESSION_STATUS_CAN_COMMIT(const XmlInfo & xi);
	static const std::string & get_SRV_RL_SESSION_STATUS_CONFIG_CHANGED(const XmlInfo & xi);
	static const std::string & get_SRV_RL_SESSION_STATUS_CONFIG_INVALID(const XmlInfo & xi);
	static const std::string & get_SRV_RL_SESSION_STATUS_INVALID_STATE(const XmlInfo & xi);
	static const std::string & get_SRV_RL_SESSION_STATUS_PHASE(const XmlInfo & xi);
	static const std::string & get_SRV_RL_SESSION_STATUS_TIME_LAST_ACTIVITY(const XmlInfo & xi);

	static const std::string & get_SRV_RL_SESSION_STATUS_TIME_START(const XmlInfo & xi);
	static const std::string & get_SRV_RL_SESSION_STATUS_TOTAL_CONFIG_CHANGES(const XmlInfo & xi);
	static const std::string & get_SRV_RL_SESSION_STATUS_TOTAL_CYCLES(const XmlInfo & xi);
	static const std::string & get_SRV_RL_SESSION_USERNAME(const XmlInfo & xi);

	static const std::string & get_SRV_RL_TEST(const XmlInfo & xi);

	static XmlNodeElement * getXNE_CLT_RL(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_ACTION(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_ADD(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_ADD_TEMPLATE_ID(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_ADD_OP(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_ADD_VALUE(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_CONTEXT_PATH(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_CONTEXT_SYB_NODES(const XmlInfo & xi);

	static XmlNodeElement * getXNE_CLT_RL_EXEC_CMD(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_EXEC_CMD_COMMAND_ID(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_EXEC_CMD_ARGS(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_EXEC_QUERY_COMMAND_ID(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_EXEC_STATUS_EXEC_ID(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_EXEC_STATUS_OUTPUT_FROM(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_EXEC_STATUS_OUTPUT_PRE(const XmlInfo & xi);

	static XmlNodeElement * getXNE_CLT_RL_FILESPEC(const XmlInfo & xi);

	static XmlNodeElement * getXNE_CLT_RL_REMOVE(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_REVERT(const XmlInfo & xi);

	static XmlNodeElement * getXNE_CLT_RL_SEP_NODES(const XmlInfo & xi);

	static XmlNodeElement * getXNE_CLT_RL_UNDELETE_CONFIG_ID(const XmlInfo & xi);
	static XmlNodeElement * getXNE_CLT_RL_UNDELETE_VALUE(const XmlInfo & xi);


	static XmlNodeElement * getXNE_SRV_RL(const XmlInfo & xi);

	static XmlNodeElement * getXNE_SRV_RL_ERROR(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_ERROR_DESC(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_ERROR_ID(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_ERROR_LINE(const XmlInfo & xi);

	static XmlNodeElement * getXNE_SRV_RL_EXEC_QUERY(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_EXEC_QUERY_ACTION(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_EXEC_QUERY_ARGS(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_EXEC_QUERY_COMMAND_ID(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_EXEC_QUERY_HELP_STRING(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_EXEC_QUERY_MODULE(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_EXEC_QUERY_NAME(const XmlInfo & xi);

	static XmlNodeElement * getXNE_SRV_RL_EXEC_STATUS(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_EXEC_STATUS_BRIEF(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_EXEC_STATUS_DETAILED_OUTPUT(const XmlInfo & xi);

	static XmlNodeElement * getXNE_SRV_RL_EXECS(const XmlInfo & xi);

	static XmlNodeElement * getXNE_SRV_RL_OP_COMMANDS(const XmlInfo & xi);
	
	static XmlNodeElement * getXNE_SRV_RL_SEP_NODES(const XmlInfo & xi);

	static XmlNodeElement * getXNE_SRV_RL_SESSION_CONTEXT(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_SESSION_CONTEXT_EPATH(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_SESSION_CONTEXT_NEPATH(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_SESSION_CONTEXT_SYB_NODES(const XmlInfo & xi);

	static XmlNodeElement * getXNE_SRV_RL_SESSION_MODS(const XmlInfo & xi);

	static XmlNodeElement * getXNE_SRV_RL_SESSION_STATUS_TASK(const XmlInfo & xi);
	static XmlNodeElement * getXNE_SRV_RL_SESSION_STATUS_TIME_NOW(const XmlInfo & xi);
};

#endif

