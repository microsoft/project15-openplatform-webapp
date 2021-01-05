import { Component } from "./Component-9318289b";
declare class HierarchyNode {
    name: string;
    markedName: string;
    children: Array<HierarchyNode>;
    parent: HierarchyNode;
    isExpanded: boolean;
    isSelected: boolean;
    isLeaf: boolean;
    childrenInFilter: boolean;
    selfInFilter: boolean;
    color: (n: HierarchyNode) => string;
    click: (n: any) => void;
    isLeafParent: boolean; // used in the event of context menut to denote that we should use a context menu for children
    level: number;
    constructor(name: string, level: number);
    filter(filterText: any): void;
    traverse(condition: (n: HierarchyNode) => boolean): any[];
    colorify(el: any): void;
}
declare class Hierarchy extends Component {
    private filterText;
    private root;
    private withContextMenu;
    private contextMenu;
    private clickedNode;
    private hierarchyList;
    constructor(renderTarget: Element);
    render(data: any, options: any): void;
    expandCollapseList: (node: HierarchyNode, el: any, isFromClick?: boolean) => void;
    buildTree(data: any): HierarchyNode;
    private closeContextMenu;
}
export { Hierarchy as default };
