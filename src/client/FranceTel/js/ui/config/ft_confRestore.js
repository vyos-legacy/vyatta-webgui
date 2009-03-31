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
    this.m_dataObj = null;

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
        thisObj = this;

        var cols = [];

        cols[0] = this.f_createColumn(g_lang.m_uhHdDate, 120, 'text', '6');
        cols[1] = this.f_createColumn(g_lang.m_restoreHdContent, 330, 'text', '6');
        cols[2] = this.f_createColumn(g_lang.m_restoreHdRestore, 80, 'button', '30');
        cols[3] = this.f_createColumn(g_lang.m_restoreHdDownload, 80, 'button', '30');
        cols[4] = this.f_createColumn(g_lang.m_delete, 80, 'button', '30');

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
                if(thisObj.f_isServerError(evt, 'Configuration Restore  Error'))
                    return;

                var vmData = [];
                var bkRec = evt.m_value;
                if(bkRec == undefined) return;

                thisObj.m_dataObj = bkRec;
                if(thisObj.m_div != undefined)
                {
                    thisObj.f_removeDivChildren(thisObj.m_div);
                    thisObj.f_removeDivChildren(thisObj.m_body);
                    thisObj.m_div.appendChild(thisObj.m_header);
                    thisObj.m_div.appendChild(thisObj.m_body);
                    thisObj.m_div.appendChild(thisObj.m_restorePC);
                }

                for(var i=0; i<bkRec.length; i++)
                {
                    var r = bkRec[i];
                    var content = thisObj.f_getContents(r.m_content.m_entry);
                    var restDesc = "f_handleRestoreDesc('" + r.m_file + "')";
                    var anchor = thisObj.f_renderAnchor(content, restDesc,
                                'Click here to restore ' + "(" + content + ")");
                    var restore = thisObj.f_renderButton(
                                'restore', true, restDesc, 'Restore backup archive (' + content + ')');
                    var download = thisObj.f_renderButton(
                                'download', true, "f_handleDownloadRestore('" +
                                r.m_file + "')", 'Download backup archive (' + content + ')');
                    var del = thisObj.f_renderButton(
                                'delete', true, "f_deleteRestoreFile('" + content +
                                "', '" + r.m_file + "')",
                                'Delete backup archive (' + content + ')');

                    vmData = [r.m_bkDate, anchor, restore, download, del]
                    var bodyDiv = thisObj.f_createGridRow(hd, vmData);
                    thisObj.m_body.appendChild(bodyDiv);
                }

                thisObj.f_adjustDivPosition(thisObj.m_restorePC);
            }
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_getVMRestoreListFromServer(cb);
    }

    this.f_stopLoadVMData = function()
    {
    }

    ////////////////////////////////////////////////////////
    // convert the contents object data into content format where..
    // contents - FT_backupEntryRec object
    // content - string of "vm (type, type), vm (type, type)";
    //
    // ex: [ [utm, conf], [pbx, conf], [utm, data]...]
    //      "utm (conf+data), pbx (conf)..."
    this.f_getContents = function(contents)
    {
        var content = '';
        var comma = '';
        for(var i=0; i<contents.length; i++)
        {
            var entry = contents[i];

            if(entry.m_type.length == 2)
            {
                content += comma + entry.m_vmName + " (" + entry.m_type[0] + "+" +
                        entry.m_type[1] + ")";
            }
            else if(entry.m_type.length == 1)
            {
                content += comma + entry.m_vmName + " (" + entry.m_type[0] + ")";
            }

            comma = ", ";
        }

        return content;
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.m_restorePC = this.f_createRestoreFromPC();
        this.f_loadVMData();

        return [this.m_header, this.m_body];
    }

    this.f_launchRestoreDescription = function(fn)
    {
        if(thisObj.m_dataObj == null) return;

        for(var i=0; i<thisObj.m_dataObj.length; i++)
        {
            var bkRec = thisObj.m_dataObj[i];

            if(bkRec.m_file == fn)
            {
                g_configPanelObj.f_showPage(
                VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_DESC_ID, bkRec);
                return;
            }
        }
    }

    this.f_createRestoreFromPC = function()
    {
        var handleFunc = "f_handleBrownMyPC('OpenAppliance')";
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '40px';

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

function f_handleRestoreDesc(filename)
{
    g_configPanelObj.m_activeObj.f_launchRestoreDescription(filename);
}

function f_handleDeleteRestoreFile(e, filename)
{
    var cb = function(evt)
    {
        if(g_configPanelObj.m_activeObj.f_isServerError(evt, 'Configuration Restore Error'))
            return;

        g_configPanelObj.m_activeObj.f_loadVMData();
    }

    if(e.getAttribute('id')== 'ft_popup_message_apply')
        g_busObj.f_deleteArchiveFileFromServer(filename, filename, cb);
}

function f_handleDownloadRestore(filename)
{

}

function f_deleteRestoreFile(content, filename)
{
    g_utils.f_popupMessage('Are you sure you want to delete (' + content + ')?',
                'confirm', 'Delete Backup Archive File', true,
                "f_handleDeleteRestoreFile(this, '"+ filename + "')");
}
