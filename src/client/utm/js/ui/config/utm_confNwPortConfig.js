/*
 Document   : utm_confNwPortConfig.js
 Created on : Apr 01, 2009, 11:21:31 AM
 Author     : Loi.Vo
 Description:
 */
function UTM_confNwPortConfig(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'UTM_confNwPortConfig';
    this.m_hdcolumns = undefined;	
	this.m_headerText = undefined;
	this.m_header = undefined;
    this.m_buttons = undefined;	
    this.m_body = undefined;
	this.m_portConfig = undefined;
	
	this.m_prefix = 'conf_port_config_';			
    this.m_btnCancelId = this.m_prefix + 'btn_cancel';
    this.m_btnApplyId = this.m_prefix + 'btn_apply';
	this.m_eventCbFunction = 'f_confPortConfigEventCallback';
	this.m_change = false;

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
        UTM_confNwPortConfig.superclass.constructor(name, callback, busLayer);
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
		this.m_headerText = this.f_headerText();
		this.f_createTableHeader();
        this.m_body = this.f_createGridView(this.m_hdcolumns, true);
        
        var btns = [
                      ['Apply', this.m_eventCbFunction + "('" + this.m_btnApplyId + "')", g_lang.m_tooltip_apply, this.m_btnApplyId, g_lang.m_imageDir + 'bt_apply.gif'],		           
		              ['Cancel', this.m_eventCbFunction + "('" + this.m_btnCancelId + "')", g_lang.m_tooltip_cancel, this.m_btnCancelId, g_lang.m_imageDir + 'bt_cancel.gif'] 
				   ];
		            
        //this.m_buttons = this.f_createButtons(btns, 'center');
		this.m_buttons = this.f_createCenterButtons(btns, '650px');
        
        return [this.m_headerText, this.m_header, this.m_body,this.m_buttons];
    }
	
	this.f_createTableHeader = function()
	{
        this.m_header = this.f_createGridHeader(this.m_hdcolumns, '');		
	}

    this.f_createHdColumns = function()
    {
        this.f_colorGridBackgroundRow(true);
        var cols = [];
        var chkbox = g_lang.m_enabled;
        
        cols[0] = this.f_createColumn('', 80, 'image', '28');
		cols[1] = this.f_createColumn(g_lang.m_portconf_port, 100, 'text','10', false, 'left');
        cols[2] = this.f_createColumn(g_lang.m_portconf_LAN + 
		                              ' ' + g_lang.m_portconf_interface, 100, 'radio', '28');
        cols[3] = this.f_createColumn(g_lang.m_portconf_LAN2 + ' ' +
		                              g_lang.m_portconf_interface, 100, 'radio', '28');
		cols[4] = this.f_createColumn(g_lang.m_portconf_DMZ + ' ' +
		                              g_lang.m_portconf_interface, 100, 'radio', '28');
        cols[5] = this.f_createColumn(g_lang.m_portconf_WAN + ' ' +
		                              g_lang.m_portconf_interface, 100, 'radio', '28');						
        cols[6] = this.f_createColumn(g_lang.m_enabled + '<br>', 70, 'checkbox', '28');
        
        return cols;
    }	
	
    this.f_headerText = function()
    {
		var html = '<br/>';
		html += '<h1 align="center"><img src="images/port_config.png"></h1><br/><br/><br/><span class="v_label_bold"><p>' + g_lang.m_portconf_attach
		        + '</p></span><br/>';
		
        return this.f_createHtmlDiv(html, '650px');
    }	
	
	this.f_setPortConfig = function(portList, cb)
	{
		g_busObj.f_setPortConfig(portList, cb); 	
	}
	
	this.f_getPortConfig = function(cb)
	{
		g_busObj.f_getPortConfig(cb);
	}		
	
    this.f_loadVMData = function()
    {		
	    thisObj.f_cleanup();
		
        var cb = function(evt)
        {        
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {            
                if (evt.f_isError()) {                
                    g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);  
                    return;                    
                }                
                thisObj.m_portConfig = evt.m_value;    
                thisObj.f_populateTable(thisObj.m_portConfig);     	
				window.setTimeout(function(){thisObj.f_adjust();}, 10);
                //thisObj.f_adjust();	
            }                                 
        };      
        this.f_getPortConfig(cb);
		this.f_enableAllButton(false);
    }	
	
	this.f_sort = function(a,b)
	{
		var ap = a.m_num.trim();
		var bp = b.m_num.trim();

        return ap.cmp(bp);
	}	
	
	this.f_getImgSrc = function(portNum)
	{
		switch (portNum) {
			case '1':
			    return 'images/1.gif';
			case '2':
			    return 'images/2.gif';
			case '3':
			    return 'images/3.gif';
			case '4':
			    return 'images/4.gif';
			case '5':
			    return 'images/5.gif';
			default:
				return '';
		}
	}
	
	this.f_compareGroup = function(group1, group2)
	{
		var g1 = group1.toLowerCase();
		var g2 = group2.toLowerCase();
		if (g1 == g2) {
			return 'yes';
		}
		return 'no';
	}
	
    this.f_populateTable = function(portConfigObj)
    {
		var groupList = portConfigObj.m_groupList;
		var portList = portConfigObj.m_portList;
		portList.sort(thisObj.f_sort);
		
		for (var i=0; i < portList.length; i++) {
			var pnum = thisObj.f_renderImage(thisObj.f_getImgSrc(portList[i].m_num), '', '');
            var pname = portList[i].m_name;
			var rId = thisObj.m_prefix + 'radio_' + portList[i].m_num;
			
			var lan = thisObj.f_renderRadio(
			              thisObj.f_compareGroup('lan',portList[i].m_group), 
						  thisObj.m_prefix + 'lan_' + portList[i].m_num,
						  '', rId, '', true						  
			          );
			var lan2 = thisObj.f_renderRadio(
			              thisObj.f_compareGroup('lan2',portList[i].m_group), 
						  thisObj.m_prefix + 'lan2_' + portList[i].m_num,
						  '', rId, '', true						  
			          );
			var dmz = thisObj.f_renderRadio(
			              thisObj.f_compareGroup('dmz',portList[i].m_group), 
						  thisObj.m_prefix + 'dmz_' + portList[i].m_num,
						  '', rId, '', true						  
			          );
			var wan = thisObj.f_renderRadio(
			              thisObj.f_compareGroup('wan',portList[i].m_group), 
						  thisObj.m_prefix + 'wan_' + portList[i].m_num,
						  '', rId, '', true					  
			          );
			var en = (portList[i].m_enable=='true')? 'yes' : 'no';
			var enHidden = (portList[i].m_enable=='true')? 'checked' : '';
			var cbId = thisObj.m_prefix + 'cb_' + portList[i].m_num;
			var ro = false;
			if (portList[i].m_group.toLowerCase() == 'wan') {
				ro = true;
			}
			var cbHiddenArray = [ {id: cbId + '_hidden', value: enHidden} ];
			var enable = thisObj.f_renderSmartCheckbox(en, 
						  cbId,
						  "f_confPortConfigEventCallback('" + cbId + "')" , '', ro, cbHiddenArray						  
			          );				
		    var data = [pnum, pname, lan, lan2, dmz, wan, enable];
			var bodyDiv = thisObj.f_createGridRow(thisObj.m_hdcolumns, data, 28);
			//alert('row:' + bodyDiv.innerHTML);
			thisObj.m_body.appendChild(bodyDiv);					
		}
		thisObj.f_showLanMenu(portList);
    }	
	
    this.f_stopLoadVMData = function()
    {
    }	

    this.f_enableAllButton = function(state) 
	{
		thisObj.f_enabledDisableButton(thisObj.m_btnApplyId, state);
		thisObj.f_enabledDisableButton(thisObj.m_btnCancelId, state);
		thisObj.f_enabledDisableButton(thisObj.m_btnResetId, state);
		if (state) {
			thisObj.m_change = true;
		} else {
			thisObj.m_change = false;
		}
	}	
	
	this.f_cleanup = function()
	{		
        this.f_removeDivChildren(this.m_div);
		this.f_removeDivChildren(this.m_body);
        this.f_removeDivChildren(this.m_header);
		this.f_createTableHeader();
		this.m_div.appendChild(this.m_headerText);
        this.m_div.appendChild(this.m_header);
        this.m_div.appendChild(this.m_body);
        this.m_div.appendChild(this.m_buttons);			
	}
	
    this.f_getTableHeight = function()
    {
        var h = this.m_tableRowCounter * 28;
        return h;
    }
    
    this.f_adjust = function()
    {
        this.m_body.style.height = '';
		this.m_body.style.borderBottom = '';
        this.f_adjustDivPositionByPixel(this.m_buttons, 20);
        this.f_resize(20);
    }	
	
    this.f_handleClick = function(id, obj)
    {
        if (id == thisObj.m_btnCancelId) {
            thisObj.f_loadVMData();
        } else if (id == thisObj.m_btnApplyId) {
            thisObj.f_apply();
        } else { //assume checkbox clicked
			thisObj.f_enableAllButton(true);
		}
    }	
	
	this.f_validate = function() 
	{
		var portList = thisObj.m_portConfig.m_portList;
		var lanId = '';
		var lan2Id = '';
		
		for (var i=0; i < portList.length; i++) {
			var grp = portList[i].m_group.toLowerCase();
			if (grp == 'lan') {
				lanId = thisObj.m_prefix + 'cb_' + portList[i].m_num;				
			} else if (grp == 'lan2') {
				lan2Id = thisObj.m_prefix + 'cb_' + portList[i].m_num;
			}
		}
		var cbLan = document.getElementById(lanId);
		var cbLan2 = document.getElementById(lan2Id);
		if ((cbLan != null) && (cbLan2 != null)) {
			if ((!cbLan.checked) && (!cbLan2.checked)) {				
		        var error = g_lang.m_portconf_lan_lan2_no_disabled;
			    g_utils.f_popupMessage(error, 'error', g_lang.m_error,true);								
				return false;
			} 
		}
		return true;
	}
	
	this.f_showLanMenu = function(portList)
	{
        for (var i = 0; i < portList.length; i++) {
		    var grp = portList[i].m_group.toLowerCase();

            if (grp != 'wan') {
                var id = thisObj.m_prefix + 'cb_' + portList[i].m_num;
                var cb = document.getElementById(id);
			    //now we need to show/hide the corresponding menu.
			    if ((grp == 'lan') || (grp == 'lan2') || (grp == 'dmz')) {
			        var menuId = grp + '_l2';
				    var menu = document.getElementById(menuId);
				    if ((cb != null) && (menu != null)) {
					    if (cb.checked) {
						    menu.style.display = '';	
						} else {
							menu.style.display = 'none';
						}
					}
				} 
            }
        }		
	}
	
	this.f_apply = function()
	{
		if (!thisObj.f_validate()) {
			return;
		}
		g_utils.f_startWait();
		var pl = new Array();
		var portList = thisObj.m_portConfig.m_portList;
		for (var i=0; i < portList.length; i++) {
			if (portList[i].m_group.toLowerCase()!= 'wan') {
				var id = thisObj.m_prefix + 'cb_' + portList[i].m_num;
				var cb = document.getElementById(id);
				var cbHidden = document.getElementById(id + '_hidden');
				if ((cb != null) && (cbHidden != null)) {
					if (cb.checked) {
						portList[i].m_enable = true;
					} else {
						portList[i].m_enable = false;
					}
					if (cb.checked != cbHidden.checked) {
						pl.push(portList[i]);
					}
				}
			}
		}
        var cb = function(evt)
        {        
		    g_utils.f_stopWait();
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {            
                if (evt.f_isError()) {                
                    g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);  
                    return;                    
                }        
				var portList = thisObj.m_portConfig.m_portList;
				
                for (var i = 0; i < portList.length; i++) {
					var grp = portList[i].m_group.toLowerCase();

                    if (grp != 'wan') {
                        var id = thisObj.m_prefix + 'cb_' + portList[i].m_num;
                        var cb = document.getElementById(id);
                        var cbHidden = document.getElementById(id + '_hidden');
                        if ((cb != null) && (cbHidden != null)) {
                            cbHidden.checked = cb.checked;
                        } 
                    }
                }
				thisObj.f_showLanMenu(portList);
                thisObj.f_enableAllButton(false);	
            }                                 
        };      
        this.f_setPortConfig(pl,cb);
	}
	
	this.f_changed = function() 
	{
		return thisObj.m_change;
	}
}

UTM_extend(UTM_confNwPortConfig, UTM_confBaseObjExt);

function f_confPortConfigEventCallback(id, obj)
{
    g_configPanelObj.m_activeObj.f_handleClick(id, obj);
}