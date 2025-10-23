/**
 * Endpoint for metrics prometheus
 */
import express, { Request, Response } from "express";
import client from "prom-client";

const router = express.Router();

// (CPU, Memory, GC)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: "iot_dataflow_" });

// Incert data
export const insertCounter = new client.Counter({
  name: "iot_ingest_messages_total",
  help: "Total number of inserted telemetry messages",
});

// Duration 
export const insertDuration = new client.Histogram({
  name: "iot_ingest_insert_duration_seconds",
  help: "Duration of telemetry batch inserts",
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

// Active devices
export const activeDevices = new client.Gauge({
  name: "iot_active_devices",
  help: "Number of currently active devices"
});

router.get("/metrics", async (_req: Request, res: Response) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

export default router;
