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

export function locationInterpolator(): Interpolator<{ x: number; y: number }> {
    return (
        collection: TimeSeriesCollectionInterface<{ x: number; y: number }>,
        targetTimestamp: number,
        targetIndex: number
    ) => {
        // make sure we have enough points, ie we're not the first and not the last point
        if (targetIndex === 0 || targetIndex == collection.timestamps.length) {
            return undefined;
        }

        // grab the sample before and after our target
        const sampleBefore = collection.datums[targetIndex - 1];
        const sampleAfter = collection.datums[targetIndex];

        const timestampBefore = collection.timestamps[targetIndex - 1];
        const timestampAfter = collection.timestamps[targetIndex];

        // calculate the percentage we are between the two samples
        const amount = (targetTimestamp - timestampBefore) / (timestampAfter - timestampBefore);

        // lerp each property
        return {
            x: lerp(sampleBefore.x, sampleAfter.x, amount),
            y: lerp(sampleBefore.y, sampleAfter.y, amount)
        };
    };
}

export function lerp(value1: number, value2: number, alpha: number): number {
    // (1 - alpha) * a + alpha * b
    return (1 - alpha) * value1 + alpha * value2;
}
