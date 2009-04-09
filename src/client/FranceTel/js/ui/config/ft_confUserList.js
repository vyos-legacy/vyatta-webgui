/*
    Document   : ft_confUserList.js
    Created on : Mar 05, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confUserList(name, callback, busLayer)
{
    this.thisObjName = 'FT_confUserList';
    var thisObj = this;
    this.m_colHd = null;
    this.m_uRec = null;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confUserList.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    }

    /**
     * define your column header here....
     */
    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn(g_lang.m_name, 200, 'text', '6', true);
        cols[1] = this.f_createColumn(g_lang.m_login, 150, 'text', '6', true);
        cols[2] = this.f_createColumn(g_lang.m_email, 100, 'button', '35');
        cols[3] = this.f_createColumn(g_lang.m_delete, 100, 'button', '35');

        return cols;
    }

    this.f_hideButtons = function()
    {
            thisObj.m_buttons.style.display = 'none';
    }

    this.f_clearViewRow = function()
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_body);
        thisObj.f_removeDivChildren(thisObj.m_header);
        thisObj.m_header = thisObj.f_createGridHeader(thisObj.m_colHd,
                            'f_ulGridHeaderOnclick');
        thisObj.m_div.appendChild(thisObj.m_header);
        thisObj.m_div.appendChild(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_buttons);		
    }

    this.f_loadVMData = function()
    {
        var thisObj = this;
        thisObj.f_resetSorting();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                if(thisObj.f_isServerError(evt, g_lang.m_ulErrorTitle))
                    return;

                thisObj.m_uRec = evt.m_value;

                if(thisObj.m_uRec != undefined && thisObj.m_uRec.m_userList != null)
                {
                    thisObj.m_uRec = thisObj.m_uRec.m_userList;
                    thisObj.f_populateTable();
                }
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
        for(var i=0; i<ulRec.length; i++)
        {
            var ul = ulRec[i].split('|');

            var fName = ul[0] + ' ' + ul[1];
            var anchor = thisObj.f_renderAnchor(ul[2],
                    "f_userListEditUser('" + ul[2] + "')",
                    g_lang.m_ulClick2Edit + " (" + fName + ")");
            var email = ul[3] != undefined ?
                    thisObj.f_renderAnchorHref(
                    '<img src="images/ico_mail.gif">',
                    "mailto:" + ul[3],
                    g_lang.m_ulSendEmail + fName + ' at ' +
                    ul[3]) : "";

            var del = g_busObj.f_isDeletableUser(ul[4]) ?
                    thisObj.f_renderButton(
                    'deleteUser', true, "f_userListDeleteUser('" +
                    ul[2] + "')", g_lang.m_ulDeleteUser +
                    ' (' + fName + ')'):
                    "";
            var data = [fName, anchor, email, del];

            var bodyDiv = thisObj.f_createGridRow(thisObj.m_colHd, data);
            thisObj.m_body.appendChild(bodyDiv);
        }

        thisObj.f_adjustDivPosition(thisObj.m_buttons);
    }

    this.f_createSortingArray = function(sortIndex, vm)
    {
        var ar = new Array();

        for(var i=0; i<vm.length; i++)
        {
            // NOTE: the order of this partition same as the order
            // grid columns.
            // compose a default table row
            ar[i] = vm[i].m_first + '|' + vm[i].m_last + '|' +
                    vm[i].m_user + '|' + vm[i].m_email + '|' +
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
        //this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
        this.m_threadId = null;
    }

    this.f_init = function()
    {
        this.m_colHd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(this.m_colHd, 'f_ulGridHeaderOnclick');
        this.m_body = this.f_createGridView(this.m_colHd);
        this.f_loadVMData();

        var btns = [['AddUser', 'f_userListAddUserCallback()', g_lang.m_ulTooltipAddUser]];
        this.m_buttons = this.f_createButtons(btns);
        /*
        if (g_roleManagerObj.f_isInstaller()) {
			thisObj.f_hideButtons();
		}	   
	    */ 
        return [this.m_header, this.m_body, this.m_buttons];
    }
}
FT_extend(FT_confUserList, FT_confBaseObj);

function f_userListAddUserCallback()
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ADD_ID);

}

function f_userListEditUser(text)
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_UPDATE_ID, text);
}

function f_userListEmail(eAddr)
{

}

function f_handleUserListDeleteUser(e, username)
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
        g_busObj.f_deleteUserFromServer(username, cb);
}

function f_userListDeleteUser(username)
{
    g_utils.f_popupMessage(g_lang.m_deleteConfirm + ' (' + username + ') user?',
                'confirm', g_lang.m_ulDeleteHeader, true,
                "f_handleUserListDeleteUser(this, '"+ username + "')");
}

function f_ulGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}