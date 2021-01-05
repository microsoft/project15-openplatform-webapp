import { Component } from "./Component-9318289b";
declare class HierarchyNavigation extends Component {
    private server;
    private getToken;
    private environmentFqdn;
    private clickedInstance;
    private isHierarchySelectionActive;
    private hierarchySelectorElem;
    private filterPathElem;
    private searchWrapperElem;
    private hierarchyListWrapperElem;
    private hierarchyListElem;
    private noResultsElem;
    private hierarchyElem;
    private instanceListElem;
    private instanceListWrapperElem;
    private lastInstanceContinuationToken;
    private usedInstanceSearchContinuationTokens;
    private envHierarchies;
    private envTypes;
    private selectedHierarchyName;
    private viewType;
    private viewTypesElem;
    private searchGloballyElem;
    private instanceLookupLoadingElem;
    private mode;
    private searchString;
    private path;
    private contextMenu;
    private contextMenuProps;
    constructor(renderTarget: Element);
    HierarchyNavigation(): void;
    render(environmentFqdn: string, getToken: any, hierarchyNavOptions?: any): Promise<void>;
    private setModeAndRequestParamsForSearch;
    private setModeAndRequestParamsForNavigate;
    private setModeAndRequestParamsForFilter;
    private renderHierarchySelection;
    private switchToSearchView;
    // prepares the parameters for search request
    private requestPayload;
    // clears both hierarchy tree and flat list for new results
    private clearAndGetResults;
    private doExactSearchWithPossiblePaths;
    private prepareComponentForLookup;
    private getInstance;
    private simulateExpand;
    private prepareComponentForAfterLookup;
    showInstance(timeSeriesID: Array<string>, hierarchyIds?: Array<string>): Promise<void>;
    // renders tree for both 'Navigate' and 'Filter' mode (with Hierarchy View option selected), locInTarget refers to the 'show more' element -either hierarchy or instance- within the target
    private renderTree;
    private renderInstances;
    private pathSearchAndRenderResult;
    private pathSearch;
    private renderSearchResult;
    // creates in-depth data object using the server response for hierarchyNodes to show in the tree all expanded, considering UntilChildren
    private fillDataRecursively;
    closeContextMenu: () => void;
    private prepareForContextMenu;
    drawContextMenu: (contextMenuItems: Array<ContextMenuItems>, contextMenuOptions: ContextMenuOptions) => void;
    //returns the dom element of one hierarchy level item for tree rendering
    private createHierarchyItemElem;
    //returns the dom elem of one instance item for flat list rendering
    private createInstanceElem;
    private hasHits;
    private hierarchyNodeIdentifier;
    private instanceNodeIdentifier;
    private instanceNodeStringToDisplay;
    private instanceNodeString;
    private clearAndHideFilterPath;
    private selectHierarchy;
    private resettingVariablesForEnvChange;
}
interface ContextMenuItems {
    name: string;
    kind: string;
    action: any;
}
interface ContextMenuOptions {
    isSelectionEnabled: boolean;
    isFilterEnabled: boolean;
    onClose: any;
}
declare enum HierarchySelectionValues {
    All = "0",
    Unparented = "-1"
}
declare enum ViewType {
    Hierarchy = 0,
    List = 1
}
declare enum State {
    Navigate = 0,
    Search = 1,
    Filter = 2
}
export { HierarchyNavigation as default, HierarchySelectionValues, ViewType, State };
