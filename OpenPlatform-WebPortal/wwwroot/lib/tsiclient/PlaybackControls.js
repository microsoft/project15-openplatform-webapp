import { a as __extends, U as Utils, b as Component } from './Utils-e5be3308.js';
import { select, scaleTime, drag, event } from 'd3';
import 'moment-timezone';
import './EllipsisMenu.js';
import 'split.js';
import './ChartComponent-a7f89f69.js';
import './ChartDataOptions-59f6b399.js';
import './ChartVisualizationComponent-80709f0f.js';
import { T as TemporalXAxisComponent } from './TemporalXAxisComponent-f960f34b.js';

var PlaybackControls = /** @class */ (function (_super) {
    __extends(PlaybackControls, _super);
    function PlaybackControls(renderTarget, initialTimeStamp) {
        if (initialTimeStamp === void 0) { initialTimeStamp = null; }
        var _this = _super.call(this, renderTarget) || this;
        _this.handleRadius = 7;
        _this.minimumPlaybackInterval = 1000; // 1 second
        _this.playbackInterval = null;
        _this.selectedTimeStamp = initialTimeStamp;
        return _this;
    }
    Object.defineProperty(PlaybackControls.prototype, "currentTimeStamp", {
        get: function () {
            return this.selectedTimeStamp;
        },
        enumerable: false,
        configurable: true
    });
    PlaybackControls.prototype.render = function (start, end, onSelectTimeStamp, options, playbackSettings) {
        var _this = this;
        this.end = end;
        this.selectTimeStampCallback = onSelectTimeStamp;
        this.chartOptions.setOptions(options);
        this.playbackSettings = playbackSettings;
        this.timeFormatter = Utils.timeFormat(true, false, this.chartOptions.offset, this.chartOptions.is24HourTime, null, null, this.chartOptions.dateLocale);
        var targetElement = select(this.renderTarget);
        _super.prototype.themify.call(this, targetElement, this.chartOptions.theme);
        targetElement.html('');
        var sliderContainer = targetElement.append('div')
            .classed('tsi-playback-timeline', true);
        var sliderContainerWidth = sliderContainer.node().clientWidth;
        var sliderContainerHeight = sliderContainer.node().clientHeight;
        this.trackXOffset = this.handleRadius + 8;
        this.trackYOffset = Math.floor(sliderContainerHeight / 2);
        this.trackWidth = sliderContainerWidth - (2 * this.trackXOffset);
        this.timeStampToPosition = scaleTime()
            .domain([start, end])
            .range([0, this.trackWidth]);
        var timeAxisContainer = sliderContainer.append('div')
            .classed('tsi-playback-axis', true)
            .style('top', this.trackYOffset + 6 + "px")
            .style('left', this.trackXOffset + "px")
            .style('width', this.trackWidth + "px");
        var timeAxis = new TimeAxis(timeAxisContainer.node());
        timeAxis.render(this.chartOptions, this.timeStampToPosition);
        var gWrapper = sliderContainer
            .append('svg')
            .append('g');
        sliderContainer.append('div')
            .classed('tsi-playback-input', true)
            .style('left', this.trackXOffset + "px")
            .style('width', this.trackWidth + "px");
        this.track = gWrapper
            .append('g')
            .classed('tsi-playback-track', true);
        gWrapper.call(drag()
            .container(sliderContainer.select('.tsi-playback-input').node())
            .on('start.interrupt', function () { gWrapper.interrupt(); })
            .on('start drag', function () {
            _this.onDrag(event.x);
        })
            .on('end', function () {
            _this.onDragEnd();
        }));
        this.track.append('line')
            .classed('tsi-left-of-handle', true)
            .attr('y1', this.trackYOffset)
            .attr('y2', this.trackYOffset);
        this.track.append('line')
            .classed('tsi-right-of-handle', true)
            .attr('y1', this.trackYOffset)
            .attr('y2', this.trackYOffset);
        this.handleElement = gWrapper.append('circle')
            .classed('tsi-playback-handle', true)
            .attr('r', this.handleRadius)
            .attr('cy', this.trackYOffset);
        this.controlsContainer = targetElement.append('div')
            .classed('tsi-playback-buttons', true);
        this.playButton = this.controlsContainer.append('button')
            .classed('tsi-play-button', this.playbackInterval === null)
            .classed('tsi-pause-button', this.playbackInterval !== null)
            .on('click', function () {
            if (_this.playbackInterval === null) {
                _this.play();
            }
            else {
                _this.pause();
            }
        });
        this.controlsContainer.append('span')
            .classed('tsi-playback-timestamp', true)
            .style('margin', "0 " + this.trackXOffset + "px");
        this.selectedTimeStamp = this.selectedTimeStamp || start;
        var handlePosition = this.timeStampToPosition(this.selectedTimeStamp);
        this.updateSelection(handlePosition, this.selectedTimeStamp);
    };
    PlaybackControls.prototype.play = function () {
        if (this.playbackInterval === null) {
            // Default to an interval if one is not provided. Also, the interval should
            // not be lower than the minimum playback interval.
            var playbackIntervalMs = Math.max(this.playbackSettings.intervalMillis || this.minimumPlaybackInterval, this.minimumPlaybackInterval);
            this.next();
            this.playbackInterval = window.setInterval(this.next.bind(this), playbackIntervalMs);
            this.playButton
                .classed('tsi-play-button', false)
                .classed('tsi-pause-button', true);
        }
    };
    PlaybackControls.prototype.pause = function () {
        // Pause only if component is in 'play' mode (i.e. an interval has ben set)
        // otherwise, do nothing.
        if (this.playbackInterval !== null) {
            window.clearInterval(this.playbackInterval);
            this.playbackInterval = null;
            this.playButton
                .classed('tsi-play-button', true)
                .classed('tsi-pause-button', false);
        }
    };
    PlaybackControls.prototype.next = function () {
        // If we've reached the end of the available time stamps, do nothing until 
        // the end moves forward.
        if (this.selectedTimeStamp.valueOf() === this.end.valueOf()) {
            return;
        }
        var newValue = this.selectedTimeStamp.valueOf() + this.playbackSettings.stepSizeMillis;
        newValue = Math.min(newValue, this.end.valueOf());
        this.selectedTimeStamp = new Date(newValue);
        var handlePosition = this.timeStampToPosition(this.selectedTimeStamp);
        this.updateSelection(handlePosition, this.selectedTimeStamp);
        this.selectTimeStampCallback(this.selectedTimeStamp);
    };
    PlaybackControls.prototype.clamp = function (number, min, max) {
        var clamped = Math.max(number, min);
        return Math.min(clamped, max);
    };
    PlaybackControls.prototype.onDrag = function (positionX) {
        this.wasPlayingWhenDragStarted = this.wasPlayingWhenDragStarted ||
            (this.playbackInterval !== null);
        this.pause();
        var handlePosition = this.clamp(positionX, 0, this.trackWidth);
        this.selectedTimeStamp = this.timeStampToPosition.invert(handlePosition);
        this.updateSelection(handlePosition, this.selectedTimeStamp);
    };
    PlaybackControls.prototype.onDragEnd = function () {
        this.selectTimeStampCallback(this.selectedTimeStamp);
        if (this.wasPlayingWhenDragStarted) {
            this.play();
            this.wasPlayingWhenDragStarted = false;
        }
    };
    PlaybackControls.prototype.updateSelection = function (handlePositionX, timeStamp) {
        this.track.select('.tsi-left-of-handle')
            .attr('x1', this.trackXOffset)
            .attr('x2', this.trackXOffset + handlePositionX);
        this.track.select('.tsi-right-of-handle')
            .attr('x1', this.trackXOffset + handlePositionX)
            .attr('x2', this.trackXOffset + this.trackWidth);
        this.handleElement
            .attr('cx', this.trackXOffset + handlePositionX);
        this.controlsContainer
            .select('.tsi-playback-timestamp')
            .text(this.timeFormatter(timeStamp));
    };
    return PlaybackControls;
}(Component));
var TimeAxis = /** @class */ (function (_super) {
    __extends(TimeAxis, _super);
    function TimeAxis(renderTarget) {
        return _super.call(this, renderTarget) || this;
    }
    TimeAxis.prototype.render = function (options, timeScale) {
        this.chartOptions.setOptions(options);
        this.x = timeScale;
        if (this.chartOptions.xAxisHidden) {
            return;
        }
        var targetElement = select(this.renderTarget);
        targetElement.html('');
        this.chartWidth = targetElement.node().clientWidth;
        this.xAxis = targetElement.append('svg')
            .classed('xAxis', true)
            .data([this.x]);
        this.drawXAxis(0, true, true);
    };
    return TimeAxis;
}(TemporalXAxisComponent));

export default PlaybackControls;
