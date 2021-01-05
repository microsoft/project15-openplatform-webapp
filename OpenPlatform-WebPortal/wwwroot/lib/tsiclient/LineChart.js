import { a as __extends, C as ChartComponentData, U as Utils, b as Component, Y as YAxisStates, _ as __assign, D as DataTypes, L as LINECHARTTOPPADDING, N as NONNUMERICTOPMARGIN, c as EventElementTypes, S as ShiftTypes, K as KeyCodes, M as MARKERVALUENUMERICHEIGHT, d as LINECHARTXOFFSET, V as VALUEBARHEIGHT, s as swimlaneLabelConstants, e as SERIESLABELWIDTH, f as LINECHARTCHARTMARGINS, T as TooltipMeasureFormat } from './Utils-e5be3308.js';
import * as d3 from 'd3';
import { area, scaleLinear, line, axisLeft, select, easeExp, event, drag, extent, mouse, scaleTime, set, brushX, voronoi, local } from 'd3';
import 'moment-timezone';
import { L as Legend } from './Legend-7f738756.js';
import './EllipsisMenu.js';
import 'split.js';
import './ChartComponent-a7f89f69.js';
import './ChartDataOptions-59f6b399.js';
import './ChartVisualizationComponent-80709f0f.js';
import { T as TemporalXAxisComponent } from './TemporalXAxisComponent-f960f34b.js';
import { C as ContextMenu } from './ContextMenu-966f73b8.js';
import { T as Tooltip } from './Tooltip-29a8c1ae.js';
import { interpolatePath } from 'd3-interpolate-path';

var LineChartData = /** @class */ (function (_super) {
    __extends(LineChartData, _super);
    function LineChartData() {
        var _this = _super.call(this) || this;
        _this.timeMap = {};
        _this._yExtents = [];
        return _this;
    }
    Object.defineProperty(LineChartData.prototype, "yExtents", {
        get: function () {
            return this._yExtents;
        },
        enumerable: false,
        configurable: true
    });
    LineChartData.prototype.setYExtents = function (idx, value) {
        this._yExtents[idx] = value;
    };
    LineChartData.prototype.resetYExtents = function () {
        this._yExtents = [];
        for (var i = 0; i < this.data.length; i++) {
            this._yExtents.push(null);
        }
    };
    LineChartData.prototype.setTimeMap = function () {
        this.timeMap = this.allValues.reduce(function (timeMap, currVal) {
            var millis = currVal.dateTime.valueOf();
            if (currVal.bucketSize != undefined) {
                millis += (currVal.bucketSize / 2);
            }
            if (currVal.measures != null) {
                if (timeMap[millis] == undefined) {
                    timeMap[millis] = [currVal];
                }
                else {
                    timeMap[millis].push(currVal);
                }
            }
            return timeMap;
        }, {});
    };
    LineChartData.prototype.mergeDataToDisplayStateAndTimeArrays = function (data, aggregateExpressionOptions) {
        if (aggregateExpressionOptions === void 0) { aggregateExpressionOptions = null; }
        _super.prototype.mergeDataToDisplayStateAndTimeArrays.call(this, data, aggregateExpressionOptions);
    };
    return LineChartData;
}(ChartComponentData));

var Plot = /** @class */ (function (_super) {
    __extends(Plot, _super);
    function Plot(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.backdropRect = null;
        return _this;
    }
    Plot.prototype.getVisibleSeries = function (aggKey) {
        var _this = this;
        return Object.keys(this.chartComponentData.timeArrays[aggKey]).filter(function (s) {
            return _this.chartComponentData.isSplitByVisible(aggKey, s);
        });
    };
    Plot.prototype.createGradientKey = function (d, splitByIndex, i) {
        return d.aggregateKey.replace(/^[^a-z]+|[^\w:.-]+/gi, "") + '_' + splitByIndex + '_' + i;
    };
    Plot.prototype.addGradientStops = function (d, gradient) {
        var _this = this;
        gradient.selectAll('stop').remove();
        var colorMap = this.chartDataOptions.valueMap;
        if (!d.measures) {
            return;
        }
        //behavior if numeric measures
        var allMeasuresNumeric = Object.keys(d.measures).reduce(function (p, currMeasure) {
            return (typeof d.measures[currMeasure]) === 'number' && p;
        }, true);
        var sumOfMeasures;
        if (allMeasuresNumeric) {
            sumOfMeasures = Object.keys(d.measures).reduce(function (p, currMeasure) {
                return p + d.measures[currMeasure];
            }, 0);
            if (sumOfMeasures <= 0) {
                return;
            }
        }
        var numMeasures = Object.keys(d.measures).length;
        Object.keys(d.measures).reduce(function (p, currMeasure, i) {
            var currFraction = allMeasuresNumeric ? (d.measures[currMeasure] / sumOfMeasures) : (i / numMeasures);
            gradient.append('stop')
                .attr("offset", (p * 100) + "%")
                .attr("stop-color", _this.getColorForValue(currMeasure))
                .attr("stop-opacity", 1);
            var newFraction = allMeasuresNumeric ? (p + currFraction) : ((i + 1) / numMeasures);
            gradient.append('stop')
                .attr("offset", (newFraction * 100) + "%")
                .attr("stop-color", _this.getColorForValue(currMeasure))
                .attr("stop-opacity", 1);
            return newFraction;
        }, 0);
    };
    Plot.prototype.createBackdropRect = function (isVisible) {
        this.backdropRect = this.aggregateGroup.selectAll('.tsi-backdropRect')
            .data([isVisible]);
        this.backdropRect.enter().append('rect')
            .attr('class', 'tsi-backdropRect')
            .attr('x', 0)
            .attr('y', 0)
            .merge(this.backdropRect)
            .attr('visibility', function (d) { return d ? 'visible' : 'hidden'; })
            .attr('width', this.x.range()[1])
            .attr('height', this.height);
        this.backdropRect.exit().remove();
    };
    Plot.prototype.getColorForValue = function (value) {
        return Utils.getColorForValue(this.chartDataOptions, value);
    };
    Plot.prototype.getVisibleMeasures = function (measures) {
        return Object.keys(measures).filter(function (measure) {
            return measures[measure] !== 0;
        });
    };
    Plot.prototype.hasData = function (d) {
        return d.measures && (Object.keys(d.measures).length !== 0);
    };
    return Plot;
}(Component));

var LinePlot = /** @class */ (function (_super) {
    __extends(LinePlot, _super);
    function LinePlot(svgSelection) {
        var _this = _super.call(this, svgSelection) || this;
        _this.plotDataType = DataTypes.Numeric;
        return _this;
    }
    LinePlot.prototype.getXPosition = function (d, x) {
        var bucketSize = this.chartComponentData.displayState[d.aggregateKey].bucketSize;
        if (bucketSize) {
            return (x(d.dateTime) + x((new Date(d.dateTime.valueOf() + bucketSize)))) / 2;
        }
        return x(d.dateTime);
    };
    LinePlot.prototype.createAreaPath = function (y) {
        var _this = this;
        this.areaPath = area()
            .curve(this.chartOptions.interpolationFunction)
            .defined(function (d) {
            return (d.measures !== null) &&
                (d.measures[_this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy)] !== null);
        })
            .x(function (d) {
            return _this.getXPosition(d, _this.x);
        })
            .y0(function (d) {
            return d.measures ? y(d.measures[_this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy)]) : 0;
        })
            .y1(this.chartHeight);
    };
    // returns the next visibleAggI
    LinePlot.prototype.render = function (chartOptions, visibleAggI, agg, aggVisible, aggregateGroup, chartComponentData, yAxisState, chartHeight, visibleAggCount, colorMap, previousAggregateData, x, areaPath, strokeOpacity, y, yMap, defs, chartDataOptions, previousIncludeDots, yTopAndHeight, svgSelection, categoricalMouseover, categoricalMouseout, yAxisOnClick) {
        var _this = this;
        this.previousIncludeDots = previousIncludeDots;
        this.defs = defs;
        this.chartOptions = chartOptions;
        this.chartHeight = chartHeight;
        this.visibleAggCount = visibleAggCount;
        this.chartComponentData = chartComponentData;
        this.x = x;
        this.y = y;
        var aggKey = agg.aggKey;
        this.aggregateGroup = aggregateGroup;
        var yAxisHasOnClick = yAxisOnClick && typeof yAxisOnClick === "function";
        visibleAggI = yAxisState.positionInGroup;
        this.yTop = yTopAndHeight[0];
        this.height = yTopAndHeight[1];
        var aggY;
        var aggLine;
        var aggEnvelope;
        this.yAxisState = yAxisState;
        var yExtent = this.yAxisState.yExtent;
        aggY = scaleLinear();
        aggY.range([this.height, this.chartOptions.aggTopMargin]);
        if (this.chartComponentData.aggHasVisibleSplitBys(aggKey)) {
            var yRange = (yExtent[1] - yExtent[0]) > 0 ? yExtent[1] - yExtent[0] : 1;
            var yOffsetPercentage = 10 / (this.chartHeight / ((this.yAxisState.axisType === YAxisStates.Overlap) ? 1 : this.visibleAggCount));
            var yDomainMin = this.chartOptions.isArea ?
                (Math.max(yExtent[0] - (yRange * yOffsetPercentage), 0)) :
                (yExtent[0] - (yRange * yOffsetPercentage));
            aggY.domain([yDomainMin, yExtent[1] + (yRange * (10 / this.chartHeight))]);
        }
        else {
            aggY.domain([0, 1]);
            yExtent = [0, 1];
        }
        aggLine = line()
            .curve(this.chartComponentData.displayState[aggKey].interpolationFunction ? d3[this.chartComponentData.displayState[aggKey].interpolationFunction] : this.chartOptions.interpolationFunction)
            .defined(function (d) {
            return (d.measures !== null) &&
                (d.measures[_this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy)] !== null);
        })
            .x(function (d) { return _this.getXPosition(d, _this.x); })
            .y(function (d) {
            return d.measures ? aggY(d.measures[_this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy)]) : null;
        });
        aggEnvelope = area()
            .curve(this.chartComponentData.displayState[aggKey].interpolationFunction ? d3[this.chartComponentData.displayState[aggKey].interpolationFunction] : this.chartOptions.interpolationFunction)
            .defined(function (d) { return (d.measures !== null) && (d.measures['min'] !== null) && (d.measures['max'] !== null); })
            .x(function (d) { return _this.getXPosition(d, _this.x); })
            .y0(function (d) { return d.measures ? aggY(d.measures['max']) : 0; })
            .y1(function (d) { return d.measures ? aggY(d.measures['min']) : 0; });
        var localY = aggY.copy();
        localY.range([this.yTop + this.height, this.yTop + this.chartOptions.aggTopMargin]);
        yMap[aggKey] = localY;
        var yAxis = this.aggregateGroup.selectAll(".yAxis")
            .data([aggKey]);
        var visibleYAxis = (aggVisible && (this.yAxisState.axisType !== YAxisStates.Shared || visibleAggI === 0));
        yAxis = yAxis.enter()
            .append("g")
            .attr("class", "yAxis " + (yAxisHasOnClick ? "tsi-clickableYAxis tsi-swimLaneAxis-" + this.chartComponentData.displayState[aggKey].aggregateExpression.swimLane : ''))
            .merge(yAxis)
            .style("visibility", ((visibleYAxis && !this.chartOptions.yAxisHidden) ? "visible" : "hidden"));
        if (this.yAxisState.axisType === YAxisStates.Overlap) {
            yAxis.call(axisLeft(aggY).tickFormat(Utils.formatYAxisNumber).tickValues(yExtent))
                .selectAll("text")
                .attr("y", function (d, j) { return (j == 0) ? (-visibleAggI * 16) : (visibleAggI * 16); })
                .style("fill", this.chartComponentData.displayState[aggKey].color);
        }
        else {
            yAxis.call(axisLeft(aggY).tickFormat(Utils.formatYAxisNumber)
                .ticks(Math.max(2, Math.ceil(this.height / (this.yAxisState.axisType === YAxisStates.Stacked ? this.visibleAggCount : 1) / 90))))
                .selectAll("text").classed("standardYAxisText", true);
        }
        // If yAxisOnClick present, attach to yAxis
        if (yAxisHasOnClick) {
            yAxis.on("click", function () {
                yAxisOnClick();
            });
            var label_1 = document.getElementsByClassName("tsi-swimLaneLabel-" + agg.swimLane)[0];
            if (label_1) {
                yAxis.on("mouseover", function () {
                    label_1.classList.add("tsi-axisHover");
                    yAxis.selectAll("text").classed("tsi-boldYAxisText", true);
                });
                yAxis.on("mouseout", function () {
                    label_1.classList.remove("tsi-axisHover");
                    yAxis.selectAll("text").classed("tsi-boldYAxisText", false);
                });
            }
        }
        yAxis.exit().remove();
        var guideLinesData = {
            x: this.x,
            y: aggY,
            visible: visibleYAxis
        };
        var splitByColors = Utils.createSplitByColors(this.chartComponentData.displayState, aggKey, this.chartOptions.keepSplitByColor);
        var includeDots = this.chartOptions.includeDots || this.chartComponentData.displayState[aggKey].includeDots;
        var self = this;
        var splitByGroups = this.aggregateGroup.selectAll(".tsi-splitByGroup")
            .data(Object.keys(this.chartComponentData.timeArrays[aggKey]));
        splitByGroups.enter()
            .append("g")
            .attr("class", "tsi-splitByGroup " + agg.aggKey)
            .merge(splitByGroups)
            .each(function (splitBy, j) {
            var _this = this;
            colorMap[aggKey + "_" + splitBy] = splitByColors[j];
            // creation of segments between each gap in the data
            var segments = [];
            var lineData = self.chartComponentData.timeArrays[aggKey][splitBy];
            var visibleMeasure = self.chartComponentData.getVisibleMeasure(aggKey, splitBy);
            for (var i = 0; i < lineData.length - 1; i++) {
                if (lineData[i].measures !== null && lineData[i].measures[visibleMeasure] !== null) {
                    var scannerI = i + 1;
                    while (scannerI < lineData.length && ((lineData[scannerI].measures == null) ||
                        lineData[scannerI].measures[visibleMeasure] == null)) {
                        scannerI++;
                    }
                    if (scannerI < lineData.length && scannerI != i + 1) {
                        segments.push([lineData[i], lineData[scannerI]]);
                    }
                    i = scannerI - 1;
                }
            }
            var durationFunction = function (d) {
                var previousUndefined = previousAggregateData.get(_this) === undefined;
                return (self.chartOptions.noAnimate || previousUndefined) ? 0 : self.TRANSDURATION;
            };
            var gapPath = select(this).selectAll(".tsi-gapLine")
                .data(segments.map(function (d) {
                d.inTransition = true;
                return d;
            }));
            gapPath.enter()
                .append("path")
                .attr("class", "tsi-valueElement tsi-gapLine")
                .merge(gapPath)
                .style("visibility", function (d) {
                return (self.chartComponentData.isSplitByVisible(aggKey, splitBy)) ? "visible" : "hidden";
            })
                .transition()
                .duration(durationFunction)
                .ease(easeExp)
                .attr("stroke-dasharray", "5,5")
                .attr("stroke", splitByColors[j])
                .attrTween('d', function (d) {
                var previous = select(this).attr('d');
                var current = aggLine(d);
                return interpolatePath(previous, current);
            })
                .on('end', function (d) {
                d.inTransition = false;
            });
            var path = select(this).selectAll(".tsi-valueLine")
                .data([self.chartComponentData.timeArrays[aggKey][splitBy]].map(function (d) {
                d.inTransition = true;
                return d;
            }));
            path.enter()
                .append("path")
                .attr("class", "tsi-valueElement tsi-valueLine")
                .merge(path)
                .style("visibility", function (d) {
                return (self.chartComponentData.isSplitByVisible(aggKey, splitBy)) ? "visible" : "hidden";
            })
                .transition()
                .duration(durationFunction)
                .ease(easeExp)
                .attr("stroke", splitByColors[j])
                .attr("stroke-opacity", self.strokeOpacity)
                .attrTween('d', function (d) {
                var previous = select(this).attr('d');
                var current = aggLine(d);
                return interpolatePath(previous, current);
            })
                .on('end', function (d) {
                d.inTransition = false;
            });
            if (self.chartOptions.includeDots || self.chartComponentData.displayState[aggKey].includeDots) {
                var dots = select(this).selectAll(".tsi-valueDot")
                    .data(self.chartComponentData.timeArrays[aggKey][splitBy].filter(function (d) {
                    return d && d.measures && d.measures[self.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy)] !== null;
                }), function (d, i) {
                    return d.dateTime.toString();
                });
                dots.enter()
                    .append('circle')
                    .attr('class', 'tsi-valueElement tsi-valueDot')
                    .attr('r', 3)
                    .merge(dots)
                    .style("visibility", function (d) {
                    return (self.chartComponentData.isSplitByVisible(aggKey, splitBy) && d.measures) ? "visible" : "hidden";
                })
                    .transition()
                    .duration(function (d, i) {
                    return (self.previousIncludeDots.get(this) === true) ? durationFunction() : 0;
                })
                    .ease(easeExp)
                    .attr("fill", splitByColors[j])
                    .attr('cx', function (d) { return self.getXPosition(d, self.x); })
                    .attr('cy', function (d) {
                    return d.measures ? aggY(d.measures[self.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy)]) : null;
                })
                    .each(function () {
                    self.previousIncludeDots.set(this, includeDots);
                });
                dots.exit().remove();
            }
            else {
                select(this).selectAll(".tsi-valueDot").remove();
            }
            var envelopeData = {};
            if ((self.chartComponentData.displayState[aggKey].includeEnvelope || self.chartOptions.includeEnvelope) && self.chartComponentData.isPossibleEnvelope(aggKey, splitBy)) {
                envelopeData = self.chartComponentData.timeArrays[aggKey][splitBy].map(function (d) { return (__assign(__assign({}, d), { isEnvelope: true })); });
            }
            var envelope = select(this).selectAll(".tsi-valueEnvelope")
                .data([envelopeData]);
            envelope.enter()
                .append("path")
                .attr("class", "tsi-valueElement tsi-valueEnvelope")
                .merge(envelope)
                .style("visibility", function (d) {
                return (self.chartComponentData.isSplitByVisible(aggKey, splitBy)) ? "visible" : "hidden";
            })
                .transition()
                .duration(durationFunction)
                .ease(easeExp)
                .style("fill", splitByColors[j])
                .attr("fill-opacity", .2)
                .attr("d", aggEnvelope);
            if (self.chartOptions.isArea) {
                self.createAreaPath(aggY);
                var area = select(this).selectAll(".tsi-valueArea")
                    .data([self.chartComponentData.timeArrays[aggKey][splitBy]]);
                // logic for shiny gradient fill via url()
                var svgId = Utils.guid();
                var lg = self.defs.selectAll('linearGradient')
                    .data([self.chartComponentData.timeArrays[aggKey][splitBy]]);
                var gradient = lg.enter()
                    .append('linearGradient');
                gradient.merge(lg)
                    .attr('id', svgId).attr('x1', '0%').attr('x2', '0%').attr('y1', '0%').attr('y2', '100%');
                gradient.append('stop').attr('offset', '0%').attr('style', function () { return 'stop-color:' + splitByColors[j] + ';stop-opacity:.2'; });
                gradient.append('stop').attr('offset', '100%').attr('style', function () { return 'stop-color:' + splitByColors[j] + ';stop-opacity:.03'; });
                lg.exit().remove();
                area.enter()
                    .append("path")
                    .attr("class", "tsi-valueArea")
                    .merge(area)
                    .style("fill", 'url(#' + (svgId) + ')')
                    .style("visibility", function (d) {
                    return (self.chartComponentData.isSplitByVisible(aggKey, splitBy)) ? "visible" : "hidden";
                })
                    .transition()
                    .duration(durationFunction)
                    .ease(easeExp)
                    .attr("d", self.areaPath);
                area.exit().remove();
            }
            gapPath.exit().remove();
            path.exit().remove();
            previousAggregateData.set(this, splitBy);
        });
        splitByGroups.exit().remove();
    };
    return LinePlot;
}(Plot));

var TOPMARGIN = 4;
var CategoricalPlot = /** @class */ (function (_super) {
    __extends(CategoricalPlot, _super);
    function CategoricalPlot(svgSelection) {
        var _this = _super.call(this, svgSelection) || this;
        _this.plotDataType = DataTypes.Categorical;
        return _this;
    }
    CategoricalPlot.prototype.onMouseover = function (d, rectWidth) {
        var _this = this;
        var visibleMeasures = this.getVisibleMeasures(d.measures);
        this.hoverRect.attr('visibility', 'visible')
            .attr('x', function () {
            return _this.x(new Date(d.dateTime));
        })
            .attr('width', rectWidth)
            .attr('height', Math.max(0, this.chartHeight + 1 - LINECHARTTOPPADDING))
            .attr('fill', function () {
            return visibleMeasures.length === 1 ? _this.getColorForValue(visibleMeasures[0]) : 'none';
        });
    };
    CategoricalPlot.prototype.onMouseout = function () {
        this.hoverRect.attr('visibility', 'hidden');
        this.categoricalMouseout();
    };
    CategoricalPlot.prototype.createHoverRect = function () {
        if (!this.hoverRect) {
            this.hoverRect = this.chartGroup.append('rect')
                .attr('class', 'tsi-categoricalHoverRect')
                .attr('y', LINECHARTTOPPADDING)
                .attr('height', this.chartHeight + 1);
        }
        else {
            this.hoverRect.raise();
        }
    };
    CategoricalPlot.prototype.getSeriesEndDate = function () {
        if (this.chartDataOptions.searchSpan) {
            return new Date(this.chartDataOptions.searchSpan.to);
        }
        return new Date(this.chartComponentData.toMillis);
    };
    CategoricalPlot.prototype.getBucketEndDate = function (d, i) {
        var _this = this;
        var data = this.chartComponentData.timeArrays[d.aggregateKey][d.splitBy];
        if (i + 1 < data.length) {
            return data[i + 1].dateTime;
        }
        else {
            var shouldRoundEnd = Utils.safeNotNullOrUndefined(function () { return _this.chartDataOptions.searchSpan; }) && Utils.safeNotNullOrUndefined(function () { return _this.chartDataOptions.searchSpan.bucketSize; });
            return shouldRoundEnd ? Utils.roundToMillis(this.getSeriesEndDate().valueOf(), Utils.parseTimeInput(this.chartDataOptions.searchSpan.bucketSize)) : this.getSeriesEndDate();
        }
    };
    CategoricalPlot.prototype.render = function (chartOptions, visibleAggI, agg, aggVisible, aggregateGroup, chartComponentData, yExtent, chartHeight, visibleAggCount, colorMap, previousAggregateData, x, areaPath, strokeOpacity, y, yMap, defs, chartDataOptions, previousIncludeDots, yTopAndHeight, chartGroup, categoricalMouseover, categoricalMouseout) {
        var _this = this;
        this.chartOptions = chartOptions;
        this.yTop = yTopAndHeight[0];
        this.height = yTopAndHeight[1];
        this.x = x;
        this.chartComponentData = chartComponentData;
        var aggKey = agg.aggKey;
        this.chartDataOptions = chartDataOptions;
        this.chartHeight = chartHeight;
        this.chartGroup = chartGroup;
        this.categoricalMouseover = categoricalMouseover;
        this.aggregateGroup = aggregateGroup;
        this.categoricalMouseout = categoricalMouseout;
        this.createBackdropRect(true);
        if (this.aggregateGroup.selectAll('defs').empty()) {
            this.defs = this.aggregateGroup.append('defs');
        }
        if (this.aggregateGroup.selectAll('.tsi-splitBysGroup').empty()) {
            this.splitBysGroup = this.aggregateGroup.append('g').classed('tsi-splitBysGroup', true);
        }
        var gradientData = [];
        var durationFunction = function (d) {
            var previousUndefined = previousAggregateData.get(_this) === undefined;
            return (self.chartOptions.noAnimate || previousUndefined) ? 0 : self.TRANSDURATION;
        };
        var self = this;
        this.createHoverRect();
        var series = this.getVisibleSeries(aggKey);
        var heightPerSeries = Math.max((self.chartDataOptions.height - (series.length * TOPMARGIN)) / series.length, 0);
        var splitByGroups = this.splitBysGroup.selectAll(".tsi-splitByGroup")
            .data(series, function (d) {
            return d.splitBy;
        });
        splitByGroups.enter()
            .append("g")
            .attr("class", "tsi-splitByGroup " + agg.aggKey)
            .merge(splitByGroups)
            .attr('transform', function (d, i) {
            return 'translate(0,' + (NONNUMERICTOPMARGIN + (i * (_this.chartDataOptions.height / series.length))) + ')';
        })
            .each(function (splitBy, j) {
            var data = self.chartComponentData.timeArrays[aggKey][splitBy];
            var categoricalBuckets = select(this).selectAll(".tsi-categoricalBucket")
                .data(data);
            var getWidth = function (d, i) {
                var seriesWidth = self.x.range()[1] - self.x.range()[0];
                var xPos1 = Math.max(self.x(new Date(d.dateTime)), 0);
                var xPos2 = self.x(self.getBucketEndDate(d, i));
                return Math.max(xPos2 - xPos1, 1);
            };
            categoricalBuckets.enter()
                .append("rect")
                .attr("class", "tsi-valueElement tsi-categoricalBucket")
                .merge(categoricalBuckets)
                .style("visibility", function (d) {
                return (self.chartComponentData.isSplitByVisible(aggKey, splitBy) && self.hasData(d)) ? "visible" : "hidden";
            })
                .on('mouseover', function (d, i) {
                var y = self.yTop + (j * (self.chartDataOptions.height / series.length));
                var x = self.x(new Date(d.dateTime)) + (getWidth(d, i));
                var shouldMouseover = self.categoricalMouseover(d, x, y + NONNUMERICTOPMARGIN, self.getBucketEndDate(d, i), getWidth(d, i));
                if (shouldMouseover) {
                    self.onMouseover(d, getWidth(d, i));
                }
            })
                .on('mouseout', function () {
                self.onMouseout();
            })
                .attr('cursor', (self.chartDataOptions.onElementClick ? 'pointer' : 'inherit'))
                .on('click', function (d) {
                if (self.chartDataOptions.onElementClick) {
                    self.chartDataOptions.onElementClick(d.aggregateKey, d.splitBy, d.dateTime.toISOString(), d.measures);
                }
            })
                .transition()
                .duration(durationFunction)
                .ease(easeExp)
                .attr('height', heightPerSeries)
                .attr('width', getWidth)
                .attr('x', function (d) {
                return self.x(new Date(d.dateTime));
            })
                .each(function (d, i) {
                var gradientKey = self.createGradientKey(d, j, i);
                gradientData.push([gradientKey, d]);
                select(this)
                    .attr('fill', "url(#" + gradientKey + ")");
            });
            categoricalBuckets.exit().remove();
        });
        splitByGroups.exit().remove();
        //corresponding linear gradients
        var gradients = this.defs.selectAll('linearGradient')
            .data(gradientData, function (d) {
            return d[1].splitBy;
        });
        var enteredGradients = gradients.enter()
            .append('linearGradient')
            .attr("x2", "0%")
            .attr("y2", "100%")
            .merge(gradients)
            .attr("id", function (d) { return d[0]; });
        enteredGradients
            .each(function (d) {
            self.addGradientStops(d[1], select(this));
        });
        gradients.exit().remove();
    };
    return CategoricalPlot;
}(Plot));

var EventsPlot = /** @class */ (function (_super) {
    __extends(EventsPlot, _super);
    function EventsPlot(svgSelection) {
        var _this = _super.call(this, svgSelection) || this;
        _this.gradientArray = {};
        _this.eventOnClick = function (d) {
            if (_this.chartDataOptions.onElementClick) {
                _this.chartDataOptions.onElementClick(d.aggregateKey, d.splitBy, d.dateTime.toISOString(), d.measures);
            }
        };
        _this.colorFunction = function (d) {
            if (d.measures) {
                if (Object.keys(d.measures).length === 1) {
                    return _this.getColorForValue(Object.keys(d.measures)[0]);
                }
                else {
                    return 'grey';
                }
            }
            return 'none';
        };
        _this.createDateStringFunction = function (shiftMillis) {
            return Utils.timeFormat(_this.chartComponentData.usesSeconds, _this.chartComponentData.usesMillis, _this.chartOptions.offset, _this.chartOptions.is24HourTime, shiftMillis, null, _this.chartOptions.dateLocale);
        };
        _this.createEventElements = function (splitBy, g, splitByIndex) {
            var sortEvents = function () {
                enteredEvents.sort(function (a, b) {
                    if (a.dateTime < b.dateTime) {
                        return -1;
                    }
                    else if (a.dateTime > b.dateTime) {
                        return 1;
                    }
                    return 0;
                });
            };
            var data = _this.chartComponentData.timeArrays[_this.aggKey][splitBy];
            var discreteEvents = g.selectAll(".tsi-discreteEvent")
                .data(data, function (d) { return d.dateTime; });
            var self = _this;
            var enteredEvents;
            var shiftMillis = _this.chartComponentData.getTemporalShiftMillis(_this.aggKey);
            var dateStringFn = _this.createDateStringFunction(shiftMillis);
            switch (_this.chartDataOptions.eventElementType) {
                case EventElementTypes.Teardrop:
                    if (discreteEvents.size() && discreteEvents.classed('tsi-discreteEventDiamond')) {
                        g.selectAll('.tsi-discreteEvent').remove();
                        discreteEvents = g.selectAll(".tsi-discreteEvent")
                            .data(data, function (d) { return d.dateTime; });
                    }
                    enteredEvents = discreteEvents.enter()
                        .append('path')
                        .attr('class', 'tsi-discreteEvent tsi-valueElement')
                        .merge(discreteEvents)
                        .classed('tsi-discreteEventDiamond', false)
                        .classed('tsi-discreteEventTeardrop', true)
                        .attr('transform', function (d) {
                        return 'translate(' + (_this.x(new Date(d.dateTime)) + _this.eventHeight / 2) + ',' + (_this.eventHeight * 1.4) + ') rotate(180)';
                    })
                        .attr('d', _this.teardropD(_this.eventHeight, _this.eventHeight))
                        .attr('stroke-width', Math.min(_this.eventHeight / 2.25, 8))
                        .attr('stroke', _this.colorFunction)
                        .attr('fill', 'none');
                    break;
                case EventElementTypes.Diamond:
                    if (discreteEvents.size() && discreteEvents.classed('tsi-discreteEventTeardrop')) {
                        g.selectAll('.tsi-discreteEvent').remove();
                        discreteEvents = g.selectAll(".tsi-discreteEvent")
                            .data(data, function (d) { return d.dateTime; });
                    }
                    enteredEvents = discreteEvents.enter()
                        .append('rect')
                        .attr('class', 'tsi-discreteEvent tsi-valueElement')
                        .merge(discreteEvents)
                        .classed('tsi-discreteEventTeardrop', false)
                        .classed('tsi-discreteEventDiamond', true)
                        .attr('d', 'none')
                        .attr('transform', function (d) {
                        return 'translate(' + _this.x(new Date(d.dateTime)) + ',0) rotate(45)';
                    })
                        .attr('fill', _this.colorFunction)
                        .attr('stroke', 'none');
                    break;
            }
            enteredEvents
                .attr('y', 0)
                .attr('x', 0)
                .attr('width', _this.eventHeight)
                .attr('height', _this.eventHeight)
                .on('mouseover', function (d) {
                select(this).raise();
                self.onMouseover(d, splitByIndex);
            })
                .on('mouseout', function () {
                _this.onMouseout();
            })
                .on('click', function (d) {
                _this.eventOnClick(d);
            })
                .on('touchstart', function (d) {
                _this.eventOnClick(d);
            })
                .on('keydown', function (d) {
                if (event.keyCode === 9) {
                    sortEvents();
                    select(this).node().focus();
                }
                if (event.keyCode === 32 || event.keyCode === 13) {
                    self.eventOnClick(d);
                }
            })
                .attr('role', _this.chartDataOptions.onElementClick ? 'button' : null)
                .attr('tabindex', _this.chartDataOptions.onElementClick ? '0' : null)
                .attr('cursor', _this.chartDataOptions.onElementClick ? 'pointer' : 'inherit')
                .attr('aria-label', function (d) {
                if (_this.chartDataOptions.onElementClick) {
                    var dateString = dateStringFn(d);
                    var retString_1 = _this.getString('event in series') + " " + d.aggregateName + " " + _this.getString('at time') + " " + dateString + ".";
                    Object.keys(d.measures).forEach(function (mKey) {
                        retString_1 += " " + _this.getString('measure with key') + " " + mKey + " " + _this.getString('and value') + " " + d.measures[mKey] + ".";
                    });
                    return retString_1;
                }
                return null;
            })
                .style('visibility', function (d) {
                return (self.chartComponentData.isSplitByVisible(_this.aggKey, splitBy) && self.hasData(d)) ? 'visible' : 'hidden';
            })
                .each(function (d, i) {
                if (Object.keys(d.measures).length > 1) {
                    var gradientKey = self.createGradientKey(d, splitByIndex, i);
                    self.gradientData.push([gradientKey, d]);
                    select(this)
                        .attr(self.chartDataOptions.eventElementType === EventElementTypes.Teardrop ? 'stroke' : 'fill', "url(#" + gradientKey + ")");
                }
            });
            discreteEvents.exit().remove();
        };
        _this.shouldDrawBackdrop = function () {
            //check to see if this is the first aggregate within a collapsed swimlane. 
            var lane = _this.chartComponentData.getSwimlane(_this.aggKey);
            if (!_this.chartOptions.swimLaneOptions || !_this.chartOptions.swimLaneOptions[lane] ||
                !_this.chartOptions.swimLaneOptions[lane].collapseEvents) {
                return true;
            }
            var eventSeriesInLane = Object.keys(_this.chartComponentData.displayState).filter(function (aggKey) {
                return _this.chartComponentData.getSwimlane(aggKey) === lane;
            });
            return eventSeriesInLane.indexOf(_this.aggKey) === 0;
        };
        _this.plotDataType = DataTypes.Events;
        return _this;
    }
    EventsPlot.prototype.onMouseover = function (d, seriesNumber) {
        var _this = this;
        var getX = function () {
            return _this.x(new Date(d.dateTime));
        };
        var seriesWidth = Math.ceil(this.eventHeight * Math.sqrt(2));
        var seriesTop = this.yTop + NONNUMERICTOPMARGIN + (seriesWidth * seriesNumber) + (seriesWidth / 2);
        var shouldMouseover = this.discreteEventsMouseover(d, getX() + (seriesWidth / 2), seriesTop, seriesWidth);
        if (!shouldMouseover) {
            return;
        }
        var visibleMeasures = this.getVisibleMeasures(d.measures);
        this.hoverLine.attr('visibility', 'visible')
            .attr('x1', getX)
            .attr('x2', getX)
            .attr('y1', LINECHARTTOPPADDING)
            .attr('y2', this.chartHeight + 1)
            .attr('stroke', function () {
            return visibleMeasures.length === 1 ? _this.getColorForValue(visibleMeasures[0]) : 'grey';
        });
    };
    EventsPlot.prototype.onMouseout = function () {
        this.hoverLine.attr('visibility', 'hidden');
        this.discreteEventsMouseout();
    };
    EventsPlot.prototype.createHoverLine = function () {
        if (!this.hoverLine) {
            this.hoverLine = this.chartGroup.append('line')
                .attr('class', 'tsi-discreteEventHoverLine')
                .attr('y1', LINECHARTTOPPADDING)
                .attr('y2', this.chartHeight + 1)
                .attr('pointer-events', 'none')
                .attr('visibility', 'hidden');
        }
        else {
            this.hoverLine.raise();
        }
    };
    EventsPlot.prototype.setEventHeight = function (visibleSeriesCount) {
        var useableHeight = this.height - NONNUMERICTOPMARGIN;
        this.eventHeight = Math.floor((useableHeight / visibleSeriesCount) / Math.sqrt(2));
    };
    EventsPlot.prototype.render = function (chartOptions, visibleAggI, agg, aggVisible, aggregateGroup, chartComponentData, yExtent, chartHeight, visibleAggCount, colorMap, previousAggregateData, x, areaPath, strokeOpacity, y, yMap, defs, chartDataOptions, previousIncludeDots, yTopAndHeight, chartGroup, discreteEventsMouseover, discreteEventsMouseout) {
        var _this = this;
        this.chartOptions = chartOptions;
        this.yTop = yTopAndHeight[0];
        this.height = yTopAndHeight[1];
        this.x = x;
        this.chartComponentData = chartComponentData;
        this.aggKey = agg.aggKey;
        this.chartDataOptions = chartDataOptions;
        this.chartHeight = chartHeight;
        this.chartGroup = chartGroup;
        this.aggregateGroup = aggregateGroup;
        this.discreteEventsMouseover = discreteEventsMouseover;
        this.discreteEventsMouseout = discreteEventsMouseout;
        this.createBackdropRect(this.shouldDrawBackdrop());
        if (this.aggregateGroup.selectAll('defs').empty()) {
            this.defs = this.aggregateGroup.append('defs');
        }
        this.createHoverLine();
        var series = this.getVisibleSeries(agg.aggKey);
        this.setEventHeight(series.length);
        if (this.aggregateGroup.selectAll('.tsi-splitBysGroup').empty()) {
            this.splitBysGroup = this.aggregateGroup.append('g').classed('tsi-splitBysGroup', true);
        }
        var self = this;
        var splitByGroups = this.splitBysGroup.selectAll(".tsi-splitByGroup")
            .data(series, function (d) {
            return d.splitBy;
        });
        this.gradientData = [];
        var enteredSplitByGroups = splitByGroups.enter()
            .append("g")
            .attr("class", "tsi-eventsGroup tsi-splitByGroup " + this.aggKey)
            .merge(splitByGroups)
            .attr('transform', function (d, i) {
            return 'translate(0,' + (+(i * (_this.chartDataOptions.height / series.length))) + ')';
        })
            .each(function (splitBy, j) {
            self.createEventElements(splitBy, select(this), j);
        }).each(function () {
            self.themify(select(this), self.chartOptions.theme);
        });
        splitByGroups.exit().remove();
        var gradients = this.defs.selectAll('linearGradient')
            .data(this.gradientData, function (d) {
            return d[1].splitBy;
        });
        var enteredGradients = gradients.enter()
            .append('linearGradient')
            .attr("x2", "0%")
            .attr("y2", "100%")
            .merge(gradients)
            .attr("id", function (d) { return d[0]; });
        enteredGradients
            .each(function (d) {
            self.addGradientStops(d[1], select(this));
        });
        gradients.exit().remove();
    };
    return EventsPlot;
}(Plot));

var AxisState = /** @class */ (function () {
    function AxisState(axisType, yExtent, positionInGroup) {
        this.axisType = axisType;
        this.yExtent = yExtent;
        this.positionInGroup = positionInGroup;
    }
    return AxisState;
}());

var MARKERSTRINGMAXLENGTH = 250;
var MARKERVALUEMAXWIDTH = 80;
var Marker = /** @class */ (function (_super) {
    __extends(Marker, _super);
    function Marker(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.tooltipMap = {};
        _this.labelText = '';
        _this.markerIsDragging = false;
        _this.isSeriesLabels = false;
        _this.ADDITIONALRIGHTSIDEOVERHANG = 12;
        _this.guid = Utils.guid();
        return _this;
    }
    Marker.prototype.getGuid = function () {
        return this.guid;
    };
    Marker.prototype.setMillis = function (millis) {
        this.timestampMillis = millis;
    };
    Marker.prototype.getMillis = function () {
        return this.timestampMillis;
    };
    // returns whether the string was trimmed to the max length
    Marker.prototype.setLabelText = function (labelText) {
        if (labelText.length > MARKERSTRINGMAXLENGTH) {
            this.labelText = labelText.slice(0, MARKERSTRINGMAXLENGTH);
            return true;
        }
        this.labelText = labelText;
        return false;
    };
    Marker.prototype.getLabelText = function () {
        return this.labelText;
    };
    Marker.prototype.setSeriesLabelText = function (d, text, isSeriesLabelInFocus) {
        text.classed('tsi-isExpanded', false);
        var title = text.append('h4')
            .attr('class', 'tsi-seriesLabelGroupName tsi-tooltipTitle');
        Utils.appendFormattedElementsFromString(title, d.aggregateName);
        var shiftTuple = this.chartComponentData.getTemporalShiftStringTuple(d.aggregateKey);
        var shiftString = '';
        if (shiftTuple !== null) {
            shiftString = shiftTuple[0] === ShiftTypes.startAt ? this.timeFormat(new Date(shiftTuple[1])) : shiftTuple[1];
        }
        var labelDatum = {
            splitBy: d.splitBy,
            variableAlias: this.chartComponentData.displayState[d.aggregateKey].aggregateExpression.variableAlias,
            timeShift: shiftString,
        };
        var subtitle = text.selectAll('.tsi-seriesLabelSeriesName').data([labelDatum]);
        var enteredSubtitle = subtitle.enter()
            .append('div')
            .attr('class', 'tsi-seriesLabelSeriesName tsi-tooltipSubtitle');
        if (labelDatum.splitBy && labelDatum.splitBy !== '') {
            enteredSubtitle.append('span')
                .classed('tsi-splitBy', true);
        }
        if (labelDatum.timeShift) {
            enteredSubtitle.append('span')
                .classed('tsi-timeShift', true);
        }
        if (labelDatum.variableAlias) {
            enteredSubtitle.append('span')
                .classed('tsi-variableAlias', true);
        }
        subtitle.exit().remove();
        Utils.setSeriesLabelSubtitleText(enteredSubtitle, false);
    };
    Marker.prototype.tooltipFormat = function (d, text, measureFormat, xyrMeasures, isSeriesLabelInFocus) {
        if (isSeriesLabelInFocus === void 0) { isSeriesLabelInFocus = false; }
        var tooltipHeight = MARKERVALUENUMERICHEIGHT;
        // revert to default text format if none specified
        if (!this.isSeriesLabels) {
            text.text(Utils.formatYAxisNumber(this.getValueOfVisible(d)))
                .style('height', tooltipHeight + 'px')
                .style('line-height', ((tooltipHeight - 2) + 'px')); // - 2 to account for border height
        }
        else {
            this.setSeriesLabelText(d, text, isSeriesLabelInFocus);
        }
        text.classed('tsi-markerValueTooltipInner', true)
            .style('border-color', this.colorMap[d.aggregateKey + "_" + d.splitBy]);
    };
    Marker.prototype.getLeft = function (d) {
        return Math.round(this.x(d.timestamp) + this.marginLeft);
    };
    // check to see if any marker is being dragged
    Marker.prototype.isMarkerDragOccuring = function () {
        return this.markerIsDragging;
    };
    Marker.prototype.bumpMarker = function () {
        var _this = this;
        select(this.renderTarget).selectAll('.tsi-markerContainer')
            .style('animation', 'none')
            .sort(function (a, b) {
            if (a.timestamp === _this.timestampMillis) {
                return 1;
            }
            if (b.timestamp === _this.timestampMillis) {
                return -1;
            }
            return a.timestamp < b.timestamp ? 1 : -1;
        });
    };
    Marker.prototype.renderMarker = function () {
        var _this = this;
        var self = this;
        var marker = select(this.renderTarget).selectAll(".tsi-markerContainer")
            .filter(function (d) { return d.guid === _this.guid; })
            .data([{ guid: this.guid, timestamp: this.timestampMillis }]);
        this.markerContainer = marker.enter()
            .append('div')
            .attr('class', 'tsi-markerContainer')
            .classed('tsi-isSeriesLabels', this.isSeriesLabels)
            .merge(marker)
            .style('top', this.chartMargins.top + this.chartOptions.aggTopMargin + "px")
            .style('height', this.chartHeight - (this.chartMargins.top + this.chartMargins.bottom + this.chartOptions.aggTopMargin) + "px")
            .style('left', function (d) {
            return _this.getLeft(d) + "px";
        })
            .classed('tsi-isFlipped', function (d) {
            if (_this.isSeriesLabels) {
                return false;
            }
            return (_this.chartOptions.labelSeriesWithMarker && _this.x(d.timestamp) > (_this.x.range()[1] - MARKERVALUEMAXWIDTH));
        })
            .each(function (markerD) {
            if (self.isSeriesLabels) {
                return;
            }
            if (select(this).selectAll('.tsi-markerLine').empty()) {
                select(this).append('div')
                    .attr('class', 'tsi-markerLine');
                self.markerLabel = select(this).append('div')
                    .attr('class', 'tsi-markerLabel')
                    .on('mouseleave', function () {
                    select(this).classed('tsi-markerLabelHovered', false);
                });
                self.markerLabel.append('div')
                    .attr('class', 'tsi-markerGrabber')
                    .on('mouseenter', function () {
                    self.bumpMarker();
                });
                self.markerLabel.append('div')
                    .attr('class', 'tsi-markerLabelText')
                    .attr('contenteditable', 'true')
                    .text(self.labelText)
                    .on('keydown', function () {
                    if (event.keyCode === KeyCodes.Enter && !event.shiftKey) {
                        event.preventDefault();
                        self.closeButton.node().focus();
                    }
                })
                    .on('input', function () {
                    var didTrim = self.setLabelText(select(this).text());
                    if (didTrim) {
                        select(this).text(self.labelText);
                    }
                })
                    .on('focus', function () {
                    select(this.parentNode).classed('tsi-markerLabelTextFocused', true);
                })
                    .on('blur', function () {
                    select(this.parentNode).classed('tsi-markerLabelTextFocused', false);
                    self.onChange(false, false, false);
                })
                    .on('mousedown', function () {
                    event.stopPropagation();
                })
                    .on('mouseover', function () {
                    if (!self.isMarkerDragOccuring()) {
                        select(select(this).node().parentNode).classed('tsi-markerLabelHovered', true);
                        self.bumpMarker();
                    }
                });
                self.closeButton = self.markerLabel.append("button")
                    .attr("aria-label", self.getString('Delete marker'))
                    .classed("tsi-closeButton", true)
                    .on("click", function () {
                    self.onChange(true, false);
                    select(select(this).node().parentNode.parentNode).remove();
                });
                self.timeLabel = select(this).append("div")
                    .attr('class', 'tsi-markerTimeLabel');
            }
            select(this).selectAll('.tsi-markerTimeLabel,.tsi-markerLine,.tsi-markerLabel')
                .call(drag()
                .on('start', function (d) {
                d.isDragging = true;
                self.markerIsDragging = true;
                self.bumpMarker();
            })
                .on('drag', function (d) {
                if (select(event.sourceEvent.target).classed('tsi-closeButton')) {
                    return;
                }
                var marker = select(select(this).node().parentNode);
                var startPosition = self.x(new Date(self.timestampMillis));
                var newPosition = startPosition + event.x;
                self.timestampMillis = Utils.findClosestTime(self.x.invert(newPosition).valueOf(), self.chartComponentData.timeMap);
                self.setPositionsAndLabels(self.timestampMillis);
            })
                .on('end', function (d) {
                if (!select(event.sourceEvent.target).classed('tsi-closeButton')) {
                    self.onChange(false, false);
                }
                d.isDragging = false;
                self.markerIsDragging = false;
            }));
        });
        marker.exit().remove();
    };
    Marker.prototype.getValueOfVisible = function (d) {
        return Utils.getValueOfVisible(d, this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy));
    };
    Marker.prototype.getTooltipKey = function (d) {
        return d.aggregateKey + '_' + d.splitBy;
    };
    Marker.prototype.findYatX = function (x, path) {
        var pathParent = path.parentNode;
        var length_end = path.getTotalLength();
        var length_start = 0;
        var point = path.getPointAtLength((length_end + length_start) / 2);
        var bisection_iterations_max = 100;
        var bisection_iterations = 0;
        var error = 0.01;
        while (x < point.x - error || x > point.x + error) {
            point = path.getPointAtLength((length_end + length_start) / 2);
            if (x < point.x) {
                length_end = (length_start + length_end) / 2;
            }
            else {
                length_start = (length_start + length_end) / 2;
            }
            if (bisection_iterations_max < ++bisection_iterations) {
                break;
            }
        }
        var offset = path.parentNode.parentNode.transform.baseVal[0].matrix.f; // roundabout way of getting the y transform of the agg group
        return point.y + offset;
    };
    Marker.prototype.positionToValue = function (yPos, aggKey) {
        var yScale = this.yMap[aggKey];
        return yScale.invert(yPos);
    };
    Marker.prototype.bisectionInterpolateValue = function (millis, aggKey, splitBy, path) {
        if (path === null) {
            return null;
        }
        var yPosition = this.findYatX(this.x(millis), path);
        var interpolatedValue = this.positionToValue(yPosition, aggKey);
        var newDatum = this.createNewDatum(aggKey, splitBy, interpolatedValue);
        newDatum.isInterpolated = true;
        return newDatum;
    };
    Marker.prototype.getPath = function (aggKey, splitBy) {
        var selectedPaths = select(this.renderTarget).selectAll('.tsi-valueLine').filter(function (d) {
            if (d.length) {
                return d[0].aggregateKey === aggKey && d[0].splitBy === splitBy;
            }
            return false;
        });
        if (selectedPaths.size() === 0) {
            return null;
        }
        return selectedPaths.nodes()[0];
    };
    Marker.prototype.createNewDatum = function (aggKey, splitBy, valueOfVisible) {
        var newDatum = {};
        newDatum.aggregateKey = aggKey;
        newDatum.splitBy = splitBy;
        newDatum.measures = {};
        newDatum.measures[this.chartComponentData.getVisibleMeasure(aggKey, splitBy)] = valueOfVisible;
        return newDatum;
    };
    Marker.prototype.findGapPath = function (aggKey, splitBy, millis) {
        var gapPath = select(this.renderTarget).selectAll('.tsi-gapLine')
            .filter(function (d) {
            if (d.length === 2 && aggKey === d[0].aggregateKey && splitBy === d[0].splitBy) {
                return (millis > d[0].dateTime.valueOf() && millis < d[1].dateTime.valueOf());
            }
            return false;
        });
        if (gapPath.size() === 0) {
            return null;
        }
        return gapPath.nodes()[0];
    };
    //check if a value is within the time constrained bounds of a path
    Marker.prototype.inBounds = function (path, millis) {
        var _this = this;
        var filteredData = path.data()[0].filter(function (d) {
            return d.measures && _this.getValueOfVisible(d) !== null;
        });
        if (filteredData.length > 0) {
            var lowerBound = filteredData[0].dateTime.valueOf();
            var upperBound = filteredData[filteredData.length - 1].dateTime.valueOf();
            return millis >= lowerBound && millis <= upperBound;
        }
        return false;
    };
    Marker.prototype.getIntersectingPath = function (aggKey, splitBy, millis) {
        if (this.chartComponentData.displayState[aggKey].bucketSize) {
            millis = millis - (this.chartComponentData.displayState[aggKey].bucketSize / 2);
        }
        var gapPath = this.findGapPath(aggKey, splitBy, millis);
        if (gapPath) {
            return gapPath;
        }
        else {
            return this.inBounds(select(this.getPath(aggKey, splitBy)), millis) ? this.getPath(aggKey, splitBy) : null;
        }
    };
    Marker.prototype.interpolateValue = function (millis, aggKey, splitBy) {
        var path = this.getIntersectingPath(aggKey, splitBy, millis);
        if (path === null) {
            return null;
        }
        return this.bisectionInterpolateValue(millis, aggKey, splitBy, path);
    };
    Marker.prototype.getValuesAtTime = function (closestTime) {
        var _this = this;
        var valueArray = [];
        var values = this.chartComponentData.timeMap[closestTime] != undefined ? this.chartComponentData.timeMap[closestTime] : [];
        Object.keys(this.chartComponentData.visibleTAs).forEach(function (aggKey) {
            Object.keys(_this.chartComponentData.visibleTAs[aggKey]).forEach(function (splitBy) {
                if (_this.chartComponentData.displayState[aggKey].dataType !== DataTypes.Numeric) {
                    return;
                }
                var filteredValues = values.filter(function (v) {
                    return (v.aggregateKey === aggKey && v.splitBy === splitBy && _this.getValueOfVisible(v) !== null);
                });
                if (filteredValues.length === 1 && (_this.getValueOfVisible(filteredValues[0]) !== null)) {
                    valueArray.push(filteredValues[0]);
                }
                else {
                    var interpolatedValue = _this.interpolateValue(closestTime, aggKey, splitBy);
                    if (interpolatedValue !== null || !_this.isSeriesLabels) {
                        valueArray.push(interpolatedValue);
                    }
                    else {
                        var lastValue = _this.chartComponentData.findLastTimestampWithValue(aggKey, splitBy);
                        if (lastValue !== null) {
                            valueArray.push(lastValue);
                        }
                    }
                }
            });
        });
        return valueArray;
    };
    Marker.prototype.setValueLabels = function (closestTime) {
        var _this = this;
        var values = this.getValuesAtTime(closestTime);
        values = values.filter(function (d) {
            return d && _this.chartComponentData.getDataType(d.aggregateKey) === DataTypes.Numeric;
        });
        var self = this;
        var valueLabels = this.markerContainer.selectAll(".tsi-markerValue").data(values, function (d) {
            return d.aggregateKey + "_" + d.splitBy;
        });
        valueLabels.enter()
            .append("div")
            .classed("tsi-markerValue", true)
            .classed('tsi-seriesLabelValue', this.isSeriesLabels)
            .merge(valueLabels)
            .classed('tsi-isInterpolated', function (d) {
            return d.isInterpolated;
        })
            .style('top', function (d) { return _this.calcTopOfValueLabel(d) + 'px'; })
            .each(function (d) {
            var tooltipKey = self.getTooltipKey(d);
            var tooltip;
            if (self.tooltipMap[tooltipKey]) {
                tooltip = self.tooltipMap[tooltipKey];
            }
            else {
                tooltip = new Tooltip(select(this));
                self.tooltipMap[tooltipKey] = tooltip;
            }
            tooltip.render(self.chartOptions.theme);
            tooltip.draw(d, self.chartComponentData, 0, MARKERVALUENUMERICHEIGHT / 2, { right: 0, left: 0, top: 0, bottom: 0 }, function (tooltipTextElement) {
                self.tooltipFormat(d, tooltipTextElement, null, null);
            }, null, 0, 0, self.colorMap[d.aggregateKey + "_" + d.splitBy], true);
            var markerValueCaret = select(this).selectAll('.tsi-markerValueCaret')
                .data([d]);
            markerValueCaret.enter().append('div')
                .attr('class', 'tsi-markerValueCaret')
                .merge(markerValueCaret)
                .style("border-right-color", function () { return self.colorMap[d.aggregateKey + "_" + d.splitBy]; });
            markerValueCaret.exit().remove();
        });
        var valueLabelsExit = valueLabels.exit();
        valueLabelsExit.each(function (d) {
            delete _this.tooltipMap[_this.getTooltipKey(d)];
        });
        valueLabelsExit.remove();
    };
    Marker.prototype.calcTopOfValueLabel = function (d) {
        var yScale = this.yMap[d.aggregateKey];
        return Math.round(yScale(this.getValueOfVisible(d)) - this.chartOptions.aggTopMargin);
    };
    Marker.prototype.getTimeFormat = function () {
        return Utils.timeFormat(this.chartComponentData.usesSeconds, this.chartComponentData.usesMillis, this.chartOptions.offset, this.chartOptions.is24HourTime, 0, null, this.chartOptions.dateLocale);
    };
    Marker.prototype.setTimeLabel = function (closestTime) {
        if (this.isSeriesLabels) {
            return;
        }
        var values = this.chartComponentData.timeMap[closestTime];
        if (values == undefined || values.length == 0) {
            return;
        }
        var firstValue = values[0].dateTime;
        var secondValue = new Date(values[0].dateTime.valueOf() + (values[0].bucketSize != null ? values[0].bucketSize : 0));
        this.timeLabel.text('');
        this.timeLabel.append('div')
            .attr('class', 'tsi-markerTimeLine')
            .text(this.timeFormat(firstValue));
        if (values[0].bucketSize !== null) {
            this.timeLabel.append('div')
                .attr('class', 'tsi-markerTimeLine')
                .text(this.timeFormat(secondValue));
        }
        var markerLeft = Number(this.markerContainer.style("left").replace("px", ""));
        var timeLabelWidth = Math.round(this.timeLabel.node().getBoundingClientRect().width);
        var minLeftPosition = this.marginLeft + LINECHARTXOFFSET;
        var width = this.x.range()[1] - this.x.range()[0];
        var maxRightPosition = width + this.marginLeft + LINECHARTXOFFSET + this.ADDITIONALRIGHTSIDEOVERHANG;
        var calculatedLeftPosition = markerLeft - (timeLabelWidth / 2);
        var calculatedRightPosition = markerLeft + (timeLabelWidth / 2);
        var translate = "translateX(calc(-50% + 1px))";
        if (calculatedLeftPosition < minLeftPosition) {
            translate = "translateX(-" + Math.max(0, markerLeft - minLeftPosition) + "px)";
        }
        if (calculatedRightPosition > maxRightPosition) {
            translate = "translateX(calc(-50% + " + (maxRightPosition - calculatedRightPosition) + "px))";
        }
        this.timeLabel
            .style("-webkit-tranform", translate)
            .style("transform", translate);
    };
    Marker.prototype.focusCloseButton = function () {
        if (this.closeButton) {
            this.closeButton.node().focus();
        }
    };
    Marker.prototype.isMarkerInRange = function (millis) {
        if (millis === void 0) { millis = this.timestampMillis; }
        var domain = this.x.domain();
        return !(millis < domain[0].valueOf() || millis > domain[1].valueOf());
    };
    Marker.prototype.destroyMarker = function () {
        if (this.markerContainer) {
            this.markerContainer.remove();
        }
        this.tooltipMap = {};
        this.markerContainer = null;
    };
    Marker.prototype.render = function (timestampMillis, chartOptions, chartComponentData, additionalMarkerFields) {
        this.chartMargins = Object.assign({}, additionalMarkerFields.chartMargins);
        this.chartHeight = additionalMarkerFields.chartHeight;
        this.timestampMillis = timestampMillis;
        this.chartOptions = chartOptions;
        this.x = additionalMarkerFields.x;
        this.chartComponentData = chartComponentData;
        this.marginLeft = additionalMarkerFields.marginLeft;
        this.colorMap = additionalMarkerFields.colorMap;
        this.timeFormat = this.getTimeFormat();
        this.isSeriesLabels = additionalMarkerFields.isSeriesLabels;
        if (additionalMarkerFields.labelText) {
            this.labelText = additionalMarkerFields.labelText;
        }
        this.yMap = additionalMarkerFields.yMap;
        if (additionalMarkerFields.onChange) { // only update onChange if passed in, otherwise maintain previous
            this.onChange = additionalMarkerFields.onChange;
        }
        if (!this.isMarkerInRange(this.timestampMillis)) {
            this.destroyMarker();
            return;
        }
        this.renderMarker();
        var closestTime = Utils.findClosestTime(this.timestampMillis, this.chartComponentData.timeMap);
        this.setPositionsAndLabels(closestTime);
        _super.prototype.themify.call(this, this.markerContainer, this.chartOptions.theme);
    };
    Marker.prototype.setPositionsAndLabels = function (millis) {
        if (!this.isMarkerInRange(millis)) {
            this.destroyMarker();
            return;
        }
        this.renderMarker();
        this.setTimeLabel(millis);
        this.setValueLabels(millis);
    };
    return Marker;
}(Component));

var LineChart = /** @class */ (function (_super) {
    __extends(LineChart, _super);
    function LineChart(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.minBrushWidth = 1;
        _this.strokeOpacity = 1;
        _this.nonFocusStrokeOpactiy = .3;
        _this.chartComponentData = new LineChartData();
        _this.surpressBrushTimeSet = false;
        _this.hasStackedButton = false;
        _this.stackedButton = null;
        _this.horizontalLabelOffset = LINECHARTCHARTMARGINS.left + swimlaneLabelConstants.leftMarginOffset;
        _this.markers = {};
        _this.seriesLabelsMarker = null;
        _this.markerGuidMap = {};
        _this.isDroppingMarker = false;
        _this.brushStartPosition = null;
        _this.brushEndPosition = null;
        _this.hasBrush = false;
        _this.isClearingBrush = false;
        _this.previousAggregateData = local();
        _this.previousIncludeDots = local();
        _this.mx = null;
        _this.my = null;
        _this.focusedAggKey = null;
        _this.focusedSplitby = null;
        _this.plotComponents = {};
        _this.isFirstMarkerDrop = true;
        _this.xOffset = 8;
        _this.swimlaneYExtents = {}; // mapping of swimlanes to the y extents of that swimlane
        _this.swimLaneContents = {};
        _this.resetValueElementsFocus = function () {
            _this.svgSelection.selectAll(".tsi-valueElement")
                .attr("stroke-opacity", _this.strokeOpacity)
                .filter(function () {
                return !select(this).classed("tsi-valueEnvelope");
            })
                .attr("fill-opacity", 1);
            _this.svgSelection.selectAll(".tsi-valueEnvelope")
                .attr("fill-opacity", .2);
            Utils.revertAllSubtitleText(select(_this.renderTarget).selectAll('.tsi-markerValue'));
            _this.focusedAggKey = null;
            _this.focusedSplitby = null;
        };
        _this.triggerLineFocus = function (aggKey, splitBy) {
            _this.focusedAggKey = null;
            _this.focusedSplitby = null;
            _this.focusOnlyHoveredSeries(aggKey, splitBy, true);
        };
        _this.focusOnlyHoveredSeries = function (aggKey, splitBy, shouldSetFocusedValues) {
            if (aggKey !== _this.focusedAggKey || splitBy !== _this.focusedSplitby) {
                var selectedFilter = Utils.createValueFilter(aggKey, splitBy);
                _this.focusMarkerLabel(selectedFilter, aggKey, splitBy);
                _this.svgSelection.selectAll(".tsi-valueElement")
                    .attr("stroke-opacity", _this.nonFocusStrokeOpactiy)
                    .attr("fill-opacity", .3);
                _this.svgSelection.selectAll(".tsi-valueEnvelope")
                    .attr("fill-opacity", .1);
                _this.svgSelection.selectAll(".tsi-valueElement")
                    .filter(selectedFilter)
                    .attr("stroke-opacity", _this.strokeOpacity)
                    .attr("fill-opacity", 1);
                _this.svgSelection.selectAll(".tsi-valueEnvelope")
                    .filter(selectedFilter)
                    .attr("fill-opacity", .3);
                if (shouldSetFocusedValues) {
                    _this.focusedAggKey = aggKey;
                    _this.focusedSplitby = splitBy;
                }
            }
        };
        _this.discreteEventsMouseover = function (d, x, y, width) {
            if (_this.isDroppingMarker) {
                return false;
            }
            _this.legendObject.triggerSplitByFocus(d.aggregateKey, d.splitBy);
            _this.focusOnlyHoveredSeries(d.aggregateKey, d.splitBy, true);
            var xPos = x;
            var yPos = y + _this.chartMargins.top;
            var yValue = _this.getValueOfVisible(d);
            if (_this.chartOptions.tooltip) {
                _this.tooltip.render(_this.chartOptions.theme);
                _this.tooltip.draw(d, _this.chartComponentData, xPos, y, _this.chartMargins, function (text) {
                    _this.tooltipFormat(d, text, TooltipMeasureFormat.SingleValue);
                }, width, 0, 0);
            }
            else
                _this.tooltip.hide();
            return true;
        };
        _this.discreteEventsMouseout = function () {
            _this.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("inFocus", false);
            _this.resetValueElementsFocus();
            _this.tooltip.hide();
        };
        //returns false if supressed via isDroppingMarker, true otherwise
        _this.categoricalMouseover = function (d, x, y, endDate, width) {
            if (_this.isDroppingMarker) {
                return false;
            }
            _this.legendObject.triggerSplitByFocus(d.aggregateKey, d.splitBy);
            _this.focusOnlyHoveredSeries(d.aggregateKey, d.splitBy, true);
            var xPos = x;
            var yPos = y + _this.chartMargins.top;
            var yValue = _this.getValueOfVisible(d);
            if (_this.chartOptions.tooltip) {
                _this.tooltip.render(_this.chartOptions.theme);
                _this.tooltip.draw(d, _this.chartComponentData, xPos, y, _this.chartMargins, function (text) {
                    d.endDate = endDate;
                    _this.tooltipFormat(d, text, TooltipMeasureFormat.SingleValue);
                }, width, 0, 0);
            }
            else
                _this.tooltip.hide();
            return true;
        };
        _this.categoricalMouseout = function () {
            _this.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("inFocus", false);
            _this.resetValueElementsFocus();
            _this.tooltip.hide();
        };
        _this.voronoiMouseover = function (d) {
            //supress if the context menu is visible
            if (_this.contextMenu && _this.contextMenu.contextMenuVisible)
                return;
            var shiftMillis = _this.chartComponentData.getTemporalShiftMillis(d.aggregateKey);
            var yScale = _this.yMap[d.aggregateKey];
            var xValue = d.dateTime;
            var xPos = _this.getXPosition(d, _this.x);
            var yValue = _this.getValueOfVisible(d);
            var yPos = yScale(yValue);
            _this.focus.style("display", "block");
            _this.focus.attr("transform", "translate(" + xPos + "," + yPos + ")");
            _this.focus.select('.tsi-hLine').attr("transform", "translate(" + (-xPos) + ",0)");
            _this.focus.select('.tsi-vLine').attr("transform", "translate(0," + (-yPos) + ")");
            _this.setHorizontalValuePosAndText(d, xPos + _this.getSVGLeftOffset() + _this.chartMargins.left, xValue, shiftMillis);
            _this.setVerticalValueAndPosition(yValue, yPos + _this.chartMargins.top);
            var bucketSize = _this.chartComponentData.displayState[d.aggregateKey].bucketSize;
            var endValue = bucketSize ? (new Date(xValue.valueOf() + bucketSize)) : null;
            if (endValue) {
                var barWidth = _this.x(endValue) - _this.x(xValue);
                _this.horizontalValueBar
                    .style('display', 'block')
                    .attr("x1", (-barWidth / 2))
                    .attr("x2", (barWidth / 2))
                    .attr('y1', _this.chartHeight - yPos + 2)
                    .attr('y2', _this.chartHeight - yPos + 2);
            }
            else {
                _this.horizontalValueBar.style('display', 'none');
            }
            if (_this.chartOptions.tooltip) {
                _this.tooltip.render(_this.chartOptions.theme);
                _this.tooltip.draw(d, _this.chartComponentData, xPos, yPos, _this.chartMargins, function (text) {
                    _this.tooltipFormat(d, text, TooltipMeasureFormat.Enveloped);
                }, null, 20, 20, _this.colorMap[d.aggregateKey + "_" + d.splitBy]);
            }
            else
                _this.tooltip.hide();
            _this.focus.node().parentNode.appendChild(_this.focus.node());
            _this.legendObject.triggerSplitByFocus(d.aggregateKey, d.splitBy);
            /** update the y axis for in focus aggregate */
            if (_this.chartOptions.yAxisState === YAxisStates.Overlap) {
                _this.svgSelection.selectAll(".yAxis")
                    .selectAll("text")
                    .style("fill-opacity", .5)
                    .classed("standardYAxisText", true);
                _this.svgSelection.selectAll(".yAxis")
                    .filter(function (yAxisAggKey) {
                    return yAxisAggKey == d.aggregateKey;
                })
                    .selectAll("text")
                    .style("fill-opacity", 1)
                    .classed("standardYAxisText", false)
                    .style("font-weight", "bold");
            }
            if (_this.chartOptions.yAxisHidden) {
                _this.svgSelection.selectAll(".yAxis").style("display", "hidden");
            }
            if (_this.chartOptions.xAxisHidden) {
                _this.svgSelection.selectAll(".xAxis").style("display", "none");
            }
            _this.chartOptions.onMouseover(d.aggregateKey, d.splitBy);
        };
        _this.stickyOrUnstickySeries = function (aggKey, splitBy) {
            if (_this.chartComponentData.stickiedKey && _this.chartComponentData.stickiedKey.aggregateKey === aggKey &&
                _this.chartComponentData.stickiedKey.splitBy === splitBy) {
                _this.unstickySeries(aggKey, splitBy);
            }
            else {
                _this.stickySeries(aggKey, splitBy);
            }
        };
        _this.unstickySeries = function (aggKey, splitby) {
            if (splitby === void 0) { splitby = null; }
            if (_this.getDataType(aggKey) !== DataTypes.Numeric || !_this.chartOptions.shouldSticky) {
                return;
            }
            _this.chartComponentData.stickiedKey = null;
            _this.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("stickied", false);
            // recompute voronoi with no sticky
            _this.voronoiDiagram = _this.voronoi(_this.getFilteredAndSticky(_this.chartComponentData.allValues));
            _this.chartOptions.onUnsticky(aggKey, splitby);
        };
        _this.stickySeries = function (aggregateKey, splitBy) {
            if (splitBy === void 0) { splitBy = null; }
            if (_this.getDataType(aggregateKey) !== DataTypes.Numeric || !_this.chartOptions.shouldSticky) {
                return;
            }
            var filteredValues = _this.getFilteredAndSticky(_this.chartComponentData.allValues);
            if (filteredValues == null || filteredValues.length == 0)
                return;
            _this.focusedAggKey = null;
            _this.focusedSplitby = null;
            _this.chartComponentData.stickiedKey = {
                aggregateKey: aggregateKey,
                splitBy: (splitBy == null ? null : splitBy)
            };
            _this.legendObject.legendElement.selectAll('.tsi-splitByLabel').filter(function (filteredSplitBy) {
                return (select(this.parentNode).datum() == aggregateKey) && (filteredSplitBy == splitBy);
            }).classed("stickied", true);
            _this.voronoiDiagram = _this.voronoi(_this.getFilteredAndSticky(_this.chartComponentData.allValues));
            _this.chartOptions.onSticky(aggregateKey, splitBy);
        };
        _this.filteredValueExist = function () {
            var filteredValues = _this.getFilteredAndSticky(_this.chartComponentData.allValues);
            return !(filteredValues == null || filteredValues.length == 0);
        };
        _this.addMarker = function () {
            if (_this.isFirstMarkerDrop) {
                _this.isFirstMarkerDrop = false;
                _this.createMarkerInstructions();
            }
            _this.isDroppingMarker = !_this.isDroppingMarker;
            if (!_this.isDroppingMarker) {
                _this.destroyMarkerInstructions();
                return;
            }
            Utils.focusOnEllipsisButton(_this.renderTarget);
            var marker = new Marker(_this.renderTarget);
            var markerUID = Utils.guid();
            var onChange = _this.createOnMarkerChange(markerUID, marker);
            _this.activeMarker = marker;
            _this.markerGuidMap[markerUID] = marker;
            _this.renderMarker(marker, Infinity, onChange, _this.getString('Marker') + " " + Object.keys(_this.markerGuidMap).length);
        };
        _this.labelMouseout = function () {
            if (_this.svgSelection) {
                Utils.revertAllSubtitleText(select(_this.renderTarget).selectAll('.tsi-markerValue'));
                _this.svgSelection.selectAll(".tsi-valueElement")
                    .filter(function () { return !select(this).classed("tsi-valueEnvelope"); })
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                _this.svgSelection.selectAll(".tsi-valueEnvelope")
                    .attr("fill-opacity", .3);
            }
        };
        _this.labelMouseover = function (aggregateKey, splitBy) {
            if (splitBy === void 0) { splitBy = null; }
            _this.focusOnlyHoveredSeries(aggregateKey, splitBy, false);
        };
        _this.nextStackedState = function () {
            if (_this.chartOptions.yAxisState === YAxisStates.Stacked)
                return "shared";
            else if (_this.chartOptions.yAxisState === YAxisStates.Shared)
                return "overlap";
            else
                return "stacked";
        };
        _this.MINHEIGHT = 26;
        _this.chartMargins = Object.assign({}, LINECHARTCHARTMARGINS);
        return _this;
    }
    LineChart.prototype.LineChart = function () {
    };
    //get the left and right positions of the brush
    LineChart.prototype.getBrushPositions = function () {
        var leftPos = null;
        var rightPos = null;
        if (this.brushStartTime) {
            var rawLeft = this.x(this.brushStartTime);
            if (rawLeft >= 0 && rawLeft <= this.chartWidth)
                leftPos = Math.round(rawLeft + this.chartMargins.left);
        }
        if (this.brushEndTime) {
            var rawRight = this.x(this.brushEndTime);
            if (rawRight >= 0 && rawRight <= this.chartWidth)
                rightPos = Math.round(rawRight + this.chartMargins.left);
        }
        return {
            leftPos: leftPos,
            rightPos: rightPos
        };
    };
    LineChart.prototype.hideFocusElements = function () {
        this.focus.style('display', 'none');
        this.verticalValueBox.style('display', 'none');
        this.horizontalValueBox.style('display', 'none');
    };
    LineChart.prototype.voronoiMouseout = function (d) {
        //supress if the context menu is visible
        if (this.contextMenu && this.contextMenu.contextMenuVisible)
            return;
        this.hideFocusElements();
        this.tooltip.hide();
        this.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("inFocus", false);
        if (event && event.type != 'end') {
            event.stopPropagation();
        }
        this.resetValueElementsFocus();
        /** Update y Axis */
        if (this.chartOptions.yAxisState == YAxisStates.Overlap) {
            this.svgSelection.selectAll(".yAxis")
                .selectAll("text")
                .style("fill-opacity", 1)
                .classed("standardYAxisText", false)
                .style("font-weight", "normal");
        }
    };
    LineChart.prototype.createMarkerInstructions = function () {
        this.targetElement.selectAll(".tsi-markerInstructions").remove();
        this.targetElement.append("div")
            .classed("tsi-markerInstructions", true)
            .text(this.getString("Click to drop marker") + "," + this.getString("drag to reposition") + ".");
    };
    LineChart.prototype.destroyMarkerInstructions = function () {
        this.targetElement.selectAll(".tsi-markerInstructions").remove();
    };
    LineChart.prototype.getMouseoverFunction = function (chartType) {
        if (chartType === void 0) { chartType = DataTypes.Numeric; }
        switch (chartType) {
            case DataTypes.Categorical:
                return this.categoricalMouseover;
            case DataTypes.Events:
                return this.discreteEventsMouseover;
            default:
                return function () { };
        }
    };
    LineChart.prototype.getMouseoutFunction = function (chartType) {
        if (chartType === void 0) { chartType = DataTypes.Numeric; }
        switch (chartType) {
            case DataTypes.Categorical:
                return this.categoricalMouseout;
            case DataTypes.Events:
                return this.discreteEventsMouseout;
            default:
                return function () { };
        }
    };
    LineChart.prototype.mismatchingChartType = function (aggKey) {
        if (!this.plotComponents[aggKey]) {
            return false;
        }
        var typeOfPlot = this.plotComponents[aggKey].plotDataType;
        return typeOfPlot !== this.getDataType(aggKey);
    };
    LineChart.prototype.setHorizontalValuePosAndText = function (d, xPos, xValue, shiftMillis) {
        var bucketSize = this.chartComponentData.displayState[d.aggregateKey].bucketSize;
        var endValue = bucketSize ? (new Date(xValue.valueOf() + bucketSize)) : null;
        this.horizontalValueBox.text('')
            .style('left', xPos + "px")
            .style('top', (this.chartMargins.top + this.chartHeight + VALUEBARHEIGHT) + "px")
            .style('display', 'block');
        this.horizontalValueBox.append('div')
            .attr('class', 'tsi-valueBoxText')
            .text(Utils.timeFormat(this.chartComponentData.usesSeconds, this.chartComponentData.usesMillis, this.chartOptions.offset, this.chartOptions.is24HourTime, shiftMillis, null, this.chartOptions.dateLocale)(xValue));
        if (endValue !== null) {
            this.horizontalValueBox.append('div')
                .attr('class', 'tsi-valueBoxText')
                .text(Utils.timeFormat(this.chartComponentData.usesSeconds, this.chartComponentData.usesMillis, this.chartOptions.offset, this.chartOptions.is24HourTime, shiftMillis, null, this.chartOptions.dateLocale)(endValue));
        }
    };
    LineChart.prototype.setVerticalValueAndPosition = function (yValue, yPos) {
        this.verticalValueBox.style('top', yPos + "px")
            .style('right', (this.chartMargins.right + this.chartWidth) + "px")
            .style('display', 'block')
            .text(Utils.formatYAxisNumber(yValue));
    };
    //get the extent of an array of timeValues
    LineChart.prototype.getYExtent = function (aggValues, isEnvelope, aggKey) {
        var _this = this;
        if (aggKey === void 0) { aggKey = null; }
        var extent$1;
        if (aggKey !== null && (this.chartComponentData.displayState[aggKey].yExtent !== null)) {
            return this.chartComponentData.displayState[aggKey].yExtent;
        }
        if (this.chartOptions.yExtent !== null) {
            return this.chartOptions.yExtent;
        }
        if (isEnvelope) {
            var filteredValues = this.getFilteredValues(aggValues);
            var flatValuesList = [];
            filteredValues.forEach(function (d) {
                if (_this.chartComponentData.isPossibleEnvelope(d.aggregateKey, d.splitBy)) {
                    if (d.measures['min'] != undefined && d.measures['min'] != null) {
                        flatValuesList.push(d.measures['min']);
                    }
                    if (d.measures['avg'] != undefined && d.measures['avg'] != null) {
                        flatValuesList.push(d.measures['avg']);
                    }
                    if (d.measures['max'] != undefined && d.measures['max'] != null) {
                        flatValuesList.push(d.measures['max']);
                    }
                }
                else {
                    var visibleMeasure = _this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy);
                    if (d.measures[visibleMeasure] != undefined && d.measures[visibleMeasure] != null) {
                        flatValuesList.push(d.measures[visibleMeasure]);
                    }
                }
            });
            extent$1 = extent(flatValuesList);
        }
        else {
            extent$1 = extent(this.getFilteredValues(aggValues), function (d) {
                var visibleMeasure = _this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy);
                if (d.measures[visibleMeasure] != undefined && d.measures[visibleMeasure] != null) {
                    return d.measures[visibleMeasure];
                }
                return null;
            });
        }
        if (extent$1[0] == undefined || extent$1[1] == undefined)
            return [0, 1];
        return extent$1;
    };
    LineChart.prototype.getFilteredValues = function (aggValues) {
        var _this = this;
        return aggValues.filter(function (d) {
            return (d.measures && _this.getValueOfVisible(d) !== null);
        });
    };
    LineChart.prototype.getFilteredAndSticky = function (aggValues) {
        var _this = this;
        var filteredValues = this.getFilteredValues(aggValues);
        var numericFiltered = filteredValues.filter(function (d) {
            return (_this.getDataType(d.aggregateKey) === DataTypes.Numeric);
        });
        if (this.chartComponentData.stickiedKey == null)
            return numericFiltered;
        return numericFiltered.filter(function (d) {
            return d.aggregateKey == _this.chartComponentData.stickiedKey.aggregateKey &&
                ((_this.chartComponentData.stickiedKey.splitBy == null) ? true :
                    d.splitBy == _this.chartComponentData.stickiedKey.splitBy);
        });
    };
    LineChart.prototype.getHandleHeight = function () {
        return Math.min(Math.max(this.chartHeight / 2, 24), this.chartHeight + 8);
    };
    LineChart.prototype.getXPosition = function (d, x) {
        var bucketSize = this.chartComponentData.displayState[d.aggregateKey].bucketSize;
        if (bucketSize)
            return (x(d.dateTime) + x((new Date(d.dateTime.valueOf() + bucketSize)))) / 2;
        return x(d.dateTime);
    };
    LineChart.prototype.setBrushStartTime = function (startTime) {
        this.brushStartTime = startTime;
    };
    LineChart.prototype.setBrushEndTime = function (endTime) {
        this.brushEndTime = endTime;
    };
    LineChart.prototype.setBrush = function () {
        if (this.brushStartTime && this.brushEndTime && this.brushElem && this.brush) {
            var rawLeftSide = this.x(this.brushStartTime);
            var rawRightSide = this.x(this.brushEndTime);
            //if selection is out of range of brush. clear brush
            this.brushElem.call(this.brush.move, null);
            if ((rawRightSide < this.xOffset) || (rawLeftSide > (this.chartWidth - (2 * this.xOffset)))) {
                this.isClearingBrush = true;
                this.brushElem.call(this.brush.move, null);
                return;
            }
            var leftSide = Math.min(this.chartWidth - (2 * this.xOffset), Math.max(this.xOffset, this.x(this.brushStartTime)));
            var rightSide = Math.min(this.chartWidth - (2 * this.xOffset), Math.max(this.xOffset, this.x(this.brushEndTime)));
            this.surpressBrushTimeSet = true;
            this.brushStartPosition = leftSide;
            this.brushEndPosition = rightSide;
            //small adjusetment so that width is always at least 1 pixel
            if (rightSide - leftSide < 1) {
                if (rightSide + 1 > this.chartWidth - (2 * this.xOffset)) {
                    leftSide += -1;
                }
                else {
                    rightSide += 1;
                }
            }
            this.brushElem.call(this.brush.move, [leftSide, rightSide]);
        }
    };
    LineChart.prototype.findClosestValidTime = function (rawMillis) {
        var minDiff = Infinity;
        return Object.keys(this.chartComponentData.timeMap).reduce(function (closestValue, currValue) {
            var diff = Math.abs(Number(currValue) - rawMillis);
            if (diff < minDiff) {
                minDiff = diff;
                return Number(currValue);
            }
            return closestValue;
        }, Infinity);
    };
    LineChart.prototype.getMarkerMarginLeft = function () {
        var legendWidth = this.legendObject.legendElement.node().getBoundingClientRect().width;
        return this.chartMargins.left + (this.chartOptions.legend === "shown" || this.chartOptions.legend === "hidden" ? legendWidth : 0) +
            (this.chartOptions.legend === "shown" ? this.GUTTERWIDTH : 0);
    };
    LineChart.prototype.exportMarkers = function () {
        var _this = this;
        this.chartOptions.markers = Object.keys(this.markerGuidMap)
            .filter(function (markerGuid) { return !_this.activeMarker || _this.activeMarker.getGuid() !== markerGuid; })
            .map(function (markerGuid) { return [_this.markerGuidMap[markerGuid].getMillis(), _this.markerGuidMap[markerGuid].getLabelText()]; });
        this.chartOptions.onMarkersChange(this.chartOptions.markers);
    };
    LineChart.prototype.createOnMarkerChange = function (markerGuid, marker) {
        var _this = this;
        return function (isDeleting, droppedMarker, shouldSort) {
            if (shouldSort === void 0) { shouldSort = true; }
            if (droppedMarker) {
                _this.markerGuidMap[markerGuid] = marker;
            }
            else if (isDeleting) {
                delete _this.markerGuidMap[markerGuid];
                //set focus to first marker if markers exist on delete
                var visibleMarkers = Object.values(_this.markerGuidMap).filter(function (marker) {
                    return marker.isMarkerInRange();
                });
                if (visibleMarkers.length !== 0) {
                    visibleMarkers[0].focusCloseButton();
                }
                else {
                    _this.focusOnEllipsis();
                }
            }
            _this.exportMarkers();
            if (shouldSort)
                _this.sortMarkers();
        };
    };
    LineChart.prototype.renderMarker = function (marker, millis, onChange, labelText, isSeriesLabels) {
        if (onChange === void 0) { onChange = null; }
        if (labelText === void 0) { labelText = null; }
        if (isSeriesLabels === void 0) { isSeriesLabels = false; }
        marker.render(millis, this.chartOptions, this.chartComponentData, {
            chartMargins: this.chartMargins,
            x: this.x,
            marginLeft: this.getMarkerMarginLeft(),
            colorMap: this.colorMap,
            yMap: this.yMap,
            onChange: onChange,
            chartHeight: this.height,
            isDropping: false,
            labelText: labelText,
            isSeriesLabels: isSeriesLabels
        });
    };
    LineChart.prototype.sortMarkers = function () {
        select(this.renderTarget).selectAll(".tsi-markerContainer").sort(function (a, b) {
            return (a.timestamp < b.timestamp) ? 1 : -1;
        });
    };
    LineChart.prototype.getAllLinesTransitionsComplete = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var checkAllLines = function (numberOfAttempts) {
                if (numberOfAttempts === void 0) { numberOfAttempts = 0; }
                if (numberOfAttempts < 5) {
                    setTimeout(function () {
                        var allOutOfTransition = true;
                        select(_this.renderTarget).selectAll('.tsi-gapLine').data().forEach(function (d) {
                            allOutOfTransition = allOutOfTransition && !d.inTransition;
                        });
                        select(_this.renderTarget).selectAll('.tsi-valueLine').data().forEach(function (d) {
                            allOutOfTransition = allOutOfTransition && !d.inTransition;
                        });
                        if (allOutOfTransition) {
                            resolve();
                        }
                        else {
                            checkAllLines(numberOfAttempts + 1);
                        }
                    }, Math.max(_this.TRANSDURATION, 250));
                }
                else {
                    reject();
                }
            };
            checkAllLines(0);
        });
    };
    LineChart.prototype.importMarkers = function () {
        var _this = this;
        if (this.chartOptions.markers && this.chartOptions.markers.length > 0) {
            // delete all the old markers
            if (Object.keys(this.markerGuidMap).length) {
                Object.keys(this.markerGuidMap).forEach(function (guid) {
                    _this.markerGuidMap[guid].destroyMarker();
                    delete _this.markerGuidMap[guid];
                });
            }
            this.markerGuidMap = {};
            this.chartOptions.markers.forEach(function (markerValueTuples, markerIndex) {
                if (markerValueTuples === null || markerValueTuples === undefined) {
                    return;
                }
                var marker = new Marker(_this.renderTarget);
                var markerUID = Utils.guid();
                var markerMillis;
                if (typeof markerValueTuples === 'number') {
                    markerMillis = markerValueTuples;
                    marker.setLabelText(_this.getString('Marker') + " " + (markerIndex + 1));
                }
                else {
                    marker.setLabelText(markerValueTuples[1]);
                    markerMillis = markerValueTuples[0];
                }
                marker.setMillis(markerMillis);
                _this.markerGuidMap[markerUID] = marker;
            });
            this.renderAllMarkers();
            this.sortMarkers();
        }
    };
    LineChart.prototype.createSeriesLabelsMarker = function () {
        this.seriesLabelsMarker = new Marker(this.renderTarget);
    };
    LineChart.prototype.renderSeriesLabelsMarker = function () {
        if (this.chartOptions.labelSeriesWithMarker) {
            this.renderMarker(this.seriesLabelsMarker, this.x.domain()[1], function () { }, null, true);
        }
    };
    LineChart.prototype.renderAllMarkers = function () {
        var _this = this;
        this.getAllLinesTransitionsComplete().then(function () {
            Object.keys(_this.markerGuidMap).forEach(function (guid) {
                var marker = _this.markerGuidMap[guid];
                var onChange = _this.createOnMarkerChange(guid, marker);
                _this.renderMarker(marker, marker.getMillis(), onChange);
            });
            if (_this.seriesLabelsMarker) {
                _this.renderSeriesLabelsMarker();
            }
        });
    };
    LineChart.prototype.focusOnEllipsis = function () {
        if (this.ellipsisContainer !== null) {
            this.ellipsisContainer.select(".tsi-ellipsisButton").node().focus();
        }
    };
    LineChart.prototype.voronoiExists = function () {
        return (this.getVisibleNumerics() !== 0);
    };
    LineChart.prototype.voronoiMousemove = function (mouseEvent) {
        if (!this.filteredValueExist() || !this.voronoiExists())
            return;
        this.mx = mouseEvent[0];
        this.my = mouseEvent[1];
        var mx = mouseEvent[0], my = mouseEvent[1];
        var site = this.voronoiDiagram.find(this.mx, this.my);
        if (!this.isDroppingMarker) {
            this.voronoiMouseover(site.data);
        }
        else {
            var rawTime = this.x.invert(mx);
            var closestTime = Utils.findClosestTime(rawTime.valueOf(), this.chartComponentData.timeMap);
            this.renderMarker(this.activeMarker, closestTime);
            return;
        }
        if (site.data.aggregateKey !== this.focusedAggKey || site.data.splitBy !== this.focusedSplitby) {
            var selectedFilter = Utils.createValueFilter(site.data.aggregateKey, site.data.splitBy);
            this.focusMarkerLabel(selectedFilter, site.data.aggregateKey, site.data.splitBy);
            this.focusOnlyHoveredSeries(site.data.aggregateKey, site.data.splitBy, true);
        }
    };
    LineChart.prototype.voronoiContextMenu = function (mouseEvent) {
        if (!this.filteredValueExist() || !this.voronoiExists())
            return;
        var _a = mouse(mouseEvent), mx = _a[0], my = _a[1];
        var site = this.voronoiDiagram.find(mx, my);
        if (this.chartComponentData.displayState[site.data.aggregateKey].contextMenuActions &&
            this.chartComponentData.displayState[site.data.aggregateKey].contextMenuActions.length) {
            var mousePosition = mouse(this.targetElement.node());
            var sitePageCoords = void 0;
            if (this.hasBrush) {
                sitePageCoords = this.brushElem.node().getBoundingClientRect();
            }
            else {
                sitePageCoords = this.voronoiRegion.node().getBoundingClientRect();
            }
            var eventSite = { pageX: sitePageCoords.left + site[0], pageY: sitePageCoords.top + site[1] - 12 };
            event.preventDefault();
            this.contextMenu.draw(this.chartComponentData, this.renderTarget, this.chartOptions, mousePosition, site.data.aggregateKey, site.data.splitBy, null, site.data.dateTime, null, eventSite);
            if (this.brushContextMenu) {
                this.brushContextMenu.hide();
            }
            this.voronoiMouseover(site.data);
        }
    };
    LineChart.prototype.voronoiClick = function (mouseEvent) {
        var _this = this;
        //supress if the context menu is visible
        if (this.contextMenu && this.contextMenu.contextMenuVisible)
            return;
        if (!this.filteredValueExist() || !this.voronoiExists())
            return;
        if (this.brushElem && !this.isDroppingMarker)
            return;
        var _a = mouse(mouseEvent), mx = _a[0], my = _a[1];
        var site = this.voronoiDiagram.find(mx, my);
        var cDO = this.getCDOFromAggKey(site.data.aggregateKey);
        if (!this.isDroppingMarker) {
            if (site.data && cDO.onElementClick !== null) {
                cDO.onElementClick(site.data.aggregateKey, site.data.splitBy, site.data.dateTime.toISOString(), site.data.measures);
            }
            else {
                if (this.chartComponentData.stickiedKey !== null) {
                    site = this.voronoiDiagram.find(mx, my);
                    this.voronoiMousemove(site.data);
                    this.unstickySeries(site.data.aggregateKey, site.data.splitBy);
                    return;
                }
                this.stickySeries(site.data.aggregateKey, site.data.splitBy);
            }
        }
        else {
            if (!this.hasBrush) {
                this.isDroppingMarker = false;
            }
        }
        this.destroyMarkerInstructions();
        if (Utils.safeNotNullOrUndefined(function () { return _this.activeMarker; })) {
            this.activeMarker.onChange(false, true);
            this.exportMarkers();
            this.activeMarker = null;
        }
    };
    LineChart.prototype.getValueOfVisible = function (d) {
        return Utils.getValueOfVisible(d, this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy));
    };
    LineChart.prototype.brushBrush = function () {
        var handleHeight = this.getHandleHeight();
        this.brushElem.selectAll('.handle')
            .attr('height', handleHeight)
            .attr('y', (this.chartHeight - handleHeight) / 2);
        if (!event.sourceEvent) {
            return;
        }
        if (event.sourceEvent && event.sourceEvent.type === 'mousemove') {
            this.brushElem.select(".selection").attr("visibility", "visible");
            //check boundary conditions for width of the brush
            if (event.selection[1] - event.selection[0] < this.minBrushWidth) {
                return;
            }
            else {
                this.brushElem.selectAll(".handle").attr("visibility", "visible");
            }
        }
        if (this.surpressBrushTimeSet == true) {
            this.surpressBrushTimeSet = false;
            return;
        }
        if (!event.selection)
            return;
        if (this.contextMenu)
            this.contextMenu.hide();
        if (this.brushContextMenu)
            this.brushContextMenu.hide();
        var newBrushStartPosition = event.selection[0];
        var newBrushEndPosition = event.selection[1];
        if (newBrushStartPosition != this.brushStartPosition) {
            this.brushStartTime = this.x.invert(event.selection[0]);
            this.brushStartPosition = newBrushStartPosition;
        }
        if (newBrushEndPosition != this.brushEndPosition) {
            this.brushEndTime = this.x.invert(event.selection[1]);
            this.brushEndPosition = newBrushEndPosition;
        }
        if (this.chartOptions.brushMoveAction) {
            this.chartOptions.brushMoveAction(this.brushStartTime, this.brushEndTime);
        }
    };
    LineChart.prototype.brushEnd = function (mouseEvent) {
        var _this = this;
        if (this.isClearingBrush) {
            this.isClearingBrush = false;
            if (this.brushContextMenu) {
                this.brushContextMenu.hide();
            }
            return;
        }
        if (event && event.selection == null && event.sourceEvent && event.sourceEvent.type == "mouseup" && this.chartOptions.minBrushWidth == 0) {
            if (this.brushContextMenu) {
                this.brushContextMenu.hide();
            }
            var _a = mouse(mouseEvent), mx = _a[0], my = _a[1];
            var site = this.voronoiDiagram.find(mx, my);
            var isClearingBrush = (this.brushStartPosition !== null) && (this.brushEndPosition !== null);
            if (this.chartComponentData.stickiedKey !== null && !this.isDroppingMarker && !isClearingBrush) {
                this.chartComponentData.stickiedKey = null;
                this.legendObject.legendElement.selectAll('.tsi-splitByLabel').classed("stickied", false);
                // recompute voronoi with no sticky
                this.voronoiDiagram = this.voronoi(this.getFilteredAndSticky(this.chartComponentData.allValues));
                site = this.voronoiDiagram.find(mx, my);
                this.voronoiMousemove(site.data);
                this.chartOptions.onUnsticky(site.data.aggregateKey, site.data.splitBy);
                return;
            }
            this.brushStartTime = null;
            this.brushEndTime = null;
            this.brushStartPosition = null;
            this.brushEndPosition = null;
            if (!this.isDroppingMarker && !isClearingBrush && !(this.contextMenu && this.contextMenu.contextMenuVisible)) {
                this.stickySeries(site.data.aggregateKey, site.data.splitBy);
            }
            else {
                this.isDroppingMarker = false;
            }
            return;
        }
        if (event.selection == null) {
            if (!this.chartOptions.brushClearable) {
                select(mouseEvent).transition().call(event.target.move, [this.x(this.brushStartTime), this.x(this.brushEndTime)]);
            }
            return;
        }
        var transformCall = null; //if the brush needs to be transformed due to snap brush or it being too small, this is envoked
        var isZeroWidth = false; //clear the brush context menu if the brush has 0 width
        if (this.chartOptions.snapBrush) {
            //find the closest possible value and set to that
            if (this.possibleTimesArray.length > 0) {
                var findClosestTime = function (rawXValue) {
                    var closestDate = null;
                    _this.possibleTimesArray.reduce(function (prev, curr) {
                        var prospectiveDiff = Math.abs(rawXValue - _this.x(curr));
                        var currBestDiff = Math.abs(rawXValue - prev);
                        if (prospectiveDiff < currBestDiff) {
                            closestDate = curr;
                            return _this.x(curr);
                        }
                        return prev;
                    }, Infinity);
                    return closestDate;
                };
                var newBrushStartTime = findClosestTime(event.selection[0]);
                var newBrushEndTime = findClosestTime(event.selection[1]);
                if (newBrushStartTime != this.brushStartTime || newBrushEndTime != this.brushEndTime) {
                    this.brushStartTime = newBrushStartTime;
                    this.brushEndTime = newBrushEndTime;
                    this.brushStartPosition = this.x(this.brushStartTime);
                    this.brushEndPosition = this.x(this.brushEndTime);
                    transformCall = function () { return select(mouseEvent).transition().call(event.target.move, [_this.x(_this.brushStartTime), _this.x(_this.brushEndTime)]); };
                    isZeroWidth = this.x(this.brushStartTime) == this.x(this.brushEndTime);
                }
            }
        }
        if (event.selection[1] - event.selection[0] < this.minBrushWidth) {
            var rightSide_1 = Math.min(event.selection[0] + this.minBrushWidth, this.x.range()[1]);
            transformCall = function () { return select(mouseEvent).transition().call(event.target.move, [rightSide_1 - _this.minBrushWidth, rightSide_1]); };
            isZeroWidth = (rightSide_1 - this.minBrushWidth == rightSide_1);
        }
        if (this.chartOptions.brushMoveEndAction && (event.sourceEvent && event.sourceEvent.type == 'mouseup')) {
            this.chartOptions.brushMoveEndAction(this.brushStartTime, this.brushEndTime);
        }
        if (this.chartOptions.brushContextMenuActions && this.chartOptions.autoTriggerBrushContextMenu &&
            (event.sourceEvent && event.sourceEvent.type == 'mouseup')) {
            if (!this.chartOptions.brushContextMenuActions || this.chartOptions.brushContextMenuActions.length == 0)
                return;
            var mousePosition = mouse(this.targetElement.node());
            //constrain the mouse position to the renderTarget
            var boundingCRect = this.targetElement.node().getBoundingClientRect();
            var correctedMousePositionX = Math.min(boundingCRect.width, Math.max(mousePosition[0], 0));
            var correctedMousePositionY = Math.min(boundingCRect.height, Math.max(mousePosition[1], 0));
            var correctedMousePosition = [correctedMousePositionX, correctedMousePositionY];
            this.brushContextMenu.draw(this.chartComponentData, this.renderTarget, this.chartOptions, correctedMousePosition, null, null, null, this.brushStartTime, this.brushEndTime);
        }
        if (transformCall) {
            transformCall();
            if (this.brushContextMenu && isZeroWidth) {
                this.brushContextMenu.hide();
            }
        }
    };
    LineChart.prototype.focusMarkerLabel = function (filterFunction, aggKey, splitBy) {
        Utils.revertAllSubtitleText(select(this.renderTarget).selectAll(".tsi-markerValue"), .2);
        select(this.renderTarget).selectAll(".tsi-markerValue")
            .filter(filterFunction)
            .style("opacity", 1)
            .classed('tsi-isExpanded', true)
            .each(function () {
            Utils.setSeriesLabelSubtitleText(select(this).selectAll('.tsi-tooltipSubtitle'), true);
        });
        select(this.renderTarget).selectAll(".tsi-markerContainer").each(function () {
            select(this).selectAll(".tsi-markerValue").sort(function (a, b) {
                return (a.aggregateKey == aggKey && (splitBy == null || splitBy == a.splitBy)) ? 1 : -1;
            });
        });
    };
    LineChart.prototype.drawBrushRange = function () {
        if (this.chartOptions.brushRangeVisible) {
            if (this.targetElement.select('.tsi-rangeTextContainer').empty() && (this.brushStartTime || this.brushEndTime)) {
                var rangeTextContainer = this.targetElement.append("div")
                    .attr("class", "tsi-rangeTextContainer");
            }
            this.updateBrushRange();
        }
    };
    LineChart.prototype.getSVGLeftOffset = function () {
        return this.chartOptions.legend === 'shown' ? (this.width - this.svgSelection.node().getBoundingClientRect().width) : 0;
    };
    LineChart.prototype.updateBrushRange = function () {
        var svgLeftOffset = this.getSVGLeftOffset();
        if (!(this.brushStartTime || this.brushEndTime)) {
            this.deleteBrushRange();
            return;
        }
        var rangeText = Utils.rangeTimeFormat(this.brushEndTime.valueOf() - this.brushStartTime.valueOf());
        var rangeTextContainer = this.targetElement.select('.tsi-rangeTextContainer');
        var leftPos = this.chartMargins.left +
            Math.min(Math.max(0, this.x(this.brushStartTime)), this.x.range()[1]) + svgLeftOffset;
        var rightPos = this.chartMargins.left +
            Math.min(Math.max(0, this.x(this.brushEndTime)), this.x.range()[1]) + svgLeftOffset;
        rangeTextContainer
            .text(rangeText)
            .style("left", Math.max(8, Math.round((leftPos + rightPos) / 2)) + "px")
            .style("top", (this.chartMargins.top + this.chartOptions.aggTopMargin) + 'px');
        if (this.chartOptions.color) {
            rangeTextContainer
                .style('background-color', this.chartOptions.color)
                .style('color', 'white');
        }
        var calcedWidth = rangeTextContainer.node().getBoundingClientRect().width;
        if (this.chartOptions.isCompact && (rightPos - leftPos) < calcedWidth) {
            rangeTextContainer.style('visibility', 'hidden');
        }
        else {
            rangeTextContainer.style('visibility', 'visible');
        }
    };
    LineChart.prototype.deleteBrushRange = function () {
        this.targetElement.select('.tsi-rangeTextContainer').remove();
    };
    LineChart.prototype.getYExtents = function () {
        return this.chartComponentData.yExtents;
    };
    LineChart.prototype.clearBrush = function () {
        this.svgSelection.select('.svgGroup').select(".brushElem").call(this.brush.move, null);
        this.deleteBrushRange();
        if (this.brushContextMenu) {
            this.brushContextMenu.hide();
        }
    };
    LineChart.prototype.getVisibleNumerics = function () {
        var _this = this;
        var visibleGroups = this.data.filter(function (agg) { return _this.chartComponentData.displayState[agg.aggKey]["visible"]; });
        var visibleCDOs = this.aggregateExpressionOptions.filter(function (cDO) { return _this.chartComponentData.displayState[cDO.aggKey]["visible"]; });
        return visibleGroups.filter(function (aggKey, i) {
            return visibleCDOs[i].dataType === DataTypes.Numeric;
        }).length;
    };
    LineChart.prototype.getSwimlaneOffsets = function (linechartTopPadding, visibleGroups, visibleCDOs, heightPerNumeric, swimLaneSet) {
        var _this = this;
        var cumulativeOffset = LINECHARTTOPPADDING;
        //initialize to null and set while going through swimLanes
        var visibleGroupEndValues = visibleGroups.map(function () { return null; });
        Object.keys(swimLaneSet).sort(function (a, b) { return (Number(a) <= Number(b) ? -1 : 1); }).forEach(function (swimLaneStr) {
            // find all numerics and set to cumulative offset/height per non numeric
            var swimlane = Number(swimLaneStr);
            var hasNumeric = false;
            visibleCDOs.forEach(function (aggGroup, i) {
                if (aggGroup.swimLane === swimlane && aggGroup.dataType === DataTypes.Numeric) {
                    hasNumeric = true;
                    visibleGroupEndValues[i] = [cumulativeOffset, heightPerNumeric];
                }
            });
            // find all non-numerics and set their offset/heights
            var swimLaneOffset = hasNumeric ? heightPerNumeric : 0;
            if (_this.chartOptions.swimLaneOptions && _this.chartOptions.swimLaneOptions[swimlane] && _this.chartOptions.swimLaneOptions[swimlane].collapseEvents) {
                swimLaneOffset += _this.getEventsCollapsedSwimlaneHeight(visibleCDOs, swimlane);
                visibleCDOs.forEach(function (aggGroup, i) {
                    if (aggGroup.swimLane === swimlane) {
                        visibleGroupEndValues[i] = [cumulativeOffset, _this.getEventsCollapsedSwimlaneHeight(visibleCDOs, swimlane)];
                    }
                });
            }
            else {
                visibleCDOs.forEach(function (aggGroup, i) {
                    if (aggGroup.swimLane === swimlane && aggGroup.dataType !== DataTypes.Numeric) {
                        var currGroupsHeight_1 = Utils.getNonNumericHeight(aggGroup.height);
                        visibleGroupEndValues[i] = [swimLaneOffset + cumulativeOffset, currGroupsHeight_1];
                        swimLaneOffset += currGroupsHeight_1;
                    }
                });
            }
            cumulativeOffset += swimLaneOffset;
        });
        return visibleGroupEndValues;
    };
    LineChart.prototype.setSwimLaneYExtents = function (visibleGroups, visibleCDOs, swimLanes) {
        var _this = this;
        var extents = {};
        swimLanes.forEach(function (lane) {
            var extent$1 = [];
            visibleGroups.forEach(function (aggGroup, i) {
                var cDO = visibleCDOs[i];
                if (cDO.dataType !== DataTypes.Numeric) {
                    return;
                }
                var aggValues = [];
                if (cDO.swimLane === lane) {
                    var aggKey_1 = cDO.aggKey;
                    Object.keys(_this.chartComponentData.visibleTAs[aggKey_1]).forEach(function (splitBy) {
                        aggValues = aggValues.concat(_this.chartComponentData.visibleTAs[aggKey_1][splitBy]);
                    });
                    var yExtent = _this.getYExtent(aggValues, _this.chartComponentData.displayState[aggKey_1].includeEnvelope ?
                        _this.chartComponentData.displayState[aggKey_1].includeEnvelope :
                        _this.chartOptions.includeEnvelope, aggKey_1);
                    extent$1 = extent(yExtent.concat(extent$1));
                    extents[lane] = extent$1;
                }
            });
        });
        this.swimlaneYExtents = extents;
    };
    LineChart.prototype.getEventsCollapsedSwimlaneHeight = function (visibleCDOs, swimlane) {
        // if a swimlane has collapsed events, the events height impact is the largest height of a visible events group in the swimlane
        var rawHeight = visibleCDOs.reduce(function (tallest, currGroup) {
            if (currGroup.dataType === DataTypes.Events && currGroup.swimLane === swimlane) {
                return Math.max(tallest, currGroup.height);
            }
            return tallest;
        }, 0);
        return rawHeight !== 0 ? Utils.getNonNumericHeight(rawHeight) : 0;
    };
    //returns an array of tuples of y offset and height for each visible aggregate group 
    LineChart.prototype.createYOffsets = function () {
        var _this = this;
        var visibleGroups = this.data.filter(function (agg) { return _this.chartComponentData.displayState[agg.aggKey]["visible"]; });
        var visibleCDOs = this.aggregateExpressionOptions.filter(function (cDO) { return _this.chartComponentData.displayState[cDO.aggKey]["visible"]; });
        var visibleNumericCount;
        var swimLaneSet = {};
        visibleCDOs.forEach(function (aEO, i) {
            if (aEO.swimLane === null) {
                aEO.swimLane = i + 1;
            }
        });
        visibleCDOs.forEach(function (cDO) {
            swimLaneSet[cDO.swimLane] = swimLaneSet[cDO.swimLane] || (cDO.dataType === DataTypes.Numeric);
        });
        visibleNumericCount = Object.keys(swimLaneSet).reduce(function (visibleCount, swimLane) {
            return visibleCount + (swimLaneSet[swimLane] ? 1 : 0);
        }, 0);
        var countNumericLanes = visibleNumericCount;
        var linechartTopPadding = this.chartOptions.isArea ? 0 : LINECHARTTOPPADDING;
        var useableHeight = this.chartHeight - linechartTopPadding;
        var fixedEventsHeight = 0;
        if (this.chartOptions.swimLaneOptions) {
            Object.keys(this.chartOptions.swimLaneOptions).forEach(function (swimlaneKey) {
                var swimlane = Number(swimlaneKey);
                var sLO = _this.chartOptions.swimLaneOptions[swimlane];
                if (sLO.collapseEvents) {
                    var swimlaneHeight = _this.getEventsCollapsedSwimlaneHeight(visibleCDOs, swimlane);
                    fixedEventsHeight += swimlaneHeight;
                }
            });
        }
        var heightNonNumeric = visibleCDOs.reduce(function (sumPrevious, currGroup, i) {
            if (currGroup.dataType === DataTypes.Events && _this.chartOptions.swimLaneOptions && _this.chartOptions.swimLaneOptions[currGroup.swimLane] && _this.chartOptions.swimLaneOptions[currGroup.swimLane].collapseEvents) {
                return sumPrevious;
            }
            return sumPrevious + (currGroup.dataType !== DataTypes.Numeric ? Utils.getNonNumericHeight(currGroup.height) : 0);
        }, 0);
        heightNonNumeric += fixedEventsHeight;
        var heightPerNumeric = (useableHeight - heightNonNumeric) / countNumericLanes;
        this.setSwimLaneYExtents(visibleGroups, visibleCDOs, Object.keys(swimLaneSet).filter(function (lane) { return swimLaneSet[lane]; }).map(function (stringLane) { return Number(stringLane); }));
        return this.getSwimlaneOffsets(linechartTopPadding, visibleGroups, visibleCDOs, heightPerNumeric, swimLaneSet);
    };
    LineChart.prototype.heightNonNumeric = function () {
        var _this = this;
        var visibleCDOs = this.aggregateExpressionOptions.filter(function (agg) { return _this.chartComponentData.displayState[agg.aggKey]["visible"]; });
        return visibleCDOs.reduce(function (sumPrevious, currGroup) {
            return sumPrevious + (currGroup.dataType !== DataTypes.Numeric ? Utils.getNonNumericHeight(currGroup.height) : 0);
        }, 0);
    };
    LineChart.prototype.getGroupYExtent = function (aggKey, aggVisible, aggValues, yExtent) {
        if ((this.chartOptions.yAxisState === YAxisStates.Shared) || (Object.keys(this.chartComponentData.timeArrays)).length < 2 || !aggVisible) {
            yExtent = this.getYExtent(this.chartComponentData.allNumericValues, this.chartComponentData.displayState[aggKey].includeEnvelope ?
                this.chartComponentData.displayState[aggKey].includeEnvelope :
                this.chartOptions.includeEnvelope, null);
        }
        else if (this.chartComponentData.aggHasVisibleSplitBys(aggKey)) {
            yExtent = this.getYExtent(aggValues, this.chartComponentData.displayState[aggKey].includeEnvelope ?
                this.chartComponentData.displayState[aggKey].includeEnvelope :
                this.chartOptions.includeEnvelope, aggKey);
        }
        else {
            yExtent = [0, 1];
        }
        return yExtent;
    };
    LineChart.prototype.getAggAxisType = function (agg) {
        if (this.chartOptions.yAxisState === YAxisStates.Stacked) {
            if (this.chartOptions.swimLaneOptions && this.chartOptions.swimLaneOptions[agg.swimLane] && this.chartOptions.swimLaneOptions[agg.swimLane].yAxisType) {
                return this.chartOptions.swimLaneOptions[agg.swimLane].yAxisType;
            }
            else {
                return YAxisStates.Shared;
            }
        }
        return this.chartOptions.yAxisState;
    };
    LineChart.prototype.adjustSwimLanes = function () {
        if (this.chartOptions.yAxisState === YAxisStates.Shared || this.chartOptions.yAxisState === YAxisStates.Overlap) {
            this.aggregateExpressionOptions.forEach(function (aEO) {
                aEO.swimLane = 0;
            });
            this.chartOptions.swimLaneOptions = { 0: { yAxisType: this.chartOptions.yAxisState } };
        }
        else {
            var minimumPresentSwimLane_1 = this.aggregateExpressionOptions.reduce(function (currMin, aEO) {
                return Math.max(aEO.swimLane, currMin);
            }, 0);
            this.aggregateExpressionOptions.forEach(function (aEO) {
                if (aEO.swimLane === null) {
                    aEO.swimLane = ++minimumPresentSwimLane_1;
                }
            });
        }
    };
    LineChart.prototype.overwriteSwimLanes = function () {
        var _this = this;
        this.aggregateExpressionOptions.forEach(function (aEO, i) {
            _this.aggregateExpressionOptions[i].swimLane = _this.originalSwimLanes[i];
        });
        this.chartOptions.swimLaneOptions = this.originalSwimLaneOptions;
    };
    LineChart.prototype.createSwimlaneLabels = function (offsetsAndHeights, visibleCDOs) {
        var _this = this;
        // swimLaneLabels object contains data needed to render each lane label
        var swimLaneLabels = {};
        /*
            The logic below constructs swimlane labels. The first aggregate found in each
            lane is used to position that lanes label. Numeric aggs are prioritized first,
            as they share a y-Axis, meaning only the first numeric in each lane needs to be
            considered.  Next, non-numerics are checked, if they are the first agg found in
            their lane, their position data is used, otherwise, their height is added to the
            current height of the lane.
        */
        var useAggForLaneLabel = function (aggGroup) {
            var _a, _b, _c, _d, _e, _f;
            var swimLane = aggGroup.swimLane;
            var aggIndex = visibleCDOs.findIndex(function (el) { return el.aggKey === aggGroup.aggKey; });
            var onClick = null;
            if (typeof ((_c = (_b = (_a = _this.chartOptions) === null || _a === void 0 ? void 0 : _a.swimLaneOptions) === null || _b === void 0 ? void 0 : _b[swimLane]) === null || _c === void 0 ? void 0 : _c.onClick) === 'function') {
                onClick = function () { var _a, _b, _c, _d; return (_d = (_c = (_b = (_a = _this.chartOptions) === null || _a === void 0 ? void 0 : _a.swimLaneOptions) === null || _b === void 0 ? void 0 : _b[swimLane]) === null || _c === void 0 ? void 0 : _c.onClick) === null || _d === void 0 ? void 0 : _d.call(_c, swimLane); };
            }
            swimLaneLabels[swimLane] = {
                offset: offsetsAndHeights[aggIndex][0],
                height: offsetsAndHeights[aggIndex][1],
                label: (_f = (_e = (_d = _this.chartOptions) === null || _d === void 0 ? void 0 : _d.swimLaneOptions) === null || _e === void 0 ? void 0 : _e[swimLane]) === null || _f === void 0 ? void 0 : _f.label,
                onClick: onClick
            };
        };
        // First add numeric dataTypes (share Y-Axis) to label map
        visibleCDOs.filter(function (aggGroup) { return aggGroup.dataType === DataTypes.Numeric; }).forEach(function (aggGroup) {
            if (!(aggGroup.swimLane in swimLaneLabels)) { // Only add swimlanes once to swimLaneLabels map
                useAggForLaneLabel(aggGroup);
            }
        });
        // Then, map over any non-numeric dataType and increment heights if they're sharing a lane
        visibleCDOs.filter(function (aggGroup) { return aggGroup.dataType !== DataTypes.Numeric; }).forEach(function (aggGroup) {
            var _a, _b, _c;
            var aggIndex = visibleCDOs.findIndex(function (el) { return el.aggKey === aggGroup.aggKey; });
            if (!(aggGroup.swimLane in swimLaneLabels)) { // Only add swimlanes once to swimLaneLabels map
                useAggForLaneLabel(aggGroup);
            }
            else { // if lane contains non-numeric data and is being added to another lane
                if (!((_c = (_b = (_a = _this.chartOptions) === null || _a === void 0 ? void 0 : _a.swimLaneOptions) === null || _b === void 0 ? void 0 : _b[aggGroup.swimLane]) === null || _c === void 0 ? void 0 : _c.collapseEvents)) { // Only increment event heights if collapseEvents === false
                    swimLaneLabels[aggGroup.swimLane].height += offsetsAndHeights[aggIndex][1]; // add heights (non-numerics don't share Y axis)
                }
            }
        });
        // Clear prior labels
        this.swimLaneLabelGroup.selectAll('*').remove();
        // Function to trim labels to max height
        var truncateLabel = function (labelRef, data) {
            var maxHeight = data.height - swimlaneLabelConstants.swimLaneLabelHeightPadding; // padding on actual lane height
            if (data.label) {
                var labelClientRect = labelRef.getBoundingClientRect();
                var labelText = labelRef.textContent;
                while (labelClientRect.height > maxHeight && labelText.length > 0) {
                    labelText = labelText.slice(0, -1);
                    labelRef.textContent = labelText + '...';
                    labelClientRect = labelRef.getBoundingClientRect();
                }
            }
        };
        var boldYAxisText = function (enabled, lane) {
            _this.svgSelection.select('.svgGroup')
                .selectAll(".tsi-swimLaneAxis-" + lane)
                .selectAll('text')
                .classed('tsi-boldYAxisText', enabled);
        };
        var onClickPresentAndValid = function (dp) { return dp.onClick && typeof dp.onClick === 'function'; };
        // Map over swimLanes and create labels
        Object.keys(swimLaneLabels).forEach(function (lane) {
            var labelData = [swimLaneLabels[lane]];
            var label = _this.swimLaneLabelGroup.selectAll("tsi-swimLaneLabel-" + lane).data(labelData);
            label.enter()
                .append("text")
                .attr("class", function (d) { return "tsi-swimLaneLabel-" + lane + " tsi-swimLaneLabel " + (onClickPresentAndValid(d) ? 'tsi-boldOnHover' : ''); })
                .merge(label)
                .style("text-anchor", "middle")
                .attr("transform", function (d) { return "translate(" + (-_this.horizontalLabelOffset + swimlaneLabelConstants.labelLeftPadding) + "," + (d.offset + d.height / 2) + ") rotate(-90)"; })
                .text(function (d) { return d.label; })
                .each(function (d) { truncateLabel(this, d); })
                .on("click", function (d) {
                if (onClickPresentAndValid(d)) {
                    d.onClick();
                }
            })
                .on("mouseover", function (d) {
                if (onClickPresentAndValid(d)) {
                    boldYAxisText(true, lane);
                }
            })
                .on("mouseout", function () {
                boldYAxisText(false, lane);
            })
                .append("svg:title")
                .text(function (d) { return d.label; });
            label.exit().remove();
        });
    };
    LineChart.prototype.render = function (data, options, aggregateExpressionOptions) {
        var _this = this;
        _super.prototype.render.call(this, data, options, aggregateExpressionOptions);
        this.originalSwimLanes = this.aggregateExpressionOptions.map(function (aEO) {
            return aEO.swimLane;
        });
        this.originalSwimLaneOptions = options.swimLaneOptions;
        this.hasBrush = options && (options.brushMoveAction || options.brushMoveEndAction || options.brushContextMenuActions);
        this.chartOptions.setOptions(options);
        this.chartMargins.right = this.chartOptions.labelSeriesWithMarker ? (SERIESLABELWIDTH + 8) : LINECHARTCHARTMARGINS.right;
        this.width = this.getWidth();
        this.height = Math.max(select(this.renderTarget).node().clientHeight, this.MINHEIGHT);
        if (this.chartOptions.legend == "compact")
            this.chartMargins.top = 72;
        else
            this.chartMargins.top = 40;
        if (this.chartOptions.hideChartControlPanel) {
            this.chartMargins.top += -28;
        }
        if (!this.chartOptions.brushRangeVisible && this.targetElement) {
            this.deleteBrushRange();
        }
        if (this.seriesLabelsMarker && !this.chartOptions.labelSeriesWithMarker) {
            this.seriesLabelsMarker.destroyMarker();
            this.seriesLabelsMarker = null;
        }
        this.strokeOpacity = this.chartOptions.isArea ? .55 : 1;
        this.nonFocusStrokeOpactiy = this.chartOptions.isArea ? .55 : .3;
        this.chartComponentData.mergeDataToDisplayStateAndTimeArrays(this.data, this.aggregateExpressionOptions);
        this.chartComponentData.data.forEach(function (d, i) {
            _this.aggregateExpressionOptions[i].aggKey = d.aggKey;
        });
        if (this.chartOptions.xAxisHidden && this.chartOptions.focusHidden) {
            this.chartMargins.bottom = 5;
        }
        this.chartHeight = Math.max(1, this.height - this.chartMargins.bottom - this.chartMargins.top);
        this.chartWidth = this.getChartWidth();
        if (this.brush && this.svgSelection.select('.svgGroup').select(".brushElem") && !this.chartOptions.keepBrush) {
            this.brushStartTime = null;
            this.brushEndTime = null;
            this.brushStartPosition = null;
            this.brushEndPosition = null;
            this.clearBrush();
        }
        if (!this.chartOptions.hideChartControlPanel && this.chartControlsPanel === null) {
            this.chartControlsPanel = Utils.createControlPanel(this.renderTarget, this.legendWidth + (this.GUTTERWIDTH / 2), Math.max((this.chartMargins.top + 12), 0), this.chartOptions);
            var self = this;
            this.hasStackedButton = true;
            this.stackedButton = this.chartControlsPanel.append("button")
                .style("left", "60px")
                .attr("class", "tsi-stackedButton")
                .attr("aria-label", function () { return _this.getString("set axis state to") + ' ' + _this.nextStackedState(); })
                .attr("title", function () { return _this.getString("Change y-axis type"); })
                .attr("type", "button")
                .on("click", function () {
                var _this = this;
                self.overwriteSwimLanes();
                self.render(self.data, __assign(__assign({}, self.chartOptions), { yAxisState: self.nextStackedState() }), self.aggregateExpressionOptions);
                select(this).attr("aria-label", function () { return self.getString("set axis state to") + ' ' + self.nextStackedState(); });
                setTimeout(function () { return select(_this).node().focus(); }, 200);
            });
        }
        else if (this.chartOptions.hideChartControlPanel && this.chartControlsPanel !== null) {
            this.hasStackedButton = false;
            this.removeControlPanel();
        }
        if (this.chartControlsPanel !== null) {
            this.drawEllipsisMenu([{
                    iconClass: "flag",
                    label: this.getString("Drop a Marker"),
                    action: this.addMarker,
                    description: ""
                }]);
            this.chartControlsPanel.style("top", Math.max((this.chartMargins.top - 24), 0) + 'px');
        }
        this.adjustSwimLanes();
        if (this.svgSelection == null) {
            /******************** Static Elements *********************************/
            this.targetElement = select(this.renderTarget)
                .classed("tsi-lineChart", true);
            this.svgSelection = this.targetElement.append("svg")
                .attr("class", "tsi-lineChartSVG tsi-chartSVG")
                .attr('title', this.getString('Line chart'))
                .attr("height", this.height);
            var g = this.svgSelection.append("g")
                .classed("svgGroup", true)
                .attr("transform", "translate(" + this.chartMargins.left + "," + this.chartMargins.top + ")");
            var defs = this.svgSelection.append('defs');
            this.brushElem = null;
            if (this.hasBrush) {
                this.brushElem = g.append("g")
                    .attr("class", "brushElem");
                this.brushElem.classed("hideBrushHandles", !this.chartOptions.brushHandlesVisible);
            }
            else {
                //if there is no brushElem, the voronoi lives here
                this.voronoiRegion = g.append("rect").classed("voronoiRect", true);
            }
            this.focus = g.append("g")
                .attr("transform", "translate(-200,-100)")
                .attr("class", "tsi-focus");
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
            this.focus.append("circle")
                .attr("r", 4);
            this.horizontalValueBox = select(this.renderTarget)
                .append('div')
                .attr('class', 'tsi-horizontalValueBox tsi-chartValueTextBox')
                .style('display', 'none')
                .attr('pointer-events', 'none');
            this.verticalValueBox = select(this.renderTarget)
                .append('div')
                .attr('class', 'tsi-verticalValueBox')
                .style('display', 'none');
            this.horizontalValueBar = this.focus.append('line')
                .attr('y1', 0)
                .attr('y2', 0)
                .attr('class', 'tsi-horizontalValueBar')
                .style('display', 'none');
            this.swimLaneLabelGroup = g.append("g").
                attr("class", "tsi-swimLaneLabels");
            if (!this.tooltip) {
                this.tooltip = new Tooltip(select(this.renderTarget));
            }
            this.draw = function (isFromResize) {
                if (isFromResize === void 0) { isFromResize = false; }
                _this.minBrushWidth = (_this.chartOptions.minBrushWidth) ? _this.chartOptions.minBrushWidth : _this.minBrushWidth;
                _this.focus.attr("visibility", (_this.chartOptions.focusHidden) ? "hidden" : "visible");
                _this.verticalValueBox.style("visibility", (_this.chartOptions.focusHidden) ? "hidden" : "visible");
                _this.horizontalValueBox.style("visibility", (_this.chartOptions.focusHidden) ? "hidden" : "visible");
                if (_this.chartOptions.xAxisHidden && _this.chartOptions.focusHidden) {
                    _this.chartMargins.bottom = 5;
                }
                // Check if any swimlane labels present & modify left margin if so
                var isLabelVisible = false;
                _this.aggregateExpressionOptions.filter(function (aggExpOpt) {
                    return _this.chartComponentData.displayState[aggExpOpt.aggKey]["visible"];
                }).forEach(function (visibleAgg) {
                    var _a, _b;
                    if ((_b = (_a = _this.originalSwimLaneOptions) === null || _a === void 0 ? void 0 : _a[visibleAgg.swimLane]) === null || _b === void 0 ? void 0 : _b.label) {
                        isLabelVisible = true;
                    }
                });
                if (isLabelVisible) {
                    _this.chartMargins.left = _this.horizontalLabelOffset;
                }
                else if (_this.chartMargins.left === _this.horizontalLabelOffset) {
                    _this.chartMargins.left = LINECHARTCHARTMARGINS.left;
                }
                _this.width = Math.max(select(_this.renderTarget).node().clientWidth, _this.MINWIDTH);
                if (!isFromResize) {
                    _this.chartWidth = _this.getChartWidth();
                }
                _this.height = Math.max(select(_this.renderTarget).node().clientHeight, _this.MINHEIGHT);
                _this.chartHeight = Math.max(1, _this.height - _this.chartMargins.bottom - _this.chartMargins.top);
                g.attr("transform", "translate(" + _this.chartMargins.left + "," + _this.chartMargins.top + ")");
                if (_this.brushElem) {
                    _this.brushElem.classed("hideBrushHandles", !_this.chartOptions.brushHandlesVisible);
                }
                _this.focus.select('.tsi-hLine').attr("x2", _this.chartWidth);
                _this.focus.select('.tsi-vLine').attr("y2", _this.chartHeight);
                _this.svgSelection
                    .style("width", _this.getSVGWidth() + "px")
                    .style("height", _this.height + "px");
                _super.prototype.themify.call(_this, _this.targetElement, _this.chartOptions.theme);
                if (!isFromResize) {
                    _this.legendObject.draw(_this.chartOptions.legend, _this.chartComponentData, function (aggKey, splitBy) { _this.labelMouseover(aggKey, splitBy); }, _this.svgSelection, _this.chartOptions, function () {
                        Utils.revertAllSubtitleText(select(_this.renderTarget).selectAll('.tsi-markerValue'));
                    }, _this.stickySeries);
                }
                _this.svgSelection.selectAll(".yAxis").style("visibility", "hidden");
                _this.x = scaleTime()
                    .rangeRound([_this.xOffset, Math.max(_this.xOffset, _this.chartWidth - (2 * _this.xOffset))]);
                _this.y = scaleLinear()
                    .range([Math.max(_this.chartHeight - _this.heightNonNumeric(), _this.chartOptions.aggTopMargin) - LINECHARTTOPPADDING, _this.chartOptions.aggTopMargin]);
                var fromAndTo = _this.chartComponentData.setAllValuesAndVisibleTAs();
                var xExtent = (_this.chartComponentData.allValues.length != 0) ? extent(_this.chartComponentData.allValues, function (d) { return d.dateTime; }) : [0, 1];
                var timeSet = set(_this.chartComponentData.allValues, function (d) { return d.dateTime; });
                var xRange = (_this.chartComponentData.allValues.length != 0) ? Math.max(2, (xExtent[1].valueOf() - xExtent[0].valueOf())) : 2;
                var xOffsetPercentage = _this.xOffset / _this.chartWidth;
                if (_this.chartOptions.timeFrame) {
                    fromAndTo = [new Date(_this.chartOptions.timeFrame[0]), new Date(_this.chartOptions.timeFrame[1])];
                }
                _this.x.domain(fromAndTo);
                _this.xLowerBound = _this.x(fromAndTo[0]);
                _this.xUpperBound = _this.x(fromAndTo[1]);
                //allPossibleTimes -> a combination of the beginning and end of buckets
                _this.chartComponentData.setTimeMap();
                var startOfBuckets = _this.chartComponentData.allValues.map(function (d) { return d.dateTime; });
                var endOfBuckets = _this.chartComponentData.allValues.filter(function (d) { return d.bucketSize != null; })
                    .map(function (d) { return new Date(d.dateTime.valueOf() + d.bucketSize); });
                var allPossibleTimes = startOfBuckets.concat(endOfBuckets);
                var timeSet = set(allPossibleTimes);
                _this.possibleTimesArray = timeSet.values().sort().map(function (ts) {
                    return new Date(ts);
                });
                if (_this.voronoiRegion) {
                    _this.voronoiRegion.attr("x", xOffsetPercentage * _this.chartWidth)
                        .attr("y", _this.chartOptions.aggTopMargin)
                        .attr("width", _this.chartWidth - (xOffsetPercentage * _this.chartWidth * 2))
                        .attr("height", _this.chartHeight);
                }
                if (_this.brushElem) {
                    var self = _this;
                    _this.brush = brushX()
                        .extent([[_this.xLowerBound, Math.min(_this.chartHeight, _this.chartOptions.aggTopMargin)],
                        [_this.xUpperBound, _this.chartHeight]])
                        .on("start", function () {
                        if (self.activeMarker !== null && self.isDroppingMarker) {
                            self.voronoiClick(this);
                        }
                        var handleHeight = self.getHandleHeight();
                        self.brushElem.selectAll('.handle')
                            .attr('height', handleHeight)
                            .attr('y', (self.chartHeight - handleHeight) / 2)
                            .attr('rx', '4px')
                            .attr('ry', '4px');
                    })
                        .on("brush", function () {
                        self.brushBrush();
                        self.drawBrushRange();
                    })
                        .on("end", function () {
                        self.brushEnd(this);
                        self.drawBrushRange();
                    });
                    _this.brushElem.call(_this.brush);
                    _this.setBrush();
                }
                var yExtent = _this.getYExtent(_this.chartComponentData.allValues, false, null);
                var yRange = (yExtent[1] - yExtent[0]) > 0 ? yExtent[1] - yExtent[0] : 1;
                var yOffsetPercentage = _this.chartOptions.isArea ? (1.5 / _this.chartHeight) : (10 / _this.chartHeight);
                _this.y.domain([yExtent[0] - (yRange * yOffsetPercentage), yExtent[1] + (yRange * (10 / _this.chartHeight))]);
                if (_this.chartOptions.isArea) {
                    _this.areaPath = area()
                        .curve(_this.chartOptions.interpolationFunction)
                        .defined(function (d) {
                        return (d.measures !== null) &&
                            (d.measures[_this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy)] !== null);
                    })
                        .x(function (d) {
                        return _this.getXPosition(d, _this.x);
                    })
                        .y0(function (d) {
                        return d.measures ? _this.y(d.measures[_this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy)]) : 0;
                    })
                        .y1(_this.chartHeight);
                }
                if (!_this.chartOptions.xAxisHidden) {
                    _this.xAxis = g.selectAll(".xAxis").data([_this.x]);
                    _this.drawXAxis(_this.chartHeight);
                    _this.xAxis.exit().remove();
                    var xAxisBaseline = g.selectAll(".xAxisBaseline").data([_this.x]);
                    var xAxisBaselineEntered = xAxisBaseline.enter().append("line")
                        .attr("class", "xAxisBaseline")
                        .attr("x1", .5)
                        .merge(xAxisBaseline)
                        .attr("y2", _this.chartHeight + .5)
                        .attr("y1", _this.chartHeight + .5)
                        .attr("x2", _this.chartWidth - _this.xOffset);
                    xAxisBaseline.exit().remove();
                }
                if (g.selectAll(".xAxis").size() !== 0) {
                    g.selectAll(".xAxis").style("visibility", ((!_this.chartOptions.xAxisHidden) ? "visible" : "hidden"));
                }
                /******************** Draw Line and Points ************************/
                _this.visibleAggCount = Object.keys(_this.chartComponentData.timeArrays).reduce(function (count, aggKey) {
                    return count + (_this.chartComponentData.displayState[aggKey]['visible'] ? 1 : 0);
                }, 0);
                _this.yMap = {};
                _this.colorMap = {};
                _this.svgSelection.selectAll(".yAxis").remove();
                var visibleGroupData = _this.chartComponentData.data.filter(function (agg) { return _this.chartComponentData.displayState[agg.aggKey]["visible"]; });
                var visibleCDOs = _this.aggregateExpressionOptions.filter(function (cDO) {
                    return _this.chartComponentData.displayState[cDO.aggKey]["visible"];
                });
                var offsetsAndHeights = _this.createYOffsets();
                // Add swimlane labels to SVG
                _this.createSwimlaneLabels(offsetsAndHeights, visibleCDOs);
                var swimLaneCounts = {};
                // Reset public facing yExtents
                _this.chartComponentData.resetYExtents();
                var aggregateGroups = _this.svgSelection.select('.svgGroup').selectAll('.tsi-aggGroup')
                    .data(visibleCDOs, function (agg) { return agg.aggKey; });
                var self = _this;
                var visibleNumericI = 0;
                aggregateGroups.enter()
                    .append('g')
                    .classed('tsi-aggGroup', true)
                    .merge(aggregateGroups)
                    .transition()
                    .duration((_this.chartOptions.noAnimate) ? 0 : self.TRANSDURATION)
                    .ease(easeExp)
                    .attr('transform', function (agg, i) {
                    return self.chartOptions.isArea ? null : 'translate(0,' + offsetsAndHeights[i][0] + ')';
                })
                    .each(function (agg, i) {
                    var _a, _b, _c;
                    var yExtent;
                    var aggVisible = true;
                    var aggValues = [];
                    var aggKey = agg.aggKey;
                    Object.keys(self.chartComponentData.visibleTAs[aggKey]).forEach(function (splitBy) {
                        aggValues = aggValues.concat(self.chartComponentData.visibleTAs[aggKey][splitBy]);
                    });
                    yExtent = self.getGroupYExtent(aggKey, aggVisible, aggValues, yExtent);
                    if (self.plotComponents[aggKey] === undefined || self.mismatchingChartType(aggKey)) {
                        var g_1 = select(this);
                        delete self.plotComponents[aggKey];
                        g_1.selectAll('*').remove();
                        self.plotComponents[aggKey] = self.createPlot(g_1, i, visibleCDOs);
                    }
                    var mouseoverFunction = self.getMouseoverFunction(visibleCDOs[i].dataType);
                    var mouseoutFunction = self.getMouseoutFunction(visibleCDOs[i].dataType);
                    var positionInGroup = visibleNumericI;
                    if (self.getAggAxisType(agg) === YAxisStates.Shared) {
                        yExtent = self.swimlaneYExtents[agg.swimLane];
                    }
                    // Update yExtent index in LineChartData after all local yExtent updates (this is public facing yExtent)
                    // Only update if dataType is numeric
                    if (agg.dataType === 'numeric') {
                        var idx = self.aggregateExpressionOptions.findIndex(function (el) { return el.aggKey === aggKey; });
                        self.chartComponentData.setYExtents(idx, yExtent);
                    }
                    //should count all as same swim lane when not in stacked.
                    var swimLane = agg.swimLane;
                    var offsetImpact = (agg.dataType === DataTypes.Numeric) ? 1 : 0;
                    if (swimLaneCounts[swimLane]) {
                        positionInGroup = swimLaneCounts[swimLane];
                        swimLaneCounts[swimLane] += offsetImpact;
                    }
                    else {
                        positionInGroup = 0;
                        swimLaneCounts[swimLane] = offsetImpact;
                    }
                    var axisState = new AxisState(self.getAggAxisType(agg), yExtent, positionInGroup);
                    var yAxisOnClick = null;
                    if (typeof ((_c = (_b = (_a = self.chartOptions) === null || _a === void 0 ? void 0 : _a.swimLaneOptions) === null || _b === void 0 ? void 0 : _b[swimLane]) === null || _c === void 0 ? void 0 : _c.onClick) === 'function') {
                        yAxisOnClick = function () { var _a, _b; return (_b = (_a = self.chartOptions.swimLaneOptions[swimLane]).onClick) === null || _b === void 0 ? void 0 : _b.call(_a, swimLane); };
                    }
                    self.plotComponents[aggKey].render(self.chartOptions, visibleNumericI, agg, true, select(this), self.chartComponentData, axisState, self.chartHeight, self.visibleAggCount, self.colorMap, self.previousAggregateData, self.x, self.areaPath, self.strokeOpacity, self.y, self.yMap, defs, visibleCDOs[i], self.previousIncludeDots, offsetsAndHeights[i], g, mouseoverFunction, mouseoutFunction, yAxisOnClick);
                    //increment index of visible numerics if appropriate
                    visibleNumericI += (visibleCDOs[i].dataType === DataTypes.Numeric ? 1 : 0);
                });
                aggregateGroups.exit().remove();
                /******************** Voronoi diagram for hover action ************************/
                _this.voronoi = voronoi()
                    .x(function (d) {
                    return (d.bucketSize != undefined ? self.x(new Date(d.dateTime.valueOf() + (d.bucketSize / 2))) : self.x(d.dateTime));
                })
                    .y(function (d) {
                    if (d.measures) {
                        return self.yMap[d.aggregateKey] ? self.yMap[d.aggregateKey](self.getValueOfVisible(d)) : null;
                    }
                    return null;
                })
                    .extent([[0, 0], [_this.chartWidth, _this.chartHeight]]);
                //if brushElem present then use the overlay, otherwise create a rect to put the voronoi on
                var voronoiSelection = (_this.brushElem ? _this.brushElem.select(".overlay") : _this.voronoiRegion);
                voronoiSelection.on("mousemove", function () {
                    var mouseEvent = mouse(this);
                    self.voronoiMousemove(mouseEvent);
                })
                    .on("mouseout", function (d) {
                    if (!self.filteredValueExist() || !self.voronoiExists())
                        return;
                    var _a = mouse(this), mx = _a[0], my = _a[1];
                    var site = self.voronoiDiagram.find(mx, my);
                    self.voronoiMouseout(site.data);
                    self.chartOptions.onMouseout();
                    if (self.tooltip)
                        self.tooltip.hide();
                })
                    .on("contextmenu", function (d) {
                    self.voronoiContextMenu(this);
                })
                    .on("click", function (d) {
                    self.voronoiClick(this);
                });
                if (_this.brushElem) {
                    _this.brushElem.selectAll(".selection, .handle").on("contextmenu", function (d) {
                        if (!self.chartOptions.brushContextMenuActions || self.chartOptions.brushContextMenuActions.length == 0 || self.chartOptions.autoTriggerBrushContextMenu)
                            return;
                        var mousePosition = mouse(self.targetElement.node());
                        event.preventDefault();
                        self.brushContextMenu.draw(self.chartComponentData, self.renderTarget, self.chartOptions, mousePosition, null, null, null, self.brushStartTime, self.brushEndTime);
                    });
                    _this.brushElem.selectAll('.selection')
                        .attr('stroke', _this.chartOptions.color ? _this.chartOptions.color : 'none')
                        .attr('fill', _this.chartOptions.color ? _this.chartOptions.color : 'grey');
                    var handleHeight = self.getHandleHeight();
                    _this.brushElem.selectAll('.handle')
                        .attr('fill', _this.chartOptions.color ? _this.chartOptions.color : 'grey')
                        .attr('height', handleHeight)
                        .attr('y', (_this.chartHeight - handleHeight) / 2);
                }
                /******************** Stack/Unstack button ************************/
                if (_this.hasStackedButton) {
                    _this.stackedButton.style("opacity", function () {
                        if (_this.chartOptions.yAxisState === YAxisStates.Stacked)
                            return 1;
                        if (_this.chartOptions.yAxisState === YAxisStates.Shared)
                            return .6;
                        return .3;
                    })
                        .style("display", _this.visibleAggCount < 2 ? "none" : "block")
                        .classed('tsi-lightTheme', _this.chartOptions.theme == 'light')
                        .classed('tsi-darkTheme', _this.chartOptions.theme == 'dark');
                }
                var timeFrame = (_this.chartOptions.timeFrame) ? _this.chartOptions.timeFrame : _this.x.domain();
                if (!_this.chartOptions.hideChartControlPanel && _this.chartControlsPanel !== null) {
                    _this.chartControlsPanel.style("width", _this.calcSVGWidth() + "px");
                }
                _this.renderAllMarkers();
                _this.voronoiDiagram = _this.voronoi(_this.getFilteredAndSticky(_this.chartComponentData.allValues));
            };
            this.legendObject = new Legend(this.draw, this.renderTarget, this.legendWidth);
            this.contextMenu = new ContextMenu(this.draw, this.renderTarget);
            this.brushContextMenu = new ContextMenu(this.draw, this.renderTarget);
            window.addEventListener("resize", function () {
                if (!_this.chartOptions.suppressResizeListener) {
                    _this.draw();
                    _this.renderAllMarkers();
                }
            });
        }
        this.chartComponentData.mergeDataToDisplayStateAndTimeArrays(this.data, this.aggregateExpressionOptions);
        this.draw();
        this.gatedShowGrid();
        this.chartOptions.noAnimate = false; // ensure internal renders are always animated, overriding the users noAnimate option
        if (this.chartOptions.labelSeriesWithMarker && this.seriesLabelsMarker === null) {
            this.createSeriesLabelsMarker();
        }
        this.renderSeriesLabelsMarker();
        if (this.chartOptions.markers && this.chartOptions.markers.length > 0) {
            this.importMarkers();
        }
        select("html").on("click." + Utils.guid(), function () {
            if (_this.ellipsisContainer && event.target != _this.ellipsisContainer.select(".tsi-ellipsisButton").node()) {
                _this.ellipsisMenu.setMenuVisibility(false);
            }
        });
        this.legendPostRenderProcess(this.chartOptions.legend, this.svgSelection, true, function () {
            _this.updateBrushRange();
        });
    };
    LineChart.prototype.createPlot = function (svgGroup, i, cDO) {
        var chartType = cDO[i].dataType;
        if (chartType === DataTypes.Numeric) {
            return new LinePlot(svgGroup);
        }
        else if (chartType === DataTypes.Categorical) {
            return new CategoricalPlot(svgGroup);
        }
        else if (chartType === DataTypes.Events) {
            return new EventsPlot(svgGroup);
        }
        return null;
    };
    return LineChart;
}(TemporalXAxisComponent));

export default LineChart;
