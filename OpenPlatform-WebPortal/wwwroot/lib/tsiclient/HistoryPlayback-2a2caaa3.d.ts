/// <reference types="d3-selection" />
import * as d3 from 'd3';
import { Component } from "./Component-9318289b";
import PlaybackControls from "./PlaybackControls";
import ServerClient from "./ServerClient";
import TsqExpression from "./TsqExpression";
declare class TsqRange {
    from: Date;
    to: Date;
    private bucketSizeMs;
    // List of interval values that would divide a time range neatly
    static NeatIntervals: string[];
    static NeatIntervalsMs: number[];
    constructor(from: Date, to: Date);
    setNeatBucketSizeByNumerOfBuckets(targetNumberOfBuckets: number): void;
    setNeatBucketSizeByRoughBucketSize(roughBucketSizeMillis: number): void;
    alignWithServerEpoch(): void;
    get fromMillis(): number;
    get toMillis(): number;
    get bucketSizeMillis(): number;
    get bucketSizeStr(): string;
    static millisToLargestUnit(interval: number): {
        value: number;
        unit: string;
    };
}
type d3Selection = d3.Selection<d3.BaseType, unknown, null, undefined>;
interface GraphicInfo {
    graphic: any;
    width: number;
    height: number;
}
declare abstract class HistoryPlayback extends Component {
    protected targetElement: d3Selection;
    protected tsqExpressions: Array<TsqExpression>;
    protected componentContainer: d3Selection;
    protected component: d3Selection;
    protected playbackControlsContainer: d3Selection;
    protected playbackControls: PlaybackControls;
    protected graphicOriginalWidth: number;
    protected graphicOriginalHeight: number;
    protected serverClient: ServerClient;
    protected currentCancelTrigger: Function;
    protected availabilityInterval: number;
    protected environmentFqdn: string;
    protected availability: TsqRange;
    protected getAuthToken: () => Promise<string>;
    protected playbackRate: number;
    protected graphic: any;
    readonly numberOfBuckets = 1000;
    readonly defaultPlaybackRate = 3000;
    readonly fetchAvailabilityFrequency = 30000;
    readonly playbackSliderHeight = 88;
    readonly previewApiFlag = "?api-version=2018-11-01-preview";
    constructor(renderTarget: Element);
    protected abstract loadResources(): Promise<any>;
    protected abstract draw(): any;
    protected abstract updateDataMarkers(data: Array<any>): void;
    protected abstract getDataPoints(data: Array<any>): void;
    protected onGraphicLoaded(): void;
    protected renderBase(environmentFqdn: string, getToken: () => Promise<string>, data: Array<TsqExpression>, chartOptions: any): void;
    pauseAvailabilityUpdates(): void;
    private pollAvailability;
    private onSelecTimestamp;
    private calcQueryWindow;
    protected drawBase(): void;
    private updateAvailability;
    private parseAvailabilityResponse;
}
export { TsqRange, GraphicInfo, HistoryPlayback };
