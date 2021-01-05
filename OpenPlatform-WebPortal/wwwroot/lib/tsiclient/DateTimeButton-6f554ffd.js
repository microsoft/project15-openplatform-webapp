import { a as __extends, U as Utils } from './Utils-e5be3308.js';
import { select } from 'd3';
import { C as ChartComponent } from './ChartComponent-a7f89f69.js';

var DateTimeButton = /** @class */ (function (_super) {
    __extends(DateTimeButton, _super);
    function DateTimeButton(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.pickerIsVisible = false;
        return _this;
    }
    DateTimeButton.prototype.buttonDateTimeFormat = function (millis) {
        return Utils.timeFormat(!this.chartOptions.minutesForTimeLabels, !this.chartOptions.minutesForTimeLabels, this.chartOptions.offset, this.chartOptions.is24HourTime, 0, null, this.chartOptions.dateLocale)(millis);
    };
    DateTimeButton.prototype.render = function (chartOptions, minMillis, maxMillis, onSet) {
        if (onSet === void 0) { onSet = null; }
        this.chartOptions.setOptions(chartOptions);
        this.minMillis = minMillis;
        this.maxMillis = maxMillis;
        this.onSet = onSet ? onSet : function () { };
        var dateTimeContainer = select(this.renderTarget);
        if (!this.dateTimeButton) {
            this.dateTimeButton = dateTimeContainer.append("button")
                .classed('tsi-dateTimeButton', true);
        }
        if (!this.dateTimePickerContainer) {
            this.dateTimePickerContainer = dateTimeContainer.append('div').classed('tsi-dateTimePickerContainer', true)
                .attr('role', 'dialog')
                .attr('aria-label', this.getString('a time selection control dialog'));
            this.dateTimePickerContainer.style('display', 'none');
        }
        _super.prototype.themify.call(this, select(this.renderTarget), this.chartOptions.theme);
    };
    return DateTimeButton;
}(ChartComponent));

export { DateTimeButton as D };
