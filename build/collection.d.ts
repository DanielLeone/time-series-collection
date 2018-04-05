import { Interpolator } from './interpolators';
export interface TimeSeriesCollectionInterface<T> {
    datums: Array<T>;
    timestamps: Array<number>;
}
export declare class TimeSeriesCollection<T> {
    _state: TimeSeriesCollectionInterface<T>;
    private _interpolator;
    constructor(interpolator?: Interpolator<T>);
    addSample(timestamp: number, data: T): void;
    removeTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number): void;
    removeOutsideTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number): void;
    getValue(timestamp: number): T;
}
