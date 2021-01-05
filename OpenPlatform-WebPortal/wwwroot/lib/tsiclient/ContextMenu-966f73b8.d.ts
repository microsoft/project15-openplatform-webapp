import { Component } from "./Component-9318289b";
declare class ContextMenu extends Component {
    drawChart: any;
    contextMenuElement: any;
    actions: any;
    contextMenuVisible: boolean;
    startTime: any;
    endTime: any;
    private left;
    private top;
    private ae;
    private splitBy;
    private onClick;
    private subMenuFromSubLevel;
    private subMenuFromActionIndex;
    constructor(drawChart: any, renderTarget: Element);
    private launchSubMenu;
    private positionAEC;
    private shouldHorizontalFlip;
    private shouldVerticalFlip;
    //determine position relative to the chart as a whole
    private getRelativeHorizontalPosition;
    private verticalPositionAEC;
    private horizontalPositionAEC;
    private getActionElementContainerTop;
    private removeSubMenusAboveLevel;
    private createActionElements;
    draw(chartComponentData: any, renderTarget: any, options: any, mousePosition: any, aggKey: any, splitBy: any, onClick?: any, startTime?: any, endTime?: any, event?: any): void;
    hide(): void;
}
export { ContextMenu };
