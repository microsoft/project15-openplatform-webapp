import { HistoryPlayback, GraphicInfo } from "./HistoryPlayback-2a2caaa3";
import TsqExpression from "./TsqExpression";
declare class ProcessGraphic extends HistoryPlayback {
    private graphicSrc;
    constructor(renderTarget: Element);
    render(environmentFqdn: string, getToken: () => Promise<string>, graphicSrc: string, data: Array<TsqExpression>, chartOptions: any): void;
    protected loadResources(): Promise<GraphicInfo>;
    protected draw(): void;
    private getResizedImageDimensions;
    protected getDataPoints(results: Array<IProcessGraphicLabelInfo>): void;
    protected updateDataMarkers(graphicValues: Array<IProcessGraphicLabelInfo>): void;
    protected parseTsqResponse(response: any): any;
    protected sanitizeAttribute(str: any): string;
}
interface IProcessGraphicLabelInfo {
    value: number;
    alias: string;
    x: number;
    y: number;
    color: string;
    onClick: Function;
}
export { ProcessGraphic as default };
