/*
    Document   : ft_vmBackupObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_backupRec(vm, bkDate, content, mode)
{
    this.m_vm = vm;
    this.m_bkDate = bkDate;
    this.m_content = content;
    this.m_bkMode = mode; // 0: config, 1:data, 2:both
}

function FT_backupObj(busObj)
{
    /////////////////////////////////////
    // properteis
    var thisObj = this;
    this.m_objName = 'FT_vmBackupObj';
    this.m_guiCb = null;
    this.m_busObj = busObj;
    this.m_backupRec = null;   // list of backup rec data.

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

        }
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
        thisObj.m_backupRec = [];

        thisObj.m_backupRec[0] = new FT_backupRec('vm1', '01/01/2001',
                    'content', 0);
        thisObj.m_backupRec[1] = new FT_backupRec('vm2', '01/01/2002',
                    'content2', 1);
        thisObj.m_backupRec[2] = new FT_backupRec('vm3', '01/01/2003',
                    'content 3', 2);
        thisObj.m_backupRec[3] = new FT_backupRec('vm1', '01/01/2001',
                    'content', 0);
        thisObj.m_backupRec[4] = new FT_backupRec('vm2', '01/01/2002',
                    'content2', 1);
        thisObj.m_backupRec[5] = new FT_backupRec('vm3', '01/01/2003',
                    'content 3', 2);
    }

    /**
     *  retrieve list of restore vm from server
     */
    this.f_getVMBackupList = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
    }
}