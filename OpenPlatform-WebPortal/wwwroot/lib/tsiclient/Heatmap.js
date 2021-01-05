import { U as Utils, a as __extends, _ as __assign } from './Utils-e5be3308.js';
import { mouse, extent, select, scaleSequential, interpolateViridis, scaleLinear, hcl, scaleTime } from 'd3';
import 'moment-timezone';
import { L as Legend } from './Legend-7f738756.js';
import EllipsisMenu from './EllipsisMenu.js';
import 'split.js';
import { C as ChartComponent } from './ChartComponent-a7f89f69.js';
import './ChartDataOptions-59f6b399.js';
import './ChartVisualizationComponent-80709f0f.js';
import { T as TemporalXAxisComponent } from './TemporalXAxisComponent-f960f34b.js';

var HeatmapData = /** @class */ (function () {
    function HeatmapData(chartComponentData, aggKey) {
        var _this = this;
        this.visibleSBs = [];
        this.timeStamps = [];
        this.numRows = 0;
        this.numCols = 0;
        this.aggKey = aggKey;
        this.chartComponentData = chartComponentData;
        this.chartComponentData.isFromHeatmap = true;
        this.visibleSBs = Object.keys(this.chartComponentData.displayState[aggKey].splitBys).filter(function (sb) {
            return (_this.chartComponentData.getSplitByVisible(aggKey, sb));
        });
        this.numRows = this.visibleSBs.length;
        this.from = new Date(chartComponentData.displayState[aggKey].aggregateExpression.searchSpan.from);
        this.to = new Date(chartComponentData.displayState[aggKey].aggregateExpression.searchSpan.to);
        this.bucketSize = Utils.parseTimeInput(chartComponentData.displayState[aggKey].aggregateExpression.searchSpan.bucketSize);
        this.createTimeValues();
    }
    HeatmapData.prototype.adjustStartTime = function () {
        return new Date(Utils.adjustStartMillisToAbsoluteZero(new Date(this.from).valueOf(), this.bucketSize));
    };
    HeatmapData.prototype.createTimeValues = function () {
        var _this = this;
        this.timeValues = {};
        this.allValues = [];
        //turn time array into an object keyed by timestamp 
        var colI = 0;
        var adjustedStartTime = this.adjustStartTime();
        for (var currTime = adjustedStartTime; (currTime.valueOf() < this.to.valueOf()); currTime = new Date(currTime.valueOf() + this.bucketSize)) {
            this.timeValues[currTime.toISOString()] = this.visibleSBs.reduce(function (obj, splitBy, splitByI) {
                obj[splitBy] = {
                    colI: colI,
                    rowI: splitByI,
                    value: null
                };
                return obj;
            }, {});
            colI += 1;
        }
        this.numCols = Object.keys(this.timeValues).length;
        this.visibleSBs.forEach(function (splitBy, rowI) {
            _this.chartComponentData.timeArrays[_this.aggKey][splitBy].forEach(function (valueObject, colI) {
                var timestamp = new Date(valueObject.dateTime.valueOf()).toISOString();
                var visibleMeasure = _this.chartComponentData.getVisibleMeasure(_this.aggKey, splitBy);
                if (_this.timeValues[timestamp]) {
                    _this.timeValues[timestamp][splitBy].value = valueObject.measures ? valueObject.measures[visibleMeasure] : null;
                    if (Utils.safeNotNullOrUndefined(function () { return valueObject.measures[visibleMeasure]; }))
                        _this.allValues.push(valueObject.measures[visibleMeasure]);
                }
            });
        });
    };
    return HeatmapData;
}());

var HeatmapCanvas = /** @class */ (function (_super) {
    __extends(HeatmapCanvas, _super);
    function HeatmapCanvas(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.gradientWidth = 8;
        _this.focusedXIndex = -1;
        _this.focusedYIndex = -1;
        _this.legendWidth = 80;
        return _this;
    }
    HeatmapCanvas.prototype.renderScale = function () {
        var _this = this;
        this.colorLegend.selectAll("*").remove();
        if (this.colorScale.domain() === null || isNaN(this.colorScale.domain()[0]) || isNaN(this.colorScale.domain()[1])) {
            return;
        }
        var gradientGuid = Utils.guid();
        var gradient = this.colorLegend.append("defs")
            .append("linearGradient")
            .attr("id", "gradient" + this.aggI + gradientGuid)
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");
        var percentileCalc = function (i) { return i * (_this.colorScale.domain()[1] - _this.colorScale.domain()[0]) + _this.colorScale.domain()[0]; };
        for (var i = 0; i <= 20; i++) {
            var interpolatedColor = this.colorScale(percentileCalc(i / 20));
            gradient.append("stop")
                .attr("offset", (i * 5) + "%")
                .attr("stop-color", interpolatedColor)
                .attr("stop-opacity", 1);
        }
        var gradientRect = this.colorLegend.append("rect")
            .attr("x", this.legendWidth - this.gradientWidth)
            .attr("y", 6)
            .attr("width", this.gradientWidth)
            .attr("height", Math.max(0, this.height - 12))
            .style("fill", "url(#gradient" + String(this.aggI) + gradientGuid + ")");
        var highlightedValueY = null;
        var range = this.colorScale.domain()[1] - this.colorScale.domain()[0];
        var highlightedText = this.colorLegend.append("text").attr("class", "highlightedValueText");
        var highlightedLine = this.colorLegend.append("line").attr("class", "highlightedValueLine");
        var minText = this.colorLegend.append("text");
        var maxText = this.colorLegend.append("text");
        var setHighlightedValueLineAndText = function (line, text) {
            var percentile;
            if (range == 0) {
                percentile = .5;
            }
            else {
                percentile = (_this.highlightedValue != null) ? (_this.highlightedValue - _this.colorScale.domain()[0]) / range : 0;
            }
            highlightedValueY = (_this.height - 6) + (12 - _this.height) * percentile;
            text.attr("x", _this.legendWidth - _this.gradientWidth - 10)
                .attr("y", highlightedValueY)
                .style("stroke-width", 2)
                .text(Utils.formatYAxisNumber(_this.highlightedValue));
            line.attr("x1", _this.legendWidth - _this.gradientWidth - 5)
                .attr("x2", _this.legendWidth)
                .attr("y1", highlightedValueY)
                .attr("y2", highlightedValueY)
                .style("stroke-width", 2);
            minText.attr("fill-opacity", ((highlightedValueY == null) || highlightedValueY < _this.height - 18) ? 1 : 0);
            maxText.attr("fill-opacity", ((highlightedValueY == null) || highlightedValueY > 18) ? 1 : 0);
        };
        minText.attr("x", this.legendWidth - this.gradientWidth - 5)
            .attr("y", this.height - 6)
            .text(Utils.formatYAxisNumber(this.colorScale.domain()[0]))
            .attr("fill-width", ((highlightedValueY == null) || highlightedValueY < this.height - 18) ? 1 : 0);
        maxText.attr("x", this.legendWidth - this.gradientWidth - 5)
            .attr("y", 6)
            .text(Utils.formatYAxisNumber(this.colorScale.domain()[1]))
            .attr("fill-opacity", ((highlightedValueY == null) || highlightedValueY > 18) ? 1 : 0);
        //render highlightedValue text and line IF there is a highlighted time and split by, OR IF there is an 
        //  artificially produced value from hovering over the color gradient
        if (this.highlightedTime && this.highlightedSplitBy != null && this.highlightedValue != null) {
            setHighlightedValueLineAndText(highlightedLine, highlightedText);
            minText.attr("fill-opacity", ((highlightedValueY == null) || highlightedValueY < this.height - 18) ? 1 : 0);
            maxText.attr("fill-opacity", ((highlightedValueY == null) || highlightedValueY > 18) ? 1 : 0);
        }
        var self = this;
        gradientRect.on("mousemove", function () {
            var yPos = mouse(this)[1];
            var percentile = 1 - ((yPos - 6) / (self.height - 12));
            self.highlightedValue = self.colorScale.domain()[0] + (range * percentile);
            setHighlightedValueLineAndText(highlightedLine, highlightedText);
        })
            .on("mouseleave", function () {
            _this.render(_this.data, _this.chartOptions, _this.aggKey, null, null, _this.onCellFocus, null, _this.isOnlyAgg);
        });
    };
    HeatmapCanvas.prototype.getExtent = function () {
        var rawExtent = extent(this.heatmapData.allValues);
        var extent$1 = rawExtent;
        if (rawExtent[0] === rawExtent[1]) {
            extent$1 = [rawExtent[0] - .05, rawExtent[1] + .05];
        }
        return extent$1;
    };
    HeatmapCanvas.prototype.render = function (data, chartOptions, aggKey, highlightedSplitBy, highlightedTime, onCellFocus, aggI, isOnlyAgg) {
        var _this = this;
        if (highlightedSplitBy === void 0) { highlightedSplitBy = null; }
        if (highlightedTime === void 0) { highlightedTime = null; }
        this.chartOptions.setOptions(chartOptions);
        this.aggKey = aggKey;
        this.data = data;
        this.isOnlyAgg = isOnlyAgg;
        if (aggI != null) {
            this.aggI = aggI;
        }
        this.heatmapData = new HeatmapData(data, aggKey);
        var container = select(this.renderTarget).classed("tsi-heatmapCanvasWrapper", true);
        _super.prototype.themify.call(this, container, this.chartOptions.theme);
        if (highlightedSplitBy != null)
            this.highlightedSplitBy = highlightedSplitBy;
        this.highlightedTime = highlightedTime;
        if (this.highlightedSplitBy != null && this.highlightedTime) {
            if (this.heatmapData.timeValues[this.highlightedTime.toISOString()][this.highlightedSplitBy] != null) {
                this.highlightedValue = this.heatmapData.timeValues[this.highlightedTime.toISOString()][this.highlightedSplitBy].value;
            }
        }
        if (onCellFocus)
            this.onCellFocus = onCellFocus;
        if (!container.select("canvas").empty())
            this.canvas = container.select("canvas");
        else
            this.canvas = container.append("canvas").attr("class", "tsi-heatmapCanvas");
        this.width = Math.floor(container.node().getBoundingClientRect().width - this.legendWidth - 10);
        this.height = Math.floor(container.node().getBoundingClientRect().height);
        this.canvas.attr("width", this.width);
        this.canvas.attr("height", this.height);
        this.ctx = this.canvas.node().getContext("2d");
        this.ctx.clearRect(0, 0, this.width, this.height);
        container.selectAll("svg").remove();
        var self = this;
        this.canvas.on("mousemove", function () {
            var mouseCoords = mouse(this);
            var indexesChanged = false;
            var newXIndex = self.calcCellXIndex(mouseCoords[0]);
            var newYIndex = self.calcCellYIndex(mouseCoords[1]);
            var visibleSplitBys = Object.keys(self.data.displayState[aggKey].splitBys).filter(function (splitBy) {
                return self.data.isSplitByVisible(self.aggKey, splitBy);
            });
            if (newXIndex != self.focusedXIndex) {
                self.focusedXIndex = newXIndex;
                indexesChanged = true;
            }
            if (newYIndex != self.focusedYIndex) {
                self.focusedYIndex = newYIndex;
                indexesChanged = true;
            }
            var highlightedSplitBy = visibleSplitBys[self.focusedYIndex];
            if (indexesChanged && self.focusedXIndex >= 0 && self.focusedYIndex >= 0) {
                var cellX = self.calcCellX(self.focusedXIndex);
                var sortedDates = Object.keys(self.heatmapData.timeValues)
                    .sort(function (a, b) {
                    return ((new Date(a)).valueOf() < (new Date(b)).valueOf()) ? -1 : 1;
                });
                var startDate = new Date(sortedDates[self.focusedXIndex]);
                this.highlightedTime = startDate;
                self.onCellFocus(startDate, new Date(startDate.valueOf() + self.heatmapData.bucketSize), Math.max(0, cellX), cellX + self.calcCellWidth(self.focusedXIndex), self.calcCellY(self.focusedYIndex), highlightedSplitBy);
            }
            self.render(self.data, self.chartOptions, self.aggKey, highlightedSplitBy, this.highlightedTime, self.onCellFocus, null, self.isOnlyAgg);
        }).on("mouseout", function () {
            self.focusedXIndex = -1;
            self.focusedYIndex = -1;
            self.render(self.data, self.chartOptions, self.aggKey, null, null, self.onCellFocus, null, self.isOnlyAgg);
        });
        this.aggKey = aggKey;
        this.rawCellHeight = Math.floor(this.height / this.heatmapData.numRows);
        this.cellHeightMod = this.height % this.heatmapData.numRows;
        this.rawCellWidth = this.width / this.heatmapData.numCols;
        this.cellWidthMod = this.width % this.heatmapData.numCols;
        this.colorLegend = container.append("svg").attr("class", "tsi-heatmapColorLegend");
        this.colorLegend.attr("width", this.legendWidth)
            .attr("height", this.height)
            .style("left", (this.width) + "px");
        var aggColor = data.displayState[aggKey].color;
        if (isOnlyAgg) {
            this.colorScale = scaleSequential(interpolateViridis).domain(this.getExtent());
        }
        else {
            this.colorScale = scaleLinear().domain(this.getExtent())
                .range([hcl(aggColor).brighter(), hcl(aggColor).darker()]);
        }
        this.renderScale();
        var sortedTimes = Object.keys(this.heatmapData.timeValues).sort(function (a, b) {
            return ((new Date(a)).valueOf() < (new Date(b)).valueOf()) ? -1 : 1;
        });
        sortedTimes.forEach(function (ts, tsI) {
            Object.keys(_this.heatmapData.timeValues[ts]).forEach(function (splitBy, sBI) {
                var cellData = _this.heatmapData.timeValues[ts][splitBy];
                if (cellData != null) {
                    if (highlightedSplitBy && highlightedSplitBy != splitBy) {
                        _this.drawCell(cellData.rowI, cellData.colI, cellData.value, true);
                    }
                    else {
                        _this.drawCell(cellData.rowI, cellData.colI, cellData.value);
                    }
                }
            });
        });
    };
    HeatmapCanvas.prototype.calcCellXIndex = function (x) {
        var xI = 0;
        while (Math.round(xI * this.rawCellWidth) < x) {
            xI++;
        }
        return Math.max(xI - 1, 0);
    };
    HeatmapCanvas.prototype.calcCellYIndex = function (y) {
        if (y < (this.cellHeightMod * (this.rawCellHeight + 1)))
            return Math.floor(y / (this.rawCellHeight + 1));
        var modOffset = this.cellHeightMod * (this.rawCellHeight + 1);
        return Math.floor((y - modOffset) / this.rawCellHeight) + this.cellHeightMod;
    };
    HeatmapCanvas.prototype.calcCellHeight = function (i) {
        return this.rawCellHeight + (i < this.cellHeightMod ? 1 : 0) - (this.rawCellWidth > 10 ? 1 : 0);
    };
    HeatmapCanvas.prototype.calcCellX = function (i) {
        return Math.round(this.rawCellWidth * i);
    };
    HeatmapCanvas.prototype.calcCellWidth = function (i) {
        return (Math.round(this.rawCellWidth * (i + 1)) - Math.round(this.rawCellWidth * i) - (this.rawCellWidth > 10 ? 1 : 0));
    };
    HeatmapCanvas.prototype.calcCellY = function (i) {
        return Math.min(i, this.cellHeightMod) + (this.rawCellHeight * i);
    };
    HeatmapCanvas.prototype.drawCell = function (rowI, colI, value, outOfFocus) {
        if (outOfFocus === void 0) { outOfFocus = false; }
        var x = this.calcCellX(colI);
        var y = this.calcCellY(rowI);
        this.ctx.fillStyle = value !== null ? this.colorScale(value) : "transparent";
        this.ctx.globalAlpha = outOfFocus ? .3 : 1;
        this.ctx.fillRect(this.calcCellX(colI), this.calcCellY(rowI), this.calcCellWidth(colI), this.calcCellHeight(rowI));
    };
    return HeatmapCanvas;
}(ChartComponent));

var Heatmap = /** @class */ (function (_super) {
    __extends(Heatmap, _super);
    function Heatmap(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.lineHeight = 12;
        _this.splitByLabelWidth = 140;
        _this.timeLabels = null;
        _this.timeLabelsHeight = 52;
        _this.visibleAggs = null;
        _this.mouseover = function (hoveredAggKey, hoveredSplitBy) {
            var heatmapCanvas = _this.heatmapCanvasMap[hoveredAggKey];
            if (heatmapCanvas)
                heatmapCanvas.render(_this.chartComponentData, _this.chartOptions, hoveredAggKey, hoveredSplitBy, null, null, null, _this.visibleAggs.length === 1);
        };
        _this.mouseout = function (selection, hoveredAggKey) {
            var heatmapCanvas = _this.heatmapCanvasMap[hoveredAggKey];
            if (heatmapCanvas)
                heatmapCanvas.render(_this.chartComponentData, _this.chartOptions, hoveredAggKey, null, null, null, null, _this.visibleAggs.length === 1);
        };
        _this.renderTimeLabels = function (focusStartTime, focusEndTime, focusX1, focusX2, focusY, yOffset, shiftMillis) {
            _this.timeLabels.selectAll(".tsi-heatmapTimeLabels").remove();
            _this.timeLabels.node().parentNode.appendChild(_this.timeLabels.node());
            _this.timeLabels.append("line").attr("class", "tsi-heatmapFocusLine tsi-heatmapTimeLabels")
                .attr("x1", focusX1)
                .attr("x2", focusX1)
                .attr("y1", focusY + yOffset)
                .attr("y2", _this.chartHeight - _this.timeLabelsHeight);
            _this.timeLabels.append("line").attr("class", "tsi-heatmapFocusLine tsi-heatmapTimeLabels")
                .attr("x1", focusX2)
                .attr("x2", focusX2)
                .attr("y1", focusY + yOffset)
                .attr("y2", _this.chartHeight - _this.timeLabelsHeight);
            var textBoxG = _this.timeLabels.append("g")
                .attr("class", "tsi-heatmapTimeLabelTextBox tsi-heatmapTimeLabels");
            var text = textBoxG.append("text");
            text.append("tspan").text(Utils.timeFormat(_this.chartComponentData.usesSeconds, _this.chartComponentData.usesMillis, _this.chartOptions.offset, _this.chartOptions.is24HourTime, shiftMillis, null, _this.chartOptions.dateLocale)(focusStartTime))
                .attr("x", 0)
                .attr("y", 16);
            text.append("tspan").text(Utils.timeFormat(_this.chartComponentData.usesSeconds, _this.chartComponentData.usesMillis, _this.chartOptions.offset, _this.chartOptions.is24HourTime, shiftMillis, null, _this.chartOptions.dateLocale)(focusEndTime))
                .attr("x", 0)
                .attr("y", 30);
            var textDimensions = text.node().getBoundingClientRect();
            textBoxG.append("rect")
                .attr("x", -(textDimensions.width / 2) - 5)
                .attr("y", 0)
                .attr("height", textDimensions.height + 12)
                .attr("width", textDimensions.width + 10);
            text.node().parentNode.appendChild(text.node());
            var rawOffset = (focusX1 + focusX2) / 2;
            var leftOffset = Math.floor(((rawOffset - ((textDimensions.width / 2) + 6)) > 0) ? rawOffset : ((textDimensions.width / 2) + 6));
            textBoxG.attr("transform", "translate(" + leftOffset + "," + (_this.chartHeight - _this.timeLabelsHeight - _this.chartMargins.bottom) + ")");
        };
        _this.chartMargins = {
            top: 0,
            bottom: 8,
            left: 40,
            right: 20
        };
        return _this;
    }
    Heatmap.prototype.focusOnEllipsis = function () {
        if (this.ellipsisContainer !== null) {
            this.ellipsisContainer.select(".tsi-ellipsisButton").node().focus();
        }
    };
    Heatmap.prototype.createControlsPanel = function () {
        this.chartControlsPanel = Utils.createControlPanel(this.renderTarget, this.CONTROLSWIDTH, 52, this.chartOptions);
        this.ellipsisContainer = this.chartControlsPanel.append("div")
            .attr("class", "tsi-ellipsisContainerDiv");
        this.ellipsisMenu = new EllipsisMenu(this.ellipsisContainer.node());
    };
    Heatmap.prototype.chartControlsExist = function () {
        return (this.ellipsisItemsExist() && !this.chartOptions.hideChartControlPanel);
    };
    Heatmap.prototype.addTimeLabels = function () {
        if (this.timeLabels === null || this.svgSelection === null) {
            this.svgSelection = this.heatmapWrapper.append('svg')
                .attr('class', 'tsi-heatmapSVG')
                .attr('title', this.getString('Heatmap'));
            this.timeLabels = this.svgSelection.append('g').attr("class", "tsi-heatmapTimeLabels")
                .attr('transform', 'translate(' + this.chartMargins.left + ',0)');
        }
        if (!this.chartOptions.xAxisHidden) {
            this.xAxis = this.timeLabels.selectAll(".xAxis").data([this.x]);
            this.drawXAxis(this.chartHeight - 60);
            this.xAxis.exit().remove();
            var xAxisBaseline = this.timeLabels.selectAll(".xAxisBaseline").data([this.x]);
            var xAxisBaselineEntered = xAxisBaseline.enter().append("line")
                .attr("class", "xAxisBaseline")
                .attr("x1", .5)
                .merge(xAxisBaseline)
                .attr("y2", this.chartHeight - (this.chartMargins.bottom + this.timeLabelsHeight))
                .attr("y1", this.chartHeight - (this.chartMargins.bottom + this.timeLabelsHeight))
                .attr("x2", this.chartWidth - 90);
            xAxisBaseline.exit().remove();
        }
        if (this.timeLabels.selectAll(".xAxis").size() !== 0) {
            this.timeLabels.selectAll(".xAxis").style("visibility", ((!this.chartOptions.xAxisHidden) ? "visible" : "hidden"));
        }
    };
    Heatmap.prototype.render = function (data, chartOptions, aggregateExpressionOptions) {
        var _this = this;
        _super.prototype.render.call(this, data, chartOptions, aggregateExpressionOptions);
        // override visibleSplitByCap
        this.aggregateExpressionOptions = this.aggregateExpressionOptions.map(function (aE) {
            return __assign(__assign({}, aE), { visibleSplitByCap: 10000 });
        });
        this.chartOptions.setOptions(chartOptions);
        var targetElement = select(this.renderTarget).classed("tsi-heatmapComponent", true);
        if (targetElement.style("position") == "static")
            targetElement.style("position", "relative");
        this.chartComponentData.mergeDataToDisplayStateAndTimeArrays(this.data, this.aggregateExpressionOptions);
        if (this.chartControlsExist() && this.chartControlsPanel === null) {
            this.createControlsPanel();
        }
        else if ((this.chartOptions.hideChartControlPanel || !this.ellipsisItemsExist()) && this.chartControlsPanel !== null) {
            this.chartControlsPanel.remove();
            this.chartControlsPanel = null;
        }
        if (this.chartControlsExist()) {
            this.chartControlsPanel.style("top", (16 + (this.chartOptions.legend === 'compact' ? 32 : 0)) + 'px');
            this.drawEllipsisMenu();
        }
        if (this.heatmapWrapper == null) {
            this.heatmapWrapper = targetElement.append('div')
                .attr("class", "tsi-heatmapWrapper");
            this.draw = function (isFromResize) {
                if (isFromResize === void 0) { isFromResize = false; }
                _this.height = Math.floor(Math.max(select(_this.renderTarget).node().clientHeight, _this.MINHEIGHT));
                _this.chartHeight = _this.height - ((12 + (_this.chartControlsExist() ? 28 : 0) + (_this.chartOptions.legend === 'compact' ? 48 : 0)));
                _super.prototype.themify.call(_this, targetElement, _this.chartOptions.theme);
                _this.width = _this.getWidth();
                if (!isFromResize) {
                    _this.chartWidth = _this.getChartWidth();
                }
                _this.x = scaleTime()
                    .rangeRound([0, _this.chartWidth - 90]); // HARDCODED to be the width of a heatmapCanvas
                var fromAndTo = _this.chartComponentData.setAllValuesAndVisibleTAs();
                _this.x.domain(fromAndTo);
                _this.heatmapWrapper.style("width", _this.chartWidth + (_this.chartMargins.left + _this.chartMargins.right) + "px")
                    .style("height", _this.chartHeight + "px")
                    .style("top", (20 + (_this.chartControlsExist() ? 36 : 0) + (_this.chartOptions.legend === 'compact' ? 40 : 0)) + "px");
                if (_this.chartControlsExist()) {
                    _this.setControlsPanelWidth();
                }
                var canvasWrapperHeightTotal = _this.chartHeight - _this.timeLabelsHeight - _this.chartMargins.bottom;
                _this.heatmapCanvasMap = {};
                _this.visibleAggs = Object.keys(_this.chartComponentData.displayState).filter(function (aggKey) {
                    return _this.chartComponentData.getAggVisible(aggKey);
                });
                var self = _this;
                var canvasWrappers = _this.heatmapWrapper.selectAll(".tsi-heatmapCanvasWrapper")
                    .data(_this.visibleAggs);
                var canvasesEntered = canvasWrappers.enter()
                    .append("div")
                    .merge(canvasWrappers)
                    .attr("class", "tsi-heatmapCanvasWrapper")
                    .style("width", _this.chartWidth + 'px')
                    .style('left', _this.chartMargins.left + 'px')
                    .style("height", function (d, i) {
                    return (canvasWrapperHeightTotal * (1 / _this.visibleAggs.length)) + "px";
                })
                    .style("top", function (d, i) {
                    return ((canvasWrapperHeightTotal * (1 / _this.visibleAggs.length)) * i) + "px";
                }).each(function (aggKey, aggI) {
                    var heatmapCanvas = new HeatmapCanvas(this);
                    self.heatmapCanvasMap[aggKey] = heatmapCanvas;
                    var renderHeatmapCanvas = function () {
                        function onCellFocus(focusStartTime, focusEndTime, focusX1, focusX2, focusY, splitBy) {
                            var shiftMillis = self.chartComponentData.getTemporalShiftMillis(aggKey);
                            self.renderTimeLabels(focusStartTime, focusEndTime, focusX1, focusX2, focusY, (aggI * canvasWrapperHeightTotal / self.visibleAggs.length), shiftMillis);
                            self.legendObject.triggerSplitByFocus(aggKey, splitBy);
                            self.chartOptions.onMouseover(aggKey, splitBy);
                        }
                        heatmapCanvas.render(self.chartComponentData, self.chartOptions, aggKey, null, null, onCellFocus, aggI, self.visibleAggs.length === 1);
                    };
                    renderHeatmapCanvas();
                }).on("mouseleave", function () {
                    self.timeLabels.selectAll(".tsi-heatmapTimeLabels").remove();
                    self.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("inFocus", false);
                    self.chartOptions.onMouseout();
                });
                canvasWrappers.exit().remove();
                _this.legendObject.draw(_this.chartOptions.legend, _this.chartComponentData, _this.mouseover, _this.heatmapWrapper, _this.chartOptions, _this.mouseout);
                //remove all the colorKeys
                _this.legendObject.legendElement.selectAll(".seriesLabel").selectAll(".tsi-splitByLabel").selectAll(".colorKey").style("display", "none");
                if (isFromResize) {
                    _this.addTimeLabels();
                }
            };
            this.legendObject = new Legend(this.draw, this.renderTarget, this.CONTROLSWIDTH);
        }
        this.chartComponentData.mergeDataToDisplayStateAndTimeArrays(this.data, this.aggregateExpressionOptions);
        this.draw();
        this.gatedShowGrid();
        this.addTimeLabels();
        window.addEventListener("resize", function () {
            if (!_this.chartOptions.suppressResizeListener) {
                _this.draw();
                _this.addTimeLabels();
            }
        });
        this.legendPostRenderProcess(this.chartOptions.legend, this.heatmapWrapper, true);
    };
    return Heatmap;
}(TemporalXAxisComponent));

export default Heatmap;
