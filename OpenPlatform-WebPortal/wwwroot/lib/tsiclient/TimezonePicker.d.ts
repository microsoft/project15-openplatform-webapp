import { ChartComponent } from "./ChartComponent-a7f89f69";
declare class TimezonePicker extends ChartComponent {
    private targetElement;
    private timeZones;
    constructor(renderTarget: Element);
    private sortTimezones;
    render(onTimezoneSelect: any, defaultTimeZone?: string): void;
}
export { TimezonePicker as default };
