/**
 * @author loi
 */
/*
 Document   : utm_rptUrlfBasicSummary.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: summary web filtering log 
 */
function UTM_rptUrlfBasicSummary(name, busLayer)
{
    var thisObjName = 'UTM_rptUrlfBasicSummary';
    this.m_id = 'rpt_urlf_basic_summary';
    this.m_busLayer = undefined;
    this.m_div = undefined;
    this.m_dataPanel = null;
    this.m_tableTitle = null;
    this.m_tableHeader = null;
    this.m_tableBody = null;
    this.m_name = undefined;
    var thisObj = this;


    /**
     * @param name - name of configuration screens.
     * @param busLayer - business object
     */
    this.constructor = function(name, busLayer)
    {
        UTM_rptIdsBasicSummary.superclass.constructor(name, null, busLayer);
        this.privateConstructor(name, busLayer);
    }

    this.privateConstructor = function(name, busLayer)
    {
        this.m_busLayer = busLayer;
        this.m_name = name;
    }
    this.constructor(name, busLayer);

    this.f_distructor = function()
    {
        delete this.m_tableTitle;
        delete this.m_tableHeader;
        delete this.m_tableBody;
        delete this.m_dataPanel;
        delete this.div;
    }

    this.f_refresh = function()
    {
        var recs = ['3', '3', '3'];
        this.f_populateTable(recs);
    }

    this.f_show = function()
    {
        if(this.m_dataPanel == null)
        {
            this.f_initDataPanel();
            this.m_div.appendChild(this.m_dataPanel);
        }
        var recs = ['3', '3', '3', '3', '3'];
        this.f_populateTable(recs);

        var el = document.getElementById(thisObj.m_id);
        if (el != null) {
                el.style.display = '';
        }
    }

    this.f_hide = function()
    {
        var el = document.getElementById(thisObj.m_id);
        if (el != null) {
                el.style.display = 'none';
        }
    }

    this.f_getPage = function()
    {
        var div = document.createElement('div');
        div.setAttribute('align', 'left');
        div.setAttribute('id', thisObj.m_id);

        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.backgroundColor = 'white';
        div.style.paddingTop = '15px';
        div.style.paddingLeft = '5px';
        div.style.display = 'none';
        div.style.height = 'auto';

        thisObj.m_div = div;
        return thisObj.m_div;
    }

    this.f_initColumnModel = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn("#", 45, 'text', '0', false);
        cols[1] = this.f_createColumn("username", 100, 'text', '0', false);
        cols[2] = this.f_createColumn("total connection<br>time", 100, 'text', '0', false);
        cols[3] = this.f_createColumn("total number<br>of connections", 100, 'text', '0', false);
        cols[4] = this.f_createColumn("last connection<br>date", 100, 'text', '0', false);

        return cols;
    }

    this.f_initPie = function()
    {
        this.m_pieDiv = this.f_createEmptyDiv();

    }

    this.f_initDataPanel = function()
    {
        this.f_enableTableIndex(true);
        this.f_colorGridBackgroundRow(true);

        this.m_dataPanel = this.f_createEmptyDiv();
        this.m_colModel = this.f_initColumnModel();
        this.m_tableTitle = this.f_createEmptyDiv();
        this.m_tableHeader = this.f_createGridHeader(this.m_colModel);
        this.m_tableBody = this.f_createGridView(this.m_colModel, true);

        var tDiv = this.f_createEmptyDiv();
        tDiv.style.marginTop = "0px";
        tDiv.style.marginLeft = "15px";
        tDiv.style.marginBottom = "10px";
        tDiv.appendChild(this.m_tableTitle);
        tDiv.appendChild(this.m_tableHeader);
        tDiv.appendChild(this.m_tableBody);

        this.m_dataPanel.appendChild(tDiv);
    }

    this.f_populateTable = function(recs)
    {
        this.m_tableTitle.innerHTML = "<p><u>top 5 remote users:</u><p><br>";

        this.f_removeDivChildren(this.m_tableBody);
        for(var i=0; i<recs.length; i++)
        {
            var rec = recs[i];
            var uname = thisObj.f_renderAnchor("intrusion" + i,
                    "f_logBasicVpnUsernameHandler('" +
                    rec.m_tunnel + "')", 'Click on this goto advance mode');
            var udate = thisObj.f_renderAnchor("intrusion" + i,
                    "f_logBasicVpnLastConnDateHandler('" +
                    rec.m_tunnel + "')", 'Click on this goto advance mode');

            ///////////////////////////////////
            // add fields into grid view
            var div = thisObj.f_createGridRow(thisObj.m_colModel,
                  [thisObj.f_createSimpleDiv(uname, 'center'),
                  thisObj.f_createSimpleDiv("20:2" + i, 'center'),
                  thisObj.f_createSimpleDiv("1" + i, 'center'),
                  thisObj.f_createSimpleDiv(udate, 'center')]);

            thisObj.m_tableBody.appendChild(div);
        }
    }
}
UTM_extend(UTM_rptVpnBasicSummary, UTM_confBaseObj);

function f_logBasicWebFilteringHandler(url)
{

}
