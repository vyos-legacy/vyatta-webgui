/**
 * @author loi
 */
/*
 Document   : utm_rptIdsBasicSummary.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: summary ids log 
 */
function UTM_rptIdsBasicSummary(name, busLayer)
{
    var thisObjName = 'UTM_rptIdsBasicSummary';
    this.m_id = 'rpt_ids_basic_summary';
    this.m_div = undefined;
    this.m_busLayer = undefined;
    this.m_name = undefined;
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
        this.m_busLayer = busLayer;
        this.m_name = name;
    }
    this.privateConstructor(name, busLayer);
    
    this.f_distructor = function() { }
    
	this.f_refresh = function() { }
	
	this.f_show = function()
	{
		var el = document.getElementById(thisObj.m_id);
		if (el != null) {
			el.style.display = '';
		}
	}
	
	this.f_hide = function()
	{
		var el = document.getElementById(thisObj.m_id);
		if (el != null) {
			el.style.display = 'none';
		}		
	}
	
	this.f_getPage = function()
	{
        var div = document.createElement('div');
        div.setAttribute('align', 'left');
        div.setAttribute('id', thisObj.m_id);
		
        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.backgroundColor = 'white';
		div.style.paddingTop = '15px';
		div.style.paddingLeft = '30px';
        div.style.display = 'none';
        div.style.height = 'auto';
		//div.style.border= '1px solid blue';
		
		var html = "<h3>Number of events detected: 27,650</h3>" +
		           "<h4>&nbsp;&nbsp;Whose blocked: 22,000</h4>" +
		           "<h4>&nbsp;&nbsp;Whose detected but not blocked (potential legitimate traffic): 5,650</h4>" +				   
                "<br/><br/><p>&nbsp;&nbsp;&nbsp;" +
                "This space is reserved for top 5 signatures used table." +
                "<br/>&nbsp;&nbsp;&nbsp;" +
                "For now this is just dummy text." +
                "</p>";
	    div.innerHTML = html;
		
		thisObj.m_div = div;
		return thisObj.m_div;		
	}	

	
}
