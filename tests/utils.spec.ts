import {
    binarySearch,
    isNumber,
    isNumberOrInfinity,
    isValidTimeRange,
    isValidTimestamp
} from '../src/utils';

describe('utils', () => {
    describe('binary search', () => {
        it('happy path', () => {
            const input = [1, 2, 3, 4, 5, 6];
            expect(binarySearch(input, 4)).toEqual(3);
            expect(binarySearch(input, 1)).toEqual(0);
            expect(binarySearch(input, 6)).toEqual(5);
            expect(binarySearch(input, 0)).toEqual(~0);
            expect(binarySearch(input, -1234)).toEqual(~0);
            expect(binarySearch(input, 1.1)).toEqual(~1);
        });

        it('empty case', () => {
            const input = [];
            expect(binarySearch(input, 123)).toEqual(~0);
            expect(binarySearch(input, -132)).toEqual(~0);
            expect(binarySearch(input, 0)).toEqual(~0);
        });
    });

    describe('others', () => {
        it('isNumber', () => {
            expect(isNumber(0)).toBeTruthy();
            expect(isNumber(-1)).toBeTruthy();
            expect(isNumber(-1.439432)).toBeTruthy();
            expect(isNumber(1.4343222)).toBeTruthy();
            expect(isNumber(~432)).toBeTruthy();

            expect(isNumber('' as any)).toBeFalsy();
            expect(isNumber('hello' as any)).toBeFalsy();
            expect(isNumber(undefined)).toBeFalsy();
            expect(isNumber(null)).toBeFalsy();
            expect(isNumber(Infinity)).toBeFalsy();
            expect(isNumber(Number.POSITIVE_INFINITY)).toBeFalsy();
            expect(isNumber(Number.NEGATIVE_INFINITY)).toBeFalsy();
            expect(isNumber(NaN)).toBeFalsy();
        });

        it('isNumberOrInfinity', () => {
            expect(isNumberOrInfinity(1)).toBeTruthy();
            expect(isNumberOrInfinity(-1)).toBeTruthy();
            expect(isNumberOrInfinity(Infinity)).toBeTruthy();
            expect(isNumberOrInfinity(Number.POSITIVE_INFINITY)).toBeTruthy();
            expect(isNumberOrInfinity(Number.NEGATIVE_INFINITY)).toBeTruthy();

            expect(isNumberOrInfinity(undefined)).toBeFalsy();
            expect(isNumberOrInfinity(NaN)).toBeFalsy();
            expect(isNumberOrInfinity(null)).toBeFalsy();
        });

        it('isValidTimestamp', () => {
            expect(isValidTimestamp(123)).toBeTruthy();
            expect(isValidTimestamp(0.11)).toBeTruthy();
            expect(isValidTimestamp(-0.11)).toBeTruthy();
            expect(isValidTimestamp(1500000000)).toBeTruthy();

            expect(isValidTimestamp(undefined)).toBeFalsy();
            expect(isValidTimestamp(NaN)).toBeFalsy();
        });

        it('isValidTimeRange', () => {
            expect(isValidTimeRange(0, 1)).toBeTruthy();
            expect(isValidTimeRange(-1000, 1000)).toBeTruthy();
            expect(isValidTimeRange(-1000, 0)).toBeTruthy();
            expect(isValidTimeRange(10, 10)).toBeTruthy();

            expect(isValidTimeRange(10, 9)).toBeFalsy();
            expect(isValidTimeRange(10, -10)).toBeFalsy();
        });
    });
});
