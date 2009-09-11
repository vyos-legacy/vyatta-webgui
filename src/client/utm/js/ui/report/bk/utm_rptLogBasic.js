/**
 * @author loi
 */
/*
 Document   : utm_rptLogBasic.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: log basic class
 */
function UTM_rptLogBasic(name, busLayer)
{
	var thisObjName = 'UTM_rptLogBasic';
	var thisObj = this;
		
	/**
	 * @param name - name of configuration screens.
	 * @param callback - a container callback
	 * @param busLayer - business object
	 */
	this.constructor = function(name, busLayer)
	{
		this.privateConstructor(name, busLayer);
	}
	
	this.privateConstructor = function(name, busLayer)
	{
        UTM_rptLogBasic.superclass.constructor(name, busLayer);		
	}
	this.privateConstructor(name, busLayer);

    this.f_distructor = function()
    {
        UTM_rptLogBasic.superclass.f_distructor();	 
    }

    this.f_init = function()
	{
		var ids = ['rpt_log_basic_fw', 'rpt_log_basic_ids', 'rpt_log_basic_urlf', 'rpt_log_basic_vpn'];
		var names = ['firewall', 'intrusion prevention', 'web filtering', 'VPN'];
		var hrefs = ['#rpt_fw_basic', '#rpt_ids_basic', '#rpt_urlf_basic', '#rpt_vpn_basic'];
		var c = new UTM_rptListPanel(ids, names, hrefs);
		thisObj.m_children.push(c);
		c = new UTM_rptFwBasic('UTM_rptFwBasic', thisObj.m_busLayer, true, new Array());
		thisObj.m_children.push(c);
		c = new UTM_rptIdsBasic('UTM_rptIdsBasic', thisObj.m_busLayer, true, new Array());
		thisObj.m_children.push(c);		
	}
	
}
UTM_extend(UTM_rptLogBasic, UTM_rptLog);