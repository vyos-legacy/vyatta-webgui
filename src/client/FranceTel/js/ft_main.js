/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

DATA_FTBaseSystem = Ext.extend(Ext.util.Observable,
{
    m_tabURLs : new Array(5),

    f_initDataType: function()
    {
        ///////////////////////////////////////////////////////
        //
        this.m_headerPanel = undefined;
        this.m_footerPanel = undefined;
        this.m_bodyPanel = undefined;
        this.m_opObject = undefined;
        this.m_tabNames = [ 'Business LiveBox settings',
                    'Open Appliance settings', 'UTM configuration',
                    'PBX configuration', '3rd Parties Applications'];
        this.m_selTab = this.m_tabNames[1];

        //////////////////////////////////////////////////////
        //an array of panels object belong to specific tab
        this.systemTabObjects = new Array();
        this.m_homePage = 'ft_main.html';
    },

    ///////////////////////////////////
    //
    f_getSystemTabNames: function()
    {
        return this.m_tabNames;
    },


    ///////////////////////////////////////////
    //

    f_setSystemTabPanels: function(tabObjects)
    {
        this.systemTabObjects = tabObjects;
    },

    ///////////////////////////////////////////////////
    // Tabs data
    /**
     * if tabIndex is provided, return that specific tab.
     * else return all tabs in an array form.
     */
    f_getTabsData: function(tabIndex /*optional*/)
    {
        var tabs = [ [this.m_tabNames[0], 'tabnav_blb_'],
                  [this.m_tabNames[1], 'tabnav_oa_'],
                  [this.m_tabNames[2], 'tabnav_utm_'],
                  [this.m_tabNames[3], 'tabnav_pbx_'],
                  [this.m_tabNames[4], 'tabnav_3pa_']];

        if(tabIndex == undefined)
            return tabs;
        else
            return tabs[tabIndex];
    }
});


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function f_startLogin()
{
    /////////////////////////////////////////////////
    // create a login object and add it to manager
    var loginObject = new v_loginPanelObject('login');
    loginObject.f_initLoginPanel(g_ftBaseSystem);
}

function f_startOpenAppliance()
{
    //////////////////////////////////////////////////
    // get system main frame body panel
    var bp = g_ftBaseSystem.m_bodyPanel;

    /////////////////////////////////////////////////
    // create a application object and add it to manager
    if(this.m_opObject == undefined)
    {
        this.m_opObject = new v_opPanelObject(bp,
                  g_ftBaseSystem.f_getTabsData(1)[0]);
        this.m_opObject.m_mainPanel = this.m_opObject.f_getMainPanel();

        ////////////////////////////////////////////
        // register the panel resize listener
        bp.on( {'resize': {fn: function(){ f_onBodyPanelResize(bp) }}});
    }

    //////////////////////////////////////////////
    // let update the layout
    this.m_opObject.m_mainPanel.show();
    bp.add(this.m_opObject.m_mainPanel);
    bp.doLayout();
}

g_vyattaURL = null;
g_dummy = null;
function f_startVyattaApplication()
{
    window.open(g_vyattaURL);

    if(g_dummy != null)
    {
        if(this.m_vyattaPanel == undefined)
        {
            var iframe = Ext.DomHelper.append(document.body,
            {
                tag: 'iframe',
                frameBorder:0,
                //src: 'http://192.168.94.131/Vyatta/main.html',//g_vyattaURL,
                src: g_vyattaURL,
                width: '100%',
                height: '100%'
            });

            this.m_vyattaPanel = new Ext.Panel(
            {
                contentEl: iframe
                ,border: false
            });
        }

        this.m_vyattaPanel.show();
        var bp = g_ftBaseSystem.m_bodyPanel;
        bp.add(this.m_vyattaPanel);
        bp.doLayout();
    }
    else
        f_startEmptyApplication();

    f_onBodyPanelResize(bp);
}

function f_onBodyPanelResize(bodyPanel)
{
    if(this.m_opObject != null)
        this.m_opObject.f_resizePanels(bodyPanel);

    var h = bodyPanel.getInnerHeight();
    var w = bodyPanel.getInnerWidth();

    if(this.m_vyattaPanel != undefined)
        this.m_vyattaPanel.setSize(w-2, h-2);

    if(this.m_3rdPartyPanel != undefined)
        this.m_3rdPartyPanel.setSize(w-2, h-2);

    if(this.m_pbxPanel != undefined)
        this.m_pbxPanel.setSize(w-2, h-2);
}

////////////////////////////////////////////////////////////////////////////////
// g_3rdPartyURL is provided from server by call getOpenApplianceVM.
g_3rdPartyURL = null;
function f_start3rdPartyApplication()
{
    if(g_3rdPartyURL != null)
    {
        if(this.m_3rdPartyPanel == undefined)
        {
            var iframe = Ext.DomHelper.append(document.body,
            {
                tag: 'iframe',
                frameBorder:0,
                src:g_3rdPartyURL,
                width: '100%',
                height: '100%'
            });

            this.m_3rdPartyPanel = new Ext.Panel(
            {
                contentEl: iframe
                ,border: false
            });
        }
        this.m_3rdPartyPanel.show();

        var bp = g_ftBaseSystem.m_bodyPanel;
        bp.add(this.m_3rdPartyPanel);
        bp.doLayout();
    }
    else
        f_startEmptyApplication();

    f_onBodyPanelResize(bp);
}

g_pbxURL = null;
function f_startPBXApplication()
{
    window.open(g_pbxURL);
    return;

    if(g_pbxURL != null)
    {
        if(this.m_pbxPanel == undefined)
        {
            var iframe = Ext.DomHelper.append(document.body,
            {
                tag: 'iframe',
                frameBorder:0,
                src:g_pbxURL,
                width: '100%',
                height: '100%'
            });

            this.m_pbxPanel = new Ext.Panel(
            {
                contentEl: iframe
                ,border: false
            });
        }
        this.m_pbxPanel.show();

        var bp = g_ftBaseSystem.m_bodyPanel;
        bp.add(this.m_pbxPanel);
        bp.doLayout();
    }
    else
        f_startEmptyApplication();

    f_onBodyPanelResize(bp);
}

function f_initWelcomePanel()
{
    var el = document.getElementById('barre_etat');
    el.innerHTML = "<span>&nbsp;&nbsp;Welcome <font color=#FF6600><b>" + f_getUserLoginName() +
                  "</b></font>! You are connected to the Open Appliance administrative service.</span>" +
                  "<a id='id_logoff' href='#' onclick='f_userLogout(true, \"" +
                  g_ftBaseSystem.m_homePage +
                  "\")' class='dec' onfocus='this.blur();'>log out</a>";

    new Ext.ToolTip(
    {
        target: 'id_logoff'
        ,html: 'To logoff of Open Appliance Application'
    })
}

function f_showApplication(appIndex)
{
    var bp = g_ftBaseSystem.m_bodyPanel;

    /////////////////////////////////////////////////////
    // let find out the application you selection is
    // implemented

    /////////////////////////////////////////////
    // clean up body panel
    while(bp.items.getCount() > 0)
    {
        var rItem = bp.items.remove(bp.items.itemAt(0));
        if(rItem instanceof Object)
            rItem.hide();
    }

    switch(g_ftBaseSystem.f_getTabsData(appIndex)[1])
    {
        case 'tabnav_utm_':
            f_startVyattaApplication();
        break;
        case 'tabnav_3pa_':
            f_start3rdPartyApplication();
        break;
        case 'tabnav_oa_':
            f_startOpenAppliance();
        break;
        case 'tabnav_pbx_':
            f_startPBXApplication();
        break;
        default:
            f_startEmptyApplication();
    }
}

function f_startEmptyApplication()
{
    var bp = g_ftBaseSystem.m_bodyPanel;
    var ePanel = f_createEmptyPanel(
                  'The application you selected is not yet implemented.');

    ePanel.setSize(bp.getSize().width, bp.getSize().height);

    bp.add(ePanel);
    bp.doLayout();
}

function f_initTabPanel(tabIndex)
{
    g_ftBaseSystem.m_selTab = g_ftBaseSystem.f_getTabsData(tabIndex)[0];
    f_refreshTabs();
}

function f_handleOnTabClick(tabIndex)
{
    if(!f_isUserLogined(true, true))
    {
        window.location = 'ft_main.html';
        return;
    }

    g_ftBaseSystem.m_selTab = g_ftBaseSystem.f_getTabsData(tabIndex)[0];
    f_refreshTabs();

    f_showApplication(tabIndex);
}

function f_handleOnMouseMove(tabIndex, action)
{
    if(g_ftBaseSystem.m_selTab == g_ftBaseSystem.f_getTabsData(tabIndex)[0])
        return;

    var tabName = g_ftBaseSystem.f_getTabsData(tabIndex)[1];
    var tabId = document.getElementById('v_tab_img_' + tabIndex);

    tabId.src = "images/" + tabName + action + ".png";
}

function f_refreshTabs()
{
    var tabs = g_ftBaseSystem.f_getTabsData();

    var str = '<table id="nav_primaire1">' +
              '<tr>';

    for(var i=0; i<tabs.length; i++)
    {
        var tab = tabs[i];
        var isOn = (tab[0] == g_ftBaseSystem.m_selTab) ? 'on' : 'off';

        str += '<td><a href="#" onClick="f_handleOnTabClick('+ i +
                    ')"><img onmouseover="f_handleOnMouseMove(' + i + ',\'over\')" '+
                    'onmouseout="f_handleOnMouseMove(' + i + ', \'off\');" ' +
                    ' id="v_tab_img_'+ i + '" ' +
                    'src="images/' + tab[1] + isOn + '.png"></a></td>';
    }
    str += "</tr></table>";

    var el = document.getElementById('nav_primaire');
    if(el == undefined)
    {
        Ext.getBody().createChild({tag:'div', id:'nav_primaire', html: str});
        el = document.getElementById('nav_primaire');
    }
    el.innerHTML = str;
}

function f_initSystemObjects()
{
    g_ftBaseSystem = new DATA_FTBaseSystem();
    g_ftBaseSystem.f_initDataType();
}

////////////////////////////////////////////////////////////////////////////////
// start of the veiw port main frame
////////////////////////////////////////////////////////////////////////////////
// create view main panels
function f_createFrameHeaderPanel()
{
    var header = new Ext.Panel(
    {
        border: false
        ,bodyBorder: false
        ,bodyStyle: 'padding: 8px 10px 8px 10px'
        ,contentEl: 'id_header'
    });

    return header;
}
function f_createFrameFooterPanel()
{
    var footer = new Ext.Panel(
    {
        border: false
        ,bodyBorder: false
        ,contentEl: 'id_footer'
    });

    m_clock.render(document.getElementById('footer_clock'));

    return footer;
}
function f_createFrameBodyPanel()
{
    var bodyPanel = new Ext.Panel(
    {
        border: false
        ,bodyBorder: false
        ,width: 600
        ,height: 300
        ,contentEl: 'id_center_panel'
    });

    return bodyPanel;
}

function f_createMainFramePanel()
{
    g_ftBaseSystem.m_headerPanel = f_createFrameHeaderPanel();
    g_ftBaseSystem.m_footerPanel = f_createFrameFooterPanel();
    g_ftBaseSystem.m_bodyPanel = f_createFrameBodyPanel();

    var mainFramePanel = new Ext.Panel(
    {
        border: false
        ,columnWidth: .94
        ,items:
        [
            g_ftBaseSystem.m_headerPanel,
            g_ftBaseSystem.m_bodyPanel,
            g_ftBaseSystem.m_footerPanel
        ]
    });

    return mainFramePanel;
}

function f_handleMainFramePanelResize()
{
    if(g_ftBaseSystem.m_viewPort != undefined)
    {
        var v = g_ftBaseSystem.m_viewPort;
        var b = g_ftBaseSystem.m_bodyPanel;
        var h = g_ftBaseSystem.m_headerPanel;
        var f = g_ftBaseSystem.m_footerPanel;

        b.setSize(g_ftBaseSystem.m_mainFrame.getSize().width,
                  v.getSize().height-h.getSize().height - f.getSize().height);
    }
}

////////////////////////////////////////////////////////////////////////////////
function f_createUnuseSidePanel()
{
    var spanel = new Ext.Panel(
    {
        columnWidth: .03
        ,border: false
        ,html: '&nbsp;'
    });

    return spanel;
}

function f_startViewPort()
{
    var mf = f_createMainFramePanel();

    var vp = new Ext.Viewport(
    {
      layout: 'column'
      ,border: false
      ,bodyBorder: false
      ,items:
      [
          f_createUnuseSidePanel()
          ,mf
          ,f_createUnuseSidePanel()
      ]
    });

    g_ftBaseSystem.m_viewPort = vp;
    g_ftBaseSystem.m_mainFrame = mf;

    vp.on( {'resize': {fn:
                function() {f_handleMainFramePanelResize()}}});
}

function onLanguageChange()
{
    var el = document.getElementById('ft_language');


}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Ext.BLANK_IMAGE_URL = 'images/orange_line.PNG';
g_ie = 0;
Ext.onReady(function()
{
    ///////////////////////////////////////////////////////////////
    // below to fix for IE enter this point twice.
    if(Ext.isIE && g_ie > 0) return;
    g_ie++;
    
    ////////////////////////////////////////////////
    // quick tip init.....
    Ext.QuickTips.init();

    ///////////////////////////////////////////////
    // init system base object and data members
    f_initSystemObjects();


    /////////////////////////////////////////
    // start up the main frame
    f_startViewPort();

    //////////////////////////////////////////
    // if user not login yet, do login here..
    if(!f_isUserLogined(false, false))
        f_startLogin();
    else
    {
        f_initWelcomePanel();
        f_initTabPanel(1);
        f_startOpenAppliance();
    }

    ////////////////////////////////////////////
    // resize window
    f_handleMainFramePanelResize();
});
