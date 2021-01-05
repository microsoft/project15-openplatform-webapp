import { a as __extends, U as Utils } from './Utils-e5be3308.js';
import { select, event } from 'd3';
import 'moment-timezone';
import './EllipsisMenu.js';
import 'split.js';
import { C as ChartComponent } from './ChartComponent-a7f89f69.js';
import { p as pikaday } from './pikaday-b1c00185.js';
import moment from 'moment';

var SingleDateTimePicker = /** @class */ (function (_super) {
    __extends(SingleDateTimePicker, _super);
    function SingleDateTimePicker(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.isValid = true;
        return _this;
    }
    SingleDateTimePicker.prototype.getMillis = function () {
        return this.millis;
    };
    SingleDateTimePicker.prototype.render = function (chartOptions, minMillis, maxMillis, millis, onSet) {
        var _this = this;
        if (chartOptions === void 0) { chartOptions = {}; }
        if (millis === void 0) { millis = null; }
        if (onSet === void 0) { onSet = null; }
        this.minMillis = minMillis;
        this.maxMillis = maxMillis;
        if (chartOptions.offset && (typeof chartOptions.offset == "string")) {
            this.offsetName = chartOptions.offset;
        }
        if (millis === null) {
            millis = this.maxMillis;
        }
        this.chartOptions.setOptions(chartOptions);
        moment.locale(this.chartOptions.dateLocale);
        this.millis = millis;
        this.onSet = onSet;
        this.targetElement = select(this.renderTarget)
            .classed("tsi-singleDateTimePicker", true);
        this.targetElement.html('');
        _super.prototype.themify.call(this, this.targetElement, this.chartOptions.theme);
        this.targetElement.on('keydown', function (e) {
            if (event.keyCode <= 40 && event.keyCode >= 37) { //arrow key
                event.stopPropagation();
            }
            if (event.keyCode === 27 && _this.chartOptions.dTPIsModal) { //escape
                _this.onSet();
            }
        });
        this.timeControls = this.targetElement.append("div").classed("tsi-timeControlsContainer", true);
        this.calendar = this.targetElement.append("div").classed("tsi-calendarPicker", true);
        var saveButtonContainer = this.targetElement.append("div").classed("tsi-saveButtonContainer", true);
        var self = this;
        this.saveButton = saveButtonContainer.append("button").classed("tsi-saveButton", true).text(this.getString("Save"))
            .on("click", function () {
            if (_this.isValid) {
                self.onSet(_this.millis);
            }
        })
            .on('keydown', function () {
            if (event.keyCode === 9 && !event.shiftKey && _this.chartOptions.dTPIsModal) { // tab
                _this.timeInput.node().focus();
                event.preventDefault();
            }
        });
        this.targetElement.append("div").classed("tsi-errorMessageContainer", true);
        this.createCalendar();
        this.calendarPicker.draw();
        this.createTimePicker();
        this.updateDisplayedDateTime();
        this.date = new Date(this.millis);
        this.calendarPicker.draw();
        if (this.chartOptions.dTPIsModal) {
            this.timeInput.node().focus();
        }
        return;
    };
    //zero out everything but year, month and day
    SingleDateTimePicker.prototype.roundDay = function (d) {
        var offsetDate = Utils.offsetFromUTC(d, this.chartOptions.offset);
        return new Date(offsetDate.getUTCFullYear(), offsetDate.getUTCMonth(), offsetDate.getUTCDate());
    };
    SingleDateTimePicker.prototype.setSelectedDate = function (d) {
        this.calendarPicker.setDate(d, true);
        this.setDate(d);
        this.timeInput.node().value = this.createTimeString(Utils.offsetFromUTC(new Date(this.millis)));
    };
    SingleDateTimePicker.prototype.createCalendar = function () {
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
            numberOfMonths: 1,
            onSelect: function (d) {
                _this.setSelectedDate(d);
                _this.calendarPicker.draw();
                _this.checkDateTimeValidity();
            },
            onDraw: function (d) {
                _this.calendar.select(".pika-single").selectAll('button').attr('tabindex', -1);
            },
            minDate: this.convertToLocal(Utils.offsetFromUTC(new Date(this.minMillis), this.chartOptions.offset)),
            maxDate: this.convertToLocal(Utils.offsetFromUTC(new Date(this.maxMillis), this.chartOptions.offset)),
            defaultDate: this.convertToLocal(Utils.offsetFromUTC(new Date(this.millis), this.chartOptions.offset))
        });
    };
    SingleDateTimePicker.prototype.setDate = function (d) {
        var date = Utils.offsetFromUTC(new Date(this.millis), this.chartOptions.offset);
        date.setUTCFullYear(d.getFullYear());
        date.setUTCMonth(d.getMonth());
        date.setUTCDate(d.getDate());
        this.setMillis(date.valueOf(), true);
    };
    SingleDateTimePicker.prototype.setIsValid = function (isValid) {
        this.isValid = isValid;
    };
    SingleDateTimePicker.prototype.setMillis = function (millis, shouldOffset) {
        if (shouldOffset === void 0) { shouldOffset = true; }
        var adjustedMillis = millis - (shouldOffset ? Utils.getOffsetMinutes(this.chartOptions.offset, millis) * 60 * 1000 : 0);
        this.millis = adjustedMillis;
    };
    SingleDateTimePicker.prototype.displayErrors = function (rangeErrors) {
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
    SingleDateTimePicker.prototype.checkDateTimeValidity = function () {
        var parsedMillis = this.parseUserInputDateTime();
        var errorCheck = this.dateTimeIsValid(parsedMillis);
        this.displayErrors(errorCheck.errors);
        this.setIsValid(errorCheck.rangeIsValid);
    };
    SingleDateTimePicker.prototype.dateTimeIsValid = function (prospectiveMillis) {
        var accumulatedErrors = [];
        if (isNaN(prospectiveMillis)) {
            accumulatedErrors.push('*time is invalid');
        }
        else {
            var firstDateTime = Utils.offsetFromUTC(new Date(this.minMillis), this.chartOptions.offset);
            var lastDateTime = Utils.offsetFromUTC(new Date(this.maxMillis), this.chartOptions.offset);
            if (prospectiveMillis < this.minMillis) {
                accumulatedErrors.push("*date/time is before first possible date and time (" + this.getTimeFormat()(firstDateTime) + ")");
            }
            if (prospectiveMillis > this.maxMillis) {
                accumulatedErrors.push("*date/time is after last possible date and time (" + this.getTimeFormat()(lastDateTime) + ")");
            }
        }
        return {
            rangeIsValid: (accumulatedErrors.length == 0),
            errors: accumulatedErrors
        };
    };
    SingleDateTimePicker.prototype.getTimeFormat = function () {
        return Utils.timeFormat(true, true, this.chartOptions.offset, true, 0, null, this.chartOptions.dateLocale);
    };
    SingleDateTimePicker.prototype.parseUserInputDateTime = function () {
        return Utils.parseUserInputDateTime(this.timeInput.node().value, this.chartOptions.offset);
    };
    SingleDateTimePicker.prototype.convertToCalendarDate = function (millis) {
        return this.roundDay(Utils.adjustDateFromTimezoneOffset(Utils.offsetFromUTC(new Date(millis), this.chartOptions.offset)));
    };
    SingleDateTimePicker.prototype.updateDisplayedDateTime = function (fromInput) {
        if (fromInput === void 0) { fromInput = false; }
        var selectedDate = new Date(this.millis);
        this.calendarPicker.setDate(this.convertToCalendarDate(this.millis), fromInput);
        if (!fromInput) {
            this.timeInput.node().value = this.createTimeString(Utils.offsetFromUTC(selectedDate));
        }
    };
    SingleDateTimePicker.prototype.createTimeString = function (currDate) {
        var offsetDate = Utils.offsetFromUTC(currDate, this.chartOptions.offset);
        return this.getTimeFormat()(currDate);
    };
    // convert to representation such that: convertedDate.toString() === originalDate.toISOString()
    SingleDateTimePicker.prototype.convertToLocal = function (date) {
        return new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    };
    SingleDateTimePicker.prototype.createTimePicker = function () {
        var _this = this;
        var timeLabel = this.timeControls.append("h4").classed("tsi-timeLabel", true).text(this.getString('Date/Time'));
        this.timeInput = this.timeControls.append('input').attr('class', 'tsi-dateTimeInput tsi-input')
            .on('input', function () {
            _this.checkDateTimeValidity();
            if (_this.isValid) {
                var parsedMillis = _this.parseUserInputDateTime();
                _this.setMillis(parsedMillis, false);
                _this.updateDisplayedDateTime(true);
            }
        })
            .on('keydown', function () {
            if (event.keyCode === 9 && event.shiftKey && _this.chartOptions.dTPIsModal) { // tab
                _this.saveButton.node().focus();
                event.preventDefault();
            }
        });
    };
    return SingleDateTimePicker;
}(ChartComponent));

export default SingleDateTimePicker;
