import { TemporalXAxisComponent } from "./TemporalXAxisComponent-f960f34b";
declare class Heatmap extends TemporalXAxisComponent {
    private lineHeight;
    private splitByLabelWidth;
    private heatmapWrapper;
    private splitByLabels;
    private heatmapCanvasMap;
    private timeLabels;
    private height;
    private timeLabelsHeight;
    private visibleAggs;
    constructor(renderTarget: Element);
    private focusOnEllipsis;
    private createControlsPanel;
    private chartControlsExist;
    private addTimeLabels;
    mouseover: (hoveredAggKey: any, hoveredSplitBy: any) => void;
    mouseout: (selection: any, hoveredAggKey: any) => void;
    render(data: any, chartOptions: any, aggregateExpressionOptions: any): void;
    renderTimeLabels: (focusStartTime: any, focusEndTime: any, focusX1: any, focusX2: any, focusY: any, yOffset: any, shiftMillis: any) => void;
}
export { Heatmap as default };
