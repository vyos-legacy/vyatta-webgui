/*
 Document   : ft_mainPanel.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The main panel of the tab panel
 */
function FT_mainPanel(){
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
    /*
     * Initialization function
     */
    this.f_init = function(){

		thisObj.m_oa_container = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_OA_CONTAINER_ID); //'oa_container'
        thisObj.m_2navMenu = new FT_2ndNavigation();
        thisObj.m_2navMenu.f_init(thisObj);
        thisObj.m_3navMenu = new FT_3rdNavigation();
        thisObj.m_3navMenu.f_init(thisObj);
		thisObj.m_configPanel = new FT_configPanel();
		g_configPanelObj = thisObj.m_configPanel;
		thisObj.m_configPanel.f_init(thisObj);
    }
	
	this.f_stopPolling = function() 
	{
		thisObj.m_configPanel.f_stopPolling();
	}
	
	this.f_show = function() {
		thisObj.m_oa_container.style.display = 'block';
        thisObj.m_2navMenu.f_show();
	}
	
	this.f_getMainPanel = function() {
		return thisObj.m_oa_container;
	}

    this.f_selectPage = function(id, subId) {
		thisObj.m_2navMenu.f_selectItem(id);
        thisObj.m_3navMenu.f_selectItem(subId);		
	}

    this.f_selectMenuItem = function(itemId) {
        thisObj.m_2navMenu.f_selectItem(itemId);	    	
	}

    this.f_2navSelectItemCb = function(id) {
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
    
    this.f_3navSelectItemCb = function(id, desc) {
        thisObj.m_configPanel.f_show(id, desc);        
    }	
	
    this.f_getDefaultSelection = function(id){
		//alert('f_getDefaultSelection return: ' + thisObj.m_3navMenu.f_getDefaultSelection(id));
        return thisObj.m_3navMenu.f_getDefaultSelection(id);
    }
    
    
}
