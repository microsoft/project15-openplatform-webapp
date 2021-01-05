import { TooltipMeasureFormat } from "./Utils-6bcf72cd";
import { ChartOptions } from "./ChartOptions-229e14b0";
declare class Component {
    renderTarget: any;
    protected currentTheme: string;
    readonly TRANSDURATION: number;
    usesSeconds: boolean;
    usesMillis: boolean;
    protected chartOptions: ChartOptions;
    protected getString(str: string): any;
    constructor(renderTarget: Element);
    protected themify(targetElement: any, theme: string): void;
    protected teardropD: (width: any, height: any) => string;
    protected tooltipFormat(d: any, text: any, measureFormat: TooltipMeasureFormat, xyrMeasures?: any): void;
    protected createTooltipSeriesInfo(d: any, group: any, cDO: any): void;
}
export { Component };
