/*
 Document   : ft_3rdNavigation.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The third level navigation left menu in the main frame
 */
function FT_3rdNavigation(){
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_parent = undefined;
    this.m_selectedItem = undefined;
    this.m_menus = [];
    this.m_parent_container = undefined;
	this.m_container = undefined;
    
    ///////////////////////////////////////
    // functions
    /**
     * A initialization method
     */
    this.f_init = function(p){
    
        thisObj.m_parent = p;
        thisObj.m_parent_container = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_OA_CONTAINER_ID);
        
        var queryId = VYA.FT_CONST.DOM_MAIN_PANEL_LEFT_MENU_HOLDER_ID;
        //Obtain a reference to the sub_menu_container div tag in the html.
        var containerDiv = document.getElementById(queryId);
		this.m_container = containerDiv;
        //Traverse the children, and obtain only the sub div/ remove the text node.
        
        while (containerDiv.childNodes[0]) {
            var childClassAttr = f_elemGetAttribute(containerDiv.childNodes[0], 'className');
            if ((childClassAttr != undefined) && (childClassAttr != null)) {
                if (childClassAttr == VYA.FT_CONST.DOM_MAIN_PANEL_SUB_MENU_CLS) {
					containerDiv.childNodes[0].style.marginTop = VYA.DYN_STYLE.THIRD_NAV_MARGIN_TOP;	
					containerDiv.childNodes[0].style.display = 'none';				
                    thisObj.m_menus.push(containerDiv.childNodes[0]);
					thisObj.f_attachEventHandler(containerDiv.childNodes[0]);
                }
            }
            containerDiv.removeChild(containerDiv.childNodes[0]);
        }
    }
    
	this.f_attachEventHandler = function(subMenu) {
	    var menuItems = subMenu.getElementsByTagName('A');
		for (var i=0; i < menuItems.length; i++) {
            g_xbObj.f_xbAttachEventListener(menuItems[i], 'click', thisObj.f_handleClick, true);
		}	
	}
	
	this.f_handleClick = function(e) {
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
	
    this.f_getDefaultSelection = function(id){
        if (id == VYA.FT_CONST.DOM_2_NAV_APP_ID) {
            return VYA.FT_CONST.DOM_3_NAV_SUB_DASHBOARD_ID;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_USER_ID) {
            return VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_MON_ID) {
            return VYA.FT_CONST.DOM_3_NAV_SUB_HARDWARE_ID;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_BACKUP_ID) {
            return VYA.FT_CONST.DOM_3_NAV_SUB_BACKUP_ID;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_CONFIG_ID) {
            return VYA.FT_CONST.DOM_3_NAV_SUB_EMAIL_SRV_ID;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_MYPROFILE_ID) {
            return VYA.FT_CONST.DOM_3_NAV_SUB_MYPROFILE_ID;
        } else {
            return undefined;
        }
    }
    
    this.f_getIndexByLevel2Id = function(id){
        if (id == VYA.FT_CONST.DOM_2_NAV_APP_ID) {
            return 0;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_USER_ID) {
            return 1;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_MON_ID) {
            return 2;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_BACKUP_ID) {
            return 3;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_CONFIG_ID) {
            return 4;
        } else if (id == VYA.FT_CONST.DOM_2_NAV_MYPROFILE_ID) {
            return 5;
        } else {
            return undefined;
        }
    }
    
    
    this.f_getIndex = function(id){
        if (id == VYA.FT_CONST.DOM_3_NAV_APP_ID) {
            return 0;
        } else if (id == VYA.FT_CONST.DOM_3_NAV_USER_ID) {
            return 1;
        } else if (id == VYA.FT_CONST.DOM_3_NAV_MON_ID) {
            return 2;
        } else if (id == VYA.FT_CONST.DOM_3_NAV_BACKUP_ID) {
            return 3;
        } else if (id == VYA.FT_CONST.DOM_3_NAV_CONFIG_ID) {
            return 4;
        } else if (id == VYA.FT_CONST.DOM_3_NAV_MYPROFILE_ID) {
            return 5;
        } else {
            return undefined;
        }
    }
    
    this.f_show = function(id){
        var index = thisObj.f_getIndexByLevel2Id(id);
        thisObj.m_menus[index].style.display = 'block';
        thisObj.m_parent_container.appendChild(thisObj.m_menus[index]);
    }
    
    this.f_hide = function(id){
        var index = thisObj.f_getIndexByLevel2Id(id);
        thisObj.m_menus[index].style.display = 'none';
        try {
            thisObj.m_parent_container.removeChild(thisObj.m_menus[index]);
        } 
        catch (e) {
            //do nothing.  The child is already removed.  
        }
    }
    
    this.f_resetSelectItem = function(){
        thisObj.m_selectedItem = undefined;
    }
    
    this.f_selectItem = function(id){
		//alert ('f_selectItem: id=' + id);
        thisObj.m_selectedItem = id;
        if (id != undefined) {
            var menu = document.getElementById(id).parentNode;
			var desc = undefined;
            for (var i = 0; menu.childNodes[i]; i++) {  
                var sid = f_elemGetAttribute(menu.childNodes[i], 'id');    
                if ((sid != undefined) && (sid != null)) {
                    var nodeHref = f_elemGetFirstChildByNodeName(menu.childNodes[i], 'A');   
					if (nodeHref != null) {
						var img = f_elemGetFirstChildByNodeName(nodeHref,'IMG');						
						if (sid != thisObj.m_selectedItem) {
							nodeHref.style.color = VYA.DYN_STYLE.THIRD_NAV_NOT_ACT_ITEM_COLOR;
							nodeHref.style.fontWeight = VYA.DYN_STYLE.THIRD_NAV_NOT_ACT_ITEM_FONT_WEIGHT;
							if (img!=null) {
								img.src = VYA.DYN_STYLE.THIRD_NAV_NOT_ACT_ITEM_IMG_SRC;
							}
						} else {
							desc = nodeHref.getAttribute('desc');
							nodeHref.style.color = VYA.DYN_STYLE.THIRD_NAV_ACT_ITEM_COLOR;
							nodeHref.style.fontWeight = VYA.DYN_STYLE.THIRD_NAV_ACT_ITEM_FONT_WEIGHT;
							if (img != null) {
								img.src = VYA.DYN_STYLE.THIRD_NAV_ACT_ITEM_IMG_SRC;
							}
						}
					}                              
                }            
            }					
            thisObj.m_parent.f_3navSelectItemCb(id, desc);                        
        }                                            
    }
    
}
