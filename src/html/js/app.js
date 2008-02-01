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
 *  Module:           app.js
 *
 *  Original Author:  DHAP Digital, Inc.  Douglas Good & others
 *  Other Author(s):  Marat Nepomnyashy
 *  Date:             2006
 *  Description:      AJAX JavaScript file for application-level functionality
 *
 */


/*
 * Originally created by DHAP Digital, Inc.
 * http://www.dhapdigital.com/
 */

function AppManager() {

	// Main application Functions & server callback functions

	function amAddConfig(template_id, value) {
		if ( ! this.allowChanges() ) return;
		this.state.allowChanges = false;

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "add";
		request.context = this.getContext().contextPath();
		request.add = new Object();
		request.add.template_id = template_id;
		request.add.value = value;
		request.responseCallback = this.addConfigCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amAddConfigCallback(response) {
		appManager.state.allowChanges = true;
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.processPhase(response);
		appManager.processContext(response, true);

		var newContextName = response.serverRequest.add.value;
		var context = appManager.getContext();
		if (context.children != null) {
			for (var i = 0; i < context.children.length; i++) {
				var child = context.children[i];
				if (child.name == newContextName) {
					child.showChildren = true;
					appManager.changeContext(child);
					break;
				}
			}
		}
	}
	function amAddOrRemoveContext(context, flagAddOrRemove) {
		if ( ! this.allowChanges() ) return;
		this.state.allowChanges = false;

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		if (flagAddOrRemove == true) request.action = "add_context"; else request.action = "remove_context";
		request.context = context.contextPath();
		request.responseCallback = this.addOrRemoveContextCallback;
		this.serverManager.sendServerRequest(request);
	}
	function amAddOrRemoveContextCallback(response) {
		appManager.state.allowChanges = true;
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.processPhase(response);
		appManager.processContext(response, true);
	}
	function amAnalyzeCommitStatus(response) {
		if (response && response.rl && response.rl.session && response.rl.session.status) {
			appManager.setChangesInvalid(response.rl.session.status.config_invalid);
			appManager.setChangesNotCommitted(response.rl.session.status.config_changed);
			appManager.setInvalidState(response.rl.session.status.invalid_state);

			var totalConfigChanges = response.rl.session.status.total_config_changes;
			if (appManager.state.totalConfigChanges != totalConfigChanges) {
				appManager.state.flagReloadOps = true;
				appManager.state.totalConfigChanges = totalConfigChanges;
			}
		}
		appManager.uiManager.displayCommitStatus();
	}
	function amApplyConfigOptions(configFields) {
		if ( ! this.allowChanges() ) return;

		this.updateConfigOptionValues(configFields);

		var modEntries = this.state.config_optionsContext.modifiedEntries();
		if ( modEntries.length == 0 ) return;

		var request = new ServerRequest();
		request.sessionId = this.state.sessionId;
		request.action = "set_rd";
		request.context = this.getContext().contextPath();

		this.state.allowChanges = false;

		var nodes = new Array();
		for (var i=0; i < modEntries.length; i++) {
			var configEntry = modEntries[i];
			var node = new Object();
			node.template_id = configEntry.templateId;
			node.value = configEntry.valueNew;
			node.op = configEntry.opNew;
			nodes.push(node);
		}

		request.nodes = nodes;
		request.responseCallback = this.applyConfigOptionsCallback;
		appManager.uiManager.clearDisplay();
		this.serverManager.sendServerRequest(request);
	}

	function amApplyConfigOptionsCallback(response) {
		appManager.state.allowChanges = true;

		appManager.processPhase(response);
		appManager.processContext(response, true);

		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
		} else {
			appManager.uiManager.displayMessageChangesApplied();
		}
	}

	function amChangeContext(node) {
		if ( ! this.allowChanges() ) return;

		this.state.activeMenu = this.state.contextTree;

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "ch_context";
		if (node != null) request.context = node.contextPath();
		request.responseCallback = this.changeContextCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amChangeContextCallback(response) {
		appManager.state.allowChanges = true;
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.processPhase(response);
		appManager.processContext(response, true);
		
		var config_optionsContext = appManager.state.config_optionsContext;
		if (config_optionsContext && (config_optionsContext.entries.length == 0) && (config_optionsContext.optionChildren == null)) {
			var context = appManager.getContext();
			if (context && ((context.children.length == 1) || ((context.children.length > 0) && (context.children[0].childForecast == 0)))) {
				var newContext = context.children[0];
				newContext.showChildren = true;
				appManager.changeContext(newContext);
			}
		}
	}
	function amCheckConfigOptions(configFields) {
		this.updateConfigOptionValues(configFields);
		var modEntries = this.state.config_optionsContext.modifiedEntries();
		return ( modEntries.length > 0 );
	}
	function amCommit(node) {
		if ( ! this.allowChanges() ) return;
		this.state.allowChanges = false;

		appManager.uiManager.clearDisplay();

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "commit";
		if (node != null) request.context = node.contextPath();
		request.responseCallback = this.commitCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amCommitCallback(response) {
		appManager.processPhase(response);
		appManager.processContext(response, true);
		appManager.fetchOperations();
	}
	function amExpandContext(node) {
		if ( ! this.allowChanges() ) return;

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "ch_context";
		request.context = node.contextPath();
		request.responseCallback = this.expandContextCallback;
		this.serverManager.sendServerRequest(request);
	}
	function amExpandContextCallback(response) {
		appManager.state.allowChanges = true;
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}
		appManager.processPhase(response);
		appManager.processContext(response, false);
	}

	function amFetchConfig() {
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "show_config";
		request.responseCallback = this.fetchConfigCallback;
		this.serverManager.sendServerRequest(request);
	}
	function amFetchConfigCallback(response) {
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.uiManager.displayConfig(response.rl.output);
	}

	function amFetchExecsStatus() {
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "execs_status";
		request.responseCallback = this.fetchExecsStatusCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amFetchExecsStatusCallback(response) {
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.processPhase(response);

		var execs = new Array();
		if (response.rl.execs.brief && response.rl.execs.brief.length > 0 && response.rl.session) {
			for (var i = 0; i < response.rl.execs.brief.length; i++) {
				var brief = response.rl.execs.brief[i];
				var bos = new BriefOperationStatus();
				bos.init(brief, response.rl.session);
				execs.push(bos);
			}
		}
		appManager.uiManager.displayExecs(execs);
	}
	function amFetchExecutionStatus(exec_id) {
		if (exec_id == null) return;

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "exec_status";
		request.execStatus = new Object();
		request.execStatus.exec_id = exec_id;
		if (this.state.exec_output && this.state.exec_output[exec_id]) {
			var output = this.state.exec_output[exec_id];
			request.execStatus.output_from = output.length;
		}
		request.execStatus.output_pre = "true";
		request.responseCallback = appManager.updateOperationStatus;
		this.serverManager.sendServerRequest(request);
	}

	function amFetchOperationArgs(operation) {
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "exec_query_name";
		request.execQuery = new Object();
		request.execQuery.name = xguGetStrEscapedAmpersand(operation.name);
		request.responseCallback = this.fetchOperationArgsCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amFetchOperationArgsCallback(response) {
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}
		if ( ! response.rl.exec_query.args ) {
			appManager.uiManager.displayError("Unable to determine argument information for the requested operation.");
		}

		appManager.processPhase(response);

		if (response && response.rl && response.rl.exec_query && response.rl.exec_query.command_id) {
			var operation = appManager.state.operationStore.getOperationById(response.rl.exec_query.command_id);
			operation.initArgs(response);
			if ( operation.args.length > 0 ) {
				appManager.uiManager.requestOperationArgs(operation);
			} else {
				appManager.startOperation(operation);
			}
		}
	}

	function amFetchOperations() {
		appManager.state.flagReloadOps = false;

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "op_commands";
		request.responseCallback = this.fetchOperationsCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amFetchOperationsCallback(response) {
		appManager.processPhase(response);

		var operationStore = new OperationStore();
		operationStore.initStore(response, appManager.state.contextTree);
		appManager.state.operationStore = operationStore;
		appManager.initToolStore();
		appManager.initTreeTools();
		appManager.uiManager.createMenuOperations();
		appManager.uiManager.createMenuTools();
		appManager.uiManager.displayMenus();
	}

	function amInit() {
		this.serverManager.init(this);
		this.uiManager.init(this);
		setInterval('appManager.state.checkTO()', 250);
	}

	function amInitServer() {
		var request = new ServerRequest();
		request.action = "initialize";
		request.context = "";
		request.responseCallback = this.initServerCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amInitServerCallback(response) {
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}
		
		appManager.processPhase(response);
		appManager.processContext(response, true);

		appManager.uiManager.displayLoadStatus();
		appManager.uiManager.displaySaveStatus();
		appManager.uiManager.displayLoginStatus();
		appManager.uiManager.expandPalettes();
		appManager.uiManager.displayWelcome(response);

		appManager.state.allowChanges = true;

		appManager.fetchOperations();

		appManager.pollStatus();
	}

	function amKillOperation(exec_id) {
		if (exec_id == null) return;

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "exec_kill";
		request.execKill = new Object();
		request.execKill.exec_id = exec_id;
		if (this.state.exec_output && this.state.exec_output[exec_id]) {
			var output = this.state.exec_output[exec_id];
			request.execKill.output_from = output.length;
		}
		request.responseCallback = this.killOperationCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amKillOperationCallback(response) {
		appManager.processPhase(response);
		appManager.updateOperationStatus(response);
	}

	function amLoad(filespecFields) {
		var filespec = filespecFields["loadTextBox"];
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "load";
		request.filespec = filespec;

		appManager.uiManager.clearDisplay();

		request.responseCallback = this.loadCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amLoadCallback(response) {
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.processPhase(response);
		appManager.processContext(response, true);
	}

	function amLogin(loginFields) {
		var request = new ServerRequest();
		request.action = "login";
		request.auth = loginFields;
		request.context = "/";
		request.responseCallback = this.loginCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amLoginCallback(response) {
		appManager.state.resetTO();
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.state.sessionId = response.rl.session.id;
		appManager.state.user = response.serverRequest.auth.user;
		appManager.state.pollCount = 0;

		appManager.uiManager.clearConfigDisplay();

		appManager.initServerCallback(response);
	}

	function amLogout() {
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "logout";
//		request.responseCallback = this.logoutCallback;
		request.responseCallback = null;
		this.serverManager.sendServerRequest(request);
	}

	function amLogoutCallback() {
	}

	function amLostSessionCallback(response) {
		window.alert("Your session has expired; please relogin.");
		window.location.reload();
	}

	function amPoll() {
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "ch_context_closest";
		request.context = appManager.getContext().contextPath();
		request.responseCallback = appManager.pollCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amPollCallback(response) {
		appManager.processPhase(response);
		appManager.processContext(response, true);
	}

	function amPollCommit() {
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "ch_context_closest";
		request.context = appManager.getContext().contextPath();
		request.responseCallback = appManager.commitCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amPollInit() {
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "ch_context";
		request.context = "/";
		request.responseCallback = this.initServerCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amPollOperation() {
		this.fetchExecutionStatus(appManager.state.pollExecId);
	}


	function amPollStatus() {
		if (appManager.state.sessionId != null) {
			var request = new ServerRequest();
			request.sessionId = appManager.state.sessionId;
			request.action = "get_system";
			request.responseCallback = appManager.updateStatus;
			this.serverManager.sendServerRequest(request);
		}
	}

	function amPrepareOperationArgs(operation) {
		var args = operation.args;
		if ( args == null ) {
			this.fetchOperationArgs(operation);
			return;
		}
		appManager.uiManager.requestOperationArgs(operation);
	}

	function amProcessContext(response, flagSetContext) {
		appManager.updateContextTree(response, flagSetContext);
		appManager.processSession(response);

		if (flagSetContext) {
			appManager.updateConfigOptions(response);
//			appManager.uiManager.clearDisplay();
			appManager.uiManager.displayConfigOptions();
		}
	}

	function amProcessPhase(response) {
		if (appManager.isLoggedIn() == false) return;
		if (response == null || response.rl == null || response.rl.session == null || response.rl.session.status == null) return;

		appManager.setChangesNotCommitted(response.rl.session.status.config_changed);

		var status = response.rl.session.status.phase;
		if ( status == SessionStatus.INITIALIZING ) {
			appManager.state.resetTO();
			var message = "Initializing...";
			for ( var i=0; i < appManager.state.pollCount; i++ ) {
				message += ".";
			}
			appManager.uiManager.displayMessage(message);
			appManager.state.pollCount++;
			setTimeout("appManager.pollInit();", appManager.operationPollInterval);
		} else if ( status == SessionStatus.IDLE ) {
		} else if ( status == SessionStatus.COMMITTING ) {
		}

		var task = response.rl.session.status.task;
		if (task) {
			if (task.name) {
				if (task.name == "none") {
					appManager.uiManager.displayMessage(null);
				} else {
					if (task.done != null) {
						var message = "";

						if (task.stage != null && task.stage.current != null && task.stage.max != null) {
							var task_unit = task.stage.max / 6;
							var stage = task.stage.current / task_unit;
							if (stage == 0) stage = 1;
							if (stage >= 1 && stage <= 6) {
								message += "<p>";
								message += "<img src=\"images/status_bar_";
								message += stage;
								message += ".gif\"><p>\n";
							}
						}

						if (task.done == "false") {
							message += "Performing task: " + task.name
							message += "<br>";
							for ( var i=0; i < appManager.state.pollCount; i++ ) {
								message += ".";
							}
						} else if (task.done == "true") {
							if (task.error && task.error == "false") {
								message += "Successfully completed task: ";
							} else {
								message += "Error completing task: ";
							}
							message += task.name;
							message += "<p>";
							message += task.message;
							message += "<p>";
							message += "<a href=\"javascript:appManager.resetTask();\"><img src=\"images/bt_ok.gif\" alt=\"OK\" border=\"0\"></a><p>";
						}

						appManager.uiManager.displayMessage(message);

						if (task.done == "false") {	
							appManager.state.pollCount++;
							if (task.name == "commit") {
								setTimeout("appManager.pollCommit();", appManager.commitPollInterval);
							} else {
								setTimeout("appManager.poll();", appManager.operationPollInterval);
							}
						} else if (task.done == "true") {
							appManager.state.allowChanges = true;
						}
					}
				}
			}
		}
	}
	function amProcessSession(response) {
		appManager.analyzeCommitStatus(response);
		appManager.updateInvalids(response);
		appManager.updateMods(response);
		appManager.uiManager.displayMenus();
	}
	function amRemoveConfig(context, configId) {
		if ( ! this.allowChanges() ) return;
		this.state.allowChanges = false;

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "remove";
		request.context = context.contextPath();
		request.remove = configId;
		request.responseCallback = this.removeConfigCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amRemoveConfigCallback(response) {
		appManager.state.allowChanges = true;

		appManager.processPhase(response);
		appManager.processContext(response, true);

		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
		} else {
			appManager.uiManager.displayMessageChangesApplied();
		}
	}

	function amRenameConfigs(configFields) {
		if ( ! this.allowChanges() ) return;

		this.updateConfigOptionValues(configFields);

		var modEntries = this.state.config_optionsContext.modifiedEntries();
		if ( modEntries.length == 0 ) return;

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "submit";
		request.context = this.getContext().contextPath();

		this.state.allowChanges = false;

		var nodes = new Array();
		for (var i=0; i < modEntries.length; i++) {
			var configEntry = modEntries[i];
			var node = new Object();
			node.config_id = configEntry.configId;
			node.value = configEntry.valueNew;
			nodes.push(node);
		}

		request.nodes = nodes;
		request.responseCallback = this.renameConfigsCallback;
		appManager.uiManager.clearDisplay();
		this.serverManager.sendServerRequest(request);
	}

	function amRenameConfigsCallback(response) {
		appManager.state.allowChanges = true;
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.processPhase(response);
		appManager.processContext(response, true);
	}

	function amResetTask() {
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "reset_task";
		request.responseCallback = this.resetTaskCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amResetTaskCallback(response) {
		appManager.processPhase(response);
	}

	function amRevert() {
		appManager.state.allowChanges = false;
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "revert";
		request.context = "/";
		request.responseCallback = appManager.revertCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amRevertCallback(response) {
		appManager.state.allowChanges = true;
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.state.contextTree.getContext().clearChildren();

		appManager.processPhase(response);
		appManager.processContext(response, true);

		appManager.uiManager.displayMessage("Configuration changes have been reverted.");
	}

	function amSave(filespecFields) {
		var filespec = filespecFields["saveTextBox"];
		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "save";
		request.filespec = filespec;

		appManager.uiManager.clearDisplay();

		request.responseCallback = this.saveCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amSaveCallback(response) {
		if ( appManager.responseHasError(response) ) {
			appManager.handleError(response);
			return;
		}

		appManager.processPhase(response);
		appManager.processContext(response, true);
	}

	function amServerResponseCallback(response) {
	}

	function amShowOperationResults(status) {
//		appManager.uiManager.clearOperationDisplay();
		appManager.uiManager.displayOperationResults(status);
	}

	function amStartEvent(eventFunc) {
		if ( eventFunc != null ) {
			eventFunc();
		}
	}

	function amStartOperation(operation) {
//		this.state.operation = operation;
		this.state.pollExecId = null;
		appManager.uiManager.clearOperationDisplay();

		if (operation != null) {
			if ( operation.variations != null ) {
				var varOp = operation;
				for (var i=0; i < operation.variations.length; i++) {
					var testOp = operation.variations[i];
					if ( testOp.argsNeeded > varOp.argsNeeded ) varOp = testOp;
				}
				operation = varOp;
			}
			this.prepareOperationArgs(operation);
		}
	}
	function amStartOperationCallback(response) {
		appManager.processPhase(response);
		appManager.updateOperationStatus(response);
	}

	function amStartOperationWithArgs(args, commandId) {
		var operation = appManager.state.operationStore.getOperationById(commandId);
		if (operation == null) return;

		if (operation.name == "reboot") {
			if (!confirm("WARNING:  Reboot will be initiated!  Please confirm.")) return;
		}

		appManager.uiManager.clearOperationDisplay();

		if ( ( operation.mainOperation != null ) || ( operation.variations != null ) ) {
			var mainOp = operation;
			var argCount = keyCount(args);
			var foundOp = null;
			var opList = new Array();
			var trimArgs = new Object();

			if ( mainOp.mainOperation != null ) {
				mainOp = operation.mainOperation;
			}

			if ( argCount > mainOp.argsNeeded ) {
				var keyList = new Array();
				for (var x in args) {
					keyList.push(x);
				}
				var keyLength = keyList.length;
				keyList.sort(compareNumbers);
				for (var i=keyList.length - 1; i > mainOp.argsNeeded - 1; i--) {
					var arg = args[keyList[i]];
					if ( ( arg == null ) || ( arg.length == 0 ) ) {
						keyLength--;
					}
					else {
						break;
					}
				}
				if ( keyLength != argCount ) {
					for (var i=0; i < keyLength; i++) {
						var key = keyList[i];
						trimArgs[key] = args[key];
					}
					args = trimArgs;
					argCount = keyLength;
				}
			}

			opList.push(mainOp);
			if ( mainOp.variations != null ) {
				opList = opList.concat(mainOp.variations);
			}
			for (var i=0; i < opList.length; i++) {
				var testOp = opList[i];
				if ( testOp.argsNeeded == argCount ) {
					foundOp = testOp;
					break;
				}
			}
			if ( foundOp != null ) {
				operation = foundOp;
			}
		}

		var request = new ServerRequest();
		request.sessionId = appManager.state.sessionId;
		request.action = "exec_cmd_args_name";
		request.execCmd = new Object();
		request.execCmd.name = xguGetStrEscapedAmpersand(operation.name);
		request.args = args;
		request.responseCallback = this.startOperationCallback;
		this.serverManager.sendServerRequest(request);
	}

	function amStartTool(tool, args) {
		if ( tool.operation != null ) {
			this.uiManager.showOperationContent();
			this.startOperationWithArgs(args, tool.operation.commandId);
		}
	}

	function amUpdateOperationStatus(response) {
		var status = new OperationStatus();

		if ( appManager.responseHasError(response) ) {
			status.brief.could_not_start = true;
			status.brief.done = false;
			status.brief.doneSuccess = false;
			status.brief.doneMsg = "Operation Execution Failed";
			appManager.showOperationResults(status);
			appManager.handleError(response);
			appManager.state.pollExecId = null;
			return;
		}

		status.init(response);
		appManager.showOperationResults(status);
		appManager.state.pollExecId = status.brief.execId;

		if ( status.brief.done ) {
			appManager.state.pollExecId = null;
		} else {
			setTimeout("appManager.pollOperation();", appManager.operationPollInterval);
		}
	}

	function amUpdateStatus(response) {
		if ( appManager.responseHasError(response) ) {
			return;
		}
		appManager.processSession(response);
		appManager.uiManager.displayStatus(response.rl.system);

		if (appManager.state.flagReloadOps == true) appManager.fetchOperations();
		setTimeout("appManager.pollStatus();", appManager.statusPollInterval);
	}


	// Tool functions

	function amInitTreeTools() {
		var treeTools = new Tree();

		// Help link
		var helpEntry =  new TreeEntry();
		helpEntry.name = "Documentation";
		helpEntry.type = EntryType.EVENT;
		helpEntry.value = this.launchHelp;
		treeTools.root.addChild(helpEntry);

		// Subnet Calc	
		var subnetCalcEntry = new TreeEntry();
		subnetCalcEntry.name = "Subnet Calculator";
		subnetCalcEntry.type = EntryType.EVENT;
		subnetCalcEntry.value = this.launchSubnetCalc;
		treeTools.root.addChild(subnetCalcEntry);

		// Started Operations link
		var execsEntry = new TreeEntry();
		execsEntry.name = "Started Operations";
		execsEntry.type = EntryType.EVENT;
		execsEntry.value = this.launchExecs;
		treeTools.root.addChild(execsEntry);

		// Configuration link
		var confEntry = new TreeEntry();
		confEntry.name = "Show Configuration";
		confEntry.type = EntryType.EVENT;
		confEntry.value = this.launchConfig;
		treeTools.root.addChild(confEntry);

		var operations = appManager.state.operationStore.operations;
		for (var i=0; i < operations.length; i++) {
			var operation = operations[i];
			if ( operation.action != null && arrayContains(TOOL_OPERATION_NAMES, operation.name ) ) {
				var tool = new TreeEntry();
				tool.type = EntryType.OPERATION;
				tool.name = operation.name;
				tool.value = operation;
				tool.requireConfirm = true;
				treeTools.root.addChild(tool);
			}
		}
		treeTools.id = "toolMenu";
		treeTools.root.name = "Tools";
		appManager.state.treeTools = treeTools;
	}

	function amInitToolStore() {
		var toolStore = new ToolStore();
		var operationTools = [ "Ping", "Ping6", "Traceroute", "Traceroute6" ];
		var operations = this.state.operationStore.operations;
		for (var i=0; i < operations.length; i++) {
			for (var t=0; t < operationTools.length; t++) {
				var re = new RegExp("^" + operationTools[t] + " ", "i");
				if ( ( operations[i].name.match(re) ) && ( operations[i].argsNeeded == 1 ) ) {
					var tool = new ToolEntry();
					tool.name = operationTools[t];
					tool.operation = operations[i];
					toolStore.addEntry(tool);
					continue;
				}
			}
		}
		this.state.toolStore = toolStore;
	}


	// Functions for updating app state from server responses

	function amHandleError(response) {
		var errorMessage = "System error.";
		if ( response.error ) {
			errorMessage = "CGI: " + response.error.description;
		}
		else if ( response.rl && response.rl.error ) {
			errorMessage = this.XGDErrorMessage(response.rl.error);
		}
		this.uiManager.displayError(escapeXml(errorMessage));
	}

	function amUpdateConfigOptions(response) {
		var config_optionsContext = new ConfigOptions();
		if ((response && response.rl && response.rl.session && response.rl.session.context) && (response.rl.session.context.nepath == null || response.rl.session.context.nepath.length == 0)) {
			config_optionsContext.flagExists = true;
		}

		if (response && response.rl && response.rl.session && response.rl.session.context) {
			config_optionsContext.init(response.rl.session.context.syb_nodes);
		}

		var context = appManager.getContext();
		if (context && context.allowRemove) {
			config_optionsContext.optionRemove = context;
		}
		if (context && context.allowRename) {
			config_optionsContext.optionRename = context;
		}

		appManager.state.config_optionsContext = config_optionsContext;
	}

	function amUpdateConfigOptionValues(configFields) {
		var config_optionsContext = this.state.config_optionsContext;
		for (var id in configFields) {
			var fieldValue = configFields[id];
			if ((fieldValue != null) && (fieldValue.prototype == Array)) fieldValue = fieldValue[0];

			var isOp = (id.length > 3 && id.substr(0, 3) == "op_");
			if (isOp) id = id.substr(3);

			var configEntry = config_optionsContext.entryById(id);
			if (configEntry) {
				if (isOp) {
					configEntry.opNew = fieldValue;
				} else {
					configEntry.valueNew = fieldValue;
				}
			}
		}
	}

	function amUpdateContextTree(response, flagSetContext) {
		this.state.contextTree.setContextByPath(response, flagSetContext);
	}

	function amUpdateInvalids(response) {
		var invalids_list = new InvalidsList();
		invalids_list.init(response.rl.session.invalid_nodes);
		appManager.state.invalids_list = invalids_list;
	}

	function amUpdateMods(response) {
		var mods_listAdded = new ModsList();
		mods_listAdded.init(response.rl.session.mods.added_nodes);
		appManager.state.mods_listAdded = mods_listAdded;

		var mods_listChanged = new ModsList();
		mods_listChanged.init(response.rl.session.mods.changed_nodes);
		appManager.state.mods_listChanged = mods_listChanged;

		var mods_listDeleted = new ModsList();
		mods_listDeleted.init(response.rl.session.mods.deleted_nodes);
		appManager.state.mods_listDeleted = mods_listDeleted;

		var mods_listMissing = new ModsList();
		mods_listMissing.init(response.rl.session.mods.missing_nodes);
		appManager.state.mods_listMissing = mods_listMissing;

		appManager.state.mods_rootSegment = response.rl.session.mods.segment;
	}

	// Functions for updating the display


	// Data aaccess functions

	function amAllowChanges() {
		return this.state.allowChanges;
	}

	function amGetChangesInvalid() {
		return this.state.changesInvalid;
	}

	function amGetChangesNotCommitted() {
		return this.state.changesNotCommitted;
	}

	function amGetContext() {
		if (this.state && this.state.contextTree) {
			return this.state.contextTree.getContext();
		} else {
			return null;
		}
	}

	function amGetSessionInvalidState() {
		return (this.state && this.state.invalidState);
	}

	function amIsLoggedIn() {
		return ( this.state.user != null );
	}

	function amOperationsForContext(context) {
		var contextName = context.name;
		var operationList = new Array();
		var allOperations = this.state.operationStore.operations;
		for (var i=0; i < allOperations.length; i++) {
			var operation = allOperations[i];
			if ( ( operation.contextName == null ) || ( operation.contextName == contextName ) ) {
				operationList.push(operation);
			}
		}
		return operationList;
	}

	function amResponseHasError(response) {
		if ( response.error ||
			 ( response.rl && response.rl.error && response.rl.error.id && response.rl.error.id != 0 ) )
		{
			return true;
		}
		return false;
	}

	function amSetChangesInvalid(status) {
		this.state.changesInvalid = false;
		if (status == true) {
			this.state.changesInvalid = true;
		} else if (typeof(status) == "string") {
			if (status.toLowerCase() == "true") this.state.changesInvalid = true;
		}
	}

	function amSetChangesNotCommitted(status) {
		this.state.changesNotCommitted = false;
		if (status == true) {
			this.state.changesNotCommitted = true;
		} else if (typeof(status) == "string") {
			if (status.toLowerCase() == "true") this.state.changesNotCommitted = true;
		}
	}

	function amSetInvalidState(invalidState) {
		this.state.invalidState = false;
		if (invalidState == true) {
			this.state.invalidState = true;
		} else if (typeof(invalidState) == "string") {
			if (invalidState.toLowerCase() == "true") this.state.invalidState = true;
		}
	}

	function amXGDErrorMessage( error ) {
		var id = error.id;
		var message = this.xgdErrorMessages[id];
		if (message == null)
		{
			message = " " + error.description;
		}
		return message;
	}


	// Event functions
	function amLaunchConfig() {
		appManager.state.pollExecId = null;
		appManager.fetchConfig();
	}
	function amLaunchExecs() {
		appManager.state.pollExecId = null;
		appManager.fetchExecsStatus();
	}
	function amLaunchHelp() {
		window.open("http://www.vyatta.com/documentation/");
	}
	function amLaunchSubnetCalc() {
		window.open("ipcalc.html", "subnetCalc", "width=600,height=700,directories=no,location=no,menubar=no,status=no,toolbar=no,scrollbars=yes");
	}


	// Function declarations
	this.init = amInit;

	// Main application Functions & server callback functions

	this.addConfig = amAddConfig;
	this.addConfigCallback = amAddConfigCallback;

	this.addOrRemoveContext = amAddOrRemoveContext;
	this.addOrRemoveContextCallback = amAddOrRemoveContextCallback;

	this.analyzeCommitStatus = amAnalyzeCommitStatus;

	this.applyConfigOptions = amApplyConfigOptions;
	this.applyConfigOptionsCallback = amApplyConfigOptionsCallback;

	this.changeContext = amChangeContext;
	this.changeContextCallback = amChangeContextCallback;

	this.checkConfigOptions = amCheckConfigOptions;

	this.commit = amCommit;
	this.commitCallback = amCommitCallback;

	this.expandContext = amExpandContext;
	this.expandContextCallback = amExpandContextCallback;

	this.fetchConfig = amFetchConfig;
	this.fetchConfigCallback = amFetchConfigCallback;

	this.fetchExecutionStatus = amFetchExecutionStatus;

	this.fetchExecsStatus = amFetchExecsStatus;
	this.fetchExecsStatusCallback = amFetchExecsStatusCallback;

	this.fetchOperationArgs = amFetchOperationArgs;
	this.fetchOperationArgsCallback = amFetchOperationArgsCallback;

	this.fetchOperations = amFetchOperations;
	this.fetchOperationsCallback = amFetchOperationsCallback;

	this.initServer = amInitServer;
	this.initServerCallback = amInitServerCallback;

	this.killOperation = amKillOperation;
	this.killOperationCallback = amKillOperationCallback;

	this.launchConfig = amLaunchConfig;
	this.launchExecs = amLaunchExecs;
	this.launchHelp = amLaunchHelp;
	this.launchSubnetCalc = amLaunchSubnetCalc;

	this.load = amLoad;
	this.loadCallback = amLoadCallback;

	this.login = amLogin;
	this.loginCallback = amLoginCallback;

	this.logout = amLogout;
	this.logoutCallback = amLogoutCallback;

	this.lostSessionCallback = amLostSessionCallback;

	this.poll = amPoll;
	this.pollCallback = amPollCallback;

	this.pollCommit = amPollCommit;
	this.pollInit = amPollInit;
	this.pollOperation = amPollOperation;
	this.pollStatus = amPollStatus;

	this.prepareOperationArgs = amPrepareOperationArgs;

	this.processContext = amProcessContext;
	this.processPhase = amProcessPhase;
	this.processSession = amProcessSession;

	this.removeConfig = amRemoveConfig;
	this.removeConfigCallback = amRemoveConfigCallback;

	this.renameConfigs = amRenameConfigs;
	this.renameConfigsCallback = amRenameConfigsCallback;

	this.resetTask = amResetTask;
	this.resetTaskCallback = amResetTaskCallback;

	this.revert = amRevert;
	this.revertCallback = amRevertCallback;

	this.save = amSave;
	this.saveCallback = amSaveCallback;

	this.serverResponseCallback = amServerResponseCallback;

	this.showOperationResults = amShowOperationResults;

	this.startOperation = amStartOperation;
	this.startOperationWithArgs = amStartOperationWithArgs;
	this.startOperationCallback = amStartOperationCallback;

	this.startEvent = amStartEvent;
	this.startTool = amStartTool;

	this.updateInvalids = amUpdateInvalids;
	this.updateMods = amUpdateMods;
	this.updateOperationStatus = amUpdateOperationStatus;
	this.updateStatus = amUpdateStatus;


	// Tool functions
	this.initToolStore = amInitToolStore;
	this.initTreeTools = amInitTreeTools;


	// Functions for updating app state from server responses
	this.handleError = amHandleError;
	this.updateConfigOptionValues = amUpdateConfigOptionValues;
	this.updateConfigOptions = amUpdateConfigOptions;
	this.updateContextTree = amUpdateContextTree;


	// Functions for updating the display


	// Data access functions
	this.allowChanges = amAllowChanges;
	this.getChangesInvalid = amGetChangesInvalid;
	this.getChangesNotCommitted = amGetChangesNotCommitted;
	this.getContext = amGetContext;
	this.getSessionInvalidState = amGetSessionInvalidState;
	this.isLoggedIn = amIsLoggedIn;
	this.operationsForContext = amOperationsForContext;
	this.responseHasError = amResponseHasError;
	this.setChangesInvalid = amSetChangesInvalid;
	this.setChangesNotCommitted = amSetChangesNotCommitted;
	this.setInvalidState = amSetInvalidState;


	// Variable Initialization
	this.serverManager = new ServerManager();
	this.state = new AppState();
	this.uiManager = new UiManager();

	this.commitPollInterval = 1000;
	this.initPollInterval = 1500;
	this.operationPollInterval = 2000;
	this.statusPollInterval = 10000;

	// Alternate xgdaemon error messages
	this.XGDErrorMessage = amXGDErrorMessage;
	this.xgdErrorMessages = new Object;
	this.xgdErrorMessages["1"] = "Incorrect username or password. Please try again.";
	this.xgdErrorMessages["9"] = "You have been logged out. Please sign in to continue.";

	return this;
}

function AppState() {
	function asCheckTO() {
		if (this.user && this.lastActivity) {
			var now = new Date(); 
			var ttl = (15*60) - ((now.getTime() - this.lastActivity.getTime()) / 1000);

			if (ttl < 120) {
				if (ttl > 0) {
					var min = Math.floor(ttl / 60);
					var sec = "" + Math.floor(ttl % 60);
					if (sec.length == 1) sec = "0" + sec;
					appManager.uiManager.displayTOWarning("Session timeout in " + min + ':' + sec);
				} else {
					appManager.uiManager.clickLogout();
					appManager.uiManager.displayMessage("You have been logged off due to session timeout.");
					appManager.uiManager.displayTOWarning(null);
				}
			} else {
				appManager.uiManager.displayTOWarning(null);
			}
		}
	}
	function asGetTotalNodesAdded() {
		if (this.mods_listAdded && this.mods_listAdded.entries) {  
			return this.mods_listAdded.entries.length
		} else {
			return 0;
		}
	}
	function asGetTotalNodesChanged() {
		if (this.mods_listChanged && this.mods_listChanged.entries) {  
			return this.mods_listChanged.entries.length
		} else {
			return 0;
		}
	}
	function asGetTotalNodesDeleted() {
		if (this.mods_listDeleted && this.mods_listDeleted.entries) {  
			return this.mods_listDeleted.entries.length
		} else {
			return 0;
		}
	}
	function asGetTotalNodesInContext() {
		if (this.config_optionsContext && this.config_optionsContext.entries) {  
			return this.config_optionsContext.entries.length
		} else {
			return 0;
		}
	}
	function asGetTotalNodesInvalid() {
		if (this.invalids_list && this.invalids_list.entries) {  
			return this.invalids_list.entries.length
		} else {
			return 0;
		}
	}
	function asGetTotalNodesMissing() {
		if (this.mods_listMissing && this.mods_listMissing.entries) {  
			return this.mods_listMissing.entries.length
		} else {
			return 0;
		}
	}
	function asIfUncommittedChanges() {
		return (this.getTotalNodesAdded() || this.getTotalNodesChanged() || this.getTotalNodesDeleted() || this.getTotalNodesInvalid());
	}
	function asResetTO() {
		this.lastActivity = new Date();
		this.checkTO();
	}

	this.checkTO                 = asCheckTO;
	this.getTotalNodesInContext  = asGetTotalNodesInContext;
	this.getTotalNodesAdded      = asGetTotalNodesAdded;
	this.getTotalNodesChanged    = asGetTotalNodesChanged;
	this.getTotalNodesDeleted    = asGetTotalNodesDeleted;
	this.getTotalNodesInvalid    = asGetTotalNodesInvalid;
	this.getTotalNodesMissing    = asGetTotalNodesMissing;
	this.ifUncommittedChanges    = asIfUncommittedChanges;
	this.resetTO                 = asResetTO;

	this.activeMenu              = null;
	this.allowChanges            = false;

	this.changesInvalid          = false;
	this.changesNotCommitted     = false;
	this.invalidState            = false;

	this.exec_output             = {};

	this.flagReloadOps           = false;

	this.invalids_list           = new InvalidsList();
	this.mods_listAdded          = new ModsList();
	this.mods_listChanged        = new ModsList();
	this.mods_listContext        = new ModsList();
	this.mods_listDeleted        = new ModsList();
	this.mods_listMissing        = new ModsList();
	this.mods_rootSegment        = null;

	this.contextTree             = new ContextTree();

	this.operationStore          = new OperationStore();
	this.pollExecId              = null;

	this.pollCount               = 0;

	this.sessionId               = null;

	this.lastActivity            = null;
	this.totalConfigChanges      = null;

	this.toolStore               = new ToolStore();
	this.treeTools               = null;

	this.user                    = null;
}

function ContextTree() {
	function ctAddNodes(parentNode, nodes) {
		var nodeList = nodes.node;
		if ( ( typeof(nodeList) == "undefined" ) || ( nodeList.constructor != Array ) ) return;
		for (var i=0; i < nodeList.length; i++) {
			var node = nodeList[i];
			if ( ( node.context_switch != "true" ) || ( node.name == "" ) || (node.deprecated == "true") || (node.user_hidden == "true")) continue;

			var newContext = new ConfigContext();
			newContext.id = parentNode.id + "." + i;
			newContext.configId = node.config_id;
			newContext.name = node.name;
			newContext.help = node.help_string;
			newContext.isContextSwitch = ( node.context_switch == "true" );
			newContext.isDeleted = (node.nstat && node.nstat.deleted && node.nstat.deleted == "true");
			newContext.isMultiNode = ( node.multi_node == "true" );
			newContext.childForecast = node.total_nechildren_cs;

			newContext.determineWhatIsAllowed();

			newContext.parent = parentNode;

			newContext.errorHere = (node.nstat.invalid == "true" || node.nstat.miss_req == "true");
			newContext.errorSub = (node.sub.invalid == "true" || node.sub.miss_req == "true");

			parentNode.children.push(newContext);
		}
	}

	function ctGetContext() {
		return this.currentNode;
	}

	function ctHideAll() {
		this.rootNode.showChildren = false;
		this.hideChildren(this.rootNode);
	}

	function ctHideChildren(node, relative) {
		if ( ! relative ) relative = null;
		for (var i=0; i < node.children.length; i++) {
			var child = node.children[i];
			if ( ( relative == null ) || ( ( child != relative ) && ( ! child.isParentOf(relative) ) ) ) {
				child.showChildren = false;
			}
			this.hideChildren(child, relative);
		}
	}

	function ctHideDistantRelatives() {
		this.hideChildren(this.rootNode, this.currentNode);
	}

	function ctReplaceNodes(nodeParent, nodes) {
		if (nodeParent) {
			nodeParent.children = new Array();
			this.addNodes(nodeParent, nodes);
		}
	}

	function ctSetContextByPath(response, flagSetContext) {
		this.rootNode.errorSub = (response != null && response.rl != null && response.rl.session != null && response.rl.session.status != null && response.rl.session.status.config_invalid != null && response.rl.session.status.config_invalid == "true");

		var node = this.rootNode;

		if (response != null && response.rl != null && response.rl.session != null && response.rl.session.context != null) { 
			if (response.rl.session.context.epath != null && response.rl.session.context.epath.segment != null) {
				for (var i = 0; i < response.rl.session.context.epath.segment.length; i++) {
					var nodeNext = null;
					for (var j = 0; j < node.children.length; j++) {
						var segment = response.rl.session.context.epath.segment[i];
						if (node.children[j].name == segment.name) {
							nodeNext = node.children[j];
							nodeNext.configId = segment.config_id;
	
							nodeNext.errorHere = (segment.nstat.invalid == "true" || segment.nstat.miss_req == "true");
							nodeNext.errorSub = (segment.sub.invalid == "true" || segment.sub.miss_req == "true");
							nodeNext.isDeleted = (segment.nstat && segment.nstat.deleted && segment.nstat.deleted == "true");
	
							nodeNext.determineWhatIsAllowed();
							break;
						}
					}
					if (nodeNext == null) return false;
					node = nodeNext;
				}
			}
			if (response.rl.session.context.nepath != null && response.rl.session.context.nepath.segment != null) {
				for (var i = 0; i < response.rl.session.context.nepath.segment.length; i++) {
					var nodeNext = null;
					for (var j = 0; j < node.children.length; j++) {
						var segment = response.rl.session.context.nepath.segment[i];
						if (node.children[j].name == response.rl.session.context.nepath.segment[i].name) {
							nodeNext = node.children[j];
							nodeNext.configId = segment.config_id;
	
							nodeNext.errorHere = false;
							nodeNext.errorSub = false;
							nodeNext.isDeleted = false;
	
							nodeNext.allowRemove = false;
							nodeNext.allowRename = false;
	
							break;
						}
					}
					if (nodeNext == null) return false;
					node = nodeNext;
				}
			}
	
			this.replaceNodes(node, response.rl.session.context.syb_nodes);
		}

		if (flagSetContext) this.currentNode = node;

		return true;
	}

	this.addNodes = ctAddNodes;
	this.getContext = ctGetContext;
	this.hideAll = ctHideAll;
	this.hideDistantRelatives = ctHideDistantRelatives;
	this.hideChildren = ctHideChildren;
	this.replaceNodes = ctReplaceNodes;
	this.setContextByPath = ctSetContextByPath;

	this.currentNode                  = this.rootNode;
	this.rootNode                     = new ConfigContext();
	this.rootNode.allowContextChange  = true;
	this.rootNode.id                  = "0";
	this.rootNode.name                = "Configure";
}

function ConfigContext() {

	function ccClearChildren() {
		this.children = new Array();
	}
	function ccContextPath() {
		var path = "";
		var node = this;
		while ( node.parent != null ) {
			var nodeName = node.name.replace(/\//g,"\\/");
			path = "/" + nodeName + path;
			node = node.parent;
		}
		return path;
	}
	function ccDetermineWhatIsAllowed() {
		this.allowRemove = (this.doesExist() && this.isContextSwitch);
		this.allowRename = this.isMultiNode;
	}
	function ccDoesExist() {
		return (parseInt(this.configId, 16) > 0) && !this.isDeleted;
	}
	function ccHasChildren() {
		return ((this.children && this.children.length && this.children.length > 0) || this.childForecast > 0);
	}
	function ccIsParentOf(node) {
		var testNode = node;
		while ( testNode != null ) {
			if ( testNode.parent == this ) {
				return true;
			}
			testNode = testNode.parent;
		}
		return false;
	}

	this.clearChildren = ccClearChildren;
	this.contextPath = ccContextPath;
	this.determineWhatIsAllowed = ccDetermineWhatIsAllowed;
	this.doesExist = ccDoesExist;
	this.hasChildren = ccHasChildren;
	this.isParentOf = ccIsParentOf;

	this.allowContextChange = true;
	this.allowRemove      = false;
	this.allowRename      = false;
	this.childForecast    = 0;
	this.children         = new Array();
	this.configId         = "";
	this.errorHere        = false;
	this.errorSub         = false;
	this.id               = "";
	this.isContextSwitch  = false;
	this.isDeleted        = false;
	this.isMultiNode      = false;
	this.help             = "";
	this.name             = "";
	this.parent           = null;
	this.showChildren     = false;

	return this;
}

function ConfigOptions() {

	function coEntryByConfigId(configId) {
		var searchList = this.entrySearchList();
		for (var i=0; i < searchList.length; i++) {
			if ( searchList[i].configId == configId ) return searchList[i];
		}
		return null;
	}

	function coEntryById(id) {
		var searchList = this.entrySearchList();
		for (var i=0; i < searchList.length; i++) {
			if ( searchList[i].id == id ) return searchList[i];
		}
		return null;
	}

	function coEntrySearchList() {
		if ( this.optionChildren != null ) {
			return this.entries.concat(this.optionChildren);
		}
		return this.entries;
	}

	function coInit(nodes) {
		var nodeList = nodes.node;
		this.entries = new Array();
		if ( ( typeof(nodeList) == "undefined" ) || ( nodeList.constructor != Array ) ) return;
		var hasEnable = false; // Part of workaround below
		for (var i=0; i < nodeList.length; i++) {
			var node = nodeList[i];

			var entry = new ConfigEntry();

			entry.id = "configEntry" + i;

			entry.name = node.name;
			entry.path = node.path;
			entry.type = node.data_type;
			entry.configId = node.config_id;
			entry.templateId = node.template_id;

			entry.help = node.help_string;

			if (node.context_switch == "true") entry.isContextSwitch = true;
			if (node.deprecated == "true") entry.isDeprecated = true;
			if (node.multi_node == "true") entry.isMultiNode = true;
			if (node.nstat && node.nstat.deleted == "true") entry.isDeleted = true;
			if (node.required && node.required == "true") entry.required = true;
			if (node.user_hidden && node.user_hidden == "true") entry.isUserHidden = true;

			if (node.value && node.value.allowed) {
				if (node.value.allowed.op) {
					if (node.value.allowed.op.length) {
						for (var j = 0; j < node.value.allowed.op.length; j++) {
							this.initAddAllowedOp(entry, node.value.allowed.op[j]);
						}
					} else {
						this.initAddAllowedOp(entry, node.value.allowed.op);						
					}
				}
				if (node.value.allowed.item) {
					if (node.value.allowed.item.length) {
						for (var j = 0; j < node.value.allowed.item.length; j++) {
							this.initAddAllowedItem(entry, node.value.allowed.item[j]);
						}
					} else {
						this.initAddAllowedItem(entry, node.value.allowed.item);						
					}
				}
				if (node.value.allowed.range) {
					if (node.value.allowed.range.length) {
						for (var j = 0; j < node.value.allowed.range.length; j++) {
							this.initAddAllowedRange(entry, node.value.allowed.range[j]);
						}
					} else {
						this.initAddAllowedRange(entry, node.value.allowed.range);
					}
				}
			}

			if (node.value && node.value.def && node.value.def_exists == "true") entry.def = node.value.def;
			if (node.value && node.value.current_exists == "true") entry.flagValueExists = true;
			if (node.value && node.value.def_exists == "true") entry.flagDefExists = true;
			if (node.value && node.value.invalid && node.value.invalid == "true") entry.value_valid = false;
			if (node.value && node.value.error_desc) entry.invalid_value_desc = node.value.error_desc;


			if (entry.isMultiNode) {
				if (entry.name == "") {
					if (this.optionAdd == null) this.optionAdd = new Array();
					this.optionAdd.push(entry);
				} else {
					if (!entry.isDeleted) {
						entry.valueOriginal = entry.name;
						entry.valueNew = entry.name;

						entry.flagValueExists = true;
						if ( this.optionChildren == null) this.optionChildren = new Array();
						this.optionChildren.push(entry);
					}
				}
			} else {
				if (node.value && node.value.current) entry.valueNew = node.value.current;
				if (entry.isDeleted) entry.valueOriginal = entry.def; else entry.valueOriginal = entry.valueNew;
				if (node.value && node.value.current_op) entry.opNew = node.value.current_op;
				entry.opOriginal = entry.opNew;
				this.entries.push(entry);
			}
		}
	}
	function coInitAddAllowedItem(entry, item) {
		var allowed_item = new AllowedItem();
		allowed_item.value = item.value;
		allowed_item.help = item.help;
		if (entry.allowed_items == null) entry.allowed_items = new Array();
		entry.allowed_items.push(allowed_item);
	}
	function coInitAddAllowedOp(entry, op) {
		if (entry.allowed_ops == null) entry.allowed_ops = new Array();
		entry.allowed_ops.push(op);
	}
	function coInitAddAllowedRange(entry, range) {
		var flagLargeRange = false;
		var min = parseInt(range.min);
		var max = parseInt(range.max);
		if (!isNaN(min) && !isNaN(max)) {
			if (range.help && range.help.length > 0) {
				if (!entry.helpRanges) entry.helpRanges = new Array();
				var str = "<br>";
				if (min == max) {
					str += "[";
					str += min;
					str += "]";
				} else {
					str += "[";
					str += min;
					str += ",&nbsp;";
					str += max;
					str += "]";
				}
				str += " -- ";
				entry.helpRanges.push(str + range.help);
			}
			if (max - min < 10) {
				if (flagLargeRange == false) {
					for (var i = min; i <= max; i++) {
						var val = "" + i;
						var item = new Object();
						item.value = val;
						item.help = range.help;
						this.initAddAllowedItem(entry, item);
					}
				}
			} else {
				flagLargeRange = true;
				entry.allowed_items = null;
			}
		}
	}

	function coModifiedEntries() {
		var searchList = this.entrySearchList();
		var modEntries = new Array();
		for (var i=0; i < searchList.length; i++) {
			var configEntry = searchList[i];
			if (configEntry && configEntry.isModified()) modEntries.push(configEntry);
		}
		return modEntries;
	}

	// Functions
	this.entryByConfigId = coEntryByConfigId;
	this.entryById = coEntryById;
	this.entrySearchList = coEntrySearchList;
	this.init = coInit;
	this.initAddAllowedItem = coInitAddAllowedItem;
	this.initAddAllowedOp = coInitAddAllowedOp;
	this.initAddAllowedRange = coInitAddAllowedRange;
	this.modifiedEntries = coModifiedEntries;

	// Variables
	this.entries = new Array();
	this.flagExists = false;
	this.optionAdd = null;
	this.optionChildren = null;
	this.optionRemove = null;
	this.optionRename = null;

	return this;
}

function AllowedItem() {
	this.help = null;
	this.value = null;
}

function ConfigEntry() {

	function ceGetHelp() {
		var hlp = this.help;
		if (this.helpRanges) {
			for (var i = 0; i < this.helpRanges.length; i++) {
				var helpR = this.helpRanges[i];
				if (helpR != this.help) {
					if (hlp.length > 0) hlp += "  ";
					hlp += helpR;
				}
			}
		}
		return hlp;
	}
	function ceIsModified() {
		return (this.isModifiedOp() || this.isModifiedVal());
	}
	function ceIsModifiedOp() {
		if ((this.opOriginal == null || this.opOriginal.length == 0) && (this.opNew == null || this.opNew.length == 0)) {
			return false;
		} else {
			return (this.opOriginal != this.opNew);
		}
	}
	function ceIsModifiedVal() {
		if ((this.valueOriginal == null || this.valueOriginal.length == 0) && (this.valueNew == null || this.valueNew.length == 0)) {
			return false;
		} else {
			return (this.valueOriginal != this.valueNew);
		}
	}
	function ceShouldDisplayInvalidValue() {
		return (this.flagValueExists == true && this.value_valid == false);
	}

	//methods:
	this.getHelp = ceGetHelp;
	this.isModified = ceIsModified;
	this.isModifiedOp = ceIsModifiedOp;
	this.isModifiedVal = ceIsModifiedVal;
	this.shouldDisplayInvalidValue = ceShouldDisplayInvalidValue;

	//variables:
	this.allowed_items         = null;
	this.allowed_ops           = null;
	this.configId              = null;
	this.id                    = "";
	this.help                  = null;
	this.helpRanges            = null;
	this.invalid_value_desc    = null;
	this.flagValueExists       = false;
	this.flagDefExists         = false;
	this.isContextSwitch       = false;
	this.isDeleted             = false;
	this.isDeprecated          = false;
	this.isUserHidden          = false;
	this.isMultiNode           = false;
	this.name                  = null;
	this.path                  = null;
	this.required              = false;
	this.templateId            = null;
	this.type                  = null;
	this.opOriginal            = null;
	this.opNew                 = null;
	this.valueOriginal         = null;
	this.valueNew              = null;
	this.def                   = null;
	this.value_valid           = true;

	return this;
}


function OperationStore() {

	function osAddOperation(operation) {
		this.operations.push(operation);
	}

	function osAddToOperationTree2(operation) {
		var parentEntry = this.treeOperations.root;
		var groupEntries = this.treeOperations.root.children;

		var nodeCurrent = this.treeOperations.root;

		if (operation.nameSegments && operation.nameSegments.length > 0) {
			for (var i = 0; nodeCurrent && (i < operation.nameSegments.length); i++) {
				var nodeChild = null;
				if (nodeCurrent.children && nodeCurrent.children.length > 0) {
					for (var j = 0; j < nodeCurrent.children.length; j++) {
						if (nodeCurrent.children[j].name == operation.nameSegments[i]) {
							nodeChild = nodeCurrent.children[j];
							break;
						} else if (nodeCurrent.children[j].name > operation.nameSegments[i]) {
							nodeChild = new TreeEntry();
							nodeChild.name = operation.nameSegments[i];
							nodeChild.type = EntryType.GROUP;
							nodeCurrent.addChildAtIndex(nodeChild, j);
							break;
						}
					}
				}
				if (nodeChild == null) {
					nodeChild = new TreeEntry();
					nodeChild.name = operation.nameSegments[i];
					nodeChild.type = EntryType.GROUP;
					nodeCurrent.addChild(nodeChild);					
				}
				nodeCurrent = nodeChild;
			}
		}
		if (nodeCurrent) {
			nodeCurrent.value = operation;
			nodeCurrent.type = EntryType.OPERATION;
		}
	}

	function osGetOperationById(commandId) {
		if (this.operations) {
			for (var i = 0; i < this.operations.length; i++) {
				var operation = this.operations[i];
				if (operation.commandId == commandId) return operation;
			}
		}
		return null;
	}

	function osInitStore(response) {
		if (response == null || response.rl == null || response.rl.op_commands == null) return;

		var serverOps = response.rl.op_commands.op_command;
		if ( serverOps == null || typeof(serverOps) == "undefined" ) return; 

		this.operations = new Array();
		for (var i=0; i < serverOps.length; i++) {
			var serverOp = serverOps[i];
			if (serverOp.type == "nexp") continue;
			var operation = new Operation();
			operation.id = "operation" + i;
			operation.commandId = serverOp.command_id;
			operation.name = serverOp.name;
			if (operation.name && operation.name.length > 0) operation.nameSegments = operation.name.split(" ");
			operation.help = serverOp.help_string;
			if ( ( serverOp.module ) && ( serverOp.module != null ) && ( serverOp.module.length > 0 ) ) {
				operation.contextName = serverOp.module;
			}
			var action = serverOp.action;
			if ( action ) {
				var actionArgs = action.split(" ");
				for (var a=0; a < actionArgs.length; a++) {
					if ( actionArgs[a].match(/^\$\d+$/) ) {
						if ( actionArgs[a] != '$0' ) operation.argsNeeded++;
					}
				}
				if ( action.length > 0 ) operation.action = action;
			}
			this.addOperation(operation);
		}
		var treeList = new Array();
		for (var i=0; i < this.operations.length; i++) {
			var operation = this.operations[i];
			var addToTree = true;
			if (arrayContains(TOOL_OPERATION_NAMES, operation.name)) continue;
			if (operation.action == null) continue;

			if ( operation.argsNeeded > 0 ) {
				for (var n=0; n < treeList.length; n++) {
					var variationOp = treeList[n];
					var mainOp = operation;
					if ( ( variationOp.argsNeeded == 0 ) || ( variationOp.action == null ) ||
						 ( variationOp.argsNeeded == mainOp.argsNeeded ) )
					{
						 continue;
					}
					if ( variationOp.argsNeeded < mainOp.argsNeeded ) {
						variationOp = operation;
						mainOp = treeList[n];
					}
					var mainAction = mainOp.action.replace("\$", "\\\$");
					var varAction = variationOp.action;
					var re = new RegExp("^" + mainAction);
					if ( re.test(varAction) ) {
						if ( mainOp.variations == null ) mainOp.variations = new Array();
						mainOp.variations.push(variationOp);
						if ( variationOp.variations != null ) {
							mainOp.variations = mainOp.variations.concat(variationOp.variations);
							variationOp.variations = null;
						}
						mainOp.mainOperation = null;
						for (var v=0; v < mainOp.variations.length; v++) {
							mainOp.variations[v].mainOperation = mainOp;
						}
						addToTree = false;
						treeList[n] = mainOp;
						break;
					}
				}
			}
			if ( addToTree ) treeList.push(operation);
		}
		for (var i=0; i < treeList.length; i++) {
			this.addToOperationTree2(treeList[i]);
		}
	}

	function osOperationGroupName(operationName) {
		if ( operationName == null ) return null;
		var groupName = null;
		var groupNamePattern = /^[^\s<]+/;
		var match = operationName.match(groupNamePattern);
		if ( ( match != null ) && ( match.length > 0 ) ) {
			groupName = match[0];
		}
		return groupName;
	}

	function osOperationTreeOrder(parentEntry, entry) {
		var addIndex = 0;
		var entryTypeRank = OperationEntryRank[entry.type];
		if ( typeof(entryTypeRank) == "undefined" ) entryTypeRank = 4;
		if ( parentEntry.children != null ) {
			for (addIndex=0; addIndex < parentEntry.children.length; addIndex++) {
				var testEntry = parentEntry.children[addIndex];
				var testEntryTypeRank = OperationEntryRank[testEntry.type];
				if ( typeof(testEntryTypeRank) == "undefined" ) entryTypeRank = 4;
				if ( testEntryTypeRank < entryTypeRank ) {
					continue;
				}
				if ( ( testEntryTypeRank > entryTypeRank ) || ( testEntry.name > entry.name ) ) {
					break;
				}
			}
		}
		return addIndex;
	}

	// Functions
	this.addOperation = osAddOperation;
	this.addToOperationTree2 = osAddToOperationTree2;
	this.getOperationById = osGetOperationById;
	this.initStore = osInitStore;
	this.operationGroupName = osOperationGroupName;
	this.operationTreeOrder = osOperationTreeOrder;

	// Variables
	this.operations = new Array();
	this.treeOperations = new Tree();
	this.treeOperations.id = "operationMenu";
	this.treeOperations.root.name = "Operations";

	return this;
}

function Tree() {

	function tHideAll() {
		this.root.showChildren = false;
		this.hideChildren(this.root);
	}
	function tHideChildren(entry, relative) {
		if ( entry.children == null ) return;
		if ( ! relative ) relative = null;
		for (var i=0; i < entry.children.length; i++) {
			var child = entry.children[i];
			if ( ( relative == null ) || ( ( child != relative ) && ( ! child.isParentOf(relative) ) ) ) {
				child.showChildren = false;
			}
			this.hideChildren(child, relative);
		}
	}
	function tHideDistantRelatives() {
		this.hideChildren(this.root, this.selectedEntry);
	}

	// Methods
	this.hideAll = tHideAll;
	this.hideChildren = tHideChildren;
	this.hideDistantRelatives = tHideDistantRelatives;

	// Variables
	this.id = "";
	this.root = new TreeEntry();
	this.root.id = "0";
	this.root.children = new Array();

	this.selectedEntry = null;

	return this;
}

function TreeEntry() {
	function teAddChild(entry) {
		entry.parent = this;
		if ( this.children == null ) {
			this.children = new Array();
		}
		this.children.push(entry);
		entry.setIds(this.children.length - 1);
	}
	function teAddChildAtIndex(entry, index) {
		if ( ( this.children == null ) || ( index >= this.children.length ) ) {
			this.addChild(entry);
			return;
		}

		entry.parent = this;
		for (var i=this.children.length; i > index; i--) {
			this.children[i] = this.children[i-1];
		}
		this.children[index] = entry;
		for (var i=index; i < this.children.length; i++) {
			this.children[i].setIds(i);
		}
	}
	function teHasChildren() {
		return (this.children && this.children.length && this.children.length > 0);
	}
	function teIsGroup() {
		return ( this.value == null );
	}
	function teIsParentOf(entry) {
		var testEntry = entry;
		while ( testEntry != null ) {
			if ( testEntry.parent == this ) {
				return true;
			}
			testEntry = testEntry.parent;
		}
		return false;
	}
	function teRemoveChildAtIndex(index) {
		this.children[index].parent = null;
		this.children.splice(index,1);
		for (var i=index; i < this.children.length; i++) {
			this.children[i].setIds(i);
		}
	}
	function teSetChild(index, entry) {
		var childrenLength = 0;
		if ( this.children != null ) {
			childrenLength = this.children.length;
		}
		if ( index >= childrenLength ) {
			this.addChild(entry);
		}
		else {
			entry.parent = this;
			this.children[index].paret = null;
			this.children[index] = entry;
			entry.setIds(index);
		}
	}
	function teSetIds(index) {
		var familyId = "";
		if ( this.parent != null ) {
			familyId = this.parent.id + ".";
		}
		this.id = familyId + index;
		if ( this.children != null ) {
			for (var i=0; i < this.children.length; i++) {
				this.children[i].setIds(i);
			}
		}
	}


	// Functions
	this.addChild = teAddChild;
	this.addChildAtIndex = teAddChildAtIndex;
	this.hasChildren = teHasChildren;
	this.isGroup = teIsGroup;
	this.isParentOf = teIsParentOf;
	this.removeChildAtIndex = teRemoveChildAtIndex;
	this.setChild = teSetChild;
	this.setIds = teSetIds;

	// Variables
	this.children = null;
	this.id = "";
	this.name = "";
	this.parent = null;
	this.requireConfirm = false;
	this.showChildren = false;
	this.type = null;
	this.value = null;

	return this;
}

var EntryType = new Object();
EntryType.MODULE = "module";
EntryType.GROUP = "group";
EntryType.OPERATION = "operation";
EntryType.EVENT = "event";

var OperationEntryRank = new Object();
OperationEntryRank[EntryType.MODULE] = 1;
OperationEntryRank[EntryType.GROUP] = 2;
OperationEntryRank[EntryType.OPERATION] = 3;
OperationEntryRank[EntryType.EVENT] = 3;
OperationEntryRank[null] = 4;

function Operation() {

	function oInitArgs(response) {
		var serverArgs = response.rl.exec_query.args;
		this.args = null;
		if ( ( typeof(serverArgs) == "undefined" ) || ( typeof(serverArgs.arg) == "undefined" ) ) {
			this.args = new Array();
			for ( var i=0; i < this.argsNeeded; i++ ) {
				var arg = new OperationArg();
				arg.name = "Arg " + ( i + 1 );
				this.args[i] = arg;
			}
			return;
		}
		serverArgs = serverArgs.arg;
		this.args = new Array();
		for (var i=0; i < serverArgs.length; i++) {
			var serverArg = serverArgs[i];
			if ( serverArg.dynamic != "true" ) continue;

			var arg = new OperationArg();

			if (serverArg.allowed && serverArg.allowed.item) {
				if (serverArg.allowed.item.constructor != Array) {
					arg.allowed_items = new Array(serverArg.allowed.item);
				} else {
					arg.allowed_items = serverArg.allowed.item;
				}
			}

			if (serverArg.no_values && serverArg.no_values == "true") arg.flagNoValues = true;
			arg.num = serverArg.num;
			arg.name = serverArg.name;
			arg.help = serverArg.help;

			this.args.push(arg);
		}
		if ( this.args.length == 0 ) {
			this.argsNeeded = 0;
		}
	}

	// Functions
	this.initArgs = oInitArgs;

	// Variables
	this.action = null;
	this.args = null;
	this.argsNeeded = 0;
	this.commandId = null;
	this.contextName = null;
	this.help = null;
	this.id = "";
	this.mainOperation = null;
	this.name = null;
	this.nameSegments = null;
	this.variations = null;

	return this;
}

function OperationArg() {
	this.allowed_items = null;
	this.flagNoValues = false;
	this.help = null;
	this.name = null;
	this.num = null;

	return this;
}

function BriefOperationStatus() {
	function bostInit(brief, session) {
		if (brief) {
			this.cached_cmd_line  = brief.cached_cmd_line;
			this.execId           = brief.exec_id;
			this.done             = ( brief.done == "true" );
			this.doneMsg          = brief.done_msg;
			this.doneSuccess      = ( brief.done_success == "true" );
			this.kill_invoked     = ( brief.kill_invoked == "true" );

			if (brief.time_start && brief.time_start.asc) this.time_start = brief.time_start.asc;
			if (brief.time_end && brief.time_end.asc) this.time_end = brief.time_end.asc;

			this.totalLines       = brief.total_lines;
		}
		if (session && session.status && session.status.time_now && session.status.time_now.asc) this.time_server = session.status.time_now.asc;
	}

	// Function declarations
	this.init = bostInit;

	// Variables
	this.argsNeeded = false;
	this.cached_cmd_line = null;
	this.could_not_start = false;
	this.execId = null;
	this.done = false;
	this.doneMsg = null;
	this.doneSuccess = false;
	this.kill_invoked = false;
	this.time_server = null;
	this.time_start = null;
	this.time_end = null;
	this.totalLines = 0;

	return this;
}
function DetailedOperationStatus() {
	function dostInit(response) {
		if (response && response.rl && response.rl.exec_status && response.rl.exec_status.detailed) {
			this.output = response.rl.exec_status.detailed.output;
			this.output_from = response.rl.exec_status.detailed.output_from;
		}
	}

	// Function declarations
	this.init = dostInit;

	// Variables
	this.output = null;
	this.output_from = 0;

	return this;
}
function OperationStatus() {

	function ostInit(response) {
		if (response && response.rl && response.rl.exec_status && response.rl.exec_status.brief && response.rl.session) {
			this.brief.init(response.rl.exec_status.brief, response.rl.session);
		}
		this.detailed.init(response);
	}

	// Function declarations
	this.init = ostInit;

	// Variables
	this.brief = new BriefOperationStatus();
	this.detailed = new DetailedOperationStatus();

	return this;
}

function ToolEntry() {
	// Variables
	this.id = "";
	this.name = null;
	this.operation = null;

	return this;
}

function ToolStore() {
	function tsAddEntry(entry) {
		entry.id = "" + ( this.entries.length + 1 );
		this.entries.push(entry);
	}

	// Functions
	this.addEntry = tsAddEntry;

	// Variables
	this.entries = new Array();

	return this;
}

/* Utility Functions */
function arrayContains(array, object, property) {
	if ( typeof(array) == "undefined" || array == null ) return false;
	var propertyName = null;
	if ( typeof(property) != "undefined" ) propertyName = property;
	for (var i=0; i < array.length; i++) {
		var test = array[i];
		if ( propertyName != null ) {
			test = test[propertyName];
		}
		if ( test == object ) return true;
	}
	return false;
}
function compareNumbers(a, b) {
	return a - b;
}
function keyCount(object) {
	var count=0;
	if ( ( ! object ) || ( object == null ) ) return 0;
	for (var x in object) {
		count++;
	}
	return count;
}

var TOOL_OPERATION_NAMES = [ "init-floppy", "reboot" ];

