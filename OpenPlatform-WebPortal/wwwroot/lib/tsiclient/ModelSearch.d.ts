import { Component } from "./Component-9318289b";
declare class ModelSearch extends Component {
    private server;
    private hierarchies;
    private clickedInstance;
    private wrapper;
    private types;
    private instanceResults;
    private usedContinuationTokens;
    private contextMenu;
    private currentResultIndex;
    constructor(renderTarget: Element);
    ModelSearch(): void;
    render(environmentFqdn: string, getToken: any, hierarchyData: any, chartOptions: any): void;
    handleKeydown(event: any, ap: any): void;
    private closeContextMenu;
    private stripHits;
    private getInstanceHtml;
}
export { ModelSearch as default };
