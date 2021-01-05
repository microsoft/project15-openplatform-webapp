import { curveLinear, curveStep, curveStepBefore, curveStepAfter, curveBasis, curveCardinal, curveMonotoneX, curveCatmullRom, event, select, format, scaleSequential, interpolateCubehelixDefault, hcl, scaleLinear } from 'd3';
import moment from 'moment-timezone';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */
var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) {
            for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p];
        };
    return extendStatics(d, b);
};
function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function () {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            }
        }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = { label: 0, sent: function () {
            if (t[0] & 1)
                throw t[1];
            return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (_)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
}
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
        s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var KeyCodes;
(function (KeyCodes) {
    KeyCodes[KeyCodes["Tab"] = 9] = "Tab";
    KeyCodes[KeyCodes["Esc"] = 27] = "Esc";
    KeyCodes[KeyCodes["Enter"] = 13] = "Enter";
    KeyCodes[KeyCodes["Up"] = 38] = "Up";
    KeyCodes[KeyCodes["Down"] = 40] = "Down";
})(KeyCodes || (KeyCodes = {}));
// search api params
var InstancesSort;
(function (InstancesSort) {
    InstancesSort["DisplayName"] = "DisplayName";
    InstancesSort["Rank"] = "Rank";
})(InstancesSort || (InstancesSort = {}));
var HierarchiesExpand;
(function (HierarchiesExpand) {
    HierarchiesExpand["UntilChildren"] = "UntilChildren";
    HierarchiesExpand["OneLevel"] = "OneLevel";
})(HierarchiesExpand || (HierarchiesExpand = {}));
var HierarchiesSort;
(function (HierarchiesSort) {
    HierarchiesSort["Name"] = "Name";
    HierarchiesSort["CumulativeInstanceCount"] = "CumulativeInstanceCount";
})(HierarchiesSort || (HierarchiesSort = {}));
var MetadataPropertyTypes;
(function (MetadataPropertyTypes) {
    MetadataPropertyTypes["Double"] = "Double";
    MetadataPropertyTypes["String"] = "String";
    MetadataPropertyTypes["DateTime"] = "DateTime";
    MetadataPropertyTypes["Long"] = "Long";
})(MetadataPropertyTypes || (MetadataPropertyTypes = {}));
var ShiftTypes;
(function (ShiftTypes) {
    ShiftTypes["startAt"] = "Start at";
    ShiftTypes["shifted"] = "shifted";
})(ShiftTypes || (ShiftTypes = {}));
var InterpolationFunctions;
(function (InterpolationFunctions) {
    InterpolationFunctions["None"] = "";
    InterpolationFunctions["CurveLinear"] = "curveLinear";
    InterpolationFunctions["CurveStep"] = "curveStep";
    InterpolationFunctions["CurveStepBefore"] = "curveStepBefore";
    InterpolationFunctions["CurveStepAfter"] = "curveStepAfter";
    InterpolationFunctions["CurveBasis"] = "curveBasis";
    InterpolationFunctions["CurveCardinal"] = "curveCardinal";
    InterpolationFunctions["CurveMonotoneX"] = "curveMonotoneX";
    InterpolationFunctions["CurveCatmullRom"] = "curveCatmullRom";
})(InterpolationFunctions || (InterpolationFunctions = {}));
var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes["InvalidInput"] = "InvalidInput";
    ErrorCodes["PartialSuccess"] = "PartialSuccess";
})(ErrorCodes || (ErrorCodes = {}));

var Strings = /** @class */ (function () {
    function Strings() {
        this.stringValueDefaults = {
            "Last 30 mins": "Last 30 mins",
            "Last Hour": "Last Hour",
            "Last 2 Hours": "Last 2 Hours",
            "Last 4 Hours": "Last 4 Hours",
            "Last 12 Hours": "Last 12 Hours",
            "Last 24 Hours": "Last 24 Hours",
            "Last 7 Days": "Last 7 Days",
            "Last 30 Days": "Last 30 Days",
            "Custom": "Custom",
            "Timeframe": "Timeframe",
            "Save": "Save",
            "timezone": "timezone",
            "start": "start",
            "end": "end",
            "Latest": "Latest",
            "Show ellipsis menu": "Show ellipsis menu",
            "Hide ellipsis menu": "Hide ellipsis menu",
            "Download as CSV": "Download as CSV",
            "Toggle all columns": "Toggle all columns",
            "All Columns": "All Columns",
            "only": "only",
            "Invalid Date": "Invalid Date",
            "Stack/Unstack Bars": "Stack/Unstack Bars",
            "Stack bars": "Stack bars",
            "Unstack bars": "Unstack bars",
            "No filter results": "No filter results",
            "All hierarchies": "All hierarchies",
            "Selected": "Selected",
            "toggle visibility for": "toggle visibility for",
            "Series type selection for": "Series type selection for",
            "shifted": "shifted",
            "Click to drop marker": "Click to drop marker",
            "drag to reposition": "drag to reposition",
            "Delete marker at": "Delete marker at",
            "set axis state to": "set axis state to",
            "Drop a Marker": "Drop a Marker",
            "Search Time Series Instances": "Search Time Series Instances",
            "No results": "No results",
            "Show more": "Show more",
            "No description": "No description",
            "Time Series ID": "Time Series ID",
            "Currently displayed time is": "Currently displayed time is",
            "Left arrow to go back in time": "Left arrow to go back in time",
            "right arrow to go forward": "right arrow to go forward",
            "Local": "Local",
            "Display Grid": "Display Grid",
            "Previous Month": "Previous Month",
            "Next Month": "Next Month",
            "Unassigned Time Series Instances": "Unassigned Time Series Instances",
            "Search Globally": "Search Globally",
            "Show More Instances": "Show more instances",
            "Show More Hierarchies": "Show more hierarchies",
            "Add to Filter Path": "Add to Filter Path",
            "Empty": "Empty",
            "Date/Time": "Date/Time",
            "show series": "show series",
            "hide series": "hide series",
            "in group": "in group",
            "show group": "show group",
            "hide group": "hide group",
            "Use the arrow keys to navigate the values of each cell": "Use the arrow keys to navigate the values of each cell",
            "A grid of values": "A grid of values",
            "close grid": "close grid",
            "column header for date": "column header for date",
            "row header for": "row header for",
            "values for cell at": "values for cell at",
            "no values at": "no values at",
            "and": "and",
            "are": "are",
            "timezone selection": "timezone selection",
            "Start time input": "Start time input",
            "End time input": "End time input",
            "snap end time to latest": "snap end time to latest",
            "zoom in": "zoom in",
            "zoom out": "zoom out",
            "select quick time of": "select quick time of",
            "a time selection control dialog": "a time selection control dialog.",
            "a button to launch a time selection dialog current selected time is ": "a button to launch a time selection dialog. current selected time is ",
            "No color": "No color",
            "Change y-axis type": "Change y-axis type",
            "Show/Hide values": "Show/Hide values",
            "Line chart": "Line chart",
            "Bar chart": "Bar chart",
            "Heatmap": "Heatmap",
            "Pie chart": "Pie chart",
            "Scatter plot": "Scatter plot",
            "Select color": "Select color",
            "Search suggestion instruction": "When autocomplete results are available use up and down arrows to review and enter to select",
            "Search suggestions available": " results available, keyboard users, use up and down arrows to review and enter to select.",
            "Hierarchy list": "Hierarchy list",
            "event in series": "Event in series",
            "at time": "at time",
            "measure with key": "measure with key",
            "and value": "and value",
            "Looking for": "Looking for",
            "Hierarchy error": "Error occured! Refreshing hierarchy...",
            "Failed to get token": "Failed to get token",
            "Error in hierarchy navigation": "Error in hierarchy navigation",
            "Failed to load types for navigation": "Failed to load types for navigation",
            "Failed to load hierarchies for navigation": "Failed to load hierarchies for navigation",
            "Failed to complete search": "Failed to complete search",
            "Failed to get instance details": "Failed to get instance details",
            "Add": "Add",
            "Search": "Search",
            "Marker": "Marker",
            "Start at": "Start at"
        };
        this.stringValues = {};
        this.stringValues = this.stringValueDefaults;
    }
    Strings.prototype.mergeStrings = function (stringKeyValues) {
        var _this = this;
        Object.keys(this.stringValues).forEach(function (stringKey) {
            if (stringKey in stringKeyValues) {
                _this.stringValues[stringKey] = stringKeyValues[stringKey];
            }
        });
    };
    Strings.prototype.getString = function (stringKey) {
        if (stringKey in this.stringValues) {
            return this.stringValues[stringKey];
        }
        return stringKey;
    };
    Strings.prototype.toObject = function () {
        return this.stringValues;
    };
    return Strings;
}());

var DefaultHierarchyNavigationOptions = {
    instancesPageSize: 10,
    hierarchiesPageSize: 10,
    isInstancesRecursive: false,
    isInstancesHighlighted: false,
    instancesSort: InstancesSort.DisplayName,
    hierarchiesExpand: HierarchiesExpand.OneLevel,
    hierarchiesSort: HierarchiesSort.Name
};
var nullTsidDisplayString = "null";
var swimlaneLabelConstants = {
    leftMarginOffset: 40,
    swimLaneLabelHeightPadding: 8,
    labelLeftPadding: 28
};
var CharactersToEscapeForExactSearchInstance = ['"', '`', '\'', '!', '(', ')', '^', '[', '{', ':', ']', '}', '~', '/', '\\', '@', '#', '$', '%', '&', '*', ';', '=', '.', '_', '-', '<', '>', ',', '?'];

var ChartOptions = /** @class */ (function () {
    function ChartOptions() {
        this.stringsInstance = new Strings();
    }
    ChartOptions.prototype.getInterpolationFunction = function (interpolationName) {
        if (interpolationName == InterpolationFunctions.CurveLinear)
            return curveLinear;
        if (interpolationName == InterpolationFunctions.CurveStep)
            return curveStep;
        if (interpolationName == InterpolationFunctions.CurveStepBefore)
            return curveStepBefore;
        if (interpolationName == InterpolationFunctions.CurveStepAfter)
            return curveStepAfter;
        if (interpolationName == InterpolationFunctions.CurveBasis)
            return curveBasis;
        if (interpolationName == InterpolationFunctions.CurveCardinal)
            return curveCardinal;
        if (interpolationName == InterpolationFunctions.CurveMonotoneX)
            return curveMonotoneX;
        if (interpolationName == InterpolationFunctions.CurveCatmullRom)
            return curveCatmullRom;
        // default
        return curveMonotoneX;
    };
    ChartOptions.prototype.setOptions = function (chartOptionsObj) {
        chartOptionsObj = !chartOptionsObj ? {} : chartOptionsObj;
        this.grid = this.mergeValue(chartOptionsObj, 'grid', false);
        this.preserveAvailabilityState = this.mergeValue(chartOptionsObj, 'preserveAvailabilityState', false);
        this.persistDateTimeButtonRange = this.mergeValue(chartOptionsObj, 'persistDateTimeButtonRange', false);
        this.isCompact = this.mergeValue(chartOptionsObj, 'isCompact', false);
        this.keepBrush = this.mergeValue(chartOptionsObj, 'keepBrush', false);
        this.isArea = this.mergeValue(chartOptionsObj, 'isArea', false);
        this.noAnimate = this.mergeValue(chartOptionsObj, 'noAnimate', false);
        this.updateInterval = this.mergeValue(chartOptionsObj, 'updateInterval', 0);
        this.minutesForTimeLabels = this.mergeValue(chartOptionsObj, 'minutesForTimeLabels', false);
        this.aggTopMargin = this.mergeValue(chartOptionsObj, 'aggTopMargin', 12);
        this.color = this.mergeValue(chartOptionsObj, 'color', null);
        this.maxBuckets = this.mergeValue(chartOptionsObj, 'maxBuckets', 500);
        this.yAxisHidden = this.mergeValue(chartOptionsObj, 'yAxisHidden', false);
        this.focusHidden = this.mergeValue(chartOptionsObj, 'focusHidden', false);
        this.singleLineXAxisLabel = this.mergeValue(chartOptionsObj, 'singleLineXAxisLabel', false);
        this.legend = this.mergeValue(chartOptionsObj, 'legend', 'shown');
        this.tooltip = this.mergeValue(chartOptionsObj, 'tooltip', false);
        this.throttleSlider = this.mergeValue(chartOptionsObj, 'throttleSlider', false);
        this.snapBrush = this.mergeValue(chartOptionsObj, 'snapBrush', false);
        this.minBrushWidth = this.mergeValue(chartOptionsObj, 'minBrushWidth', 0);
        this.theme = this.mergeValue(chartOptionsObj, 'theme', 'dark');
        this.keepSplitByColor = this.mergeValue(chartOptionsObj, 'keepSplitByColor', false);
        this.brushContextMenuActions = this.mergeValue(chartOptionsObj, 'brushContextMenuActions', null);
        this.timeFrame = this.mergeValue(chartOptionsObj, 'timeFrame', null);
        this.fromChart = this.mergeValue(chartOptionsObj, 'fromChart', false);
        this.timestamp = this.mergeValue(chartOptionsObj, 'timestamp', null);
        this.stacked = this.mergeValue(chartOptionsObj, 'stacked', false);
        this.scaledToCurrentTime = this.mergeValue(chartOptionsObj, 'scaledToCurrentTime', false);
        this.zeroYAxis = this.mergeValue(chartOptionsObj, 'zeroYAxis', true);
        this.arcWidthRatio = this.mergeValue(chartOptionsObj, 'arcWidthRatio', 0);
        this.bucketSizeMillis = this.mergeValue(chartOptionsObj, 'bucketSizeMillis', 0);
        this.brushClearable = this.mergeValue(chartOptionsObj, 'brushClearable', true);
        this.brushMoveAction = this.mergeValue(chartOptionsObj, 'brushMoveAction', function () { });
        this.brushMoveEndAction = this.mergeValue(chartOptionsObj, 'brushMoveEndAction', function () { });
        this.yAxisState = this.mergeValue(chartOptionsObj, 'yAxisState', 'stacked');
        this.xAxisHidden = this.mergeValue(chartOptionsObj, 'xAxisHidden', false);
        this.suppressResizeListener = this.mergeValue(chartOptionsObj, 'suppressResizeListener', false);
        this.onMouseout = this.mergeValue(chartOptionsObj, 'onMouseout', function () { });
        this.onMouseover = this.mergeValue(chartOptionsObj, 'onMouseover', function () { });
        this.onSticky = this.mergeValue(chartOptionsObj, 'onSticky', function () { });
        this.onUnsticky = this.mergeValue(chartOptionsObj, 'onUnsticky', function () { });
        this.onKeydown = this.mergeValue(chartOptionsObj, 'onKeydown', function () { });
        this.onInput = this.mergeValue(chartOptionsObj, 'onInput', function () { });
        this.brushHandlesVisible = this.mergeValue(chartOptionsObj, 'brushHandlesVisible', false);
        this.hideChartControlPanel = this.mergeValue(chartOptionsObj, 'hideChartControlPanel', false);
        this.offset = this.mergeValue(chartOptionsObj, 'offset', 0);
        this.is24HourTime = this.mergeValue(chartOptionsObj, 'is24HourTime', true);
        this.includeTimezones = this.mergeValue(chartOptionsObj, 'includeTimezones', true);
        this.availabilityLeftMargin = this.mergeValue(chartOptionsObj, 'availabilityLeftMargin', 60);
        this.onInstanceClick = this.mergeValue(chartOptionsObj, 'onInstanceClick', function () { return {}; });
        this.interpolationFunction = this.getInterpolationFunction(this.mergeValue(chartOptionsObj, 'interpolationFunction', InterpolationFunctions.None));
        this.includeEnvelope = this.mergeValue(chartOptionsObj, 'includeEnvelope', false);
        this.canDownload = this.mergeValue(chartOptionsObj, 'canDownload', true);
        this.withContextMenu = this.mergeValue(chartOptionsObj, 'withContextMenu', false);
        this.autoTriggerBrushContextMenu = this.mergeValue(chartOptionsObj, 'autoTriggerBrushContextMenu', false);
        this.includeDots = this.mergeValue(chartOptionsObj, 'includeDots', false);
        this.yExtent = this.mergeValue(chartOptionsObj, 'yExtent', null);
        this.ellipsisItems = this.mergeValue(chartOptionsObj, 'ellipsisItems', []);
        this.markers = Utils.getValueOrDefault(chartOptionsObj, 'markers', null); // intentionally not mergeValue
        this.onMarkersChange = this.mergeValue(chartOptionsObj, 'onMarkersChange', function (markers) { });
        this.spMeasures = this.mergeValue(chartOptionsObj, 'spMeasures', null);
        this.scatterPlotRadius = this.mergeValue(chartOptionsObj, 'scatterPlotRadius', [4, 10]);
        this.spAxisLabels = this.mergeValue(chartOptionsObj, 'spAxisLabels', null);
        this.isTemporal = this.mergeValue(chartOptionsObj, "isTemporal", false);
        this.xAxisTimeFormat = this.mergeValue(chartOptionsObj, 'xAxisTimeFormat', null);
        this.brushRangeVisible = this.mergeValue(chartOptionsObj, 'brushRangeVisible', true);
        this.strings = this.mergeStrings(Utils.getValueOrDefault(chartOptionsObj, 'strings', {}));
        this.dateLocale = this.mergeValue(chartOptionsObj, 'dateLocale', Utils.languageGuess());
        this.defaultAvailabilityZoomRangeMillis = this.mergeValue(chartOptionsObj, 'defaultAvailabilityZoomRangeMillis', null);
        this.warmStoreRange = this.mergeValue(chartOptionsObj, 'warmStoreRange', null);
        this.initialValue = this.mergeValue(chartOptionsObj, 'initialValue', null);
        this.dTPIsModal = this.mergeValue(chartOptionsObj, 'dTPIsModal', false);
        this.defaultColor = this.mergeValue(chartOptionsObj, 'defaultColor', null);
        this.numberOfColors = this.mergeValue(chartOptionsObj, 'numberOfColors', 15);
        this.colors = Utils.generateColors(this.numberOfColors, chartOptionsObj['colors'] ? chartOptionsObj['colors'] : null);
        this.isColorValueHidden = this.mergeValue(chartOptionsObj, 'isColorValueHidden', false);
        this.onClick = this.mergeValue(chartOptionsObj, 'onClick', function () { });
        this.onSelect = this.mergeValue(chartOptionsObj, 'onSelect', function () { });
        this.swimLaneOptions = this.mergeValue(chartOptionsObj, 'swimLaneOptions', null);
        this.hierarchyOptions = this.mergeValue(chartOptionsObj, 'hierarchyOptions', Object.assign({}, DefaultHierarchyNavigationOptions));
        this.labelSeriesWithMarker = this.mergeValue(chartOptionsObj, 'labelSeriesWithMarker', false);
        this.onError = this.mergeValue(chartOptionsObj, 'onError', function (titleKey, messageKey, xhr) { });
        this.timeSeriesIdProperties = Utils.getValueOrDefault(chartOptionsObj, 'timeSeriesIdProperties', []);
        this.shouldSticky = this.mergeValue(chartOptionsObj, 'shouldSticky', true);
    };
    ChartOptions.prototype.mergeStrings = function (strings) {
        this.stringsInstance.mergeStrings(strings);
        return this.stringsInstance.toObject();
    };
    ChartOptions.prototype.mergeValue = function (chartOptionsObj, propertyName, defaultValue) {
        if (this[propertyName] !== undefined && chartOptionsObj[propertyName] === undefined) {
            return this[propertyName];
        }
        return Utils.getValueOrDefault(chartOptionsObj, propertyName, defaultValue);
    };
    ChartOptions.prototype.toObject = function () {
        return {
            grid: this.grid,
            preserveAvailabilityState: this.preserveAvailabilityState,
            persistDateTimeButtonRange: this.persistDateTimeButtonRange,
            isCompact: this.isCompact,
            keepBrush: this.keepBrush,
            isArea: this.isArea,
            noAnimate: this.noAnimate,
            minutesForTimeLabels: this.minutesForTimeLabels,
            aggTopMargin: this.aggTopMargin,
            color: this.color,
            maxBuckets: this.maxBuckets,
            yAxisHidden: this.yAxisHidden,
            focusHidden: this.focusHidden,
            singleLineXAxisLabel: this.singleLineXAxisLabel,
            legend: this.legend,
            tooltip: this.tooltip,
            throttleSlider: this.throttleSlider,
            snapBrush: this.snapBrush,
            minBrushWidth: this.minBrushWidth,
            theme: this.theme,
            keepSplitByColor: this.keepSplitByColor,
            brushContextMenuActions: this.brushContextMenuActions,
            timeFrame: this.timeFrame,
            fromChart: this.fromChart,
            timestamp: this.timestamp,
            stacked: this.stacked,
            scaledToCurrentTime: this.scaledToCurrentTime,
            zeroYAxis: this.zeroYAxis,
            arcWidthRatio: this.arcWidthRatio,
            brushClearable: this.brushClearable,
            brushMoveAction: this.brushMoveAction,
            yAxisState: this.yAxisState,
            xAxisHidden: this.xAxisHidden,
            suppressResizeListener: this.suppressResizeListener,
            brushMoveEndAction: this.brushMoveEndAction,
            onMouseout: this.onMouseout,
            onMouseover: this.onMouseover,
            onSticky: this.onSticky,
            onUnsticky: this.onUnsticky,
            onKeydown: this.onKeydown,
            onInput: this.onInput,
            brushHandlesVisible: this.brushHandlesVisible,
            hideChartControlPanel: this.hideChartControlPanel,
            offset: this.offset,
            is24HourTime: this.is24HourTime.valueOf,
            includeTimezones: this.includeTimezones,
            availabilityLeftMargin: this.availabilityLeftMargin,
            onInstanceClick: this.onInstanceClick,
            interpolationFunction: this.interpolationFunction,
            includeEnvelope: this.includeEnvelope,
            canDownload: this.canDownload,
            withContextMenu: this.withContextMenu,
            autoTriggerBrushContextMenu: this.autoTriggerBrushContextMenu,
            includeDots: this.includeDots,
            yExtent: this.yExtent,
            ellipsisItems: this.ellipsisItems,
            markers: this.markers,
            onMarkersChange: this.onMarkersChange,
            xAxisTimeFormat: this.xAxisTimeFormat,
            spMeasures: this.spMeasures,
            scatterPlotRadius: this.scatterPlotRadius,
            spAxisLabels: this.spAxisLabels,
            brushRangeVisible: this.brushRangeVisible,
            strings: this.strings.toObject(),
            dateLocale: this.dateLocale,
            defaultAvailabilityZoomRangeMillis: this.defaultAvailabilityZoomRangeMillis,
            warmStoreRange: this.warmStoreRange,
            initialValue: this.initialValue,
            bucketSizeMillis: this.bucketSizeMillis,
            updateInterval: this.updateInterval,
            dTPIsModal: this.dTPIsModal,
            numberOfColors: this.numberOfColors,
            defaultColor: this.defaultColor,
            isColorValueHidden: this.isColorValueHidden,
            onClick: this.onClick,
            onSelect: this.onSelect,
            colors: this.colors,
            swimLaneOptions: this.swimLaneOptions,
            hierarchyOptions: this.hierarchyOptions,
            onError: this.onError,
            labelSeriesWithMarker: this.labelSeriesWithMarker,
            timeSeriesIdProperties: this.timeSeriesIdProperties,
            shouldSticky: this.shouldSticky
        };
    };
    return ChartOptions;
}());

var Component = /** @class */ (function () {
    function Component(renderTarget) {
        this.TRANSDURATION = (window.navigator.userAgent.indexOf("Edge") > -1) ? 0 : 400;
        this.usesSeconds = false;
        this.usesMillis = false;
        this.chartOptions = new ChartOptions();
        this.teardropD = function (width, height) {
            return "M" + width / 2 + " " + height / 14 + " \n                Q" + width / 1.818 + " " + height / 6.17 + " " + width / 1.2 + " " + height / 2.33 + "\n                A" + width / 2.35 + " " + width / 2.35 + " 0 1 1 " + width / 6 + " " + width / 2.33 + "\n                Q" + width / 2.22 + " " + height / 6.18 + " " + width / 2 + " " + height / 14 + "z";
        };
        this.renderTarget = renderTarget;
    }
    Component.prototype.getString = function (str) {
        return this.chartOptions.stringsInstance.getString(str);
    };
    Component.prototype.themify = function (targetElement, theme) {
        var theme = Utils.getTheme(theme);
        targetElement === null || targetElement === void 0 ? void 0 : targetElement.classed(this.currentTheme, false);
        targetElement === null || targetElement === void 0 ? void 0 : targetElement.classed('tsi-light', false);
        targetElement === null || targetElement === void 0 ? void 0 : targetElement.classed('tsi-dark', false);
        targetElement === null || targetElement === void 0 ? void 0 : targetElement.classed(theme, true);
        this.currentTheme = theme;
    };
    Component.prototype.tooltipFormat = function (d, text, measureFormat, xyrMeasures) {
    };
    Component.prototype.createTooltipSeriesInfo = function (d, group, cDO) {
        var title = group.append('h2').attr('class', 'tsi-tooltipGroupName tsi-tooltipTitle');
        Utils.appendFormattedElementsFromString(title, d.aggregateName);
        if (d.splitBy && d.splitBy != "") {
            var splitBy = group.append('h4')
                .attr('class', 'tsi-tooltipSeriesName tsi-tooltipSubtitle');
            Utils.appendFormattedElementsFromString(splitBy, d.splitBy);
        }
        if (cDO.variableAlias && cDO.isVariableAliasShownOnTooltip) {
            group.append('h4')
                .text(cDO.variableAlias)
                .attr('class', 'tsi-tooltipVariableAlias tsi-tooltipSubtitle');
        }
    };
    return Component;
}());

var ChartComponentData = /** @class */ (function () {
    function ChartComponentData() {
        var _this = this;
        this.data = {};
        this.displayState = {};
        this.timeArrays = [];
        this.visibleTSCount = 0;
        this.visibleTAs = [];
        this.allValues = [];
        this.allNumericValues = [];
        this.usesSeconds = false;
        this.usesMillis = false;
        this.fromMillis = Infinity;
        this.toMillis = 0;
        this.stickiedKey = null;
        this.isFromHeatmap = false;
        this.getSwimlane = function (aggKey) {
            return (_this.displayState[aggKey].aggregateExpression ? _this.displayState[aggKey].aggregateExpression.swimLane : null);
        };
        this.getVisibleType = function (aggKey, splitBy, defaultType, measures) {
            if (_this.displayState[aggKey] && _this.displayState[aggKey].splitBys[splitBy]) {
                var prospectiveVisible = _this.displayState[aggKey].splitBys[splitBy].visibleType;
                if (measures.indexOf(prospectiveVisible) !== -1) {
                    return prospectiveVisible;
                }
            }
            return defaultType;
        };
    }
    ChartComponentData.prototype.setAllTimestampsArray = function () {
        var allTimestamps = {};
        this.data.forEach(function (ae) {
            var aeObj = ae[Object.keys(ae)[0]];
            Object.keys(aeObj).forEach(function (timeseries) {
                Object.keys(aeObj[timeseries]).forEach(function (timestamp) {
                    allTimestamps[timestamp] = true;
                });
            });
        });
        this.allTimestampsArray = Object.keys(allTimestamps).sort();
    };
    ChartComponentData.prototype.getDataType = function (aggKey) {
        return this.displayState[aggKey] ? this.displayState[aggKey].dataType : DataTypes.Numeric;
    };
    //add colors if none present
    ChartComponentData.prototype.fillColors = function (aggregateExpressionOptions) {
        if (aggregateExpressionOptions == null)
            aggregateExpressionOptions = [];
        // correct aEOs to add empty objects if the length doesn't match up with the data
        if (aggregateExpressionOptions.length < this.data.length) {
            for (var i = aggregateExpressionOptions.length; i < this.data.length; i++) {
                aggregateExpressionOptions.push({});
            }
        }
        var colorlessCount = aggregateExpressionOptions.reduce(function (colorlessCount, aEO) {
            if (aEO.color != null)
                return colorlessCount;
            return colorlessCount + 1;
        }, 0);
        var colorI = 0;
        var colors = Utils.generateColors(colorlessCount);
        aggregateExpressionOptions.forEach(function (aEO) {
            if (aEO.color == null) {
                aEO.color = colors[colorI];
                colorI++;
            }
        });
        return aggregateExpressionOptions;
    };
    ChartComponentData.prototype.mergeDataToDisplayStateAndTimeArrays = function (data, aggregateExpressionOptions) {
        var _this = this;
        if (aggregateExpressionOptions === void 0) { aggregateExpressionOptions = null; }
        this.data = data;
        var newDisplayState = {};
        this.timeArrays = {};
        this.visibleTAs = {};
        this.allValues = [];
        this.allNumericValues = [];
        this.visibleTSCount = 0;
        this.fromMillis = Infinity;
        this.toMillis = 0;
        this.usesSeconds = false;
        this.usesMillis = false;
        aggregateExpressionOptions = this.fillColors(aggregateExpressionOptions);
        var aggKeys = Utils.getAggKeys(this.data);
        this.data = this.data.map(function (aggregate, i) {
            var aggName = Object.keys(aggregate)[0];
            var aggregateCopy = __assign({}, aggregate);
            var aggKey = aggKeys[i];
            _this.data[i].aggKey = aggKey;
            aggregateCopy.aggKey = aggKey;
            if (_this.displayState[aggKey]) {
                newDisplayState[aggKey] = {
                    visible: (aggregateExpressionOptions[i] && aggregateExpressionOptions[i].visibilityState) ?
                        aggregateExpressionOptions[i].visibilityState[0] : _this.displayState[aggKey].visible,
                    name: _this.displayState[aggKey].name,
                    color: ((aggregateExpressionOptions[i] && aggregateExpressionOptions[i].color) ?
                        aggregateExpressionOptions[i].color : _this.displayState[aggKey].color),
                    interpolationFunction: aggregateExpressionOptions[i].interpolationFunction,
                    yExtent: aggregateExpressionOptions[i].yExtent,
                    includeEnvelope: aggregateExpressionOptions[i].includeEnvelope,
                    includeDots: aggregateExpressionOptions[i].includeDots,
                    splitBys: {},
                    dataType: aggregateExpressionOptions[i].dataType,
                    visibleSplitByCap: _this.displayState[aggKey].visibleSplitByCap,
                    shownSplitBys: 20
                };
            }
            else {
                newDisplayState[aggKey] = {
                    visible: (aggregateExpressionOptions[i] && aggregateExpressionOptions[i].visibilityState) ?
                        aggregateExpressionOptions[i].visibilityState[0] : true,
                    splitBys: {},
                    name: aggName,
                    color: ((aggregateExpressionOptions[i] && aggregateExpressionOptions[i].color) ?
                        aggregateExpressionOptions[i].color : "teal"),
                    interpolationFunction: aggregateExpressionOptions[i].interpolationFunction,
                    yExtent: aggregateExpressionOptions[i].yExtent,
                    includeEnvelope: aggregateExpressionOptions[i].includeEnvelope,
                    includeDots: aggregateExpressionOptions[i].includeDots,
                    dataType: aggregateExpressionOptions[i].dataType,
                    visibleSplitByCap: 10,
                    shownSplitBys: 20
                };
            }
            if (aggregateExpressionOptions) {
                newDisplayState[aggKey].contextMenuActions = aggregateExpressionOptions[i] ?
                    aggregateExpressionOptions[i].contextMenu : [];
                newDisplayState[aggKey].aggregateExpression = aggregateExpressionOptions[i];
                // impose cap on visible splitBys if relevant
                if (aggregateExpressionOptions[i] && aggregateExpressionOptions[i].visibleSplitByCap) {
                    newDisplayState[aggKey].visibleSplitByCap = aggregateExpressionOptions[i].visibleSplitByCap;
                }
            }
            else {
                //revert to previous context menu actions if no new ones passed in and old ones exist
                var oldContextMenuActions = (_this.displayState[aggKey] && _this.displayState[aggKey].contextMenuActions) ?
                    _this.displayState[aggKey].contextMenuActions : [];
                newDisplayState[aggKey].contextMenuActions = oldContextMenuActions;
                var oldAggregateExpression = (_this.displayState[aggKey] && _this.displayState[aggKey].aggregateExpression) ?
                    _this.displayState[aggKey].aggregateExpression : {};
                newDisplayState[aggKey].aggregateExpression = oldAggregateExpression;
            }
            if (newDisplayState[aggKey].aggregateExpression && newDisplayState[aggKey].aggregateExpression.searchSpan) {
                newDisplayState[aggKey].from = new Date(newDisplayState[aggKey].aggregateExpression.searchSpan.from);
                newDisplayState[aggKey].to = new Date(newDisplayState[aggKey].aggregateExpression.searchSpan.to);
                newDisplayState[aggKey].bucketSize = newDisplayState[aggKey].aggregateExpression.searchSpan.bucketSize ?
                    Utils.parseTimeInput(newDisplayState[aggKey].aggregateExpression.searchSpan.bucketSize) :
                    null;
            }
            var aggregateVisible = newDisplayState[aggKey].visible;
            _this.timeArrays[aggKey] = [];
            _this.visibleTAs[aggKey] = {};
            Object.keys(data[i][aggName]).forEach(function (splitBy, splitByI) {
                var shiftValue = Utils.parseShift(aggregateExpressionOptions[i].timeShift, aggregateExpressionOptions[i].startAt, aggregateExpressionOptions[i].searchSpan);
                _this.timeArrays[aggKey][splitBy] = _this.convertAggregateToArray(data[i][aggName][splitBy], aggKey, aggName, splitBy, newDisplayState[aggKey].from, newDisplayState[aggKey].to, newDisplayState[aggKey].bucketSize, shiftValue);
                if (newDisplayState[aggKey].dataType === DataTypes.Categorical && aggregateExpressionOptions[i].rollupCategoricalValues) {
                    _this.timeArrays[aggKey][splitBy] = Utils.rollUpContiguous(_this.timeArrays[aggKey][splitBy]);
                }
                var isVisible;
                // first priority: set from passed in visibility state
                if (aggregateExpressionOptions[i] && aggregateExpressionOptions[i].visibilityState && aggregateExpressionOptions[i].visibilityState.length === 2) {
                    isVisible = aggregateExpressionOptions[i].visibilityState[1].indexOf(splitBy) != -1;
                }
                //second priority: special case where solo split by and is ''
                else if (aggregateExpressionOptions[i] && aggregateExpressionOptions[i].visibilityState && Object.keys(data[i][aggName]).length === 1 && splitBy === '') {
                    isVisible = aggregateExpressionOptions[i].visibilityState[0];
                }
                // third priority: already set value
                else if (_this.displayState[aggKey] && _this.displayState[aggKey].splitBys[splitBy]) {
                    isVisible = _this.displayState[aggKey].splitBys[splitBy].visible;
                }
                // last priority: set isVisible based on visibleSplitByCap 
                else {
                    isVisible = (splitByI < newDisplayState[aggKey].visibleSplitByCap);
                }
                newDisplayState[aggKey].splitBys[splitBy] = {
                    visible: isVisible,
                    visibleType: newDisplayState[aggKey].splitBys[splitBy] ? newDisplayState[aggKey].splitBys[splitBy].visibleType : null,
                    types: newDisplayState[aggKey].splitBys[splitBy] ? newDisplayState[aggKey].splitBys[splitBy].types : [],
                };
                if (_this.timeArrays[aggKey][splitBy] && _this.timeArrays[aggKey][splitBy].length &&
                    newDisplayState[aggKey].aggregateExpression && newDisplayState[aggKey].aggregateExpression.measureTypes) {
                    newDisplayState[aggKey].splitBys[splitBy].types = newDisplayState[aggKey].aggregateExpression.measureTypes;
                }
                else {
                    newDisplayState[aggKey].splitBys[splitBy].types = _this.determineMeasureTypes(_this.timeArrays[aggKey][splitBy]);
                }
                if (!newDisplayState[aggKey].splitBys[splitBy].visibleType || (newDisplayState[aggKey].splitBys[splitBy].types.indexOf(newDisplayState[aggKey].splitBys[splitBy].visibleType) === -1)) {
                    var visibleMeasure = newDisplayState[aggKey].splitBys[splitBy].types.indexOf("avg") !== -1 ? "avg" :
                        newDisplayState[aggKey].splitBys[splitBy].types[0];
                    newDisplayState[aggKey].splitBys[splitBy].visibleType = _this.getVisibleType(aggKey, splitBy, visibleMeasure, newDisplayState[aggKey].splitBys[splitBy].types);
                }
                //add to visible display states if splitby is visible
                if (newDisplayState[aggKey]["splitBys"][splitBy]["visible"] && aggregateVisible) {
                    _this.allValues = _this.allValues.concat(_this.timeArrays[aggKey][splitBy]);
                    if (newDisplayState[aggKey].dataType === DataTypes.Numeric) {
                        _this.allNumericValues = _this.allNumericValues.concat(_this.timeArrays[aggKey][splitBy]);
                    }
                    _this.usesSeconds = _this.usesSeconds || _this.doesTimeArrayUseSeconds(_this.timeArrays[aggKey][splitBy]);
                    _this.usesMillis = _this.usesMillis || _this.doesTimeArrayUseMillis(_this.timeArrays[aggKey][splitBy]);
                    _this.visibleTAs[aggKey][splitBy] = _this.timeArrays[aggKey][splitBy];
                    _this.visibleTSCount += 1;
                }
            });
            return aggregateCopy;
        });
        //ensure that the stickied Key exists in the new data, otherwise revert to null
        if (this.stickiedKey) {
            var splitBy = this.stickiedKey.splitBy;
            var aggKey = this.stickiedKey.aggregateKey;
            if (!(newDisplayState[aggKey] && newDisplayState[aggKey].visible &&
                newDisplayState[aggKey].splitBys[splitBy] && newDisplayState[aggKey].splitBys[splitBy].visible)) {
                this.stickiedKey = null;
            }
        }
        this.displayState = newDisplayState;
        this.setAllTimestampsArray();
    };
    ChartComponentData.prototype.determineMeasureTypes = function (timeArray) {
        var measureTypes = timeArray.reduce(function (measureTypes, curr) {
            if (curr && curr.measures && Object.keys(curr.measures).length) {
                Object.keys(curr.measures).forEach(function (measure) {
                    measureTypes[measure] = true;
                });
            }
            return measureTypes;
        }, {});
        return Object.keys(measureTypes);
    };
    ChartComponentData.prototype.getTemporalShiftStringTuple = function (aggKey) {
        var ae = this.displayState[aggKey].aggregateExpression;
        if (ae) {
            if (Utils.isStartAt(ae.startAt, ae.searchSpan)) {
                return [ShiftTypes.startAt, ae.startAt];
            }
            if (ae.timeShift) {
                return [ShiftTypes.shifted, ae.timeShift];
            }
        }
        return null;
    };
    ChartComponentData.prototype.getTemporalShiftMillis = function (aggKey) {
        var ae = this.displayState[aggKey].aggregateExpression;
        if (ae) {
            return Utils.parseShift(ae.timeShift, ae.startAt, ae.searchSpan);
        }
        return 0;
    };
    ChartComponentData.prototype.doesTimeArrayUseSeconds = function (timeArray) {
        return timeArray.reduce(function (prev, curr) {
            return curr.dateTime.getSeconds() != 0 || prev;
        }, false);
    };
    ChartComponentData.prototype.doesTimeArrayUseMillis = function (timeArray) {
        return timeArray.reduce(function (prev, curr) {
            return curr.dateTime.getMilliseconds() != 0 || prev;
        }, false);
    };
    //returns the from and to of all values
    ChartComponentData.prototype.setAllValuesAndVisibleTAs = function () {
        var _this = this;
        var toMillis = 0;
        var fromMillis = Infinity;
        this.allValues = [];
        this.allNumericValues = [];
        this.visibleTAs = [];
        this.visibleTSCount = 0;
        Object.keys(this.timeArrays).forEach(function (aggKey) {
            if (_this.getAggVisible(aggKey)) {
                _this.visibleTAs[aggKey] = {};
                Object.keys(_this.timeArrays[aggKey]).forEach(function (splitBy) {
                    if (_this.getSplitByVisible(aggKey, splitBy)) {
                        _this.allValues = _this.allValues.concat(_this.timeArrays[aggKey][splitBy]);
                        if (_this.displayState[aggKey].dataType === DataTypes.Numeric) {
                            _this.allNumericValues = _this.allNumericValues.concat(_this.timeArrays[aggKey][splitBy]);
                        }
                        _this.visibleTAs[aggKey][splitBy] = _this.timeArrays[aggKey][splitBy];
                        _this.visibleTSCount += 1;
                        _this.timeArrays[aggKey][splitBy].forEach(function (d) {
                            var millis = d.dateTime.valueOf();
                            var bucketSize = _this.displayState[aggKey].bucketSize;
                            if (millis < fromMillis)
                                fromMillis = millis;
                            var endValue = bucketSize ? millis + bucketSize : millis;
                            if (endValue > toMillis)
                                toMillis = endValue;
                        });
                        _this.usesSeconds = _this.usesSeconds || _this.doesTimeArrayUseSeconds(_this.timeArrays[aggKey][splitBy]);
                        _this.usesMillis = _this.usesMillis || _this.doesTimeArrayUseMillis(_this.timeArrays[aggKey][splitBy]);
                    }
                });
            }
        });
        //set this.toMillis and this.fromMillis if new values are more extreme 
        this.toMillis = (toMillis > this.toMillis) ? toMillis : this.toMillis;
        this.fromMillis = (fromMillis < this.fromMillis) ? fromMillis : this.fromMillis;
        if (this.fromMillis === Infinity) {
            this.fromMillis = this.toMillis - 1;
        }
        return [new Date(this.fromMillis), new Date(this.toMillis)];
    };
    ChartComponentData.prototype.findLastTimestampWithValue = function (aggKey, splitBy) {
        var timeArray = this.timeArrays[aggKey][splitBy];
        var i = timeArray.length - 1;
        var lastValue = null;
        while (i >= 0 && lastValue === null) {
            if (timeArray[i].measures && (timeArray[i].measures[this.getVisibleMeasure(aggKey, splitBy)] !== null)) {
                lastValue = timeArray[i];
            }
            i += -1;
        }
        return lastValue;
    };
    ChartComponentData.prototype.findFirstBucket = function (agg, fromMillis, bucketSize) {
        if (agg == null || Object.keys(agg).length == 0)
            return null;
        var possibleFirstKeys = Object.keys(agg).filter(function (a) {
            return ((new Date(a)).valueOf() + bucketSize) > fromMillis;
        });
        if (possibleFirstKeys.length === 0) {
            return null;
        }
        var firstPresentKey = possibleFirstKeys.sort(function (a, b) {
            if ((new Date(a)).valueOf() < (new Date(b)).valueOf())
                return -1;
            if ((new Date(a)).valueOf() > (new Date(b)).valueOf())
                return 1;
            return 0;
        })[0];
        var firstMillis = (new Date(firstPresentKey)).valueOf();
        while (firstMillis > fromMillis) {
            firstMillis += -bucketSize;
        }
        return firstMillis;
    };
    ChartComponentData.prototype.getNumberOfPaddedBuckets = function (from, to, bucketSize) {
        return Math.ceil((to - from) / bucketSize);
    };
    //aggregates object => array of objects containing timestamp and values. Pad with 
    ChartComponentData.prototype.convertAggregateToArray = function (agg, aggKey, aggName, splitBy, from, to, bucketSize, shiftValue) {
        if (from === void 0) { from = null; }
        if (to === void 0) { to = null; }
        if (bucketSize === void 0) { bucketSize = null; }
        var aggArray = [];
        var isoStringAgg = {};
        Object.keys(agg).forEach(function (dateString) {
            var shiftedDate = new Date((new Date(dateString)).valueOf() - shiftValue);
            var jsISOString = shiftedDate.toISOString();
            isoStringAgg[jsISOString] = agg[dateString];
        });
        agg = isoStringAgg;
        var createTimeValueObject = function () {
            var timeValueObject = {};
            timeValueObject["aggregateKey"] = aggKey;
            timeValueObject["aggregateName"] = aggName;
            timeValueObject["splitBy"] = splitBy;
            timeValueObject["measures"] = {};
            timeValueObject["bucketSize"] = bucketSize;
            return timeValueObject;
        };
        if (from)
            this.fromMillis = Math.min(from.valueOf(), this.fromMillis);
        if (to)
            this.toMillis = Math.max(to.valueOf(), this.toMillis);
        if (from && to && bucketSize) {
            var firstBucket = this.findFirstBucket(agg, from.valueOf(), bucketSize);
            if (firstBucket !== null) {
                var firstBucketMillis = firstBucket.valueOf();
                var isExcessiveBucketCount = (this.getNumberOfPaddedBuckets(firstBucketMillis, to.valueOf(), bucketSize) > 10000);
                // pad if not an excessive number of buckets
                if (!isExcessiveBucketCount) {
                    for (var currTime = new Date(firstBucketMillis); (currTime.valueOf() < to.valueOf()); currTime = new Date(currTime.valueOf() + bucketSize)) {
                        var timeValueObject = createTimeValueObject();
                        timeValueObject["dateTime"] = currTime;
                        var currTimeString = currTime.toISOString();
                        if (agg[currTimeString]) {
                            var currMeasures = agg[currTimeString];
                            Object.keys(currMeasures).forEach(function (measure) {
                                timeValueObject["measures"][measure] = currMeasures[measure];
                            });
                        }
                        else {
                            timeValueObject["measures"] = null;
                        }
                        aggArray.push(timeValueObject);
                        this.fromMillis = Math.min(from.valueOf(), currTime.valueOf());
                        this.toMillis = Math.max(to.valueOf(), currTime.valueOf() + bucketSize);
                    }
                }
                else {
                    Object.keys(agg).forEach(function (currTimeString) {
                        var timeValueObject = createTimeValueObject();
                        timeValueObject["dateTime"] = new Date(currTimeString);
                        var currMeasures = agg[currTimeString];
                        Object.keys(currMeasures).forEach(function (measure) {
                            timeValueObject["measures"][measure] = currMeasures[measure];
                        });
                        aggArray.push(timeValueObject);
                    });
                }
            }
        }
        else {
            Object.keys(agg).sort().forEach(function (dateTime) {
                var timeValueObject = createTimeValueObject();
                timeValueObject["dateTime"] = new Date(dateTime);
                if (agg[dateTime]) {
                    Object.keys(agg[dateTime]).forEach(function (measure) {
                        timeValueObject["measures"][measure] = agg[dateTime][measure];
                    });
                }
                aggArray.push(timeValueObject);
            });
        }
        return aggArray;
    };
    ChartComponentData.prototype.isSplitByVisible = function (aggI, splitBy) {
        if (this.displayState[aggI] == undefined || !this.displayState[aggI].visible)
            return false;
        if (this.displayState[aggI].splitBys[splitBy] == undefined)
            return false;
        return this.displayState[aggI].splitBys[splitBy].visible;
    };
    ChartComponentData.prototype.isPossibleEnvelope = function (aggKey, splitBy) {
        return (this.displayState[aggKey].splitBys[splitBy].visibleType == "avg") &&
            (this.displayState[aggKey].splitBys[splitBy].types.indexOf("min") != -1) &&
            (this.displayState[aggKey].splitBys[splitBy].types.indexOf("max") != -1);
    };
    ChartComponentData.prototype.getVisibleMeasure = function (aggI, splitBy) {
        if (this.displayState[aggI] == undefined || this.displayState[aggI].splitBys[splitBy] == undefined)
            return null;
        return this.displayState[aggI].splitBys[splitBy].visibleType;
    };
    ChartComponentData.prototype.getAggVisible = function (aggKey) {
        return this.displayState[aggKey].visible;
    };
    ChartComponentData.prototype.getSplitByVisible = function (aggKey, splitBy) {
        return (this.getAggVisible(aggKey) && this.displayState[aggKey].splitBys[splitBy].visible);
    };
    ChartComponentData.prototype.aggHasVisibleSplitBys = function (aggKey) {
        var _this = this;
        if (!this.getAggVisible(aggKey))
            return false;
        var hasVisibleSplitBy = false;
        Object.keys(this.displayState[aggKey].splitBys).forEach(function (splitBy) {
            if (_this.isSplitByVisible(aggKey, splitBy))
                hasVisibleSplitBy = true;
        });
        return hasVisibleSplitBy;
    };
    ChartComponentData.prototype.valueAtTS = function (aggKey, splitByName, ts) {
        var splitBy = this.displayState[aggKey].splitBys[splitByName];
        return this.data[aggKey][this.displayState[aggKey].name][splitByName][ts][splitBy.visibleType];
    };
    ChartComponentData.prototype.setFilteredAggregates = function () {
        var _this = this;
        this.filteredAggregates = Object.keys(this.displayState).filter(function (aggKey) {
            return _this.displayState[aggKey].visible;
        });
    };
    ChartComponentData.prototype.guessValueType = function (v) {
        if (typeof v === 'number') {
            return valueTypes.Double;
        }
        if (typeof v === 'string') {
            return valueTypes.String;
        }
        return valueTypes.Dynamic;
    };
    ChartComponentData.prototype.generateCSVString = function (offset, dateLocale, spMeasures) {
        var _this = this;
        if (offset === void 0) { offset = 0; }
        if (dateLocale === void 0) { dateLocale = 'en'; }
        if (spMeasures === void 0) { spMeasures = null; }
        //replace comma at end of line with end line character
        var endLine = function (s) {
            return s.slice(0, s.length - 1) + "\n";
        };
        var csvString = "";
        var headerString = "Interval,";
        var rowMap = {};
        var rowOrder = [];
        this.data.forEach(function (aggObj) {
            var aggKey = aggObj.aggKey;
            var splitByObject = _this.displayState[aggKey].aggregateExpression.splitByObject;
            Object.keys(_this.timeArrays[aggKey]).forEach(function (splitBy) {
                var splitByString = Utils.stripNullGuid(_this.displayState[aggKey].name);
                if (splitByObject !== undefined && splitByObject !== null) {
                    splitByString += "/" + splitByObject.property + "/" + splitBy;
                }
                else if (splitBy !== '') {
                    splitByString += '/' + splitBy;
                }
                else if (_this.displayState[aggKey].aggregateExpression.variableAlias) {
                    splitByString += '/' + _this.displayState[aggKey].aggregateExpression.variableAlias;
                }
                var types = spMeasures ? spMeasures : _this.displayState[aggKey].splitBys[splitBy].types;
                types.forEach(function (type) {
                    var rowKey = aggKey + "_" + splitBy + "_" + type;
                    rowMap[rowKey] = {};
                    rowOrder.push(rowKey);
                    headerString += Utils.sanitizeString(splitByString + "." + type, valueTypes.String) + ",";
                });
            });
        });
        csvString = endLine(headerString);
        this.allValues.forEach(function (value) {
            if (value.measures && Object.keys(value.measures).length != 0) {
                Object.keys(value.measures).forEach(function (type) {
                    var rowKey = value.aggregateKey + "_" + value.splitBy + "_" + type;
                    if (rowKey in rowMap) {
                        rowMap[rowKey][value.dateTime.valueOf()] =
                            (value.measures[type] == null || value.measures[type] == undefined) ?
                                "" : Utils.sanitizeString(value.measures[type], _this.guessValueType(value.measures[type]));
                    }
                });
            }
        });
        this.allTimestampsArray.forEach(function (timeString) {
            var millis = (new Date(timeString)).valueOf();
            csvString += Utils.timeFormat(_this.usesSeconds, _this.usesMillis, offset, null, null, null, dateLocale)(new Date(millis)) + ",";
            rowOrder.forEach(function (rowKey) {
                csvString += (rowMap[rowKey][millis] != undefined ? rowMap[rowKey][millis] : "") + ",";
            });
            csvString = endLine(csvString);
        });
        return csvString;
    };
    ChartComponentData.prototype.getVisibilityState = function () {
        var _this = this;
        var visibilityStateArray = [];
        Object.keys(this.displayState).forEach(function (aggKey) {
            var aggDisplayState = _this.displayState[aggKey];
            var visibleSplitBys = !aggDisplayState.visible ? [] :
                Object.keys(aggDisplayState.splitBys).filter(function (splitByName) {
                    return aggDisplayState.splitBys[splitByName].visible;
                });
            var aggName = aggDisplayState.name;
            var visibilityObject = {};
            visibilityObject[aggName] = [aggDisplayState.visible, visibleSplitBys];
            visibilityStateArray.push(visibilityObject);
        });
        return visibilityStateArray;
    };
    return ChartComponentData;
}());

var Grid = /** @class */ (function (_super) {
    __extends(Grid, _super);
    function Grid(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.rowLabelKey = "__tsiLabel__";
        _this.colorKey = "__tsiColor__";
        _this.aggIndexKey = '__tsiAggIndex__';
        _this.chartComponentData = new ChartComponentData();
        _this.closeButton = null;
        _this.usesSeconds = false;
        _this.usesMillis = false;
        _this.cellClass = function (ridx, cidx) {
            return "tsi-table-" + ridx + '-' + cidx;
        };
        _this.focus = function (rowIdx, colIdx) {
            try {
                _this.gridComponent.select('.' + _this.cellClass(rowIdx, colIdx)).node()
                    .focus();
            }
            catch (e) {
                console.log(e);
            }
        };
        _this.getFormattedDate = function (h) {
            var hAsDate = (new Date(h));
            if (hAsDate != _this.getString('Invalid Date'))
                return Utils.timeFormat(_this.usesSeconds, _this.usesMillis, _this.chartOptions.offset, null, null, null, _this.chartOptions.dateLocale)(hAsDate);
            return h;
        };
        _this.setFilteredTimestamps = function () {
            if (_this.chartComponentData.fromMillis === Infinity) {
                _this.filteredTimestamps = _this.chartComponentData.allTimestampsArray;
            }
            else {
                _this.filteredTimestamps = _this.chartComponentData.allTimestampsArray.filter(function (ts) {
                    var currMillis = (new Date(ts)).valueOf();
                    return (currMillis >= _this.chartComponentData.fromMillis && currMillis < _this.chartComponentData.toMillis);
                });
            }
        };
        _this.arrowNavigate = function (d3event, rowIdx, colIdx) {
            if (d3event.keyCode === 9) {
                if (_this.closeButton) {
                    (_this.closeButton.node()).focus();
                    d3event.preventDefault();
                }
                return;
            }
            var codes = [37, 38, 39, 40];
            var codeIndex = codes.indexOf(d3event.keyCode);
            if (codeIndex == -1)
                return;
            switch (codeIndex) {
                case 0:
                    _this.focus(rowIdx, colIdx - 1);
                    d3event.preventDefault();
                    break;
                case 1:
                    _this.focus(rowIdx - 1, colIdx);
                    d3event.preventDefault();
                    break;
                case 2:
                    _this.focus(rowIdx, colIdx + 1);
                    d3event.preventDefault();
                    break;
                case 3:
                    _this.focus(rowIdx + 1, colIdx);
                    d3event.preventDefault();
                    break;
            }
        };
        return _this;
    }
    Grid.prototype.Grid = function () {
    };
    Grid.prototype.renderFromAggregates = function (data, options, aggregateExpressionOptions, chartComponentData) {
        var _this = this;
        this.chartOptions.setOptions(options);
        var dataAsJson = data.reduce(function (p, c, i) {
            var aeName = Object.keys(c)[0];
            Object.keys(c[aeName]).forEach(function (sbName) {
                var row = {};
                Object.keys(c[aeName][sbName]).forEach(function (dt) {
                    row[dt] = c[aeName][sbName][dt];
                });
                row[_this.rowLabelKey] = (Object.keys(c[aeName]).length == 1 && sbName == "" ? aeName : sbName);
                if (aggregateExpressionOptions && aggregateExpressionOptions[i].color)
                    row[_this.colorKey] = aggregateExpressionOptions[i].color;
                row[_this.aggIndexKey] = i;
                p.push(row);
            });
            return p;
        }, []);
        return this.render(dataAsJson, options, aggregateExpressionOptions, chartComponentData);
    };
    Grid.prototype.getRowData = function () {
        var _this = this;
        var rowData = [];
        Object.keys(this.chartComponentData.timeArrays).forEach(function (aggKey) {
            Object.keys(_this.chartComponentData.timeArrays[aggKey]).forEach(function (sb, sbI) {
                if (_this.chartComponentData.getSplitByVisible(aggKey, sb)) {
                    rowData.push([aggKey, sb]);
                }
            });
        });
        return rowData;
    };
    Grid.prototype.convertSeriesToGridData = function (allTimeStampMap, currSeries) {
        Object.keys(allTimeStampMap).forEach(function (k) { return allTimeStampMap[k] = {}; });
        currSeries = currSeries.filter(function (d) {
            return d.measures !== null;
        });
        currSeries.map(function (dataPoint) {
            allTimeStampMap[dataPoint.dateTime.toISOString()] = dataPoint;
        });
        return Object.keys(allTimeStampMap).map(function (ts) {
            return allTimeStampMap[ts];
        });
    };
    Grid.prototype.addHeaderCells = function () {
        var _this = this;
        var headerCellData = this.filteredTimestamps; // this.chartComponentData.allTimestampsArray;
        var headerCells = this.tableHeaderRow.selectAll('.tsi-headerCell').data(headerCellData);
        var headerCellsEntered = headerCells.enter()
            .append('th')
            .attr("tabindex", 1)
            .merge(headerCells)
            .attr("class", function (d, i) { return _this.cellClass(0, i + 1) + ' tsi-headerCell'; })
            .on("keydown", function (d, i) { _this.arrowNavigate(event, 0, i + 1); })
            .text(this.getFormattedDate)
            .attr('aria-label', function (h) {
            return _this.getString('column header for date') + " " + _this.getFormattedDate(h);
        });
        headerCellsEntered.exit().remove();
    };
    Grid.prototype.addValueCells = function () {
        var rowData = this.getRowData();
        var rows = this.table.selectAll('.tsi-gridContentRow').data(rowData);
        var self = this;
        var allTimeStampMap = this.filteredTimestamps.reduce(function (tsMap, ts) {
            tsMap[ts] = {};
            return tsMap;
        }, {});
        var headerCellData = this.filteredTimestamps;
        var rowsEntered = rows.enter()
            .append('tr')
            .classed('tsi-gridContentRow', true)
            .each(function (d, i) {
            var aggKey = d[0];
            var splitBy = d[1];
            var seriesData = self.convertSeriesToGridData(allTimeStampMap, self.chartComponentData.timeArrays[aggKey][splitBy]);
            var cells = select(this).selectAll('.tsi-valueCell').data(seriesData);
            var measuresData = self.chartOptions.spMeasures ? self.chartOptions.spMeasures : self.chartComponentData.displayState[aggKey].splitBys[splitBy].types;
            //Row header with the name of the series
            var headerCell = select(this).selectAll('tsi-rowHeaderCell').data([d]);
            var getRowHeaderText = function (d) {
                return "" + self.chartComponentData.displayState[aggKey].name + (splitBy !== '' ? (': ' + splitBy) : '');
            };
            headerCell.enter()
                .append('td')
                .attr("tabindex", 1)
                .merge(headerCell)
                .attr('class', function (d, col) { return "tsi-rowHeaderCell " + self.cellClass(i + 1, 0); })
                .on("keydown", function (d, col) { self.arrowNavigate(event, i + 1, 0); })
                .attr('aria-label', function (d) {
                return self.getString('row header for') + " " + Utils.stripNullGuid(getRowHeaderText());
            })
                .each(function (d) {
                select(this).select('*').remove();
                var container = select(this).append('div').attr('class', 'tsi-rowHeaderContainer');
                var seriesName = container.append('div')
                    .attr('class', 'tsi-rowHeaderSeriesName');
                Utils.appendFormattedElementsFromString(seriesName, getRowHeaderText());
                var measureContainer = container.append('div')
                    .attr('class', 'tsi-rowHeaderMeasures');
                var measureNames = measureContainer.selectAll('.tsi-measureName').data(measuresData);
                measureNames.enter()
                    .append('div')
                    .attr('class', 'tsi-measureName')
                    .text(function (d) { return d; });
            });
            headerCell.exit().remove();
            cells.enter()
                .append('td')
                .merge(cells)
                .attr('class', function (d, col) { return "tsi-valueCell " + self.cellClass(i + 1, col + 1); })
                .on("keydown", function (d, col) { self.arrowNavigate(event, i + 1, col + 1); })
                .attr("tabindex", 1)
                .attr('aria-label', function (d, i) {
                if (!d.measures || Object.keys(d.measures).length === 0) {
                    return self.getString('no values at') + " " + getRowHeaderText() + " and " + self.getFormattedDate(new Date(headerCellData[i]));
                }
                var formattedValues = Object.keys(d.measures).map(function (measureName) {
                    return measureName + ": " + d.measures[measureName];
                }).join(', ');
                return self.getString('values for cell at') + " " + getRowHeaderText() + " " + self.getString('and') + " " + self.getFormattedDate(d.dateTime) + " " + self.getString('are') + " " + formattedValues;
            })
                .each(function (d, i) {
                var measures = select(this).selectAll('.tsi-measureValue').data(measuresData);
                measures.enter()
                    .append('div')
                    .attr('class', 'tsi-measureValue')
                    .text(function (measure) { return d.measures ? d.measures[measure] : ''; });
                measures.exit().remove();
            });
            cells.exit().remove();
        });
        rowsEntered.exit().remove();
    };
    Grid.prototype.render = function (data, options, aggregateExpressionOptions, chartComponentData) {
        var _this = this;
        if (chartComponentData === void 0) { chartComponentData = null; }
        data = Utils.standardizeTSStrings(data);
        this.chartOptions.setOptions(options);
        this.gridComponent = select(this.renderTarget);
        if (chartComponentData) {
            this.chartComponentData = chartComponentData;
        }
        else {
            this.chartComponentData.mergeDataToDisplayStateAndTimeArrays(data, aggregateExpressionOptions);
        }
        this.setFilteredTimestamps();
        _super.prototype.themify.call(this, this.gridComponent, this.chartOptions.theme);
        this.gridComponent
            .classed("tsi-gridComponent", true)
            .classed("tsi-fromChart", !!options.fromChart);
        var grid = this.gridComponent
            .append('div')
            .attr("class", "tsi-gridWrapper")
            .attr("tabindex", 0)
            .on("click", function () {
            if (_this) {
                _this.focus(0, 0);
            }
        });
        var headers = Object.keys(data.reduce(function (p, c) {
            Object.keys(c).forEach(function (k) {
                if (k != _this.rowLabelKey && k != _this.colorKey)
                    p[k] = true;
            });
            return p;
        }, {})).sort();
        if (!this.table) {
            this.table = grid.append('table').classed('tsi-gridTable', true);
            this.tableHeaderRow = this.table.append('tr').classed('tsi-gridHeaderRow', true);
            this.tableHeaderRow.append('th')
                .attr("tabindex", 0)
                .attr("class", "tsi-topLeft " + this.cellClass(0, 0))
                .on("keydown", function () { _this.arrowNavigate(event, 0, 0); })
                .attr("aria-label", this.getString('A grid of values') + " - " + this.getString('Use the arrow keys to navigate the values of each cell'));
        }
        this.addHeaderCells();
        this.addValueCells();
        if (this.chartOptions.fromChart) {
            this.gridComponent.selectAll('.tsi-closeButton').remove();
            this.closeButton = grid.append('button')
                .attr("class", "tsi-closeButton")
                .attr('aria-label', this.getString('close grid'))
                .html('&times')
                .on('keydown', function () {
                if (event.keyCode === 9) {
                    _this.focus(0, 0);
                    event.preventDefault();
                }
            })
                .on("click", function () {
                if (!!options.fromChart) {
                    Utils.focusOnEllipsisButton(_this.renderTarget.parentNode);
                    _this.gridComponent.remove();
                }
            });
        }
    };
    return Grid;
}(Component));

var NONNUMERICTOPMARGIN = 8;
var LINECHARTTOPPADDING = 16;
var GRIDCONTAINERCLASS = 'tsi-gridContainer';
var LINECHARTCHARTMARGINS = {
    top: 40,
    bottom: 40,
    left: 70,
    right: 60
};
var LINECHARTXOFFSET = 8;
var MARKERVALUENUMERICHEIGHT = 20;
var VALUEBARHEIGHT = 3;
var SERIESLABELWIDTH = 92;
// Linechart stack states
var YAxisStates;
(function (YAxisStates) {
    YAxisStates["Stacked"] = "stacked";
    YAxisStates["Shared"] = "shared";
    YAxisStates["Overlap"] = "overlap";
})(YAxisStates || (YAxisStates = {}));
var DataTypes;
(function (DataTypes) {
    DataTypes["Numeric"] = "numeric";
    DataTypes["Categorical"] = "categorical";
    DataTypes["Events"] = "events";
})(DataTypes || (DataTypes = {}));
var EventElementTypes;
(function (EventElementTypes) {
    EventElementTypes["Diamond"] = "diamond";
    EventElementTypes["Teardrop"] = "teardrop";
})(EventElementTypes || (EventElementTypes = {}));
var TooltipMeasureFormat;
(function (TooltipMeasureFormat) {
    TooltipMeasureFormat["Enveloped"] = "Enveloped";
    TooltipMeasureFormat["SingleValue"] = "SingleValue";
    TooltipMeasureFormat["Scatter"] = "Scatter";
})(TooltipMeasureFormat || (TooltipMeasureFormat = {}));
var valueTypes;
(function (valueTypes) {
    valueTypes["String"] = "String";
    valueTypes["Double"] = "Double";
    valueTypes["Long"] = "Long";
    valueTypes["Dynamic"] = "Dynamic";
    valueTypes["Boolean"] = "Boolean";
    valueTypes["DateTime"] = "DateTime";
})(valueTypes || (valueTypes = {}));
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.formatYAxisNumber = function (val) {
        if (Math.abs(val) < 1000000) {
            if (Math.abs(val) < .0000001)
                return format('.2n')(val); // scientific for less than 1 billionth
            else {
                // grouped thousands with 7 significant digits, trim insginificant trailing 0s
                var formatted = format(',.7r')(val);
                if (formatted.indexOf('.') != -1) {
                    var lastChar = formatted[formatted.length - 1];
                    while (lastChar == '0') {
                        formatted = formatted.slice(0, -1);
                        lastChar = formatted[formatted.length - 1];
                    }
                    if (lastChar == '.')
                        formatted = formatted.slice(0, -1);
                }
                return formatted;
            }
        }
        else if (Math.abs(val) >= 1000000 && Math.abs(val) < 1000000000)
            return format('.3s')(val); // suffix of M for millions
        else if (Math.abs(val) >= 1000000000 && Math.abs(val) < 1000000000000)
            return format('.3s')(val).slice(0, -1) + 'B'; // suffix of B for billions
        return format('.2n')(val); // scientific for everything else
    };
    Utils.getStackStates = function () {
        return YAxisStates;
    };
    // format [0-9]+[ms|s|m|h|d], convert to millis
    Utils.parseTimeInput = function (inputString) {
        inputString = inputString.toLowerCase();
        var getNumber = function (inputString, charsFromEnd) {
            var startAt = inputString.indexOf('pt') !== -1 ? 2 : (inputString.indexOf('p') !== -1 ? 1 : 0);
            return Number(inputString.slice(startAt, inputString.length - charsFromEnd));
        };
        if (inputString.indexOf('ms') == inputString.length - 2) {
            return getNumber(inputString, 2);
        }
        if (inputString.indexOf('s') == inputString.length - 1) {
            return getNumber(inputString, 1) * 1000;
        }
        if (inputString.indexOf('m') == inputString.length - 1) {
            return getNumber(inputString, 1) * 60 * 1000;
        }
        if (inputString.indexOf('h') == inputString.length - 1) {
            return getNumber(inputString, 1) * 60 * 60 * 1000;
        }
        if (inputString.indexOf('d') == inputString.length - 1) {
            return getNumber(inputString, 1) * 24 * 60 * 60 * 1000;
        }
        return -1;
    };
    Utils.findClosestTime = function (prevMillis, timeMap) {
        var minDistance = Infinity;
        var closestValue = null;
        Object.keys(timeMap).forEach(function (intervalCenterString) {
            var intervalCenter = Number(intervalCenterString);
            if (Math.abs(intervalCenter - prevMillis) < minDistance) {
                minDistance = Math.abs(intervalCenter - prevMillis);
                closestValue = intervalCenter;
            }
        });
        return closestValue;
    };
    Utils.getValueOfVisible = function (d, visibleMeasure) {
        if (d.measures) {
            if (d.measures[visibleMeasure] != null || d.measures[visibleMeasure] != undefined)
                return d.measures[visibleMeasure];
        }
        return null;
    };
    Utils.isStartAt = function (startAtString, searchSpan) {
        if (startAtString === void 0) { startAtString = null; }
        if (searchSpan === void 0) { searchSpan = null; }
        return (startAtString !== null && searchSpan !== null && searchSpan.from !== null);
    };
    Utils.parseShift = function (shiftString, startAtString, searchSpan) {
        if (startAtString === void 0) { startAtString = null; }
        if (searchSpan === void 0) { searchSpan = null; }
        if (this.isStartAt(startAtString, searchSpan)) {
            return (new Date(startAtString)).valueOf() - (new Date(searchSpan.from)).valueOf();
        }
        if (shiftString === undefined || shiftString === null || shiftString.length === 0) {
            return 0;
        }
        var millis;
        if (shiftString[0] === '-' || shiftString[0] === '+') {
            millis = (shiftString[0] === '-' ? -1 : 1) * this.parseTimeInput(shiftString.slice(1, shiftString.length));
        }
        else {
            millis = this.parseTimeInput(shiftString);
        }
        return -millis;
    };
    Utils.adjustStartMillisToAbsoluteZero = function (fromMillis, bucketSize) {
        var epochAdjustment = 62135596800000;
        return Math.floor((fromMillis + epochAdjustment) / bucketSize) * bucketSize - epochAdjustment;
    };
    Utils.bucketSizeToTsqInterval = function (bucketSize) {
        if (!bucketSize) {
            return null;
        }
        var bucketSizeInMillis = Utils.parseTimeInput(bucketSize);
        var padLeadingZeroes = function (number) {
            var numberAsString = String(number);
            if (numberAsString.length < 3)
                numberAsString = (numberAsString.length === 2 ? '0' : '00') + numberAsString;
            return numberAsString;
        };
        if (bucketSizeInMillis < 1000) {
            bucketSize = (bucketSize.toLowerCase().indexOf('d') !== -1) ? 'd.' : '.' + padLeadingZeroes(bucketSizeInMillis) + "s";
        }
        var prefix = bucketSize.toLowerCase().indexOf('d') !== -1 ? 'P' : 'PT';
        return (prefix + bucketSize).toUpperCase();
    };
    Utils.createEntityKey = function (aggName, aggIndex) {
        return encodeURIComponent(aggName).split(".").join("_") + "_" + aggIndex;
    };
    Utils.getColorForValue = function (chartDataOptions, value) {
        if (chartDataOptions.valueMapping && (chartDataOptions.valueMapping[value] !== undefined)) {
            return chartDataOptions.valueMapping[value].color;
        }
        return null;
    };
    Utils.rollUpContiguous = function (data) {
        var areEquivalentBuckets = function (d1, d2) {
            if (!d1.measures || !d2.measures) {
                return false;
            }
            if (Object.keys(d1.measures).length !== Object.keys(d2.measures).length) {
                return false;
            }
            return Object.keys(d1.measures).reduce(function (p, c, i) {
                return p && (d1.measures[c] === d2.measures[c]);
            }, true);
        };
        return data.filter(function (d, i) {
            if (i !== 0) {
                return !areEquivalentBuckets(d, data[i - 1]);
            }
            return true;
        });
    };
    Utils.formatOffsetMinutes = function (offset) {
        return (offset < 0 ? '-' : '+') +
            Math.floor(offset / 60) + ':' +
            (offset % 60 < 10 ? '0' : '') + (offset % 60) + '';
    };
    Utils.getOffsetMinutes = function (offset, millis) {
        if (offset == 'Local') {
            return -moment.tz.zone(moment.tz.guess()).parse(millis);
        }
        if (typeof offset == 'string' && isNaN(offset)) {
            return -moment.tz.zone(offset).parse(millis);
        }
        else {
            return offset;
        }
    };
    Utils.offsetUTC = function (date) {
        var offsettedDate = new Date(date.valueOf() - date.getTimezoneOffset() * 60 * 1000);
        return offsettedDate;
    };
    // inverse of getOffsetMinutes, this is the conversion factor of an offsettedTime to UTC in minutes 
    Utils.getMinutesToUTC = function (offset, millisInOffset) {
        if (offset == 'Local') {
            return moment.tz.zone(moment.tz.guess()).utcOffset(millisInOffset);
        }
        if (typeof offset == 'string' && isNaN(offset)) {
            return moment.tz.zone(offset).utcOffset(millisInOffset);
        }
        else {
            return -offset;
        }
    };
    Utils.addOffsetGuess = function (timezoneName) {
        var timezone = moment.tz(new Date(), timezoneName.split(' ').join('_'));
        var formatted = timezone.format('Z');
        return "UTC" + formatted;
    };
    Utils.timezoneAbbreviation = function (timezoneName) {
        var abbr = moment.tz(new Date(), timezoneName).format('z');
        if (abbr[0] === '-' || abbr[0] === '+')
            return '';
        return abbr;
    };
    Utils.createTimezoneAbbreviation = function (offset) {
        var timezone = Utils.parseTimezoneName(offset);
        var timezoneAbbreviation = Utils.timezoneAbbreviation(timezone);
        return (timezoneAbbreviation.length !== 0 ? timezoneAbbreviation : Utils.addOffsetGuess(timezone));
    };
    Utils.parseTimezoneName = function (timezoneRaw) {
        if (!isNaN(timezoneRaw)) {
            if (timezoneRaw === 0) {
                return 'UTC';
            }
            return '';
        }
        if (timezoneRaw == 'Local') {
            return moment.tz.guess();
        }
        return timezoneRaw !== null ? timezoneRaw.split(' ').join('_') : '';
    };
    Utils.convertTimezoneToLabel = function (timezone, locdLocal) {
        if (locdLocal === void 0) { locdLocal = 'Local'; }
        var timezoneName = this.parseTimezoneName(timezone);
        var localPrefix = '';
        var offsetPrefix = '';
        if (timezone == 'Local') {
            localPrefix = locdLocal + ' - ';
        }
        if (timezone !== 'UTC') {
            offsetPrefix = ' (' + this.addOffsetGuess(timezoneName) + ')';
        }
        var timezoneAbbreviation = this.timezoneAbbreviation(timezoneName);
        var timezoneSuffix = (timezoneAbbreviation && timezoneAbbreviation.length !== 0 && timezoneAbbreviation !== 'UTC') ? ': ' + timezoneAbbreviation : '';
        return offsetPrefix + " " + localPrefix + timezoneName.replace(/_/g, ' ') + timezoneSuffix;
    };
    Utils.rangeTimeFormat = function (rangeMillis) {
        var oneSecond = 1000;
        var oneMinute = 60 * 1000;
        var oneHour = oneMinute * 60;
        var oneDay = oneHour * 24;
        var days = Math.floor(rangeMillis / oneDay);
        var hours = Math.floor(rangeMillis / oneHour) % 24;
        var minutes = Math.floor(rangeMillis / oneMinute) % 60;
        var seconds = Math.floor(rangeMillis / oneSecond) % 60;
        var millis = Math.floor(rangeMillis % 1000);
        if (rangeMillis >= oneDay) {
            return days + "d " + (hours > 0 ? (hours + "h") : "");
        }
        else if (rangeMillis >= oneHour) {
            return hours + "h " + (minutes > 0 ? (minutes + "m") : "");
        }
        else if (rangeMillis >= oneMinute) {
            return minutes + "m " + (seconds > 0 ? (seconds + "s") : "");
        }
        else if (rangeMillis >= oneSecond) {
            return seconds + (millis != 0 ? "." + millis : "") + "s";
        }
        return millis + "ms";
    };
    Utils.subDateTimeFormat = function (is24HourTime, usesSeconds, usesMillis) {
        return (is24HourTime ? "HH" : "hh") + ":mm" + (usesSeconds ? (":ss" + (usesMillis ? ".SSS" : "")) : "") + (is24HourTime ? "" : " A");
    };
    Utils.timeFormat = function (usesSeconds, usesMillis, offset, is24HourTime, shiftMillis, timeFormat, locale) {
        var _this = this;
        if (usesSeconds === void 0) { usesSeconds = false; }
        if (usesMillis === void 0) { usesMillis = false; }
        if (offset === void 0) { offset = 0; }
        if (is24HourTime === void 0) { is24HourTime = true; }
        if (shiftMillis === void 0) { shiftMillis = null; }
        if (timeFormat === void 0) { timeFormat = null; }
        if (locale === void 0) { locale = 'en'; }
        return function (d) {
            if (shiftMillis !== 0) {
                d = new Date(d.valueOf() + shiftMillis);
            }
            var stringFormat;
            if (timeFormat !== null) {
                stringFormat = timeFormat;
            }
            else {
                stringFormat = "L " + _this.subDateTimeFormat(is24HourTime, usesSeconds, usesMillis);
            }
            if (typeof offset == 'string' && isNaN(offset)) {
                return moment.tz(d, 'UTC').tz(offset === 'Local' ? moment.tz.guess() : offset).locale(locale).format(stringFormat);
            }
            else {
                return moment.tz(d, "UTC").utcOffset(offset).locale(locale).format(stringFormat);
            }
        };
    };
    Utils.splitTimeLabel = function (text) {
        var shouldSplit = function (str) {
            var splitLines = str.split(' ');
            return !((splitLines.length === 1) || (splitLines.length === 2 && (splitLines[1] === 'AM' || splitLines[1] === 'PM')));
        };
        text.each(function () {
            if (this.children == undefined || this.children.length == 0) { // don't split already split labels
                var text = select(this);
                var lines = text.text().split(" ");
                var dy = parseFloat(text.attr("dy"));
                if (shouldSplit(text.text())) {
                    var newFirstLine = lines[0] + (lines.length === 3 ? (' ' + lines[1]) : '');
                    var newSecondLine = lines[lines.length - 1];
                    text.text(null).append("tspan")
                        .attr("x", 0)
                        .attr("y", text.attr("y"))
                        .attr("dy", dy + "em")
                        .text(newFirstLine);
                    text.append("tspan")
                        .attr("x", 0)
                        .attr("y", text.attr("y"))
                        .attr("dy", (dy + dy * 1.4) + "em")
                        .text(newSecondLine);
                }
            }
        });
    };
    Utils.getUTCHours = function (d, is24HourTime) {
        if (is24HourTime === void 0) { is24HourTime = true; }
        var hours = d.getUTCHours();
        if (!is24HourTime) {
            if (hours == 0)
                hours = 12;
            if (hours > 12)
                hours = hours - 12;
        }
        return hours;
    };
    Utils.UTCTwelveHourFormat = function (d) {
        var hours = String(this.getUTCHours(d));
        var minutes = (d.getUTCMinutes() < 10 ? "0" : "") + String(d.getUTCMinutes());
        var amPm = (d.getUTCHours() < 12) ? "AM" : "PM";
        return hours + ":" + minutes + " " + amPm;
    };
    Utils.getAgVisible = function (displayState, aggI, splitBy) {
        return (displayState[aggI].visible) ? displayState[aggI].splitBys[splitBy].visible : false;
    };
    Utils.getAgVisibleMeasure = function (displayState, aggI, splitBy) {
        return displayState[aggI].splitBys[splitBy].visibleType;
    };
    Utils.createSeriesTypeIcon = function (seriesType, selection) {
        var g = selection.append("g")
            .style("position", "absolute");
        if (seriesType == "event") {
            g.attr("transform", "translate(7.5,0)")
                .append("rect")
                .attr("width", 7)
                .attr("height", 7)
                .attr("transform", "rotate(45)");
        }
        else if (seriesType == "state") {
            g.append("rect")
                .attr("width", 15)
                .attr("height", 10);
        }
        else { // fxn
            g.append("path")
                .attr("d", "M0 5 Q 4 0, 8 5 T 16 5")
                .attr("fill", "none");
        }
    };
    Utils.strip = function (text) {
        var div = document.createElement('div');
        div.innerHTML = text;
        var textContent = div.textContent || div.innerText || '';
        return textContent;
    };
    Utils.stripForConcat = function (text) {
        var specialCharacters = ['"', "'", '?', '<', '>', ';'];
        specialCharacters.forEach(function (c) { text = text.split(c).join(''); });
        return text;
    };
    Utils.setSeriesLabelSubtitleText = function (subtitle, isInFocus) {
        if (isInFocus === void 0) { isInFocus = false; }
        var subtitleDatum = subtitle.data()[0];
        if (!subtitle.select('.tsi-splitBy').empty()) {
            var textAfterSplitByExists = subtitleDatum.timeShift !== '' || subtitleDatum.variableAlias;
            var splitByString = "" + subtitleDatum.splitBy + ((textAfterSplitByExists && !isInFocus) ? ', ' : '');
            Utils.appendFormattedElementsFromString(subtitle.select('.tsi-splitBy'), splitByString);
        }
        if (subtitle.select('.tsi-timeShift')) {
            subtitle.select('.tsi-timeShift')
                .text(function (d) {
                return "" + subtitleDatum.timeShift + ((subtitleDatum.variableAlias && !isInFocus) ? ', ' : '');
            });
        }
        if (subtitle.select('.tsi-variableAlias')) {
            subtitle.select('.tsi-variableAlias')
                .text(function (d) { return subtitleDatum.variableAlias; });
        }
    };
    Utils.revertAllSubtitleText = function (markerValues, opacity) {
        if (opacity === void 0) { opacity = 1; }
        var self = this;
        markerValues.classed('tsi-isExpanded', false)
            .style('opacity', opacity)
            .each(function () {
            self.setSeriesLabelSubtitleText(select(this).selectAll('.tsi-tooltipSubtitle'), false);
        });
    };
    Utils.generateColors = function (numColors, includeColors) {
        if (includeColors === void 0) { includeColors = null; }
        var defaultColors = ['#008272', '#D869CB', '#FF8C00', '#8FE6D7', '#3195E3', '#F7727E', '#E0349E', '#C8E139', '#60B9AE',
            '#93CFFB', '#854CC7', '#258225', '#0078D7', '#FF2828', '#FFF100'];
        var postDefaultColors = scaleSequential(interpolateCubehelixDefault).domain([defaultColors.length - .5, numColors - .5]);
        var colors = [];
        var colorsIndex = 0;
        if (includeColors) { //add the colors we want to include first
            for (var i = 0; i < includeColors.length && colorsIndex < numColors; i++) {
                var color = includeColors[i];
                if (colors.indexOf(color) === -1) {
                    colors.push(color);
                    colorsIndex++;
                }
            }
        }
        for (var i = 0; colorsIndex < numColors; i++) {
            if (i < defaultColors.length) {
                if (colors.indexOf(defaultColors[i]) === -1) {
                    colors.push(defaultColors[i]);
                    colorsIndex++;
                }
            }
            else if (colors.indexOf(postDefaultColors(i)) === -1) {
                colors.push(postDefaultColors(i));
                colorsIndex++;
            }
        }
        return colors;
    };
    Utils.convertFromLocal = function (date) {
        return new Date(date.valueOf() - date.getTimezoneOffset() * 60 * 1000);
    };
    Utils.adjustDateFromTimezoneOffset = function (date) {
        var dateCopy = new Date(date.valueOf());
        dateCopy.setTime(dateCopy.getTime() + dateCopy.getTimezoneOffset() * 60 * 1000);
        return dateCopy;
    };
    Utils.offsetFromUTC = function (date, offset) {
        if (offset === void 0) { offset = 0; }
        var offsetMinutes = Utils.getOffsetMinutes(offset, date.valueOf());
        var dateCopy = new Date(date.valueOf() + offsetMinutes * 60 * 1000);
        return dateCopy;
    };
    Utils.offsetToUTC = function (date, offset) {
        if (offset === void 0) { offset = 0; }
        var offsetMinutes = Utils.getOffsetMinutes(offset, date.valueOf());
        var dateCopy = new Date(date.valueOf() - offsetMinutes * 60 * 1000);
        return dateCopy;
    };
    Utils.parseUserInputDateTime = function (timeText, offset) {
        var dateTimeFormat = "L " + this.subDateTimeFormat(true, true, true);
        var parsedDate = moment(timeText, dateTimeFormat).toDate();
        var utcDate = this.offsetToUTC(this.convertFromLocal(parsedDate), offset);
        return utcDate.valueOf();
    };
    Utils.getBrighterColor = function (color) {
        var hclColor = hcl(color);
        if (hclColor.l < 80) {
            return hclColor.brighter().toString();
        }
        return hclColor.toString();
    };
    Utils.createSplitByColors = function (displayState, aggKey, ignoreIsOnlyAgg) {
        if (ignoreIsOnlyAgg === void 0) { ignoreIsOnlyAgg = false; }
        if (Object.keys(displayState[aggKey]["splitBys"]).length == 1)
            return [displayState[aggKey].color];
        var isOnlyAgg = Object.keys(displayState).reduce(function (accum, currAgg) {
            if (currAgg == aggKey)
                return accum;
            if (displayState[currAgg]["visible"] == false)
                return accum && true;
            return false;
        }, true);
        if (isOnlyAgg && !ignoreIsOnlyAgg) {
            return this.generateColors(Object.keys(displayState[aggKey]["splitBys"]).length);
        }
        var aggColor = displayState[aggKey].color;
        var interpolateColor = scaleLinear().domain([0, Object.keys(displayState[aggKey]["splitBys"]).length])
            .range([hcl(aggColor).darker(), hcl(aggColor).brighter()]);
        var colors = [];
        for (var i = 0; i < Object.keys(displayState[aggKey]["splitBys"]).length; i++) {
            colors.push(interpolateColor(i));
        }
        return colors;
    };
    Utils.colorSplitBy = function (displayState, splitByIndex, aggKey, ignoreIsOnlyAgg) {
        if (ignoreIsOnlyAgg === void 0) { ignoreIsOnlyAgg = false; }
        if (Object.keys(displayState[aggKey]["splitBys"]).length == 1)
            return displayState[aggKey].color;
        var isOnlyAgg = Object.keys(displayState).reduce(function (accum, currAgg) {
            if (currAgg == aggKey)
                return accum;
            if (displayState[currAgg]["visible"] == false)
                return accum && true;
            return false;
        }, true);
        if (isOnlyAgg && !ignoreIsOnlyAgg) {
            var splitByColors = this.generateColors(Object.keys(displayState[aggKey]["splitBys"]).length);
            return splitByColors[splitByIndex];
        }
        var aggColor = displayState[aggKey].color;
        var interpolateColor = scaleLinear().domain([0, Object.keys(displayState[aggKey]["splitBys"]).length])
            .range([hcl(aggColor).darker(), hcl(aggColor).brighter()]);
        return interpolateColor(splitByIndex);
    };
    Utils.getTheme = function (theme) {
        return theme ? 'tsi-' + theme : 'tsi-dark';
    };
    Utils.clearSelection = function () {
        var sel = window.getSelection ? window.getSelection() : document.selection;
        if (sel) {
            if (sel.removeAllRanges) {
                sel.removeAllRanges();
            }
            else if (sel.empty) {
                sel.empty();
            }
        }
    };
    Utils.mark = function (filter, text) {
        if (filter.length == 0)
            return text;
        var regExp = new RegExp(filter, 'gi');
        return text.replace(regExp, function (m) { return '<mark>' + m + '</mark>'; });
    };
    Utils.hash = function (str) {
        var hash = 5381, i = str.length;
        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }
        /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
         * integers. Since we want the results to be always positive, convert the
         * signed int to an unsigned by doing an unsigned bitshift. */
        return hash >>> 0;
    };
    Utils.guid = function () {
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    Utils.createValueFilter = function (aggregateKey, splitBy) {
        return function (d, j) {
            var currAggKey;
            var currSplitBy;
            if (d.aggregateKey) {
                currAggKey = d.aggregateKey;
                currSplitBy = d.splitBy;
            }
            else if (d && d.length) {
                currAggKey = d[0].aggregateKey;
                currSplitBy = d[0].splitBy;
            }
            else
                return true;
            return (currAggKey == aggregateKey && (splitBy == null || splitBy == currSplitBy));
        };
    };
    Utils.downloadCSV = function (csvString, csvName) {
        if (csvName === void 0) { csvName = "Table"; }
        var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        var blobURL = window.URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.setAttribute("href", blobURL);
        link.setAttribute("download", csvName + ".csv");
        link.setAttribute("tabindex", "0");
        link.innerHTML = "";
        document.body.appendChild(link);
        link.click();
    };
    Utils.sanitizeString = function (str, type) {
        if (str === null || str === undefined) {
            return "";
        }
        if (type !== valueTypes.Double && type !== valueTypes.Long) {
            var jsonifiedString = type === valueTypes.Dynamic ? JSON.stringify(str) : String(str);
            if (jsonifiedString.indexOf(',') !== -1 || jsonifiedString.indexOf('"') !== -1 || jsonifiedString.indexOf('\n') !== -1 || type === valueTypes.Dynamic) {
                var replacedString = jsonifiedString.replace(/"/g, '""');
                return '"' + replacedString + '"';
            }
        }
        return str;
    };
    Utils.hideGrid = function (renderTarget) {
        select(renderTarget).selectAll("." + GRIDCONTAINERCLASS).remove();
    };
    Utils.showGrid = function (renderTarget, chartOptions, aggregateExpressionOptions, chartComponentData) {
        chartOptions.fromChart = true;
        select(renderTarget).selectAll("." + GRIDCONTAINERCLASS).remove();
        var gridContainer = select(renderTarget).append('div')
            .attr('class', GRIDCONTAINERCLASS)
            .style('width', '100%')
            .style('height', '100%');
        var gridComponent = new Grid(gridContainer.node());
        gridComponent.usesSeconds = chartComponentData.usesSeconds;
        gridComponent.usesMillis = chartComponentData.usesMillis;
        var grid = gridComponent.renderFromAggregates(chartComponentData.data, chartOptions, aggregateExpressionOptions, chartComponentData);
        gridComponent.focus(0, 0);
    };
    Utils.createGridEllipsisOption = function (renderTarget, chartOptions, aggregateExpressionOptions, chartComponentData, labelText) {
        var _this = this;
        if (labelText === void 0) { labelText = 'Display Grid'; }
        return {
            iconClass: "grid",
            label: labelText,
            action: function () {
                _this.showGrid(renderTarget, chartOptions, aggregateExpressionOptions, chartComponentData);
            },
            description: ""
        };
    };
    Utils.focusOnEllipsisButton = function (renderTarget) {
        var ellipsisContainer = select(renderTarget).select(".tsi-ellipsisContainerDiv");
        if (!ellipsisContainer.empty()) {
            ellipsisContainer.select(".tsi-ellipsisButton").node().focus();
        }
    };
    Utils.createDownloadEllipsisOption = function (csvStringGenerator, action, downloadLabel) {
        if (action === void 0) { action = function () { }; }
        if (downloadLabel === void 0) { downloadLabel = "Download as CSV"; }
        return {
            iconClass: "download",
            label: downloadLabel,
            action: function () {
                Utils.downloadCSV(csvStringGenerator());
                action();
            },
            description: ""
        };
    };
    Utils.createControlPanel = function (renderTarget, legendWidth, topChartMargin, chartOptions) {
        select(renderTarget).selectAll(".tsi-chartControlsPanel").remove();
        var controlPanelWidth = Math.max(1, select(renderTarget).node().clientWidth -
            (chartOptions.legend == "shown" ? legendWidth : 0));
        var chartControlsPanel = select(renderTarget).append("div")
            .attr("class", "tsi-chartControlsPanel")
            .style("width", controlPanelWidth + "px")
            .style("top", Math.max((topChartMargin - 32), 0) + "px");
        return chartControlsPanel;
    };
    Utils.escapeQuotesCommasAndNewlines = function (stringToEscape) {
        var escapedString = "";
        if (stringToEscape && (stringToEscape.indexOf("\"") != -1 ||
            stringToEscape.indexOf(",") != -1 ||
            stringToEscape.indexOf("\n") != -1)) {
            stringToEscape = stringToEscape.replace(/"/g, "\"\"");
            escapedString += "\"";
            escapedString += stringToEscape;
            escapedString += "\"";
            return escapedString;
        }
        else {
            return stringToEscape;
        }
    };
    Utils.getNonNumericHeight = function (rawHeight) {
        return rawHeight + NONNUMERICTOPMARGIN;
    };
    Utils.getControlPanelWidth = function (renderTarget, legendWidth, isLegendShown) {
        return Math.max(1, select(renderTarget).node().clientWidth -
            (isLegendShown ? legendWidth : 0));
    };
    Utils.getValueOrDefault = function (chartOptionsObj, propertyName, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var propertyValue = chartOptionsObj[propertyName];
        if (propertyValue == undefined) {
            if (this[propertyName] == undefined)
                return defaultValue;
            return this[propertyName];
        }
        return propertyValue;
    };
    Utils.safeNotNullOrUndefined = function (valueLambda) {
        try {
            var value = valueLambda();
            return !(value === null || value === undefined);
        }
        catch (err) {
            return false;
        }
    };
    Utils.getAggKeys = function (data) {
        var aggregateCounterMap = {};
        return data.map(function (aggregate) {
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
            return aggKey;
        });
    };
    Utils.roundToMillis = function (rawTo, bucketSize) {
        return Math.ceil((rawTo + 62135596800000) / (bucketSize)) * (bucketSize) - 62135596800000;
    };
    Utils.mergeSeriesForScatterPlot = function (chartData, scatterMeasures) {
        var _a;
        var _this = this;
        var xMeasure = chartData[scatterMeasures.X_MEASURE], yMeasure = chartData[scatterMeasures.Y_MEASURE], rMeasure = chartData[scatterMeasures.R_MEASURE];
        var measureNames = Utils.getScatterPlotMeasureNames(chartData, scatterMeasures);
        // Create data label
        var xLabel = xMeasure.additionalFields.Variable.substring(0, 15) + (xMeasure.additionalFields.Variable.length > 15 ? "... vs" : " vs");
        var yLabel = " " + yMeasure.additionalFields.Variable.substring(0, 15) + (yMeasure.additionalFields.Variable.length > 15 ? "... " : "");
        var rLabel = (rMeasure != null ? " vs " + rMeasure.additionalFields.Variable.substring(0, 15) + (rMeasure.additionalFields.Variable.length > 15 ? "... " : "") : "");
        var dataTitle = xLabel + yLabel + rLabel;
        // Initialize scatter plot data object
        var scatterData = (_a = {},
            _a[dataTitle] = {
                "": {}
            },
            _a);
        // Create measure types
        var measureTypes = {
            X_MEASURE_TYPE: 'avg' in xMeasure.measureTypes ? xMeasure.measureTypes['avg'] : xMeasure.measureTypes[0],
            Y_MEASURE_TYPE: 'avg' in yMeasure.measureTypes ? yMeasure.measureTypes['avg'] : yMeasure.measureTypes[0],
            R_MEASURE_TYPE: null
        };
        // Takes query and returns normalized time data
        var normalizeTimestampKeys = function (query) {
            var newTS = {};
            Object.keys(query.data[query.alias][""]).forEach(function (key) {
                var oldTime = new Date(key).valueOf();
                var timeShift = query.timeShift != "" ? _this.parseShift(query.timeShift, query.startAt, query.searchSpan) : 0;
                // Calculate real timeshift based on bucket snapping
                var bucketShiftInMillis = _this.adjustStartMillisToAbsoluteZero(timeShift, _this.parseShift(query.searchSpan.bucketSize));
                var normalizedTime = oldTime - bucketShiftInMillis;
                var timestamp = new Date(normalizedTime).toISOString();
                newTS[timestamp] = query.data[query.alias][""][key];
            });
            return newTS;
        };
        // Normalize timestamp data
        xMeasure.data[xMeasure.alias][""] = normalizeTimestampKeys(xMeasure);
        yMeasure.data[yMeasure.alias][""] = normalizeTimestampKeys(yMeasure);
        if (rMeasure) {
            rMeasure.data[rMeasure.alias][""] = normalizeTimestampKeys(rMeasure);
            measureTypes.R_MEASURE_TYPE = 'avg' in rMeasure.measureTypes ? rMeasure.measureTypes['avg'] : rMeasure.measureTypes[0];
        }
        // For each timestamp in X data mix measures of other series
        Object.keys(xMeasure.data[xMeasure.alias][""]).forEach(function (key) {
            if (key in yMeasure.data[yMeasure.alias][""]) {
                var measures = {};
                measures[measureNames.X_MEASURE] = xMeasure.data[xMeasure.alias][""][key][measureTypes.X_MEASURE_TYPE];
                measures[measureNames.Y_MEASURE] = yMeasure.data[yMeasure.alias][""][key][measureTypes.Y_MEASURE_TYPE];
                // Add optional R measure
                if (rMeasure != null && key in rMeasure.data[rMeasure.alias][""]) {
                    measures[measureNames.R_MEASURE] = rMeasure.data[rMeasure.alias][""][key][measureTypes.R_MEASURE_TYPE];
                }
                // Discard timestamps with null valued measures
                if (xMeasure.data[xMeasure.alias][""][key][measureTypes.X_MEASURE_TYPE] && yMeasure.data[yMeasure.alias][""][key][measureTypes.Y_MEASURE_TYPE]) {
                    if (rMeasure != null) {
                        if (key in rMeasure.data[rMeasure.alias][""] && rMeasure.data[rMeasure.alias][""][key][measureTypes.R_MEASURE_TYPE])
                            scatterData[dataTitle][""][key] = measures;
                    }
                    else {
                        scatterData[dataTitle][""][key] = measures;
                    }
                }
            }
        });
        return scatterData;
    };
    Utils.getScatterPlotMeasureNames = function (chartData, scatterMeasures) {
        var uniqueNameMap = {};
        var xMeasureName = chartData[scatterMeasures.X_MEASURE].alias + " " + chartData[scatterMeasures.X_MEASURE].additionalFields.Variable +
            (chartData[scatterMeasures.X_MEASURE].timeShift == "" ? "" : " " + chartData[scatterMeasures.X_MEASURE].timeShift);
        uniqueNameMap[xMeasureName] = 1;
        var yMeasureName = chartData[scatterMeasures.Y_MEASURE].alias + " " + chartData[scatterMeasures.Y_MEASURE].additionalFields.Variable +
            (chartData[scatterMeasures.Y_MEASURE].timeShift == "" ? "" : " " + chartData[scatterMeasures.Y_MEASURE].timeShift);
        if (yMeasureName in uniqueNameMap) {
            var tempName = yMeasureName;
            yMeasureName += " (" + uniqueNameMap[yMeasureName].toString() + ")";
            uniqueNameMap[tempName] = uniqueNameMap[tempName] + 1;
        }
        else {
            uniqueNameMap[yMeasureName] = 1;
        }
        var rMeasureName = chartData[scatterMeasures.R_MEASURE] ? chartData[scatterMeasures.R_MEASURE].alias + " " + chartData[scatterMeasures.R_MEASURE].additionalFields.Variable +
            (chartData[scatterMeasures.R_MEASURE].timeShift == "" ? "" : " " + chartData[scatterMeasures.R_MEASURE].timeShift) : null;
        if (rMeasureName != null) {
            if (rMeasureName in uniqueNameMap) {
                rMeasureName += " (" + uniqueNameMap[rMeasureName].toString() + ")";
            }
        }
        return {
            X_MEASURE: xMeasureName,
            Y_MEASURE: yMeasureName,
            R_MEASURE: rMeasureName ? rMeasureName : null
        };
    };
    Utils.getMinWarmTime = function (warmStoreFrom, retentionString) {
        var minWarmTime = new Date(warmStoreFrom);
        if (retentionString !== null) {
            var retentionPeriod = Utils.parseTimeInput(retentionString);
            minWarmTime = new Date(Math.max(minWarmTime.valueOf(), (Date.now() - retentionPeriod)));
        }
        return minWarmTime;
    };
    Utils.standardizeTSStrings = function (rawData) {
        var convertedData = [];
        rawData.forEach(function (dG, i) {
            var dGName = Object.keys(dG)[0];
            var dataGroup = dG[dGName];
            var convertedDataGroup = {};
            var dataGroupKeyedObject = {};
            dataGroupKeyedObject[dGName] = convertedDataGroup;
            convertedData.push(dataGroupKeyedObject);
            if (dataGroup) {
                Object.keys(dataGroup).forEach(function (seriesName) {
                    convertedDataGroup[seriesName] = {};
                    if (dataGroup[seriesName]) {
                        Object.keys(dataGroup[seriesName]).forEach(function (rawTS) {
                            var isoString;
                            try {
                                isoString = (new Date(rawTS)).toISOString();
                                convertedDataGroup[seriesName][isoString] = dataGroup[seriesName][rawTS];
                            }
                            catch (RangeError) {
                                console.log(rawTS + " is not a valid ISO time");
                            }
                        });
                    }
                });
            }
        });
        return convertedData;
    };
    // takes in an availability distribution and a min and max date, returns a tuple, where the first is the new distribution 
    // excluding values out of the range, and the second is all excluded values
    Utils.cullValuesOutOfRange = function (availabilityDistribution, minDateString, maxDateString) {
        var dateZero = '0000-01-01T00:00:00Z';
        var minDateValue = new Date(minDateString).valueOf();
        var maxDateValue = new Date(maxDateString).valueOf();
        if (new Date(availabilityDistribution.range.from).valueOf() < minDateValue ||
            new Date(availabilityDistribution.range.to).valueOf() > maxDateValue) {
            var inRangeValues_1 = {};
            var outOfRangeValues_1 = {};
            var highestNotOverMaxString_1 = dateZero;
            var highestNotOverMaxValue_1 = (new Date(highestNotOverMaxString_1)).valueOf();
            var lowestAboveMinValue_1 = Infinity;
            Object.keys(availabilityDistribution.distribution).forEach(function (bucketKey) {
                var bucketValue = (new Date(bucketKey)).valueOf();
                if (bucketValue > maxDateValue || bucketValue < minDateValue) {
                    outOfRangeValues_1[bucketKey] = availabilityDistribution.distribution[bucketKey];
                }
                else {
                    inRangeValues_1[bucketKey] = availabilityDistribution.distribution[bucketKey];
                    if (bucketValue > highestNotOverMaxValue_1) {
                        highestNotOverMaxValue_1 = bucketValue;
                        highestNotOverMaxString_1 = bucketKey;
                    }
                    if (bucketValue < lowestAboveMinValue_1) {
                        lowestAboveMinValue_1 = bucketValue;
                    }
                }
            });
            var bucketSize = this.parseTimeInput(availabilityDistribution.intervalSize);
            if (highestNotOverMaxString_1 !== dateZero) { // a value exists 
                var nowMillis = new Date().valueOf();
                if (highestNotOverMaxValue_1 < nowMillis && (highestNotOverMaxValue_1 + bucketSize) > nowMillis) {
                    // the new end value was before now, but after adding bucket size, its after now
                    // so we set it to now to avoid setting it to a date in the future
                    availabilityDistribution.range.to = new Date(nowMillis).toISOString();
                }
                else {
                    availabilityDistribution.range.to = new Date(highestNotOverMaxValue_1 + bucketSize).toISOString();
                }
            }
            else {
                var rangeToValue = (new Date(availabilityDistribution.range.to)).valueOf();
                if (minDateValue > rangeToValue) { // entire window is to the right of distribution range
                    availabilityDistribution.range.to = maxDateString;
                }
                else {
                    var toValue = Math.min(maxDateValue + bucketSize, (new Date(availabilityDistribution.range.to)).valueOf()); //clamped to maxDateString passed in
                    availabilityDistribution.range.to = (new Date(toValue)).toISOString();
                }
            }
            if (lowestAboveMinValue_1 !== Infinity) { // a value exists
                availabilityDistribution.range.from = (new Date(lowestAboveMinValue_1)).toISOString();
            }
            else {
                var rangeFromValue = (new Date(availabilityDistribution.range.from)).valueOf();
                if (maxDateValue < (new Date(availabilityDistribution.range.from)).valueOf()) { // entire window is to the left of distribution range
                    availabilityDistribution.range.from = minDateString;
                }
                else {
                    var fromValue = Math.max(minDateValue, rangeFromValue); // clamped to minDateString passed in
                    availabilityDistribution.range.from = (new Date(fromValue)).toISOString();
                }
            }
            availabilityDistribution.distribution = inRangeValues_1;
            return [availabilityDistribution, outOfRangeValues_1];
        }
        return [availabilityDistribution, {}];
    };
    Utils.mergeAvailabilities = function (warmAvailability, coldAvailability, retentionString) {
        if (retentionString === void 0) { retentionString = null; }
        var warmStoreRange = warmAvailability.range;
        var minWarmTime = this.getMinWarmTime(warmStoreRange.from, retentionString);
        var maxWarmTime = new Date(Math.min(new Date(warmStoreRange.to).valueOf(), new Date(coldAvailability.range.to).valueOf()));
        var mergedAvailability = Object.assign({}, coldAvailability);
        mergedAvailability.warmStoreRange = [minWarmTime.toISOString(), maxWarmTime.toISOString()];
        if (retentionString !== null) {
            mergedAvailability.retentionPeriod = retentionString;
        }
        return mergedAvailability;
    };
    Utils.languageGuess = function () {
        return navigator.languages && navigator.languages[0] || // Chrome / Firefox
            navigator.language; // All browsers
    };
    Utils.memorySizeOf = function (obj) {
        var bytes = 0;
        var sizeOf = function (obj) {
            if (obj !== null && obj !== undefined) {
                switch (typeof obj) {
                    case 'number':
                        bytes += 8;
                        break;
                    case 'string':
                        bytes += obj.length * 2;
                        break;
                    case 'boolean':
                        bytes += 4;
                        break;
                    case 'object':
                        var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                        if (objClass === 'Object' || objClass === 'Array') {
                            for (var key in obj) {
                                if (!obj.hasOwnProperty(key)) {
                                    continue;
                                }
                                sizeOf(key);
                                sizeOf(obj[key]);
                            }
                        }
                        else {
                            bytes += obj.toString().length * 2;
                        }
                        break;
                }
            }
            return bytes;
        };
        return sizeOf(obj);
    };
    Utils.guidForNullTSID = Utils.guid();
    Utils.equalToEventTarget = (function () {
        return (this == event.target);
    });
    Utils.isKeyDownAndNotEnter = function (e) {
        if (e && e.type && e.type === 'keydown') {
            var key = e.which || e.keyCode;
            if (key !== 13) {
                return true;
            }
            else {
                e.preventDefault();
            }
        }
        return false;
    };
    Utils.getInstanceKey = function (instance) {
        return Utils.instanceHasEmptyTSID(instance) ? Utils.guid() : instance.timeSeriesId.map(function (id) { return id === null ? Utils.guidForNullTSID : id; }).join();
    };
    Utils.stripNullGuid = function (str) {
        return str.replace(Utils.guidForNullTSID, nullTsidDisplayString);
    };
    Utils.getTimeSeriesIdString = function (instance) {
        return instance.timeSeriesId.map(function (id) { return id === null ? nullTsidDisplayString : id; }).join(', ');
    };
    Utils.getTimeSeriesIdToDisplay = function (instance, emptyDisplayString) {
        return Utils.instanceHasEmptyTSID(instance) ? emptyDisplayString : instance.timeSeriesId.map(function (id) { return id === null ? Utils.guidForNullTSID : id; }).join(', ');
    };
    Utils.getHighlightedTimeSeriesIdToDisplay = function (instance) {
        var _a;
        return (_a = instance.highlights) === null || _a === void 0 ? void 0 : _a.timeSeriesId.map(function (id, idx) { return instance.timeSeriesId[idx] === null ? Utils.guidForNullTSID : id; }).join(', ');
    };
    Utils.instanceHasEmptyTSID = function (instance) {
        return !instance.timeSeriesId || instance.timeSeriesId.length === 0;
    };
    // appends dom elements of stripped strings including hits (for instance search results) and mono classed spans (for null tsid)
    Utils.appendFormattedElementsFromString = function (targetElem, str, options) {
        if (options === void 0) { options = null; }
        var data = [];
        var splitByNullGuid = function (str) {
            var data = [];
            var splittedByNull = str.split(Utils.guidForNullTSID);
            splittedByNull.forEach(function (s, i) {
                if (i === 0) {
                    if (s) {
                        data.push({ str: s });
                    }
                }
                else {
                    data.push({ str: nullTsidDisplayString, isNull: true });
                    if (s) {
                        data.push({ str: s });
                    }
                }
            });
            return data;
        };
        var splitByTag = options && options.splitByTag ? options.splitByTag : 'hit';
        var splittedByHit = str.split("<" + splitByTag + ">");
        splittedByHit.forEach(function (s, i) {
            if (i === 0) {
                data = data.concat(splitByNullGuid(s));
            }
            else {
                var splittedByHitClose = s.split("</" + splitByTag + ">");
                data.push({ str: splittedByHitClose[0], isHit: true });
                data = data.concat(splitByNullGuid(splittedByHitClose[1]));
            }
        });
        var additionalClassName = options && options.additionalClassName ? options.additionalClassName : '';
        var children = targetElem.selectAll('.tsi-formattedChildren').data(data);
        children.enter()
            .append(function (d) {
            return d.isHit ? document.createElement('mark')
                : options && options.inSvg ? document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
                    : document.createElement('span');
        })
            .classed('tsi-formattedChildren', true)
            .merge(children)
            .classed('tsi-baseMono', function (d) { return d.isNull; })
            .classed(additionalClassName, options && options.additionalClassName)
            .text(function (d) { return d.str; });
        children.exit().remove();
    };
    Utils.escapedTsidForExactSearch = function (tsid) {
        var escapedTsid = tsid || '';
        if (tsid) {
            CharactersToEscapeForExactSearchInstance.forEach(function (c) {
                escapedTsid = escapedTsid.split(c).join('+');
            });
        }
        return escapedTsid;
    };
    return Utils;
}());

export { ChartComponentData as C, DataTypes as D, ErrorCodes as E, Grid as G, HierarchiesExpand as H, InstancesSort as I, KeyCodes as K, LINECHARTTOPPADDING as L, MARKERVALUENUMERICHEIGHT as M, NONNUMERICTOPMARGIN as N, ShiftTypes as S, TooltipMeasureFormat as T, Utils as U, VALUEBARHEIGHT as V, YAxisStates as Y, __assign as _, __extends as a, Component as b, EventElementTypes as c, LINECHARTXOFFSET as d, SERIESLABELWIDTH as e, LINECHARTCHARTMARGINS as f, ChartOptions as g, __awaiter as h, HierarchiesSort as i, __generator as j, __spreadArrays as k, GRIDCONTAINERCLASS as l, InterpolationFunctions as m, swimlaneLabelConstants as s, valueTypes as v };
