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
 *  Module:           ui.js
 *
 *  Original Author:  DHAP Digital, Inc.  Douglas Good & others
 *  Other Author(s):  Marat Nepomnyashy
 *  Date:             2006
 *  Description:      AJAX JavaScript file for user-interface-level functionality
 *
 */

/*
 * Originally created by DHAP Digital, Inc.
 * http://www.dhapdigital.com/
 */

function UiManager() {
	function uiAddNodeListToArray(nodeList, array) {
		if ( typeof(nodeList) == "undefined" || nodeList == null ) return;
		for (var i=0; i < nodeList.length; i++) {
			array.push(nodeList.item(i));
		}
	}
	function uiCheckApply() {
		var form = document.getElementById("configForm");
		var configFields = this.collectFormFields(form);
		if (appManager.checkConfigOptions(configFields) == true) {
			if (form.apply && form.apply.src) form.apply.src = "images/bt_apply_active.gif";
		} else {
			if (form.apply && form.apply.src) form.apply.src = "images/bt_apply.gif";
		}
	}
	function uiClearConfigDisplay() {
//		this.displayMessageHtml(null);
		document.getElementById("configArea").innerHTML = "";
	}
	function uiClearDisplay() {
//		this.displayMessageHtml(null);
		document.getElementById("operationArgsArea").innerHTML = "";
	}
	function uiClearOperationDisplay() {
//		this.displayMessageHtml(null);
		document.getElementById("operationResultArea").innerHTML = "";
	}
	function uiClickAdd(template_id) {
		if (template_id == null) return;

		var form = document.getElementById("addForm");
		if (form == null) return;

		var name = "add_" + template_id;
		var fieldElements = new Array();
		this.addNodeListToArray(form.getElementsByTagName("input"), fieldElements);
		this.addNodeListToArray(form.getElementsByTagName("select"), fieldElements);
		for (var i = 0; i < fieldElements.length; i++) {
			var textfield = fieldElements[i];
			if (textfield.name == name) {
				var value = textfield.value;
				if (value && value.length > 0) appManager.addConfig(template_id, value);
				break;
			}
		}
	}
	function uiClickAddContext(id) {
		var context = this.contextElementMap[id];
		appManager.addOrRemoveContext(context, true);
	}
	function uiClickApply() {
		var form = document.getElementById("configForm");
		var configFields = this.collectFormFields(form);
		appManager.applyConfigOptions(configFields);
	}
	function uiClickApplyRename() {
		var form = document.getElementById("configForm");
		var renameFields = this.collectFormFields(form);
		appManager.renameConfigs(renameFields);
	}
	function uiClickCloseContext(id) {
		var node = this.contextElementMap["" + id];
		node.showChildren = false;
		this.displayMenuContext();
	}
	function uiClickCloseMenu(menuId, entryId) {
		var menu = this.menuMap[menuId];
		var menuItem = menu.elementMap[entryId];
		menuItem.showChildren = false;
		this.displayMenu(menu);
	}
	function uiClickCommit() {
		if (!appManager.getChangesNotCommitted()) return;

		this.showConfigureContent();
		this.clearDisplay();
		this.clearConfigDisplay();
		
		document.getElementById("configArea").innerHTML = this.getHtmlConfirmCommit();
	}
	function uiClickConfirmCommit() {
		var node = null;
		if (appManager.state != null && appManager.state.contextTree != null) node = appManager.state.contextTree.getContext();
		if (appManager.getChangesNotCommitted()) appManager.commit(node);
	}
	function uiClickConstrictMenus() {
		var menuTreeList = new Array();
		var activeMenuTree = appManager.state.activeMenu;
		var contextTree = appManager.state.contextTree;
		menuTreeList.push(contextTree);
		for (var x in this.menuMap) {
			var tree = this.menuMap[x].tree;
			menuTreeList.push(tree);
		}
		for (var i=0; i < menuTreeList.length; i++) {
			var menuTree = menuTreeList[i];
			if ( menuTree == activeMenuTree ) {
				menuTree.hideDistantRelatives();
			}
			else {
				menuTree.hideAll();
				if ( menuTree.selectedEntry ) menuTree.selectedEntry = null;
			}
		}
		this.displayMenus();
	}
	function uiClickContext(id) {
		var node = this.contextElementMap["" + id];
		node.showChildren = true;
		if ( node.allowContextChange ) {
			appManager.changeContext(node);
		} else {
			this.displayMenus();
		}
	}
	function uiClickEvent(menuId, entryId) {
		var menu = this.menuMap[menuId];

		var menuItem = menu.elementMap[entryId];
		menu.tree.selectedEntry = menuItem;

		appManager.state.activeMenu = menu.tree;
		this.displayMenus();

		var eventFunc = menu.elementMap[entryId].value;
		appManager.state.activeMenu = menu.tree;
		appManager.startEvent(eventFunc);
	}
	function uiClickLoad() {
		if ( !appManager.isLoggedIn() ) return;
		loadContent();
	}
	function uiClickLoadFilespec() {
		var form = document.getElementById("loadArgsForm");
		var fields = this.collectFormFields(form);
		appManager.load(fields);
	}
	function uiClickLogin() {
		var loginForm = document.getElementById("loginForm");
		var loginFields = this.collectFormFields(loginForm);
		this.displayMessage("Connecting to server to login...");
		appManager.login(loginFields);
	}
	function uiClickLogout() {
		if ( appManager.isLoggedIn() ) {
			appManager.uiManager.displayMessage("Logout in progress...");
			try {
				appManager.logout();
			} finally {
				//window.location.reload();
				appManager.state.user = null;
				appManager.state.sessionId = null;

				appManager.uiManager.palettesCollapsed = null;

				appManager.uiManager.displayCommitStatus();
				appManager.uiManager.displayLoadStatus();
				appManager.uiManager.displayLoginStatus();
				appManager.uiManager.displaySaveStatus();
				appManager.uiManager.hideMenus();
				appManager.uiManager.setMarginWidth();
				loginContent();
				appManager.uiManager.displayMessage(null);
			}
		}
	}
	function uiClickOpenContext(id) {
		var node = this.contextElementMap["" + id];
		node.showChildren = true;
		if ( node.allowContextChange ) {
			appManager.expandContext(node);
		} else {
			this.displayMenuContext();
		}
	}
	function uiClickOpenMenu(menuId, entryId) {
		var menu = this.menuMap[menuId];
		var menuItem = menu.elementMap[entryId];
		menuItem.showChildren = true;
		this.displayMenu(menu);
	}
	function uiClickOperation(menuId, entryId) {
		var menu = this.menuMap[menuId];

		var menuItem = menu.elementMap[entryId];
		if (!menuItem.showChildren) menuItem.showChildren = true;

		var menuItemOCE = this.getOpCorridorEnd(menuItem);
		var operation = null;

		if (menuItemOCE != null) operation = menuItemOCE.value; else operation = menuItem.value; 
		if (operation != null) this.showOperationContent();

		menu.tree.selectedEntry = menuItem;

		appManager.state.activeMenu = menu.tree;
		this.displayMenus();

		appManager.startOperation(operation);
	}
	function uiClickRemove(id) {
		var configEntry = this.configElementMap[id];
		this.confirmRemove(appManager.getContext(), configEntry.configId);
	}
	function uiClickRemoveContext(id) {
		var context = this.contextElementMap[id];
		appManager.addOrRemoveContext(context, false);
	}
	function uiClickRename(id) {
		this.displayRename(id);
	}
	function uiClickRevert() {
		if ( ( ! appManager.allowChanges() ) || ( ! appManager.getChangesNotCommitted() ) ) return;
		if ( confirm("Reverting will discard configuration changes.  Are you sure you want to do this?") ) {
			appManager.revert();
		}
	}
	function uiClickSave() {
		if ( !appManager.isLoggedIn() ) return;
		saveContent();
	}
	function uiClickSaveFilespec() {
		var form = document.getElementById("saveArgsForm");
		var fields = this.collectFormFields(form);
		appManager.save(fields);
	}
	function uiCollapsePalettes() {
		this.palettesCollapsed = true;
		this.setMarginWidth();
	}
	function uiCollectField(fieldName, fieldValue, fieldMap) {
		var collectedValues = fieldMap[fieldName];
		if ( typeof(collectedValues) == "undefined" || collectedValues == null ) {
			fieldMap[fieldName] = fieldValue;
		}
		else if ( fieldValue != null ) {
			if ( collectedValues.prototype != Array ) {
				var collectedValue = collectedValues;
				collectedValues = new Array();
				collectedValues.push(collectedValue);
			}
			collectedValues.push(fieldValue);
			fieldMap[fieldName] = collectedValues;
		}
	}
	function uiCollectFormFields(form) {
		var fields = new Object();
		var fieldElements = new Array();
		this.addNodeListToArray(form.getElementsByTagName("input"), fieldElements);
		this.addNodeListToArray(form.getElementsByTagName("select"), fieldElements);
		this.addNodeListToArray(form.getElementsByTagName("textarea"), fieldElements);
		for (var i=0; i < fieldElements.length; i++) {
			var element = fieldElements[i];
			var type = element.getAttribute("type");
			var name = element.name;
			if ( type != null ) type = type.toLowerCase();
			if ( name != null ) name = name.toLowerCase();
			if ( name == "textarea" || type == "text" || type == "hidden" || type =="password" || type == "select-one" || type == null ) {
				this.collectField(element.name, element.value, fields);
			}
			else if ( type == "checkbox" || type == "radio" ) {
				var value = null;
				if ( element.checked ) {
					value = element.value;
				}
				else if ( type == "checkbox" ) {
					value = "false";
				}
				this.collectField(element.name, value, fields);
			}
		}
		return fields;
	}
	function uiConfirmRemove(context, configId) {
		if ( ! appManager.allowChanges() ) return;
		appManager.removeConfig(context, configId);
	}
	function uiCreateMenuOperations() {
		var menu = new Menu();
		menu.id = appManager.state.operationStore.treeOperations.id;
		menu.tree = appManager.state.operationStore.treeOperations;
		menu.divName = "operationMenuArea";
		this.menuMap[menu.id] = menu;
	}
	function uiCreateMenuTools() {
		this.toolElementMap = new Object();
		document.getElementById("toolsArea").innerHTML = this.toolsHtml(appManager.state.toolStore);

		var menu = new Menu();
		menu.id = appManager.state.treeTools.id;
		menu.tree = appManager.state.treeTools;
		menu.divName = "toolMenuArea";
		this.menuMap[menu.id] = menu;
	}
	
	
	function uiCreateMenuVyattaSupport() {
		var tree = new Tree();
		tree.id = "support";
		tree.root.name = "Vyatta Support";
		tree.root.type = EntryType.EVENT;
		tree.root.value = supportContent;

		var menu = new Menu();
		menu.id = tree.id;
		menu.tree = tree;
		menu.divName = "supportArea";
		this.menuMap[menu.id] = menu;
	}

	function uiDataEntryHtmlInvalidValue(configEntry) {
		var html = "";
		html += "<font color=\"red\">";
		html += "Invalid value";
		if (configEntry.invalid_value_desc == null) {
			html += ".";
		} else {
			html += ":<br>";
			html += configEntry.invalid_value_desc;
		}
		html += "</font>";
		return html;
	}

/*	function uiDisplayCommitResults(results) {
		var html = "";
		html += "<p>";

		if (results && results.current_phase) {
			html += "Commit Phase: " + results.current_phase +  "&#160;&#160;<img src='images/status_bar_" + results.current_phase + ".gif' alt='' width='120' height='10'><br clear='all'>";
		}

		var descriptionClass = "";
		if (results && results.success == false) {
			html += "<span class='error'><span class='errorLabel'>There was a problem during the commit:</span><br>";
			descriptionClass = "error";

			if (appManager.getSessionInvalidState()) {
				html += "<p>";
				html += this.invalidStateMessage;
			}
		}

		if (results.description != null) {
			html += '<span class="' + descriptionClass + '">';
			html += results.description;
			html += "</span>";
		}

		if ( results.done ) {
			html += "<p>";
			html += "Your changes have been committed.";
			html += "<p>";
			html += "<a href=\"javascript:appManager.resetTask();\">OK</a>";
		}

		this.displayMessageHtml(html);
	}
*/
	function uiDisplayCommitStatus() {
		var commitButton = document.getElementById("commitButton");
		var revertButton = document.getElementById("revertButton");

		if ( appManager.isLoggedIn() && (appManager.getChangesNotCommitted() || appManager.getSessionInvalidState()) ) {
			if ( appManager.getChangesInvalid() || appManager.getSessionInvalidState() ) {
				commitButton.src = "images/bt_commit_error.gif";
			} else {
				commitButton.src = "images/bt_commit_active.gif";
			}
			revertButton.src = "images/bt_revert_active.gif";
		} else {
			commitButton.src = "images/bt_commit_inactive.gif";
			revertButton.src = "images/bt_revert_inactive.gif";
		}
	}
	function uiDisplayConfig(config) {
		this.showOperationContent();

		var html = "";

		html += this.getHtmlBlueHeaderBlock("Current Configuration");
		html += "<p>";
		if (config == null || config.length == 0) {
			html += "No current configuration exists.";
		} else {
			html += "<div id=\"config_out\">";
			html += config;
			html += "</div>";
		}

		var resultArea = document.getElementById("operationResultArea");
		resultArea.innerHTML = html;

		this.setMarginWidth();
	}
	function uiDisplayConfigOptions() {
		this.showConfigureContent();
		var html = "";
		this.configElementMap = new Object();
		html = this.getHtmlConfigOptions();
		document.getElementById("configArea").innerHTML = html;
		var focusId = null;
		if (this.appManager.state && this.appManager.state.config_optionsContext) {
			if ( this.appManager.state.config_optionsContext.optionAdd != null && this.appManager.state.config_optionsContext.optionAdd.length > 0) {
				focusId = this.appManager.state.config_optionsContext.optionAdd[0].id;
			} else if ( this.appManager.state.config_optionsContext.entries.length > 0 ) {
				focusId = this.appManager.state.config_optionsContext.entries[0].id;
			}
		}
		if ( focusId != null ) {
			setTimeout('focusById("' + focusId + '");', 800);
		}
	}
	function uiDisplayError(errorText, errorType) {
		var html = "<p class='error'><span class='errorLabel'>Error:</span> ";
		html += errorText;
		html += "</p>";
		var messageArea = document.getElementById("messageArea");
		if (messageArea) {
		    messageArea.innerHTML = html;
		    messageArea.style.display = "inline";
		}
	}
	function uiDisplayExecs(execs) {
		this.showOperationContent();

		var html = "";

		html += this.getHtmlBlueHeaderBlock("Started Operations");
		html += "<p>";
		
		if (execs == null || execs.length == 0) {
			html += "No operations have been started in this session.";
		} else {
			html += "<table border=\"0\" cellspacing=\"0\" cellpadding=\"5\">\n";
			html += "<tr>";
			html += "<th align=\"left\">Time Started</th>";
			html += "<th align=\"left\">Time Ended</th>";
			html += "<th align=\"left\">Lines</th>";
			html += "<th align=\"left\">Operation</th>";
			html += "<th align=\"left\">Status</th>";
			html += "</tr>\n";
			for (var i = 0; i < execs.length; i++) {

				var tstart = execs[i].time_start;
				var tend = execs[i].time_end;

				if ((tstart && execs[i].time_server && tstart.substr(0, 11) == execs[i].time_server.substr(0, 11)) && (tend == null || (tstart.substr(0, 11) == tend.substr(0, 11))))  {
					tstart = tstart.substr(11);
					if (tend) tend = tend.substr(11);
				}

				html += "<tr>\n";
				html += "<td>";
				if (tstart) {
					html += "<a style=\"text-decoration: none;\" href=\"javascript:appManager.fetchExecutionStatus('" + execs[i].execId + "');\">";
					html += tstart;
					html += "</a>";
				}
				html += "</td>\n";

				html += "<td>";
				if (tend) {
					html += "<a style=\"text-decoration: none;\" href=\"javascript:appManager.fetchExecutionStatus('" + execs[i].execId + "');\">";
					html += tend;
					html += "</a>";
				}
				html += "</td>\n";

				html += "<td>";
				html += "<a style=\"text-align: right; text-decoration: none;\" href=\"javascript:appManager.fetchExecutionStatus('" + execs[i].execId + "');\">";
				html += execs[i].totalLines;
				html += "</a>";
				html += "</td>\n";

				html += "<td>";
				html += "<a style=\"text-decoration: none;\" href=\"javascript:appManager.fetchExecutionStatus('" + execs[i].execId + "');\">";
				html += execs[i].cached_cmd_line;
				html += "</a>";
				html += "</td>\n";

				html += "<td>";
				html += "<a style=\"text-decoration: none;\" href=\"javascript:appManager.fetchExecutionStatus('" + execs[i].execId + "');\">";
				html += execs[i].done ? "Ended" : "Running";
				html += "</a>";
				html += "</td>\n";
				html += "</tr>\n";
			}
			html += "</table>\n";
		}

		var resultArea = document.getElementById("operationResultArea");		
		resultArea.innerHTML = html;

		this.setMarginWidth();
	}
	function uiDisplayLoadStatus() {
		var loadButton = document.getElementById("loadButton");
		if ( appManager.isLoggedIn() ) {
			loadButton.src = "images/bt_load_active.gif";
		}
		else {
			loadButton.src = "images/bt_load_inactive.gif";
		}
	}
	function uiDisplayLoginStatus() {
		var logoutButton = document.getElementById("logoutButton");
		if ( appManager.isLoggedIn() ) {
			logoutButton.src = "images/bt_logout_active.gif";
		}
		else {
			logoutButton.src = "images/bt_logout_inactive.gif";
		}
	}
	function uiDisplayMenu(menu) {
		menu.elementMap = new Object();
		var html = "";
		html += "<table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n";
		html += this.getHtmlTreeNode(menu.tree.root, 0, menu);
		html += "</table>\n";
		document.getElementById(menu.divName).innerHTML = html;
	}
	function uiDisplayMenuContext() {
		var html = "";
		this.contextElementMap = new Object();

		html += "<table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n";
		html += this.getHtmlTreeNode(appManager.state.contextTree.rootNode, 0, null);
		html += "</table>\n";
		document.getElementById("contextArea").innerHTML = html;
	}
	function uiDisplayMenus() {
		this.displayMenuContext();
		for (var x in this.menuMap) {
			this.displayMenu(this.menuMap[x]);
		}
		document.getElementById('logo').src = "images/logo.gif";
	}
	function uiDisplayMessage(messageText) {
		if (messageText == null) {
			this.displayMessageHtml(null);
		} else {
			var html = "<p>";
			html += messageText;
			html += "</p>";
			this.displayMessageHtml(html);
		}
	}
	function uiDisplayMessageChangesApplied() {
		this.displayMessage("Changes applied, please <b>Commit All Changes</b> when ready.");
	}
	function uiDisplayMessageHtml(html) {
		var messageArea = document.getElementById("messageArea");
		if (html == null || html.length == 0) {
			messageArea.style.display="none";
		} else {
			messageArea.innerHTML = html;
			messageArea.style.display="inline";
		}
	}
	function uiDisplayOperationResults(results) {

		var exec_id = 0;
		if (results && results.brief && results.brief.execId) exec_id = results.brief.execId;

		var output = null;
		var output_from = 0;
		if ( results.detailed.output != null && results.detailed.output.length >= 2) {
			output = results.detailed.output.substr(1, results.detailed.output.length - 2);

			if (results.detailed.output_from != null) output_from = results.detailed.output_from;

			var old_output = "";
			if (appManager.state.exec_output && appManager.state.exec_output[exec_id]) old_output = appManager.state.exec_output[exec_id];

			appManager.state.exec_output[exec_id] = old_output.substr(0, output_from) + output;
		}

		var op_status = document.getElementById("op_status");
		if (op_status == null) {
			var html = "";

			html += "<div id='op_status'>\n";
			html += "</div>\n";

			html += "<p>\n";
			html += "<div id='op_out' style=\"display: none\">\n";
			html += "</div>\n";

			var resultArea = document.getElementById("operationResultArea");
			resultArea.innerHTML = html;
		}

		op_status = document.getElementById("op_status");
		if (op_status != null) {
			op_status.innerHTML = this.getHtmlOpStatus(results);

			var op_out = document.getElementById("op_out");
			var output_show = appManager.state.exec_output[exec_id];
			if ((output_show && output_show.length > 0) || (output && output_from > 0)) {
				op_out.style.display = "block";
			}
			if (output && output_from > 0) {
				var op_out_name = "op_out_" + output_from;
				var op_out_new = document.getElementById(op_out_name);
				if (op_out_new) {
					op_out = op_out_new;
					output_show = output;
				} else {
					output_from = 0;
				}
			}
			if (output_show) {
				var html = output_show;
				if (output_show.length > 0) {
					html += "<div id='";
					html += "op_out_";
					html += appManager.state.exec_output[exec_id].length;
					html += "'>";
					html += "</div>";
				}
				op_out.innerHTML = html;
			}
		}

		this.setMarginWidth();
	}
	function uiDisplayRename(id) {
		var context = this.contextElementMap["" + id];
		var html = "<b>Rename:</b> ";
		html += '<form name="rename" id="renameForm" onsubmit="return false;">';
		html += '<table border="0" cellspacing="0" cellpadding="3"><tr><td width="33%">';
		html += '<input name="value" value="' + context.name + '" maxlength="40" class="text_field" onKeyUp="appManager.uiManager.checkApply">';
		html += '</td><td width="33%">';
		html += '<a href="javascript:appManager.uiManager.submitRename(\'' + context.id + '\');"><img src="images/bt_apply.gif" name="apply" alt="Apply" width="59" height="19"></a>';
		html += '</td></tr></table>';
		html += '</form>';
		document.getElementById("configArea").innerHTML = html;
	}
	function uiDisplaySaveStatus() {
		var saveButton = document.getElementById("saveButton");
		if ( appManager.isLoggedIn() ) {
			saveButton.src = "images/bt_save_active.gif";
		}
		else {
			saveButton.src = "images/bt_save_inactive.gif";
		}
	}
	function uiDisplayStatus(status) {
		var uptimeTotalSeconds  = status.time.uptime.total;
		var uptimeTotalMinutes  = Math.floor(uptimeTotalSeconds / 60);
		var uptimeTotalHours    = Math.floor(uptimeTotalMinutes / 60);
		var uptimeTotalDays     = Math.floor(uptimeTotalHours / 24);

		var uptimeSeconds       = "" + (uptimeTotalSeconds % 60);
		var uptimeMinutes       = "" + (uptimeTotalMinutes % 60);
		var uptimeHours         = "" + (uptimeTotalHours % 24);

		if (uptimeSeconds.length < 2) uptimeSeconds = "0" + uptimeSeconds;
		if (uptimeMinutes.length < 2) uptimeMinutes = "0" + uptimeMinutes;
		if (uptimeHours.length < 2) uptimeHours = "0" + uptimeHours;
 
		var html = "";
		html += '<table border="0" width="100%" cellspacing="0" cellpadding="2">';
		html += '<tr><td align="left" colspan="2">Server&nbsp;Time:</td></tr>';

		html += '<tr><td align="right">';
		html += status.time.local_time.asc_hour24 + ":" + status.time.local_time.asc_minute;
		html += '</td>';
		html += '<td align="left">' + status.time.local_time.zone + ' local</td></tr>';

		html += '<tr><td align="right">';
		html += status.time.gmt_time.asc_hour24 + ":" + status.time.gmt_time.asc_minute;
		html += '</td>';
		html += '<td align="left">GMT</td></tr>';

		html += '<tr><td align="left" colspan="2">Uptime:</td></tr>';
		html += '<tr><td align="right">';

		html += uptimeTotalDays;
		html += ':';
		html += uptimeHours;
		html += ':';
		html += uptimeMinutes;
		html += ':';
		html += uptimeSeconds;

		html += '</td>';

		html += '<td align="left">total</td></tr>';

		if (status.stat && status.stat.cpu) {
			for (var i = 0; i < status.stat.cpu.length; i++) {
				html += this.displayStatusCPU(status.stat.cpu[i], status.stat.cpu.length);
			}
		}

		html += '<tr><td align="left" colspan="2">Network In:</td></tr>';
		html += this.networkStatusHtml(status.net["in"]);
		html += '<tr><td align="left" colspan="2">Network Out:</td></tr>';
		html += this.networkStatusHtml(status.net.out);
		html += '</table>';

		document.getElementById("statusArea").innerHTML = html;
	}
	function uiDisplayStatusCPU(cpu, totalCPUs) {
		var cpuUse              = parseInt(cpu.use);
		var cpuNic              = parseInt(cpu.nic);
		var cpuSys              = parseInt(cpu.sys);
		var cpuIdl              = parseInt(cpu.idl);
		var cpuIow              = parseInt(cpu.iow);
		var cpuXxx              = parseInt(cpu.xxx);
		var cpuYyy              = parseInt(cpu.yyy);

		var cpuTotal            = cpuUse + cpuNic + cpuSys + cpuIdl + cpuIow + cpuXxx + cpuYyy;
		var cpuUser             = cpuUse + cpuNic;
		var cpuSystem           = cpuSys + cpuXxx + cpuYyy;

		var html = "";

		html += '<tr><td align="left" colspan="2">CPU';
		if (totalCPUs > 1) html += cpu.index;
		html += ':</td></tr>';

		html += '<tr><td align="right">';
		html += Math.round((cpuUser / cpuTotal) * 10000) / 100;
		html += '%</td>';
		html += '<td align="left">User</td></tr>';

		html += '<tr><td align="right">';
		html += Math.round((cpuSystem / cpuTotal) * 10000) / 100;
		html += '%</td>';
		html += '<td align="left">System</td></tr>';

		html += '<tr><td align="right">';
		html += Math.round((cpuIdl / cpuTotal) * 10000) / 100;
		html += '%</td>';
		html += '<td align="left">Idle</td></tr>';

		html += '<tr><td align="right">';
		html += Math.round((cpuIow / cpuTotal) * 10000) / 100;
		html += '%</td>';
		html += '<td align="left">I/O Wait</td></tr>';

		return html;
	}
	function uiDisplayTOWarning(warningText) {
		var toWarningArea = document.getElementById("toWarningArea");
		if (warningText == null || warningText.length == 0) {
			toWarningArea.style.display="none";
		} else {
			var html = "<p class='warning'><span class='warningLabel'>Warning:</span> ";
			html += warningText;
			html += "<br>&nbsp;</p>";

			toWarningArea.style.display="inline";
			toWarningArea.innerHTML = html;
		}
	}
	function uiDisplayWelcome(response) {
		var strUsername = response.rl.session.username;
		var strWelcomeText = "Welcome user";
		if (strUsername && strUsername.length > 0) {
			strWelcomeText += ' ';
			strWelcomeText += strUsername;
		}
		strWelcomeText += '.';

		this.showConfigureContent();
		var html = this.getHtmlBlueHeaderBlock(strWelcomeText);
		document.getElementById("configArea").innerHTML = html;
	}
	function uiDividerHtml() {
		return '<div class="divider"><img src="images/spacer.gif" alt="" width="1" height="1" border="0" align="top"></div>';
	}
	function uiExpandPalettes() {
		this.palettesCollapsed = false;
		this.setMarginWidth();
	}
	function uiFindFormValue(element) {
		var formElement = document.getElementById(element.id);
		var value = null;
		if ( formElement == null ) return value;
		if ( typeof(formElement.value) != "undefined" ) {
			value = formElement.value;
		}
		return value;
	}
	function uiGetHtmlAddContext(context) {
		var html = "";
		html += '<p><a href="javascript:appManager.uiManager.clickAddContext(\'' + context.id + '\');">';
		html += '<img src="images/bt_add.gif" alt="Add ' + context.name + '" width="49" height="17">';
		html += '</a></p>';
		return html;
	}
	function uiGetHtmlBlueHeaderBlock(title) {
		var html = "";

		html += "<div style=\"background-color: #bfd2e5; display: block; height: 27px;\">";
		html += "<img src=\"images/sub_hdr_corner_left.gif\" alt=\"\" width=\"18\" height=\"27\" style=\"float:left;\">";
		html += "<img src=\"images/sub_hdr_corner_right.gif\" alt=\"\" width=\"18\" height=\"27\" style=\"float:right\">";
		html += "<div style=\"display: block; font-weight: bold; padding: 6px;\">";
		html += title;
		html += "</div>";
		html += "</div>";

		return html;
	}
	function uiGetHtmlConfigEntry(context, configEntry) {
		var html = "";
		html += "<tr>";
		html += "<td>";
		if (!configEntry.isDeleted && configEntry.flagValueExists == true) {
			html += "<a href=\"javascript:appManager.uiManager.clickRemove(\'" + configEntry.id + "\');\"><img src=\"images/bt_delete2.gif\" align=\"top\" alt=\"Delete\" border=\"0\"></a>";
		} else {
			html += "<img src=\"images/bt_delete2_blank.gif\" align=\"top\" border=\"0\">";
		}
		html += "</td>";
		html += '<td>';

		var flagRedFont = false;
		if (context.flagExists == true && configEntry.required && (configEntry.valueOriginal == null || configEntry.valueOriginal.length == 0)) flagRedFont = true;
		if (configEntry.shouldDisplayInvalidValue()) flagRedFont = true;
		if (flagRedFont) {
			html += "<font color='red'>";
		}
		if ((configEntry.isDeleted == false && configEntry.flagValueExists == true) || (configEntry.required == true && context.flagExists == true)) {
			html += "<b>";
		}
		if (configEntry.required == true) html += "*";
		html += configEntry.name
		if ((configEntry.isDeleted == false && configEntry.flagValueExists == true) || (configEntry.required == true && context.flagExists == true)) {
			html += "</b>"; 
		}
		if (flagRedFont) {
			html += "</font>";
		}
		html += "</td>";
		html += '<td><img src="images/spacer.gif" alt="" width="130" height="1" border="0" align="top"><br clear="all">\n';
		html += this.getHtmlDataEntry(configEntry, configEntry.id, true);
		html += "</td>";
		html += "<td>" + configEntry.getHelp() + "</td>";
		html += "</tr>";

		if (configEntry.shouldDisplayInvalidValue()) {
			html += "<tr><td></td><td colspan=2>";
			html += this.dataEntryHtmlInvalidValue(configEntry);
			html += "</td></tr>";
		}

		return html;
	}
	function uiGetHtmlConfigOptions() {
		var html = "";
		if (this.appManager.getContext() && this.appManager.getContext().name) {
			html += this.getHtmlBlueHeaderBlock(this.appManager.getContext().name);
		}

		if ( this.appManager && this.appManager.state && this.appManager.state.config_optionsContext) {
			if ((this.appManager.state.config_optionsContext.entries && this.appManager.state.config_optionsContext.entries.length > 0 ) || ( this.appManager.state.config_optionsContext.optionChildren != null && this.appManager.state.config_optionsContext.optionChildren.length > 0)) {
				html += '<form id="configForm" onsubmit="return false;">';

				if ( this.appManager.state.config_optionsContext.entries && this.appManager.state.config_optionsContext.entries.length > 0 ) {
					html += '<table border="0" cellpadding="3" style="clear:both">';

					this.configElementMap = new Object();

					var totalDisplayed = 0;
					var entries = this.appManager.state.config_optionsContext.entries;
					for (var i=0; i < entries.length; i++) {
						if (entries[i].isContextSwitch) continue;
						if (entries[i].isDeprecated) continue;
						if (entries[i].isUserHidden) continue;
						html += this.getHtmlConfigEntry(this.appManager.state.config_optionsContext, entries[i]);
						this.configElementMap[entries[i].id] = entries[i];
						totalDisplayed++;
					}
					if (totalDisplayed > 0) {
						html += '<tr><td></td><td><a href="javascript:appManager.uiManager.clickApply();"><img src="images/bt_apply.gif" alt="Apply" width="59" height="19" name="apply"></a></td><td></td></tr>';
					}
					html += "</table>";
				}
				if ( this.appManager.state.config_optionsContext.optionChildren != null && this.appManager.state.config_optionsContext.optionChildren.length > 0 ) {
					html += '<table border="0" cellspacing="0" cellpadding="3">';
					for (var i=0; i < this.appManager.state.config_optionsContext.optionChildren.length; i++) {
						var child = this.appManager.state.config_optionsContext.optionChildren[i];
						if (child.isUserHidden == true || child.isDeleted == true) continue;
						this.configElementMap[child.id] = child;
						html += '<tr>';
						html += '<td>';
						html += this.getHtmlDataEntry(child, child.id, true);
						html += '</td>';
						html += '<td>';
						html += '<a href="javascript:appManager.uiManager.clickRemove(\'' + child.id + '\');"><img src="images/bt_delete.gif" alt="Delete" width="61" height="17"></a>';
						html += '</td>';
						html += '</tr>';
						if (child.shouldDisplayInvalidValue()) {
							html += "<tr>";
							html += "<td colspan=2>";
							html += this.dataEntryHtmlInvalidValue(child);
							html += "</td>";
							html += "</tr>";
						}
					}
					html += '<tr><td><a href="javascript:appManager.uiManager.clickApplyRename();"><img src="images/bt_apply.gif" alt="Apply" name="apply" width="59" height="19"></a></td><td></td></tr>';
					html += '</table>';
				}
				html += '</form>';
			}
			

			if ( this.appManager.state.config_optionsContext.optionAdd != null && this.appManager.state.config_optionsContext.optionAdd.length > 0 ) {
				if ( this.appManager.state.config_optionsContext.optionChildren != null ) {
					html += this.dividerHtml();
				}
				html += '<form name="add" id="addForm" onsubmit="appManager.uiManager.clickAdd(); return false;">';
				html += '<table border="0" cellspacing="0" cellpadding="3">';
				for (var i = 0; i < this.appManager.state.config_optionsContext.optionAdd.length; i++) {
					var item = this.appManager.state.config_optionsContext.optionAdd[i];
					html += '<tr><td>' + this.getHtmlDataEntry(item, "add_" + item.templateId, false) + '</td>\n';
					html += '<td><a href="javascript:appManager.uiManager.clickAdd(\'' + item.templateId + '\');"><img src="images/bt_add.gif" alt="Add" width="49" height="17"></a></td>\n';
					html += '<td>' + item.getHelp() + '</td></tr>\n';
				}
				html += '</table>';
				html += '</form>';
			}
		}

		if (this.appManager.state.contextTree && this.appManager.state.contextTree.currentNode && this.appManager.state.contextTree.currentNode != this.appManager.state.contextTree.rootNode) {
			html += this.dividerHtml();
			if (this.appManager.state.contextTree.currentNode.doesExist()) {
				html += this.getHtmlRemoveContext(this.appManager.state.contextTree.currentNode);
			} else {
				html += this.getHtmlAddContext(this.appManager.state.contextTree.currentNode);
			}
		}


		if (this.appManager.state.ifUncommittedChanges()) {
			html += this.dividerHtml();
			html += this.getHtmlMods();
		}

		return html;
	}
	function uiGetHtmlConfirmCommit() {
		var html = this.getHtmlMods();
		html += "<p>\n";
		var totalNodesInvalid = appManager.state.getTotalNodesInvalid();
		if ( totalNodesInvalid > 0 || appManager.getSessionInvalidState() ) {
			if (appManager.getSessionInvalidState()) {
				html += this.invalidStateMessage;
				if (totalNodesInvalid > 0) {
					html += "<p>In addition, ";
					html += totalNodesInvalid;
					html += " are invalid.";
				}
			} else if (totalNodesInvalid > 0) {
				html += "<b>Please resolve ";
				html += totalNodesInvalid;
				html += " invalid ";
				if (totalNodesInvalid == 1) html += "node"; else html += "nodes";
				html += " before committing.</b>\n";
			}
		} else {
			html += "<center>\n";
			html += "<a href=\"javascript:appManager.uiManager.clickConfirmCommit();\">";
			html += "<img src=\"images/bt_confirm_commit.gif\" alt=\"Confirm Commit\">";
			html += "</a>\n";
			html += "</center>\n";
		}
		return html;
	}
	function uiGetHtmlDataEntry(dataEntry, fieldName, flagTrapChanges) {
		var html = "";
		var name = fieldName;
		if ( typeof(name) == "undefined" ) name = dataEntry.name;

		var text_class = "text_field";

		if (dataEntry.allowed_ops && dataEntry.allowed_ops.length > 0) {
			html += "<select name='op_" + name + "' class='op_field'";
			if (flagTrapChanges) html += " onChange='appManager.uiManager.checkApply();'";
			html += ">\n";
			html += "<option value=''></option>";
			for (var i = 0; i < dataEntry.allowed_ops.length; i++) {
				html += "<option value='" + dataEntry.allowed_ops[i] + "'";
				if (dataEntry.allowed_ops[i] == dataEntry.opNew) html += " selected";
				html += ">" + dataEntry.allowed_ops[i] + "</option>";
			}
			html += "</select>\n";
			text_class = "text_field_s";
		}

		var value = "";
		if (dataEntry.flagDefExists) value = dataEntry.def;
		if (dataEntry.flagValueExists && !dataEntry.isDeleted) value = dataEntry.valueOriginal;
		if (dataEntry.allowed_items && dataEntry.allowed_items.length > 0) {
			html += '<select name="' + name + '" id="' + dataEntry.id + '" class="' + text_class + '"';
			if (flagTrapChanges) html += ' onChange="appManager.uiManager.checkApply();"';
			html += '>\n';
			if (dataEntry.flagDefExists == false) {
				html += '<option value=""';
				if (dataEntry.flagValueExists == false) html += ' selected'; 
				html += '> -- none -- \n';
			}
			for (var i = 0; i < dataEntry.allowed_items.length; i++) {
				html += '<option value="' + dataEntry.allowed_items[i].value + '"';
				if ((dataEntry.flagValueExists == true && dataEntry.allowed_items[i].value == value) || (dataEntry.flagValueExists == false && dataEntry.flagDefExists == true && dataEntry.allowed_items[i].value == dataEntry.def)) {
					html += ' selected';
				}
				html += '>' + xguGetStrEscapedAmpersand(dataEntry.allowed_items[i].value) + '\n';
			}
			html += '</select>\n';
		} else {
			if ( ( dataEntry.type == "text" ) || ( dataEntry.type == "uint" ) || ( dataEntry.type == "macaddr" ) ||
				 ( dataEntry.type == "IPv4" ) || ( dataEntry.type == "IPv4Net" ) ||
				 ( dataEntry.type == "IPv6" ) || ( dataEntry.type == "IPv6Net" ) ||
				 ( dataEntry.type == "URL_TFTP" ) )
			{
				html += '<input type="text" name="' + name + '" id="' + dataEntry.id + '"';
				if ( value != null ) {
					html += ' value="';
					html += xguGetStrEscapedAmpersand(value);
					html += '"';
				}
				if (flagTrapChanges) html += ' onKeyUp="appManager.uiManager.checkApply();"';
				html += (' class="' + text_class + '">');
			} else if ( dataEntry.type == "bool" ) {

				html += '<select name="' + name + '" id="' + dataEntry.id + '" class="' + text_class + '"';
				if (flagTrapChanges) html += ' onChange="appManager.uiManager.checkApply();"';
				html += '>\n';

				if (!dataEntry.flagDefExists || !dataEntry.flagValueExists) {
					html += '<option value=""';
					if (dataEntry.flagValueExists == false) html += ' selected'; 
					html += '>\n';
				}

				html += '<option value="true"';
				if (dataEntry.flagValueExists && value == "true") html += ' selected';
				html += '>yes/true\n';

				html += '<option value="false"';
				if (dataEntry.flagValueExists && value == "false") html += ' selected';
				html += '>no/false\n';

				html += '</select>\n';
			} else {
				// The data type cannot be determined, so a default text field is used
				html += '<input type="text" name="' + name + '" id="' + dataEntry.id + '"';
				if ( value != null ) {
					html += ' value="';
					html += xguGetStrEscapedAmpersand(value);
					html += '"';
				}
				if (flagTrapChanges) html += ' onKeyUp="appManager.uiManager.checkApply();"';
				html += ' class="' + text_class + '">';
			}
		}
		return html;
	}
	function uiGetHtmlModEntries(entries) {
		var html = "";
		for (var i=0; i < entries.length; i++) {
			html += entries[i].path;
			html += '<br>';
		}
		return html;
	}
	function uiGetHtmlMods() {
		var html = "";
		html += this.getHtmlBlueHeaderBlock("Uncommitted&nbsp;Changes:");			

		if (this.appManager.state.mods_rootSegment) {
			html += "<p style='overflow-x:auto'>\n";
			html += this.getHtmlModsSegment(0, this.appManager.state.mods_rootSegment);
			html += "<p>\n";
		}

		return html;
	}
	function uiGetHtmlModsSegment(level, segment) {
		var indent = "";
		for (var i = 0; i < level; i++) indent += "&nbsp;&nbsp;";

		var children = null;
		if (segment.segment) {
			var children = segment.segment;
			if (children.constructor != Array) children = new Array(children);
		}

		var html = "";

		if (segment.multi_ch && segment.multi_ch == "true" && children && children.length > 0) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				var sign = this.getHtmlModsSegmentSign(child);
				if (level > 0) html += sign;
				html += indent;
				var spanclass = null;
				if ((segment.invalid && segment.invalid == "true") || (child.invalid && child.invalid == "true")) spanclass = "error";
				if ((segment.miss_req && segment.miss_req == "true") || (child.miss_req && child.miss_req == "true")) spanclass = "error";
				if (spanclass) html += ("<span class='" + spanclass + "'>");
				if (segment.name) {
					html += segment.name;
					html += "&nbsp;";
				}
				if (child.name) {
					html += child.name;
				}
				if (spanclass) html += "</span>";
				if (child.segment) {
					var child_children = child.segment;
					if (child_children.constructor != Array) child_children = new Array(child_children);
					html += this.getHtmlModsSegmentChildren(sign, indent, level, child_children);
				}
				html += "<br>\n";
			}
		} else {
			var sign = this.getHtmlModsSegmentSign(segment);
			if (level > 0)  html += sign;
			html += indent;
			if (segment.name) {
				var spanclass = null;
				if (segment.invalid && segment.invalid == "true") spanclass = "error";
				if (segment.miss_req && segment.miss_req == "true") spanclass = "error";
				if (spanclass) html += ("<span class='" + spanclass + "'>");
				html += segment.name;
				if (segment.value && segment.value.length > 0) {
					html += ":&nbsp;\"";
					html += segment.value;
					html += "\"";
				}
				if (spanclass) html += "</span>";
				html += "&nbsp;";
			}

			if (children && children.length > 0) {
				html += this.getHtmlModsSegmentChildren(sign, indent, level, children);
			}
			html += "<br>\n";
		}

		return html;
	}
	function uiGetHtmlModsSegmentChildren(sign, indent, level, children) {
		var html = "";
		if (level > 0) {
			html += "{";
			html += "<br>\n";
		}

		if (children) {
			for (var i = 0; i < children.length; i++) {
				html += this.getHtmlModsSegment(level + 1, children[i]);
			}
		}

		if (level > 0) {
			html += sign;
			html += indent;
			html += "}";
		}

		return html;
	}
	function uiGetHtmlModsSegmentSign(segment) {
		var sign = "<img src='images/mab.gif' border='0'>";
		if (segment && segment.mod && segment.mod.length > 0) {
			if (segment.mod == "added" || segment.mod == "changed") sign = "<img src='images/maac.gif' border='0'>";
			if (segment.mod == "deleted" || segment.mod == "missing") sign = "<img src='images/mad.gif' border='0'>";
		}
		return sign;
	}
	function uiGetHtmlOpStatus(results) {
		var strDisplay = "operation";
		if (results.brief && results.brief.cached_cmd_line && results.brief.cached_cmd_line.length > 0) {
			strDisplay = results.brief.cached_cmd_line;
		}

		var flagStopped = false;
		if ( results.brief.doneMsg != null ) {
			if (results.brief.doneMsg.indexOf("terminated with signal 9.") > 0) {
				flagStopped = true;
			}
		}

		var html = "";
		html += this.getHtmlBlueHeaderBlock(strDisplay);
		html += "<p>\n";

		if (results.brief.done == true) {
			if (flagStopped == true) {
				html += "Warning&nbsp;&nbsp;Execution&nbsp;stopped.";
			} else {
				if (results.brief.doneSuccess == true) {
					html += "OK&nbsp;&nbsp;Execution&nbsp;completed&nbsp;successfully.";
				} else {
					html += "Error:&nbsp;&nbsp;Execution&nbsp;completed&nbsp;unsuccessfully.";
				}
			}
		} else {
			if (results.brief.could_not_start == true) {
				html += "Error:&nbsp;&nbsp;Could&nbsp;not&nbsp;start&nbsp;operation.";
			} else {
				html += "Executing...&nbsp;&nbsp;";
	
				if (results.brief.kill_invoked) {
					html += "(Stop&nbsp;invoked)";
				} else {
					if ( !results.brief.done ) html += "<a href=\"javascript:appManager.killOperation('" + results.brief.execId + "')\">Stop</a>";
				}
			}
		}
		html += "<br>(";
		html += results.brief.totalLines;
		html += "&nbsp;lines)";
		html += "\n<p>\n";

		return html;
	}
	function uiGetHtmlRemoveContext(context) {
		var html = "";
		html += '<p><a href="javascript:appManager.uiManager.clickRemoveContext(\'' + context.id + '\');">';
		html += '<img src="images/bt_delete.gif" alt="Delete ' + context.name + '" width="61" height="17">';
		html += '</a></p>';
		return html;
	}
	function uiGetHtmlTreeNode(node, level, menu) {
		if (menu) {
			var elementMap = menu.elementMap;
			elementMap[node.id] = node;
		} else {
			this.contextElementMap["" + node.id] = node;
		}

		var isBold = false;
		var isSelected = false;

		if (node.parent == null) isBold = true;

		if (menu) {
			isSelected = ((appManager.state.activeMenu == menu.tree) && (menu.tree.selectedEntry == node));
			isBold = isBold || (node.value != null);
			isBold = isBold || (this.getOpCorridorEnd(node) != null);
		} else {
			var nodeCurrent = appManager.getContext();
			isSelected = ((appManager.state.activeMenu == appManager.state.contextTree) && (nodeCurrent) && (node.id == nodeCurrent.id));
			isBold = isBold || ((parseInt(node.configId, 16) > 0) && !node.isDeleted);
		}

		var arrow = null;
		var onClickArrow = null;
		var onClickName = null;

		if (menu) {
			if (node.showChildren && node.hasChildren()) {
				arrow = "../images/tao.gif";
				onClickArrow  = "appManager.uiManager.clickCloseMenu('" + menu.id + "', '" + node.id + "');";
				onClickName   = "appManager.uiManager.clickOperation('" + menu.id + "', '" + node.id + "');";
			} else if (node.hasChildren()) {
				arrow = "../images/tac.gif";
				onClickArrow  = "appManager.uiManager.clickOpenMenu('" + menu.id + "', '" + node.id + "');";
				onClickName   = "appManager.uiManager.clickOperation('" + menu.id + "', '" + node.id + "');";
			} else if (node.type == EntryType.OPERATION) {
				arrow = "../images/tab.gif";
				onClickArrow  = null;
				onClickName   = "appManager.uiManager.clickOperation('" + menu.id + "', '" + node.id + "');";
			} else if (node.type == EntryType.EVENT) {
				arrow = "../images/tab.gif";
				onClickArrow  = null;
				onClickName   = "appManager.uiManager.clickEvent('" + menu.id + "', '" + node.id + "');";
			}
		} else {
			if (node.showChildren && node.hasChildren()) {
				arrow = "../images/tao.gif";
				onClickArrow = "appManager.uiManager.clickCloseContext('" + node.id + "');";
				onClickName = "appManager.uiManager.clickContext('" + node.id + "');";
			} else if (node.hasChildren()) {
				arrow = "../images/tac.gif";
				onClickArrow = "appManager.uiManager.clickOpenContext('" + node.id + "');";
				onClickName = "appManager.uiManager.clickContext('" + node.id + "');";
			} else {
				arrow = "../images/tab.gif";
				onClickArrow = null;
				onClickName = "appManager.uiManager.clickContext('" + node.id + "');";
			}
		}

		var html = this.getHtmlTreeNode2(level, node.name, isBold, isSelected, (node.errorSub || node.errorHere), arrow, onClickArrow, onClickName);

		if ( node.showChildren && node.hasChildren() ) { 
			for (var i=0; i < node.children.length; i++) {
				html += this.getHtmlTreeNode(node.children[i], level + 1, menu);
			}
		}

		return html;
	}
	function uiGetHtmlTreeNode2(level, strName, isBold, isSelected, hasError, strArrow, strOnClickArrow, strOnClickName) {
		var strDiv = "nti";
		if (isSelected) strDiv = "ntis";

		if (strArrow == null) strArrow = "../images/tab.gif";

		var html = "";
		html += "<tr><td nowrap>";
		html += "<div id=\"" + strDiv + "\">";

		for (var i = 0; i < level; i++) {
			html += "&nbsp;&nbsp;";
		}

		if (strOnClickArrow) html += "<a href=\"javascript:" + strOnClickArrow + "\">";
		html += "<img src=\"" + strArrow + "\">";
		if (strOnClickArrow) html += "</a>";

		html += "&nbsp;";

		if (hasError) html += "<font color='red'>(!)</font>";

		if (isBold) html += "<b>";

		if (strOnClickName) html += "<a href=\"javascript:" + strOnClickName + "\">";
		html += escapeXml(strName);
		if (strOnClickName) html += "</a>";

		if (isBold) html += "</b>";

		html += "</div>";
		html += "</td></tr>\n";

		return html;		
	}
	function uiGetOpCorridorEnd(node) {
		if ((node.children == null || node.children.length == 0) && node.value != null) return node;
		if (node.children.length == 1 && node.value == null) {
			return this.getOpCorridorEnd(node.children[0]);
		} else {
			return null;
		}
	}
	function uiHideConfigureContent() {
		document.getElementById("configArea").style.display = "none";
	}
	function uiHideMenus() {
		document.getElementById('logo').src = "images/logo_no_bt.gif";
		document.getElementById('contextArea').innerHTML = "";
		document.getElementById('operationMenuArea').innerHTML = "";
		document.getElementById('toolMenuArea').innerHTML = "";
		document.getElementById('supportArea').innerHTML = "";
	}
	function uiHideOperationContent() {
		document.getElementById("operationResultArea").style.display = "none";
	}
	function uiInit(appManager) {
		this.appManager = appManager;
		this.createMenuVyattaSupport();
	}
	function uiNetworkStatusHtml(net) {
		var html = "";
		html += '<tr><td align="right">';
		html += net.packets;
		html += '</td>';
		html += '<td align="left">packets</td></tr>';
		html += '<tr><td align="right">';
		html += net.bytes;
		html += '</td>';
		html += '<td align="left">bytes</td></tr>';
		html += '<tr><td align="right">';
		html += net.drop;
		html += '</td>';
		html += '<td align="left">dropped</td></tr>';
		html += '<tr><td align="right">';
		html += net.errs;
		html += '</td>';
		html += '<td align="left">errors</td></tr>';
		return html;
	}
	function uiRenameConfigHtml(context) {
		var html = "";
		html += '<p><a href="javascript:appManager.uiManager.clickRename(\'' + context.id + '\');"><img src="images/bt_rename.gif" alt="Rename" width="70" height="17"></a></p>';
		return html;
	}
	function uiRequestOperationArgs(operation) {
		this.showOperationContent();
		var operationName = operation.name;
		var requiredCount = operation.argsNeeded;
		var mainOperation = operation.mainOperation;
		if ( mainOperation != null ) {
			operationName = mainOperation.name;
			requiredCount = mainOperation.argsNeeded;
		}
		operationName = escapeXml(operationName);
		var html = "";

		html += this.getHtmlBlueHeaderBlock(operationName);
		html += '<p>';
		html += '<form name="operationArgs" id="operationArgsForm" onsubmit="return false;">';


		if (operation.help) {
			html += "<pre>";
			html += operation.help;
			html += "</pre>";
			html += '<p>';
		}
		if (operation.args.length > 0) {
			html += 'Operation Arguments<br>';
			for (var i=0; i < operation.args.length; i++) {
				var arg = operation.args[i];
	
				if ( i == requiredCount ) {
					html += 'Optional Arguments<br>';
				}

				if (arg.allowed_items && arg.allowed_items.length && arg.allowed_items.length > 0) {
					html += '<select id="firstOperationArg" name="' + arg.num + '" class="text_field">\n';
					for (var j = 0; j < arg.allowed_items.length; j++) {
						var allowed_item = arg.allowed_items[j];
						if (allowed_item) {
							html += '<option value="';
							html += allowed_item;
							html += '">';
							html += allowed_item;
							html += '\n';
						}
					}
				} else {
					html += '<input id="firstOperationArg" name="' + arg.num + '" type="text" maxlength="40" class="text_field">\n';
				}
				html += '&nbsp;&nbsp;';
				if (arg.flagNoValues == true) html += 'No&nbsp;matches&nbsp;for&nbsp;';
				html += escapeXml(arg.name) + '<br>';
			}
			html += '<p>';
		}
		html += '<a href="javascript:appManager.uiManager.submitOperationArgs(\'' + operation.commandId + '\');"><img src="images/bt_execute.gif" alt="Execute" width="59" height="19" hspace="0" vspace="0" border="0"></a></br>';
		html += '</form>';
		document.getElementById("operationResultArea").innerHTML = html;
		setTimeout('focusById("firstOperationArg");', 800);
	}
	function uiSetMarginWidth() {
		if (this.palettesCollapsed == true) {
			document.getElementById("left_content").style.right = "52px";
			document.getElementById("right_content").style.display = "block";
			document.getElementById("right_content").style.right = "10px";
			document.getElementById("right_content").style.width = "33px";

			document.getElementById('status_div').style.display='none';
			document.getElementById('status_collapsed').style.display='block';
			document.getElementById('tools_div').style.display='none';
			document.getElementById('tools_collapsed').style.display='block';
		} else if (this.palettesCollapsed == false) {
			document.getElementById("left_content").style.right = "256px";
			document.getElementById("right_content").style.display = "block";
			document.getElementById("right_content").style.right = "10px";
			document.getElementById("right_content").style.width = "237px";

			document.getElementById('status_div').style.display='block';
			document.getElementById('status_collapsed').style.display='none';
			document.getElementById('tools_div').style.display='block';
			document.getElementById('tools_collapsed').style.display='none';
		} else {
			document.getElementById("left_content").style.right = "5px";
			document.getElementById("right_content").style.display = "none";
		}
	}
	function uiShowConfigureContent() {
		this.hideOperationContent();
		document.getElementById("configArea").style.display = "inline";
	}
	function uiShowOperationContent() {
		this.hideConfigureContent();
		document.getElementById("operationResultArea").style.display = "inline";
	}
	function uiSubmitOperationArgs(commandId) {
		var form = document.getElementById("operationArgsForm");
		var args = this.collectFormFields(form);
		appManager.startOperationWithArgs(args, commandId);
	}
	function uiSubmitRename(id) {
		var context = this.contextElementMap["" + id];
		var form = document.getElementById("renameForm");
		var renameFields = this.collectFormFields(form);
		renameFields.config_id = context.configId;
		appManager.renameConfig(renameFields);
	}
	function uiSubmitTool(id) {
		var tool = this.toolElementMap["" + id];
		var form = document.getElementById("toolsForm");
		var fields = this.collectFormFields(form);
		var args = new Object();
		args["2"] = fields[tool.id];
		appManager.state.activeMenu = "toolPalette";
		appManager.startTool(tool, args);
	}
	function uiSubmitToolKeyPress(id, e) {
		var key = window.event ? e.keyCode : e.which;
		if (key == 13) this.submitTool(id);
	}
	function uiToolMenuHtml(tools) {
		var html = "";
		html += uiMenuHtml(tools, tools.root, 0);
		return html;
	}
	function uiToolsHtml(tools) {
		var html = "";
		html += '<form name="tools" id="toolsForm" onsubmit="return false;">';
		for (var i=0; i < tools.entries.length; i++) {
			var tool = tools.entries[i];
			html += '<div class="tools_detail">';
			html += '<table border="0" width="100%" cellspacing="0" cellpadding="2">';
			html += '<tr><td colspan="2" align="left">' + tool.name + '</td></tr>';
			html += '<tr>';
			html += '<td align="left"><input name="' + tool.id + '" type="text" style="width:136px;" maxlength="40" class="text_field" onKeyPress="javascript:appManager.uiManager.submitToolKeyPress(\'' + tool.id + '\', event)"></td>';
			html += '<td><a href="javascript:appManager.uiManager.submitTool(\'' + tool.id + '\')"><img src="images/bt_go.gif" alt="Go" width="34" height="19"></a></td>';
			html += '</tr>';
			html += '</table>';
			html += '</div>';
			this.toolElementMap[tool.id] = tool;
		}
		html += '</form>';
		return html;
	}


	// Function Declarations
	this.checkApply = uiCheckApply;
	this.clearConfigDisplay = uiClearConfigDisplay;
	this.clearDisplay = uiClearDisplay;
	this.clearOperationDisplay = uiClearOperationDisplay;
	this.collapsePalettes = uiCollapsePalettes;
	this.createMenuOperations = uiCreateMenuOperations;
	this.createMenuTools = uiCreateMenuTools;
	this.createMenuVyattaSupport = uiCreateMenuVyattaSupport;
	this.dataEntryHtmlInvalidValue = uiDataEntryHtmlInvalidValue;
	this.displayConfig = uiDisplayConfig;
	this.displayConfigOptions = uiDisplayConfigOptions;
	this.displayWelcome = uiDisplayWelcome;
	this.displayCommitStatus = uiDisplayCommitStatus;
	this.displayError = uiDisplayError;
	this.displayExecs = uiDisplayExecs;
	this.displayLoadStatus = uiDisplayLoadStatus;
	this.displayLoginStatus = uiDisplayLoginStatus;
	this.displayMenu = uiDisplayMenu;
	this.displayMenuContext = uiDisplayMenuContext;
	this.displayMenus = uiDisplayMenus;
	this.displayMessage = uiDisplayMessage;
	this.displayMessageChangesApplied = uiDisplayMessageChangesApplied;
	this.displayMessageHtml = uiDisplayMessageHtml;
	this.displayOperationResults = uiDisplayOperationResults;
	this.displayRename = uiDisplayRename;
	this.displaySaveStatus = uiDisplaySaveStatus;
	this.displayStatus = uiDisplayStatus;
	this.displayStatusCPU = uiDisplayStatusCPU;
	this.displayTOWarning = uiDisplayTOWarning;	
	this.dividerHtml = uiDividerHtml;
	this.expandPalettes = uiExpandPalettes;
	this.getHtmlAddContext = uiGetHtmlAddContext;	
	this.getHtmlBlueHeaderBlock = uiGetHtmlBlueHeaderBlock;
	this.getHtmlConfigEntry = uiGetHtmlConfigEntry;
	this.getHtmlConfigOptions = uiGetHtmlConfigOptions;
	this.getHtmlConfirmCommit = uiGetHtmlConfirmCommit;
	this.getHtmlDataEntry = uiGetHtmlDataEntry;
	this.getHtmlModEntries = uiGetHtmlModEntries;
	this.getHtmlMods = uiGetHtmlMods;
	this.getHtmlModsSegment = uiGetHtmlModsSegment;
	this.getHtmlModsSegmentChildren = uiGetHtmlModsSegmentChildren;
	this.getHtmlModsSegmentSign = uiGetHtmlModsSegmentSign;
	this.getHtmlOpStatus = uiGetHtmlOpStatus;
	this.getHtmlRemoveContext = uiGetHtmlRemoveContext;
	this.getHtmlTreeNode = uiGetHtmlTreeNode;
	this.getHtmlTreeNode2 = uiGetHtmlTreeNode2;
	this.getOpCorridorEnd = uiGetOpCorridorEnd;
	this.hideConfigureContent = uiHideConfigureContent;
	this.hideMenus = uiHideMenus;
	this.hideOperationContent = uiHideOperationContent;
	this.init = uiInit;
	this.networkStatusHtml = uiNetworkStatusHtml;
	this.renameConfigHtml = uiRenameConfigHtml;
	this.requestOperationArgs = uiRequestOperationArgs;
	this.setMarginWidth = uiSetMarginWidth;
	this.showConfigureContent = uiShowConfigureContent;
	this.showOperationContent = uiShowOperationContent;
	this.submitOperationArgs = uiSubmitOperationArgs;
	this.submitRename = uiSubmitRename;
	this.submitTool = uiSubmitTool;
	this.submitToolKeyPress = uiSubmitToolKeyPress;
	this.toolMenuHtml = uiToolMenuHtml;
	this.toolsHtml = uiToolsHtml;


	// Event Handlers
	this.clickAdd = uiClickAdd;
	this.clickAddContext = uiClickAddContext;
	this.clickApply = uiClickApply;
	this.clickApplyRename = uiClickApplyRename;
	this.clickCloseContext = uiClickCloseContext;
	this.clickCloseMenu = uiClickCloseMenu;
	this.clickCommit = uiClickCommit;
	this.clickConfirmCommit = uiClickConfirmCommit;
	this.clickConstrictMenus = uiClickConstrictMenus;
	this.clickContext = uiClickContext;
	this.clickEvent = uiClickEvent;
	this.clickLoad = uiClickLoad;
	this.clickLoadFilespec = uiClickLoadFilespec;
	this.clickLogin = uiClickLogin;
	this.clickLogout = uiClickLogout;
	this.clickOpenContext = uiClickOpenContext;
	this.clickOpenMenu = uiClickOpenMenu;
	this.clickOperation = uiClickOperation;
	this.clickRemove = uiClickRemove;
	this.clickRemoveContext = uiClickRemoveContext;
	this.clickRename = uiClickRename;
	this.clickRevert = uiClickRevert;	
	this.clickSave = uiClickSave;
	this.clickSaveFilespec = uiClickSaveFilespec;
	this.confirmRemove = uiConfirmRemove;


	// Data Collection Methods
	this.addNodeListToArray = uiAddNodeListToArray;
	this.collectField = uiCollectField;
	this.collectFormFields = uiCollectFormFields;
	this.findFormValue = uiFindFormValue;


	// Variable Initialization
	this.appManager = null;
	this.configElementMap = null;
	this.contextElementMap = null;
	this.menuMap = new Object();
	this.operationElementMap = null;
	this.palettesCollapsed = false;
	this.toolElementMap = null;

	this.invalidStateMessage = "<b>This configuration cannot be committed due to invalid session state with the xorp_rtrmgr.  To resolve this problem, save this configuration to file, and commit it from a new session.</b>";

	return this;
}

function Menu() {

	this.tree = null;
	this.elementMap = new Object();

	return this;
}

function focusById(id) {
	var element = document.getElementById(id);
	if ( element != null ) element.focus();
}

function notImplemented() {
	alert("Not yet implemented");
}

