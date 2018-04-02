import {
    addPoint,
    getValue,
    noInterpolator,
    removeOutsideTimeFrame,
    removeTimeFrame,
    staticForwardHoldInterpolatorFactory,
    TimeSeriesCollection
} from '../src/index';

describe('time series collection', () => {
    it('should clarify some assumptions about numbers is javascript', () => {
        expect(Infinity > -Infinity).toBeTruthy();
        expect(Infinity === Infinity).toBeTruthy();
        expect(-Infinity != Infinity).toBeTruthy();
        expect(Infinity === Number.POSITIVE_INFINITY).toBeTruthy();
        expect(-Infinity === Number.NEGATIVE_INFINITY).toBeTruthy();
        expect(Number.isFinite(Infinity)).toBeFalsy();
        expect(Number.isFinite(0)).toBeTruthy();
        expect(Number.isFinite(-1)).toBeTruthy();
        expect(Number.isFinite(-1.34232)).toBeTruthy();
    });

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
                addPoint(c, 1, 1);
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

                addPoint(c, 1, 1);
                addPoint(c, 200, 200);
                addPoint(c, 150, 150);
                addPoint(c, 400, 400);
                addPoint(c, 2, 2);
                addPoint(c, 350, 350);
                addPoint(c, 1.432, 1.432);
                addPoint(c, -2342, -2342);
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

                addPoint(c, 1, 1);
                expect(c).toEqual({
                    timestamps: [1],
                    datums: [1]
                });

                addPoint(c, 1, 2);
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

    describe('TimeSeriesCollection class instance', () => {
        it('should add, get and remove points from a collection', () => {
            const c = new TimeSeriesCollection<string>();

            c.addPoint(100, 'hi');
            c.addPoint(200, 'ho');

            expect(c.getValue(100)).toEqual('hi');
            expect(c.getValue(200)).toEqual('ho');

            c.removeTimeFrame(0, 100);

            expect(c.getValue(100)).toBeUndefined();
            expect(c.getValue(200)).toEqual('ho');

            c.addPoint(300, 'he');
            c.addPoint(400, 'hum');

            expect(c.getValue(100)).toBeUndefined();
            expect(c.getValue(200)).toEqual('ho');
            expect(c.getValue(300)).toEqual('he');
            expect(c.getValue(400)).toEqual('hum');
        });
    });

    describe('interpolator', () => {
        describe('static hold interpolator', () => {
            it('should hold the value for the length inclusive', () => {
                const c = {
                    timestamps: [1, 2, 3],
                    datums: [1, 2, 3]
                };
                const interpolator = staticForwardHoldInterpolatorFactory(3);
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
                const interpolator = staticForwardHoldInterpolatorFactory(3);
                expect(getValue(c, -1, interpolator)).toBeUndefined();
                expect(getValue(c, 0, interpolator)).toBeUndefined();
                expect(getValue(c, 1, interpolator)).toEqual(1);
                expect(getValue(c, 2, interpolator)).toEqual(1);
                expect(getValue(c, 3, interpolator)).toEqual(1);
                expect(getValue(c, 4, interpolator)).toEqual(1);
                expect(getValue(c, 5, interpolator)).toBeUndefined();
            });
        });
    });
});
