/*
 Document   : utm_htmlBuilder.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: This object dynamic prepares some html tags for our app.
 */
function UTM_htmlBuilder()
{
	var thisObj =  this;
		
	this.f_prepare = function() {
		thisObj.f_buildNav2();
		thisObj.f_buildSm();
		thisObj.f_buildDynSm();
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

	var smDashBoardMenu = [
	    { 'key': 'dashboard_l2', 'desc': g_lang.m_menu_des_dashboard, 'value': g_lang.m_menu_dashboard}
	];	
	var smFirewallMenu = [
	    { 'key': 'zone_l2', 'desc': g_lang.m_menu_des_zone_mgt, 'value': g_lang.m_menu_zone_mgt},
		{ 'key': 'firewall_l2', 'desc': g_lang.m_menu_des_firewall, 'value': g_lang.m_menu_firewall}
	];	
	var smIdpMenu = [
	    { 'key': 'easy_idp_l2', 'desc': g_lang.m_menu_des_easy_mode, 'value': g_lang.m_menu_easy_mode},
		{ 'key': 'expert_idp_l2', 'desc': g_lang.m_menu_des_expert_mode, 'value': g_lang.m_menu_expert_mode}
	];
	var smAvsMenu = [
	    { 'key': 'avs_l2', 'desc': g_lang.m_menu_des_avs, 'value': g_lang.m_menu_avs}
	];
	var smAspMenu = [
	    { 'key': 'asp_l2', 'desc': g_lang.m_menu_des_asp, 'value': g_lang.m_menu_asp}
	];		
	var smWebfMenu = [
	    { 'key': 'easy_webf_l2', 'desc': g_lang.m_menu_des_easy_filtering, 'value': g_lang.m_menu_easy_filtering},
	    { 'key': 'expert_webf_l2', 'desc': g_lang.m_menu_des_expert_filtering, 'value': g_lang.m_menu_expert_filtering}		
	];			
	var smImp2pMenu = [
	    { 'key': 'imp2p_l2', 'desc': g_lang.m_menu_des_imp2p, 'value': g_lang.m_menu_imp2p}
	];			
	var smVpnMenu = [
	    { 'key': 'vpn_overview_l2', 'desc': g_lang.m_menu_des_overview, 'value': g_lang.m_menu_overview},
	    { 'key': 'vpn_s2s_l2', 'desc': g_lang.m_menu_des_s2s, 'value': g_lang.m_menu_s2s},		
	    { 'key': 'vpn_remote_l2', 'desc': g_lang.m_menu_des_remote_users, 'value': g_lang.m_menu_remote_users}				
	];				
	var smLogMenu = [
	    { 'key': 'log_l2', 'desc': g_lang.m_menu_des_log, 'value': g_lang.m_menu_log}
	];
					
	var smArray = [
	    { 'divId' : 'sm_dashboard', 'h3': g_lang.m_menu_dashboard, 'subMenu': smDashBoardMenu},
		{ 'divId' : 'sm_firewall', 'h3': g_lang.m_menu_firewall, 'subMenu': smFirewallMenu},
		{ 'divId' : 'sm_idp', 'h3': g_lang.m_menu_idp, 'subMenu': smIdpMenu},
		{ 'divId' : 'sm_avs', 'h3': g_lang.m_menu_avs, 'subMenu': smAvsMenu},
		{ 'divId' : 'sm_asp', 'h3': g_lang.m_menu_asp, 'subMenu': smAspMenu},
		{ 'divId' : 'sm_webf', 'h3': g_lang.m_menu_webf, 'subMenu': smWebfMenu},
		{ 'divId' : 'sm_imp2p', 'h3': g_lang.m_menu_imp2p, 'subMenu': smImp2pMenu},
		{ 'divId' : 'sm_vpn', 'h3': g_lang.m_menu_vpn, 'subMenu': smVpnMenu},
		{ 'divId' : 'sm_log', 'h3': g_lang.m_menu_log, 'subMenu': smLogMenu}		
	];	
	
	this.f_buildSmElement = function(smItem) {
					
		var divId = smItem.divId;
		var h3 = smItem.h3;
		var subMenu = smItem.subMenu;
				
		var html = '<ul id="' + divId + '_ul">' +
                       '<li class="left_sub_menu_header">' +
                          '<h3>&nbsp;' + h3 + '</h3>' +
                       '</li>' + 
                       '<li class="left_sub_menu_liner"></li>';
					   
        for (var i=0; i < subMenu.length; i++) {
			html += '<li id="' + subMenu[i].key + '">' +
			        '<a href="#" desc="' + subMenu[i].desc + '"><img border="0" src="images/fleche_off.gif">&nbsp;' + 
					    subMenu[i].value + '</a>' +
					'</li>';
		}					   
		html += '<li class="left_sub_menu_liner"></li></ul>';
                  
		var div = document.getElementById(divId);
		if (div != null) {
			div.innerHTML = html;
		}		
	}	
	
	
	this.f_buildSm= function() {
	    for (var i=0; i < smArray.length; i++) {
			thisObj.f_buildSmElement(smArray[i]);
		}
	}

	var dynSmZoneMenu = [
	    { 'key': 'firewall_zone_mgmt_editor_l2', 'desc': g_lang.m_menu_des_add_zone, 'value': g_lang.m_menu_add_zone},
	    { 'key': 'firewall_zone_mgmt_editor_updatel2', 'desc': g_lang.m_menu_des_update_zone, 'value': g_lang.m_menu_update_zone}		
	];
	var dynSmFwMenu = [
	    { 'key': 'firewall_custom_l2', 'desc': g_lang.m_menu_des_custom_firewall, 'value': g_lang.m_menu_custom_firewall}
	];	
	var dynSmWebfMenu = [
	    { 'key': 'easy_webf_by_url_l2', 'desc': g_lang.m_menu_des_authorized_urls, 'value': g_lang.m_menu_authorized_urls},
	    { 'key': 'easy_webf_by_word_l2', 'desc': g_lang.m_menu_des_ban_keyword, 'value': g_lang.m_menu_ban_keyword}		
	];	
	var dynSmVpnMenu = [
	    { 'key': 'vpn_remote_usr_grp_l2', 'desc': g_lang.m_menu_des_remote_users, 'value': g_lang.m_menu_remote_users},
	    { 'key': 'vpn_remote_usr_add_l2', 'desc': g_lang.m_menu_des_remote_users, 'value': g_lang.m_menu_des_remote_users}		
	];		
	var dynSmArray = [
	    { 'id' : 'sm_firewall_zone_dyn_ul', 'subMenu': dynSmZoneMenu},
	    { 'id' : 'sm_firewall_dyn_ul', 'subMenu': dynSmFwMenu},
	    { 'id' : 'sm_webf_dyn_ul', 'subMenu': dynSmWebfMenu},		
	    { 'id' : 'sm_vpn_dyn_ul', 'subMenu': dynSmVpnMenu}			
	]

	this.f_buildDynSmElement = function(smItem) {
		
		var id = smItem.id;
		var subMenu = smItem.subMenu;
		var ul = document.createElement('ul');
		ul.setAttribute('id', id);

		var html = '';
					   
        for (var i=0; i < subMenu.length; i++) {
			html += '<li id="' + subMenu[i].key + '">' +
			        '<a href="#" desc="' + subMenu[i].desc + '"><img border="0" src="images/fleche_off.gif">&nbsp;' + 
					    subMenu[i].value + '</a>' +
					'</li>';
		}				
		
		ul.innerHTML = html;
                  
		var div = document.getElementById('dyn_sub_menu');
		if (div != null) {
			div.appendChild(ul);
		}		
	}	
		
	this.f_buildDynSm= function() {
	    for (var i=0; i < dynSmArray.length; i++) {
			thisObj.f_buildDynSmElement(dynSmArray[i]);
		}
	}	
	
}

