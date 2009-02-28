/*
    Document   : ft_utils.js
    Created on : Feb 25, 2009, 2:35:25 PM
    Author     : Kevin.Choi
    Description:
*/

var g_utils =
{
    f_findPercentage: function(total, free)
    {
        if(total == 0 && free == 0) return 0;
        if(free <= 0) return 100;

        var p = 100 - Math.round((free/total) * 100);

        return p < 0 ? 0 : p;
    },

    f_saveUserLoginId: function(id)
    {
        g_cookie.f_set(g_consObj.V_COOKIES_USER_ID, id, g_cookie.m_userNameExpire);
    },

    f_getUserLoginedID: function(cookieP /* cookieP is optional */)
    {
        return g_cookie.f_get(g_consObj.V_COOKIES_USER_ID);
    },

    f_gotoHomePage: function()
    {
        if(navigator.userAgent.indexOf('Chrome') > 0)
            location.reload(true);
        else
            window.location = g_consObj.V_HOME_PAGE;
    }
};
