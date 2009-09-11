/**
 * @author loi
 */
/*
 Document   : utm_rptIdsBasic.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: basic intrusion prevention log class
 */
function UTM_rptIdsBasic(name, busLayer, refresh, children)
{
    var thisObjName = 'UTM_rptIdsBasic';
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
        UTM_rptIdsBasic.superclass.constructor(name, busLayer, refresh, children);			
    }
    this.privateConstructor(name, busLayer, refresh, children);
    	
    this.f_distructor = function()
    {
        UTM_rptIdsBasic.superclass.f_distructor();	 
    }		
		
	this.f_addChildren = function()
	{
		var c = new UTM_rptIdsBasicSummary('FT_rptIdsBasicSummary', thisObj.m_busLayer);
		thisObj.f_addChild(c);
	}	
	
	this.f_init = function()
	{
		thisObj.f_initInner('#rpt_ids_basic', 'rpt_ids_basic', 'intrusion prevention');				
	}
			
	//Abstract function.  To be overriden by sub classes.
	this.f_loadVMData = function() {}	
	
}
UTM_extend(UTM_rptIdsBasic, UTM_rptExpContainer);

