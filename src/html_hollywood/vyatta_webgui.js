
YAHOO.namespace("vyatta.webgui");


YAHOO.vyatta.webgui.TemplateNode = function() {
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
};
YAHOO.vyatta.webgui.VyattaNodes.prototype = {

	config:	null,
	node:	null,
	
	createChildrenTreeNodes: function(onCompleteCallback) {
		var node_path = YAHOO.vyatta.webgui.getNodePath(this.node);
		this.loadConfigNodes(node_path, onCompleteCallback);
	},

	loadConfigNodes: function(node_path, onCompleteCallback) {
		var cfg = this.config;
		var n = this.node;
		var successHandler = function(o) {
			if (o.responseXML != null && o.responseXML.documentElement != null && o.responseXML.documentElement.childNodes != null) {
				for (var i = 0; i < o.responseXML.documentElement.childNodes.length; i++) {
					if (o.responseXML.documentElement.childNodes[i].nodeName == "node") {
						if (o.responseXML.documentElement.childNodes[i].attributes != null) {
							var nameAttr = o.responseXML.documentElement.childNodes[i].attributes.getNamedItem("name");
							if (nameAttr != null) {
								cfg.push(new YAHOO.vyatta.webgui.ConfigNode(nameAttr.value));
							}
						}
					}
				}
			} else {
				alert("Server communication error.  Did not receive an XML response.");
			}

			for (var i in cfg) {
				var cn = cfg[i];
				var nn = new YAHOO.widget.TextNode(cn.name, n);
				YAHOO.vyatta.webgui.setDynamicLoad(nn);
				YAHOO.vyatta.webgui.tree.draw();
			}
			onCompleteCallback();

		}
		var failureHandler = function(o) {
			alert("Server communication error.  Error code: " + o.status + "  Description: " + o.statusText);
		}
		var callback = {
			success: successHandler,
			failure: failureHandler
		};
		var transaction = YAHOO.util.Connect.asyncRequest("POST", "/cgi-bin/webgui_wrapper.cgi", callback, "<vyatta><configuration><id>" + YAHOO.vyatta.webgui.session_id + "</id><node>" + node_path + "</node></configuration></vyatta>\n");
	}
}

