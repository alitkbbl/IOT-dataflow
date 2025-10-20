import express, { Request, Response } from "express";
import { prisma } from "../db/client.js";

const router = express.Router();

/**
 * 📊 نوع داده‌ی telemetry در payload
 */
interface TelemetryPayload {
  temperature?: number;
  humidity?: number;
  [key: string]: unknown;
}

/**
 * 📊 Endpoint: آمار میانگین/حداقل/حداکثر برای دستگاه خاص
 * GET /api/analytics/device/:deviceId?from=2025-10-20&to=2025-10-21
 */
router.get(
  "/analytics/device/:deviceId",
  async (
    req: Request<{ deviceId: string }, unknown, unknown, { from?: string; to?: string }>,
    res: Response
  ) => {
    const { deviceId } = req.params;
    const { from, to } = req.query;

    try {
      const fromDate = from ? new Date(from) : new Date(Date.now() - 3600 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const data = await prisma.telemetry.findMany({
        where: {
          deviceId,
          time: { gte: fromDate, lte: toDate },
        },
        select: { payload: true, time: true },
      });

      if (data.length === 0) {
        return res.json({ deviceId, count: 0, avg: null, min: null, max: null });
      }

      // استخراج دماها از payload
      const temperatures = data
        .map((d: { payload: TelemetryPayload; }) => (d.payload as TelemetryPayload).temperature)
        .filter((t: any): t is number => typeof t === "number");

      const avg = temperatures.reduce((a: any, b: any) => a + b, 0) / temperatures.length;
      const min = Math.min(...temperatures);
      const max = Math.max(...temperatures);

      return res.json({
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
      return res.status(500).json({ error: "Failed to compute analytics" });
    }
  }
);

/**
 * 📈 Endpoint: داده‌های تایم‌سری برای ترند
 * GET /api/analytics/trend/:deviceId?from=2025-10-20&to=2025-10-21
 */
router.get(
  "/analytics/trend/:deviceId",
  async (
    req: Request<{ deviceId: string }, unknown, unknown, { from?: string; to?: string }>,
    res: Response
  ) => {
    const { deviceId } = req.params;
    const { from, to } = req.query;

    try {
      const fromDate = from ? new Date(from) : new Date(Date.now() - 3600 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const data = await prisma.telemetry.findMany({
        where: { deviceId, time: { gte: fromDate, lte: toDate } },
        orderBy: { time: "asc" },
        select: { time: true, payload: true },
      });

      const trend = data.map((d: { payload: TelemetryPayload; time: any; }) => {
        const payload = d.payload as TelemetryPayload;
        return {
          time: d.time,
          temperature: payload.temperature ?? null,
          humidity: payload.humidity ?? null,
        };
      });

      return res.json({ deviceId, trend });
    } catch (err) {
      console.error("Trend error:", err);
      return res.status(500).json({ error: "Failed to fetch trend" });
    }
  }
);

export default router;
