import { a as __extends, U as Utils } from './Utils-e5be3308.js';
import { select } from 'd3';
import 'moment-timezone';
import './EllipsisMenu.js';
import 'split.js';
import './ChartComponent-a7f89f69.js';
import './pikaday-b1c00185.js';
import 'moment';
import './TimezonePicker.js';
import DateTimePicker from './DateTimePicker.js';
import { D as DateTimeButton } from './DateTimeButton-6f554ffd.js';

var DateTimeButtonRange = /** @class */ (function (_super) {
    __extends(DateTimeButtonRange, _super);
    function DateTimeButtonRange(renderTarget) {
        return _super.call(this, renderTarget) || this;
    }
    DateTimeButtonRange.prototype.setButtonText = function (fromMillis, toMillis, isRelative, quickTime) {
        var fromString = this.buttonDateTimeFormat(fromMillis);
        var tzAbbr = Utils.createTimezoneAbbreviation(this.chartOptions.offset);
        var toString = this.buttonDateTimeFormat(toMillis) + ' (' + tzAbbr + ')';
        if (!isRelative) {
            this.dateTimeButton.text(fromString + " - " + toString);
            this.dateTimeButton.attr('aria-label', this.getString('a button to launch a time selection dialog current selected time is ') + " " + fromString + " - " + toString);
        }
        else {
            var quickTimeText = this.dateTimePicker.getQuickTimeText(quickTime);
            var text = quickTimeText !== null ? quickTimeText + " (" + fromString + " - " + toString + ")" : fromString + " - " + this.getString('Latest') + " (" + toString + ")";
            this.dateTimeButton.text(text);
            this.dateTimeButton.attr('aria-label', this.getString('a button to launch a time selection dialog current selected time is ') + " " + text);
        }
    };
    DateTimeButtonRange.prototype.onClose = function () {
        this.dateTimePickerContainer.style("display", "none");
        this.dateTimeButton.node().focus();
    };
    DateTimeButtonRange.prototype.render = function (chartOptions, minMillis, maxMillis, fromMillis, toMillis, onSet, onCancel) {
        var _this = this;
        if (chartOptions === void 0) { chartOptions = {}; }
        if (fromMillis === void 0) { fromMillis = null; }
        if (toMillis === void 0) { toMillis = null; }
        if (onSet === void 0) { onSet = null; }
        if (onCancel === void 0) { onCancel = null; }
        _super.prototype.render.call(this, chartOptions, minMillis, maxMillis, onSet);
        select(this.renderTarget).classed('tsi-dateTimeContainerRange', true);
        this.fromMillis = fromMillis;
        this.toMillis = toMillis;
        this.onCancel = onCancel ? onCancel : function () { };
        if (!this.dateTimePicker) {
            this.dateTimePicker = new DateTimePicker(this.dateTimePickerContainer.node());
        }
        this.setButtonText(fromMillis, toMillis, toMillis === maxMillis, this.toMillis - this.fromMillis);
        var targetElement = select(this.renderTarget);
        var dateTimeTextChildren = (targetElement.select(".tsi-dateTimeContainer")).selectAll("*");
        select("html").on("click." + Utils.guid(), function () {
            var pickerContainerChildren = _this.dateTimePickerContainer.selectAll("*");
            var outside = dateTimeTextChildren.filter(Utils.equalToEventTarget).empty()
                && targetElement.selectAll(".tsi-dateTimeContainer").filter(Utils.equalToEventTarget).empty()
                && targetElement.selectAll(".tsi-dateTimeButton").filter(Utils.equalToEventTarget).empty();
            var inClickTarget = pickerContainerChildren.filter(Utils.equalToEventTarget).empty();
            if (outside && inClickTarget && (_this.dateTimePickerContainer.style('display') !== 'none')) {
                _this.onClose();
            }
        });
        this.dateTimeButton.on("click", function () {
            if (_this.dateTimePickerContainer.style("display") !== "none") {
                _this.onClose(); // close if already open
            }
            else {
                _this.chartOptions.dTPIsModal = true;
                _this.dateTimePickerContainer.style("display", "block");
                _this.dateTimePicker.render(_this.chartOptions, minMillis, maxMillis, _this.fromMillis, _this.toMillis, function (fromMillis, toMillis, offset, isRelative, currentQuickTime) {
                    _this.chartOptions.offset = offset;
                    _this.fromMillis = fromMillis;
                    _this.toMillis = toMillis;
                    _this.setButtonText(fromMillis, toMillis, isRelative, currentQuickTime);
                    _this.onSet(fromMillis, toMillis, offset);
                    _this.onClose();
                }, function () {
                    _this.onClose();
                    _this.onCancel();
                });
            }
        });
    };
    return DateTimeButtonRange;
}(DateTimeButton));

export default DateTimeButtonRange;
