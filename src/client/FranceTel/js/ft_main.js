/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Open Appliance here.....
function f_showLoginPanel()
{
    //////////////////////////////////////////////////
    // get system main frame center panel
    var cPanel = g_ftBaseSystem.f_getCenterPanel();

    /////////////////////////////////////////////////////
    //
    var el = document.getElementById('barre_etat');
    el.innerHTML = "<span></span>";

    el = document.getElementById('nav_primaire');
    el.innerHTML = "<span></span>";

    /////////////////////////////////////////////////
    // create a login object and add it to manager
    var loginObject = new v_loginPanelObject('login');
    g_panelsMgr.f_manageThisPanel(loginObject);

    /////////////////////////////////////////////
    // do initlize then add it into the main
    // frame center panel
    var loginPanel = loginObject.f_initLoginPanel();
    cPanel.add(loginPanel);

    ////////////////////////////////////////////
    // register the panel resize listener
    cPanel.on( {'resize': {fn: function(){loginObject.f_resizePanels(cPanel) }}});

    //////////////////////////////////////////////
    // let update the layout
    loginObject.f_resizePanels(cPanel);
    g_ftBaseSystem.f_getCenterPanel().doLayout();
}

function f_showOpenAppliancePanel()
{
    //////////////////////////////////////////////////
    // get system main frame center panel
    var cPanel = g_ftBaseSystem.f_getCenterPanel();

    var el = document.getElementById('barre_etat');
    el.innerHTML = "<span>&nbsp;&nbsp;Welcome <font color=#FF6600><b>" + f_getUserLoginName() +
                  "</b></font>! You are connected to the Open Appliance administrative service.</span>" +
                  "<a href='#' onclick='f_userLogout(true)' class='dec' onfocus='this.blur();'>log out</a>";

    /////////////////////////////////////////////////
    // create a op object and add it to manager
    var opObject = new v_opPanelObject(cPanel, 'Open Appliance settings');
    g_panelsMgr.f_manageThisPanel(opObject);
      cPanel.add(opObject.f_getMainPanel());

    ////////////////////////////////////////////
    // register the panel resize listener
    cPanel.on( {'resize': {fn: function(){opObject.f_resizePanels(cPanel) }}});

    //////////////////////////////////////////////
    // let update the layout
    opObject.f_resizePanels(cPanel);
    g_ftBaseSystem.f_getCenterPanel().doLayout();
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// create view main panels
function f_createHeaderPanel()
{
    var header = new Ext.Panel(
    {
        region: 'north'
        ,split: false
        ,border: false
        ,bodyBorder: false
        ,bodyStyle: 'padding: 8px 10px 8px 10px'
        ,contentEl: 'id_header'
    });

    return header;
}
function f_createFooterPanel()
{
    var footer = new Ext.Panel(
    {
        region: 'south'
        ,height: 28
        ,split: false
        ,border: false
        ,bodyBorder: false
        ,contentEl: 'id_footer'
    });
    
    return footer;
}
function f_createCenterPanel()
{
    var centerPanel = new Ext.Panel(
    {
        region: 'center'
        ,layout: 'fit'
        ,split: false
        ,border: false
        ,bodyBorder: false
    });

    return centerPanel;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// start of the veiw port main frame
function f_startMainFrame()
{
    g_ftBaseSystem.f_setHeaderPanel(f_createHeaderPanel());
    g_ftBaseSystem.m_footerPanel = f_createFooterPanel();
    g_ftBaseSystem.f_setCenterPanel(f_createCenterPanel());

    var m_vp = new Ext.Viewport(
    {
      layout: 'border'
      ,border: false
      ,bodyBorder: false
      ,bodyStyle: 'padding: 8px 10px 0px 10px'
      ,items: [ g_ftBaseSystem.f_getHeaderPanel(),
                g_ftBaseSystem.f_getCenterPanel(),
                g_ftBaseSystem.m_footerPanel ]
    });
}

function f_initSystemObjects()
{
    g_ftBaseSystem = new DATA_FTBaseSystem();
    g_ftBaseSystem.f_initDataType();
    g_panelsMgr = new v_panelsManager();
    g_sendCommandWait = null;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
Ext.onReady(function()
{
    ////////////////////////////////////////////////
    // quick tip init.....
    Ext.QuickTips.init();

    ///////////////////////////////////////////////
    // init system base object and data members
    f_initSystemObjects();

    /////////////////////////////////////////////////
    // init open appliance data structure
    /*
    g_oAppliance = new DATA_OpenAppliance();
    g_oAppliance.f_initDataType();
    g_oAppliance.f_setSelectedOApplianceAnchor(
                    g_oAppliance.f_getSelectedOApplianceAnchor());
*/

    /////////////////////////////////////////
    // start up the main frame
    f_startMainFrame();

    //////////////////////////////////////////
    // if user not login yet, do login here..
    if(!f_isUserLogin(false))
        f_showLoginPanel();
    else
        f_showOpenAppliancePanel();
});