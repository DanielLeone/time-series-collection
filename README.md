# Time Series Collection

[![npm Version](https://img.shields.io/npm/v/time-series-collection.svg)](https://badge.fury.io/js/time-series-collection)
[![Build Status](https://travis-ci.org/DanielLeone/time-series-collection.svg?branch=master)](https://travis-ci.org/DanielLeone/time-series-collection)
[![Coverage Status](https://coveralls.io/repos/github/DanielLeone/time-series-collection/badge.svg?branch=master)](https://coveralls.io/github/DanielLeone/time-series-collection?branch=master)

A tiny, blazing fast, time series collection with zero dependencies! (did I get that right?)

This library uses unix timestamps (the number of seconds since the epoch)

## Getting Started

```typescript
import { TimeSeriesCollection } from 'time-series-collection';

// instantiate a new collection
const collection = new TimeSeriesCollection<number>();

// you put some samples in
collection.addSample(unixTime, 50);
collection.addSample(anotherUnixTime, 100);
collection.addSample(aDifferentUnixTime, 150);

// and you get some samples out
collection.getValue(anotherUnixTime);  // 100
```

### Interpolation Algorithms
An interpolator function is used to produce a value when there's no exact match.
A few interpolator functions are provided, but you can write your own too!

```typescript
import { TimeSeriesCollection, closestSample } from 'time-series-collection';

// create a simple interpolator
const interpolatorFn = closestSample();

// instantiate a collection with the interpolator
const collection = new TimeSeriesCollection<number>(interpolatorFn);

// add some samples
collection.addSample(100, 17);
collection.addSample(200, 23);

// always retrieve the closest sample
collection.getValue(0);  // 17
collection.getValue(105);  // 17
collection.getValue(2403);  // 23
```

### Functional API
All the methods of the class are also exposed as functions (although currently these functions do mutate the collection for memory efficiency and performance)

```typescript
import { TimeSeriesCollectionInterface, addSample, removeTimeFrame } from 'time-series-collection';

// create a collection data structure
const collection: TimeSeriesCollectionInterface<number> = {
    timestamps: [],
    datums: []
};

// add some samples
addSample(collection, unixTime, 42);
addSample(collection, anotherUnixTime, 38);

// retrieve a value
getValue(collection, unixTime);  // 42
```



## Documentation

### Class `TimeSeriesCollection`


#### `constructor<T>(interpolator)`

Creates a new instance of a TimeSeriesCollection

| Parameter | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| interpolator | `Interpolator`  | The interpolator to use when getting a value


#### `addSample(timestamp, data)`

Adds a sample to the collection

| Parameter | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| timestamp | `number`  | The unix timestamp for this sample
| data | `T`  | The data for this sample | &nbsp; |


#### `addSamples(timestamps, datums)`

Adds a list of samples to the collection.
The samples do not have to be sorted, but if they are sorted, they will be inserted much faster.

| Parameter | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| timestamps | `Array<number>`  | The list of timestamps to insert
| datums | `Array<T>`  | The matching order list of datums to insert | &nbsp; |


#### `removeTimeFrame(fromTimestampInclusive, toTimestampInclusive, keepClosestSamples)`

Removes all samples inside the specified time frame

| Parameter | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| fromTimestampInclusive | `number`  | removes all samples after or at this unix time| &nbsp; |
| toTimestampInclusive | `number`  | removes all samples before or at this unix time | &nbsp; |
| keepClosestSamples | `boolean`  | whether to keep a single sample of either side of the time frames to remove. | &nbsp; |


#### `removeOutsideTimeFrame(fromTimestampInclusive, toTimestampInclusive, keepClosestSamples)`

Removes all samples outside of the specified time frame

| Parameter | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| fromTimestampInclusive | `number`  | removes all samples before or at this unix time | &nbsp; |
| toTimestampInclusive | `number`  | removes all samples after or at this unix time | &nbsp; |
| keepClosestSamples | `boolean`  | whether to keep a single sample of either side of the time frames to remove. | &nbsp; |


### Interpolators

#### `closestSample(maxForwardDistance, maxBackwardsDistance, favourPastSamples)`

An interpolator factory function which picks the closest sample, given some constraints

| Parameter | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| maxForwardDistance | `number`  | Ignore samples more than this many seconds before the target timestamp (inclusive) | &nbsp; |
| maxBackwardsDistance | `number`  | Ignore samples more than this many seconds after the target timestamp (inclusive) | &nbsp; |
| favourPastSamples | `boolean`  | Whether to favour past samples of future samples in the case of an exact match | &nbsp; |


#### `closestFutureSample(maxDistance)`

An interpolator factory function which picks the closest sample in the future

| Parameter | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| maxDistance | `number`  | Ignore samples more than this many seconds after the target timestamp (inclusive) | &nbsp; |


#### `closestPastSample(maxDistance)`

An interpolator factory function which picks the closest sample from the past

| Parameter | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| maxDistance | `number`  | Ignore samples more than this many seconds before the target timestamp (inclusive) | &nbsp; |
