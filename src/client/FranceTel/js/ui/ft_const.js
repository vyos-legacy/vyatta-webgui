
/*
 Document   : ft_const.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: This defines the constants
 */
if (typeof VYA == 'undefined') {
    VYA = {};
}

VYA.FT_CONST = {

    ///////////////////////////////////////////////////
    // Defines the DOM element ID
	OA_ID : 'Open Applicance',
	BLB_ID : 'Business Livebox',
	
	//-----Main
	DOM_MAIN_ID : 'main',
	
	//-----Logoff Button
	DOM_LOGOFF_ID : 'logoff',
	
	//-----Header Section
	DOM_WELCOME_ID : 'welcome',
	DOM_LOGIN_CONTAINER_ID: 'login_background',
	
	//-----Main Panel
    DOM_MAIN_PANEL_ID: 'tab_content',
	DOM_MAIN_PANEL_OA_CONTAINER_ID: 'oa_container',
    DOM_MAIN_PANEL_2_NAV_ID: 'oa_2_nav',
    DOM_MAIN_PANEL_2_NAV_UL_ID: 'oa_2_nav_ul',
    DOM_MAIN_PANEL_2_NAV_HOLDER_ID: 'oa_2_nav_wrapper',
    DOM_MAIN_PANEL_LEFT_MENU_HOLDER_ID: 'sub_menu_container',
    
	//-----Main Frame
    DOM_MAIN_FRM_NAV_BAR_ID: 'nav1_tr',
    
	//-----Secondary Menu
	DOM_2_NAV_APP_ID : 'app_l1',
	DOM_2_NAV_USER_ID : 'user_l1',
	DOM_2_NAV_MON_ID : 'mon_l1',
	DOM_2_NAV_BACKUP_ID : 'backup_l1',
	DOM_2_NAV_CONFIG_ID : 'config_l1',
	DOM_2_NAV_MYPROFILE_ID : 'myprof_l1',
	
	//-----Third Menu 	
	DOM_3_NAV_APP_ID : 'sm_applications',
	DOM_3_NAV_USER_ID : 'sm_users',
	DOM_3_NAV_MON_ID : 'sm_monitoring',
	DOM_3_NAV_BACKUP_ID : 'sm_backup',
	DOM_3_NAV_CONFIG_ID : 'sm_config',
	DOM_3_NAV_MYPROFILE_ID : 'sm_myprof',
	
	//-----Configuration menu item id.
	//-----Applications
	DOM_3_NAV_SUB_DASHBOARD_ID : 'dashboard_l2',
	DOM_3_NAV_SUB_UPDATE_ID : 'update_l2',
	DOM_3_NAV_SUB_RESTART_ID : 'restart_l2',	
	DOM_3_NAV_SUB_SUBCRIBE_ID : 'subscribe_l2',
    //-----Users
    DOM_3_NAV_SUB_USER_ID : 'user_l2', 
    DOM_3_NAV_SUB_USER_RIGHT_ID : 'user_right_l2',	
    DOM_3_NAV_SUB_USER_ADD_ID : 'user_add_l2',	
    DOM_3_NAV_SUB_USER_UPDATE_ID : 'user_update_l2',		
	//-----Monitoring
    DOM_3_NAV_SUB_HARDWARE_ID : 'hardware_l2',
    DOM_3_NAV_SUB_NETWORK_ID : 'network_l2',
	//-----Backup
    DOM_3_NAV_SUB_BACKUP_ID : 'backup_l2',
    DOM_3_NAV_SUB_RESTORE_ID : 'restore_l2',	
	//-----Configuration
    DOM_3_NAV_SUB_EMAIL_SRV_ID : 'email_serv_l2',
    DOM_3_NAV_SUB_TIME_SRV_ID : 'time_serv_l2',
	DOM_3_NAV_SUB_USER_DIR_ID : 'user_dir_l2',
	DOM_3_NAV_SUB_BLB_ID : 'blb_l2',
	DOM_3_NAV_SUB_3_PARTY_ID : '3rd_party_l2',
	DOM_3_NAV_SUB_PASSWORD_ID : 'password_l2',
	//----My Profile
    DOM_3_NAV_SUB_MYPROFILE_ID : 'myprof_l2',	
		
	//-----Configuration Panel
	DOM_3_CONFIG_PANEL_ID : 'ft_container',
	DOM_3_CONFIG_PANEL_TITLE_ID : 'config_panel_title',
    DOM_DYN_SUB_MENU_ID: 'dyn_sub_menu',	
	
    
    ///////////////////////////////////////////////////
    // Defines the DOM class attribute		
    DOM_MAIN_FRM_NAV_BAR_CLS: 'nav2',
	DOM_MAIN_PANEL_SUB_MENU_CLS: 'left_sub_menu',
    DOM_DYN_SUB_MENU_CLS: 'dyn_sub_menu'	



}
