export interface BinaryTimeSeriesCollection<T> {
    datums: Array<T>;
    timestamps: Array<number>;
}
export declare function noInterpolator(): any;
export declare function staticForwardHoldInterpolatorFactory(maxHoldLength: number): Interpolator<number>;
export declare type Interpolator<T> = (timestamp: number, prevTimestamp: number, prevValue: T, nextTimestamp: number, nextValue: T) => T;
export declare class TimeSeriesCollection<T> {
    _state: BinaryTimeSeriesCollection<T>;
    private _interpolator;
    constructor(interpolator?: Interpolator<T>);
    addPoint(timestamp: number, data: T): void;
    removeTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number): void;
    removeOutsideTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number): void;
    getValue(timestamp: number): T;
}
export declare function binarySearch(timestamps: Array<number>, timestamp: number): number;
export declare function addPoint<T>(collection: BinaryTimeSeriesCollection<T>, timestamp: number, data: T): void;
export declare function isValidTimestamp(timestamp: number): boolean;
export declare function isValidTimeRange(fromTimestamp: number, toTimestamp: number): boolean;
export declare function removeOutsideTimeFrame(collection: BinaryTimeSeriesCollection<any>, fromTimestampInclusive: number, toTimestampInclusive: number): void;
export declare function removeTimeFrame(collection: BinaryTimeSeriesCollection<any>, fromTimestampInclusive: number, toTimestampInclusive: number): void;
export declare function getValue<T>(collection: BinaryTimeSeriesCollection<T>, timestamp: number, interpolator: Interpolator<T>): T | undefined;
