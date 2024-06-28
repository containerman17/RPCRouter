// import { expect, test, vi } from 'vitest'
// import { RPCRouter } from '../RPCRouter'
// import { IStrategy, LatencyStrategy } from '../strategy'
// import { iRequester } from '../Requester'
// import { Schemas } from '../../schemas'

// type iRequesterMock = iRequester & { __callCounter: () => number }

// class MockRequesterFactory {
//     responses: { [url: string]: { [payload: string]: { response?: string, error?: string } } } = {}

//     __injectResponse({ url, response, error, payload }: {
//         url: string,
//         response?: string,
//         error?: string,
//         payload: string
//     }) {
//         if (!this.responses[url]) {
//             this.responses[url] = {}
//         }
//         this.responses[url][payload] = { response, error }
//     }

//     private __notReadyUrls: Set<string> = new Set()
//     __setRequesterNotReady(url: string) {
//         this.__notReadyUrls.add(url)
//     }

//     private requesters: { [url: string]: iRequesterMock } = {}
//     private callCounter: { [url: string]: number } = {}
//     getRequester(url: string): iRequesterMock {
//         if (!this.requesters[url]) {
//             this.requesters[url] = {
//                 isReady: () => !this.__notReadyUrls.has(url),
//                 url: () => url,
//                 performRequest: async (payload: string) => {
//                     if (!this.callCounter[url]) {
//                         this.callCounter[url] = 0
//                     }
//                     this.callCounter[url]++

//                     const predefinedResponse = this.responses[url]?.[payload]
//                     if (!predefinedResponse) {
//                         throw new Error('No response for ' + url + ' ' + payload + ', available: ' + JSON.stringify(this.responses, null, 2))
//                     }
//                     if (predefinedResponse.error) {
//                         throw new Error(predefinedResponse.error)
//                     }
//                     return predefinedResponse.response || 'empty response'
//                 },
//                 __callCounter: () => {
//                     return this.callCounter[url] || 0
//                 }
//             }
//         }
//         return this.requesters[url]
//     }
// }

// class MockStrategy implements IStrategy {
//     fakeLatencies: { [key: string]: number } = {}
//     __injectFakeLatency(endpoint: string, latency: number) {
//         this.fakeLatencies[endpoint] = latency
//     }

//     SortEndpoints(endpoints: string[], routerId: string): string[] {
//         return endpoints.sort((a, b) => {
//             const aLatency = this.fakeLatencies[a]
//             const bLatency = this.fakeLatencies[b]
//             return aLatency - bLatency
//         })
//     }
//     ReportSuccess(routerId: string, endpoint: string, tookTime: number): void {

//     }
//     ReportFailure(routerId: string, endpoint: string, tookTime: number): void {

//     }
// }

// test('double check is not performed using https and wss of one endpoint', async () => {
//     const strategy = new MockStrategy()
//     const requesterFactory = new MockRequesterFactory()
//     const router = new RPCRouter(strategy, requesterFactory);
//     const routerConfigs: { [key: string]: Schemas.Router } = {
//         'endpoint1': {
//             readableName: 'endpoint1',
//             network: 'ethereum',
//             id: 'endpoint1',
//             endpoints: [{ url: 'https://wrong.com/' }, { url: 'https://right1.com/' }, { url: 'https://right2.com/' }],
//             crossCheck: 1,
//             RPSTotal: 1000,
//             owner: 'somebidy',
//             strategy: 'latency',
//         }
//     }
//     router.injectConfig(routerConfigs)

//     //make sure that one.com is the fastest
//     for (let url of ['https://wrong.com/', 'wss://wrong.com/']) {
//         strategy.__injectFakeLatency(url, 1)
//         requesterFactory.__injectResponse({ url: url, response: 'bad response', payload: 'payload' })
//     }

//     for (let url of ['https://right1.com/', 'wss://right1.com/', 'https://right2.com/', 'wss://right2.com/']) {
//         strategy.__injectFakeLatency(url, 1000)
//         requesterFactory.__injectResponse({ url: url, response: 'good response', payload: 'payload' })
//     }

//     const response = await router.routeRequest('endpoint1', 'payload')
//     expect(response).toBe('good response')
// })


// test('should route via http when wss is not ready', async () => {
//     const strategy = new MockStrategy()
//     const requesterFactory = new MockRequesterFactory()
//     const router = new RPCRouter(strategy, requesterFactory);
//     const routerConfigs: { [key: string]: RouterConfig } = {
//         'endpoint1': {
//             id: 'endpoint1',
//             endpoints: [{ url: 'https://sillygoose.com/' }],
//             options: { crossCheck: 0, RPSTotal: 1000, },
//         }
//     }
//     router.injectConfig(routerConfigs)


//     strategy.__injectFakeLatency('wss://sillygoose.com/', 1)
//     requesterFactory.__injectResponse({ url: 'wss://sillygoose.com/', error: 'wss failed', payload: 'payload' })
//     requesterFactory.__setRequesterNotReady('wss://sillygoose.com/')


//     strategy.__injectFakeLatency('https://sillygoose.com/', 1000)
//     requesterFactory.__injectResponse({ url: 'https://sillygoose.com/', response: 'good response', payload: 'payload' })

//     const response = await router.routeRequest('endpoint1', 'payload')
//     expect(response).toBe('good response')
// })


// test('should route via http when wss fails', async () => {
//     const strategy = new MockStrategy()
//     const requesterFactory = new MockRequesterFactory()
//     const router = new RPCRouter(strategy, requesterFactory);
//     const routerConfigs: { [key: string]: RouterConfig } = {
//         'endpoint1': {
//             id: 'endpoint1',
//             endpoints: [{ url: 'https://sillygoose.com/' }],
//             options: { crossCheck: 0, RPSTotal: 1000, },
//         }
//     }
//     router.injectConfig(routerConfigs)


//     strategy.__injectFakeLatency('wss://sillygoose.com/', 1)
//     requesterFactory.__injectResponse({ url: 'wss://sillygoose.com/', error: 'wss failed', payload: 'payload' })

//     strategy.__injectFakeLatency('https://sillygoose.com/', 1000)
//     requesterFactory.__injectResponse({ url: 'https://sillygoose.com/', response: 'good response', payload: 'payload' })

//     const response = await router.routeRequest('endpoint1', 'payload')
//     expect(response).toBe('good response')
// })


// test('should NOT allow wrong configs', async () => {
//     const strategy = new MockStrategy()
//     const requesterFactory = new MockRequesterFactory()
//     const router = new RPCRouter(strategy, requesterFactory);

//     //fake responses
//     for (let endpoint of ['https://sillygoose.com/', 'wss://sillygoose.com/']) {
//         strategy.__injectFakeLatency(endpoint, 1)
//         requesterFactory.__injectResponse({ url: endpoint, response: 'good response', payload: 'payload' })
//     }

//     //omitting crossCheck
//     const wrongOptions: RouterConfigOptions = JSON.parse(JSON.stringify({ RPSTotal: 10 })) as RouterConfigOptions

//     const routerConfigs: { [key: string]: RouterConfig } = {
//         'endpoint1': {
//             id: 'endpoint1',
//             endpoints: [{ url: 'https://sillygoose.com/' }],
//             options: wrongOptions,
//         }
//     }
//     router.injectConfig(routerConfigs)

//     await expect(router.routeRequest('endpoint1', 'payload')).rejects.toThrow('Endpoint not found')

//     routerConfigs['endpoint1']!.options.crossCheck = 0
//     router.injectConfig(routerConfigs)
//     expect(await router.routeRequest('endpoint1', 'payload')).toBe('good response')
// })


// test('should send eth_sendRawTransaction to all endpoints, but only once per domain', async () => {
//     const strategy = new MockStrategy()
//     const requesterFactory = new MockRequesterFactory()
//     const router = new RPCRouter(strategy, requesterFactory);
//     const routerConfigs: { [key: string]: RouterConfig } = {
//         'endpoint1': {
//             id: 'endpoint1',
//             endpoints: [
//                 { url: 'https://one.com/' },
//                 { url: 'https://two.com/' },
//                 { url: 'https://three.com/hello' },
//                 { url: 'https://three.com/world' },
//             ],
//             options: { crossCheck: 0, RPSTotal: 1000, },
//         }
//     }
//     router.injectConfig(routerConfigs)
//     const ETH_SEND_TX_PAYLOAD = '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["Signed Transaction"],"id":1}'

//     for (let url of ['one.com/', 'two.com/', 'three.com/hello', 'three.com/world']) {
//         for (let protocol of ['https://', 'wss://']) {
//             strategy.__injectFakeLatency(protocol + url, 1)
//             requesterFactory.__injectResponse({ url: protocol + url, response: '{}', payload: ETH_SEND_TX_PAYLOAD })
//         }
//     }

//     requesterFactory.__setRequesterNotReady('wss://three.com/hello')
//     requesterFactory.__setRequesterNotReady('wss://three.com/world')

//     const response = await router.routeRequest('endpoint1', ETH_SEND_TX_PAYLOAD)
//     expect(response).toBe('{}')

//     await new Promise(resolve => setTimeout(resolve, 10))


//     let totalCalls = 0
//     for (let url of ['one.com/', 'two.com/', 'three.com/hello', 'three.com/world']) {
//         const requesterHttps = requesterFactory.getRequester('https://' + url)
//         const requesterWss = requesterFactory.getRequester('wss://' + url)
//         totalCalls += requesterHttps.__callCounter() + requesterWss.__callCounter()
//     }

//     expect(totalCalls).toBe(4)
// })

// //TODO: в случае если домен высвобозждается, мы можем застрять в цикле