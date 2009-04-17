/*
    Document   : utm_eventObj.js
    Created on : Feb 28, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/


function FT_eventObj(errCode, value, errMsg)
{
    var thisObj = this;
    this.m_objName = 'UTM_eventObj';
    this.m_errCode = errCode == undefined ? 0 : errCode;
    this.m_value = value;
    this.m_errMsg = errMsg;

    this.f_isError = function()
    {
        return thisObj.m_errCode == 0 ? false : true;
    }
}