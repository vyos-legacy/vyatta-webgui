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
    this.m_vmDeployRecObj = [];
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
                if(thisObj.m_lastCmdSent.indexOf('vm hwmon') > 0)
                {
                    thisObj.f_parseHw(err);
                    evt = new FT_eventObj(0, thisObj.m_hwRecObj, '');
                }
                else if(thisObj.m_lastCmdSent.indexOf('deploy list') > 0)
                {
                    thisObj.m_vmDeployRecObj = thisObj.f_parseVMDeployList(err);
                    evt = new FT_eventObj(0, thisObj.m_vmDeployRecObj, '');
                }
                else
                {
                    thisObj.f_parseVMSummaryData(err);
                    thisObj.f_parseVMStatus(err);

                    evt = new FT_eventObj(0, thisObj.m_vmRecObj, '');
                }
            }
            else
                thisObj.f_parseSystemTime(response);

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

    /**
     * get summary vm list from server: list of vmId, ip, port, uri, vm display name
     */
    this.f_getVMUpdateListFromServer = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement>" +
                      "open-app vm deploy list </statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    /**
     * call backend api to get vm status
     */
    this.f_getVMStatusFromServer = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement>" +
                      "open-app vm status </statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    /**
     * call backend api to get hw monitor data
     */
    this.f_getHWMonitorFromServer = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement>" +
                      "open-app vm hwmon </statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_parseVMSummaryData = function(response)
    {
        var vmNodes = thisObj.f_getVMNodesFromResponse(response, 'vm');
        if(vmNodes != null)
        {
            var vms = [];
            var c=0;
            vms[c++] = new FT_vmRecObj('blb', 'Business Livebox');
            vms[c++] = new FT_vmRecObj('openapp', 'Open Appliance');
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
                        else if(cNode.nodeName == 'version'  &&
                            cNode.firstChild != undefined)
                            vms[c].m_version = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'displayName' &&
                            cNode.firstChild != undefined)
                            vms[c].m_displayName = cNode.firstChild.nodeValue;
                    }
                    c++;
                }
            }

            thisObj.m_vmRecObj = vms;
        }
    }

    this.f_parseVMStatus = function(response)
    {
        // get a vm status nodes
        var vmNodes = thisObj.f_getVMNodesFromResponse(response, 'vmstatus');
        if(vmNodes != null)
        {
            for(var i=0; i<vmNodes.length; i++)
            {
                var val = vmNodes[i];
                if(val.nodeName == 'vmstatus')
                {
                    var vmIndex = thisObj.f_getVMRecObjIndexByVMId(val.getAttribute('id'));
                    if(vmIndex == null) continue;

                    var vmr = thisObj.m_vmRecObj[vmIndex];
                    for(var j=0; j<val.childNodes.length; j++)
                    {
                        if(val.childNodes == undefined || val.childNodes[j] == null)
                            continue;

                        var cNode = val.childNodes[j];

                        if(cNode.nodeName == 'state' &&
                            cNode.firstChild != undefined)
                            vmr.m_status = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'cpu' &&
                            cNode.firstChild != undefined)
                            vmr.m_cpu = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'diskAll' &&
                            cNode.firstChild != undefined)
                            vmr.m_diskTotal = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'diskFree' &&
                            cNode.firstChild != undefined)
                            vmr.m_diskFree = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'memAll' &&
                            cNode.firstChild != undefined)
                            vmr.m_memTotal = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'memFree' &&
                            cNode.firstChild != undefined)
                            vmr.m_memFree = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'updAvail' &&
                            cNode.firstChild != undefined)
                            vmr.m_needUpdate = cNode.firstChild.nodeValue;
                    }

                    thisObj.m_vmRecObj[vmIndex] = vmr;
                }
            }
        }
    }

    this.f_getVMRecObjIndexByVMId = function(id)
    {
        var vmr = thisObj.m_vmRecObj;

        if(vmr == null || vmr.length == 0) return null;

        for(var i=0; i<vmr.length; i++)
        {
            if(vmr[i].m_name == id)
                return i;
        }

        return null;
    }

    this.f_getVMRecObjByVMId = function(id)
    {
        var index = this.f_getVMRecObjIndexByVMId(id);

        return index == null ? null : this.m_vmRecObj[index];
    }

    this.f_getVMNodesFromResponse = function(response, node)
    {
        var cn = response[0].childNodes;
        for(var i=0; i<cn.length; i++)
        {
            if(cn[i].nodeName == 'msg')
            {
                var vm = cn[i].childNodes;
                for(var j=0; j<vm.length; j++)
                {
                    if(vm != undefined && vm[j] != undefined &&
                        vm[j].nodeName == node)
                        return vm;
                }
            }
        }

        return null;
    }

    this.f_parseHw = function(response)
    {
        // get a vm status nodes
        var hwNodes = thisObj.f_getVMNodesFromResponse(response, 'hwmon');
        var index = 0;
        if(hwNodes != null)
        {
            for(var i=0; i<hwNodes.length; i++)
            {
                var val = hwNodes[i];
                if(val.nodeName == 'hwmon')
                {
                    for(var j=0; j<val.childNodes.length; j++)
                    {
                        var cNode = val.childNodes[j];
                        switch(cNode.nodeName)
                        {
                            case 'nic':
                            case 'disk':
                            case 'cpu':
                            case 'fan':
                                if(thisObj.m_hwRecObj == null)
                                    thisObj.m_hwRecObj = new FT_hwRecObj();

                                thisObj.m_hwRecObj.f_setHw(
                                          cNode.firstChild.nodeValue, index++);
                        }
                    }
                }
            }
        }
    }

    this.f_parseVMDeployList = function(response)
    {
        // get a vm status nodes
        var vmdNodes = thisObj.f_getVMNodesFromResponse(response, 'record');
        var index = 0;
        var vmd = [];
        if(vmdNodes != null)
        {
            for(var i=0; i<vmdNodes.length; i++)
            {
                var val = vmdNodes[i];
                if(val.nodeName == 'record')
                {
                    vmd[index] = new FT_vmDeployObj();

                    for(var j=0; j<val.childNodes.length; j++)
                    {
                        var cNode = val.childNodes[j];
                        if(cNode.firstChild == undefined) continue;

                        switch(cNode.nodeName)
                        {
                            case 'time':
                              vmd[index].m_time = cNode.firstChild.nodeValue;
                              break;
                            case 'id':
                              vmd[index].m_id = cNode.firstChild.nodeValue;
                              break;
                            case 'ver':
                              vmd[index].m_version = cNode.firstChild.nodeValue;
                              break;
                            case 'status':
                              vmd[index].m_status = cNode.firstChild.nodeValue;
                              break;
                            case 'msg':
                              vmd[index].m_msg = cNode.firstChild.nodeValue;
                              break;
                        }
                    }
                    index++;
                }
            }
        }

        return vmd;
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
function FT_vmRecObj(id, displayName)
{
    var thisObj = this;
    this.m_name = id;   // vm id
    this.m_displayName = displayName;  // vm display name
    this.m_ip = null;
    this.m_guiPort = null;
    this.m_guiUri = null;
    this.m_version = null;
    this.m_status = 'unknown';
    this.m_cpu = 0;
    this.m_memTotal = 0;
    this.m_memFree = 0;
    this.m_diskTotal = 0;
    this.m_diskFree = 0;
    this.m_guiURL = null;
    this.m_needUpdate = 'no';   // value : 'no' or version number


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

function FT_vmDeployObj(id, time, version, status, msg)
{
    this.m_time = time;
    this.m_id = id;   // vm id
    this.m_version = version;
    this.m_status = status;
    this.m_msg = msg;
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