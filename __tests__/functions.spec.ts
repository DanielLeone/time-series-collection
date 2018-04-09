import { addSample, getValue, removeOutsideTimeFrame, removeTimeFrame } from '../src/functions';
import { noInterpolator } from '../src/interpolators';

describe('functions', () => {
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

        it('should remove from beginning bigger range', () => {
            const c = {
                timestamps: [1, 2, 3, 4, 5],
                datums: [1, 2, 3, 4, 5]
            };
            removeTimeFrame(c, 0, 4);
            expect(c).toEqual({
                timestamps: [5],
                datums: [5]
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
        it('add a single samples', () => {
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
