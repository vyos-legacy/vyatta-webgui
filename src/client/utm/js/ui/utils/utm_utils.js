/**
 * @author loi
 */
String.prototype.trim = function(){
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
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
function f_elemGetAttribute(elem, attr){
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
		if (s.trim().length ==1) {
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
function f_elemGetFirstChildByNodeName(elem, name){
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
function f_insertBefore(parent, before, elem){
    //check to see if no parent node was provided.
	if (elem==null) {
		elem = before;
		before = parent;
		parent = before.parentNode;
	}
	parent.insertBefore(f_checkElem(elem), before);
}

function f_checkElem(elem) {
	//if only a string was provided, convert it into a text node
	return elem && elem.constructor == String? document.createTextNode(elem) : elem;
}

