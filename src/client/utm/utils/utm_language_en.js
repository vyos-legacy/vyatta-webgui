/*
    Document   : utm_language_en.js
    Created on : Mar 23, 2009, 2:18:11 PM
    Author     : Kevin.Choi
    Description:
*/

var g_lang =
{
    ///////////////////////////////////////////////////////////////////
    // Dash board screen

    ////////////////////////////////////////////////////////////////////
    // common
    m_tableTooltip1 : 'Click here to perform sorting.',
    m_name : 'Name',
    m_enabled : 'Enabled',
    m_delete : 'Delete',
    m_group : 'Group',
    m_username : 'User Name',
    m_status : 'Status',
    m_ipAddr : 'IP Address',
    m_underConstruction : 'Under Construction',

    ///////////////////////////////////////////////////////////////////
    // VPN Overview
    m_vpnOverviewHeader : "Lorem ipsum onsectetuer adipiscing elit, sed diam " +
            "nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam " +
            "erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci " +
            "tation ullamcorper suscipit lobortis nisl ut aliquip ex ea " +
            "commodo consequat.",
    m_vpnOVSource : 'Source',
    m_vpnOVDest : 'Destination',
    m_vpnOVPeerDomainName : 'Peer Address /Domain name',
    m_vpnOVConfNode : 'Configuration Node',
    m_vpnOVLocal : 'Local',
    m_vpnOVS2S : 'Site to site connections',
    m_vpnOVRemote : 'Remote Users',

    ///////////////////////////////////////////////////////////////////
    // VPN RemoteUser View
    m_vpnRemoteviewHeader : "This page enables you to configure a Virtual " +
        "Private Network (VPN) Server to connect remote users.",

    ///////////////////////////////////////////////////////////////////
    // Firewall Security Level
    m_fireLevelColName : "Security Level",
    m_fireLevelHeader : "Lerem ipsum onsectetuer adipiscing elit, sed diam nonummy" +
                    " nibh euismod tincidunt ut looreet dolore magna aliquam erat " +
                    "volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation",
    m_fireLevelHdAuth : "Authorize All",
    m_fireLevelBdAuth : "Firewall functionality is disabled. All incoming and outgoing traffic is authorized.",
    m_fireLevelHdStand : "Standard",
    m_fireLevelBdStand : "All incoming traffic blocked/outgoing traffic allowed except Netbios.",
    m_fireLevelHdAdvan : "Advanced",
    m_fireLevelBdAdvan : "All incoming and outgoing traffic blocked except those involving internet browsing and email.",
    m_fireLevelHdCustom : "Customized",
    m_fireLevelBdCustom : "Customisation of Advanced Profile.",
    m_fireLevelHdBlock : "Block All",
    m_fireLevelBdBlock : "The access to internet is blocked all users.",
    m_fireLevelCustConfTip : "Configure customize security",
    m_fireLevelApplyTip : "Save changed",
    m_fireLevelCancelTip : "Cancel changed",

    ///////////////////////////////////////////////////////////////////
    // Firewall Zone Management
    m_fireZMAddTip : "Create new zone",
    m_fireZMZoneName : "Zone Name",
    m_fireZMMember : "Zone Members",
    m_fireZMMemIncluded : "Included",
    m_fireZMMemAvail : "Available",
    m_fireZMDesc : "Description",
    m_fireZMDelete : "Delete",
    m_fireZMMemIncTip : "Double click on the selected item to move to Available list box.",
    m_fireZMMemAvailTip : "Double click on the selected item to move to Included list box.",
    m_fireZMMemError : "Member cannot be empty. Please select at least one memeber",
    m_fireZMNameError : "Zone name cannot be empty.",

    ///////////////////////////////////////////////////////////////////
    // Firewall Security Customize Level
    m_fireDeleteConfirm : "Are you sure you want to delete this rule?",
    m_fireCustDeleteConfirmHeader : "Delete Customize Rule",
    m_discardConfirm : "This action will discard all your changes. Are you sure you still want to cancel?",
    m_fireCustDiscardConfirmHeader : "Cancel All Changes",
    m_fireResetConfirm : "This action will reload rules from default profile. Are you sure you still want to reset?",
    m_fireCustResetConfirmHeader : "Reset Customize Rules",
    m_fireCustSubHeader : "Specific Rules",
    m_fireCustDirection : "Direction",
    m_fireCustAppService : "Application<br>/Service",
    m_fireCustProtocol : "Protocol",
    m_fireCustSrcIpAddr : "Source IP<br> address",
    m_fireCustSrcMaskIpAddr : "Source mask IP<br>address",
    m_fireCustSrcPort : "Source port<small><br>Enter single<br>port number or<br>port range<br>(200-300)</small>",
    m_fireCustDestIpAddr : "Destination IP<br>address",
    m_fireCustDestMaskIpAddr : "Destination mask<br>IP address",
    m_fireCustDestPort : "Destination<br>port<small><br>Enter single<br>port number <br>or port range<br>(200-300)</small>",
    m_fireCustInternIpAddr : "Internal IP<br>Address<small><br>Single IP or an IP<br>range</small>",
    m_fireCustInternPort : "Internal<br>port<small><br>Enter single<br>port number <br>or port range<br>(200-300)</small>",
    m_fireCustAction : "Action",
    m_fireCustLog : "Log",
    m_fireCustOrder : "Order",
    m_fireCustEnable : "Enable",
    m_fireCustDelete : "Delete",
    m_fireCustRuleOption : "Show rules only from",
    m_fireCustApplyTip : "Save all changed",
    m_fireCustCancelTip : "Cancel all changed",
    m_fireCustResetTip : "Reset to default",
    m_fireCustBackTip : "Back to Firewall Level screen",
    m_fireCustAddTip : "Add a new rule",

    ////////////////////////////////////////////////////////////////////
    // network configuration NAT/PAT
    m_nwNatPatHeader : "This page enables you to configure NAT/PAT. You can " +
                "create NAT/PAT rules or select existing rules to translate " +
                "single port or port ranges.<br><font color=#ff6600>Warning:</font> " +
                "Ensure that you have not filtered these ports in the firewall.",


    ///////////////////////////////////////////////////////////////////
    // VPN General
    m_vpn_BasicSettings : "Basic settings",
	m_vpn_auth: "Authentication",
	m_vpn_TunnelSettings: "Tunnel Settings",
	m_vpn_TunnelConfigMode: "Tunnel Configuration Mode",
	m_vpn_PresharedKey : "Preshared Key",
	m_vpn_Confirm: "Confirm",
    m_vpn_IKEnegPhase1 : "IKE Negotiation (Phase 1)",
    m_vpn_IKE_p1_proto : "Type/Protocol",
    m_vpn_IKE_p1_ex_mode : "Exchange Mode",
    m_vpn_Encrypt : "Encryption",
    m_vpn_Diffle : "Diffle Hellmann Group",
    m_vpn_LifeTime : "Life Time (n seconds)",
    m_vpn_IKEphase2 : "IKE (Phase 2)",
	m_vpn_LocalNetwork: "Local Network",
	m_vpn_RemoteNetwork: "Remote Network",
	m_vpn_EZ : "Easy",
	m_vpn_Expert: "Expert",
    m_vpn_DFS : "DFS Group",
	m_vpn_Users : "Users",

    ///////////////////////////////////////////////////////////////////
    // VPN Site 2 Site
    m_vpnS2S_VpnConSettings : "VPN Connection setttings",

    m_vpnS2S_TunnelName : "Tunnel Name",
	m_vpnS2S_DomainName : "Peer IP Address / Domain Name",
	m_vpnS2S_RemoteVPNdevice : "Remote site VPN device",

    ///////////////////////////////////////////////////////////////////
    // VPN Remote User Group
    m_vpnRUG_GroupSettings : "Group setttings",
    m_vpnRUG_ProfileName : "Profile Name",
    m_vpnRUG_VPNsoft : "VPN software",
    m_vpnRUG_UsrSettings : "User setttings",
    m_vpnRUG_IPAlloc : "IP Allocation",
    m_vpnRUG_InternetAccess : "Internet Access",

    ///////////////////////////////////////////////////////////////////
    // VPN Remote User Add
    m_vpnRUadd_RemoteUserSettings : "Remote user setttings",
    m_vpnRUadd_UserName : "User Name",
    m_vpnRUadd_UserPasswd : "User Password",
    m_vpnRUadd_VPNGroup : "VPN Group",

	///////////////////////////////////////////////////////////////////
    // URL Filtering
    m_url_ezByCat : "by categories",
    m_url_ezLegal : "legal",
    m_url_ezProf : "professional",
    m_url_ezStrict : "strict",
    m_url_ezByUrl : "by authorized URLs",
    m_url_ezByWord : "by banned words in URLs",
    m_url_ezFilterPolicy : "Filtering policy",
    m_url_ezFilterPolicyImp : "Filtering policy implementation",
    m_url_ezDay : "Day",
    m_url_ezDayArray : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    m_url_ezTime : "Time",
    m_url_ezAlways : "Always",
    m_url_ezOn : "ON",
	m_url_ezOff : "OFF",
	m_url_ezWebSiteAddress : "Web sites' addresses",
    m_url_ezBannedKeywordInUrl : "Banned keywords in URL",
	m_url_expertSubscribeP1: "This mode is only available with Orange UTM brick powered by Netasq.<br/><br/>" +
	                         "It enables you to:",
    m_url_ezDeleteConfirm : "Are you sure you want to delete this row?",
    m_url_ezPolicyDisableConfirm : "You have not selected any filtering policy options.  Are you sure you want to leave it unconfigured?",
	m_url_ezBLsubUnSelected : "Please select at least one category: legal, professional, or strict",
	m_url_ezConfigureWL : "Configure authorized URLs",
	m_url_ezConfigureKeyword: "Configure banned words in URLs",

	m_url_expertSubscribeListItem1: "benefit from enriched URLs categories you can also customize.",
	m_url_expertSubscribeListItem2: "assign a specific filtering policy per user group",
	m_url_expertSubscribeListItem3: "combine the different filtering functions proposed (category/ authorized URLs/ banned keywords).",
	m_url_expertSubscribeP2: "To get this service, please press the button \"subscribe\" hereunder.",

	///////////////////////////////////////////////////////////////////
    // IDS/IPS
	m_ids_Subscribe: "This mode is only available with Orange UTM brick powered by Netasq.<br/><br/>" +
	                         "It enables you to benefit from a larger database of IDS/ IPS signatures that you can also customize.<br/><br/>" +
							 "To get this service, please press the button \"subscribe\" hereunder.",
    m_ids_ezEnable: "Enable Instrusion Prevention",

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
       m_dns_setServer : "Set DNS server",
       m_dns_autoDhcp : "Automatically via DHCP",
       m_dns_manual: "Manually",
       m_dns: "DNS",
       m_dns_Primary: "Primary",
       m_dns_Secondary: "Secondary",
       m_dns_header: "This page enables you to configure DNS servers",

    ///////////////////////////////////////////////////////////////////
    // Buttons and Images
    m_imageDir : 'images/en/',
	m_ok: 'ok',
	m_error: 'Error',
	m_info: 'Information',
	m_subscribe: 'Subscribe',
	m_tooltip_cancel : "Reset current form",
	m_tooltip_apply: "Apply changes",
	m_tooltip_add: "Add a new row",
	m_tooltip_delete: "Delete a row",
	m_tooltip_back: "Go back to previous screen",
    m_remindSaveChange : 'You changes have not been saved.  Would you like to save it?',

    /////////////////////////////////////////
    // plesae do not edit beyound dummy
    dummy : ''
}