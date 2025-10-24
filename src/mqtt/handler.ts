/**
 * 📦 handler.ts - MQTT Messages Handler & TimescaleDB Storage
 */
import { insertTelemetryBatch } from "../db/repository.js";

/**
 * ✅ This function processes every MQTT message received and stores it in the database.
 * Supports both formats:
 *   - Single message: {"temperature":25.7,"humidity":43}
 *  - Message with payload: {"payload": {"temperature":25.7,"humidity":43}}
 */
export async function handleIncomingMessage(topic: string, rawMessage: string) {
  try {
    const data = JSON.parse(rawMessage);

    const messages = Array.isArray(data) ? data : [data];

    const rows = messages.map((msg) => ({
      time: msg.time ? new Date(msg.time) : new Date(),

      deviceId: msg.deviceId || topic.split("/").pop() || "unknown",

      topic,

      // ✅ If msg.payload doesn't exist, save msg itself as the payload
      payload: msg.payload ? msg.payload : msg,

      seq: msg.seq || null,
      metadata: msg.metadata || {},
    }));

    const result = await insertTelemetryBatch(rows);
    console.log(`✅ Inserted ${result.inserted} telemetry records from MQTT`);
  } catch (err) {
    console.error("❌ Failed to process MQTT message:", err);
  }
}
