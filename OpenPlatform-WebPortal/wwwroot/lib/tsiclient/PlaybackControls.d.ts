import { Component } from "./Component-9318289b";
interface IPlaybackSettings {
    intervalMillis: number;
    stepSizeMillis: number;
}
declare class PlaybackControls extends Component {
    private playbackInterval;
    private playButton;
    private handleElement;
    private controlsContainer;
    private track;
    private trackXOffset;
    private trackYOffset;
    private trackWidth;
    private timeFormatter;
    private selectedTimeStamp;
    private selectTimeStampCallback;
    private timeStampToPosition;
    private playbackSettings;
    private end;
    private wasPlayingWhenDragStarted;
    readonly handleRadius: number;
    readonly minimumPlaybackInterval: number;
    // 1 second
    constructor(renderTarget: Element, initialTimeStamp?: Date);
    get currentTimeStamp(): Date;
    render(start: Date, end: Date, onSelectTimeStamp: (d: Date) => {}, options: any, playbackSettings: IPlaybackSettings): void;
    play(): void;
    pause(): void;
    next(): void;
    private clamp;
    private onDrag;
    private onDragEnd;
    private updateSelection;
}
export { PlaybackControls as default };
