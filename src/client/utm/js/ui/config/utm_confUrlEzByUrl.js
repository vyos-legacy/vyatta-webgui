/*
 Document   : utm_confUrlEzByUrl.js
 Created on : Apr 01, 2009, 11:21:31 AM
 Author     : Loi.Vo
 Description:
 */
function UTM_confUrlEzByUrl(name, callback, busLayer)
{
    /**
     ***************************************************************************
     * id naming convention
     *    enable_all:     this.m_prefix + 'cb'
     *    rowId:          this.m_prefix + 'row_' + thisObj.m_cnt
     *    enable@row:     this.m_prefix + 'cb' + thisObj.m_cnt
     *    delete@row:     when clicked, get passed the rowId
     *    textfield@row:  this.m_prefix + 'addr_' + thisObj.m_cnt
     ****************************************************************************
     */
    var thisObj = this;
    this.thisObjName = 'UTM_confurlEzByUrl';
    
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
    
    this.f_initProperties = function()
    {
        this.m_prefix = 'utm_conf_url_ez_by_url_';
        this.m_btnCancelId = this.m_prefix + 'btn_cancel';
        this.m_btnApplyId = this.m_prefix + 'btn_apply';
        this.m_btnAddId = this.m_prefix + 'btn_add';
        this.m_btnBackId = this.m_prefix + 'btn_back';
        this.m_btnDeleteId = this.m_prefix + 'btn_delete';
        this.m_btnDeleteConfirmId = this.m_prefix + 'btn_delete_confirm';		
        this.m_btnSaveChangeAppyCbId = this.m_prefix + 'btn_apply_cb';
        this.m_btnSaveChangeCancelCbId = this.m_prefix + 'btn_cancel_cb';
        this.m_cbGroupId = this.m_prefix + 'cb_group';		
        this.m_textWidth = 625;
    }
    
    this.f_init = function()
    {
        this.f_initProperties();
        this.m_hdcolumns = this.f_createHdColumns();
		this.m_headerText = this.f_headerText();
		this.f_createTableHeader();
        this.m_body = this.f_createGridView(this.m_hdcolumns, true);
        
        var addBtn = [['AddInner', this.m_eventCbFunction + "('" + this.m_btnAddId + "')", g_lang.m_tooltip_add, this.m_btnAddId]];
        this.m_addButton = this.f_createInnerButtons(addBtn, '790px');
		        
        var btns = [['Back', this.m_eventCbFunction + "('" + this.m_btnBackId + "')", g_lang.m_tooltip_back, this.m_btnBackId, g_lang.m_imageDir + 'bt_back.png', 'left'], ['Apply', this.m_eventCbFunction + "('" + this.m_btnApplyId + "')", g_lang.m_tooltip_apply, this.m_btnApplyId, g_lang.m_imageDir + 'bt_apply.gif', 'right'], ['Cancel', this.m_eventCbFunction + "('" + this.m_btnCancelId + "')", g_lang.m_tooltip_cancel, this.m_btnCancelId, g_lang.m_imageDir + 'bt_cancel.gif', 'right']]
        this.m_buttons = this.f_createLRButtons(btns, '790px');
        
        return [this.f_headerText(), this.m_header, this.m_body, this.m_addButton, this.m_buttons];
    }
    
	this.f_createTableHeader = function()
	{
        this.m_header = this.f_createGridHeader(this.m_hdcolumns, 'f_confUrlEzByListGridHeaderOnclick');		
	}
	
    this.f_createHdColumns = function()
    {
        this.f_colorGridBackgroundRow(true);
        var cols = [];
        var chkbox = g_lang.m_enabled + '<br>' +
        thisObj.f_renderCheckbox('no', thisObj.m_prefix + 'enable_cb', this.m_eventCbFunction + "('" + thisObj.m_prefix + "enable_cb')", 'tooltip');
        
        cols[0] = this.f_createColumn(g_lang.m_url_ezWebSiteAddress, 650, 'textField', '10', true, 'center');
        cols[1] = this.f_createColumn(chkbox, 70, 'checkbox', '28');
        cols[2] = this.f_createColumn(g_lang.m_delete + '<br>', 70, 'image', '28');
        
        return cols;
    }
    
    this.f_setEntryList = function(entryList, cb)
    {
        g_busObj.f_setUrlList(entryList, cb);
    }
    
    this.f_getEntryList = function(cb)
    {
        g_busObj.f_getUrlList(cb);
    }
    
    this.f_getEntryListCb = function(evt)
    {
        if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
            if (evt.f_isError()) {
                g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);
                return;
            }
			thisObj.m_entryList = evt.m_value;
            thisObj.f_populateTable(thisObj.m_entryList);
			thisObj.f_setSortOnColPerformed(0,0);			
		    thisObj.f_addRow();
            window.setTimeout(function(){thisObj.f_adjust();}, 10);									
            //thisObj.f_adjust();			
        }
    }
    
    this.f_deleteRowCb = function(evt)
    {
		g_utils.f_stopWait();		
        if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
            if (evt.f_isError()) {
                g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);
                return;
            }
            var id = thisObj.m_prefix + 'row_' + thisObj.m_deletedRow;
            var row = document.getElementById(id);
            row.parentNode.removeChild(row);
            thisObj.f_rowIdArrayRemoveRow(id);
            thisObj.f_adjust();
        }
    }
    
    this.f_applyCb = function(evt)
    {
		g_utils.f_stopWait();
		
        if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
            if (evt.f_isError()) {
                g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);
                thisObj.m_goBack = false;
                return;
            } else {
                for (var i = 0; i < thisObj.m_addedRow.length; i++) {
                    var seedId = thisObj.m_addedRow[i];
					var rowId = thisObj.m_prefix + 'row_' + seedId; 
                    var cb = document.getElementById(thisObj.m_prefix + 'cb_' + seedId);
                    var cbHidden = document.getElementById(thisObj.m_prefix + 'cb_hidden_' + seedId);
                    var url = document.getElementById(thisObj.m_prefix + 'addr_' + seedId);
                    cbHidden.checked = cb.checked;					
                    url.readOnly = true;
					url.disabled = true;
					url.style.backgroundColor = '#EFEFEF';					
                }
                for (var i = 0; i < thisObj.m_updatedRow.length; i++) {
                    var seedId = thisObj.m_updatedRow[i];
					var rowId = thisObj.m_prefix + 'row_' + seedId; 
                    var cb = document.getElementById(thisObj.m_prefix + 'cb_' + seedId);
                    var cbHidden = document.getElementById(thisObj.m_prefix + 'cb_hidden_' + seedId);
                    cbHidden.checked = cb.checked;
                }
				thisObj.f_enableAllButton(false);
            }
        }
        if (thisObj.m_goBack) {
            g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_ID);
        }
    }
    
    this.f_loadVMData = function()
    {
        thisObj.f_cleanup();
        thisObj.f_getEntryList(thisObj.f_getEntryListCb);
		thisObj.f_enableAllButton(false);
    }
		
}

UTM_extend(UTM_confUrlEzByUrl, UTM_confUrlEzByList);



