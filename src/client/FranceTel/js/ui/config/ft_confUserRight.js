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

    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn('Name', 180, 'text', '6');
        cols[1] = this.f_createColumn('PBX', 80, 'checkbox', '35');
        cols[2] = this.f_createColumn('3rd Party', 80, 'checkbox', '35');

        return cols;
    }

    this.f_clearViewRow = function()
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_header);
        thisObj.m_div.appendChild(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_buttons);
    }

    this.f_loadVMData = function()
    {
        var thisObj = this;
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                var ul = evt.m_value;

                if(ul != undefined && ul.m_userList != null)
                {
                    thisObj.f_clearViewRow();
                    ul = ul.m_userList;

                    for(var i=0; i<ul.length; i++)
                    {
                        var fName = ul[i].m_last + ' ' + ul[i].m_first;
                        var checkbox = thisObj.f_renderCheckbox('yes');
                        var checkbox2 = thisObj.f_renderCheckbox('no');

                        var data = [fName, checkbox, checkbox2];
                        var bodyDiv = thisObj.f_createGridRow(hd, data);
                        thisObj.m_body.appendChild(bodyDiv);
                    }
                }
            }
        }

        g_utils.f_cursorWait();
        this.m_busLayer.f_getUserListFromServer(cb);
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        var btns = [['Apply', "f_userRightHandleApply('vm')", ''],
                    ['Cancel', "f_dbHandleCancel()", '']];
        this.m_buttons = this.f_createButtons(btns);

        return [this.m_header, this.m_body, this.m_buttons];
    }
}
FT_extend(FT_confUserRight, FT_confBaseObj);


function f_userRightHandleApply(vm)
{
    g_utils.f_popupMessage('testing tseting testing', 'confirm');

}

function f_userRightHandleCancel()
{
    /////////////////////////////////////////////////////
        // for testing
        var cb = function(evt)
        {
            alert('got user list ' + evt);
        }
        g_busObj.f_deleteUserFromServer('username'+counter, cb);
        //g_busObj.f_getUserListFromServer(cb);
}