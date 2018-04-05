"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function addSample(collection, timestamp, data) {
    if (!utils_1.isValidTimestamp(timestamp)) {
        throw new Error(`invalid timestamp '${timestamp}'`);
    }
    const i = utils_1.binarySearch(collection.timestamps, timestamp);
    if (i < 0) {
        collection.timestamps.splice(~i, 0, timestamp);
        collection.datums.splice(~i, 0, data);
    }
    else {
        collection.timestamps[i] = timestamp;
        collection.datums[i] = data;
    }
}
exports.addSample = addSample;
function removeOutsideTimeFrame(collection, fromTimestampInclusive, toTimestampInclusive) {
    removeTimeFrame(collection, -Infinity, fromTimestampInclusive);
    removeTimeFrame(collection, toTimestampInclusive, Infinity);
}
exports.removeOutsideTimeFrame = removeOutsideTimeFrame;
function removeTimeFrame(collection, fromTimestampInclusive, toTimestampInclusive) {
    if (!utils_1.isValidTimeRange(fromTimestampInclusive, toTimestampInclusive)) {
        throw new Error(`invalid time range ${fromTimestampInclusive} - ${toTimestampInclusive}`);
    }
    const fromBitwiseSearch = utils_1.binarySearch(collection.timestamps, fromTimestampInclusive);
    const removeFromIndex = fromBitwiseSearch < 0 ? ~fromBitwiseSearch : fromBitwiseSearch;
    const toBitwiseSearch = utils_1.binarySearch(collection.timestamps, toTimestampInclusive);
    const removeToIndex = toBitwiseSearch < 0 ? ~toBitwiseSearch : toBitwiseSearch + 1;
    collection.timestamps.splice(removeFromIndex, removeToIndex - removeFromIndex);
    collection.datums.splice(removeFromIndex, removeToIndex - removeFromIndex);
}
exports.removeTimeFrame = removeTimeFrame;
function getValue(collection, timestamp, interpolator) {
    const i = utils_1.binarySearch(collection.timestamps, timestamp);
    if (i > -1) {
        return collection.datums[i];
    }
    else {
        return interpolator(collection, timestamp, ~i);
    }
}
exports.getValue = getValue;
//# sourceMappingURL=functions.js.map