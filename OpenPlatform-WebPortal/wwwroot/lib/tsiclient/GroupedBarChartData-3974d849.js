import { a as __extends, U as Utils, C as ChartComponentData } from './Utils-e5be3308.js';
import { stack, stackOffsetDiverging, min, max } from 'd3';

var GroupedBarChartData = /** @class */ (function (_super) {
    __extends(GroupedBarChartData, _super);
    function GroupedBarChartData() {
        var _this = _super.call(this) || this;
        // allValues, aggsSeries, and allTimestampsArray span the entire time period of the aggregate expressions passed in
        _this.valuesOfVisibleType = [];
        _this.globalMax = -Number.MAX_VALUE;
        _this.globalMin = Number.MAX_VALUE;
        _this.stackMin = function (series) {
            return Number(min(series, function (d) { return d[0][0]; }));
        };
        _this.stackMax = function (series) {
            return Number(max(series, function (d) { return d[0][1]; }));
        };
        return _this;
    }
    GroupedBarChartData.prototype.mergeDataToDisplayStateAndTimeArrays = function (data, timestamp, aggregateExpressionOptions) {
        if (aggregateExpressionOptions === void 0) { aggregateExpressionOptions = null; }
        _super.prototype.mergeDataToDisplayStateAndTimeArrays.call(this, data, aggregateExpressionOptions);
        this.timestamp = timestamp;
        this.setValuesAtTimestamp();
        this.setFilteredAggregates();
    };
    //setting the data related to the entire time range (aggsSeries, allValus, globalMax, globalMin)
    GroupedBarChartData.prototype.setEntireRangeData = function (scaledToCurrentTime) {
        var _this = this;
        this.globalMax = -Number.MAX_VALUE;
        this.globalMin = Number.MAX_VALUE;
        this.aggsSeries = {};
        this.valuesOfVisibleType = [];
        Object.keys(this.displayState).forEach(function (aggKey, aggI) {
            var currentTimeSeries;
            _this.allTimestampsArray.forEach(function (ts) {
                if (_this.displayState[aggKey].visible) {
                    var localSplitByNames = [];
                    var stackedAggregateObject = Object.keys(_this.displayState[aggKey].splitBys).reverse().reduce(function (sAO, splitByName) {
                        var splitBy = _this.displayState[aggKey].splitBys[splitByName];
                        localSplitByNames.push(splitByName);
                        var value;
                        if (_this.data[aggI][_this.displayState[aggKey].name][splitByName][ts])
                            value = _this.data[aggI][_this.displayState[aggKey].name][splitByName][ts][splitBy.visibleType];
                        else
                            value = Number.MIN_VALUE;
                        if (!splitBy.visible) {
                            if (value > 0)
                                value = Number.MIN_VALUE;
                            else
                                value = -Number.MIN_VALUE;
                        }
                        sAO[splitByName] = value;
                        if ((!scaledToCurrentTime || ts == _this.timestamp) && splitBy.visible) {
                            _this.valuesOfVisibleType.push(value);
                        }
                        return sAO;
                    }, {});
                    var series = stack()
                        .keys(localSplitByNames)
                        .offset(stackOffsetDiverging)([stackedAggregateObject]);
                    series.reverse();
                    if (ts == _this.timestamp)
                        currentTimeSeries = series;
                    if ((ts == _this.timestamp || !scaledToCurrentTime) && series != undefined) {
                        _this.globalMax = Math.max(_this.stackMax(series), _this.globalMax);
                        _this.globalMin = Math.min(_this.stackMin(series), _this.globalMin);
                    }
                }
            });
            _this.aggsSeries[aggKey] = currentTimeSeries;
        });
    };
    GroupedBarChartData.prototype.setValuesAtTimestamp = function () {
        var _this = this;
        var aggregateCounterMap = {};
        this.valuesAtTimestamp = {};
        this.data.forEach(function (aggregate, aggI) {
            var aggName = Object.keys(aggregate)[0];
            var aggKey;
            if (aggregateCounterMap[aggName]) {
                aggKey = Utils.createEntityKey(aggName, aggregateCounterMap[aggName]);
                aggregateCounterMap[aggName] += 1;
            }
            else {
                aggKey = Utils.createEntityKey(aggName, 0);
                aggregateCounterMap[aggName] = 1;
            }
            _this.valuesAtTimestamp[aggKey] = {};
            _this.valuesAtTimestamp[aggKey].splitBys = Object.keys(aggregate[aggName])
                .reduce(function (aggSplitBys, splitBy, splitByI) {
                aggSplitBys[splitBy] = {};
                aggSplitBys[splitBy].measurements = aggregate[aggName][splitBy][_this.timestamp];
                return aggSplitBys;
            }, {});
        });
    };
    GroupedBarChartData.prototype.getValueContainerData = function (aggKey) {
        var _this = this;
        return Object.keys(this.displayState[aggKey].splitBys).map(function (splitBy) {
            var measureType = _this.displayState[aggKey].splitBys[splitBy].visibleType;
            var val;
            if (_this.valuesAtTimestamp[aggKey].splitBys[splitBy].measurements &&
                _this.valuesAtTimestamp[aggKey].splitBys[splitBy].measurements[measureType])
                val = _this.valuesAtTimestamp[aggKey].splitBys[splitBy].measurements[measureType];
            else
                val = null;
            return {
                measureType: measureType,
                aggKey: aggKey,
                splitBy: splitBy,
                val: val
            };
        });
    };
    return GroupedBarChartData;
}(ChartComponentData));

export { GroupedBarChartData as G };
