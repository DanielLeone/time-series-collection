import { Interpolator } from './interpolators';
import { TimeSeriesCollectionInterface } from './collection';
import { binarySearch, isValidTimeRange, isValidTimestamp } from './utils';

/**
 * Adds a sample to the collection
 * @param {TimeSeriesCollectionInterface<T>} collection The collection to use
 * @param {number} timestamp The unix timestamp to add the sample at
 * @param {T} data The sample
 */
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

/**
 * Removes all samples inside the specified time frame
 * @param {TimeSeriesCollectionInterface<T>} collection The collection to use
 * @param {number} fromTimestampInclusive removes all samples after or at this unix time
 * @param {number} toTimestampInclusive removes all samples before or at this unix time
 */
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

/**
 * Removes all samples outside of the specified time frame
 * @param {TimeSeriesCollectionInterface<T>} collection The collection to use
 * @param {number} fromTimestampInclusive removes all samples before or at this unix time
 * @param {number} toTimestampInclusive removes all samples after or at this unix time
 * @param {boolean} keepClosestSamples whether to keep a single sample of either side of the time frames to remove.
 * Meaning if you had samples at 4, 6, 8 and 10, and removed outside of 7 to 9 whilst keepingClosestSamples,
 * it would keep samples 6, 8 and 10.
 */
export function removeOutsideTimeFrame(
    collection: TimeSeriesCollectionInterface<any>,
    fromTimestampInclusive: number,
    toTimestampInclusive: number,
    keepClosestSamples: boolean = false
) {
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
