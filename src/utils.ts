export function isNumber(val: number): boolean {
    return Number.isFinite(val);
}

export function isValidTimestamp(timestamp: number): boolean {
    return isNumber(timestamp);
}

export function isNumberOrInfinity(val: number): boolean {
    return isNumber(val) || val === Number.POSITIVE_INFINITY || val === Number.NEGATIVE_INFINITY;
}

export function isValidTimeRange(fromTimestamp: number, toTimestamp: number): boolean {
    return (
        isNumberOrInfinity(fromTimestamp) &&
        isNumberOrInfinity(toTimestamp) &&
        toTimestamp >= fromTimestamp
    );
}

/**
 * Binary searches through list of numbers
 * @param array
 * @param target
 * @returns index of the first item in the array or the bitwise compliment of where it should be inserted to maintain order
 */
export function binarySearch(array: Array<number>, target: number): number {
    let index;
    let comparison;
    let low = 0;
    let high = array.length - 1;
    while (low <= high) {
        index = ~~((low + high) / 2);
        comparison = array[index] - target;
        if (comparison < 0) {
            low = index + 1;
            continue;
        }
        if (comparison > 0) {
            high = index - 1;
            continue;
        }
        return index;
    }
    return ~(high + 1);
}
