/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

DATA_baseSystem = Ext.extend(Ext.util.Observable,
{
    constructor: function()
    {
        this.m_tabNames = [V_TREE_ID_status, V_TREE_ID_diag,
                    V_TREE_ID_config, V_TREE_ID_oper];
        this.m_iStatus = 0;
        this.m_iDiag = 1;
        this.m_iConf = 2;
        this.m_iOper = 3;
        this.m_tabObjects = new Array(4);
        this.m_homePage = 'main.html'
    }
});


function f_startLogin()
{
    var loginObj = new VYATTA_LoginObject(g_baseSystem.m_bodyPanel,
                                          V_TREE_ID_login);
    loginObj.f_initDataType();
    loginObj.f_initLoginPanel();
}
function f_startConfigurationTab()
{
    f_resetTabs();

    if(g_baseSystem.m_tabObjects[g_baseSystem.m_iConf] == undefined)
    {
        g_baseSystem.m_tabObjects[g_baseSystem.m_iConf] = new
                VYATTA_configurationObject(g_baseSystem.m_bodyPanel,
                                              V_TREE_ID_config);
        g_baseSystem.m_tabObjects[g_baseSystem.m_iConf].f_initDataType();
        g_baseSystem.m_tabObjects[g_baseSystem.m_iConf].f_initLayout();
    }
    else
    {
        g_baseSystem.m_tabObjects[g_baseSystem.m_iConf].f_showPanel(true);
    }
}
function f_startOperationTab()
{
    f_resetTabs();

    if(g_baseSystem.m_tabObjects[g_baseSystem.m_iOper] == undefined)
    {
        g_baseSystem.m_tabObjects[g_baseSystem.m_iOper] = new
                VYATTA_configurationObject(g_baseSystem.m_bodyPanel,
                                              V_TREE_ID_oper);
        g_baseSystem.m_tabObjects[g_baseSystem.m_iOper].f_initDataType();
        g_baseSystem.m_tabObjects[g_baseSystem.m_iOper].f_initLayout();
    }
    else
    {
        g_baseSystem.m_tabObjects[g_baseSystem.m_iOper].f_showPanel(true);
    }
}

function f_resetTabs()
{
    for(var i=0; i<g_baseSystem.m_tabNames.length; i++)
    {
        if(g_baseSystem.m_tabObjects[i] != undefined)
            g_baseSystem.m_tabObjects[i].f_showPanel(false);
    }
}

function f_initSystemObjects()
{
    g_baseSystem = new DATA_baseSystem();
    g_homePage = g_baseSystem.m_homePage;
    g_sendCommandWait = null;
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

    g_baseSystem.m_viewPort = vp;
    g_baseSystem.m_mainFrame = mf;

    vp.on( {'resize': {fn:
                function() {f_handleMainFramePanelResize()}}});

    f_handleMainFramePanelResize();
}

function f_createTabHTML(tabName)
{
    var img = tabName + '-tab-off.PNG';
    var imgId = 'v-tab-' + tabName;

    return '<td><a href="#" onClick="f_handleTabClick(\'' + tabName + '\')">' +
            '<img src=\'images/' + img + '\' id=\'' + imgId +
            '\' onmouseover="f_handleTabOnMouseOver(\'' + tabName + '\')" '+
            'onmouseout="f_handleTabOnMouseOut(\'' + tabName + '\')"' +
            '></a></td>';
}

function f_createTabsHTML(focusTabName)
{
    var idTab = document.getElementById('id_header_tab');
    var htmlStr = '<table id="v_tab_table" valign="bottom"><tr>';

    for(var i=0; i<g_baseSystem.m_tabNames.length; i++)
        htmlStr += f_createTabHTML(g_baseSystem.m_tabNames[i]);

    htmlStr += '</tr></table>';

    idTab.innerHTML = htmlStr;

    f_setTabFocus(focusTabName);
}

function f_handleTabClick(tabName)
{
    if(!f_isUserLogined(true, true))
    {
        window.location = g_baseSystem.m_homePage;
        return;
    }

    switch(tabName)
    {
        case g_baseSystem.m_tabNames[0]:
            break;
        case g_baseSystem.m_tabNames[1]:
            break;
        case g_baseSystem.m_tabNames[2]:
            f_startConfigurationTab();
            break;
        case g_baseSystem.m_tabNames[3]:
            f_startOperationTab();
            break;
    }
}

function f_setTabFocus(tabName)
{
    var tabId = document.getElementById('v-tab-' + tabName);

    tabId.src = "images/" + tabName + "-tab-on.PNG";
}

function f_handleTabOnMouseOver(tabName)
{
    var tabId = document.getElementById('v-tab-' + tabName);

    tabId.src = "images/" + tabName + "-tab-over.PNG";
}

function f_handleTabOnMouseOut(tabName)
{
    var tabId = document.getElementById('v-tab-' + tabName);

    tabId.src = "images/" + tabName + "-tab-off.PNG";
}

function f_createFrameHeaderPanel()
{
    var id = document.getElementById('id_header_text');

    if(!f_isUserLogined(false, false))
    {
        id.innerHTML = '&nbsp;';
        var idTab = document.getElementById('id_header_tab');
        idTab.innerHTML = '&nbsp;';
    }
    else
    {
        id.innerHTML = 'User:&nbsp; <b>' + f_getUserLoginName() + '</b>&nbsp;&nbsp;&nbsp;' +
            '<a href="#" onclick="f_userLogout(true, \'' +
            g_baseSystem.m_homePage + '\')">Logout</a>';
        f_createTabsHTML(V_TREE_ID_config);
    }

    var header = new Ext.Panel(
    {
        border: false
        ,bodyBorder: false
        ,bodyStyle: 'padding: 0px'
        ,height: 60
        ,contentEl: 'id_header'
    });


    return header;
}
function f_createFrameFooterPanel()
{
    var str = "<p id='v_footer_text'>&nbsp;&nbsp;&copy; 2006 - 2008 Vyatta Inc.</p>";

    var footer = new Ext.Panel(
    {
        cls: 'v-panel-with-background-color'
        ,height: 25
        ,border: false
        ,bodyBorder: false
        ,html: str
    });

    return footer;
}
function f_createFrameBodyPanel()
{
    var bodyPanel = new Ext.Panel(
    {
        //cls: 'v-panel-with-background-color'
        border: false
        ,bodyBorder: false
        ,width: 600
        ,height: 300
        //,contentEl: 'id_center_panel'
    });

    return bodyPanel;
}

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

function f_createMainFramePanel()
{
    g_baseSystem.m_headerPanel = f_createFrameHeaderPanel();
    g_baseSystem.m_footerPanel = f_createFrameFooterPanel();
    g_baseSystem.m_bodyPanel = f_createFrameBodyPanel();

    var mainFramePanel = new Ext.Panel(
    {
        border: true
        ,columnWidth: .94
        ,items:
        [
            g_baseSystem.m_headerPanel,
            g_baseSystem.m_bodyPanel,
            g_baseSystem.m_footerPanel
        ]
    });
    return mainFramePanel;
}

function f_handleMainFramePanelResize()
{
    if(g_baseSystem.m_viewPort != undefined)
    {
        var v = g_baseSystem.m_viewPort;
        var b = g_baseSystem.m_bodyPanel;
        var h = g_baseSystem.m_headerPanel;
        var f = g_baseSystem.m_footerPanel;

        b.setSize(g_baseSystem.m_mainFrame.getSize().width,
                  v.getSize().height-h.getSize().height - f.getSize().height);
    }
}

/*******************************************************************************
 * Start of onReady function
 *******************************************************************************/
Ext.onReady(function()
{
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
        f_startConfigurationTab();

    
});
