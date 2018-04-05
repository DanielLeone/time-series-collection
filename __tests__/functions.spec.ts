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
    });

    describe('removeOutsideTimeFrame', () => {
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
    });

    describe('addPoint', () => {
        it('add a single point', () => {
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

        it('add a few points and keep order', () => {
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

        it('add allow overriding points', () => {
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
