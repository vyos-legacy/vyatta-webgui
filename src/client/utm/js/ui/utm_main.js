/**
 * @author loi
 */
g_xbObj.f_xbOnDomReady(function(){
    g_utmMainPanel = new UTM_mainPanel();
	g_utmHtmlBuilder = new UTM_htmlBuilder();
	g_utmHtmlBuilder.f_prepare();		
		
    if (!g_busObj.f_isLogin()) {
		g_utmMainPanel.f_login();
	} else {	
	    g_utmHtmlBuilder.f_configMenu();		
	}
});



