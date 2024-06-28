export const DEFAULT_REQUEST_TIMEOUT = 2000
export const LIMITER_WINDOW_SECONDS = 5
export const WRITE_RPS_MULTIPLIER = 10
export const LATENCY_ERROR_CORRECTION = 300
export const LATENCY_ERROR_MULTIPLIER = 2

const SECOND = 1000
const MINUTE = 60 * SECOND

export const LATENCY_PRESERVATION_INTERVAL = 5 * MINUTE
export const SEAT_WARMER_CLEAN_INTERVAL = LATENCY_PRESERVATION_INTERVAL / 2

import dotenv from "dotenv";
dotenv.config();

export function envOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
        console.log(`Missing env variable ${key}`);
        throw new Error(`Missing env variable ${key}`);
    }

    return value;
}

export function isProduction(): boolean {
    return process.env.NODE_ENV === "production";
}
