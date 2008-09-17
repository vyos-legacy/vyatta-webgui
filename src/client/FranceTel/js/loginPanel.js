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
        this.m_name = name;
        this.m_tabName = 'login'

        //v_loginPanelObject.suprclass.constructor.apply(this, arguments);
    },

    f_initLoginPanel: function()
    {
        var userField = f_createLoginUserNameField();
        var passField = f_createLoginPasswordField();

        userField.focus(false, 1000);

        var loginHandler = function(a, b, u, p)
        {
            f_loginHandler(a, b, u, p);
        }

        var loginButton = new Ext.Button(
        {
            text: 'Login'
             ,iconCls: 'login-button-image'
             ,minWidth: 100
             ,disabled: true
             ,handler: function() {
                loginHandler('ft_main.html', '/cgi-bin/webgui-oa',
                                userField, passField);
            }
        });

        var lPanel = new Ext.form.FormPanel(
        {
            labelWidth: 75 // label settings here cascade unless overridden
            ,border: true
            ,title: 'Please Enter User Name and Password to Login'
            ,bodyStyle:'padding:10px 10px 5px 10px'
            ,defaultType: 'textfield'
            ,monitorValid: true
            ,width: 400
            ,height: 150
            ,items: [userField, passField]
            ,buttons: [loginButton]
        });

        var onKeyPressHandler = function(field, e)
        {
            f_LoginKeyPressHandler(field, e, 'ft_main.html', '/cgi-bin/webgui-oa',
                                    userField, passField, loginButton);
        }

        userField.on('keyup', onKeyPressHandler);
        passField.on('keyup', onKeyPressHandler);

        var mainPanel = this.f_createMainPanel(this.m_tabName);
        this.f_updateDataPanel(new Array(lPanel));
        return mainPanel;
    }
});