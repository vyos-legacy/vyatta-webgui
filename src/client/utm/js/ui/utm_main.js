/**
 * @author loi
 */
g_xbObj.f_xbOnDomReady(function(){
    g_utmMainPanel = new UTM_mainPanel();
	
    if (!g_busObj.f_isLogin()) {
		g_utmMainPanel.f_login();
	} else {	
		g_utmMainPanel.f_init();
		g_utmMainPanel.f_show();
		g_utmMainPanel.f_selectMenuItem(VYA.UTM_CONST.DOM_2_NAV_DASHBOARD_ID);
	}
});



