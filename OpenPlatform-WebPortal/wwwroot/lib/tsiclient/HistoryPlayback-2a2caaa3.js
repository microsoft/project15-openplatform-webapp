import { U as Utils, a as __extends, h as __awaiter, j as __generator, b as Component } from './Utils-e5be3308.js';
import { select } from 'd3';
import ServerClient from './ServerClient.js';
import PlaybackControls from './PlaybackControls.js';

var TsqRange = /** @class */ (function () {
    function TsqRange(from, to) {
        this.from = from;
        this.to = to;
    }
    TsqRange.prototype.setNeatBucketSizeByNumerOfBuckets = function (targetNumberOfBuckets) {
        var timeRangeMs = Math.max(this.to.valueOf() - this.from.valueOf(), 1);
        var roughBucketsize = Math.ceil(timeRangeMs / targetNumberOfBuckets);
        this.setNeatBucketSizeByRoughBucketSize(roughBucketsize);
    };
    TsqRange.prototype.setNeatBucketSizeByRoughBucketSize = function (roughBucketSizeMillis) {
        var neatIntervalIndex = 1;
        for (; neatIntervalIndex < TsqRange.NeatIntervalsMs.length; neatIntervalIndex++) {
            if (TsqRange.NeatIntervalsMs[neatIntervalIndex] > roughBucketSizeMillis) {
                break;
            }
        }
        this.bucketSizeMs = TsqRange.NeatIntervalsMs[neatIntervalIndex - 1];
    };
    TsqRange.prototype.alignWithServerEpoch = function () {
        var fromMs = Utils.adjustStartMillisToAbsoluteZero(this.from.valueOf(), this.bucketSizeMs);
        var toMs = Utils.roundToMillis(this.to.valueOf(), this.bucketSizeMs);
        this.from = new Date(fromMs);
        this.to = new Date(toMs);
    };
    Object.defineProperty(TsqRange.prototype, "fromMillis", {
        get: function () {
            return this.from.valueOf();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TsqRange.prototype, "toMillis", {
        get: function () {
            return this.to.valueOf();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TsqRange.prototype, "bucketSizeMillis", {
        get: function () {
            return this.bucketSizeMs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TsqRange.prototype, "bucketSizeStr", {
        get: function () {
            var bucketSize = TsqRange.millisToLargestUnit(this.bucketSizeMs);
            return "" + bucketSize.value + bucketSize.unit;
        },
        enumerable: false,
        configurable: true
    });
    TsqRange.millisToLargestUnit = function (interval) {
        var value, unit;
        if (interval < 1000) {
            value = interval;
            unit = 'ms';
        }
        else if (interval < 1000 * 60) {
            value = Math.ceil(interval / 1000);
            unit = 's';
        }
        else if (interval < 1000 * 60 * 60) {
            value = Math.ceil(interval / (1000 * 60));
            unit = 'm';
        }
        else if (interval < 1000 * 60 * 60 * 24) {
            value = Math.ceil(interval / (1000 * 60 * 60));
            unit = 'h';
        }
        else {
            value = Math.ceil(interval / (1000 * 60 * 60 * 24));
            unit = 'd';
        }
        return { value: value, unit: unit };
    };
    // List of interval values that would divide a time range neatly
    TsqRange.NeatIntervals = [
        '1ms', '2ms', '4ms', '5ms', '8ms', '10ms', '20ms', '25ms', '40ms', '50ms', '100ms', '125ms', '200ms', '250ms', '500ms',
        '1s', '2s', '3s', '4s', '5s', '6s', '10s', '12s', '15s', '20s', '30s',
        '1m', '2m', '3m', '4m', '5m', '6m', '10m', '12m', '15m', '20m', '30m',
        '1h', '2h', '3h', '4h', '6h', '8h', '12h',
        '1d', '2d', '3d', '4d', '5d', '6d', '7d'
    ];
    TsqRange.NeatIntervalsMs = [
        1, 2, 4, 5, 8, 10, 20, 25, 40, 50, 100, 125, 200, 250, 500,
        1000, 2000, 3000, 4000, 5000, 6000, 10000, 12000, 15000, 20000, 30000,
        60000, 120000, 180000, 240000, 300000, 360000, 600000, 720000, 900000, 1200000, 1800000,
        3600000, 7200000, 10800000, 14400000, 21600000, 28800000, 43200000,
        86400000, 172800000, 259200000, 345600000, 432000000, 518400000, 604800000
    ];
    return TsqRange;
}());

var HistoryPlayback = /** @class */ (function (_super) {
    __extends(HistoryPlayback, _super);
    function HistoryPlayback(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.numberOfBuckets = 1000;
        _this.defaultPlaybackRate = 3000; // 3 seconds
        _this.fetchAvailabilityFrequency = 30000; // 30 seconds
        _this.playbackSliderHeight = 88;
        _this.previewApiFlag = '?api-version=2018-11-01-preview';
        _this.serverClient = new ServerClient();
        _this.currentCancelTrigger = null;
        return _this;
    }
    HistoryPlayback.prototype.onGraphicLoaded = function () { };
    HistoryPlayback.prototype.renderBase = function (environmentFqdn, getToken, data, chartOptions) {
        var _this = this;
        this.environmentFqdn = environmentFqdn;
        this.getAuthToken = getToken;
        this.tsqExpressions = data;
        this.chartOptions.setOptions(chartOptions);
        this.playbackRate = this.chartOptions.updateInterval || this.defaultPlaybackRate;
        this.getAuthToken().then(function (authToken) {
            _this.serverClient.getAvailability(authToken, _this.environmentFqdn, _this.previewApiFlag)
                .then(function (availabilityResponse) {
                if (!_this.availabilityInterval) {
                    _this.availabilityInterval = window.setInterval(_this.pollAvailability.bind(_this), _this.fetchAvailabilityFrequency);
                }
                var _a = _this.parseAvailabilityResponse(availabilityResponse), from = _a.from, to = _a.to;
                _this.updateAvailability(from, to);
                _this.targetElement = select(_this.renderTarget);
                _this.targetElement.html('');
                _this.targetElement.classed('tsi-process-graphic-target', true);
                _super.prototype.themify.call(_this, _this.targetElement, _this.chartOptions.theme);
                _this.componentContainer = _this.targetElement
                    .append('div')
                    .classed('tsi-process-graphic-container', true);
                _this.component = _this.componentContainer
                    .append('div')
                    .classed('tsi-process-graphic', true);
                _this.playbackControlsContainer = _this.targetElement
                    .append('div')
                    .classed('tsi-playback-controls-container', true);
                _this.loadResources().then(function () {
                    var initialTimeStamp = _this.chartOptions.initialValue instanceof Date ? _this.chartOptions.initialValue : from;
                    _this.playbackControls = new PlaybackControls(_this.playbackControlsContainer.node(), initialTimeStamp);
                    _this.onSelecTimestamp(initialTimeStamp);
                    _this.draw();
                    if (initialTimeStamp) {
                        _this.playbackControls.play();
                    }
                    window.addEventListener('resize', function () {
                        _this.draw();
                    });
                });
            })
                .catch(function (reason) {
                console.error("Failed while fetching data availability: " + reason);
            });
        })
            .catch(function (reason) {
            console.error("Failed to acquire authentication token: " + reason);
        });
    };
    HistoryPlayback.prototype.pauseAvailabilityUpdates = function () {
        if (this.availabilityInterval) {
            window.clearInterval(this.availabilityInterval);
        }
    };
    HistoryPlayback.prototype.pollAvailability = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getAuthToken().then(function (authToken) {
                        return _this.serverClient.getAvailability(authToken, _this.environmentFqdn, _this.previewApiFlag)
                            .then(function (availabilityResponse) {
                            var _a = _this.parseAvailabilityResponse(availabilityResponse), from = _a.from, to = _a.to;
                            if (from.valueOf() !== _this.availability.fromMillis ||
                                to.valueOf() !== _this.availability.toMillis) {
                                _this.updateAvailability(from, to);
                                _this.playbackControls.render(_this.availability.from, _this.availability.to, _this.onSelecTimestamp.bind(_this), _this.chartOptions, { intervalMillis: _this.playbackRate, stepSizeMillis: _this.availability.bucketSizeMillis });
                                return true;
                            }
                            return false;
                        })
                            .catch(function (reason) {
                            console.error("Failed to update data availability: " + reason);
                            return null;
                        });
                    })];
            });
        });
    };
    HistoryPlayback.prototype.onSelecTimestamp = function (timeStamp) {
        var _this = this;
        var queryWindow = this.calcQueryWindow(timeStamp);
        var tsqArray = this.tsqExpressions.map(function (tsqExpression) {
            tsqExpression.searchSpan = {
                from: queryWindow.fromMillis,
                to: queryWindow.toMillis,
                bucketSize: queryWindow.bucketSize
            };
            return tsqExpression.toTsq();
        });
        this.getAuthToken().then(function (authToken) {
            var _a = _this.serverClient.getCancellableTsqResults(authToken, _this.environmentFqdn, tsqArray), promise = _a[0], cancelTrigger = _a[1];
            // We keep track of the last AJAX call we made to the server, and cancel it if it hasn't finished yet. This is
            // a cheap way to avoid a scenario where we get out-of-order responses back from the server during 'play' mode.
            // We can revisit this at a later time if we need to handle it in a more sophisticated way.
            if (_this.currentCancelTrigger) {
                _this.currentCancelTrigger();
            }
            _this.currentCancelTrigger = cancelTrigger;
            promise.then(function (results) {
                _this.getDataPoints(results);
            });
        });
    };
    HistoryPlayback.prototype.calcQueryWindow = function (timeStamp) {
        var timelineOffset = this.availability.fromMillis;
        var queryToMillis = Math.ceil((timeStamp.valueOf() - timelineOffset) / this.availability.bucketSizeMillis) * this.availability.bucketSizeMillis + timelineOffset;
        return {
            fromMillis: queryToMillis - this.availability.bucketSizeMillis,
            toMillis: queryToMillis,
            bucketSize: this.availability.bucketSizeStr
        };
    };
    HistoryPlayback.prototype.drawBase = function () {
        this.playbackControlsContainer
            .style('width', this.renderTarget.clientWidth + "px")
            .style('height', this.playbackSliderHeight + "px");
        this.playbackControls.render(this.availability.from, this.availability.to, this.onSelecTimestamp.bind(this), this.chartOptions, { intervalMillis: this.playbackRate, stepSizeMillis: this.availability.bucketSizeMillis });
    };
    HistoryPlayback.prototype.updateAvailability = function (from, to) {
        this.availability = new TsqRange(from, to);
        if (this.chartOptions.bucketSizeMillis && this.chartOptions.bucketSizeMillis > 0) {
            this.availability.setNeatBucketSizeByRoughBucketSize(this.chartOptions.bucketSizeMillis);
        }
        else {
            this.availability.setNeatBucketSizeByNumerOfBuckets(this.numberOfBuckets);
        }
        this.availability.alignWithServerEpoch();
    };
    HistoryPlayback.prototype.parseAvailabilityResponse = function (response) {
        var range = response && response.availability && response.availability.range;
        var from = (range && range.from && new Date(range.from)) || null;
        var to = (range && range.to && new Date(range.to)) || null;
        if (from === null || to === null) {
            throw 'Query to get availability returned a response with an unexpected structure';
        }
        return { from: from, to: to };
    };
    return HistoryPlayback;
}(Component));

export { HistoryPlayback as H };
