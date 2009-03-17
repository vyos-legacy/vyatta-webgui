/*
    Document   : ft_confRestore.js
    Created on : Mar 12, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confRestore(name, callback, busLayer)
{
    this.thisObjName = 'FT_confRestore';
    var thisObj = this;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confRestore.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        var page = this.f_getNewPanelDiv(this.f_init());

        return page;
    }

    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn('Date', 120, 'text', '6');
        cols[1] = this.f_createColumn('Content', 260, 'text', '6');
        cols[2] = this.f_createColumn('Restore', 90, 'button', '25');
        cols[3] = this.f_createColumn('Download', 90, 'button', '25');
        cols[4] = this.f_createColumn('Delete', 90, 'button', '25');

        return cols;
    }

    this.f_loadVMData = function()
    {
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                // handle error code
                if(evt.f_isError())
                {
                    thisObj.f_stopLoadVMData();

                    if(evt.m_errCode == 3)
                        g_utils.f_popupMessage('timeout', 'timeout');
                    else
                        alert(evt.m_errMsg);

                    return;
                }

                var vmData = [];
                var bkRec = evt.m_value.m_backupRec;
                if(bkRec == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_restorePC);

                for(var i=0; i<=bkRec.length; i++)
                {
                    var r = bkRec[i];

                    var anchor = thisObj.f_renderAnchor(r.m_content,
                                "f_handleRestoreDesc('" + r.m_content + "')",
                                'Click here to restore ' + "(" + r.m_content + ")");
                    var restore = thisObj.f_renderButton(
                                'restore', true, "f_handleRestoreDesc('" +
                                r.m_content + "')", 'Restore (' + r.m_content + ')');
                    var download = thisObj.f_renderButton(
                                'download', true, "f_handleDownloadRestore('" +
                                r.m_content + "')", 'Download restore (' + r.m_content + ')');
                    var del = thisObj.f_renderButton(
                                'delete', true, "f_deleteRestoreFile('" +
                                r.m_content + "')", 'Delete filename (' + r.m_content + ')');

                    vmData = [r.m_bkData, anchor, restore, download, del]
                    var bodyDiv = thisObj.f_createGridRow(hd, vmData[i]);
                    thisObj.m_body.appendChild(bodyDiv);
                }
            }
        }


        var filename = 'filename';
        var anchor = thisObj.f_renderAnchor(filename,
                                "f_handleRestoreDesc('" + filename + "')",
                                'Click here to restore ' + "(filename)");
        var restore = thisObj.f_renderButton(
                                'delete', true, "f_handleRestoreDesc('" +
                                filename + "')", 'Restore (' + filename + ')');
        var download = thisObj.f_renderButton(
                                'delete', true, "f_handleDownloadRestore('" +
                                filename + "')", 'Delete filename (' + filename + ')');
        var del = thisObj.f_renderButton(
                                'delete', true, "f_deleteRestoreFile('" +
                                filename + "')", 'Delete filename (' + filename + ')');

        var vmData = ["03/13/09", anchor, restore, download, del];
        var bodyDiv = thisObj.f_createGridRow(hd, vmData);
        thisObj.m_body.appendChild(bodyDiv);

        //g_utils.f_cursorWait();
        //this.m_threadId = this.m_busLayer.f_getVMRestoreListFromServer(cb);
    }

    this.f_stopLoadVMData = function()
    {
        thisObj = null;
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.m_restorePC = this.f_createRestoreFromPC();
        this.f_loadVMData();

        return [this.m_header, this.m_body, this.m_restorePC];
    }

    this.f_createRestoreFromPC = function()
    {
        var handleFunc = "f_handleBrownMyPC('OpenAppliance')";
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '50px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="45">';

        innerHtml += '<td width="200" colspan="2" valign="bottom">' +
                      '<div style="height:20px; padding-left:3px; ' +
                      'padding-top:3px;"><b>Restore from my PC</b></div></td>';

        innerHtml += '<tr height="22"><td>' +
                      '<input id="mypcFile" name="mypcfile" type="file" ></td>'+
                    '<div title="Browse my pc" style="padding-left:20px">' +
                    '<input type="button" name="OpenAppl" ' +
                    'style="cursor:pointer;" ' +
                    'value="Go" title="Click here to start restore from my PC" onclick="' +
                    handleFunc + '></div></td>';

        innerHtml += '</tr></tbody></table>';

        div.innerHTML = innerHtml;
        return div;
    }
}
FT_extend(FT_confRestore, FT_confBaseObj);

function f_handleBrownMyPC(vm)
{
    g_busObj.f_stopVM(vm);
}

function f_handleRestoreDesc()
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_DESC_ID);
}

function f_handleDeleteRestoreFile(e, restoreContent)
{
    var cb = function(evt)
    {
        if(evt.f_isError())
        {
            alert('delete error');
        }
        else
            g_configPanelObj.m_activeObj.f_loadVMData();
    }

    if(e.getAttribute('id')== 'ft_popup_message_apply')
        g_busObj.f_deleteUserFromServer(restoreContent, cb);
}

function f_handleDownloadRestore()
{

}

function f_deleteRestoreFile(restoreContent)
{
    g_utils.f_popupMessage('Do you really want to delete (' + restoreContent + ')?',
                'confirm', 'Delete Restore File',
                "f_handleDeleteRestoreFile(this, '"+ restoreContent + "')");
}
