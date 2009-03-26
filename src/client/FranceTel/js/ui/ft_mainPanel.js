/*
 Document   : ft_mainPanel.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The main panel of the main frame
 */
function FT_mainPanel(){
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_2navMenu = undefined;
    this.m_3navMenu = undefined;
    this.m_container = undefined;
	this.m_oa_container = undefined;
    this.m_2navSelectedItem = undefined;
    this.m_3navSelectedItem = undefined;
	this.m_configPanel = undefined;
    
    ///////////////////////////////////////
    // functions    
    /*
     * Initialization function
     */
    this.f_init = function(){

        thisObj.m_container = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_ID);
		thisObj.m_oa_container = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_OA_CONTAINER_ID);
        thisObj.m_container.style.width = VYA.DYN_STYLE.APP_WIDTH; 
        //thisObj.m_container.style.height = '500';
        //thisObj.m_container.style.border = '0';
        thisObj.m_2navMenu = new FT_2ndNavigation();
        thisObj.m_2navMenu.f_init(thisObj);
        thisObj.m_3navMenu = new FT_3rdNavigation();
        thisObj.m_3navMenu.f_init(thisObj);
		thisObj.m_configPanel = new FT_configPanel();
		g_configPanelObj = thisObj.m_configPanel;
		thisObj.m_configPanel.f_init(thisObj);
    }
	
    this.f_reset = function(){
        while (thisObj.m_container.childNodes[0]) {
            thisObj.m_container.removeChild(thisObj.m_container.childNodes[0]);
        }
    }
    		
	this.f_show = function(vmId, urlPath) {
		//alert('ft_mainPanel: vmId: ' + vmId + ' urlPath: ' + urlPath);
		thisObj.f_reset();
		thisObj.m_2navSelectedItem = vmId;
		if (vmId == VYA.FT_CONST.OA_ID) {
			thisObj.f_showOApanel();
		} else {
			thisObj.f_showVm(vmId, urlPath);
		}
	}

    this.f_selectPage = function(id, subId) {
		thisObj.m_2navMenu.f_selectItem(id);
        thisObj.m_3navMenu.f_selectItem(subId);		
	}

    this.f_showOApanel = function(){				
		thisObj.m_oa_container.style.display = 'block';
		thisObj.m_container.appendChild(thisObj.m_oa_container);	
        thisObj.m_2navMenu.f_show();
		if (g_roleManagerObj.f_isUser()) {
			//alert('is regular user');
			thisObj.m_2navMenu.f_selectItem(VYA.FT_CONST.DOM_2_NAV_MYPROFILE_ID);		
		} else {
			//alert('other user');
			thisObj.m_2navMenu.f_selectItem(VYA.FT_CONST.DOM_2_NAV_APP_ID);
		}
    }
    
    this.f_showVm = function(vmId, urlPath){
        var url = urlPath;
        var ifr = document.createElement('iframe');
        ifr.setAttribute('id', 'ifrm');
        ifr.setAttribute('border',0);
        ifr.setAttribute('frameBorder','0');		
        ifr.style.width = '100%';
        //ifr.style.height = screen.height;
        ifr.setAttribute('height', screen.height-40);
        thisObj.m_container.appendChild(ifr);
        ifr.setAttribute('src', url);
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
