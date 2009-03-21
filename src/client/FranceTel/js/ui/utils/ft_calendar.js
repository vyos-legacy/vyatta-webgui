/*
 Document   : ft_calendar.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: The calendar component
 */
function FT_calendar()
{
    var thisObj = this;
    this.m_DateNow = new Date(Date.parse(new Date().toDateString()));
    //---------------------------------------------------------------------------
    // configuration for the calendar
    //---------------------------------------------------------------------------
    this.m_BaseYear = this.m_DateNow.getFullYear();
    this.m_DropDownYears = 2;
    this.m_Language;
    //this.m_WeekStart determines the start of the week in the display
    //Set it to: 0 (Zero) for Sunday, 1 (One) for Monday etc..	
    this.m_WeekStart = 0;
    // If you want to see week numbering on the calendar, set
    // this to true.  If not, false.	
    this.m_WeekNumberDisplay = false;
    this.m_WeekNumberBaseDay = 4;
    this.m_ShowInvalidDateMsg = false;
    this.m_ShowOutOfRangeMsg = true;
    this.m_ShowDoesNotExistMsg = true;
    this.m_ShowInvalidAlert = true;
    this.m_ShowDateDisablingError = true;
    this.m_ShowRangeDisablingError = true;
    this.m_ArrDelimiters = ['/', '-', '.', ',', ' '];
    /* Displayed "Today" date format */
    this.m_DateDisplayFormat = 'mm-dd-yy'; // e.g. 'MMM-DD-YYYY' for the US
    /* Output date format */
    this.m_DateOutputFormat = 'MM/DD/YYYY'; // e.g. 'MMM-DD-YYYY' for the US
    this.m_Zindex = 1;
    this.m_BlnStrict = false;
    this.m_ClearButton = true;
    this.m_AutoPosition = true;
    this.m_EnabledDay = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
    this.m_DisabledDates = new Array();
    this.m_ActiveToday = true;
    this.m_OutOfMonthDisable = false;
    this.m_OutOfMonthHide = false;
    this.m_OutOfRangeDisable = true;
    this.m_FormatTodayCell = true;
    this.m_TodayCellBorderColour = 'red';
    /* Closing the calendar by clicking on it (rather than elsewhere on the
     main page) can be inconvenient.  The scwClickToHide boolean value
     controls this feature. */
    this.m_ClickToHide = false;
    //---------------------------------------------------------------------------
    // End of configuration for the calendar
    //---------------------------------------------------------------------------    
    this.m_ArrMonthNames = '';
    this.m_ArrWeekInits = '';
    this.m_DateValue = '';
    this.m_StartDate = new Date();
    this.m_Today = '';
    
    //  Variables required by both scwShow and scwShowMonth
    var scwTargetEle, scwTriggerEle, scwMonthSum = 0, scwBlnFullInputDate = false, scwPassEnabledDay = new Array(), scwSeedDate = new Date(), scwParmActiveToday = true, scwClear, scwDrag, scwInvalidDateMsg, scwOutOfRangeMsg, scwDoesNotExistMsg, scwInvalidAlert, scwDateDisablingError, scwRangeDisablingError;
    
    thisObj.m_WeekStart = thisObj.m_WeekStart % 7;
    
    // Use a global variable for the return value from the next action
    // IE fails to pass the function through if the target element is in
    // a form and scwNextAction is not defined.
    var scwNextActionReturn, scwNextAction;
    
    
    
    this.f_setDefaultLanguage = function()
    {
        try {
            thisObj.f_setLanguage();
        } 
        catch (exception) {// English
            thisObj.m_Today = 'today:';
            thisObj.m_Clear = 'Clear';
            thisObj.m_Drag = 'click here to drag';
            thisObj.m_ArrMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            thisObj.m_ArrWeekInits = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            thisObj.m_InvalidDateMsg = 'The entered date is invalid.\n';
            thisObj.m_OutOfRangeMsg = 'The entered date is out of range.';
            thisObj.m_DoesNotExistMsg = 'The entered date does not exist.';
            thisObj.m_InvalidAlert = ['Invalid date (', ') ignored.'];
            thisObj.m_DateDisablingError = ['Error ', ' is not a Date object.'];
            thisObj.m_RangeDisablingError = ['Error ', ' should consist of two elements.'];
        }
    }
    
    this.f_setLanguage = function()
    {
        thisObj.m_Today = 'today:';
        thisObj.m_Clear = 'Clear';
        thisObj.m_ArrMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        thisObj.m_ArrWeekInits = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        thisObj.m_InvalidDateMsg = 'The entered date is invalid.\n';
        thisObj.m_OutOfRangeMsg = 'The entered date is out of range.';
        thisObj.m_DoesNotExistMsg = 'The entered date does not exist.';
        thisObj.m_InvalidAlert = ['Invalid date (', ') ignored.'];
        thisObj.m_DateDisablingError = ['Error ', ' is not a Date object.'];
        thisObj.m_RangeDisablingError = ['Error ', ' should consist of two elements.'];
    }
    
    this.f_showCal = function(ele, source)
    {
        thisObj.f_show(ele, source);
    }
    
    this.f_eventTrigger = function(evt)
    {
        if (!evt) {
            evt = event;
        }
        return evt.target || evt.srcElement;
    }
    
    this.f_hide = function()
    {
        g_xbObj.f_xbID('scw').style.visibility = 'hidden';
        g_xbObj.f_xbID('scwIframe').style.visibility = 'hidden';
        if (typeof scwNextAction != 'undefined' && scwNextAction != null) {
            scwNextActionReturn = scwNextAction();
            // Explicit null set to prevent closure causing memory leak
            scwNextAction = null;
        }
    }
    
    this.f_cancel = function(evt)
    {
        if (thisObj.m_ClickToHide) {
            thisObj.f_hide();
        }
        thisObj.f_stopPropagation(evt);
    }
    
    this.f_stopPropagation = function(evt)
    {
        if (evt.stopPropagation) { // Capture phase
            evt.stopPropagation();
        } else { // Bubbling phase
            evt.cancelBubble = true;
        }
    }
    
    this.f_changeClass = function(evt)
    {
        var ele = thisObj.f_eventTrigger(evt);
        
        if (ele.nodeType == 3) {
            ele = ele.parentNode;
        }
        
        switch (ele.className) {
            case 'scwCells':
                ele.className = 'scwCellsHover';
                break;
            case 'scwCellsHover':
                ele.className = 'scwCells';
                break;
            case 'scwCellsExMonth':
                ele.className = 'scwCellsExMonthHover';
                break;
            case 'scwCellsExMonthHover':
                ele.className = 'scwCellsExMonth';
                break;
            case 'scwCellsWeekend':
                ele.className = 'scwCellsWeekendHover';
                break;
            case 'scwCellsWeekendHover':
                ele.className = 'scwCellsWeekend';
                break;
            case 'scwNow':
                ele.className = 'scwNowHover';
                break;
            case 'scwNowHover':
                ele.className = 'scwNow';
                break;
            case 'scwInputDate':
                ele.className = 'scwInputDateHover';
                break;
            case 'scwInputDateHover':
                ele.className = 'scwInputDate';
        }
        
        return true;
    }
    
    this.f_setOutput = function(outputDate)
    {
        if (typeof scwTargetEle.value == 'undefined') {
            scwTriggerEle.scwTextNode.replaceData(0, scwTriggerEle.scwLength, thisObj.f_dateFormat(outputDate, thisObj.m_DateOutputFormat));
        } else {
            scwTargetEle.value = thisObj.f_dateFormat(outputDate, thisObj.m_DateOutputFormat);
        }
        thisObj.f_hide();
    }
    
    this.f_cellOutput = function(evt)
    {
        var scwEle = thisObj.f_eventTrigger(evt), scwOutputDate = new Date(thisObj.m_StartDate);
        
        if (scwEle.nodeType == 3) 
            scwEle = scwEle.parentNode;
        
        scwOutputDate.setDate(thisObj.m_StartDate.getDate() + parseInt(scwEle.id.substr(8), 10));
        
        thisObj.f_setOutput(scwOutputDate);
    }
    
    this.f_nowOutput = function()
    {
        thisObj.f_setOutput(thisObj.m_DateNow);
    }
    
    this.f_weekNumber = function(scwInDate)
    {// The base day in the week of the input date
        var scwInDateWeekBase = new Date(scwInDate);
        
        scwInDateWeekBase.setDate(scwInDateWeekBase.getDate() -
        scwInDateWeekBase.getDay() +
        thisObj.m_WeekNumberBaseDay +
        ((scwInDate.getDay() >
        thisObj.m_WeekNumberBaseDay) ? 7 : 0));
        
        // The first Base Day in the year
        var scwFirstBaseDay = new Date(scwInDateWeekBase.getFullYear(), 0, 1);
        
        scwFirstBaseDay.setDate(scwFirstBaseDay.getDate() -
        scwFirstBaseDay.getDay() +
        thisObj.m_WeekNumberBaseDay);
        
        if (scwFirstBaseDay < new Date(scwInDateWeekBase.getFullYear(), 0, 1)) {
            scwFirstBaseDay.setDate(scwFirstBaseDay.getDate() + 7);
        }
        
        // Start of Week 01
        var scwStartWeekOne = new Date(scwFirstBaseDay -
        thisObj.m_WeekNumberBaseDay +
        scwInDate.getDay());
        
        if (scwStartWeekOne > scwFirstBaseDay) {
            scwStartWeekOne.setDate(scwStartWeekOne.getDate() - 7);
        }
        
        // Subtract the date of the current week from the date of the
        // first week of the year to get the number of weeks in
        // milliseconds.  Divide by the number of milliseconds
        // in a week then round to no decimals in order to remove
        // the effect of daylight saving.  Add one to make the first
        // week, week 1.  Place a string zero on the front so that
        // week numbers are zero filled.
        
        var scwWeekNo = '0' + (Math.round((scwInDateWeekBase - scwFirstBaseDay) / 604800000, 0) + 1);
        
        // Return the last two characters in the week number string
        
        return scwWeekNo.substring(scwWeekNo.length - 2, scwWeekNo.length);
    }
    
    this.f_showMonth = function(scwBias)
    { // Set the selectable Month and Year      
        var scwShowDate = new Date(Date.parse(new Date().toDateString()));
        thisObj.m_StartDate = new Date();
        
        // Set the time to the middle of the day so that the handful of
        // regions that have daylight saving shifts that change the day
        // of the month (i.e. turn the clock back at midnight or forward
        // at 23:00) do not mess up the date display in the calendar.
        scwShowDate.setHours(12);
        
        scwSelYears = g_xbObj.f_xbID('scwYears');
        scwSelMonths = g_xbObj.f_xbID('scwMonths');
        
        if (scwSelYears.options.selectedIndex > -1) {
            scwMonthSum = 12 * (scwSelYears.options.selectedIndex) + scwBias;
            if (scwSelMonths.options.selectedIndex > -1) {
                scwMonthSum += scwSelMonths.options.selectedIndex;
            }
        } else {
            if (scwSelMonths.options.selectedIndex > -1) {
                scwMonthSum += scwSelMonths.options.selectedIndex;
            }
        }
        
        scwShowDate.setFullYear(thisObj.m_BaseYear + Math.floor(scwMonthSum / 12), (scwMonthSum % 12), 1);
        
        // If the Week numbers are displayed, shift the week day names to the right.
        g_xbObj.f_xbID('scwWeek_').style.display = (thisObj.m_WeekNumberDisplay) ? '' : 'none';
        
        // Opera has a bug with setting the selected index.
        // It requires the following work-around to force SELECTs to display correctly.
        if (window.opera) {
            g_xbObj.f_xbID('scwMonths').style.display = 'inherit';
            g_xbObj.f_xbID('scwYears').style.display = 'inherit';
        }
        
        // Set the drop down boxes.
        scwTemp = (12 * parseInt((scwShowDate.getFullYear() - thisObj.m_BaseYear), 10)) + parseInt(scwShowDate.getMonth(), 10);
        
        if (scwTemp > -1 && scwTemp < (12 * thisObj.m_DropDownYears)) {
            scwSelYears.options.selectedIndex = Math.floor(scwMonthSum / 12);
            scwSelMonths.options.selectedIndex = (scwMonthSum % 12);
            
            scwCurMonth = scwShowDate.getMonth();
            
            scwShowDate.setDate((((scwShowDate.getDay() -
            thisObj.m_WeekStart) <
            0) ? -6 : 1) +
            thisObj.m_WeekStart -
            scwShowDate.getDay());
            
            var scwCompareDateValue = new Date(scwShowDate.getFullYear(), scwShowDate.getMonth(), scwShowDate.getDate()).valueOf();
            
            thisObj.m_StartDate = new Date(scwShowDate);
            
            if ((new Date(thisObj.m_BaseYear + thisObj.m_DropDownYears, 0, 0)) > thisObj.m_DateNow &&
            (new Date(thisObj.m_BaseYear, 0, 0)) < thisObj.m_DateNow) {
                var scwNow = g_xbObj.f_xbID('scwNow');
                
                if (thisObj.m_DisabledDates.length == 0) {
                    if (thisObj.m_ActiveToday && scwParmActiveToday) {
                        scwNow.onclick = thisObj.f_nowOutput;
                        scwNow.className = 'scwNow';
                        
                        if (g_xbObj.f_xbID('scwIE')) {
                            scwNow.onmouseover = thisObj.f_changeClass;
                            scwNow.onmouseout = thisObj.f_changeClass;
                        }
                    } else {
                        scwNow.onclick = null;
                        scwNow.className = 'scwNowDisabled';
                        
                        if (g_xbObj.f_xbID('scwIE')) {
                            scwNow.onmouseover = null;
                            scwNow.onmouseout = null;
                        }
                        
                        if (document.addEventListener) {
                            scwNow.addEventListener('click', thisObj.f_stopPropagation, false);
                        } else {
                            scwNow.attachEvent('onclick', thisObj.f_stopPropagation);
                        }
                    }
                } else {
                    for (var k = 0; k < thisObj.m_DisabledDates.length; k++) {
                        if (!thisObj.m_ActiveToday || !scwParmActiveToday ||
                        ((typeof thisObj.m_DisabledDates[k] == 'object') &&
                        (((thisObj.m_DisabledDates[k].constructor == Date) &&
                        thisObj.m_DateNow.valueOf() == thisObj.m_DisabledDates[k].valueOf()) ||
                        ((thisObj.m_DisabledDates[k].constructor == Array) &&
                        thisObj.m_DateNow.valueOf() >= thisObj.m_DisabledDates[k][0].valueOf() &&
                        thisObj.m_DateNow.valueOf() <= thisObj.m_DisabledDates[k][1].valueOf())))) {
                            scwNow.onclick = null;
                            scwNow.className = 'scwNowDisabled';
                            
                            if (g_xbObj.f_xbID('scwIE')) {
                                scwNow.onmouseover = null;
                                scwNow.onmouseout = null;
                            }
                            
                            if (document.addEventListener) {
                                scwNow.addEventListener('click', thisObj.f_stopPropagation, false);
                            } else {
                                scwNow.attachEvent('onclick', thisObj.f_stopPropagation);
                            }
                            break;
                        } else {
                            scwNow.onclick = thisObj.f_nowOutput;
                            scwNow.className = 'scwNow';
                            
                            if (g_xbObj.f_xbID('scwIE')) {
                                scwNow.onmouseover = thisObj.f_changeClass;
                                scwNow.onmouseout = thisObj.f_changeClass;
                            }
                        }
                    }
                }
            }
            
            // Treewalk to display the dates.
            // I tried to use getElementsByName but IE refused to cooperate
            // so I resorted to this method which works for all tested
            // browsers.
            
            var scwCells = g_xbObj.f_xbID('scwCells');
            
            for (i = 0; i < scwCells.childNodes.length; i++) {
                var scwRows = scwCells.childNodes[i];
                if (scwRows.nodeType == 1 && scwRows.tagName == 'TR') {
                    if (thisObj.m_WeekNumberDisplay) {//Calculate the week number using scwShowDate
                        scwTmpEl = scwRows.childNodes[0];
                        scwTmpEl.innerHTML = thisObj.f_weekNumber(scwShowDate);
                        scwTmpEl.style.borderColor = (scwTmpEl.currentStyle) ? scwTmpEl.currentStyle['backgroundColor'] : (window.getComputedStyle) ? document.defaultView.getComputedStyle(scwTmpEl, null).getPropertyValue('background-color') : '';
                        scwTmpEl.style.display = '';
                    } else {
                        scwRows.childNodes[0].style.display = 'none';
                    }
                    
                    for (j = 1; j < scwRows.childNodes.length; j++) {
                        var scwCols = scwRows.childNodes[j];
                        if (scwCols.nodeType == 1 && scwCols.tagName == 'TD') {
                            scwRows.childNodes[j].innerHTML = scwShowDate.getDate();
                            var scwCell = scwRows.childNodes[j], scwDisabled = ((thisObj.m_OutOfRangeDisable &&
                            (scwShowDate <
                            (new Date(thisObj.m_BaseYear, 0, 1, scwShowDate.getHours())) ||
                            scwShowDate >
                            (new Date(thisObj.m_BaseYear +
                            thisObj.m_DropDownYears, 0, 0, scwShowDate.getHours())))) ||
                            (thisObj.m_OutOfMonthDisable &&
                            (scwShowDate <
                            (new Date(scwShowDate.getFullYear(), scwCurMonth, 1, scwShowDate.getHours())) ||
                            scwShowDate >
                            (new Date(scwShowDate.getFullYear(), scwCurMonth + 1, 0, scwShowDate.getHours()))))) ? true : false;
                            
                            scwCell.style.visibility = (thisObj.m_OutOfMonthHide &&
                            (scwShowDate <
                            (new Date(scwShowDate.getFullYear(), scwCurMonth, 1, scwShowDate.getHours())) ||
                            scwShowDate >
                            (new Date(scwShowDate.getFullYear(), scwCurMonth + 1, 0, scwShowDate.getHours())))) ? 'hidden' : 'inherit';
                            
                            for (var k = 0; k < thisObj.m_DisabledDates.length; k++) {
                                if ((typeof thisObj.m_DisabledDates[k] == 'object') &&
                                (thisObj.m_DisabledDates[k].constructor == Date) &&
                                scwCompareDateValue == thisObj.m_DisabledDates[k].valueOf()) {
                                    scwDisabled = true;
                                } else {
                                    if ((typeof thisObj.m_DisabledDates[k] == 'object') &&
                                    (thisObj.m_DisabledDates[k].constructor == Array) &&
                                    scwCompareDateValue >= thisObj.m_DisabledDates[k][0].valueOf() &&
                                    scwCompareDateValue <= thisObj.m_DisabledDates[k][1].valueOf()) {
                                        scwDisabled = true;
                                    }
                                }
                            }
                            
                            if (scwDisabled ||
                            !thisObj.m_EnabledDay[j - 1 + (7 * ((i * scwCells.childNodes.length) / 6))] ||
                            !scwPassEnabledDay[(j - 1 + (7 * (i * scwCells.childNodes.length / 6))) % 7]) {
                                scwRows.childNodes[j].onclick = null;
                                
                                if (g_xbObj.f_xbID('scwIE')) {
                                    scwRows.childNodes[j].onmouseover = null;
                                    scwRows.childNodes[j].onmouseout = null;
                                }
                                
                                scwCell.className = (scwShowDate.getMonth() != scwCurMonth) ? 'scwCellsExMonthDisabled' : (scwBlnFullInputDate &&
                                scwShowDate.toDateString() ==
                                scwSeedDate.toDateString()) ? 'scwInputDateDisabled' : (scwShowDate.getDay() % 6 == 0) ? 'scwCellsWeekendDisabled' : 'scwCellsDisabled';
                                
                                scwCell.style.borderColor = (thisObj.m_FormatTodayCell && scwShowDate.toDateString() == thisObj.m_DateNow.toDateString()) ? thisObj.m_TodayCellBorderColour : (scwCell.currentStyle) ? scwCell.currentStyle['backgroundColor'] : (window.getComputedStyle) ? document.defaultView.getComputedStyle(scwCell, null).getPropertyValue('background-color') : '';
                            } else {
                                scwRows.childNodes[j].onclick = thisObj.f_cellOutput;
                                
                                if (g_xbObj.f_xbID('scwIE')) {
                                    scwRows.childNodes[j].onmouseover = thisObj.f_changeClass;
                                    scwRows.childNodes[j].onmouseout = thisObj.f_changeClass;
                                }
                                
                                scwCell.className = (scwShowDate.getMonth() != scwCurMonth) ? 'scwCellsExMonth' : (scwBlnFullInputDate &&
                                scwShowDate.toDateString() ==
                                scwSeedDate.toDateString()) ? 'scwInputDate' : (scwShowDate.getDay() % 6 == 0) ? 'scwCellsWeekend' : 'scwCells';
                                
                                scwCell.style.borderColor = (thisObj.m_FormatTodayCell && scwShowDate.toDateString() == this.m_DateNow.toDateString()) ? thisObj.m_TodayCellBorderColour : (scwCell.currentStyle) ? scwCell.currentStyle['backgroundColor'] : (window.getComputedStyle) ? document.defaultView.getComputedStyle(scwCell, null).getPropertyValue('background-color') : '';
                            }
                            
                            scwShowDate.setDate(scwShowDate.getDate() + 1);
                            scwCompareDateValue = new Date(scwShowDate.getFullYear(), scwShowDate.getMonth(), scwShowDate.getDate()).valueOf();
                        }
                    }
                }
            }
        }
        
        // Opera has a bug with setting the selected index.
        // It requires the following work-around to force SELECTs to display correctly.
        // Also Opera's poor dynamic rendering prior to 9.5 requires
        // the visibility to be reset to prevent garbage in the calendar
        // when the displayed month is changed.
        
        if (window.opera) {
            g_xbObj.f_xbID('scwMonths').style.display = 'inline';
            g_xbObj.f_xbID('scwYears').style.display = 'inline';
            g_xbObj.f_xbID('scw').style.visibility = 'hidden';
            g_xbObj.f_xbID('scw').style.visibility = 'inherit';
        }
    }
    
    this.f_inputFormat = function()
    {
        var scwArrSeed = new Array(), scwArrInput = thisObj.m_DateValue.split(new RegExp('[\\' + thisObj.m_ArrDelimiters.join('\\') + ']+', 'g'));
        
        // "Escape" all the user defined date delimiters above -
        // several delimiters will need it and it does no harm for
        // the others.
        
        // Strip any empty array elements (caused by delimiters)
        // from the beginning or end of the array. They will
        // still appear in the output string if in the output
        // format.
        
        if (scwArrInput[0] != null) {
            if (scwArrInput[0].length == 0) {
                scwArrInput.splice(0, 1);
            }
            if (scwArrInput[scwArrInput.length - 1].length == 0) {
                scwArrInput.splice(scwArrInput.length - 1, 1);
            }
        }
        
        scwBlnFullInputDate = false;
        
        thisObj.m_DateOutputFormat = thisObj.m_DateOutputFormat.toUpperCase();
        
        // List all the allowed letters in the date format
        var template = ['D', 'M', 'Y'];
        
        // Prepare the sequence of date input elements
        var result = new Array();
        
        for (var i = 0; i < template.length; i++) {
            if (thisObj.m_DateOutputFormat.search(template[i]) > -1) {
                result[thisObj.m_DateOutputFormat.search(template[i])] = template[i];
            }
        }
        
        var scwDateSequence = result.join('');
        
        // Separate the elements of the date input
        switch (scwArrInput.length) {
            case 1:{
                if (thisObj.m_DateOutputFormat.indexOf('Y') > -1 &&
                scwArrInput[0].length > thisObj.m_DateOutputFormat.lastIndexOf('Y')) {
                    scwArrSeed[0] = parseInt(scwArrInput[0].substring(thisObj.m_DateOutputFormat.indexOf('Y'), thisObj.m_DateOutputFormat.lastIndexOf('Y') + 1), 10);
                } else {
                    scwArrSeed[0] = 0;
                }
                
                if (thisObj.m_DateOutputFormat.indexOf('M') > -1 &&
                scwArrInput[0].length > thisObj.m_DateOutputFormat.lastIndexOf('M')) {
                    scwArrSeed[1] = scwArrInput[0].substring(thisObj.m_DateOutputFormat.indexOf('M'), thisObj.m_DateOutputFormat.lastIndexOf('M') + 1);
                } else {
                    scwArrSeed[1] = '6';
                }
                
                if (thisObj.m_DateOutputFormat.indexOf('D') > -1 &&
                scwArrInput[0].length > thisObj.m_DateOutputFormat.lastIndexOf('D')) {
                    scwArrSeed[2] = parseInt(scwArrInput[0].substring(thisObj.m_DateOutputFormat.indexOf('D'), thisObj.m_DateOutputFormat.lastIndexOf('D') + 1), 10);
                } else {
                    scwArrSeed[2] = 1;
                }
                
                if (scwArrInput[0].length == thisObj.m_DateOutputFormat.length) {
                    scwBlnFullInputDate = true;
                }
                break;
            }
            case 2:{// Year and Month entry
                scwArrSeed[0] = parseInt(scwArrInput[scwDateSequence.replace(/D/i, '').search(/Y/i)], 10); // Year
                scwArrSeed[1] = scwArrInput[scwDateSequence.replace(/D/i, '').search(/M/i)]; // Month
                scwArrSeed[2] = 1; // Day
                break;
            }
            case 3:{// Day Month and Year entry
                scwArrSeed[0] = parseInt(scwArrInput[scwDateSequence.search(/Y/i)], 10); // Year
                scwArrSeed[1] = scwArrInput[scwDateSequence.search(/M/i)]; // Month
                scwArrSeed[2] = parseInt(scwArrInput[scwDateSequence.search(/D/i)], 10); // Day
                scwBlnFullInputDate = true;
                break;
            }
            default:
                {// A stuff-up has led to more than three elements in
                    // the date.
                    scwArrSeed[0] = 0; // Year
                    scwArrSeed[1] = 0; // Month
                    scwArrSeed[2] = 0; // Day
                }
        }
        
        // These regular expressions validate the input date format
        // to the following rules;
        //         Day   1-31 (optional zero on single digits)
        //         Month 1-12 (optional zero on single digits)
        //                     or case insensitive name
        //         Year  One, Two or four digits
        
        // Months names are as set in the language-dependent
        // definitions and delimiters are set just below there
        
        var scwExpValDay = new RegExp('^(0?[1-9]|[1-2][0-9]|3[0-1])$'), scwExpValMonth = new RegExp('^(0?[1-9]|1[0-2]|' +
        this.m_ArrMonthNames.join('|') +
        ')$', 'i'), scwExpValYear = new RegExp('^([0-9]{1,2}|[0-9]{4})$');
        
        // Apply validation and report failures
        
        if (scwExpValYear.exec(scwArrSeed[0]) == null ||
        scwExpValMonth.exec(scwArrSeed[1]) == null ||
        scwExpValDay.exec(scwArrSeed[2]) == null) {
            if (thisObj.m_ShowInvalidDateMsg) {
                alert(scwInvalidDateMsg +
                scwInvalidAlert[0] +
                thisObj.m_DateValue +
                scwInvalidAlert[1]);
            }
            scwBlnFullInputDate = false;
            scwArrSeed[0] = thisObj.m_BaseYear +
            Math.floor(thisObj.m_DropDownYears / 2); // Year
            scwArrSeed[1] = '6'; // Month
            scwArrSeed[2] = 1; // Day
        }
        
        // Return the  Year    in scwArrSeed[0]
        //             Month   in scwArrSeed[1]
        //             Day     in scwArrSeed[2]
        
        return scwArrSeed;
    }
    
    this.f_show = function(scwEle, scwSource)
    {
        if (!scwSource) {
            scwSource = window.event;
        }
        
        if (scwSource.tagName) // Second parameter isn't an event it's an element
        {
            var scwSourceEle = scwSource;
            
            if (g_xbObj.f_xbID('scwIE')) {
                window.event.cancelBubble = true;
            } else {
                scwSourceEle.parentNode.addEventListener('click', thisObj.f_stopPropagation, false);
            }
        } else // Second parameter is an event
        {
            var scwSourceEle = (scwSource.target) ? scwSource.target : scwSource.srcElement;
            
            // Stop the click event that opens the calendar from bubbling up to
            // the document-level event handler that hides it!
            if (scwSource.stopPropagation) {
                scwSource.stopPropagation();
            } else {
                scwSource.cancelBubble = true;
            }
        }
        
        scwTriggerEle = scwSourceEle;
        
        // Take any parameters that there might be from the third onwards as
        // day numbers to be disabled 0 = Sunday through to 6 = Saturday.
        
        scwParmActiveToday = true;
        
        for (var i = 0; i < 7; i++) {
            scwPassEnabledDay[(i + 7 - thisObj.m_WeekStart) % 7] = true;
            for (var j = 2; j < arguments.length; j++) {
                if (arguments[j] == i) {
                    scwPassEnabledDay[(i + 7 - thisObj.m_WeekStart) % 7] = false;
                    if (thisObj.m_DateNow.getDay() == i) {
                        scwParmActiveToday = false;
                    }
                }
            }
        }
        
        //   If no value is preset then the seed date is
        //      Today (when today is in range) OR
        //      The middle of the date range.
        
        scwSeedDate = thisObj.m_DateNow;
        
        // Find the date and Strip space characters from start and
        // end of date input.
        thisObj.m_DateValue = '';
        if (scwEle.value) {
            thisObj.m_DateValue = scwEle.value.replace(/^\s+/, '').replace(/\s+$/, '');
        } else {
            if (typeof scwEle.value == 'undefined') {
                var scwChildNodes = scwEle.childNodes;
                for (var i = 0; i < scwChildNodes.length; i++) {
                    if (scwChildNodes[i].nodeType == 3) {
                        thisObj.m_DateValue = scwChildNodes[i].nodeValue.replace(/^\s+/, '').replace(/\s+$/, '');
                        if (thisObj.m_DateValue.length > 0) {
                            scwTriggerEle.scwTextNode = scwChildNodes[i];
                            scwTriggerEle.scwLength = scwChildNodes[i].nodeValue.length;
                            break;
                        }
                    }
                }
            }
        }
        
        // Set the language-dependent elements
        
        thisObj.f_setDefaultLanguage();
        
        g_xbObj.f_xbID('scwDragText').innerHTML = scwDrag;
        
        g_xbObj.f_xbID('scwMonths').options.length = 0;
        for (var i = 0; i < thisObj.m_ArrMonthNames.length; i++) {
            g_xbObj.f_xbID('scwMonths').options[i] = new Option(thisObj.m_ArrMonthNames[i], thisObj.m_ArrMonthNames[i]);
        }
        
        g_xbObj.f_xbID('scwYears').options.length = 0;
        for (var i = 0; i < thisObj.m_DropDownYears; i++) {
            g_xbObj.f_xbID('scwYears').options[i] = new Option((thisObj.m_BaseYear + i), (thisObj.m_BaseYear + i));
        }
        
        for (var i = 0; i < thisObj.m_ArrWeekInits.length; i++) {
            g_xbObj.f_xbID('scwWeekInit' + i).innerHTML = thisObj.m_ArrWeekInits[(i + thisObj.m_WeekStart) % thisObj.m_ArrWeekInits.length];
        }
        
        if (((new Date(thisObj.m_BaseYear + thisObj.m_DropDownYears, 0, 0)) > thisObj.m_DateNow &&
        (new Date(thisObj.m_BaseYear, 0, 0)) < thisObj.m_DateNow) ||
        (thisObj.m_ClearButton && (scwEle.readOnly || scwEle.disabled))) {
            g_xbObj.f_xbID('scwFoot').style.display = '';
            g_xbObj.f_xbID('scwNow').innerHTML = thisObj.m_Today + ' ' + thisObj.f_dateFormat(thisObj.m_DateNow, thisObj.m_DateDisplayFormat);
            g_xbObj.f_xbID('scwClearButton').value = scwClear;
            if ((new Date(thisObj.m_BaseYear + thisObj.m_DropDownYears, 0, 0)) > thisObj.m_DateNow &&
            (new Date(thisObj.m_BaseYear, 0, 0)) < thisObj.m_DateNow) {
                g_xbObj.f_xbID('scwNow').style.display = '';
                if (thisObj.m_ClearButton && (scwEle.readOnly || scwEle.disabled)) {
                    g_xbObj.f_xbID('scwClear').style.display = '';
                    g_xbObj.f_xbID('scwClear').style.textAlign = 'left';
                    g_xbObj.f_xbID('scwNow').style.textAlign = 'right';
                } else {
                    g_xbObj.f_xbID('scwClear').style.display = 'none';
                    g_xbObj.f_xbID('scwNow').style.textAlign = 'center';
                }
            } else {
                g_xbObj.f_xbID('scwClear').style.textAlign = 'center';
                g_xbObj.f_xbID('scwClear').style.display = '';
                g_xbObj.f_xbID('scwNow').style.display = 'none';
            }
        } else {
            g_xbObj.f_xbID('scwFoot').style.display = 'none';
        }
        
        if (thisObj.m_DateValue.length == 0) {// If no value is entered and today is within the range,
            // use today's date, otherwise use the middle of the valid range.
            
            scwBlnFullInputDate = false;
            
            if ((new Date(thisObj.m_BaseYear + thisObj.m_DropDownYears, 0, 0)) < scwSeedDate ||
            (new Date(thisObj.m_BaseYear, 0, 1)) > scwSeedDate) {
                scwSeedDate = new Date(thisObj.m_BaseYear + Math.floor(thisObj.m_DropDownYears / 2), 5, 1);
            }
        } else {
        
        
            // Parse the string into an array using the allowed delimiters
            
            scwArrSeedDate = thisObj.f_inputFormat();
            
            // So now we have the Year, Month and Day in an array.
            
            //   If the year is one or two digits then the routine assumes a
            //   year belongs in the 21st Century unless it is less than 50
            //   in which case it assumes the 20th Century is intended.
            
            if (scwArrSeedDate[0] < 100) {
                scwArrSeedDate[0] += (scwArrSeedDate[0] > 50) ? 1900 : 2000;
            }
            
            // Check whether the month is in digits or an abbreviation
            
            if (scwArrSeedDate[1].search(/\d+/) < 0) {
                for (i = 0; i < thisObj.m_ArrMonthNames.length; i++) {
                    if (scwArrSeedDate[1].toUpperCase() == thisObj.m_ArrMonthNames[i].toUpperCase()) {
                        scwArrSeedDate[1] = i + 1;
                        break;
                    }
                }
            }
            
            scwSeedDate = new Date(scwArrSeedDate[0], scwArrSeedDate[1] - 1, scwArrSeedDate[2]);
        }
        
        // Test that we have arrived at a valid date
        
        if (isNaN(scwSeedDate)) {
            if (thisObj.m_ShowInvalidDateMsg) {
                alert(scwInvalidDateMsg + scwInvalidAlert[0] + thisObj.m_DateValue + scwInvalidAlert[1]);
            }
            scwSeedDate = new Date(thisObj.m_BaseYear + Math.floor(thisObj.m_DropDownYears / 2), 5, 1);
            scwBlnFullInputDate = false;
        } else {// Test that the date is within range,
            // if not then set date to a sensible date in range.
            
            if ((new Date(thisObj.m_BaseYear, 0, 1)) > scwSeedDate) {
                if (this.m_BlnStrict && thisObj.m_ShowOutOfRangeMsg) {
                    alert(scwOutOfRangeMsg);
                }
                scwSeedDate = new Date(thisObj.m_BaseYear, 0, 1);
                scwBlnFullInputDate = false;
            } else {
                if ((new Date(thisObj.m_BaseYear + thisObj.m_DropDownYears, 0, 0)) < scwSeedDate) {
                    if (this.m_BlnStrict && thisObj.m_ShowOutOfRangeMsg) {
                        alert(scwOutOfRangeMsg);
                    }
                    scwSeedDate = new Date(thisObj.m_BaseYear + Math.floor(thisObj.m_DropDownYears) - 1, 11, 1);
                    scwBlnFullInputDate = false;
                } else {
                    if (this.m_BlnStrict && scwBlnFullInputDate &&
                    (scwSeedDate.getDate() != scwArrSeedDate[2] ||
                    (scwSeedDate.getMonth() + 1) != scwArrSeedDate[1] ||
                    scwSeedDate.getFullYear() != scwArrSeedDate[0])) {
                        if (thisObj.m_ShowDoesNotExistMsg) 
                            alert(scwDoesNotExistMsg);
                        scwSeedDate = new Date(scwSeedDate.getFullYear(), scwSeedDate.getMonth() - 1, 1);
                        scwBlnFullInputDate = false;
                    }
                }
            }
        }
        
        // Test the disabled dates for validity
        // Give error message if not valid.
        
        for (var i = 0; i < thisObj.m_DisabledDates.length; i++) {
            if (!((typeof thisObj.m_DisabledDates[i] == 'object') && (thisObj.m_DisabledDates[i].constructor == Date))) {
                if ((typeof thisObj.m_DisabledDates[i] == 'object') && (thisObj.m_DisabledDates[i].constructor == Array)) {
                    var scwPass = true;
                    
                    if (thisObj.m_DisabledDates[i].length != 2) {
                        if (thisObj.m_ShowRangeDisablingError) {
                            alert(scwRangeDisablingError[0] + thisObj.m_DisabledDates[i] + scwRangeDisablingError[1]);
                        }
                        scwPass = false;
                    } else {
                        for (var j = 0; j < thisObj.m_DisabledDates[i].length; j++) {
                            if (!((typeof thisObj.m_DisabledDates[i][j] == 'object') && (thisObj.m_DisabledDates[i][j].constructor == Date))) {
                                if (thisObj.m_ShowRangeDisablingError) {
                                    alert(scwDateDisablingError[0] + thisObj.m_DisabledDates[i][j] + scwDateDisablingError[1]);
                                }
                                scwPass = false;
                            }
                        }
                    }
                    
                    if (scwPass && (thisObj.m_DisabledDates[i][0] > thisObj.m_DisabledDates[i][1])) {
                        thisObj.m_DisabledDates[i].reverse();
                    }
                } else {
                    if (thisObj.m_ShowRangeDisablingError) {
                        alert(scwDateDisablingError[0] + thisObj.m_DisabledDates[i] + scwDateDisablingError[1]);
                    }
                }
            }
        }
        
        // Calculate the number of months that the entered (or
        // defaulted) month is after the start of the allowed
        // date range.
        
        scwMonthSum = 12 * (scwSeedDate.getFullYear() - thisObj.m_BaseYear) + scwSeedDate.getMonth();
        
        g_xbObj.f_xbID('scwYears').options.selectedIndex = Math.floor(scwMonthSum / 12);
        g_xbObj.f_xbID('scwMonths').options.selectedIndex = (scwMonthSum % 12);
        
        // Check whether or not dragging is allowed and display drag handle if necessary
        
        g_xbObj.f_xbID('scwDrag').style.display = 'none';
        
        // Display the month
        
        thisObj.f_showMonth(0);
        
        // Position the calendar box
        
        // The object sniffing for Opera allows for the fact that Opera
        // is the only major browser that correctly reports the position
        // of an element in a scrollable DIV.  This is because IE and
        // Firefox omit the DIV from the offsetParent tree.
        
        scwTargetEle = scwEle;
        
        var offsetTop = parseInt(scwEle.offsetTop, 10) + parseInt(scwEle.offsetHeight, 10), offsetLeft = parseInt(scwEle.offsetLeft, 10);
        
        if (!window.opera) {
            while (scwEle.tagName != 'BODY' && scwEle.tagName != 'HTML') {
                offsetTop -= parseInt(scwEle.scrollTop, 10);
                offsetLeft -= parseInt(scwEle.scrollLeft, 10);
                scwEle = scwEle.parentNode;
            }
            scwEle = scwTargetEle;
        }
        
        do {
            scwEle = scwEle.offsetParent;
            offsetTop += parseInt(scwEle.offsetTop, 10);
            offsetLeft += parseInt(scwEle.offsetLeft, 10);
        }
        while (scwEle.tagName != 'BODY' && scwEle.tagName != 'HTML');
        
        if (thisObj.m_AutoPosition) {
            var scwWidth = parseInt(g_xbObj.f_xbID('scw').offsetWidth, 10), scwHeight = parseInt(g_xbObj.f_xbID('scw').offsetHeight, 10), scwWindowLeft = (document.body && document.body.scrollLeft) ? document.body.scrollLeft //DOM compliant
 : (document.documentElement && document.documentElement.scrollLeft) ? document.documentElement.scrollLeft //IE6+ standards compliant
 : 0, //Failed
 scwWindowWidth = (typeof(innerWidth) == 'number') ? innerWidth //DOM compliant
 : (document.documentElement && document.documentElement.clientWidth) ? document.documentElement.clientWidth //IE6+ standards compliant
 : (document.body && document.body.clientWidth) ? document.body.clientWidth //IE non-compliant
 : 0, //Failed
 scwWindowTop = (document.body && document.body.scrollTop) ? document.body.scrollTop //DOM compliant
 : (document.documentElement && document.documentElement.scrollTop) ? document.documentElement.scrollTop //IE6+ standards compliant
 : 0, //Failed
 scwWindowHeight = (typeof(innerHeight) == 'number') ? innerHeight //DOM compliant
 : (document.documentElement && document.documentElement.clientHeight) ? document.documentElement.clientHeight //IE6+ standards compliant
 : (document.body && document.body.clientHeight) ? document.body.clientHeight //IE non-compliant
 : 0; //Failed
            offsetLeft -= (offsetLeft - scwWidth + parseInt(scwTargetEle.offsetWidth, 10) >= scwWindowLeft &&
            offsetLeft + scwWidth > scwWindowLeft + scwWindowWidth) ? (scwWidth - parseInt(scwTargetEle.offsetWidth, 10)) : 0;
            
            offsetTop -= (offsetTop - scwHeight - parseInt(scwTargetEle.offsetHeight, 10) >= scwWindowTop &&
            offsetTop + scwHeight > scwWindowTop + scwWindowHeight) ? (scwHeight + parseInt(scwTargetEle.offsetHeight, 10)) : 0;
        }
        
        g_xbObj.f_xbID('scw').style.top = offsetTop + 'px';
        g_xbObj.f_xbID('scw').style.left = offsetLeft + 'px';
        g_xbObj.f_xbID('scwIframe').style.top = offsetTop + 'px';
        g_xbObj.f_xbID('scwIframe').style.left = offsetLeft + 'px';
        
        g_xbObj.f_xbID('scwIframe').style.width = (g_xbObj.f_xbID('scw').offsetWidth - (g_xbObj.f_xbID('scwIE') ? 2 : 4)) + 'px';
        g_xbObj.f_xbID('scwIframe').style.height = (g_xbObj.f_xbID('scw').offsetHeight - (g_xbObj.f_xbID('scwIE') ? 2 : 4)) + 'px';
        g_xbObj.f_xbID('scwIframe').style.visibility = 'inherit';
        
        // Show it on the page
        g_xbObj.f_xbID('scw').style.visibility = 'inherit';
    }
    
    this.f_doLayout = function()
    {
        document.writeln("<!--[if IE]><div id='scwIE'></div><![endif]-->");
        document.writeln("<!--[if lt IE 7]><div id='scwIElt7'></div><![endif]-->");
        document.write("<iframe class='scw' " + (g_xbObj.f_xbID('scwIElt7') ? "src='/scwblank.html '" : '') +
        "id='scwIframe' name='scwIframe' frameborder='0'>" +
        "</iframe>" +
        "<table id='scw' class='scw'>" +
        "<tr class='scw'>" +
        "<td class='scw'>" +
        "<table class='scwHead' id='scwHead' width='100%' " +
        "cellspacing='0' cellpadding='0'>" +
        "<tr id='scwDrag' style='display:none;'>" +
        "<td colspan='4' class='scwDrag' " +
        "onmousedown='scwBeginDrag(event);'>" +
        "<span id='scwDragText'></span>" +
        "</td>" +
        "</tr>" +
        "<tr class='scwHead' >" +
        "<td class='scwHead'>" +
        "<input class='scwHead' id='scwHeadLeft' type='button' value='<' " +
        "onclick='g_calObj.f_showMonth(-1);'  /></td>" +
        "<td class='scwHead'>" +
        "<select id='scwMonths' class='scwHead' " +
        "onchange='g_calObj.f_showMonth(0);'>" +
        "</select>" +
        "</td>" +
        "<td class='scwHead'>" +
        "<select id='scwYears' class='scwHead' " +
        "onchange='g_calObj.f_showMonth(0);'>" +
        "</select>" +
        "</td>" +
        "<td class='scwHead'>" +
        "<input class='scwHead' id='scwHeadRight' type='button' value='>' " +
        "onclick='g_calObj.f_showMonth(1);' /></td>" +
        "</tr>" +
        "</table>" +
        "</td>" +
        "</tr>" +
        "<tr class='scw'>" +
        "<td class='scw'>" +
        "<table class='scwCells' align='center'>" +
        "<thead>" +
        "<tr><td class='scwWeekNumberHead' id='scwWeek_' ></td>");
        
        for (i = 0; i < 7; i++) {
            document.write("<td class='scwWeek' id='scwWeekInit" + i + "'></td>");
        }
        
        document.write("</tr>" +
        "</thead>" +
        "<tbody id='scwCells' onClick='g_calObj.f_stopPropagation(event);'>");
        
        for (i = 0; i < 6; i++) {
            document.write("<tr>" +
            "<td class='scwWeekNo' id='scwWeek_" +
            i +
            "'></td>");
            for (j = 0; j < 7; j++) {
                document.write("<td class='scwCells' id='scwCell_" + (j + (i * 7)) +
                "'></td>");
            }
            
            document.write("</tr>");
        }
        
        document.write("</tbody>" +
        "<tfoot>" +
        "<tr id='scwFoot'>" +
        "<td colspan='8' style='padding:0px;'>" +
        "<table width='100%'>" +
        "<tr>" +
        "<td id='scwClear' class='scwClear'>" +
        "<input type='button' id='scwClearButton' class='scwClear' " +
        "onclick='scwTargetEle.value = \"\";f_hide();' />" +
        "</td>" +
        "<td class='scwNow' id='scwNow'></td>" +
        "</tr>" +
        "</table>" +
        "</td>" +
        "</tr>" +
        "</tfoot>" +
        "</table>" +
        "</td>" +
        "</tr>" +
        "</table>");
        
        if (document.addEventListener) {
            g_xbObj.f_xbID('scw').addEventListener('click', thisObj.f_cancel, false);
            g_xbObj.f_xbID('scwHeadLeft').addEventListener('click', thisObj.f_stopPropagation, false);
            g_xbObj.f_xbID('scwMonths').addEventListener('click', thisObj.f_stopPropagation, false);
            g_xbObj.f_xbID('scwMonths').addEventListener('change', thisObj.f_stopPropagation, false);
            g_xbObj.f_xbID('scwYears').addEventListener('click', thisObj.f_stopPropagation, false);
            g_xbObj.f_xbID('scwYears').addEventListener('change', thisObj.f_stopPropagation, false);
            g_xbObj.f_xbID('scwHeadRight').addEventListener('click', thisObj.f_stopPropagation, false);
        } else {
            g_xbObj.f_xbID('scw').attachEvent('onclick', thisObj.f_cancel);
            g_xbObj.f_xbID('scwHeadLeft').attachEvent('onclick', thisObj.f_stopPropagation);
            g_xbObj.f_xbID('scwMonths').attachEvent('onclick', thisObj.f_stopPropagation);
            g_xbObj.f_xbID('scwMonths').attachEvent('onchange', thisObj.f_stopPropagation);
            g_xbObj.f_xbID('scwYears').attachEvent('onclick', thisObj.f_stopPropagation);
            g_xbObj.f_xbID('scwYears').attachEvent('onchange', thisObj.f_stopPropagation);
            g_xbObj.f_xbID('scwHeadRight').attachEvent('onclick', thisObj.f_stopPropagation);
        }
        
        // ***************************
        //  End of Calendar structure
        // ***************************
        // ****************************************
        // Start of document level event definition
        // ****************************************
        
        if (document.addEventListener) {
            document.addEventListener('click', thisObj.f_hide, false);
        } else {
            document.attachEvent('onclick', thisObj.f_hide);
        }
    }
    
    this.f_dateFormat = function(date, scwFormat)
    {
        var charCount = 0, codeChar = '', result = '';
        
        for (var i = 0; i <= scwFormat.length; i++) {
            if (i < scwFormat.length && scwFormat.charAt(i) == codeChar) {// If we haven't hit the end of the string and
                // the format string character is the same as
                // the previous one, just clock up one to the
                // length of the current element definition
                charCount++;
            } else {
                switch (codeChar) {
                    case 'y':
                    case 'Y':
                        result += (date.getFullYear() %
                        Math.pow(10, charCount)).toString().calPadLeft(charCount);
                        break;
                    case 'm':
                    case 'M':
                        // If we find an M, check the number of them to
                        // determine whether to get the month number or
                        // the month name.
                        result += (charCount < 3) ? (date.getMonth() + 1).toString().calPadLeft(charCount) : thisObj.m_ArrMonthNames[date.getMonth()];
                        break;
                    case 'd':
                    case 'D':
                        // If we find a D, get the date and format it
                        result += date.getDate().toString().calPadLeft(charCount);
                        break;
                    default:
                        // Copy any unrecognised characters across
                        while (charCount-- > 0) {
                            result += codeChar;
                        }
                }
                
                if (i < scwFormat.length) {// Store the character we have just worked on
                    codeChar = scwFormat.charAt(i);
                    charCount = 1;
                }
            }
        }
        return result;
    }
    
}

g_calObj = new FT_calendar();
g_calObj.f_doLayout();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Add a method to left pad zeroes
String.prototype.calPadLeft = function(padToLength)
{
    var result = '';
    for (var i = 0; i < (padToLength - this.length); i++) {
        result += '0';
    }
    return (result + this);
};

// Set up a closure so that any next function can be triggered
// after the calendar has been closed AND that function can take
// arguments.
Function.prototype.runsAfterCal = function()
{
    var func = this, args = new Array(arguments.length);
    
    for (var i = 0; i < args.length; ++i) {
        args[i] = arguments[i];
    }
    
    return function()
    {// concat/join the two argument arrays
        for (var i = 0; i < arguments.length; ++i) {
            args[args.length] = arguments[i];
        }
        return (args.shift() == scwTriggerEle) ? func.apply(this, args) : null;
    };
};
