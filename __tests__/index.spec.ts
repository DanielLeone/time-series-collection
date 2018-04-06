import * as index from '../src/index';
import { TimeSeriesCollection } from '../src/collection';

describe('index', () => {
    it('should not import utils', () => {
        expect(index.TimeSeriesCollection).toEqual(TimeSeriesCollection);
        expect((index as any).binarySearch).toBeUndefined();
    });
});
