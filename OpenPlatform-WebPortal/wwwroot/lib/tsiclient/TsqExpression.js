import { a as __extends, U as Utils, _ as __assign } from './Utils-e5be3308.js';
import 'd3';
import 'moment-timezone';
import { C as ChartDataOptions } from './ChartDataOptions-59f6b399.js';

var TsqExpression = /** @class */ (function (_super) {
    __extends(TsqExpression, _super);
    function TsqExpression(instanceObject, variableObject, searchSpan, colorOrOptionsObject, alias, contextMenu) {
        var _this = this;
        // This constructor should be called with the following parameters: 
        // new TsqExpression(instanceObject, variableObject, searchSpan, optionsObject)
        // where the optionsObject should contain properties for color, alias, and contextMenu.
        //
        // However, to maintain backwards compatibility with older code, the constructor still 
        // accepts the older set of parameters:
        // new TsqExpression(instanceObject, variableObject, searchSpan, color, alias, contextMenu)
        // Here we differentiate between both and call the parent class's constructor as appropriate.
        var optionsObject = (typeof (colorOrOptionsObject) === 'object' && !!colorOrOptionsObject)
            ? __assign(__assign({}, colorOrOptionsObject), { searchSpan: searchSpan, measureTypes: Object.keys(variableObject) }) : {
            color: colorOrOptionsObject,
            searchSpan: searchSpan,
            measureTypes: Object.keys(variableObject),
            alias: alias,
            contextMenu: contextMenu
        };
        _this = _super.call(this, optionsObject) || this;
        _this.instanceObject = instanceObject;
        _this.variableObject = variableObject;
        return _this;
    }
    TsqExpression.prototype.toTsq = function (roundFromTo, getEvents, getSeries) {
        if (roundFromTo === void 0) { roundFromTo = false; }
        if (getEvents === void 0) { getEvents = false; }
        if (getSeries === void 0) { getSeries = false; }
        var tsq = {};
        var shiftMillis = Utils.parseShift(this.timeShift, this.startAt, this.searchSpan);
        var fromMillis = this.searchSpan.from.valueOf() + shiftMillis;
        var toMillis = this.searchSpan.to.valueOf() + shiftMillis;
        if (roundFromTo) {
            var bucketSizeInMillis = Utils.parseTimeInput(this.searchSpan.bucketSize);
            var roundedFromMillis = Math.floor((fromMillis + 62135596800000) / (bucketSizeInMillis)) * (bucketSizeInMillis) - 62135596800000;
            var roundedToMillis = Math.ceil((toMillis + 62135596800000) / (bucketSizeInMillis)) * (bucketSizeInMillis) - 62135596800000;
            fromMillis = roundedFromMillis;
            toMillis = roundedToMillis;
        }
        tsq['searchSpan'] = { from: (new Date(fromMillis)).toISOString(), to: (new Date(toMillis)).toISOString() };
        tsq['timeSeriesId'] = this.instanceObject.timeSeriesId;
        if (getEvents) {
            return { getEvents: tsq };
        }
        else if (getSeries) {
            tsq['inlineVariables'] = __assign({}, this.variableObject);
            tsq['projectedVariables'] = Object.keys(this.variableObject);
            return { getSeries: tsq };
        }
        else {
            tsq['interval'] = Utils.bucketSizeToTsqInterval(this.searchSpan.bucketSize);
            tsq['inlineVariables'] = __assign({}, this.variableObject);
            tsq['projectedVariables'] = Object.keys(this.variableObject);
            return { aggregateSeries: tsq };
        }
    };
    // This method will create an API query payload for the variable statistics of the first inline variable
    // of this object, for numeric dataTypes. Categorical types work as expected.
    TsqExpression.prototype.toStatsTsq = function (fromMillis, toMillis) {
        var tsq = this.toTsq();
        var shiftMillis = Utils.parseShift(this.timeShift);
        fromMillis += shiftMillis;
        toMillis += shiftMillis;
        tsq.aggregateSeries['searchSpan'] = { from: (new Date(fromMillis)).toISOString(), to: (new Date(toMillis)).toISOString() };
        tsq.aggregateSeries['interval'] = 'P1000Y';
        if (this.dataType === 'numeric') {
            var inlineVariables_1 = { min: {}, max: {}, avg: {}, stDev: {} };
            var firstVariable_1 = tsq.aggregateSeries['inlineVariables'][Object.keys(tsq.aggregateSeries['inlineVariables'])[0]];
            Object.keys(inlineVariables_1).forEach(function (k) {
                inlineVariables_1[k] = JSON.parse(JSON.stringify(firstVariable_1));
                inlineVariables_1[k].aggregation.tsx = k + "($value)";
                delete inlineVariables_1[k]['interpolation'];
            });
            tsq.aggregateSeries['inlineVariables'] = inlineVariables_1;
            tsq.aggregateSeries['projectedVariables'] = Object.keys(inlineVariables_1);
        }
        return tsq;
    };
    return TsqExpression;
}(ChartDataOptions));

export default TsqExpression;
