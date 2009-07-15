/**
 * @author loi
 */
String.prototype.trim = function()
{
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

String.prototype.startsWith = function(str)
{
    return (this.match("^" + str) == str);
}

String.prototype.endsWith = function(str)
{
    return (this.match(str + "$") == str)
}

String.prototype.cmp = function(b) 
{
    var a = this+'';
    return (a==b) ? 0 : (a>b) ? 1 : -1;
}

Array.prototype.size = function()
{
	if (this.length) {
		return this.length;
	}
	var i=-1;
	for (var j in this) {
	    i++;
	}
	return i;
}

/*
 * This is for IE 7.  IE 7 doesn't support Array.indexOf
 */
if (!Array.indexOf) {
	Array.prototype.indexOf = function(obj, start) {
		for (var i= (start || 0); i < this.length; i++) {
			if (this[i] == obj) {
				return i;
			}
		}
	}
}

f_encodeUrl = function(string)
{
    return escape(f_utf8_encode(string));
}

f_decodeUrl = function(string)
{
    return f_utf8_decode(unescape(string));
}

f_utf8_encode = function(string)
{
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    
    for (var n = 0; n < string.length; n++) {
    
        var c = string.charCodeAt(n);
        
        if (c < 128) {
            utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        
    }
    
    return utftext;
}

f_utf8_decode = function(utftext)
{
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
    
    while (i < utftext.length) {
    
        c = utftext.charCodeAt(i);
        
        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
        
    }
    
    return string;
    
    
}


RegExp.escape = function(str)
{
    var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
    return str.replace(specials, "\\$&");
}

/**
 * @param  object  elem : the DOM element to be used
 * @param  string  attr : the attribute to get
 * @return boolean      : the value of the attribute or null on error
 */
function f_elemGetAttribute(elem, attr)
{
    try {
        return eval("elem." + attr);
    } 
    catch (e) {
        return null;
    }
}

function f_addZero(s)
{
    if ((s != undefined) && (s != null) && (typeof s == 'string')) {
        if (s.trim().length == 1) {
            return '0' + s;
        }
    }
    return s;
}

/**
 * @param  object  elem : the DOM element to be used
 * @param  string  nodeName : the nodeName to get
 * @return Object  subElem  : the first sub child with that nodeName, null if not found.
 */
function f_elemGetFirstChildByNodeName(elem, name)
{
    try {
        for (var i = 0; elem.childNodes[i]; i++) {
            if (elem.childNodes[i].nodeName == name) {
                return elem.childNodes[i];
            }
        }
        return null;
    } 
    catch (e) {
        return null;
    }
}

/**
 * This function insert an element before another element.
 * @param parent: optional parent node
 * @param before: the node to be inserted before.
 * @param elem: the element to be inserted.
 */
function f_insertBefore(parent, before, elem)
{
    //check to see if no parent node was provided.
    if (elem == null) {
        elem = before;
        before = parent;
        parent = before.parentNode;
    }
    parent.insertBefore(f_checkElem(elem), before);
}

function f_checkElem(elem)
{
    //if only a string was provided, convert it into a text node
    return elem && elem.constructor == String ? document.createTextNode(elem) : elem;
}

function f_validateMac(mac)
{
    if (mac.search(/^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$/i) == -1) 
        return false;
    return true;
}

function f_isForbidenAddr(ip, mask)
{
    var iIP = f_inetAddr(ip);
    var iMask = f_inetAddr(mask);
    if (f_and(iIP, iMask) == iIP) 
        return true;
    if (f_or(iIP, not(iMask)) == iIP) 
        return true;
    return false;
}

/**
 * Check if the ip address is compatible with LAN IP
 */
function f_checkIPForLan(ip)
{
    var iLanMask = f_inetAddr(originalLanMask);
    if (f_and(f_inetAddr(ip), iLanMask) == f_and(f_inetAddr(originalLanIP), iLanMask)) 
        return true;
    else         
        return false;
}

function f_checkIPForLanbitewiseAnd(ip, LanIP, LanMask)
{
    var iLanMask = f_inetAddr(LanMask);
    if (f_and(f_inetAddr(ip), iLanMask) == f_and(f_inetAddr(LanIP), iLanMask)) 
        return true;
    else         
        return false;
}

function f_checkNetworkOverlap(localeIp, localeMask)
{
    var iLocaleIpAdd = f_inetAddr(localeIp);
    var iLocaleMaskAdd = f_inetAddr(localeMask);
    for (var i = 0; i <= originalNetworkIpMacAddr.length - 1; i++) {
        var net = originalNetworkIpMacAddr[i].split("/");
        var iIp = f_inetAddr(net[0]);
        var iMac = f_inetMacAdd(net[1]);
        if (iIp != f_inetAddr(originalLanIP) || iMac != f_inetAddr(originalLanMask)) {
            if (f_and(f_and(iLocaleIpAdd, iLocaleMaskAdd), iMac) == f_and(f_and(iIp, iLocaleMaskAdd), iMac)) {
                return false;
            }
        }
    }
    return true
}

function f_validateIP(ipAddress)
{
    var digits;
    var i;
    if (ipAddress.search(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/) == -1) {
        return false;
    }
    digits = ipAddress.split(".");
    for (i = 0; i < 4; i++) 
        if ((Number(digits[i]) > 255) || (Number(digits[i]) < 0)) 
            return false;
    return true;
}

function f_checkPrivateIp(ipAddress)
{
    if (ipAddress != "") {
        b = ipAddress.split(".");
        if (parseInt(b[0], 10) == 10) 
            return true
        if (parseInt(b[0], 10) == 172) {
            if (parseInt(b[1], 10) >= 16 && parseInt(b[1], 10) <= 31) 
                return true
        }
        if (parseInt(b[0], 10) == 192) {
            if (parseInt(b[1], 0) == 168) 
                return true
        }
    }
    return false
}

function f_validateMask(mask)
{
    if (mask.search(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/) == -1) 
        return false;
    if (mask.search(/^0+\.0+\.0+\.0+$/) != -1) 
        return true;
    if (mask.search(/^(255\.)*(254|252|248|240|224|192|128|0+)(\.0+)*$/) == -1) {
        return false;
    }
    return true;
}

function f_isOverlapAddress(ip1, ip2, mask1, mask2)
{
    var iIP1 = f_inetAddr(ip1);
    var iIP2 = f_inetAddr(ip2);
    var iMask1 = f_inetAddr(mask1);
    var iMask2 = f_inetAddr(mask2);
    if (f_and(f_and(iIP1, iMask1), iMask2) == f_and(f_and(iIP2, iMask1), iMask2)) 
        return true;
    return false;
}

function f_inetAddr(ipAddress)
{
    if (ipAddress != "") {
        b = ipAddress.split(".");
        if (b.length == 4) 
            return (Number(b[3]) + Number(b[2]) * 256 + Number(b[1]) * 256 * 256 + Number(b[0]) * 256 * 256 * 256);
    }
    return 0;
}

function f_not(a)
{
    a = f_integer(a);
    return (0xffffffff - a);
}

function f_integer(n)
{
    return n % (0xffffffff + 1);
}

function f_long2ip(l)
{
    with (Math) {
        var ip1 = floor(l / pow(256, 3));
        var ip2 = floor((l % pow(256, 3)) / pow(256, 2));
        var ip3 = floor(((l % pow(256, 3)) % pow(256, 2)) / pow(256, 1));
        var ip4 = floor((((l % pow(256, 3)) % pow(256, 2)) % pow(256, 1)) / pow(256, 0));
    }
    return ip1 + '.' + ip2 + '.' + ip3 + '.' + ip4;
}

function f_and(a, b)
{
    a = f_integer(a);
    b = f_integer(b);
    
    var t1 = (a - 0x80000000);
    var t2 = (b - 0x80000000);
    
    if (t1 >= 0) 
        if (t2 >= 0) 
            return ((t1 & t2) + 0x80000000);
        else             
            return (t1 & b);
    else if (t2 >= 0) 
        return (a & t2);
    else         
        return (a & b);
}

function f_or(a, b)
{
    a = f_integer(a);
    b = f_integer(b);
    
    var t1 = (a - 0x80000000);
    var t2 = (b - 0x80000000);
    
    if (t1 >= 0) 
        if (t2 >= 0) 
            return ((t1 | t2) + 0x80000000);
        else             
            return ((t1 | b) + 0x80000000);
    else if (t2 >= 0) 
        return ((a | t2) + 0x80000000);
    else         
        return (a | b);
}



