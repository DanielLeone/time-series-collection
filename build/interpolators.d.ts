import { TimeSeriesCollectionInterface } from './collection';
export declare type Interpolator<T> = (collection: TimeSeriesCollectionInterface<T>, targetTimestamp: number, closestIndex: number) => T;
export declare function noInterpolator(): any;
export declare function closestPastSample<T>(maxDistanceSeconds: number): Interpolator<T>;
export declare function closestSample<T>(maxForwardDistanceSeconds?: number, maxBackwardsDistanceSeconds?: number, favourPastSamples?: boolean): Interpolator<T>;
