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
		var c = new UTM_rptLogAdvancedConfigPanel();
		thisObj.m_children.push(c);
		var ids = ['rpt_log_advanced_fw', 'rpt_log_advanced_ids', 'rpt_log_advanced_urlf', 'rpt_log_advanced_vpn'];
		var names = [g_lang.m_menu_firewall , g_lang. m_menu_idp, g_lang.m_menu_webf, g_lang.m_menu_vpn];
		var hrefs = ['#rpt_fw_advanced', '#rpt_ids_advanced', '#rpt_urlf_advanced', '#rpt_vpn_advanced'];
		c = new UTM_rptListPanel(ids, names, hrefs);
		c.f_setTitle(g_lang.m_menu_log);
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

function UTM_rptLogAdvancedConfigPanel()
{
	var thisObj = this;
	this.m_div = undefined;

	this.f_distructor = function()
	{
		this.f_detachEventListener();
	}

	this.f_getPage = function()
	{
		var div = document.createElement('div');
		div.setAttribute('id', 'conf_avs');
        div.setAttribute('align', 'left');
		/////////////////////////////////////////
		// set inner styling of the div tag
		//div.style.position = 'absolute';
		div.style.pixelLeft = 0;
		div.style.padding = '5px 5px 5px 20px';
		div.style.backgroundColor = 'white';
        
		div.innerHTML = this.f_doLayout();
		div.style.display = 'block';

        //div.style.border = '1px solid blue';

		this.m_div = div;

		return div;
	}

    this.f_doLayout = function()
    {		
        var text = '<span id="rpt_log_advanced_config_text">' + g_lang.m_log_click_to_config + '</span><br/><br/>';
		text += '<div title="' + g_lang.m_log_click_to_config + '"><img id="rpt_log_advanced_config_btn" src="' + g_lang.m_imageDir 
		        + 'bt_config.gif"></div>';		
				
        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr><td>' +
                      '<div><p>' + text + '</p>' +
                      '</td></tr></tbody></table>';

        return innerHtml;
    }

    this.f_attachEventListener = function()
    {
        var btSubcribe = document.getElementById('rpt_log_advanced_config_btn');
        g_xbObj.f_xbAttachEventListener(btSubcribe, 'click', thisObj.f_handleClick, true);
    }

    this.f_detachEventListener = function()
    {
        var btSubcribe = document.getElementById('rpt_log_advanced_config_btn');
        g_xbObj.f_xbDetachEventListener(btSubcribe , 'click', thisObj.f_handleClick, true);
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
	
	this.f_configure = function()
	{
		alert('configure button clicked');
	}
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'rpt_log_advanced_config_btn') { //subscribe clicked
				thisObj.f_configure();
				return false;
			}
        }
    }
}
