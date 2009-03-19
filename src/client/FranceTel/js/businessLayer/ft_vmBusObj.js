/*
    Document   : ft_vmBusObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_vmBusObj(busObj)
{
    /////////////////////////////////////
    // properteis
    var thisObj = this;
    this.m_objName = 'FT_vmBusObj';
    this.m_busObj = busObj;
    this.m_systemTime = undefined;
    this.m_vmRecObj = [];
    this.m_hwRecObj = null;
    this.m_lastCmdSent = null;

    ///////////////////////////////////////
    // functions
    /**
     * A callback function for request.
     */
    this.f_respondRequestCallback = function()
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(response == null) return;

        if(response.f_isError != undefined)
        {
            thisObj.m_guiCb(response);
        }
        else
        {
            var evt = new FT_eventObj(0, thisObj, '');

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                thisObj.m_vmRecObj = thisObj.f_parseVMSummaryData(err);
                evt = new FT_eventObj(0, thisObj.m_vmRecObj, '');
            }
            else
            {
                thisObj.f_parseSystemTime(response);
                thisObj.f_parseVM(response);
                thisObj.f_parseHw(response);
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }
    /**
     */
    this.f_cmdResRequestCallback = function()
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(response == null) return;
    }

    /**
     * get summary vm list from server: list of vmId, ip, port, uri, vm display name
     */
    this.f_getSummaryVMListFromServer = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement>" +
                      "open-app vm list </statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_parseVMSummaryData = function(response)
    {
        var vmNodes = thisObj.f_getVMNodesFromResponse(response);
        if(vmNodes != null)
        {
            var vms = [];
            var c=0;
            vms[c++] = new FT_vmRecObj('blb', 'Business Livebox');
            vms[c++] = new FT_vmRecObj('op', 'Open Appliance');
            for(var i=0; i<vmNodes.length; i++)
            {
                var val = vmNodes[i];
                if(val.nodeName == 'vm')
                {
                    vms[c] = new FT_vmRecObj(val.getAttribute('id'));

                    for(var j=0; j<val.childNodes.length; j++)
                    {
                        var cNode = val.childNodes[j];
                        if(cNode == undefined) continue;

                        if(cNode.nodeName == 'ip' &&
                            cNode.firstChild != undefined)
                            vms[c].m_ip = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'guiPort' &&
                            cNode.firstChild != undefined)
                            vms[c].m_guiPort = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'guiUri' &&
                            cNode.firstChild != undefined)
                            vms[c].m_guiUri = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'version')
                            vms[c].m_version = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'displayName')
                            vms[c].m_displayName = cNode.firstChild.nodeValue;
                    }
                    c++;
                }
            }
        }

        return vms;
    }

    this.f_getVMNodesFromResponse = function(response)
    {
        var cn = response[0].childNodes;
        for(var i=0; i<cn.length; i++)
        {
            if(cn[i].nodeName == 'msg')
            {
                var vm = cn[i].childNodes;
                for(var j=0; i<vm.length; j++)
                {
                    if(vm != undefined && vm[j] != undefined &&
                        vm[j].nodeName == 'vm')
                        return vm;
                }
            }
        }

        return null;
    }

    this.f_parseVM = function(response)
    {
        var vms = response.getElementsByTagName('vm');
        for(var i=0; i<vms.length; i++)
        {
            thisObj.m_vmRecObj[i] = new FT_vmRecObj();
            var vm = thisObj.m_vmRecObj[i];
            vm.m_name = vms[i].getAttribute('name');

            for(var j=0; j<vms[i].childNodes.length; j++)
            {
                if(vms[i].childNodes[j].nodeName == 'status')
                    vm.m_status = vms[i].childNodes[j].firstChild.nodeValue;
                else if(vms[i].childNodes[j].nodeName == 'cpu')
                    vm.m_cpu = vms[i].childNodes[j].getAttribute('util');
                else if(vms[i].childNodes[j].nodeName == 'mem')
                {
                    vm.m_memTotal = vms[i].childNodes[j].getAttribute('total');
                    vm.m_memFree = vms[i].childNodes[j].getAttribute('free');
                }
                else if(vms[i].childNodes[j].nodeName == 'disk')
                {
                    vm.m_diskTotal = vms[i].childNodes[j].getAttribute('total');
                    vm.m_diskFree = vms[i].childNodes[j].getAttribute('free');
                }
                else if(vms[i].childNodes[j].nodeName == 'version')
                    vm.f_setVersions(vms[i].childNodes[j]);
                else if(vms[i].childNodes[j].nodeName == 'guiUrl')
                    vm.m_guiURL = vms[i].childNodes[j].firstChild.nodeValue;
                else if(vms[i].childNodes[j].nodeName == 'deploy')
                    vm.f_setDeploys(vms[i].childNodes[j])
            }

            if(vm.m_status == undefined) vm.m_status = 'unknown';

            thisObj.m_vmRecObj[i] = vm;
        }
    }

    this.f_parseHw = function(response)
    {
        var hws = response.getElementsByTagName('hw');
        var index = 0;

        for(var i=0; i<hws[0].childNodes.length; i++)
        {
            switch(hws[0].childNodes[i].nodeName)
            {
                case 'nic':
                case 'disk':
                case 'cpu':
                case 'fan':
                    if(thisObj.m_hwRecObj == null)
                        thisObj.m_hwRecObj = new FT_hwRecObj();

                    var cNode = hws[0].childNodes[i].firstChild;
                    thisObj.m_hwRecObj.f_setHw(cNode.nodeValue, index++);
            }
        }
    }

    this.f_parseSystemTime = function(response)
    {
        var tNode = response.getElementsByTagName('time');

        if(tNode != undefined && tNode[0] != undefined)
            thisObj.m_systemTime = tNode[0].firstChild.nodeValue;
    }

    this.f_getNumOfVm = function()
    {
        return thisObj.m_vmRecObj.length;
    }

    this.setVmStartStopRequest = function(vm, type /* start, stop, restart */)
    {
        var sid = f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>\n" +
                      "<statement>vm " + type + " '" + vm + "'</statement>\n"
                      + "</command>";

        thisObj.m_busObj.f_sendRequest(xmlstr, thisObj.f_CmdResRequestCallback);
    }
}

/**
 * VM Data Rec object
 */
function FT_vmRecObj(id, displayName, status, cpu, memTotal, memFree, diskTotal,diskFree,
                    guiURL, versions, deploys)
{
    var thisObj = this;
    this.m_name = id;   // vm id
    this.m_displayName = displayName;  // vm display name
    this.m_ip = null;
    this.m_guiPort = null;
    this.m_guiUri = null;
    this.m_version = null;
    this.m_status = status;
    this.m_cpu = cpu;
    this.m_memTotal = memTotal;
    this.m_memFree = memFree;
    this.m_diskTotal = diskTotal;
    this.m_diskFree = diskFree;
    this.m_guiURL = guiURL;
    this.m_versions = versions; // 0=current, 1=avail1, 2=avail2...
    this.m_deploys = deploys;   // schedule1, shecule2...
    this.m_needUpdate = null;


    this.f_setVMSummaryValues = function(id, disName, ip, port, uri)
    {
        this.m_name = id;
        this.m_displayName = disName
        this.m_ip = ip;
        this.m_guiPort = port;
        this.m_guiUri = uri;
        this.m_guiURL = ip + ':' + port + '/' + uri;
    }

    ///////////////////////////////////////////////////
    // internal (private) functions
    this.f_resetArrayProperties = function(property, force)
    {
        if(force)
            property = [];
        else if(property == undefined)
            property = [];

        return property;
    }

    this.m_versions = this.f_resetArrayProperties(this.m_versions, false);
    this.m_deploys = this.f_resetArrayProperties(this.m_deploys, false);


    ////////////////////////////////////////////////////
    // public functions
    this.f_setVersions = function(node)
    {
        if(node == undefined || node.childNodes == undefined) return;

        var v=0;
        for(var i=0; i<node.childNodes.length; i++)
        {
            if(node.childNodes[i].nodeName == 'current')
                this.m_versions[v++] = node.childNodes[i].firstChild.nodeValue;
            else if(node.childNodes[i].nodeName == 'version')
                this.m_versions[v++] = node.childNodes[i].firstChild.nodeValue;
        }
    }

    this.f_setDeploys = function(node)
    {
        if(node == undefined || node.childNodes == undefined) return;

        var s=0;
        for(var i=0; i<node.childNodes.length; i++)
        {
            if(node.childNodes.nodeName == 'scheduled')
                this.m_deploys[s++] = node.childNodes.firstChild.nodeValue;
        }
    }

    this.f_getDiskPercentage = function()
    {
        return g_utils.f_findPercentage(thisObj.m_diskTotal, thisObj.m_diskFree);
    }

    this.f_getMemPercentage = function()
    {
        return g_utils.f_findPercentage(thisObj.m_memTotal, thisObj.m_memFree);
    }
}

/**
 * VM Data Rec object
 */
function FT_hwRecObj()
{
    this.NIC = 0;
    this.DISK = 1;
    this.CPU = 2;
    this.FAN = 3;

    this.m_hwName = [ 'NIC', 'Disk', 'CPU', 'Fan'];
    this.m_hwStatus = []; // m_hwStatus[this.NIC] = 'good/bad/unknown';

    ///////////////////////////////////////////////
    //
    this.f_init = function()
    {
        for(var i=0; i<=this.FAN; i++)
            this.m_hwStatus[i] = 'unknown';
    }

    this.f_setHw = function(val, index)
    {
        if(index > this.FAN+1) return;

        switch(val)
        {
            case 'bad':
                this.m_hwStatus[index] = 'down';
                break;
            case 'good':
                this.m_hwStatus[index] = 'up';
                break;
            case 'unknown':
            default:
                this.m_hwStatus[index] = 'unknown';
        }
    }

    ///////////////////////////////////////////
    this.f_init();
}