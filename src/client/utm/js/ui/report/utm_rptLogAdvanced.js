/**
 * @author loi
 */
/*
 Document   : utm_rptLogAdvanced.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: log advanced class
 */
function UTM_rptLogAdvanced(name, busLayer)
{
	var thisObjName = 'UTM_rptLogAdvanced';
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
        UTM_rptLogAdvanced.superclass.constructor(name, busLayer);		
	}
	this.privateConstructor(name, busLayer);

    this.f_distructor = function()
    {
        UTM_rptLogAdvanced.superclass.f_distructor();	 
    }

    this.f_init = function()
	{
		thisObj.m_children = new Array();
		var ids = ['rpt_log_advanced_fw', 'rpt_log_advanced_ids', 'rpt_log_advanced_urlf', 'rpt_log_advanced_vpn'];
		var names = [g_lang.m_menu_firewall , g_lang. m_menu_idp, g_lang.m_menu_webf, g_lang.m_menu_vpn];
		var hrefs = ['#rpt_fw_advanced', '#rpt_ids_advanced', '#rpt_urlf_advanced', '#rpt_vpn_advanced'];
		var c = new UTM_rptListPanel(ids, names, hrefs);
		thisObj.m_children.push(c);
		c = new UTM_rptFwAdvanced('UTM_rptFwAdvanced', thisObj.m_busLayer, true, new Array());
		thisObj.m_children.push(c);
		c = new UTM_rptIdsAdvanced('UTM_rptIdsAdvanced', thisObj.m_busLayer, true, new Array());
		thisObj.m_children.push(c);		
		c = new UTM_rptUrlfAdvanced('UTM_rptUrlfAdvanced', thisObj.m_busLayer, true, new Array());
		thisObj.m_children.push(c);	
		c = new UTM_rptVpnAdvanced('UTM_rptVpnAdvanced', thisObj.m_busLayer, true, new Array());
		thisObj.m_children.push(c);	
	}
	
}
UTM_extend(UTM_rptLogAdvanced, UTM_rptLog);