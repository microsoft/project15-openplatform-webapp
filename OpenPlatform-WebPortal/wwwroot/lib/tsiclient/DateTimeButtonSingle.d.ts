import { DateTimeButton } from "./DateTimeButton-6f554ffd";
declare class DateTimeButtonSingle extends DateTimeButton {
    private selectedMillis;
    constructor(renderTarget: Element);
    private closeSDTP;
    private sDTPOnSet;
    render(chartOptions: any, minMillis: number, maxMillis: number, selectedMillis?: number, onSet?: any): void;
}
export { DateTimeButtonSingle as default };
