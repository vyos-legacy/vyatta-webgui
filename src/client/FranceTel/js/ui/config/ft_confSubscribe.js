/*
 Document   : ft_confSubscribe.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: Subscription page
 */
function FT_confSubscribe(name, callback, busLayer)
{
	var thisObjName = 'FT_confSubscribe';
	var thisObj = this;
	
	
	/**
	 * @param name - name of configuration screens.
	 * @param callback - a container callback
	 * @param busLayer - business object
	 */
	this.constructor = function(name, callback, busLayer)
	{	
	}
		
	this.f_distructor = function()
	{
		this.f_detachEventListener();
	}
	
    this.f_init = function()
	{
		
	}	
	
	/*
	 * This should be called from the sub class to initialize the fields.
	 */
	this.f_setConfig = function(config)
	{
	}
	
	this.f_getConfigurationPage = function()
	{
		var div = document.createElement('div');
		div.setAttribute('id', 'conf_subscribe');
        div.setAttribute('align', 'left');		
		/////////////////////////////////////////
		// set inner styling of the div tag
		//div.style.position = 'absolute';
		div.style.pixelLeft = 0;
		div.style.backgroundColor = 'white';
		
		//div.innerHTML = FT_confMyProfile.m_html.innerHTML;
		div.innerHTML = this.f_doLayout();
		//alert('form generated html: ' + div.innerHTML);
		div.style.display = 'block';
		
		document.getElementById('ft_container').appendChild(div);
		
		this.f_attachEventListener();
		this.f_loadVMData(div);
		
		return div;
	}

    this.f_doLayout = function()
	{
		return (
		'<div style="margin-left:30px; margin-top: 30px; margin-bottom: 50px;">' +
			'<span style="font-weight: bold">' + 
			g_lang.m_subscribePlease + '</span>' +
			'<div style="margin-top:30px; margin-left: 32px;">' +
			'<ul style="list-style-type:square;list-style-image: url(images/puce_squar.gif)">' +			
				'<li>' +
					'<a id="conf_subscribe_install" href="javascript:void(0)" onclick="window.open(\'http://www.orange-business.com/en/mnc2/footer/about/regions/north-america/index.html\')">' + g_lang.m_subscribeInstall + '</a>' +
				'</li>' +
				'<li>' + 
					'<a id="conf_subscribe_remove" href="javascript:void(0)" onclick="window.open(\'http://www.orange-business.com/en/mnc2/footer/about/regions/north-america/index.html\')">' + g_lang.m_subscribeRemove + '</a>' +
				'</li>' +
			'</ul>' + 
			'</div>' +
		'</div>'
		)
	}
		   
    this.f_attachEventListener = function()
    {		
//        var ilink = document.getElementById('conf_subscribe_install');
//		var rlink = document.getElementById('conf_subscribe_remove');
//        g_xbObj.f_xbAttachEventListener(ilink, 'click', thisObj.f_handleClick, true);
//        g_xbObj.f_xbAttachEventListener(rlink, 'click', thisObj.f_handleClick, true);
    }
    
    this.f_detachEventListener = function()
    {
//        var ilink = document.getElementById('conf_subscribe_install');
//		var rlink = document.getElementById('conf_subscribe_remove');
//        g_xbObj.f_xbDetachEventListener(ilink, 'click', thisObj.f_handleClick, true);
//        g_xbObj.f_xbDetachEventListener(rlink, 'click', thisObj.f_handleClick, true);
    }
    
    this.f_onUnload = function()
    {
        this.f_detachEventListener();
    }
    
    this.f_loadVMData = function(element)
    {
    }
    
    this.f_stopLoadVMData = function()
    {
    }	
}	