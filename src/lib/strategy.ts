import { DEFAULT_REQUEST_TIMEOUT, LATENCY_ERROR_CORRECTION, LATENCY_ERROR_MULTIPLIER, LATENCY_PRESERVATION_INTERVAL } from "../consts";

/*
Saves info about latency for an endpoint
Keeps measurments for 5 minutes
If no data, returns 0
*/
const MINUTE = 60 * 1000
class LatencyCounter {
    private latencies: { ts: number, latency: number }[] = [];
    private readonly RETENTION_PERIOD = LATENCY_PRESERVATION_INTERVAL;
    private readonly CLEANUP_INTERVAL = LATENCY_PRESERVATION_INTERVAL / 2;
    private readonly MAX_RECORDS = 10;

    constructor(label: string) {
        setInterval(() => {
            const now = Date.now();
            this.cleanOldLatencies(now);
        }, this.CLEANUP_INTERVAL)//EVERY MINUTE

        // setInterval(() => {
        //     console.debug('>> Latencies for', label, this.latencies.map(l => l.latency).join(','))
        // }, 5000)
    }

    getlatency() {
        const now = Date.now();
        if (this.latencies.length === 0) {
            return 0;
        }
        const sum = this.latencies.reduce((acc, val) => acc + val.latency, 0);
        return Math.round(sum / this.latencies.length)
    }

    addLatency(latency: number) {
        const now = Date.now();
        this.latencies.push({ ts: now, latency });
        if (this.latencies.length > this.MAX_RECORDS) {
            this.latencies.shift();
        }
    }

    private cleanOldLatencies(now: number) {
        this.latencies = this.latencies.filter(l => now - l.ts < this.RETENTION_PERIOD);
    }
}

export interface IStrategy {
    SortEndpoints(endpoints: string[], routerId: string): string[]
    ReportSuccess(routerId: string, endpoint: string, tookTime: number): void
    ReportFailure(routerId: string, endpoint: string, tookTime: number): void
}

export class LatencyStrategy implements IStrategy {
    constructor() {
        // setInterval(() => {
        //     this._debug_printLatencies()
        // }, 5000)
    }

    public SortEndpoints(endpoints: string[], routerId: string): string[] {
        const result = endpoints.sort((a, b) => {
            const aLatency = this._getLatencyCounter(routerId, a).getlatency()
            const bLatency = this._getLatencyCounter(routerId, b).getlatency()
            return aLatency - bLatency
        })

        return result
    }

    public ReportSuccess(routerId: string, endpoint: string, tookTime: number): void {
        const counter = this._getLatencyCounter(routerId, endpoint)
        counter.addLatency(tookTime)
    }

    public ReportFailure(routerId: string, endpoint: string, tookTime: number): void {
        const counter = this._getLatencyCounter(routerId, endpoint)
        counter.addLatency(tookTime * LATENCY_ERROR_MULTIPLIER + LATENCY_ERROR_CORRECTION)
    }

    latencyCounters: { [routerId: string]: LatencyCounter } = {}
    private _getLatencyCounter(routerId: string, endpoint: string): LatencyCounter {
        const key = `${routerId} - ${endpoint}`
        if (!this.latencyCounters[key]) {
            this.latencyCounters[key] = new LatencyCounter(key)
        }
        return this.latencyCounters[key]
    }

    private _debug_printLatencies() {
        for (const key in this.latencyCounters) {
            console.log('Latency', key, this.latencyCounters[key].getlatency())
        }
    }
}

