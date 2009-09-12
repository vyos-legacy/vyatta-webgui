/**
 * @author loi
 */
/*
 Document   : utm_rptVpnBasic.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: basic vpn log class
 */
function UTM_rptVpnBasic(name, busLayer, refresh)
{
    var thisObjName = 'UTM_rptVpnBasic';
    var thisObj = this;
	
	this.m_name = name;
	this.m_busLayer = busLayer;
	this.m_refresh = refresh;
	this.m_container = new UTM_rptExpContainer(thisObj.m_name, thisObj.m_busLayer, thisObj.m_refresh, this);
        				
	this.f_addChildren = function()
	{
		var c = new UTM_rptVpnBasicSummary('FT_rptVpnBasicSummary', thisObj.m_busLayer);
		thisObj.m_container.f_addChild(c);
	}	
	
	this.f_getPage = function() 
	{
		return thisObj.m_container.f_getPage();		
	}
	
	this.f_init = function()
	{
		thisObj.m_container.f_initInner('#rpt_log_basic_fw', 'rpt_vpn_basic', g_lang.m_menu_vpn);				
	}

    this.f_changed = function()
    {
        return false;
    }
	
	this.f_attachEventListener = function()
	{
		thisObj.m_container.f_attachEventListener();
	}
			
	this.f_detachEventListener = function()
	{
		thisObj.m_container.f_detachEventListener();
	}		
			
    this.f_distructor = function()
	{
		thisObj.m_container.f_distructor();
	}			
			
	//Abstract function.  To be overriden by sub classes.
	this.f_loadVMData = function() {}	
	
}


