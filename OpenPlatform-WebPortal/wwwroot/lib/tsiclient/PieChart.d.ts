import { GroupedBarChartData } from "./GroupedBarChartData-3974d849";
import { ChartVisualizationComponent } from "./ChartVisualizationComponent-80709f0f";
declare class PieChartData extends GroupedBarChartData {
    timestamp: any;
    flatValueArray: any;
    visibleValuesSum: number;
    constructor();
    mergeDataToDisplayStateAndTimeArrays(data: any, timestamp: any, aggregateExpressionOptions?: any): void;
    updateFlatValueArray(timestamp: any): void;
}
declare class PieChart extends ChartVisualizationComponent {
    private contextMenu;
    chartComponentData: PieChartData;
    constructor(renderTarget: Element);
    PieChart(): void;
    render(data: any, options: any, aggregateExpressionOptions: any): void;
}
export { PieChart as default };
