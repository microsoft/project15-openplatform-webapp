import { a as __extends, U as Utils } from './Utils-e5be3308.js';
import { axisBottom, select } from 'd3';
import { C as ChartVisualizationComponent } from './ChartVisualizationComponent-80709f0f.js';

var TemporalXAxisComponent = /** @class */ (function (_super) {
    __extends(TemporalXAxisComponent, _super);
    function TemporalXAxisComponent(renderTarget) {
        return _super.call(this, renderTarget) || this;
    }
    TemporalXAxisComponent.prototype.createOffsetXAxis = function () {
        var xCopy = this.x.copy();
        var rawStart = this.chartOptions.timeFrame ? (new Date(this.chartOptions.timeFrame[0])) : xCopy.domain()[0];
        var rawEnd = this.chartOptions.timeFrame ? (new Date(this.chartOptions.timeFrame[1])) : xCopy.domain()[1];
        xCopy.domain([
            new Date(rawStart), new Date(rawEnd)
        ]);
        return xCopy;
    };
    TemporalXAxisComponent.prototype.createXAxis = function (singleLineXAxisLabel, snapFirst, snapLast) {
        if (snapFirst === void 0) { snapFirst = false; }
        if (snapLast === void 0) { snapLast = false; }
        var offsetX = this.createOffsetXAxis();
        var ticks = offsetX.ticks(this.getXTickNumber(singleLineXAxisLabel));
        if (ticks.length <= 2) {
            ticks = this.x.domain();
        }
        if (snapFirst) {
            ticks[0] = this.x.domain()[0];
        }
        if (snapLast) {
            ticks[ticks.length - 1] = this.x.domain()[1];
        }
        this.smartTickFormat = this.createSmartTickFormat(ticks, offsetX);
        return axisBottom(this.x)
            .tickValues(ticks)
            .tickFormat(Utils.timeFormat(this.labelFormatUsesSeconds(ticks), this.labelFormatUsesMillis(ticks), this.chartOptions.offset, this.chartOptions.is24HourTime, null, null, this.chartOptions.dateLocale));
    };
    TemporalXAxisComponent.prototype.getXTickNumber = function (singleLineXAxisLabel) {
        return Math.max((singleLineXAxisLabel ? Math.floor(this.chartWidth / 300) : Math.floor(this.chartWidth / 160)), 1);
    };
    TemporalXAxisComponent.prototype.labelFormatUsesSeconds = function (ticks) {
        if (ticks === void 0) { ticks = null; }
        var tickSpanSubMinute = ticks ? !this.isTickSpanGreaterThan(ticks, 59 * 1000) : false;
        return !this.chartOptions.minutesForTimeLabels && tickSpanSubMinute;
    };
    TemporalXAxisComponent.prototype.labelFormatUsesMillis = function (ticks) {
        if (ticks === void 0) { ticks = null; }
        var tickSpanSubSecond = ticks ? !this.isTickSpanGreaterThan(ticks, 999) : false;
        return !this.chartOptions.minutesForTimeLabels && tickSpanSubSecond;
    };
    TemporalXAxisComponent.prototype.updateXAxis = function (forceFirst, forceLast) {
        if (forceFirst === void 0) { forceFirst = false; }
        if (forceLast === void 0) { forceLast = false; }
        this.xAxisEntered.call(this.createXAxis(this.chartOptions.singleLineXAxisLabel, forceFirst, forceLast));
        this.updateAxisText(forceFirst, forceLast);
    };
    TemporalXAxisComponent.prototype.updateAxisText = function (forceFirst, forceLast) {
        if (forceFirst === void 0) { forceFirst = false; }
        if (forceLast === void 0) { forceLast = false; }
        //update text by applying function
        if (this.chartOptions.xAxisTimeFormat) {
            var indexOfLast_1 = this.xAxisEntered.selectAll('.tick').size() - 1;
            var self_1 = this;
            this.xAxisEntered.selectAll('.tick').each(function (d, i) {
                select(this).select('text').text(function (d) {
                    var momentTimeFormatString = String(self_1.chartOptions.xAxisTimeFormat(d, i, i === 0, i === indexOfLast_1));
                    return Utils.timeFormat(self_1.labelFormatUsesSeconds(), self_1.labelFormatUsesMillis(), self_1.chartOptions.offset, self_1.chartOptions.is24HourTime, null, momentTimeFormatString, self_1.chartOptions.dateLocale)(d);
                });
            });
        }
        else {
            var indexOfLast_2 = this.xAxisEntered.selectAll('.tick').size() - 1;
            var self_2 = this;
            this.xAxisEntered.selectAll('.tick').each(function (d, i) {
                select(this).select('text').text(function (d) {
                    var momentTimeFormatString = String(self_2.smartTickFormat(d, i, i === 0, i === indexOfLast_2));
                    //harcode format of first and last to include hours/minutes if force first/last
                    if ((i === 0 && forceFirst) || (i === indexOfLast_2 && forceLast)) {
                        momentTimeFormatString = 'L ' + Utils.subDateTimeFormat(self_2.chartOptions.is24HourTime, false, false);
                    }
                    return Utils.timeFormat(self_2.labelFormatUsesSeconds(), self_2.labelFormatUsesMillis(), self_2.chartOptions.offset, self_2.chartOptions.is24HourTime, null, momentTimeFormatString, self_2.chartOptions.dateLocale)(d);
                });
            });
        }
        if (!this.chartOptions.singleLineXAxisLabel)
            this.xAxisEntered.selectAll('text').call(Utils.splitTimeLabel);
        this.xAxisEntered.select(".domain").style("display", "none");
    };
    TemporalXAxisComponent.prototype.drawXAxis = function (yOffset, snapFirst, snapLast) {
        if (snapFirst === void 0) { snapFirst = false; }
        if (snapLast === void 0) { snapLast = false; }
        this.xAxisEntered = this.xAxis.enter()
            .append("g")
            .attr("class", "xAxis")
            .merge(this.xAxis)
            .attr("transform", "translate(0," + yOffset + ")")
            .call(this.createXAxis(this.chartOptions.singleLineXAxisLabel, snapFirst, snapLast));
        this.updateAxisText(snapFirst, snapLast);
    };
    TemporalXAxisComponent.prototype.isSameDate = function (d1, d2) {
        return (d1.getYear() === d2.getYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate());
    };
    TemporalXAxisComponent.prototype.isTickSpanGreaterThan = function (ticks, minValue) {
        return (ticks[1].valueOf() - ticks[0].valueOf() >= minValue);
    };
    TemporalXAxisComponent.prototype.createSmartTickFormat = function (ticks, offsetX) {
        var _this = this;
        var spansMultipleDays = !this.isSameDate(offsetX.domain()[0], offsetX.domain()[1]);
        var lessTicksThanDays = this.isTickSpanGreaterThan(ticks, 23 * 60 * 60 * 1000);
        var timeFormat = Utils.subDateTimeFormat(this.chartOptions.is24HourTime, this.labelFormatUsesSeconds(ticks), this.labelFormatUsesMillis(ticks));
        return function (d, i, isFirst, isLast) {
            var timeAndDate = _this.chartOptions.singleLineXAxisLabel ? ('L ' + timeFormat) : (timeFormat + ' L');
            if (lessTicksThanDays) {
                return 'L';
            }
            if (isFirst || isLast) {
                return timeAndDate;
            }
            if (!spansMultipleDays) {
                return timeFormat;
            }
            return timeAndDate;
        };
    };
    return TemporalXAxisComponent;
}(ChartVisualizationComponent));

export { TemporalXAxisComponent as T };
