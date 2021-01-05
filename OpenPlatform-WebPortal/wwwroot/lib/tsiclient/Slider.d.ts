import { Component } from "./Component-9318289b";
declare class Slider extends Component {
    private sliderSVG;
    sliderTextDiv: any;
    private xScale;
    private data;
    private width;
    private sliderWidth;
    private selectedLabel;
    private isAscendingTimePeriods;
    private margins;
    private height;
    constructor(renderTarget: Element);
    Slider(): void;
    private getXPositionOfLabel;
    private determineIfAscendingTimePeriods;
    render(data: Array<any>, options: any, width: number, selectedLabel?: string): void;
    remove(): void;
    private onDrag;
    private onDragEnd;
    private setSelectedLabelAndGetLabelAction;
    private setSliderTextDivLabel;
    //set the position of the slider and text, and set the text, given a label
    private setStateFromLabel;
    private moveLeft;
    private moveRight;
}
export { Slider as default };
