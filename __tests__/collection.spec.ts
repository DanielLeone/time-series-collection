import { TimeSeriesCollection } from '../src/collection';

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

    describe('TimeSeriesCollection class instance', () => {
        it('should add, get and remove points from a collection', () => {
            const c = new TimeSeriesCollection<string>();

            c.addSample(100, 'hi');
            c.addSample(200, 'ho');

            expect(c.getValue(100)).toEqual('hi');
            expect(c.getValue(200)).toEqual('ho');

            c.removeTimeFrame(0, 100);

            expect(c.getValue(100)).toBeUndefined();
            expect(c.getValue(200)).toEqual('ho');

            c.addSample(300, 'he');
            c.addSample(400, 'hum');

            expect(c.getValue(100)).toBeUndefined();
            expect(c.getValue(200)).toEqual('ho');
            expect(c.getValue(300)).toEqual('he');
            expect(c.getValue(400)).toEqual('hum');

            c.removeOutsideTimeFrame(0, 300);

            expect(c.getValue(100)).toBeUndefined();
            expect(c.getValue(200)).toBe('ho');
            expect(c.getValue(300)).toBeUndefined();
            expect(c.getValue(400)).toBeUndefined();
        });
    });
});
