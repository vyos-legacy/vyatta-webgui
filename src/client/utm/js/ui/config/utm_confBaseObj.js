/*
 Document   : utm_confBaseObj.js
 Created on : Apr 01, 2009, 11:21:31 AM
 Author     : Kevin.Choi
 Description:
 */
function UTM_confBaseObj(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'UTM_confBaseObj';
    this.m_colorGridRow = false;
    this.m_id = undefined;
	
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer
     */
    this.constructor = function(name, callback, busLayer)
    {
        this.privateConstructor(name, callback, busLayer);
    }
    
    this.privateConstructor = function(name, callback, busLayer)
    {
        this.m_busLayer = busLayer;
        this.m_name = name;
        this.m_containerCb = callback;
        this.m_treadId = null;
    }
    this.privateConstructor(name, callback, busLayer);
    
    /**
     * call this function when this object is no longer used. it will
     * do all the clean up and stop the thread.
     */
    this.f_distructor = function()
    {
        if (this.m_treadId != null) {
            this.m_busLayer.f_stopVMRequestThread(this.m_treadId);
            this.m_threadId = null;
        }
    }
    
    this.f_setId = function(id) {
		this.m_id = id;
	}
		
    this.f_getPanelDiv = function(children)
    {
        var div = document.createElement('div');
        div.setAttribute('id', 'utm_confpanel_');
        div.setAttribute('align', 'left');
        
        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '300px';
        div.style.overflow = 'visible';
        div.style.fontFamily = 'Arial, sans-serif';
        
        document.getElementById('ft_container').appendChild(div);
        
        for (var i = 0; i < children.length; i++) 
            div.appendChild(children[i]);
        
        this.m_div = div;
        return this.m_div;
    }
    
    this.f_createGridHeader = function(header, onclick)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.border = '1px solid #CCC';
        div.style.backgroundColor = '#EFEFEF';
        div.style.color = '#000';
        div.style.overflow = 'visible';
        
        var width = 0;
        var inner = "";
        for (var i = 0; i < header.length; i++) {
            var h = header[i];
            width += h[1]
            var cursor = ' ';
            var tooltip = '';
            if (h[4] != undefined && h[4]) {
                tooltip = 'title="' + g_lang.m_tableTooltip1 + '" ';
                cursor = 'cursor:pointer; ';
            }
            
            var align = h[5] == undefined ? 'center' : h[5];
            var pLeft = align == "center" ? 0 : h[3];
            
            var colName = thisObj.f_createColNameHTML(h[0], i, h[5]);
            var rBorder = (i == header.length-1) || h[0].length < 2 ?
                              '' : 'border-right:1px solid #CCC; ';

            inner += '<td width="' + h[1] + '" align="' + align + 
                '" valign="top" style="' + rBorder + '">' +
                '<div style="padding-top:5px; padding-bottom:5px; ' +
                'padding-left:' + pLeft + 'px; ' +
                cursor + '" onclick="' + onclick + '(' + i + ')" ' +
                tooltip + '>' + colName + '</div></td>';
        }
        
        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">' +
                      '<thead><tr>' + inner +
                      '</tr></thead></table>';

        div.style.width = width + 'px';
        div.innerHTML = innerHtml;
        
        return div;
    }
    
    this.f_createGridView = function(header, isBorder)
    {
        thisObj.m_tableRowCounter = 0;
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '50px';
        div.style.overflow = 'visible';
        
        if (isBorder == undefined || isBorder) 
            div.style.border = '1px solid #CCC';
        else div.style.border = '0px solid #CCC';
        
        div.style.color = '#000';
        
        var width = 0;
        for (var i = 0; i < header.length; i++) {
            var h = header[i];
            width += h[1]
        }
        
        div.style.width = (width) + 'px';
        return div;
    };

    this.f_colorGridBackgroundRow = function(isColor)
    {
        thisObj.m_colorGridRow = isColor;
    };

    
    this.f_createGridRow = function(header, data, height)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.borderBottom = '1px dotted #CCC';
        div.style.backgroundColor = 'white';
        div.style.paddingTop = '0px';
        div.style.paddingBottom = '0px';
        
        var rHeight = height == undefined ? 28 : height;

        var bkc = thisObj.m_tableRowCounter%2 == 0 || !thisObj.m_colorGridRow ?
                  "#FFFFFF" : "#F9F9FF";

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="' + rHeight + 
                    '" cellspacing="0" cellpadding="0" bgcolor=' + bkc + '>';

        var width = 0;
        for (var i = 0; i < data.length; i++) {
            var h = header[i];
            width += h[1];
            var fWidth = i == 0 || i == data.length - 1 ? h[1] : h[1];
            var lBorder = i == -1 ? 'border-left:1px solid #CCC; ' : '';
            //var rBorder = i == data.length-1 ? ' ' :
            //                    'border-right:1px dotted #ccc; ';
            var rBorder = '';
            var lPadding = h[3] == undefined ? "padding-left:5px; " : 'padding-left:' + h[3] + 'px; ';
            var tPadding = '8px';
            switch (h[2]) {
                case 'text':
                case 'image':
                case 'checkbox':
                case 'radio':
                    tPadding = '8px';
                    break;
                case 'button':
                case 'progress':
                case 'textField':
                case 'combo':
                    tPadding = '4px';
                    break;
                default:
                    tPadding = '0px';
            }
            
            innerHtml += '<td cellspacing="0" cellpadding="0" width="' +
            fWidth +
            '"><div style=" ' +
            lBorder +
            rBorder +
            ' padding-top:0px; padding-bottom:0px; ' +
            ' margin-top:0px; margin-bottom: 0px">' +
            '<div style="' +
            lPadding +
            'padding-top:' +
            tPadding +
            ';">' +
            data[i] +
            '</div></div></td>';
        }
        
        innerHtml += '</tr></tbody></table>';
        
        div.style.width = (width) + 'px';
        div.innerHTML = innerHtml;
        
        thisObj.m_tableRowCounter++;
        return div;
    }
    
    this.f_increateTableRowCounter = function(rows)
    {
        thisObj.m_tableRowCounter = thisObj.m_tableRowCounter + rows;
    }
    
    this.f_adjustDivPosition = function(div)
    {
        var adVal = (thisObj.m_tableRowCounter * 31) - 10;
        div.style.top = adVal + 'px';
    }

    this.f_adjustDivPositionByPixel = function(div, pixel)
    {
        div.style.top = pixel + 'px';
    }	
		    
    this.f_createGeneralDiv = function(text)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'visible'
        
        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr><td>' +
        '<div><p>' +
        text +
        '</p>' +
        '</td></tr></tbody></table>';
        
        div.innerHTML = innerHtml;
        
        return div;
    }
    
    this.f_createAnchorDiv = function(refText, tooltip, ref)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '25px';
        
        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr><td>' +
        '<div><a title="' +
        tooltip +
        '" href="#" onclick="' +
        ref +
        '">' +
        refText +
        '</a>' +
        '</td></tr></tbody></table>';
        
        div.innerHTML = innerHtml;
        
        return div;
    }
    
    /**
     * create a div for push buttons.
     * @param buttons - is an array of array contains button name and onclick
     *                  callback.
     *                  [ [btn1, btn1Callback, tooltipString, element id],
     *                  [btn2, btn2Callback, tooltipString, element id],
     *                  []...]
     */
    this.f_createButtons = function(buttons)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '40px';
        
        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="22">';
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var elId = btn[3] == undefined ? "" : 'id="' + btn[3] + '" ';

            switch(btn[0])
            {
                case 'AddInner':
                innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:5px;padding-left:5px;padding-bottom:10px" >' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_add.PNG" ' + elId + ' name="addFireWall" ' +
                    'value="add" onclick="' + btn[1] +
                    '"></div></td>';
                break;		
				case 'Back':
                innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_back.png" ' + elId + ' name="back" ' +
                    'value="back" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case 'Add':
                innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_add.PNG" ' + elId + ' name="addFireWall" ' +
                    'value="addFireWall" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case 'AddUser':
                    innerHtml += '<td>' +
                    '<div title="' +
                    btn[2] +
                    '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' +
                    g_lang.m_imageDir +
                    'bt_addUser.gif" ' +
                    elId +
                    ' name="addUser" ' +
                    'value="addUser" onclick="' +
                    btn[1] +
                    '"></div></td>';
                    break;
                case 'Cancel':
                    innerHtml += '<td>' +
                    '<div title="' +
                    btn[2] +
                    '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' +
                    g_lang.m_imageDir +
                    'bt_cancel.gif" ' +
                    elId +
                    ' name="cancel" ' +
                    'value="Cancel" onclick="' +
                    btn[1] +
                    '"></div></td>';
                    break;
                case 'Restore':
                    innerHtml += '<td>' +
                    '<div title="' +
                    btn[2] +
                    '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' +
                    g_lang.m_imageDir +
                    'bt_restore.gif" ' +
                    elId +
                    ' name="restore" ' +
                    'value="Restore" onclick="' +
                    btn[1] +
                    '"></div></td>';
                    break;
                case 'Apply':
                    innerHtml += '<td>' +
                    '<div title="' +
                    btn[2] +
                    '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' +
                    g_lang.m_imageDir +
                    'bt_apply.gif" ' +
                    elId +
                    ' name="apply" ' +
                    'value="apply" onclick="' +
                    btn[1] +
                    '"></div></td>';
                break;
                case 'Save':
                innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'save.PNG" ' + elId + ' name="saveFireWall" ' +
                    'value="saveFireWall" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case 'Update':
                    innerHtml += '<td>' +
                    '<div title="' +
                    btn[2] +
                    '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' +
                    g_lang.m_imageDir +
                    'bt_update.gif" ' +
                    elId +
                    ' name="update" ' +
                    'value="Update" onclick="' +
                    btn[1] +
                    '"></div></td>';
                    break;
                case 'Backup':
                    innerHtml += '<td>' +
                    '<div title="' +
                    btn[2] +
                    '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' +
                    g_lang.m_imageDir +
                    'bt_backup.gif" ' +
                    elId +
                    ' name="backup" ' +
                    'value="Backup" onclick="' +
                    btn[1] +
                    '"></div></td>';
                    break;
                default:
                    innerHtml += '<td><div style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="button" name="' +
                    btn[0] +
                    '" value="' +
                    btn[0] +
                    '" onclick="' +
                    btn[1] +
                    '" title="' +
                    btn[2] +
                    '" ' +
                    elId +
                    '>' +
                    '</div></td>';
                    break;
            }
            innerHtml += '<td><div style="padding-left:20px">&nbsp;</div></td>';
        }
        
        innerHtml += '</tr></tbody></table>';
        
        div.innerHTML = innerHtml;
        
        return div;
    }
    
    this.f_removeDivChildren = function(div)
    {
        if (div == undefined) 
            return;
        
        thisObj.m_tableRowCounter = 0;
        
        while (div.hasChildNodes()) 
            div.removeChild(div.childNodes[0])
    }
    
    /**
     * define column field
     * @param colName - column name use to display on the table column
     * @param width - width of column
     * @param type - type of data to be displayed (text, image, checkbox,
     *                text input, combobox)
     * @param paddLeft - number of pixel to be padding left
     * @param sortable - true allow sort column, else false (default)
     * @param align - 'left', 'center', or 'right'
     */
    this.f_createColumn = function(colName, width, type, paddLeft, sortable, align)
    {
        if (sortable != undefined && sortable) 
            thisObj.m_allowSort = true;
        
        return [colName, width, type, paddLeft, sortable, align];
    }
    
    this.f_createColNameHTML = function(colName, col, align)
    {
        var header = "";
        
        if (colName != null && colName.length > 2) {
            if (thisObj.m_sortCol == col) {
                var sortIcon = thisObj.m_sortOrder == 'asc' ? '<img src="' + g_lang.m_imageDir + 'sortAsc.gif"/>' : '<img src="' + g_lang.m_imageDir + 'sortDesc.gif"/>';
                
                if (!thisObj.m_allowSort) 
                    sortIcon = '';
                header = "<p valign='center' align='" + align + "'><b>" +
                colName +
                "&nbsp;" +
                sortIcon +
                "<br></b></p>";
            } else header = "<p valign='center' align='" + align + "'><b>" +
            colName +
            "<br></b></p>";
        }
        
        return header;
    }
    
    this.f_renderStatus = function(val)
    {
        switch (val) {
            default:
                return '<span title="Status is unknow" align="center">' +
                '<img src="' +
                g_lang.m_imageDir +
                'statusUnknown.gif" </span>';
            case 'down':
                return '<span title="Status is down" align="center">' +
                '<img src="' +
                g_lang.m_imageDir +
                'statusDown.gif" </span>';
            case 'up':
                return '<span title="Status is up" align="center">' +
                '<img src="' +
                g_lang.m_imageDir +
                'statusUp.gif"/> </span>';
        }
    }
    
    /**
     * @param val - check or un-check the checkbox
     * @param elId - this element id
     * @param cb = callback
     * @param tooltip - tooltip for this checkbox
     */
    this.f_renderCheckbox = function(val, elId, cb, tooltip)
    {
        var checked = val == 'yes' ? 'checked' : '';
        tooltip = tooltip == undefined ? "" : tooltip;
        
        return '<input id="' + elId + '" type="checkbox" ' + checked +
        ' title="' +
        tooltip +
        '" onclick="' +
        cb +
        '"/>';
    }
    
    this.f_renderRadio = function(val, elId, cb, name, tooltip)
    {
        var checked = val == 'yes' ? 'checked' : '';
        tooltip = tooltip == undefined ? "" : tooltip;
        
        return '<input id="' + elId + '" type="radio" ' + checked +
        ' name="' +
        name +
        '" title="' +
        tooltip +
        '" onclick="' +
        cb +
        '"/>';
    }

    this.f_renderCombobox = function(options, val, width)
    {
        var cb = '<select style="width:' + width + 'px;">';

        for(var i=0; i<options.length; i++)
        {
            if(options[i] == val)
                cb += '<option selected value="' + options[i] + '">' + options[i] +
                '</option>';
            else cb += '<option value="' + options[i] + '">' + options[i] +
            '</option>';
        }
        
        return cb;
    }

    this.f_renderTextField = function(elId, val, tooltip, width)
    {
        return '<input id="' + elId + '" type="text" value="' +
                val + '" name="' + name + '" title="' + tooltip + 
                '" style="width:' + width + 'px;"/>';
    }

    this.f_renderAnchor = function(text, link, tooltip)
    {
        return '<a title="' + tooltip + '" href="#" onclick="' + link + '">' +
        text +
        '</a>';
    }
    
    this.f_renderAnchorHref = function(text, link, tooltip)
    {
        return '<a title="' + tooltip + '" href="' + link + '">' +
        text +
        '</a>';
    }
    
    this.f_renderButton = function(text, enable, cb, tooltip)
    {
        var imgSrc = '';
        switch (text) {
            case 'Stop':
                imgSrc = enable ? 'bt_stop.gif' : 'bt_stop_disabled.gif';
                break;
            case 'Restart':
                imgSrc = enable ? 'bt_restart.gif' : 'bt_restart_disabled.gif';
                break;
            case 'Start':
                imgSrc = enable ? 'bt_start.gif' : 'bt_start_disabled.gif';
                break;
            case 'deleteUser':
            case 'delete':
                imgSrc = 'ico_delete.gif';
                break;
            case 'restore': // ico image
                imgSrc = 'ico_disquette.gif';
                break;
            case 'download':
                imgSrc = g_lang.m_imageDir + 'ico_download.gif';
                return '<a title="' + tooltip + '" href=' + cb +
                '><img src="' +
                imgSrc +
                '"></a>';
            case 'Cancel':
                imgSrc = 'bt_cancel.gif';
                break;
            case 'Restore': // button image
                imgSrc = enable ? 'bt_restore.gif' : 'bt_restore_disabled.gif';
                break;
        }
        
        var disabled = enable ? '' : 'disabled';
        return '<input type="image" title="' + tooltip + '" name="' +
        text +
        '" src="' +
        g_lang.m_imageDir +
        imgSrc +
        '" ' +
        disabled +
        ' onclick="' +
        cb +
        '">';
    }
    
    this.f_renderProgressBar = function(val, tooltip)
    {
        var bgColor = 'green';
        if (val >= 90) 
            bgColor = 'red';
        else if (val >= 60 && val < 80) 
            bgColor = 'orange';
        
        return '<div title="' + tooltip + '" style="position:relative; ' +
        'width:102px; height:18px;' +
        'border:1px solid #000; background-color:white;" >' +
        '<div style="border:1px solid #fff; left:0px; width:' +
        val +
        'px; height:16px; background-color:' +
        bgColor +
        ';"></div><div style="position:relative; top:-16px; left:40px;">' +
        '<b>' +
        val +
        '%</b></div></div>';
    }
    
    /**
     * handle error message from evt (ft_eventObj) if error is not = 0.
     * @param evt - ft_eventObj
     * @param errTitle - title to be shown on popup dialog.
     * @return true if there is error, else return false (no error)
     */
    this.f_isServerError = function(evt, errTitle)
    {
        if (evt.f_isError()) {
            if (evt.m_errCode == 3) // timeout error
                g_utils.f_popupMessage('timeout', 'timeout', null, true, 'f_confHandleSessionTimeoutConfirm()');
            else g_utils.f_popupMessage(evt.m_errMsg, 'ok', errTitle, true);
            
            return true;
        } else             
            return false;
    }
    
    /**
     * enable/disable <input> element button image.
     * NOTE: the name of enable/disable image must follow below form:
     *        enable image: exampleImage.gif
     *        disable image: exampleImage_disabled.gif
     *
     * @param elementId - dom element id
     * @param enabled - true is enabled button image, false disabled.
     */
    this.f_enabledDisableButton = function(elementId, enabled)
    {
        var button = document.getElementById(elementId);
        if (button != undefined) {
            var src = button.src;
            var in1 = src.lastIndexOf('/');
            var in2 = src.lastIndexOf('_disabled.gif');
            if (in2 < 0) 
                in2 = src.lastIndexOf('.gif');
            var name = src.substring(in1, in2);
            
            var newSrc = src.substr(0, in1);
            button.disabled = !enabled;
            button.src = enabled ? newSrc + name + '.gif' : /*newSrc + name + '.gif';*/ newSrc + name + '_disabled.gif';
        }
    }
    
    /**
     * to be override by sub-class
     */
    this.f_stopLoadVMData = function()
    {
        this.f_colorGridBackgroundRow(false);
    }
    
    this.f_reflow = function()
    {
        var body = document.getElementsByTagName("body")[0];
        var bodyClass = body.className;
        
        body.className = "reflow";
        body.className = bodyClass;
    }
    
    this.f_resize = function(padding)
    {
        if (this.m_id != g_configPanelObj.m_selectedItem ||
		this.m_div == undefined) {
			//to avoid the race condition between callback from server, and user click event.
			return;
		}
        var h = 0;
        for (var i = 0; this.m_div.childNodes[i]; i++) {
            h += this.m_div.childNodes[i].offsetHeight;
        }
        
        h = h + (thisObj.m_tableRowCounter * 31);
        if (padding) {
            h += padding;
        }
        
        this.m_div.style.height = h + 'px';
        document.getElementById('ft_container').style.height = h + 'px';
        this.f_reflow();
    }
}

function f_confHandleSessionTimeoutConfirm()
{
    g_busObj.f_userLogout();
}
