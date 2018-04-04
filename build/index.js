"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function noInterpolator() {
    return undefined;
}
exports.noInterpolator = noInterpolator;
function staticForwardHoldInterpolatorFactory(maxHoldLength) {
    return (collection, targetTimestamp, targetIndex) => {
        return targetTimestamp - collection.timestamps[targetIndex - 1] <= maxHoldLength
            ? collection.datums[targetIndex - 1]
            : undefined;
    };
}
exports.staticForwardHoldInterpolatorFactory = staticForwardHoldInterpolatorFactory;
class TimeSeriesCollection {
    constructor(interpolator = undefined) {
        this._state = {
            timestamps: [],
            datums: []
        };
        this._interpolator = interpolator || noInterpolator;
    }
    addPoint(timestamp, data) {
        return addPoint(this._state, timestamp, data);
    }
    removeTimeFrame(fromTimestampInclusive, toTimestampInclusive) {
        return removeTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }
    removeOutsideTimeFrame(fromTimestampInclusive, toTimestampInclusive) {
        return removeOutsideTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }
    getValue(timestamp) {
        return getValue(this._state, timestamp, this._interpolator);
    }
}
exports.TimeSeriesCollection = TimeSeriesCollection;
function binarySearch(timestamps, timestamp) {
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
exports.binarySearch = binarySearch;
function addPoint(collection, timestamp, data) {
    if (!isValidTimestamp(timestamp)) {
        throw new Error(`invalid timestamp '${timestamp}'`);
    }
    const i = binarySearch(collection.timestamps, timestamp);
    if (i < 0) {
        collection.timestamps.splice(~i, 0, timestamp);
        collection.datums.splice(~i, 0, data);
    }
    else {
        collection.timestamps[i] = timestamp;
        collection.datums[i] = data;
    }
}
exports.addPoint = addPoint;
function isValidTimestamp(timestamp) {
    return Number.isFinite(timestamp);
}
exports.isValidTimestamp = isValidTimestamp;
function isValidTimeRange(fromTimestamp, toTimestamp) {
    return ((isValidTimestamp(fromTimestamp) ||
        fromTimestamp === Number.POSITIVE_INFINITY ||
        fromTimestamp === Number.NEGATIVE_INFINITY) &&
        (isValidTimestamp(toTimestamp) ||
            toTimestamp === Number.POSITIVE_INFINITY ||
            toTimestamp === Number.NEGATIVE_INFINITY) &&
        toTimestamp >= fromTimestamp);
}
exports.isValidTimeRange = isValidTimeRange;
function removeOutsideTimeFrame(collection, fromTimestampInclusive, toTimestampInclusive) {
    removeTimeFrame(collection, -Infinity, fromTimestampInclusive);
    removeTimeFrame(collection, toTimestampInclusive, Infinity);
}
exports.removeOutsideTimeFrame = removeOutsideTimeFrame;
function removeTimeFrame(collection, fromTimestampInclusive, toTimestampInclusive) {
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
exports.removeTimeFrame = removeTimeFrame;
function getValue(collection, timestamp, interpolator) {
    const i = binarySearch(collection.timestamps, timestamp);
    if (i > -1) {
        return collection.datums[i];
    }
    else {
        return interpolator(collection, timestamp, ~i);
    }
}
exports.getValue = getValue;
//# sourceMappingURL=index.js.map