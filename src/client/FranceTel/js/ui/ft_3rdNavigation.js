/*
 Document   : ft_3rdNavigation.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The third level navigation left menu in the main frame
 */
function FT_3rdNavigation()
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_parent = undefined;
    this.m_selectedItem = undefined;
    this.m_menus = [];
    this.m_parent_container = undefined;
	this.m_oa_container = undefined;
    this.m_container = undefined;
	this.m_id2descTable = undefined; 
	this.m_help = undefined;
    
    ///////////////////////////////////////
    // functions
    /**
     * A initialization method
     */
    this.f_init = function(p)
    {    
        thisObj.m_parent = p;
        thisObj.m_id2descTable = new FT_lookupTable();		
        thisObj.m_oa_container = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_OA_CONTAINER_ID); //'oa_container'
        thisObj.m_parent_container = thisObj.f_createParentDiv();
		
        var queryId = VYA.FT_CONST.DOM_MAIN_PANEL_LEFT_MENU_HOLDER_ID; //'sub_menu_container'
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
                    thisObj.m_menus.push(g_roleManagerObj.f_applyRole2subMenu(containerDiv.childNodes[0]));
                    thisObj.f_attachEventHandler(containerDiv.childNodes[0]);
					thisObj.f_initId2DescTable(containerDiv.childNodes[0]);
                }
            }
            containerDiv.removeChild(containerDiv.childNodes[0]);
        }
		thisObj.m_help = thisObj.f_createHelpDiv();
    }
	
	this.f_createParentDiv = function() {
		var div = document.createElement('div');
		div.style.display = 'block';
        div.style.width = '150px';		
		div.setAttribute('id', 'sm_parent');		
		g_xbObj.f_xbSetClassAttribute(div, 'left');
        return div;
	}
	
	this.f_createEmptyDiv = function() {
		var div = document.createElement('div');
		div.style.display = 'block';
        div.style.width = '150px';		
		div.style.margin = '5px 0px 5px 0px';
		div.setAttribute('class', 'vspace_div');
		div.innerHTML = '<br/>';	
		return div;	
	}
	
	this.f_createHelpImgDiv = function() {
		var div = document.createElement('div');
		div.style.display = 'block';
        div.style.width = '150px';		
		div.style.borderLeft = '1px solid #DEDEDE';
		div.style.borderTop = '1px solid #DEDEDE';		
		div.style.paddingTop = '5px';
		div.setAttribute('id', 'sm_help');
		div.setAttribute('class', 'help');
		div.innerHTML = '<input id="context_help" type="image" src="' +
                        g_lang.m_imageDir + 'img_help.gif" onclick="' +
                        'f_onOAHelpClick()">';
        return div;		
	}
	
	this.f_createHelpDiv = function() {
		var div = document.createElement('div');
		div.style.display = 'block';
        div.style.width = '150px';		
        div.appendChild(thisObj.f_createEmptyDiv());
		div.appendChild(thisObj.f_createHelpImgDiv());
		return div;
	}
	
	this.f_initId2DescTable = function(subMenu) {
        		
        var menuItems = subMenu.getElementsByTagName('A');
        for (var i = 0; i < menuItems.length; i++) {
			var id = menuItems[i].parentNode.getAttribute('id');
			var desc = menuItems[i].getAttribute('desc');
			thisObj.m_id2descTable.f_put(id, desc);
		}	
	}
	
	this.f_getDescById = function(id) {
		var desc=  thisObj.m_id2descTable.f_get(id);
		return desc;		
	}
    
    this.f_attachEventHandler = function(subMenu)
    {
        var menuItems = subMenu.getElementsByTagName('A');
        for (var i = 0; i < menuItems.length; i++) {
            g_xbObj.f_xbAttachEventListener(menuItems[i], 'click', thisObj.f_handleClick, true);
            g_xbObj.f_xbAttachEventListener(menuItems[i], 'mouseover', thisObj.f_handleMouseover, true);
            g_xbObj.f_xbAttachEventListener(menuItems[i], 'mouseout', thisObj.f_handleMouseout, true);
        }
    }
    
    this.f_handleClick = function(e)
    {
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
    
    this.f_handleMouseover = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if ((target != undefined) && (target.parentNode != undefined) && (target.parentNode != null)) {
            //Need to find out whether the icon is clicked or the href is clicked.
            var parentNode = target.parentNode;
            if (parentNode.nodeName == 'A') {
                target = parentNode;
            }
            target.style.color = VYA.DYN_STYLE.THIRD_NAV_ACT_ITEM_COLOR;
        }
        return false;
    }
    
    this.f_handleMouseout = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if ((target != undefined) && (target.parentNode != undefined) && (target.parentNode != null)) {
            //Need to find out whether the icon is clicked or the href is clicked.
            var parentNode = target.parentNode;
            if (parentNode.nodeName == 'A') {
                target = parentNode;
            }
            var id = f_elemGetAttribute(target.parentNode, 'id');
            if (id != thisObj.m_selectedItem) {
                target.style.color = VYA.DYN_STYLE.SEC_NAV_NOT_ACT_ITEM_COLOR;
            }
        }
        return false;
    }
    
    
    this.f_getDefaultSelection = function(id)
    {
        switch (id) {
            case VYA.FT_CONST.DOM_2_NAV_APP_ID:
                return VYA.FT_CONST.DOM_3_NAV_SUB_DASHBOARD_ID;
            case VYA.FT_CONST.DOM_2_NAV_USER_ID:
                return VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID;
            case VYA.FT_CONST.DOM_2_NAV_MON_ID:
                return VYA.FT_CONST.DOM_3_NAV_SUB_HARDWARE_ID;
            case VYA.FT_CONST.DOM_2_NAV_BACKUP_ID:
            {
				/*
                if(g_cookie.f_get(g_consObj.V_COOKIES_INIT_LOAD_PAGE,
                              g_cookie.V_NOT_FOUND) == g_consObj.V_LOAD_RESTORE)
                    return VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_ID;
                */
                return VYA.FT_CONST.DOM_3_NAV_SUB_BACKUP_ID;
            }
            case VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_UPDATE_ID:
                return VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_UPDATE_ID;
            case VYA.FT_CONST.DOM_2_NAV_CONFIG_ID:
                return VYA.FT_CONST.DOM_3_NAV_SUB_EMAIL_SRV_ID;
            case VYA.FT_CONST.DOM_2_NAV_MYPROFILE_ID:
                return VYA.FT_CONST.DOM_3_NAV_SUB_MYPROFILE_ID;
            default:
                return undefined;
        }        
    }
    
    this.f_getIndexByLevel2Id = function(id)
    {
        switch (id) {
            case VYA.FT_CONST.DOM_2_NAV_APP_ID:
                return 0;
            case VYA.FT_CONST.DOM_2_NAV_USER_ID:
                return 1;
            case VYA.FT_CONST.DOM_2_NAV_MON_ID:
                return 2;
            case VYA.FT_CONST.DOM_2_NAV_BACKUP_ID:
                return 3;
            case VYA.FT_CONST.DOM_2_NAV_CONFIG_ID:
                return 4;
            case VYA.FT_CONST.DOM_2_NAV_MYPROFILE_ID:
                return 5;
            default:
                return undefined;
        }
    }
    
    
    this.f_getIndex = function(id)
    {
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
    
    this.f_show = function(id)
    {
        var index = thisObj.f_getIndexByLevel2Id(id);
		//alert('3rdNav.f_show: id: ' + id + ' index: ' + index);		
        thisObj.m_menus[index].style.display = 'block';
		thisObj.m_parent_container.appendChild(thisObj.m_menus[index]);
		thisObj.m_parent_container.appendChild(thisObj.m_help);
        thisObj.m_oa_container.appendChild(thisObj.m_parent_container);
    }
    
    this.f_hide = function(id)
    {
        var index = thisObj.f_getIndexByLevel2Id(id);
        thisObj.m_menus[index].style.display = 'none';
        try {
			thisObj.m_oa_container.removeChild(thisObj.m_parent.container);
            thisObj.m_parent_container.removeChild(thisObj.m_menus[index]);
            thisObj.m_parent_container.removeChild(thisObj.m_help);
        } 
        catch (e) {
            //do nothing.  The child is already removed.  
        }		
    }
    
    this.f_resetSelectItem = function()
    {
        thisObj.m_selectedItem = undefined;
    }
    
    this.f_selectItem = function(id)
    {
        //console.log('3rd: f_selectItem: ' + id);
        thisObj.m_selectedItem = id;
        if (id != undefined) {
	        g_cookie.f_set(g_consObj.V_COOKIES_NAV_3_PATH, id, g_cookie.m_userNameExpire);										
            var menu = document.getElementById(id).parentNode; //This is @ UL node
            var desc = undefined;
            for (var i = 0; menu.childNodes[i]; i++) { //This is @ LI node
                var sid = f_elemGetAttribute(menu.childNodes[i], 'id');
                if ((sid != undefined) && (sid != null)) {
                    var nodeHref = f_elemGetFirstChildByNodeName(menu.childNodes[i], 'A');
                    if (nodeHref != null) {
                        var img = f_elemGetFirstChildByNodeName(nodeHref, 'IMG');
                        if (sid != thisObj.m_selectedItem) {
                            nodeHref.style.color = VYA.DYN_STYLE.THIRD_NAV_NOT_ACT_ITEM_COLOR;
                            nodeHref.style.fontWeight = VYA.DYN_STYLE.THIRD_NAV_NOT_ACT_ITEM_FONT_WEIGHT;
                            if (img != null) {
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

function f_onOAHelpClick()
{
    var fea = "width=700px, height=500px, menubar=yes, scrollbars=yes";

    if(g_utils.f_getLanguage() == g_consObj.V_LANG_FR)
        window.open(g_oaConfig.m_oaHelpURL_fr, "Open Appliance", fea);
    else
        window.open(g_oaConfig.m_oaHelpURL_en, "Open Appliance", fea);
    
}