"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isNumber(val) {
    return Number.isFinite(val);
}
exports.isNumber = isNumber;
function isValidTimestamp(timestamp) {
    return isNumber(timestamp);
}
exports.isValidTimestamp = isValidTimestamp;
function isNumberOrInfinity(val) {
    return isNumber(val) || val === Number.POSITIVE_INFINITY || val === Number.NEGATIVE_INFINITY;
}
exports.isNumberOrInfinity = isNumberOrInfinity;
function isValidTimeRange(fromTimestamp, toTimestamp) {
    return (isNumberOrInfinity(fromTimestamp) &&
        isNumberOrInfinity(toTimestamp) &&
        toTimestamp >= fromTimestamp);
}
exports.isValidTimeRange = isValidTimeRange;
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
//# sourceMappingURL=utils.js.map