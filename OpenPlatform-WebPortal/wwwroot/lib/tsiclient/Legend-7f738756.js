import { a as __extends, D as DataTypes, U as Utils, c as EventElementTypes, b as Component } from './Utils-e5be3308.js';
import { event, select } from 'd3';

var NUMERICSPLITBYHEIGHT = 44;
var NONNUMERICSPLITBYHEIGHT = 24;
var Legend = /** @class */ (function (_super) {
    __extends(Legend, _super);
    function Legend(drawChart, renderTarget, legendWidth) {
        var _this = _super.call(this, renderTarget) || this;
        _this.renderSplitBys = function (aggKey, aggSelection, dataType, noSplitBys) {
            var splitByLabelData = Object.keys(_this.chartComponentData.timeArrays[aggKey]);
            var firstSplitBy = _this.chartComponentData.displayState[aggKey].splitBys[Object.keys(_this.chartComponentData.displayState[aggKey].splitBys)[0]];
            var firstSplitByType = firstSplitBy ? firstSplitBy.visibleType : null;
            var isSame = Object.keys(_this.chartComponentData.displayState[aggKey].splitBys).reduce(function (isSame, curr) {
                return (firstSplitByType == _this.chartComponentData.displayState[aggKey].splitBys[curr].visibleType) && isSame;
            }, true);
            var showMoreSplitBys = function () {
                var oldShownSplitBys = _this.chartComponentData.displayState[aggKey].shownSplitBys;
                _this.chartComponentData.displayState[aggKey].shownSplitBys = Math.min(oldShownSplitBys + 20, splitByLabelData.length);
                if (oldShownSplitBys != _this.chartComponentData.displayState[aggKey].shownSplitBys) {
                    _this.renderSplitBys(aggKey, aggSelection, dataType, noSplitBys);
                }
            };
            var splitByContainer = aggSelection.selectAll(".tsi-splitByContainer").data([aggKey]);
            var splitByContainerEntered = splitByContainer.enter().append("div")
                .merge(splitByContainer)
                .classed("tsi-splitByContainer", true);
            var splitByLabels = splitByContainerEntered.selectAll('.tsi-splitByLabel')
                .data(splitByLabelData.slice(0, _this.chartComponentData.displayState[aggKey].shownSplitBys), function (d) {
                return d;
            });
            var self = _this;
            var splitByLabelsEntered = splitByLabels
                .enter()
                .append("div")
                .merge(splitByLabels)
                .attr('role', _this.legendState === 'compact' ? 'button' : 'presentation')
                .attr('tabindex', _this.legendState === 'compact' ? '0' : '-1')
                .on('keypress', function (splitBy) {
                if (_this.legendState === 'compact' && (event.keyCode === 13 || event.keyCode === 32)) { //space or enter
                    _this.toggleSplitByVisible(aggKey, splitBy);
                    _this.drawChart();
                    event.preventDefault();
                }
            })
                .on("click", function (splitBy, i) {
                if (self.legendState == "compact") {
                    self.toggleSplitByVisible(aggKey, splitBy);
                }
                else {
                    self.toggleSticky(aggKey, splitBy);
                }
                self.drawChart();
            })
                .on("mouseover", function (splitBy, i) {
                event.stopPropagation();
                self.labelMouseover(aggKey, splitBy);
            })
                .on("mouseout", function (splitBy, i) {
                event.stopPropagation();
                self.svgSelection.selectAll(".tsi-valueElement")
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                self.labelMouseout(self.svgSelection, aggKey);
            })
                .attr("class", function (splitBy, i) {
                var compact = (dataType !== DataTypes.Numeric) ? 'tsi-splitByLabelCompact' : '';
                var shown = Utils.getAgVisible(self.chartComponentData.displayState, aggKey, splitBy) ? 'shown' : '';
                return "tsi-splitByLabel tsi-splitByLabel " + compact + " " + shown;
            })
                .classed("stickied", function (splitBy, i) {
                if (self.chartComponentData.stickiedKey != null) {
                    return aggKey == self.chartComponentData.stickiedKey.aggregateKey && splitBy == self.chartComponentData.stickiedKey.splitBy;
                }
            });
            var colors = Utils.createSplitByColors(self.chartComponentData.displayState, aggKey, self.chartOptions.keepSplitByColor);
            splitByLabelsEntered.each(function (splitBy, j) {
                var color = (self.chartComponentData.isFromHeatmap) ? self.chartComponentData.displayState[aggKey].color : colors[j];
                if (dataType === DataTypes.Numeric || noSplitBys || self.legendState === 'compact') {
                    var colorKey = select(this).selectAll('.tsi-colorKey').data([color]);
                    var colorKeyEntered = colorKey.enter()
                        .append("div")
                        .attr("class", 'tsi-colorKey')
                        .merge(colorKey);
                    if (dataType === DataTypes.Numeric) {
                        colorKeyEntered.style('background-color', function (d) {
                            return d;
                        });
                    }
                    else {
                        self.createNonNumericColorKey(dataType, colorKeyEntered, aggKey);
                    }
                    select(this).classed('tsi-nonCompactNonNumeric', (dataType === DataTypes.Categorical || dataType === DataTypes.Events) && this.legendState !== 'compact');
                    colorKey.exit().remove();
                }
                else {
                    select(this).selectAll('.tsi-colorKey').remove();
                }
                if (select(this).select('.tsi-eyeIcon').empty()) {
                    select(this).append("button")
                        .attr("class", "tsi-eyeIcon")
                        .attr('aria-label', function () {
                        var showOrHide = self.chartComponentData.displayState[aggKey].splitBys[splitBy].visible ? self.getString('hide series') : self.getString('show series');
                        return showOrHide + " " + splitBy + " " + self.getString('in group') + " " + self.chartComponentData.displayState[aggKey].name;
                    })
                        .attr('title', function () { return self.getString('Show/Hide values'); })
                        .on("click", function (data, i) {
                        event.stopPropagation();
                        self.toggleSplitByVisible(aggKey, splitBy);
                        select(this)
                            .classed("shown", Utils.getAgVisible(self.chartComponentData.displayState, aggKey, splitBy));
                        self.drawChart();
                    });
                }
                if (select(this).select('.tsi-seriesName').empty()) {
                    var seriesName = select(this)
                        .append('div')
                        .attr('class', 'tsi-seriesName');
                    Utils.appendFormattedElementsFromString(seriesName, noSplitBys ? (self.chartComponentData.displayState[aggKey].name) : splitBy);
                }
                if (dataType === DataTypes.Numeric) {
                    if (select(this).select('.tsi-seriesTypeSelection').empty()) {
                        select(this).append("select")
                            .attr('aria-label', self.getString("Series type selection for") + " " + splitBy + " " + self.getString('in group') + " " + self.chartComponentData.displayState[aggKey].name)
                            .attr('class', 'tsi-seriesTypeSelection')
                            .on("change", function (data) {
                            var seriesType = select(this).property("value");
                            self.chartComponentData.displayState[aggKey].splitBys[splitBy].visibleType = seriesType;
                            self.drawChart();
                        })
                            .on("click", function () {
                            event.stopPropagation();
                        });
                    }
                    select(this).select('.tsi-seriesTypeSelection')
                        .each(function (d) {
                        var typeLabels = select(this).selectAll('option')
                            .data(function (data) { return self.chartComponentData.displayState[aggKey].splitBys[splitBy].types.map(function (type) {
                            return {
                                type: type,
                                aggKey: aggKey,
                                splitBy: splitBy,
                                visibleMeasure: Utils.getAgVisibleMeasure(self.chartComponentData.displayState, aggKey, splitBy)
                            };
                        }); });
                        typeLabels
                            .enter()
                            .append("option")
                            .attr("class", "seriesTypeLabel")
                            .merge(typeLabels)
                            .property("selected", function (data) {
                            return ((data.type == Utils.getAgVisibleMeasure(self.chartComponentData.displayState, data.aggKey, data.splitBy)) ?
                                " selected" : "");
                        })
                            .text(function (data) { return data.type; });
                        typeLabels.exit().remove();
                    });
                }
                else {
                    select(this).selectAll('.tsi-seriesTypeSelection').remove();
                }
            });
            splitByLabels.exit().remove();
            var shouldShowMore = self.chartComponentData.displayState[aggKey].shownSplitBys < splitByLabelData.length;
            splitByContainerEntered.selectAll('.tsi-legendShowMore').remove();
            if (_this.legendState === 'shown' && shouldShowMore) {
                splitByContainerEntered.append('button')
                    .text(_this.getString('Show more'))
                    .attr('class', 'tsi-legendShowMore')
                    .style('display', (_this.legendState === 'shown' && shouldShowMore) ? 'block' : 'none')
                    .on('click', showMoreSplitBys);
            }
            splitByContainerEntered.on("scroll", function () {
                if (self.chartOptions.legend === 'shown') {
                    if (this.scrollTop + this.clientHeight + 40 > this.scrollHeight) {
                        showMoreSplitBys();
                    }
                }
            });
            splitByContainer.exit().remove();
        };
        _this.toggleSticky = function (aggregateKey, splitBy) {
            //don't do anything if not visible 
            if (!_this.chartComponentData.displayState[aggregateKey].visible ||
                !_this.chartComponentData.displayState[aggregateKey].splitBys[splitBy].visible)
                return;
            if (_this.chartComponentData.stickiedKey != null &&
                _this.chartComponentData.stickiedKey.aggregateKey == aggregateKey &&
                _this.chartComponentData.stickiedKey.splitBy == splitBy) {
                _this.chartComponentData.stickiedKey = null;
            }
            else {
                if (_this.stickySeriesAction) {
                    _this.stickySeriesAction(aggregateKey, splitBy);
                }
            }
        };
        _this.drawChart = drawChart;
        _this.legendWidth = legendWidth;
        _this.legendElement = select(renderTarget).insert("div", ":first-child")
            .attr("class", "tsi-legend")
            .style("left", "0px")
            .style("width", (_this.legendWidth) + "px"); // - 16 for the width of the padding
        return _this;
    }
    Legend.prototype.labelMouseoutWrapper = function (labelMouseout, svgSelection) {
        return function (svgSelection, aggKey) {
            event.stopPropagation();
            svgSelection.selectAll(".tsi-valueElement")
                .filter(function () { return !select(this).classed("tsi-valueEnvelope"); })
                .attr("stroke-opacity", 1)
                .attr("fill-opacity", 1);
            svgSelection.selectAll(".tsi-valueEnvelope")
                .attr("fill-opacity", .2);
            labelMouseout(svgSelection, aggKey);
        };
    };
    Legend.prototype.toggleSplitByVisible = function (aggregateKey, splitBy) {
        var _this = this;
        var newState = !this.chartComponentData.displayState[aggregateKey].splitBys[splitBy].visible;
        this.chartComponentData.displayState[aggregateKey].splitBys[splitBy].visible = newState;
        this.chartComponentData.displayState[aggregateKey].visible = Object.keys(this.chartComponentData.displayState[aggregateKey].splitBys)
            .reduce(function (prev, curr) {
            return _this.chartComponentData.displayState[aggregateKey]["splitBys"][curr]["visible"] || prev;
        }, false);
        //turn off sticky if making invisible
        if (newState == false && (this.chartComponentData.stickiedKey != null &&
            this.chartComponentData.stickiedKey.aggregateKey == aggregateKey &&
            this.chartComponentData.stickiedKey.splitBy == splitBy)) {
            this.chartComponentData.stickiedKey = null;
        }
    };
    Legend.prototype.triggerSplitByFocus = function (aggKey, splitBy) {
        if (this.chartOptions.legend == "hidden") {
            return;
        }
        this.legendElement.selectAll('.tsi-splitByLabel').classed("inFocus", false);
        this.legendElement.selectAll('.tsi-splitByLabel').filter(function (labelData) {
            return (select(this.parentNode).datum() == aggKey) && (labelData == splitBy);
        }).classed("inFocus", true);
        var indexOfSplitBy = Object.keys(this.chartComponentData.displayState[aggKey].splitBys).indexOf(splitBy);
        if (indexOfSplitBy != -1) {
            var splitByNode = this.legendElement.selectAll('.tsi-splitByContainer').filter(function (d) {
                return d == aggKey;
            }).node();
            var prospectiveScrollTop = Math.max((indexOfSplitBy - 1) * this.getHeightPerSplitBy(aggKey), 0);
            if (splitByNode.scrollTop < prospectiveScrollTop - (splitByNode.clientHeight - 40) || splitByNode.scrollTop > prospectiveScrollTop) {
                splitByNode.scrollTop = prospectiveScrollTop;
            }
        }
    };
    Legend.prototype.getHeightPerSplitBy = function (aggKey) {
        return (this.chartComponentData.displayState[aggKey].dataType === DataTypes.Numeric ? NUMERICSPLITBYHEIGHT : NONNUMERICSPLITBYHEIGHT);
    };
    Legend.prototype.createGradient = function (gradientKey, svg, values) {
        var gradient = svg.append('defs').append('linearGradient')
            .attr('id', gradientKey).attr('x1', '0%').attr('x2', '0%').attr('y1', '0%').attr('y2', '100%');
        var catCount = Object.keys(values).length;
        Object.keys(values).forEach(function (category, i) {
            var currentStop = i / catCount * 100;
            var nextStop = (i + 1) / catCount * 100;
            var color = values[category].color;
            gradient.append('stop')
                .attr("offset", currentStop + "%")
                .attr("stop-color", color)
                .attr("stop-opacity", 1);
            gradient.append('stop')
                .attr("offset", nextStop + "%")
                .attr("stop-color", color)
                .attr("stop-opacity", 1);
        });
    };
    Legend.prototype.isNonNumeric = function (aggKey) {
        var dataType = this.chartComponentData.displayState[aggKey].dataType;
        return (dataType === DataTypes.Categorical || dataType === DataTypes.Events);
    };
    Legend.prototype.createNonNumericColorKey = function (dataType, colorKey, aggKey) {
        if (dataType === DataTypes.Categorical) {
            this.createCategoricalColorKey(colorKey, aggKey);
        }
        if (dataType === DataTypes.Events) {
            this.createEventsColorKey(colorKey, aggKey);
        }
    };
    Legend.prototype.createCategoricalColorKey = function (colorKey, aggKey) {
        var categories = this.chartComponentData.displayState[aggKey].aggregateExpression.valueMapping;
        colorKey.classed('tsi-categoricalColorKey', true);
        colorKey.selectAll('*').remove();
        var svg = colorKey.append('svg')
            .attr('width', colorKey.style('width'))
            .attr('height', colorKey.style('height'));
        var rect = svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'black');
        var gradientKey = Utils.guid();
        this.createGradient(gradientKey, svg, categories);
        rect.attr('fill', "url(#" + gradientKey + ")");
    };
    Legend.prototype.createEventsColorKey = function (colorKey, aggKey) {
        var categories = this.chartComponentData.displayState[aggKey].aggregateExpression.valueMapping;
        var eventElementType = this.chartComponentData.displayState[aggKey].aggregateExpression.eventElementType;
        colorKey.classed('tsi-eventsColorKey', true);
        colorKey.selectAll('*').remove();
        var colorKeyWidth = colorKey.node().getBoundingClientRect().width;
        var colorKeyHeight = colorKey.node().getBoundingClientRect().height;
        var colorKeyUnitLength = Math.floor(colorKeyHeight / Math.sqrt(2));
        var svg = colorKey.append('svg')
            .attr('width', colorKeyWidth + "px")
            .attr('height', colorKeyHeight + "px");
        var gradientKey = Utils.guid();
        this.createGradient(gradientKey, svg, categories);
        if (eventElementType === EventElementTypes.Teardrop) {
            svg.append('path')
                .attr('transform', function (d) {
                return 'translate(' + (colorKeyWidth * .75) + ',' + (colorKeyHeight * .75) + ') rotate(180)';
            })
                .attr('d', this.teardropD(colorKeyWidth / 2, colorKeyHeight / 2))
                .attr('stroke-width', Math.min(colorKeyUnitLength / 2.25, 8))
                .style('fill', 'none')
                .style('stroke', "url(#" + gradientKey + ")");
        }
        else {
            var rect = svg.append('rect')
                .attr('width', colorKeyUnitLength)
                .attr('height', colorKeyUnitLength)
                .attr('transform', "translate(" + (colorKeyWidth / 2) + ",0)rotate(45)")
                .attr('fill', 'black');
            rect.attr('fill', "url(#" + gradientKey + ")");
        }
    };
    Legend.prototype.draw = function (legendState, chartComponentData, labelMouseover, svgSelection, options, labelMouseoutAction, stickySeriesAction) {
        var _this = this;
        if (labelMouseoutAction === void 0) { labelMouseoutAction = null; }
        if (stickySeriesAction === void 0) { stickySeriesAction = null; }
        this.chartOptions.setOptions(options);
        this.chartComponentData = chartComponentData;
        this.legendState = legendState;
        this.stickySeriesAction = stickySeriesAction;
        this.labelMouseover = labelMouseover;
        this.labelMouseout = this.labelMouseoutWrapper(labelMouseoutAction, svgSelection);
        this.svgSelection = svgSelection;
        var legend = this.legendElement;
        var self = this;
        _super.prototype.themify.call(this, this.legendElement, this.chartOptions.theme);
        legend.style('visibility', this.legendState != 'hidden')
            .classed('compact', this.legendState == 'compact')
            .classed('hidden', this.legendState == 'hidden');
        var seriesNames = Object.keys(this.chartComponentData.displayState);
        var seriesLabels = legend.selectAll(".tsi-seriesLabel")
            .data(seriesNames, function (d) { return d; });
        var seriesLabelsEntered = seriesLabels.enter()
            .append("div")
            .merge(seriesLabels)
            .attr("class", function (d, i) {
            return "tsi-seriesLabel " + (_this.chartComponentData.displayState[d]["visible"] ? " shown" : "");
        })
            .style("min-width", function () {
            return Math.min(124, _this.legendElement.node().clientWidth / seriesNames.length) + 'px';
        })
            .style("border-color", function (d, i) {
            if (select(this).classed("shown"))
                return self.chartComponentData.displayState[d].color;
            return "lightgray";
        });
        var self = this;
        var heightPerNameLabel = 25;
        var usableLegendHeight = legend.node().clientHeight;
        var prospectiveAggregateHeight = Math.ceil(Math.max(201, (usableLegendHeight / seriesLabelsEntered.size())));
        var contentHeight = 0;
        seriesLabelsEntered.each(function (aggKey, i) {
            var heightPerSplitBy = self.getHeightPerSplitBy(aggKey);
            var splitByLabelData = Object.keys(self.chartComponentData.timeArrays[aggKey]);
            var noSplitBys = splitByLabelData.length == 1 && splitByLabelData[0] == "";
            var seriesNameLabel = select(this).selectAll(".tsi-seriesNameLabel").data([aggKey]);
            select(this).classed('tsi-nsb', noSplitBys);
            var enteredSeriesNameLabel = seriesNameLabel.enter().append("button")
                .merge(seriesNameLabel)
                .attr("class", function (agg, i) {
                return "tsi-seriesNameLabel" + (self.chartComponentData.displayState[agg].visible ? " shown" : "");
            })
                .attr("aria-label", function (agg) {
                var showOrHide = self.chartComponentData.displayState[agg].visible ? self.getString('hide group') : self.getString('show group');
                return showOrHide + " " + self.getString('group') + " " + Utils.stripNullGuid(self.chartComponentData.displayState[agg].name);
            })
                .on("click", function (d, i) {
                var newState = !self.chartComponentData.displayState[d].visible;
                self.chartComponentData.displayState[d].visible = newState;
                //turn off sticky if making invisible
                if (newState == false && (self.chartComponentData.stickiedKey != null &&
                    self.chartComponentData.stickiedKey.aggregateKey == d)) {
                    self.chartComponentData.stickiedKey = null;
                }
                self.drawChart();
            })
                .on("mouseover", function (d) {
                labelMouseover(d);
            })
                .on("mouseout", function (d) {
                self.labelMouseout(svgSelection, d);
            });
            var dataType = self.chartComponentData.displayState[aggKey].dataType;
            if (dataType === DataTypes.Categorical || dataType === DataTypes.Events) {
                enteredSeriesNameLabel.classed('tsi-nonCompactNonNumeric', true);
                var colorKey = enteredSeriesNameLabel.selectAll('.tsi-colorKey').data(['']);
                var colorKeyEntered = colorKey.enter()
                    .append("div")
                    .attr("class", 'tsi-colorKey')
                    .merge(colorKey);
                self.createNonNumericColorKey(dataType, colorKeyEntered, aggKey);
                colorKey.exit().remove();
            }
            var seriesNameLabelText = enteredSeriesNameLabel.selectAll("h4").data([aggKey]);
            seriesNameLabelText.enter()
                .append("h4")
                .merge(seriesNameLabelText)
                .attr("title", function (d) { return Utils.stripNullGuid(self.chartComponentData.displayState[d].name); })
                .each(function () {
                Utils.appendFormattedElementsFromString(select(this), self.chartComponentData.displayState[aggKey].name);
            });
            seriesNameLabelText.exit().remove();
            seriesNameLabel.exit().remove();
            var splitByContainerHeight;
            if (splitByLabelData.length > (prospectiveAggregateHeight / heightPerSplitBy)) {
                splitByContainerHeight = prospectiveAggregateHeight - heightPerNameLabel;
                contentHeight += splitByContainerHeight + heightPerNameLabel;
            }
            else if (splitByLabelData.length > 1 || (splitByLabelData.length === 1 && splitByLabelData[0] !== "")) {
                splitByContainerHeight = splitByLabelData.length * heightPerSplitBy + heightPerNameLabel;
                contentHeight += splitByContainerHeight + heightPerNameLabel;
            }
            else {
                splitByContainerHeight = heightPerSplitBy;
                contentHeight += splitByContainerHeight;
            }
            if (self.chartOptions.legend == "shown") {
                select(this).style("height", splitByContainerHeight + "px");
            }
            else {
                select(this).style("height", "unset");
            }
            var splitByContainer = select(this).selectAll(".tsi-splitByContainer").data([aggKey]);
            var splitByContainerEntered = splitByContainer.enter().append("div")
                .merge(splitByContainer)
                .classed("tsi-splitByContainer", true);
            var aggSelection = select(this);
            var sBs = self.renderSplitBys(aggKey, aggSelection, dataType, noSplitBys);
            splitByContainerEntered.on("scroll", function () {
                if (self.chartOptions.legend == "shown") {
                    if (this.scrollTop + this.clientHeight + 40 > this.scrollHeight) {
                        var oldShownSplitBys = self.chartComponentData.displayState[aggKey].shownSplitBys;
                        self.chartComponentData.displayState[aggKey].shownSplitBys = Math.min(oldShownSplitBys + 20, splitByLabelData.length);
                        if (oldShownSplitBys != self.chartComponentData.displayState[aggKey].shownSplitBys) {
                            self.renderSplitBys(aggKey, aggSelection, dataType, noSplitBys);
                        }
                    }
                }
            });
            select(this).on('scroll', function () {
                if (self.chartOptions.legend == "compact") {
                    if (this.scrollLeft + this.clientWidth + 40 > this.scrollWidth) {
                        var oldShownSplitBys = self.chartComponentData.displayState[aggKey].shownSplitBys;
                        self.chartComponentData.displayState[aggKey].shownSplitBys = Math.min(oldShownSplitBys + 20, splitByLabelData.length);
                        if (oldShownSplitBys != self.chartComponentData.displayState[aggKey].shownSplitBys) {
                            this.renderSplitBys(dataType);
                        }
                    }
                }
            });
            splitByContainer.exit().remove();
        });
        if (this.chartOptions.legend == 'shown') {
            var legendHeight = legend.node().clientHeight;
            //minSplitBysForFlexGrow: the minimum number of split bys for flex-grow to be triggered 
            if (contentHeight < usableLegendHeight) {
                this.legendElement.classed("tsi-flexLegend", true);
                seriesLabelsEntered.each(function (d) {
                    var heightPerSplitBy = self.getHeightPerSplitBy(d);
                    var minSplitByForFlexGrow = (prospectiveAggregateHeight - heightPerNameLabel) / heightPerSplitBy;
                    var splitBysCount = Object.keys(self.chartComponentData.displayState[String(select(this).data()[0])].splitBys).length;
                    if (splitBysCount > minSplitByForFlexGrow) {
                        select(this).style("flex-grow", 1);
                    }
                });
            }
            else {
                this.legendElement.classed("tsi-flexLegend", false);
            }
        }
        seriesLabels.exit().remove();
    };
    return Legend;
}(Component));

export { Legend as L };
