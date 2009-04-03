/*
 Document   : ft_lookupTable.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The lookup table, key/value pair
 */
function FT_lookupTable(){
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.elements = new Array(); //array of elments.
    ///////////////////////////////////////
    // functions    
    /*
     * Put operation: insert an element to the lookup table
     */
    this.f_put = function(key, value){
        var entry = new FT_lookupTableEntry(key, value);
        thisObj.elements[entry.f_getKey()] = entry.f_getValue();
    }
    
    this.f_get = function(key){
        return thisObj.elements[key];
    }
    
}

function FT_lookupTableEntry(k, v){
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.key = k;
    this.value = v;
    
    ///////////////////////////////////////
    // functions    
    this.f_getKey = function(){
        return thisObj.key;
    }
    
    this.f_getValue = function(){
        return thisObj.value;
    }
}
