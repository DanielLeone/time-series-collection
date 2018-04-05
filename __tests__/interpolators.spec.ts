import { getValue } from '../src/functions';
import { closestPastSample, closestSample } from '../src/interpolators';

describe('interpolators', () => {
    describe('closest past point ', () => {
        it('should hold the value for the length inclusive', () => {
            const c = {
                timestamps: [1, 2, 3],
                datums: [1, 2, 3]
            };
            const interpolator = closestPastSample(3);
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
});
