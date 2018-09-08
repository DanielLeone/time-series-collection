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
        it('get samples and return a shallow copy', () => {
            const c = new TimeSeriesCollection();
            c.addSamples([1, 2, 3], [{ name: 'avocado' }, { name: 'banana' }, { name: 'carrot' }]);

            expect(c.size()).toEqual(3);
            const samples = c.getAllSamples();
            const samplesAgain = c.getAllSamples();
            expect(samples.map(s => s.name)).toEqual(['avocado', 'banana', 'carrot']);
            // should be a shallow copy
            expect(samples).not.toBe(samplesAgain);
            expect(samples).toEqual(samplesAgain);
            expect(samples[0]).toBe(samples[0]);
        });

        it('should add, get and remove points from a collection', () => {
            const c = new TimeSeriesCollection<string>();

            expect(c.size()).toEqual(0);

            c.addSample(100, 'hi');
            c.addSample(200, 'ho');

            expect(c.size()).toEqual(2);

            expect(c.getValue(100)).toEqual('hi');
            expect(c.getValue(200)).toEqual('ho');

            c.removeTimeFrame(0, 100);

            expect(c.getValue(100)).toBeUndefined();
            expect(c.getValue(200)).toEqual('ho');

            expect(c.size()).toEqual(1);

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

            expect(c.size()).toEqual(1);

            c.addSamples([1, 2, 3], ['11', '22', '33']);
            c.addSamples([1], ['111']);
            c.addSamples([], []);

            expect(c.getValue(1)).toBe('111');
            expect(c.getValue(2)).toBe('22');
            expect(c.getValue(3)).toBe('33');
            expect(c.getValue(200)).toBe('ho');

            expect(c.size()).toEqual(4);
        });
    });
});
