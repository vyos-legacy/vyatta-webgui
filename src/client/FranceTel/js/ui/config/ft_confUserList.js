/*
    Document   : ft_confUserList.js
    Created on : Mar 05, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confUserList(name, callback, busLayer)
{
    this.thisObjName = 'FT_confUserList';

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

        cols[0] = this.f_createColumn('Name', 200, 'text', '6');
        cols[1] = this.f_createColumn('Login', 150, 'text', '6');
        cols[2] = this.f_createColumn('Email', 100, 'checkbox', '40');
        cols[3] = this.f_createColumn('Delete', 100, 'button', '35');

        return cols;
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

                if(ul != undefined)
                {
                    thisObj.m_userList = ul;

                    for(var i=0; i<ul.length; i++)
                    {
                        var fName = ul[i].m_last + ' ' + ul[i].m_first;
                        var anchor = thisObj.f_renderAnchor(ul[i].m_user,
                                "f_userListEditUser('" + ul[i].m_user + "')",
                                'Click here to edit ' + "(smith john)");
                        var email = ul[i].m_email != undefined ?
                                thisObj.f_renderAnchorHref(
                                '<img src="images/ft_email.PNG">',
                                "mailto:" + ul[i].m_email,
                                'Send email to ' + fName) : "";
                        var del = thisObj.f_renderButton(
                                'deleteUser', true, "f_userListDeleteUser('" +
                                ul[i].user + "')", 'Delete user (' + fName + ')');
                        var data = [fName, anchor, email, del];

                        var bodyDiv = thisObj.f_createGridRow(hd, data);
                        thisObj.m_body.appendChild(bodyDiv);
                    }
                }

                var vmData = [];

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_buttons);


                var img = '<img src="images/ft_email.PNG">';
                vmData[0] = ["smith john",
                    thisObj.f_renderAnchor('jsmith', "f_userListEditUser('jsmith')",
                            'Click here to edit ' + "'smith john'"),
                    thisObj.f_renderAnchorHref(img,
                                "mailto:kevin.choi@vyatta.com",
                                'Send email to ' + "Choi Kevin"),
                    thisObj.f_renderButton(
                                'deleteUser', true, "f_userListDeleteUser('" +
                                "jsmith" + "')", 'Delete user ' + "smith john")];
                vmData[1] = ["dupont pual",
                    thisObj.f_renderAnchor('testing', "f_userListEditUser('testing')",
                            'Click here to edit ' + "'dupon pual'"),
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderButton(
                                'deleteUser', true, "f_userListDeleteUser('" +
                                "jsmith" + "')", 'Delete user ' + "dupon pual")];
                vmData[2] = ["smith john", 'jsmith',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderButton(
                                'deleteUser', true, "f_userListDeleteUser('" +
                                "jsmith" + "')", 'Delete user ' + "smith john")];
                vmData[3] = ["dupont pual", 'pdupont',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderButton(
                                'deleteUser', true, "f_userListDeleteUser('" +
                                "jsmith" + "')", 'Delete user ' + "smith john")];
                vmData[4] = ["smith john", 'jsmith',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderButton(
                                'deleteUser', true, "f_userListDeleteUser('" +
                                "jsmith" + "')", 'Delete user ' + "smith john")];
                vmData[5] = ["dupont pual", 'pdupont',
                    thisObj.f_renderCheckbox('yes'),
                    thisObj.f_renderButton(
                                'deleteUser', true, "f_userListDeleteUser('" +
                                "jsmith" + "')", 'Delete user ' + "smith john")];
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

        g_utils.f_cursorWait();
        this.m_busLayer.f_getUserListFromServer(cb);
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
        this.m_threadId = null;
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        var btns = [['AddUser', 'f_userListAddUserCallback()', 'Create new user account']];
        this.m_buttons = this.f_createButtons(btns);

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

function f_userListDeleteUser(username)
{

}