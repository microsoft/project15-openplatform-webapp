import { a as __extends, U as Utils, _ as __assign } from './Utils-e5be3308.js';
import 'd3';
import 'moment-timezone';
import { C as ChartDataOptions } from './ChartDataOptions-59f6b399.js';

var MAXCARD = 150000;
var AggregateExpression = /** @class */ (function (_super) {
    __extends(AggregateExpression, _super);
    function AggregateExpression(predicateObject, measureObject, measureTypes, searchSpan, splitByObject, colorOrOptionsObject, alias, contextMenu) {
        if (splitByObject === void 0) { splitByObject = null; }
        var _this = _super.call(this, (typeof (colorOrOptionsObject) === 'object' && !!colorOrOptionsObject) ? __assign(__assign({}, colorOrOptionsObject), { searchSpan: searchSpan, measureTypes: measureTypes }) : { color: colorOrOptionsObject, searchSpan: searchSpan, measureTypes: measureTypes, alias: alias, contextMenu: contextMenu }) || this;
        _this.visibleSplitByCap = 10;
        _this.predicate = predicateObject;
        _this.splitByObject = splitByObject;
        _this.measureObject = ((measureTypes.length == 1 && measureTypes[0] == 'count') || measureObject.property == 'Events Count') ? { count: {} } : { input: measureObject };
        return _this;
    }
    AggregateExpression.prototype.toTsx = function (roundFromTo) {
        var _this = this;
        if (roundFromTo === void 0) { roundFromTo = false; }
        var tsx = {};
        var shiftMillis = Utils.parseShift(this.timeShift, this.startAt, this.searchSpan);
        var fromMillis = this.searchSpan.from.valueOf() + shiftMillis;
        var toMillis = this.searchSpan.to.valueOf() + shiftMillis;
        var bucketSizeInMillis = Utils.parseTimeInput(this.searchSpan.bucketSize);
        var roundedFromMillis = Math.floor((fromMillis + 62135596800000) / (bucketSizeInMillis)) * (bucketSizeInMillis) - 62135596800000;
        var roundedToMillis = Math.ceil((toMillis + 62135596800000) / (bucketSizeInMillis)) * (bucketSizeInMillis) - 62135596800000;
        if (roundFromTo) {
            fromMillis = roundedFromMillis;
            toMillis = roundedToMillis;
        }
        tsx['searchSpan'] = { from: (new Date(fromMillis)).toISOString(), to: (new Date(toMillis)).toISOString() };
        // create aggregates
        var measures = (this.measureObject.hasOwnProperty('count')) ? [{ count: {} }]
            : this.measureTypes.reduce(function (p, c) {
                var measureObject = {};
                if (c == 'count')
                    measureObject = { count: {} };
                else
                    measureObject[c] = _this['measureObject'];
                p.push(measureObject);
                return p;
            }, []);
        var aggregateObject = {};
        var dimensionObject = { dateHistogram: { input: { builtInProperty: "$ts" }, breaks: { size: this.searchSpan.bucketSize } } };
        if (this.splitByObject != null) {
            var bucketsCeil = Math.ceil((roundedToMillis - roundedFromMillis) / bucketSizeInMillis);
            aggregateObject['dimension'] = { uniqueValues: { input: this.splitByObject, take: Math.floor(MAXCARD / bucketsCeil) } };
            aggregateObject['aggregate'] = { dimension: dimensionObject, measures: measures };
        }
        else {
            aggregateObject['dimension'] = dimensionObject;
            aggregateObject['measures'] = measures;
        }
        var aggregates = [aggregateObject];
        tsx['aggregates'] = aggregates;
        // create predicate
        var predicate;
        if (!this.measureObject.hasOwnProperty('count'))
            predicate = { and: [this.predicate, { not: { eq: { left: this.measureObject.input, right: { 'double': null } } } }] };
        else
            predicate = this.predicate;
        tsx['predicate'] = predicate;
        return tsx;
    };
    return AggregateExpression;
}(ChartDataOptions));

export default AggregateExpression;
