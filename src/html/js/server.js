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
 *  Module:           server.js
 *
 *  Original Author:  DHAP Digital, Inc. Douglas Good & others
 *  Other Author(s):  Marat Nepomnyashy
 *  Date:             2006
 *  Description:      AJAX JavaScript file for communicating with the xgdaemon via XML
 *
 */
 
/*
 * Originally created by DHAP Digital, Inc.
 * http://www.dhapdigital.com/
 */

// Global Variables

var activeServerRequest = null;

var serverRequestQueue = new Array();

function ServerManager() {

	function smInit(appManager) {
		this.appManager = appManager;
	}

	function smSendServerRequest(request) {
		this.sendServerXmlRequest(request);
	}

	function smSendServerXmlRequest(request) {
		var url = "/xgcgi2";
		var xml = this.xmlRequest(request);
		var httpServerRequest = new HttpServerRequest();
		var httpRequest = null;

		
		if (window.XMLHttpRequest) {
			httpRequest = new XMLHttpRequest();
		} else {
			httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		}

		httpServerRequest.xmlHttpRequest = httpRequest;
		httpServerRequest.serverRequest = request;
		
		if (request.responseCallback) {
			serverRequestQueue.push(httpServerRequest);
			httpRequest.onreadystatechange = this.serverResponseListener;
		}

		httpRequest.open("POST", url, true);
		httpRequest.setRequestHeader('Content-Type', 'text/xml');

		httpRequest.send(xml);

		if ( this.debug ) {
			var rd = document.getElementById("requestDebug");
			if ( rd != null ) {
				rd.innerHTML = "<xmp>" + xml + "</xmp>";
			}
		}
	}

	function smServerResponseListener() {
		for (var i=0; i < serverRequestQueue.length; i++) {
			var httpServerRequest = serverRequestQueue[i];
			var httpRequest = httpServerRequest.xmlHttpRequest;
			if (httpRequest.readyState == 4) {
				serverRequestQueue.splice(i,1);
				// "4" indicates a state of "complete"
				if (httpRequest.status == 200) {
					// Response is OK
					appManager.serverManager.handleServerResponse(httpServerRequest);
				} else {
					var errorMsg = "A connection error has occurred. Please contact your system administrator.\n\n";
					errorMsg += "Error Details:\n";
					errorMsg += "Status = " + httpRequest.status;
					errorMsg += "\n";
					errorMsg += "Status Text = " + httpRequest.statusText;
					errorMsg += "\n";
					alert(errorMsg);
				}
			}
		}
	}

	function smHandleServerResponse(httpServerRequest) {
		var request = httpServerRequest.serverRequest;
		var httpRequest = httpServerRequest.xmlHttpRequest;
		var response = parseXmlResponse(httpRequest);
		var hasSession = true;

		response.serverRequest = request;

		var rlweb = response.rlweb;
		if ( typeof(rlweb) != "undefined" ) {
			for (var x in rlweb) {
				response[x] = rlweb[x];
			}
			delete(response.rlweb);
		}

		if ( response.rl ) {

			var execs = response.rl.execs;
			if (execs) {
				if (execs.brief && execs.brief.constructor != Array) {
					execs.brief = new Array(execs.brief);
				}
				response.rl.execs = execs;
			}

			if ( response.rl.session ) {
				if ( response.rl.session.context ) {
					var epath = response.rl.session.context.epath;
					if (epath) {
						if (epath.segment && epath.segment.constructor != Array) {
							epath.segment = new Array(epath.segment);
						}
						response.rl.session.context.epath = epath;
					}

					var nepath = response.rl.session.context.nepath;
					if (nepath) {
						if (nepath.segment && nepath.segment.constructor != Array) {
							nepath.segment = new Array(nepath.segment);
						}
						response.rl.session.context.nepath = nepath;
					}

					var syb_nodes = response.rl.session.context.syb_nodes;
					if (syb_nodes) {
						if (syb_nodes.node && syb_nodes.node.constructor != Array) {
							syb_nodes.node = new Array(syb_nodes.node);
						}
						response.rl.session.context.syb_nodes = syb_nodes;
					}
				}

				if ( response.rl.session.invalid_nodes ) {
					var invalid_nodes = response.rl.session.invalid_nodes;
					if (invalid_nodes) {
						if (invalid_nodes.invalid_node && invalid_nodes.invalid_node.constructor != Array) {
							invalid_nodes.invalid_node = new Array(invalid_nodes.invalid_node);
						}
						response.rl.session.invalid_nodes = invalid_nodes;
					}
				}

				if ( response.rl.session.mods ) {
					var added_nodes = response.rl.session.mods.added_nodes;
					if (added_nodes) {
						if (added_nodes.mod_node && added_nodes.mod_node.constructor != Array) {
							added_nodes.mod_node = new Array(added_nodes.mod_node);
						}
						response.rl.session.mods.added_nodes = added_nodes;
					}
					var changed_nodes = response.rl.session.mods.changed_nodes;
					if (changed_nodes) {
						if (changed_nodes.mod_node && changed_nodes.mod_node.constructor != Array) {
							changed_nodes.mod_node = new Array(changed_nodes.mod_node);
						}
						response.rl.session.mods.changed_nodes = changed_nodes;
					}
					var deleted_nodes = response.rl.session.mods.deleted_nodes;
					if (deleted_nodes) {
						if (deleted_nodes.mod_node && deleted_nodes.mod_node.constructor != Array) {
							deleted_nodes.mod_node = new Array(deleted_nodes.mod_node);
						}
						response.rl.session.mods.deleted_nodes = deleted_nodes;
					}
					var invalid_nodes = response.rl.session.mods.invalid_nodes;
					if (invalid_nodes) {
						if (invalid_nodes.mod_node && invalid_nodes.mod_node.constructor != Array) {
							invalid_nodes.mod_node = new Array(invalid_nodes.mod_node);
						}
						response.rl.session.mods.invalid_nodes = invalid_nodes;
					}
				}
			}

			if ( response.rl.system && response.rl.system.stat) {
				var cpu = response.rl.system.stat.cpu;
				if (cpu && cpu.constructor != Array) {
					response.rl.system.stat.cpu = new Array(cpu);
				}
			}

			if ( response.rl.exec_query ) {
				var args = response.rl.exec_query.args;
				if ( args ) {
					if ( args.arg.constructor != Array ) {
						args.arg = new Array(args.arg);
					}
				}
			}

			if ( response.rl.error ) {
				if ( response.rl.error.id == "11" ) {	// ERROR_ID_NO_SESSION
					hasSession = false;
				}
			}
		}
		if ( this.debug ) {
			var rd = document.getElementById("responseDebug");
			if ( rd != null ) {
				rd.innerHTML = "<xmp>" + httpRequest.responseText + "</xmp>";
			}
		}

		if ( hasSession && (request.responseCallback != null) ) {
			request.responseCallback(response);
		} else if ( !hasSession ) {
			if (this.appManager.isLoggedIn()) this.appManager.lostSessionCallback(response);
		} else {
			this.appManager.serverResponseCallback(response);
		}
	}

	function smXmlRequest(serverRequest) {
		var xml = "";
		xml += "<rlweb><rl>";
		xml += this.xmlTag("action", serverRequest.action);
		if ( serverRequest.auth != null ) {
			xml += this.xmlAuthTags(serverRequest.auth);
		}
		xml += "<context>";
		xml += this.xmlTag("path", serverRequest.context);
		xml += this.xmlNodeTags(serverRequest.nodes);
		xml += "</context>";
		if ( serverRequest.execCmd != null ) {
			xml += this.xmlExecCmdTags(serverRequest);
		}
		if ( serverRequest.execKill != null ) {
			xml += this.xmlExecKillTags(serverRequest);
		}
		if ( serverRequest.execStatus != null ) {
			xml += this.xmlExecStatusTags(serverRequest.execStatus);
		}
		if ( serverRequest.execQuery != null ) {
			xml += this.xmlExecQueryTags(serverRequest.execQuery);
		}
		if ( serverRequest.filespec != null ) {
			xml += this.xmlFilespecTags(serverRequest.filespec);
		}
		if ( serverRequest.add != null ) {
			xml += this.xmlAddTags(serverRequest.add);
		}
		if ( serverRequest.remove != null ) {
			xml += this.xmlRemoveTags(serverRequest.remove);
		}
		if ( serverRequest.sessionId != null ) {
			xml += "<session>";
			xml += this.xmlTag("id", serverRequest.sessionId);
			xml += "</session>";
		}
		if ( serverRequest.type != null ) {
			xml += this.xmlTag("type", serverRequest.type);
		}
		xml += "</rl></rlweb>";
		return xml;
	}

	function smXmlTag(name, value) {
		if ( ( typeof(value) == "undefined" ) || ( value == null ) ) return "";
		return "<" + name + ">" + value + "</" + name + ">";
	}

	function smXmlNodeTags(nodes) {
		if ( ( typeof(nodes) == "undefined" ) || ( nodes == null ) || ( nodes.constructor != Array ) ) return "";
		var xml = "<syb_nodes>";
		for ( var i=0; i < nodes.length; i++) {
			var node = nodes[i];
			xml += "<node>";
			for ( var x in node ) {
				xml += this.xmlTag(x, node[x]);
			}
			xml += "</node>";
		}
		xml += "</syb_nodes>";
		return xml;
	}

	function smAuthTags(auth) {
		var xml = "<auth>";
		for ( var x in auth ) {
			xml += this.xmlTag(x, auth[x]);
		}
		xml += "</auth>";
		return xml;
	}

	function smExecCmdTags(serverRequest) {
		var execCmd = serverRequest.execCmd;
		var xml = "<exec_cmd>";
		xml += this.xmlTag("name", execCmd.name);
		if ( serverRequest.args != null ) {
			xml += this.xmlArgTags(serverRequest.args);
		}
		xml += "</exec_cmd>";
		return xml;
	}

	function smExecKillTags(serverRequest) {
		var execKill = serverRequest.execKill;
		var xml = "<exec_kill>";
		xml += this.xmlTag("exec_id", execKill.exec_id);
		if (execKill.output_from) {
			xml += this.xmlTag("output_from", execKill.output_from);
		}
		if (execKill.output_pre) {
			xml += this.xmlTag("output_pre", execKill.output_pre);
		}
		if ( serverRequest.args != null ) {
			xml += this.xmlArgTags(serverRequest.args);
		}
		xml += "</exec_kill>";
		return xml;
	}

	function smExecStatusTags(execStatus) {
		var xml = "<exec_status>";
		xml += this.xmlTag("exec_id", execStatus.exec_id);
		if (execStatus.output_from) {
			xml += this.xmlTag("output_from", execStatus.output_from);
		}
		if (execStatus.output_pre) {
			xml += this.xmlTag("output_pre", execStatus.output_pre);
		}
		xml += "</exec_status>";
		return xml;
	}

	function smExecQueryTags(execQuery) {
		var xml = "<exec_query>";
		xml += this.xmlTag("name", execQuery.name);
		xml += "</exec_query>";
		return xml;
	}

	function smFilespecTags(filespec) {
		var xml = this.xmlTag("filespec", filespec);
		return xml;
	}

	function smXmlArgTags(args) {
		var xml = "<args>";
		for (var x in args) {
			xml += '<arg>';
			xml += this.xmlTag("num", x);
			xml += this.xmlTag("value", args[x]);
			xml += '</arg>';
		}
		xml += "</args>";
		return xml;
	}

	function smXmlAddTags(add) {
		var xml = "<add>";
		xml += this.xmlTag("template_id", add.template_id);
		xml += this.xmlTag("value", add.value);
		xml += "</add>";
		return xml;
	}

	function smXmlRemoveTags(remove) {
		var xml = "<remove>";
		xml += remove;
		xml += "</remove>";
		return xml;
	}

	// Function Declarations
	this.init = smInit;
	this.sendServerRequest = smSendServerRequest;
	this.sendServerXmlRequest = smSendServerXmlRequest;
	this.serverResponseListener = smServerResponseListener;
	this.handleServerResponse = smHandleServerResponse;
	this.xmlRequest = smXmlRequest;
	this.xmlTag = smXmlTag;
	this.xmlNodeTags = smXmlNodeTags;
	this.xmlAuthTags = smAuthTags;
	this.xmlExecCmdTags = smExecCmdTags;
	this.xmlExecKillTags = smExecKillTags;
	this.xmlExecStatusTags = smExecStatusTags;
	this.xmlExecQueryTags = smExecQueryTags;
	this.xmlFilespecTags = smFilespecTags;
	this.xmlArgTags = smXmlArgTags;
	this.xmlAddTags = smXmlAddTags;
	this.xmlRemoveTags = smXmlRemoveTags;

	// Variable Initialization
	this.appManager = null;

	this.debug = true;

	return this;
}

function ServerRequest() {
	this.action = null;
	this.context = null;
	this.nodes = null;
	this.sessionId = null;
	this.auth = null;
	this.execCmd = null;
	this.execKill = null;
	this.execStatus = null;
	this.execQuery = null;
	this.filespec = null;
	this.args = null;
	this.add = null;
	this.remove = null;

	this.responseCallback = null;

	return this;
}

function HttpServerRequest() {
	this.serverRequest = null;
	this.xmlHttpRequest = null;

	return this;
}

var SessionStatus = new Object();
SessionStatus.COMMITTING = "committing";
SessionStatus.IDLE = "idle";
SessionStatus.INITIALIZING = "initializing";

