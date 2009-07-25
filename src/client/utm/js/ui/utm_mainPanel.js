/*
 Document   : utm_mainPanel.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The main panel of the tab panel
 */
function UTM_mainPanel()
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_2navMenu = undefined;
    this.m_3navMenu = undefined;
    this.m_oa_container = undefined;
    this.m_3navSelectedItem = undefined;
    this.m_configPanel = undefined;
    
    ///////////////////////////////////////
    // functions   
    this.f_login = function()
    {
        var un = 'vyatta';
        var pw = 'vyatta';
		
        var cb = function(event)
        {
            if (event.f_isError()) {
				alert('error: ' + event.m_errMsg);
            } else {
				var f = function() {
	                g_utmHtmlBuilder.f_prepare();							
	                g_utmHtmlBuilder.f_configMenu();										
				};
                window.setTimeout(f,10);			
            }
        }
        
        g_busObj.f_userLoginRequest(un, pw, cb);
    }
    
    /*
     * Initialization function
     */
    this.f_init = function()
    {
        thisObj.m_oa_container = document.getElementById(VYA.UTM_CONST.DOM_MAIN_PANEL_OA_CONTAINER_ID); //'oa_container'
        thisObj.m_2navMenu = new UTM_2ndNavigation();
        thisObj.m_2navMenu.f_init(thisObj);
        thisObj.m_3navMenu = new UTM_3rdNavigation();
        thisObj.m_3navMenu.f_init(thisObj);
        thisObj.m_configPanel = new UTM_configPanel();
        g_configPanelObj = thisObj.m_configPanel;
        thisObj.m_configPanel.f_init(thisObj);
    }
    
    this.f_getHeight = function()
    {
        var h1 = thisObj.m_2navMenu.f_getHeight();
        var h2 = thisObj.m_configPanel.f_getHeight();
        //alert('h1: ' + h1 + ' h2:' + h2);
        return (h1 + h2);
    }
    
    this.f_requestResize = function()
    {
        var h = thisObj.f_getHeight();
        //alert('utm_mainPanel.requestResize to: ' + h);
        var padding = 30;
        if (g_xbObj.m_isIE == true) {
            padding = 40;
        }
        //		var doc = window.parent.document;
        //		alert("ifrm: " + doc.getElementById('main_ifrm').src);
		/*
		if ((window.parent != undefined) && (window.parent != null)) {
			if (window.parent.f_resizeChildIframe != undefined) {
				window.parent.f_resizeChildIframe(h + padding);
			}
		}
		*/
		resizeFrameHeight(h+padding);
    }
    
    this.f_show = function()
    {
        thisObj.m_oa_container.style.display = 'block';
        thisObj.m_2navMenu.f_show();
    }
    
    this.f_getMainPanel = function()
    {
        return thisObj.m_oa_container;
    }
    
    this.f_getNav2SelectionPath = function() {	
	    var id = g_cookie.f_get(g_myVmId + '_' + g_consObj.V_COOKIES_NAV_2_PATH, g_consObj.V_NOT_FOUND);
		if (id==g_consObj.V_NOT_FOUND) {
			id = g_defaultMenuItem;
		} 	
		return id;		
	}
	
	this.f_getNav3SelectionPath = function(nav2Id) {
	    var id = g_cookie.f_get(g_myVmId + '_' + g_consObj.V_COOKIES_NAV_3_PATH, g_consObj.V_NOT_FOUND);
		if (id==g_consObj.V_NOT_FOUND) {
			id = thisObj.f_getDefaultSelection(nav2Id);
		} 
		return id;			
	}

    /*
    this.f_saveCurrentPage = function()
	{
		id =  thisObj.m_2navMenu.m_selectedItem; 
		subId = thisObj.m_3navMenu.m_selectedItem;
		g_cookie.f_set(g_myVmId + '_' + g_consObj.V_COOKIES_NAV_2_PATH, id, g_cookie.m_userNameExpire);			
	    g_cookie.f_set(g_myVmId + '_' + g_consObj.V_COOKIES_NAV_3_PATH, subId, g_cookie.m_userNameExpire);					
	}
    */
	
    this.f_selectDefaultPage = function() {	
	    var id = thisObj.f_getNav2SelectionPath();
		var subId = thisObj.f_getNav3SelectionPath(id);		
		var f = function() { 
		    thisObj.f_selectPage(id, subId);			
		}
		window.setTimeout(f, 10);		
	}	
	
	
    this.f_selectPage = function(id, subId)
    {
        //thisObj.m_2navMenu.f_selectItem(id);
        //thisObj.m_3navMenu.f_selectItem(subId);
        thisObj.m_2navMenu.f_selectNav3Item(id, subId);		
    }
    
    this.f_selectMenuItem = function(itemId)
    {
        thisObj.m_2navMenu.f_selectItem(itemId);
    }
    
    this.f_2navSelectItemCb = function(id)
    {
        //try to be smart here, but introduce a bug:
        //  -sub menu disappear after clicking around
        //  -due to the event firing sequence of 2nd 
        //  -navigation selectItem call back, and the
        //  -first navigation click event.
        //  This is commented out on purpose.
        //if (thisObj.m_3navSelectedItem == id) {
        //		return;
        //}
        //
        
        if (thisObj.m_3navSelectedItem != undefined) {
            thisObj.m_3navMenu.f_hide(thisObj.m_3navSelectedItem);
        }
        
        thisObj.m_3navSelectedItem = id;
        thisObj.m_3navMenu.f_show(id);
        //alert('mp.f_selectItem: id' + id + 'defaultSelection: ' + thisObj.f_getDefaultSelection(id));
        thisObj.m_3navMenu.f_selectItem(thisObj.f_getDefaultSelection(id));
    }
	
	this.f_getVisibleSubId = function(id, subId) {
		var el = document.getElementById(subId);
		if (el == null) {
            return thisObj.f_getDefaultSelection(id);			
		} else {
			if (el.style.display == 'none') {
				return thisObj.f_getDefaultSelection(id);
			} else {
				return subId;
			}
		}
	}
	
    this.f_2navSelectNav3ItemCb	= function(id, subId) {
		if (thisObj.m_3navSelectedItem != undefined) {
			thisObj.m_3navMenu.f_hide(thisObj.m_3navSelectedItem);
		}
		
        thisObj.m_3navSelectedItem = id;
        thisObj.m_3navMenu.f_show(id);
		//alert('mp.f_selectItem: id' + id + 'defaultSelection: ' + thisObj.f_getDefaultSelection(id));
        thisObj.m_3navMenu.f_selectItem(thisObj.f_getVisibleSubId(id,subId));		
	} 
    
    this.f_3navSelectItemCb = function(id, desc)
    {
        thisObj.m_configPanel.f_show(id, desc);
    }
	
	this.f_3navHighlightItem  = function(id)
	{
		thisObj.m_3navMenu.f_highlightItem(id);
	}
    
    this.f_getDefaultSelection = function(id)
    {
        //alert('f_getDefaultSelection return: ' + thisObj.m_3navMenu.f_getDefaultSelection(id));
        return thisObj.m_3navMenu.f_getDefaultSelection(id);
    }
    
    
}
