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
 *  Module:       xgdaemon_xorp_util.cc
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Utility methods for doing a lot of things with XORP API.
 *
 */


#include <fstream>
#include <iostream>
#include <stdexcept>
#include "nyiexcept.hh"

#include "xgdaemon_module.hh"

#include "xgdaemon_xorp_util.hh"
#include "xgdaemon_module.hh"

#include "basic/xgdaemon_util.hh"
#include "libproto/config_node_id.hh"
#include "libxorp/xlog.h"
#include "rtrmgr/conf_tree_node.hh"


bool XGDaemonXorpUtil::compareIfALessThanB(ConfigTreeNode * p_ctnA, ConfigTreeNode * p_ctnB) {
	if (p_ctnA == NULL || p_ctnB == NULL) return false;
	return XGDaemonUtil::compareIfALessThanB(p_ctnA->segname(), p_ctnB->segname());
}
bool XGDaemonXorpUtil::copyChildren(
	const ConfigTreeNode & ctnSource,
	SlaveConfigTreeNode & sctnDestination,
	const uint32_t xorp_idClient,
	const uid_t xorp_idUnixUser,
	NodeAdditionError & nae) {

	const std::list<ConfigTreeNode*>&  listChildren = ctnSource.const_children();
	std::list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
	std::list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();

	while (i != iEnd) {
		ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			const TemplateTreeNode * p_ttnChild = p_ctnChild->template_tree_node();
			if (p_ttnChild == NULL) throw std::logic_error("Expected non-NULL TemplateTreeNode.");

			SlaveConfigTreeNode * p_sctn = createSlaveConfigTreeNode(sctnDestination, *p_ttnChild, p_ctnChild->segname(), xorp_idClient, xorp_idUnixUser, nae);			
			if (p_sctn == NULL) return false;

			if ((!p_ctnChild->is_tag()) && p_ctnChild->has_value()) {
				p_sctn->set_value_without_verification(p_ctnChild->value(), xorp_idUnixUser);

				std::string strErrorMsg;
				if (p_sctn->set_operator(p_ctnChild->get_operator(), xorp_idUnixUser, strErrorMsg) == false) {
					delete p_sctn;
					return false;
				}
			}

			if (p_ctnChild->const_children().size() > 0) {
				if (copyChildren(*p_ctnChild, *p_sctn, xorp_idClient, xorp_idUnixUser, nae) == false) {
					delete p_sctn;
					return false;
				}
			}
		}
		i++;
	}
	return true;
}
bool XGDaemonXorpUtil::determineIfConfTreeNodesEqual(const ConfigTreeNode & ctnA, const ConfigTreeNode & ctnB) {
	bool flagEqual = false;

	if ((ctnA.deleted() == ctnB.deleted()) && (ctnA.segname() == ctnB.segname())) {
		if (!(ctnA.has_value() ^ ctnB.has_value())) {
			if (ctnA.has_value()) {
				if (ctnA.value() == ctnB.value()) {
					flagEqual = true;
				}
			} else {
				flagEqual = true;
			}
		}
	}

	if (flagEqual == true) {
		const list<ConfigTreeNode*>& listChildrenA = ctnA.const_children();
		const list<ConfigTreeNode*>& listChildrenB = ctnB.const_children();

		if (listChildrenA.size() == listChildrenB.size()) {
			std::list<ConfigTreeNode*>::const_iterator iA = listChildrenA.begin();
			std::list<ConfigTreeNode*>::const_iterator iB = listChildrenB.begin();

			std::list<ConfigTreeNode*>::const_iterator iEndA = listChildrenA.end();

			while (iA != iEndA) {
				ConfigTreeNode * p_ctnChildA = *iA;
				ConfigTreeNode * p_ctnChildB = *iB;

				if (p_ctnChildA != NULL && p_ctnChildB != NULL) {
					if (determineIfConfTreeNodesEqual(*p_ctnChildA, *p_ctnChildB) == false) {
						flagEqual = false;
						break;
					}
				} else {
					if (p_ctnChildA != NULL) break;
					if (p_ctnChildB != NULL) break;
				}
				iA++;
				iB++;
			}
		} else {
			flagEqual = false;
		}
	}

	return flagEqual;
}
bool XGDaemonXorpUtil::determineIfConfTreesEqual(const ConfigTree & ctA, const ConfigTree & ctB) {
	return determineIfConfTreeNodesEqual(ctA.const_root_node(), ctB.const_root_node());
}
bool XGDaemonXorpUtil::determineIfAdded(const ConfigTree & ctSync, const ConfigTreeNode & ctnEdit) {
	if (ctnEdit.deleted()) return false;
	const ConfigTreeNode * p_ctnSync = findSyncNode(ctSync, ctnEdit);
	return (p_ctnSync == NULL || p_ctnSync->deleted());
}
bool XGDaemonXorpUtil::determineIfChanged(const ConfigTree & ctSync, const ConfigTreeNode & ctnEdit) {
	if (ctnEdit.is_root_node() || ctnEdit.deleted()) return false;

	const ConfigTreeNode * p_ctnSync = findSyncNode(ctSync, ctnEdit);
	if (p_ctnSync == NULL || p_ctnSync->deleted()) return false;

	const TemplateTreeNode * p_ttnSync = p_ctnSync->template_tree_node();
	const TemplateTreeNode * p_ttnEdit = ctnEdit.template_tree_node();
	if (p_ttnSync == NULL || p_ttnEdit == NULL) throw std::logic_error("Expected to get TemplateTreeNodes");
	if (p_ttnSync != p_ttnEdit) throw std::logic_error("Expected the same TemplateTreeNode.");
	if (p_ttnSync->is_tag()) return false;

	return (p_ctnSync->value() != ctnEdit.value());
}
bool XGDaemonXorpUtil::determineIfChildrenMulti(const ConfigTreeNode & ctn) {
	const std::list<ConfigTreeNode*>& listChildren = ctn.const_children();
	if (listChildren.size() > 0) {
		std::list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
		const std::list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			ConfigTreeNode * p_ctnChild = *i;
			if (p_ctnChild != NULL) return isMultiNode(*p_ctnChild);
			i++;
		}
	}
	return false;
}
bool XGDaemonXorpUtil::determineIfDeleted(const ConfigTreeNode & ctn) {
	return ctn.deleted();
}
bool XGDaemonXorpUtil::determineIfHasAddedChildren(const ConfigTree & ctSync, const ConfigTreeNode & ctn) {

	const list<ConfigTreeNode*> listCC = ctn.const_children();

	list<ConfigTreeNode*>::const_iterator i = listCC.begin();
	const list<ConfigTreeNode*>::const_iterator iEnd = listCC.end();
	while (i != iEnd) {
		ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			if (determineIfAdded(ctSync, *p_ctnChild)) return true;
			if (determineIfHasAddedChildren(ctSync, *p_ctnChild)) return true;			
		}
		i++;
	}

	return false;
}
bool XGDaemonXorpUtil::determineIfHasChangedChildren(const ConfigTree & ctSync, const ConfigTreeNode & ctn) {

	const list<ConfigTreeNode*> listCC = ctn.const_children();

	list<ConfigTreeNode*>::const_iterator i = listCC.begin();
	const list<ConfigTreeNode*>::const_iterator iEnd = listCC.end();
	while (i != iEnd) {
		ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			if (determineIfChanged(ctSync, *p_ctnChild)) return true;
			if (determineIfHasChangedChildren(ctSync, *p_ctnChild)) return true;			
		}
		i++;
	}

	return false;
}
bool XGDaemonXorpUtil::determineIfHasDeletedChildren(const ConfigTreeNode & ctn) {

	const list<ConfigTreeNode*> listCC = ctn.const_children();

	list<ConfigTreeNode*>::const_iterator i = listCC.begin();
	const list<ConfigTreeNode*>::const_iterator iEnd = listCC.end();
	while (i != iEnd) {
		ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			if (determineIfDeleted(*p_ctnChild)) return true;
			if (determineIfHasDeletedChildren(*p_ctnChild)) return true;			
		}
		i++;
	}

	return false;
}
bool XGDaemonXorpUtil::determineIfHasInvalidChildren(const ConfigTreeNode & ctn) {
	std::string strDummy;

	const list<ConfigTreeNode*> listCC = ctn.const_children();

	list<ConfigTreeNode*>::const_iterator i = listCC.begin();
	const list<ConfigTreeNode*>::const_iterator iEnd = listCC.end();
	while (i != iEnd) {
		ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			if (!determineIfValueValid(*p_ctnChild, strDummy)) return true;
			if (determineIfHasInvalidChildren(*p_ctnChild)) return true;			
		}
		i++;
	}

	return false;
}
bool XGDaemonXorpUtil::determineIfHasMissingRequiredChildren(const ConfigTreeNode & ctn) {
	const list<ConfigTreeNode*> listCC = ctn.const_children();

	list<ConfigTreeNode*>::const_iterator i = listCC.begin();
	const list<ConfigTreeNode*>::const_iterator iEnd = listCC.end();
	while (i != iEnd) {
		ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			if (determineIfMissingRequired(*p_ctnChild)) return true;
			if (determineIfHasMissingRequiredChildren(*p_ctnChild)) return true;			
		}
		i++;
	}

	return false;
}
bool XGDaemonXorpUtil::determineIfHasMultiChildren(const TemplateTreeNode & ttn) {
	const std::list<TemplateTreeNode*>& listChildren = ttn.children();
	if (listChildren.size() == 0) return false;
	std::list<TemplateTreeNode*>::const_iterator i = listChildren.begin();
	const std::list<TemplateTreeNode*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		TemplateTreeNode * p_ttnChild = *i;
		if (p_ttnChild != NULL) {
			return (isMultiNode(*p_ttnChild));
		}
		i++;
	}
	return false;
}
bool XGDaemonXorpUtil::determineIfInvalid(const ConfigTreeNode & ctn) {
	std::string strDummy;
	return ((!determineIfDeleted(ctn)) && (!determineIfValueValid(ctn, strDummy) || determineIfMissingRequired(ctn)));
}
bool XGDaemonXorpUtil::determineIfMissingRequired(const ConfigTreeNode & ctn) {
	if (ctn.is_root_node() || determineIfDeleted(ctn)) return false;

	const TemplateTreeNode * p_ttn = ctn.template_tree_node();
	if (p_ttn == NULL) throw std::logic_error("Unable to obtain TemplateTreeNode.");

	const std::list<TemplateTreeNode*> & listChildren = p_ttn->children();
	std::list<TemplateTreeNode*>::const_iterator i = listChildren.begin();
	const std::list<TemplateTreeNode*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		const TemplateTreeNode * p_ttnChild = *i;
		if (p_ttnChild != NULL && isRequired(*p_ttnChild)) {
			const ConfigTreeNode * p_ctnFound = findConstChildByName(ctn, p_ttnChild->segname());
			if (p_ctnFound == NULL || p_ctnFound->deleted() || (p_ctnFound->is_leaf_value() && (!p_ctnFound->has_value()))) return true;
		}
		i++;
	}

	return false;
}
bool XGDaemonXorpUtil::determineIfValueValid(const ConfigTreeNode & ctn, std::string & strInvalidValueDesc) {
	if (ctn.is_root_node()) return true;

	bool flagMultiNode = XGDaemonXorpUtil::isMultiNode(ctn);
	if (!flagMultiNode && !ctn.has_value()) return true;

	const TemplateTreeNode * p_ttn = ctn.template_tree_node();
	if (p_ttn == NULL) throw std::logic_error("Expected non-NULL pointer.");

	std::string strCheck = flagMultiNode ? ctn.segname() : ctn.value();

	bool flagValid = p_ttn->type_match(strCheck, strInvalidValueDesc);
	if (flagValid) flagValid = p_ttn->check_allowed_value(strCheck, strInvalidValueDesc);
	if (flagValid) flagValid = p_ttn->verify_variables(ctn, strInvalidValueDesc);

	return flagValid;
}
bool XGDaemonXorpUtil::isAssignOpOnly(const ConfigTreeNode & ctnNode) {
	const TemplateTreeNode * p_ttn = ctnNode.template_tree_node();
	if (p_ttn == NULL) {
		return false;
	} else {
		return isAssignOpOnly(*p_ttn);
	}
}
bool XGDaemonXorpUtil::isAssignOpOnly(const TemplateTreeNode & ttnNode) {
	list<ConfigOperator> listOps = ttnNode.allowed_operators();
	if (listOps.size() == 0) return true;
	if (listOps.size() == 1) {
		list<ConfigOperator>::const_iterator i = listOps.begin();
		const ConfigOperator & co = *i;
		if (co == OP_ASSIGN) return true;
	}
	return false;
}
bool XGDaemonXorpUtil::isContextSwitch(const ConfigTreeNode & ctnNode) {
	const TemplateTreeNode * p_ttn = ctnNode.template_tree_node();
	if (p_ttn == NULL) {
		return false;
	} else {
		return isContextSwitch(*p_ttn);
	}
}
bool XGDaemonXorpUtil::isContextSwitch(const TemplateTreeNode & ttnNode) {
	return !ttnNode.is_leaf_value();
}
bool XGDaemonXorpUtil::isMandatory(const TemplateTreeNode & ttnNode) {
	return ttnNode.is_mandatory();
}
bool XGDaemonXorpUtil::isMultiNode(const ConfigTreeNode & ctnNode) {
	if (ctnNode.is_root_node()) {
		return false;
	} else {
		const TemplateTreeNode * p_ttn = ctnNode.template_tree_node();
		if (p_ttn == NULL) throw std::logic_error("Each ConfigTreeNode except root is suppost to have a good pointer to the corresponding TemplateTreeNode.");
		return isMultiNode(*p_ttn);
	}
}
bool XGDaemonXorpUtil::isMultiNode(const TemplateTreeNode & ttnNode) {
	const std::string & strSegname = ttnNode.segname();
	return (strSegname == "@");
}
bool XGDaemonXorpUtil::isRequired(const ConfigTreeNode & ctnNode) {
	if (ctnNode.is_root_node()) return false;

	const TemplateTreeNode * p_ttn = ctnNode.template_tree_node();
	if (p_ttn == NULL) throw new std::logic_error("Expected a TemplateTreeNode");
	return isRequired(*p_ttn);
}
bool XGDaemonXorpUtil::isRequired(const TemplateTreeNode & ttnNode) {
	return (ttnNode.is_mandatory() && !ttnNode.has_default());
}
bool XGDaemonXorpUtil::isUserHidden(const TemplateTreeNode & ttnNode) {
	return ttnNode.is_user_hidden();
}
bool XGDaemonXorpUtil::isXorpVariableExpression(const std::string & strExpression) {
	return (strExpression.length() > 3 && (strExpression[0] == '$') && (strExpression[1] == '(') && (strExpression[strExpression.length() - 1] == ')'));
}
bool XGDaemonXorpUtil::loadTemplateTree(TemplateTree & tt, const std::string& strXorpTemplateDir, std::string & strErrmsg) {
	// Read the router config template files
	
	std::cout << "LOADING TEMPLATE TREE FROM: " << strXorpTemplateDir << std::endl;
	if (!tt.load_template_tree(strXorpTemplateDir, strErrmsg)) {
		std::cout << "PROBLEM LOADING TEMPLATE TREE.  " << strErrmsg << std::endl;
		return false;
	} else {
		std::cout << "TEMPLATE TREE LOADED SUCCESSFULLY." << std::endl;
		return true;
	}
}

bool XGDaemonXorpUtil::setContextLocationToPath(
			ContextLocation & clContext,
			const std::string & strContextPathEscaped,
			const TemplateTree & tt,
			const ConfigTree & ctSync,
			const ConfigTree & ctEdit,
			const TemplateTreeNode * & p_ttnContext,
			ConfigTreeNode * & p_ctnContext,
			bool flagFollowExistantPathOnly) {
	std::list<PSegment> listPathSegments;
	ContextLocation::separateContextPathIntoPathSegments(strContextPathEscaped, listPathSegments);
	return setContextLocationToPathSegments(
		clContext,
		listPathSegments,
		tt,
		ctSync,
		ctEdit,
		p_ttnContext,
		p_ctnContext,
		flagFollowExistantPathOnly);
}
bool XGDaemonXorpUtil::setContextLocationToPathSegments(
		ContextLocation & clContext,
		const std::list<PSegment> & listPathSegments,
		const TemplateTree & tt,
		const ConfigTree & ctSync,
		const ConfigTree & ctEdit,
		const TemplateTreeNode * & p_ttnContext,
		ConfigTreeNode * & p_ctnContext,
		bool flagFollowExistantPathOnly)
	{

	clContext.clear();

	p_ctnContext = NULL;
	p_ttnContext = NULL;

	const ConfigTreeNode * p_ctnCurrentConfig = & ctEdit.const_root_node();
	const TemplateTreeNode * p_ttnCurrentTemplate = tt.root_node(); 

	std::list<PSegment>::const_iterator i = listPathSegments.begin();
	std::list<PSegment>::const_iterator iEnd = listPathSegments.end();

	while (true) {

		p_ttnContext = const_cast<TemplateTreeNode*>(p_ttnCurrentTemplate);
		p_ctnContext = const_cast<ConfigTreeNode*>(p_ctnCurrentConfig);

		if (i == iEnd) break;

		const PSegment & ps = *i;
		const std::string & strName = ps.getName();

		const ConfigTreeNode * p_ctnChild = NULL;
		if (p_ctnCurrentConfig != NULL) p_ctnChild = findConstChildByName(*p_ctnCurrentConfig, strName);

		if (p_ctnChild == NULL) {
			if (flagFollowExistantPathOnly == true) break;

			p_ctnCurrentConfig = NULL;

			if (p_ttnCurrentTemplate == NULL) {
				return false;
			} else {
				TemplateTreeNode * p_ttnChild = NULL;
				if (determineIfHasMultiChildren(*p_ttnCurrentTemplate)) {
					if (ps.isTypeKnown() == false) return false;
					p_ttnChild = findChildByType(*p_ttnCurrentTemplate, ps.getType());
				} else {
					p_ttnChild = findChildByName(*p_ttnCurrentTemplate, strName);
				}
				if (p_ttnChild == NULL) return false;
				p_ttnCurrentTemplate = p_ttnChild;
			}
		} else {
			p_ctnCurrentConfig = p_ctnChild;
			p_ttnCurrentTemplate = p_ctnCurrentConfig->template_tree_node();
		}

		NStatInfo nsi;
		if (p_ctnCurrentConfig != NULL) retrNStatInfo(ctSync, *p_ctnCurrentConfig, nsi);

		SubInfo si;
		if (p_ctnCurrentConfig != NULL) retrSubInfo(ctSync, *p_ctnCurrentConfig, si);
		ContextSegment cs(getIdTemplate(p_ttnCurrentTemplate), getIdConfig(p_ctnCurrentConfig), strName, isMultiNode(*p_ttnCurrentTemplate), nsi, si);

		if (p_ctnCurrentConfig == NULL || nsi.getFlagDeleted()) {
			clContext.addContextSegmentNonExistant(cs);
		} else {
			clContext.addContextSegmentExistant(cs);
		}

		i++;
	}

	return true;
}
bool XGDaemonXorpUtil::setOpVal(ConfigTreeNode & ctn, const OpVal & ov, const uid_t uid) {
	ctn.set_value_without_verification(ov.getConstValue(), uid);

	ConfigOperator co = OP_NONE;
	if (isAssignOpOnly(ctn)) co = OP_ASSIGN;

	const std::string & strOperator = ov.getConstOperator();
	if (strOperator.length() > 0) {
		try {
			co = lookup_operator(strOperator);
		} catch (ParseError e) {
			return false;
		}
	}
	ctn.set_operator_without_verification(co, uid);
	return true;
}
bool XGDaemonXorpUtil::setValue(ConfigTreeNode & ctn, const std::string & strValue, const uid_t uid, std::string & strErrorMsg) {
	ctn.set_value_without_verification(strValue, uid);
	return ctn.set_operator(OP_ASSIGN, uid, strErrorMsg);
}
bool XGDaemonXorpUtil::wait_for_xrlrouter_ready(EventLoop& eventloop, XrlRouter& xrl_router) {
//	EventLoop * p_ev = &eventloop;   p_ev = p_ev;
//	XrlRouter * p_xr = &xrl_router;  p_xr = p_xr;

	XorpTimer announcer = eventloop.new_oneoff_after_ms(3 * 1000, callback(&announce_waiting));
	while (xrl_router.ready() == false) {
		eventloop.run();
		std::cout << ',';
		if (xrl_router.failed()) {

NYIEXCEPT;
//			XLOG_ERROR("XrlRouter failed.  No Finder?");
//			return false;
//			break;
		}
	}
	return true;
}

gid_t XGDaemonXorpUtil::getGidXorp() {
	struct group* grp = getgrnam("xorp");
	if (grp != NULL) return grp->gr_gid; else return 0;
}

unsigned long XGDaemonXorpUtil::getIdConfig(const ConfigTreeNode * p_ctn) {
	if (p_ctn == NULL) {
		return 0;
	} else {
		return (unsigned long)((const void*)p_ctn);
	}
}
unsigned long XGDaemonXorpUtil::getIdTemplate(const TemplateTreeNode * p_ttn) {
	if (p_ttn == NULL) {
		return 0;
	} else {
		return (unsigned long)((const void*)p_ttn);
	}
}
unsigned long XGDaemonXorpUtil::getTotalChildrenCS(const ConfigTreeNode & ctn) {
	unsigned long totalChildrenCS = 0;

	const std::list<ConfigTreeNode*> & listChildren = ctn.const_children();
	std::list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
	std::list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		const ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL && isContextSwitch(*p_ctnChild)) totalChildrenCS++;
		i++;
	}
	return totalChildrenCS;
}
unsigned long XGDaemonXorpUtil::getTotalChildrenCS(const TemplateTreeNode & ttn) {
	unsigned long totalChildrenCS = 0;

	const std::list<TemplateTreeNode*> & listChildren = ttn.children();
	std::list<TemplateTreeNode*>::const_iterator i = listChildren.begin();
	std::list<TemplateTreeNode*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		const TemplateTreeNode * p_ttnChild = *i;
		if (p_ttnChild != NULL && isContextSwitch(*p_ttnChild)) totalChildrenCS++;
		i++;
	}
	return totalChildrenCS;
}

void XGDaemonXorpUtil::announce_waiting() {
    std::cout << "Waiting for xorp_rtrmgr..." << std::endl;
}
void XGDaemonXorpUtil::determineNodesWithInvalidValues(
		const ConfigTree & ctSync,
		const ConfigTreeNode & ctnCheck,
		std::list<GeneralContextInfo> & listNodes)
	{
	if (determineIfInvalid(ctnCheck)) {
		GeneralContextInfo gciAdd(getContextLocation(ctSync, ctnCheck), getInnerContextInfo(ctSync, ctnCheck));   
		listNodes.push_back(gciAdd);
	}

	const std::list<ConfigTreeNode*>& listChildren = ctnCheck.const_children();
	std::list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
	const std::list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		const ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			determineNodesWithInvalidValues(ctSync, *p_ctnChild, listNodes);
		}
		i++;
	}
}
void XGDaemonXorpUtil::determineNodesWithInvalidValues(
		const ConfigTree & ctSync,
		const ConfigTree & ctCheck,
		std::list<GeneralContextInfo> & listNodes)
	{
	const ConfigTreeNode & ctnRoot = ctCheck.const_root_node();
	determineNodesWithInvalidValues(ctSync, ctnRoot, listNodes);
}
void XGDaemonXorpUtil::fillListWithDataTypes(const TemplateTree & tt, std::list<std::string> & listDataTypes) {
	const TemplateTreeNode * p_ttnRoot = tt.root_node();
	if (p_ttnRoot != NULL) fillListWithDataTypes(*p_ttnRoot, listDataTypes);
}
void XGDaemonXorpUtil::fillListWithDataTypes(const TemplateTreeNode & ttn, std::list<std::string> & listDataTypes) {
	{
		const std::string & strDataType = ttn.typestr();
		bool flagAlreadyListed = false;
		std::list<std::string>::const_iterator i = listDataTypes.begin();
		const std::list<std::string>::const_iterator iEnd = listDataTypes.end();
		while (i != iEnd) {
			if (strDataType == *i) {
				flagAlreadyListed = true;
				break;
			}
			i++;	
		}
		if (flagAlreadyListed == false) listDataTypes.push_back(strDataType);
	}
	{
		const list<TemplateTreeNode*>& listChildren = ttn.children();
		list<TemplateTreeNode*>::const_iterator i = listChildren.begin();
		const list<TemplateTreeNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			TemplateTreeNode * p_ttnChild = *i;
			if (p_ttnChild != NULL) fillListWithDataTypes(*p_ttnChild, listDataTypes);
			i++;
		}
	}
}
void XGDaemonXorpUtil::printChildren(const ConfigTreeNode& ctnNode) {
	const list<ConfigTreeNode*> & listChildren = ctnNode.const_children();

	list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
	list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();

	if (i == iEnd) {
		std::cout << "No children." << std::endl;
	} else {
		std::cout << "Children:";
		while (i != iEnd) {
			ConfigTreeNode * p_ctnChild = *i;

			if (p_ctnChild != NULL) {
				std::cout << " " << p_ctnChild->segname();
			}

			i++;
		}
		std::cout << std::endl;
	}
}

void XGDaemonXorpUtil::printOpCommandList(OpCommandList & ocl) {

	const std::list<OpCommand*> & listOpCommand = ocl.op_commands();
	std::list<OpCommand*>::const_iterator i = listOpCommand.begin();
	std::list<OpCommand*>::const_iterator iEnd = listOpCommand.end();

	while (i != iEnd) {
		OpCommand * p_oc = *i;

		if (p_oc != NULL) {
			std::cout	<< "OP COMMAND NAME         " << p_oc->command_name() << std::endl
					<< "OP COMMAND HELP STRING  " << p_oc->help_string() << std::endl
					<< "OP COMMAND MODULE       " << p_oc->module() << std::endl
					<< "OP COMMAND ACTION       " << p_oc->command_action() << std::endl 
					<< std::endl << std::endl;
		}
		i++;
	}
}
void XGDaemonXorpUtil::pruneEditTree(const ConfigTree & ctSync, ConfigTree & ctEdit) {
	const ConfigTreeNode & ctnSyncRoot = ctSync.const_root_node();
	ConfigTreeNode & ctnEditRoot = ctEdit.root_node();
	pruneEditTreeNode(ctnSyncRoot, ctnEditRoot);
}
void XGDaemonXorpUtil::pruneEditTreeNode(const ConfigTreeNode & ctnSync, ConfigTreeNode & ctnEdit) {
	std::list<ConfigTreeNode*> & listChildren = ctnEdit.children();
	std::list<ConfigTreeNode*>::iterator i = listChildren.begin();
	const std::list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
	while (i != iEnd) {
		std::list<ConfigTreeNode*>::iterator iSaved = i;
		const ConfigTreeNode * p_ctnSyncChild = NULL;

		ConfigTreeNode * p_ctnEditChild = *i;
		if (p_ctnEditChild != NULL) {
			p_ctnSyncChild = findConstChildByName(ctnSync, p_ctnEditChild->segname());
		}
		i++;

		if (p_ctnSyncChild == NULL) {
			listChildren.erase(iSaved);
		} else {
			pruneEditTreeNode(*p_ctnSyncChild, *p_ctnEditChild);
		}
	}
}
void XGDaemonXorpUtil::printConfigTree(const ConfigTree & ct) { 
	XGDaemonXorpUtil::printConfigTreeNode(0, ct.const_root_node());
}
void XGDaemonXorpUtil::printConfigTreeNode(int indent, const ConfigTreeNode & ctn) {
	 const list<ConfigTreeNode*> & listChildren = ctn.const_children();
	 list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
	 list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
	 while (i != iEnd) {
		 ConfigTreeNode * p_ctn = *i;
		 if (p_ctn != NULL) {
			 for (int j = 0; j < indent; j++) std::cout << "    ";
			 std::cout << p_ctn->segname();
			 if (p_ctn->has_value()) {
				 std::cout << "    " << p_ctn->value();
			 }
			 std::cout << std::endl;
			 XGDaemonXorpUtil::printConfigTreeNode(indent + 1, *p_ctn);
		 }
		 i++;
	 }
}

void XGDaemonXorpUtil::readChildren(
			ParentContextInfo & pciContext,
			const ConfigTree & ctSync,
			const TemplateTreeNode & ttnContext,
			const ConfigTreeNode * p_ctnContext)
	{
	const std::list<TemplateTreeNode*> & listTemplateChildren = ttnContext.children();
	std::list<TemplateTreeNode*>::const_iterator iChild = listTemplateChildren.begin();
	std::list<TemplateTreeNode*>::const_iterator iEnd = listTemplateChildren.end();
	while (iChild != iEnd) {
		const TemplateTreeNode * p_ttnChild = *iChild;
		if (p_ttnChild != NULL) {
			unsigned long idTemplate = getIdTemplate(p_ttnChild);
			const std::string & strName = p_ttnChild->segname();

			bool flagContextSwitch = !p_ttnChild->is_leaf_value();
			bool flagMultiNode = XGDaemonXorpUtil::isMultiNode(*p_ttnChild);
			bool flagHideValue = (flagContextSwitch == true || flagMultiNode == true);

			std::list<std::string> listAllowedOperators;
			retrListAllowedOperators(listAllowedOperators, *p_ttnChild);

			if (flagMultiNode == false) {
				const ConfigTreeNode * p_ctnChild = (p_ctnContext == NULL ? NULL : XGDaemonXorpUtil::findConstChildByName(*p_ctnContext, strName));

				NStatInfo nsi;
				if (p_ctnChild != NULL) retrNStatInfo(ctSync, *p_ctnChild, nsi);

				SubInfo si;
				if (p_ctnChild != NULL) retrSubInfo(ctSync, *p_ctnChild, si);

				std::string strValue;
				if (flagHideValue == false) {
					if (p_ctnChild == NULL) {
						strValue = p_ttnChild->default_str();
					} else {
						strValue = p_ctnChild->value();
					}
				}

				ValueValidityInfo vvi;
				if (p_ctnChild != NULL) XGDaemonXorpUtil::retrVVI(*p_ctnChild, vvi);

				bool flagHasValue = p_ctnChild == NULL ? false : p_ctnChild->has_value();

				pciContext.addChild(
				             ContextSegment(
				               idTemplate,
				               getIdConfig(p_ctnChild),
				               strName,
				               false,
					       nsi,
					       si),
				             InnerContextInfo(
				               flagContextSwitch,
				               p_ttnChild->is_deprecated(),
					       isMandatory(*p_ttnChild),
					       isRequired(*p_ttnChild),
					       isUserHidden(*p_ttnChild),
				               p_ctnChild == NULL ? 0 : p_ctnChild->const_children().size(),
					       p_ctnChild == NULL ? 0 : getTotalChildrenCS(*p_ctnChild),
				               p_ttnChild->children().size(),
					       getTotalChildrenCS(*p_ttnChild),
				               p_ttnChild->typestr(),
				               p_ttnChild->deprecated_reason(),
				               p_ttnChild->help_long(),
					       ContextValueInfo(
					         flagHideValue,
						 flagHasValue,
						 getOpVal(p_ctnChild),
						 p_ttnChild->has_default(),
						 p_ttnChild->default_str(),
						 listAllowedOperators,
						 p_ttnChild->allowed_ranges(),
						 determineMapAllowedValues(*p_ttnChild, p_ctnChild, p_ctnContext),
						 vvi),
					       nsi,
					       si));
			} else {
				if (p_ctnContext != NULL) {
					const list<ConfigTreeNode*>& listChildren = p_ctnContext->const_children();
					list<ConfigTreeNode*>::const_iterator iMulti = listChildren.begin();
					const list<ConfigTreeNode*>::const_iterator iMultiEnd = listChildren.end();

					while (iMulti != iMultiEnd) {
						const ConfigTreeNode * p_ctnMultiChild = *iMulti;
						if (p_ctnMultiChild != NULL) {
							const TemplateTreeNode * p_ttnHere = p_ctnMultiChild->template_tree_node();
							if (p_ttnHere == p_ttnChild) {
								const std::string & strNameMultiChild = p_ctnMultiChild->segname();

								ValueValidityInfo vvi;
								XGDaemonXorpUtil::retrVVI(*p_ctnMultiChild, vvi);

								NStatInfo nsi;
								retrNStatInfo(ctSync, *p_ctnMultiChild, nsi);

								SubInfo si;
								retrSubInfo(ctSync, *p_ctnMultiChild, si);

								pciContext.addChild(
								             ContextSegment(
									       idTemplate,
									       getIdConfig(p_ctnMultiChild),
									       strNameMultiChild,
									       true,
									       nsi,
									       si),
									     InnerContextInfo(
									       true,
									       p_ttnChild->is_deprecated(),
									       isMandatory(*p_ttnChild),
									       isRequired(*p_ttnChild),
									       isUserHidden(*p_ttnChild),
									       p_ctnMultiChild->const_children().size(),
									       getTotalChildrenCS(*p_ctnMultiChild),
									       p_ttnChild->children().size(),
									       getTotalChildrenCS(*p_ttnChild),
									       p_ttnChild->typestr(),
									       p_ttnChild->deprecated_reason(),
									       p_ttnChild->help_long(),
									       ContextValueInfo(
									         true,
										 false,
										 OpVal(),
										 p_ttnChild->has_default(),
										 p_ttnChild->default_str(),
										 listAllowedOperators,
										 p_ttnChild->allowed_ranges(),
										 determineMapAllowedValues(*p_ttnChild, p_ctnMultiChild, p_ctnContext),
										 vvi),
									       nsi,
									       si));
							}
						}
						iMulti++;
					}
				}
				pciContext.addChild(
				             ContextSegment(
					       idTemplate,
					       CONFIG_ID_NONE,
					       "",
					       true,
					       NStatInfo(),
					       SubInfo()),
					     InnerContextInfo(
					       true,
					       p_ttnChild->is_deprecated(),
					       isMandatory(*p_ttnChild),
					       isRequired(*p_ttnChild),
					       isUserHidden(*p_ttnChild),
					       0,
					       0,
					       p_ttnChild->children().size(),
					       getTotalChildrenCS(*p_ttnChild),
					       p_ttnChild->typestr(),
					       p_ttnChild->deprecated_reason(),
					       p_ttnChild->help_long(),
					       ContextValueInfo(
				                 true,
						 false,
						 OpVal(),
						 p_ttnChild->has_default(),
						 p_ttnChild->default_str(),
						 listAllowedOperators,
						 p_ttnChild->allowed_ranges(),
						 determineMapAllowedValues(*p_ttnChild, NULL, p_ctnContext),
						 ValueValidityInfo()),
					       NStatInfo(),
					       SubInfo()));
			}
		}
		iChild++;
	}
	pciContext.doSortChildren();
}
bool XGDaemonXorpUtil::repeatContextLocation(
	const ContextLocation & clContextToRepeat,
	const TemplateTree & tt,
	ConfigTree & ctSync,
	ConfigTree & ctEdit,
	ContextLocation & clContext,
	const TemplateTreeNode * & p_ttn,
	ConfigTreeNode * & p_ctn) {

	clContext.clear();

	p_ttn = tt.root_node();
	if (p_ttn == NULL) throw std::logic_error("Expected non-NULL pointer.");

	p_ctn = &ctEdit.root_node();

	unsigned int totalSegments = clContextToRepeat.getLength();
	for (unsigned int i = 0; i < totalSegments; i++) {
		const ContextSegment & cs = clContextToRepeat.getContextSegment(i);

		unsigned long idTemplate = cs.getIdTemplate();
		TemplateTreeNode * p_ttnChild = NULL;
		if (idTemplate != TEMPLATE_ID_NONE && idTemplate != TEMPLATE_ID_UNKNOWN) {
			p_ttnChild = findChildByIdTemplate(*p_ttn, idTemplate);
		}
		if (p_ttnChild == NULL) return false;


		const std::string & strName = cs.getName();

		ConfigTreeNode * p_ctnChild = NULL;
		if (p_ctn != NULL) p_ctnChild = findChildByName(*p_ctn, strName);


		NStatInfo nsi;
		if (p_ctnChild != NULL) retrNStatInfo(ctSync, *p_ctnChild, nsi);

		SubInfo si;
		if (p_ctnChild != NULL) retrSubInfo(ctSync, *p_ctnChild, si);

		ContextSegment csNew(idTemplate, getIdConfig(p_ctnChild), strName, isMultiNode(*p_ttnChild), nsi, si);

		if (p_ctnChild == NULL) {
			clContext.addContextSegmentNonExistant(csNew);
		} else {
			clContext.addContextSegmentExistant(csNew);
		}

		p_ctn = p_ctnChild;
		p_ttn = p_ttnChild;
	}

	return true;
}
void XGDaemonXorpUtil::retrInvalid(
	XorpBasicContextInfos & xbciInvalid,
	const ConfigTreeNode & ctnEdit)
	{
	const list<ConfigTreeNode*>& listChildren = ctnEdit.const_children();
	{
		std::list<XorpBasicContextInfo*> listToAdd;
		list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
		const list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			ConfigTreeNode * p_ctnChild = *i;
			if (p_ctnChild != NULL) {
				if (determineIfInvalid(*p_ctnChild)) {
					listToAdd.push_back(new XorpBasicContextInfo(*p_ctnChild));
				}
			}
			i++;
		}

		listToAdd.sort(XorpBasicContextInfo::compareIfALessThanB);

		std::list<XorpBasicContextInfo*>::const_iterator j = listToAdd.begin();
		std::list<XorpBasicContextInfo*>::const_iterator jEnd = listToAdd.end();
		while (j != jEnd) {
			xbciInvalid.add(*j);
			j++;
		}
	}
	{
		list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
		const list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			ConfigTreeNode * p_ctnChild = *i;
			if (p_ctnChild != NULL) {
				retrInvalid(xbciInvalid, *p_ctnChild);
			}
			i++;
		}
	}
}
void XGDaemonXorpUtil::retrListAllowedOperators(std::list<std::string> & listAllowedOperators, const TemplateTreeNode & ttn) {
	std::list<ConfigOperator> listCO = ttn.allowed_operators();
	std::list<ConfigOperator>::const_iterator i = listCO.begin();
	std::list<ConfigOperator>::const_iterator iEnd = listCO.end();
	while (i != iEnd) {
		const ConfigOperator & co = *i;
		std::string strAllowedOperator = operator_to_str(co);
		listAllowedOperators.push_back(strAllowedOperator);
		i++;
	}
}
void XGDaemonXorpUtil::retrListMatches(
		const ConfigTree & ctSync,
		const std::string & strExpressionBody,
		std::list<const ConfigTreeNode*> & listMatches)
	{

	std::list<std::string> listPath;
	XGDaemonUtil::split_string(strExpressionBody, '.', listPath, true);
	std::list<std::string>::const_iterator i = listPath.begin();
	if (i != listPath.end()) retrListMatchesN(ctSync.const_root_node(), listPath, i, listMatches);
}
void XGDaemonXorpUtil::retrListMatchesN(
		const ConfigTreeNode & ctnSync,
		const std::list<std::string> & listPath,
		std::list<std::string>::const_iterator i,
		std::list<const ConfigTreeNode*> & listMatches)
	{

	std::list<const ConfigTreeNode*> listMatchesHere;

	const std::string & strSegmentHere = *i;
	if (strSegmentHere == "*") {
		const list<ConfigTreeNode*>& listChildren = ctnSync.const_children();
		list<ConfigTreeNode*>::const_iterator j = listChildren.begin();
		const list<ConfigTreeNode*>::const_iterator jEnd = listChildren.end();
		while (j != jEnd) {
			const ConfigTreeNode * p_ctnChild = *j;
			if (p_ctnChild != NULL) listMatchesHere.push_back(p_ctnChild);
			j++;
		}
	} else {
		const ConfigTreeNode * p_ctnMatch = findConstChildByName(ctnSync, strSegmentHere);
		if (p_ctnMatch != NULL) listMatchesHere.push_back(p_ctnMatch);
	}

	i++;

	if (i == listPath.end()) {
		list<const ConfigTreeNode*>::const_iterator j = listMatchesHere.begin();
		const list<const ConfigTreeNode*>::const_iterator jEnd = listMatchesHere.end();
		while (j != jEnd) {
			const ConfigTreeNode * p_ctnMatched = *j;
			if (p_ctnMatched != NULL) {
				listMatches.push_back(p_ctnMatched);
			}
			j++;
		}
	} else {
		list<const ConfigTreeNode*>::const_iterator j = listMatchesHere.begin();
		const list<const ConfigTreeNode*>::const_iterator jEnd = listMatchesHere.end();
		while (j != jEnd) {
			const ConfigTreeNode * p_ctnMatched = *j;
			if (p_ctnMatched != NULL) {
				retrListMatchesN(*p_ctnMatched, listPath, i, listMatches);
			}
			j++;
		}
	}
}
void XGDaemonXorpUtil::retrModSegments(
	const XorpModContextInfos & xmciMods,
	XorpModSegment & xmsRoot)
	{
	for (int i = 0; i < xmciMods.getTotal(); i++) {
		const XorpModContextInfo & xmci = xmciMods.get(i);
		const ContextLocation & cl = xmci.getConstContextLocation();
		XorpModSegment * p_xms = xmsRoot.createPath(cl, xmci.getModType());
		const ConfigTreeNode * p_ctn = xmci.getNode();
		if (p_ctn != NULL && p_ctn->has_value()) p_xms->setValue(p_ctn->value());
	}
}
void XGDaemonXorpUtil::retrMods(
	ModType mt,
	XorpModContextInfos & xmci,
	const TemplateTree & tt,
	const ConfigTree & ctSync,
	const ConfigTree & ctEdit,
	const ConfigTreeNode & ctnEdit)
	{

	const list<ConfigTreeNode*>& listChildren = ctnEdit.const_children();
	{
		std::list<XorpModContextInfo*> listToAdd;
		list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
		const list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			ConfigTreeNode * p_ctnChild = *i;
			if (p_ctnChild != NULL) {
				bool flagMod = false;
				switch (mt) {
					case MOD_NONE:
						throw std::logic_error("MOD_NONE invalid argument.");
					case MOD_ADDED:
						flagMod = determineIfAdded(ctSync, *p_ctnChild);
						break;
					case MOD_CHANGED:
						flagMod = determineIfChanged(ctSync, *p_ctnChild);
						break;
					case MOD_DELETED:
						flagMod = determineIfDeleted(*p_ctnChild);
						break;
					case MOD_MISSING:
						throw std::logic_error("MOD_MISSING not handled here.");
					default:
						throw std::logic_error("Unknown type.");
				}
				if (flagMod) {
					listToAdd.push_back(
					  new XorpModContextInfo(
					        mt,
					        *p_ctnChild,
					        tt,
					        ctSync,
					        ctEdit));
				}
			}
			i++;
		}

		listToAdd.sort(XorpModContextInfo::compareIfALessThanB);

		std::list<XorpModContextInfo*>::const_iterator j = listToAdd.begin();
		std::list<XorpModContextInfo*>::const_iterator jEnd = listToAdd.end();
		while (j != jEnd) {
			xmci.add(*j);
			j++;
		}
	}
	{
		list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
		const list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			ConfigTreeNode * p_ctnChild = *i;
			if (p_ctnChild != NULL) {
				retrMods(mt, xmci, tt, ctSync, ctEdit, *p_ctnChild);
			}
			i++;
		}
	}
}
void XGDaemonXorpUtil::retrModsMissing(
	XorpModContextInfos & xmci,
	const TemplateTree & tt,
	const ConfigTree & ctSync,
	const ConfigTree & ctEdit,
	const ConfigTreeNode & ctnSync)
	{

	const list<ConfigTreeNode*>& listChildren = ctnSync.const_children();
	{
		std::list<XorpModContextInfo*> listToAdd;
		list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
		const list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			ConfigTreeNode * p_ctnChild = *i;
			if (p_ctnChild != NULL) {
				if (determineIfAdded(ctEdit, *p_ctnChild)) listToAdd.push_back(new XorpModContextInfo(MOD_MISSING, *p_ctnChild, tt, ctSync, ctEdit));
			}
			i++;
		}

		listToAdd.sort(XorpModContextInfo::compareIfALessThanB);

		std::list<XorpModContextInfo*>::const_iterator j = listToAdd.begin();
		std::list<XorpModContextInfo*>::const_iterator jEnd = listToAdd.end();
		while (j != jEnd) {
			xmci.add(*j);
			j++;
		}
	}
	{
		list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
		const list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			ConfigTreeNode * p_ctnChild = *i;
			if (p_ctnChild != NULL) {
				retrModsMissing(xmci, tt, ctSync, ctEdit, *p_ctnChild);
			}
			i++;
		}
	}
}

void XGDaemonXorpUtil::retrNStatInfo(const ConfigTree & ctSync, const ConfigTreeNode & ctn, NStatInfo & nsi) {
	nsi.clear();
	nsi.setFlagAdded(determineIfAdded(ctSync, ctn));
	nsi.setFlagChanged(determineIfChanged(ctSync, ctn));
	nsi.setFlagDeleted(determineIfDeleted(ctn));
	nsi.setFlagInvalid(determineIfInvalid(ctn));
	nsi.setFlagMissingRequired(determineIfMissingRequired(ctn));
}
void XGDaemonXorpUtil::retrPSegments(std::list<PSegment> & list, const ConfigTreeNode & ctn) {
	const ConfigTreeNode * p_ctn = &ctn;
	while (p_ctn != NULL && p_ctn->is_root_node() == false) {
		PSegment ps(p_ctn->segname(), p_ctn->typestr());
		list.push_front(ps);
		p_ctn = p_ctn->const_parent();
	}
}
void XGDaemonXorpUtil::retrSubInfo(const ConfigTree & ctSync, const ConfigTreeNode & ctn, SubInfo & si) {
	si.clear();
	si.setFlagHasAddedChildren(determineIfHasAddedChildren(ctSync, ctn));
	si.setFlagHasChangedChildren(determineIfHasChangedChildren(ctSync, ctn));
	si.setFlagHasDeletedChildren(determineIfHasDeletedChildren(ctn));
	si.setFlagHasInvalidChildren(determineIfHasInvalidChildren(ctn));
	si.setFlagHasMissingRequiredChildren(determineIfHasMissingRequiredChildren(ctn));
}
void XGDaemonXorpUtil::retrVVI(const ConfigTreeNode & ctn, ValueValidityInfo & vvi) {
	vvi.clear();
	vvi.setFlagInvalid(!determineIfValueValid(ctn, vvi.getInvalidValueDesc()));	
}

void XGDaemonXorpUtil::setContextLocationToConfigTreeNode(ContextLocation & clContext, const ConfigTree & ctSync, const ConfigTreeNode & ctn) {
	clContext.clear();

	std::list<ContextSegment> listContextSegmentBackwards;

	const ConfigTreeNode * p_ctnCurrent = &ctn;
	while (p_ctnCurrent != NULL) {
		if (p_ctnCurrent->is_root_node()) break;

		NStatInfo nsi;
		retrNStatInfo(ctSync, ctn, nsi);

		SubInfo si;
		retrSubInfo(ctSync, ctn, si);

		const ContextSegment cs(getIdTemplate(p_ctnCurrent->template_tree_node()), getIdConfig(p_ctnCurrent), p_ctnCurrent->segname(), isMultiNode(*p_ctnCurrent), nsi, si);

		listContextSegmentBackwards.push_back(cs);
		p_ctnCurrent = p_ctnCurrent->const_parent();
	}

	std::list<ContextSegment>::const_reverse_iterator i = listContextSegmentBackwards.rbegin();
	std::list<ContextSegment>::const_reverse_iterator iEnd = listContextSegmentBackwards.rend();
	while (i != iEnd) {
		const ContextSegment & cs = *i;
		clContext.addContextSegmentExistant(cs);
		i++;
	}
}
void XGDaemonXorpUtil::setErrorInfoUnableToAdd(int line, ErrorInfo & ei, const NodeAdditionError & nae) {
	switch (nae) {
	case NAE_UNABLE_TO_ADD_CANNOT_CREATE:
		ei.setInfoUnableToAddCannotCreate(line);
		break;
	case NAE_UNABLE_TO_ADD_DUPLICATE:
		ei.setInfoUnableToAddDuplicate(line);
		break;
	case NAE_UNABLE_TO_ADD_INVALID_CONTEXT:
		ei.setInfoUnableToAddInvalidContext(line);
		break;
	case NAE_UNABLE_TO_ADD_NO_NAME:
		ei.setInfoUnableToAddNoName(line);
		break;
	default:
		ei.setInfoUnableToAdd(line);
	}
}

ConfigTreeNode * XGDaemonXorpUtil::findChildByIdConfig(const ConfigTreeNode & ctnParent, unsigned long idConfig) {
	const list<ConfigTreeNode*> & listChildren = ctnParent.const_children();

	list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
	list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();

	while (i != iEnd) {
		ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			if (getIdConfig(p_ctnChild) == idConfig) {
				return p_ctnChild;
			}
		}
		i++;
	}

	return NULL;
}
ConfigTreeNode * XGDaemonXorpUtil::findChildByName(ConfigTreeNode & ctnParent, const std::string & strName) {
	return const_cast<ConfigTreeNode*>(findConstChildByName(ctnParent, strName));
}
ConfigTreeNode * XGDaemonXorpUtil::findChildByTemplateTreeNode(const ConfigTreeNode & ctnParent, const TemplateTreeNode & ttnChild) {

	const list<ConfigTreeNode*> & listChildren = ctnParent.const_children();

	list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
	list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();

	while (i != iEnd) {
		ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			if (p_ctnChild->template_tree_node() == &ttnChild) {
				return p_ctnChild;
			}
		}
		i++;
	}
	return NULL;
}
ContextLocation XGDaemonXorpUtil::getContextLocation(
		const ConfigTree & ctSync,
		const ConfigTreeNode & ctnEdit)
	{
	ContextLocation clContext;
	setContextLocationToConfigTreeNode(clContext, ctSync, ctnEdit);
	return clContext;
}
InnerContextInfo XGDaemonXorpUtil::getInnerContextInfo(
		const ConfigTree & ctSync,
		const ConfigTreeNode & ctnEdit)
	{
	const TemplateTreeNode * p_ttn = ctnEdit.template_tree_node();

	std::list<std::string> listAllowedOperators;
	retrListAllowedOperators(listAllowedOperators, *p_ttn);

	ValueValidityInfo vvi;
	retrVVI(ctnEdit, vvi);

	NStatInfo nsi;
	retrNStatInfo(ctSync, ctnEdit, nsi);

	SubInfo si;
	retrSubInfo(ctSync, ctnEdit, si);

	bool flagHasValue = ctnEdit.has_value();

	return InnerContextInfo(
		isMultiNode(*p_ttn),
		p_ttn->is_deprecated(),
		isMandatory(*p_ttn),
		isRequired(*p_ttn),
		isUserHidden(*p_ttn),
		ctnEdit.const_children().size(),
		getTotalChildrenCS(ctnEdit),
		p_ttn->children().size(),
		getTotalChildrenCS(*p_ttn),
		p_ttn->typestr(),
		p_ttn->deprecated_reason(),
		p_ttn->help_long(),
		ContextValueInfo(
			false,
			flagHasValue,
			OpVal("", flagHasValue ? ctnEdit.value() : ""),
			p_ttn->has_default(),
			p_ttn->default_str(),
			listAllowedOperators,
			p_ttn->allowed_ranges(),
			determineMapAllowedValues(*p_ttn, &ctnEdit, ctnEdit.const_parent()),
			vvi),
		nsi,
		si);
}
/*
OpCommand * XGDaemonXorpUtil::findOpCommandById(OpCommandList & ocl, unsigned long idOpCommand) {
	const std::list<OpCommand*> & listOpCommand = ocl.op_commands();
	std::list<OpCommand*>::const_iterator i = listOpCommand.begin();
	std::list<OpCommand*>::const_iterator iEnd = listOpCommand.end();	
	while (i != iEnd) {
		OpCommand * p_oc = *i;
		if (p_oc != NULL) {
			if (getIdOpCommand(p_oc) == idOpCommand) return p_oc;
		}
		i++;
	}
	return NULL;
}
OpCommand * XGDaemonXorpUtil::findOpCommandByParts(OpCommandList & ocl, const std::list<std::string> & listCmdParts) {
	std::vector<std::string> vectorCmdParts(listCmdParts.size());

	std::list<std::string>::const_iterator i = listCmdParts.begin();
	std::list<std::string>::const_iterator iEnd = listCmdParts.end();
	unsigned long counter = 0;
	while (i != iEnd) {
		const std::string & strPart = *i;
		vectorCmdParts[counter] = strPart;
		i++;
		counter++;
	}
	return findOpCommandByParts(ocl, vectorCmdParts);
}
OpCommand * XGDaemonXorpUtil::findOpCommandByParts(OpCommandList & ocl, const std::vector<std::string> & vectorCmdParts) {
	const std::list<OpCommand*> & listOpCommand = ocl.op_commands();
	std::list<OpCommand*>::const_iterator i = listOpCommand.begin();
	std::list<OpCommand*>::const_iterator iEnd = listOpCommand.end();	
	while (i != iEnd) {
		OpCommand * p_oc = *i;
		if (p_oc != NULL) {
			bool flagCommandMatches = true;
			const std::list<std::string> listCmdPartsHere = p_oc->command_parts();
			std::list<std::string>::const_iterator j = listCmdPartsHere.begin();
			std::list<std::string>::const_iterator jEnd = listCmdPartsHere.end();
			unsigned long counter = 0;
			while (j != jEnd) {
				const std::string & strPartHere = *j;
				if (strPartHere != vectorCmdParts[counter]) {
					flagCommandMatches = false;
					break;
				}
				j++;
				counter++;
			}
			if (counter == vectorCmdParts.size() && flagCommandMatches == true) return p_oc;
		}
		i++;
	}
	return NULL;
}
*/
ConfigTreeNode * XGDaemonXorpUtil::copyConfigTreeNode(
		SlaveConfigTreeNode & sctnSource,
		const std::string & strNewName,
		const uint32_t xorp_idClient,
		const uid_t xorp_idUnixUser,
		NodeAdditionError & nae) {

	const TemplateTreeNode * p_ttnShared = sctnSource.template_tree_node();
	if (p_ttnShared == NULL) throw std::logic_error("Expected non-NULL template tree node.");

	SlaveConfigTreeNode * p_sctnParent = sctnSource.parent();
	if (p_sctnParent == NULL) return NULL;

	SlaveConfigTreeNode * p_sctn = createSlaveConfigTreeNode(
						*p_sctnParent,
						*p_ttnShared,
						strNewName,
						xorp_idClient,
						xorp_idUnixUser,
						nae);
        if (p_sctn != NULL) {
		if (!isMultiNode(sctnSource)) p_sctn->set_value_without_verification(sctnSource.value(), xorp_idUnixUser);

		std::string strErrorMsg;
		if (p_sctn->set_operator(sctnSource.get_operator(), xorp_idUnixUser, strErrorMsg) == false) {
			delete p_sctn;
			return NULL;
		}
		if (copyChildren(sctnSource, *p_sctn, xorp_idClient, xorp_idUnixUser, nae) == false) {
			delete p_sctn;
			return NULL;
		}
	}
	return p_sctn;
}
OpVal XGDaemonXorpUtil::getOpVal(const ConfigTreeNode & ctn) {
	ConfigOperator co = ctn.is_tag() ? OP_NONE : ctn.get_operator();
	return OpVal(co == OP_NONE ? "" : operator_to_str(co), ctn.has_value() ? ctn.value() : "");
}
OpVal XGDaemonXorpUtil::getOpVal(const ConfigTreeNode * p_ctn) {
	if (p_ctn == NULL) return OpVal(); else return getOpVal(*p_ctn);
}
SlaveConfigTreeNode * XGDaemonXorpUtil::createSlaveConfigTreeNode(
		SlaveConfigTreeNode & sctnParent,
		const TemplateTreeNode & ttn,
		const std::string & strName,
		const uint32_t xorp_idClient,
		const uid_t xorp_idUnixUser,
		NodeAdditionError & nae) {

	nae = NAE_NOT_SPECIFIC;

	if (strName.length() == 0) {
		nae = NAE_UNABLE_TO_ADD_NO_NAME;
		return NULL;
	}

	SlaveConfigTreeNode * p_sctnChild = const_cast<SlaveConfigTreeNode*>(findConstSlaveConfigTreeNodeChildByName(sctnParent, strName));
	if (p_sctnChild != NULL) {
		if (p_sctnChild->deleted()) {
			p_sctnChild->undelete();
			return p_sctnChild;
		} else {
			nae = NAE_UNABLE_TO_ADD_DUPLICATE;
			return NULL;
		}
	} else {
		std::string strPath = sctnParent.path() + " " + strName;
		SlaveConfigTreeNode * p_sctn = new SlaveConfigTreeNode(	strName,
									strPath,
									&ttn,
									&sctnParent,
									ConfigNodeId::ZERO(),
									xorp_idUnixUser,
									xorp_idClient,
									false);
		if (p_sctn == NULL) nae = NAE_UNABLE_TO_ADD_CANNOT_CREATE;
		return p_sctn;
	}
}
SlaveConfigTreeNode * XGDaemonXorpUtil::createPath(
		const ContextLocation & clContext,
		const TemplateTree & tt,
		SlaveConfigTree & sct,
		const uint32_t xorp_idClient,
		const uid_t xorp_idUnixUser,
		NodeAdditionError & nae)
	{
	nae = NAE_NOT_SPECIFIC;

	SlaveConfigTreeNode * p_sctnLast = const_cast<SlaveConfigTreeNode*>(XGDaemonXorpUtil::findConstSlaveConfigTreeNodeLast(sct, clContext));
	if (p_sctnLast == NULL) throw std::logic_error("Expected non-NULL pointer.");

	SlaveConfigTreeNode * p_sctnCurrent = p_sctnLast;
	if (p_sctnCurrent == NULL) throw std::logic_error("Expected non-NULL pointer.");

	const std::vector<ContextSegment> & vectorSegmentsNonExistant = clContext.getConstVectorContextSegmentsNonExistant();
	for (std::vector<ContextSegment>::size_type i = 0; i < vectorSegmentsNonExistant.size(); i++) {
		ContextSegment csNonExistant = vectorSegmentsNonExistant[i];

		const TemplateTreeNode * p_ttnCurrent = p_sctnCurrent->is_root_node() ? tt.root_node() : p_sctnCurrent->template_tree_node();
		if (p_ttnCurrent == NULL) throw std::logic_error("Expected non-NULL pointer.");

		TemplateTreeNode * p_ttnChild = findChildByIdTemplate(*p_ttnCurrent, csNonExistant.getIdTemplate());
		if (p_ttnChild == NULL) {
			nae = NAE_UNABLE_TO_ADD_INVALID_CONTEXT;
			return NULL;
		}

		std::string strName = p_ttnChild->segname();
		if (isMultiNode(*p_ttnChild)) {
			if (i == vectorSegmentsNonExistant.size() - 1) {
				strName = csNonExistant.getName();
			} else {
				throw std::logic_error("Did not expect a multi-node here.");
			}
		}

		SlaveConfigTreeNode * p_sctnNew = createSlaveConfigTreeNode(*p_sctnCurrent, *p_ttnChild, strName, xorp_idClient, xorp_idUnixUser, nae);
		if (p_sctnNew == NULL) return NULL;

		p_sctnCurrent = p_sctnNew;
	}

	return p_sctnCurrent;
}

TemplateTreeNode * XGDaemonXorpUtil::findChildByIdTemplate(const TemplateTreeNode & ttnParent, unsigned long idTemplate) {
	const list<TemplateTreeNode*> & listChildren = ttnParent.children();

	list<TemplateTreeNode*>::const_iterator i = listChildren.begin();
	list<TemplateTreeNode*>::const_iterator iEnd = listChildren.end();

	while (i != iEnd) {
		TemplateTreeNode * p_ttnChild = *i;
		if (p_ttnChild != NULL) {
			if (getIdTemplate(p_ttnChild) == idTemplate) {
				return p_ttnChild;
			}
		}
		i++;
	}

	return NULL;
}
TemplateTreeNode * XGDaemonXorpUtil::findChildByName(const TemplateTreeNode & ttnParent, const std::string & strName) {
	const list<TemplateTreeNode*> & listChildren = ttnParent.children();

	list<TemplateTreeNode*>::const_iterator i = listChildren.begin();
	list<TemplateTreeNode*>::const_iterator iEnd = listChildren.end();

	while (i != iEnd) {
		TemplateTreeNode * p_ttnChild = *i;
		if (p_ttnChild != NULL) {
			if (p_ttnChild->segname() == strName) {
				return p_ttnChild;
			}
		}
		i++;
	}
	return NULL;
}
TemplateTreeNode * XGDaemonXorpUtil::findChildByType(const TemplateTreeNode & ttnParent, const std::string & strType) {
	const list<TemplateTreeNode*> & listChildren = ttnParent.children();

	list<TemplateTreeNode*>::const_iterator i = listChildren.begin();
	list<TemplateTreeNode*>::const_iterator iEnd = listChildren.end();

	while (i != iEnd) {
		TemplateTreeNode * p_ttnChild = *i;
		if (p_ttnChild != NULL) {
			if (p_ttnChild->typestr() == strType) {
				return p_ttnChild;
			}
		}
		i++;
	}
	return NULL;
}
TemplateTreeNode * XGDaemonXorpUtil::findTemplateTreeNodeLast(const TemplateTree & tt, const ContextLocation & clContext) {
	TemplateTreeNode * p_ttnCurrent = tt.root_node();
	if (p_ttnCurrent == NULL) return NULL;

	p_ttnCurrent = walkContextSegments(*p_ttnCurrent, clContext.getConstVectorContextSegmentsExistant());
	if (p_ttnCurrent == NULL) return NULL;
	
	p_ttnCurrent = walkContextSegments(*p_ttnCurrent, clContext.getConstVectorContextSegmentsNonExistant());
	return p_ttnCurrent;
}

TemplateTreeNode * XGDaemonXorpUtil::walkContextSegments(TemplateTreeNode & ttnStart, const std::vector<ContextSegment> & vectorContextSegments) {
	TemplateTreeNode * p_ttnCurrent = &ttnStart;

	std::vector<ContextSegment>::const_iterator i = vectorContextSegments.begin();
	const std::vector<ContextSegment>::const_iterator iEnd = vectorContextSegments.end();
	while (i != iEnd) {
		const ContextSegment & cs = *i;
		unsigned long idTemplate = cs.getIdTemplate();
		p_ttnCurrent = findChildByIdTemplate(*p_ttnCurrent, idTemplate);
		if (p_ttnCurrent == NULL) return NULL;
		i++;
	}

	return p_ttnCurrent;
}
const ConfigTreeNode * XGDaemonXorpUtil::findConstConfigTreeNodeLast(const ConfigTree & ct, const ContextLocation & clContext) {
	const ConfigTreeNode * p_ctnCurrent = &ct.const_root_node();
	if (p_ctnCurrent == NULL) return NULL;

	p_ctnCurrent = walkContextSegments(*p_ctnCurrent, clContext.getConstVectorContextSegmentsExistant());
	return p_ctnCurrent;
}
const ConfigTreeNode * XGDaemonXorpUtil::findConstChildByName(const ConfigTreeNode & ctnParent, const std::string & strName) {
	const list<ConfigTreeNode*> & listChildren = ctnParent.const_children();

	list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
	list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();

	while (i != iEnd) {
		ConfigTreeNode * p_ctnChild = *i;
		if (p_ctnChild != NULL) {
			if (p_ctnChild->segname() == strName) {
				return p_ctnChild;
			}
		}
		i++;
	}
	return NULL;
}
const ConfigTreeNode * XGDaemonXorpUtil::findSyncNode(const ConfigTree & ctSync, const ConfigTreeNode & ctnEdit) {
	if (ctnEdit.is_root_node()) {
		return &ctSync.const_root_node();
	} else {
		const ConfigTreeNode * p_ctnEditParent = ctnEdit.const_parent();
		if (p_ctnEditParent == NULL) throw new std::logic_error("Expected parent node.");
		const ConfigTreeNode * p_ctnSyncParent = findSyncNode(ctSync, *p_ctnEditParent);
		if (p_ctnSyncParent == NULL) return NULL;
		return findConstChildByName(*p_ctnSyncParent, ctnEdit.segname());
	}
}
const ConfigTreeNode * XGDaemonXorpUtil::walkContextPath(const ConfigTree & ctWalk, const std::vector<std::string> & vectorContextPath) {
	return walkContextPath(ctWalk.const_root_node(), vectorContextPath);
}
const ConfigTreeNode * XGDaemonXorpUtil::walkContextPath(const ConfigTreeNode & ctnStart, const std::vector<std::string> & vectorContextPath) {
	const ConfigTreeNode * p_ctnCurrent = &ctnStart;

	std::vector<std::string>::const_iterator i = vectorContextPath.begin();
	const std::vector<std::string>::const_iterator iEnd = vectorContextPath.end();
	while (i != iEnd) {
		const std::string & strPathSegment = *i;

		p_ctnCurrent = findConstChildByName(*p_ctnCurrent, strPathSegment);
		if (p_ctnCurrent == NULL) return NULL;
		i++;
	}

	return p_ctnCurrent;	
}
const ConfigTreeNode * XGDaemonXorpUtil::walkContextSegments(const ConfigTreeNode & ctnStart, const std::vector<ContextSegment> & vectorContextSegments) {
	const ConfigTreeNode * p_ctnCurrent = &ctnStart;

	std::vector<ContextSegment>::const_iterator i = vectorContextSegments.begin();
	const std::vector<ContextSegment>::const_iterator iEnd = vectorContextSegments.end();
	while (i != iEnd) {
		const ContextSegment & cs = *i;

		unsigned long idConfig = cs.getIdConfig();
		p_ctnCurrent = findChildByIdConfig(*p_ctnCurrent, idConfig);
		if (p_ctnCurrent == NULL) return NULL;
		i++;
	}

	return p_ctnCurrent;
}
const SlaveConfigTreeNode * XGDaemonXorpUtil::findConstSlaveConfigTreeNodeChildByName(const SlaveConfigTreeNode & sctnParent, const std::string & strName) {
	return dynamic_cast<const SlaveConfigTreeNode*>(findConstChildByName(sctnParent, strName));
}
const SlaveConfigTreeNode * XGDaemonXorpUtil::findConstSlaveConfigTreeNodeLast(const SlaveConfigTree & sct, const ContextLocation & clContext) {
	return dynamic_cast<const SlaveConfigTreeNode*>(findConstConfigTreeNodeLast(sct, clContext));
}
const TemplateTreeNode * XGDaemonXorpUtil::findNextInPath(const TemplateTreeNode & ttnStart, const TemplateTreeNode & ttnEnd) {
	if (&ttnStart == &ttnEnd) return NULL;

	const TemplateTreeNode * p_ttnPossibleNext = &ttnEnd;

	while (p_ttnPossibleNext != NULL && p_ttnPossibleNext->parent() != &ttnStart) {
		p_ttnPossibleNext = p_ttnPossibleNext->parent();
	}

	return p_ttnPossibleNext;
}
std::map<std::string, std::string> XGDaemonXorpUtil::determineMapAllowedValues(
		const TemplateTreeNode & ttnChild,
		const ConfigTreeNode * p_ctnChild,
		const ConfigTreeNode * p_ctnParent)
	{

	std::map<std::string, std::string> mapToReturn = ttnChild.allowed_values();
	if (isMultiNode(ttnChild) && mapToReturn.size() > 0 && p_ctnParent != NULL) {		
		std::list<ConfigTreeNode*> listChildren = p_ctnParent->const_children();
		std::list<ConfigTreeNode*>::const_iterator i = listChildren.begin();
		const std::list<ConfigTreeNode*>::const_iterator iEnd = listChildren.end();
		while (i != iEnd) {
			ConfigTreeNode * p_ctnSybling = *i;
			if (p_ctnSybling != NULL && p_ctnSybling->template_tree_node() == &ttnChild) {
				if (p_ctnSybling != p_ctnChild) {
					const std::string & strSegname = p_ctnSybling->segname();
					if (strSegname.length() > 0) mapToReturn.erase(strSegname);
				}
				i++;
			}
		}
	}

	return mapToReturn;
}

