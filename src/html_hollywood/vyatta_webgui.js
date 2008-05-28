
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
		var config_path = "";
		var n = this.node;
		while (n != null && !n.isRoot()) {
			if (n.parent != null && n.parent.isRoot()) break;
			config_path = n.title + '/' + config_path;
			n = n.parent;
		}
		config_path = '/' + config_path;
		return config_path;
	},
	getTemplatePath: function() {
		var template_path = "";
		var n = this.node;
		while (n != null && !n.isRoot()) {
			if (n.parent != null && n.parent.isRoot()) break;
			if (n.multi) {
				template_path = 'node.tag/' + template_path;
			} else {
				template_path = n.title + '/' + template_path;
			}
			n = n.parent;
		}
		template_path = '/' + template_path;
		return template_path;
	},

	loadConfigNodes: function(createChildrenTreeNodesCB) {
		var config_path = this.getConfigPath();
		var n = this.node;
		var me = this;
		var successHandler = function(o) {
			if (o.responseXML != null && o.responseXML.documentElement != null && o.responseXML.documentElement.childNodes != null) {
				for (var i = 0; i < o.responseXML.documentElement.childNodes.length; i++) {
					if (o.responseXML.documentElement.childNodes[i].nodeName == "node") {
						if (o.responseXML.documentElement.childNodes[i].attributes != null) {
							var nameAttr = o.responseXML.documentElement.childNodes[i].attributes.getNamedItem("name");
							if (nameAttr != null) {
								me.config.push(new YAHOO.vyatta.webgui.ConfigNode(nameAttr.value));
							}
						}
					}
				}
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
		var transaction = YAHOO.util.Connect.asyncRequest("POST", "/cgi-bin/webgui_wrapper.cgi", callback, "<vyatta><configuration><id>" + YAHOO.vyatta.webgui.session_id + "</id><node>" + config_path + "</node></configuration></vyatta>\n");
	},
	loadConfigNodesCB: function(createChildrenTreeNodesCB) {
		for (var i in this.templ) {
			var tn = this.templ[i];
			if (tn.terminal) continue;
			if (tn.name == "node.tag") {
				for (var j in this.config) {
					var cn = this.config[j];
					var item = {};
					item.title = cn.name;
					item.label = "<b>" + cn.name + "</b>";
					var nn = new YAHOO.widget.TextNode(item, this.node);
					nn.multi = true;
					YAHOO.vyatta.webgui.setDynamicLoad(nn);	
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
					item.label = tn.name;
				} else {
					item.title = cn.name;
					item.label = "<b>" + cn.name + "</b>";
				}
				var nn = new YAHOO.widget.TextNode(item, this.node);
				YAHOO.vyatta.webgui.setDynamicLoad(nn);
			}
			YAHOO.vyatta.webgui.tree.draw();
		}
		createChildrenTreeNodesCB();
	},

	loadTemplateNodes2: function(createChildrenTreeNodesCB) {
		var template_path = this.getTemplatePath();
		var me = this;
		var successHandler = function(o) {
			if (o.responseXML != null && o.responseXML.documentElement != null && o.responseXML.documentElement.childNodes != null) {
				var nn = null;
				for (var i = 0; i < o.responseXML.documentElement.childNodes.length; i++) {
					if (o.responseXML.documentElement.childNodes[i].nodeName == "node") {
						if (nn != null) {
							me.templ.push(nn);
							nn = null;
						}
						if (o.responseXML.documentElement.childNodes[i].attributes != null) {
							var nameAttr = o.responseXML.documentElement.childNodes[i].attributes.getNamedItem("name");
							if (nameAttr != null) {
								nn = new YAHOO.vyatta.webgui.TemplateNode(nameAttr.value);
								if (o.responseXML.documentElement.childNodes[i].childNodes != null) {
									for (var j = 0; j < o.responseXML.documentElement.childNodes[i].childNodes.length; j++) {
										if (o.responseXML.documentElement.childNodes[i].childNodes[j].nodeName == "terminal") nn.terminal = true;
									}
								}
							}
						}
					}
				}
				if (nn != null) me.templ.push(nn);
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
		var transaction = YAHOO.util.Connect.asyncRequest("POST", "/cgi-bin/webgui_wrapper.cgi", callback, "<vyatta><configuration><id>" + YAHOO.vyatta.webgui.session_id + "</id><node mode='template'>" + template_path + "</node></configuration></vyatta>\n");
	},
	loadTemplateNodesCB: function(createChildrenTreeNodesCB) {
		this.loadConfigNodes(createChildrenTreeNodesCB);
	}
}

