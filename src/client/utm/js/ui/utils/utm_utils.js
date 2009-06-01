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



