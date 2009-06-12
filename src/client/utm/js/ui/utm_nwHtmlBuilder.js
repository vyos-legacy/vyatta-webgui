/*
 Document   : utm_nwHtmlBuilder.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: This object dynamic prepares some html tags for our app.
 */
function UTM_htmlBuilder()
{
	var thisObj =  this;
		
	this.f_prepare = function() {
		//thisObj.f_buildNav2();
	}
		
    var nav2menu = [ 
		{ 'key': 'dashboard_l1', 'value': g_lang.m_menu_dashboard },
        { 'key': 'firewall_l1', 'value' : g_lang.m_menu_firewall },
		{ 'key': 'idp_l1', 'value' : g_lang.m_menu_idp },
        { 'key': 'avs_l1', 'value' : g_lang.m_menu_avs },
        { 'key': 'asp_l1', 'value' : g_lang.m_menu_asp },
        { 'key': 'webf_l1', 'value': g_lang.m_menu_webf },
		{ 'key': 'imp2p_l1', 'value': g_lang.m_menu_imp2p },
		{ 'key': 'vpn_l1', 'value': g_lang.m_menu_vpn },
        { 'key': 'log_l1', 'value': g_lang.m_menu_log }							
	]	
	this.f_buildNav2 = function() {		
		var html = '<ul id="oa_2_nav_ul">';
		for (var i=0; i < nav2menu.length; i++) {
			html +=  '<li id="' + nav2menu[i].key + '">' +
                          '<a href="#"><img border="0" src="images/carre.gif">&nbsp;' + nav2menu[i].value + '</a>' +
                      '</li>';
		}
		html += '</ul>';
		html +=  '<div class="liner"></div>';
		
		var div = document.getElementById('oa_2_nav');
		if (div != null) {
			div.innerHTML = html;
		}
	}
	
	
	
	
}