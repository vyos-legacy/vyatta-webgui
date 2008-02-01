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
 *  Module:       xgutil.js
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Place for various XORP GUI util methods
 *
 */

function xguGetStrEscapedAmpersand(strEscape) {
	var strEscaped = "";
	if (strEscape) {
		for (var i = 0; i < strEscape.length; i++) {
			var c = strEscape.charAt(i);			
			if (c == '\'') {
				strEscaped += "&apos;";
			} else if (c == '"') {
				strEscaped += "&quot;";
			} else if (c == '&') {
				strEscaped += "&amp;";
			} else if (c == '<') {
				strEscaped += "&lt;";
			} else if (c == '>') {
				strEscaped += "&gt;";
			} else {
				strEscaped += c;
			}
		}
	}
	return strEscaped;
}

