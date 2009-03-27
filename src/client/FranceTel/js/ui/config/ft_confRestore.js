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
        thisObj = this;

        var cols = [];

        cols[0] = this.f_createColumn('Date', 120, 'text', '6');
        cols[1] = this.f_createColumn('Content', 330, 'text', '6');
        cols[2] = this.f_createColumn('Restore', 80, 'button', '30');
        cols[3] = this.f_createColumn('Download', 80, 'button', '30');
        cols[4] = this.f_createColumn('Delete', 80, 'button', '30');

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
                    var content = thisObj.f_getContents(r.m_contents);
                    var restDesc = "f_handleRestoreDesc('" + r.m_name + "', '" +
                                    r.m_file + "', '" + content[0] + "', '" +
                                    content[1] + "')";
                    var anchor = thisObj.f_renderAnchor(content[0], restDesc,
                                'Click here to restore ' + "(" + content[0] + ")");
                    var restore = thisObj.f_renderButton(
                                'restore', true, restDesc, 'Restore backup archive (' + content[0] + ')');
                    var download = thisObj.f_renderButton(
                                'download', true, "f_handleDownloadRestore('" +
                                r.m_file + "')", 'Download backup archive (' + content[0] + ')');
                    var del = thisObj.f_renderButton(
                                'delete', true, "f_deleteRestoreFile('" + content[0] +
                                "', '" + r.m_file + "')",
                                'Delete backup archive (' + content[0] + ')');

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
    // convert the contents format into content format where..
    // contents - array of [ [vm, type], [vm, type], ... ]
    // content - string of "vm (type, type), vm (type, type)";
    //
    // ex: [ [utm, conf], [pbx, conf], [utm, data]...]
    //      "utm (conf+data), pbx (conf)..."
    this.f_getContents = function(contents)
    {
        var content = '';

        ////////////////////////////////////////////
        // extract vm from contents list into
        // this form: [vm, vm2, vm3...]
        var vm = [];
        var c = 0;
        for(var i=0; i<contents.length; i++)
        {
            var vmAdd = false;
            for(var j=0; j<vm.length; j++)
            {
                var v = vm[j];
                if(v[0] == contents[i].m_vm)
                {
                    vmAdd = true;
                    break;
                }
            }

            if(!vmAdd)
                vm[c++] = new Array(contents[i].m_vm);
        }

        // extract type into this form:
        // [ [vm, type, type...], [vm2, type, type...] ... ]
        for(var i=0; i<contents.length; i++)
        {
            for(var j=0; j<vm.length; j++)
            {
                var v = vm[j];
                if(contents[i].m_vm == v[0])
                {
                    v[v.length] = contents[i].m_type;
                    break;
                }
            }
        }

        // last form it into:
        // "vm (type, type), vm (type, type)"
        var comma = "";
        var vmId = '';
        for(var i=0; i<vm.length; i++)
        {
            var v = vm[i];
            vmId += comma + v[0];
            var vmRec = g_busObj.f_getVmRecByVmId(v[0]);

            // for now, we only care for 2 type: conf and data
            if(v[2] != undefined)
                content += comma + vmRec.m_displayName + " (" + v[1] + "+" + v[2] + ")";
            else
                content += comma + vmRec.m_displayName + " (" + v[1] + ")";

            comma = ", ";
        }

        return [content, vmId];
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

function f_handleRestoreDesc(name, filename, content, vmIds)
{
    var data = [name, filename, content, vmIds];
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_DESC_ID, data);
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
