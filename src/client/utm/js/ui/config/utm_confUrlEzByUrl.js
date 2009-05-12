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
    this.m_btnAddId = 'conf_url_ez_by_url_btn_add';
    this.m_btnBackId = 'conf_url_ez_by_url_btn_back';
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
        var div = this.f_getPanelDiv(this.f_init());
        this.f_loadVMData();
        return div;
    }
    
    this.f_init = function()
    {
        this.m_hdcolumns = this.f_createHdColumns();
        this.m_header = this.f_createGridHeader(this.m_hdcolumns, '');
        this.m_body = this.f_createGridView(this.m_hdcolumns, true);
        
        var addBtn = [['AddInner', "f_confUrlEzByUrlHandleAdd('" + this.m_btnAddId + "')", 'Tools tip for add', this.m_btnAddId]];
        this.m_addButton = this.f_createInnerButtons(addBtn, '790px');
        
        var btns = [['Back', "f_confUrlEzByUrlHandleBack('" + this.m_btnBackId + "')", 'Tools tip for back', this.m_btnBackId, g_lang.m_imageDir + 'bt_back.png', 'left'], ['Apply', "f_confUrlEzByUrlHandleApply('" + this.m_btnApplyId + "')", 'Tools tip for apply', this.m_btnApplyId, g_lang.m_imageDir + 'bt_apply.gif', 'right'], ['Cancel', "f_confUrlEzByUrlHandleCancel('" + this.m_btnCancelId + "')", 'Tools tip for cancel', this.m_btnCancelId, g_lang.m_imageDir + 'bt_cancel.gif', 'right']]
        this.m_buttons = this.f_createLRButtons(btns, '790px');
        
        return [this.f_headerText(), this.m_header, this.m_body, this.m_addButton, this.m_buttons];
    }
    
    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_vpnOverviewHeader + "<br><br>");
    }
    
    this.f_createHdColumns = function()
    {
        this.f_colorGridBackgroundRow(true);
        var cols = [];
        var chkbox = g_lang.m_enabled + '<br>' +
        thisObj.f_renderCheckbox('no', 'conf_url_ez_by_url_enable_cb', "f_confUrlEzByUrlHandleEnableCb('conf_url_ez_by_url_enable_cb')", 'tooltip');
        
        cols[0] = this.f_createColumn(g_lang.m_url_ezWebSiteAddress + '<br>', 650, 'textField', '10', false, 'center');
        cols[1] = this.f_createColumn(chkbox, 70, 'checkbox', '28');
        cols[2] = this.f_createColumn(g_lang.m_delete + '<br>', 70, 'image', '28');
        
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
    
    this.f_addRow = function()
    {
        var prefix = 'utm_conf_url_ez_by_url_';
        var addr = thisObj.f_renderTextField(prefix + 'addr_' + thisObj.m_cnt, '', '', 625);
        var cb = thisObj.f_renderCheckbox('no', prefix + 'cb_' + thisObj.m_cnt, '', '');
        var del = thisObj.f_renderButton('delete', true, "f_confUrlEzByUrlHandleDeleteCb('" +
        prefix +
        'addr_' +
        thisObj.m_cnt +
        "')", 'delete row');
        var data = [addr, cb, del];
        var bodyDiv = thisObj.f_createGridRow(thisObj.m_hdcolumns, data, 28);
        
        thisObj.m_body.appendChild(bodyDiv);
        thisObj.m_cnt++;
        thisObj.f_adjust();
    }
    
    this.f_apply = function()
    {
    
    }
    
    this.f_reset = function()
    {
    
    }
    
    this.f_handleClick = function(id)
    {
        if (id == thisObj.m_btnCancelId) {
            thisObj.f_reset();
        } else if (id == thisObj.m_btnApplyId) {
            thisObj.f_apply();
        } else if (id == thisObj.m_btnAddId) {
            thisObj.f_addRow();
        } else if (id == thisObj.m_btnBackId) {
            g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_ID);
            
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
    
    this.f_getTableHeight = function()
    {
        var h = thisObj.m_tableRowCounter * 28;
        return h;
    }
    
    this.f_adjust = function()
    {
        thisObj.m_body.style.height = '';
        thisObj.f_adjustDivPositionByPixel(thisObj.m_addButton, 0);
        thisObj.f_adjustDivPositionByPixel(thisObj.m_buttons, 20);
        thisObj.f_resize(20);
    }
    
    this.f_populateTable = function()
    {
        var a = ['http://www.facebook.com', 'http://www.vyatta.com', 'http://www.cisco.com', 'http://www.sun.com', 'http://www.juniper.net', ' '];
        
        for (var i = 0; i < a.length; i++) {
            var prefix = 'utm_conf_url_ez_by_url_';
            var addr = thisObj.f_renderTextField(prefix + 'addr_' + thisObj.m_cnt, a[i], '', 625);
            var cb = thisObj.f_renderCheckbox('no', prefix + 'cb_' + thisObj.m_cnt, '', '');
            var del = thisObj.f_renderButton('delete', true, "f_confUrlEzByUrlHandleDeleteCb('" +
            prefix +
            'addr_' +
            thisObj.m_cnt +
            "')", 'delete row');
            var data = [addr, cb, del];
            var bodyDiv = thisObj.f_createGridRow(thisObj.m_hdcolumns, data, 28);
            thisObj.m_body.appendChild(bodyDiv);
            thisObj.m_cnt++;
        }
        
        thisObj.f_adjust();
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

UTM_extend(UTM_confUrlEzByUrl, UTM_confBaseObjExt);


function f_confUrlEzByUrlHandleCancel(id)
{
    g_configPanelObj.m_activeObj.f_handleClick(id);
}

function f_confUrlEzByUrlHandleAdd(id)
{
    g_configPanelObj.m_activeObj.f_handleClick(id);
}

function f_confUrlEzByUrlHandleApply(id)
{
    g_configPanelObj.m_activeObj.f_handleClick(id);
}

function f_confUrlEzByUrlHandleBack(id)
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
