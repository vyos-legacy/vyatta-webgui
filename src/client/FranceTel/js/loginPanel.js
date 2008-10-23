/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


v_loginPanelObject = Ext.extend(v_panelObject,
{
    ////////////////////////////////////////////////////////////////////////////
    // local data memeber
    ////////////////////////////////////////////////////////////////////////////

    constructor: function(name)
    {
        this.m_tabName = name

        //v_loginPanelObject.suprclass.constructor.apply(this, arguments);
    },

    f_initLoginPanel: function(systemObj)
    {
        //////////////////////////////////////////////////
        // get system main frame body panel
        var bp = systemObj.m_bodyPanel;
        var hp = systemObj.m_headerPanel;

        /////////////////////////////////////////////////////
        //
        var el = document.getElementById('barre_etat');
        if(el != undefined)
        {
            el.innerHTML = "<span></span>";

            el = document.getElementById('nav_primaire');
            el.innerHTML = "<span></span>";
        }

        el = document.getElementById('id_header');
        el.innerHTML = "<div align='center'><img src='images/op_login_image.gif'></div>";

        contentId = Ext.id();
        Ext.getBody().createChild({tag:'div', id:contentId, html: ""});
        el = document.getElementById(bp.getId())
        el.innerHTML = this.f_ftLoginPanel();
        bp.add(document.getElementById(contentId));

        hp.doLayout();
        bp.doLayout();

        el = document.getElementById('username');
        el.focus();
    },

    f_ftLoginPanel: function()
    {
        var str = '<br><br><div id="logon_content" align="center">' +
                  '<table id="ft_table">'+
                  '<tbody><tr>'+
                  '<td class="alignRight"><label for="username">' +
                  '<script>document.write(eval("user_"+lang))</script>username</label></td>'+
		  '<td class="alignLeft"><input id="username" name="username" type="text"></td>'+
                  //'<script>var el = document.getElementById("username"); el.focus()' +
		  '</tr>'+
		  '<tr>'+
		  '<td class="alignRight"><label for="password">'+
                  '<script>document.write(eval("password_"+lang))'+
                  '</script>password</label></td>'+
		  '<td class="alignLeft">'+
                  '<input id="password" name="password" type="password"></td>'+
		  '</tr>'+
		  '</tbody></table></div>';

        str += '<div align="center"><input name="goto2" id="goto22" value="OK" onclick="submi()" '+
                'class="OneButton" type="button"></div>';

        str += "<br><br><div id='messageContactServiceCustomer' align='center'>" +
                  "If you have no username and password, contact your Customer Service Center.<br>";
        str += "Warning: to connect to the Open Appliance program,";
        str += " your browser must accept pop-ups and cookies.</div>";

        return str;
    }

});


function submi()
{
    var un = document.getElementById('username').value;
    var pw = document.getElementById('password').value;

    ///////////////////////////////////////////////////////////////////////
    // below code is to keep the old form of login process
    var userField = f_createLoginUserNameField('username');
    var passField = f_createLoginPasswordField('password');

    userField.setValue(un);
    passField.setValue(pw);
    f_loginHandler('ft_main.html', '/cgi-bin/webgui-oa',
                                userField, passField);
}