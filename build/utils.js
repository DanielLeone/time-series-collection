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
function binarySearch(array, target) {
    let index;
    let comparison;
    let low = 0;
    let high = array.length - 1;
    while (low <= high) {
        index = ~~((low + high) / 2);
        comparison = array[index] - target;
        if (comparison < 0) {
            low = index + 1;
            continue;
        }
        if (comparison > 0) {
            high = index - 1;
            continue;
        }
        return index;
    }
    return ~(high + 1);
}
exports.binarySearch = binarySearch;
//# sourceMappingURL=utils.js.map