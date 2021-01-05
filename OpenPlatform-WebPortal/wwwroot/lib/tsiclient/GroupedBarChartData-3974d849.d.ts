import { ChartComponentData } from "./ChartComponentData-72034d1d";
declare class GroupedBarChartData extends ChartComponentData {
    timestamp: any;
    valuesAtTimestamp: any;
    valuesOfVisibleType: Array<any>;
    aggsSeries: any;
    globalMax: number;
    globalMin: number;
    stackedAggregateObject: any;
    constructor();
    mergeDataToDisplayStateAndTimeArrays(data: any, timestamp: any, aggregateExpressionOptions?: any): void;
    private stackMin;
    private stackMax;
    //setting the data related to the entire time range (aggsSeries, allValus, globalMax, globalMin)
    setEntireRangeData(scaledToCurrentTime: any): void;
    setValuesAtTimestamp(): void;
    getValueContainerData(aggKey: any): Array<any>;
}
export { GroupedBarChartData };
