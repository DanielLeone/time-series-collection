# time series collection

a tiny, blazing fast, time series collection library with zero dependencies! (did I get that right?)


### basic usage

```typescript
import { TimeSeriesCollection } from 'time-series-collection';

const collection = new TimeSeriesCollection<number>();

collection.addPoint(unixTime, 50);
collection.addPoint(unixTime + 1, 100);
collection.addPoint(unixTime + 2, 150);

collection.getValue(unixTime);  // 50
collection.getValue(unixTime + 2);  // 150
```

### functional API
all the methods of the class are also exposed as functions (note that these functions mutate the collection for performance and memory reasons)

```typescript
import { TimeSeriesCollectionInterface, addPoint, removeTimeFrame } from 'time-series-collection';

const collection: TimeSeriesCollectionInterface<number> = {
    timestamps: [],
    datums: []
};

addPoint(collection, unixNow, 36);
addPoint(collection, unixNow + 1, 38);
removeTimeFrame(collection, unixNow -1, unixNow + 1);
```

### interpolator functions
An interpolator function is used to produce a value when there's no exact match.
A few interpolator functions are provided, but you can write your own too!

```typescript
const interpolatorFn = staticForwardHoldInterpolatorFactory(10);
const collection = new TimeSeriesCollection<number>(interpolatorFn);

collection.addPoint(100, 1);
const value = collection.getValue(101);  // 1
const value = collection.getValue(111);  // undefined
```

#### this library is still a work in progress! :)