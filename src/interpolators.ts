import { TimeSeriesCollectionInterface } from './collection';
import { isNumberOrInfinity } from './utils';

export type Interpolator<T> = (
    collection: TimeSeriesCollectionInterface<T>,
    targetTimestamp: number,
    closestIndex: number
) => T;

export function noInterpolator(): undefined {
    return undefined;
}

export function closestPastSample<T>(maxDistanceSeconds: number): Interpolator<T> {
    if (!isNumberOrInfinity(maxDistanceSeconds)) {
        throw new Error('invalid maxDistanceSeconds value. For an infinite distance, use Infinity');
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
 * Picks the next closest sample in the collection
 * @param {number} maxForwardDistanceSeconds Ignore samples more than this many seconds before the target (inclusive)
 * @param {number} maxBackwardsDistanceSeconds Ignore samples more than this many seconds after the target (inclusive)
 * @param {boolean} favourPastSamples Whether to favour past samples of future samples in the case of an exact match
 * @returns {Interpolator<number>}
 */
export function closestSample<T>(
    maxForwardDistanceSeconds: number = Number.POSITIVE_INFINITY,
    maxBackwardsDistanceSeconds: number = Number.POSITIVE_INFINITY,
    favourPastSamples: boolean = true
): Interpolator<T> {
    if (!isNumberOrInfinity(maxBackwardsDistanceSeconds)) {
        throw new Error(
            'invalid maxBackwardsDistanceSeconds value. For an infinite distance, use Infinity'
        );
    }
    if (!isNumberOrInfinity(maxForwardDistanceSeconds)) {
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
