/*
    Document   : ft_confRestoreDesc.js
    Created on : Mar 17, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confRestoreDesc(name, callback, busLayer)
{
    this.thisObjName = 'FT_confRestoreDesc';

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confRestoreDesc.superclass.constructor(name, callback, busLayer);
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

        cols[0] = this.f_createColumn('Application', 250, 'text', '6');
        cols[1] = this.f_createColumn('Data', 80, 'checkbox', '35');
        cols[2] = this.f_createColumn('Config.', 80, 'checkbox', '35');

        return cols;
    }

    this.f_loadVMData = function()
    {
        var thisObj = this;
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            thisObj.f_removeDivChildren(thisObj.m_div);
            thisObj.f_removeDivChildren(thisObj.m_body);
            thisObj.m_div.appendChild(thisObj.m_header);
            thisObj.m_div.appendChild(thisObj.m_body);
            thisObj.m_div.appendChild(thisObj.m_buttons);
        }

        //thisObj.f_adjustDivPosition(thisObj.m_buttons);
        //var bodyDiv = thisObj.f_createGridRow(hd, vmData);
        //thisObj.m_body.appendChild(bodyDiv);

        //g_utils.f_cursorWait();
        //this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    }

    this.f_stopLoadVMData = function()
    {
        this.m_threadId = null;
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        var btns = [['Restore', "f_restoreDescRestore()", 'Restore selected VM(s)'],
                    ['Cancel', "f_restoreDescCancel()", '']];
        this.m_buttons = this.f_createButtons(btns);

        return [this.m_header, this.m_body, this.m_buttons];
    }

}
FT_extend(FT_confRestoreDesc, FT_confBaseObj);

function f_restoreDescRestore()
{

}

function f_restoreDescCancel()
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_ID);
}