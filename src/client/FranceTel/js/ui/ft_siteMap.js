/*
 Document   : ft_siteMap.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The main screen of the open appliance web application
 */
function FT_siteMap()
{
	/////////////////////////////////////
	// properties
	var thisObj = this;
	this.m_vmList = undefined;
	this.m_div = undefined;
		
	///////////////////////////////////////
	// functions
	/**
	 * A initialization method
	 */
	this.f_init = function(vmList)
	{
		thisObj.m_vmList = vmList;
		thisObj.m_div = thisObj.f_createDiv();		
		thisObj.f_updateTitle();
		thisObj.f_addVmLink();
		var div = document.getElementById('sitemap_div');		
		div.parentNode.removeChild(div);	
		div.style.display = 'block';		
		thisObj.m_div.appendChild(div);
	}
	
	this.f_createDiv = function()
	{
        var div = document.createElement('div');
        div.setAttribute('id', 'ft_popup_div');
		div.style.width = '560px';		      
		div.style.backgroundColor = 'white';	
        div.style.display = 'block';		
        div.style.overflow = 'visible';
        div.style.font = 'normal 10pt arial';
        div.style.borderTop = '2px solid #CCC';
        div.style.borderLeft = '2px solid #CCC';
        div.style.borderBottom = '2px solid #000';
        div.style.borderRight = '2px solid #000';	
        div.style.padding = '15px';	
		div.style.margin = '20px auto';
		
		return div;
	}
	
	this.f_updateTitle = function()
	{
	    var h3 = document.getElementById('sitemap_title');
		if (h3 != null) {
			h3.innerHTML = g_lang.m_mainMap;
		}	
	}
		
	this.f_addVmLink = function()
	{
		var ul = document.getElementById('sitemap_vmlink_ul');

		for (var i=0; i < thisObj.m_vmList.length; i++) {
			var vm = thisObj.m_vmList[i];
			if (vm.m_name == VYA.FT_CONST.OA_ID) {
				continue;
			}
			var li = document.createElement('li');
			g_xbObj.f_xbSetClassAttribute(li,'sitemap_vmlink');
			li.innerHTML = '<a href="#" onclick="f_siteMapClickHandler(\'sitemap_vmlink_' +
			    vm.m_name + '\')"><img border="0" src="' + g_lang.m_imageDir +'puce_link.gif">&nbsp;<span class="bold12">' +
				vm.m_displayName + '</span></a>';
			ul.appendChild(li);
		}
		ul.appendChild(thisObj.f_buildOAlink());
	}
	
	this.f_show = function()
	{
		var el = document.getElementById('ft_modal_popup_message');
		el.style.visibility = "visible";			
		el.appendChild(thisObj.m_div);
	}
	
	this.f_hide = function()
	{
		var el = document.getElementById('ft_modal_popup_message');
		el.style.visibility = "hidden";			
        el.removeChild(thisObj.m_div);		
	}
	
	this.f_handleClick = function(id, subId)
	{
		thisObj.f_hide();
		var index = id.indexOf('sitemap_vmlink_');
		if (index != -1) {
			id = id.substring(15,id.length);
			var path = g_mainFrameObj.f_getUrlPath(id);
			g_mainFrameObj.f_selectVm(id, path);
		} else if (id == 'closeButton') {
		    return;
		} else { //OA panel clicked, and a sub link is selected.
			g_mainFrameObj.f_selectVm(VYA.FT_CONST.OA_ID, '#');
			g_mainFrameObj.f_selectPage(id, subId);
		} 
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////
	//// beginning of building html
	//////////////////////////////////////////////////////////////////////////////////////////////
	this.f_buildOAlink = function()
	{
	    var li = document.createElement('li');
		li.setAttribute('id', 'sitemap_vmlink_oa');
		g_xbObj.f_xbSetClassAttribute(li,'sitemap_vmlink');	
		
		var html = '<a href="#" onclick="f_siteMapClickHandler(\'sitemap_vmlink_openapp\')"><img border="0" src="images/en/puce_link.gif">&nbsp;<span class="bold12">' +
		           g_lang.m_mainOA + '</span></a>';
		html += thisObj.f_buildSm();
		html += '<div class="clear"></div>';		
		li.innerHTML = html;
		return li;
	}
		
	var smAppMenu = [
	    { 'key': 'dashboard_l2', 'desc': g_lang.m_menuDashboard, 'value': g_lang.m_menuDashboard},
	    { 'key': 'update_l2', 'desc': g_lang.m_menuUpdates, 'value': g_lang.m_menuUpdates},
	    { 'key': 'restart_l2', 'desc': g_lang.m_menuRestart, 'value': g_lang.m_menuRestart},
	    { 'key': 'subscribe_l2', 'desc': g_lang.m_menuSubscribe, 'value': g_lang.m_menuSubscribe}		
	];		
	var smUserMenu = [
	    { 'key': 'user_l2', 'desc': g_lang.m_menuUsers, 'value': g_lang.m_menuUsers},
	    { 'key': 'user_right_l2', 'desc': g_lang.m_menuUserRight, 'value': g_lang.m_menuUserRight}
	];		
	var smMonitorMenu = [
	    { 'key': 'hardware_l2', 'desc': g_lang.m_menuHardware, 'value': g_lang.m_menuHardware},
	    { 'key': 'network_l2', 'desc': g_lang.m_menuNetwork, 'value': g_lang.m_menuNetwork}
	];		
	var smBackupMenu = [
	    { 'key': 'backup_l2', 'desc': g_lang.m_menuConfigBackup, 'value': g_lang.m_menuConfigBackup},
	    { 'key': 'restore_l2', 'desc': g_lang.m_menuConfigRestore, 'value': g_lang.m_menuConfigRestore}
	];		
	var smConfigMenu = [
	    { 'key': 'email_serv_l2', 'desc': g_lang.m_menuEmailServer, 'value': g_lang.m_menuEmailServer},
	    { 'key': 'time_serv_l2', 'desc': g_lang.m_menuTimeServer, 'value': g_lang.m_menuTimeServer},
	    { 'key': 'user_dir_l2', 'desc': g_lang.m_menuUserDir, 'value': g_lang.m_menuUserDir},
	    { 'key': 'blb_l2', 'desc': g_lang.m_menuBLBAssocication, 'value': g_lang.m_menuBLBAssocication},
	    { 'key': 'password_l2', 'desc': g_lang.	m_menuPasswordPolicy, 'value': g_lang.	m_menuPasswordPolicy}				
	];	
	var smMyProfileMenu = [
	    { 'key': 'myprof_l2', 'desc': g_lang.m_menuMyProfile, 'value': g_lang.m_menuMyProfile }
	];						
	var smArray = [
	    { 'divId' : 'sm_applications', 'h3': g_lang.m_menuApp, 'subMenu': smAppMenu, 'linkId': 'app_l1'},
	    { 'divId' : 'sm_users', 'h3': g_lang.m_menuUsers, 'subMenu': smUserMenu, 'linkId' : 'user_l1'},
	    { 'divId' : 'sm_monitoring', 'h3': g_lang.m_menuMonitor, 'subMenu': smMonitorMenu, 'linkId' : 'mon_l1'},
	    { 'divId' : 'sm_backup', 'h3': g_lang.m_menuBackup, 'subMenu': smBackupMenu, 'linkId' : 'backup_l1'},
	    { 'divId' : 'sm_config', 'h3': g_lang.m_menuConfig, 'subMenu': smConfigMenu, 'linkId' : 'config_l1'},
	    { 'divId' : 'sm_myprof', 'h3': g_lang.m_menuMyProfile, 'subMenu': smMyProfileMenu, 'linkId' : 'myprof_l1'}
	];	
	this.f_checkRole = function() {
		if (g_roleManagerObj.f_isAdmin()) {
			thisObj.f_applyRoleAdmin();
		} else if (g_roleManagerObj.f_isUser()) {
			thisObj.f_applyRoleUser();
			thisObj.m_div.style.width = '300px';
		}		
	}	
	this.f_applyRoleAdmin = function() {
		var i=0;
		while (i < smConfigMenu.length) {
			if ((smConfigMenu[i].key == 'time_serv_l2') || (smConfigMenu[i].key == 'blb_l2')) {
				smConfigMenu.splice(i,1);
			} else {
				i++;
			}
		}
	}
	this.f_applyRoleUser = function() {
		var i=0;
		var removeIds  = ['sm_applications', 'sm_users', 'sm_monitoring', 'sm_backup', 'sm_config'];
		while ( i < smArray.length) {
			if (removeIds.indexOf(smArray[i].divId) >= 0) {
				smArray.splice(i,1);
			} else {
				i++;
			}
		}
	}
	this.f_buildSm = function() {
		var html = '';
		
		thisObj.f_checkRole();
		
	    for (var i=0; i < smArray.length; i++) {
			html += thisObj.f_buildSmElement(smArray[i]);
			if (i==2) {
				html += '<div class="clear"></div>';
			}
		}	
		return html;	
	}
	this.f_buildSmElement = function(smItem) {
				
		var html = '<div id="' + smItem.divId + '" class="sitemap_menu">' + 	
		           '<ul id="' + smItem.divId + '_ul">' +
				   '<li class="sitemap_menu_header"><h3>' + smItem.h3 + '</h3></li>' +
				   '<li class="sitemap_menu_liner"></li>';		

		var subMenu = smItem.subMenu;
								
        for (var i=0; i < subMenu.length; i++) {
			html += '<li id="' + subMenu[i].key + '_sitemap">' +
			        '<a href="#" desc="' + subMenu[i].desc + '" onclick="f_siteMapClickHandler(\'' + smItem.linkId  +
					 '\',\'' + subMenu[i].key + '\')">' +
					 '<img border="0" src="' + g_lang.m_imageDir + 'fleche_off.gif">&nbsp;' + 
					    subMenu[i].value + '</a>' +
					'</li>';
		}					   
		html += '<li class="sitemap_menu_liner"></li></ul></div>';
                  
        return html;		
	}	
}

function f_siteMapClickHandler(id, subId)
{
    g_mainFrameObj.m_siteMap.f_handleClick(id, subId);
}

function f_siteMapClick()
{
	if(!g_busObj.f_isLogin()) {
		return;
	}
	g_mainFrameObj.m_siteMap.f_show();
}
