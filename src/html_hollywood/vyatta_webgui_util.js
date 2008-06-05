
YAHOO.namespace("vyatta.webgui");

YAHOO.vyatta.webgui.VyattaNode = function(node) {
	this.node = node;
	this.config_path = YAHOO.vyatta.webgui.VyattaUtil.getConfigPath(node);
	this.template_path = YAHOO.vyatta.webgui.VyattaUtil.getTemplatePath(node);
	node.vn = this;
}

YAHOO.vyatta.webgui.VyattaNode.prototype = {
	createChildrenTreeNodes: function(createChildrenTreeNodesCB) {
		this.loadVyattaNodes(createChildrenTreeNodesCB);
	},
	generateChildNodes: function () {
		if (this.vchildren == null || this.vchildren.length == 0) return;

		for (var i = 0; i < this.vchildren.length; i++) {
			var child = this.vchildren[i];
			if (child.terminal && !child.multi) continue;
			var nn = new YAHOO.widget.TextNode(child, this.node);
			new YAHOO.vyatta.webgui.VyattaNode(nn);
			YAHOO.vyatta.webgui.VyattaUtil.setLabel(nn, false);
		}
	},
	loadVyattaNodes: function(createChildrenTreeNodesCB) {
		var me = this;
		var successHandler = function(o) {
			if (o.responseXML != null && o.responseXML.documentElement != null && o.responseXML.documentElement.childNodes != null) {
				YAHOO.vyatta.webgui.VyattaUtil.processVyattaNodes(o.responseXML.documentElement.childNodes, me);
				me.generateChildNodes();
			} else {
				alert("Server communication error.  Did not recognise an XML response.");
			}

			if (createChildrenTreeNodesCB != null) createChildrenTreeNodesCB();
		}
		var failureHandler = function(o) {
			alert("Server communication error.  Error code: " + o.status + "  Description: " + o.statusText);
		}
		var callback = {
			success: successHandler,
			failure: failureHandler
		}
		var transaction = YAHOO.util.Connect.asyncRequest("POST", "/cgi-bin/webgui_wrapper.cgi", callback, "<vyatta><configuration><id>" + YAHOO.vyatta.webgui.session_id + "</id><node>" + me.config_path + "</node></configuration></vyatta>\n");
	}

}



YAHOO.vyatta.webgui.VyattaUtil = function() {
}

YAHOO.vyatta.webgui.VyattaUtil.generateHtmlChild = function(child) {
	var html = "";
	html += "<tr style='display: table-row;'>";
	html += "<td style='display: table-cell; width: 140px; padding: 10px;'>";
	html += child.title;
	html += "</td>";
	html += "<td style='display: table-cell;'>";
	if (child.terminal) {
		if (child.enums == null) {
			html += "<input type='text' style='width: 150px;'";
			html += child.value;
			html += " />";
		} else {
			html += "<select style='width: 154px;'>";
			for (var j = 0; j < child.enums.length; j++) {
				html += "<option value='";
				html += child.enums[j]
				html += "'";
				if (child.value != null) {
					if (child.enums[j] == child.value) html += " selected";
				} else {
					if (child.enums[j] == child.def) html += " selected";
				}
				html += ">";
				html += child.enums[j];
			}
			html += "</select>";
		}
	}
	html += "</td>";
	html += "<td style='display: table-cell; padding-left: 15px;'>";
	if (child.help != null) html += child.help;
	html += "</td>";
	html += '</tr>\n';
	return html;
}
YAHOO.vyatta.webgui.VyattaUtil.generateHtmlChildren = function(node) {
	if (node == null) return null;
	if (node.vchildren == null) return null;

	var html = '';
	html += "<table style='display: table;'>";
	for (var i = 0; i < node.vchildren.length; i++) {
		var child = node.vchildren[i];
		if (!child.terminal) html += YAHOO.vyatta.webgui.VyattaUtil.generateHtmlChild(child);
	}
	for (var i = 0; i < node.vchildren.length; i++) {
		var child = node.vchildren[i];
		if (child.terminal && !child.multi) html += YAHOO.vyatta.webgui.VyattaUtil.generateHtmlChild(child);
	}
	html += '</table>\n';
	return html;
}
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
YAHOO.vyatta.webgui.VyattaUtil.getNodeValue = function(node) {
	if (node.firstChild) return node.firstChild.nodeValue;
	return null;
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
YAHOO.vyatta.webgui.VyattaUtil.processVyattaNodes = function(childNodes, parent) {
	if (childNodes == null || parent == null) return;
	if (parent.vchildren != null) parent.vchildren = null;
	var nn = null;
	for (var i = 0; i < childNodes.length; i++) {
		if (childNodes[i].nodeName == "node") {
			if (nn != null) {
				if (parent.vchildren == null) parent.vchildren = new Array();
				parent.vchildren.push(nn);
				nn = null;
			}
			if (childNodes[i].attributes != null) {
				var nameAttr = childNodes[i].attributes.getNamedItem("name");
				if (nameAttr != null) {
					nn = {title: nameAttr.value};
					if (childNodes[i].childNodes != null) {
						for (var j = 0; j < childNodes[i].childNodes.length; j++) {
							if (childNodes[i].childNodes[j].nodeName == "configured") nn.configured = YAHOO.vyatta.webgui.VyattaUtil.getNodeValue(childNodes[i].childNodes[j]);
							if (childNodes[i].childNodes[j].nodeName == "default") nn.def = YAHOO.vyatta.webgui.VyattaUtil.getNodeValue(childNodes[i].childNodes[j]);
							if (childNodes[i].childNodes[j].nodeName == "enum") {
								if (childNodes[i].childNodes[j].childNodes != null) {
									for (var k = 0; k < childNodes[i].childNodes[j].childNodes.length; k++) {
										if (childNodes[i].childNodes[j].childNodes[k].nodeName == "match") {
											if (nn.enums == null) nn.enums = new Array();
											nn.enums.push(YAHOO.vyatta.webgui.VyattaUtil.getNodeValue(childNodes[i].childNodes[j].childNodes[k]));
										}
									}
								}
							}
							if (childNodes[i].childNodes[j].nodeName == "help") nn.help = YAHOO.vyatta.webgui.VyattaUtil.getNodeValue(childNodes[i].childNodes[j]);
							if (childNodes[i].childNodes[j].nodeName == "multi") nn.multi = true;
							if (childNodes[i].childNodes[j].nodeName == "terminal") {
								nn.terminal = true;
								if (childNodes[i].childNodes[j].childNodes != null) {
									for (var k = 0; k < childNodes[i].childNodes[j].childNodes.length; k++) {
										if (childNodes[i].childNodes[j].childNodes[k].nodeName == "value") {
											if (childNodes[i].childNodes[j].childNodes[k].attributes != null) {
												var valueAttr = childNodes[i].childNodes[j].childNodes[k].attributes.getNamedItem("name");
												if (valueAttr != null) nn.value = valueAttr.value;
											}
										}
									}
								}
							}
						}
					}
				}
			}
			if (nn != null && childNodes[i].childNodes != null) {
				YAHOO.vyatta.webgui.VyattaUtil.processVyattaNodes(childNodes[i].childNodes, nn);
			}
		}
	}
	if (nn != null) {
		if (parent.vchildren == null) parent.vchildren = new Array();
		parent.vchildren.push(nn);
	}
}
YAHOO.vyatta.webgui.VyattaUtil.setLabel = function(node, selected) {
	if (node.data == null) return;
	var lbl = '';
	lbl += "<span style='";
	if (node.data.configured != null) {
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
	if (selected && YAHOO.vyatta.webgui.lastSelectedItem != node) {
		if (YAHOO.vyatta.webgui.lastSelectedItem != null) {
			YAHOO.vyatta.webgui.VyattaUtil.setLabel(YAHOO.vyatta.webgui.lastSelectedItem, false);
		}
		YAHOO.vyatta.webgui.lastSelectedItem = node;
	}
}

