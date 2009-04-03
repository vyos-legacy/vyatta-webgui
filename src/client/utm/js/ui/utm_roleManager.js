/*
 Document   : utm_roleManager.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The role based managee
 */
function UTM_roleManager()
{
	/////////////////////////////////////
	// properties
	var thisObj = this;
	this.m_user = undefined;
	
	///////////////////////////////////////
	// functions
	/**
	 * This function take a role parameter
	 * and apply  to the screen
	 */
	this.f_getMenu = function () 
	{                				
        return (document.getElementById(VYA.UTM_CONST.DOM_MAIN_PANEL_2_NAV_ID));				
	}
	
	this.f_isUser = function() {
        return false;
	}
	
	this.f_isInstaller = function() {
       return true;	
	}
	
	this.f_isAdmin = function() {
       return false;	
	}	
}

///////////////////////////////////////////////
// new UTM_roleManager object
g_utmRoleObj = new UTM_roleManager();