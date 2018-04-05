"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interpolators_1 = require("./interpolators");
const functions_1 = require("./functions");
class TimeSeriesCollection {
    constructor(interpolator = undefined) {
        this._state = {
            timestamps: [],
            datums: []
        };
        this._interpolator = interpolator || interpolators_1.noInterpolator;
    }
    addSample(timestamp, data) {
        return functions_1.addSample(this._state, timestamp, data);
    }
    removeTimeFrame(fromTimestampInclusive, toTimestampInclusive) {
        return functions_1.removeTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }
    removeOutsideTimeFrame(fromTimestampInclusive, toTimestampInclusive) {
        return functions_1.removeOutsideTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }
    getValue(timestamp) {
        return functions_1.getValue(this._state, timestamp, this._interpolator);
    }
}
exports.TimeSeriesCollection = TimeSeriesCollection;
//# sourceMappingURL=collection.js.map