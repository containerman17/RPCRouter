import dotenv from "dotenv";
dotenv.config();
import getLogger from "../lib/logger";

const logger = getLogger("dedicated/index.ts");

//cross checks
let crossCheck: Schemas.Router['crossCheck'] = 0;
if (process.env.RPCROUTER_CROSS_CHECKS) {
    const crossChecksParsed = parseInt(process.env.RPCROUTER_CROSS_CHECKS)
    if ([0, 1, 2].includes(crossChecksParsed)) {
        crossCheck = crossChecksParsed as 0 | 1 | 2;
    } else {
        logger.fatal("RPCROUTER_CROSS_CHECKS must be 0, 1 or 2")
    }
}

const crossChackNames = {
    0: "None",
    1: "Double-Check",
    2: "Triple-Check"
}

console.debug(`RPC Response cross-check: ${crossChackNames[crossCheck]} (${crossCheck} extra requests)`)

//rpc endpoints
const routerConfigs: { [key: string]: Schemas.Router } = {}


for (const key in process.env) {
    if (key.startsWith("RPCROUTER_URL_")) {
        const routerId = key.split("RPCROUTER_URL_")[1].split("_")[0]
        if (!routerConfigs[routerId]) {
            routerConfigs[routerId] = {
                id: routerId,
                endpoints: [],
                crossCheck,
                RPSTotal: 30,
                originsFilter: [],
                owner: "local",
                readableName: routerId,
                strategy: "latency",
                network: "generic_evm",
                RPSPerIP: 0,
            }
        }
        routerConfigs[routerId].endpoints.push({
            url: process.env[key]!.trim()
        })
    }
}

import { createWebserver } from '../lib/webserver';
import { Schemas } from "../schemas";
const webServer = createWebserver(parseInt(process.env.NODE_PORT || '') || 9001);
webServer.router.injectConfig(routerConfigs);
webServer.listen()