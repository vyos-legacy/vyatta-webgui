/*
    Document   : ft_oaConfig.js
    Created on : Mar 02, 2009, 6:18:51 PM
    Author     : Kevin.Choi
    Description: WUI configuration file for OA
*/

var g_oaConfig =
{
    ////////////////////////////////////////
    // OA WUI timeout monitor interval.
    m_oaTimeoutMonitorInterval : 30000,     // 30 seconds	
	
    ////////////////////////////////////////
    // OA WUI Dashboard screen refresh time.
    m_oaRefreshTime : 5000,     // 5 seconds

    ///////////////////////////////////////
    // Number of rows per paging.
    m_oaNumRowPerPage : 15,     // 15 rows per page

    ///////////////////////////////////////
    // OA WUI help URL link
    // For example: 'www.orange-bussiness.com/help/somefile.html',
    m_oaHelpURL_en : 'ft_oaHelp_en.html',
    m_oaHelpURL_fr : 'ft_oaHelp_fr.html',

    ///////////////////////////////////////
    // OA WUI contact URL link
    // // For example: 'www.orange-bussiness.com/contact/somefile.html',
    m_oaContactURL_en : 'ft_contact_en.html',
    m_oaContactURL_fr : 'ft_contact_fr.html',

    ////////////////////////////////////////////////////////////////////////
    // un-deploy PBX application URL link
    // un-deploy PBX html file. OA WUI will display this file if PBX is not
    // deployed.
    m_pbxURI_en : 'ft_undeployPBXInfo_en.html',
    m_pbxURI_fr : 'ft_undeployPBXInfo_fr.html',

    ///////////////////////////////////////////////////////////////
    // install new application URL link
    m_installNewVM_en : "http://www.orange-business.com/en/mnc2/footer/about/regions/north-america/index.html",
    m_installNewVM_fr : "http://www.orange-business.com/en/mnc2/footer/about/regions/north-america/index.html",

    /////////////////////////////////////////////////
    // remove application URL link
    m_removeVM_en : "http://www.orange-business.com/en/mnc2/footer/about/regions/north-america/index.html",
    m_removeVM_fr : "http://www.orange-business.com/en/mnc2/footer/about/regions/north-america/index.html",

    /////////////////////////////////////////
    // please do not edit beyong this line
    m_dummy : 'dummy'
}
