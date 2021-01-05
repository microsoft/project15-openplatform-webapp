import { a as __extends, U as Utils, T as TooltipMeasureFormat } from './Utils-e5be3308.js';
import { select, event, scaleLinear, extent, easeExp, mouse, axisLeft } from 'd3';
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

var GroupedBarChart = /** @class */ (function (_super) {
    __extends(GroupedBarChart, _super);
    function GroupedBarChart(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.isStacked = null;
        _this.stackedButton = null;
        _this.chartComponentData = new GroupedBarChartData();
        _this.chartMargins = {
            top: 52,
            bottom: 48,
            left: 70,
            right: 60
        };
        return _this;
    }
    GroupedBarChart.prototype.GroupedBarChart = function () { };
    GroupedBarChart.prototype.render = function (data, options, aggregateExpressionOptions) {
        var _this = this;
        _super.prototype.render.call(this, data, options, aggregateExpressionOptions);
        if (options && options.stacked || this.isStacked == null) {
            this.isStacked = this.chartOptions.stacked;
        }
        this.chartMargins.top = (this.chartOptions.legend === 'compact') ? 84 : 52;
        this.width = Math.max(select(this.renderTarget).node().clientWidth, this.MINWIDTH);
        var height = Math.max(select(this.renderTarget).node().clientHeight, this.MINHEIGHT);
        this.chartComponentData.mergeDataToDisplayStateAndTimeArrays(this.data, this.timestamp, this.aggregateExpressionOptions);
        this.timestamp = (options && options.timestamp != undefined) ? options.timestamp : this.chartComponentData.allTimestampsArray[0];
        var chartHeight = height - this.chartMargins.bottom - this.chartMargins.top;
        this.chartWidth = this.getChartWidth();
        if (this.svgSelection == null) {
            var targetElement = select(this.renderTarget)
                .classed("tsi-barChart", true);
            var svgSelection = targetElement.append("svg")
                .attr("class", "tsi-barChartSVG tsi-chartSVG")
                .attr('title', this.getString('Bar chart'))
                .style("height", height)
                .style("width", this.getSVGWidth() + 'px');
            this.svgSelection = svgSelection;
            var g = svgSelection.append("g")
                .attr("transform", "translate(" + this.chartMargins.left + "," + this.chartMargins.top + ")");
            var baseLine = g.append("line")
                .classed("tsi-baseLine", true)
                .attr("stroke-width", 1);
            var focus = g.append("g")
                .attr("transform", "translate(-100,-100)")
                .attr("class", "tsi-focus");
            focus.append("line")
                .attr("class", "tsi-focusLine")
                .attr("x1", 0)
                .attr("x2", this.chartWidth)
                .attr("y1", 0)
                .attr("y2", 0);
            var vHoverG = focus.append("g")
                .attr("class", 'vHoverG');
            var vHoverBox = vHoverG.append("rect")
                .attr("class", 'vHoverBox')
                .attr("x", -5)
                .attr("y", 0)
                .attr("width", 0)
                .attr("height", 0);
            var vHoverText = vHoverG.append("text")
                .attr("class", "vHoverText hoverText")
                .attr("dy", ".32em")
                .attr("x", -10)
                .text(function (d) { return d; });
            select(this.renderTarget).append('div').classed('tsi-sliderWrapper', true);
            var tooltip = new Tooltip(select(this.renderTarget));
            var measureMap = this.chartComponentData.data.map(function (aggregate, aggI) {
                var aggName = Object.keys(aggregate)[0];
                var aggKey = Utils.createEntityKey(Object.keys(aggregate)[0], aggI);
            });
            var labelMouseover = function (aggKey, splitBy) {
                if (splitBy === void 0) { splitBy = null; }
                var self = _this;
                svgSelection.selectAll(".tsi-valueElement")
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                //filter out the selected timeseries/splitby
                var selectedFilter = function (d, j) {
                    var currAggKey;
                    var currSplitBy;
                    if (d.aggKey) {
                        currAggKey = d.aggKey;
                        currSplitBy = d.splitBy;
                    }
                    else if (d && d.length) {
                        currAggKey = d[0].aggKey;
                        currSplitBy = d[0].splitBy;
                    }
                    else
                        return true;
                    return !(aggKey == currAggKey && (splitBy == null || splitBy == currSplitBy));
                };
                svgSelection.selectAll(".tsi-valueElement")
                    .filter(selectedFilter)
                    .attr("stroke-opacity", .3)
                    .attr("fill-opacity", .3);
                var text = svgSelection.selectAll(".barGroup")
                    .filter(function (d) {
                    return d == aggKey;
                })
                    .select(".labelGroup").select("text").text(null);
                var dy = parseFloat(text.attr("dy"));
                var aggLabelGroup = text.append("tspan").attr('class', "tsi-labelGroupLine");
                Utils.appendFormattedElementsFromString(aggLabelGroup, self.chartComponentData.displayState[aggKey].name, { inSvg: true, additionalClassName: "tsi-aggregateLabelGroupText" });
                var splitByLabelGroup = text.append("tspan").attr('class', "tsi-labelGroupLine");
                Utils.appendFormattedElementsFromString(splitByLabelGroup, splitBy, { inSvg: true, additionalClassName: "tsi-splitByLabelGroupText" });
                splitByLabelGroup.selectAll('.tsi-splitByLabelGroupText').each(function (d, i) {
                    if (i == 0) {
                        select(this).attr("y", text.attr("y"))
                            .attr("x", text.attr("x"))
                            .attr("dy", (dy + dy * 2) + "em")
                            .attr("text-anchor", "middle");
                    }
                });
                rePositionLabelGroupBoxes(svgSelection, aggKey);
            };
            var labelMouseout = function (svgSelection, aggKey) {
                var self = _this;
                var allText = svgSelection.selectAll(".barGroup")
                    .selectAll(".labelGroup")
                    .selectAll("text")
                    .text(null);
                allText.each(function (aggKey) {
                    var text = select(this);
                    if (self.chartComponentData.displayState[aggKey] != undefined) {
                        Utils.appendFormattedElementsFromString(text, self.chartComponentData.displayState[aggKey].name, { inSvg: true, additionalClassName: "tsi-aggregateLabelGroupText" });
                    }
                });
                rePositionLabelGroupBoxes(svgSelection);
            };
            var calcSpacePerAgg = function () {
                var aggregateCount = Math.max(Object.keys(_this.chartComponentData.filteredAggregates).length, 1);
                return Math.max((_this.chartWidth / 2) / aggregateCount, 0);
            };
            var rePositionLabelGroupBoxes = function (svgSelection, aggKey) {
                if (aggKey === void 0) { aggKey = null; }
                svgSelection.selectAll(".barGroup").filter(function (d, i) {
                    if (aggKey == null)
                        return true;
                    return d == aggKey;
                })
                    .each(function () {
                    if (select(this).select('.labelGroup').select('text').node() == null)
                        return;
                    var textElemDimensions = select(this).select('.labelGroup').select('text').node()
                        .getBoundingClientRect();
                    var spacePerAgg = calcSpacePerAgg();
                    var aggregateWidth = select(this).attr("width");
                    // //truncate text to fit in spacePerAggregate of width
                    var textSelection = select(this).select('.labelGroup').select("text");
                    var truncateText = function (textSelection, childrenSize) {
                        if (childrenSize === void 0) { childrenSize = 1; }
                        if (textSelection.node().getComputedTextLength) {
                            var textLength = textSelection.node().getComputedTextLength();
                            var text = textSelection.text();
                            while (textLength > ((spacePerAgg - 6) / childrenSize) && text.length > 0) {
                                text = text.slice(0, -1);
                                textSelection.text(text + '...');
                                textLength = textSelection.node().getComputedTextLength();
                            }
                        }
                    };
                    //text is either in tspans or just in text. Either truncate text directly or through tspan
                    if (textSelection.selectAll("tspan").filter(function () { return !select(this).classed("tsi-labelGroupLine"); }).size() === 0)
                        truncateText(textSelection);
                    else {
                        textSelection.selectAll("tspan").filter(function () { return !select(this).classed("tsi-labelGroupLine"); }).each(function () {
                            var tspanTextSelection = select(this);
                            var childrenSize = tspanTextSelection.classed("tsi-splitByLabelGroupText") ? textSelection.selectAll(".tsi-splitByLabelGroupText").size() : textSelection.selectAll(".tsi-aggregateLabelGroupText").size();
                            truncateText(tspanTextSelection, childrenSize);
                        });
                    }
                    select(this).select('.labelGroup').select("rect")
                        .attr("height", textElemDimensions.height + 4)
                        .attr("y", chartHeight + 6)
                        .attr("x", 0)
                        .attr("width", spacePerAgg);
                });
            };
            var draw = function (isFromResize) {
                if (isFromResize === void 0) { isFromResize = false; }
                var self = _this;
                _this.width = _this.getWidth();
                height = Math.max(select(_this.renderTarget).node().clientHeight, _this.MINHEIGHT);
                _this.chartComponentData.timestamp = (_this.chartOptions.timestamp != undefined) ? _this.chartOptions.timestamp : _this.chartComponentData.allTimestampsArray[0];
                _this.chartComponentData.setFilteredAggregates();
                if (!isFromResize) {
                    _this.chartWidth = _this.getChartWidth();
                }
                _super.prototype.themify.call(_this, targetElement, _this.chartOptions.theme);
                if (!_this.chartOptions.hideChartControlPanel && _this.chartControlsPanel === null) {
                    _this.chartControlsPanel = Utils.createControlPanel(_this.renderTarget, _this.CONTROLSWIDTH, _this.chartMargins.top, _this.chartOptions);
                    _this.stackedButton = _this.chartControlsPanel.append("button")
                        .style("left", "60px")
                        .attr("class", "tsi-stackedButton").on("click", function () {
                        self.chartOptions.stacked = !self.chartOptions.stacked;
                        self.draw();
                    })
                        .attr("type", "button")
                        .attr('title', _this.getString('Stack/Unstack Bars'));
                }
                else if (_this.chartOptions.hideChartControlPanel && _this.chartControlsPanel !== null) {
                    _this.removeControlPanel();
                }
                if (_this.chartControlsPanel) {
                    _this.stackedButton.attr('aria-label', _this.chartOptions.stacked ? _this.getString("Unstack bars") : _this.getString("Stack bars"));
                }
                if (_this.chartControlsPanel !== null && _this.ellipsisItemsExist()) {
                    _this.drawEllipsisMenu();
                    _this.chartControlsPanel.style("top", Math.max((_this.chartMargins.top - 24), 0) + 'px');
                }
                else {
                    _this.removeEllipsisMenu();
                }
                /********* Determine the number of timestamps present, add margin for slider *********/
                if (_this.chartComponentData.allTimestampsArray.length > 1)
                    _this.chartMargins.bottom = 88;
                /*******************/
                chartHeight = height - _this.chartMargins.bottom - _this.chartMargins.top;
                focus.select("line").attr("x2", _this.chartWidth);
                svgSelection.style("width", _this.getSVGWidth() + "px");
                if (_this.timestamp.substring(_this.timestamp.length - 5, _this.timestamp.length) == ".000Z")
                    _this.timestamp = _this.timestamp.substring(0, _this.timestamp.length - 5) + "Z";
                var aggregateCount = Math.max(Object.keys(_this.chartComponentData.filteredAggregates).length, 1);
                svgSelection.select('g').attr("transform", "translate(" + _this.chartMargins.left + "," + _this.chartMargins.top + ")")
                    .selectAll('.barGroup')
                    .attr("visibility", "hidden");
                var barGroups = g.selectAll('.barGroup').data(Object.keys(_this.chartComponentData.displayState));
                var spacePerAggregate = calcSpacePerAgg();
                //map to x position
                var xPosMap = _this.chartComponentData.filteredAggregates.reduce(function (map, aggKey, aggKeyI) {
                    map[aggKey] = ((1 / (aggregateCount + 1)) * (aggKeyI + 1) * _this.chartWidth - (spacePerAggregate / 2));
                    return map;
                }, {});
                _this.legendObject.draw(_this.chartOptions.legend, _this.chartComponentData, labelMouseover, svgSelection, _this.chartOptions, labelMouseout);
                barGroups = barGroups.enter()
                    .append("g")
                    .attr("class", "barGroup")
                    .merge(barGroups)
                    .attr("display", function (d, i) { return (_this.chartComponentData.displayState[d].visible ? "inherit" : "none"); })
                    .attr("visibility", "visible")
                    .attr("transform", function (d, i) {
                    if (xPosMap[d])
                        return "translate(" + xPosMap[d] + ",0)";
                    return "";
                });
                _this.chartComponentData.setEntireRangeData(_this.chartOptions.scaledToCurrentTime);
                var allValues = _this.chartComponentData.valuesOfVisibleType;
                var aggsSeries = _this.chartComponentData.aggsSeries;
                var yScale = scaleLinear()
                    .range([chartHeight, 0]);
                var extent$1 = extent(allValues);
                if (!_this.chartOptions.stacked) {
                    if (allValues.length > 0) { //check to make sure there are values present
                        if (_this.chartOptions.zeroYAxis) {
                            if (extent$1[0] > 0)
                                yScale.domain([0, extent(allValues)[1]]);
                            else
                                yScale.domain([extent(allValues)[0], Math.max(extent(allValues)[1], 0)]);
                        }
                        else {
                            var offset = (Math.abs(extent(allValues)[1]) * .05);
                            yScale.domain([extent(allValues)[0] - offset, (extent(allValues)[1] + offset)]);
                        }
                    }
                    else {
                        yScale.domain([0, 0]);
                    }
                }
                else {
                    yScale.domain([Math.min(_this.chartComponentData.globalMin, _this.chartComponentData.globalMax),
                        Math.max(_this.chartComponentData.globalMin, _this.chartComponentData.globalMax)]);
                }
                var barBase = (yScale.domain()[0] > 0) ? yScale(yScale.domain()[0]) : yScale(0);
                var legendObject = _this.legendObject;
                barGroups.each(function (aggKey, i) {
                    var splitBys = Object.keys(self.chartComponentData.displayState[aggKey].splitBys);
                    var filteredSplitBys = splitBys.filter(function (splitBy) {
                        return self.chartComponentData.displayState[aggKey].splitBys[splitBy].visible;
                    });
                    var splitByCount = filteredSplitBys.length;
                    var barWidth = spacePerAggregate / splitByCount;
                    var valueElements = select(this).selectAll('.tsi-valueElement').data(self.chartComponentData.getValueContainerData(aggKey));
                    var labelGroup = select(this).selectAll(".labelGroup").data([aggKey]);
                    var labelGroupEntered = labelGroup.enter()
                        .append("g")
                        .attr("class", "labelGroup");
                    labelGroupEntered.append("rect");
                    var labelGroupText = labelGroupEntered.append("text")
                        .attr("dy", ".71em");
                    Utils.appendFormattedElementsFromString(labelGroupText, self.chartComponentData.displayState[aggKey].name, { inSvg: true, additionalClassName: "tsi-aggregateLabelGroupText" });
                    var labelGroupBox = labelGroupEntered.merge(labelGroup)
                        .select("rect")
                        .attr("class", 'aggregateLabelBox')
                        .attr("x", 0)
                        .attr("y", 1)
                        .attr("width", 0)
                        .attr("height", 0);
                    select(this).select(".labelGroup").select("text")
                        .transition()
                        .duration(self.TRANSDURATION)
                        .ease(easeExp)
                        .attr("x", function (d) { return (spacePerAggregate / 2); })
                        .attr("y", chartHeight + 12)
                        .style("fill", function (d) { return self.chartComponentData.displayState[aggKey].color; })
                        .attr("text-anchor", "middle");
                    labelGroup.exit().remove();
                    rePositionLabelGroupBoxes(svgSelection, aggKey);
                    var xScale = scaleLinear()
                        .domain([0, splitByCount])
                        .range([0, spacePerAggregate]);
                    //yOffset to position 0 at the appropriate place
                    var yOffset = chartHeight - filteredSplitBys.reduce(function (offset, splitBy) {
                        var measureType = self.chartComponentData.displayState[aggKey].splitBys[splitBy].visibleType;
                        var yScaledVal; // either 0 or the value 
                        if (self.chartComponentData.valuesAtTimestamp[aggKey].splitBys[splitBy].measurements)
                            yScaledVal = yScale(self.chartComponentData.valuesAtTimestamp[aggKey].splitBys[splitBy].measurements[measureType]);
                        else
                            yScaledVal = 0;
                        return offset + yScaledVal;
                    }, 0);
                    //calculate the yPosition of an element, either by its data or explicitly through its value
                    var calcYPos = function (d, i) {
                        if (!self.chartOptions.stacked) {
                            if (d.val > 0)
                                return yScale(d.val);
                            return yScale(0);
                        }
                        if (aggsSeries[d.aggKey] != undefined && aggsSeries[d.aggKey].length != 0) {
                            return yScale(aggsSeries[d.aggKey][i][0][1]);
                        }
                        return 0;
                    };
                    //calculate the height of an element given its data
                    var calcHeight = function (d, i, dValue) {
                        if (dValue === void 0) { dValue = null; }
                        if (!self.chartOptions.stacked) {
                            if (yScale.domain()[0] >= 0)
                                return chartHeight - calcYPos(d, i);
                            dValue = (dValue != null) ? dValue : d.val;
                            if (dValue > 0)
                                return Math.abs(calcYPos(d, i) - yScale(0));
                            return yScale(dValue) - yScale(0);
                        }
                        return Math.max(Math.abs(yScale(d.val) - yScale(0)), 0);
                    };
                    //map to x position for grouped, map to y position for stacked
                    var splitByXPosMap = filteredSplitBys.reduce(function (map, splitBy, splitByI) {
                        map[splitBy] = xScale(splitByI);
                        return map;
                    }, {});
                    var valueElementsEntered = valueElements.enter()
                        .append("g")
                        .attr("class", "tsi-valueElement");
                    valueElementsEntered.append("rect");
                    valueElementsEntered.append("line");
                    var valueElementMouseout = function (d, j) {
                        if (self.contextMenu && self.contextMenu.contextMenuVisible)
                            return;
                        focus.style("display", "none");
                        legendObject.legendElement.selectAll('.tsi-splitByLabel').filter(function (filteredSplitBy) {
                            return (select(this.parentNode).datum() == d.aggKey) && (filteredSplitBy == d.splitBy);
                        }).classed("inFocus", false);
                        event.stopPropagation();
                        svgSelection.selectAll(".tsi-valueElement")
                            .attr("stroke-opacity", 1)
                            .attr("fill-opacity", 1);
                        labelMouseout(svgSelection, d.aggKey);
                        tooltip.hide();
                    };
                    var mouseOutValueElementOnContextMenuClick = function () {
                        valueElementsEntered.selectAll("path").each(valueElementMouseout);
                    };
                    var splitByColors = Utils.createSplitByColors(self.chartComponentData.displayState, aggKey, self.chartOptions.keepSplitByColor);
                    valueElementsEntered.merge(valueElements)
                        .select("rect")
                        .attr("fill", function (d, j) {
                        return splitByColors[j];
                    })
                        .on("mouseover", function (d, j) {
                        if (self.contextMenu && self.contextMenu.contextMenuVisible)
                            return;
                        (legendObject.legendElement.selectAll('.tsi-splitByLabel').filter(function (filteredSplitBy) {
                            return (select(this.parentNode).datum() == d.aggKey) && (filteredSplitBy == d.splitBy);
                        })).classed("inFocus", true);
                        labelMouseover(d.aggKey, d.splitBy);
                        var yPos = calcYPos(d, j);
                        if (d.val < 0) {
                            yPos = yPos + calcHeight(d, j);
                        }
                        focus.style("display", "block")
                            .attr("transform", "translate(0," + yPos + ")");
                        focus.select('.vHoverG')
                            .select("text")
                            .text(function () {
                            if (!self.chartOptions.stacked)
                                return Utils.formatYAxisNumber(d.val);
                            var yVal = yScale.invert(calcYPos(d, j));
                            if (d.val < 0)
                                yVal += d.val;
                            return Utils.formatYAxisNumber(yVal);
                        });
                        var textElemDimensions = focus.select('.vHoverG').select("text")
                            .node().getBoundingClientRect();
                        focus.select(".vHoverG").select("rect")
                            .attr("x", -(textElemDimensions.width) - 13)
                            .attr("y", -(textElemDimensions.height / 2) - 3)
                            .attr("width", textElemDimensions.width + 6)
                            .attr("height", textElemDimensions.height + 4);
                        focus.node().parentNode.appendChild(focus.node());
                    })
                        .on("mousemove", function (d, i) {
                        if (self.chartOptions.tooltip) {
                            var mousePos = mouse(g.node());
                            tooltip.render(self.chartOptions.theme);
                            tooltip.draw(d, self.chartComponentData, mousePos[0], mousePos[1], self.chartMargins, function (text) {
                                self.tooltipFormat(self.convertToTimeValueFormat(d), text, TooltipMeasureFormat.SingleValue);
                            }, null, 20, 20, splitByColors[i]);
                        }
                        else {
                            tooltip.hide();
                        }
                    })
                        .on("mouseout", valueElementMouseout)
                        .on("contextmenu", function (d, i) {
                        if (self.chartComponentData.displayState[d.aggKey].contextMenuActions &&
                            self.chartComponentData.displayState[d.aggKey].contextMenuActions.length) {
                            var mousePosition = mouse(targetElement.node());
                            event.preventDefault();
                            self.contextMenu.draw(self.chartComponentData, self.renderTarget, self.chartOptions, mousePosition, d.aggKey, d.splitBy, mouseOutValueElementOnContextMenuClick, new Date(self.chartComponentData.timestamp));
                        }
                    })
                        .transition()
                        .duration(self.TRANSDURATION)
                        .ease(easeExp)
                        .attr("y", function (d, i) { return calcYPos(d, i); })
                        .attr("height", function (d, i) {
                        if (self.chartOptions.stacked && (splitByXPosMap[d.splitBy] == undefined))
                            return 0;
                        return Math.max(calcHeight(d, i), 0);
                    })
                        .attr("x", function (d, i) {
                        if (self.chartOptions.stacked)
                            return 0;
                        if (splitByXPosMap[d.splitBy] != undefined)
                            return splitByXPosMap[d.splitBy];
                        //if invisible, put it in the empty space where it would be
                        var splitBys = Object.keys(self.chartComponentData.displayState[aggKey].splitBys);
                        var prevSplitBy = splitBys[0];
                        for (var splitByI = 0; splitBys[splitByI] != d.splitBy; splitByI++) {
                            if (splitByXPosMap[splitBys[splitByI]] != undefined)
                                prevSplitBy = splitBys[splitByI];
                        }
                        if (splitByXPosMap[prevSplitBy] != undefined)
                            return splitByXPosMap[prevSplitBy] + barWidth;
                        return 0;
                    })
                        .attr("width", function (d, i) {
                        if (self.chartOptions.stacked)
                            return spacePerAggregate;
                        if (splitByXPosMap[d.splitBy] != undefined)
                            return barWidth;
                        return 0;
                    });
                    valueElementsEntered.merge(valueElements)
                        .select("line")
                        .classed("tsi-baseLine", true)
                        .attr("stroke-width", 2)
                        .transition()
                        .duration(self.TRANSDURATION)
                        .ease(easeExp)
                        .attr("x1", function (d, i) {
                        if (self.chartOptions.stacked)
                            return 0;
                        if (splitByXPosMap[d.splitBy] != undefined)
                            return splitByXPosMap[d.splitBy];
                        return 0;
                    })
                        .attr("x2", function (d, i) {
                        if (self.chartOptions.stacked)
                            return spacePerAggregate;
                        if (splitByXPosMap[d.splitBy] != undefined)
                            return splitByXPosMap[d.splitBy] + barWidth;
                        return 0;
                    })
                        .attr("y1", function (d, i) {
                        if (!self.chartOptions.stacked) {
                            return barBase;
                        }
                        var dValue = d.val;
                        if (self.chartOptions.stacked && (splitByXPosMap[d.splitBy] == undefined))
                            return calcYPos(d, i);
                        return calcYPos(d, i) + calcHeight(d, i);
                    })
                        .attr("y2", function (d, i) {
                        if (!self.chartOptions.stacked) {
                            return barBase;
                        }
                        var dValue = d.val;
                        if (self.chartOptions.stacked && (splitByXPosMap[d.splitBy] == undefined))
                            return calcYPos(d, i);
                        return calcYPos(d, i) + calcHeight(d, i);
                    });
                    valueElements.exit().remove();
                });
                barGroups.exit().remove();
                var yAxis = g.selectAll(".yAxis")
                    .data([yScale]);
                yAxis.enter()
                    .append("g")
                    .attr("class", "yAxis")
                    .merge(yAxis)
                    .call(axisLeft(yScale).tickFormat(Utils.formatYAxisNumber).ticks(4));
                yAxis.exit().remove();
                baseLine
                    .attr("x1", 0)
                    .attr("x2", _this.chartWidth)
                    .attr("y1", barBase + 1)
                    .attr("y2", barBase + 1);
                /******************** Stack/Unstack button ************************/
                _this.stackedButton.style("opacity", _this.chartOptions.stacked ? 1 : .5)
                    .classed('tsi-lightTheme', _this.chartOptions.theme == 'light')
                    .classed('tsi-darkTheme', _this.chartOptions.theme == 'dark');
                /******************** Temporal Slider ************************/
                if (_this.chartComponentData.allTimestampsArray.length > 1) {
                    select(_this.renderTarget).select('.tsi-sliderWrapper').classed('tsi-hidden', false);
                    slider.render(_this.chartComponentData.allTimestampsArray.map(function (ts) {
                        var action = function () {
                            _this.chartOptions.timestamp = ts;
                            _this.render(_this.chartComponentData.data, _this.chartOptions, _this.aggregateExpressionOptions);
                        };
                        return { label: Utils.timeFormat(_this.chartComponentData.usesSeconds, _this.chartComponentData.usesMillis, _this.chartOptions.offset, _this.chartOptions.is24HourTime, null, null, _this.chartOptions.dateLocale)(new Date(ts)), action: action };
                    }), _this.chartOptions, _this.getSVGWidth(), Utils.timeFormat(_this.chartComponentData.usesSeconds, _this.chartComponentData.usesMillis, _this.chartOptions.offset, _this.chartOptions.is24HourTime, null, null, _this.chartOptions.dateLocale)(new Date(_this.chartComponentData.timestamp)));
                }
                else {
                    slider.remove();
                    select(_this.renderTarget).select('.tsi-sliderWrapper').classed('tsi-hidden', true);
                }
                _this.setControlsPanelWidth();
            };
            this.legendObject = new Legend(draw, this.renderTarget, this.CONTROLSWIDTH);
            this.contextMenu = new ContextMenu(this.draw, this.renderTarget);
            // temporal slider
            var slider = new Slider(select(this.renderTarget).select('.tsi-sliderWrapper').node());
            this.draw = draw;
            window.addEventListener("resize", function () {
                if (!_this.chartOptions.suppressResizeListener)
                    _this.draw();
            });
        }
        select("html").on("click." + Utils.guid(), function () {
            if (_this.ellipsisContainer && event.target != _this.ellipsisContainer.select(".tsi-ellipsisButton").node()) {
                _this.ellipsisMenu.setMenuVisibility(false);
            }
        });
        this.chartComponentData.mergeDataToDisplayStateAndTimeArrays(this.data, this.timestamp, this.aggregateExpressionOptions);
        this.draw();
        this.gatedShowGrid();
        this.legendPostRenderProcess(this.chartOptions.legend, this.svgSelection, true);
    };
    return GroupedBarChart;
}(ChartVisualizationComponent));

export default GroupedBarChart;
