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
	this.m_user = undefined;
	
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
			    //thisObj.f_hideConfig();
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
		
    this.f_applyRole2subMenu = function(subMenu) {
        if (!thisObj.f_isAdmin()) {
			return subMenu;
		}
		var id = f_elemGetAttribute(subMenu, 'id');
		if (id == VYA.FT_CONST.DOM_3_NAV_CONFIG_ID) {
            var ulHref = f_elemGetFirstChildByNodeName(subMenu, 'UL');		
			if (ulHref != null) {
				for (var i=0; ulHref.childNodes[i];) {
				    var sid = f_elemGetAttribute(ulHref.childNodes[i],'id');
					if (sid != null) {						
						if ((sid == VYA.FT_CONST.DOM_3_NAV_SUB_TIME_SRV_ID) ||
						    (sid == VYA.FT_CONST.DOM_3_NAV_SUB_BLB_ID)) {
						    ulHref.removeChild(ulHref.childNodes[i]);		
						} else {
							i++;
						}
					} else {
						i++;
					}
				}
			}	
		} 
		return subMenu;		
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
        var uo = g_busObj.f_getLoginUserObj();		
		if (thisObj.m_user == undefined) {
		    thisObj.m_user = g_busObj.f_getLoginUserRec();			
		}
		return (thisObj.m_user.m_role == uo.V_ROLE_USER);
	}
	
	this.f_isInstaller = function() {
        var uo = g_busObj.f_getLoginUserObj();	
		if (thisObj.m_user == undefined) {
		    thisObj.m_user = g_busObj.f_getLoginUserRec();			
		}
		return (thisObj.m_user.m_role == uo.V_ROLE_INSTALL);		
	}
	
	this.f_isAdmin = function() {
        var uo = g_busObj.f_getLoginUserObj();		
		if (thisObj.m_user == undefined) {
		    thisObj.m_user = g_busObj.f_getLoginUserRec();			
		}
		return (thisObj.m_user.m_role == uo.V_ROLE_ADMIN);		
	}	
}

///////////////////////////////////////////////
// new FT_roleManager object
g_roleManagerObj = new FT_roleManager();