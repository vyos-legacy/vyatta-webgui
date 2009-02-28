/**
 * @author loi
 */
String.prototype.trim = function(){
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
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
