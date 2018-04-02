import { staticForwardHoldInterpolatorFactory, TimeSeriesCollection } from '../src/index';

describe('time series collection', () => {
    it('should add, get and remove points', () => {
        const c = new TimeSeriesCollection<string>();

        c.addPoint(100, 'hi');
        c.addPoint(200, 'ho');

        expect(c.getValue(100)).toEqual('hi');
        expect(c.getValue(200)).toEqual('ho');

        c.removeTimeFrame(0, 100);

        expect(c.getValue(100)).toBeUndefined();
        expect(c.getValue(200)).toEqual('ho');
    });

    it('static hold interpolator', () => {
        const c = new TimeSeriesCollection<number>(staticForwardHoldInterpolatorFactory(10));

        c.addPoint(100, 10);

        expect(c.getValue(99)).toEqual(undefined);
        expect(c.getValue(100)).toEqual(10);
        expect(c.getValue(101)).toEqual(10);
        expect(c.getValue(110)).toEqual(10);
        expect(c.getValue(111)).toEqual(undefined);
    });
});
