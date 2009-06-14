/*
 Document   : ft_htmlBuilder.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: This object dynamic prepares some html tags for our app.
 */
function FT_htmlBuilder()
{
	var thisObj = this;
	
	this.f_prepare = function()
	{
		thisObj.f_init();
		thisObj.f_buildNav2();
		thisObj.f_buildSm();
		thisObj.f_buildDynSm();
	}
	
	this.f_initLangBar = function()
	{
		 var html = '';
		 var el = document.getElementById('lang_option_en');
		 el.innerHTML = g_lang.m_mainEnglish;
		 el = document.getElementById('lang_option_fr');
		 el.innerHTML = g_lang.m_mainFrench;	
	}
	
	this.f_initFooter = function()
	{
	     var el = document.getElementById('contact_href');
		 el.innerHTML = g_lang.m_menuContact;
		 el = document.getElementById('sitemap_href');
		 el.innerHTML = g_lang.m_menuSitemap;
	}
	
	this.f_initLogout = function()
	{
		 var html = '<img border="0" src="images/en/puce_simple.gif">&nbsp;log out';
		 var el = document.getElementById('logoff');
		 el.innerHTML = html;		
	}
	
	this.f_init = function()
	{
         thisObj.f_initLangBar();
		 thisObj.f_initLogout();	
		 thisObj.f_initFooter();
	}
		
    var nav2menu = [ 
		{ 'key': 'app_l1', 'value': g_lang.m_menuApp },
        { 'key': 'user_l1', 'value' : g_lang.m_menuUsers },
		{ 'key': 'mon_l1', 'value' : g_lang.m_menuMonitor },
        { 'key': 'backup_l1', 'value' : g_lang.m_menuBackup },			
		{ 'key': 'config_l1', 'value' : g_lang.m_menuConfig },					
        { 'key': 'myprof_l1', 'value' : g_lang.m_menuMyProfile }							
	]	
	this.f_buildNav2 = function() {		
		var html = '<ul id="oa_2_nav_ul">';
		for (var i=0; i < nav2menu.length; i++) {
			html +=  '<li id="' + nav2menu[i].key + '">' +
                          '<a href="#"><img border="0" src="images/en/carre.gif">&nbsp;' + nav2menu[i].value + '</a>' +
                      '</li>';
		}
		html += '</ul>';
		html +=  '<div class="liner"></div>';
		
		var div = document.getElementById('oa_2_nav');
		if (div != null) {
			div.innerHTML = html;
		}
	}	

	var smAppMenu = [
	    { 'key': 'dashboard_l2', 'desc': g_lang.m_menu_des_Dashboard, 'value': g_lang.m_menuDashboard},
	    { 'key': 'update_l2', 'desc': g_lang.m_menu_des_UpdatePlan, 'value': g_lang.m_menuUpdates},
	    { 'key': 'restart_l2', 'desc': g_lang.m_menu_des_RestartApp, 'value': g_lang.m_menuRestart},
	    { 'key': 'subscribe_l2', 'desc': g_lang.m_menu_des_Subcription, 'value': g_lang.m_menuSubscribe}		
	];		
	var smUserMenu = [
	    { 'key': 'user_l2', 'desc': g_lang.m_menu_des_UserList, 'value': g_lang.m_menuUsers},
	    { 'key': 'user_right_l2', 'desc': g_lang.m_menu_des_UserRight, 'value': g_lang.m_menuUserRight}
	];		
	var smMonitorMenu = [
	    { 'key': 'hardware_l2', 'desc': g_lang.m_menu_des_HardwareMonitor, 'value': g_lang.m_menuHardware},
	    { 'key': 'network_l2', 'desc': g_lang.m_menu_des_NetworkMonitor, 'value': g_lang.m_menuNetwork}
	];		
	var smBackupMenu = [
	    { 'key': 'backup_l2', 'desc': g_lang.m_menu_des_ConfigBackup, 'value': g_lang.m_menuConfigBackup},
	    { 'key': 'restore_l2', 'desc': g_lang.m_menu_des_ConfigRestore, 'value': g_lang.m_menuConfigRestore}
	];		
	var smConfigMenu = [
	    { 'key': 'email_serv_l2', 'desc': g_lang.m_menu_des_EmailServerConfig, 'value': g_lang.m_menuEmailServer},
	    { 'key': 'time_serv_l2', 'desc': g_lang.m_menu_des_TimerServerConfig, 'value': g_lang.m_menuTimeServer},
	    { 'key': 'user_dir_l2', 'desc': g_lang.m_menu_des_LDAPConfig, 'value': g_lang.m_menuUserDir},
	    { 'key': 'blb_l2', 'desc': g_lang.m_menuBLBAssocication, 'value': g_lang.m_menuBLBAssocication},
	    { 'key': 'password_l2', 'desc': g_lang.	m_menu_des_PasswordPolicy, 'value': g_lang.	m_menuPasswordPolicy}				
	];	
	var smMyProfileMenu = [
	    { 'key': 'myprof_l2', 'desc': g_lang.m_menu_des_MyProfile, 'value': g_lang.m_menuMyProfile }
	];
	var smArray = [
	    { 'divId' : 'sm_applications', 'h3': g_lang.m_menuApp, 'subMenu': smAppMenu},
	    { 'divId' : 'sm_users', 'h3': g_lang.m_menuUsers, 'subMenu': smUserMenu},
	    { 'divId' : 'sm_monitoring', 'h3': g_lang.m_menuMonitor, 'subMenu': smMonitorMenu},
	    { 'divId' : 'sm_backup', 'h3': g_lang.m_menuBackup, 'subMenu': smBackupMenu},
	    { 'divId' : 'sm_config', 'h3': g_lang.m_menuConfig, 'subMenu': smConfigMenu},
	    { 'divId' : 'sm_myprof', 'h3': g_lang.m_menuMyProfile, 'subMenu': smMyProfileMenu}
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

	var dynSmUserMenu = [
	    { 'key': 'user_add_l2', 'desc': g_lang.m_menu_des_AddUser, 'value': g_lang.m_menuAddUser},
	    { 'key': 'user_update_l2', 'desc': g_lang.m_menu_des_UpdateUser, 'value': g_lang.m_menuUpdateUser}		
	];	
	var dynSmAppMenu = [
	    { 'key': 'sched_update_l2', 'desc': g_lang.m_menu_des_Update, 'value': g_lang.m_menuUpdate},
	    { 'key': 'restore_update_l2', 'desc': g_lang.m_menu_des_Restore, 'value': g_lang.m_menuRestore}		
	];		
	var dynSmBackupMenu = [
	    { 'key': 'restore_desc_l2', 'desc': g_lang.m_menu_des_RestoreDesc, 'value': g_lang.m_menuRestoreDesc}		
	];		
	var dynSmConfigMenu = [
	    { 'key': 'blb_check_l2', 'desc': g_lang.m_menuBLBCredCheck, 'value': g_lang.m_menuBLBCredCheck}		
	];		
	var dynSmArray = [
	    { 'id' : 'sm_users_dyn_ul', 'subMenu': dynSmUserMenu},		
	    { 'id' : 'sm_applications_dyn_ul', 'subMenu': dynSmAppMenu},		
	    { 'id' : 'sm_backup_dyn_ul', 'subMenu': dynSmBackupMenu},		
	    { 'id' : 'sm_config_dyn_ul', 'subMenu': dynSmConfigMenu}			
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