/*
 Document   : utm_confUrlEzByUrl.js
 Created on : Apr 01, 2009, 11:21:31 AM
 Author     : Loi.Vo
 Description:
 */
function UTM_confUrlEzByKeyword(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'utm_confUrlEzByKeyword';
	this.m_prefix = 'conf_url_ez_by_keyword_';		
    this.m_body = undefined;
    this.m_row = 0;
    this.m_cnt = 0;
	this.m_kwList = null;
	this.m_deletedRow = null;
	this.m_addedRow = null;
	this.m_updatedRow = null;
	this.m_goBack = false;	
		
    this.m_btnCancelId = 'conf_url_ez_by_keyword_btn_cancel';
    this.m_btnApplyId = 'conf_url_ez_by_keyword_btn_apply';
    this.m_btnAddId = 'conf_url_ez_by_keyword_btn_add';
    this.m_btnBackId = 'conf_url_ez_by_keyword_btn_back';
    this.m_btnDeleteId = 'conf_url_ez_by_keyword_btn_delete';
	this.m_btnSaveChangeAppyCbId = 	'conf_url_ez_by_keyword_btn_apply_cb';
	this.m_btnSaveChangeCancelCbId = 'conf_url_ez_by_keyword_btn_cancel_cb';
    
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
        UTM_confUrlEzByKeyword.superclass.constructor(name, callback, busLayer);
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
        
        var addBtn = [['AddInner', "f_confUrlEzByKeywordEventCallback('" + this.m_btnAddId + "')", 'Tools tip for add', this.m_btnAddId]];
        this.m_addButton = this.f_createInnerButtons(addBtn, '560px');
        
        var btns = [['Back', "f_confUrlEzByKeywordEventCallback('" + this.m_btnBackId + "')", 'Tools tip for back', this.m_btnBackId, g_lang.m_imageDir + 'bt_back.png', 'left'], ['Apply', "f_confUrlEzByKeywordEventCallback('" + this.m_btnApplyId + "')", 'Tools tip for apply', this.m_btnApplyId, g_lang.m_imageDir + 'bt_apply.gif', 'right'], ['Cancel', "f_confUrlEzByKeywordEventCallback('" + this.m_btnCancelId + "')", 'Tools tip for cancel', this.m_btnCancelId, g_lang.m_imageDir + 'bt_cancel.gif', 'right']]
        this.m_buttons = this.f_createLRButtons(btns, '560px');
        
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
        thisObj.f_renderCheckbox('no', 'conf_url_ez_by_keyword_enable_cb', "f_confUrlEzByKeywordEventCallback('conf_url_ez_by_keyword_enable_cb')", 'tooltip');
        
        cols[0] = this.f_createColumn(g_lang.m_url_ezBannedKeywordInUrl + '<br>', 420, 'textField', '10', false, 'center');
        cols[1] = this.f_createColumn(chkbox, 70, 'checkbox', '28');
        cols[2] = this.f_createColumn(g_lang.m_delete + '<br>', 70, 'image', '28');
        
        return cols;
    }
    
    this.f_enableAll = function()
    {
        var cb = document.getElementById('conf_url_ez_by_keyword_enable_cb');
		
        var s = 'utm_conf_url_ez_by_keyword_cb_';
		for (var i=0; i < thisObj.m_cnt; i++) {
	        var el = document.getElementById(s + i);
			if (el != null) {
				el.checked = cb.checked;
			}		
		}			
    }
    
    this.f_adjust = function()
    {
        thisObj.m_body.style.height = '';
        thisObj.m_body.style.borderBottom = '';
        thisObj.f_adjustDivPositionByPixel(thisObj.m_addButton, 0);
        thisObj.f_adjustDivPositionByPixel(thisObj.m_buttons, 20);
        thisObj.f_resize(20);
    }
    
    this.f_addRow = function()
    {
        var prefix = thisObj.m_prefix;
		var rowId = prefix + 'row_' + thisObj.m_cnt;
		
        var addr = thisObj.f_renderTextField(prefix + 'addr_' + thisObj.m_cnt, '', '', 400);
        var cb = thisObj.f_renderSmartCheckbox('yes', prefix + 'cb_' + thisObj.m_cnt, '', '',
		                                   prefix + 'cb_hidden_' + thisObj.m_cnt);	
		
        var del = thisObj.f_renderButton('delete', true, "f_confUrlEzByKeywordEventCallback('" +
        thisObj.m_btnDeleteId +
        "','" +
        rowId +
        "')", 'delete row');
        var data = [addr, cb, del];
        var bodyDiv = thisObj.f_createGridRow(thisObj.m_hdcolumns, data, 28,  rowId);
        thisObj.m_body.appendChild(bodyDiv);
        thisObj.m_cnt++;
        
        thisObj.f_adjust();
    }
    
	this.f_deleteRow = function(rowId)
	{
		var prefix = thisObj.m_prefix + 'row_';
        var row = document.getElementById(rowId);
		
		if (row != null) {
			var id = rowId.substring(prefix.length, rowId.length);
			var text = document.getElementById(thisObj.m_prefix + 'addr_' + id);
			
			if (text.readOnly) {
			//need to send delete command to the server.
			    var kwList = new Array();
				var listObj = new UTM_urlFilterListObj(text.value);
				listObj.m_action = 'delete';
                listObj.m_status = true;				
				urlList.push(listObj);
				thisObj.m_deletedRow = row;
				
			    var cb = function(evt)
                {        
                    if (evt != undefined && evt.m_objName == 'UTM_eventObj') {            
                        if (evt.f_isError()) {                
                            g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);  
                            return;                    
                        }                
						thisObj.m_deletedRow.parentNode.removeChild(thisObj.m_deletedRow);    
                        thisObj.f_adjust();         
                    }                                 
                };      
		        g_busObj.f_setKeywordList(kwList, cb); 	
				return;
			} else {
				row.parentNode.removeChild(row);
			}
			thisObj.f_adjust();
		}		
	}
    
    this.f_apply = function()
    {
		//doing dumb iteration for now.
		var kwList = new Array();
		thisObj.m_addedRow = new Array();
		thisObj.m_updatedRow = new Array();
		
		for (var i = 0; i < thisObj.m_cnt; i++) {
			var text = document.getElementById(thisObj.m_prefix + 'addr_' + i);
			var cb = document.getElementById(thisObj.m_prefix + 'cb_' + i);
			var cbHidden = document.getElementById(thisObj.m_prefix + 'cb_hidden_' + i);
			
			if ((text != undefined) && (text != null)) {
				if (!text.readOnly) {
					if (text.value.trim().length <= 0) {
						continue;
					}
					thisObj.m_addedRow.push(i);
					
					var listObj = new UTM_urlFilterListObj(text.value);
					listObj.m_action = 'add';
					if (cb.checked) {
						listObj.m_status = true;
					} else {
						listObj.m_status = false;
					}
					kwList.push(listObj);
				} else {
					if (cb.checked != cbHidden.checked) {
					    var listObj = new UTM_urlFilterListObj(text.value);
						listObj.m_action = 'delete';
						listObj.m_status = true;
						kwList.push(listObj);
						listObj = new UTM_urlFilterListObj(text.value);
						listObj.m_action = 'add';
						if (cb.checked) {
							listObj.m_status = true;
						} else {
							listObj.m_status = false;
						}
						kwList.push(listObj);
						thisObj.m_updatedRow.push(i);	
					}
				}
			}
		}
		
		if (kwList.length > 0) {
			var cb = function(evt)
			{
				if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
					if (evt.f_isError()) {
						g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);
						thisObj.m_goBack = false;
						return;
					} else {
						for (var i=0; i < thisObj.m_addedRow.length; i++) {
							var j = thisObj.m_addedRow[i];
			                var cb = document.getElementById(thisObj.m_prefix + 'cb_' + j);
			                var cbHidden = document.getElementById(thisObj.m_prefix + 'cb_hidden_' + j);
							var text = document.getElementById(thisObj.m_prefix + 'addr_' + j);
							cbHidden.checked = cb.checked;								
							text.readOnly = true;
						}
						for (var i=0; i < thisObj.m_updatedRow.length; i++) {
                            var j = thisObj.m_updatedRow[i];							
			                var cb = document.getElementById(thisObj.m_prefix + 'cb_' + j);
			                var cbHidden = document.getElementById(thisObj.m_prefix + 'cb_hidden_' + j);
							cbHidden.checked = cb.checked;							
						}
					}
				}
				if (thisObj.m_goBack) {
			        g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_ID);					
				}
			};
			g_busObj.f_setKeywordList(kwList, cb);
		}
    }
    
    this.f_reset = function()
    {
        alert('reset form');
    }
    
	
	this.f_changed = function()
	{
		var changed = false;
		
		for (var i = 0; i < thisObj.m_cnt; i++) {
			var text = document.getElementById(thisObj.m_prefix + 'addr_' + i);
			var cb = document.getElementById(thisObj.m_prefix + 'cb_' + i);
			var cbHidden = document.getElementById(thisObj.m_prefix + 'cb_hidden_' + i);
			
			if ((text != undefined) && (text != null)) {
				if (!text.readOnly) {
					if (text.value.trim().length > 0) {
						changed = true;
						return changed;
					}
				} else {
					if (cb.checked != cbHidden.checked) {
						changed = true;
						return changed;
					}
				}
			}
		}
        return false;		
	}
	
	this.f_back = function()
	{
		if (thisObj.f_changed()) {
			g_utils.f_popupMessage(g_lang.m_remindSaveChange, 'confirm', g_lang.m_info, true, 
			    "f_confUrlEzByKeywordEventCallback('" + thisObj.m_btnSaveChangeAppyCbId + "')", 
				"f_confUrlEzByKeywordEventCallback('" + thisObj.m_btnSaveChangeCancelCbId + "')"); 
		} else {
			g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_ID);
		}  		
	}	
	
    this.f_handleClick = function(id, obj)
    {
        if (id == thisObj.m_btnCancelId) {
            thisObj.f_reset();
        } else if (id == thisObj.m_btnApplyId) {
            thisObj.f_apply();
        } else if (id == thisObj.m_btnAddId) {
            thisObj.f_addRow();
        } else if (id == thisObj.m_btnBackId) {
            thisObj.f_back(); 
        } else if (id == 'conf_url_ez_by_keyword_enable_cb') {
            thisObj.f_enableAll();
        } else if (id == thisObj.m_btnDeleteId) {
            thisObj.f_deleteRow(obj);
        } else if (id == thisObj.m_btnSaveChangeAppyCbId) {
		    thisObj.m_goBack = true;			
		    thisObj.f_apply();				
		} else if (id == thisObj.m_btnSaveChangeCancelCbId) {
		    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_ID);								
		}
    }
    
    this.f_loadVMData = function()
    {
        var cb = function(evt)
        {        
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {            
                if (evt.f_isError()) {                
                    g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);  
                    return;                    
                }                
                thisObj.m_kwList = evt.m_value;    
                thisObj.f_populateTable();           
            }                                 
        };      

		g_busObj.f_getKeywordList(cb);
    }
    
    this.f_getTableHeight = function()
    {
        var h = thisObj.m_tableRowCounter * 28;
        return h;
    }
        
    this.f_adjust = function()
    {
        thisObj.m_body.style.height = '';
		thisObj.m_body.style.borderBottom = '';
        thisObj.f_adjustDivPositionByPixel(thisObj.m_addButton, 0);
        thisObj.f_adjustDivPositionByPixel(thisObj.m_buttons, 20);
        thisObj.f_resize(20);
    }	
	
    this.f_populateTable = function()
    {
        var a = thisObj.m_kwList;		

        for (var i = 0; i < a.length; i++) {
            var prefix = thisObj.m_prefix;
		    var rowId = prefix + "row_" + thisObj.m_cnt;
			var enable = 'yes';
			if (!a[i].m_status) {
				enable = 'no';
			}				
				
            var addr = thisObj.f_renderTextField(prefix + 'addr_' + thisObj.m_cnt, a[i].m_value, '', 400, '', true);
			var cb = thisObj.f_renderSmartCheckbox(enable, prefix + 'cb_' + thisObj.m_cnt, '', '',
				                                       prefix + 'cb_hidden_' + thisObj.m_cnt);			
            var del = thisObj.f_renderButton('delete', true, "f_confUrlEzByKeywordEventCallback('" +
            thisObj.m_btnDeleteId +
            "','" +
            rowId +
            "')", 'delete row');
            var data = [addr, cb, del];
            var bodyDiv = thisObj.f_createGridRow(thisObj.m_hdcolumns, data, 28, rowId);
            thisObj.m_body.appendChild(bodyDiv);
            thisObj.m_cnt++;
        }
		thisObj.f_addRow();		
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

UTM_extend(UTM_confUrlEzByKeyword, UTM_confBaseObjExt);

function f_confUrlEzByKeywordEventCallback(id, obj)
{
    g_configPanelObj.m_activeObj.f_handleClick(id, obj);
}

