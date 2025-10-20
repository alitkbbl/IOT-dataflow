/**
 * توابع تعامل با دیتابیس:
 * درج دسته‌ای داده‌ها و واکشی داده‌ها از TimescaleDB
 */
import { prisma } from "./client.ts";

/**
 * مدل داده‌ای Telemetry مطابق با Prisma Schema
 */
export interface TelemetryInput {
  time: Date;
  deviceId: string;
  topic?: string;
  payload: Record<string, any>;
  seq?: bigint;
  metadata?: Record<string, any>;
}

/**
 * درج دسته‌ای (bulk insert) داده‌های telemetry
 * @param rows آرایه‌ای از رکوردهای داده‌ای
 */
export async function insertTelemetryBatch(rows: TelemetryInput[]) {
  if (!rows.length) return { inserted: 0 };

  await prisma.telemetry.createMany({
    data: rows.map((r) => ({
      time: r.time,
      deviceId: r.deviceId,
      topic: r.topic ?? null,
      payload: r.payload,
      seq: r.seq ?? null,
      metadata: r.metadata ?? {},
    })),
    skipDuplicates: true, // از درج تکراری جلوگیری می‌کند
  });

  return { inserted: rows.length };
}

/**
 * کوئری داده‌ها برای یک دستگاه در بازه زمانی مشخص
 * @param deviceId شناسه دستگاه
 * @param from شروع بازه
 * @param to پایان بازه
 */
export async function getTelemetry(deviceId: string, from: Date, to: Date, limit = 100) {
  const data = await prisma.telemetry.findMany({
    where: {
      deviceId,
      time: {
        gte: from,
        lte: to,
      },
    },
    orderBy: { time: "desc" },
    take: limit,
  });
  return data;
}

/**
 * بررسی سلامت اتصال دیتابیس
 */
export async function checkDBHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    console.error("DB health check failed:", err);
    return false;
  }
}
