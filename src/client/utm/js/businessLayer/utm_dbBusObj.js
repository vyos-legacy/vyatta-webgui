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