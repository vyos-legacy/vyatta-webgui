/*
    Document   : ft_confUserRight.js
    Created on : Mar 15, 2009, 6:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confUserRight(name, callback, busLayer)
{
    var thisObjName = 'FT_confUserRight';
    var thisObj = this;
    this.m_uiData = null;
    this.m_btnApplyId = 'ur_apply_id';
    this.m_btnCancelId = 'ur_cancel_id';
    this.m_colHd = null;
    this.m_uRec = null;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confUserRight.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    }

    this.f_showThisVM = function(vm)
    {
        //////////////////////////////////
        // skip open appliance, blb and undeploy vm
        if(vm.m_name == 'openapp' || vm.m_name == 'blb' ||
            !vm.m_isDeployed)
            return false;

        return true;
    }

    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn(g_lang.m_name, 180, 'text', '6', true);

        var vm = g_busObj.f_getVmRecObj();
        var vmIndex = 1;
        for(var i=0; i<vm.length; i++)
        {
            if(!this.f_showThisVM(vm[i]))
                continue;

            cols[vmIndex++] = this.f_createColumn(vm[i].m_displayName,
                              80, 'checkbox', '35');
        }

        return cols;
    }

    this.f_clearViewRow = function()
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_body);
        thisObj.f_removeDivChildren(thisObj.m_header);
        thisObj.m_header = thisObj.f_createGridHeader(thisObj.m_colHd,
                            'f_urGridHeaderOnclick');
        thisObj.m_div.appendChild(thisObj.m_header);
        thisObj.m_div.appendChild(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_buttons);
    }

    this.f_loadData = function()
    {
        thisObj.f_resetSorting();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                if(thisObj.f_isServerError(evt, g_lang.m_urErrorTitle))
                    return;

                var ul = evt.m_value;
                thisObj.m_uiData = [];

                if(ul != undefined && ul.m_userList != null)
                {
                    thisObj.m_uRec = ul.m_userList;
                    thisObj.f_populateTable();
                }
                thisObj.f_resize();
            }
        }

        g_utils.f_cursorWait();
        this.m_busLayer.f_getUserListFromServer(cb);
    }

    this.f_populateTable = function()
    {
        thisObj.f_clearViewRow();

        var sortCol = FT_confDashboard.superclass.m_sortCol;
        var ulRec = thisObj.f_createSortingArray(sortCol, thisObj.m_uRec);
        var vm = g_busObj.f_getVmRecObj();

        // create table row
        var c=0;
        for(var i=0; i<ulRec.length; i++)
        {
            var ul = ulRec[i].split('|');

            if(ul[4] == 'admin' || ul[4] == 'installer')
                continue;

            var fName = ul[1] + ' ' + ul[2];
            var un = ul[0];
            var data = [fName];

            // create table column
            var dataIndex = 0;
            var uiData = [];
            for(var j=0; j<vm.length; j++)
            {
                if(!thisObj.f_showThisVM(vm[j]))
                    continue;

                var vn = g_utils.f_replace(vm[j].m_name, " ", "");
                var right = thisObj.f_createUserRightsCheckbox(
                        vn, un, g_busObj.f_getUserRecByUserName(ul[0]));
                if(right != null)
                {
                    uiData[dataIndex] = [un+vn, right[1],
                                un, vm[j].m_name];
                    data[1+dataIndex++] = right[0];
                }
            }

            // uiData contains username, vmname and checkbox element id and
            // 'yes'/'no' where yes is check
            // etc. id (username+vmName), check/no check, username, vmname
            thisObj.m_uiData[c++] = uiData;

            var bodyDiv = thisObj.f_createGridRow(thisObj.m_colHd, data);
            thisObj.m_body.appendChild(bodyDiv);
        }

        thisObj.f_adjustDivPosition(thisObj.m_buttons);
        thisObj.f_handleOnCheckBoxClick();
    }

    this.f_createSortingArray = function(sortIndex, vm)
    {
        var ar = new Array();

        for(var i=0; i<vm.length; i++)
        {
            // NOTE: the order of this partition same as the order
            // grid columns.
            // compose a default table row
            ar[ar.length] = vm[i].m_user + '|' + vm[i].m_last + '|' +
                    vm[i].m_first + '|' + vm[i].m_email + '|' +
                    vm[i].m_role;
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

    this.f_createUserRightsCheckbox = function(vmName, userName, ul)
    {
        //NOTE: userName + vmName to made up checkbox element id

        if(ul.m_rights != undefined && ul.m_rights.length > 0)
        {
            var rights = ul.m_rights;
            for(var i=0; i<rights.length; i++)
            {
                if(vmName == rights[i])
                    return [thisObj.f_renderCheckbox('yes', userName+vmName,
                            'f_userRightCheckboxClick(this)'), 'yes'];
            }

            return [thisObj.f_renderCheckbox('no', userName+vmName,
                            'f_userRightCheckboxClick(this)'), 'no'];
        }
        else if(ul.m_rights == undefined)
            return [thisObj.f_renderCheckbox('no', userName+vmName,
                            'f_userRightCheckboxClick(this)'), 'no'];

        return null;
    }

    this.f_handleOnCheckBoxClick = function()
    {
        if(thisObj.m_uiData == undefined) return;

        var isDirty = false;
        for(var i=0; i<thisObj.m_uiData.length; i++)
        {
            var uiData = thisObj.m_uiData[i];
            for(var j=0; j<uiData.length; j++)
            {
                var vm = uiData[j];
                var eId = document.getElementById(vm[0]);
                if(eId != null)
                {
                    if(eId.checked && vm[1] == 'no')
                    {
                        isDirty = true;
                        break;
                    }
                    else if(!eId.checked && vm[1] == 'yes')
                    {
                        isDirty = true;
                        break;
                    }
                }
            }
        }

        thisObj.f_enabledDisableButton(thisObj.m_btnApplyId, isDirty);
        thisObj.f_enabledDisableButton(thisObj.m_btnCancelId, isDirty);
    }

    this.f_handleOnApplyClick = function()
    {
        if(thisObj.m_uiData == undefined) return;

        var cmdStr = [];
        var cmdIndex = 0;
        for(var i=0; i<thisObj.m_uiData.length; i++)
        {
            var uiData = thisObj.m_uiData[i];
            for(var j=0; j<uiData.length; j++)
            {
                var vm = uiData[j];
                var eId = document.getElementById(vm[0]);
                if(eId != null)
                {
                    if(eId.checked && vm[1] == 'no')
                        cmdStr[cmdIndex++] = "add '" + vm[2] + "' rights '" + vm[3] + "'";
                    else if(!eId.checked && vm[1] == 'yes')
                        cmdStr[cmdIndex++] = "delete '" + vm[2] + "' rights '" + vm[3] + "'";
                }
            }
        }

        var cb = function(evt)
        {
            if(evt != undefined && !evt.f_isError())
                thisObj.f_loadData();
            else if(evt != undefined && evt.f_isError())
                alert(evt.m_errMsg);
        }

        if(cmdStr.length > 0)
            g_busObj.f_modifyUserRightToServer(cmdStr, cb);
    }

    this.f_resetUserInput = function()
    {
        if(thisObj.m_uiData == undefined) return;

        for(var i=0; i<thisObj.m_uiData.length; i++)
        {
            var uiData = thisObj.m_uiData[i];
            for(var j=0; j<uiData.length; j++)
            {
                var vm = uiData[j];
                var eId = document.getElementById(vm[0]);
                if(eId != null)
                    eId.checked = vm[1] == 'yes' ? true : false;
            }
        }

        thisObj.f_handleOnCheckBoxClick();
    }

    this.f_init = function()
    {
        this.m_colHd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(this.m_colHd, 'f_urGridHeaderOnclick');
        this.m_body = this.f_createGridView(this.m_colHd);
        this.f_loadData();

        var btns = [['Apply', "f_userRightHandleApply()", g_lang.m_urBtnApply,
                      this.m_btnApplyId],
                    ['Cancel', "f_userRightHandleCancel()", g_lang.m_urBtnCancel,
                      this.m_btnCancelId]];
        this.m_buttons = this.f_createButtons(btns);

        return [this.m_header, this.m_body, this.m_buttons];
    }
}

FT_extend(FT_confUserRight, FT_confBaseObj);

function f_userRightHandleApplyComfirm(e)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
        g_configPanelObj.m_activeObj.f_handleOnApplyClick();
}

function f_userRightHandleApply(e)
{
    g_utils.f_popupMessage(g_lang.m_urCommitChange, 'confirm',
                g_lang.m_urConfirmTitle, true, 'f_userRightHandleApplyComfirm(this)');

}

function f_userRightHandleCancel(e)
{
    g_configPanelObj.m_activeObj.f_resetUserInput();
}

function f_userRightCheckboxClick(e)
{
    g_configPanelObj.m_activeObj.f_handleOnCheckBoxClick()
}

function f_urGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}