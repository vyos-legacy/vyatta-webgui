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
    this.m_tabPanel = undefined;
    this.m_priNavigation = undefined;
	this.m_siteMap = undefined;
	this.m_doneInitComponent = false;
    
    ///////////////////////////////////////
    // functions
    /**
     * A initialization method
     */
    this.f_init = function(){
        var logoff = document.getElementById(VYA.FT_CONST.DOM_LOGOFF_ID);
        g_xbObj.f_xbAttachEventListener(logoff, 'click', thisObj.f_handleClickLogoff, true);			
        thisObj.m_tabPanel = new FT_tabPanel();		
        thisObj.m_priNavigation = new FT_primaryNavigation();
		thisObj.m_siteMap = new FT_siteMap();
    }
	
	this.f_isSitemapSelection = function() {
		return thisObj.m_siteMap.f_isSitemapSelection();
	}
	
	this.f_setSitemapSelection = function(flag) {
		thisObj.m_siteMap.f_setSitemapSelection(flag);
	}
	
	this.f_resizeChildIframe = function(h)
	{
		this.m_tabPanel.f_resizeChildIframe(h);
	}
    
	this.f_getTabPanel = function() {
		return thisObj.m_tabPanel;
	}
	
	this.f_login = function (loginPage) {
		var welcome = document.getElementById(VYA.FT_CONST.DOM_WELCOME_ID);
		welcome.style.display = 'none';
		var login = document.getElementById(VYA.FT_CONST.DOM_LOGIN_CONTAINER_ID);
		login.style.display = 'block';		
        var e = document.getElementById('welcome_admin');
		e.innerHTML = g_lang.m_mainFrmWelcome + ' ' + 
		  g_lang.m_mainFrmGuest + ', ' +
		  g_lang.m_mainFrmSignIn;	
	}
	
	this.f_hideHeader = function(hide) {
		var header = document.getElementById(VYA.FT_CONST.DOM_HEADER_ID);
		if (hide) {
			header.style.display = 'none';
		} else {
			header.style.display = 'block';
		}
	}
	
	this.f_setBannerImage = function() {		
		var img = document.getElementById('login_banner');
		var warningDiv = document.getElementById('messageContactServiceCustomer');
		var isBLB = g_utils.f_getIsBLB();

		if (isBLB == g_consObj.V_BLB_YES) {
		    img.src = g_lang.m_imageDir + 'op_login_image.gif';		
			warningDiv.innerHTML = g_lang.m_mainBLBWarning;			
		} else {
		    img.src = g_lang.m_imageDir + 'oa_banner.gif';	
			warningDiv.innerHTML = g_lang.m_mainWarning;
		}
	}
	
	this.f_hideLogin = function (hide) {
		var login = document.getElementById(VYA.FT_CONST.DOM_LOGIN_CONTAINER_ID);
		if (hide) {
			login.style.display = 'none';
		} else {
			login.style.display = 'true';
		}
        var e = document.getElementById('welcome_admin');		
		var admin = g_busObj.f_getLoginUserRec().m_user;
		//alert('admin: ' + admin + ' loginObj: ' + g_busObj.f_getLoginUserRec());
		e.innerHTML = g_lang.m_mainFrmWelcome + ' ' + 
		    admin + ', ' +
			g_lang.m_mainFrmConnected;		
	}
	
	this.f_logout = function() {
		thisObj.m_tabPanel.f_stopPolling();
	    g_busObj.f_userLogout();	
	}
	
	this.f_getUrlPath = function(vmId) {
		if (vmId == VYA.FT_CONST.OA_ID) {
			return '#';
		}
		for (var i=0; i < thisObj.m_vmList.length; i++) {
			if (vmId == thisObj.m_vmList[i].m_name) {
				return thisObj.m_vmList[i].m_guiUri;
			}
		}
		return 'undefined';
	}
	
    /*
     * Initialialize the main content after login.
     */
    this.f_initComponent = function(vmList){
    
	    if (thisObj.m_doneInitComponent == true) {
			return; //fix for safari, where this function is called multiple times.
		} else {
			thisObj.m_doneInitComponent = true;
		}
        var oa_2nav = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_2_NAV_ID);
        oa_2nav.style.display = 'none';
        thisObj.m_tabPanel.f_init();
        
		//Make a copy of the vmList
		thisObj.m_vmList = new Array();
		
		var bUtmIncluded = false;
		var uriPath = '';
		var index = -1;
		
		for (var i=0; i < vmList.length; i++) {
			var vmRec = new FT_vmRecObj(vmList[i].m_name, vmList[i].m_displayName);
			vmRec.m_guiUri = vmList[i].m_guiUri;
			thisObj.m_vmList.push(vmRec);
			//insert the 'network' tab right after the 'open appliance' tab.
			if (vmRec.m_name == VYA.FT_CONST.OA_ID) {
				vmRec = new FT_vmRecObj('netconf', g_lang.m_networkConfig);
				vmRec.m_guiUri = '';
			    thisObj.m_vmList.push(vmRec);		
				index = i+1;		
			} else if (vmRec.m_name == 'utm') {
				bUtmIncluded = true;
				uriPath = vmRec.m_guiUri;
				
				if (g_devConfig.m_debug) {
					vmRec.m_guiUri = vmRec.m_guiUri + g_devConfig.m_utmPathSuffix;
				}
				
		        var lang = g_utils.f_getLanguage();
		        if (lang == g_consObj.V_NOT_FOUND) {
			        lang = g_consObj.V_LANG_EN;
		        }
				uriPath = vmRec.m_guiUri + 'utm_netconf_' + lang + '.html';																			
			}
		}
		if (bUtmIncluded) {
		    thisObj.m_vmList[index].m_guiUri = uriPath;	
		} else {
			thisObj.m_vmList.splice(index,1);
		}
        //thisObj.m_vmList = vmList;
        thisObj.m_priNavigation.f_init(thisObj, thisObj.m_vmList);
		thisObj.m_siteMap.f_init(thisObj.m_vmList);        
    }
    
    
    /*
     * Render this VM (based on the ID) in an external iframe.
     */
    this.f_showOther = function(vmId, urlPath){
        thisObj.m_tabPanel.f_show(vmId, urlPath);
    }
    
    /*
     * Render the Open Appliance Panel
     */
    this.f_showOApanel = function(vmId, urlPath){					
        thisObj.m_tabPanel.f_show(vmId, urlPath);
    }
	
	/*
	 * Select a page inside OA
	 */
	this.f_selectPage = function(id, subId) {
		thisObj.m_tabPanel.f_selectPage(id, subId);
	}
    
    /*
     * Render this VM.  No primary selection alter.
     */
    this.f_showVm = function(vmId, urlPath){
        if (vmId == VYA.FT_CONST.OA_ID) {
            thisObj.f_showOApanel(vmId, urlPath);
        } else {
            thisObj.f_showOther(vmId, urlPath);
        }
    }
	
	/*
	 * This function called the primary navigation f_selectVm to mimic the case
	 * the user clicks on the primary navigation bar.  
	 * This function is called in ft_siteMap.
	 */
	this.f_selectVm = function(vmId, urlPath) {
	    thisObj.m_priNavigation.f_selectVm(vmId, urlPath);	
	}
	
	
	this.f_handleClickLogoff = function(event) {
        thisObj.f_logout();	
	}
	
	this.f_timeout = function() {
        g_utils.f_popupMessage('timeout', 'timeout', null, true,
                      'f_confHandleSessionTimeoutConfirm()');		
	}    
}

///////////////////////////////////////////////
// new FT_mainFrame object
g_mainFrameObj = new FT_mainFrame();

function f_onLanguageChange() 
{
	var e = document.getElementById('ft_language');
	g_utils.f_saveLanguage(e.value);
    g_utils.f_gotoHomePage();
}

function f_home()
{
    g_utils.f_gotoHomePage();	
}

function f_contact()
{
    if(g_utils.f_getLanguage() == g_consObj.V_LANG_FR)
        window.open(g_oaConfig.m_oaContactURL_fr,
                      g_lang.m_menuContact, 'height=155, width=285,scrollbars=no');
    else
        window.open(g_oaConfig.m_oaContactURL_en,
                      g_lang.m_menuContact, 'height=155, width=285,scrollbars=no');
}

function f_resizeChildIframe(h)
{
	g_mainFrameObj.f_resizeChildIframe(h);
}

function f_timeout()
{
	g_mainFrameObj.f_timeout();
}
