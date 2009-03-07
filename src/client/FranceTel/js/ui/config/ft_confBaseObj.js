/*
    Document   : ft_confBaseObj.js
    Created on : Mar 02, 2009, 6:18:25 PM
    Author     : Kevin.Choi
    Description: a base object for all OA configuration screens
*/


FT_confBaseObj = Ext.extend(Ext.util.Observable,
{
    thisObj: this,

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     */
    constructor: function(name, callback, busLayer)
    {
        this.thisObj = this;
        this.m_busLayer = busLayer;
        this.m_name = name;
        this.m_containerCb = callback;
        this.m_treadId = null;
    },

    /**
     * call this function when this object is no longer used. it will
     * do all the clean up and stop the thread.
     */
    f_distructor: function()
    {
        if(this.m_treadId != null)
        {
            this.m_busLayer.f_stopVMRequestThread(this.m_treadId);
            this.m_threadId = null;
        }
    },

    f_getPanelDiv: function(panel)
    {
        var div = document.createElement('div');
        div.setAttribute('id', 'ft_confpanel_'+panel.id);
        div.setAttribute('align', 'center');

        /////////////////////////////////////////
        // set inner styling of the div tag
        //div.style.position = 'absolute';
        div.style.overflow = 'scroll';
        div.style.backgroundColor = 'white';

        document.getElementById('ft_container').appendChild(div);
        panel.render('ft_confpanel_'+panel.id);

        var hd = panel.m_colHeader;
        if(hd != undefined)
        {
            var view = panel.m_grid.getView();
            for(var i=0; i<hd.length; i++)
            {
                view.getHeaderCell(i).innerHTML = hd[i];
            }
        }

        return div;
    },

    f_getNewPanelDiv: function(children)
    {
        var div = document.createElement('div');
        div.setAttribute('id', 'ft_confpanel_');
        div.setAttribute('align', 'left');

        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '300px';
        div.style.overflow = 'auto';

        document.getElementById('ft_container').appendChild(div);

        for(var i=0; i<children.length; i++)
            div.appendChild(children[i]);

        this.m_div = div;
        return this.m_div;
    },

    f_createGridHeader: function(header)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.border = '1px solid #CCC';
        div.style.backgroundColor = '#EFEFEF';

        var width = 0;
        var inner = "";
        for(var i=0; i<header.length; i++)
        {
            var h = header[i];
            width += h[1]
            var rBorder = (i == header.length-1) || h[0].length < 2 ?
                              '' : 'border-right:1px solid #CCC; ';

            inner += '<td width="' + h[1] +'">' +
                '<div style="padding-top:5px; height:18px; ' + rBorder + '">' +
                h[0] + '</div></td>';
        }

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">' +
                      '<thead><tr height="25">' + inner +
                      '</tr></thead></table>';

        div.style.width = width + 'px';
        div.innerHTML = innerHtml;

        return div;
    },

    f_createGridView: function(header)
    {
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '150px';
        div.style.overflow = 'auto';
        div.style.border = '1px solid #CCC';

        var width = 0;
        for(var i=0; i<header.length; i++)
        {
            var h = header[i];
            width += h[1]
        }

        div.style.width = (width) + 'px';
        return div;
    },

    f_createGridRow: function(header, data)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.borderBottom = '1px dotted #CCC';
        div.style.backgroundColor = 'white';
        div.style.paddingTop = '0px';
        div.style.paddingBottom = '0px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="28" cellspacing="0" cellpadding="0">';

        var width = 0;
        for(var i=0; i<data.length; i++)
        {
            var h = header[i];
            width += h[1];
            var fWidth = i == 0 || i == data.length-1 ? h[1] : h[1];
            var lBorder = i == -1 ? 'border-left:1px solid #CCC; ' : '';
            var rBorder = i == data.length-1 ? ' ' :
                                'border-right:1px dotted #ccc; ';
            var lPadding = h[3] == undefined ? "padding-left:5px; " :
                          'padding-left:' + h[3] + 'px; ';
            var tPadding = '8px';
            switch(h[2])
            {
                case 'text':
                case 'image':
                case 'checkbox':
                    tPadding = '8px';
                    break;
                case 'button':
                    tPadding = '3px';
                    break;
                case 'progress':
                    tPadding = '6px';
                    break;
            }

            innerHtml += '<td cellspacing="0" cellpadding="0" width="' +
                        fWidth +'"><div style="height:28px; ' + lBorder + rBorder +
                        ' padding-top:0px; padding-bottom:0px; ' +
                        ' margin-top:0px; margin-bottom: 0px"' +
                        '<div style="' + lPadding + 'padding-top:' +
                        tPadding + ';">' + data[i] + '</div></div></td>';
        }

        innerHtml += '</tr></tbody></table>' ;

        div.style.width = (width) + 'px';
        div.innerHTML = innerHtml;

        return div;
    },

    /**
     * create a div for push buttons.
     * @param buttons - is an array of array contains button name and onclick
     *                  callback.
     *                  [ [btn1, btn1Callback], [btn2, btn2Callback], []...]
     */
    f_createButtons: function(buttons)
    {
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '50px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="22">';
        for(var i=0; i<buttons.length; i++)
        {
            var btn = buttons[i];

            innerHtml += '<td width="' + btn[0].length * 18 +
                        '"><div style="height:30px; ' +
                        'padding-top:15px;" >' +
                        '<input type="button" name="' + btn[0] +
                        '" value="' + btn[0] + '" onclick="' +
                        btn[1] + '">' +
                        '</div></td>';
        }

        innerHtml += '</tr></tbody></table>';

        div.innerHTML = innerHtml;

        return div;
    },

    f_removeDivChildren: function(div)
    {
        while(div.hasChildNodes())
            div.removeChild(div.childNodes[0])
    },

    /**
     * define column field
     * @param colName - column name use to display on the table column
     * @param width - width of column
     * @param type - type of data to be displayed (text, image, checkbox,
     *                text input, combobox)
     * @param paddLeft - number of pixel to be padding left
     */
    f_createColumn: function(colName, width, type, paddLeft)
    {
        var header = colName.length > 2 ?
            "<p valign='center' align='center'><b>" + colName + "<br></b></p>" :
            "";

        return [header, width, type, paddLeft];
    },

    f_renderStatus: function(val)
    {
        switch(val)
        {
            default:
                return "<span align='center'><img src='images/statusUnknown.gif'/></span>";
            case 'down':
                return "<span align='center'><img src='images/statusDown.gif'/></span>";
            case 'up':
                return "<span align='center'><img src='images/statusUp.gif'/></span>";
        }
    },

    f_renderCheckbox: function(val)
    {
        if(val == 'yes')
            return '<input type="checkbox" checked/>';
        else
            return '<input type="checkbox"/>';
    },

    f_renderCombobox: function(options, val)
    {
        var cb = '<select>';

        for(var i=0; i<options.length; i++)
        {
            if(options[i] == val)
                cb += '<option selected value="' + options[i] + '">' + options[i] +
                  '</option>';
            else
                cb += '<option value="' + options[i] + '">' + options[i] +
                  '</option>';
        }

        return cb;
    },

    f_renderAnchor: function(text, link)
    {
        return '<a href="#" onclick="' + link + '">' + text + '</a>';
    },

    f_renderButton: function(text, enable, cb)
    {
        var imgSrc = '';
        switch(text)
        {
            case 'Stop':
                imgSrc = enable ? 'images/vm_stop.PNG' : 'images/vm_stop2.PNG';
                break;
            case 'Restart':
                imgSrc = enable ? 'images/vm_restart.PNG' : 'images/vm_restart2.PNG';
                break;
            case 'Start':
                imgSrc = enable ? 'images/vm_start.PNG' : 'images/vm_start2.PNG';
                break;
        }

        return '<img height="21" name="' + text +
                        '" src="' + imgSrc + '" style="cursor:pointer;" ' +
                        ' onclick="' + cb + '">';
    },

    f_renderProgressBar: function(val)
    {
        var bgColor = val >= 80 ? 'red' : 'green';

        return '<div style="position:relative; width:100px; height:16px;' +
              'border:1px solid #000; background-color:white;" >'+
              '<div style="left:0px; width:' + val +
              'px; height:16px; background-color:'+ bgColor +
              ';"></div><div style="position:relative; top:-15px; left:40px;">'+
              '<b>' + val +'%</b></div></div>';
    }
});