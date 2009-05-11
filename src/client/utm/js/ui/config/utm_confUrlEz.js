/*
 Document   : utm_confUrlEz.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function UTM_confUrlEz(name, callback, busLayer)
{
    var thisObjName = 'UTM_confVpnEz';
    var thisObj = this;
    this.m_form = undefined;
    this.m_url = undefined;
    
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
        UTM_confUrlEz.superclass.constructor(name, callback, busLayer);
    }
		
    this.privateConstructor(name, callback, busLayer);	
	
    this.f_init = function()
    {
        this.f_setConfig({
            id: 'conf_url_ez', 
			width: '500',
            items: [{
                v_type: 'label',
                text: g_lang.m_url_ezFilterPolicy,
                v_new_row: 'true',
                v_end_row: 'true'
            },  EMPTY_ROW
			, {
                v_type: 'html',
                id: 'conf_url_ez_by_cat',
                text: '<input id="conf_url_ez_by_cat" type="radio" name="filter_by" value="cat" checked>&nbsp;' + g_lang.m_url_ezByCat,
				padding: '30px',
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_legal',
                padding: '60px',
                text: '<input id="conf_url_ez_legal" type="radio" name="filter_by_cat" value="legal" checked>&nbsp;' + g_lang.m_url_ezLegal,
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_prof',
                padding: '60px',
                text: '<input id="conf_url_ez_prof" type="radio" name="filter_by_cat" value="prof">&nbsp;' + g_lang.m_url_ezProf,
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_strict',
                padding: '60px',				
                text: '<input id="conf_url_ez_strict" type="radio" name="filter_by_cat" value="strict">&nbsp;' + g_lang.m_url_ezStrict,
                v_new_row: 'true',
                v_end_row: 'true'
            },  EMPTY_ROW
			, {
                v_type: 'html',
                id: 'conf_url_ez_by_url',
                text: '<input id="conf_url_ez_by_url" type="radio" name="filter_by" value="url">&nbsp;' + g_lang.m_url_ezByUrl,
				padding: '30px',
                v_new_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_by_url_config',
                text: '<input type="image" id="conf_url_ez_by_url_config" src="' + g_lang.m_imageDir + 'bt_config.png">',
                v_end_row: 'true'
            },  EMPTY_ROW
			, {
                v_type: 'html',
                id: 'conf_url_ez_by_word',
                text: '<input id="conf_url_ez_by_word" type="radio" name="filter_by" value="url">&nbsp;' + g_lang.m_url_ezByWord,
				padding: '30px',
                v_new_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_by_word_config',
                text: '<input type="image" id="conf_url_ez_by_word_config" src="' + g_lang.m_imageDir + 'bt_config.png">',
                v_end_row: 'true'
            }, EMPTY_ROW
			, {
                v_type: 'label',
                text: g_lang.m_url_ezFilterPolicyImp,
                v_new_row: 'true',
                v_end_row: 'true'
            }, EMPTY_ROW
			, {
                v_type: 'html',
                text: '<div><table id="conf_url_ez_time_table" cellpadding= "0" cellspacing="0"><tbody id="conf_url_ez_time_table_body"><tr>' +
                '<td align="center" class="maintd_bold">' +
                g_lang.m_url_ezDay +
                '</td>' +
                '<td align="center" class="maintd_bold">' +
                g_lang.m_url_ezTime +
                '</td>' +
                '<td align="center" class="maintd_bold"><br/>' +
                g_lang.m_url_ezAlways +
                '<br/>' +
                g_lang.m_url_ezOn +
                '</td>' +
                '<td align="center" class="maintd_bold"><br/>' +
                g_lang.m_url_ezAlways +
                '<br/>' +
                g_lang.m_url_ezOff +
                '</td>' +
                '</tr></tbody></table></div>',
                v_new_row: 'true',
                v_end_row: 'true',
                colspan: 3
            }],
            buttons: [{
                id: 'conf_ldap_server_apply_button',
                align: 'right',
                text: 'Apply',
                onclick: this.f_handleClick
            }, {
                id: 'conf_ldap_server_cancel_button',
                align: 'right',
                text: 'Cancel',
                onclick: this.f_handleClick
            }]
        })
    }
    
    this.f_getConfigurationPage = function()
    {
        var children = new Array();
        children.push(this.f_createHeader());
        children.push(this.f_getForm());
        
        return this.f_getPage(children);
    }
    
    this.f_createHeader = function()
    {
        var txt = 'Lorem ipsum onsectetuer adipiscing elit, sed diam ' +
        'nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam ' +
        'erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci ' +
        'tation ullamcorper suscipit lobortis nisl ut aliquip ex ea ' +
        'commodo consequat.<br><br>';
        
        return this.f_createGeneralDiv(txt);
    }
    
    this.f_initFilterPolicyImp = function()
    {
        var days = g_lang.m_url_ezDayArray;
        for (var i = 0; i < days.length; i++) {
            thisObj.f_addRow(i, days[i]);
        }
    }
    
    this.f_addRow = function(row, text)
    {
        var el = document.getElementById('conf_url_ez_time_table_body');
        var tr = document.createElement('tr');
        tr.appendChild(thisObj.f_createDayOfWeek(row, text));
        tr.appendChild(thisObj.f_createTimeTable(row, text));
        tr.appendChild(thisObj.f_createAlwaysOn(row, text));
        tr.appendChild(thisObj.f_createAlwaysOff(row, text));
        el.appendChild(tr);
    }
    
    this.f_createDayOfWeek = function(row, text)
    {
        var td = document.createElement('td');
        td.id = 'day' + row;
        td.className = 'maintd_bold';
        td.setAttribute('align', 'center');
        td.innerHTML = text;
        return td;
    }
    
    this.f_createTimeTable = function(row, text)
    {
        var td = document.createElement('td');
        td.className = 'maintd';
        td.setAttribute('align', 'center');
        td.appendChild(thisObj.f_createTimeTableDiv(row, text));
        return td;
    }
    
    this.f_createTimeTableDiv = function(row, text)
    {
        var div = document.createElement('div');
        div.className = 'date_row';
        var innerHTML = '<table cellpadding="0" cellspacing="1" align="center" border="0"><tr>';
        for (var i = 0; i < 24; i++) {
            var tdId = 'time_td' + row + '.' + i;
            innerHTML += '<td id="' + tdId + '" class="cell" valign="bottom">';
            if (i < 10) {
                innerHTML += '&nbsp;';
            }
            var id = 'img' + row + '.' + i;
            innerHTML += i + '<img id="' + id + '" onclick=f_checkImage(\'' + id + '\')' +
            ' src="' + g_lang.m_imageDir + 'green10x10.png">';
            innerHTML += '<input style="display:none" type="checkbox" id="cb' + row + '.' + i + '" checked>' + '</td>';
        }
        innerHTML += '</tr></table>';
        div.innerHTML = innerHTML;
        return div;
    }
    
    this.f_createAlwaysOn = function(row, text)
    {
        var td = document.createElement('td');
        td.className = 'maintd';
        td.setAttribute('align', 'center');
        var id = 'on_img' + row;
        var innerHTML = '<img id="' + id + '" onclick=f_checkImage(\'' + id + '\') src="' + g_lang.m_imageDir + 'blank14x14.png">';
        innerHTML += '<input style="display:none" type="checkbox" id="on_img_cb' + row + '">' + '</td>';
        td.innerHTML = innerHTML;
        return td;
    }
    
    this.f_createAlwaysOff = function(row, text)
    {
        var td = document.createElement('td');
        td.className = 'maintd';
        var id = 'off_img' + row;
        td.setAttribute('align', 'center');
        var innerHTML = '<img id="' + id + '" onclick=f_checkImage(\'' + id + '\') src="' + g_lang.m_imageDir + 'blank14x14.png">';
        innerHTML += '<input style="display:none" type="checkbox" id="off_img_cb' + row + '">' + '</td>';
        td.innerHTML = innerHTML;
        return td;
    }
    
    this.f_enableTimeBackground = function(row, enable)
    {
        var tdId = 'time_td' + row + '.';
        for (var i = 0; i < 24; i++) {
            var id = tdId + i;
            var td = document.getElementById(id);
            if (enable) {
                td.bgColor = '#FFFFFF';
            } else {
                td.bgColor = '#A9A9A9';
            }
        }
    }
    
    this.f_enableTime = function(row, enable)
    {
        var imgId = 'img' + row + '.';
        var cbId = 'cb' + row + '.';
        
        for (var i = 0; i < 24; i++) {
            var id = imgId + i;
            var img = document.getElementById(id);
            id = cbId + i;
            var cb = document.getElementById(id);
            
            if (enable) {
                img.src = g_lang.m_imageDir + 'green10x10.png';
                cb.checked = 'checked';
            } else {
                img.src = g_lang.m_imageDir + 'red10x10.png';
                cb.checked = '';
            }
        }
    }
    
    this.f_disableAlwaysOn = function(row)
    {
        var cb = document.getElementById('on_img_cb' + row);
        var img = document.getElementById('on_img' + row);
        if (cb.checked) {
            cb.checked = '';
            img.src = g_lang.m_imageDir + 'blank14x14.png';
        }
    }
    
    this.f_disableAlwaysOff = function(row)
    {
        var cb = document.getElementById('off_img_cb' + row);
        var img = document.getElementById('off_img' + row);
        if (cb.checked) {
            cb.checked = '';
            img.src = g_lang.m_imageDir + 'blank14x14.png';
        }
    }
    
    this.f_readOnly = function(row)
    {
        var cbOn = document.getElementById('on_img_cb' + row);
        if (cbOn.checked) {
            return true;
        }
        var cbOff = document.getElementById('off_img_cb' + row);
        if (cbOff.checked) {
            return true;
        }
        return false;
    }
    
    this.f_toggleImage = function(id)
    {
        if (id.indexOf('on_img') > -1) {
            var index = id.substring(6, id.length);
            var cb = document.getElementById('on_img_cb' + index);
            var img = document.getElementById(id);
            if (cb.checked) {
                cb.checked = '';
                img.src = g_lang.m_imageDir + 'blank14x14.png';
                thisObj.f_enableTimeBackground(index, true);
            } else {
                cb.checked = 'checked';
                img.src = g_lang.m_imageDir + 'green14x14.png';
                thisObj.f_disableAlwaysOff(index);
                thisObj.f_enableTimeBackground(index, false);
                thisObj.f_enableTime(index, true);
            }
        } else if (id.indexOf('off_img') > -1) {
            var index = id.substring(7, id.length);
            var cb = document.getElementById('off_img_cb' + index);
            var img = document.getElementById(id);
            if (cb.checked) {
                cb.checked = '';
                img.src = g_lang.m_imageDir + 'blank14x14.png';
                thisObj.f_enableTimeBackground(index, true);
            } else {
                cb.checked = 'checked';
                img.src = g_lang.m_imageDir + 'red14x14.png';
                thisObj.f_disableAlwaysOn(index);
                thisObj.f_enableTimeBackground(index, false);
                thisObj.f_enableTime(index, false);
            }
        } else {
            var index = id.substring(3, id.length);
            if (thisObj.f_readOnly(index.substring(0, 1))) {
                return;
            }
            var cb = document.getElementById('cb' + index);
            var img = document.getElementById(id);
            if (cb.checked) {
                cb.checked = '';
                img.src = g_lang.m_imageDir + "red10x10.png";
            } else {
                cb.checked = 'checked';
                img.src = g_lang.m_imageDir + "green10x10.png";
            }
        }
    }

    this.f_loadVMData = function(element)
    {
        thisObj.f_initFilterPolicyImp();
        thisObj.m_form = document.getElementById('conf_url_ez_form');
        thisObj.f_setFocus();
        thisObj.f_attachListener();
		thisObj.f_reflow();
		g_utmMainPanel.f_requestResize(60);		
    }
    
    this.f_attachListener = function()
    {
        var el = document.getElementById('conf_url_ez_by_url_config');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
        el = document.getElementById('conf_url_ez_by_word_config');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
    }
    
    this.f_detachListener = function()
    {
        var el = document.getElementById('conf_url_ez_by_url_config');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
        el = document.getElementById('conf_url_ez_by_word_config');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
    }
    
    
    this.f_setFocus = function()
    {
    
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_validate = function()
    {
        return true;
    }
    
    this.f_apply = function()
    {
        alert('apply');
    }
    
    this.f_reset = function()
    {
        alert('reset');
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            return thisObj.f_handleClickById(id);
        }
    }
	
	this.f_handleClickById = function(id)
	{
		switch(id) {
			case 'conf_url_ez_by_url_config':
			    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_BY_URL_ID);
				break;
			case 'conf_url_ez_by_word_config':
			    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_BY_WORD_ID);
				break;
            case 'conf_url_ez_apply_button':  //apply clicked
                if (!thisObj.f_validate()) {
                    return false;
                }
                thisObj.f_apply();
				break;
            case 'conf_url_ez_cancel_button': //cancel clicked
                thisObj.f_reset();
				break;			
		}
		return false;
	}
    
}

UTM_extend(UTM_confUrlEz, UTM_confFormObj);

function f_checkImage(id)
{		
    g_configPanelObj.m_activeObj.f_toggleImage(id);
}

