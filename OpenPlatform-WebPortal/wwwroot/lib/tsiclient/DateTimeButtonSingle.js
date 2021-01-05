import { a as __extends, U as Utils } from './Utils-e5be3308.js';
import { select } from 'd3';
import 'moment-timezone';
import './EllipsisMenu.js';
import 'split.js';
import './ChartComponent-a7f89f69.js';
import './pikaday-b1c00185.js';
import 'moment';
import { D as DateTimeButton } from './DateTimeButton-6f554ffd.js';
import SingleDateTimePicker from './SingleDateTimePicker.js';

var DateTimeButtonSingle = /** @class */ (function (_super) {
    __extends(DateTimeButtonSingle, _super);
    function DateTimeButtonSingle(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.sDTPOnSet = function (millis) {
            if (millis === void 0) { millis = null; }
            if (millis !== null) {
                _this.dateTimeButton.text(_this.buttonDateTimeFormat(millis));
                _this.selectedMillis = millis;
                _this.onSet(millis);
            }
            _this.closeSDTP();
        };
        return _this;
    }
    DateTimeButtonSingle.prototype.closeSDTP = function () {
        this.dateTimePickerContainer.style("display", "none");
        this.dateTimeButton.node().focus();
    };
    DateTimeButtonSingle.prototype.render = function (chartOptions, minMillis, maxMillis, selectedMillis, onSet) {
        var _this = this;
        if (chartOptions === void 0) { chartOptions = {}; }
        if (selectedMillis === void 0) { selectedMillis = null; }
        if (onSet === void 0) { onSet = null; }
        _super.prototype.render.call(this, chartOptions, minMillis, maxMillis, onSet);
        this.selectedMillis = selectedMillis;
        select(this.renderTarget).classed('tsi-dateTimeContainerSingle', true);
        this.dateTimeButton.text(this.buttonDateTimeFormat(selectedMillis));
        if (!this.dateTimePicker) {
            this.dateTimePicker = new SingleDateTimePicker(this.dateTimePickerContainer.node());
        }
        var targetElement = select(this.renderTarget);
        var dateTimeTextChildren = (targetElement.select(".tsi-dateTimePickerContainer")).selectAll("*");
        select("html").on("click." + Utils.guid(), function () {
            var pickerContainerChildren = _this.dateTimePickerContainer.selectAll("*");
            var outside = dateTimeTextChildren.filter(Utils.equalToEventTarget).empty()
                && targetElement.selectAll(".tsi-dateTimePickerContainer").filter(Utils.equalToEventTarget).empty()
                && targetElement.selectAll(".tsi-dateTimeButton").filter(Utils.equalToEventTarget).empty()
                && targetElement.selectAll(".tsi-saveButton").filter(Utils.equalToEventTarget).empty();
            var inClickTarget = pickerContainerChildren.filter(Utils.equalToEventTarget).empty();
            if (outside && inClickTarget && (_this.dateTimePickerContainer.style('display') !== 'none')) {
                _this.closeSDTP();
            }
        });
        this.dateTimeButton.on("click", function () {
            _this.chartOptions.dTPIsModal = true;
            _this.dateTimePickerContainer.style("display", "block");
            _this.dateTimePicker.render(_this.chartOptions, _this.minMillis, _this.maxMillis, _this.selectedMillis, _this.sDTPOnSet);
        });
    };
    return DateTimeButtonSingle;
}(DateTimeButton));

export default DateTimeButtonSingle;
