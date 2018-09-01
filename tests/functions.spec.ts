import {
    addSample,
    getValue,
    removeOutsideTimeFrame,
    removeTimeFrame,
    addSamples
} from '../src/functions';
import { noInterpolator } from '../src/interpolators';
import { TimeSeriesCollectionInterface } from '../src/collection';

describe('functions', () => {
    function empty<T = any>(): TimeSeriesCollectionInterface<T> {
        return {
            timestamps: [],
            datums: []
        };
    }

    describe('removeTimeFrame', () => {
        it('should remove from middle', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 2, 4);
            expect(c).toEqual({
                timestamps: [1, 5],
                datums: [1, 5]
            });
        });

        it('should remove from middle and keep closest samples', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 2, 4, true);
            expect(c).toEqual({
                timestamps: [1, 2, 4, 5],
                datums: [1, 2, 4, 5]
            });
        });

        it('should throw if an invalid time frame is provided', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            expect(() => removeTimeFrame(c, 1, 2)).not.toThrow();
            expect(() => removeTimeFrame(c, 2, 1)).toThrowError(/invalid/);
            expect(() => removeTimeFrame(c, undefined, 1)).toThrowError(/invalid/);
        });

        it('should remove from beginning', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 0, 2);
            expect(c).toEqual({
                timestamps: [3, 4, 5],
                datums: [3, 4, 5]
            });
        });

        it('should remove from beginning and keep closest samples', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 0, 2, true);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            });
        });

        it('should remove from beginning bigger range', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 0, 4, false);
            expect(c).toEqual({
                timestamps: [5],
                datums: [5]
            });
        });

        it('should remove from beginning bigger range and keep closest samples', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 0, 4, true);
            expect(c).toEqual({
                timestamps: [1, 4, 5],
                datums: [1, 4, 5]
            });
        });

        it('should removing a range with a size of 0 and remove only the match', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 3, 3);
            expect(c).toEqual({
                timestamps: [1, 2, 4, 5],
                datums: [1, 2, 4, 5]
            });
        });

        it('should remove a range with a size of 0 and remove only the match, unless keeping closest sample, which should remove nothing', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 3, 3, true);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            });
        });

        it('should removing a range with a size of 0 and remove nothing if there is no exact match', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 3.4, 3.4);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            });
        });

        it('should removing a range when to index does not match', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 3, 4.5);
            expect(c).toEqual({
                timestamps: [1, 2, 5],
                datums: [1, 2, 5]
            });
        });

        it('should removing a range when to index does not match and keep closest samples', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 3, 4.5, true);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            });
        });

        it('should removing a range when from index does not match', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 3.4, 5);
            expect(c).toEqual({
                timestamps: [1, 2, 3],
                datums: [1, 2, 3]
            });
        });

        it('should removing a range when from index does not match and keep closest samples', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 3.4, 5, true);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            });
        });
    });

    describe('removeOutsideTimeFrame', () => {
        it('should throw for a bad time frame', () => {
            const c = {
                timestamps: [],
                datums: []
            };
            expect(() => removeOutsideTimeFrame(c, 2, 1)).toThrowError(/invalid/);
            expect(() => removeOutsideTimeFrame(c, -1, undefined)).toThrowError(/invalid/);
        });

        it('should remove outside the middle', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, 2, 4);
            expect(c).toEqual({
                timestamps: [3],
                datums: [3]
            });
        });

        it('should removing a range with a size of 0 and remove everything', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, 3, 3);
            expect(c).toEqual({
                timestamps: [],
                datums: []
            });
        });

        it('should removing a range with a size of 0 and keep the closest matching sample', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, 3, 3, true);
            expect(c).toEqual({
                timestamps: [3],
                datums: [3]
            });
        });

        it('should removing a range with a size of 0 and keep the closet samples', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, 3.3, 3.3, true);
            expect(c).toEqual({
                timestamps: [3, 4],
                datums: [3, 4]
            });
        });

        it('should remove outside the start', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, -100, 3);
            expect(c).toEqual({
                timestamps: [1, 2],
                datums: [1, 2]
            });
        });

        it('should remove outside the start with explicit not keeping closest sample', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, -100, 3, false);
            expect(c).toEqual({
                timestamps: [1, 2],
                datums: [1, 2]
            });
        });

        it('should remove outside the end', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, 3, 3000);
            expect(c).toEqual({
                timestamps: [4, 5],
                datums: [4, 5]
            });
        });

        it('should remove outside all of it (remove nothing)', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, -Infinity, Infinity);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            });
        });

        it('should remove of a range not part of the collection', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, -Infinity, 2.5);
            expect(c).toEqual({
                timestamps: [1, 2],
                datums: [1, 2]
            });
        });

        it('should remove outside of a range with the end not part of the collection', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, 2, 3.5, false);
            expect(c).toEqual({
                timestamps: [3],
                datums: [3]
            });
        });

        it('should remove outside of a range with the end not part of the collection', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, 2, 3.5, true);
            expect(c).toEqual({
                timestamps: [2, 3, 4],
                datums: [2, 3, 4]
            });
        });

        it('should remove outside of a range of length 0 (remove everything)', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, 1, 1);
            expect(c).toEqual({
                timestamps: [],
                datums: []
            });
        });

        it('should remove outside of a range but and closest sample', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeOutsideTimeFrame(c, 2.5, 3.5, true);
            expect(c).toEqual({
                timestamps: [2, 3, 4],
                datums: [2, 3, 4]
            });
        });

        it('should remove outside of a range matching and keep closest sample', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5, 6, 7, 8],
                datums: [1, 2, 3, 4, 5, 6, 7, 8]
            };
            removeOutsideTimeFrame(c, 3, 6, true);
            expect(c).toEqual({
                timestamps: [3, 4, 5, 6],
                datums: [3, 4, 5, 6]
            });
        });

        it('should remove outside of a range from the start and keep closest sample', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5, 6, 7, 8],
                datums: [1, 2, 3, 4, 5, 6, 7, 8]
            };
            removeOutsideTimeFrame(c, -10, 4.5, true);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            });
        });

        it('should remove outside of a range from the end and keep closest sample', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5, 6, 7, 8],
                datums: [1, 2, 3, 4, 5, 6, 7, 8]
            };
            removeOutsideTimeFrame(c, 5, 11, true);
            expect(c).toEqual({
                timestamps: [5, 6, 7, 8],
                datums: [5, 6, 7, 8]
            });
        });
    });

    describe('addSample', () => {
        it('add a single sample', () => {
            const c = {
                timestamps: [],
                datums: []
            };
            addSample(c, 1, 1);
            expect(c).toEqual({
                timestamps: [1],
                datums: [1]
            });
        });

        it('should throw if adding with a bad timestamp', () => {
            const c = {
                timestamps: [],
                datums: []
            };
            expect(() => addSample(c, undefined, 0)).toThrowError(/invalid/);
            expect(() => addSample(c, NaN, 0)).toThrowError(/invalid/);
            expect(() => addSample(c, Number.POSITIVE_INFINITY, 0)).toThrowError(/invalid/);
        });

        it('add a few samples and keep order', () => {
            const c = {
                timestamps: [],
                datums: []
            };

            addSample(c, 1, 1);
            addSample(c, 200, 200);
            addSample(c, 150, 150);
            addSample(c, 400, 400);
            addSample(c, 2, 2);
            addSample(c, 350, 350);
            addSample(c, 1.432, 1.432);
            addSample(c, -2342, -2342);
            expect(c).toEqual({
                timestamps: [-2342, 1, 1.432, 2, 150, 200, 350, 400],
                datums: [-2342, 1, 1.432, 2, 150, 200, 350, 400]
            });
        });

        it('add allow overriding samples', () => {
            const c = {
                timestamps: [],
                datums: []
            };

            addSample(c, 1, 1);
            expect(c).toEqual({
                timestamps: [1],
                datums: [1]
            });

            addSample(c, 1, 2);
            expect(c).toEqual({
                timestamps: [1],
                datums: [2]
            });
        });
    });

    describe('addSamples', () => {
        it('should throw if different lengths', () => {
            const c = empty();
            expect(() => addSamples(c, [1], [])).toThrowError(/invalid/);
            expect(() => addSamples(c, [1], [10, 20])).toThrowError(/invalid/);
            expect(() => addSamples(c, {} as any, [])).toThrowError(/invalid/);
        });

        it('should and an empty list', () => {
            const c = empty();
            addSamples(c, [], []);
            expect(c).toEqual(empty());
        });

        it('should and a single sample', () => {
            const c = empty();
            addSamples(c, [1], [10]);
            expect(c).toEqual({
                timestamps: [1],
                datums: [10]
            });
        });

        it('should add a few samples', () => {
            const c = empty();
            addSamples(c, [1, 2, 3, 4], [10, 20, 30, 40]);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4],
                datums: [10, 20, 30, 40]
            });
        });

        it('should add a few samples and sort them', () => {
            const c = empty();
            addSamples(c, [1, 4, 3, 2], [10, 40, 30, 20]);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4],
                datums: [10, 20, 30, 40]
            });
        });

        it('should add a few samples and merge them', () => {
            const c = {
                timestamps: [2, 4, 6, 8],
                datums: [20, 40, 60, 80]
            };
            addSamples(c, [1, 3, 5, 7], [10, 30, 50, 70]);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5, 6, 7, 8],
                datums: [10, 20, 30, 40, 50, 60, 70, 80]
            });
        });

        it('should add a few samples, merge, sort, and override them', () => {
            const c = {
                timestamps: [2, 4, 5, 8],
                datums: [20, 40, 50, 80]
            };
            addSamples(c, [1, 3, 9, 7, 6, 9, 4], [10, 30, 90, 70, 60, 91, 41]);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                datums: [10, 20, 30, 41, 50, 60, 70, 80, 91]
            });
        });

        it('should add a few samples onto the end of a collection', () => {
            const c = {
                timestamps: [1, 2, 3],
                datums: [10, 20, 30]
            };
            addSamples(c, [6, 7, 8], [60, 70, 80]);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 6, 7, 8],
                datums: [10, 20, 30, 60, 70, 80]
            });
        });

        it('should add a few samples to the beginning of a collection', () => {
            const c = {
                timestamps: [6, 7, 8],
                datums: [60, 70, 80]
            };
            addSamples(c, [1, 2, 3], [10, 20, 30]);
            expect(c).toEqual({
                timestamps: [1, 2, 3, 6, 7, 8],
                datums: [10, 20, 30, 60, 70, 80]
            });
        });

        it('just trying to break it', () => {
            const c = {
                timestamps: [1, 2, 3, 7, 8, 9],
                datums: [10, 20, 30, 70, 80, 90]
            };
            addSamples(
                c,
                [1, 3, 5, 4, 6, 13, 15, 9, 14, 14],
                [11, 30, 50, 40, 60, 130, 150, 91, 140, 141]
            );
            expect(c).toEqual({
                timestamps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 15],
                datums: [11, 20, 30, 40, 50, 60, 70, 80, 91, 130, 141, 150]
            });
        });
    });

    describe('getValue', () => {
        it('should return undefined in an empty collection', () => {
            const c = {
                timestamps: [],
                datums: []
            };
            expect(getValue(c, 1, noInterpolator)).toBeUndefined();
        });

        it('should return a value for an exact match', () => {
            const c = {
                timestamps: [1, 2, 3],
                datums: ['1', '2', '3']
            };
            expect(getValue(c, 1, noInterpolator)).toEqual('1');
            expect(getValue(c, 2, noInterpolator)).toEqual('2');
        });

        it('should return undefined if no match', () => {
            const c = {
                timestamps: [1, 2, 3],
                datums: [1, 2, 3]
            };
            expect(getValue(c, 4, noInterpolator)).toBeUndefined();
            expect(getValue(c, 1.2, noInterpolator)).toBeUndefined();
            expect(getValue(c, -1, noInterpolator)).toBeUndefined();
        });
    });
});
