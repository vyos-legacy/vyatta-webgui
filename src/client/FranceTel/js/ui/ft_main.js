/**
 * @author loi
 */
g_xbObj.f_xbOnDomReady(function(){
    /*
     alert('DOM is ready.  isIE: ' + g_isIE + ' isGecko:' + g_isGecko
     + ' isOpera:' + g_isOpera + ' isSafari:' + g_isSafari + ' isKDE:' + g_isKDE
     + ' isIE5mac:' + g_isIE5mac + ' browserVer:' + g_browserVer);
     */
	
	g_htmlBuilder = new FT_htmlBuilder();
    g_htmlBuilder.f_prepare();	
	
    g_mainFrameObj.f_init();
    g_utils.m_homePage = window.location.href;
	
    if(!g_busObj.f_isLogin()) {
        var loginDiv = g_loginObj.f_getLoginPage();		
        g_mainFrameObj.f_hideHeader(true);
        g_mainFrameObj.f_setBannerImage();
        g_mainFrameObj.f_login(loginDiv);
    } else {
        g_mainFrameObj.f_hideHeader(false);
        g_mainFrameObj.f_hideLogin(true);
        g_busObj.f_getVMSummaryDataFromServer(function(evt){
            if (evt.f_isError()) {
                alert('Error: ' + evt.m_errMsg);
            } else {
                g_mainFrameObj.f_initComponent(evt.m_value);
            }
        });
    }
});



