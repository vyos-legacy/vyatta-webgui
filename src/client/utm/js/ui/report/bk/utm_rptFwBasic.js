/**
 * @author loi
 */
/*
 Document   : utm_rptFwBasic.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: basic firewall log class
 */
function UTM_rptFwBasic(name, busLayer, refresh, children)
{
    var thisObjName = 'UTM_rptFwBasic';
    var thisObj = this;
    
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, busLayer, refresh, children)
    {
        this.privateConstructor(name, busLayer, refresh, children);
    }
    
    this.privateConstructor = function(name, busLayer, refresh, children)
    {
        UTM_rptFwBasic.superclass.constructor(name, busLayer, refresh, children);			
    }
    this.privateConstructor(name, busLayer, refresh, children);
    	
    this.f_distructor = function()
    {
        UTM_rptFwBasic.superclass.f_distructor();	 
    }		
		
	this.f_addChildren = function()
	{
		var c = new UTM_rptFwBasicSummary('FT_rptFwBasicSummary', thisObj.m_busLayer);
		thisObj.f_addChild(c);
	}	
	
	this.f_init = function()
	{
		thisObj.f_initInner('#rpt_fw_basic', 'rpt_fw_basic', 'firewall');				
	}
			
	//Abstract function.  To be overriden by sub classes.
	this.f_loadVMData = function() {}	
	
}
UTM_extend(UTM_rptFwBasic, UTM_rptExpContainer);

