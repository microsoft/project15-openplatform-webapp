import { ChartComponent } from "./ChartComponent-a7f89f69";
declare class EventsTable extends ChartComponent {
    private eventsTable;
    private eventsLegend;
    private headers;
    private maxVisibleIndex;
    private isAscending;
    private timestampColumnName;
    private sortColumn;
    private allSelectedState;
    private eventsTableData;
    private margins;
    constructor(renderTarget: Element);
    EventsTable(): void;
    renderFromEventsTsx(eventsFromTsx: any, chartOptions: any): void;
    render(events: any, chartOptions: any, fromTsx?: boolean): void;
    renderLegend(): void;
    setLegendColumnStates(): void;
    getSelectAllState(): string;
    setSelectAllState(): void;
    private getFilteredColumnKeys;
    //creates columnHeaders, returns a dictionary of widths so that buildTable can know the min width of each column
    private buildHeaders;
    private adjustHeaderWidth;
    private buildTable;
    private formatValue;
}
export { EventsTable as default };
