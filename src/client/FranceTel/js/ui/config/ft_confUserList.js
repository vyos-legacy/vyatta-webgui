/*
    Document   : ft_confUserList.js
    Created on : Mar 05, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

FT_confUserList = Ext.extend(FT_confBaseObj,
{
    thisObjName: 'FT_confUserList',

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confUserList.superclass.constructor(name, callback, busLayer);
    },

    f_getConfigurationPage: function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    },

    /**
     * define your column header here....
     */
    f_createColumns: function()
    {
        var cols = [];

        cols[0] = this.f_createColumn('Name', 200, 'text', '6');
        cols[1] = this.f_createColumn('Login', 150, 'text', '6');
        cols[2] = this.f_createColumn('Email', 100, 'checkbox', '40');
        cols[3] = this.f_createColumn('Delete', 100, 'checkbox', '40');

        return cols;
    },

    f_loadVMData: function()
    {
        var thisObj = this;
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                var vmData = [];

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_buttons);


                vmData[0] = ["smith john",
                    thisObj.f_renderAnchor('jsmith', "f_userListEditUser('jsmith')"),
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[1] = ["dupont pual",
                    thisObj.f_renderAnchor('testing', "f_userListEditUser('testing')"),
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[2] = ["smith john", 'jsmith',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[3] = ["dupont pual", 'pdupont',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[4] = ["smith john", 'jsmith',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[5] = ["dupont pual", 'pdupont',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[6] = ["smith john", 'jsmith',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[7] = ["dupont pual", 'pdupont',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[8] = ["smith john", 'jsmith',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[9] = ["dupont pual", 'pdupont',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[10] = ["smith john", 'jsmith',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];
                vmData[11] = ["dupont pual", 'pdupont',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderCheckbox('no')];

                for(var i=0; i<vmData.length; i++)
                {
                    var bodyDiv = thisObj.f_createGridRow(hd, vmData[i]);
                    thisObj.m_body.appendChild(bodyDiv);
                }
            }
        }

        this.m_busLayer.f_getVMDataFromServer(cb);
    },

    f_stopLoadVMData: function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
        this.m_threadId = null;
    },

    f_init: function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        var btns = [['Add', 'f_userListAddUserCallback()']];
        this.m_buttons = this.f_createButtons(btns);

        return [this.m_header, this.m_body, this.m_buttons];
    }
});

function f_userListAddUserCallback()
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ADD_ID);

}

function f_userListEditUser(text)
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_UPDATE_ID);
}

