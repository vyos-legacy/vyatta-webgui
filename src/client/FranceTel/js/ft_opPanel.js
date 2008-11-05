v_opPanelObject = Ext.extend(v_panelObject,
{
    ////////////////////////////////////////////////////////////////////////////
    // local data memeber
    // m_name
    // m_tabName
    // m_parentContainer
    // m_selTopAnchorName
    // m_selLeftAnchorName
    // m_selGridRow
    // m_selGridCol
    ////////////////////////////////////////////////////////////////////////////


    constructor: function(parentContainer, name)
    {
        this.m_name = name;
        this.m_tabName = 'OpenAppliance';
        this.m_parentContainer = parentContainer;
        this.m_userDBData = new Array();
        this.m_monitorHwDBData = new Array();
        this.m_popupMenu = null;
        this.m_curScreen = null;
        g_opPanelObject = this;

        //v_loginPanelObject.suprclass.constructor.apply(this, arguments);
        f_startBackgroundTask(g_opPanelObject);
    },


    ///////////////////////////////////////////////////
    // Open Appliance Anchor data .....
    f_getOApplianceAnchorData: function()
    {
        return [ 'VM', 'User', 'Monitoring', 'Backup'];
    },
    /////////////////////////////////////////////////////
    // VM Anchor data ....
    f_getVMAnchorData: function()
    {
        return [ 'VM Dashboard', 'Update VM Software',
                  'Restart'];
    },
    f_getMonitoringAnchorData: function()
    {
        return [ 'Hardware', 'Network', 'Software' ];
    },
    f_getUserAnchorData: function()
    {
        return [ 'User', 'User Right' ];
    },
    f_getBackupAnchorData: function()
    {
        return [ 'Configuration Backup', 'Configuration Restore' ];
    },

    f_getVMDashboardColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['VM', 'Status', 'CPU', 'RAM', 'Disk Space',
                    'Current Version', 'Update Version', 'Deployment Schedule'];
        else
            return ["<p align='center'><b>VM<br></b></p>",
                    "<p align='center'><b>Status<br></b></p>",
                    "<p align='center'><b>CPU<br></b></p>",
                    "<p align='center'><b>RAM<br></b></p>",
                    "<p align='center'><b>Disk Space<br></b></p>",
                    "<p align='center'><b>Current<br>Version</b></p>",
                    "<p align='center'><b>Update<br>Version</b></p>",
                    "<p align='center'><b>Deployment<br>Schedule</b></p>"];
    },
    f_getVMDeploySoftwareColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['checker', 'VM', 'Status', 'Current Version',
                    'AvailableVersion', 'DeploymentScheduleDate',
                    'DeploymentScheduleTime', 'avalVerData'];
        else
            return [' ',
                "<p align='center'><b>VM<br></b></p>",
                "<p align='center'><b>Deployment<br>Status</b></p>",
                "<p align='center'><b>Current<br>Version</b></p>",
                "<p align='center'><b>Available<br>Version</b></p>",
                "<p align='center'><b>Deployment<br>Schedule Date</b></p>",
                "<p align='center'><b>Deployment<br>Schedule Time</b></p>",
                "<p align='center'><b>Avail Version<br>Data</b></p>"];
    },
    f_getVMRestartColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['VM', 'Status', 'CPU', 'RAM', 'Desk Space',
                    'Current Version', 'Update Version', 'Deployment Schedule'];
        else
            return ["<p align='center'><b>VM<br></b>&nbsp;</p>",
                    "<p align='center'><b>Status<br>&nbsp;</b></p>",
                    "<p align='center'><b><br>&nbsp;</b></p>",
                    "<p align='center'><b><br>&nbsp;</b></p>",
                    "<p align='center'><b><br>&nbsp;</b></p>"];
    },
    f_getMonitorHWColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['Component', 'Status'];
        else
            return ["<p align='center'><b>Component<br></b>&nbsp;</p>",
                    "<p align='center'><b>Status<br>&nbsp;</b></p>"];
    },
    f_getBackupColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['checker', 'VM', 'Target'];
        else
            return ["<p align='center'>&nbsp;</p>",
                    "<p align='center'><b>VM</b></p>",
                    "<p align='center'><b>Target</b></p>"];
    },
    f_getUserColHeaderNames: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['checker', 'Firstname', 'Lastname', 'Username', 'Password',
                    'Action'];
        else
            return ["<p align='center'><b>Firstname<br></b>&nbsp;</p>",
                    "<p align='center'><b>Lastname<br>&nbsp;</b></p>",
                    "<p align='center'><b>Username<br>&nbsp;</b></p>",
                    "<p align='center'><b>Password<br>&nbsp;</b></p>",
                    "<p align='center'><b>Action<br>&nbsp;</b></p>"];
    },


    ////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////
    f_getOpTopPanelHTML: function()
    {
        var links = this.f_getOApplianceAnchorData();
        var str = "<nobr><div id='header'>";
        var mouseOver = Ext.isGecko ? true : false;

        for(var i=0; i<links.length; i++)
        {
            var myId = this.m_tabName + links[i];

            if(this.m_selTopAnchorName == links[i])
            {
                str += "<a class='on' id='id_" + myId + "_link' href='#top' " +
                    "onclick=f_onClickAnchor('" + links[i] + "')>" +
                    "<img src='images/carre.gif'/>&nbsp;&nbsp;<font color='#FF6600'>" +
                    "<b>" + links[i] + "</b></font>" +
                    "</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            }
            else
            {
                var id = "'id_" + myId + "_link'";
                str += "<a class='off' id=" + id + " href='#top' ";

                if(mouseOver)
                    str += "onMouseOver=f_onMouseOverHorizAnchor(" + id +
                            ",'" + links[i] + "') ";

                str += "onclick=f_onClickAnchor('" + links[i] + "')>" +
                    "<img src='images/carre.gif'/>&nbsp;&nbsp;" + links[i] +
                    "</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            }

        }
        str += "</div></nobr>";

        //var el = document.getElementById('nav');
        //if(el == undefined)
        //{
        var nav_id = Ext.id();
        Ext.getBody().createChild({tag:'div', id:'nav_'+nav_id, cls:'nav', html: str});
        var el = document.getElementById('nav_'+nav_id);
        //}
        el.innerHTML = str;

        return el;
    },

    f_getOpTopPanelData: function()
    {
        var comp = new Ext.Panel(
        {
            id: Ext.id()
            ,border: false
            ,bodyStyle: 'padding: 0px 10px 0px 10px'
            ,contentEl: this.f_getOpTopPanelHTML()
        });
        comp.doLayout();

        return comp;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_getVMLeftPanelHTML: function(anchorLinkData, oaAnchor)
    {
        var divAffect = "id='leftMenu' ";

        if(oaAnchor == undefined)
            oaAnchor = "";
        else
        {
            divAffect = "id='leftPopupMenu' class='ft_popup_menu' ";
        }
        var links = anchorLinkData == undefined ? this.f_getVMAnchorData() :
                                      anchorLinkData;

        var selIndex = 0;
        var str = "<div " + divAffect + ">" +
              "<ul id='openAppliance' style='display:block'>";

        if(links != 'empty')
        {
            for(var i=0; i<links.length; i++)
            {
                var anchorId = f_replaceAll(links[i], ' ', '_');
                var myId = this.m_tabName + anchorId;

                if(this.m_selLeftAnchorName == links[i])
                {
                    str +=
                        "<li><a class='on' id='id_" + myId + "_link' href='#' onclick=" +
                        "f_onClickAnchor('" + anchorId + "')>" + links[i] +
                        "</a></li>";
                    selIndex = i;
                }
                else
                    str +=
                        "<li><a class='off' id='id_" + myId + "_link' href='#' onclick=" +
                        "f_onClickAnchor('" + anchorId + "')>" + links[i] +
                        "</a></li>";
            }
        }
        else
            selIndex = 999;

        if(oaAnchor == "")
            str += '</ul><div id="helpMenu" style="display:block">' +
                '<a target = "_blank" href="#" onfocus="this.blur();" ' +
                'class="linkhelp" onclick="f_loadHelp();return false;">' +
                '<img src="images/img_help.gif" alt="Help" title="Help"></a></div></div>';
        else
            str += '</ul></div>';

        var id = "id_vmAnchor_" + selIndex + oaAnchor;
        Ext.getBody().createChild(
                            {tag:'div', id:id, html: str});

        return id;
    },
    f_getVMLeftPanelData: function(anchorLinkData)
    {
        return new Ext.Panel(
        {
            id: Ext.id()
            ,border: false
            ,bodyStyle: 'padding: 0px 10px 0px 0px'
            ,contentEl: this.f_getVMLeftPanelHTML(anchorLinkData)
        });
    },


    ////////////////////////////////////////////////////////////////////////////
    f_updateMainPanel: function(anchorId)
    {
        if(this.m_mainPanel == undefined)
            this.m_mainPanel = this.f_createMainPanel(this.m_tabName);

        this.m_dashboardStore = undefined;
        this.m_vmRestartStore = undefined;

        this.f_processOnAnchorInvoke(anchorId);
        this.m_mainPanel.doLayout();
        this.m_curScreen = anchorId;
    },

    f_getMainPanel: function(anchorId)
    {
        this.f_updateMainPanel(anchorId == undefined ? 'VM' : anchorId);

        return this.m_mainPanel;
    },

    f_processOnAnchorInvoke: function(anchorId)
    {
        /////////////////////////////////////////////
        // find out if the anchor is horz anchor or
        // vert anchor
        var isHorzAnchor = false;
        if(anchorId == undefined)
        {
            this.m_selTopAnchorName = 'VM';
            anchorId = 'VM';
        }

        ///////////////////////////////////////////////////////////
        // let find out the anchor is from top or left panel
        for(var i=0; i<this.f_getOApplianceAnchorData().length; i++)
        {
            ///////////////////////////////////////////
            // if match, anchorId is fall in horz anchor
            if(anchorId == this.f_getOApplianceAnchorData()[i])
            {
                isHorzAnchor = true;
                this.m_selTopAnchorName = anchorId;
                break;
            }
        }

        if(isHorzAnchor)
            this.f_processDataPanelForTopAnchor(anchorId);
        else  // user select anchor on left panel
            this.f_processDataPanelForLeftAnchor(anchorId);

        this.f_updateTopPanel(this.f_getOpTopPanelData());
    },

    f_invokeVMDashboardAnchor: function()
    {
        this.m_selLeftAnchorName = this.f_getVMAnchorData()[0];
        f_getVMDataFromServer(this, this.f_getVMAnchorData()[0]);
        this.f_updateLeftPanel(this.f_getVMLeftPanelData());
    },

    f_invokeMonitorHardwareAnchor: function()
    {
        f_getMonitoringHardwareDataFromServer(this);
        this.m_selLeftAnchorName = this.f_getMonitoringAnchorData()[0];
        this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                  this.f_getMonitoringAnchorData()));
    },
    f_invokeUserAnchor: function()
    {
        f_getUserDataFromServer(this);
        this.m_selLeftAnchorName = this.f_getUserAnchorData()[0];
        this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                this.f_getUserAnchorData()));
    },

    f_invokeBackupAnchor: function()
    {
        f_getVMDataFromServer(this, this.f_getBackupAnchorData()[0]);
        this.m_selLeftAnchorName = this.f_getBackupAnchorData()[0];
        this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                this.f_getBackupAnchorData()));
    },

    f_processDataPanelForTopAnchor: function(anchorId)
    {
        g_opPanelObject.m_dataPanelTitle = anchorId;

        switch(this.m_selTopAnchorName)
        {
            case 'VM':
            default:
                g_opPanelObject.m_dataPanelTitle = 'VM &rArr; VM Dashboard';
                this.f_invokeVMDashboardAnchor();
                break;
            case 'User':
                g_opPanelObject.m_dataPanelTitle = 'Users';
                this.f_invokeUserAnchor();
                break;
            case 'Monitoring':
                g_opPanelObject.m_dataPanelTitle = 'Monitoring &rArr; Hardware';
                this.f_invokeMonitorHardwareAnchor();
                break;
            case 'Backup':
                g_opPanelObject.m_dataPanelTitle = 'Backup &rArr; Configuration Backup';
                this.f_invokeBackupAnchor();
                break;
        }
    },

    f_processDataPanelForLeftAnchor: function(anchorId)
    {
        g_opPanelObject.m_dataPanelTitle = this.m_selTopAnchorName + ' &rArr; ';

        switch(anchorId)
        {
            case 'VM_Dashboard':
                g_opPanelObject.m_dataPanelTitle += 'VM Dashboard';
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[0]
                this.f_invokeVMDashboardAnchor();
                break;
            case 'Update_VM_Software':
                g_opPanelObject.m_dataPanelTitle += 'Update VM Software';
                this.m_selLeftAnchorName = this.f_getVMAnchorData()[1];
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[0]
                f_getVMDataFromServer(this, this.f_getVMAnchorData()[1]);
                this.f_updateLeftPanel(this.f_getVMLeftPanelData());
                break;
            case 'Restart':
                g_opPanelObject.m_dataPanelTitle += 'Restart';
                f_getVMDataFromServer(this, this.f_getVMAnchorData()[2]);
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[0]
                this.m_selLeftAnchorName = this.f_getVMAnchorData()[2];
                this.f_updateLeftPanel(this.f_getVMLeftPanelData());
                break;
            case 'Hardware':
                g_opPanelObject.m_dataPanelTitle += 'Hardware';
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[2]
                this.f_invokeMonitorHardwareAnchor();
                break;
            case 'Network':
                g_opPanelObject.m_dataPanelTitle += 'Network';
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[2]
                f_getMonitoringNetworkDataFromServer(this);
                this.m_selLeftAnchorName = this.f_getMonitoringAnchorData()[1];
                this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                          this.f_getMonitoringAnchorData()));
                break;
            case 'Software':
                g_opPanelObject.m_dataPanelTitle += 'Software';
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[2]
                f_getMonitoringSoftwareDataFromServer(this);
                this.m_selLeftAnchorName = this.f_getMonitoringAnchorData()[2];
                this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                          this.f_getMonitoringAnchorData()));
                break;
            case 'User':
                g_opPanelObject.m_dataPanelTitle = 'Users';
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[1]
                this.f_invokeUserAnchor();
                break;
            case 'User_Right':
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[1]
                g_opPanelObject.m_dataPanelTitle = 'Users Right';
                f_getUserRightDataFromServer(this);
                this.m_selLeftAnchorName = this.f_getUserAnchorData()[1];
                this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                        this.f_getUserAnchorData()));
                break;
            case 'Configuration_Backup':
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[3]
                g_opPanelObject.m_dataPanelTitle += 'Configuration Backup';
                this.f_invokeBackupAnchor();
                break;
            case 'Configuration_Restore':
                this.m_selTopAnchorName = g_opPanelObject.f_getOApplianceAnchorData()[3]
                g_opPanelObject.m_dataPanelTitle += 'Configuration Restore';
                f_getConfigRestoreDataFromServer(this);
                this.m_selLeftAnchorName = this.f_getBackupAnchorData()[1];
                this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                          this.f_getBackupAnchorData()));
                break;
        }
    }
    ////////////////////////////////////////////////////////////////////////////
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function f_sendServerCommand(checkLogin, xmlSend, callback, showWait)
{
    ////////////////////////////////////////////////////////
    // stop the background task before command sent
    //f_stopBackgroundTask(g_opPanelObject);

    if(checkLogin)
    {
        if(!f_isUserLogined(true, true))
        {
            window.location = 'ft_main.html';
            return;
        }
    }

    var xmlStr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
               + "<vyatta>" +
               xmlSend + "</vyatta>\n";

    if(showWait == undefined || showWait == true)
        f_promptWaitMessage('Wait for Server Response ...',
                                              'Post Request to Server');

    /* send request */
    var conn = new Ext.data.Connection({});
    conn.request(
    {
        url: '/cgi-bin/webgui-oa', method: 'POST',
        xmlData: xmlStr,
        callback: callback
    });
}

function f_parseVMDashboarData(vm)
{
    var q = Ext.DomQuery;
    var vmName = vm.getAttribute('name');

    var status = q.selectValue('status', vm);
    status = status == undefined ? 'unknown' : status;

    var cpu = q.selectNode('cpu', vm).getAttribute('util');
    cpu = cpu == undefined ? 0 : cpu;

    var mem = q.selectNode('mem', vm);
    var memTotal = mem.getAttribute('total');
    var memFree = mem.getAttribute('free');

    var disk = q.selectNode('disk', vm);
    var diskTotal = disk.getAttribute('total');
    var diskFree = disk.getAttribute('free');

    if(vmName == 'jvm')
        g_3rdPartyURL = q.selectValue('guiUrl', vm);
    else if(vmName == 'router')
        g_vyattaURL = q.selectValue('guiUrl', vm);
    else if(vmName == 'pbx')
        g_pbxURL = q.selectValue('guiUrl', vm);

    ///////////////////////////////////////
    // get current and available versions
    var versions = q.selectNode('version', vm);
    var verCur = q.selectNumber('current', versions)
    var disVerCur = q.selectValue('current', versions);
    var verAvails = q.select('avail', versions);
    var vAvails = [ ];
    var updateAvail = '';
    for(var j=0; j<verAvails.length; j++)
        vAvails[j] = q.selectNumber('avail:nth(' + (j+1) + ')', versions);

    updateAvail = (verAvails.length > 1) ?
                    'updateAval_yes' : 'updateAval_no';

    var deploy = q.selectNode('deploy', vm);
    deploy = (deploy != undefined && q.selectValue('scheduled', deploy) != undefined) ?
              'deploy_yes' : 'deploy_no';

    return [ vmName, status, cpu, f_findPercentage(memTotal, memFree),
              f_findPercentage(diskTotal, diskFree), disVerCur, updateAvail, deploy,
              memTotal, memFree, diskTotal, diskFree];
}

function f_parseVMDeployData(vm)
{
    var q = Ext.DomQuery;
    var vmName = vm.getAttribute('name');
    var versions = q.selectNode('version', vm);
    var disVerCur = q.selectValue('current', versions);
    var verCur = q.selectNumber('current', versions)

    var verAvails = q.select('avail', versions);
    if(verAvails.length > 1)
    {
        var vAvails = [];
        var hAvail=disVerCur;   // higher version
        var lAvail=disVerCur;   // lower version
        for(var j=0; j<verAvails.length; j++)
        {
            var v = q.selectNumber('avail:nth(' + (j+1) + ')', versions);
            var vv = q.selectValue('avail:nth(' + (j+1) + ')', versions);
            vAvails[j] = [vv, vv];
            hAvail = (v >= verCur && v > Number(hAvail)) ? vv : hAvail;
            lAvail = (v < verCur) ? vv : lAvail;
        }
        var updateAvail = Number(hAvail) == verCur ? lAvail : hAvail;

        var deploy = q.selectNode('deploy', vm);
        deploy = (deploy != undefined) ? q.selectValue('scheduled', deploy) : V_NOT_FOUND;
        var deployStatus = deploy == V_NOT_FOUND ? 'deploy_no' : 'deploy_yes';
        deploy = deploy == V_NOT_FOUND ? ["", ""] : deploy.split(' ');

        return ['checker', vmName, deployStatus, disVerCur, updateAvail, deploy[1],
                deploy[0], vAvails];
    }

    return null;
}
function f_populateVMRestartPanel(opObject, vmData)
{
    if(opObject.m_vmRestartStore == undefined)
    {
        opObject.m_vmRestartStore = new Ext.data.SimpleStore(
        {
            fields: [
                { name: 'vm' },
                { name: 'status' },
                { name: 'restart' },
                { name: 'stop' },
                { name: 'start' }
            ]
        });
    }
    else
    {
        var vmHeader = ['vm', 'status', 'restart', 'stop', 'start'];
        f_updateVMDataStore(opObject.m_vmRestartStore, vmHeader, vmData);
        return;
    }

    var cm = new Ext.grid.ColumnModel(
    [
        {id: 'vm', header: 'VM', width: 120, sortable: true, dataIndex: 'vm',
              renderer: f_renderGridText},
        {header: 'Status', width: 55, sortable: false, renderer: f_renderGridImage,
                dataIndex: 'status', fixed: true},
        {header: ' ', width: 110, sortable: false, renderer: f_renderGridButton,
                dataIndex: 'restart'},
        {header: ' ', width: 110, sortable: false, renderer: f_renderGridButton,
                dataIndex: 'stop'},
        {header: ' ', width: 110, sortable: false, renderer: f_renderGridButton,
                dataIndex: 'start'}
    ]);
    opObject.m_vmRestartStore = new Ext.data.SimpleStore(
    {
        fields: [
            { name: 'vm' },
            { name: 'status' },
            { name: 'restart' },
            { name: 'stop' },
            { name: 'start' }
        ]
    });
    opObject.m_vmRestartStore.loadData(vmData);
    opObject.m_vmRestartStore.colHeaders = opObject.f_getVMRestartColHeader(false);

    ////////////////////////////////////////////////////
    // add main grid into working panel
    var gPanels = opObject.f_createEditorGridPanel(opObject,
                  opObject.m_vmRestartStore, cm, undefined, 'vm',
                  opObject.m_dataPanelTitle);

    gPanels[gPanels.length] = f_createEmptyPanel();

    ///////////////////////////////////////////////
    // add WM System log into working panel
    var lPanel = f_createLogPanel('VM System Log',
          'The status of VM Restart will display here....');
    gPanels[gPanels.length] = lPanel;

    opObject.f_updateDataPanel(gPanels);

    //////////////////////////////////////////////
    // enhance header
    var grid = gPanels[0];
    var header = opObject.f_getVMRestartColHeader(true);
    for(var i=0; i<header.length; i++)
        grid.getView().getHeaderCell(i).innerHTML = header[i];
}

function f_parseVMRestartData(vm)
{
    var q = Ext.DomQuery;

    var vmName = vm.getAttribute('name');

    var status = q.selectValue('status', vm);
    status = status == undefined ? 'unknown' : status;

    return [ vmName, status, 'Restart', 'Stop', 'Start' ];
}

function f_parseConfigBackupData(vm)
{
    var q = Ext.DomQuery;
    var vmName = vm.getAttribute('name');

    return [ false, vmName, 'Open Appliance'];
}

function f_parseRestoreData(xmlRoot)
{
    var success = true;
    var errmsg = '';
    var q = Ext.DomQuery;
    var err = q.selectNode('error', xmlRoot);

    if(err != undefined)
    {
        var code = q.selectValue('code', err, 'UNKNOWN');

        if(code == 'UNKNOWN')
        {
            success = false;
            errmsg = "Unknown";
        }
        else if(code != 0)
        {
            success = false;
            var msg = q.selectValue('msg', err, 'UNKNOWN');

            if(msg != 'UNKNOWN')
                errmsg = msg;
        }
        else
        {
            errmsg = new Array();
            var vms = q.select('backup', err);

            for(var i=0; i<vms.length; i++)
                errmsg[i] = [false, vms[i].getAttribute('name')];
        }
    }

    return [ success, errmsg ];
}

function f_parseUserData(vm)
{
    var user = vm.getAttribute('user');
    var last = vm.getAttribute('last');
    var first = vm.getAttribute('first');

    if(f_getUserLoginName() != 'admin' && user == 'admin')
    {
        last = '';
        first = '';
    }

    return [ false, first, last, user, '*****', 'list' ];
}

function f_parseMonitoringHardwareData(hardware)
{
    var q = Ext.DomQuery;

    var nic = f_parseHardwareStatus(q.selectValue('nic', hardware));
    var disk = f_parseHardwareStatus(q.selectValue('disk', hardware));
    var cpu = f_parseHardwareStatus(q.selectValue('cpu', hardware));
    var fan = f_parseHardwareStatus(q.selectValue('fan', hardware));

    return [ ['NIC', nic], ['Disk', disk], ['CPU', cpu], ['Fan', fan]];
}
function f_parseHardwareStatus(hw)
{
    if(hw == undefined || hw == 'unknown')
        return 'unknown';
    else if(hw == 'bad')
        return 'down';
    else
        return 'up';
}

function f_getVMDeployLogFromServer(opObject, logPanel)
{
    var lPanel = logPanel

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;

        var isSuccess = f_parseResponseError(xmlRoot, true);
        lPanel.textArea.setValue(isSuccess[1]);
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<command><id>" + sid + "</id><statement>\n"
               + "vm deploy log</statement></command>";

    f_sendServerCommand(true, xmlstr, serverCommandCb, false);
}

function f_parseServerTime(dt)
{
    if(m_clock.serverTimer == null && dt != null)
    {
        var sdt = dt.split(' ');
        var t = sdt[0].split(':');
        var d = sdt[1].split('.');

        m_clock.m_serverTime = new Date(d[2], d[1]-1, d[0], t[0], t[1], t[2])
        f_clockTicking(m_clock.m_serverTime);
    }
}

function f_getVMDataFromServer(opObject, anchorName, showWaitMsg)
{
    var thisObj = opObject;
    var swm = showWaitMsg == undefined ? true : showWaitMsg;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            if(!swm)
            {
                f_hideSendWaitMessage();
                f_promptErrorMessage('Load VM Data', isSuccess[1]);
            }
            return;
        }

        f_parseServerTime(q.selectValue('time', xmlRoot));

        var vmNodes = q.select('vm', xmlRoot);
        var vmData = [];
        var deployDataIndex = 0;
        for(var i=0; i<vmNodes.length; i++)
        {
            switch(anchorName)
            {
                case thisObj.f_getVMAnchorData()[0]:  // vm dashboard data
                case 'VM_Dashboard':
                case 'VM':
                    vmData[i] = f_parseVMDashboarData(vmNodes[i]);
                    if(i == vmNodes.length-1)
                        f_populateVMDashboardPanel(thisObj, vmData);
                    break;
                case thisObj.f_getVMAnchorData()[1]:  // update vm software
                    var d = f_parseVMDeployData(vmNodes[i]);

                    //////////////////////////////////////////
                    // want only update is available
                    if(d != null)
                        vmData[deployDataIndex++] = d;

                    if(i == vmNodes.length-1)
                    {
                        var logPanel = f_populateVMDeploySoftwarePanel(thisObj, vmData);
                        f_getVMDeployLogFromServer(thisObj, logPanel);
                    }
                    break;
                case thisObj.f_getVMAnchorData()[2]: // vm restart
                    vmData[i] = f_parseVMRestartData(vmNodes[i]);
                    if(i == vmNodes.length-1)
                        f_populateVMRestartPanel(thisObj, vmData);
                    break;
                case thisObj.f_getBackupAnchorData()[0]:  // configuration backup
                    ////////////////////////////////////////
                    // skip the open appliance
                    if(i == 0) continue;

                    vmData[i-1] = f_parseConfigBackupData(vmNodes[i]);
                    if(i == vmNodes.length-1)
                        f_populateConfigBackupPanel(thisObj, vmData);
                    break;
            }
        }

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmstatus><id>" + sid + "</id>\n"
               + "</vmstatus>";

    f_sendServerCommand(true, xmlstr, serverCommandCb, showWaitMsg);
}

function f_populateVMDashboardPanel(opObject, vmData)
{
    if(opObject.m_dashboardStore == undefined)
    {
        opObject.m_dashboardStore = new Ext.data.SimpleStore(
        {
            fields: [
                { name: 'vm' },
                { name: 'status' },
                { name: 'cpu' },
                { name: 'ram' },
                { name: 'diskSpace' },
                { name: 'current' },
                { name: 'available' },
                { name: 'deployment'},
                { name: 'memTotal' },
                { name: 'memFree' },
                { name: 'diskTotal' },
                { name: 'diskFree'}]
        });
    }
    else
    {
        var vmHeader = ['vm', 'status', 'cpu', 'ram', 'diskSpace', 'current',
                    'available', 'deployment', 'memTotal', 'memFree',
                    'diskTotal', 'diskFree'];
        f_updateVMDataStore(opObject.m_dashboardStore, vmHeader, vmData);
        return;
    }

    var cm = new Ext.grid.ColumnModel(
    [
        {header: 'VM', width: 120, sortable: true, dataIndex: 'vm',
                style: 'padding:10px 0px 0px 5px', renderer: f_renderGridText},
        {header: 'Status', width: 50, sortable: false, renderer: f_renderGridImage,
                dataIndex: 'status', fixed: false, align: 'center'},
        {header: 'CPU', width: 100, sortable: false, renderer: f_renderProgressBarChange,
                dataIndex: 'cpu', align: 'center'},
        {header: 'RAM', width: 100, sortable: false, renderer: f_renderProgressBarChange,
                dataIndex: 'ram', align: 'center'},
        {header: 'Disk Space', width: 100, sortable: false, renderer: f_renderProgressBarChange,
                dataIndex: 'diskSpace', align: 'center'},
        {header: 'Current Version', width: 60, sortable: false,
                dataIndex: 'current', fixed: false, align: 'center'},
        {header: 'Available Version', width: 60, sortable: false,
                dataIndex: 'available', fixed: false, align: 'center',
                renderer: f_renderGridImage},
        {header: 'Deployment Scheduled', width: 76, sortable: false, align: 'center',
                dataIndex: 'deployment', fixed: false, renderer: f_renderGridImage},
        {header: 'memTotal', hidden:true, dataIndex:'memTotal'},
        {header: 'memFree', hidden:true, dataIndex:'memFree'},
        {header: 'diskTotal', hidden:true, dataIndex:'diskTotal'},
        {header: 'diskFree', hidden:true, dataIndex:'diskFree'}
    ]);

    opObject.m_dashboardStore.loadData(vmData);
    opObject.m_dashboardStore.colHeaders = opObject.f_getVMDashboardColHeader(false);

    var aPanel = f_createDashboardAnchorPanel()

    ///////////////////////////////////////////////////////
    // add grid into working panel
    var grid = opObject.f_createGridPanel(opObject.m_dashboardStore,
                cm, undefined, 'vm', undefined,
                opObject.m_dataPanelTitle);

    var panels = [grid, f_createEmptyPanel(), aPanel];
    opObject.f_updateDataPanel(panels);

    //////////////////////////////////////////////
    // enhance header
    var header = opObject.f_getVMDashboardColHeader(true);
    for(var i=0; i<header.length; i++)
        grid.getView().getHeaderCell(i).innerHTML = header[i];
}

function f_updateVMDataStore(store, vmHeader, vmData)
{
    var index = 0;

    store.each(function(record)
    {
        var commit = false;

        for(var i=0; i<vmHeader.length; i++)
        {
            if(record.get(vmHeader[i]) != vmData[index][i])
            {
                record.set(vmHeader[i], vmData[index][i]);
                commit = true;
            }
        }

        if(commit)
            record.commit();

        index++;
    });
}

function f_getUserDataFromServer(opObject)
{
    var dbData = new Array();
    var thisObject =  opObject;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_hideSendWaitMessage();
            f_promptErrorMessage('Load User', isSuccess[1]);
            return;
        }

        var vmUserNodes = q.select('vmuser', xmlRoot);

        for(var i=0; i<vmUserNodes.length; i++)
            dbData[i] = f_parseUserData(vmUserNodes[i]);

        thisObject.m_userDBData = dbData;
        f_populateUserPanel(thisObject);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmuser op='list'><id>" + sid + "</id>\n"
    + "</vmuser>";

    f_sendServerCommand(true, xmlstr, serverCommandCb);
}

function f_getUserRightDataFromServer(opObject)
{
    var dbData = new Array();
    var thisObject =  opObject;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_hideSendWaitMessage();
            f_promptErrorMessage('Load User', isSuccess[1]);
            return;
        }

        var vmUserNodes = q.select('vmuser', xmlRoot);

        for(var i=0; i<vmUserNodes.length; i++)
            dbData[i] = f_parseUserData(vmUserNodes[i]);

        thisObject.m_userDBData = dbData;
        f_populateUserRightPanel(thisObject);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmuser op='list'><id>" + sid + "</id>\n"
    + "</vmuser>";

    f_sendServerCommand(true, xmlstr, serverCommandCb);
}

function f_getConfigRestoreDataFromServer(opObject)
{
    var dbData = new Array();
    var thisObject =  opObject;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        dbData = f_parseRestoreData(xmlRoot);
        if(!dbData[0])
        {
            f_hideSendWaitMessage();
            f_promptErrorMessage('Load User', dbData[1]);
            return;
        }

        f_populateConfigRestorePanel(thisObject, dbData[1]);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<command><id>" + sid + "</id>\n" +
                "<statement>vm backup-list</statement></command>";

    f_sendServerCommand(true, xmlstr, serverCommandCb, true);
}

function f_populateConfigBackupPanel(opObject, vmData)
{
    var thisObject = opObject;
    var hd = opObject.f_getBackupColHeader(false);
    var htmlhd = opObject.f_getBackupColHeader(true);

    var radioColumnOnMousePress = function()
    {
        f_handleOnRadioColumnClick(store, new Array(buttons.buttons[0]));
    }
    var radioColumn = f_createGridCheckColumn(radioColumnOnMousePress);

    var userStore = new Ext.data.SimpleStore(
    {
        fields: [ 'name', 'value'],
        data: [['Open Appliance', 'Open Appliance'],
                ['My PC', 'My PC']]
    });
    var cb = new Ext.form.ComboBox(
    {
        store: userStore
        ,mode: 'local'
        ,displayField: 'name'
        ,valueField: 'value'
        ,typeAhead: true
        ,triggerAction: 'all'
        ,lazyRender:true
        ,listClass: 'x-combo-list-small'
    });

    var cm = new Ext.grid.ColumnModel(
    [
        radioColumn,
        {header: htmlhd[1], width: 120, sortable: true, dataIndex: hd[1].toLowerCase(),
                menuDisabled: true,
                style: 'padding:10px 0px 0px 5px', renderer: f_renderGridText},
        {header: htmlhd[2], menuDisabled: true, width: 200, sortable: false,
            dataIndex: hd[2].toLowerCase(), fixed: true,
            align:'center',
            renderer: f_renderGridComboBox,
            editor: cb}
    ]);

    var store = new Ext.data.SimpleStore(
    {
        fields: [
            { name: 'checker' },
            { name: 'vm' },
            { name: 'target' }]
    });
    store.loadData(vmData);
    store.colHeaders = hd;

    var handleBackupCallback = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;

        var isSuccess = f_parseResponseError(xmlRoot);
        f_hideSendWaitMessage();

        if(!isSuccess[0])
            f_promptErrorMessage('Error - Backup VM: ' + vmName, isSuccess[1]);
        else
            f_promptInfoMessage('Backup VM: ' + vmName,
                              'Backup complete successfully!');
    }


    var xmlStr = '';
    var target = '';
    var handleBackupButtonPress = function()
    {
        /////////////////////////////////////////
        // find the selected row
        store.each(function(record)
        {
            if(record.get('checker'))
            {
                var sid = f_getUserLoginedID();
                target = record.get('target');
                vmName = record.get('vm');
                xmlStr = "<command><id>" + sid + "</id>" +
                    "<statement>vm backup '" + vmName + "'</statement></command>";
            }
        });

        f_yesNoMessageBox('Configuration Backup',
                'Are you sure you wish to backup the selected VM '+
                'to ' + target + '?',
                startBackup);
    };

    var vmName = '';
    var startBackup = function(btn)
    {
        if(target == 'Open Appliance')
            f_sendServerCommand(true, xmlStr, handleBackupCallback, true);
        else
            f_backupTargetMyPC();
    }

    ///////////////////////////////////////////////////////
    // add grid into working panel
    var gridPanel = opObject.f_createEditorGridPanel(thisObject, store, cm,
                        radioColumn, 'vm',
                        opObject.m_dataPanelTitle);
    var buttons = f_createButtonsPanel(new Array('ft_start_backup_button'),
                      new Array(handleBackupButtonPress));
    buttons.buttons[0].disable();
    gridPanel[gridPanel.length] = buttons;
    opObject.f_updateDataPanel(gridPanel);
}

function f_populateConfigRestorePanel(opObject, vmBackupFiles)
{
    var thisObject = opObject;

    var radioColumnOnMousePress = function()
    {
        f_handleOnRadioColumnClick(store, new Array(buttons.buttons[0]));
    }
    var radioColumn = f_createGridCheckColumn(radioColumnOnMousePress);

    var cm = new Ext.grid.ColumnModel(
    [
        radioColumn,
        {header: "<p align='center'><b>Backup Files from Open Appliance</b></p>",
                sortable: true,
                dataIndex: 'files',
                menuDisabled: true,
                style: 'padding:10px 0px 0px 5px', renderer: f_renderGridText}
    ]);

    var store = new Ext.data.SimpleStore(
    {
        sortInfo: {field: 'files'}
        ,fields: [
            { name: 'checker' },
            { name: 'files' }]
    });
    store.loadData(vmBackupFiles);

    var handleRestoreCallback = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;

        var isSuccess = f_parseResponseError(xmlRoot);
        f_hideSendWaitMessage();

        if(!isSuccess[0])
            f_promptErrorMessage('Error - Restore: ' + restoreFileName, isSuccess[1]);
        else
            f_promptInfoMessage('Restore: ' + restoreFileName,
                                'Restore complete successfully!');
    }

    var xmlStr = '';
    var handlePCRestoreButtonPressed = function()
    {
        /*
        Ext.Ajax.request(
        {
            url:'js/ft_main.js'
            ,params: {method:'requestDownload', id:'js/ft_main.js'}
            ,success: function(response)
            {
                Ext.DomHelper.append(document.body,
                {
                    tag: 'iframe'
                    ,id: 'dowloadIframe'
                    ,frameBorder: 0
                    ,width:0
                    ,height: 0
                    ,css: 'display:none;visibility:hidden;height:0px;'
                    ,src: 'js/ft_main.js'
                });
            }
            ,failure: function()
            {
                alert('fail');
            }
        });
        */
    }
    var handleOARestoreButtonPressed = function()
    {
        /////////////////////////////////////////
        // find the selected row
        store.each(function(record)
        {
            if(record.get('checker'))
            {
                var sid = f_getUserLoginedID();
                restoreFileName = record.get('files');
                xmlStr = "<command><id>" + sid + "</id>" +
                    "<statement>vm restore '" + restoreFileName +
                    "'</statement></command>";
            }
        });

        f_yesNoMessageBox('Configuration Restore',
                'Are you sure you wish to restore the selected file '+
                'from Open Appliance?',
                startRestore);
    };

    var restoreFileName = '';
    var startRestore = function(btn)
    {
        f_sendServerCommand(true, xmlStr, handleRestoreCallback, true);
    }

    ///////////////////////////////////////////////////////
    // add grid into working panel
    var gridPanel = opObject.f_createEditorGridPanel(thisObject, store, cm,
                        radioColumn, 'files',
                        opObject.m_dataPanelTitle+
                        "&nbsp;&rArr;&nbsp;from Open Appliance");
/*/
    var buttons = f_createButtonsPanel(new Array('Start Restore from Open Appliance',
                  'Start Restore from My PC'),
                  new Array(handleOARestoreButtonPressed,
                  handlePCRestoreButtonPressed));
    */
    var buttons = f_createButtonsPanel(new Array('ft_restore_oa_button'),
                  new Array(handleOARestoreButtonPressed));
    buttons.buttons[0].disable();
    gridPanel[gridPanel.length] = buttons;

    opObject.f_updateDataPanel(gridPanel);
}

function f_createNameValueStoreComboBox(vmData, index)
{
    var updateStore = [];
    var storeData=[];
    for(var i=0; i<vmData.length; i++)
    {
        storeData[i] = vmData[i][index];
        updateStore[i] = new Ext.data.SimpleStore(
        {
            fields: [ 'value', 'name' ],
            data: storeData[i]
        });
    }

    var cb = new Ext.form.ComboBox(
    {
        store: updateStore[0]
        ,mode: 'local'
        ,displayField: 'name'
        ,valueField: 'value'
        ,typeAhead: true
        ,triggerAction: 'all'
        ,lazyRender:true
        ,editable:false
        ,listClass: 'x-combo-list-small'
        ,listeners: { expand: function(obj)
        {
            cb = obj;
            cb.reset();
            this.store.removeAll();
            this.store.loadData(storeData[g_opPanelObject.m_selGridRow]);
        }}
    });

    return cb;
}

function f_populateVMDeploySoftwarePanel(opObject, vmData)
{
    var thisObject = opObject;
    var fm = Ext.form;
    thisObject.vmData = vmData;

    var CheckColumnOnMousePress = function()
    {
        //f_handleEnableDisableButtons(bPanel.buttons, store);
        bPanel.buttons[1].disable();
        bPanel.buttons[1].disable();

        store.each(function(record)
        {
            if(record.get('checker'))
            {
                if(record.get(hd[2]) == 'deploy_yes')
                    bPanel.buttons[1].enable();
                else
                    bPanel.buttons[0].enable();
            }
        });
    }

    var checkColumn = f_createGridCheckColumn(CheckColumnOnMousePress);
    var cb = f_createNameValueStoreComboBox(vmData, 7);

    var hd = opObject.f_getVMDeploySoftwareColHeader(false);
    hd = [ hd[0].toLowerCase().replace(' ', ''),
                      hd[1].toLowerCase().replace(' ', ''),
                      hd[2].toLowerCase().replace(' ', ''),
                      hd[3].toLowerCase().replace(' ', ''),
                      hd[4].toLowerCase().replace(' ', ''),
                      hd[5].toLowerCase().replace(' ', ''),
                      hd[6].toLowerCase().replace(' ', ''),
                      hd[7].toLowerCase().replace(' ', ''),];

    var cm = new Ext.grid.ColumnModel([
        checkColumn,
        {header: 'VM', width: 120, menuDisabled: true, fixed: true,
            sortable: false, dataIndex: hd[1],
            align:'left'},
        {header: 'Deployment Status', width: 100, sortable: false, fixed: true,
            menuDisabled: true, dataIndex: hd[2],
            align:'center', renderer: f_renderGridImage},
        {header: 'Current Version', width: 80, sortable: false, fixed: true,
            menuDisabled: true, dataIndex: hd[3],
            align:'center'},
        {header: 'Available Version', menuDisabled: true, width: 90, sortable: false,
            dataIndex: hd[4], fixed: true,
            align:'center',
            renderer: f_renderGridComboBox,
            editor: cb},
        {header: 'Deployment Schedule', width: 100, menuDisabled: true, sortable: false,
            dataIndex: hd[5],
            align:'center',
            type: 'date',
            dateFormat: 'd-m-y',
            renderer: f_renderGridDateField,//Ext.util.Format.dateRenderer('d/m/Y'),
            editor: new fm.DateField(
            {
                format: 'd-m-y'
                ,minValue: '01-01-08'
                //disabledDays: [0, 6 ],
                //disabledDaysText: 'Plants are not available on the weekends'
                ,listeners:
                {
                    beforeshow: function()
                    {
                        f_handleEnableDisableVMUpdateTextField(this, store, hd[2])
                    }
                }
            })
        },
        {header: 'Deployment Schedule', width: 90, menuDisabled: true, sortable: false,
            dataIndex: hd[6],
            align:'center',
            type: 'date',
            renderer: f_renderGridTimeField,
            editor: new fm.TimeField(
            {
                increment: 15
                ,format: 'H:i'
                ,listeners:
                {
                    beforeshow: function()
                    {
                        f_handleEnableDisableVMUpdateTextField(this, store, hd[2])
                    }
                }
            })
        },
        {header: 'AvalVersionData',
            dataIndex: hd[7],
            hidden:true
        }
    ]);

    var store = new Ext.data.SimpleStore(
    {
        fields: [
            { name: hd[0], type: 'bool' },
            { name: hd[1]},
            { name: hd[2]},
            { name: hd[3]},
            { name: hd[4]},
            { name: hd[5]}, //type: 'date', dateFormat: 'n/j h:ai' },
            { name: hd[6]},
            { name: hd[7]}
        ]
    });

    //////////////////////////////////////////////////////
    // load data
    store.loadData(vmData);
    store.colHeaders = opObject.f_getVMDeploySoftwareColHeader(false);

    var handleDeploySelectedButtonPress = function()
    {
        f_yesNoMessageBox('VM Deployment',
                'Are you sure you wish to deploy the selected vm?',
                handleDeployVM);
    }

    var handleCancelSelectedButtonPress = function()
    {
        f_yesNoMessageBox('Cancel VM Deployment',
                'Are you sure you wish to cancel the selected vm deployment?',
                handleCancelDeploy);
    }

    var handleDeployVM = function()
    {
        var deployVMs = [];
        var sid = f_getUserLoginedID();

        store.each(function(record)
        {
            if(record.get('checker'))
            {
                if(record.get(hd[2]) != 'deploy_yes')
                {
                    var dDate = record.get(hd[5]);
                    var dTime = record.get(hd[6]);
                    var version = record.get(hd[4]);
                    var curDate = m_clock.m_serverTime;

                    if(dDate < curDate)
                        dTime = 'now + 1 minute';
                    else
                        dTime = dTime + ' ' + dDate.format('d.m.Y');

                    deployVMs.push("<command><id>" + sid + "</id>" +
                        "<statement>vm deploy schedule '"+ record.get('vm') +
                        "' '" + version + "' '"  + dTime +
                        "'</statement></command>");
                }
            }
        });

        var numOfSent = deployVMs.length;
        var serverCommandCb = function(options, success, response)
        {
            var xmlRoot = response.responseXML.documentElement;

            var isSuccess = f_parseResponseError(xmlRoot);
            if(!isSuccess[0])
                f_promptErrorMessage('VM Deployment', isSuccess[1]);

            numOfSent--;

            /////////////////////////////////////////////
            // if we received all the command callback
            // then refresh the user screen.
            if(numOfSent == 0)
                f_onClickAnchor('Update_VM_Software');
        }

        //////////////////////////////////////////////
        // ready to send commands to server
        while(deployVMs.length > 0)
            f_sendServerCommand(true, deployVMs.pop(), serverCommandCb, false);

        CheckColumnOnMousePress();
    }
    var handleCancelDeploy = function()
    {
        var cancelVMs = [];
        var sid = f_getUserLoginedID();

        store.each(function(record)
        {
            if(record.get('checker'))
            {
                if(record.get(hd[2]) == 'deploy_yes')
                {
                    cancelVMs.push("<command><id>" + sid + "</id>" +
                        "<statement>vm deploy cancel '"+ record.get('vm') +
                        "'</statement></command>");
                }
            }
        });

        var numOfSent = cancelVMs.length;
        var serverCommandCb = function(options, success, response)
        {
            var xmlRoot = response.responseXML.documentElement;

            var isSuccess = f_parseResponseError(xmlRoot);
            if(!isSuccess[0])
                f_promptErrorMessage('Cancel VM Deployment', isSuccess[1]);

            numOfSent--;

            /////////////////////////////////////////////
            // if we received all the command callback
            // then refresh the user screen.
            if(numOfSent == 0)
                f_onClickAnchor('Update_VM_Software');
        }

        //////////////////////////////////////////////
        // ready to send commands to server
        while(cancelVMs.length > 0)
            f_sendServerCommand(true, cancelVMs.pop(), serverCommandCb, false);

        CheckColumnOnMousePress();
    }

    //////////////////////////////////////////////////////////
    // create grid panel
    var gPanel = thisObject.f_createEditorGridPanel(thisObject, store, cm, checkColumn,
                      'vm', thisObject.m_dataPanelTitle);
    var bPanel = f_createButtonsPanel(new Array('ft_update_vm_software_button',
                  'ft_cancel_update_vm_software_button'),
                  new Array(handleDeploySelectedButtonPress,
                            handleCancelSelectedButtonPress));
    bPanel.buttons[0].disable();
    bPanel.buttons[1].disable();
    gPanel[gPanel.length] = bPanel;
    var grid = gPanel[0];
    gPanel[gPanel.length] = f_createEmptyPanel();

    ///////////////////////////////////////////////
    // add WM deployment log into working panel
    var lPanel = f_createLogPanel('VM Software Deployment Log', "");
    gPanel[gPanel.length] = lPanel;
    thisObject.f_updateDataPanel(gPanel);

    ///////////////////////////////////////////////////////
    // enhance grid header
    var header = thisObject.f_getVMDeploySoftwareColHeader(true);
    for(var i=1; i<header.length; i++)
        grid.getView().getHeaderCell(i).innerHTML = header[i];

    return lPanel;
}

function f_populateUserRightPanel(opObject)
{
    var lPanel = f_createLogPanel('User &rArr; User Right',
          'This page is under construction...');

    opObject.f_updateDataPanel(new Array(lPanel));
}

function f_handleEnableDisableButtons(buttons, store)
{
    for(var i=0; i<buttons.length; i++)
        buttons[i].disable();

    store.each(function(record)
    {
        if(record.get('checker'))
        {
            for(var i=0; i<buttons.length; i++)
                buttons[i].enable();

            return;
        }
    });
}

function f_handleEnableDisableVMUpdateTextField(tf, store, fieldName)
{
    tf.rec = store.getAt(g_opPanelObject.m_selGridRow);
    if(tf.rec.get(fieldName) == 'deploy_yes')
        tf.disable();
    else
        tf.enable();
}

function f_populateUserPanel(opObject)
{
    var thisObject = opObject;
    var colHeaderNames = thisObject.f_getUserColHeaderNames(false);
    var chnLCase = [ colHeaderNames[0].toLowerCase().replace(' ', ''),
                      colHeaderNames[1].toLowerCase().replace(' ', ''),
                      colHeaderNames[2].toLowerCase().replace(' ', ''),
                      colHeaderNames[3].toLowerCase().replace(' ', ''),
                      colHeaderNames[4].toLowerCase().replace(' ', ''),
                      colHeaderNames[5].toLowerCase().replace(' ', '') ];

    var enableDisableUserButtons = function(opObj)
    {
        var buttonPanel = opObj.buttonPanel;
        f_handleEnableDisableButtons(buttonPanel.buttons, opObj.grid.store);

        if(f_getUserLoginName() == 'admin')
            buttonPanel.buttons[0].enable();
        else
            buttonPanel.buttons[0].disable();
    }

    var CheckColumnOnMousePress = function()
    {
        var grid = thisObject.grid;
        var loginUser = f_getUserLoginName();

        if(loginUser != 'admin')
        {
            grid.store.each(function(record)
            {
                if(record.get('checker') && record.get('username') != loginUser)
                {
                    f_promptErrorMessage('User',
                        'You have no privilege to change this record');
                    record.set('checker', false);
                    return;
                }
            });
        }
        enableDisableUserButtons(thisObject);
    }

    var addCallback = function()
    {
        var values = {};
        values[chnLCase[0]] = true;
        values[chnLCase[1]] = 'EnterFirstname';
        values[chnLCase[2]] = 'EnterLastname';
        values[chnLCase[3]] = 'EnterUsername';
        values[chnLCase[4]] = 'EnterPassword';
        values[chnLCase[5]] = 'add'

        var record = new Ext.data.Record(values);
        thisObject.store.add(record);

        enableDisableUserButtons(thisObject)
    }
    thisObject.addCallback = addCallback;

    var deleteCallback = function(btn)
    {
        var deleteRecs = [ ];
        var sid = f_getUserLoginedID();

        store.each(function(record)
        {
            if(record.get(chnLCase[0]))
            {
                if(record.get(chnLCase[3]) == 'admin')
                {
                    Ext.Msg.alert('Delete User', 'admin user cannot be deleted.')
                    return;
                }

                var xmlstr = "<vmuser op='delete' " +
                              f_getUserRecordFromScreen(record, chnLCase) +
                              "><id>" + sid + "</id>"  +
                              "</vmuser>";

                deleteRecs.push(xmlstr);
                //store.remove(record);
            }
        });

        var numOfSent = deleteRecs.length;
        var serverCommandCb = function(options, success, response)
        {
            var xmlRoot = response.responseXML.documentElement;

            var isSuccess = f_parseResponseError(xmlRoot);
            if(!isSuccess[0])
            {
                //f_hideSendWaitMessage();
                f_promptErrorMessage('Delete User', isSuccess[1]);
            }

            numOfSent--;

            /////////////////////////////////////////////
            // if we received all the command callback
            // then refresh the user screen.
            if(numOfSent == 0)
                f_onClickAnchor('User');
        }

        //////////////////////////////////////////////
        // ready to send commands to server
        while(deleteRecs.length > 0)
            f_sendServerCommand(true, deleteRecs.pop(), serverCommandCb, false);

        CheckColumnOnMousePress();
    };
    thisObject.deleteCallback = deleteCallback;

    var sendUserXMLString = function(record, op, callback)
    {
        var sid = f_getUserLoginedID();
        var xmlstr = "<vmuser op='" + op + "' " +
                      f_getUserRecordFromScreen(record, chnLCase) +
                      "><id>" + sid + "</id>"  +
                      "</vmuser>";

        f_sendServerCommand(true, xmlstr, callback, false);
    }

    var saveCallback = function()
    {
        grid.store.each(function(record)
        {
            if(record.get(chnLCase[0]))
            {
                if(!f_isUserInputOK(record, colHeaderNames))
                    return;

                var op = record.get(chnLCase[5]) ==
                      'add' ? 'add' : 'change';
                var userName = record.get(chnLCase[3]);

                var serverCommandCb = function(options, success, response)
                {
                    var xmlRoot = response.responseXML.documentElement;

                    var isSuccess = f_parseResponseError(xmlRoot);
                    if(!isSuccess[0])
                    {
                        f_hideSendWaitMessage();
                        f_promptErrorMessage(op + ' User', isSuccess[1] +
                            ' to ' + op + ' ' + userName);
                        return;
                    }

                    f_onClickAnchor('User');
                }

                sendUserXMLString(record, op, serverCommandCb);
            }
        });
    }
    thisObject.saveCallback = saveCallback;

    var checkColumn = f_createGridCheckColumn(CheckColumnOnMousePress);


/*/
    var comboBox = new Ext.form.ComboBox(
    {
        typeAhead: true
        ,displayField: 'first'
        ,mode: 'local'
        ,triggerAction: 'all'
        //,transform: 'userPrivilege'
        ,lazyRender: true
    });
    */

    var store = new Ext.data.SimpleStore(
    {
        fields: [ {name: chnLCase[0], type: 'bool'},
                  {name: chnLCase[1]},
                  {name: chnLCase[2]},
                  {name: chnLCase[3]},
                  {name: chnLCase[4]},
                  {name: chnLCase[5]},]
    });

    var fField = f_createUserTextField(true, 'userText', 'First Name', store);
    var lField = f_createUserTextField(true, 'userText', 'Last Name', store);
    var uField = f_createUserTextField(true, 'userText', 'User Name', store);
    var pField = f_createUserTextField(false, 'password', 'Password', store);
    var cm = new Ext.grid.ColumnModel(
        [
        checkColumn,
        {
            header: '<p align=center><b>Firstname<br>&nbsp;</b></p>',
            id: 'first',
            width: 110,
            sortable: false,
            dataIndex: chnLCase[1],
            fixed: true,
            //type: 'string',
            renderer: f_renderGridTextField,
            menuDisabled: true,
            editor: fField
        },
        {
            header: '<p align=center><b>Lastname<br>&nbsp;</b></p>',
            width: 110,
            sortable: false,
            dataIndex: chnLCase[2],
            renderer: f_renderGridTextField,
            menuDisabled: true,
            editor: lField
        },
        {
            header: '<p align=center><b>Username<br>&nbsp;</b></p>',
            width: 110,
            sortable: false,
            dataIndex: chnLCase[3],
            //type: 'string',
            renderer: f_renderGridTextField,
            menuDisabled: true,
            editor: uField
        },
        {
            header: '<p align=center><b>Password<br>&nbsp;</b></p>',
            width: 110,
            sortable: false,
            dataIndex: chnLCase[4],
            renderer: f_renderGridTextField,
            menuDisabled: true,
            editor: pField
        },
        {header: chnLCase[5], hidden:true, dataIndex:chnLCase[5] }
        ]);

    store.loadData(thisObject.m_userDBData);
    store.colHeaders = colHeaderNames;

    ///////////////////////////////////////////////////////
    // add user panel grid into working panel
    var panels = thisObject.f_createEditorGridPanel(thisObject, store, cm, checkColumn,
                    'user', thisObject.m_dataPanelTitle);
    thisObject.store = store;
    var buttonPanel = f_createUserButtonsPanel(thisObject);
    thisObject.buttonPanel = buttonPanel;
    panels[panels.length] = buttonPanel;


    //////////////////////////////////////////////
    // enhance header
    var grid = panels[0];

    thisObject.f_updateDataPanel(panels);
}

function f_isUserInputOK(record, colHeaderNames)
{
    for(var i=1; i<4; i++)
    {
        if(!f_isUserTextValid(record.get(
                colHeaderNames[i].toLowerCase().replace(' ', ''))))
        {
            f_promptErrorMessage('User', 'Invalid Input!\n' +
                'Please enter 0-9 a-z A-Z - or _ characters only for ' +
                colHeaderNames[i]);

            return false;
        }
    }

    if(!f_isPasswordValid(record.get(colHeaderNames[4])))
    {
        f_promptErrorMessage('User', 'Invalid Input!\n' +
                colHeaderNames[4] + ' field cannot be blank');

        return false;
    }

    return true;
}

function f_getUserRecordFromScreen(record, colHeaderNames)
{
    var pw = f_filterPassword(record.get(colHeaderNames[4]), true);
    pw = pw == '*****' ? '' : " password='" + pw + "'";

    return "user='" + record.get(
            colHeaderNames[3]) +
            "' last='" + record.get(
            colHeaderNames[2]) +
            "' first='" + record.get(
            colHeaderNames[1]) + "'" + pw;
}

function f_getMonitoringNetworkDataFromServer(opObject)
{
    var thisObject = opObject;

    f_populateMonitoringNetworkPanel(thisObject);
}

function f_getMonitoringSoftwareDataFromServer(opObject)
{
    var thisObject = opObject;

    f_populateMonitoringSoftwarePanel(thisObject);
}

function f_getMonitoringHardwareDataFromServer(opObject, showWaitMsg)
{
    var dbData = new Array();
    var thisObject = opObject;
    var swm = showWaitMsg == undefined ? true : showWaitMsg;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            if(!swm)
            {
                f_hideSendWaitMessage();
                f_promptErrorMessage('Load Monitoring Hardware', isSuccess[1]);
            }
            return;
        }

        var hwNodes = q.select('hw', xmlRoot);
            dbData = f_parseMonitoringHardwareData(hwNodes[0]);

        thisObject.m_monitorHwDBData = dbData;
        f_populateMonitoringHardwarePanel(thisObject);

        f_hideSendWaitMessage();
        //f_startBackgroundTask(g_opPanelObject);
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmstatus><id>" + sid + "</id>\n"
    + "</vmstatus>";

    f_sendServerCommand(true, xmlstr, serverCommandCb, swm);
}

function f_populateMonitoringNetworkPanel(opObject)
{
    var lPanel = f_createLogPanel('Monitoring &rArr; Network',
          'This page is under construction...');

    opObject.f_updateDataPanel(new Array(lPanel));
}

function f_populateMonitoringSoftwarePanel(opObject)
{
    var lPanel = f_createLogPanel('Monitoring &rArr; Software',
          'This page is under construction...');

    opObject.f_updateDataPanel(new Array(lPanel));
}

function f_populateMonitoringHardwarePanel(opObject)
{
    var cm = new Ext.grid.ColumnModel([
    {
        id: 'component',
        header: 'Component',
        sortable: true,
        dataIndex: 'component'
    },
    {
        header: 'Status',
        width: 70,
        sortable: false,
        renderer: f_renderGridImage,
        dataIndex: 'status',
        fixed: true,
        align: 'center'
    }
    ]);

    var store = new Ext.data.SimpleStore(
    {
        fields: [
        {
            name: 'component'
        },
        {
            name: 'status'
        }
        ]
    });
    store.loadData(opObject.m_monitorHwDBData);
    store.colHeaders = opObject.f_getMonitorHWColHeader(false);

    ////////////////////////////////////////////////////
    // add grid into working panel
    var grid = opObject.f_createGridPanel(store, cm, undefined, 'component',
                        undefined, opObject.m_dataPanelTitle);
    opObject.f_updateDataPanel(new Array(grid));

    //////////////////////////////////////////////
    // enhance header
    var headers = opObject.f_getMonitorHWColHeader(true);
    for(var i=0; i<headers.length; i++)
        grid.getView().getHeaderCell(i).innerHTML = headers[i];
}

function f_getGridHeaderName(store, colIndex)
{
    if(store.colHeaders != undefined)
        return store.colHeaders[colIndex].replace(' ', '&nbsp;');

    return '&nbsp;';
}

function f_renderGridText(val, metaData, record, rIndex, cIndex, store)
{
    metaData.attr = 'ext:qtitle="' + f_getGridHeaderName(store, cIndex) +
                        ':" ext:qtip=' + val;

    return val;
}

function f_onMouseOvertoolTip(img, title, tip)
{
    new Ext.ToolTip(
    {
        target: img
        ,html: tip
        ,title: title
        ,trackMouse: true
    });
}

function f_renderGridImage(val, metaData, record, rIndex, cIndex, store)
{
    var str = undefined;
    var title = f_getGridHeaderName(store, cIndex);
    var tip = '';

    switch(val)
    {
        case 'deploy_yes':   // deploy is scheduled
            tip = '"Yes"';
            title = 'Deployment&nbsp;Scheduled:';
            str = String.format(
              "<span align='center'><img src='images/statusUp.gif'"+
              "onmouseover='f_onMouseOvertoolTip(this, \"" + title +
              "\", " + tip + ")' /></span>");
            break;
        case 'deploy_no':   // deploy is not scheduled
            tip = '"No"';
            title = 'Deployment&nbsp;Scheduled:';
            str = String.format(
              "<span align='center'><img src='images/statusDown.gif'"+
              "onmouseover='f_onMouseOvertoolTip(this, \"" + title +
              "\", " + tip + ")' /></span>");
            break;
        case 'updateAval_yes':
            tip = '"<font color=green>Update version is available</font>"';
            title = 'Update&nbsp;Version:'
            str = String.format(
              "<span align='center'><img src='images/statusUp.gif'"+
              "onmouseover='f_onMouseOvertoolTip(this, \"" + title +
              "\", " + tip + ")' /></span>");
            break;
        case 'updateAval_no':
            tip = '"<font color=red>Update version is not available</font>"';
            title = 'Update&nbsp;Version:'
            str = String.format(
              "<span align='center'><img src='images/statusDown.gif'" +
              "onmouseover='f_onMouseOvertoolTip(this, \"" + title +
              "\", " + tip + ")''/></span>");
            break;
        case 'up':
            tip = '"The value is <font color=green><b>Up</b></font>"';
            str = String.format(
              "<span align='center'><img onmouseover='f_onMouseOvertoolTip(this, \"" + title +
              "\", " + tip + ")'"+
              "src='images/statusUp.gif' /></span>");
            break;
        case 'down':
            tip = '"The value is <font color=red><b>Down</b></font>"';
            str = String.format("<span align='center'><img src='images/statusDown.gif' " +
            "onmouseover='f_onMouseOvertoolTip(this, \"" + title +
            "\", " + tip + ")'/></span>");
            break;
        default:
            tip = '"The value is <font color=#ffcc00><b>Unknow</b></font>"';
            str = String.format("<span align='center'>" +
            "<img onmouseover='f_onMouseOvertoolTip(this, \"" + title +
            "\", " + tip + ")' "+
            "src='images/statusUnknown.gif' /></span>");
    }

    metaData.attr = 'ext:qtitle=' + title + ' ext:qtip=' + tip;

    return str;
}

function f_renderProgressBarChange(val, metaData, record, rowIndex, colIndex, store)
{
    var contentId = Ext.id();

    //alert(Ext.urlEncode(record));
    var tTitle = f_getGridHeaderName(store, colIndex);
    var tTip = "tips";

    switch(colIndex)
    {
        case 2:
            tTitle = "CPU&nbsp;Used:";
            tTip = 'CPU&nbsp;Used=&nbsp;' + record.get('cpu');
            break;
        case 3:
            tTitle = "RAM&nbsp;Used:";
            tTip = 'Total=&nbsp;' + record.get('memTotal') +
                    ',&nbsp;Free=&nbsp;' + record.get('memFree');
            break;
        case 4:
            tTitle = "Disk&nbsp;Space&nbsp;Used:";
            tTip = 'Total=&nbsp;' + record.get('diskTotal') +
                    ',&nbsp;Free=&nbsp;' + record.get('diskFree');
            break;
    }
    metaData.attr = 'ext:qtitle=' + tTitle + ' ext:qtip=' + tTip;

    f_createGridProgressBar.defer(1, this, [val, contentId, metaData,
            record, rowIndex, colIndex, store, tTitle, tTip]);

    return String.format("<span align='center' id='" + contentId +
            "' onmouseover='f_onMouseOvertoolTip(this, \"" + tTitle +
            "\", " + tTip + ")'></span>");
}
function f_createGridProgressBar(val, contentId, metaData, record, rowIndex,
              colIndex, store, tTitle, tTip)
{
    var cls = (Number(val) > 80) ? 'custom_red' : 'custom_green';
    var pBar = new Ext.ProgressBar(
    {
        width: 80
        ,text: val + "%"
        ,value: (val/100)
        ,cls: cls
    });

    pBar.render(document.body, contentId);

    new Ext.ToolTip(
    {
        target: pBar.getId()
        ,title: tTitle
        ,html: tTip
        ,trackMouse: true
    });
}

function f_createGridCheckColumn(callback)
{
    var cl = new Vyatta_grid_CheckColumn(
    {
        header: " "
        ,dataIndex: 'checker'
        ,width: 25
        ,fixed: true
        ,sortable: false
        ,menuDisabled: true
        ,callback: callback
    });

    return cl;
}

function f_createDataPanelNoteMessage()
{
    var msg = '<font color=red><b>* Note: </b></font>' +
    '<font size=1 color=blue>Please click on the desired ' +
    'cell to enter new value.</font>';

    var label = new MyLabel(
    {
        id: 'label_id_node_msg'
        ,border: false
        ,height: 32
        ,width: 400
        ,html: msg
        ,bodyStyle: 'padding: 10px 0px 10px 10px'
    });

    return label
}

function f_createLogPanel(title, logText)
{
    var textArea = new Ext.form.TextArea(
    {
        height: 120
        ,width: 200
        ,scroll: true
        ,value: logText
        ,border: true
        ,readOnly: true
        ,bodyStyle: 'padding: 0px 10px 10px 0px'
    });

    var panel = new Ext.Panel(
    {
        border: false
        ,title: title
        ,bodyStyle: 'padding: 0px 0px 10px 0px'
        ,items: [ textArea ]
    });
    panel.textArea = textArea;

    panel.on({'resize': { fn: function()
    {
        textArea.setSize(panel.getSize().width, 120);
    } }});


    return panel;
}

function f_createGridVMRestartButton(val, contentId, record, rIndex, cIndex)
{
    var disable = true;
    var status = record.get('status');
    var vm = record.get('vm');
    var xmlStatement = '';
    var iconCls = '';

    switch(val)
    {
        case 'Restart':
            if(status == V_STATUS_UP) disable = false;
            xmlStatement = "restart '" + vm + "'";
            iconCls = 'ft_vm_restart_button';
            break;
        case 'Stop':
            if(status == V_STATUS_UP) disable = false;
            xmlStatement = "stop '" + vm + "'";
            hide = rIndex == 0 ? true : false;
            iconCls = 'ft_vm_stop_button';
            break;
        case 'Start':
            if(status == V_STATUS_DOWN) disable = false;
            xmlStatement = "start '" + vm + "'";
            hide = rIndex == 0 ? true : false;
            iconCls = 'ft_vm_start_button';
            break;
    }

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_hideSendWaitMessage();
            f_promptErrorMessage('Load Restart', isSuccess[1]);
            return;
        }

        f_hideSendWaitMessage();
        f_onClickAnchor(g_opPanelObject.f_getVMAnchorData()[2])
    }

    var actionButton = new Ext.Action(
    {
        text: "<b>" + val + "</b>"
        ,disabled: disable
        //,iconCls: iconCls
        ,handler: function()
        {
            var xmlstr = "<command><id>" + f_getUserLoginedID() +
            "</id><statement>vm " + xmlStatement + "</statement></command>";

            f_stopBackgroundTask(g_opPanelObject);
            f_sendServerCommand(true, xmlstr, serverCommandCb);
        }
    });

    var panel = new Ext.Panel(
    {
        cls: 'v-border-less'
        ,tbar: [ actionButton ]
    });

    panel.render(document.body, contentId);
}

function f_renderGridButton(val, p, record, rowIndex, colIndex)
{
    if(val != 'blank')
    {
        var contentId = Ext.id();

        f_createGridVMRestartButton.defer(1, this, [val, contentId, record, rowIndex, colIndex]);
        return String.format("<div align='center'>" +
            "<span id='" + contentId + "'></span></div>");
    }

    return "";
}

function f_renderGridDateField(val, metadata, record, rowIndex, colIndex)
{
    var tt = '"Click on this <font color=#FF6600><b>cell</b></font>' +
              ' to select date.<br>'+
              'To update VM NOW, select past date from calender."';
    metadata.attr = 'ext:qtitle="Date: " ext:qtip=' + tt;

    if(record.get('status') == 'deploy_yes')
    {
        tt = '"This field is not allowed to change."';
        metadata.attr = 'ext:qtitle="Date: " ext:qtip=' + tt;

        return f_replaceAll(g_opPanelObject.vmData[rowIndex][colIndex], '.', '-');
    }

    var sDate = f_compareDateTime(val, "11:59 PM");

    if(sDate == 'now')
        return 'now';
    else
        return Ext.util.Format.date(sDate, 'd-m-y');
}

function f_renderGridTimeField(val, metadata, record, rowIndex, colIndex)
{
    var tt = '"Click on this <font color=#FF6600><b>cell</b></font>' +
              ' to select time.<br>'+
              'To Update VM NOW, select past date from calender."';

    metadata.attr = 'ext:qtitle="Date" ext:qtip=' + tt;

    return val == undefined || val == '' ? "00:00" : val;
}

function f_compareDateTime(vDate, vTime)
{
    var curDate = new Date();
    var givenDate = vDate;
    var givenTime = vTime;

    if(givenDate == undefined || givenDate.length < 5 || givenDate == 'now')
        givenDate = new Date(curDate.getTime() - (24*60*60*1000));

    /////////////////////////////////////////////////////
    if(givenTime == undefined || givenTime.length < 1 || givenTime == 'now')
    {
        givenTime = new Date();
        givenTime = new Date(givenDate.getFullYear(), givenDate.getMonth(),
                        givenDate.getDate(), givenTime.getHours(),
                        givenTime.getMinutes(), 0, 0);
    }
    else
    {
        var h = givenTime.split(':');
        var m = 0;
        if(h[1] != undefined) m = h[1].split(' ');
        if(m[1] != undefined && m[1] == 'PM') h[0] = Number(h[0])+12;

        givenTime = new Date(givenDate.getFullYear(), givenDate.getMonth(), givenDate.getDate(),
                              h[0], m[0], 0, 0);
    }

    if(curDate > givenTime)
        return 'now'
    else
        return givenTime;
}

function f_renderGridComboBox(val, metaData, record, rowIndex, colIndex)
{
    metaData.attr =
        'ext:qtip="Click on this <font color=#FF6600><b>cell</b></font> to select new value"' +
        'ext:qtitle=' + val;

    return val;
}

function f_renderGridTextField(val, metadata, record, rowIndex, colIndex)
{
    var tip = 'ext:qtip="Click on this <font color=#FF6600><b>cell</b></font> enter new value."';

    switch(colIndex)
    {
        case 1:
            if(rowIndex == 0 && f_getUserLoginName() != 'admin')
                val = '';
            break;
        case 2:
            if(rowIndex == 0 && f_getUserLoginName() != 'admin')
                val = ''
            break;
        case 3:
            if(record.get('action') != 'add')
                tip = 'ext:qtip="This cell is not editable except for create user"';
            break;
        case 4:
        {
            if(val == 'EnterPasswword')
                val = '*****';
        }
    }

    metadata.attr = tip + 'ext:qtitle=' + val;

    return val;
}

function f_createUserTextField(disableRowZero, textType, fieldName, store)
{
    var invText = textType == 'password' ? fieldName + ' field is required' :
              'Please enter 0-9 a-z A-Z - or _ characters only for ' +
              fieldName;

    var tf = new Ext.form.TextField(
    {
        allowBlank: false
        ,blankText: 'This field is required'
        ,invalidText: invText
        ,validator: function(v)
        {
            return true;
        }
        ,listeners:
        {
            beforeshow: function()
            {
                if(g_opPanelObject.m_selGridRow == 0 && disableRowZero &&
                    f_getUserLoginName() != 'admin')
                    this.disable();
                else if(this.fieldName == 'User Name')
                {
                    var f = this;
                    f.disable();
                    store.each(function(record)
                    {
                        if((record.get('username') == f.getValue() &&
                            record.get('action') == 'add'))
                        {
                            f.enable();
                            return;
                        }
                    });
                }
                else
                    this.enable();
            }
        }
        ,blur: function(field)
        {
            switch(textType)
            {
                case 'userText':
                    if(!f_isUserTextValid(this.getValue()))
                    {
                        f_promptErrorMessage("User", invText);
                        return false;
                    }
                    break;
            }
        }
    });
    tf.fieldName = fieldName;

    return tf;
}

function f_createDashboardAnchorPanel()
{
    var el = document.createElement("div");
    el.id = 'id_add_delete_vm';
    el.innerHTML = '<ul>'+
                    '<li><a href="#">Add New VM</a></li>' +
                    '<li><a href="#">Remove VM</a></li>' +
                    '</ul>';

    var aPanel = new Ext.Panel(
    {
        border: false
        ,bodyBorder: false
        ,autoScroll: false
        ,contentEl: el
    });
    aPanel.fixHeight = 38;

    return aPanel
}
function f_createButtonsPanel(buttonTexts, callbacks)
{
    var dButtons= [];
    for(var i=0; i<buttonTexts.length; i++)
    {
        dButtons[i] = new Ext.Button(
        {
            text: ''
            ,iconCls: buttonTexts[i]
            ,handler: callbacks[i]
        });
    }

    var panel = new Ext.Panel(
    {
        border: false
        ,height: 10
        ,html: ' '
        ,buttons: dButtons
    });
    panel.fixHeight = 10;

    return panel;
}

function f_createUserButtonsPanel(opObject)
{
    var thisObject = opObject;

    var saveChanged = new Ext.Button(
    {
        text: ''
        ,iconCls: 'ft_save_changes_button'
        ,disabled: true
        ,handler: thisObject.saveCallback
    });

    var deleteSelected = new Ext.Button(
    {
        text: ''
        ,iconCls: 'ft_delete_user_button'
        ,disabled: true
        ,handler: function(btn, e)
        {
            f_yesNoMessageBox('Delete User',
                'Are you sure you wish to delete the selected users?',
                thisObject.deleteCallback);
        }
    });

    var disabled = f_getUserLoginName() == 'admin' ? false : true;
    var addUser = new Ext.Button(
    {
        text: ''
        ,iconCls: 'ft_add_user_button'
        ,disabled: disabled
        ,handler: thisObject.addCallback
    });

    var bPanel = new Ext.Panel(
    {
        border: false
        ,bodyBorder: false
        ,maxHeight:10
        ,bodyStyle: 'padding: 0px 0px 0px 20px'
        ,html: ' '
        ,buttons: [ addUser, deleteSelected, saveChanged ]
    });
    bPanel.fixHeight = 10;

    return bPanel;
}

function f_createEmptyPanel()
{
    var bPanel = new Ext.Panel(
    {
        border: false
        ,bodyBorder: false
        ,html: ' '
        ,height: 38
    });
    bPanel.fixHeight = 38;

    return bPanel
}

function f_loadHelp()
{
    alert('Need link for help');
}

function f_backupTargetMyPC(action)
{
    var forms = document.forms;

    if(forms[0] != undefined && forms[0].id == 'id_my_pc_backup')
    {
        forms[0].action = 'images/test.zip';
        forms[0].submit();
    }
}

function f_onMouseOutHorizPopupMenu(el, duration)
{
    if(el != undefined && el.isVisible())
    {
        el.slideOut('t',
        {
            easing: 'easeOut',
            duration: duration,
            remove: true,
            useDisplay: true
        });

        delete el;
    }
}
function f_onMouseOverHorizAnchor(thisId, anchorId)
{
    var tt='';
    var topAnchor = Ext.get(thisId);
    var x= topAnchor.getXY()[0] - 15;
    var y = topAnchor.getXY()[1] + topAnchor.getHeight();

    //topAnchor.fadeOut({duration:2});
    //topAnchor.frame('#FF6600', 1);
    topAnchor.on(
    {
        'mouseout' :
        {
            fn: function(e, t)
            {
                var xy = e.getXY();
                if(xy[1] < 150)
                {
                    topAnchor.un('mouseout');
                    f_onMouseOutHorizPopupMenu(g_opPanelObject.m_popupMenu, .05);
                }
            }
        }
    });

    ///////////////////////////////////////////////////
    // make sure popup menu is closed
    if(g_opPanelObject.m_popupMenu != null)
    {
        g_opPanelObject.m_popupMenu.un('mouseout');
        f_onMouseOutHorizPopupMenu(g_opPanelObject.m_popupMenu, .05);
    }

    switch(anchorId)
    {
        case g_opPanelObject.f_getOApplianceAnchorData()[0]:  // vm
            tt = g_opPanelObject.f_getVMLeftPanelHTML(
                  g_opPanelObject.f_getVMAnchorData(), anchorId);
            break;
        case g_opPanelObject.f_getOApplianceAnchorData()[1]:  // user
            tt = g_opPanelObject.f_getVMLeftPanelHTML(
                  g_opPanelObject.f_getUserAnchorData(), anchorId);
            break;
        case g_opPanelObject.f_getOApplianceAnchorData()[2]:  // monitering
            tt = g_opPanelObject.f_getVMLeftPanelHTML(
                  g_opPanelObject.f_getMonitoringAnchorData(), anchorId);
            break;
        case g_opPanelObject.f_getOApplianceAnchorData()[3]:  // backup
            tt  = g_opPanelObject.f_getVMLeftPanelHTML(
                  g_opPanelObject.f_getBackupAnchorData(), anchorId);
            break;
        default:
            return;
    }

    f_popupLeftMenu(x, y, tt);
}

function f_popupLeftMenu(xPos, yPos, popupMenuId)
{
    var x = xPos; var y = yPos;

    g_opPanelObject.m_popupMenu = Ext.get(popupMenuId);
    g_opPanelObject.m_popupMenu.moveTo(x, y);
    g_opPanelObject.m_popupMenu.slideIn('t',
    {
        easing: 'easeOut',
        duration: .3
    });
    g_opPanelObject.m_popupMenu.on(
    {
        'mouseout' :
        {
            fn: function(e, t)
            {
                var xy = e.getXY();
                if(xy[0] < x || xy[0] > (x+170) || xy[1] < y ||
                    xy[1] > (g_opPanelObject.m_popupMenu.getHeight()+y-3))
                {
                    g_opPanelObject.m_popupMenu.un('mouseout');
                    f_onMouseOutHorizPopupMenu(g_opPanelObject.m_popupMenu, .1);
                }
            }
        }
    });
}

function f_onClickAnchor(anchorId)
{
    f_onMouseOutHorizPopupMenu(g_opPanelObject.m_popupMenu, .5);
    g_opPanelObject.f_updateMainPanel(anchorId);
}

function f_startBackgroundTask(object)
{
    var mObj = object;
    var byPass = true;

    mObj.m_bkTask =
    {
        run: function()
        {
            ///////////////////////////////////////////////////////////////
            // by pass first run and
            // by pass if command from server has not return.
            if(byPass || g_sendCommandWait.isVisible())
            {
                byPass = false;
                return;
            }

            switch(mObj.m_curScreen)
            {
                case 'VM_Dashboard':   // vm dashboard
                case 'VM':    // vm dashboard
                case 'Restart':
                    f_getVMDataFromServer(mObj, mObj.m_curScreen, false);
                    break;
                case 'Monitoring': // hardward monitor
                case 'Hardware': // hardward monitor
                    f_getMonitoringHardwareDataFromServer(mObj, false);
                    break;
            }
        },
        interval: 1000 * 15
    }

    Ext.TaskMgr.start(mObj.m_bkTask);
}

function f_stopBackgroundTask(object)
{
    if(object != undefined && object.m_bkTask != undefined)
    {
        var runner = new Ext.util.TaskRunner();
        runner.stop(object.m_bkTask);

        object.m_bkTask = undefined;
    }
}