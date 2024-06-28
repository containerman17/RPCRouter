
import { z } from "zod";
import { zfd } from "zod-form-data";

export namespace Schemas {
    export const DEFAULT_RPS = 100
    export const ZNetwork = z.enum(["ethereum", "avalanche", "pulsechain", "bsc", "canto", "fantom", "optimism", "arbitrum", "base", "generic_evm"])
    export type Network = z.infer<typeof ZNetwork>;

    export const ZBalancingStrategy = z.enum(["latency", "random", "reliability"])
    export type BalancingStrategy = z.infer<typeof ZBalancingStrategy>;

    export const RPCRouterEndpointSchema = z.object({
        url: z.string().url(),
    });
    export type RPCRouterEndpoint = z.infer<typeof RPCRouterEndpointSchema>;

    export const ZCrossCheck = z.number().int().min(0).max(2).optional().default(0)

    export const ZRPSPerIP = z.number().int().min(0).max(1000).optional().default(0)
    export type RPSPerIP = z.infer<typeof ZRPSPerIP>;

    export const RPCRouterSchema = zfd.formData({
        readableName: z.string().min(3).max(40),
        endpoints: z.array(RPCRouterEndpointSchema),
        network: ZNetwork,
        strategy: ZBalancingStrategy,
        id: z.string().min(3).max(40),
        owner: z.string(),
        crossCheck: ZCrossCheck,
        originsFilter: z.array(z.string().url()).optional(),
        RPSTotal: z.number().int().min(1).optional().default(DEFAULT_RPS),
        RPSPerIP: ZRPSPerIP,
    });

    export type Router = z.infer<typeof RPCRouterSchema>;
}