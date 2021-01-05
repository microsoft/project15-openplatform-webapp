import { ChartDataOptions } from "./ChartDataOptions-59f6b399";
declare class AggregateExpression extends ChartDataOptions {
    measureObject: any;
    splitByObject: any;
    predicate: Object;
    visibleSplitByCap: number;
    constructor(predicateObject: any, measureObject: any, measureTypes: Array<string>, searchSpan: any, splitByObject: any, colorOrOptionsObject: any, alias?: string, contextMenu?: Array<any>);
    toTsx(roundFromTo?: boolean): {};
}
export { AggregateExpression as default };
