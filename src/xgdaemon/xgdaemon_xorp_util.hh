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
 *  Module:       xgdaemon_xorp_util.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Utility methods for doing a lot of things with XORP API.
 *
 */



#ifndef __INCLUDE_XGDAEMON_XORP_UTIL_HH__
#define __INCLUDE_XGDAEMON_XORP_UTIL_HH__

#define XORP_CONFIG_FILE_HEADER		"/*XORP Configuration File, v1.0*/\n"

#include <grp.h>
#include <unistd.h>

#include "libxorp/eventloop.hh"
#include "libxipc/xrl_std_router.hh"

#include "rtrmgr/conf_tree.hh"
#include "rtrmgr/config_operators.hh"
#include "rtrmgr/op_commands.hh"
#include "rtrmgr/slave_conf_tree.hh"
#include "rtrmgr/slave_conf_tree_node.hh"
#include "rtrmgr/template_tree.hh"
#include "rtrmgr/template_tree_node.hh"


#include "common/context_info.hh"
#include "common/error_info.hh"

#include "xorp_mod_info.hh"
#include "xorp_opcmd_info.hh"

enum NodeAdditionError {
	NAE_NOT_SPECIFIC = 0,
	NAE_UNABLE_TO_ADD_CANNOT_CREATE,
	NAE_UNABLE_TO_ADD_DUPLICATE,
	NAE_UNABLE_TO_ADD_INVALID_CONTEXT,
	NAE_UNABLE_TO_ADD_NO_NAME
};


class XGDaemonXorpUtil {

public:

	static bool compareIfALessThanB(ConfigTreeNode * p_ctnA, ConfigTreeNode * p_ctnB);

	static bool copyChildren(
			const ConfigTreeNode & ctnSource,
			SlaveConfigTreeNode & sctnDestination,
			const uint32_t xorp_idClient,
			const uid_t xorp_idUnixUser,
			NodeAdditionError & nae);

	static bool determineIfConfTreeNodesEqual(const ConfigTreeNode & ctnA, const ConfigTreeNode & ctnB);
	static bool determineIfConfTreesEqual(const ConfigTree & ctA, const ConfigTree & ctB);

	static bool determineIfAdded(const ConfigTree & ctSync, const ConfigTreeNode & ctnEdit);
	static bool determineIfChanged(const ConfigTree & ctSync, const ConfigTreeNode & ctnEdit);
	static bool determineIfChildrenMulti(const ConfigTreeNode & ctn);
	static bool determineIfDeleted(const ConfigTreeNode & ctn);
	static bool determineIfHasAddedChildren(const ConfigTree & ctSync, const ConfigTreeNode & ctn);
	static bool determineIfHasChangedChildren(const ConfigTree & ctSync, const ConfigTreeNode & ctn);
	static bool determineIfHasDeletedChildren(const ConfigTreeNode & ctn);
	static bool determineIfHasInvalidChildren(const ConfigTreeNode & ctn);
	static bool determineIfHasMissingRequiredChildren(const ConfigTreeNode & ctn);
	static bool determineIfHasMultiChildren(const TemplateTreeNode & ttn);
	static bool determineIfInvalid(const ConfigTreeNode & ctn);
	static bool determineIfMissingRequired(const ConfigTreeNode & ctn);	
	static bool determineIfValueValid(const ConfigTreeNode & ctn, std::string & strInvalidValueDesc);

	static bool isAssignOpOnly(const ConfigTreeNode & ctnNode);
	static bool isAssignOpOnly(const TemplateTreeNode & ttnNode);
	static bool isContextSwitch(const ConfigTreeNode & ctnNode);
	static bool isContextSwitch(const TemplateTreeNode & ttnNode);
	static bool isMandatory(const TemplateTreeNode & ttnNode);
	static bool isMultiNode(const ConfigTreeNode & ctnNode);
	static bool isMultiNode(const TemplateTreeNode & ttnNode);
	static bool isRequired(const ConfigTreeNode & ctnNode);
	static bool isRequired(const TemplateTreeNode & ttnNode);
	static bool isUserHidden(const TemplateTreeNode & ttnNode);

	static bool isXorpVariableExpression(const std::string & strExpression);

	static bool loadTemplateTree(TemplateTree & tt, const std::string& strXorpTemplateDir, std::string & strErrmsg);

	static bool repeatContextLocation(
			const ContextLocation & clContextToRepeat,
			const TemplateTree & tt,
			ConfigTree & ctSync,
			ConfigTree & ctEdit,
			ContextLocation & clContext,
			const TemplateTreeNode * & p_ttn,
			ConfigTreeNode * & p_ctn);

	static bool setContextLocationToPath(
			ContextLocation & clContext,
			const std::string & strContextPathEscaped,
			const TemplateTree & tt,
			const ConfigTree & ctSync,
			const ConfigTree & ctEdit,
			const TemplateTreeNode * & p_ttnContext,
			ConfigTreeNode * & p_ctnContext,
			bool flagFollowExistantPathOnly);

	static bool setContextLocationToPathSegments(
			ContextLocation & clContext,
			const std::list<PSegment> & listPathSegments,
			const TemplateTree & tt,
			const ConfigTree & ctSync,
			const ConfigTree & ctEdit,
			const TemplateTreeNode * & p_ttnContext,
			ConfigTreeNode * & p_ctnContext,
			bool flagFollowExistantPathOnly);

	static bool setOpVal(ConfigTreeNode & ctn, const OpVal & ov, const uid_t uid);
	static bool setValue(ConfigTreeNode & ctn, const std::string & strValue, const uid_t uid, std::string & strErrorMsg);

	static bool wait_for_xrlrouter_ready(EventLoop& eventloop, XrlRouter& xrl_router);

	static gid_t getGidXorp();

	static unsigned long getIdConfig(const ConfigTreeNode * p_ctn);
	static unsigned long getIdTemplate(const TemplateTreeNode * p_ttn);

	static unsigned long getTotalChildrenCS(const ConfigTreeNode & ctn);
	static unsigned long getTotalChildrenCS(const TemplateTreeNode & ttn);

	static void announce_waiting();

	static void determineNodesWithInvalidValues(const ConfigTree & ctSync, const ConfigTreeNode & ctnCheck, std::list<GeneralContextInfo> & listNodes);
	static void determineNodesWithInvalidValues(const ConfigTree & ctSync, const ConfigTree & ctCheck, std::list<GeneralContextInfo> & listNodes);

	static void fillListWithDataTypes(const TemplateTree & tt, std::list<std::string> & listDataTypes);
	static void fillListWithDataTypes(const TemplateTreeNode & ttn, std::list<std::string> & listDataTypes);

	static void printChildren(const ConfigTreeNode& ctnNode);

	static void printConfigTree(const ConfigTree & ct);
	static void printConfigTreeNode(int indent, const ConfigTreeNode & ctn);

	static void printOpCommandList(OpCommandList & ocl);

	static void pruneEditTree(const ConfigTree & ctSync, ConfigTree & ctEdit);
	static void pruneEditTreeNode(const ConfigTreeNode & ctnSync, ConfigTreeNode & ctnEdit);

	static void readChildren(
			ParentContextInfo & pciContext,
			const ConfigTree & ctSync,
			const TemplateTreeNode & ttnContext,
			const ConfigTreeNode * p_ctnContext);

	static void retrInvalid(
			XorpBasicContextInfos & xbciInvalid,
			const ConfigTreeNode & ctnEdit);

	static void retrListAllowedOperators(
			std::list<std::string> & listAllowedOperators,
			const TemplateTreeNode & ttn);

	static void retrListMatches(
			const ConfigTree & ctSync,
			const std::string & strExpressionBody,
			std::list<const ConfigTreeNode*> & listMatches);

	static void retrListMatchesN(
			const ConfigTreeNode & ctnSync,
			const std::list<std::string> & listPath,
			std::list<std::string>::const_iterator i,
			std::list<const ConfigTreeNode*> & listMatches);

	static void retrModSegments(
			const XorpModContextInfos & xmciMods,
			XorpModSegment & xmsRoot);

	static void retrMods(
			ModType mt,
			XorpModContextInfos & xmci,
			const TemplateTree & tt,
			const ConfigTree & ctSync,
			const ConfigTree & ctEdit,
			const ConfigTreeNode & ctnEdit);

	static void retrModsMissing(
			XorpModContextInfos & xmci,
			const TemplateTree & tt,
			const ConfigTree & ctSync,
			const ConfigTree & ctEdit,
			const ConfigTreeNode & ctnSync);

	static void retrNStatInfo(const ConfigTree & ctSync, const ConfigTreeNode & ctn, NStatInfo & nsi);

	static void retrPSegments(std::list<PSegment> & list, const ConfigTreeNode & ctn);

	static void retrSubInfo(const ConfigTree & ctSync, const ConfigTreeNode & ctn, SubInfo & si);
	static void retrVVI(const ConfigTreeNode & ctn, ValueValidityInfo & vvi); 

	static void setContextLocationToConfigTreeNode(
			ContextLocation & clContext,
			const ConfigTree & ctSync,
			const ConfigTreeNode & ctn);

	static void setErrorInfoUnableToAdd(int line, ErrorInfo & ei, const NodeAdditionError & nae);

	static ConfigTreeNode * findChildByIdConfig(const ConfigTreeNode & ctnParent, unsigned long idConfig);
	static ConfigTreeNode * findChildByName(ConfigTreeNode & ctnParent, const std::string & strName);
	static ConfigTreeNode * findChildByTemplateTreeNode(const ConfigTreeNode & ctnParent, const TemplateTreeNode & ttnChild);

	static InnerContextInfo getInnerContextInfo(const ConfigTree & ctSync, const ConfigTreeNode & ctnEdit);

//	static OpCommand * findOpCommandById(OpCommandList & ocl, unsigned long idOpCommand);
//	static OpCommand * findOpCommandByParts(OpCommandList & ocl, const std::list<std::string> & listCmdParts);
//	static OpCommand * findOpCommandByParts(OpCommandList & ocl, const std::vector<std::string> & vectorCmdParts);

	static ConfigTreeNode * copyConfigTreeNode(
				  	SlaveConfigTreeNode & sctnSource,
					const std::string & strNewName,
					const uint32_t xorp_idClient,
					const uid_t xorp_idUnixUser,
					NodeAdditionError & nae);

	static ContextLocation getContextLocation(const ConfigTree & ctSync, const ConfigTreeNode & ctnEdit);

	static OpVal getOpVal(const ConfigTreeNode & ctn);
	static OpVal getOpVal(const ConfigTreeNode * p_ctn);

	static SlaveConfigTreeNode * createSlaveConfigTreeNode(
				  	SlaveConfigTreeNode & sctnParent,
					const TemplateTreeNode & ttn,
					const std::string & strName,
					const uint32_t xorp_idClient,
					const uid_t xorp_idUnixUser,
					NodeAdditionError & nae);

	static SlaveConfigTreeNode * createPath(
					const ContextLocation & clContext,
					const TemplateTree & tt,
					SlaveConfigTree & sct,
					const uint32_t xorp_idClient,
					const uid_t xorp_idUnixUser,
					NodeAdditionError & nae);

	static TemplateTreeNode * findChildByIdTemplate(const TemplateTreeNode & ctnParent, unsigned long idTemplate);
	static TemplateTreeNode * findChildByName(const TemplateTreeNode & ttnParent, const std::string & strName);
	static TemplateTreeNode * findChildByType(const TemplateTreeNode & ttnParent, const std::string & strType);
	static TemplateTreeNode * findTemplateTreeNodeLast(const TemplateTree & tt, const ContextLocation & clContext);
	static TemplateTreeNode * walkContextSegments(TemplateTreeNode & ttnStart, const std::vector<ContextSegment> & vectorContextSegments);

	static const ConfigTreeNode * findConstConfigTreeNodeLast(const ConfigTree & ct, const ContextLocation & clContext);
	static const ConfigTreeNode * findConstChildByName(const ConfigTreeNode & ctnParent, const std::string & strName);
	static const ConfigTreeNode * findSyncNode(const ConfigTree & ctSync, const ConfigTreeNode & ctnEdit);
	static const ConfigTreeNode * walkContextPath(const ConfigTree & ctWalk, const std::vector<std::string> & vectorContextPath);
	static const ConfigTreeNode * walkContextPath(const ConfigTreeNode & ctnStart, const std::vector<std::string> & vectorContextPath);
	static const ConfigTreeNode * walkContextSegments(const ConfigTreeNode & ctnStart, const std::vector<ContextSegment> & vectorContextSegments);

	static const SlaveConfigTreeNode * findConstSlaveConfigTreeNodeChildByName(const SlaveConfigTreeNode & sctnParent, const std::string & strName);
	static const SlaveConfigTreeNode * findConstSlaveConfigTreeNodeLast(const SlaveConfigTree & sct, const ContextLocation & clContext);

	static const TemplateTreeNode * findNextInPath(const TemplateTreeNode & ttnStart, const TemplateTreeNode & ttnEnd);

	static std::map<std::string, std::string> determineMapAllowedValues(const TemplateTreeNode & ttnChild, const ConfigTreeNode * p_ctnChild, const ConfigTreeNode * p_ctnParent);

};

#endif

