/*
 Document   : ft_mainFrame.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The main screen of the open appliance web application
 */
function FT_mainFrame(){
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_vmList = undefined;
    this.m_selectedVm = undefined;
    this.m_mainPanel = undefined;
    this.m_priNavigation = undefined;
    this.m_mainPanel = undefined;
    
    ///////////////////////////////////////
    // functions
    /**
     * A initialization method
     */
    this.f_init = function(){
        var logoff = document.getElementById(VYA.FT_CONST.DOM_LOGOFF_ID);
        g_xbObj.f_xbAttachEventListener(logoff, 'click', thisObj.f_handleClickLogoff, true);			
        thisObj.m_mainPanel = new FT_mainPanel();
        thisObj.m_priNavigation = new FT_primaryNavigation();
    }
    
	this.f_login = function (loginPage) {
		var welcome = document.getElementById(VYA.FT_CONST.DOM_WELCOME_ID);
		welcome.style.display = 'none';
		var login = document.getElementById(VYA.FT_CONST.DOM_LOGIN_CONTAINER_ID);
		login.style.display = 'block';		
	}
	
	this.f_hideLogin = function () {
		var login = document.getElementById(VYA.FT_CONST.DOM_LOGIN_CONTAINER_ID);
		login.style.display = 'none';
	}
	
	this.f_logout = function() {
	    g_busObj.f_userLogout();	
	}
	
    /*
     * Initialialize the main content after login.
     */
    this.f_initComponent = function(vmList){
    
        var oa_2nav = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_2_NAV_ID);
        oa_2nav.style.display = 'none';
        //oa_2nav.width = '0';
        //oa_2nav.height = '0';
        thisObj.m_mainPanel.f_init();
        
        thisObj.m_vmList = vmList;
        thisObj.m_priNavigation.f_init(thisObj, vmList);
        
    }
    
    
    /*
     * Render this VM (based on the ID) in an external iframe.
     */
    this.f_showOther = function(vmId, urlPath){
        thisObj.m_mainPanel.f_show(vmId, urlPath);
    }
    
    /*
     * Render the Open Appliance Panel
     */
    this.f_showOApanel = function(vmId, urlPath){					
        thisObj.m_mainPanel.f_show(vmId, urlPath);
    }
    
    /*
     * Render this VM
     */
    this.f_showVm = function(vmId, urlPath){
        if (vmId == VYA.FT_CONST.OA_ID) {
            thisObj.f_showOApanel(vmId, urlPath);
        } else {
            thisObj.f_showOther(vmId, urlPath);
        }
    }
	
	this.f_handleClickLogoff = function(event) {
        thisObj.f_logout();	
	}
    
}

///////////////////////////////////////////////
// new FT_mainFrame object
g_mainFrameObj = new FT_mainFrame();




