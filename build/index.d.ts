export interface TimeSeriesCollectionInterface<T> {
    datums: Array<T>;
    timestamps: Array<number>;
}
export declare function noInterpolator(): any;
export declare function staticForwardHoldInterpolatorFactory(maxHoldLength: number): Interpolator<number>;
export declare type Interpolator<T> = (collection: TimeSeriesCollectionInterface<T>, targetTimestamp: number, closestIndex: number) => T;
export declare class TimeSeriesCollection<T> {
    _state: TimeSeriesCollectionInterface<T>;
    private _interpolator;
    constructor(interpolator?: Interpolator<T>);
    addPoint(timestamp: number, data: T): void;
    removeTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number): void;
    removeOutsideTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number): void;
    getValue(timestamp: number): T;
}
export declare function binarySearch(timestamps: Array<number>, timestamp: number): number;
export declare function addPoint<T>(collection: TimeSeriesCollectionInterface<T>, timestamp: number, data: T): void;
export declare function isValidTimestamp(timestamp: number): boolean;
export declare function isValidTimeRange(fromTimestamp: number, toTimestamp: number): boolean;
export declare function removeOutsideTimeFrame(collection: TimeSeriesCollectionInterface<any>, fromTimestampInclusive: number, toTimestampInclusive: number): void;
export declare function removeTimeFrame(collection: TimeSeriesCollectionInterface<any>, fromTimestampInclusive: number, toTimestampInclusive: number): void;
export declare function getValue<T>(collection: TimeSeriesCollectionInterface<T>, timestamp: number, interpolator: Interpolator<T>): T | undefined;
