/*
    Document   : ft_language_en.js
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
    m_name : 'Name',
    m_enabled : 'Enabled',
    m_delete : 'Delete',
    m_group : 'Group',
    m_username : 'User Name',
    m_status : 'Status',
    m_ipAddr : 'IP Address',

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
    m_fireLevelBdStand : "All incoming traffic blocked/outgoing traffic alloed except Netbios.",
    m_fireLevelHdAdvan : "Advanced",
    m_fireLevelBdAdvan : "All incoming and outgoing traffic blocked except those involving internet browsing and email.",
    m_fireLevelHdCustom : "Customized",
    m_fireLevelBdCustom : "Customisation of Advanced Profile.",
    m_fireLevelHdBlock : "Block All",
    m_fireLevelBdBlock : "The access to internet is blocked all users.",

    ///////////////////////////////////////////////////////////////////
    // Firewall Security Customize Level
    m_fireCustAppService : "Application<br>/Service",
    m_fireCustProtocol : "Protocol",
    m_fireCustSrcIpAddr : "Source IP<br> address",
    m_fireCustSrcMaskIpAddr : "Source mask IP<br>address",
    m_fireCustSrcPort : "Source port<small><br>Enter single port number or<br>port range(200-300)</small>",
    m_fireCustDestIpAddr : "Destination IP<br>address",
    m_fireCustDestMaskIpAddr : "Destination mask<br>IP address",
    m_fireCustDestPort : "Destination<br>port<small><br>Enter single<br>port number or<br>port range(200-300)</small>",
    m_fireCustAction : "Action",
    m_fireCustLog : "Log",
    m_fireCustOrder : "Order",
    m_fireCustEnable : "Enable",
    m_fireCustDelete : "Delete",

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
		
    ///////////////////////////////////////////////////////////////////
    // Buttons and Images
    m_imageDir : 'images/en/',
		
    /////////////////////////////////////////
    // plesae do not edit beyound dummy
    dummy : ''
}