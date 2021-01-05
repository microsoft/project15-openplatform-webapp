import { a as __extends, U as Utils, l as GRIDCONTAINERCLASS, T as TooltipMeasureFormat, D as DataTypes, S as ShiftTypes, k as __spreadArrays, C as ChartComponentData, b as Component } from './Utils-e5be3308.js';
import { select } from 'd3';
import EllipsisMenu from './EllipsisMenu.js';
import Split from 'split.js';

var ChartComponent = /** @class */ (function (_super) {
    __extends(ChartComponent, _super);
    function ChartComponent(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.MINWIDTH = 350;
        _this.MINHEIGHT = 150;
        _this.CONTROLSWIDTH = 200;
        _this.GUTTERWIDTH = 6;
        _this.chartControlsPanel = null;
        _this.ellipsisContainer = null;
        _this.ellipsisMenu = null;
        _this.svgSelection = null;
        _this.legendWidth = _this.CONTROLSWIDTH;
        _this.downloadAsCSV = function (isScatterPlot) {
            if (isScatterPlot === void 0) { isScatterPlot = false; }
            Utils.downloadCSV(_this.chartComponentData.generateCSVString(_this.chartOptions.offset, _this.chartOptions.dateLocale, isScatterPlot ? _this.chartOptions.spMeasures : null));
        };
        _this.chartComponentData = new ChartComponentData();
        return _this;
    }
    ChartComponent.prototype.showGrid = function () {
        Utils.showGrid(this.renderTarget, this.chartOptions, this.aggregateExpressionOptions, this.chartComponentData);
    };
    ChartComponent.prototype.gatedShowGrid = function () {
        if (this.isGridVisible()) {
            this.showGrid();
        }
    };
    ChartComponent.prototype.hideGrid = function () {
        Utils.hideGrid(this.renderTarget);
    };
    ChartComponent.prototype.isGridVisible = function () {
        return !select(this.renderTarget).selectAll("." + GRIDCONTAINERCLASS).empty();
    };
    ChartComponent.prototype.drawEllipsisMenu = function (additionalEllipsisItems) {
        var _this = this;
        if (additionalEllipsisItems === void 0) { additionalEllipsisItems = []; }
        if (this.chartOptions.canDownload || this.chartOptions.grid || (this.chartOptions.ellipsisItems && this.chartOptions.ellipsisItems.length > 0) || additionalEllipsisItems.length > 0) {
            if (this.ellipsisContainer === null) {
                this.ellipsisContainer = this.chartControlsPanel.append("div")
                    .attr("class", "tsi-ellipsisContainerDiv");
            }
            if (this.ellipsisMenu === null) {
                this.ellipsisMenu = new EllipsisMenu(this.ellipsisContainer.node());
            }
            var ellipsisItems = [];
            if (this.chartOptions.grid) {
                ellipsisItems.push(Utils.createGridEllipsisOption(this.renderTarget, this.chartOptions, this.aggregateExpressionOptions, this.chartComponentData, this.getString("Display Grid")));
            }
            if (this.chartOptions.canDownload) {
                ellipsisItems.push(Utils.createDownloadEllipsisOption(function () { return _this.chartComponentData.generateCSVString(_this.chartOptions.offset, _this.chartOptions.dateLocale); }, function () { return Utils.focusOnEllipsisButton(_this.renderTarget); }, this.getString("Download as CSV")));
            }
            if (this.chartOptions.ellipsisItems) {
                ellipsisItems = ellipsisItems.concat(this.chartOptions.ellipsisItems);
            }
            this.ellipsisMenu.render(ellipsisItems.concat(additionalEllipsisItems), { theme: this.chartOptions.theme });
        }
    };
    ChartComponent.prototype.removeControlPanel = function () {
        if (this.chartControlsPanel) {
            this.chartControlsPanel.remove();
        }
        this.chartControlsPanel = null;
        this.ellipsisContainer = null;
        this.ellipsisMenu = null;
    };
    ChartComponent.prototype.removeEllipsisMenu = function () {
        if (this.ellipsisContainer) {
            this.ellipsisContainer.remove();
        }
        this.ellipsisContainer = null;
        this.ellipsisMenu = null;
    };
    ChartComponent.prototype.getWidth = function () {
        return Math.max(select(this.renderTarget).node().clientWidth, this.MINWIDTH);
    };
    ChartComponent.prototype.getVisibilityState = function () {
        return this.chartComponentData.getVisibilityState();
    };
    ChartComponent.prototype.ellipsisItemsExist = function () {
        return (this.chartOptions.canDownload || this.chartOptions.ellipsisItems.length > 0 || this.chartOptions.grid);
    };
    ChartComponent.prototype.getDataType = function (aggKey) {
        return this.chartComponentData.getDataType(aggKey);
    };
    ChartComponent.prototype.getCDOFromAggKey = function (aggKey) {
        var matches = this.aggregateExpressionOptions.filter(function (cDO) {
            return cDO.aggKey === aggKey;
        });
        if (matches.length === 1) {
            return matches[0];
        }
        return {};
    };
    ChartComponent.prototype.getFilteredMeasures = function (measureList, visibleMeasure, measureFormat, xyrMeasures) {
        if (xyrMeasures === void 0) { xyrMeasures = null; }
        var justVisibleMeasure = [visibleMeasure];
        switch (measureFormat) {
            case TooltipMeasureFormat.SingleValue:
                return justVisibleMeasure;
            case TooltipMeasureFormat.Scatter:
                return xyrMeasures;
            default:
                if (measureList.length !== 3) {
                    return justVisibleMeasure;
                }
                var isAvgMinMax_1 = true;
                measureList.forEach(function (measure) {
                    if (!(measure === 'avg' || measure === 'min' || measure === 'max')) {
                        isAvgMinMax_1 = false;
                    }
                });
                return isAvgMinMax_1 ? measureList.sort(function (m) { return m === 'min' ? -1 : (m === 'avg' ? 0 : 1); }) : justVisibleMeasure;
        }
    };
    // to get alignment for data points between other types and linechart for tooltip formatting
    ChartComponent.prototype.convertToTimeValueFormat = function (d) {
        var measuresObject = {};
        var measureType = d.measureType ? d.measureType : this.chartComponentData.displayState[d.aggKey].splitBys[d.splitBy].visibleType;
        measuresObject[measureType] = d.val;
        return {
            aggregateKey: d.aggKey,
            splitBy: d.splitBy,
            aggregateName: this.chartComponentData.displayState[d.aggKey].name,
            measures: measuresObject
        };
    };
    ChartComponent.prototype.formatDate = function (date, shiftMillis) {
        return Utils.timeFormat(this.chartComponentData.usesSeconds, this.chartComponentData.usesMillis, this.chartOptions.offset, this.chartOptions.is24HourTime, shiftMillis, null, this.chartOptions.dateLocale)(date);
    };
    ChartComponent.prototype.tooltipFormat = function (d, text, measureFormat, xyrMeasures) {
        var _this = this;
        if (xyrMeasures === void 0) { xyrMeasures = null; }
        var dataType = this.getDataType(d.aggregateKey);
        var title = d.aggregateName;
        var cDO = this.getCDOFromAggKey(d.aggregateKey);
        var shiftMillis = this.chartComponentData.getTemporalShiftMillis(d.aggregateKey);
        var formatDate = function (date) { return _this.formatDate(date, shiftMillis); };
        var titleGroup = text.append("div")
            .attr("class", "tsi-tooltipTitleGroup");
        this.createTooltipSeriesInfo(d, titleGroup, cDO);
        if (dataType === DataTypes.Categorical) {
            titleGroup.append('h4')
                .attr('class', 'tsi-tooltipSubtitle tsi-tooltipTimeStamp')
                .text(formatDate(d.dateTime) + ' - ' + formatDate(d.endDate));
        }
        if (dataType === DataTypes.Events) {
            titleGroup.append('h4')
                .attr('class', 'tsi-tooltipSubtitle tsi-tooltipTimeStamp')
                .text(formatDate(d.dateTime));
        }
        var tooltipAttrs = cDO.tooltipAttributes;
        if (shiftMillis !== 0 && tooltipAttrs) {
            var shiftTuple = this.chartComponentData.getTemporalShiftStringTuple(d.aggregateKey);
            if (shiftTuple !== null) {
                var keyString = this.getString(shiftTuple[0]);
                var valueString = (keyString === ShiftTypes.startAt) ? this.formatDate(new Date(shiftTuple[1]), 0) : shiftTuple[1];
                tooltipAttrs = __spreadArrays(tooltipAttrs, [[keyString, valueString]]);
            }
        }
        if (tooltipAttrs && tooltipAttrs.length > 0) {
            var attrsGroup_1 = text.append('div')
                .attr('class', 'tsi-tooltipAttributeContainer tsi-tooltipFlexyBox');
            tooltipAttrs.forEach(function (attrTuple, i) {
                var timeShiftRow = attrsGroup_1.append('div')
                    .attr('class', 'tsi-tooltipAttribute tsi-tooltipFlexyItem');
                timeShiftRow.append('div')
                    .attr('class', 'tsi-tooltipAttrTitle')
                    .text(attrTuple[0]);
                timeShiftRow.append('div')
                    .attr('class', 'tsi-tooltipAttrValue')
                    .text(attrTuple[1]);
            });
        }
        if (d.measures && Object.keys(d.measures).length) {
            var formatValue_1 = (dataType === DataTypes.Events ? function (d) { return d; } : Utils.formatYAxisNumber);
            if (dataType !== DataTypes.Numeric) {
                var valueGroup_1 = text.append('table')
                    .attr('class', 'tsi-tooltipValues tsi-tooltipTable');
                Object.keys(d.measures).forEach(function (measureType, i) {
                    if (!(dataType === DataTypes.Categorical) || d.measures[measureType] !== 0) {
                        valueGroup_1.append('tr').classed('tsi-tableSpacer', true);
                        var tr = valueGroup_1.append('tr')
                            .classed('tsi-visibleValue', (dataType === DataTypes.Numeric && (measureType === _this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy))))
                            .style('border-left-color', Utils.getColorForValue(cDO, measureType));
                        tr.append('td')
                            .attr('class', 'tsi-valueLabel')
                            .text(measureType);
                        tr.append('td')
                            .attr('class', 'tsi-valueCell')
                            .text(formatValue_1(d.measures[measureType]));
                    }
                });
            }
            else {
                var valueGroup_2 = text.append('div')
                    .attr('class', 'tsi-tooltipFlexyBox');
                var filteredMeasures = this.getFilteredMeasures(Object.keys(d.measures), this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy), measureFormat, xyrMeasures);
                filteredMeasures.forEach(function (measureType, i) {
                    var valueItem = valueGroup_2.append('div')
                        .attr('class', 'tsi-tooltipFlexyItem')
                        .classed('tsi-visibleValue', (dataType === DataTypes.Numeric &&
                        (measureType === _this.chartComponentData.getVisibleMeasure(d.aggregateKey, d.splitBy)) &&
                        (measureFormat !== TooltipMeasureFormat.Scatter)));
                    var measureTitle = valueItem.append('div')
                        .attr('class', 'tsi-tooltipMeasureTitle');
                    Utils.appendFormattedElementsFromString(measureTitle, measureType);
                    valueItem.append('div')
                        .attr('class', 'tsi-tooltipMeasureValue')
                        .text(formatValue_1(d.measures[measureType]));
                });
            }
        }
    };
    ChartComponent.prototype.getSVGWidth = function () {
        return this.chartWidth + this.chartMargins.left + this.chartMargins.right;
    };
    ChartComponent.prototype.getChartWidth = function (legendWidth) {
        if (legendWidth === void 0) { legendWidth = this.CONTROLSWIDTH; }
        legendWidth = this.legendWidth; // + this.GUTTERWIDTH;
        return Math.max(1, this.width - this.chartMargins.left - this.chartMargins.right - (this.chartOptions.legend === "shown" ? legendWidth : 0));
    };
    ChartComponent.prototype.calcSVGWidth = function () {
        return this.svgSelection.node().getBoundingClientRect().width;
    };
    ChartComponent.prototype.setControlsPanelWidth = function () {
        if (!this.chartOptions.hideChartControlPanel && this.chartControlsPanel !== null) {
            //either calculate expected or just use svg if it's in the DOM
            var controlPanelWidth = this.svgSelection && this.svgSelection.node() ?
                this.calcSVGWidth() :
                this.getWidth() - (this.chartOptions.legend === 'shown' ? (this.legendWidth + this.GUTTERWIDTH) : 0);
            this.chartControlsPanel.style("width", controlPanelWidth + "px");
        }
    };
    ChartComponent.prototype.legendPostRenderProcess = function (legendState, chartElement, shouldSetControlsWidth, splitLegendOnDrag) {
        if (splitLegendOnDrag === void 0) { splitLegendOnDrag = undefined; }
        if (legendState === 'shown') {
            this.splitLegendAndSVG(chartElement.node(), splitLegendOnDrag);
            if (shouldSetControlsWidth) {
                this.setControlsPanelWidth();
            }
        }
        else {
            select(this.renderTarget).select('.tsi-resizeGutter').remove();
        }
    };
    ChartComponent.prototype.splitLegendAndSVG = function (chartElement, onDrag) {
        var _this = this;
        if (onDrag === void 0) { onDrag = function () { }; }
        var svgWidth = this.getSVGWidth();
        var legendWidth = this.width - svgWidth;
        select(this.renderTarget).select('.tsi-resizeGutter').remove();
        var legend = this.legendObject.legendElement;
        Split([this.legendObject.legendElement.node(), chartElement], {
            sizes: [legendWidth / this.width * 100, svgWidth / this.width * 100],
            gutterSize: 2,
            minSize: [200, 0],
            snapOffset: 0,
            cursor: 'e-resize',
            onDragEnd: function (sizes) {
                var legendWidth = _this.width * (sizes[0] / 100);
                _this.legendWidth = legendWidth;
                _this.chartWidth = _this.getChartWidth();
                _this.draw(true);
                legend.style('width', _this.legendWidth + 'px');
                select(_this.renderTarget).select('.tsi-resizeGutter')
                    .classed('tsi-isDragging', false);
            },
            onDragStart: function () {
                select(_this.renderTarget).select('.tsi-resizeGutter')
                    .classed('tsi-isDragging', true);
            },
            onDrag: function () {
                if (!_this.chartOptions.hideChartControlPanel && _this.chartControlsPanel !== null) {
                    var svgLeftOffset = _this.calcSVGWidth();
                    _this.chartControlsPanel.style("width", Math.max(svgLeftOffset, _this.chartMargins.left + 8) + "px"); //8px to account for the width of the icon
                }
                onDrag();
            },
            gutter: function (index, direction) {
                var gutter = document.createElement('div');
                gutter.className = "gutter tsi-resizeGutter";
                return gutter;
            },
            direction: 'horizontal'
        });
        // explicitly set the width of the legend to a pixel value
        var calcedLegendWidth = legend.node().getBoundingClientRect().width;
        legend.style("width", calcedLegendWidth + "px");
    };
    return ChartComponent;
}(Component));

export { ChartComponent as C };
