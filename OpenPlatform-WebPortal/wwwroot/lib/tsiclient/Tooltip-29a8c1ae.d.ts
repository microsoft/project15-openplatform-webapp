import { Component } from "./Component-9318289b";
declare class Tooltip extends Component {
    renderTarget: any;
    private tooltipDiv;
    private tooltipDivInner;
    private tooltipText;
    draw: any;
    private borderColor;
    constructor(renderTarget: any);
    hide(): void;
    private getSVGWidth;
    private getSVGHeight;
    private getLeftOffset;
    private getTopOffset;
    private isRightOffset;
    private isTopOffset;
    render(theme: any): void;
}
export { Tooltip };
