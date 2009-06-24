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
	    thisObj.f_buildNav2();
		thisObj.f_buildSm();
		thisObj.f_buildDynSm();		
		thisObj.f_initDebugTray();		
	}
		
    var nav2menu = [ 
		{ 'key': 'lan_l1', 'value': g_lang.m_menu_lan_multi },
        { 'key': 'nat_l1', 'value' : g_lang.m_menu_nat_pat },
		{ 'key': 'ip_route_l1', 'value' : g_lang.m_menu_csc_router }//,
        //{ 'key': 'dns_l1', 'value' : g_lang.m_menu_dns }					
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
	
	var smLanMenu = [
	    { 'key': 'portconf_l2', 'desc': g_lang.m_menu_des_port_config, 'value': g_lang.m_menu_port_config},
	    { 'key': 'lan_l2', 'desc': g_lang.m_menu_lan + ' ' + g_lang.m_portconf_interface, 
		                   'value': g_lang.m_menu_lan + ' ' + g_lang.m_portconf_interface},
	    { 'key': 'lan2_l2', 'desc': g_lang.m_menu_lan2 + ' ' + g_lang.m_portconf_interface, 
		                    'value': g_lang.m_menu_lan2 + ' ' + g_lang.m_portconf_interface},
	    { 'key': 'dmz_l2', 'desc': g_lang.m_menu_dmz + ' ' + g_lang.m_portconf_interface, 
		                   'value': g_lang.m_menu_dmz + ' ' + g_lang.m_portconf_interface}	
	];
	var smNatPatMenu = [
	    { 'key': 'nat_l2', 'desc': g_lang.m_menu_nat_pat, 'value': g_lang.m_menu_nat_pat}
	];		
	var smIpRouteMenu = [
	    { 'key': 'ip_route_l2', 'desc': g_lang.m_menu_des_csc_router, 'value': g_lang.m_menu_csc_router}
	];	
	var smDnsMenu = [
	    { 'key': 'dns_l2', 'desc': g_lang.m_menu_dns, 'value': g_lang.m_menu_dns}
	];		
	var smArray = [
	    { 'divId' : 'sm_lan', 'h3': g_lang.m_menu_lan_multi, 'subMenu': smLanMenu},
	    { 'divId' : 'sm_nat', 'h3': g_lang.m_menu_nat_pat, 'subMenu': smNatPatMenu},
	    { 'divId' : 'sm_ip_route', 'h3': g_lang.m_menu_des_csc_router, 'subMenu': smIpRouteMenu}//,
	    //{ 'divId' : 'sm_dns', 'h3': g_lang.m_menu_dns, 'subMenu': smDnsMenu}	
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

    /*
	var dynSmZoneMenu = [
	    { 'key': 'firewall_zone_mgmt_editor_l2', 'desc': g_lang.m_menu_des_add_zone, 'value': g_lang.m_menu_add_zone},
	    { 'key': 'firewall_zone_mgmt_editor_updatel2', 'desc': g_lang.m_menu_des_update_zone, 'value': g_lang.m_menu_update_zone}		
	];
	*/	
	var dynSmArray = [
	    //{ 'id' : 'sm_firewall_zone_dyn_ul', 'subMenu': dynSmZoneMenu},		
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

	this.f_initDebugTray = function() {
		var div = document.getElementById('debug_div');		
		if (div != null) {
			if (g_devConfig.m_debug) {
				div.style.backgroundColor = '#CCC';
				div.style.display = 'block';
			} else {
			    div.style.display = 'none';
			}
		}
	}	
	
}