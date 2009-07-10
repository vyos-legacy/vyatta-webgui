/*
    Document   : utm_language_en.js
    Created on : Mar 23, 2009, 2:18:11 PM
    Author     : Kevin.Choi
    Description:
*/

var g_lang =
{
    ///////////////////////////////////////////////////////////////////
    // Menu
    m_menu_dashboard : "dashboard",
    m_menu_des_dashboard: "Dashboard",
    m_menu_firewall : "firewall",
    m_menu_des_firewall : "firewall",
    m_menu_idp : "intrusion prevention",
    m_menu_des_idp : "intrustion prevention",
    m_menu_avs : "anti-virus",
    m_menu_des_avs: "anti-virus",
    m_menu_asp : "anti-spam",
    m_menu_des_asp: "anti-spam",
    m_menu_webf : "web filtering",
    m_menu_des_webf: "web filtering",
    m_menu_imp2p : "IM & P2P filtering",
    m_menu_des_imp2p: "IM & P2P filtering",
    m_menu_vpn : "VPN",
    m_menu_des_vpn: "VPN",
    m_menu_log : "logs",
    m_menu_des_log : "logs",
    m_menu_zone_mgt : "zone management",
    m_menu_des_zone_mgt: "zone management",
    m_menu_easy_mode : "easy mode",
    m_menu_des_easy_mode : "easy mode",
    m_menu_expert_mode : "expert mode",
    m_menu_des_expert_mode : "expert mode",
    m_menu_easy_filtering : "easy mode",
    m_menu_des_easy_filtering : "easy mode",
    m_menu_expert_filtering : "expert mode",
    m_menu_des_expert_filtering : "expert mode",
    m_menu_overview : "overview",
    m_menu_des_overview : "overview",
    m_menu_s2s : "site to site",
    m_menu_des_s2s: "site to site",
    m_menu_remote_users : "remote users",
    m_menu_des_remote_users: "remote users",
    m_menu_des_add_zone : "add zone",
    m_menu_des_update_zone: "update zone",
    m_menu_des_custom_firewall: "customized firewall",
    m_menu_des_authorized_urls : "authorized URLs",
    m_menu_des_ban_keyword : "banned keywords in URL",

    ///////////////////////////////////////////////////////////////////
    // Network configuration menu
    m_menu_lan_multi : "LAN / multi LAN",
	m_menu_lan : "LAN",
	m_menu_des_lan : "LAN/IP parameters",
	m_menu_lan2: "LAN2",
	m_menu_des_lan2 : "LAN2/IP parameters",
	m_menu_dmz : "DMZ",
	m_menu_nat_pat: "NAT/PAT",
	m_menu_csc_router: "cascaded router",
	m_menu_des_csc_router: "cascaded router",
	m_menu_dns : "DNS",
    m_menu_port_config: "port configuration",
	m_menu_des_port_config: "port configuration",

    ///////////////////////////////////////////////////////////////////
    // Dash board screen

    ////////////////////////////////////////////////////////////////////
    // common
    m_tableTooltip1 : 'Click here to perform sorting.',
    m_name : 'name',
    m_enabled : 'enable',
    m_delete : 'delete',
    m_group : 'group',
    m_username : 'user name',
    m_status : 'status',
    m_ipAddr : 'IP address',
	m_macAddr: 'MAC address',
    m_invalidIpAddr : "Invalid IP address",
    m_ipaddrTitle : "IP address validation",
    m_underConstruction : 'Under Construction',
    m_applyTip : "save changes",
    m_cancelTip : "cancel changes",
    m_confModify : "Configuration has been modified and not saved. Do you want to continue?",

    ///////////////////////////////////////////////////////////////////
    // VPN Overview
    m_vpnOVSource : 'source',
    m_vpnOVDest : 'destination',
    m_vpnOVPeerDomainName : 'peer address /domain name',
    m_vpnOVConfNode : 'configuration node',
    m_vpnOVLocal : 'local',
    m_vpnOVS2S : 'site to site connections',
    m_vpnOVRemote : 'remote users',

    ///////////////////////////////////////////////////////////////////
    // VPN RemoteUser View
    m_vpnRemoteviewHeader : "This page enables you to configure a Virtual " +
        "Private Network (VPN) Server to connect remote users.",

    ///////////////////////////////////////////////////////////////////
    // Firewall Security Level
    m_fireActiveHeader : "active zone table",
    m_fireLevelColName : "security levels",
    m_fireLevelColSelect : "select",
    m_fireLevelColDir : "direction",
    m_fireLevelColFrom : "from",
    m_fireLevelColTo : "to",
    m_fireLevelHdDef : "default",
    m_fireLevelBdDef : "all traffic blocked",
    m_fireLevelBdLANtoDMZ_Def : "all incoming traffic blocked/outgoing traffic allowed.",
    m_fireLevelBdDMZtoLAN : "all incoming traffic allowed/outgoing traffic blocked.",
    m_fireLevelHdAuth : "authorize all",
    m_fireLevelBdAuth : "firewall functionality is disabled. All incoming and outgoing traffic is authorized.",
    m_fireLevelHdStand : "standard",
    m_fireLevelBdStand : "all incoming traffic blocked/outgoing traffic allowed except Netbios.",
    m_fireLevelBdStand_WtoL : "all incoming traffic allowed except Netbios/outgoing traffic blocked.",
    m_fireLevelHdAdvan : "advanced",
    m_fireLevelBdAdvan : "all incoming and outgoing traffic blocked except those involving internet browsing and email.",
    m_fireLevelHdCustom : "customized",
    m_fireLevelBdCustom : "customisation of advanced profile.",
    m_fireLevelHdBlock : "block all",
    m_fireLevelBdBlock : "the access to internet is blocked all users.",
    m_fireLevelCustConfTip : "configure customize security",
    m_fireLevelApplyTip : "save changes",
    m_fireLevelCancelTip : "cancel changes",
    m_fireLevelAllowed : "all traffic allowed.",
    m_fireLevelExcepted : "all traffic allowed except Netbios.",
    m_fireLevelBlocked : "all traffic blocked.",


    ///////////////////////////////////////////////////////////////////
    // Firewall Zone Management
    m_fireZMAddTip : "create new zone",
    m_fireZMApplyTip : "save changes",
    m_fireZMZoneName : "zone name",
    m_fireZMMember : "zone members",
    m_fireZMMemIncluded : "included",
    m_fireZMMemAvail : "available",
    m_fireZMDesc : "description",
    m_fireZMEnable : "enabled",
    m_fireZMMemIncTip : "Double click on the selected item to move to Available list box.",
    m_fireZMMemAvailTip : "Double click on the selected item to move to Included list box.",
    m_fireZMMemError : "Member cannot be empty. Please select at least one memeber",
    m_fireZMNameError : "Zone name cannot be empty.",

    ///////////////////////////////////////////////////////////////////
    // Firewall Security Customize Level
    m_fireCustTitle : "Customized firewall",
    m_fireDeleteConfirm : "Are you sure you want to delete this rule?",
    m_fireCustDeleteConfirmHeader : "Delete Customize Rule",
    m_discardConfirm : "This action will discard all your changes. Are you sure you still want to cancel?",
    m_fireCustDiscardConfirmHeader : "Cancel All Changes",
    m_fireResetConfirm : "This action will reload rules from default profile. Are you sure you still want to reset?",
    m_fireCustResetConfirmHeader : "Reset Customize Rules",
    m_fireCustSubHeader : "specific rules",
    m_fireCustRuleNo : "rule<br>number",
    m_fireCustDirection : "direction",
    m_fireCustAppService : "application<br>/service",
    m_fireCustProtocol : "protocol",
    m_fireCustSrcIpAddr : "source IP<br> address",
    m_fireCustSrcMaskIpAddr : "source mask IP<br>address",
    m_fireCustSrcPort : "source port<small><br>Enter single<br>port number or<br>port range<br>(200-300)</small>",
    m_fireCustDestIpAddr : "destination IP<br>address",
    m_fireCustDestMaskIpAddr : "destination mask<br>IP address",
    m_fireCustDestPort : "destination<br>port<small><br>Enter single<br>port number <br>or port range<br>(200-300)</small>",
    m_fireCustInternIpAddr : "internal IP<br>Address<small><br>Single IP or an IP<br>range</small>",
    m_fireCustInternPort : "internal<br>port<small><br>Enter single<br>port number <br>or port range<br>(200-300)</small>",
    m_fireCustAction : "action",
    m_fireCustLog : "log",
    m_fireCustOrder : "order",
    m_fireCustEnable : "enable",
    m_fireCustDelete : "delete",
    m_fireCustRuleOption : "Show rules only from",
    m_fireCustApplyTip : "save all changes",
    m_fireCustCancelTip : "cancel all changes",
    m_fireCustResetTip : "reset to default",
    m_fireCustBackTip : "back to Firewall Level screen",
    m_fireCustAddTip : "add a new rule",
    m_fireCustLogEnabled : "log is enabled",
    m_fireCustEnableEnabled : "enable field is enabled",
    m_fireCustDeleteNotAllow : "delete is not allowed",
    m_fireCustLimitation : "you have reached the limit for the number of rules you can create.",
    m_fireCustOrderUpTip : "move up by one",
    m_fireCustOrderDnTip : "move down by one",

    ////////////////////////////////////////////////////////////////////
    // network configuration NAT/PAT
    m_nwNatPatHeader : "This page enables you to configure NAT/PAT. You can " +
                "create NAT/PAT rules or select existing rules to translate " +
                "single port or port ranges.<br><font color=#ff6600>Warning:</font> " +
                "Ensure that you have not filtered these ports in the firewall.",

    ////////////////////////////////////////////////////////////////////
    // network configuration Routing
    m_nwRoutHeader : "This page enables you to configure a static routing table.",
    m_nwRoutDestNetwork : "destination<br>network",
    m_nwRoutDestNwMask : "destination<br>network mask",
    m_nwRoutConf : "configure option",
    m_nwRoutGwInterface : "gateway or<br>interface",
    m_nwRoutMetric : "metric",


    ///////////////////////////////////////////////////////////////////
    // VPN General
    m_vpn_BasicSettings : "basic settings",
	m_vpn_auth: "authentication",
	m_vpn_TunnelSettings: "tunnel settings",
	m_vpn_TunnelConfigMode: "tunnel configuration mode",
	m_vpn_PresharedKey : "preshared Key",
	m_vpn_Confirm: "confirm",
    m_vpn_IKEnegPhase1 : "IKE negotiation (Phase 1)",
    m_vpn_IKE_p1_proto : "type/protocol",
    m_vpn_IKE_p1_ex_mode : "exchange Mode",
    m_vpn_Encrypt : "encryption",
    m_vpn_Diffle : "Diffle Hellmann Group",
    m_vpn_LifeTime : "lifetime (in seconds)",
    m_vpn_IKEphase2 : "IKE (Phase 2)",
	m_vpn_LocalNetwork: "local network",
	m_vpn_RemoteNetwork: "remote network",
	m_vpn_EZ : "easy",
	m_vpn_Expert: "expert",
    m_vpn_DFS : "DFS Group",
	m_vpn_Users : "users",

    ///////////////////////////////////////////////////////////////////
    // VPN Site 2 Site
    m_vpnS2S_VpnConSettings : "VPN connection setttings",

    m_vpnS2S_TunnelName : "tunnel name",
	m_vpnS2S_DomainName : "peer IP address / domain name",
	m_vpnS2S_RemoteVPNdevice : "remote site VPN device",

    ///////////////////////////////////////////////////////////////////
    // VPN Remote User Group
    m_vpnRUG_GroupSettings : "group setttings",
    m_vpnRUG_ProfileName : "profile name",
    m_vpnRUG_VPNsoft : "VPN software",
    m_vpnRUG_UsrSettings : "user setttings",
    m_vpnRUG_IPAlloc : "IP allocation",
    m_vpnRUG_InternetAccess : "internet access",

    ///////////////////////////////////////////////////////////////////
    // VPN Remote User Add
    m_vpnRUadd_RemoteUserSettings : "remote user setttings",
    m_vpnRUadd_UserName : "user Name",
    m_vpnRUadd_UserPasswd : "user Password",
    m_vpnRUadd_VPNGroup : "VPN group",

	///////////////////////////////////////////////////////////////////
    // URL Filtering
    m_url_ezByCat : "by categories",
    m_url_ezLegal : "legal",
    m_url_ezProf : "professional",
    m_url_ezStrict : "strict",
    m_url_ezByUrl : "by authorized URLs",
    m_url_ezByWord : "by banned words in URLs",
    m_url_ezFilterPolicy : "filtering policy",
    m_url_ezFilterPolicyImp : "filtering policy implementation",
    m_url_ezDay : "day",
    m_url_ezDayArray : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    m_url_ezTime : "time",
    m_url_ezAlways : "always",
    m_url_ezOn : "ON",
	m_url_ezOff : "OFF",
	m_url_ezWebSiteAddress : "Web sites' addresses",
    m_url_ezBannedKeywordInUrl : "banned keywords in URL",
	m_url_expertSubscribeP1: "This mode is only available with Orange UTM brick powered by Netasq.<br/><br/>" +
	                         "It enables you to:",
    m_url_ezDeleteConfirm : "Are you sure you want to delete this row?",
    m_url_ezPolicyDisableConfirm : "You have not selected any filtering policy options.  Are you sure you want to leave it unconfigured?",
	m_url_ezBLsubUnSelected : "Please select at least one category: legal, professional, or strict",
	m_url_ezConfigureWL : "configure authorized URLs",
	m_url_ezConfigureKeyword: "configure banned words in URLs",

	m_url_expertSubscribeListItem1: "benefit from enriched URLs categories you can also customize.",
	m_url_expertSubscribeListItem2: "assign a specific filtering policy per user group",
	m_url_expertSubscribeListItem3: "combine the different filtering functions proposed (category/ authorized URLs/ banned keywords).",
	m_url_expertSubscribeP2: "To get this service, please press the button \"subscribe\" hereunder.",

	///////////////////////////////////////////////////////////////////
    // IDS/IPS
	m_ids_Subscribe: "This mode is only available with Orange UTM brick powered by Netasq.<br/><br/>" +
	                         "It enables you to benefit from a larger database of IDS/ IPS signatures that you can also customize.<br/><br/>" +
							 "To get this service, please press the button \"subscribe\" hereunder.",
    m_ids_ezEnable: "enable instrusion prevention",

	///////////////////////////////////////////////////////////////////
    // Anti-virus
	m_avs_Subscribe: "Anti-Virus protection (for user devices and servers) is only available with Orange UTM brick powered by Netasq.<br/><br/>" +
					 "To get this service, please press the button \"subscribe\" hereunder.",

	///////////////////////////////////////////////////////////////////
    // Anti-spam
	m_asm_Subscribe: "Anti-Spam protection (for user devices and servers) is only available with Orange UTM brick powered by Netasq.<br/><br/>" +
					 "To get this service, please press the button \"subscribe\" hereunder.",

	///////////////////////////////////////////////////////////////////
    // IM&P2P filtering
	m_imp2p_Subscribe: "Instant Messaging & Peer to Peer application filtering is only available with Orange UTM brick powered by Netasq.<br/><br/>" +
					 "To get this service, please press the button \"subscribe\" hereunder.",

    ///////////////////////////////////////////////////////////////////
    // DNS
       m_dns_setServer : "set DNS server",
       m_dns_autoDhcp : "automatically via DHCP",
       m_dns_manual: "manually",
       m_dns: "DNS",
       m_dns_Primary: "primary",
       m_dns_Secondary: "secondary",
       m_dns_header: "This page enables you to configure DNS servers",

    ///////////////////////////////////////////////////////////////////
    // Port config
    m_portconf_port : "ports",
    m_portconf_LAN : "LAN",
    m_portconf_LAN2: "LAN2",
    m_portconf_DMZ: "DMZ",
    m_portconf_WAN: "WAN",
	m_portconf_attach: "port attachment",
	m_portconf_interface: "interface",
	m_portconf_lan_lan2_no_disabled: "Port E1 (LAN) and Port E3 (LAN2) cannot be simultaneously disabled",
	
    ///////////////////////////////////////////////////////////////////
    // LAN config
    m_lanitf_title : "LAN/IP parameters",	
	m_lanitf_ip : "LAN IP address",
	m_lanitf_mask: "IP subnet mask",
	m_landhcp_title: "DHCP parameters",
	m_landhcp_enable : "Enable DHCP server",
	m_landhcp_range_start : "DHCP range start",
	m_landhcp_range_end : "DHCP range end",
	m_landhcp_dns_mode : "DNS mode",
	m_landhcp_dns_pri : "Primary DNS server",
	m_landhcp_dns_sec : "Secondary DNS server",
	m_landhcp_dns_static : "Static",
	m_landhcp_dns_dynamic : "Dynamic",
	m_landhcp_dns_none : "No DNS",
	m_lanip_reserved_ip : "Reserved IP addresses",

	
    ///////////////////////////////////////////////////////////////////
    // Buttons and Images
    m_imageDir : 'images/en/',
	m_ok: 'ok',
	m_error: 'Error',
	m_info: 'Information',
	m_subscribe: 'Subscribe',
	m_tooltip_cancel : "reset current form",
	m_tooltip_apply: "apply changes",
	m_tooltip_add: "add a new row",
	m_tooltip_delete: "delete a row",
	m_tooltip_back: "go back to previous screen",
    m_remindSaveChange : 'Your changes have not been saved.  Would you like to save it?',

    /////////////////////////////////////////
    // plesae do not edit beyound dummy
    dummy : ''
}