import { GroupedBarChartData } from "./GroupedBarChartData-3974d849";
import { ChartVisualizationComponent } from "./ChartVisualizationComponent-80709f0f";
declare class GroupedBarChart extends ChartVisualizationComponent {
    private contextMenu;
    private setStateFromData;
    private timestamp;
    private isStacked;
    private stackedButton;
    chartComponentData: GroupedBarChartData;
    constructor(renderTarget: Element);
    GroupedBarChart(): void;
    render(data: any, options: any, aggregateExpressionOptions: any): void;
}
export { GroupedBarChart as default };
