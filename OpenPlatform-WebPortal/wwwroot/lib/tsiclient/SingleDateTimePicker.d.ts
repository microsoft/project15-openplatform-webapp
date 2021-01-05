import { ChartComponent } from "./ChartComponent-a7f89f69";
declare class SingleDateTimePicker extends ChartComponent {
    private calendar;
    private calendarPicker;
    private timeControls;
    private minMillis;
    private maxMillis;
    private millis;
    private minutes;
    private hours;
    private onSet;
    private targetElement;
    private isValid;
    private offsetName;
    private date;
    private timeInput;
    private saveButton;
    constructor(renderTarget: Element);
    getMillis(): number;
    render(chartOptions: any, minMillis: number, maxMillis: number, millis?: number, onSet?: any): void;
    //zero out everything but year, month and day
    private roundDay;
    private setSelectedDate;
    private createCalendar;
    private setDate;
    private setIsValid;
    private setMillis;
    private displayErrors;
    private checkDateTimeValidity;
    private dateTimeIsValid;
    private getTimeFormat;
    private parseUserInputDateTime;
    private convertToCalendarDate;
    private updateDisplayedDateTime;
    private createTimeString;
    // convert to representation such that: convertedDate.toString() === originalDate.toISOString()
    private convertToLocal;
    private createTimePicker;
}
export { SingleDateTimePicker as default };
