import { a as __extends, C as ChartComponentData, U as Utils, T as TooltipMeasureFormat } from './Utils-e5be3308.js';
import { extent, select, event, line, easeExp, voronoi, mouse, axisBottom, axisLeft, scaleLinear } from 'd3';
import 'moment-timezone';
import { L as Legend } from './Legend-7f738756.js';
import './EllipsisMenu.js';
import 'split.js';
import './ChartComponent-a7f89f69.js';
import './ChartDataOptions-59f6b399.js';
import { C as ChartVisualizationComponent } from './ChartVisualizationComponent-80709f0f.js';
import { T as Tooltip } from './Tooltip-29a8c1ae.js';
import { G as GroupedBarChartData } from './GroupedBarChartData-3974d849.js';
import Slider from './Slider.js';

var ScatterPlotData = /** @class */ (function (_super) {
    __extends(ScatterPlotData, _super);
    function ScatterPlotData() {
        var _this = _super.call(this) || this;
        _this.extents = {};
        _this.extentsSet = false;
        return _this;
    }
    /******** SETS EXTENT OF EACH DATA MEASURE -- MEASURES UPDATED WHEN RENDER CALLED OUTSIDE OF TEMPORAL ********/
    ScatterPlotData.prototype.setExtents = function (measures, forceReset) {
        var _this = this;
        if (forceReset === void 0) { forceReset = false; }
        if (!this.extentsSet || forceReset) {
            // Reset extents
            this.extents = {};
            // Set axis extents
            measures.forEach(function (measure) {
                _this.extents[measure] = extent(_this.allValues, function (v) {
                    if (!v.measures)
                        return null;
                    return measure in v.measures ? v.measures[measure] : null;
                });
            });
            this.extentsSet = true;
        }
    };
    /******** UPDATE EXTENTS BASED ON VISIBLE DATA ********/
    ScatterPlotData.prototype.updateExtents = function (measures) {
        var _this = this;
        var visibleData = [];
        this.data.forEach(function (aggregate) {
            var aggName = Object.keys(aggregate)[0];
            var aggKey = aggregate.aggKey;
            if (_this.displayState[aggKey].visible == true) {
                Object.keys(aggregate[aggName]).forEach(function (splitBy) {
                    if (_this.displayState[aggKey].splitBys[splitBy].visible == true) {
                        visibleData.push(Object.values(aggregate[aggName][splitBy]));
                    }
                });
            }
        });
        visibleData = [].concat.apply([], visibleData);
        measures.forEach(function (measure) {
            _this.extents[measure] = extent(visibleData, function (v) {
                return measure in v ? v[measure] : null;
            });
        });
    };
    /******** UPDATES CHART DATA, ALL TIMESTAMPS, AND VALUES AT THE CURRENT TIMESTAMP ********/
    ScatterPlotData.prototype.mergeDataToDisplayStateAndTimeArrays = function (data, timestamp, aggregateExpressionOptions) {
        if (aggregateExpressionOptions === void 0) { aggregateExpressionOptions = null; }
        ChartComponentData.prototype.mergeDataToDisplayStateAndTimeArrays.call(this, data, aggregateExpressionOptions);
        this.timestamp = (timestamp != undefined && this.allTimestampsArray.indexOf(timestamp) !== -1) ? timestamp : this.allTimestampsArray[0];
        this.setValuesAtTimestamp();
        this.setAllTimestampsArray();
    };
    /******** UPDATES DATA TO BE DRAWN -- IF SCATTER IS TEMPORAL, FLATTENS ALL TIMESTAMP DATA ********/
    ScatterPlotData.prototype.updateTemporalDataArray = function (isTemporal) {
        var _this = this;
        this.temporalDataArray = [];
        if (!isTemporal) {
            this.allTimestampsArray.forEach(function (ts) {
                _this.timestamp = ts;
                _this.setValuesAtTimestamp();
                _this.updateTemporal();
            });
        }
        else {
            this.updateTemporal();
        }
    };
    /******** HELPER TO FETCH DATA AT THE CURRENT TIMESTAMP AND BUILD AN OBJECT FOR THAT TIMESTAMP ********/
    ScatterPlotData.prototype.updateTemporal = function () {
        var _this = this;
        Object.keys(this.valuesAtTimestamp).forEach(function (aggKey) {
            Object.keys(_this.valuesAtTimestamp[aggKey].splitBys).forEach(function (splitBy, splitByI) {
                var measures = null, timestamp = null;
                if (_this.getSplitByVisible(aggKey, splitBy) && _this.valuesAtTimestamp[aggKey].splitBys[splitBy].measurements != undefined) {
                    measures = _this.valuesAtTimestamp[aggKey].splitBys[splitBy].measurements;
                    timestamp = _this.valuesAtTimestamp[aggKey].splitBys[splitBy].timestamp;
                }
                _this.temporalDataArray.push({
                    aggregateKey: aggKey,
                    aggregateKeyI: _this.data.findIndex(function (datum) { return datum.aggKey === aggKey; }),
                    splitBy: splitBy,
                    measures: measures,
                    timestamp: timestamp,
                    splitByI: splitByI
                });
            });
        });
    };
    /******** OVERRIDES GROUPEDBARCHARTDATA -- UPDATES VALUES AT TIMESTAMP WITH MEASURES & TIMESTAMP********/
    ScatterPlotData.prototype.setValuesAtTimestamp = function () {
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
                aggSplitBys[splitBy].timestamp = _this.timestamp;
                return aggSplitBys;
            }, {});
        });
    };
    return ScatterPlotData;
}(GroupedBarChartData));

var ScatterPlot = /** @class */ (function (_super) {
    __extends(ScatterPlot, _super);
    function ScatterPlot(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.activeDot = null;
        _this.focusedSite = null;
        _this.lowOpacity = 0.15;
        _this.standardOpacity = 0.6;
        _this.focusOpacity = 0.8;
        _this.standardStroke = 1;
        _this.lowStroke = 0.3;
        _this.chartComponentData = new ScatterPlotData();
        /******** DRAW UPDATE FUNCTION ********/
        _this.draw = function (isFromResize) {
            if (isFromResize === void 0) { isFromResize = false; }
            _this.activeDot = null;
            _this.chartComponentData.updateTemporalDataArray(_this.chartOptions.isTemporal);
            // Update extents to fit data if not temporal
            _this.chartComponentData.updateExtents(_this.chartOptions.spMeasures);
            _this.focus.attr("visibility", (_this.chartOptions.focusHidden) ? "hidden" : "visible");
            // If only one data series visible, do not highlight on hover
            var visibleSplitBys = 0;
            Object.keys(_this.chartComponentData.displayState).forEach(function (aggKey) {
                if (_this.chartComponentData.displayState[aggKey].visible)
                    Object.keys(_this.chartComponentData.displayState[aggKey].splitBys).forEach(function (splitBy) {
                        if (_this.chartComponentData.displayState[aggKey].splitBys[splitBy].visible)
                            visibleSplitBys++;
                    });
            });
            if (visibleSplitBys == 1)
                _this.focusOpacity = _this.standardOpacity;
            // Determine the number of timestamps present, add margin for slider
            if (_this.chartComponentData.allTimestampsArray.length > 1 && _this.chartOptions.isTemporal) {
                _this.chartMargins.bottom = 88;
            }
            else {
                _this.chartMargins.bottom = 48;
            }
            _this.setWidthAndHeight(isFromResize);
            _this.svgSelection
                .attr("height", _this.height)
                .style("width", _this.getSVGWidth() + "px");
            _this.g
                .attr("transform", "translate(" + _this.chartMargins.left + "," + _this.chartMargins.top + ")");
            _this.voronoiGroup
                .attr("width", _this.chartWidth)
                .attr("height", _this.chartHeight);
            _super.prototype.themify.call(_this, _this.targetElement, _this.chartOptions.theme);
            // Draw control panel
            if (!_this.chartOptions.hideChartControlPanel && _this.chartControlsPanel === null) {
                _this.chartControlsPanel = Utils.createControlPanel(_this.renderTarget, _this.CONTROLSWIDTH, _this.chartMargins.top, _this.chartOptions);
            }
            else if (_this.chartOptions.hideChartControlPanel && _this.chartControlsPanel !== null) {
                _this.removeControlPanel();
            }
            if (_this.chartControlsPanel !== null && _this.ellipsisItemsExist()) {
                _this.drawEllipsisMenu();
                _this.chartControlsPanel.style("top", Math.max((_this.chartMargins.top - 44), 0) + 'px');
            }
            else {
                _this.removeEllipsisMenu();
            }
            // Resize focus line
            _this.focus.select('.tsi-hLine').attr("x2", _this.chartWidth);
            _this.focus.select('.tsi-vLine').attr("y2", _this.chartHeight);
            _this.measures = _this.chartOptions.spMeasures;
            _this.xMeasure = _this.measures[0];
            _this.yMeasure = _this.measures[1];
            _this.rMeasure = _this.measures[2] !== undefined ? _this.measures[2] : null;
            var xExtentRange = _this.chartComponentData.extents[_this.xMeasure][1] - _this.chartComponentData.extents[_this.xMeasure][0];
            var yExtentRange = _this.chartComponentData.extents[_this.yMeasure][1] - _this.chartComponentData.extents[_this.yMeasure][0];
            // Pad extents
            var xOffset = (20 / _this.chartWidth) * (xExtentRange == 0 ? 1 : xExtentRange);
            var yOffset = (20 / _this.chartHeight) * (yExtentRange == 0 ? 1 : yExtentRange);
            var rOffset = null;
            if (_this.rMeasure) {
                var rExtentRange = _this.chartComponentData.extents[_this.rMeasure][1] - _this.chartComponentData.extents[_this.rMeasure][0];
                rOffset = (20 / _this.chartHeight) * (rExtentRange == 0 ? 1 : rExtentRange);
            }
            // Check measure validity
            if (!_this.checkExtentValidity())
                return;
            // Init scales
            _this.yScale = scaleLinear()
                .range([_this.chartHeight, 0])
                .domain([_this.chartComponentData.extents[_this.yMeasure][0] - yOffset, _this.chartComponentData.extents[_this.yMeasure][1] + yOffset]);
            _this.xScale = scaleLinear()
                .range([0, _this.chartWidth])
                .domain([_this.chartComponentData.extents[_this.xMeasure][0] - xOffset, _this.chartComponentData.extents[_this.xMeasure][1] + xOffset]);
            _this.rScale = scaleLinear()
                .range(_this.chartOptions.scatterPlotRadius.slice(0, 2))
                .domain(_this.rMeasure === null ? [0, 0] : [_this.chartComponentData.extents[_this.rMeasure][0] - rOffset, _this.chartComponentData.extents[_this.rMeasure][1] + rOffset]);
            // Draw axis
            _this.drawAxis();
            // Draw axis labels
            _this.drawAxisLabels();
            // Draw connecting lines (if toggled on)
            _this.drawConnectingLines();
            // Draw data
            var scatter = _this.pointWrapper.selectAll(".tsi-dot")
                .data(_this.cleanData(_this.chartComponentData.temporalDataArray), function (d) {
                if (_this.chartOptions.isTemporal) {
                    return d.aggregateKey + d.splitBy + d.splitByI;
                }
                else {
                    return d.aggregateKey + d.splitBy + d.timestamp;
                }
            });
            scatter
                .enter()
                .append("circle")
                .attr("class", "tsi-dot")
                .attr("r", function (d) { return _this.rScale(d.measures[_this.rMeasure]); })
                .attr("cx", function (d) { return _this.xScale(d.measures[_this.xMeasure]); })
                .attr("cy", function (d) { return _this.yScale(d.measures[_this.yMeasure]); })
                .merge(scatter)
                .attr("id", function (d) { return _this.getClassHash(d.aggregateKey, d.splitBy, d.splitByI, d.timestamp); })
                .transition()
                .duration(_this.chartOptions.noAnimate ? 0 : _this.TRANSDURATION)
                .ease(easeExp)
                .attr("r", function (d) { return _this.rScale(d.measures[_this.rMeasure]); })
                .attr("cx", function (d) { return _this.xScale(d.measures[_this.xMeasure]); })
                .attr("cy", function (d) { return _this.yScale(d.measures[_this.yMeasure]); })
                .attr("fill", function (d) { return Utils.colorSplitBy(_this.chartComponentData.displayState, d.splitByI, d.aggregateKey, _this.chartOptions.keepSplitByColor); })
                .attr("stroke", function (d) { return Utils.colorSplitBy(_this.chartComponentData.displayState, d.splitByI, d.aggregateKey, _this.chartOptions.keepSplitByColor); })
                .attr("stroke-opacity", _this.standardStroke)
                .attr("fill-opacity", _this.standardOpacity)
                .attr("stroke-width", "1px");
            scatter.exit().remove();
            // Draw voronoi
            _this.drawVoronoi();
            // Resize controls
            _this.setControlsPanelWidth();
            /******************** Temporal Slider ************************/
            if (_this.chartComponentData.allTimestampsArray.length > 1 && _this.chartOptions.isTemporal) {
                select(_this.renderTarget).select('.tsi-sliderWrapper').classed('tsi-hidden', false);
                _this.slider.render(_this.chartComponentData.allTimestampsArray.map(function (ts) {
                    var action = function () {
                        _this.chartOptions.timestamp = ts;
                        _this.render(_this.chartComponentData.data, _this.chartOptions, _this.aggregateExpressionOptions, true);
                    };
                    return { label: Utils.timeFormat(_this.chartComponentData.usesSeconds, _this.chartComponentData.usesMillis, _this.chartOptions.offset, _this.chartOptions.is24HourTime, null, null, _this.chartOptions.dateLocale)(new Date(ts)), action: action };
                }), _this.chartOptions, _this.getSliderWidth(), Utils.timeFormat(_this.chartComponentData.usesSeconds, _this.chartComponentData.usesMillis, _this.chartOptions.offset, _this.chartOptions.is24HourTime, null, null, _this.chartOptions.dateLocale)(new Date(_this.chartComponentData.timestamp)));
            }
            else {
                if (_this.slider)
                    _this.slider.remove();
                select(_this.renderTarget).select('.tsi-sliderWrapper').classed('tsi-hidden', true);
            }
            // Draw Legend
            _this.legendObject.draw(_this.chartOptions.legend, _this.chartComponentData, _this.labelMouseOver.bind(_this), _this.svgSelection, _this.chartOptions, _this.labelMouseOut.bind(_this), _this.stickySeries);
            _this.sliderWrapper
                .style("width", _this.svgSelection.node().getBoundingClientRect().width + 10 + "px");
        };
        /******** UPDATE STICKY SPLITBY  ********/
        _this.stickySeries = function (aggregateKey, splitBy) {
            if (splitBy === void 0) { splitBy = null; }
            var filteredValues = _this.getVoronoiData(_this.chartComponentData.temporalDataArray);
            if (filteredValues == null || filteredValues.length == 0)
                return;
            _this.chartComponentData.stickiedKey = {
                aggregateKey: aggregateKey,
                splitBy: (splitBy == null ? null : splitBy)
            };
            _this.legendObject.legendElement.selectAll('.tsi-splitByLabel').filter(function (filteredSplitBy) {
                return (select(this.parentNode).datum() == aggregateKey) && (filteredSplitBy == splitBy);
            }).classed("stickied", true);
            _this.voronoiDiagram = _this.voronoi(_this.getVoronoiData(_this.chartComponentData.temporalDataArray));
        };
        _this.chartMargins = {
            top: 40,
            bottom: 48,
            left: 70,
            right: 60
        };
        return _this;
    }
    ScatterPlot.prototype.ScatterPlot = function () { };
    ScatterPlot.prototype.render = function (data, options, aggregateExpressionOptions, fromSlider) {
        var _this = this;
        if (fromSlider === void 0) { fromSlider = false; }
        _super.prototype.render.call(this, data, options, aggregateExpressionOptions);
        // If measure options not set, or less than 2, return
        if (this.chartOptions["spMeasures"] == null || (this.chartOptions["spMeasures"] != null && this.chartOptions["spMeasures"].length < 2)) {
            var invalidMessage = "spMeasures not correctly specified or has length < 2: " + this.chartOptions["spMeasures"] +
                "\n\nPlease add the following chartOption: {spMeasures: ['example_x_axis_measure', 'example_y_axis_measure', 'example_radius_measure']} " +
                "where the measures correspond to the data key names.";
            console.log(invalidMessage);
            return;
        }
        this.chartMargins.top = (this.chartOptions.legend === 'compact') ? 84 : 40;
        if (!this.chartOptions.hideChartControlPanel)
            this.chartMargins.top += 20;
        this.chartMargins.left = (this.chartOptions.spAxisLabels != null && this.chartOptions.spAxisLabels.length >= 2) ? 120 : 70;
        this.chartComponentData.mergeDataToDisplayStateAndTimeArrays(this.data, this.chartOptions.timestamp, this.aggregateExpressionOptions);
        this.chartComponentData.setExtents(this.chartOptions.spMeasures, !fromSlider);
        // Check measure validity
        if (!this.checkExtentValidity())
            return;
        this.controlsOffset = (this.chartOptions.legend == "shown" ? this.CONTROLSWIDTH : 0);
        this.setWidthAndHeight();
        /******** STATIC INITIALIZATION ********/
        if (this.svgSelection == null) {
            // Initialize extents
            //this.chartComponentData.setExtents(this.chartOptions.spMeasures);
            this.targetElement = select(this.renderTarget)
                .classed("tsi-scatterPlot", true);
            this.svgSelection = this.targetElement.append("svg")
                .attr("class", "tsi-scatterPlotSVG tsi-chartSVG")
                .attr('title', this.getString('Scatter plot'))
                .attr("height", this.height);
            this.g = this.svgSelection.append("g")
                .classed("tsi-svgGroup", true);
            this.lineWrapper = this.g.append("g")
                .classed("tsi-lineWrapper", true);
            this.pointWrapper = this.g.append("g")
                .classed("tsi-pointWrapper", true);
            // Create temporal slider div
            this.sliderWrapper = select(this.renderTarget).append('div').classed('tsi-sliderWrapper', true);
            this.tooltip = new Tooltip(select(this.renderTarget));
            // Initialize voronoi
            this.voronoiGroup = this.g.append("rect")
                .attr("class", "tsi-voronoiWrap")
                .attr("fill", "transparent");
            // Initialize focus crosshair lines
            this.focus = this.pointWrapper.append("g")
                .attr("transform", "translate(-100,-100)")
                .attr("class", "tsi-focus")
                .style("display", "none");
            this.focus.append("line")
                .attr("class", "tsi-focusLine tsi-vLine")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", this.chartOptions.aggTopMargin)
                .attr("y2", this.chartHeight);
            this.focus.append("line")
                .attr("class", "tsi-focusLine tsi-hLine")
                .attr("x1", 0)
                .attr("x2", this.chartWidth)
                .attr("y1", 0)
                .attr("y2", 0);
            // Initialize focus axis data boxes
            var hHoverG = this.focus.append("g")
                .attr("class", 'hHoverG')
                .style("pointer-events", "none")
                .attr("transform", "translate(0," + (this.chartHeight + this.chartOptions.aggTopMargin) + ")");
            hHoverG.append("rect")
                .style("pointer-events", "none")
                .attr("class", 'hHoverBox')
                .attr("x", 0)
                .attr("y", 4)
                .attr("width", 0)
                .attr("height", 0);
            hHoverG.append("text")
                .style("pointer-events", "none")
                .attr("class", "hHoverText")
                .attr("dy", ".71em")
                .attr("transform", "translate(0,9)")
                .text(function (d) { return d; });
            var vHoverG = this.focus.append("g")
                .attr("class", 'vHoverG')
                .attr("transform", "translate(0," + (this.chartHeight + this.chartOptions.aggTopMargin) + ")");
            vHoverG.append("rect")
                .attr("class", 'vHoverBox')
                .attr("x", -5)
                .attr("y", 0)
                .attr("width", 0)
                .attr("height", 0);
            vHoverG.append("text")
                .attr("class", "vHoverText")
                .attr("dy", ".32em")
                .attr("x", -10)
                .text(function (d) { return d; });
            // Add Window Resize Listener
            window.addEventListener("resize", function () {
                if (!_this.chartOptions.suppressResizeListener) {
                    _this.draw();
                }
            });
            // Temporal slider
            this.slider = new Slider(select(this.renderTarget).select('.tsi-sliderWrapper').node());
            // Legend
            this.legendObject = new Legend(this.draw.bind(this), this.renderTarget, this.CONTROLSWIDTH);
        }
        // Draw scatter plot
        this.draw();
        this.gatedShowGrid();
        select("html").on("click." + Utils.guid(), function () {
            if (_this.ellipsisContainer && event.target != _this.ellipsisContainer.select(".tsi-ellipsisButton").node()) {
                _this.ellipsisMenu.setMenuVisibility(false);
            }
        });
        this.legendPostRenderProcess(this.chartOptions.legend, this.svgSelection, false);
    };
    ScatterPlot.prototype.getSliderWidth = function () {
        return this.chartWidth + this.chartMargins.left + this.chartMargins.right - 16;
    };
    ScatterPlot.prototype.tooltipFormat = function (d, text, measureFormat, xyrMeasures) {
        _super.prototype.tooltipFormat.call(this, d, text, measureFormat, xyrMeasures);
        if (!this.chartOptions.isTemporal) {
            var titleGroup = text.select('.tsi-tooltipTitleGroup');
            if (d.timestamp) {
                titleGroup.append('h4')
                    .attr('class', 'tsi-tooltipSubtitle tsi-tooltipTimeStamp')
                    .text(this.formatDate(d.timestamp, this.chartComponentData.getTemporalShiftMillis(d.aggregateKey)));
            }
        }
    };
    /******** DRAW CONNECTING LINES BETWEEN POINTS ********/
    ScatterPlot.prototype.drawConnectingLines = function () {
        var _this = this;
        // Don't render connecting lines on temporal mode
        if (this.chartOptions.isTemporal) {
            this.lineWrapper.selectAll("*").remove();
            return;
        }
        var dataSet = this.cleanData(this.chartComponentData.temporalDataArray);
        var connectedSeriesMap = {};
        // Find measure by which to connect series of points
        var getPointConnectionMeasure = (function (point) {
            var _a;
            var pConMes = (_a = _this.aggregateExpressionOptions[point.aggregateKeyI]) === null || _a === void 0 ? void 0 : _a.pointConnectionMeasure;
            return pConMes && pConMes in point.measures ? pConMes : null;
        });
        // Map data into groups of connected points, if connectedPoints enabled for agg
        dataSet.forEach(function (point) {
            if (point.aggregateKeyI !== null && point.aggregateKeyI < _this.aggregateExpressionOptions.length &&
                _this.aggregateExpressionOptions[point.aggregateKeyI].connectPoints) {
                var series = point.aggregateKey + "_" + point.splitBy;
                if (series in connectedSeriesMap) {
                    connectedSeriesMap[series].data.push(point);
                }
                else {
                    connectedSeriesMap[series] = {
                        data: [point],
                        pointConnectionMeasure: getPointConnectionMeasure(point)
                    };
                }
            }
        });
        var _loop_1 = function (key) {
            var sortMeasure = connectedSeriesMap[key].pointConnectionMeasure;
            // If sort measure specified, sort by that measure
            if (sortMeasure) {
                connectedSeriesMap[key].data.sort(function (a, b) {
                    if (a.measures[sortMeasure] < b.measures[sortMeasure])
                        return -1;
                    if (a.measures[sortMeasure] > b.measures[sortMeasure])
                        return 1;
                    return 0;
                });
            }
        };
        // Sort connected series by pointConnectionMeasure
        for (var _i = 0, _a = Object.keys(connectedSeriesMap); _i < _a.length; _i++) {
            var key = _a[_i];
            _loop_1(key);
        }
        var line$1 = line()
            .x(function (d) { return _this.xScale(d.measures[_this.xMeasure]); })
            .y(function (d) { return _this.yScale(d.measures[_this.yMeasure]); })
            .curve(this.chartOptions.interpolationFunction); // apply smoothing to the line
        // Group lines by aggregate
        var connectedGroups = this.lineWrapper.selectAll(".tsi-lineSeries").data(Object.keys(connectedSeriesMap));
        var self = this;
        connectedGroups.enter()
            .append("g")
            .attr("class", 'tsi-lineSeries')
            .merge(connectedGroups)
            .each(function (seriesName) {
            var series = select(this).selectAll(".tsi-line").data([connectedSeriesMap[seriesName].data], function (d) { return d[0].aggregateKeyI + d[0].splitBy; });
            series.exit().remove();
            series
                .enter()
                .append("path")
                .attr("class", "tsi-line")
                .merge(series)
                .attr("fill", "none")
                .transition()
                .duration(self.chartOptions.noAnimate ? 0 : self.TRANSDURATION)
                .ease(easeExp)
                .attr("stroke", function (d) { return Utils.colorSplitBy(self.chartComponentData.displayState, d[0].splitByI, d[0].aggregateKey, self.chartOptions.keepSplitByColor); })
                .attr("stroke-width", 2.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", line$1);
        });
        connectedGroups.exit().remove();
    };
    /******** CHECK VALIDITY OF EXTENTS ********/
    ScatterPlot.prototype.checkExtentValidity = function () {
        var _this = this;
        if (this.chartComponentData.allValues == 0) {
            return true;
        }
        var testExtent = {};
        this.chartOptions.spMeasures.forEach(function (measure) {
            testExtent[measure] = extent(_this.chartComponentData.allValues, function (v) {
                if (!v.measures)
                    return null;
                return measure in v.measures ? v.measures[measure] : null;
            });
        });
        Object.keys(testExtent).forEach(function (extent) {
            testExtent[extent].forEach(function (el) {
                if (el == undefined) {
                    console.log("Undefined Measure: ", extent);
                    return false;
                }
            });
        });
        return true;
    };
    /******** CREATE VORONOI DIAGRAM FOR MOUSE EVENTS ********/
    ScatterPlot.prototype.drawVoronoi = function () {
        var _this = this;
        var voronoiData = this.getVoronoiData(this.chartComponentData.temporalDataArray);
        var self = this;
        // Create random offset to solve colinear data issue
        var getRandomInRange = function (min, max) {
            return Math.random() * (max - min) + min;
        };
        var getOffset = function () { return (Math.random() < 0.5 ? -1 : 1) * getRandomInRange(0, .01); };
        this.voronoi = voronoi()
            .x(function (d) { return _this.xScale(d.measures[_this.xMeasure]) + getOffset(); })
            .y(function (d) { return _this.yScale(d.measures[_this.yMeasure]) + getOffset(); })
            .extent([[0, 0], [this.chartWidth, this.chartHeight]]);
        this.voronoiDiagram = this.voronoi(voronoiData);
        this.voronoiGroup
            .on("mousemove", function () {
            var mouseEvent = mouse(this);
            self.voronoiMouseMove(mouseEvent);
        })
            .on("mouseover", function () {
            var mouseEvent = mouse(this);
            self.voronoiMouseMove(mouseEvent);
            var site = self.voronoiDiagram.find(mouseEvent[0], mouseEvent[1]);
            if (site != null)
                self.labelMouseOver(site.data.aggregateKey, site.data.splitBy);
        })
            .on("mouseout", function () {
            self.voronoiMouseOut();
        })
            .on("click", function () {
            var mouseEvent = mouse(this);
            self.voronoiClick(mouseEvent);
        });
    };
    /******** STICKY/UNSTICKY DATA GROUPS ON VORONOI DIAGRAM CLICK ********/
    ScatterPlot.prototype.voronoiClick = function (mouseEvent) {
        var site = this.voronoiDiagram.find(mouseEvent[0], mouseEvent[1]);
        if (site == null)
            return;
        // Unsticky all
        this.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("stickied", false);
        if (this.chartComponentData.stickiedKey != null) {
            this.chartComponentData.stickiedKey = null;
            // Recompute Voronoi
            this.voronoiDiagram = this.voronoi(this.getVoronoiData(this.chartComponentData.temporalDataArray));
            site = this.voronoiDiagram.find(mouseEvent[0], mouseEvent[1]);
            this.voronoiMouseMove(mouseEvent);
            this.chartOptions.onUnsticky(site.data.aggregateKey, site.data.splitBy);
            return;
        }
        this.stickySeries(site.data.aggregateKey, site.data.splitBy);
        this.chartOptions.onSticky(site.data.aggregateKey, site.data.splitBy);
    };
    /******** HIGHLIGHT DOT TARGETED BY CROSSHAIRS WITH BLACK / WHITE STROKE BORDER ********/
    ScatterPlot.prototype.highlightDot = function (site) {
        //If dot is active, unhighlight
        this.unhighlightDot();
        // Add highlight border to newly focused dot
        var highlightColor = this.chartOptions.theme == "light" ? "black" : "white";
        var idSelector = "#" + this.getClassHash(site.data.aggregateKey, site.data.splitBy, site.data.splitByI, site.data.timestamp);
        this.activeDot = this.svgSelection.select(idSelector);
        this.activeDot
            .attr("stroke", highlightColor)
            .attr("stroke-width", "2px")
            // Raise active dot above crosshair
            .raise().classed("active", true);
    };
    /******** GET UNIQUE STRING HASH ID FOR EACH DOT USING DATA ATTRIBUTES ********/
    ScatterPlot.prototype.getClassHash = function (aggKey, splitBy, splitByI, timestamp) {
        return String("dot" + Utils.hash(aggKey + splitBy + splitByI.toString() + timestamp));
    };
    /******** UNHIGHLIGHT ACTIVE DOT ********/
    ScatterPlot.prototype.unhighlightDot = function () {
        var _this = this;
        if (this.activeDot) {
            this.activeDot
                .attr("stroke", function (d) { return Utils.colorSplitBy(_this.chartComponentData.displayState, d.splitByI, d.aggregateKey, _this.chartOptions.keepSplitByColor); })
                .attr("stroke-width", "1px");
        }
        this.activeDot = null;
    };
    /******** EFFICIENTLY SWAP NEW FOCUSED GROUP WITH OLD FOCUSED GROUP ********/
    ScatterPlot.prototype.labelMouseMove = function (aggKey, splitBy) {
        if (aggKey !== this.focusedAggKey || splitBy !== this.focusedSplitBy) {
            var selectedFilter = Utils.createValueFilter(aggKey, splitBy);
            var oldFilter = Utils.createValueFilter(this.focusedAggKey, this.focusedSplitBy);
            this.svgSelection.selectAll(".tsi-dot")
                .filter(selectedFilter)
                .attr("stroke-opacity", this.standardStroke)
                .attr("fill-opacity", this.focusOpacity);
            this.svgSelection.selectAll(".tsi-dot")
                .filter(oldFilter)
                .attr("stroke-opacity", this.lowStroke)
                .attr("fill-opacity", this.lowOpacity);
            var lineSelectedFilter_1 = function (d) {
                return (d[0].aggregateKey === aggKey && d[0].splitBy === splitBy);
            };
            this.svgSelection.selectAll(".tsi-line")
                .filter(function (d) { return lineSelectedFilter_1(d); })
                .attr("stroke-opacity", this.standardStroke);
            this.svgSelection.selectAll(".tsi-line")
                .filter(function (d) { return !lineSelectedFilter_1(d); })
                .attr("stroke-opacity", this.lowStroke);
            this.focusedAggKey = aggKey;
            this.focusedSplitBy = splitBy;
        }
        // Raise crosshair to top
        this.focus.raise().classed("active", true);
        // Raise highlighted dot above crosshairs
        if (this.activeDot != null)
            this.activeDot.raise().classed("active", true);
        // Highlight legend group
        (this.legendObject.legendElement.selectAll('.tsi-splitByLabel').filter(function (filteredSplitBy) {
            return (select(this.parentNode).datum() == aggKey) && (filteredSplitBy == splitBy);
        })).classed("inFocus", true);
    };
    /******** DRAW CROSSHAIRS, TOOLTIP, AND LEGEND FOCUS ********/
    ScatterPlot.prototype.voronoiMouseMove = function (mouseEvent) {
        var mouse_x = mouseEvent[0];
        var mouse_y = mouseEvent[1];
        var site = this.voronoiDiagram.find(mouse_x, mouse_y);
        if (site == null)
            return;
        // Short circuit mouse move if focused site has not changed
        if (this.focusedSite == null)
            this.focusedSite = site;
        else if (this.focusedSite == site)
            return;
        this.focusedSite = site;
        this.drawTooltip(site.data, [site[0], site[1]]);
        this.labelMouseMove(site.data.aggregateKey, site.data.splitBy);
        this.highlightDot(site);
        // Draw focus cross hair
        this.focus.style("display", "block");
        this.focus.attr("transform", "translate(" + site[0] + "," + site[1] + ")");
        this.focus.select('.tsi-hLine').attr("transform", "translate(" + (-site[0]) + ",0)");
        this.focus.select('.tsi-vLine').attr("transform", "translate(0," + (-site[1]) + ")");
        // Draw horizontal hover box 
        this.focus.select('.hHoverG')
            .attr("transform", "translate(0," + (this.chartHeight - site[1]) + ")")
            .select("text")
            .text((Utils.formatYAxisNumber(site.data.measures[this.xMeasure])));
        var textElemDimensions = this.focus.select('.hHoverG').select("text")
            .node().getBoundingClientRect();
        this.focus.select(".hHoverG").select("rect")
            .attr("x", -(textElemDimensions.width / 2) - 3)
            .attr("width", textElemDimensions.width + 6)
            .attr("height", textElemDimensions.height + 5);
        // Draw vertical hover box
        this.focus.select('.vHoverG')
            .attr("transform", "translate(" + (-site[0]) + ",0)")
            .select("text")
            .text(Utils.formatYAxisNumber(site.data.measures[this.yMeasure]));
        textElemDimensions = this.focus.select('.vHoverG').select("text")
            .node().getBoundingClientRect();
        this.focus.select(".vHoverG").select("rect")
            .attr("x", -(textElemDimensions.width) - 13)
            .attr("y", -(textElemDimensions.height / 2) - 3)
            .attr("width", textElemDimensions.width + 6)
            .attr("height", textElemDimensions.height + 4);
        this.legendObject.triggerSplitByFocus(site.data.aggregateKey, site.data.splitBy);
    };
    /******** HIDE TOOLTIP AND CROSSHAIRS ********/
    ScatterPlot.prototype.voronoiMouseOut = function () {
        this.focusedSite = null;
        this.focus.style("display", "none");
        this.tooltip.hide();
        this.labelMouseOut();
        this.unhighlightDot();
    };
    /******** FILTER DATA BY VISIBLE AND STICKIED ********/
    ScatterPlot.prototype.getVoronoiData = function (rawData) {
        var _this = this;
        var cleanData = this.cleanData(rawData);
        var filteredValues = cleanData.filter(function (d) {
            return (_this.chartComponentData.displayState[d.aggregateKey].visible &&
                _this.chartComponentData.displayState[d.aggregateKey].splitBys[d.splitBy].visible);
        });
        if (this.chartComponentData.stickiedKey == null)
            return filteredValues;
        var stickiedValues = filteredValues.filter(function (d) {
            return d.aggregateKey == _this.chartComponentData.stickiedKey.aggregateKey &&
                ((_this.chartComponentData.stickiedKey.splitBy == null) ? true :
                    d.splitBy == _this.chartComponentData.stickiedKey.splitBy);
        });
        return stickiedValues;
    };
    /******** HIGHLIGHT FOCUSED GROUP ********/
    ScatterPlot.prototype.labelMouseOver = function (aggKey, splitBy) {
        if (splitBy === void 0) { splitBy = null; }
        // Remove highlight on previous legend group
        this.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("inFocus", false);
        // Filter selected
        var selectedFilter = function (d) {
            var currAggKey = null, currSplitBy = null;
            if (d.aggregateKey != null)
                currAggKey = d.aggregateKey;
            if (d.splitBy != null)
                currSplitBy = d.splitBy;
            if (splitBy == null)
                return currAggKey == aggKey;
            if (currAggKey == aggKey && currSplitBy == splitBy)
                return false;
            return true;
        };
        //Highlight active group
        this.svgSelection.selectAll(".tsi-dot")
            .filter(function (d) { return !selectedFilter(d); })
            .attr("stroke-opacity", this.standardStroke)
            .attr("fill-opacity", this.focusOpacity);
        // Decrease opacity of unselected
        this.svgSelection.selectAll(".tsi-dot")
            .filter(selectedFilter)
            .attr("stroke-opacity", this.lowStroke)
            .attr("fill-opacity", this.lowOpacity);
        // Decrease opacity of unselected line
        this.svgSelection.selectAll(".tsi-line")
            .filter(function (d) { return !(d[0].aggregateKey === aggKey && d[0].splitBy === splitBy); })
            .attr("stroke-opacity", this.lowStroke);
    };
    /******** UNHIGHLIGHT FOCUSED GROUP ********/
    ScatterPlot.prototype.labelMouseOut = function () {
        var _this = this;
        // Remove highlight on legend group
        this.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("inFocus", false);
        this.g.selectAll(".tsi-dot")
            .attr("stroke-opacity", this.standardStroke)
            .attr("fill-opacity", this.standardOpacity)
            .attr("stroke", function (d) { return Utils.colorSplitBy(_this.chartComponentData.displayState, d.splitByI, d.aggregateKey, _this.chartOptions.keepSplitByColor); })
            .attr("fill", function (d) { return Utils.colorSplitBy(_this.chartComponentData.displayState, d.splitByI, d.aggregateKey, _this.chartOptions.keepSplitByColor); })
            .attr("stroke-width", "1px");
        this.g.selectAll(".tsi-line")
            .attr("stroke-opacity", this.standardStroke);
    };
    /******** FILTER DATA, ONLY KEEPING POINTS WITH ALL REQUIRED MEASURES ********/
    ScatterPlot.prototype.cleanData = function (data) {
        var _this = this;
        // Exclude any data which does not contain the specified
        // chart option measure
        var filtered = data.filter(function (value) {
            var valOk = true;
            _this.chartOptions.spMeasures
                .forEach(function (measure) {
                if (value.measures == null)
                    valOk = false;
                else if (!(measure in value.measures)) {
                    valOk = false;
                }
            });
            return valOk;
        });
        return filtered;
    };
    /******** UPDATE CHART DIMENSIONS ********/
    ScatterPlot.prototype.setWidthAndHeight = function (isFromResize) {
        if (isFromResize === void 0) { isFromResize = false; }
        this.height = Math.max(select(this.renderTarget).node().clientHeight, this.MINHEIGHT);
        this.chartHeight = this.height - this.chartMargins.top - this.chartMargins.bottom;
        this.width = this.getWidth();
        if (!isFromResize) {
            this.chartWidth = this.getChartWidth();
        }
    };
    /******** SCALE AND DRAW AXIS ********/
    ScatterPlot.prototype.drawAxis = function () {
        // Draw dynamic x axis and label
        this.xAxis = this.pointWrapper.selectAll(".xAxis").data([this.xScale]);
        this.xAxis.enter()
            .append("g")
            .attr("class", "xAxis")
            .merge(this.xAxis)
            .attr("transform", "translate(0," + (this.chartHeight) + ")")
            .call(axisBottom(this.xScale).ticks(Math.max(2, Math.floor(this.chartWidth / 150))));
        this.xAxis.exit().remove();
        // Draw dynamic y axis and label
        this.yAxis = this.pointWrapper.selectAll(".yAxis").data([this.yScale]);
        this.yAxis.enter()
            .append("g")
            .attr("class", "yAxis")
            .merge(this.yAxis)
            .call(axisLeft(this.yScale).ticks(Math.max(2, Math.floor(this.chartHeight / 90))));
        this.yAxis.exit().remove();
    };
    /******** DRAW X AND Y AXIS LABELS ********/
    ScatterPlot.prototype.drawAxisLabels = function () {
        var self = this;
        var xLabelData, yLabelData;
        var truncateTextLength = function (textSelection, maxTextLengthPx) {
            if (textSelection.node() && textSelection.node().getComputedTextLength) {
                var textLength = textSelection.node().getComputedTextLength();
                var text = textSelection.text();
                while (textLength > maxTextLengthPx && text.length > 0) {
                    text = text.slice(0, -1);
                    textSelection.text(text + '...');
                    textLength = textSelection.node().getComputedTextLength();
                }
            }
        };
        // Associate axis label data
        (this.chartOptions.spAxisLabels != null && this.chartOptions.spAxisLabels.length >= 1) ?
            xLabelData = [this.chartOptions.spAxisLabels[0]] : xLabelData = [];
        (this.chartOptions.spAxisLabels != null && this.chartOptions.spAxisLabels.length >= 2) ?
            yLabelData = [this.chartOptions.spAxisLabels[1]] : yLabelData = [];
        this.xAxisLabel = this.pointWrapper.selectAll('.tsi-xAxisLabel').data(xLabelData);
        var xAxisLabel = this.xAxisLabel
            .enter()
            .append("text")
            .attr("class", "tsi-xAxisLabel tsi-AxisLabel")
            .merge(this.xAxisLabel)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + (this.chartWidth / 2) + " ," + (this.chartHeight + 42) + ")")
            .text(null);
        xAxisLabel.each(function (d) {
            var label = select(this);
            Utils.appendFormattedElementsFromString(label, d, { inSvg: true });
        });
        //text is either in tspans or just in text. Either truncate text directly or through tspan
        if (xAxisLabel.selectAll("tspan").size() == 0)
            truncateTextLength(xAxisLabel, this.chartWidth);
        else {
            xAxisLabel.selectAll("tspan").each(function () {
                var tspanTextSelection = select(this);
                truncateTextLength(tspanTextSelection, self.chartWidth / xAxisLabel.selectAll("tspan").size());
            });
        }
        this.xAxisLabel.exit().remove();
        this.yAxisLabel = this.pointWrapper.selectAll('.tsi-yAxisLabel').data(yLabelData);
        var yAxisLabel = this.yAxisLabel
            .enter()
            .append("text")
            .attr("class", "tsi-yAxisLabel tsi-AxisLabel")
            .merge(this.yAxisLabel)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + (-70) + " ," + (this.chartHeight / 2) + ") rotate(-90)")
            .text(null);
        yAxisLabel.each(function (d) {
            var label = select(this);
            Utils.appendFormattedElementsFromString(label, d, { inSvg: true });
        });
        //text is either in tspans or just in text. Either truncate text directly or through tspan
        if (yAxisLabel.selectAll("tspan").size() == 0)
            truncateTextLength(yAxisLabel, this.chartHeight);
        else {
            yAxisLabel.selectAll("tspan").each(function () {
                var tspanTextSelection = select(this);
                truncateTextLength(tspanTextSelection, self.chartHeight / yAxisLabel.selectAll("tspan").size());
            });
        }
        this.yAxisLabel.exit().remove();
    };
    /******** DRAW TOOLTIP IF ENABLED ********/
    ScatterPlot.prototype.drawTooltip = function (d, mousePosition) {
        var _this = this;
        if (this.chartOptions.tooltip) {
            var xPos = mousePosition[0];
            var yPos = mousePosition[1];
            var xyrMeasures_1 = [this.xMeasure, this.yMeasure];
            if (this.rMeasure !== null) {
                xyrMeasures_1.push(this.rMeasure);
            }
            this.tooltip.render(this.chartOptions.theme);
            this.tooltip.draw(d, this.chartComponentData, xPos, yPos, this.chartMargins, function (text) {
                d.aggregateName = _this.chartComponentData.displayState[d.aggregateKey].name;
                _this.tooltipFormat(d, text, TooltipMeasureFormat.Scatter, xyrMeasures_1);
            }, null, 20, 20, Utils.colorSplitBy(this.chartComponentData.displayState, d.splitByI, d.aggregateKey, this.chartOptions.keepSplitByColor));
        }
    };
    /******** HELPERS TO FORMAT TIME DISPLAY ********/
    ScatterPlot.prototype.labelFormatUsesSeconds = function () {
        return !this.chartOptions.minutesForTimeLabels && this.chartComponentData.usesSeconds;
    };
    ScatterPlot.prototype.labelFormatUsesMillis = function () {
        return !this.chartOptions.minutesForTimeLabels && this.chartComponentData.usesMillis;
    };
    return ScatterPlot;
}(ChartVisualizationComponent));

export default ScatterPlot;
