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
 *  Module:              xml.js
 *
 *  Original Author(s):  DHAP Digital, Inc. Douglas Good & others
 *  Date:                2006
 *  Description:         JavaScript for parsing XML responses
 *
 */

/*
 * Originally created by DHAP Digital, Inc.
 * http://www.dhapdigital.com/
 */

function parseXmlResponse(request, obj) {
	if ( ( ! obj ) || ( obj == null ) ) {
		obj = new Object();
	}
	parseXmlNode(request.responseXML, obj);
	return obj;
}

function parseXmlNode(node, obj) {
	if ( ( ! obj ) || ( obj == null ) ) {
		obj = new Object();
	}
	var attMap = node.attributes;
	if ( attMap != null ) {
		for ( var i=0; i < attMap.length; i++ ) {
			var att = attMap.item(i);
			obj[att.nodeName] = att.nodeValue;
		}
	}
	var children = node.childNodes;
	if ( children != null ) {
		for ( var i=0; i < children.length; i++ ) {
			var childNode = children[i];
			if ( childNode.nodeType == 3 ) continue;
			var textValue = plainTextValue(childNode);
			if ( textValue != null ) {
				addChild(obj, childNode.nodeName, textValue);
			}
			else {
				var newObj = new Object();
				addChild(obj, childNode.nodeName, newObj);
				parseXmlNode(childNode, newObj);
			}
		}
	}
	return obj;
}

function addChild(parent, childName, childValue) {
	var existingChild = parent[childName];
	var childList = null;
	if ( existingChild ) {
		if ( existingChild.constructor == Array ) {
			childList = existingChild;
		} else {
			childList = new Array();
			childList[0] = existingChild;
			parent[childName] = childList;
		}
	}
	if ( childList ) {
		childList.push(childValue);
	}
	else {
		parent[childName] = childValue;
	}
}

function plainTextValue(node) {
	var children = node.childNodes;
	var textValue = "";
	var plainTextNode = true;
	for ( var i=0; i < children.length; i++ ) {
		var childNode = children[i];
		if ( childNode.nodeType == 3 ) {
			if ( childNode.nodeValue != null ) {
				textValue += childNode.nodeValue;
			}
		}
		else {
			plainTextNode = false;
			break;
		}
	}
	if ( ! plainTextNode ) textValue = null;
	else textValue = trim(textValue);
	return textValue;
}

function trim(str) {
	var t = str.replace(/$\s+/);
	return t.replace(/\s+^/);
}
function trimWS(str) {
	return trimWSR(trimWSL(str));
}
function trimWSL(str) {
	return str.replace(/^[ \t\r\n]*/, "");
}
function trimWSR(str) {
	return str.replace(/[ \t\r\n]*$/, "");
}

function escapeXml(str) {
	if ( ( ! str ) || ( str == null ) ) return str;
	var xml = str;
	xml = xml.replace(/\&/g, "&amp;");
	xml = xml.replace(/\</g, "&lt;");
	xml = xml.replace(/\>/g, "&gt;");
	return xml;
}
