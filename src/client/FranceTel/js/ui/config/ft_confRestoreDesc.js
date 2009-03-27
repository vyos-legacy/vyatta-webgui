/*
    Document   : ft_confRestoreDesc.js
    Created on : Mar 17, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confRestoreDesc(name, callback, busLayer)
{
    this.thisObjName = 'FT_confRestoreDesc';
    var thisObj = this;
    thisObj.m_btnRestoreId = 'restoreDescButtonId';

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

    this.f_getConfigurationPage = function(dataObj)
    {
        var page = this.f_getNewPanelDiv(this.f_init(dataObj));

        return page;
    }

    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn('Application', 250, 'text', '6');
        cols[1] = this.f_createColumn('Config.', 80, 'checkbox', '35');
        cols[2] = this.f_createColumn('Data', 80, 'checkbox', '35');

        return cols;
    }

    this.f_loadVMData = function()
    {
        var hd = this.f_createColumns();

        //if(thisObj.f_isServerError(evt, 'Configuration Restore  Error'))
        //    return;

        var contents = thisObj.m_dataObj[2]
        thisObj.m_chkboxFields = [];
        if(contents != undefined)
        {
            var vms = contents.split(",");
            for(var i=0; i<vms.length; i++)
            {
                var vm = vms[i].substring(0, vms[i].indexOf('('));
                var type = vms[i].substring(vms[i].indexOf('('),
                            vms[i].indexOf(')'));
                var types = type.split("+");
                var chkData = "";
                var chkConf = "";

                for(var j=0; j<types.length; j++)
                {
                    if(types[j].indexOf('conf') >= 0)
                    {
                        chkConf = thisObj.f_renderCheckbox('yes', 'config_' + vm,
                            'f_restoreCheckboxClick(this)', "");
                        thisObj.m_chkboxFields[thisObj.m_chkboxFields.length] =
                            'config_' + vm;
                    }
                    else if(types[j].indexOf('data') >= 0)
                    {
                        chkData = thisObj.f_renderCheckbox('yes', 'data_' + vm,
                            'f_restoreCheckboxClick(this)', "");
                        thisObj.m_chkboxFields[thisObj.m_chkboxFields.length] =
                            'data_' + vm;
                    }
                }

                var vmData = [vm, chkConf, chkData];
                var bodyDiv = thisObj.f_createGridRow(hd, vmData);
                thisObj.m_body.appendChild(bodyDiv);
            }

            thisObj.f_adjustDivPosition(thisObj.m_buttons);
        }
    }

    this.f_stopLoadVMData = function()
    {
        this.m_threadId = null;
    }

    this.f_restoreSelectedVM = function()
    {
        var f = thisObj.m_chkboxFields;

        for(var i=0; i<f.length; i++)
        {
            var chkbox = document.getElementById(thisObj.m_chkboxFields[i]);
            if(chkbox != undefined && chkbox.checked)
            {
            }
        }
    }

    this.f_handleCheckboxClick = function(e)
    {
        thisObj.f_updateRestoreButton();
    }

    this.f_updateRestoreButton = function()
    {
        var f = thisObj.m_chkboxFields;
        var isAnyChkboxChecked = false;

        for(var i=0; i<f.length; i++)
        {
            var chkbox = document.getElementById(thisObj.m_chkboxFields[i]);
            if(chkbox != undefined && chkbox.checked)
            {
                isAnyChkboxChecked = true;
                break;
            }
        }

        thisObj.f_enabledDisableButton(thisObj.m_btnRestoreId, isAnyChkboxChecked);
    }

    this.f_init = function(dataObj)
    {
        thisObj.m_dataObj = dataObj;

        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);

        var btns = [['Restore', "f_restoreDescRestore()", '',
                    thisObj.m_btnRestoreId],
                    ['Cancel', "f_restoreDescCancel()", '']];
        this.m_buttons = this.f_createButtons(btns);

        this.f_loadVMData();

        return [this.m_header, this.m_body, this.m_buttons];
    }

}
FT_extend(FT_confRestoreDesc, FT_confBaseObj);

function f_handleRestoreDescRestore(e)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
        g_configPanelObj.m_activeObj.f_restoreSelectedVM();
}

function f_restoreDescRestore()
{
    g_utils.f_popupMessage('Are you sure you want to restore the selection VM?',
                'confirm', 'Configuration Restore Description', true,
                "f_handleRestoreDescRestore(e)(this)");
}

function f_restoreDescCancel()
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_ID);
}

function f_restoreCheckboxClick(e)
{
    g_configPanelObj.m_activeObj.f_handleCheckboxClick(e);
}