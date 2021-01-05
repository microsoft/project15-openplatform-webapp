import { ChartDataOptions } from "./ChartDataOptions-59f6b399";
declare class TsqExpression extends ChartDataOptions {
    private instanceObject;
    private variableObject;
    constructor(instanceObject: any, variableObject: any, searchSpan: any, colorOrOptionsObject: any, alias?: string, contextMenu?: Array<any>);
    toTsq(roundFromTo?: boolean, getEvents?: boolean, getSeries?: boolean): {
        getEvents: {};
        getSeries?: undefined;
        aggregateSeries?: undefined;
    } | {
        getSeries: {};
        getEvents?: undefined;
        aggregateSeries?: undefined;
    } | {
        aggregateSeries: {};
        getEvents?: undefined;
        getSeries?: undefined;
    };
    // This method will create an API query payload for the variable statistics of the first inline variable
    // of this object, for numeric dataTypes. Categorical types work as expected.
    toStatsTsq(fromMillis: any, toMillis: any): {
        getEvents: {};
        getSeries?: undefined;
        aggregateSeries?: undefined;
    } | {
        getSeries: {};
        getEvents?: undefined;
        aggregateSeries?: undefined;
    } | {
        aggregateSeries: {};
        getEvents?: undefined;
        getSeries?: undefined;
    };
}
export { TsqExpression as default };
