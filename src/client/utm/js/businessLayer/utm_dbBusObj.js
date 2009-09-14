/*
    Document   : utm_dbBusObj.js
    Created on : sep 09, 2009, 11:23:33 AM
    Author     : Kevin.Choi
    Description:
*/

function UTM_dbFirewallRec(serv, ruleNo, ipPro, numBlock, ldBlock)
{
    this.m_service = serv == null?"":serv;
    this.m_ruleNo = ruleNo==null?"":ruleNo;
    this.m_protocol = ipPro==null?"":ipPro;
    this.m_numBlocks = numBlock==null?"":numBlock;
    this.m_lastBlockDate = ldBlock==null?"":ldBlock;
}

function UTM_dbVPNRec(s2s, s2sConf, s2sUp, ru, ruConf, ruConn)
{
    this.m_s2s = s2s==null?"":s2s;
    this.m_s2sConfigured = s2sConf==null?"":s2sConf;
    this.m_s2sUp = s2sUp==null?"":s2sUp;
    this.m_remoteUser = ru==null?"":ru;
    this.m_ruConfigured = ruConf==null?"":ruConf;
    this.m_ruConnected = ruConn==null?"":ruConn;
}

/**
 * dashboard business obj
 */
function UTM_dbBusObj(busObj)
{
    /////////////////////////////////////
    // properteis
    var thisObj = this;
    this.m_busObj = busObj;

}