import pino from 'pino';

const loggerLevels = {
    'Requester.ts': 'debug',
}

const DEFAULT_LOG_LEVEL = 'debug';

const loggersCache = new Map<string, pino.Logger>();
export default function getLogger(name: string): pino.Logger {
    if (!loggersCache.has(name)) {
        const level = loggerLevels[name] || DEFAULT_LOG_LEVEL;
        const logger = pino({
            name,
            level,
        });
        loggersCache.set(name, logger);
    }
    return loggersCache.get(name)!;
}