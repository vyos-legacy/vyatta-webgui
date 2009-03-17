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
    this.m_busObj = busObj;
    this.m_backupRec;   // list of backup rec data.

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

    /**
     *
     */
    this.f_getVMRestoreList = function(guiCb)
    {

    }

    /**
     *
     */
    this.f_getVMBackupList = function(guiCb)
    {

    }
}