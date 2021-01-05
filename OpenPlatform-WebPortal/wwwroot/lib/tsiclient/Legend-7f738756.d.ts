import { Component } from "./Component-9318289b";
declare class Legend extends Component {
    drawChart: any;
    legendElement: any;
    legendWidth: number;
    private legendState;
    private stickySeriesAction;
    private labelMouseover;
    private labelMouseout;
    private svgSelection;
    private chartComponentData;
    constructor(drawChart: any, renderTarget: Element, legendWidth: number);
    private labelMouseoutWrapper;
    private toggleSplitByVisible;
    triggerSplitByFocus(aggKey: string, splitBy: string): void;
    private getHeightPerSplitBy;
    private createGradient;
    private isNonNumeric;
    private createNonNumericColorKey;
    private createCategoricalColorKey;
    private createEventsColorKey;
    private renderSplitBys;
    private toggleSticky;
    draw(legendState: string, chartComponentData: any, labelMouseover: any, svgSelection: any, options: any, labelMouseoutAction?: any, stickySeriesAction?: any): void;
}
export { Legend };
