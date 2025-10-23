/**
 * 📦 Repository Layer — Database Access Functions
 * ------------------------------------------------
 * This file defines all interactions between the application
 * and the TimescaleDB database via Prisma ORM.
 * 
 * It provides:
 *   - Bulk insert of telemetry data from IoT devices
 *   - Querying telemetry data for analytics and visualization
 *   - Database health checking
 */

import { prisma } from "./client.js";

/**
 * 🧩 Interface — Shape of a telemetry record before insertion
 * 
 * This mirrors the structure of the "Telemetry" model in Prisma schema.
 */
export interface TelemetryInput {
  time: Date;                        // Timestamp of data capture
  deviceId: string;                  // Unique device identifier (e.g., "sensor-1")
  topic?: string;                    // MQTT topic from which data arrived
  payload: Record<string, any>;      // Actual sensor readings (temperature, humidity, etc.)
  seq?: bigint;                      // Optional sequence number for ordering
  metadata?: Record<string, any>;    // Additional optional metadata (IP, firmware, etc.)
}

/**
 * 🧠 Bulk insert telemetry data into TimescaleDB
 * 
 * This function efficiently inserts multiple telemetry rows at once.
 * It is optimized for high-frequency IoT data ingestion.
 * 
 * - Uses Prisma's `createMany()` for batch insert.
 * - `skipDuplicates` avoids duplicate errors in case of re-publishing.
 * - Returns the number of inserted rows.
 */
export async function insertTelemetryBatch(rows: TelemetryInput[]) {
  if (!rows.length) {
    return { inserted: 0 };
  }

  try {
    await prisma.telemetry.createMany({
      data: rows.map((r) => ({
        time: r.time,
        deviceId: r.deviceId,
        topic: r.topic ?? null,
        payload: r.payload,
        seq: r.seq ?? null,
        metadata: r.metadata ?? {},
      })),
      skipDuplicates: true,
    });

    return { inserted: rows.length };
  } catch (error) {
    console.error("❌ Failed to insert telemetry batch:", error);
    throw new Error("Database insertion failed");
  }
}

/**
 * 🔍 Query telemetry data for a given device within a time range
 * 
 * - Fetches recent telemetry records for a device.
 * - Sorted by timestamp (descending).
 * - Supports a limit on returned rows (default: 100).
 * 
 * Used in `/api/query` and `/api/analytics` routes.
 */
export async function getTelemetry(
  deviceId: string,
  from: Date,
  to: Date,
  limit = 100
) {
  try {
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
  } catch (error) {
    console.error("❌ Failed to fetch telemetry data:", error);
    throw new Error("Database query failed");
  }
}

/**
 * ❤️ Health check — Verifies database connectivity
 * 
 * Runs a simple raw query `SELECT 1` to confirm that
 * the TimescaleDB connection is active and healthy.
 * 
 * Returns:
 *   - `true` if DB is reachable
 *   - `false` if any error occurs
 * 
 * Used in `/api/health` endpoint.
 */
export async function checkDBHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("⚠️ Database health check failed:", error);
    return false;
  }
}
