import { Interpolator, noInterpolator } from './interpolators';
import {
    addSample,
    addSamples,
    getValue,
    removeOutsideTimeFrame,
    removeTimeFrame
} from './functions';

export interface TimeSeriesCollectionInterface<T> {
    datums: Array<T>;
    timestamps: Array<number>;
}

export class TimeSeriesCollection<T> {
    private _state: TimeSeriesCollectionInterface<T>;
    private _interpolator: Interpolator<T>;

    /**
     * Creates a new instance of a TimeSeriesCollection
     * @param {Interpolator<T>} interpolator The interpolator to use when getting a value
     */
    constructor(interpolator: Interpolator<T> = undefined) {
        this._state = {
            timestamps: [],
            datums: []
        };
        this._interpolator = interpolator || noInterpolator;
    }

    /**
     * Adds a sample to the collection
     * @param {number} timestamp The unix timestamp for this sample
     * @param {T} data The sample data
     */
    public addSample(timestamp: number, data: T): void {
        return addSample(this._state, timestamp, data);
    }

    /**
     * Adds a list of samples to the collection.
     * The samples do not have to be sorted, but if they are sorted, they will be inserted much faster.
     * @param {Array<number>} timestamps The list of timestamps to insert
     * @param {Array<T>} datums The matching order list of datums to insert
     */
    public addSamples(timestamps: Array<number>, datums: Array<T>): void {
        return addSamples(this._state, timestamps, datums);
    }

    /**
     * Removes all samples inside the specified time frame
     * @param {number} fromTimestampInclusive removes all samples after or at this unix time
     * @param {number} toTimestampInclusive removes all samples before or at this unix time
     * @param {boolean} keepClosestSamples whether to keep a single sample of either side of the time frames to remove.
     */
    public removeTimeFrame(
        fromTimestampInclusive: number,
        toTimestampInclusive: number,
        keepClosestSamples: boolean = false
    ): void {
        return removeTimeFrame(
            this._state,
            fromTimestampInclusive,
            toTimestampInclusive,
            keepClosestSamples
        );
    }

    /**
     * Removes all samples outside of the specified time frame
     * @param {number} fromTimestampInclusive removes all samples before or at this unix time
     * @param {number} toTimestampInclusive removes all samples after or at this unix time
     * @param {boolean} keepClosestSamples whether to keep a single sample of either side of the time frames to remove.
     */
    public removeOutsideTimeFrame(
        fromTimestampInclusive: number,
        toTimestampInclusive: number,
        keepClosestSamples: boolean = false
    ): void {
        return removeOutsideTimeFrame(
            this._state,
            fromTimestampInclusive,
            toTimestampInclusive,
            keepClosestSamples
        );
    }

    /**
     * Gets a value of the sample at the specified timestamp.
     * If there's no sample at that time, the interpolator will be invoked for a value.
     * @param {number} timestamp The unix timestamp
     * @returns {T} An interpolated value from the samples
     */
    public getValue(timestamp: number) {
        return getValue(this._state, timestamp, this._interpolator);
    }

    /**
     * Returns the number of samples in this collection
     */
    public size(): number {
        return this._state.timestamps.length;
    }
}
