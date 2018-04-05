"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function noInterpolator() {
    return undefined;
}
exports.noInterpolator = noInterpolator;
function closestPastSample(maxDistanceSeconds) {
    return (collection, targetTimestamp, targetIndex) => {
        return targetTimestamp - collection.timestamps[targetIndex - 1] <= maxDistanceSeconds
            ? collection.datums[targetIndex - 1]
            : undefined;
    };
}
exports.closestPastSample = closestPastSample;
function closestSample(maxForwardDistanceSeconds = Number.POSITIVE_INFINITY, maxBackwardsDistanceSeconds = Number.POSITIVE_INFINITY, favourPastSamples = true) {
    if (!utils_1.isNumberOrInfinity(maxBackwardsDistanceSeconds)) {
        throw new Error('invalid maxBackwardsDistanceSeconds value. For an infinite distance, use Infinity');
    }
    if (!utils_1.isNumberOrInfinity(maxForwardDistanceSeconds)) {
        throw new Error('invalid maxForwardDistanceSeconds value. For an infinite distance, use Infinity');
    }
    if (maxForwardDistanceSeconds === 0 && maxBackwardsDistanceSeconds === 0) {
        return noInterpolator();
    }
    if (maxBackwardsDistanceSeconds === 0) {
        return closestPastSample(maxForwardDistanceSeconds);
    }
    return (collection, targetTimestamp, targetIndex) => {
        const distanceToClosestPreviousTime = targetTimestamp - collection.timestamps[targetIndex - 1];
        const distanceToClosestNextTime = collection.timestamps[targetIndex] - targetTimestamp;
        const isPreviousOkay = (distanceToClosestPreviousTime <= maxBackwardsDistanceSeconds ||
            maxBackwardsDistanceSeconds === undefined) &&
            !isNaN(distanceToClosestPreviousTime);
        const isNextOkay = (distanceToClosestNextTime <= maxForwardDistanceSeconds ||
            maxForwardDistanceSeconds === undefined) &&
            !isNaN(distanceToClosestNextTime);
        if ((distanceToClosestPreviousTime < distanceToClosestNextTime ||
            (distanceToClosestPreviousTime === distanceToClosestNextTime &&
                favourPastSamples) ||
            !isNextOkay) &&
            isPreviousOkay) {
            return collection.datums[targetIndex - 1];
        }
        else if (isNextOkay) {
            return collection.datums[targetIndex];
        }
        return undefined;
    };
}
exports.closestSample = closestSample;
//# sourceMappingURL=interpolators.js.map