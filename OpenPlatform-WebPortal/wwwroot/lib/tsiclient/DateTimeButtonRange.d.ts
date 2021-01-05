import { DateTimeButton } from "./DateTimeButton-6f554ffd";
declare class DateTimeButtonRange extends DateTimeButton {
    private onCancel;
    private fromMillis;
    private toMillis;
    constructor(renderTarget: Element);
    private setButtonText;
    private onClose;
    render(chartOptions: any, minMillis: number, maxMillis: number, fromMillis?: number, toMillis?: number, onSet?: any, onCancel?: any): void;
}
export { DateTimeButtonRange as default };
