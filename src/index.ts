import { Interpolator, noInterpolator } from './interpolators';

export interface TimeSeriesCollectionInterface<T> {
    datums: Array<T>;
    timestamps: Array<number>;
}

export class TimeSeriesCollection<T> {
    _state: TimeSeriesCollectionInterface<T>;
    private _interpolator: Interpolator<T>;

    constructor(interpolator: Interpolator<T> = undefined) {
        this._state = {
            timestamps: [],
            datums: []
        };
        this._interpolator = interpolator || noInterpolator;
    }

    public addSample(timestamp: number, data: T) {
        return addSample(this._state, timestamp, data);
    }

    public removeTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number) {
        return removeTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }

    public removeOutsideTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number) {
        return removeOutsideTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }

    public getValue(timestamp: number) {
        return getValue(this._state, timestamp, this._interpolator);
    }
}

export function isNumber(val: number): boolean {
    return Number.isFinite(val);
}

export function isValidTimestamp(timestamp: number): boolean {
    return isNumber(timestamp);
}

export function isNumberOrInfinity(val: number): boolean {
    return isNumber(val) || val === Number.POSITIVE_INFINITY || val === Number.NEGATIVE_INFINITY;
}

export function isValidTimeRange(fromTimestamp: number, toTimestamp: number): boolean {
    return (
        isNumberOrInfinity(fromTimestamp) &&
        isNumberOrInfinity(toTimestamp) &&
        toTimestamp >= fromTimestamp
    );
}

/**
 * Binary searches through list of unix timestamps
 * @param timestamps
 * @param timestamp
 * @returns index of the first item in the array or the bitwise number of where it should be inserted to maintain order
 */
export function binarySearch(timestamps: Array<number>, timestamp: number): number {
    let i;
    let comparison;
    let low = 0;
    let high = timestamps.length - 1;
    while (low <= high) {
        i = ~~((low + high) / 2);
        comparison = timestamps[i] - timestamp;
        if (comparison < 0) {
            low = i + 1;
            continue;
        }
        if (comparison > 0) {
            high = i - 1;
            continue;
        }
        return i;
    }
    return ~(high + 1);
}

export function addSample<T>(
    collection: TimeSeriesCollectionInterface<T>,
    timestamp: number,
    data: T
) {
    if (!isValidTimestamp(timestamp)) {
        throw new Error(`invalid timestamp '${timestamp}'`);
    }
    const i = binarySearch(collection.timestamps, timestamp);
    if (i < 0) {
        collection.timestamps.splice(~i, 0, timestamp);
        collection.datums.splice(~i, 0, data);
    } else {
        collection.timestamps[i] = timestamp;
        collection.datums[i] = data;
    }
}

export function removeOutsideTimeFrame(
    collection: TimeSeriesCollectionInterface<any>,
    fromTimestampInclusive: number,
    toTimestampInclusive: number
) {
    removeTimeFrame(collection, -Infinity, fromTimestampInclusive);
    removeTimeFrame(collection, toTimestampInclusive, Infinity);
}

export function removeTimeFrame(
    collection: TimeSeriesCollectionInterface<any>,
    fromTimestampInclusive: number,
    toTimestampInclusive: number
) {
    if (!isValidTimeRange(fromTimestampInclusive, toTimestampInclusive)) {
        throw new Error(`invalid time range ${fromTimestampInclusive} - ${toTimestampInclusive}`);
    }
    const fromBitwiseSearch = binarySearch(collection.timestamps, fromTimestampInclusive);
    const removeFromIndex = fromBitwiseSearch < 0 ? ~fromBitwiseSearch : fromBitwiseSearch;
    const toBitwiseSearch = binarySearch(collection.timestamps, toTimestampInclusive);
    const removeToIndex = toBitwiseSearch < 0 ? ~toBitwiseSearch : toBitwiseSearch + 1;
    collection.timestamps.splice(removeFromIndex, removeToIndex - removeFromIndex);
    collection.datums.splice(removeFromIndex, removeToIndex - removeFromIndex);
}

export function getValue<T>(
    collection: TimeSeriesCollectionInterface<T>,
    timestamp: number,
    interpolator: Interpolator<T>
): T | undefined {
    const i = binarySearch(collection.timestamps, timestamp);
    if (i > -1) {
        // We found a matching timestamp, return it's data
        return collection.datums[i];
    } else {
        // there's no exact match, ask the interpolator for an interpolated value
        return interpolator(collection, timestamp, ~i);
    }
}
