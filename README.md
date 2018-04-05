# Time Series Collection

A tiny, blazing fast, time series collection with zero dependencies! (did I get that right?)

## Getting Started

```typescript
import { TimeSeriesCollection } from 'time-series-collection';

const collection = new TimeSeriesCollection<number>();

collection.addSample(unixTime, 50);
collection.addSample(anotherUnixTime, 100);
collection.addSample(aDifferentUnixTime, 150);

collection.getValue(anotherUnixTime);  // 100
```

### Functional API
All the methods of the class are also exposed as functions (note that these functions mutate the collection for performance and memory reasons)

```typescript
import { TimeSeriesCollectionInterface, addSample, removeTimeFrame } from 'time-series-collection';

const collection: TimeSeriesCollectionInterface<number> = {
    timestamps: [],
    datums: []
};

addSample(collection, unixTime, 42);
addSample(collection, anotherUnixTime, 38);

getValue(collection, unixTime);  // 42
```

### Interpolation Algorithms
An interpolator function is used to produce a value when there's no exact match.
A few interpolator functions are provided, but you can write your own too!

```typescript
const interpolatorFn = closestSample();
const collection = new TimeSeriesCollection<number>(interpolatorFn);

collection.addSample(100, 17);

collection.getValue(105);  // 17
collection.getValue(2403);  // 17
```

