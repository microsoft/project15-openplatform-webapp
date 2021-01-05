import { ChartVisualizationComponent } from "./ChartVisualizationComponent-80709f0f";
declare class TemporalXAxisComponent extends ChartVisualizationComponent {
    protected xAxis: any;
    protected x: any;
    protected chartHeight: any;
    private smartTickFormat;
    private xAxisEntered;
    constructor(renderTarget: Element);
    private createOffsetXAxis;
    private createXAxis;
    private getXTickNumber;
    private labelFormatUsesSeconds;
    private labelFormatUsesMillis;
    updateXAxis(forceFirst?: boolean, forceLast?: boolean): void;
    private updateAxisText;
    protected drawXAxis(yOffset: any, snapFirst?: boolean, snapLast?: boolean): void;
    private isSameDate;
    private isTickSpanGreaterThan;
    private createSmartTickFormat;
}
export { TemporalXAxisComponent };
