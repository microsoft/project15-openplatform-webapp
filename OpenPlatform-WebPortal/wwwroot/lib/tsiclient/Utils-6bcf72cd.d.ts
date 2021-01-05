/// <reference types="d3-selection" />
import * as d3 from 'd3';
import { ChartOptions } from "./ChartOptions-229e14b0";
import { ChartComponentData } from "./ChartComponentData-72034d1d";
declare const NONNUMERICTOPMARGIN = 8;
declare const LINECHARTTOPPADDING = 16;
declare const GRIDCONTAINERCLASS = "tsi-gridContainer";
declare const LINECHARTCHARTMARGINS: {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
declare const LINECHARTXOFFSET = 8;
declare const MARKERVALUENUMERICHEIGHT = 20;
declare const VALUEBARHEIGHT = 3;
declare const SERIESLABELWIDTH = 92;
declare enum YAxisStates {
    Stacked = "stacked",
    Shared = "shared",
    Overlap = "overlap"
}
declare enum DataTypes {
    Numeric = "numeric",
    Categorical = "categorical",
    Events = "events"
}
declare enum EventElementTypes {
    Diamond = "diamond",
    Teardrop = "teardrop"
}
declare enum TooltipMeasureFormat {
    Enveloped = "Enveloped",
    SingleValue = "SingleValue",
    Scatter = "Scatter"
}
declare enum valueTypes {
    String = "String",
    Double = "Double",
    Long = "Long",
    Dynamic = "Dynamic",
    Boolean = "Boolean",
    DateTime = "DateTime"
}
declare class Utils {
    static guidForNullTSID: string;
    static formatYAxisNumber(val: number): string;
    static getStackStates(): typeof YAxisStates;
    // format [0-9]+[ms|s|m|h|d], convert to millis
    static parseTimeInput(inputString: string): number;
    static findClosestTime(prevMillis: number, timeMap: any): number;
    static getValueOfVisible(d: any, visibleMeasure: string): any;
    static isStartAt(startAtString?: string, searchSpan?: any): boolean;
    static parseShift(shiftString: string, startAtString?: any, searchSpan?: any): number;
    static adjustStartMillisToAbsoluteZero(fromMillis: any, bucketSize: any): number;
    static bucketSizeToTsqInterval(bucketSize: string): string;
    static createEntityKey(aggName: string, aggIndex: number): string;
    static getColorForValue(chartDataOptions: any, value: any): any;
    static rollUpContiguous(data: any): any;
    static formatOffsetMinutes(offset: any): string;
    static getOffsetMinutes(offset: any, millis: number): any;
    static offsetUTC(date: Date): Date;
    // inverse of getOffsetMinutes, this is the conversion factor of an offsettedTime to UTC in minutes
    static getMinutesToUTC(offset: any, millisInOffset: number): number;
    static addOffsetGuess(timezoneName: any): string;
    static timezoneAbbreviation(timezoneName: any): string;
    static createTimezoneAbbreviation(offset: any): string;
    static parseTimezoneName(timezoneRaw: any): any;
    static convertTimezoneToLabel(timezone: any, locdLocal?: string): string;
    static rangeTimeFormat(rangeMillis: number): string;
    static subDateTimeFormat(is24HourTime: any, usesSeconds: any, usesMillis: any): string;
    static timeFormat(usesSeconds?: boolean, usesMillis?: boolean, offset?: any, is24HourTime?: boolean, shiftMillis?: number, timeFormat?: string, locale?: string): (d: any) => string;
    static splitTimeLabel(text: any): void;
    static getUTCHours(d: Date, is24HourTime?: boolean): number;
    static UTCTwelveHourFormat(d: Date): string;
    static getAgVisible(displayState: any, aggI: string, splitBy: string): any;
    static getAgVisibleMeasure(displayState: any, aggI: string, splitBy: string): any;
    static createSeriesTypeIcon(seriesType: string, selection: any): void;
    static strip(text: any): string;
    static stripForConcat(text: any): any;
    static setSeriesLabelSubtitleText(subtitle: any, isInFocus?: boolean): void;
    static revertAllSubtitleText(markerValues: any, opacity?: number): void;
    static generateColors(numColors: number, includeColors?: string[]): any[];
    static convertFromLocal(date: Date): Date;
    static adjustDateFromTimezoneOffset(date: Date): Date;
    static offsetFromUTC(date: Date, offset?: number): Date;
    static offsetToUTC(date: Date, offset?: number): Date;
    static parseUserInputDateTime(timeText: any, offset: any): number;
    static getBrighterColor(color: string): any;
    static createSplitByColors(displayState: any, aggKey: string, ignoreIsOnlyAgg?: boolean): any[];
    static colorSplitBy(displayState: any, splitByIndex: number, aggKey: string, ignoreIsOnlyAgg?: boolean): any;
    static getTheme(theme: any): string;
    static clearSelection(): void;
    static mark(filter: any, text: any): any;
    static hash(str: any): number;
    static guid(): string;
    static createValueFilter(aggregateKey: any, splitBy: any): (d: any, j: number) => boolean;
    static downloadCSV(csvString: string, csvName?: string): void;
    static sanitizeString(str: any, type: String): any;
    static hideGrid(renderTarget: any): void;
    static showGrid(renderTarget: any, chartOptions: ChartOptions, aggregateExpressionOptions: any, chartComponentData: ChartComponentData): void;
    static createGridEllipsisOption(renderTarget: any, chartOptions: ChartOptions, aggregateExpressionOptions: any, chartComponentData: ChartComponentData, labelText?: string): {
        iconClass: string;
        label: string;
        action: () => void;
        description: string;
    };
    static focusOnEllipsisButton(renderTarget: any): void;
    static createDownloadEllipsisOption(csvStringGenerator: any, action?: () => void, downloadLabel?: string): {
        iconClass: string;
        label: string;
        action: () => void;
        description: string;
    };
    static createControlPanel(renderTarget: any, legendWidth: number, topChartMargin: number, chartOptions: any): d3.Selection<d3.BaseType, unknown, null, undefined>;
    static escapeQuotesCommasAndNewlines(stringToEscape: string): string;
    static getNonNumericHeight(rawHeight: number): number;
    static getControlPanelWidth(renderTarget: any, legendWidth: any, isLegendShown: any): number;
    static getValueOrDefault(chartOptionsObj: any, propertyName: any, defaultValue?: any): any;
    static safeNotNullOrUndefined(valueLambda: any): boolean;
    static equalToEventTarget: () => boolean;
    static getAggKeys(data: any): any;
    static roundToMillis(rawTo: any, bucketSize: any): number;
    static mergeSeriesForScatterPlot(chartData: any, scatterMeasures: any): {
        [x: string]: {
            "": {};
        };
    };
    static getScatterPlotMeasureNames(chartData: any, scatterMeasures: any): {
        X_MEASURE: string;
        Y_MEASURE: string;
        R_MEASURE: string;
    };
    static isKeyDownAndNotEnter: (e: any) => boolean;
    static getMinWarmTime(warmStoreFrom: any, retentionString: any): Date;
    static standardizeTSStrings(rawData: any): any[];
    // takes in an availability distribution and a min and max date, returns a tuple, where the first is the new distribution
    // excluding values out of the range, and the second is all excluded values
    static cullValuesOutOfRange(availabilityDistribution: any, minDateString: string, maxDateString: string): any[];
    static mergeAvailabilities(warmAvailability: any, coldAvailability: any, retentionString?: any): any;
    static languageGuess(): string;
    static getInstanceKey: (instance: any) => any;
    static stripNullGuid: (str: any) => any;
    static getTimeSeriesIdString: (instance: any) => any;
    static getTimeSeriesIdToDisplay: (instance: any, emptyDisplayString: any) => any;
    static getHighlightedTimeSeriesIdToDisplay: (instance: any) => any;
    static instanceHasEmptyTSID: (instance: any) => boolean;
    static appendFormattedElementsFromString: (targetElem: any, str: any, options?: {
        additionalClassName?: string;
        inSvg?: boolean;
        splitByTag?: string;
    }) => void;
    static escapedTsidForExactSearch: (tsid: string) => string;
    static memorySizeOf(obj: any): number;
}
export { Utils as default, NONNUMERICTOPMARGIN, LINECHARTTOPPADDING, GRIDCONTAINERCLASS, LINECHARTCHARTMARGINS, LINECHARTXOFFSET, MARKERVALUENUMERICHEIGHT, VALUEBARHEIGHT, SERIESLABELWIDTH, YAxisStates, DataTypes, EventElementTypes, TooltipMeasureFormat, valueTypes };
