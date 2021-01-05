import { HistoryPlayback } from "./HistoryPlayback-2a2caaa3";
import TsqExpression from "./TsqExpression";
declare class GeoProcessGraphic extends HistoryPlayback {
    private dataSource;
    private azureMapsSubscriptionKey;
    private zoom;
    private width;
    private height;
    private theme;
    private center;
    private bearing;
    private pitch;
    private maxZoom;
    private minZoom;
    private duration;
    private map;
    constructor(renderTarget: Element);
    render(environmentFqdn: string, getToken: () => Promise<string>, data: Array<TsqExpression>, chartOptions: any): void;
    protected loadResources(): Promise<any>;
    protected draw(): void;
    protected getDataPoints(results: Array<IGeoProcessGraphicLabelInfo>): void;
    protected parseTsqResponse(response: any): {};
    protected updateDataMarkers(dataPoints: Array<any>): void;
    protected createTable(dataPointArr: any, idx: any): HTMLDivElement;
}
interface IGeoProcessGraphicLabelInfo {
}
export { GeoProcessGraphic as default };
