import { closestSample, TimeSeriesCollection } from '../node_modules/time-series-collection/build/index';

function generateTimestamps(count: number, secondsApart: number) {
    const first = 0;
    const stamps = [];
    while (count--) {
        stamps.unshift(first + count * secondsApart);
    }
    return stamps;
}

function generateWave(count: number) {
    const amplitude = 40;
    const frequency = 20;
    const height = 1000;
    const wave = [];
    let x = 0;
    let y = 0;
    while (x < count) {
        y = height / 2 + amplitude * Math.sin(x / frequency);
        wave.push(y);
        x++;
    }
    return wave;
}

function generateRandomTimestamps(count: number, min, max) {
    const stamps = [];
    while (count--) {
        stamps.push(Math.floor((Math.random() * max - min + 1) + min));
    }
    return stamps;
}


class EventRegistry {
    private _listeners: Set<Function>;

    constructor() {
        this._listeners = new Set();
    }

    addEventListener(fn: (...args: any[]) => void) {
        this._listeners.add(fn);
        return () => {
            this._listeners.delete(fn)
        }
    }

    fire(...args: any[]) {
        this._listeners.forEach(fn => fn(...args));
    }
}

class Timeline {
    private time: number;
    private event: EventRegistry = new EventRegistry();

    constructor(time: number = 0) {
        this.goToTime(time);
    }

    goToTime(time: number) {
        this.time = time;
        this.event.fire(this.time);
    }

    get currentTime() {
        return this.time;
    }

    onChange(fn: (time: number) => void) {
        return this.event.addEventListener(fn);
    }
}

interface Asset {
    id: string | number;
    collection: TimeSeriesCollection<number>
}

class AssetManager {
    private event: EventRegistry = new EventRegistry();
    public assets: Array<Asset> = [];
    private timeline: Timeline;
    private nextId: number;

    constructor(timeline: Timeline) {
        this.timeline = timeline;
        this.nextId = 1;
    }

    addAssets(count: number) {
        while (count--) {
            this.assets.push({
                id: this.nextId++,
                collection: new TimeSeriesCollection<number>(closestSample(10, 10))
            });
        }
        this.event.fire(this.assets);
    }

    removeAssets(count: number) {
        this.assets.splice(0, count);
        this.event.fire(this.assets);
    }

    addSamples(count: number) {
        const timestamps = generateTimestamps(count, 10);
        const wave = generateWave(count);
        this.assets.forEach(asset => {
            timestamps.forEach((t, i) => {
                asset.collection.addSample(t, wave[i])
            });
        });
    }

    onChange(fn: (assets: Array<Asset>) => void) {
        return this.event.addEventListener(fn);
    }
}


class TimelineController {
    public timeline: Timeline;
    private _interval: number;

    constructor(timeline: Timeline) {
        this.timeline = timeline;
    }

    private reset() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    }

    play() {
        this.reset();
        this._interval = setInterval(() => {
            this.timeline.goToTime(this.timeline.currentTime + 1);
        }, 1);
    }

    pause() {
        this.reset();
    }

    rewind() {
        this.reset();
        this._interval = setInterval(() => {
            this.timeline.goToTime(this.timeline.currentTime - 1);
        }, 1);
    }

    jumpAround() {
        this.reset();
        this._interval = setInterval(() => {
            const time = Math.floor(Math.random() * 1000);
            this.timeline.goToTime(time);
        }, 1);
    }
}

class Ctrl {
    public timelineCtrl: TimelineController;
    public assetManager: AssetManager;

    constructor(timelineCtrl: TimelineController, assetManager: AssetManager) {
        this.timelineCtrl = timelineCtrl;
        this.assetManager = assetManager;
    }

    addSamples() {
        this.assetManager.addSamples(1000);
    }

    addAssets() {
        this.assetManager.addAssets(1000);
    }

    removeAssets() {
        this.assetManager.removeAssets(1000);
    }

    jumpAround() {
        this.timelineCtrl.jumpAround()
    }

    play() {
        this.timelineCtrl.play();
    }

    pause() {
        this.timelineCtrl.pause();
    }

    rewind() {
        this.timelineCtrl.rewind();
    }

}

function delay(ms: number = 0) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}

const time = document.createElement('div');
time.id = 'timeline';
document.body.appendChild(time);

function collectCurrentValues(ctrl: Ctrl) {
    return () => {
        let sum = 0;
        ctrl.assetManager.assets.forEach(asset => {
            sum += asset.collection.getValue(ctrl.timelineCtrl.timeline.currentTime);
        });
    }
}

const benchmarks = [
    {
        name: 'should move forward through time for 1000 seconds for 1000 assets with 5000 samples each',
        setup: (ctrl: Ctrl) => {
            ctrl.assetManager.addAssets(1000);
            ctrl.assetManager.addSamples(5000);
            ctrl.timelineCtrl.timeline.onChange(collectCurrentValues(ctrl));
        },
        fn: (ctrl: Ctrl) => {
            const timeline = ctrl.timelineCtrl.timeline;
            timeline.goToTime(0);
            while (timeline.currentTime < 1000) {
                timeline.goToTime(timeline.currentTime + 1);
            }
        }
    },
    {
        name: 'should move backward through time for 1000 seconds for 1000 assets with 5000 samples each',
        setup: (ctrl: Ctrl) => {
            ctrl.assetManager.addAssets(1000);
            ctrl.assetManager.addSamples(5000);
            ctrl.timelineCtrl.timeline.onChange(collectCurrentValues(ctrl));
        },
        fn: (ctrl: Ctrl) => {
            const timeline = ctrl.timelineCtrl.timeline;
            timeline.goToTime(1000);
            while (timeline.currentTime > 0) {
                timeline.goToTime(timeline.currentTime - 1);
            }
        }
    },
    {
        name: 'should move randomly through time for 1000 seconds for 1000 assets with 5000 samples each',
        setup: (ctrl: Ctrl) => {
            ctrl.assetManager.addAssets(1000);
            ctrl.assetManager.addSamples(5000);
            ctrl.timelineCtrl.timeline.onChange(collectCurrentValues(ctrl));
        },
        fn: (ctrl: Ctrl) => {
            const timeline = ctrl.timelineCtrl.timeline;
            let count = 1000;
            timeline.goToTime(count);
            while (count--) {
                timeline.goToTime(Math.floor(Math.random() * 1000));
            }
        }
    },
    {
        name: 'should add samples 5000 samples to 1000 assets',
        setup: (ctrl: Ctrl) => {
            ctrl.assetManager.addAssets(1000);
        },
        fn: (ctrl: Ctrl) => {
            ctrl.assetManager.addSamples(5000);
        }
    },
    {
        name: 'removing samples in 10 second chunks from 1000 assets',
        setup: (ctrl: Ctrl) => {
            ctrl.assetManager.addAssets(1000);
            ctrl.assetManager.addSamples(1000);
        },
        fn: (ctrl: Ctrl) => {
            let removing = true;
            let from = 0;
            while (removing) {
                ctrl.assetManager.assets.forEach(asset => {
                    removing = false;
                    if (asset.collection.size()) {
                        removing = true;
                        asset.collection.removeTimeFrame(from, from + 10);
                    }
                });
                from += 10;
            }
        }
    }
];

function shuffle(array: Array<any>) {
    let count = array.length;
    let rand;
    let temp;
    while (count) {
        rand = Math.random() * count-- | 0;
        temp = array[count];
        array[count] = array[rand];
        array[rand] = temp
    }
}

async function runTests() {
    let count = 0;
    while (++count <= 3) {

        // Randomize test order
        const tests = benchmarks.slice(0);
        shuffle(tests);

        await Promise.all(tests.map(async benchmark => {
            const name = `${benchmark.name} #${count}`;
            time.textContent = `running benchmark: ${name}`;

            await delay();

            const timeline = new Timeline(0);
            const timelineCtrl = new TimelineController(timeline);
            const assetManager = new AssetManager(timeline);
            const ctrl = new Ctrl(timelineCtrl, assetManager);

            benchmark.setup(ctrl);

            await delay();

            window.performance.mark('start');
            benchmark.fn(ctrl);
            window.performance.mark('stop');
            window.performance.measure(name, 'start', 'stop');

            await delay();
        }));
    }
    const items = window.performance.getEntriesByType('measure');
    time.textContent = 'done';
    console.log(items);
    console.info('benchmark_done');
}

const btn = document.createElement('button');
btn.textContent = 'Run tests';
btn.id = 'start-tests';
btn.onclick = () => {
    runTests();
};
document.body.appendChild(btn);

delay(100).then(() => {
    console.info('benchmark_ready');
});

