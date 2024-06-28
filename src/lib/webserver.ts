import uWS, { DEDICATED_COMPRESSOR_3KB, HttpResponse, HttpRequest } from 'uWebSockets.js';
import { RPCRouter } from '../lib/RPCRouter';
import { LatencyStrategy } from '../lib/strategy';
import { RequesterFactory } from '../lib/Requester';
import { SeatWarmer } from './SeatWarmer';
import getLogger from './logger';
import { inboundResponseTimeHistogram } from './prometheus';

const logger = getLogger('webserver.ts');

export function createWebserver(port: number) {
    const decoder = new TextDecoder('utf-8');

    const requesterFactory = new RequesterFactory();
    const latencyStrategy = new LatencyStrategy();
    const router = new RPCRouter(latencyStrategy, requesterFactory, new SeatWarmer(requesterFactory, latencyStrategy));

    interface userDataWS {
        routerId: string,
        origin: string,
        clientIp: string,
    }

    const app = uWS.App().ws<userDataWS>('/*', {
        /* There are many common helper features */
        idleTimeout: 120,
        maxPayloadLength: 1024,
        compression: DEDICATED_COMPRESSOR_3KB,
        sendPingsAutomatically: true,

        /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
        message: (ws, message, isBinary) => {
            const payload = decoder.decode(message);
            const { routerId, origin, clientIp } = ws.getUserData();
            logger.debug('Received message ' + payload);

            const startTime = Date.now();
            const promLabels = {
                'router_id': routerId,
                'client_id': router.getRouterOwner(routerId),
                'http_protocol': 'http',
            }

            router.routeRequest({
                routerId,
                payload,
                origin,
                clientIp,
            }).then((response) => {
                logger.debug('Sending response ' + response);
                try {
                    ws.send(response);
                } catch (e) {
                    logger.error('Failed to send response to client:' + e);
                }

                inboundResponseTimeHistogram.observe(Object.assign(promLabels, { 'success': 'true' }), Date.now() - startTime);

            }).catch(async (error) => {
                try {
                    ws.send(JSON.stringify({ error: 'Failed to perform request' }));
                } catch (error) {
                    logger.error('Failed to send error message to client:' + error);
                }

                inboundResponseTimeHistogram.observe(Object.assign(promLabels, { 'success': 'false' }), Date.now() - startTime);
            })
        },
        open: (ws) => {
            logger.info('A new Client connected', ws.getUserData());
        },
        upgrade: (res, req, context) => {
            let routerId = req.getUrl().slice(`/r/`.length);
            if (routerId[routerId.length - 1] === '/') {
                routerId = routerId.slice(0, -1);
            }

            const origin = req.getHeader('origin');
            const XFFHeader: string = req.getHeader('x-forwarded-for') || ""

            if (!router.routerIdExists(routerId)) {
                res.writeStatus('404 Not Found').end(JSON.stringify({ error: 'Router not found' }));
                return;
            }
            if (!router.originIsAllowed(routerId, origin)) {
                res.writeStatus('403 Forbidden').end(JSON.stringify({ error: 'Origin not allowed' }));
                return;
            }

            res.upgrade<userDataWS>(
                {
                    routerId,
                    origin,
                    clientIp: getClientIpFromXFF(XFFHeader),
                },
                req.getHeader('sec-websocket-key'),
                req.getHeader('sec-websocket-protocol'),
                req.getHeader('sec-websocket-extensions'),
                context
            );
        }
    }).options('/*', (res: HttpResponse, req: HttpRequest) => {
        res.writeHeader("Access-Control-Allow-Origin", "*");
        res.writeHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.writeHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.writeHeader("Access-Control-Max-Age", "86400");
        res.writeStatus("200 OK").end();
    }).post('/*', async (res: HttpResponse, req: HttpRequest) => {
        let aborted = false;
        res.onAborted(() => {
            logger.warn('Request was aborted by the client');
            aborted = true;
        })

        res.writeHeader("Access-Control-Allow-Origin", "*");
        res.writeHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.writeHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        let routerId = req.getUrl().slice(`/r/`.length);
        if (routerId[routerId.length - 1] === '/') {
            routerId = routerId.slice(0, -1);
        }

        const startTime = Date.now();
        const promLabels = {
            'router_id': routerId,
            'client_id': router.getRouterOwner(routerId),
            'http_protocol': 'http',
        }

        try {
            if (!router.routerIdExists(routerId)) {
                res.writeStatus('404 Not Found')
                    .writeHeader("Content-Type", "application/json")
                    .end(JSON.stringify({ error: 'Router not found' }));
                return;
            }

            const origin = req.getHeader('origin');
            const XFFHeader: string = req.getHeader('x-forwarded-for') || ""

            const payload = await readString(res);

            if (aborted) return;
            const responseBody = await router.routeRequest({
                routerId,
                payload,
                origin,
                clientIp: getClientIpFromXFF(XFFHeader),
            })


            if (aborted) return;

            res.cork(() => {
                res.writeStatus("200 OK")
                    .writeHeader("Content-Type", "application/json")
                    .writeHeader("Connection", "keep-alive")
                    .end(responseBody)
            })

            inboundResponseTimeHistogram.observe(Object.assign(promLabels, { 'success': 'true' }), Date.now() - startTime);
        } catch (error) {
            logger.warn(error, 'Error serving http request:');
            if (aborted) return;
            res.writeHeader("Connection", "keep-alive").end(JSON.stringify({ error: 'Failed to perform request' }));


            inboundResponseTimeHistogram.observe(Object.assign(promLabels, { 'success': 'false' }), Date.now() - startTime);
        }
    })

    function readString(res: HttpResponse): Promise<string> {
        return new Promise((resolve, reject) => {
            let data = '';

            res.onData((ab: ArrayBuffer, isLast: boolean) => {
                let chunk = Buffer.from(ab).toString();
                data += chunk;
                if (isLast) {
                    try {
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }

    return {
        router,
        listen: () => app.listen(port, (listenSocket) => {
            if (listenSocket) {
                logger.info(`Listening to port ${port}`);
            } else {
                logger.fatal(`Failed to listen to port ${port}`);
            }
        })
    }
}

const getClientIpFromXFF = (xff: string) => {
    const ips = xff.split(',').map((ip) => ip.trim());
    if (ips.length < 2) {
        logger.warn(`x-forwarded-for '${xff}' header has less than 2 IPs, returning "unknown"`);
        return "unknown";
    }
    const ip = ips[ips.length - 2];
    return ip;
}

