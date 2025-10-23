import express, { Request, Response } from "express";
import { prisma } from "../db/client.js";

const router = express.Router();

/**
 * Interface describing the expected shape of telemetry payloads.
 * Example payload:
 * { "temperature": 25.7, "humidity": 43 }
 */
interface TelemetryPayload {
  temperature?: number;
  humidity?: number;
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                               📊 Device Stats                              */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/analytics/device/:deviceId
 * Returns summary statistics (avg, min, max, count) for a given device
 * within an optional time range (?from=...&to=...).
 */
router.get(
  "/analytics/device/:deviceId",
  async (
    req: Request<{ deviceId: string }, any, any, { from?: string; to?: string }>,
    res: Response
  ) => {
    const { deviceId } = req.params;
    const { from, to } = req.query;

    try {
      const fromDate = from ? new Date(from) : new Date(Date.now() - 3600 * 1000);
      const toDate = to ? new Date(to) : new Date();

      // Fetch telemetry data for this device within the given range
      const records = await prisma.telemetry.findMany({
        where: { deviceId, time: { gte: fromDate, lte: toDate } },
        select: { payload: true },
      });

      if (records.length === 0) {
        return res.json({ deviceId, count: 0, avg: null, min: null, max: null });
      }

      // Safely extract temperature readings
      const temperatures = records
        .map((r) => {
          const p = r.payload as TelemetryPayload;
          return typeof p.temperature === "number" ? p.temperature : undefined;
        })
        .filter((t): t is number => typeof t === "number");

      if (temperatures.length === 0) {
        return res.json({ deviceId, count: 0, avg: null, min: null, max: null });
      }

      // Compute summary statistics
      const avg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
      const min = Math.min(...temperatures);
      const max = Math.max(...temperatures);

      res.json({
        deviceId,
        count: temperatures.length,
        avg: Number(avg.toFixed(2)),
        min,
        max,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      });
    } catch (err) {
      console.error("Analytics error:", err);
      res.status(500).json({ error: "Failed to compute analytics" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                               📈 Trend Data                                */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/analytics/trend/:deviceId
 * Returns raw time-series telemetry data (temperature + humidity)
 * for visualization on charts or dashboards.
 */
router.get(
  "/analytics/trend/:deviceId",
  async (
    req: Request<{ deviceId: string }, any, any, { from?: string; to?: string }>,
    res: Response
  ) => {
    const { deviceId } = req.params;
    const { from, to } = req.query;

    try {
      const fromDate = from ? new Date(from) : new Date(Date.now() - 3600 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const records = await prisma.telemetry.findMany({
        where: { deviceId, time: { gte: fromDate, lte: toDate } },
        orderBy: { time: "asc" },
        select: { time: true, payload: true },
      });

      const trend = records.map((r) => {
        const p = r.payload as TelemetryPayload;
        return {
          time: r.time,
          temperature:
            typeof p.temperature === "number" ? p.temperature : null,
          humidity:
            typeof p.humidity === "number" ? p.humidity : null,
        };
      });

      res.json({ deviceId, count: trend.length, trend });
    } catch (err) {
      console.error("Trend error:", err);
      res.status(500).json({ error: "Failed to fetch trend data" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                           🧮 Aggregated Analytics                          */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/analytics/aggregate/:deviceId?interval=5
 * Groups data into time buckets (e.g. 5-minute averages) for smoother visualization.
 */
router.get(
  "/analytics/aggregate/:deviceId",
  async (
    req: Request<{ deviceId: string }, any, any, { from?: string; to?: string; interval?: string }>,
    res: Response
  ) => {
    const { deviceId } = req.params;
    const { from, to, interval } = req.query;

    try {
      const fromDate = from ? new Date(from) : new Date(Date.now() - 3600 * 1000);
      const toDate = to ? new Date(to) : new Date();
      const bucketMinutes = Number(interval ?? 5); // default: 5 minutes

      // 🧠 Use TimescaleDB's time_bucket for efficient aggregation
      const result = await prisma.$queryRawUnsafe(`
        SELECT 
          time_bucket('${bucketMinutes} minutes', "time") AS bucket,
          AVG((payload->>'temperature')::numeric) AS avg_temp,
          AVG((payload->>'humidity')::numeric) AS avg_humidity
        FROM "Telemetry"
        WHERE "deviceId" = '${deviceId}'
          AND "time" BETWEEN '${fromDate.toISOString()}' AND '${toDate.toISOString()}'
        GROUP BY bucket
        ORDER BY bucket ASC;
      `);

      res.json({ deviceId, bucketMinutes, data: result });
    } catch (err) {
      console.error("Aggregate analytics error:", err);
      res.status(500).json({ error: "Failed to fetch aggregated data" });
    }
  }
);

export default router;
