/*
 Document   : ft_roleManager.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The role based managee
 */
function FT_roleManager()
{
	/////////////////////////////////////
	// properties
	var thisObj = this;
	var m_user = undefined;
	
	///////////////////////////////////////
	// functions
	/**
	 * This function take a role parameter
	 * and apply  to the screen
	 */
	this.f_getMenu = function () 
	{
		var uo = g_busObj.f_getLoginUserObj();
		thisObj.m_user = g_busObj.f_getLoginUserRec();
//		alert ('login: ' + thisObj.m_user.m_user + ' role: ' + thisObj.m_user.m_role
//		   + ' ADMIN: ' + uo.V_ROLE_ADMIN + ' INSTALL: ' + uo.V_ROLE_INSTALL +
//		   ' USER: ' + uo.V_ROLE_USER);

		switch (thisObj.m_user.m_role) {
			case uo.V_ROLE_ADMIN:
			    thisObj.f_hideConfig();
				break;
			case uo.V_ROLE_INSTALL:
			    break;
			case uo.V_ROLE_USER:
				thisObj.f_showOnlyMyProfile();
				break;
			default:
			    break;
		}	
                				
        return (document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_2_NAV_ID));				
	}
		
	this.f_hideConfig = function() {
		var menu = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_2_NAV_UL_ID);
		var child = document.getElementById(VYA.FT_CONST.DOM_2_NAV_CONFIG_ID);
		menu.removeChild(child);		
	}
	
	this.f_showOnlyMyProfile = function() {
		var menu = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_2_NAV_UL_ID);
        var myprofile = document.getElementById(VYA.FT_CONST.DOM_2_NAV_MYPROFILE_ID);
        while (menu.childNodes[0]) {
			menu.removeChild(menu.childNodes[0]);
		}		
		menu.appendChild(myprofile);
	}	
	
	this.f_isUser = function() {
		return (thisObj.m_user.m_role == thisObj.m_user.V_ROLE_USER);
	}
	
	this.f_isInstaller = function() {
		return (thisObj.m_user.m_role == thisObj.m_user.V_ROLE_INSTALL);		
	}
}

///////////////////////////////////////////////
// new FT_roleManager object
g_roleManagerObj = new FT_roleManager();