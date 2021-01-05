import { InstancesSort, HierarchiesExpand, HierarchiesSort } from "./Enums-27423a05";
import { Component } from "./Component-9318289b";
import { ChartComponentData } from "./ChartComponentData-72034d1d";
declare const DefaultHierarchyNavigationOptions: {
    instancesPageSize: number;
    hierarchiesPageSize: number;
    isInstancesRecursive: boolean;
    isInstancesHighlighted: boolean;
    instancesSort: InstancesSort;
    hierarchiesExpand: HierarchiesExpand;
    hierarchiesSort: HierarchiesSort;
};
declare const DefaultHierarchyContextMenuOptions: {
    isSelectionEnabled: boolean;
    isFilterEnabled: boolean;
};
declare const nullTsidDisplayString = "null";
declare const swimlaneLabelConstants: {
    leftMarginOffset: number;
    swimLaneLabelHeightPadding: number;
    labelLeftPadding: number;
};
declare const CharactersToEscapeForExactSearchInstance: string[];
declare class Strings {
    private stringValueDefaults;
    private stringValues;
    constructor();
    mergeStrings(stringKeyValues: any): void;
    getString(stringKey: string): any;
    toObject(): any;
}
declare function __extends(d: any, b: any): void;
declare function __rest(s: any, e: any): {};
declare function __decorate(decorators: any, target: any, key: any, desc: any, ...args: any[]): any;
declare function __param(paramIndex: any, decorator: any): (target: any, key: any) => void;
declare function __metadata(metadataKey: any, metadataValue: any): any;
declare function __awaiter(thisArg: any, _arguments: any, P: any, generator: any): any;
declare function __generator(thisArg: any, body: any): {
    next: (v: any) => any;
    throw: (v: any) => any;
    return: (v: any) => any;
};
declare function __exportStar(m: any, o: any): void;
declare function __values(o: any): any;
declare function __read(o: any, n: any): any;
declare function __spread(...args: any[]): any[];
declare function __spreadArrays(...args: any[]): any[];
declare function __await(v: any): __await;
declare class __await {
    constructor(v: any);
    v: any;
}
declare function __asyncGenerator(thisArg: any, _arguments: any, generator: any): {};
declare function __asyncDelegator(o: any): {};
declare function __asyncValues(o: any): any;
declare function __makeTemplateObject(cooked: any, raw: any): any;
declare function __importStar(mod: any): any;
declare function __importDefault(mod: any): any;
declare function __classPrivateFieldGet(receiver: any, privateMap: any): any;
declare function __classPrivateFieldSet(receiver: any, privateMap: any, value: any): any;
declare function __assign(...args: any[]): any;
declare function __createBinding(o: any, m: any, k: any, k2: any): void;
declare class Grid extends Component {
    private gridComponent;
    private rowLabelKey;
    private colorKey;
    private aggIndexKey;
    private chartComponentData;
    private draw;
    private closeButton;
    private filteredTimestamps;
    private table;
    private tableHeaderRow;
    private tableContentRows;
    usesSeconds: boolean;
    usesMillis: boolean;
    constructor(renderTarget: Element);
    Grid(): void;
    private cellClass;
    focus: (rowIdx: any, colIdx: any) => void;
    renderFromAggregates(data: any, options: any, aggregateExpressionOptions: any, chartComponentData: any): void;
    private getRowData;
    private convertSeriesToGridData;
    private getFormattedDate;
    private setFilteredTimestamps;
    private addHeaderCells;
    private addValueCells;
    render(data: any, options: any, aggregateExpressionOptions: any, chartComponentData?: ChartComponentData): void;
    private arrowNavigate;
}
export { Grid as default, DefaultHierarchyNavigationOptions, DefaultHierarchyContextMenuOptions, nullTsidDisplayString, swimlaneLabelConstants, CharactersToEscapeForExactSearchInstance, Strings, __extends, __rest, __decorate, __param, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread, __spreadArrays, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet, __assign, __createBinding };
