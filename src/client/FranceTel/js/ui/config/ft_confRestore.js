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
    this.m_colHd = null;

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

        cols[0] = this.f_createColumn(g_lang.m_uhHdDate, 120, 'text', '6', true);
        cols[1] = this.f_createColumn(g_lang.m_uhHdWho, 90, 'text', '6', true);
        cols[2] = this.f_createColumn(g_lang.m_restoreHdContent, 330, 'text', '6', true);
        cols[3] = this.f_createColumn(g_lang.m_restoreHdRestore, 80, 'button', '30');
        cols[4] = this.f_createColumn(g_lang.m_restoreHdDownload, 80, 'button', '30');
        cols[5] = this.f_createColumn(g_lang.m_delete, 80, 'button', '30');

        return cols;
    }

    this.f_loadVMData = function()
    {
        thisObj.f_resetSorting();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                if(thisObj.f_isServerError(evt, g_lang.m_restoreErrorTitle))
                    return;

                var bkRec = evt.m_value;
                if(bkRec == undefined) return;

                thisObj.m_dataObj = bkRec;
                thisObj.f_populateTable();
            }
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_getVMRestoreListFromServer(cb);
    }

    this.f_populateTable = function()
    {
        if(thisObj.m_div != undefined)
            thisObj.f_resetScreen();

        var sortCol = FT_confDashboard.superclass.m_sortCol;
        var rRec = thisObj.f_createSortingArray(sortCol, thisObj.m_dataObj);

        // create table row
        var vmData = [];
        for(var i=0; i<rRec.length; i++)
        {
            var r = rRec[i].split('|');

            var content = r[2];
            var restDesc = "f_handleRestoreDesc('" + r[3] + "')";
            var anchor = thisObj.f_renderAnchor(content, restDesc,
                        g_lang.m_restoreClickRestore + " (" + content + ")");
            var restore = thisObj.f_renderButton(
                        'restore', true, restDesc, g_lang.m_restoreArchive +
                        ' (' + content + ')');
            var download = thisObj.f_renderButton(
                        //'download', true, "f_handleDownloadRestore('" +
                        'download', true, r[3]+".zip",
                        g_lang.m_restoreDownload + ' (' + content + ')');
            var del = thisObj.f_renderButton(
                        'delete', true, "f_deleteRestoreFile('" + content +
                        "', '" + r[3] + "')",
                        g_lang.m_restoreDel + ' (' + content + ')');

            vmData = [r[0], r[1], anchor, restore, download, del]
            var bodyDiv = thisObj.f_createGridRow(thisObj.m_colHd, vmData);
            thisObj.m_body.appendChild(bodyDiv);
        }

        thisObj.f_adjustDivPosition(thisObj.m_restorePC);
    }

    this.f_createSortingArray = function(sortIndex, vm)
    {
        var ar = new Array();

        for(var i=0; i<vm.length; i++)
        {
            var content = thisObj.f_getContents(vm[i].m_content.m_entry);

            // NOTE: the order of this partition same as the order
            // grid columns.
            // compose a default table row
            ar[i] = vm[i].m_bkDate + '|' + vm[i].m_bkBy + '|' +
                    content + '|' + vm[i].m_file;
        }

        return thisObj.f_sortArray(sortIndex, ar);
    }

    this.f_handleGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_colHd, col))
            thisObj.f_populateTable();
    }

    this.f_stopLoadVMData = function()
    {
    }

    this.f_resetScreen = function()
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_body);
        thisObj.f_removeDivChildren(thisObj.m_header);
        thisObj.m_header = thisObj.f_createGridHeader(thisObj.m_colHd,
                            'f_restoreGridHeaderOnclick');
        thisObj.m_div.appendChild(thisObj.m_header);
        thisObj.m_div.appendChild(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_restorePC);
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
        this.m_colHd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(this.m_colHd,
                                    'f_restoreGridHeaderOnclick');
        this.m_body = this.f_createGridView(this.m_colHd);
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
        if(g_configPanelObj.m_activeObj.f_isServerError(evt, g_lang.m_restoreErrorTitle))
            return;

        g_configPanelObj.m_activeObj.f_loadVMData();
    }

    if(e.getAttribute('id')== 'ft_popup_message_apply')
        g_busObj.f_deleteArchiveFileFromServer(filename, filename, cb);
}

function f_handleDownloadRestoreFile(e, filename)
{
    var cb = function(evt)
    {
        if(g_configPanelObj.m_activeObj.f_isServerError(evt, g_lang.m_restoreErrorTitle))
            return;

        g_configPanelObj.m_activeObj.f_loadVMData();
    }

    if(e.getAttribute('id')== 'ft_popup_message_apply')
        g_busObj.f_downloadArchiveFileFromServer(filename, filename, cb);
}

function f_handleDownloadRestore(filename)
{
    g_utils.f_popupMessage(g_lang.m_restoreDlConfirm + ' (' + filename + ')?',
                'confirm', g_lang.m_restoreDownload, true,
                "f_handleDownloadRestoreFile(this, '"+ filename + "')");
}

function f_deleteRestoreFile(content, filename)
{
    g_utils.f_popupMessage(g_lang.m_deleteConfirm + ' (' + content + ')?',
                'confirm', g_lang.m_restoreDelTitle, true,
                "f_handleDeleteRestoreFile(this, '"+ filename + "')");
}

function f_restoreGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}