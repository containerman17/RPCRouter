import Bottleneck from "bottleneck";
import { iRequesterFactory, iRequester } from "./Requester";
import { IStrategy, LatencyStrategy } from "./strategy";
import { LIMITER_WINDOW_SECONDS, WRITE_RPS_MULTIPLIER } from "../consts";
import { SeatWarmer } from "./SeatWarmer";
import getLogger from "./logger";
import { Schemas } from "../schemas";
import "./prometheus.ts"
export const ERROR_ENDPOINT_NOT_FOUND = new Error('Endpoint not found');
export const ALL_ENDPOINTS_ARE_DOWN = new Error('All endpoints are down');
export const INTERNAL_ERROR = new Error('Internal error');

const logger = getLogger('RPCRouter.ts');

export class RPCRouter {
    endpointConfigs: { [key: string]: Schemas.Router } = {};
    initComplete = false;
    private strategy: IStrategy;
    private requesterFactory: iRequesterFactory;
    private seatWarmer?: SeatWarmer;

    constructor(strategy: IStrategy, requesterFactory: iRequesterFactory, seatWarmer?: SeatWarmer) {
        this.strategy = strategy
        this.requesterFactory = requesterFactory;
        this.seatWarmer = seatWarmer;
    }

    public getRouterOwner(routerId: string): string {
        return this.endpointConfigs[routerId]?.owner || '';
    }

    public routerIdExists(routerId: string): boolean {
        const result = !!this.endpointConfigs[routerId];
        if (!result) {
            logger.debug(`Router ${routerId} not found, available routers: ${Object.keys(this.endpointConfigs).join(', ')}`);
        }
        return result;
    }

    public originIsAllowed(routerId: string, origin: string): boolean {
        const originLimit = this.endpointConfigs[routerId]?.originsFilter;
        if (!originLimit || originLimit.length === 0) return true;
        return originLimit.includes(origin);
    }

    public async routeRequest({
        routerId,
        payload,
        origin,
        clientIp,
    }: {
        routerId: string,
        payload: string,
        origin: string,
        clientIp: string
    }): Promise<string> {
        await this._awaitInit();

        if (!this.originIsAllowed(routerId, origin)) {
            return JSON.stringify({ error: `Origin '${origin}' is not allowed to use this router` });
        }

        logger.debug(`Routing request ${payload}`)

        const endpointConfig = this.endpointConfigs[routerId];
        if (!endpointConfig) throw ERROR_ENDPOINT_NOT_FOUND;

        const isWriteRequest = payload.includes('eth_sendRawTransaction');

        if (payload.includes('eth_subscribe')) {
            const parsed = JSON.parse(payload);
            const id = parsed.id;
            return JSON.stringify({
                "jsonrpc": "2.0",
                "id": id,
                "error": {
                    "code": -32000,
                    "message": "Not supported",
                    "data": "eth_subscribe is not supported in this version of the RPC router. Please contact support and we will gladly implement this."
                }
            });
        }

        const routerLimiter: Bottleneck = this._getRouterLimiter(routerId, isWriteRequest);

        const IPLimitter = this._getIPLimiter(routerId, clientIp);
        if (IPLimitter !== null) {
            return IPLimitter.schedule(() => {
                return routerLimiter.schedule(() => {
                    if (isWriteRequest) {
                        return this._routeWriteRequest(routerId, payload);
                    }
                    return this._routeReadRequest(routerId, payload);
                })
            })
        } else {
            return routerLimiter.schedule(() => {
                if (isWriteRequest) {
                    return this._routeWriteRequest(routerId, payload);
                }
                return this._routeReadRequest(routerId, payload);
            })
        }
    }

    private async _routeWriteRequest(routerId: string, payload: string): Promise<string> {
        //FIXME: there is a problem - in fact transactions are delivered slower with this method
        const endpointConfig = this.endpointConfigs[routerId];

        const sortedUrls = this.strategy.SortEndpoints(
            makeAListOfMultiProtocolEndpoints(
                endpointConfig.endpoints.map(e => e.url)
            ),
            routerId
        )

        let promises: Promise<void>[] = [];

        let usedProtocollLessUrls: Set<string> = new Set();
        return new Promise((resolve, reject) => {
            let lastError: Error | null = null;
            let resolved = false;

            for (let url of sortedUrls) {
                const protocollLess = stripProtocol(url)
                if (usedProtocollLessUrls.has(protocollLess)) {
                    continue;
                }

                const requester = this.requesterFactory.getRequester(url);
                if (!requester.isReady()) {
                    continue;
                }

                usedProtocollLessUrls.add(protocollLess);

                const timeStart = Date.now();

                const promise = requester.performRequest(payload).then((response) => {
                    if (!resolved) {
                        resolve(response);
                        resolved = true;
                    }
                    this.strategy.ReportSuccess(routerId, requester.url(), Date.now() - timeStart);
                }).catch((e) => {
                    this.strategy.ReportFailure(routerId, requester.url(), Date.now() - timeStart);
                    console.debug('Request failed', e.message || e.toString());
                    lastError = e;
                });

                promises.push(promise);
            }

            Promise.all(promises).catch(() => undefined).then(() => {
                if (!resolved) {
                    reject(lastError || ALL_ENDPOINTS_ARE_DOWN);
                }
            })
        });
    }

    private async _routeReadRequest(routerId: string, payload: string): Promise<string> {
        const endpointConfig = this.endpointConfigs[routerId];

        const sortedUrls = this.strategy.SortEndpoints(
            makeAListOfMultiProtocolEndpoints(
                endpointConfig.endpoints.map(e => e.url)
            ),
            routerId
        )

        this.seatWarmer?.warmUpEndpoints(sortedUrls, routerId)//fire and forget


        let responses: string[] = [];
        let promises: Promise<void>[] = [];

        let usedDomains: Set<string> = new Set();

        const getNextRequester = (): (iRequester | null) => {
            while (sortedUrls.length > 0) {
                const url = sortedUrls.shift();
                if (!url) {
                    return null;
                }
                const domain = urlToDomain(url)
                if (usedDomains.has(domain)) {
                    continue;
                }

                const requester = this.requesterFactory.getRequester(url);
                if (!requester.isReady()) {
                    continue;
                }

                usedDomains.add(domain);
                logger.debug('Using', url);
                return requester;
            }
            return null;
        }


        for (let i = 0; i < endpointConfig.crossCheck + 1; i++) {
            const requester = getNextRequester();
            if (!requester) {
                throw ALL_ENDPOINTS_ARE_DOWN;
            }

            const timeStart = Date.now();
            const promise = requester.performRequest(payload).then((response) => {
                responses.push(response);
                this.strategy.ReportSuccess(routerId, requester.url(), Date.now() - timeStart);
            }).catch((e) => {
                this.strategy.ReportFailure(routerId, requester.url(), Date.now() - timeStart);
                console.debug('Request failed', e.message || e.toString());
                usedDomains.delete(urlToDomain(requester.url()));
            });

            promises.push(promise);
        }

        await Promise.all(promises);

        const nEquals = extractNEquals(responses, endpointConfig.crossCheck + 1);
        if (nEquals !== null) {
            return nEquals;
        }


        //second wave - retry all other endpoints until we got crossCheck+1 successes
        for (let i = 0; i < 50; i++) {//curcuit breaker
            const requester = getNextRequester();
            if (!requester) {
                throw ALL_ENDPOINTS_ARE_DOWN;
            }

            const timeStart = Date.now();
            try {
                const response = await requester.performRequest(payload);
                responses.push(response);
                const nEquals = extractNEquals(responses, endpointConfig.crossCheck + 1);
                if (nEquals !== null) {
                    return nEquals;
                }
                this.strategy.ReportSuccess(routerId, requester.url(), Date.now() - timeStart);
            } catch (e) {
                console.debug('Request failed', e.message || e.toString());
                this.strategy.ReportFailure(routerId, requester.url(), Date.now() - timeStart);
                usedDomains.delete(urlToDomain(requester.url()));
            }
        }

        console.warn('The code should not reach this point');
        throw INTERNAL_ERROR
    }

    private limiters: Map<string, Bottleneck> = new Map();
    private _getRouterLimiter(routerId: string, isWriteRequest: boolean): Bottleneck {
        let rps = isWriteRequest
            ? this.endpointConfigs[routerId].RPSTotal / WRITE_RPS_MULTIPLIER
            : this.endpointConfigs[routerId].RPSTotal
        rps = Math.max(1, rps);

        const routerLimiterId = `router-${routerId}-${isWriteRequest ? 'write' : 'read'}-${rps}`;
        if (this.limiters.has(routerLimiterId)) {
            return this.limiters.get(routerLimiterId)!;
        }

        const limitter = new Bottleneck({
            reservoir: rps * LIMITER_WINDOW_SECONDS, // Initial number of requests allowed
            reservoirRefreshAmount: rps * LIMITER_WINDOW_SECONDS, // Number of requests added back after each interval
            reservoirRefreshInterval: LIMITER_WINDOW_SECONDS * 1000, // Interval for adding requests back in milliseconds (1 second)
            id: routerLimiterId,
        })
        limitter.on("depleted", () => {
            logger.warn(`THROTTLED ${routerLimiterId}`);
        })

        this.limiters.set(routerLimiterId, limitter);

        return this.limiters.get(routerLimiterId)!;
    }

    private _getIPLimiter(routerId: string, ip: string): Bottleneck | null {
        let rps = this.endpointConfigs[routerId].RPSPerIP || 0
        if (rps === 0) return null;

        const routerLimiterId = `IP-${routerId}-${ip}-${rps}`;
        if (this.limiters.has(routerLimiterId)) {
            return this.limiters.get(routerLimiterId)!;
        }

        const limitter = new Bottleneck({
            reservoir: rps * LIMITER_WINDOW_SECONDS, // Initial number of requests allowed
            reservoirRefreshAmount: rps * LIMITER_WINDOW_SECONDS, // Number of requests added back after each interval
            reservoirRefreshInterval: LIMITER_WINDOW_SECONDS * 1000, // Interval for adding requests back in milliseconds (1 second)
            id: routerLimiterId,
        })

        limitter.on("depleted", () => {
            logger.warn(`THROTTLED ${routerLimiterId}`);
        })

        this.limiters.set(routerLimiterId, limitter);

        return this.limiters.get(routerLimiterId)!;
    }

    public injectConfig(config: { [key: string]: Schemas.Router }) {
        const validatedConfig: { [key: string]: Schemas.Router } = {};
        for (let [key, value] of Object.entries(config)) {
            try {
                const data = Schemas.RPCRouterSchema.parse(value);
                validatedConfig[key] = data;
            } catch (e) {
                logger.error(`Invalid config for ${key}: ${e}`);
            }
        }


        this.endpointConfigs = validatedConfig;
        this.initComplete = true;
    }

    private async _awaitInit() {
        if (this.initComplete) return
        for (let i = 0; i < 100; i++) {
            if (this.initComplete) {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 15));
        }
        throw INTERNAL_ERROR
    }
}

const urlToDomain = (url: string): string => {
    return url.split('/')[2];
}

const stripProtocol = (url: string): string => {
    return url.split('://')[1];
}

const extractNEquals = (arr: string[], n: number): string | null => {
    //optimization, doesn't change the logic, but covers ~95% of cases
    if (n === 1 && arr.length === 1) return arr[0];
    if (arr.length < n) return null;


    const counts: { [key: string]: number } = {};
    for (const value of arr) {
        counts[value] = (counts[value] || 0) + 1;
        if (counts[value] >= n) {
            return value;
        }
    }
    return null;
}

const makeAListOfMultiProtocolEndpoints = (urls: string[]): string[] => {
    const result: string[] = [];
    for (const url of urls) {
        const protocolLess = url.split('://')[1];
        result.push(`wss://${protocolLess}`);
        result.push(`https://${protocolLess}`);
    }
    return [...new Set(result)];
}