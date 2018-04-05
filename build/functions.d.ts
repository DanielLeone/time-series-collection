import { Interpolator } from './interpolators';
import { TimeSeriesCollectionInterface } from './collection';
export declare function addSample<T>(collection: TimeSeriesCollectionInterface<T>, timestamp: number, data: T): void;
export declare function removeOutsideTimeFrame(collection: TimeSeriesCollectionInterface<any>, fromTimestampInclusive: number, toTimestampInclusive: number): void;
export declare function removeTimeFrame(collection: TimeSeriesCollectionInterface<any>, fromTimestampInclusive: number, toTimestampInclusive: number): void;
export declare function getValue<T>(collection: TimeSeriesCollectionInterface<T>, timestamp: number, interpolator: Interpolator<T>): T | undefined;
