v_opPanelObject = Ext.extend(v_panelObject,
{
    ////////////////////////////////////////////////////////////////////////////
    // local data memeber
    // m_name
    // m_tabName
    // m_parentContainer
    // m_selTopAnchorName
    // m_selLeftAnchorName
    // m_dashboardData
    // m_restartData
    // m_isDashboard
    // m_selGridRow
    // m_selGridCol
    ////////////////////////////////////////////////////////////////////////////


    constructor: function(parentContainer, name)
    {
        this.m_name = name;
        this.m_tabName = 'OpenAppliance';
        this.m_parentContainer = parentContainer;
        this.m_dashboardData = new Array();
        this.m_restartData = new Array();
        this.m_userDBData = new Array();
        this.m_monitorHwDBData = new Array();
        this.m_bkBackupDBData = new Array();
        this.m_bkRestoreDBData = new Array();
        g_opPanelObject = this;

        //v_loginPanelObject.suprclass.constructor.apply(this, arguments);
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
        return [ 'VM Dashboard', 'Deploy VM Software',
                  'Restart'];
    },
    f_getMonitoringAnchorData: function()
    {
        return [ 'Hardware', 'Network', 'Software' ];
    },
    f_getUserAnchorData: function()
    {
        return [ 'User' ];
    },
    f_getBackupAnchorData: function()
    {
        return [ 'Configuration Backup', 'Configuration Restore' ];
    },

    f_getVMDashboardColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['VM', 'Status', 'CPU', 'RAM', 'Desk Space',
                    'Current Version', 'Update Version', 'Deployment Schedule'];
        else
            return ["<p align='center'><b>VM<br></b></p>",
                    "<p align='center'><b>Status<br></b></p>",
                    "<p align='center'><b>CPU<br></b></p>",
                    "<p align='center'><b>RAM<br></b></p>",
                    "<p align='center'><b>Desk Space<br></b></p>",
                    "<p align='center'><b>Current<br>Version</b></p>",
                    "<p align='center'><b>Update<br>Version</b></p>",
                    "<p align='center'><b>Deployment<br>Schedule</b></p>"];
    },
    f_getVMDeploySoftwareColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['checker', 'VM', 'Status', 'Current Version',
                    'Available Version', 'Deployment Schedule Date',
                    'Deployment Schedule Time'];
        else
            return [' ',
                "<p align='center'><b>VM<br></b></p>",
                "<p align='center'><b>Deployment<br>Status</b></p>",
                "<p align='center'><b>Current<br>Version</b></p>",
                "<p align='center'><b>Available<br>Version</b></p>",
                "<p align='center'><b>Deployment<br>Schedule Date</b></p>",
                "<p align='center'><b>Deployment<br>Schedule Time</b></p>"];
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
    f_getOpTopPanelData: function()
    {
        var links = this.f_getOApplianceAnchorData();
        var str = "<nobr><div id='header'>";
        var selIndex = 0;

        for(var i=0; i<links.length; i++)
        {
            var myId = this.m_tabName + links[i];

            if(this.m_selTopAnchorName == links[i])
            {
                str += "<a class='on' id='id_" + myId + "_link' href='#top' onclick=" +
                    "f_onClickAnchor('" + links[i] + "')>" +
                    "<img src='images/carre.gif'/>&nbsp;&nbsp;<font color='#FF6600'>" +
                    "<b>" + links[i] + "</b></font>" +
                    "</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                selIndex = i;
            }
            else
            {
                str += "<a class='on' id='id_" + myId + "_link' href='#top' onclick=" +
                    "f_onClickAnchor('" + links[i] + "')>" +
                    "<img src='images/carre.gif'/>&nbsp;&nbsp;" + links[i] +
                    "</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            }

        }
        str += "</div></nobr>";

        var el = document.getElementById('nav');

        if(el == undefined)
        {
            Ext.getBody().createChild({tag:'div', id:'nav', html: str});
            el = document.getElementById('nav');
        }

        el.innerHTML = str;

        var comp = new Ext.Panel(
        {
            id: Ext.id()
            ,border: false
            ,bodyStyle: 'padding: 0px 10px 0px 10px'
            ,contentEl: el
        });
        comp.doLayout();

        return comp;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_getVMLeftPanelData: function(anchorLinkData)
    {
        var links = anchorLinkData == undefined ? this.f_getVMAnchorData() :
                                      anchorLinkData;

        var selIndex = 0;
        var str = "<div id='leftMenu'>" +
              "<ul id='openAppliance' style='display:block'>";

        if(links != 'empty')
        {
            for(var i=0; i<links.length; i++)
            {
                var anchorId = f_replace(links[i], ' ', '_');
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

        str += '</ul><div id="helpMenu" style="display:block">' +
                '<a target = "_blank" href="#" onfocus="this.blur();" ' +
                'class="linkhelp" onclick="f_loadHelp();return false;">' +
                '<img src="images/img_help.gif" alt="Help" title="Help"></a></div></div>';

        Ext.getBody().createChild(
                            {tag:'div', id:'id_vmAnchor_' + selIndex, html: str});

        str = "id_vmAnchor_" + selIndex;

        var comp = new Ext.Panel(
        {
            id: Ext.id()
            ,border: false
            ,bodyStyle: 'padding: 0px 10px 0px 0px'
            ,contentEl: str
        });

        return comp;
    },


    ////////////////////////////////////////////////////////////////////////////
    f_updateMainPanel: function(anchorId)
    {
        if(this.m_mainPanel == undefined)
            this.m_mainPanel = this.f_createMainPanel(this.m_tabName);

        this.f_processOnAnchorInvoke(anchorId);
        this.m_mainPanel.doLayout();
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
        this.m_isDashboard = true;
        this.m_selLeftAnchorName = this.f_getVMAnchorData()[0];
        f_getVMDashboard_RestartDataFromServer(this);
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
        f_getBackupDataFromServer(this);
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
                g_opPanelObject.m_dataPanelTitle = 'Backup';
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
                this.f_invokeVMDashboardAnchor();
                break;
            case 'Deploy_VM_Software':
                g_opPanelObject.m_dataPanelTitle += 'Deploy VM Software';
                this.m_selLeftAnchorName = this.f_getVMAnchorData()[1];
                f_populateVMDeploySoftwarePanel(this);
                this.f_updateLeftPanel(this.f_getVMLeftPanelData());
                break;
            case 'Restart':
                g_opPanelObject.m_dataPanelTitle += 'Restart';
                f_getVMDashboard_RestartDataFromServer(this);
                this.m_isDashboard = false;
                this.m_selLeftAnchorName = this.f_getVMAnchorData()[2];
                this.f_updateLeftPanel(this.f_getVMLeftPanelData());
                break;
            case 'Hardware':
                g_opPanelObject.m_dataPanelTitle += 'Hardware';
                this.f_invokeMonitorHardwareAnchor();
                break;
            case 'Network':
                g_opPanelObject.m_dataPanelTitle += 'Network';
                f_getMonitoringNetworkDataFromServer(this);
                this.m_selLeftAnchorName = this.f_getMonitoringAnchorData()[1];
                this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                          this.f_getMonitoringAnchorData()));
                break;
            case 'Software':
                g_opPanelObject.m_dataPanelTitle += 'Software';
                f_getMonitoringSoftwareDataFromServer(this);
                this.m_selLeftAnchorName = this.f_getMonitoringAnchorData()[2];
                this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                          this.f_getMonitoringAnchorData()));
                break;
            case 'User':
                g_opPanelObject.m_dataPanelTitle = 'Users';
                this.f_invokeUserAnchor();
                break;
            case 'Configuration_Backup':
                g_opPanelObject.m_dataPanelTitle += 'Configuration Backup';
                this.f_invokeBackupAnchor();
                break;
            case 'Configuration_Restore':
                g_opPanelObject.m_dataPanelTitle += 'Configuration Restore';
                f_getResotreDataFromServer(this);
                this.m_selLeftAnchorName = this.f_getBackupAnchorData()[1];
                this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                          this.f_getBackupAnchorData()));
                break;
        }
    }
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function f_sendServerCommand(checkLogin, xmlSend, callback, showWait)
{
    if(checkLogin)
    {
        if(!f_isUserLogin(true))
        {
            window.location = 'ft_main.html';
            return;
        }
    }

    var xmlStr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
               + "<vyatta>" +
               xmlSend + "</vyatta>\n";

    if(showWait == undefined || showWait == true)
        g_sendCommandWait = f_promptWaitMessage('Wait for Server Response ...',
                                              'Post Request to Server')

        //Ext.MessageBox.wait('Wait for Server Response ...',
        //                                      'Post Request to Server');

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
        g_3rdPartyURL = q.selectValue('guiUrl');

    ///////////////////////////////////////
    // get current and available versions
    var versions = q.selectNode('version', vm);
    var verCur = q.selectNumber('current', versions)
    var disVerCur = q.selectValue('current', versions);
                  //Ext.num(q.selectValue('current', versions), 0);
    var verAvails = q.select('avail', versions);
    var vAvails = [ ];
    var updateAvail = '';
    for(var j=0; j<verAvails.length; j++)
    {
        vAvails[j] = q.selectNumber('avail:nth(' + (j+1) + ')', versions);
        updateAvail = (vAvails[j] > verCur) ? 'updateAval_yes' : 'updateAval_no';
    }

    return [ vmName, status, cpu, f_findPercentage(memTotal, memFree),
              f_findPercentage(diskTotal, diskFree), disVerCur, updateAvail, 'down',
              memTotal, memFree, diskTotal, diskFree];
}

function f_populateVMRestartPanel(opObject)
{
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
    var store = new Ext.data.SimpleStore(
    {
        fields: [
            { name: 'vm' },
            { name: 'status' },
            { name: 'restart' },
            { name: 'stop' },
            { name: 'start' }
        ]
    });
    store.loadData(opObject.m_restartData);
    store.colHeaders = opObject.f_getVMRestartColHeader(false);

    ////////////////////////////////////////////////////
    // add main grid into working panel
    var gPanels = opObject.f_createEditorGridPanel(opObject, store, cm, undefined, 'vm',
                    g_opPanelObject.m_dataPanelTitle);

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

function f_parseBackupData(vm)
{
    return [ 'none', 'none' ];
}

function f_parseRestoreData(vm)
{
    return [ 'none', 'none' ];
}

function f_parseUserData(vm)
{
    var user = vm.getAttribute('user');
    var last = vm.getAttribute('last');
    var first = vm.getAttribute('first');

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

function f_getVMDashboard_RestartDataFromServer(opObject)
{
    var dbData = new Array();
    var stData = new Array();
    var thisObj = opObject;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_promptErrorMessage('Load VM Dashboard', isSuccess[1]);
            return;
        }

        var vmNodes = q.select('vm', xmlRoot);

        for(var i=0; i<vmNodes.length; i++)
        {
            dbData[i] = f_parseVMDashboarData(vmNodes[i]);
            stData[i] = f_parseVMRestartData(vmNodes[i]);
        }

        thisObj.m_dashboardData = dbData;
        thisObj.m_restartData = stData;

        if(thisObj.m_isDashboard)
            f_populateVMDashboardPanel(thisObj);
        else
            f_populateVMRestartPanel(thisObj);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmstatus><id>" + sid + "</id>\n"
               + "</vmstatus>";

    f_sendServerCommand(true, xmlstr, serverCommandCb);
}

function f_populateVMDashboardPanel(opObject)
{
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

    var store = new Ext.data.SimpleStore(
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
    store.loadData(opObject.m_dashboardData);
    store.colHeaders = opObject.f_getVMDashboardColHeader(false);

    var addVM = new Ext.Button(
    {
        text: 'Add New VM'
        ,handler: function(btn, e) { alert('will link to Orange site.'); }
    });

    var removeVM = new Ext.Button(
    {
        text: 'Remove VM'
        ,handler: function(btn, e) { alert('will link to Orange site.'); }
    });
    var buttons = [ addVM, removeVM ];

    ///////////////////////////////////////////////////////
    // add grid into working panel
    var grid = opObject.f_createGridPanel(store, cm, undefined, 'vm', buttons,
                g_opPanelObject.m_dataPanelTitle);
    var panels = [grid];
    opObject.f_updateDataPanel(panels);

    //////////////////////////////////////////////
    // enhance header
    var header = opObject.f_getVMDashboardColHeader(true);
    for(var i=0; i<header.length; i++)
        grid.getView().getHeaderCell(i).innerHTML = header[i];
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

function f_getResotreDataFromServer(opObject)
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
            f_promptErrorMessage('Load Restore', isSuccess[1]);
            return;
        }

        var vmUserNodes = q.select('vmuser', xmlRoot);

        for(var i=0; i<vmUserNodes.length; i++)
            dbData[i] = f_parseRestoreData(vmUserNodes[i]);

        thisObject.m_bkRestoreDBData = dbData;
        f_populateRestorePanel(thisObject);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmuser op='list'><id>" + sid + "</id>\n"
    + "</vmuser>";

    f_sendServerCommand(true, xmlstr, serverCommandCb);
}
function f_getBackupDataFromServer(opObject)
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
            f_promptErrorMessage('Load Backup', isSuccess[1]);
            return;
        }

        var vmUserNodes = q.select('vmuser', xmlRoot);

        for(var i=0; i<vmUserNodes.length; i++)
            dbData[i] = f_parseBackupData(vmUserNodes[i]);

        thisObject.m_bkBackupDBData = dbData;
        f_populateBackupPanel(thisObject);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmuser op='list'><id>" + sid + "</id>\n"
    + "</vmuser>";

    f_sendServerCommand(true, xmlstr, serverCommandCb);
}
function f_populateBackupPanel(opObject)
{
    var thisObject = opObject;

    var lPanel = f_createLogPanel('Backup &rArr; Configuration Backup',
          'This page is under construction...');

    thisObject.f_updateDataPanel(new Array(lPanel));
}

function f_populateRestorePanel(opObject)
{
    var thisObject = opObject;

    var lPanel = f_createLogPanel('Backup &rArr; Configuration Restore',
          'This page is under construction...');

    thisObject.f_updateDataPanel(new Array(lPanel));
}

function f_populateVMDeploySoftwarePanel(opObject)
{
    var thisObject = opObject;
    var fm = Ext.form;

    var CheckColumnOnMousePress = function()
    {
        //enableDisableUserButtons(thisObject);
    }

    var checkColumn = f_createGridCheckColumn(CheckColumnOnMousePress);

    var userStore = new Ext.data.SimpleStore( {
fields: [ 'userId', 'userName' ],
data: [[1, 2], [3, 4]]
} );

    var cb = new Ext.form.ComboBox(
    {
        store: userStore
        ,mode: 'local'
        ,displayField: 'userName'
        ,valueField: 'userId'
        ,typeAhead: true
        ,triggerAction: 'all'
        ,lazyRender:true
        ,listClass: 'x-combo-list-small'
        ,listeners: { expand: function(obj) { cb = obj;
cb.reset(); userStore.removeAll(); userStore.loadData([['a','b'],['c','d']]);          }}
    });

    function formatDate(value)
    {
        return value ? value.dateFormat('M d, Y') : '';
    }

    var hd = opObject.f_getVMDeploySoftwareColHeader(false);
    var cm = new Ext.grid.ColumnModel([
        checkColumn,
        {header: 'VM', width: 120, menuDisabled: true, fixed: true,
            sortable: false, dataIndex: hd[1].toLowerCase().replace(' ', ''),
            align:'left'},
        {header: 'Deployment Status', width: 100, sortable: false, fixed: true,
            menuDisabled: true, dataIndex: hd[2].toLowerCase().replace(' ', ''),
            align:'center'},
        {header: 'Current Version', width: 80, sortable: false, fixed: true,
            menuDisabled: true, dataIndex: hd[3].toLowerCase().replace(' ', ''),
            align:'center'},
        {header: 'Available Version', menuDisabled: true, width: 90, sortable: false,
            dataIndex: hd[4].toLowerCase().replace(' ', ''), fixed: true,
            align:'center',
            renderer: f_renderGridComboBox,
            editor: cb},
        {header: 'Deployment Schedule', width: 100, menuDisabled: true, sortable: false,
            dataIndex: hd[5].toLowerCase().replace(' ', ''),
            align:'center',
            type: 'date',
            dateFormat: 'd/m/y',
            renderer: f_renderGridDateField,//Ext.util.Format.dateRenderer('d/m/Y'),
            editor: new fm.DateField(
            {
                format: 'd/m/y'
                ,minValue: '01/01/06'
                ,tooltip: 'click '
                //disabledDays: [0, 6 ],
                //disabledDaysText: 'Plants are not available on the weekends'
            })
        },
        {header: 'Deployment Schedule', width: 90, menuDisabled: true, sortable: false,
            dataIndex: hd[6].toLowerCase().replace(' ', ''),
            align:'center',
            type: 'date',
            dateFormat: 'm/d/y',
            renderer: f_renderGridTimeField,
            editor: new fm.TimeField(
            {
                increment: 15
                ,allowBlank: true
            })
        }
    ]);

    var store = new Ext.data.SimpleStore(
    {
        fields: [
            { name: hd[0].toLowerCase().replace(' ', ''), type: 'bool' },
            { name: hd[1].toLowerCase().replace(' ', '') },
            { name: hd[2].toLowerCase().replace(' ', '') },
            { name: hd[3].toLowerCase().replace(' ', '') },
            { name: hd[4].toLowerCase().replace(' ', '') },
            { name: hd[5].toLowerCase().replace(' ', ''), type: 'date', dateFormat: 'n/j h:ai' },
            { name: hd[6].toLowerCase().replace(' ', '') }
        ]
    });

    //////////////////////////////////////////////////////
    // load data
    var data = [
        [ true, 'O. Appliance', 'status', '1.2', '1.5', 'now', 'now']
        ,[ false, 'Telephony', 'status', '1.2', '1.5', 'now', 'now']
        ,[ true, 'Security', 'status', '1.2', '1.5', 'now', 'now']
        ,[ false, '3rd Parties', 'status', '1.2', '1.5', 'now', 'now']
    ];
    store.loadData(data);
    store.colHeaders = hd;

    //////////////////////////////////////////////////////////
    // create grid panel
    var gPanel = thisObject.f_createEditorGridPanel(thisObject, store, cm, checkColumn,
                      'vm', thisObject.m_dataPanelTitle);
    var bPanel = f_createDeployButtonPanel(thisObject);
    gPanel[gPanel.length] = bPanel;
    var grid = gPanel[0];
    grid.on({"cellclick":{fn: f_onGridCellClick }});

    gPanel[gPanel.length] = f_createEmptyPanel();

    ///////////////////////////////////////////////
    // add WM deployment log into working panel
    var lPanel = f_createLogPanel('VM Software Deployment Log',
          'The status of VM Deployment will display here....');
    gPanel[gPanel.length] = lPanel;
    thisObject.f_updateDataPanel(gPanel);

    ///////////////////////////////////////////////////////
    // enhance grid header
    var header = thisObject.f_getVMDeploySoftwareColHeader(true);
    for(var i=1; i<header.length; i++)
        grid.getView().getHeaderCell(i).innerHTML = header[i];
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
        var g = opObj.grid;

        if(g != undefined)
        {
            var buttonPanel = opObj.buttonPanel;
            if(buttonPanel != undefined && buttonPanel.buttons.length == 3)
            {
                buttonPanel.buttons[1].disable();
                buttonPanel.buttons[2].disable();

                g.store.each(function(record)
                {
                    if(record.get('checker'))
                    {
                        buttonPanel.buttons[1].enable();
                        buttonPanel.buttons[2].enable();
                        return;
                    }
                });
            }
        }
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
        if(btn == 'yes')
        {
            var deleteRecs = [ ];

            store.each(function(record)
            {
                if(record.get(chnLCase[0]))
                {
                    if(record.get(chnLCase[3]) == 'admin')
                    {
                        Ext.Msg.alert('Delete User', 'admin user cannot be deleted.')
                        return;
                    }

                    var sid = f_getUserLoginedID();
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
        }
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

    var fField = f_createUserTextField(true, 'userText', 'First Name');
    var lField = f_createUserTextField(true, 'userText', 'Last Name');
    var uField = f_createUserTextField(true, 'userText', 'User Name');
    var pField = f_createUserTextField(false, 'password', 'Password');
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
            editor: fField
        },
        {
            header: '<p align=center><b>Lastname<br>&nbsp;</b></p>',
            width: 110,
            sortable: false,
            dataIndex: chnLCase[2],
            renderer: f_renderGridTextField,
            editor: lField
        },
        {
            header: '<p align=center><b>Username<br>&nbsp;</b></p>',
            width: 110,
            sortable: false,
            dataIndex: chnLCase[3],
            //type: 'string',
            renderer: f_renderGridTextField,
            editor: uField
        },
        {
            header: '<p align=center><b>Password<br>&nbsp;</b></p>',
            width: 110,
            sortable: false,
            dataIndex: chnLCase[4],
            renderer: f_renderGridTextField,
            editor: pField
        },
        {header: 'action', hidden:true, dataIndex:'action' }
        ]);

    var store = new Ext.data.SimpleStore(
    {
        fields: [ {name: chnLCase[0], type: 'bool'},
                  {name: chnLCase[1]},
                  {name: chnLCase[2]},
                  {name: chnLCase[3]},
                  {name: chnLCase[4]},
                  {name: chnLCase[5]},]
    });
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
    return "user='" + record.get(
            colHeaderNames[3]) +
            "' last='" + record.get(
            colHeaderNames[2]) +
            "' first='" + record.get(
            colHeaderNames[1]) +
            "' password='" + f_filterPassword(record.get(
            colHeaderNames[4])) + "'";
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

function f_getMonitoringHardwareDataFromServer(opObject)
{
    var dbData = new Array();
    var thisObject = opObject;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_promptErrorMessage('Load Monitoring Hardware', isSuccess[1]);
            return;
        }

        var hwNodes = q.select('hw', xmlRoot);
            dbData = f_parseMonitoringHardwareData(hwNodes[0]);

        thisObject.m_monitorHwDBData = dbData;
        f_populateMonitoringHardwarePanel(thisObject);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmstatus><id>" + sid + "</id>\n"
    + "</vmstatus>";

    f_sendServerCommand(true, xmlstr, serverCommandCb);
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
        width: 120,
        sortable: true,
        dataIndex: 'component',
        style: 'padding:10px 0px 0px 5px'
    },
    {
        header: 'Status',
        width: 70,
        sortable: false,
        renderer: f_renderGridImage,
        dataIndex: 'status',
        fixed: true,
        align: 'center'
    },
    ]);

    var store = new Ext.data.SimpleStore(
    {
        fields: [
        {
            name: 'component'
        },
        {
            name: 'status'
        },
        ]
    });
    store.loadData(opObject.m_monitorHwDBData);
    store.colHeaders = opObject.f_getMonitorHWColHeader(false);

    ////////////////////////////////////////////////////
    // add grid into working panel
    var grid = opObject.f_createGridPanel(store, cm, undefined, 'component',
                        undefined, g_opPanelObject.m_dataPanelTitle);
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
            tip = '"The value is <font color=yellow><b>Unknow</b></font>"';
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
    var dataPanel = g_opPanelObject.f_getDataPanel();
    var w = dataPanel.getInnerWidth();

    var textArea = new Ext.form.TextArea(
    {
        height: 78
        ,width: 200
        ,scroll: true
        ,value: logText
        ,border: true
        ,bodyStyle: 'padding: 0px 10px 10px 0px'
    });

    var panel = new Ext.Panel(
    {
        border: false
        ,title: title
        ,bodyStyle: 'padding: 0px 0px 10px 0px'
        ,items: [ textArea ]
    });

    panel.on({'resize': { fn: function()
    {
        textArea.setSize(panel.getSize().width, 78);
    } }});

    return panel;
}



function f_createGridVMRestartButton(val, contentId, record, rIndex, cIndex)
{
    var disable = true;
    var hide = false;
    var status = record.get('status');
    var vm = record.get('vm');
    var xmlStatement = '';

    switch(val)
    {
        case 'Restart':
            if(status == V_STATUS_UP) disable = false;
            xmlStatement = vm + ' restart';
            break;
        case 'Stop':
            if(status == V_STATUS_UP) disable = false;
            xmlStatement = vm + ' stop';
            hide = rIndex == 0 ? true : false;
            break;
        case 'Start':
            if(status == V_STATUS_DOWN) disable = false;
            xmlStatement = vm + ' start';
            hide = rIndex == 0 ? true : false;
            break;
    }

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;
        var errmsg = 'Unknown error';
        var isSuccess = true;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_promptErrorMessage('Load Restart', isSuccess[1]);
            return;
        }

        f_onClickAnchor(g_opPanelObject.f_getVMAnchorData()[2])
        f_hideSendWaitMessage();
    }

    var button = new Ext.Button(
    {
        text: val
        ,disabled: disable
        ,hidden: hide
        ,width: 100
        ,
        handler: function(btn, e)
        {

            var xmlstr = "<command><id>" + f_getUserLoginedID() +
            "</id><statement>/opt/vyatta/sbin/vyatta-vmop.pl " +
            xmlStatement + "</statement></command>";

            f_sendServerCommand(true, xmlstr, serverCommandCb);
        }
    });

    button.render(document.body, contentId);
}

function f_renderGridButton(val, p, record, rowIndex, colIndex)
{
    if(val != 'blank')
    {
        var contentId = Ext.id();

        f_createGridVMRestartButton.defer(1, this, [val, contentId, record, rowIndex, colIndex]);
        return String.format("<p align='center'>" +
            "<span id='" + contentId + "'></span></p>");
    }

    return "";
}

function f_renderGridDateField(val, metadata, record, rowIndex, colIndex)
{
    var sDate = f_compareDateTime(val, record.get('deployScheduleTime'));

    var tt = '"Click on this <font color=#FF6600><b>cell</b></font>' +
              ' to select date.<br>'+
              'To deploy NOW, select past date from calender."';
    metadata.attr = 'ext:qtitle="Date: " ext:qtip=' + tt;

    if(sDate == 'now')
        return 'now';
    else
        return Ext.util.Format.date(sDate, 'd/m/y');
}

function f_renderGridTimeField(val, metadata, record, rowIndex, colIndex)
{
    var sDate = f_compareDateTime(record.get('deployScheduleDate'), val);

    var tt = '"Click on this <font color=#FF6600><b>cell</b></font>' +
              ' to select time.<br>'+
              'To deploy NOW, select past date from calender."';

    metadata.attr = 'ext:qtitle="Date" ext:qtip=' + tt;

    if(sDate == 'now')
        return 'now';
    else
        return val;
}

function f_compareDateTime(vDate, vTime)
{
    var curDate = new Date();
    var givenDate = vDate;
    var givenTime = vTime;

    if(givenDate == undefined || givenDate.length < 5 || givenDate == 'now')
    {
        givenDate = curDate;
    }

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
    switch(colIndex)
    {
        case 1:

    }

    metaData.attr =
        'ext:qtip="Click on this <font color=#FF6600><b>cell</b></font> to select new value"' +
        'ext:qtitle=' + val;

    return val;
}

function f_renderGridTextField(val, metadata, record, rowIndex, colIndex)
{
    if(rowIndex == 0)
    {
        switch(colIndex)
        {
            case 1:
                val = ''
                break;
            case 2:
                val = ''
                break;
        }
    }

    if(colIndex == 4 && val != 'EnterPassword')
        val = '******';

    metadata.attr =
    'ext:qtip="Click on this <font color=#FF6600><b>cell</b></font> enter new value"' +
    'ext:qtitle=' + val;

    return val;
}

function f_createUserTextField(disableRowZero, textType, fieldName)
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
        ,listeners: {
            beforeshow: function()
            {
                if(g_opPanelObject.m_selGridRow == 0 && disableRowZero)
                    this.disable();
                else
                    this.enable();
            }
        }
        ,blur: function(field)
        {
            switch(textType)
            {
                case 'password':
                    if(!f_isPasswordValid(this.getValue()))
                    {
                        
                    }
                    break;
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

    return tf;
}

function f_createDeployButtonPanel(opObject)
{
    var dButton = new Ext.Button(
    {
        text: 'Deploy Selected'
        ,handle: function() {}
    });

    var cButton = new Ext.Button(
    {
        text: 'Cancel Selected'
        ,handle: function() {}
    });

    var panel = new Ext.Panel(
    {
        border: false
        ,height: 10
        ,html: ' '
        ,buttons: [dButton, cButton]
    });
    panel.fixHeight = 10;

    return panel;
}
function f_createUserButtonsPanel(opObject)
{
    var thisObject = opObject;

    var saveChanged = new Ext.Button(
    {
        text: 'Save Changes'
        ,disabled: true
        ,handler: thisObject.saveCallback
    });

    var deleteSelected = new Ext.Button(
    {
        text: 'Delete Selected'
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
        text: 'Add User'
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
function f_onGridCellClick(grid, rowIndex, columnIndex, e)
{
    //var cb = grid.getColumnModel().getCellEditor(columnIndex, rowIndex);
    //alert(cb.getValue());G362
}

function f_loadHelp()
{
    alert('Need link for help');
}

function f_onClickAnchor(anchorId)
{
    g_opPanelObject.f_updateMainPanel(anchorId);
}
