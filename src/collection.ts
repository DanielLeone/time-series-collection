import { Interpolator, noInterpolator } from './interpolators';
import { addSample, getValue, removeOutsideTimeFrame, removeTimeFrame } from './functions';

export interface TimeSeriesCollectionInterface<T> {
    datums: Array<T>;
    timestamps: Array<number>;
}

export class TimeSeriesCollection<T> {
    private _state: TimeSeriesCollectionInterface<T>;
    private _interpolator: Interpolator<T>;

    constructor(interpolator: Interpolator<T> = undefined) {
        this._state = {
            timestamps: [],
            datums: []
        };
        this._interpolator = interpolator || noInterpolator;
    }

    public addSample(timestamp: number, data: T) {
        return addSample(this._state, timestamp, data);
    }

    public removeTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number) {
        return removeTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }

    public removeOutsideTimeFrame(fromTimestampInclusive: number, toTimestampInclusive: number) {
        return removeOutsideTimeFrame(this._state, fromTimestampInclusive, toTimestampInclusive);
    }

    public getValue(timestamp: number) {
        return getValue(this._state, timestamp, this._interpolator);
    }
}
