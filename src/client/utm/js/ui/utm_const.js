
/*
 Document   : utm_const.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: This defines the constants
 */
if (typeof VYA == 'undefined') {
    VYA = {};
}

VYA.UTM_CONST = {

    ///////////////////////////////////////////////////
    // Defines the DOM element ID
	OA_ID : 'openapp',
	BLB_ID : 'blb',
	
	//-----Main
	DOM_MAIN_ID : 'main',
	
	//-----Main Panel
	DOM_MAIN_PANEL_OA_CONTAINER_ID: 'oa_container',
    DOM_MAIN_PANEL_2_NAV_ID: 'oa_2_nav',
    DOM_MAIN_PANEL_2_NAV_UL_ID: 'oa_2_nav_ul',
    DOM_MAIN_PANEL_2_NAV_HOLDER_ID: 'oa_2_nav_wrapper',
    DOM_MAIN_PANEL_LEFT_MENU_HOLDER_ID: 'sub_menu_container',
        
	//-----Secondary Menu
	DOM_2_NAV_DASHBOARD_ID : 'dashboard_l1',
	DOM_2_NAV_FW_ID : 'firewall_l1',
	DOM_2_NAV_IDP_ID : 'idp_l1',
	DOM_2_NAV_AVS_ID : 'avs_l1',
	DOM_2_NAV_ASP_ID : 'asp_l1',
	DOM_2_NAV_WEBF_ID : 'webf_l1',
	DOM_2_NAV_IMP2P_ID : 'imp2p_l1',
	DOM_2_NAV_VPN_ID : 'vpn_l1',
	DOM_2_NAV_LOG_ID : 'log_l1',		
	
	//-----Third Menu 	
	DOM_3_NAV_DASHBOARD_ID : 'sm_dashboard',
	DOM_3_NAV_FW_ID : 'sm_firewall',
	DOM_3_NAV_IDP_ID : 'sm_idp',
	DOM_3_NAV_AVS_ID : 'sm_avs',
	DOM_3_NAV_ASP_ID : 'sm_asp',
	DOM_3_NAV_WEBF_ID : 'sm_webf',
	DOM_3_NAV_IMP2P_ID : 'sm_imp2p',
	DOM_3_NAV_VPN_ID : 'sm_vpn',
	DOM_3_NAV_LOG_ID : 'sm_log',	
	
	//-----Configuration menu item id.
	//-----Dashboard
	DOM_3_NAV_SUB_DASHBOARD_ID : 'dashboard_l2',
    //-----Firewall		
	DOM_3_NAV_SUB_ZONE_ID : 'zone_l2',
	DOM_3_NAV_SUB_FW_ID : 'firewall_l2',	
    //-----IDP	
	DOM_3_NAV_SUB_EASY_IDP_ID : 'easy_idp_l2',
	DOM_3_NAV_SUB_EXPERT_IDP_ID: 'expert_idp_l2',
    //-----AVS	
	DOM_3_NAV_SUB_AVS_ID: 'avs_l2',
    //-----APS	
    DOM_3_NAV_SUB_APS_ID : 'asp_l2',
    //-----WEB FILTERING		 
    DOM_3_NAV_SUB_EASY_WEBF_ID : 'easy_webf_l2',	
    DOM_3_NAV_SUB_EXPERT_WEBF_ID : 'expert_webf_l2',
    //-----IM & P2P			
    DOM_3_NAV_SUB_IMP2P_ID : 'imp2p_l2',	
    //-----VPN		
    DOM_3_NAV_SUB_VPN_OVERVIEW_ID : 'vpn_overview_l2',
    DOM_3_NAV_SUB_VPN_S2S_ID : 'vpn_s2s_l2',
    DOM_3_NAV_SUB_VPN_REMOTE_ID : 'vpn_remote_l2',
    //-----Logs		
    DOM_3_NAV_SUB_LOG_ID : 'log_l2',
		
	//-----Dynamic menu item id.
	//-----VPN		
    DOM_3_NAV_SUB_VPN_REMOTE_USR_GRP_ID : 'vpn_remote_usr_grp_l2',
    DOM_3_NAV_SUB_VPN_REMOTE_USR_ADD_ID : 'vpn_remote_usr_add_l2',			
		
	//-----Configuration Panel
	DOM_3_CONFIG_PANEL_ID : 'config_panel',
	DOM_3_FT_CONTAINER_ID : 'ft_container',	
	DOM_3_CONFIG_PANEL_TITLE_ID : 'config_panel_title',
    DOM_DYN_SUB_MENU_ID: 'dyn_sub_menu',	
	
    
    ///////////////////////////////////////////////////
    // Defines the DOM class attribute		
    DOM_MAIN_FRM_NAV_BAR_CLS: 'nav2',
	DOM_MAIN_PANEL_SUB_MENU_CLS: 'left_sub_menu',
    DOM_DYN_SUB_MENU_CLS: 'dyn_sub_menu'	

}
