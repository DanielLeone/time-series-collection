export interface BinaryTimeSeriesCollection<T> {
    datums: Array<T>;
    timestamps: Array<number>;
}

export function noInterpolator(): any {
    return undefined;
}

export function staticForwardHoldInterpolatorFactory(maxHoldLength: number): Interpolator<number> {
    return (
        timestamp: number,
        prevTimestamp: number,
        prevValue: number,
        nextTimestamp: number,
        nextValue: number
    ) => {
        return timestamp - prevTimestamp <= maxHoldLength ? prevValue : undefined;
    };
}

type Interpolator<T> = (
    timestamp: number,
    prevTimestamp: number,
    prevValue: T,
    nextTimestamp: number,
    nextValue: T
) => T;

export class TimeSeriesCollection<T> {
    _state: BinaryTimeSeriesCollection<T>;
    private _interpolator: Interpolator<T>;

    constructor(interpolator: Interpolator<T> = undefined) {
        this._state = {
            timestamps: [],
            datums: []
        };
        this._interpolator = interpolator || noInterpolator;
    }

    addPoint(timestamp: number, data: T) {
        return addPoint(this._state, timestamp, data);
    }

    removeTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number) {
        return removeTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }

    removeOutsideTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number) {
        return removeOutsideTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }

    getValue(timestamp: number) {
        return getValue(this._state, timestamp, this._interpolator);
    }
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

export function addPoint<T>(collection: BinaryTimeSeriesCollection<T>, timestamp: number, data: T) {
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

export function isValidTimestamp(timestamp: number): boolean {
    return Number.isFinite(timestamp);
}

export function isValidTimeRange(fromTimestamp: number, toTimestamp: number): boolean {
    return (
        (isValidTimestamp(fromTimestamp) ||
            fromTimestamp === Number.POSITIVE_INFINITY ||
            fromTimestamp === Number.NEGATIVE_INFINITY) &&
        (isValidTimestamp(toTimestamp) ||
            toTimestamp === Number.POSITIVE_INFINITY ||
            toTimestamp === Number.NEGATIVE_INFINITY) &&
        toTimestamp >= fromTimestamp
    );
}

export function removeOutsideTimeFrame(
    collection: BinaryTimeSeriesCollection<any>,
    fromTimestampInclusive: number,
    toTimestampInclusive: number
) {
    removeTimeFrame(collection, -Infinity, fromTimestampInclusive);
    removeTimeFrame(collection, toTimestampInclusive, Infinity);
}

export function removeTimeFrame(
    collection: BinaryTimeSeriesCollection<any>,
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
    collection: BinaryTimeSeriesCollection<T>,
    timestamp: number,
    interpolator: Interpolator<T>
): T | undefined {
    const i = binarySearch(collection.timestamps, timestamp);
    if (i > -1) {
        // We found a matching timestamp, return it's data
        return collection.datums[i];
    } else {
        // there's no exact match, pass the previous and next values into the interpolator to get a result
        return interpolator(
            timestamp,
            collection.timestamps[~i - 1],
            collection.datums[~i - 1],
            collection.timestamps[~i + 1],
            collection.datums[~i + 1]
        );
    }
}
