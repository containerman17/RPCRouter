import { randomUUID } from "crypto";
import { iRequesterFactory } from "./Requester";
import { IStrategy } from "./strategy";
import { SEAT_WARMER_CLEAN_INTERVAL } from "../consts";
import Bottleneck from "bottleneck";


export class SeatWarmer {
    private requesterFactory: iRequesterFactory;
    private strategy: IStrategy;
    seatIsWarmed: { [lockKey: string]: boolean } = {};
    private _limiter: Bottleneck;

    constructor(requesterFactory: iRequesterFactory, strategy: IStrategy) {
        this.requesterFactory = requesterFactory;
        this.strategy = strategy;
        setInterval(() => {
            this.seatIsWarmed = {};
        }, SEAT_WARMER_CLEAN_INTERVAL);

        this._limiter = new Bottleneck({
            maxConcurrent: 2, // Maximum number of concurrent jobs
        })
    }

    warmUpEndpoints(urls: string[], routerId: string) {
        urls.forEach((url) => {
            this._warmUpEndpoint(url, routerId);
        });
    }

    private async _warmUpEndpoint(url: string, routerId: string) {
        const lockKey = `${routerId}-${url}`;
        if (this.seatIsWarmed[lockKey]) {
            return
        }
        this.seatIsWarmed[lockKey] = true;
        const requester = this.requesterFactory.getRequester(url);
        const timeStart = Date.now();

        for (let i = 0; i < 100; i++) {
            if (!requester.isReady()) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            } else {
                break;
            }
        }

        for (let i = 0; i < 3; i++) {
            await new Promise((resolve) => setTimeout(resolve, 2000 * Math.random()));

            this._limiter.schedule(async () => {
                const timeStart = Date.now();
                try {
                    await requester.performRequest(JSON.stringify({
                        method: 'eth_blockNumber',
                        jsonrpc: '2.0',
                        id: randomUUID(),
                        params: []
                    }))

                    this.strategy.ReportSuccess(routerId, url, Date.now() - timeStart);
                } catch (e) {
                    this.strategy.ReportFailure(routerId, url, Date.now() - timeStart);
                }
            });
        }

    }
}

