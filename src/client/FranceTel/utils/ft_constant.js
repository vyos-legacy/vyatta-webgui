/*
    Document   : ft_constant.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_constanst()
{
    this.V_HOME_PAGE = 'ft_main.html';

    //////////////////////////////////////////////
    // cookies property name
    this.V_COOKIES_USER_NAME = 'userName';
    this.V_COOKIES_USER_ID = 'id';
    this.V_COOKIES_ISLOGIN = 'isLogin';
	this.V_COOKIES_LANG = 'lang';
	this.V_COOKIES_SAOA = 'isSAOA';

    //////////////////////////////////////////////
    // cookies value
    this.V_NOT_FOUND = 'NOTFOUND';
	this.V_LANG_EN = 'en';
	this.V_LANG_FR = 'fr';

    /////////////////////////////////////////////////
    //
    this.V_STATUS_UP = 'up';
    this.V_STATUS_DOWN = 'down';
    this.V_STATUS_UNKNOWN = 'unknown';
}
g_consObj = new FT_constanst();


