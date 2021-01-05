declare class ChartComponentData {
    data: any;
    displayState: any;
    timeArrays: any;
    visibleTSCount: number;
    visibleTAs: any;
    allValues: any;
    allNumericValues: any;
    filteredAggregates: any;
    usesSeconds: boolean;
    usesMillis: boolean;
    fromMillis: number;
    toMillis: number;
    stickiedKey: any;
    allTimestampsArray: any;
    isFromHeatmap: boolean;
    constructor();
    protected getSwimlane: (aggKey: any) => any;
    protected setAllTimestampsArray(): void;
    getDataType(aggKey: any): any;
    //add colors if none present
    private fillColors;
    private getVisibleType;
    mergeDataToDisplayStateAndTimeArrays(data: any, aggregateExpressionOptions?: any): void;
    private determineMeasureTypes;
    getTemporalShiftStringTuple(aggKey: any): any[];
    getTemporalShiftMillis(aggKey: any): number;
    doesTimeArrayUseSeconds(timeArray: any): any;
    doesTimeArrayUseMillis(timeArray: any): any;
    //returns the from and to of all values
    setAllValuesAndVisibleTAs(): Date[];
    findLastTimestampWithValue(aggKey: any, splitBy: any): any;
    private findFirstBucket;
    private getNumberOfPaddedBuckets;
    //aggregates object => array of objects containing timestamp and values. Pad with
    convertAggregateToArray(agg: any, aggKey: string, aggName: string, splitBy: string, from: Date, to: Date, bucketSize: number, shiftValue: number): Array<any>;
    isSplitByVisible(aggI: string, splitBy: string): any;
    isPossibleEnvelope(aggKey: string, splitBy: string): boolean;
    getVisibleMeasure(aggI: string, splitBy: string): any;
    getAggVisible(aggKey: any): boolean;
    getSplitByVisible(aggKey: any, splitBy: any): any;
    aggHasVisibleSplitBys(aggKey: any): boolean;
    valueAtTS(aggKey: any, splitByName: any, ts: any): any;
    setFilteredAggregates(): void;
    private guessValueType;
    generateCSVString(offset?: number, dateLocale?: string, spMeasures?: any): string;
    getVisibilityState(): any[];
}
export { ChartComponentData };
