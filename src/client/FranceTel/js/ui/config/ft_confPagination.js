/*
    Document   : ft_confPagination.js
    Created on : June 30, 2009, 3:18:25 PM
    Author     : Kevin.Choi
    Description:
*/


/**
 * grid table paging handler object
 *
 * @param total : total number of records/rows to be handler by this object.
 * @param curPage : current page number is displayed
 * @param rowPerPage : number of row to be display per page.
 */
function FT_pagingObj(total, curPage, rowPerPage)
{
    var thisObj = this;
    this.m_totalRecs = total;    // total rows/records from database
    this.m_curPage = curPage;   // current page number
    this.m_rowPerPage = rowPerPage; // number of row allow per page
    this.m_totalPages = 0;      // total pages
    this.m_numOfRowInPage = 0;    // number of row on current display page.
    this.m_endPage = false;

    this.f_resetValues = function(totalRecs)
    {
        this.m_numOfRowInPage = 0;
        this.m_endPage = false;

        ///////////////////////////////////////////////////
        // reset m_totalRecs and m_curPage for case that
        // curpage is no long available.
        if(totalRecs != null && this.m_totalRecs != null)
        {
            this.m_totalRecs = totalRecs;
            this.f_calculateTotalPage();

            if(this.m_curPage > this.m_totalPages)
                this.m_curPage = this.m_totalPages;
        }
    }

    this.f_calculateTotalPage = function()
    {
        var totalPages = this.m_totalRecs / this.m_rowPerPage;

        if(this.m_totalRecs % this.m_rowPerPage > 0)
            totalPages = Math.round(totalPages + .5);

        this.m_totalPages = totalPages;
    }

    this.f_createPagingNumbersDiv = function()
    {
        this.f_calculateTotalPage();
        var div = "<div class=pagination><nobr>";
        var sep = "";

        for(var i=1; i<=this.m_totalPages; i++)
        {
            if(i == this.m_curPage)
                div += sep + "<span class=pagination-page-on>&nbsp;" + i +
                        "&nbsp;</span>";
            else
                div += sep + "<a href='#' onclick='f_paginationCallback(" + i +
                ")'>&nbsp;" + i + "&nbsp;</a>";

            sep = "|";
        }

        return div + "</nobr></div>"
    }

    this.f_createPagingPrevsDiv = function()
    {
        var div = "<image src=images/ico_first.png/>";

        if(thisObj.m_curPage == 1)
            div += "<div class=pagination-off>&nbsp;" + g_lang.m_pgFirst + "</div></td>" +
                  "<td width=60 style='padding-left:10px;'><image src=images/ico_previous.png/>"+
                  "<div class=pagination-off>&nbsp;" + g_lang.m_pgPrev + "</div>";
        else
            div += "<div class=pagination><a href='#' onclick='f_paginationCallback" +
                  "(1)'>&nbsp;" + g_lang.m_pgFirst + "</a></div></td>" +
                  "<td width=60 style='padding-left:10px;'><image src=images/ico_previous.png/>"+
                  "<div class=pagination><a href='#' onclick='f_paginationCallback(" +
                  (thisObj.m_curPage-1) + ")'>&nbsp;" + g_lang.m_pgPrev + "</a></div>";

        return div;
    }

    this.f_createPagingNextsDiv = function()
    {
        var div = "";

        if(thisObj.m_curPage == thisObj.m_totalPages)
            div += "<div class=pagination-off>" + g_lang.m_pgNext + "&nbsp;" +
                     "<image src=images/ico_next.png/></div></td>" +
                     "<td width=55><div class=pagination-off>" + g_lang.m_pgLast +
                     "&nbsp;<image src=images/ico_last.png/></div>";
        else
        {
            div += "<div class=pagination><a href='#' onclick='" +
                     "f_paginationCallback(" + (thisObj.m_curPage+1) + ")'>" +
                     g_lang.m_pgNext + "&nbsp;</a>" +
                     "<image src=images/ico_next.png/></div></td>" +
                     "<td width=55><div class=pagination><a href='#' " +
                     "onclick='f_paginationCallback(" + thisObj.m_totalPages +
                     ")'>" + g_lang.m_pgLast + "&nbsp;</a><image " +
                     "src=images/ico_last.png/></div>";
        }

        return div;
    }

    this.createPagingDiv = function(width)
    {
        var div = null;

        div = document.createElement('div');
        div.style.position = 'relative';
        div.style.backgroundColor = 'white';
        div.style.paddingTop = '3px';
        div.style.paddingBottom = '0px';
        div.style.marginTop = '18px';

        var pageNum = thisObj.f_createPagingNumbersDiv();
        var pagePrev = thisObj.f_createPagingPrevsDiv();
        var pageNext = thisObj.f_createPagingNextsDiv();

        var innerHtml = '<table style="border-top:1px dotted #CCC;" width=100% ' +
                        'cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="41" cellspacing="0" cellpadding="0">';

        innerHtml += "<td align=right width=55>" + pagePrev + "</td>" +
                     "<td align=center><div class=pagination>" +
                     pageNum + "</div></td>" +
                     "<td align=right style='padding-right:10px;'width=55>" +
                     pageNext + "</td>";

        innerHtml += '</tr></tbody></table>' ;

        div.style.width = (width) + 'px';
        div.innerHTML = innerHtml;

        thisObj.m_tableRowCounter++;
        thisObj.m_endPage = true;

        return div;
    }
}