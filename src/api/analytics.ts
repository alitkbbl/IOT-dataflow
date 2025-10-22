import express, { Request, Response } from "express";
import { prisma } from "../db/client.js";

const router = express.Router();

interface TelemetryPayload {
  temperature?: number;
  humidity?: number;
  [key: string]: unknown;
}

/**
 * 📊 دریافت آمار تحلیلی
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

      // 👇 تبدیل type ایمن‌تر
      const temperatures = data
        .map((d: { payload: unknown; }) => {
          const payload = d.payload as unknown as TelemetryPayload;
          return typeof payload.temperature === "number" ? payload.temperature : undefined;
        })
        .filter((t: any): t is number => typeof t === "number");

      const avg = temperatures.reduce((a: any, b: any) => a + b, 0) / temperatures.length;
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

/**
 * 📈 داده‌های ترند (برای نمودار)
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

      const data = await prisma.telemetry.findMany({
        where: { deviceId, time: { gte: fromDate, lte: toDate } },
        orderBy: { time: "asc" },
        select: { time: true, payload: true },
      });

      // 👇 اینجا هم cast ایمن‌تر
      const trend = data.map((d: { payload: unknown; time: any; }) => {
        const payload = d.payload as unknown as TelemetryPayload;
        return {
          time: d.time,
          temperature:
            typeof payload.temperature === "number" ? payload.temperature : null,
          humidity:
            typeof payload.humidity === "number" ? payload.humidity : null,
        };
      });

      res.json({ deviceId, trend });
    } catch (err) {
      console.error("Trend error:", err);
      res.status(500).json({ error: "Failed to fetch trend" });
    }
  }
);

export default router;
