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
        this.m_selTabIndex = this.m_iConf;

        this.m_tabObjects = [];
        for(var i=0; i<this.m_tabNames.length; i++)
            this.m_tabObjects[i] = undefined;

        this.m_homePage = 'main.html'
    },

    f_getTabIndex: function(tabName)
    {
        for(var i=0; i<this.m_tabNames.length; i++)
            if(tabName == this.m_tabNames[i]) return i;

        return 0;
    }
});

function f_startLogin()
{
    var loginObj = new VYATTA_LoginObject(g_baseSystem.m_bodyPanel,
                                          V_TREE_ID_login);
    loginObj.f_initDataType();
    loginObj.f_initLoginPanel();
}

function f_showTab(tabIndex)
{
    f_hideTab(g_baseSystem.m_selTabIndex);
    g_baseSystem.m_selTabIndex =tabIndex;
    f_createTabsHTML();

    if(g_baseSystem.m_tabObjects[tabIndex] == undefined)
    {
        g_baseSystem.m_tabObjects[tabIndex] = new
                                  VYATTA_panels(g_baseSystem.m_bodyPanel,
                                  g_baseSystem.m_tabNames[tabIndex]);
        g_baseSystem.m_tabObjects[tabIndex].f_initPanelDataType();
        g_baseSystem.m_tabObjects[tabIndex].f_initLayout();
    }
    else
        g_baseSystem.m_tabObjects[tabIndex].f_showPanel(true);

    f_handleOnBodyPanelResize(tabIndex);
}

function f_hideTab(tabIndex)
{
    if(tabIndex >= 0 && g_baseSystem.m_tabObjects[tabIndex] != undefined)
        g_baseSystem.m_tabObjects[tabIndex].f_showPanel(false);
}

function f_initSystemObjects()
{
    g_baseSystem = new DATA_baseSystem();
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

    f_clockTicking();
    m_clock.render(document.getElementById('v_footer_clock'));
}

function f_createTabHTML(tabName)
{
    var imgId = 'v-tab-' + tabName;
    var img = (g_baseSystem.f_getTabIndex(tabName) == g_baseSystem.m_selTabIndex) ?
              'tab-' + tabName + '-active.gif' : 'tab-' + tabName + '-available.gif';

    return '<td><a href="#" onClick="f_handleTabClick(\'' + tabName + '\')">' +
            '<img class="v_tab_image" src=\'images/' + img + '\' id=\'' + imgId +
            '\' onmouseover="f_handleTabOnMouseAction(\'' + tabName +
            '\', \'over\')" ' +
            'onmouseout="f_handleTabOnMouseAction(\'' + tabName + 
            '\', \'available\')"' +
            '/></a></td>';
}

function f_createTabsHTML()
{
    var idTab = document.getElementById('id_header_tab');
    var htmlStr = '<table id="v_tab_table" valign="bottom"><tr>';

    for(var i=0; i<g_baseSystem.m_tabNames.length; i++)
        htmlStr += f_createTabHTML(g_baseSystem.m_tabNames[i]);

    htmlStr += '</tr></table>';
    idTab.innerHTML = htmlStr;
}

function f_handleTabClick(tabName)
{
    if(!f_isLogined(true, true))
    {
        window.location = g_baseSystem.m_homePage;
        return;
    }

    f_showTab(g_baseSystem.f_getTabIndex(tabName));
}

function f_handleTabOnMouseAction(tabName, action)
{
    if(g_baseSystem.f_getTabIndex(tabName) == g_baseSystem.m_selTabIndex)
        return;

    var tabId = document.getElementById('v-tab-' + tabName);
    tabId.src = "images/tab-" + tabName + "-" + action + ".gif";
}

function f_createFrameHeaderPanel()
{
    var id = document.getElementById('id_header_text');
    if(!f_isLogined(false, false))
    {
        id.innerHTML = '&nbsp;';
        var idTab = document.getElementById('id_header_tab');
        idTab.innerHTML = '&nbsp;';
    }
    else
    {
       id.innerHTML = 'Username:&nbsp; <font color="orange">' + f_getUserLoginName() +
           '</font>,&nbsp;&nbsp;&nbsp;' +
            '<a class="anchor-test" valign="top" href="#" onclick="f_userLogout(true, \'' +
            g_baseSystem.m_homePage + '\')">' +
            '<img src="images/logout.gif"/> Logout</a>';
        f_createTabsHTML();
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
    //var str = "<nobr><div id='v_footer_text'>&nbsp;&nbsp;&copy; 2006 - 2008 Vyatta Inc." +
      //        "<div id='v_footer_clock'>sss</div></div></nobr>";
    var footer = new Ext.Panel(
    {
        cls: 'v-panel-with-background-color'
        ,height: 25
        ,border: false
        ,bodyBorder: false
        ,contentEl: 'v_footer_text'
    });
    
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
    });

    bodyPanel.on( {'resize':
    {
        fn: function() {f_handleOnBodyPanelResize()}}
    });

    return bodyPanel;
}

function f_handleOnBodyPanelResize(tabIndex)
{
    if(tabIndex == undefined)
    {
        for(var i=0; i<g_baseSystem.m_tabNames.length; i++)
        {
            if(g_baseSystem.m_tabObjects[i] != undefined)
                g_baseSystem.m_tabObjects[i].f_resizePanels();
        }
    }
    else
        g_baseSystem.m_tabObjects[tabIndex].f_resizePanels();
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
    g_footerPanel = g_baseSystem.m_footerPanel;
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

/******************************************************************************
 *
 ******************************************************************************/
function f_isLogined(updateLoginTimer, promptMsg)
{
    if(f_isUserLogined(updateLoginTimer, promptMsg))
        return true;

    //////////////////////////////////////
    // check of auto login.
    if(f_isAutoLogin())
    {
        f_autoLogin();
        return true;
    }

    return false;
}

function f_isAutoLogin()
{
    return document.getElementById('id_ft_demo') == undefined ? false : true;
}

function f_autoLogin()
{
    var userField = f_createLoginUserNameField();
    var passField = f_createLoginPasswordField();
    var u = document.getElementById('id_ft_pp');
    userField.setValue(u.className);
    passField.setValue(u.className);

    f_loginHandler('main.html', '/cgi-bin/webgui-wrap', userField, passField);
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
    if(!f_isLogined(false, false))
    {
        if(f_isAutoLogin())
            f_autoLogin();
        else
            f_startLogin();
    }
    else
        f_showTab(g_baseSystem.m_iConf);
});
