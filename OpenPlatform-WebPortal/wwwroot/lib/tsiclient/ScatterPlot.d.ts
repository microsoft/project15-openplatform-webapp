import { ChartVisualizationComponent } from "./ChartVisualizationComponent-80709f0f";
import { GroupedBarChartData } from "./GroupedBarChartData-3974d849";
import { TooltipMeasureFormat } from "./Utils-6bcf72cd";
declare class ScatterPlotData extends GroupedBarChartData {
    temporalDataArray: any;
    extents: any;
    private extentsSet;
    constructor();
    /******** SETS EXTENT OF EACH DATA MEASURE -- MEASURES UPDATED WHEN RENDER CALLED OUTSIDE OF TEMPORAL ********/
    setExtents(measures: any, forceReset?: boolean): void;
    /******** UPDATE EXTENTS BASED ON VISIBLE DATA ********/
    updateExtents(measures: any): void;
    /******** UPDATES CHART DATA, ALL TIMESTAMPS, AND VALUES AT THE CURRENT TIMESTAMP ********/
    mergeDataToDisplayStateAndTimeArrays(data: any, timestamp: any, aggregateExpressionOptions?: any): void;
    /******** UPDATES DATA TO BE DRAWN -- IF SCATTER IS TEMPORAL, FLATTENS ALL TIMESTAMP DATA ********/
    updateTemporalDataArray(isTemporal: boolean): void;
    /******** HELPER TO FETCH DATA AT THE CURRENT TIMESTAMP AND BUILD AN OBJECT FOR THAT TIMESTAMP ********/
    private updateTemporal;
    /******** OVERRIDES GROUPEDBARCHARTDATA -- UPDATES VALUES AT TIMESTAMP WITH MEASURES & TIMESTAMP********/
    setValuesAtTimestamp(): void;
}
declare class ScatterPlot extends ChartVisualizationComponent {
    private activeDot;
    private chartHeight;
    private controlsOffset;
    private focus;
    private focusedAggKey;
    private focusedSplitBy;
    private focusedSite;
    private g;
    private height;
    private measures;
    private pointWrapper;
    private lineWrapper;
    private rMeasure;
    private rScale;
    private slider;
    private sliderWrapper;
    private targetElement;
    private tooltip;
    private voronoi;
    private voronoiDiagram;
    private voronoiGroup;
    private xAxis;
    private xMeasure;
    private xScale;
    private yAxis;
    private yMeasure;
    private yScale;
    private xAxisLabel;
    private yAxisLabel;
    readonly lowOpacity = 0.15;
    readonly standardOpacity = 0.6;
    private focusOpacity;
    readonly standardStroke = 1;
    readonly lowStroke = 0.3;
    chartComponentData: ScatterPlotData;
    constructor(renderTarget: Element);
    ScatterPlot(): void;
    render(data: any, options: any, aggregateExpressionOptions: any, fromSlider?: boolean): void;
    private getSliderWidth;
    protected tooltipFormat(d: any, text: any, measureFormat: TooltipMeasureFormat, xyrMeasures: any): void;
    /******** DRAW UPDATE FUNCTION ********/
    draw: (isFromResize?: boolean) => void;
    /******** DRAW CONNECTING LINES BETWEEN POINTS ********/
    /******** DRAW CONNECTING LINES BETWEEN POINTS ********/
    private drawConnectingLines;
    /******** CHECK VALIDITY OF EXTENTS ********/
    /******** CHECK VALIDITY OF EXTENTS ********/
    private checkExtentValidity;
    /******** CREATE VORONOI DIAGRAM FOR MOUSE EVENTS ********/
    /******** CREATE VORONOI DIAGRAM FOR MOUSE EVENTS ********/
    private drawVoronoi;
    /******** STICKY/UNSTICKY DATA GROUPS ON VORONOI DIAGRAM CLICK ********/
    /******** STICKY/UNSTICKY DATA GROUPS ON VORONOI DIAGRAM CLICK ********/
    private voronoiClick;
    /******** UPDATE STICKY SPLITBY  ********/
    stickySeries: (aggregateKey: string, splitBy?: string) => void;
    /******** HIGHLIGHT DOT TARGETED BY CROSSHAIRS WITH BLACK / WHITE STROKE BORDER ********/
    /******** HIGHLIGHT DOT TARGETED BY CROSSHAIRS WITH BLACK / WHITE STROKE BORDER ********/
    private highlightDot;
    /******** GET UNIQUE STRING HASH ID FOR EACH DOT USING DATA ATTRIBUTES ********/
    /******** GET UNIQUE STRING HASH ID FOR EACH DOT USING DATA ATTRIBUTES ********/
    private getClassHash;
    /******** UNHIGHLIGHT ACTIVE DOT ********/
    /******** UNHIGHLIGHT ACTIVE DOT ********/
    private unhighlightDot;
    /******** EFFICIENTLY SWAP NEW FOCUSED GROUP WITH OLD FOCUSED GROUP ********/
    /******** EFFICIENTLY SWAP NEW FOCUSED GROUP WITH OLD FOCUSED GROUP ********/
    private labelMouseMove;
    /******** DRAW CROSSHAIRS, TOOLTIP, AND LEGEND FOCUS ********/
    /******** DRAW CROSSHAIRS, TOOLTIP, AND LEGEND FOCUS ********/
    private voronoiMouseMove;
    /******** HIDE TOOLTIP AND CROSSHAIRS ********/
    /******** HIDE TOOLTIP AND CROSSHAIRS ********/
    private voronoiMouseOut;
    /******** FILTER DATA BY VISIBLE AND STICKIED ********/
    /******** FILTER DATA BY VISIBLE AND STICKIED ********/
    private getVoronoiData;
    /******** HIGHLIGHT FOCUSED GROUP ********/
    /******** HIGHLIGHT FOCUSED GROUP ********/
    private labelMouseOver;
    /******** UNHIGHLIGHT FOCUSED GROUP ********/
    /******** UNHIGHLIGHT FOCUSED GROUP ********/
    private labelMouseOut;
    /******** FILTER DATA, ONLY KEEPING POINTS WITH ALL REQUIRED MEASURES ********/
    /******** FILTER DATA, ONLY KEEPING POINTS WITH ALL REQUIRED MEASURES ********/
    private cleanData;
    /******** UPDATE CHART DIMENSIONS ********/
    /******** UPDATE CHART DIMENSIONS ********/
    private setWidthAndHeight;
    /******** SCALE AND DRAW AXIS ********/
    /******** SCALE AND DRAW AXIS ********/
    private drawAxis;
    /******** DRAW X AND Y AXIS LABELS ********/
    /******** DRAW X AND Y AXIS LABELS ********/
    private drawAxisLabels;
    /******** DRAW TOOLTIP IF ENABLED ********/
    /******** DRAW TOOLTIP IF ENABLED ********/
    private drawTooltip;
    /******** HELPERS TO FORMAT TIME DISPLAY ********/
    /******** HELPERS TO FORMAT TIME DISPLAY ********/
    private labelFormatUsesSeconds;
    private labelFormatUsesMillis;
}
export { ScatterPlot as default };
