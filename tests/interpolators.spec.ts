import { locationInterpolator, TimeSeriesCollection, TimeSeriesCollectionInterface } from '../src';
import { getValue } from '../src/functions';
import { closestFutureSample, closestPastSample, closestSample, lerp } from '../src/interpolators';

describe('interpolators', () => {
    describe('closest past sample ', () => {
        it('should throw if provided an invalid max distance', () => {
            expect(() => closestPastSample(undefined)).toThrowError(/invalid/);
            expect(() => closestPastSample(-1)).toThrowError(/invalid/);
        });

        it('should hold the value for the length inclusive', () => {
            const c = {
                timestamps: [1, 2, 3],
                datums: [1, 2, 3]
            };
            const interpolator = closestPastSample(3);
            expect(getValue(c, 0, interpolator)).toBeUndefined();
            expect(getValue(c, 1, interpolator)).toEqual(1);
            expect(getValue(c, 2, interpolator)).toEqual(2);
            expect(getValue(c, 3, interpolator)).toEqual(3);
            expect(getValue(c, 4, interpolator)).toEqual(3);
            expect(getValue(c, 5, interpolator)).toEqual(3);
            expect(getValue(c, 6, interpolator)).toEqual(3);
            expect(getValue(c, 7, interpolator)).toBeUndefined();
        });

        it('should only hold the value forward', () => {
            const c = {
                timestamps: [1],
                datums: [1]
            };
            const interpolator = closestPastSample(3);
            expect(getValue(c, -1, interpolator)).toBeUndefined();
            expect(getValue(c, 0, interpolator)).toBeUndefined();
            expect(getValue(c, 1, interpolator)).toEqual(1);
            expect(getValue(c, 2, interpolator)).toEqual(1);
            expect(getValue(c, 3, interpolator)).toEqual(1);
            expect(getValue(c, 4, interpolator)).toEqual(1);
            expect(getValue(c, 5, interpolator)).toBeUndefined();
        });
    });

    describe('closest future sample', () => {
        it('should throw if provided an invalid max distance', () => {
            expect(() => closestFutureSample(undefined)).toThrowError(/invalid/);
            expect(() => closestFutureSample(-1)).toThrowError(/invalid/);
        });

        it('should hold the value for the length inclusive', () => {
            const c = {
                timestamps: [1, 3],
                datums: [1, 3]
            };
            const interpolator = closestFutureSample(3);
            expect(getValue(c, -3, interpolator)).toBeUndefined();
            expect(getValue(c, -2, interpolator)).toEqual(1);
            expect(getValue(c, -1, interpolator)).toEqual(1);
            expect(getValue(c, 0, interpolator)).toEqual(1);
            expect(getValue(c, 1, interpolator)).toEqual(1);
            expect(getValue(c, 2, interpolator)).toEqual(3);
            expect(getValue(c, 3, interpolator)).toEqual(3);
            expect(getValue(c, 4, interpolator)).toBeUndefined();
        });

        it('should only hold the value backwards', () => {
            const c = {
                timestamps: [4],
                datums: [4]
            };
            const interpolator = closestFutureSample(3);
            expect(getValue(c, -1, interpolator)).toBeUndefined();
            expect(getValue(c, 0, interpolator)).toBeUndefined();
            expect(getValue(c, 1, interpolator)).toEqual(4);
            expect(getValue(c, 2, interpolator)).toEqual(4);
            expect(getValue(c, 3, interpolator)).toEqual(4);
            expect(getValue(c, 4, interpolator)).toEqual(4);
            expect(getValue(c, 5, interpolator)).toBeUndefined();
        });
    });

    describe('closest sample', () => {
        it('handle simple case', () => {
            const c = {
                timestamps: [1, 2, 3],
                datums: [1, 2, 3]
            };
            const interpolator = closestSample(3, 3, true);
            expect(getValue(c, -3, interpolator)).toBeUndefined();
            expect(getValue(c, -2, interpolator)).toEqual(1);
            expect(getValue(c, -1, interpolator)).toEqual(1);
            expect(getValue(c, 0, interpolator)).toEqual(1);
            expect(getValue(c, 1, interpolator)).toEqual(1);
            expect(getValue(c, 2, interpolator)).toEqual(2);
            expect(getValue(c, 3, interpolator)).toEqual(3);
            expect(getValue(c, 4, interpolator)).toEqual(3);
            expect(getValue(c, 5, interpolator)).toEqual(3);
            expect(getValue(c, 6, interpolator)).toEqual(3);
            expect(getValue(c, 7, interpolator)).toBeUndefined();
        });

        it('handle no interpolation optimization', () => {
            const c = {
                timestamps: [1],
                datums: [1]
            };
            const interpolator = closestSample(0, 0, true);
            expect(getValue(c, 0, interpolator)).toBeUndefined();
            expect(getValue(c, 1, interpolator)).toEqual(1);
            expect(getValue(c, 2, interpolator)).toBeUndefined();
        });

        it('throw error for bad params', () => {
            expect(() => closestSample(null, 0, true)).toThrowError(/invalid/);
            expect(() => closestSample(0, null, true)).toThrowError(/invalid/);
            expect(() => closestSample(0, null, false)).toThrowError(/invalid/);
            expect(() => closestSample(NaN, null, false)).toThrowError(/invalid/);

            expect(() => closestSample(-1, 19, false)).toThrowError(/invalid/);
            expect(() => closestSample(10, -1, false)).toThrowError(/invalid/);
        });

        it('should default to infinite distances and favouring past samples', () => {
            const c = {
                timestamps: [1, 3],
                datums: [1, 3]
            };
            const interpolator = closestSample();
            expect(getValue(c, -9999999999999999, interpolator)).toEqual(1);
            expect(getValue(c, 1, interpolator)).toEqual(1);
            expect(getValue(c, 2, interpolator)).toEqual(1);
            expect(getValue(c, 3, interpolator)).toEqual(3);
            expect(getValue(c, 9999999999999999, interpolator)).toEqual(3);
        });

        it('handle closest past interpolator optimization', () => {
            const c = {
                timestamps: [1],
                datums: [1]
            };
            const interpolator = closestSample(100, 0, true);
            expect(getValue(c, 0, interpolator)).toBeUndefined();
            expect(getValue(c, 1, interpolator)).toEqual(1);
            expect(getValue(c, 2, interpolator)).toEqual(1);
        });

        it('handle a gap favouring past samples', () => {
            const c = {
                timestamps: [1, 2, 3, 7, 8, 9],
                datums: [2, 4, 6, 14, 16, 18]
            };
            const interpolator = closestSample(3, 3, true);
            expect(getValue(c, 0, interpolator)).toEqual(2);
            expect(getValue(c, 1, interpolator)).toEqual(2);
            expect(getValue(c, 2, interpolator)).toEqual(4);
            expect(getValue(c, 3, interpolator)).toEqual(6);
            expect(getValue(c, 4, interpolator)).toEqual(6);
            expect(getValue(c, 5, interpolator)).toEqual(6); // favouring past sample
            expect(getValue(c, 6, interpolator)).toEqual(14);
            expect(getValue(c, 7, interpolator)).toEqual(14);
            expect(getValue(c, 7.4, interpolator)).toEqual(14);
            expect(getValue(c, 7.5, interpolator)).toEqual(14); // favouring past sample
            expect(getValue(c, 7.6, interpolator)).toEqual(16);
            expect(getValue(c, 8, interpolator)).toEqual(16);
            expect(getValue(c, 9, interpolator)).toEqual(18);
        });

        it('handle a gap favouring future samples', () => {
            const c = {
                timestamps: [1, 3],
                datums: [100, 300]
            };
            const interpolator = closestSample(3, 3, false);
            expect(getValue(c, 0, interpolator)).toEqual(100);
            expect(getValue(c, 1, interpolator)).toEqual(100);
            expect(getValue(c, 1.99999, interpolator)).toEqual(100);
            expect(getValue(c, 2, interpolator)).toEqual(300);
            expect(getValue(c, 3, interpolator)).toEqual(300);
            expect(getValue(c, 4, interpolator)).toEqual(300);
            expect(getValue(c, 5, interpolator)).toEqual(300);
            expect(getValue(c, 6, interpolator)).toEqual(300);
            expect(getValue(c, 7, interpolator)).toBeUndefined();
        });

        it('handle different forward backward degrees', () => {
            const c = {
                timestamps: [1, 3],
                datums: [100, 300]
            };
            const interpolator = closestSample(0, Infinity, false);
            expect(getValue(c, 0, interpolator)).toBeUndefined();
            expect(getValue(c, 1, interpolator)).toEqual(100);
            expect(getValue(c, 2, interpolator)).toEqual(100);
            expect(getValue(c, 3, interpolator)).toEqual(300);
            expect(getValue(c, 4, interpolator)).toEqual(300);
            expect(getValue(c, 9999, interpolator)).toEqual(300);
        });
    });

    describe('linear interpolation', () => {
        it('should lerp', () => {
            const x = lerp(1, 2, 0.5);
            expect(x).toEqual(1.5);
        });

        it('should lerp in reverse', () => {
            const x = lerp(2, 1, 0.5);
            expect(x).toEqual(1.5);
        });

        it('should lerp positions', () => {
            interface Position {
                x: number;
                y: number;
            }

            const c = new TimeSeriesCollection<Position>(locationInterpolator());

            c.addSample(1, { x: 1, y: 1 });
            c.addSample(2, { x: 2, y: 2 });

            const x = c.getValue(1.5);

            expect(x).toEqual({ x: 1.5, y: 1.5 });
        });
    });
});
