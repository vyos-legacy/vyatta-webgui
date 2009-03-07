/*
 Document   : ft_2ndNavigation.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The secondary navigation horizontal menu in the main frame
 */
function FT_2ndNavigation(){
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_parent = undefined;
    this.m_selectedItem = undefined;
    this.m_menu = undefined;
    this.m_parent_container = undefined;
    
    ///////////////////////////////////////
    // functions
    /**
     * A initialization method
     */
    this.f_init = function(p){

        thisObj.m_parent = p;
        thisObj.m_menu = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_2_NAV_ID);
        thisObj.m_parent_container = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_OA_CONTAINER_ID);
        
        var menu = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_2_NAV_UL_ID);
        for (var i = 0; menu.childNodes[i]; i++) {
            sid = f_elemGetAttribute(menu.childNodes[i], 'id');
            if ((sid != undefined) && (sid != null)) {
                var node = f_elemGetFirstChildByNodeName(menu.childNodes[i], 'A');
                g_xbObj.f_xbAttachEventListener(node, 'click', thisObj.f_handleClick, true);	
				g_xbObj.f_xbAttachEventListener(node, 'mouseover', thisObj.f_handleMouseover, true);	
                g_xbObj.f_xbAttachEventListener(node, 'mouseout', thisObj.f_handleMouseout, true);									
            }
        }
    }
    
    this.f_show = function(){
		//alert('2_f_show called');
        thisObj.m_menu.style.display = 'block';
        thisObj.m_parent_container.appendChild(thisObj.m_menu);
    }
    
    this.f_hide = function(){
		//alert('2_f_hide called');
        thisObj.m_menu.style.display = 'none';
        thisObj.m_parent_container.removeChild(thisObj.m_menu);
    }
    
	this.f_resetSelectItem = function() {
	    thisObj.m_selectedItem = undefined;	
	}

    this.f_handleClick = function(e){
        var target = g_xbObj.f_xbGetEventTarget(e);
        if ((target != undefined) && (target.parentNode != undefined) && (target.parentNode != null)) {
			//Need to find out whether the icon is clicked or the href is clicked.			
			var parentNode = target.parentNode;
			if (parentNode.nodeName == 'A') {
				parentNode = parentNode.parentNode;
			}
            var id = f_elemGetAttribute(parentNode, 'id');
            thisObj.f_selectItem(id);
        }
        return false;
    }
    
    /*
     * Mouseover handler for the primary navigation bar items.
     */
    this.f_handleMouseover = function(e){
        var target = g_xbObj.f_xbGetEventTarget(e);
        if ((target != undefined) && (target.parentNode != undefined) && (target.parentNode != null)) {
		    var parentNode = target.parentNode;
			if (parentNode.nodeName == 'A') {
				target = parentNode;
			}
			target.style.color = VYA.DYN_STYLE.SEC_NAV_ACT_ITEM_COLOR;
		}
    }
    
    /*
     * Mouseout handler for the primary navigation bar items.
     */
    this.f_handleMouseout = function(e){
        var target = g_xbObj.f_xbGetEventTarget(e);
        if ((target != undefined) && (target.parentNode != undefined) && (target.parentNode != null)) {
		    var parentNode = target.parentNode;
			if (parentNode.nodeName == 'A') {
				target = parentNode;
			}			
			var id = f_elemGetAttribute(target.parentNode, 'id');
			if (id != thisObj.m_selectedItem) {
				target.style.color = VYA.DYN_STYLE.SEC_NAV_NOT_ACT_ITEM_COLOR;
			}			
		}        
    }	
	
    this.f_selectItem = function(id){
		//alert('2_nav_f_selectItem called');
        thisObj.m_selectedItem = id;
        var menu = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_2_NAV_UL_ID);
        for (var i = 0; menu.childNodes[i]; i++) {
            var sid = f_elemGetAttribute(menu.childNodes[i], 'id');
            if ((sid != undefined) && (sid != null)) {
                var nodeHref = f_elemGetFirstChildByNodeName(menu.childNodes[i], 'A');
                if (sid != thisObj.m_selectedItem) {
                    nodeHref.style.color = VYA.DYN_STYLE.SEC_NAV_NOT_ACT_ITEM_COLOR;
					nodeHref.style.fontWeight = VYA.DYN_STYLE.SEC_NAV_ACT_ITEM_FONT_WEIGHT;
                } else {
                    nodeHref.style.color = VYA.DYN_STYLE.SEC_NAV_ACT_ITEM_COLOR;
					nodeHref.style.fontWeight = VYA.DYN_STYLE.SEC_NAV_ACT_ITEM_FONT_WEIGHT;
                }
            }
        }
        thisObj.m_parent.f_2navSelectItemCb(id);
    }
    
}
