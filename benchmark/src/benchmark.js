const puppeteer = require('puppeteer');
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const port = 9093;


async function launchServer() {
    const server = http.createServer((request, response) => {
        console.log('receiving request');
        const uri = `build/` + url.parse(request.url).pathname;
        let filename = path.join(process.cwd(), uri);
        const exists = fs.existsSync(filename);
        if (!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }

        fs.readFile(filename, "binary", (err, file) => {
            if (err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });

    return new Promise((resolve) => {
        server.listen(port, () => {
            console.log('server ready');
            resolve();
        });
    })
}

async function delay(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function traceTests(page) {
    let resolve, reject;
    const p = new Promise(((res, rej) => {
        resolve = res;
        reject = rej;
    }));
    page.on('console', async msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'info') {
            if (text === 'benchmark_ready') {
                await delay(200);
                console.log('starting trace');
                await page.tracing.start({path: './trace.json'});
                await delay(200);
                await page.tap('#start-tests');
            }
            else if (text === 'benchmark_done') {
                await delay(200);
                console.log('stopping trace');
                const buffer = await page.tracing.stop();
                const trace = JSON.parse(buffer);
                resolve(trace);
            }
        }
    });

    console.log('navigating to page');
    await page.goto(`http://localhost:${port}`, {waitUntil: ['load']});

    return p;
}

async function run() {

    console.log('launching server');
    await launchServer();

    console.log('launching browser');
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        const trace = await traceTests(page);
        const results = analyzeTrace(trace);
        console.log(results);
    } finally {
        console.log('done');
        await browser.close();
    }
}

run()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

function formatMicroSeconds(us) {
    if (us > 10000000) {
        return `${us / 1000000} sec`
    }
    if (us > 1000) {
        return `${us / 1000} ms`
    }
    return `${us} μs`;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
        return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function toPairs(events) {
    const pairs = events.reduce((pairs, event) => {
        if (event.ph === 'b' || event.ph === 'B') {
            pairs.push([event]);
        } else if (event.ph === 'e' || event.ph === 'E') {
            if (!!event.id) {
                const pair = pairs.find(p => p[0].id === event.id);
                if (!pair) {
                    throw new Error(`Can't find matching begin event for end event with id ${event.id}`);
                }
                pair.push(event);
            } else {
                // find the last begin event with the same pid and tid (process id and thread id)
                const pair = pairs.find(p => p.length === 1 && p[0].pid === event.pid && p[0].tid === event.tid);
                if (!pair) {
                    throw new Error(`Can't find matching begin event`);
                }
                pair.push(event);
            }
        }
        return pairs;
    }, []);

    return pairs.filter(p => p.length === 2);
}

function sum(values) {
    return values.reduce((sum, val) => sum + val, 0);
}

function analyzeTrace(trace) {
    if (!trace || !trace.traceEvents) {
        throw new Error('invalid trace object');
    }
    const userTimingEvents = trace.traceEvents.filter(event => event.cat === "blink.user_timing");
    const pairs = toPairs(userTimingEvents);
    const timings = pairs.map(pair => {
        const [begin, end] = pair;
        const gcEvents = trace.traceEvents.filter(e => e.ts > begin.ts && e.ts < end.ts && (e.name === 'MinorGC' || e.name === "MajorGC"));
        const gcPairs = toPairs(gcEvents);
        const gcCount = gcPairs.length;
        const gcTimes = gcPairs.map(([b, e]) => e.ts - b.ts);
        const gcSizes = gcPairs.map(([b, e]) => b.args.usedHeapSizeBefore - e.args.usedHeapSizeAfter);
        const gcTotalTime = sum(gcTimes);
        const gcTotalSize = sum(gcSizes);
        return {
            name: begin.name,
            totalTime: end.ts - begin.ts,
            format: formatMicroSeconds(end.ts - begin.ts),
            gcCount,
            gcTotalTime: formatMicroSeconds(gcTotalTime),
            gcTotalSize: formatBytes(gcTotalSize),
        }
    });

    return {
        v8: trace.metadata['v8-version'],
        cpu: trace.metadata['cpu-brand'],
        ram: trace.metadata['physical-memory'],
        results: timings
    };
}