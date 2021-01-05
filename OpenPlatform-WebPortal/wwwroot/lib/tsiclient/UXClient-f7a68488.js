import { a as __extends, _ as __assign, U as Utils, G as Grid } from './Utils-e5be3308.js';
import { event, select, mouse } from 'd3';
import EllipsisMenu from './EllipsisMenu.js';
import { C as ChartComponent } from './ChartComponent-a7f89f69.js';
import LineChart from './LineChart.js';
import TimezonePicker from './TimezonePicker.js';
import DateTimePicker from './DateTimePicker.js';
import DateTimeButtonRange from './DateTimeButtonRange.js';
import PieChart from './PieChart.js';
import Slider from './Slider.js';
import ScatterPlot from './ScatterPlot.js';
import GroupedBarChart from './GroupedBarChart.js';
import Hierarchy from './Hierarchy.js';
import AggregateExpression from './AggregateExpression.js';
import Heatmap from './Heatmap.js';
import EventsTable from './EventsTable.js';
import ModelAutocomplete from './ModelAutocomplete.js';
import ModelSearch from './ModelSearch.js';
import TsqExpression from './TsqExpression.js';
import HierarchyNavigation from './HierarchyNavigation.js';
import SingleDateTimePicker from './SingleDateTimePicker.js';
import DateTimeButtonSingle from './DateTimeButtonSingle.js';
import PlaybackControls from './PlaybackControls.js';
import ProcessGraphic from './ProcessGraphic.js';
import ColorPicker from './ColorPicker.js';
import GeoProcessGraphic from './GeoProcessGraphic.js';

var AvailabilityChart = /** @class */ (function (_super) {
    __extends(AvailabilityChart, _super);
    function AvailabilityChart(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.minBrushWidth = 5;
        _this.minGhostWidth = 2;
        _this.margins = {
            left: 10,
            right: 10
        };
        _this.uxClient = new UXClient();
        return _this;
    }
    //the most zoomed in possible
    AvailabilityChart.prototype.getMinZoomedRange = function () {
        var maxZoomFactor = (this.sparkLineChart.x.range()[1] - this.sparkLineChart.x.range()[0]) / this.minBrushWidth;
        var totalTimeRange = this.toMillis - this.fromMillis;
        return totalTimeRange / maxZoomFactor;
    };
    AvailabilityChart.prototype.zoom = function (direction, xPos) {
        if (this.chartOptions.isCompact)
            return;
        var range = Math.max(this.getMinZoomedRange(), (this.zoomedToMillis - this.zoomedFromMillis));
        var percentile = (xPos - this.sparkLineChart.x.range()[0]) /
            (this.sparkLineChart.x.range()[1] - this.sparkLineChart.x.range()[0]);
        var leftImpact = percentile * .2 * range;
        var rightImpact = (1 - percentile) * .2 * range;
        if (direction == 'out') {
            this.zoomedFromMillis = Math.max(this.zoomedFromMillis - leftImpact, this.fromMillis);
            this.zoomedToMillis = Math.min(this.zoomedToMillis + rightImpact, this.toMillis);
        }
        else {
            var prospectiveFromMillis = Math.max(this.zoomedFromMillis + leftImpact, this.fromMillis);
            var prospectiveToMillis = Math.min(this.zoomedToMillis - rightImpact, this.toMillis);
            if (prospectiveToMillis - prospectiveFromMillis >= this.getMinZoomedRange()) {
                this.zoomedFromMillis = prospectiveFromMillis;
                this.zoomedToMillis = prospectiveToMillis;
            }
            else {
                var offBy = this.getMinZoomedRange() - (prospectiveToMillis - prospectiveFromMillis);
                this.zoomedFromMillis = prospectiveFromMillis - (percentile * offBy);
                this.zoomedToMillis = prospectiveToMillis + ((1 - percentile) * offBy);
            }
        }
        this.setAvailabilityRange(this.zoomedFromMillis, this.zoomedToMillis);
        this.sparkLineChart.setBrushEndTime(new Date(this.zoomedToMillis));
        this.sparkLineChart.setBrushStartTime(new Date(this.zoomedFromMillis));
        this.sparkLineChart.setBrush();
        this.timePickerLineChart.drawBrushRange();
        event.preventDefault && event.preventDefault();
    };
    AvailabilityChart.prototype.setChartOptions = function (chartOptions) {
        this.chartOptions.setOptions(__assign(__assign({}, chartOptions), {
            keepBrush: true,
            isArea: true,
            noAnimate: true,
            minutesForTimeLabels: true,
            aggTopMargin: 0,
            yAxisHidden: true,
            focusHidden: true,
            singleLineXAxisLabel: false
        }));
    };
    AvailabilityChart.prototype.dateTimePickerAction = function (fromMillis, toMillis) {
        this.setBrush(fromMillis, toMillis, true);
        this.chartOptions.brushMoveEndAction(new Date(fromMillis), new Date(toMillis), this.chartOptions.offset);
        this.setTicks();
        this.dateTimePickerContainer.style("display", "none");
    };
    //transformation of buckets created by the UX client to buckets for the availabilityChart
    AvailabilityChart.prototype.createDisplayBuckets = function (fromMillis, toMillis) {
        var _this = this;
        var keysInRange = Object.keys(this.transformedAvailability[0].availabilityCount[""]).reduce(function (inRangeObj, timestamp, i, timestamps) {
            var currTSMillis = (new Date(timestamp)).valueOf();
            var nextTSMillis = currTSMillis + _this.bucketSize;
            if (currTSMillis >= fromMillis && currTSMillis <= toMillis) {
                inRangeObj[(new Date(currTSMillis)).toISOString()] = _this.transformedAvailability[0].availabilityCount[""][timestamp];
                return inRangeObj;
            }
            if (currTSMillis < fromMillis && nextTSMillis > fromMillis) {
                inRangeObj[(new Date(fromMillis)).toISOString()] = _this.transformedAvailability[0].availabilityCount[""][timestamp];
                return inRangeObj;
            }
            return inRangeObj;
        }, {});
        var rawBucketCount = Math.ceil((toMillis - fromMillis) / this.bucketSize);
        var bucketMultiplier = Math.ceil(rawBucketCount / this.maxBuckets);
        var computedBucketSize = this.bucketSize * bucketMultiplier;
        var createKey = function (millis) { return Math.round(Math.floor(millis / computedBucketSize) * computedBucketSize); };
        var firstBucket = createKey(fromMillis);
        var lastBucket = createKey(toMillis);
        var buckets = [];
        for (var i = firstBucket; i <= lastBucket; i += computedBucketSize) {
            buckets[(new Date(i)).toISOString()] = { count: 0 };
        }
        Object.keys(keysInRange).sort().forEach(function (ts, i) {
            var tsMillis = (new Date(ts)).valueOf();
            var computedKey = createKey(tsMillis);
            buckets[(new Date(computedKey)).toISOString()].count += (keysInRange[ts].count / bucketMultiplier);
        });
        if (fromMillis !== null && firstBucket !== null) {
            buckets[(new Date(fromMillis)).toISOString()] = buckets[(new Date(firstBucket)).toISOString()];
        }
        if (toMillis !== null && lastBucket !== null) {
            buckets[(new Date(toMillis)).toISOString()] = buckets[(new Date(lastBucket)).toISOString()];
        }
        // delete the bucket before the from time
        if (firstBucket < fromMillis) {
            delete buckets[(new Date(firstBucket)).toISOString()];
        }
        return [{ "availabilityCount": { "": buckets } }];
    };
    AvailabilityChart.prototype.setRangeVariables = function (rawAvailability) {
        if (Utils.safeNotNullOrUndefined(function () { return rawAvailability.range.from || rawAvailability.range.to || rawAvailability.intervalSize; })) {
            this.fromMillis = (new Date(rawAvailability.range.from)).valueOf();
            this.toMillis = (new Date(rawAvailability.range.to)).valueOf();
            this.bucketSize = Utils.parseTimeInput(rawAvailability.intervalSize);
        }
        else {
            this.fromMillis = null;
            this.toMillis = null;
            this.bucketSize = null;
        }
    };
    AvailabilityChart.prototype.render = function (transformedAvailability, chartOptions, rawAvailability) {
        var _this = this;
        if (rawAvailability === void 0) { rawAvailability = {}; }
        this.setChartOptions(chartOptions);
        this.rawAvailability = rawAvailability;
        this.transformedAvailability = transformedAvailability;
        this.color = this.chartOptions.color ? this.chartOptions.color : 'teal';
        this.maxBuckets = (this.chartOptions.maxBuckets) ? this.chartOptions.maxBuckets : 500;
        this.setRangeVariables(rawAvailability);
        var startBucket = (this.fromMillis !== null && this.bucketSize !== null) ?
            Math.round(Math.floor(this.fromMillis / this.bucketSize) * this.bucketSize) : null;
        var endBucket = (this.toMillis !== null && this.bucketSize !== null) ?
            Math.round(Math.floor(this.toMillis / this.bucketSize) * this.bucketSize) : null;
        if (startBucket !== null && startBucket === endBucket) {
            this.fromMillis = Math.floor(this.fromMillis / this.bucketSize) * this.bucketSize;
            this.toMillis = this.fromMillis + this.bucketSize;
            this.bucketSize = this.bucketSize / 60;
        }
        this.ae = [new this.uxClient.AggregateExpression({ predicateString: "" }, { property: 'Count', type: "Double" }, ['count'], { from: new Date(this.fromMillis), to: new Date(this.toMillis) }, null, 'grey', 'Availability')];
        this.targetElement = select(this.renderTarget)
            .classed("tsi-availabilityChart", true)
            .classed("tsi-compact", this.chartOptions.isCompact)
            .classed("tsi-withButton", this.chartOptions.persistDateTimeButtonRange);
        this.chartOptions.yAxisHidden = true;
        this.chartOptions.focusHidden = true;
        this.chartOptions.singleLineXAxisLabel = true;
        this.chartOptions.suppressResizeListener = true;
        this.chartOptions.brushClearable = false;
        this.chartOptions.minBrushWidth = 1;
        this.chartOptions.brushHandlesVisible = true;
        this.chartOptions.hideChartControlPanel = true;
        var brushMoveAction = this.chartOptions.brushMoveAction;
        this.chartOptions.brushMoveAction = function (from, to) {
            _this.setFromAndToTimes(from.valueOf(), to.valueOf());
            _this.drawGhost();
            if (_this.chartOptions.isCompact) {
                _this.buildCompactFromAndTo();
            }
            if (brushMoveAction != null)
                brushMoveAction(from, to);
        };
        _super.prototype.themify.call(this, this.targetElement, chartOptions.theme);
        if (this.timePickerContainer == null) {
            this.targetElement.html("");
            this.timePickerContainer = this.targetElement.append("div")
                .classed("tsi-timePickerContainer", true);
            this.timePickerChart = this.timePickerContainer.append("div").classed("tsi-timePickerChart", true);
            var sparkLineContainer = this.targetElement.append("div").classed("tsi-sparklineContainer", true);
            this.timePickerTextContainer = this.targetElement.append("div").classed("tsi-timePickerTextContainer", true)
                .style("margin-left", this.chartOptions.availabilityLeftMargin + this.margins.left);
            this.timePickerLineChart = new LineChart(this.timePickerChart.node());
            this.timePickerLineChart.chartMargins.left = (this.chartOptions.availabilityLeftMargin - this.margins.left);
            this.buildFromAndToContainer();
            this.sparkLineChart = new LineChart(sparkLineContainer.node());
            this.sparkLineChart.chartMargins.left = (this.chartOptions.availabilityLeftMargin - this.margins.left);
            this.dateTimePickerContainer = this.targetElement.append("div").classed("tsi-dateTimePickerContainer", true);
            this.dateTimePicker = new DateTimePicker(this.dateTimePickerContainer.node());
            window.addEventListener('resize', function () {
                _this.timePickerLineChart.draw();
                _this.setTicks();
                _this.drawWarmRange();
                if (_this.chartOptions.isCompact)
                    _this.buildCompactFromAndTo();
                setTimeout(function () {
                    _this.drawGhost();
                }, 100);
            });
            var pickerContainerAndContent = this.targetElement.selectAll(".tsi-dateTimePickerContainer, .tsi-dateTimePickerContainer *");
        }
        //clear the date time picker
        this.dateTimePickerContainer.style("display", "none");
        this.timePickerContainer.selectAll('.tsi-compactFromTo').remove();
        if (this.chartOptions.isCompact) {
            this.targetElement.select('.tsi-sparklineContainer').style("display", 'none');
            if (!this.chartOptions.persistDateTimeButtonRange)
                this.targetElement.select(".tsi-timePickerTextContainer").style('display', 'none');
            this.targetElement.select('.tsi-zoomButtonContainer').style('display', 'none');
            this.targetElement.select('.tsi-timePickerContainer').style('max-height', '68px').style('top', this.chartOptions.persistDateTimeButtonRange ? '6px' : '20px');
        }
        else {
            this.targetElement.select('.tsi-sparklineContainer').style("display", 'flex');
            this.targetElement.select(".tsi-timePickerTextContainer").style('display', 'inherit');
            this.targetElement.select('.tsi-zoomButtonContainer').style('display', 'flex');
            this.targetElement.select('.tsi-timePickerContainer').style('max-height', 'none').style('top', '0px');
        }
        var sparkLineOptions = this.createSparkLineOptions(chartOptions);
        var visibileAvailability = this.createDisplayBuckets(this.fromMillis, this.toMillis);
        this.sparkLineChart.render(visibileAvailability, sparkLineOptions, this.ae);
        this.timePickerLineChart.render(visibileAvailability, this.chartOptions, this.ae);
        this.setTicks();
        this.drawWarmRange();
        if (!this.chartOptions.preserveAvailabilityState) {
            this.zoomedToMillis = this.toMillis;
            this.zoomedFromMillis = this.chartOptions.defaultAvailabilityZoomRangeMillis ? Math.max(this.fromMillis, this.toMillis - this.chartOptions.defaultAvailabilityZoomRangeMillis) : this.fromMillis;
            this.sparkLineChart.setBrushStartTime(new Date(this.zoomedFromMillis));
            this.sparkLineChart.setBrushEndTime(new Date(this.zoomedToMillis));
            this.setFromAndToTimes(Math.max(this.fromMillis, this.toMillis - (24 * 60 * 60 * 1000)), this.toMillis);
            this.setBrush(Math.max(this.fromMillis, this.toMillis - (24 * 60 * 60 * 1000)), this.toMillis);
        }
        else {
            if (this.zoomedFromMillis == null)
                this.zoomedFromMillis = this.chartOptions.defaultAvailabilityZoomRangeMillis ? Math.max(this.fromMillis, this.toMillis - this.chartOptions.defaultAvailabilityZoomRangeMillis) : this.fromMillis;
            if (this.zoomedToMillis == null)
                this.zoomedToMillis = this.toMillis;
            if (this.sparkLineChart.brushStartTime == null)
                this.sparkLineChart.setBrushStartTime(new Date(this.zoomedFromMillis));
            if (this.sparkLineChart.brushEndTime == null)
                this.sparkLineChart.setBrushEndTime(new Date(this.zoomedToMillis));
            if (this.selectedFromMillis == null || this.selectedToMillis == null)
                this.setFromAndToTimes(this.toMillis - (24 * 60 * 60 * 1000), this.toMillis);
            this.drawGhost();
            this.setBrush(this.selectedFromMillis, this.selectedToMillis);
        }
        this.sparkLineChart.setBrush();
        var self = this;
        this.timePickerChart.select(".brushElem").on("wheel.zoom", function (d) {
            var direction = event.deltaY > 0 ? 'out' : 'in';
            var xPos = (mouse(this)[0]);
            self.zoom(direction, xPos);
        });
        if (!this.chartOptions.isCompact) {
            this.buildZoomButtons();
        }
        else {
            this.timePickerChart.select('.brushElem').select('.selection');
        }
        this.setAvailabilityRange(this.zoomedFromMillis, this.zoomedToMillis);
        if (this.chartOptions.isCompact) {
            this.buildCompactFromAndTo();
        }
        this.timePickerLineChart.drawBrushRange();
    };
    AvailabilityChart.prototype.buildZoomButtons = function () {
        var _this = this;
        this.targetElement.selectAll(".tsi-zoomButtonContainer").remove();
        var midpoint = (this.sparkLineChart.x.range()[1] - this.sparkLineChart.x.range()[0]) / 2;
        var buttonsDiv = this.targetElement.append("div")
            .classed("tsi-zoomButtonContainer", true);
        buttonsDiv.append("button")
            .attr("class", "tsi-zoomButton tsi-zoomButtonIn")
            .attr('aria-label', this.getString('zoom in'))
            .attr('title', this.getString('zoom in'))
            .on("click", function () {
            _this.zoom("in", midpoint);
        });
        buttonsDiv.append("button")
            .attr("class", "tsi-zoomButton tsi-zoomButtonOut")
            .attr('aria-label', this.getString('zoom out'))
            .attr('title', this.getString('zoom out'))
            .on("click", function () {
            _this.zoom("out", midpoint);
        });
    };
    AvailabilityChart.prototype.setSelectedMillis = function (fromMillis, toMillis) {
        this.selectedFromMillis = fromMillis;
        this.selectedToMillis = toMillis;
        this.timePickerLineChart.drawBrushRange();
    };
    AvailabilityChart.prototype.renderDateTimeButton = function () {
        var _this = this;
        var minMillis = this.fromMillis + (Utils.getOffsetMinutes(this.chartOptions.offset, this.fromMillis) * 60 * 1000);
        var maxMillis = this.toMillis + (Utils.getOffsetMinutes(this.chartOptions.offset, this.toMillis) * 60 * 1000);
        var startMillis = this.selectedFromMillis + (Utils.getOffsetMinutes(this.chartOptions.offset, this.selectedFromMillis) * 60 * 1000);
        var endMillis = this.selectedToMillis + (Utils.getOffsetMinutes(this.chartOptions.offset, this.selectedFromMillis) * 60 * 1000);
        this.dateTimeButton.render(this.chartOptions, this.fromMillis, this.toMillis, this.selectedFromMillis, this.selectedToMillis, function (fromMillis, toMillis, offset) {
            _this.chartOptions.offset = offset;
            _this.timePickerLineChart.chartOptions.offset = offset;
            _this.sparkLineChart.chartOptions.offset = offset;
            _this.dateTimePickerAction(fromMillis, toMillis);
            select(_this.renderTarget).select(".tsi-dateTimeContainer").node().focus();
        }, function () {
            _this.dateTimePickerContainer.style("display", "none");
            select(_this.renderTarget).select(".tsi-dateTimeContainer").node().focus();
        });
    };
    AvailabilityChart.prototype.setFromAndToTimes = function (fromMillis, toMillis, isFromButton) {
        if (isFromButton === void 0) { isFromButton = false; }
        var timezone = Utils.parseTimezoneName(this.chartOptions.offset);
        var timezoneAbbreviation = Utils.timezoneAbbreviation(timezone);
        this.setSelectedMillis(fromMillis, toMillis);
        if (!isFromButton) {
            this.renderDateTimeButton();
        }
    };
    AvailabilityChart.prototype.drawGhost = function () {
        var svgGroup = this.targetElement.select('.tsi-sparklineContainer').select(".tsi-lineChartSVG").select(".svgGroup");
        svgGroup.selectAll(".ghostRect").remove();
        svgGroup.append("rect")
            .classed("ghostRect", true)
            .attr("x", Math.max(this.sparkLineChart.x.range()[0], this.sparkLineChart.x(new Date(this.selectedFromMillis))))
            .attr("y", 0)
            .attr("width", Math.min(Math.max(this.minGhostWidth, this.sparkLineChart.x(new Date(this.selectedToMillis)) - this.sparkLineChart.x(new Date(this.selectedFromMillis))), this.sparkLineChart.x.range()[1] - this.sparkLineChart.x.range()[0]))
            .attr("height", 8)
            .attr("fill", this.chartOptions.color ? this.chartOptions.color : 'dark-grey')
            .attr("fill-opacity", .3)
            .attr("pointer-events", "none");
    };
    AvailabilityChart.prototype.drawWarmRange = function () {
        var svgGroup = this.targetElement.select('.tsi-timePickerContainer').select(".tsi-lineChartSVG").select(".svgGroup");
        if (svgGroup.select('.tsi-warmRect').empty()) {
            svgGroup.append("rect")
                .classed("tsi-warmRect", true);
            svgGroup.select('.brushElem').raise();
        }
        var warmRect = svgGroup.select(".tsi-warmRect");
        var outOfRange = true;
        if (this.chartOptions.warmStoreRange) {
            var warmStart = new Date(this.chartOptions.warmStoreRange[0]);
            var boundedWarmStart = new Date(Math.max(warmStart.valueOf(), this.zoomedFromMillis));
            var warmEnd = new Date(this.chartOptions.warmStoreRange.length === 2 ? this.chartOptions.warmStoreRange[1] : this.toMillis);
            var boundedWarmEnd = new Date(Math.min(warmEnd.valueOf(), this.zoomedToMillis));
            if (boundedWarmStart < boundedWarmEnd) {
                outOfRange = false;
                warmRect.attr("x", Math.max(this.timePickerLineChart.x(boundedWarmStart)))
                    .attr("y", this.chartOptions.isCompact ? 12 : -8)
                    .attr("width", this.timePickerLineChart.x(boundedWarmEnd) - this.timePickerLineChart.x(boundedWarmStart))
                    .attr("height", this.chartOptions.isCompact ? 4 : Math.max((this.targetElement.select('.tsi-timePickerContainer').select(".tsi-lineChartSVG").node().getBoundingClientRect().height - 44), 0))
                    .attr("fill-opacity", this.chartOptions.isCompact ? .8 : .08)
                    .attr('stroke-opacity', this.chartOptions.isCompact ? 0 : .5)
                    .attr("pointer-events", "none");
            }
        }
        if (outOfRange || this.chartOptions.warmStoreRange === null) {
            warmRect.style('display', 'none');
        }
        else {
            warmRect.style('display', 'block');
        }
    };
    AvailabilityChart.prototype.buildCompactFromAndTo = function () {
        this.timePickerContainer.selectAll('.tsi-compactFromTo').remove();
        // if the view is compact and there is a datetimebuttonrange present, we don't need compact from and to
        if (this.chartOptions.persistDateTimeButtonRange)
            return;
        var brushPositions = this.timePickerLineChart.getBrushPositions();
        var leftTimeText = null;
        var rightTimeText = null;
        if (this.selectedFromMillis != null && this.selectedToMillis != null) {
            leftTimeText = this.timePickerContainer.append('div')
                .classed('tsi-compactFromTo', true)
                .style('left', (brushPositions.leftPos != null ? Math.max(brushPositions.leftPos, 5) : 5) + 'px')
                .text(Utils.timeFormat(false, false, this.chartOptions.offset, this.chartOptions.is24HourTime, null, null, this.chartOptions.dateLocale)(new Date(this.selectedFromMillis)));
            var timezoneAbbreviation = ' (' + Utils.createTimezoneAbbreviation(this.chartOptions.offset) + ')';
            rightTimeText = this.timePickerContainer.append('div')
                .attr('class', 'tsi-compactFromTo')
                .style('right', brushPositions.rightPos != null ? 'calc(100% - ' + brushPositions.rightPos + 'px)' : '5px')
                .style('left', 'auto')
                .text(Utils.timeFormat(false, false, this.chartOptions.offset, this.chartOptions.is24HourTime, null, null, this.chartOptions.dateLocale)(new Date(this.selectedToMillis)) + timezoneAbbreviation);
        }
        if (leftTimeText && rightTimeText) {
            var rightSideOfLeft = leftTimeText.node().getBoundingClientRect().left + leftTimeText.node().getBoundingClientRect().width;
            var leftSideOfRight = rightTimeText.node().getBoundingClientRect().left;
            var totalWidth = this.timePickerContainer.node().getBoundingClientRect().width;
            var minOffset = 40;
            if (leftSideOfRight - rightSideOfLeft < minOffset) { // if there is overlap (or near overlap), correction needed
                var correction = (rightSideOfLeft - leftSideOfRight + minOffset) / 2;
                //if the correction puts either side off the edge of the container, weight the correction to the other side
                var leftWeight = 1;
                var rightWeight = 1;
                var padding = 32;
                if ((brushPositions.leftPos - correction) < padding) {
                    leftWeight = 1 - ((padding - (brushPositions.leftPos - correction)) / correction);
                    rightWeight = 2 - leftWeight;
                }
                if ((brushPositions.rightPos + correction) > (totalWidth - padding)) {
                    rightWeight = 1 - (padding - (totalWidth - brushPositions.rightPos - correction)) / correction;
                    leftWeight = 2 - rightWeight;
                }
                rightTimeText.style('right', 'calc(100% - ' + Math.round((brushPositions.rightPos + (rightWeight * correction))) + 'px)')
                    .style('left', 'auto');
                leftTimeText.style('left', (brushPositions.leftPos - (leftWeight * correction)) + 'px');
            }
        }
    };
    AvailabilityChart.prototype.offsetUTC = function (date) {
        date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
        return date;
    };
    AvailabilityChart.prototype.buildFromAndToContainer = function () {
        var dateTimeContainer = this.timePickerTextContainer.append('div').classed('tsi-dateTimeContainer', true);
        var timeframeLabel = dateTimeContainer.append("label").text(this.getString("Timeframe"));
        var dateTimeButtonContainer = dateTimeContainer.append("div")
            .classed('tsi-dateTimeButtonContainer', true);
        this.dateTimeButton = new DateTimeButtonRange(dateTimeButtonContainer.node());
    };
    AvailabilityChart.prototype.setTicks = function () {
        this.timePickerLineChart.updateXAxis();
        var forceFirst = (this.timePickerLineChart.zoomedFromMillis == this.timePickerLineChart.fromMillis) && (this.zoomedFromMillis == this.fromMillis);
        var forceLast = (this.timePickerLineChart.zoomedToMillis == this.timePickerLineChart.toMillis) && (this.zoomedToMillis == this.toMillis);
        this.timePickerLineChart.updateXAxis(forceFirst, forceLast);
        var ticks = this.timePickerContainer.select('.tsi-timePickerChart')
            .select('.xAxis')
            .selectAll('.tick');
        ticks.each(function (d, i) {
            var elt = select(this);
            elt.classed((i === 0 && forceFirst ? 'tsi-fromTick' : (i === ticks.size() - 1 && forceLast ? 'tsi-toTick' : '')), true);
        });
    };
    AvailabilityChart.prototype.setAvailabilityRange = function (fromMillis, toMillis) {
        this.zoomedFromMillis = fromMillis;
        this.zoomedToMillis = toMillis;
        var visibileAvailability = this.createDisplayBuckets(fromMillis, toMillis);
        this.chartOptions.keepBrush = true;
        var aeWithNewTimeSpan = __assign(__assign({}, this.ae[0]), { searchSpan: {
                from: (new Date(fromMillis)),
                to: (new Date(toMillis))
            } });
        this.timePickerLineChart.render(visibileAvailability, this.chartOptions, [aeWithNewTimeSpan]);
        this.setTicks();
        this.drawWarmRange();
        this.timePickerLineChart.setBrush();
    };
    AvailabilityChart.prototype.setBrush = function (fromMillis, toMillis, isFromButton) {
        if (isFromButton === void 0) { isFromButton = false; }
        this.timePickerLineChart.setBrushEndTime(new Date(toMillis));
        this.timePickerLineChart.setBrushStartTime(new Date(fromMillis));
        this.timePickerLineChart.setBrush();
        this.setFromAndToTimes(fromMillis, toMillis, isFromButton);
        this.drawGhost();
        if (this.chartOptions.isCompact)
            this.buildCompactFromAndTo();
    };
    AvailabilityChart.prototype.createSparkLineOptions = function (chartOptions) {
        var _this = this;
        return {
            aggTopMargin: 0,
            theme: chartOptions.theme,
            grid: false,
            tooltip: false,
            legend: "hidden",
            brushContextMenuActions: [],
            snapBrush: false,
            keepBrush: false,
            xAxisHidden: true,
            yAxisHidden: true,
            focusHidden: true,
            minBrushWidth: 5,
            color: null,
            brushHandlesVisible: true,
            brushMoveAction: function (from, to) {
                _this.setAvailabilityRange(from.valueOf(), to.valueOf());
            },
            brushClearable: false,
            hideChartControlPanel: true,
            brushRangeVisible: false,
            isArea: true
        };
    };
    return AvailabilityChart;
}(ChartComponent));

var UXClient = /** @class */ (function () {
    function UXClient() {
        // Public facing components have class constructors exposed as public UXClient members.
        // This allows for typings to be bundled while maintaining 'new Component()' syntax
        this.DateTimePicker = DateTimePicker;
        this.PieChart = PieChart;
        this.ScatterPlot = ScatterPlot;
        this.BarChart = GroupedBarChart;
        this.LineChart = LineChart;
        this.AvailabilityChart = AvailabilityChart;
        this.Grid = Grid;
        this.Slider = Slider;
        this.Hierarchy = Hierarchy;
        this.AggregateExpression = AggregateExpression;
        this.TsqExpression = TsqExpression;
        this.Heatmap = Heatmap;
        this.EventsTable = EventsTable;
        this.ModelSearch = ModelSearch;
        this.ModelAutocomplete = ModelAutocomplete;
        this.HierarchyNavigation = HierarchyNavigation;
        this.TimezonePicker = TimezonePicker;
        this.EllipsisMenu = EllipsisMenu;
        this.SingleDateTimePicker = SingleDateTimePicker;
        this.DateTimeButtonSingle = DateTimeButtonSingle;
        this.DateTimeButtonRange = DateTimeButtonRange;
        this.ProcessGraphic = ProcessGraphic;
        this.PlaybackControls = PlaybackControls;
        this.ColorPicker = ColorPicker;
        this.GeoProcessGraphic = GeoProcessGraphic;
    }
    UXClient.prototype.UXClient = function () {
    };
    UXClient.prototype.transformTsxToEventsArray = function (events, options) {
        var timezoneOffset = options.timezoneOffset ? options.timezoneOffset : 0;
        var rows = [];
        var eventSourceProperties = {};
        var nameToStrippedPropName = {};
        var valueToStrippedValueMap = {};
        var _loop_1 = function () {
            if (events[eventIdx].hasOwnProperty('schema')) {
                eventSourceProperties[events[eventIdx].schema.rid] = {};
                eventSourceProperties[events[eventIdx].schema.rid].propertyNames = events[eventIdx].schema.properties.reduce(function (prev, curr) {
                    prev.push({ name: curr.name, type: curr.type });
                    return prev;
                }, []);
                eventSourceProperties[events[eventIdx].schema.rid].eventSourceName = events[eventIdx].schema['$esn'];
                eventSourceId = events[eventIdx].schema.rid;
            }
            else {
                eventSourceId = events[eventIdx].schemaRid;
            }
            timeStamp = (new Date((new Date(events[eventIdx]['$ts'])).valueOf() - timezoneOffset)).toISOString().slice(0, -1).replace('T', ' ');
            event = { 'timestamp ($ts)': timeStamp };
            // lts logic
            lts = events[eventIdx]['$lts'] ? events[eventIdx]['$lts'] : null;
            if (lts) {
                event['LocalTimestamp_DateTime'] = {
                    value: lts.replace('T', ' '),
                    name: 'LocalTimestamp',
                    type: 'DateTime'
                };
            }
            event["EventSourceName_String"] = {
                value: eventSourceProperties[eventSourceId].eventSourceName,
                name: 'EventSourceName',
                type: 'String'
            };
            for (var propIdx in eventSourceProperties[eventSourceId].propertyNames) {
                name = eventSourceProperties[eventSourceId].propertyNames[propIdx].name;
                if (!nameToStrippedPropName.hasOwnProperty(name))
                    nameToStrippedPropName[name] = Utils.stripForConcat(name);
                strippedName = nameToStrippedPropName[name];
                type = eventSourceProperties[eventSourceId].propertyNames[propIdx].type;
                columnNameAndType = strippedName + "_" + type;
                if (!valueToStrippedValueMap.hasOwnProperty(String(events[eventIdx].values[propIdx])))
                    valueToStrippedValueMap[String(events[eventIdx].values[propIdx])] = Utils.stripForConcat(String(events[eventIdx].values[propIdx]));
                eventObject = {
                    value: valueToStrippedValueMap[String(events[eventIdx].values[propIdx])],
                    name: strippedName,
                    type: type
                };
                event[columnNameAndType] = eventObject;
            }
            if (events[eventIdx].hasOwnProperty('$op')) {
                var defaultType_1 = 'String';
                var otherProps_1 = JSON.parse(events[eventIdx]['$op']);
                Object.keys(otherProps_1).forEach(function (propNameRaw) {
                    var strippedNameOP = Utils.stripForConcat(propNameRaw);
                    var columnNameAndTypeOP = strippedNameOP + '_String';
                    event[columnNameAndTypeOP] = {
                        value: otherProps_1[propNameRaw],
                        name: strippedNameOP,
                        type: defaultType_1
                    };
                });
            }
            rows.push(event);
        };
        var eventSourceId, timeStamp, event, lts, name, strippedName, type, columnNameAndType, eventObject;
        for (var eventIdx in events) {
            _loop_1();
        }
        return rows;
    };
    UXClient.prototype.toISONoMillis = function (dateTime) {
        return dateTime.toISOString().slice(0, -5) + "Z";
    };
    //specifiedRange gives the subset of availability buckets to be returned. If not included, will return all buckets
    UXClient.prototype.transformAvailabilityForVisualization = function (availabilityTsx) {
        var _this = this;
        var from = new Date(availabilityTsx.range.from);
        var to = new Date(availabilityTsx.range.to);
        var rawBucketSize = Utils.parseTimeInput(availabilityTsx.intervalSize);
        var buckets = {};
        var startBucket = Math.round(Math.floor(from.valueOf() / rawBucketSize) * rawBucketSize);
        var firstKey = this.toISONoMillis(new Date(startBucket));
        var firstCount = availabilityTsx.distribution[firstKey] ? availabilityTsx.distribution[firstKey] : 0;
        // reset first key if greater than the availability range from
        if (startBucket < (new Date(availabilityTsx.range.from)).valueOf())
            firstKey = this.toISONoMillis(new Date(availabilityTsx.range.from));
        buckets[firstKey] = { count: firstCount };
        Object.keys(availabilityTsx.distribution).forEach(function (key) {
            var formattedISO = _this.toISONoMillis(new Date(key));
            buckets[formattedISO] = { count: availabilityTsx.distribution[key] };
        });
        //set end time value
        var lastBucket = Math.round(Math.floor(to.valueOf() / rawBucketSize) * rawBucketSize);
        // pad out if range is less than one bucket;
        if (startBucket == lastBucket) {
            for (var i = startBucket; i <= startBucket + rawBucketSize; i += (rawBucketSize / 60)) {
                if (buckets[this.toISONoMillis(new Date(i))] == undefined)
                    buckets[this.toISONoMillis(new Date(i))] = { count: 0 };
            }
            //reset startBucket to count 0 if not the start time
            if (startBucket != from.valueOf()) {
                buckets[this.toISONoMillis(new Date(startBucket))] = { count: 0 };
            }
        }
        return [{ "availabilityCount": { "": buckets } }];
    };
    UXClient.prototype.transformTsqResultsForVisualization = function (tsqResults, options) {
        var result = [];
        tsqResults.forEach(function (tsqr, i) {
            var transformedAggregate = {};
            var aggregatesObject = {};
            transformedAggregate[options[i].alias] = { '': aggregatesObject };
            if (tsqr.hasOwnProperty('__tsiError__'))
                transformedAggregate[''] = {};
            else {
                tsqr.timestamps.forEach(function (ts, j) {
                    aggregatesObject[ts] = tsqr.properties.reduce(function (p, c) { p[c.name] = c['values'][j]; return p; }, {});
                });
            }
            result.push(transformedAggregate);
        });
        return result;
    };
    UXClient.prototype.transformAggregatesForVisualization = function (aggregates, options) {
        var result = [];
        aggregates.forEach(function (agg, i) {
            var transformedAggregate = {};
            var aggregatesObject = {};
            transformedAggregate[options[i].alias] = aggregatesObject;
            if (agg.hasOwnProperty('__tsiError__'))
                transformedAggregate[''] = {};
            else if (agg.hasOwnProperty('aggregate')) {
                agg.dimension.forEach(function (d, j) {
                    var dateTimeToValueObject = {};
                    aggregatesObject[d] = dateTimeToValueObject;
                    agg.aggregate.dimension.forEach(function (dt, k) {
                        var measuresObject = {};
                        dateTimeToValueObject[dt] = measuresObject;
                        options[i].measureTypes.forEach(function (t, l) {
                            if (agg.aggregate.measures[j][k] != null && agg.aggregate.measures[j][k] != undefined &&
                                agg.aggregate.measures[j][k][l] != null && agg.aggregate.measures[j][k][l] != undefined)
                                measuresObject[t] = agg.aggregate.measures[j][k][l];
                            else
                                measuresObject[t] = null;
                        });
                    });
                });
            }
            else {
                var dateTimeToValueObject = {};
                aggregatesObject[''] = dateTimeToValueObject;
                agg.dimension.forEach(function (dt, j) {
                    var measuresObject = {};
                    dateTimeToValueObject[dt] = measuresObject;
                    options[i].measureTypes.forEach(function (t, l) {
                        measuresObject[t] = agg.measures[j][l];
                    });
                });
            }
            result.push(transformedAggregate);
        });
        return result;
    };
    // exposed publicly to use for highlighting elements in the well on hover/focus
    UXClient.prototype.createEntityKey = function (aggName, aggIndex) {
        if (aggIndex === void 0) { aggIndex = 0; }
        return Utils.createEntityKey(aggName, aggIndex);
    };
    UXClient.prototype.transformTsqResultsToEventsArray = function (results) {
        var flattenedResults = [];
        results.forEach(function (tsqr) {
            tsqr.timestamps.forEach(function (ts, idx) {
                var event = {};
                event['timestamp ($ts)'] = ts;
                tsqr.properties.forEach(function (p) {
                    event[p.name + "_" + p.type] = { name: p.name, type: p.type, value: p.values[idx] };
                });
                flattenedResults.push(event);
            });
        });
        return flattenedResults.sort(function (a, b) { return (new Date(a['timestamp ($ts)'])).valueOf() < (new Date(b['timestamp ($ts)'])).valueOf() ? -1 : 1; });
    };
    return UXClient;
}());

export { AvailabilityChart as A, UXClient as U };
