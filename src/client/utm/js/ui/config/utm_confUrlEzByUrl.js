/*
    Document   : utm_confUrlEzByUrl.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Loi.Vo
    Description:
*/

function UTM_confUrlEzByUrl(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'UTM_confurlEzByUrl';
	this.m_btnCancelId = 'conf_url_ez_by_url_btn_cancel';
	this.m_btnApplyId = 'conf_url_ez_by_url_btn_apply';
	this.m_body = undefined;
	this.m_row = 0;
	this.m_cnt = 0;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        this.privateConstructor(name, callback, busLayer);
    }
	
    this.privateConstructor = function(name, callback, busLayer)
    {
        UTM_confUrlEzByUrl.superclass.constructor(name, callback, busLayer);
    }			
    this.privateConstructor(name, callback, busLayer);	

    this.f_getConfigurationPage = function()
    {
        return this.f_getPanelDiv(this.f_init());
    }
	
    this.f_init = function()
    {
		this.m_hdcolumns = this.f_createHdColumns();
		this.m_header = this.f_createGridHeader(this.m_hdcolumns, '');
		this.m_body = this.f_createGridView(this.m_hdcolumns);
		
        var btns = [['Cancel', "f_confUrlEzByUrlHandleCancel('" + this.m_btnCancelId + "')", 'Tools tip for cancel',
                      this.m_btnCancelId],
                    ['Apply', "f_confUrlEzByUrlHandleApply('" + this.m_btnApplyId + "')", 'Tools tip for apply',
                      this.m_btnApplyId]];
        this.m_buttons = this.f_createButtons(btns);			

        this.f_loadVMData();

        return [this.f_headerText(), this.m_header, this.m_body, this.m_buttons];
    }

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_vpnOverviewHeader+"<br><br>");
    }	
	
    this.f_createHdColumns = function()
    {
        var cols = [];
        var chkbox = g_lang.m_enabled + '<br>' + thisObj.f_renderCheckbox('no',
                      'conf_url_ez_by_url_enable_cb', "f_confUrlEzByUrlHandleEnableCb('conf_url_ez_by_url_enable_cb')",
                      'tooltip');

        cols[0] = this.f_createColumn(g_lang.m_url_ezWebSiteAddress + '<br>', 550, 'textField', '6');
        cols[1] = this.f_createColumn(chkbox, 70, 'checkbox', '45');
        cols[2] = this.f_createColumn(g_lang.m_delete + '<br>', 70, 'image', '45');

        return cols;
    }

    this.f_enableAll = function()
    {
        var cb = document.getElementById('conf_url_ez_by_url_enable_cb');
		if (cb.checked) {
			;
		} else {
			;
		}
    }
	
	this.f_handleClick = function(id)
	{
		if (id==thisObj.m_btnCancelId) {
			
		} else if (id == thisObj.m_btnApplyId) {
			
		}
	}

    this.f_loadVMData = function()
    {
		thisObj.f_populateTable();
//        var cb = function(evt)
//        {
//            g_utils.f_cursorDefault();
//            if(evt != undefined && evt.m_objName == 'FT_eventObj')
//            {
//                thisObj.f_populateTable();
//            }
//        }

        //g_utils.f_cursorWait();
        //this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    }

    this.f_populateTable = function()
    {
		var prefix = 'utm_conf_url_ez_by_url_';
        var addr = thisObj.f_renderTextfield('http://www.facebook.com', prefix + 'addr_' + thisObj.m_cnt, false,80);
		var cb = thisObj.f_renderCheckbox('no', prefix + 'cb_' + thisObj.m_cnt, '', '');		
        var del = thisObj.f_renderButton(
                    'delete', true, "f_confUrlEzByUrlHandleDeleteCb('" +
                    prefix + 'addr_' + thisObj.m_cnt + "')", 'delete row');
        var data = [addr,cb,del];
        var bodyDiv = thisObj.f_createGridRow(thisObj.m_hdcolumns, data);
        thisObj.m_body.appendChild(bodyDiv);		
		thisObj.m_cnt++;		
    }

    this.f_handleGridSort = function(col)
    {
    }

    this.f_handleCheckboxClick = function(chkbox)
    {
        
    }

    this.f_stopLoadVMData = function()
    {
    }
}
UTM_extend(UTM_confUrlEzByUrl, UTM_confBaseObj);


function f_confUrlEzByUrlHandleCancel(id)
{
    g_configPanelObj.m_activeObj.f_handleClick(id);
}

function f_confUrlEzByUrlHandleApply(id)
{
    g_configPanelObj.m_activeObj.f_handleClick(id);
}

function f_confUrlEzByUrlHandleEnableCb(e)
{
    g_configPanelObj.m_activeObj.f_enableAll();
}

function f_confUrlEzByUrlHandleDeleteCb(id)
{
	alert('delete called: ' + id);
}
