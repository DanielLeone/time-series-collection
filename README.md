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

// always retrieve the closes sample
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
