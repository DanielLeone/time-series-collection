import { Interpolator } from './interpolators';
import { TimeSeriesCollectionInterface } from './collection';
import { binarySearch, isValidTimeRange, isValidTimestamp } from './utils';

/**
 * Adds a list of samples to the collection.
 * The samples do not have to be sorted, but if they are sorted, they will be inserted much faster.
 * @param {TimeSeriesCollectionInterface<T>} collection The collection to use
 * @param {Array<number>} timestamps The list of timestamps to insert
 * @param {Array<T>} datums The matching order list of datums to insert
 */
export function addSamples<T>(
    collection: TimeSeriesCollectionInterface<T>,
    timestamps: Array<number>,
    datums: Array<T>
) {
    if (!Array.isArray(timestamps) || !Array.isArray(datums)) {
        throw new Error('invalid, both timestamps and datums must be arrays!');
    }
    if (timestamps.length !== datums.length) {
        throw new Error('invalid, both arrays must be of sample length!');
    }

    let nextTimestamp, nextDatum;
    const copyTimestamps = timestamps.slice(0);
    const copyDatums = datums.slice(0);
    while (copyTimestamps.length) {
        // take an item from the beginning
        nextTimestamp = copyTimestamps.shift();
        nextDatum = copyDatums.shift();

        // add it to the collection
        const i = binarySearch(collection.timestamps, nextTimestamp);
        if (i < 0) {
            collection.timestamps.splice(~i, 0, nextTimestamp);
            collection.datums.splice(~i, 0, nextDatum);
        } else {
            collection.timestamps[i] = nextTimestamp;
            collection.datums[i] = nextDatum;
        }

        let lastInsertedIndex = i < 0 ? ~i : i;
        let nextIndex = lastInsertedIndex + 1;
        // while the next item to be inserted, is in the correct sport to be inserted at the next index, do it!
        while (
            isValidTimestamp(copyTimestamps[0]) &&
            copyTimestamps[0] > collection.timestamps[lastInsertedIndex] &&
            (copyTimestamps[0] < collection.timestamps[lastInsertedIndex + 1] ||
                collection.timestamps.length <= lastInsertedIndex + 1)
        ) {
            nextTimestamp = copyTimestamps.shift();
            nextDatum = copyDatums.shift();
            collection.timestamps.splice(nextIndex, 0, nextTimestamp);
            collection.datums.splice(nextIndex, 0, nextDatum);
            lastInsertedIndex = nextIndex;
            nextIndex++;
        }
    }
}

/**
 * Adds a sample to the collection
 * @param {TimeSeriesCollectionInterface<T>} collection The collection to use
 * @param {number} timestamp The unix timestamp of the sample
 * @param {T} data The sample
 */
export function addSample<T>(
    collection: TimeSeriesCollectionInterface<T>,
    timestamp: number,
    data: T
): void {
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

/**
 * Removes all samples inside the specified time frame
 * @param {TimeSeriesCollectionInterface<T>} collection The collection to use
 * @param {number} fromTimestampInclusive removes all samples after or at this unix time
 * @param {number} toTimestampInclusive removes all samples before or at this unix time
 * @param {boolean} keepClosestSamples whether to keep a single sample of either side of the time frames to remove.
 */
export function removeTimeFrame(
    collection: TimeSeriesCollectionInterface<any>,
    fromTimestampInclusive: number,
    toTimestampInclusive: number,
    keepClosestSamples: boolean = false
): void {
    if (!isValidTimeRange(fromTimestampInclusive, toTimestampInclusive)) {
        throw new Error(`invalid time range ${fromTimestampInclusive} - ${toTimestampInclusive}`);
    }

    const fromBitwiseSearch = binarySearch(collection.timestamps, fromTimestampInclusive);
    const removeFromIndex =
        (fromBitwiseSearch < 0 ? ~fromBitwiseSearch : fromBitwiseSearch) +
        (keepClosestSamples ? 1 : 0);
    const toBitwiseSearch = binarySearch(collection.timestamps, toTimestampInclusive);
    const removeToIndex =
        (toBitwiseSearch < 0 ? ~toBitwiseSearch : toBitwiseSearch + 1) +
        (keepClosestSamples ? -1 : 0);
    collection.timestamps.splice(removeFromIndex, removeToIndex - removeFromIndex);
    collection.datums.splice(removeFromIndex, removeToIndex - removeFromIndex);
}

/**
 * Removes all samples outside of the specified time frame
 * @param {TimeSeriesCollectionInterface<T>} collection The collection to use
 * @param {number} fromTimestampInclusive removes all samples before or at this unix time
 * @param {number} toTimestampInclusive removes all samples after or at this unix time
 * @param {boolean} keepClosestSamples whether to keep a single sample of either side of the time frames to remove.
 */
export function removeOutsideTimeFrame(
    collection: TimeSeriesCollectionInterface<any>,
    fromTimestampInclusive: number,
    toTimestampInclusive: number,
    keepClosestSamples: boolean = false
): void {
    if (!isValidTimeRange(fromTimestampInclusive, toTimestampInclusive)) {
        throw new Error(`invalid time range ${fromTimestampInclusive} - ${toTimestampInclusive}`);
    }

    const fromBitwiseSearch = binarySearch(collection.timestamps, fromTimestampInclusive);
    const removeBeforeIndex =
        (fromBitwiseSearch < 0 ? ~fromBitwiseSearch : fromBitwiseSearch + 1) +
        (keepClosestSamples ? -1 : 0);
    collection.timestamps.splice(0, removeBeforeIndex);
    collection.datums.splice(0, removeBeforeIndex);

    const toBitwiseSearch = binarySearch(collection.timestamps, toTimestampInclusive);
    const removeAfterIndex =
        (toBitwiseSearch < 0 ? ~toBitwiseSearch : toBitwiseSearch) + (keepClosestSamples ? 1 : 0);
    collection.timestamps.splice(removeAfterIndex);
    collection.datums.splice(removeAfterIndex);
}

/**
 * Gets a value of the sample at the specified timestamp.
 * * If there's no sample at that time, the interpolator will be invoked for a value.
 * @param {TimeSeriesCollectionInterface<T>} collection The collection to use
 * @param {number} timestamp The unix timestamp
 * @param {Interpolator<T>} interpolator The interpolator to use if there's no exact match
 * @returns {T} An interpolated value from the samples
 */
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
