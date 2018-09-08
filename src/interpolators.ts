import { TimeSeriesCollectionInterface } from './collection';
import { isNumberOrInfinity } from './utils';

export type Interpolator<T = any> = (
    collection: TimeSeriesCollectionInterface<T>,
    targetTimestamp: number,
    closestIndex: number
) => T;

/**
 * An interpolator which doe not interpolator; always returns undefined
 * @returns {undefined}
 */
export function noInterpolator(): undefined {
    return undefined;
}

/**
 * Creates an interpolator which picks the closest sample from the past
 * @param {number} maxDistanceSeconds Ignore samples more than this many seconds before the target timestamp (inclusive)
 * @returns {Interpolator<T>} An interpolator to use when getting values from a time series collection
 */
export function closestPastSample<T>(maxDistanceSeconds: number): Interpolator<T> {
    if (!isNumberOrInfinity(maxDistanceSeconds) || maxDistanceSeconds < 0) {
        throw new Error(
            'invalid maxDistanceSeconds value. For an infinite distance, use Infinity. For a negative distance, use a different interpolator'
        );
    }
    return (
        collection: TimeSeriesCollectionInterface<T>,
        targetTimestamp: number,
        targetIndex: number
    ) => {
        return targetTimestamp - collection.timestamps[targetIndex - 1] <= maxDistanceSeconds
            ? collection.datums[targetIndex - 1]
            : undefined;
    };
}

/**
 * Creates an interpolator which picks the closest sample in the future
 * @param {number} maxDistanceSeconds Ignore samples more than this many seconds after the target timestamp (inclusive)
 * @returns {Interpolator<T>} An interpolator to use when getting values from a time series collection
 */
export function closestFutureSample<T>(maxDistanceSeconds: number): Interpolator<T> {
    if (!isNumberOrInfinity(maxDistanceSeconds) || maxDistanceSeconds < 0) {
        throw new Error(
            'invalid maxDistanceSeconds value. For an infinite distance, use Infinity. For a negative distance, use a different interpolator'
        );
    }
    return (
        collection: TimeSeriesCollectionInterface<T>,
        targetTimestamp: number,
        targetIndex: number
    ) => {
        return collection.timestamps[targetIndex] - targetTimestamp <= maxDistanceSeconds
            ? collection.datums[targetIndex]
            : undefined;
    };
}

/**
 * Creates an interpolator which picks the closest sample
 * @param {number} maxForwardDistanceSeconds Ignore samples more than this many seconds before the target timestamp (inclusive)
 * @param {number} maxBackwardsDistanceSeconds Ignore samples more than this many seconds after the target timestamp (inclusive)
 * @param {boolean} favourPastSamples Whether to favour past samples of future samples in the case of an exact match
 * @returns {Interpolator<number>} An interpolator to use when getting values from a time series collection
 */
export function closestSample<T>(
    maxForwardDistanceSeconds: number = Number.POSITIVE_INFINITY,
    maxBackwardsDistanceSeconds: number = Number.POSITIVE_INFINITY,
    favourPastSamples: boolean = true
): Interpolator<T> {
    if (!isNumberOrInfinity(maxBackwardsDistanceSeconds) || maxBackwardsDistanceSeconds < 0) {
        throw new Error(
            'invalid maxBackwardsDistanceSeconds value. For an infinite distance, use Infinity'
        );
    }
    if (!isNumberOrInfinity(maxForwardDistanceSeconds) || maxForwardDistanceSeconds < 0) {
        throw new Error(
            'invalid maxForwardDistanceSeconds value. For an infinite distance, use Infinity'
        );
    }
    if (maxForwardDistanceSeconds === 0 && maxBackwardsDistanceSeconds === 0) {
        // optimization for a faster interpolator
        return noInterpolator;
    }
    if (maxBackwardsDistanceSeconds === 0) {
        // optimization for a faster interpolator
        return closestPastSample(maxForwardDistanceSeconds);
    }
    if (maxForwardDistanceSeconds === 0) {
        // optimization for a faster interpolator
        return closestPastSample(maxBackwardsDistanceSeconds);
    }

    return (
        collection: TimeSeriesCollectionInterface<T>,
        targetTimestamp: number,
        targetIndex: number
    ) => {
        const distToPrev = targetTimestamp - collection.timestamps[targetIndex - 1];
        const distToNext = collection.timestamps[targetIndex] - targetTimestamp;
        const isPreviousOkay =
            (distToPrev <= maxBackwardsDistanceSeconds ||
                maxBackwardsDistanceSeconds === undefined) &&
            !isNaN(distToPrev);
        const isNextOkay =
            (distToNext <= maxForwardDistanceSeconds || maxForwardDistanceSeconds === undefined) &&
            !isNaN(distToNext);
        if (
            (distToPrev < distToNext ||
                (distToPrev === distToNext && favourPastSamples) ||
                !isNextOkay) &&
            isPreviousOkay
        ) {
            return collection.datums[targetIndex - 1];
        } else if (isNextOkay) {
            return collection.datums[targetIndex];
        }
        return undefined;
    };
}
