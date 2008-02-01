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
 *  Module:           mods.js
 *
 *  Author(s):        Marat Nepomnyashy
 *  Date:             2006
 *  Description:      Code for keeping track of configuration modifications
 *
 */


function InvalidEntry() {
	this.path = null;
}
function InvalidsList() {
	function mlInit(nodes) {
		if (nodes == null) return;

		var nodeList = nodes.invalid_node;
		if ( ( typeof(nodeList) == "undefined" ) || ( nodeList.constructor != Array ) ) return;

		this.entries = new Array();
		for (var i=0; i < nodeList.length; i++) {
			var node = nodeList[i];

			var entry = new InvalidEntry();
			entry.path = node.path;
			this.entries.push(entry);
		}
	}
	this.init = mlInit;
	this.entries = null;
}


function ModEntry() {
	this.path = null;
}
function ModsList() {
	function mlInit(nodes) {
		if (nodes == null) return;

		var nodeList = nodes.mod_node;
		if ( ( typeof(nodeList) == "undefined" ) || ( nodeList.constructor != Array ) ) return;

		this.entries = new Array();
		for (var i=0; i < nodeList.length; i++) {
			var node = nodeList[i];

			var entry = new ModEntry();
			entry.path = node.path;
			this.entries.push(entry);
		}
	}
	this.init = mlInit;
	this.entries = null;
}


