/*
    Document   : ft_vmBackupObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_backupContentRec(vm, type)
{
    this.m_vm = vm;
    this.m_type = type; // config/data
}

function FT_backupRec(bkDate, name, file, content)
{
    this.m_bkDate = bkDate;
    this.m_name = name;
    this.m_file = file;
    this.m_content = content;   // data type : FT_backupContentRec
}

function FT_backupObj(busObj)
{
    /////////////////////////////////////
    // properteis
    var thisObj = this;
    this.m_objName = 'FT_vmBackupObj';
    this.m_guiCb = null;
    this.m_busObj = busObj;
    this.m_archiveRec = null;

    /////////////////////////////////////////
    /**
     * A callback function for all user management requests.
     */
    this.f_respondRequestCallback = function(resp, cmdSent, noUICallback)
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(response == null) return;

        if(response.f_isError != null)
        {
            if(noUICallback == undefined || !noUICallback)
                thisObj.m_guiCb(response);
        }
        else
        {
            var evt = new FT_eventObj(0, thisObj, '');

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                thisObj.m_archiveRec = thisObj.f_parseRestoreData(err);
                evt = new FT_eventObj(0, thisObj.m_archiveRec, '');

                if(thisObj.m_guiCb != undefined)
                    thisObj.m_guiCb(evt);
            }
        }
    }

    this.f_parseRestoreData = function(response)
    {
        var reNodes = thisObj.f_getRestoreNodesFromResponse(response);
        if(reNodes != null)
        {
            var arch = [];
            var c=0;
            for(var i=0; i<reNodes.length; i++)
            {
                var val = reNodes[i];
                if(val.nodeName == 'archive')
                {
                    arch[c] = new FT_backupRec();

                    for(var j=0; j<val.childNodes.length; j++)
                    {
                        var cNode = val.childNodes[j];
                        if(cNode == undefined) continue;

                        if(cNode.nodeName == 'name' &&
                            cNode.firstChild != undefined)
                            arch[c].m_name = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'file' &&
                            cNode.firstChild != undefined)
                            arch[c].m_file = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'date' &&
                            cNode.firstChild != undefined)
                            arch[c].m_bkDate = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == 'contents' &&
                            cNode.firstChild != undefined)
                            arch[c].m_contents = thisObj.f_parseContents(cNode);
                    }
                    c++;
                }
            }
        }

        return arch;
    }

    this.f_parseContents = function(node)
    {
        var contents = [];
        var c = 0;    // contents counter
        if(node == undefined || node.childNodes == undefined) return contents;

        for(var i=0; i<node.childNodes.length; i++)
        {
            if(node.childNodes[i].nodeName == 'entry')
            {
                var cNode = node.childNodes[i];
                var vm ="";
                var type = "";

                for(var j=0; j<cNode.length; j++)
                {
                    var ccNode = cNode[j];

                    if(ccNode.nodeName == 'vm')
                        vm = ccNode.firstChild.nodeValue;
                    else if(ccNode.nodeName == 'type')
                        type = ccNode.firstChild.nodeValue;
                }

                contents[c++] = new FT_backupContentRec(vm, type);
            }
        }

        return contents;
    }

    this.f_getRestoreNodesFromResponse = function(response)
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
                        vm[j].nodeName == 'archive')
                        return vm;
                }
            }
        }

        return null;
    }

    this.f_convertMode = function(mode)
    {
        switch(mode)
        {
            case 0: return 'config';
            case 1: return 'data';
            default:
            case 2: return 'both';
        }
    }

    /**
     *  send backup/restore command to server to perform vm backup/resstore.
     *  @param vms - a list of vm to be backup or restore. vms is array type
     *  @param mode - config/data/both (0:config, 1:daata, both:2)
     *  @param type - a string of 'backup' or 'restore'
     *  @param guiCb - gui callback function
     */
    this.f_backupRestore = function(vms, mode, type, guiCb)
    {
        if(vms == undefined || vms.length == 0)
        {
            var evt = new FT_eventObj(9, '', 'Invalid vm');
            guiCb(evt);
            return;
        }

        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>";

        for(var i=0; i<vms.length; i++)
        {
            xmlstr += "<statement>open-app " + type + " '" +
                    thisObj.f_convertMode(mode) + "' '" + vms[i] + "'</statement>";
        }

        xmlstr += "</command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    /**
     *  retrieve list of restore vm from server
     */
    this.f_getVMRestoreList = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                     "<statement>open-app archive list</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    /**
     *  retrieve list of restore vm from server
     */
    this.f_getVMBackupList = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
    }
}