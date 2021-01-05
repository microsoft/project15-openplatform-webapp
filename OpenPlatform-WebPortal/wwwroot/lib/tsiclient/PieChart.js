import { a as __extends, C as ChartComponentData, U as Utils, _ as __assign, T as TooltipMeasureFormat } from './Utils-e5be3308.js';
import { select, pie, arc, mouse, event, easeExp, interpolate } from 'd3';
import 'moment-timezone';
import { L as Legend } from './Legend-7f738756.js';
import './EllipsisMenu.js';
import 'split.js';
import './ChartComponent-a7f89f69.js';
import './ChartDataOptions-59f6b399.js';
import { C as ChartVisualizationComponent } from './ChartVisualizationComponent-80709f0f.js';
import { C as ContextMenu } from './ContextMenu-966f73b8.js';
import { T as Tooltip } from './Tooltip-29a8c1ae.js';
import { G as GroupedBarChartData } from './GroupedBarChartData-3974d849.js';
import Slider from './Slider.js';

var PieChartData = /** @class */ (function (_super) {
    __extends(PieChartData, _super);
    function PieChartData() {
        var _this = _super.call(this) || this;
        _this.visibleValuesSum = 0;
        return _this;
    }
    PieChartData.prototype.mergeDataToDisplayStateAndTimeArrays = function (data, timestamp, aggregateExpressionOptions) {
        if (aggregateExpressionOptions === void 0) { aggregateExpressionOptions = null; }
        ChartComponentData.prototype.mergeDataToDisplayStateAndTimeArrays.call(this, data, aggregateExpressionOptions);
        this.timestamp = Utils.getValueOrDefault({ '': timestamp }, '', this.allTimestampsArray[0]);
        _super.prototype.setValuesAtTimestamp.call(this);
        this.setAllTimestampsArray();
    };
    PieChartData.prototype.updateFlatValueArray = function (timestamp) {
        var _this = this;
        this.visibleValuesSum = 0;
        var values = [];
        Object.keys(this.valuesAtTimestamp).forEach(function (aggKey) {
            Object.keys(_this.valuesAtTimestamp[aggKey].splitBys).forEach(function (splitBy, splitByI) {
                var value = 0;
                if (_this.getSplitByVisible(aggKey, splitBy) && _this.valuesAtTimestamp[aggKey].splitBys[splitBy].measurements != undefined)
                    value = _this.valuesAtTimestamp[aggKey].splitBys[splitBy].measurements[_this.getVisibleMeasure(aggKey, splitBy)];
                values.push({
                    aggKey: aggKey,
                    splitBy: splitBy,
                    val: value,
                    splitByI: splitByI
                });
                _this.visibleValuesSum += Math.abs(value);
            });
        });
        this.flatValueArray = values;
    };
    return PieChartData;
}(GroupedBarChartData));

var PieChart = /** @class */ (function (_super) {
    __extends(PieChart, _super);
    function PieChart(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.chartComponentData = new PieChartData();
        _this.chartMargins = {
            top: 20,
            bottom: 28,
            left: 0,
            right: 0
        };
        return _this;
    }
    PieChart.prototype.PieChart = function () { };
    PieChart.prototype.render = function (data, options, aggregateExpressionOptions) {
        var _this = this;
        _super.prototype.render.call(this, data, options, aggregateExpressionOptions);
        this.chartComponentData.mergeDataToDisplayStateAndTimeArrays(this.data, this.chartOptions.timestamp, this.aggregateExpressionOptions);
        var timestamp = (options && options.timestamp != undefined) ? options.timestamp : this.chartComponentData.allTimestampsArray[0];
        var targetElement = select(this.renderTarget)
            .classed("tsi-pieChart", true);
        if (this.svgSelection == null) {
            this.svgSelection = targetElement.append("svg")
                .attr("class", "tsi-pieChartSVG tsi-chartSVG")
                .attr('title', this.getString('Pie chart'));
            var g = this.svgSelection.append("g");
            var tooltip = new Tooltip(select(this.renderTarget));
            select(this.renderTarget).append('div').classed('tsi-sliderWrapper', true);
            this.draw = function (isFromResize) {
                if (isFromResize === void 0) { isFromResize = false; }
                // Determine the number of timestamps present, add margin for slider
                if (_this.chartComponentData.allTimestampsArray.length > 1)
                    _this.chartMargins.bottom = 68;
                if (_this.chartOptions.legend == "compact") {
                    _this.chartMargins.top = 68;
                }
                else {
                    _this.chartMargins.top = 20;
                }
                _this.width = _this.getWidth();
                var height = +targetElement.node().getBoundingClientRect().height;
                if (!isFromResize) {
                    _this.chartWidth = _this.getChartWidth();
                }
                var chartHeight = height;
                var usableHeight = height - _this.chartMargins.bottom - _this.chartMargins.top;
                var outerRadius = (Math.min(usableHeight, _this.chartWidth) - 10) / 2;
                var innerRadius = _this.chartOptions.arcWidthRatio &&
                    (_this.chartOptions.arcWidthRatio < 1 && _this.chartOptions.arcWidthRatio > 0) ?
                    outerRadius - (outerRadius * _this.chartOptions.arcWidthRatio) :
                    0;
                _this.svgSelection
                    .attr("width", _this.chartWidth)
                    .attr("height", chartHeight);
                _this.svgSelection.select("g").attr("transform", "translate(" + (_this.chartWidth / 2) + "," + (chartHeight / 2) + ")");
                var timestamp = (_this.chartOptions.timestamp != undefined) ? _this.chartOptions.timestamp : _this.chartComponentData.allTimestampsArray[0];
                _this.chartComponentData.updateFlatValueArray(timestamp);
                _super.prototype.themify.call(_this, targetElement, _this.chartOptions.theme);
                if (!_this.chartOptions.hideChartControlPanel && _this.chartControlsPanel === null) {
                    _this.chartControlsPanel = Utils.createControlPanel(_this.renderTarget, _this.CONTROLSWIDTH, _this.chartMargins.top, _this.chartOptions);
                }
                else if (_this.chartOptions.hideChartControlPanel && _this.chartControlsPanel !== null) {
                    _this.removeControlPanel();
                }
                if (_this.ellipsisItemsExist() && !_this.chartOptions.hideChartControlPanel) {
                    _this.drawEllipsisMenu();
                    _this.chartControlsPanel.style("top", Math.max((_this.chartMargins.top - 24), 0) + 'px');
                }
                else {
                    _this.removeControlPanel();
                }
                var labelMouseover = function (aggKey, splitBy) {
                    if (splitBy === void 0) { splitBy = null; }
                    //filter out the selected timeseries/splitby
                    var selectedFilter = function (d, j) {
                        return !(d.data.aggKey == aggKey && (splitBy == null || d.data.splitBy == splitBy));
                    };
                    _this.svgSelection.selectAll(".tsi-pie-path")
                        .filter(selectedFilter)
                        .attr("stroke-opacity", .3)
                        .attr("fill-opacity", .3);
                };
                var labelMouseout = function (aggregateKey, splitBy) {
                    _this.svgSelection.selectAll(".tsi-pie-path")
                        .attr("stroke-opacity", 1)
                        .attr("fill-opacity", 1);
                };
                function drawTooltip(d, mousePosition) {
                    var xPos = mousePosition[0];
                    var yPos = mousePosition[1];
                    tooltip.render(self.chartOptions.theme);
                    var color = Utils.colorSplitBy(self.chartComponentData.displayState, d.data.splitByI, d.data.aggKey, self.chartOptions.keepSplitByColor);
                    tooltip.draw(d, self.chartComponentData, xPos, yPos, __assign(__assign({}, self.chartMargins), { top: 0, bottom: 0 }), function (text) {
                        self.tooltipFormat(self.convertToTimeValueFormat(d.data), text, TooltipMeasureFormat.SingleValue);
                    }, null, 20, 20, color);
                }
                _this.legendObject.draw(_this.chartOptions.legend, _this.chartComponentData, labelMouseover, _this.svgSelection, _this.chartOptions, labelMouseout);
                var pie$1 = pie()
                    .sort(null)
                    .value(function (d) {
                    return Math.abs(d.val);
                });
                var path = arc()
                    .outerRadius(outerRadius)
                    .innerRadius(innerRadius);
                var arc$1 = g.selectAll(".tsi-pie-arc")
                    .data(pie$1(_this.chartComponentData.flatValueArray));
                var arcEntered = arc$1
                    .enter().append("g")
                    .merge(arc$1)
                    .attr("class", "tsi-pie-arc");
                var self = _this;
                var drawArc = arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);
                function arcTween(a) {
                    var i = interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) {
                        return drawArc(i(t));
                    };
                }
                var self = _this;
                function pathMouseout(d) {
                    if (self.contextMenu && self.contextMenu.contextMenuVisible)
                        return;
                    tooltip.hide();
                    labelMouseout(d.data.aggKey, d.data.splitBy);
                    self.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("inFocus", false);
                }
                function pathMouseInteraction(d) {
                    if (this.contextMenu && this.contextMenu.contextMenuVisible)
                        return;
                    pathMouseout(d);
                    labelMouseover(d.data.aggKey, d.data.splitBy);
                    self.legendObject.legendElement.selectAll('.tsi-splitByLabel').filter(function (filteredSplitBy) {
                        return (select(this.parentNode).datum() == d.data.aggKey) && (filteredSplitBy == d.data.splitBy);
                    }).classed("inFocus", true);
                    drawTooltip(d, mouse(self.svgSelection.node()));
                }
                var mouseOutArcOnContextMenuClick = function () {
                    arcEntered.selectAll("path").each(pathMouseout);
                };
                arcEntered.each(function () {
                    var pathElem = select(this).selectAll(".tsi-pie-path").data(function (d) { return [d]; });
                    var pathEntered = pathElem.enter()
                        .append("path")
                        .attr("class", "tsi-pie-path")
                        .attr("d", drawArc)
                        .on("mouseover", pathMouseInteraction)
                        .on("mousemove", pathMouseInteraction)
                        .on("mouseout", pathMouseout)
                        .on("contextmenu", function (d, i) {
                        if (self.chartComponentData.displayState[d.data.aggKey].contextMenuActions &&
                            self.chartComponentData.displayState[d.data.aggKey].contextMenuActions.length) {
                            var mousePosition = mouse(targetElement.node());
                            event.preventDefault();
                            self.contextMenu.draw(self.chartComponentData, self.renderTarget, self.chartOptions, mousePosition, d.data.aggKey, d.data.splitBy, mouseOutArcOnContextMenuClick, new Date(self.chartComponentData.timestamp));
                        }
                    })
                        .each(function (d) { this._current = d; })
                        .merge(pathElem)
                        .transition()
                        .duration(self.TRANSDURATION)
                        .ease(easeExp)
                        .attrTween("d", arcTween)
                        .attr("fill", function (d) {
                        return Utils.colorSplitBy(self.chartComponentData.displayState, d.data.splitByI, d.data.aggKey, self.chartOptions.keepSplitByColor);
                    })
                        .attr("class", "tsi-pie-path");
                });
                arc$1.exit().remove();
                /******************** Temporal Slider ************************/
                if (_this.chartComponentData.allTimestampsArray.length > 1) {
                    select(_this.renderTarget).select('.tsi-sliderWrapper').classed('tsi-hidden', false);
                    slider.render(_this.chartComponentData.allTimestampsArray.map(function (ts) {
                        var action = function () {
                            _this.chartOptions.timestamp = ts;
                            _this.render(_this.chartComponentData.data, _this.chartOptions, _this.aggregateExpressionOptions);
                        };
                        return { label: Utils.timeFormat(_this.chartComponentData.usesSeconds, _this.chartComponentData.usesMillis, _this.chartOptions.offset, _this.chartOptions.is24HourTime, null, null, _this.chartOptions.dateLocale)(new Date(ts)), action: action };
                    }), _this.chartOptions, _this.chartWidth, Utils.timeFormat(_this.chartComponentData.usesSeconds, _this.chartComponentData.usesMillis, _this.chartOptions.offset, _this.chartOptions.is24HourTime, null, null, _this.chartOptions.dateLocale)(new Date(_this.chartComponentData.timestamp)));
                }
                else {
                    slider.remove();
                    select(_this.renderTarget).select('.tsi-sliderWrapper').classed('tsi-hidden', true);
                }
            };
            this.legendObject = new Legend(this.draw, this.renderTarget, this.CONTROLSWIDTH);
            this.contextMenu = new ContextMenu(this.draw, this.renderTarget);
            // temporal slider
            var slider = new Slider(select(this.renderTarget).select('.tsi-sliderWrapper').node());
            window.addEventListener("resize", function () {
                if (!_this.chartOptions.suppressResizeListener)
                    _this.draw();
            });
        }
        this.draw();
        this.gatedShowGrid();
        select("html").on("click." + Utils.guid(), function () {
            if (_this.ellipsisContainer && event.target != _this.ellipsisContainer.select(".tsi-ellipsisButton").node()) {
                _this.ellipsisMenu.setMenuVisibility(false);
            }
        });
        this.legendPostRenderProcess(this.chartOptions.legend, this.svgSelection, true);
    };
    return PieChart;
}(ChartVisualizationComponent));

export default PieChart;
