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
    this.m_rowHeight = 31;
    this.m_allowSort = false;
    this.m_sortColPrev = -1;
    this.m_sortCol = 0;
    this.m_sortOrder = 'asc';   // asc or des

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
        this.m_colorGridRow = false;
        this.m_rowHeight = 31;
        this.m_allowSort = false;
        this.m_sortColPrev = -1;
        this.m_sortCol = 0;
        this.m_sortOrder = 'asc';
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
        //div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        //div.style.height = '300px';
		div.style.height = 'auto';
        div.style.overflow = 'visible';
        div.style.fontFamily = 'Arial, sans-serif';

        var ft = document.getElementById('ft_container');
		ft.appendChild(div);
		ft.style.height = 'auto';

        for (var i = 0; i < children.length; i++)
            div.appendChild(children[i]);

        this.m_div = div;
        return this.m_div;
    }

    this.f_createGridHeader = function(header, onclick)
    {
        var div = document.createElement('div');
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
            var isSort = false;
            var sortColor = "";
            if (h[4] != undefined && h[4]) {
                tooltip = 'title="' + g_lang.m_tableTooltip1 + '" ';
                cursor = 'cursor:pointer; ';
                isSort = true;

                if(thisObj.m_sortCol == i)
                    sortColor = "background-color:#939393;";
            }

            var align = h[5] == undefined ? 'center' : h[5];
            var pLeft = align == "center" ? 0 : h[3];

            var colName = thisObj.f_createColNameHTML(h[0], i, h[5], isSort);
            var rBorder = (i == header.length-1) || h[0].length < 2 ?
                              '' : 'border-right:1px solid #CCC; ';

            inner += '<td width="' + h[1] + '" align="' + align +
                '" valign="top" style="' + rBorder + ' ' + sortColor + '">' +
                '<div style="padding-top:5px; padding-bottom:5px; ' +
                'padding-left:' + pLeft + 'px; ' +
                cursor + '" onclick="' + onclick + '(' + i + ')" ' +
                tooltip + '>' + colName + '</div></td>';
        }

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">' +
                      '<thead backgroundcolor=red><tr>' + inner +
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
		div.style.height = 'auto';
        //div.style.height = '50px';
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


    this.f_createGridRow = function(header, data, height, rowId)
    {
        var div = document.createElement('div');
        //div.style.position = 'relative';
        div.style.borderBottom = '1px dotted #CCC';
        div.style.backgroundColor = 'white';
        div.style.paddingTop = '0px';
        div.style.paddingBottom = '0px';

        if ((rowId != undefined) && (rowId !=null)) {
            div.setAttribute('id', rowId);
        }

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

            innerHtml += '<td cellspacing="0" cellpadding="0" style="width:' +
            fWidth + 'px;"><div style="overflow:hidden; ' +
            lBorder + rBorder + ' padding-top:0px; padding-bottom:0px; ' +
            ' margin-top:0px; margin-bottom: 0px"><div style="' + lPadding +
            'padding-top:' + tPadding + ';">' + data[i] + '</div></div></td>';
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
		//comment this out since we don't use relative position, we don't need adjustment.
		/*
        var adVal = (thisObj.m_tableRowCounter * thisObj.m_rowHeight) - 10;
        div.style.top = adVal + 'px';
        */
    }


    this.f_adjustDivPositionByPixel = function(div, pixel)
    {
		//comment this out since we don't use relative position, we don't need adjustment.
		/*
        div.style.top = pixel + 'px';
        */
    }

    this.f_createSimpleDiv = function(text, align, color)
    {
        var al = align == null ? 'left' : align;
        var col = color == null ? 'black' : color;

        return "<div align=" + al + "><font color=" + color + ">" + text +
                "</color></div>";
    }

    this.f_createGeneralDiv = function(text)
    {
        var div = document.createElement('div');
        //div.style.position = 'relative';
		div.style.height = 'auto';
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
     *                  [ [btn1, btn1Callback, tooltipString, element id, enable],
     *                  [btn2, btn2Callback, tooltipString, element id, enable],
     *                  []...]
     */
    this.f_createButtons = function(buttons, align)
    {
        var div = document.createElement('div');
        div.setAttribute('align', align == null ? 'center':align);
        //div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '40px';
		//Uncomment the following line to add a padding between grid body, and the
		//button panel.
		//We leave it comment out for now since Kevin's firewall, zone management screen
		//has its own layout.
		//div.style.paddingTop = '10px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="22">';
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var disabled = btn[4] == null || btn[4] ? "" : "_disabled";
            var elId = btn[3] == undefined ? "" : 'id="' + btn[3] + '" ';

            switch(btn[0])
            {
                case 'AddInner':
                innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:10px;padding-left:10px;padding-bottom:5px" >' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_add.gif" ' + elId + ' name="' + btn[2]+'" ' +
                    'value="add" onclick="' + btn[1] +
                    '"></div></td>';
                break;
				case 'Back':
                innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_back.gif" ' + elId + ' name="back" ' +
                    'value="back" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case "Reset":
                    innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_reset.gif" ' + elId + ' name="' + btn[2]+'" ' +
                    'value="'+btn[2]+'" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case 'Add':
                innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_add.gif" ' + elId + ' name="' + btn[2]+'" ' +
                    'value="' + btn[2]+'" onclick="' + btn[1] +
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
                    'bt_cancel' + disabled + '.gif" ' +
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
                    'bt_apply' + disabled + '.gif" ' +
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
                    'bt_save.PNG" ' + elId + ' name="saveFireWall" ' +
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
            div.removeChild(div.childNodes[0]);
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

    this.f_createColNameHTML = function(colName, col, align, isSortCol)
    {
        var header = "";
        var cName = isSortCol != null && isSortCol ? "<u>" + colName + "</u>" : colName;

        if (colName != null && colName.length > 2) {
            if (thisObj.m_sortCol == col) {
                var sortIcon = thisObj.m_sortOrder == 'asc' ?
                    '<img src="' + g_lang.m_imageDir + 'sortAsc.gif"/>' :
                    '<img src="' + g_lang.m_imageDir + 'sortDesc.gif"/>';

                if (!thisObj.m_allowSort)
                    sortIcon = '';
                header = "<p valign='center' align='" + align + "'><b>" +
                cName + "&nbsp;" + sortIcon + "<br></b></p>";
            }
            else
                header = "<p valign='center' align='" + align + "'><b>" +
                cName + "<br></b></p>";
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
    this.f_renderCheckbox = function(val, elId, cb, tooltip, readonly)
    {
		var ro = '';
        var checked = val == 'yes' || val == 'Yes' ? 'checked' : '';
        tooltip = tooltip == undefined ? "" : tooltip;

		if (readonly != null) {
			if (readonly==true) {
				ro = ' disabled style="color:#CCC;"';
			}
		}

        return '<input id="' + elId + '" type="checkbox" ' + checked +
        ' title="' +
        tooltip +
        '" onclick="' +
        cb + '"' + ro + '/>';
    }

    this.f_renderRadio = function(val, elId, cb, name, tooltip, readonly)
    {
        var ro = '';
        var checked = val == 'yes' ? 'checked' : '';
        tooltip = tooltip == undefined ? "" : tooltip;

		if (readonly != null) {
			if (readonly==true) {
				ro = ' disabled style="color:#CCC;"';
			}
		}

        return '<input id="' + elId + '" type="radio" ' + checked +
        ' name="' +
        name +
        '" title="' +
        tooltip +
        '" onclick="' +
        cb + '"' + ro + '/>';
    }


    /**
     * @param options - combobox options data
     * @param val - value to be add to text field
     * @param width - width of textfield
     * @param elId - element id
     * @param events - array of events callback function.
     *                  [0] = onmouseup
     *                  [1] = name of each option. array type.
     */
    this.f_renderCombobox = function(options, val, width, elId, events)
    {
        var onchange = '';
        if(events!= null && events[0] != null)
            onchange = 'onchange="' + events[0] + '"';

        var cb = '<select id="' + elId + '" style="width:' + width + 'px;" ' +
                  onchange + '>';

        for(var i=0; i<options.length; i++)
        {
            var opName = (events != null && events[1] != null) ?
                'name="' + events[1][i] + '"' : '';

            if(options[i] == val)
                cb += '<option  selected value="' + options[i] +
                '" ' + opName + '>' + options[i] + '</option>';
            else cb += '<option  value="' + options[i] +
                '" ' + opName + '>' + options[i] + '</option>';
        }

        cb += "</select>";
        return cb;
    }

    /**
     * disable/enable items in combobox.
     * @param cbid - combobox element id
     * @param optItems- an array of option items to be disable/enable depend on
     *                  param 'enabled'
     * @param enabled - true to enabled all items in 'optItems'.
     */
    this.f_enableComboboxSelection = function(cbid, optItems, enabled)
    {
        var cbb = document.getElementById(cbid);

        if(cbb != null)
        {
            for(var i=0; i<cbb.length; i++)
            {
                var en = enabled;

                var optVal = cbb.options[i].text;
                for(var j=0; j<optItems.length; j++)
                {
                    if(optVal == optItems[j])
                    {
                        en = !enabled;
                        break;
                    }
                }

                cbb.options[i].disabled = en;
            }
        }
    }

    this.f_enableTextField = function(tfElement, enable)
    {
        tfElement.disabled = !enable;

        if(enable)
            tfElement.style.backgroundColor = "white"
        else
            tfElement.style.backgroundColor = "#EFEFEF";
    }

    /**
     * @param elId - element id
     * @param val - value to be add to text field
     * @param tooltip - tooltip when mouse over
     * @param width - width of textfield
     * @param events - array of events callback function.
     *                  [0] = onBlur
     * @param readonly - true to make this field readonly, else editable
     */
    this.f_renderTextField = function(elId, val, tooltip, width, events, readonly)
    {
        var ro = '';
        var roStyle = '"';
        if ((readonly != undefined) && (readonly!=null) && (readonly==true)) {
            ro += 'disabled=true';
            roStyle += 'background-color: #EFEFEF;';
        }

        var onblur = '';
		var onkeydown = '';

        if(events!= null) {
			if (events[0] != null) {
                onblur = 'onblur="' + events[0] + '"';
			}
			if (events[1] != null) {
				onkeydown = 'onkeydown="' + events[1] + '"';
			}
		}

        var html = '<input id="' + elId + '" type="text" value="' +
                val + '" name="' + name + '" title="' + tooltip +
                '" style=' + roStyle + ' width:' + width + 'px;" ' + ro + ' ' +
                onblur + ' ' + onkeydown + ' class="v_form_input"/>';
		return html;
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

    this.f_renderImage = function(imgSrc, cb, tooltip)
    {
        return '<input type="image" title="' + tooltip +
               '" src="' + imgSrc + '" ' +
               ' onclick="' + cb + '">';
    }

    this.f_renderButton = function(text, enable, cb, tooltip)
    {
        var imgSrc = '';
        switch (text)
        {
            case 'ArrowUp':
                imgSrc = enable ? 'fleche_up.gif' : 'fleche_up_disabled.gif';
                break;
            case 'ArrowDown':
                imgSrc = enable ? 'fleche_down.gif' : 'fleche_down_disabled.gif';
                break;
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
            if (evt.m_errCode == 3) {// timeout error
                g_busObj.f_userTimeout();
				//g_utils.f_popupMessage('timeout', 'timeout', null, true, 'f_confHandleSessionTimeoutConfirm()');
			} else {
				g_utils.f_popupMessage(evt.m_errMsg, 'ok', errTitle, true);
			}
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
        if (button != undefined)
        {
            var src = button.src;

            // extract image name
            var ext = src.substr(src.length-4, 4);
            var in1 = src.lastIndexOf('/');
            var in2 = src.lastIndexOf('_disabled');
            if (in2 < 0)
                in2 = src.lastIndexOf('.');
            var name = src.substring(in1, in2);

            var newSrc = src.substr(0, in1);
            button.disabled = !enabled;
            button.src = enabled ? newSrc + name + ext : newSrc + name + '_disabled' + ext;
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

    this.f_resetTableRowCounter = function(toRow)
    {
        thisObj.m_tableRowCounter = toRow;
    }

    this.f_resize = function(padding)
    {
		//console.log('utm_confBaseObj.f_resize called');
		if ((this.m_id == null) || (g_configPanelObj.m_selectedItem == null) || (this.m_div == undefined)) {
			//console.log('utm_confBaseObj.f_resize: get out since m_id, m_selectedItem, m_div is not defined');
			return;
		} else if ((this.m_id.indexOf(g_configPanelObj.m_selectedItem) == -1) ||
		(this.m_id.length != g_configPanelObj.m_selectedItem.length)) {
			//if (this.m_id != g_configPanelObj.m_selectedItem ||
			//this.m_div == undefined)
			//to avoid the race condition between callback from server, and user click event.
			//console.log('utm_configBaseObj.f_resize: this.m_id: ' + this.m_id + ' g_configPanelObj.m_selecteditem:' +
			//g_configPanelObj.m_selectedItem);
			return;
		}
        var h = 0;
        for (var i = 0; this.m_div.childNodes[i]; i++) {
			//console.log('utm_confBaseObj.f.resize: ' + i);
            h += this.m_div.childNodes[i].offsetHeight;
        }

        h = h + (thisObj.m_tableRowCounter * thisObj.m_rowHeight);
        if (padding) {
            h += padding;
        }
        g_utils.f_debug('utm_confBaseObj.f_resize: h=' + h, true);
        /*
        this.m_div.style.height = h + 'px';
        document.getElementById('ft_container').style.height = h + 'px';
        this.f_reflow();
        g_utmMainPanel.f_requestResize();
        */
    }

    this.f_resetSorting = function()
    {
        thisObj.m_sortOrder = 'asc';
        thisObj.m_sortCol = 0;
    }

    this.f_isSortEnabled = function(colHeader, col)
    {
        // check for header sorting is allow or not
        var chd = colHeader[col];
        if(chd[4] == undefined || chd[4] == false)
            return false;

        var order = thisObj.m_sortOrder;

        if(col != thisObj.m_sortColPrev)
            order = 'asc';
        else if(order == 'asc')
            order = 'desc';
        else
            order = 'asc';

        thisObj.m_sortCol = col;
        thisObj.m_sortOrder = order;

        return true;
    }

    this.f_sortArray = function(col, ar)
    {
        var si = col;
        var sar = new Array();

        //////////////////////////////////////////////////////////////////
        // loop through the ar and place the sorting index value at begin
        // of the string
        for(var i=0; i<ar.length; i++)
        {
            var fu = ar[i];
            var a = fu.split('|');
            sar[i] = a[si];

            for(var j=0; j<a.length; j++)
            {
                if(j == si) continue;

                sar[i] += '|' + a[j];
            }
        }

        // perform sorting
        sar.sort();
        if(si > 0)
        {
            ///////////////////////////////////////////
            //
            ar = sar;
            for(var i=0; i<ar.length; i++)
            {
                var fu = ar[i];
                var a = fu.split('|');
                sar[i] = '';

                for(var j=1; j<a.length; j++)
                {
                    sar[i] += (j != 1 ? '|':'') + a[j];

                    if(j == si)
                        sar[i] += '|' + a[0];
                }
            }
        }

        if(thisObj.m_sortOrder == 'desc')
            sar.reverse();

        thisObj.m_sortCol = col;
        thisObj.m_sortColPrev = col;
        return sar;
    }

	this.f_setSortOnColPerformed = function(col, prevCol)
	{
		thisObj.m_sortCol = col;
		thisObj.m_sortColPrev = prevCol;
	}
}

function f_confHandleSessionTimeoutConfirm()
{
    g_busObj.f_userTimeout();
}
