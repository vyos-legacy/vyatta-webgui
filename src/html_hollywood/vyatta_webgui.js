
YAHOO.namespace("vyatta.webgui");


YAHOO.vyatta.webgui.TemplateNode = function(name) {
	this.name = name;
}
YAHOO.vyatta.webgui.TemplateNode.prototype = {
	name: null
}


YAHOO.vyatta.webgui.ConfigNode = function(name) {
	this.name = name;
}
YAHOO.vyatta.webgui.ConfigNode.prototype = {
	name: null
}


YAHOO.vyatta.webgui.VyattaNodes = function(node) {
	this.node = node;
	this.config = new Array();
	this.templ = new Array();
}
YAHOO.vyatta.webgui.VyattaNodes.prototype = {

	templ:	null,
	config:	null,
	node:	null,


	createChildrenTreeNodes: function(createChildrenTreeNodesCB) {
		this.loadTemplateNodes2(createChildrenTreeNodesCB);
	},


	getConfigPath: function() {
		return YAHOO.vyatta.webgui.VyattaUtil.getConfigPath(this.node);
	},
	getTemplatePath: function() {
		return YAHOO.vyatta.webgui.VyattaUtil.getTemplatePath(this.node);
	},

	loadConfigNodes: function(createChildrenTreeNodesCB) {
		var config_path = this.getConfigPath();
		var n = this.node;
		var me = this;
		var successHandler = function(o) {
			if (o.responseXML != null && o.responseXML.documentElement != null && o.responseXML.documentElement.childNodes != null) {
				YAHOO.vyatta.webgui.VyattaUtil.processConfigNodes(o.responseXML.documentElement.childNodes, me.config);
			} else {
				alert("Server communication error.  Did not receive an XML response.");
			}
			me.loadConfigNodesCB(createChildrenTreeNodesCB);
		}
		var failureHandler = function(o) {
			alert("Server communication error.  Error code: " + o.status + "  Description: " + o.statusText);
		}
		var callback = {
			success: successHandler,
			failure: failureHandler
		};
		var transaction = YAHOO.util.Connect.asyncRequest("POST", "/cgi-bin/webgui_wrapper.cgi", callback, "<vyatta><configuration><id>" + YAHOO.vyatta.webgui.session_id + "</id><node mode='config' depth='" + (this.node.depth + 3) + "'>" + config_path + "</node></configuration></vyatta>\n");
	},
	loadConfigNodesCB: function(createChildrenTreeNodesCB) {
		if (this.templ == null || this.templ.length == 0) {
			for (var i in this.config) {
				var cn = this.config[i];
				var item = {};
				item.title = cn.name;
				var nn = new YAHOO.widget.TextNode(item, this.node);
				nn.cn = cn;
				nn.tn = {name: 'node.tag'};
				YAHOO.vyatta.webgui.VyattaUtil.setLabel(nn, false);
			}
		} else {
			for (var i in this.templ) {
				var tn = this.templ[i];
				if (tn.terminal && tn.multi == null) continue;
				if (tn.name == "node.tag") {
					for (var j in this.config) {
						var cn = this.config[j];
						var item = {};
						item.title = cn.name;
						var nn = new YAHOO.widget.TextNode(item, this.node);
						nn.tn = tn;
						nn.cn = cn;
						nn.multi = true;
						YAHOO.vyatta.webgui.VyattaUtil.setLabel(nn, false);
					}
				} else {
					var cnMatched = null;
					for (var j in this.config) {
						var cn = this.config[j];
						if (tn.name == cn.name) {
							cnMatched = cn;
							break;
						}
					}
					var item = {};
					if (cnMatched == null) {
						item.title = tn.name;
					} else {
						item.title = cn.name;
					}
					var nn = new YAHOO.widget.TextNode(item, this.node);
					nn.tn = tn;
					nn.cn = cnMatched;
					YAHOO.vyatta.webgui.VyattaUtil.setLabel(nn, false);
				}
			}
		}
		if (createChildrenTreeNodesCB != null) createChildrenTreeNodesCB();
	},

	loadTemplateNodes2: function(createChildrenTreeNodesCB) {
		var template_path = this.getTemplatePath();
		var me = this;
		var successHandler = function(o) {
			if (o.responseXML != null && o.responseXML.documentElement != null && o.responseXML.documentElement.childNodes != null) {
				YAHOO.vyatta.webgui.VyattaUtil.processTemplateNodes(o.responseXML.documentElement.childNodes, me.templ);
			} else {
				alert("Server communication error.  Did not receive an XML response.");
			}
			me.loadTemplateNodesCB(createChildrenTreeNodesCB);
		}
		var failureHandler = function(o) {
			alert("Server communication error.  Error code: " + o.status + "  Description: " + o.statusText);
		}
		var callback = {
			success: successHandler,
			failure: failureHandler
		};
		var transaction = YAHOO.util.Connect.asyncRequest("POST", "/cgi-bin/webgui_wrapper.cgi", callback, "<vyatta><configuration><id>" + YAHOO.vyatta.webgui.session_id + "</id><node mode='template' depth='" + (this.node.depth + 2) + "'>" + template_path + "</node></configuration></vyatta>\n");
	},
	loadTemplateNodesCB: function(createChildrenTreeNodesCB) {
		this.loadConfigNodes(createChildrenTreeNodesCB);
	}
}

YAHOO.vyatta.webgui.VyattaUtil = function() {
}
YAHOO.vyatta.webgui.VyattaUtil.generateHtmlLeafs = function(node) {
	if (node == null) return null;
	if (node.tn == null) return null;
	if (node.tn.multi) return null;
	if (node.tn.children == null) return null;

	var html = '';
	html += "<div style='display: table;'>";
	for (var i in node.tn.children) {
		var tnChild = node.tn.children[i];
		if (tnChild.multi) continue;

		var cnChild = null;
		if (node.cn != null) {
			if (node.cn.children != null) {
				for (var i in node.cn.children) {
					if (node.cn.children[i].name == tnChild.name) {
						cnChild = node.cn.children[i];
						break;
					}
				}
			}
		}

		if (tnChild.terminal) {
			html += "<div style='display: table-row;'>";
			html += "<div style='display: table-cell; width: 140px; padding: 10px;'>";
			html += tnChild.name;
			html += "</div>";
			html += "<div style='display: table-cell;'>";
			if (tnChild.enums == null) {
				html += "<input type='text' style='width: 150px;'";
				if (cnChild != null) {
					if (cnChild.children != null) {
						var val = cnChild.children[0].name;
						html += " value='" + val + "'";
					}
				} else if (tnChild.def != null) {
					html += " value='" + tnChild.def + "'";
				}
				html += " />";
			} else {
				html += "<select style='width: 154px;'>";
				for (var j in tnChild.enums) {
					html += "<option value='";
					html += tnChild.enums[j]
					html += "'";
					if (tnChild.enums[j] == tnChild.def) html += " selected";
					html += ">";
					html += tnChild.enums[j];
				}
				html += "</select>";
			}
			html += "</div>";
			html += "<div style='display: table-cell; padding-left: 15px;'>";
			html += tnChild.help;
			html += "</div>";
			html += '</div>\n';
		}
	}
	html += '</div>\n';
	return html;
},
YAHOO.vyatta.webgui.VyattaUtil.getConfigPath = function(node) {
	var config_path = "";
	while (node != null && !node.isRoot()) {
		if (node.parent != null && node.parent.isRoot()) break;
		config_path = node.title + '/' + config_path;
		node = node.parent;
	}
	config_path = '/' + config_path;
	return config_path;
}
YAHOO.vyatta.webgui.VyattaUtil.getTemplatePath = function(node) {
	var template_path = "";
	while (node != null && !node.isRoot()) {
		if (node.parent != null && node.parent.isRoot()) break;
		if (node.multi) {
			template_path = 'node.tag/' + template_path;
		} else {
			template_path = node.title + '/' + template_path;
		}
		node = node.parent;
	}
	template_path = '/' + template_path;
	return template_path;
}
YAHOO.vyatta.webgui.VyattaUtil.processConfigNodes = function(childNodes, array) {
	if (childNodes == null || array == null) return;
	var nn = null;
	for (var i = 0; i < childNodes.length; i++) {
		if (childNodes[i].nodeName == "node") {
			if (nn != null) {
				array.push(nn);
				nn = null;
			}
			if (childNodes[i].attributes != null) {
				var nameAttr = childNodes[i].attributes.getNamedItem("name");
				if (nameAttr != null) {
					nn = new YAHOO.vyatta.webgui.ConfigNode(nameAttr.value);
				}
			}
			if (nn != null && childNodes[i].childNodes != null) {
				nn.children = new Array();
				YAHOO.vyatta.webgui.VyattaUtil.processConfigNodes(childNodes[i].childNodes, nn.children);
			}
		}
	}
	if (nn != null) array.push(nn);
}
YAHOO.vyatta.webgui.VyattaUtil.processTemplateNodes = function(childNodes, array) {
	if (childNodes == null || array == null) return;
	var nn = null;
	for (var i = 0; i < childNodes.length; i++) {
		if (childNodes[i].nodeName == "node") {
			if (nn != null) {
				array.push(nn);
				nn = null;
			}
			if (childNodes[i].attributes != null) {
				var nameAttr = childNodes[i].attributes.getNamedItem("name");
				if (nameAttr != null) {
					nn = new YAHOO.vyatta.webgui.TemplateNode(nameAttr.value);
					if (childNodes[i].childNodes != null) {
						for (var j = 0; j < childNodes[i].childNodes.length; j++) {
							if (childNodes[i].childNodes[j].nodeName == "terminal") nn.terminal = true;
							if (childNodes[i].childNodes[j].nodeName == "multi") nn.multi = true;
							if (childNodes[i].childNodes[j].nodeName == "help") nn.help = childNodes[i].childNodes[j].textContent;
							if (childNodes[i].childNodes[j].nodeName == "default") nn.def = childNodes[i].childNodes[j].textContent;
							if (childNodes[i].childNodes[j].nodeName == "enum") {
								for (var k in childNodes[i].childNodes[j].childNodes) {
									if (childNodes[i].childNodes[j].childNodes[k].nodeName == "match") {
										if (nn.enums == null) nn.enums = new Array();
										nn.enums.push(childNodes[i].childNodes[j].childNodes[k].textContent);
									}
								}
							}
						}
					}
				}
			}
			if (nn != null && childNodes[i].childNodes != null) {
				nn.children = new Array();
				YAHOO.vyatta.webgui.VyattaUtil.processTemplateNodes(childNodes[i].childNodes, nn.children);
			}
		}
	}
	if (nn != null) array.push(nn);
}
YAHOO.vyatta.webgui.VyattaUtil.setLabel = function(node, selected) {
	if (node.data == null) return;
	var lbl = '';
	lbl += "<span style='";
	if (node.cn != null) {
		lbl += " font-weight: bold;";
	}
	if (selected) {
		lbl += "background-color: blue; color: #f2f2f2";
	} else {
		lbl += "background-color: #f2f2f2;";
	}
	lbl += "'>&nbsp;";
	lbl += node.data.title;
	lbl += "&nbsp;</span>";

	node.label = lbl;
	YAHOO.vyatta.webgui.tree.draw();
	if (selected) {
		if (YAHOO.vyatta.webgui.lastSelectedItem != null) {
			YAHOO.vyatta.webgui.VyattaUtil.setLabel(YAHOO.vyatta.webgui.lastSelectedItem, false);
		}
		YAHOO.vyatta.webgui.lastSelectedItem = node;
	}
}

