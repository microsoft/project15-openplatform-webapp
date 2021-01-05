import { Component } from "./Component-9318289b";
declare class EllipsisMenu extends Component {
    private containerElement;
    private buttonElement;
    private menuElement;
    private menuItems;
    private menuIsVisible;
    constructor(renderTarget: Element);
    private createIconPath;
    setMenuVisibility(isVisible: any): void;
    private focusOnMenuItem;
    private menuItemKeyHandler;
    render(menuItems: any, options?: any): void;
    private setMenuItems;
}
export { EllipsisMenu as default };
