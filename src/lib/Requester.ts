
export interface iRequester {
    performRequest(payload: string): Promise<string>;
    isReady(): boolean;
    url(): string;
}
const decoder = new TextDecoder('utf-8');


const logger = getLogger('Requester.ts');

import WebSocket from 'ws';
import EventEmitter from 'events';
class WsRequester implements iRequester {
    private _url: string;
    private ws: WebSocket;
    private eventBus: EventEmitter = new EventEmitter();

    constructor(url: string) {
        this._url = url;
        this._reconnect();
        setInterval(() => this._reconnect(), 1000 * 60);
    }

    public isReady(): boolean {
        return this.ws.readyState === WebSocket.OPEN;
    }

    public url(): string {
        return this._url;
    }

    private _reconnect() {
        if (this.ws !== undefined && this.ws.readyState !== WebSocket.CLOSED) {
            return
        }

        this.ws = new WebSocket(this._url);
        this.ws.on('message', (dataBuf) => {
            try {
                const data = decoder.decode(dataBuf as Buffer)
                const decoded = JSON.parse(data);

                const id = decoded?.id;
                if (!id) {
                    logger.warn('No id in response', decoded);
                    return
                }
                this.eventBus.emit(id, stringifySorted(decoded))
            } catch (e) {
                logger.error('Failed to parse message:', e);
            }
        })
        this.ws.on('open', () => {
            logger.debug('WebSocket opened');
        });
        this.ws.on('close', () => {
            logger.debug('WebSocket closed');
        });
        this.ws.on('error', (e) => {
            logger.warn('WebSocket error', e?.message || e.toString());
        })
    }

    public async performRequest(payload: string): Promise<string> {
        const requestTimingId = randomUUID();
        const requestStartedAt = Date.now();

        if (this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not open');
        }

        const parsed = JSON.parse(payload);

        if (!parsed.id) {
            parsed.id = randomUUID();
            payload = JSON.stringify(parsed);
        }

        this.ws.send(payload);

        const result = await new Promise((resolve, reject) => {
            let resolved = false;
            const timeout = setTimeout(() => {
                resolved = true;
                reject(new Error('Request timed out'));
            }, DEFAULT_REQUEST_TIMEOUT);
            this.eventBus.once(parsed.id, (response) => {
                if (resolved) {
                    return
                }
                resolved = true;
                clearTimeout(timeout);
                if (isItAHiddenError(response)) {
                    reject(new Error('Result is a hidden error: ' + response));
                } else {
                    resolve(response);
                }
            });
        });
        logger.info(`Request ${requestTimingId} took ${Date.now() - requestStartedAt}ms`);
        return result as string;
    }
}

import { randomUUID } from 'crypto';
import { DEFAULT_REQUEST_TIMEOUT } from '../consts';
import getLogger from './logger';
import { Client } from 'undici';
class HttpRequester implements iRequester {
    private _host: string;
    private _path: string;
    private _undiciClient: Client

    constructor(url: string) {
        this._host = url.split('/').slice(0, 3).join('/');
        this._path = '/' + url.split('/').slice(3).join('/');

        this._undiciClient = new Client(this._host, {
            connectTimeout: DEFAULT_REQUEST_TIMEOUT,
            headersTimeout: DEFAULT_REQUEST_TIMEOUT,
            bodyTimeout: DEFAULT_REQUEST_TIMEOUT,
            pipelining: 100,//FIXME: might be too high
            maxRedirections: 2,
        })
    }

    public isReady(): boolean {
        return true;
    }

    public url(): string {
        return this._host + this._path;
    }

    public async performRequest(payload: string): Promise<string> {
        const requestTimingId = randomUUID();
        const requestStartedAt = Date.now();

        const {
            statusCode,
            body
        } = await this._undiciClient.request({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload,
            path: this._path
        });

        if (statusCode !== 200) {
            throw new Error(`Request failed with status code ${statusCode}`);
        }
        let result = await body.text();
        logger.info(`Request ${requestTimingId} took ${Date.now() - requestStartedAt}ms`);

        result = stringifySorted(JSON.parse(result));

        if (isItAHiddenError(result)) {
            throw new Error('Result is a hidden error: ' + result);
        }

        return stringifySorted(JSON.parse(result))
    }
}

function isItAHiddenError(response: string): boolean {
    if (response.includes('Internal error')) {
        return true
    } else {
        return false
    }
}

export interface iRequesterFactory {
    getRequester(url: string): iRequester;
}

export function stringifySorted(value) {
    function sortObject(obj) {
        const sortedKeys = Object.keys(obj).sort((a, b) => {
            const valA = obj[a];
            const valB = obj[b];
            if (typeof valA === 'object' && !Array.isArray(valA) && valA !== null) {
                return 1; // Keep objects last
            }
            if (typeof valB === 'object' && !Array.isArray(valB) && valB !== null) {
                return -1; // Keep objects last
            }
            return String(valA).localeCompare(String(valB), undefined, { numeric: true });
        });

        const result = {};
        for (const key of sortedKeys) {
            result[key] = obj[key];
        }
        return result;
    }

    function replacer(key, value) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return sortObject(value);
        }
        return value;
    }

    return JSON.stringify(value, replacer);
}
export class RequesterFactory {
    wsRequesters = new Map<string, iRequester>();
    httpRequesters = new Map<string, iRequester>();

    public getRequester(url: string): iRequester {
        if (url.startsWith('http')) {
            if (!this.httpRequesters.has(url)) {
                this.httpRequesters.set(url, new HttpRequester(url));
            }
            return this.httpRequesters.get(url)!;
        } else if (url.startsWith('ws')) {
            if (!this.wsRequesters.has(url)) {
                this.wsRequesters.set(url, new WsRequester(url));
            }
            return this.wsRequesters.get(url)!;
        } else {
            throw new Error('Invalid protocol');
        }
    }
}
