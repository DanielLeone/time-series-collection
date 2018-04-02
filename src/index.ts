export interface BinaryTimeSeriesCollection<T> {
    datums: Array<T>;
    timestamps: Array<number>;
}

function noInterpolator(): any {
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

    removeTimeFrame(fromTimestamp: number, toTimestamp: number) {
        return removeTimeFrame(this._state, fromTimestamp, toTimestamp);
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
    const i = binarySearch(collection.timestamps, timestamp);
    if (i < 0) {
        collection.timestamps[~i] = timestamp;
        collection.datums[~i] = data;
    } else {
        collection.timestamps[i] = timestamp;
        collection.datums[i] = data;
    }
}

export function removeTimeFrame(
    collection: BinaryTimeSeriesCollection<any>,
    fromTimestampInclusive: number,
    toTimestampInclusive: number
) {
    if (fromTimestampInclusive == null || toTimestampInclusive == null) {
        throw new Error('must provide both a ');
    }
    if (fromTimestampInclusive > toTimestampInclusive) {
        throw new Error('fromTimestamp must be before toTimestamp');
    }

    const fromBitwiseSearch = binarySearch(collection.timestamps, fromTimestampInclusive);
    const removeFromIndex = fromBitwiseSearch < 0 ? ~fromBitwiseSearch : fromBitwiseSearch;
    const toBitwiseSearch = binarySearch(collection.timestamps, toTimestampInclusive);
    const removeToIndex = (toBitwiseSearch < 0 ? ~toBitwiseSearch : toBitwiseSearch) + 1;
    collection.timestamps.splice(removeFromIndex, removeToIndex);
    collection.datums.splice(removeFromIndex, removeToIndex);
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
