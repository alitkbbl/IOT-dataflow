import { insertTelemetryBatch } from "../db/repository.js";

export async function handleIncomingMessage(topic: string, rawMessage: string) {
  try {
    const data = JSON.parse(rawMessage);

    // پشتیبانی از هر دو حالت — تکی یا دسته‌ای
    const messages = Array.isArray(data) ? data : [data];

    const rows = messages.map((msg) => ({
      time: msg.time ? new Date(msg.time) : new Date(),
      deviceId: msg.deviceId || "unknown",
      topic,
      payload: msg.payload || {},
      seq: msg.seq || null,
      metadata: msg.metadata || {},
    }));

    const result = await insertTelemetryBatch(rows);
    console.log(`✅ Inserted ${result.inserted} telemetry records from MQTT`);
  } catch (err) {
    console.error("❌ Failed to process MQTT message:", err);
  }
}
