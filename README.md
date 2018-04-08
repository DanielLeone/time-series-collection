# Time Series Collection

[![Build Status](https://travis-ci.org/DanielLeone/time-series-collection.svg?branch=master)](https://travis-ci.org/DanielLeone/time-series-collection)
[![Coverage Status](https://coveralls.io/repos/github/DanielLeone/time-series-collection/badge.svg?branch=master)](https://coveralls.io/github/DanielLeone/time-series-collection?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/DanielLeone/time-series-collection.svg)](https://greenkeeper.io/)

A tiny, blazing fast, time series collection with zero dependencies! (did I get that right?)

## Getting Started

```typescript
import { TimeSeriesCollection } from 'time-series-collection';

// instantiate a new collection
const collection = new TimeSeriesCollection<number>();

// add some samples in any order
collection.addSample(unixTime, 50);
collection.addSample(anotherUnixTime, 100);
collection.addSample(aDifferentUnixTime, 150);

// retrieve a value
collection.getValue(anotherUnixTime);  // 100
```

### Functional API
All the methods of the class are also exposed as functions (note that these functions mutate the collection for performance and memory reasons)

```typescript
import { TimeSeriesCollectionInterface, addSample, removeTimeFrame } from 'time-series-collection';

// create a collection
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

### Interpolation Algorithms
An interpolator function is used to produce a value when there's no exact match.
A few interpolator functions are provided, but you can write your own too!

```typescript
import { TimeSeriesCollection, closestSample } from 'time-series-collection';

// create an interpolator
const interpolatorFn = closestSample();

// instantiate a collection with the interpolator
const collection = new TimeSeriesCollection<number>(interpolatorFn);

// add some samples
collection.addSample(100, 17);

// retrieve an interpolated value
collection.getValue(105);  // 17
collection.getValue(2403);  // 17
```
