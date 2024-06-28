import express from 'express';
import { collectDefaultMetrics, register, Counter, Histogram } from 'prom-client';

// collectDefaultMetrics();

const app = express();

app.get('/metrics', async (_req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

app.listen(9091, '0.0.0.0');

export const inboundResponseTimeHistogram = new Histogram({
    name: 'inbound_response_time_histogram',
    help: 'Inbound response time in milliseconds',
    labelNames: ['router_id', 'client_id', 'http_protocol', 'success'],
    buckets: [10, 50, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000, 10000],
})