import { ChartComponent } from "./ChartComponent-a7f89f69";
declare class DateTimeButton extends ChartComponent {
    protected dateTimePicker: any;
    private pickerIsVisible;
    protected minMillis: number;
    protected maxMillis: number;
    protected onSet: any;
    protected dateTimeButton: any;
    protected dateTimePickerContainer: any;
    constructor(renderTarget: Element);
    protected buttonDateTimeFormat(millis: any): string;
    render(chartOptions: any, minMillis: any, maxMillis: any, onSet?: any): void;
}
export { DateTimeButton };
