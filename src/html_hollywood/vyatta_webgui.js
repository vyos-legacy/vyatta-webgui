
YAHOO.namespace("vyatta.webgui");

YAHOO.vyatta.webgui.TemplateNode = function() {
};
YAHOO.vyatta.webgui.ConfigNode = function() {
};
YAHOO.vyatta.webgui.VyattaNodes = function() {
};

YAHOO.vyatta.webgui.VyattaNodes.prototype = {
	loadNodes: function(node) {
		var successHandler = function(o) {
			if (o.responseXML != null && o.responseXML.documentElement != null && o.responseXML.documentElement.childNodes != null) {
				for (var i = 0; i < o.responseXML.documentElement.childNodes.length; i++) {
					if (o.responseXML.documentElement.childNodes[i].nodeName == "node") {
						if (o.responseXML.documentElement.childNodes[i].attributes != null) {
							var nameAttr = o.responseXML.documentElement.childNodes[i].attributes.getNamedItem("name");
							if (nameAttr != null) {
								var nn = new YAHOO.widget.TextNode(nameAttr.value, node);
								YAHOO.vyatta.webgui.setDynamicLoad(nn);
								YAHOO.vyatta.webgui.tree.draw();
							}
						}
					}
				}
			} else {
				alert("Server communication error.  Did not receive an XML response.");
			}
		}
		var failureHandler = function(o) {
			alert("Server communication error.  Error code: " + o.status + "  Description: " + o.statusText);
		}
		var callback = {
			success: successHandler,
			failure: failureHandler
		};
		var node_path = YAHOO.vyatta.webgui.getNodePath(node);
		var transaction = YAHOO.util.Connect.asyncRequest("POST", "/cgi-bin/webgui_wrapper.cgi", callback, "<vyatta><configuration><id>" + YAHOO.vyatta.webgui.session_id + "</id><node>" + node_path + "</node></configuration></vyatta>\n");
	}
}

