/**
 * 📦 handler.ts — مدیریت پیام‌های MQTT و ذخیره در TimescaleDB
 */
import { insertTelemetryBatch } from "../db/repository.js";

/**
 * ✅ این تابع هر پیام دریافتی از MQTT را پردازش و در دیتابیس ذخیره می‌کند.
 * پشتیبانی از هر دو حالت:
 *  - پیام تکی: {"temperature":25.7,"humidity":43}
 *  - پیام با payload: {"payload": {"temperature":25.7,"humidity":43}}
 */
export async function handleIncomingMessage(topic: string, rawMessage: string) {
  try {
    const data = JSON.parse(rawMessage);

    // درصورتی که چند پیام باهم بیاد (آرایه)، همه را پردازش کن
    const messages = Array.isArray(data) ? data : [data];

    const rows = messages.map((msg) => ({
      // اگر time داخل پیام بود، استفاده کن، وگرنه زمان فعلی
      time: msg.time ? new Date(msg.time) : new Date(),

      // استخراج deviceId از پیام یا از مسیر topic
      deviceId: msg.deviceId || topic.split("/").pop() || "unknown",

      topic,

      // ✅ اگر msg.payload وجود نداشت، خود msg را به عنوان payload ذخیره کن
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
