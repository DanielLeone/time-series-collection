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
 * Binary searches through list of unix timestamps
 * @param timestamps
 * @param timestamp
 * @returns index of the first item in the array or the bitwise number of where it should be inserted to maintain order
 */
export function binarySearch(timestamps: Array<number>, timestamp: number): number {
    let i;
    let comparison;
    let low = 0;
    let high = timestamps.length - 1;
    while (low <= high) {
        i = ~~((low + high) / 2);
        comparison = timestamps[i] - timestamp;
        if (comparison < 0) {
            low = i + 1;
            continue;
        }
        if (comparison > 0) {
            high = i - 1;
            continue;
        }
        return i;
    }
    return ~(high + 1);
}
