import { a as __extends, U as Utils } from './Utils-e5be3308.js';
import { select, event } from 'd3';
import 'moment-timezone';
import './EllipsisMenu.js';
import 'split.js';
import { C as ChartComponent } from './ChartComponent-a7f89f69.js';
import { p as pikaday } from './pikaday-b1c00185.js';
import moment from 'moment';
import TimezonePicker from './TimezonePicker.js';

var DateTimePicker = /** @class */ (function (_super) {
    __extends(DateTimePicker, _super);
    function DateTimePicker(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.isValid = true;
        _this.isSettingStartTime = true;
        _this.quickTimeArray = [
            ["Last 15 mins", 15 * 60 * 1000],
            ["Last 30 mins", 30 * 60 * 1000],
            ["Last Hour", 60 * 60 * 1000],
            ["Last 2 Hours", 2 * 60 * 60 * 1000],
            ["Last 4 Hours", 4 * 60 * 60 * 1000],
            ["Last 12 Hours", 12 * 60 * 60 * 1000],
            ["Last 24 Hours", 24 * 60 * 60 * 1000],
            ["Last 7 Days", 7 * 24 * 60 * 60 * 1000],
            ["Last 30 Days", 30 * 24 * 60 * 60 * 1000],
            ["Last 90 Days", 90 * 24 * 60 * 60 * 1000]
        ];
        _this.onSaveOrCancel = function () {
            _this.isSettingStartTime = true;
        };
        return _this;
    }
    // returns -1 if not currently a quicktime
    DateTimePicker.prototype.getCurrentQuickTime = function () {
        var _this = this;
        var matchingQuickTime = this.quickTimeArray.filter(function (quickTimeTuple) {
            return (_this.toMillis - _this.fromMillis === quickTimeTuple[1]);
        });
        if (matchingQuickTime.length !== 1 || this.toMillis !== this.maxMillis) {
            return -1;
        }
        return matchingQuickTime[0][1];
    };
    DateTimePicker.prototype.getQuickTimeText = function (quickTimeMillis) {
        var filteredQuickTime = this.quickTimeArray.filter(function (quickTimeTuple) {
            return (quickTimeMillis === quickTimeTuple[1]);
        });
        if (filteredQuickTime.length !== 1) {
            return null;
        }
        return filteredQuickTime[0][0];
    };
    DateTimePicker.prototype.convertToCalendarDate = function (millis) {
        return this.roundDay(Utils.adjustDateFromTimezoneOffset(Utils.offsetFromUTC(new Date(millis), this.chartOptions.offset)));
    };
    DateTimePicker.prototype.setNewOffset = function (oldOffset) {
        var _this = this;
        var valuesToUpdate = ['fromMillis', 'toMillis'];
        valuesToUpdate.forEach(function (currValue) {
            var oldOffsetMinutes = Utils.getMinutesToUTC(oldOffset, _this[currValue]);
            var utcMillis = _this[currValue] - (oldOffsetMinutes * 60 * 1000);
            _this[currValue] = utcMillis - Utils.getOffsetMinutes(_this.chartOptions.offset, utcMillis) * 60 * 1000;
        });
        this.setFromMillis(this.fromMillis);
        this.setToMillis(this.toMillis);
        this.updateDisplayedFromDateTime();
        this.updateDisplayedToDateTime();
        this.startRange = new Date(this.fromMillis);
        this.endRange = new Date(this.toMillis);
        this.calendarPicker.config({ minDate: this.convertToCalendarDate(this.minMillis) });
        this.calendarPicker.config({ maxDate: this.convertToCalendarDate(this.maxMillis) });
        this.calendarPicker.draw();
        var rangeErrorCheck = this.rangeIsValid(this.fromMillis, this.toMillis);
        this.setIsSaveable(rangeErrorCheck.isSaveable);
        this.displayRangeErrors(rangeErrorCheck.errors);
    };
    DateTimePicker.prototype.render = function (chartOptions, minMillis, maxMillis, fromMillis, toMillis, onSet, onCancel) {
        var _this = this;
        if (chartOptions === void 0) { chartOptions = {}; }
        if (fromMillis === void 0) { fromMillis = null; }
        if (toMillis === void 0) { toMillis = null; }
        if (onSet === void 0) { onSet = null; }
        if (onCancel === void 0) { onCancel = null; }
        this.isSettingStartTime = true;
        this.minMillis = minMillis;
        this.maxMillis = maxMillis;
        if (chartOptions.offset && (typeof chartOptions.offset === "string")) {
            this.offsetName = chartOptions.offset;
        }
        if (toMillis == null) {
            toMillis = this.maxMillis;
        }
        if (fromMillis == null) {
            fromMillis = Math.max(toMillis - (24 * 60 * 60 * 1000), minMillis);
        }
        this.chartOptions.setOptions(chartOptions);
        moment.locale(this.chartOptions.dateLocale);
        this.fromMillis = fromMillis;
        this.toMillis = toMillis;
        this.onSet = onSet;
        this.onCancel = onCancel;
        this.targetElement = select(this.renderTarget)
            .classed("tsi-dateTimePicker", true);
        this.targetElement.html('');
        _super.prototype.themify.call(this, this.targetElement, this.chartOptions.theme);
        var group = this.targetElement.append('div')
            .classed('tsi-dateTimeGroup', true)
            .on('keydown', function (e) {
            if (event.keyCode <= 40 && event.keyCode >= 37) { //arrow key
                event.stopPropagation();
            }
            if (event.keyCode === 27 && _this.chartOptions.dTPIsModal) { //escape
                _this.onCancel();
                _this.onSaveOrCancel();
            }
        });
        this.quickTimesPanel = group.append('div')
            .classed('tsi-quickTimesPanel', true);
        this.buildQuickTimesPanel();
        this.dateTimeSelectionPanel = group.append('div')
            .classed('tsi-dateTimeSelectionPanel', true);
        this.timeControls = this.dateTimeSelectionPanel.append("div").classed("tsi-timeControlsContainer", true);
        this.calendar = this.dateTimeSelectionPanel.append("div").classed("tsi-calendarPicker", true);
        this.createTimezonePicker();
        var saveButtonContainer = this.dateTimeSelectionPanel.append("div").classed("tsi-saveButtonContainer", true);
        var self = this;
        var saveButton = saveButtonContainer.append("button").classed("tsi-saveButton", true).text(this.getString("Save"))
            .on("click", function () {
            self.onSet(self.fromMillis, self.toMillis, self.chartOptions.offset, self.maxMillis === self.toMillis, self.getCurrentQuickTime());
            self.onSaveOrCancel();
        });
        var cancelButton = saveButtonContainer.append('button')
            .attr('class', 'tsi-cancelButton')
            .text(this.getString('Cancel'))
            .on('click', function () {
            _this.onCancel();
            _this.onSaveOrCancel();
        })
            .on('keydown', function () {
            if (event.keyCode === 9 && !event.shiftKey && _this.chartOptions.dTPIsModal) { // tab
                _this.quickTimesPanel.selectAll('.tsi-quickTime')
                    .filter(function (d, i) { return i === 0; })
                    .node()
                    .focus();
                event.preventDefault();
            }
        });
        //originally set toMillis to last possible time
        this.toMillis = this.maxMillis;
        this.setFromMillis(fromMillis);
        this.setToMillis(toMillis);
        this.targetElement.append("div").classed("tsi-errorMessageContainer", true);
        this.createTimePicker();
        this.createCalendar();
        this.calendarPicker.draw();
        this.updateDisplayedFromDateTime();
        this.updateDisplayedToDateTime();
        this.startRange = new Date(this.fromMillis);
        this.endRange = new Date(this.toMillis);
        this.calendarPicker.draw();
        return;
    };
    DateTimePicker.prototype.updateDisplayedDateTimes = function () {
        var _this = this;
        ['from', 'to'].forEach(function (fromOrTo) {
            var selectedDate = new Date(_this[fromOrTo + 'Millis']);
            _this.calendarPicker.setDate(_this.roundDay(Utils.offsetFromUTC(selectedDate)));
            _this[fromOrTo + 'Input'].node().value = _this.createTimeString(Utils.offsetFromUTC(selectedDate));
        });
    };
    DateTimePicker.prototype.setFromQuickTimes = function (relativeMillis) {
        this.isSettingStartTime = true;
        this.setToMillis(this.maxMillis);
        this.setFromMillis(this.maxMillis - relativeMillis);
        this.updateDisplayedFromDateTime();
        this.updateDisplayedToDateTime();
        this.calendarPicker.draw();
    };
    DateTimePicker.prototype.buildQuickTimesPanel = function () {
        var _this = this;
        var quickTimes = this.quickTimesPanel.selectAll('.tsi-quickTime')
            .data(this.quickTimeArray);
        var enteredQuickTimes = quickTimes.enter()
            .append('button')
            .attr('class', 'tsi-quickTime')
            .on('click', function (d) {
            _this.setFromQuickTimes(d[1]);
        })
            .text(function (d) { return d[0]; })
            .attr('aria-label', function (d) { return _this.getString('select quick time of') + " " + d[0]; });
        // wrap around tab order if dTP in modal form
        var firstQuickTime = enteredQuickTimes.filter(function (d, i) {
            return (i === 0);
        })
            .on('keydown', function () {
            if (event.keyCode === 9 && event.shiftKey && _this.chartOptions.dTPIsModal) { // shift tab
                _this.dateTimeSelectionPanel.select(".tsi-saveButtonContainer").select(".tsi-cancelButton").node().focus();
                event.preventDefault();
            }
        });
        if (this.chartOptions.dTPIsModal) {
            firstQuickTime.node().focus();
        }
    };
    DateTimePicker.prototype.createTimeString = function (currDate) {
        return this.getTimeFormat()(currDate);
    };
    DateTimePicker.prototype.getTimeFormat = function () {
        return Utils.timeFormat(true, true, this.chartOptions.offset, true, 0, null, this.chartOptions.dateLocale);
    };
    DateTimePicker.prototype.updateFromAndTo = function (fromMillis, toMillis) {
        this.setFromMillis(fromMillis);
        this.setToMillis(toMillis);
        this.updateDisplayedFromDateTime();
        this.updateDisplayedToDateTime();
        this.startRange = new Date(this.fromMillis);
        this.endRange = new Date(this.toMillis);
        this.calendarPicker.draw();
    };
    DateTimePicker.prototype.createTimezonePicker = function () {
        var _this = this;
        var offset = this.chartOptions.offset;
        if (this.chartOptions.includeTimezones && (typeof offset == "string" || offset == 0)) {
            var timezoneContainer = this.dateTimeSelectionPanel.append("div").attr("class", "tsi-timezoneContainer");
            var timezoneSelectionLabelID = Utils.guid();
            var timezoneSelectionID = timezoneSelectionLabelID + 'Tz';
            timezoneContainer.append("label")
                .classed("tsi-timeLabel", true)
                .attr('aria-label', this.getString('timezone selection'))
                .attr('id', timezoneSelectionLabelID)
                .attr('for', timezoneSelectionID)
                .text(this.getString('timezone'));
            var timezonePickerContainer = timezoneContainer.append("div").classed("tsi-timezonePickerContainer", true);
            var timezonePicker = new TimezonePicker(timezonePickerContainer.node());
            timezonePicker.render(function (newOffset) {
                var matchingQuickTime = _this.getCurrentQuickTime();
                var oldOffset = _this.chartOptions.offset;
                _this.chartOptions.offset = newOffset;
                _this.setNewOffset(oldOffset);
                if (matchingQuickTime !== -1) {
                    _this.setFromQuickTimes(matchingQuickTime);
                }
            }, (typeof offset == "string" ? offset : "UTC"));
            select(timezonePicker.renderTarget).select('select')
                .attr('aria-labelledBy', timezoneSelectionLabelID)
                .attr('id', timezoneSelectionID);
        }
    };
    //zero out everything but year, month and day
    DateTimePicker.prototype.roundDay = function (d) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };
    DateTimePicker.prototype.setTimeRange = function (d, isFromSelect) {
        if (this.isSettingStartTime) {
            this.calendarPicker.setStartRange(d);
            this.calendarPicker.setEndRange(null);
            this.startRange = d;
            this.anchorDate = d;
        }
        else {
            if (d.valueOf() > this.anchorDate.valueOf()) {
                if (isFromSelect) {
                    this.setFromDate(this.anchorDate);
                    this.setToDate(d);
                }
                this.calendarPicker.setEndRange(d);
                this.calendarPicker.setStartRange(this.anchorDate);
                this.startRange = this.anchorDate;
                this.endRange = d;
            }
            else {
                if (isFromSelect) {
                    this.setFromDate(d);
                    this.setToDate(this.anchorDate);
                }
                this.calendarPicker.setStartRange(d);
                this.calendarPicker.setEndRange(this.anchorDate);
                this.endRange = this.anchorDate;
                this.startRange = d;
            }
            this.setTimeInputBox(this.fromMillis, true);
            this.setTimeInputBox(this.toMillis, false);
        }
    };
    DateTimePicker.prototype.createCalendar = function () {
        var _this = this;
        var i18nOptions = {
            previousMonth: this.getString('Previous Month'),
            nextMonth: this.getString('Next Month'),
            months: moment.localeData().months(),
            weekdays: moment.localeData().weekdays(),
            weekdaysShort: moment.localeData().weekdaysMin()
        };
        this.calendarPicker = new pikaday({
            bound: false,
            container: this.calendar.node(),
            field: this.calendar.node(),
            i18n: i18nOptions,
            numberOfMonths: 2,
            onSelect: function (d) {
                _this.setTimeRange(d, true);
                _this.isSettingStartTime = !_this.isSettingStartTime;
                _this.calendarPicker.draw();
            },
            onDraw: function (d) {
                if (_this.isSettingStartTime)
                    return;
                var self = _this;
                _this.calendar.select(".pika-single").selectAll(".pika-day")
                    .on("mouseover", function (d) {
                    var date = new Date(Number(select(this).attr("data-pika-year")), Number(select(this).attr("data-pika-month")), Number(select(this).attr("data-pika-day")));
                    if (!self.isSettingStartTime) {
                        if (date.valueOf() < self.anchorDate.valueOf() && self.startRange.valueOf() != date.valueOf()) {
                            self.setTimeRange(date, false);
                            self.calendarPicker.draw();
                            return;
                        }
                        if (date.valueOf() >= self.anchorDate.valueOf() && (self.endRange == undefined || self.endRange.valueOf() != date.valueOf())) {
                            self.setTimeRange(date, false);
                            self.calendarPicker.draw();
                            return;
                        }
                    }
                });
            },
            minDate: this.convertToCalendarDate(this.minMillis),
            maxDate: this.convertToCalendarDate(this.maxMillis),
            defaultDate: Utils.adjustDateFromTimezoneOffset(new Date(this.fromMillis))
        });
    };
    DateTimePicker.prototype.setSelectedQuickTimes = function () {
        var _this = this;
        var isSelected = function (d) {
            return (_this.toMillis === _this.maxMillis && (_this.toMillis - _this.fromMillis === d[1]));
        };
        this.quickTimesPanel.selectAll('.tsi-quickTime')
            .classed('tsi-isSelected', isSelected)
            .attr('aria-pressed', isSelected);
    };
    DateTimePicker.prototype.setFromDate = function (calendarDate) {
        var convertedFrom = new Date(Utils.offsetFromUTC(new Date(this.fromMillis), this.chartOptions.offset));
        convertedFrom.setUTCFullYear(calendarDate.getFullYear());
        convertedFrom.setUTCMonth(calendarDate.getMonth());
        convertedFrom.setUTCDate(calendarDate.getDate());
        this.setFromMillis(Utils.offsetToUTC(convertedFrom, this.chartOptions.offset).valueOf());
    };
    DateTimePicker.prototype.setToDate = function (calendarDate) {
        var convertedTo = new Date(Utils.offsetFromUTC(new Date(this.toMillis), this.chartOptions.offset));
        convertedTo.setUTCFullYear(calendarDate.getFullYear());
        convertedTo.setUTCMonth(calendarDate.getMonth());
        convertedTo.setUTCDate(calendarDate.getDate());
        this.setToMillis(Utils.offsetToUTC(convertedTo, this.chartOptions.offset).valueOf());
    };
    DateTimePicker.prototype.setIsSaveable = function (isSaveable) {
        // For now, lets allow users to save the time even in the presence of errors
        this.dateTimeSelectionPanel.select(".tsi-saveButtonContainer").select(".tsi-saveButton")
            .attr("disabled", isSaveable ? null : true)
            .classed("tsi-buttonDisabled", !isSaveable);
        this.isValid = isSaveable;
    };
    //line up the seconds and millis with the second and millis of the max date
    DateTimePicker.prototype.adjustSecondsAndMillis = function (rawMillis) {
        var currDate = new Date(rawMillis);
        var maxDate = new Date(this.maxMillis);
        currDate.setUTCSeconds(maxDate.getUTCSeconds());
        currDate.setUTCMilliseconds(maxDate.getUTCMilliseconds());
        return currDate.valueOf();
    };
    DateTimePicker.prototype.setFromMillis = function (millis) {
        var rangeErrorCheck = this.rangeIsValid(millis, this.toMillis);
        this.fromMillis = millis;
        this.setIsSaveable(rangeErrorCheck.isSaveable);
        this.displayRangeErrors(rangeErrorCheck.errors);
        this.setSelectedQuickTimes();
    };
    DateTimePicker.prototype.setToMillis = function (millis) {
        var rangeErrorCheck = this.rangeIsValid(this.fromMillis, millis);
        this.toMillis = millis;
        this.setIsSaveable(rangeErrorCheck.isSaveable);
        this.displayRangeErrors(rangeErrorCheck.errors);
        this.setSelectedQuickTimes();
    };
    DateTimePicker.prototype.displayRangeErrors = function (rangeErrors) {
        this.targetElement.select(".tsi-errorMessageContainer").selectAll(".tsi-errorMessage").remove();
        if (rangeErrors.length != 0) {
            this.targetElement.select(".tsi-errorMessageContainer").selectAll(".tsi-errorMessages")
                .data(rangeErrors)
                .enter()
                .append("div")
                .classed("tsi-errorMessage", true)
                .text(function (d) { return d; });
        }
    };
    DateTimePicker.prototype.rangeIsValid = function (prospectiveFromMillis, prospectiveToMillis) {
        var accumulatedErrors = [];
        var isSaveable = true;
        var bothTimesValid = !isNaN(prospectiveFromMillis) && !isNaN(prospectiveToMillis);
        if (isNaN(prospectiveFromMillis)) {
            accumulatedErrors.push("*Invalid start date/time");
            isSaveable = false;
        }
        if (isNaN(prospectiveToMillis)) {
            accumulatedErrors.push("*Invalid end date/time");
            isSaveable = false;
        }
        if (bothTimesValid) {
            if (prospectiveFromMillis > prospectiveToMillis) {
                accumulatedErrors.push("*Start time must be before end time");
                isSaveable = false;
            }
            if (prospectiveFromMillis < this.minMillis) {
                accumulatedErrors.push("*Start time is before first possible time (" + this.getTimeFormat()(this.minMillis) + ")");
            }
            if (prospectiveFromMillis > this.maxMillis) {
                accumulatedErrors.push("*Start time is after last possible time (" + this.getTimeFormat()(this.maxMillis) + ")");
            }
            if (prospectiveToMillis > this.maxMillis) {
                accumulatedErrors.push("*End time is after last possible time (" + this.getTimeFormat()(this.maxMillis) + ")");
            }
            if (prospectiveToMillis < this.minMillis) {
                accumulatedErrors.push("*End time is before first possible time (" + this.getTimeFormat()(this.minMillis) + ")");
            }
        }
        return {
            rangeIsValid: (accumulatedErrors.length == 0),
            errors: accumulatedErrors,
            isSaveable: isSaveable
        };
    };
    DateTimePicker.prototype.updateDisplayedFromDateTime = function (fromInput) {
        if (fromInput === void 0) { fromInput = false; }
        this.calendarPicker.setStartRange(this.convertToCalendarDate(this.fromMillis));
        if (!fromInput)
            this.setTimeInputBox(new Date(this.fromMillis), true);
    };
    DateTimePicker.prototype.updateDisplayedToDateTime = function (fromInput) {
        if (fromInput === void 0) { fromInput = false; }
        this.calendarPicker.setEndRange(this.convertToCalendarDate(this.toMillis));
        if (!fromInput)
            this.setTimeInputBox(new Date(this.toMillis), false);
    };
    DateTimePicker.prototype.offsetUTC = function (date) {
        var dateCopy = new Date(date.valueOf());
        dateCopy.setTime(dateCopy.getTime() - dateCopy.getTimezoneOffset() * 60 * 1000);
        return dateCopy;
    };
    DateTimePicker.prototype.offsetFromUTC = function (date) {
        var dateCopy = new Date(date.valueOf());
        dateCopy.setTime(dateCopy.getTime() + dateCopy.getTimezoneOffset() * 60 * 1000);
        return dateCopy;
    };
    DateTimePicker.prototype.checkDateTimeValidity = function () {
        var parsedFrom = Utils.parseUserInputDateTime(this.fromInput.node().value, this.chartOptions.offset);
        var parsedTo = Utils.parseUserInputDateTime(this.toInput.node().value, this.chartOptions.offset);
        var rangeErrorCheck = this.rangeIsValid(parsedFrom, parsedTo);
        this.setIsSaveable(rangeErrorCheck.isSaveable);
        this.displayRangeErrors(rangeErrorCheck.errors);
    };
    DateTimePicker.prototype.setTimeInputBox = function (utcDate, isFrom) {
        if (isFrom) {
            this.fromInput.node().value = this.createTimeString(utcDate);
        }
        else {
            this.toInput.node().value = this.createTimeString(utcDate);
        }
    };
    DateTimePicker.prototype.createTimePicker = function () {
        var _this = this;
        var timeInputContainer = this.timeControls.append("div").attr("class", "tsi-timeInputContainer");
        var createTimePicker = function (startOrEnd) {
            var fromOrToContainer = timeInputContainer.append("div").classed("tsi-" + startOrEnd + "Container", true);
            var inputLabelID = Utils.guid();
            var inputID = inputLabelID + 'Input';
            var timeLabel = fromOrToContainer.append("label")
                .classed("tsi-timeLabel", true)
                .attr('id', inputLabelID)
                .attr('for', inputID)
                .attr('aria-label', "" + (startOrEnd === 'start' ? _this.getString('Start time input') : _this.getString('End time input')))
                .text(_this.getString(startOrEnd));
            var inputName = startOrEnd === 'start' ? 'fromInput' : 'toInput';
            _this[inputName] = fromOrToContainer.append('input')
                .attr('class', 'tsi-dateTimeInput', true)
                .attr('aria-labelledby', inputLabelID)
                .attr('id', inputID)
                .on('input', function () {
                var rangeErrorCheck = _this.checkDateTimeValidity();
                _this.isSettingStartTime = true;
                if (_this.isValid) {
                    if (startOrEnd === 'start') {
                        var parsedFrom = Utils.parseUserInputDateTime(_this.fromInput.node().value, _this.chartOptions.offset);
                        _this.setFromMillis(parsedFrom);
                        _this.updateDisplayedFromDateTime(true);
                        _this.calendarPicker.draw();
                    }
                    else {
                        var parsedTo = Utils.parseUserInputDateTime(_this.toInput.node().value, _this.chartOptions.offset);
                        _this.setToMillis(parsedTo);
                        _this.updateDisplayedToDateTime(true);
                        _this.calendarPicker.draw();
                    }
                }
            });
            if (startOrEnd == 'end') {
                fromOrToContainer.append("button")
                    .attr("class", "tsi-snapToEndRangeButton")
                    .text(_this.getString("Latest"))
                    .attr('aria-label', _this.getString('snap end time to latest'))
                    .on("click", function () {
                    if (!_this.isSettingStartTime) {
                        _this.setFromDate(_this.startRange);
                    }
                    _this.setToMillis(_this.maxMillis);
                    _this.updateDisplayedFromDateTime();
                    _this.updateDisplayedToDateTime();
                    _this.isSettingStartTime = true;
                    _this.calendarPicker.draw();
                });
            }
        };
        createTimePicker("start");
        createTimePicker("end");
    };
    return DateTimePicker;
}(ChartComponent));

export default DateTimePicker;
