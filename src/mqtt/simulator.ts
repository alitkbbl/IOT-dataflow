import mqtt from "mqtt";
import { PrismaClient, Telemetry } from "@prisma/client";

const prisma = new PrismaClient();

// تنظیمات MQTT
const brokerUrl: string = process.env.MQTT_BROKER_URL || "mqtt://emqx:1883";
const topicBase: string = process.env.MQTT_TOPIC_BASE || "iot/data";
const client = mqtt.connect(brokerUrl, {
  username: process.env.MQTT_USERNAME || "admin",
  password: process.env.MQTT_PASSWORD || "public",
});

// سنسورهای شبیه‌سازی شده
const sensors: string[] = ["sensor-1", "sensor-2", "sensor-3"];

// داده اولیه هر سنسور
interface SensorState {
  temperature: number;
  humidity: number;
}

const sensorData: Record<string, SensorState> = {};
sensors.forEach((s) => {
  sensorData[s] = { temperature: 25, humidity: 50 };
});

// بازه انتشار (ms)
const interval: number = parseInt(process.env.PUBLISH_INTERVAL_MS || "5000", 10);

client.on("connect", () => {
  console.log("✅ Connected to MQTT broker:", brokerUrl);
  setInterval(publishAllSensors, interval);
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});

// تابع برای تولید داده با تغییرات طبیعی
function getRandomDelta(maxDelta: number): number {
  return (Math.random() - 0.5) * 2 * maxDelta;
}

interface Payload {
  deviceId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
}

function generatePayload(sensorId: string): Payload {
  const data = sensorData[sensorId];

  data.temperature = +(data.temperature + getRandomDelta(0.5)).toFixed(2);
  data.humidity = +(data.humidity + getRandomDelta(1)).toFixed(2);

  // جهش نادر
  if (Math.random() < 0.05) data.temperature += 5;

  return {
    deviceId: sensorId,
    timestamp: new Date().toISOString(),
    temperature: data.temperature,
    humidity: data.humidity,
  };
}

// ارسال و ذخیره داده هر سنسور
async function publishAndSave(sensorId: string) {
  const payload = generatePayload(sensorId);
  const topic = `${topicBase}/${sensorId}`;

  // ارسال به MQTT
  client.publish(topic, JSON.stringify(payload), { qos: 0 }, (err) => {
    if (err) console.error("❌ MQTT Publish failed:", err);
    else console.log("📡 Sent:", payload);
  });

  // ذخیره در PostgreSQL با Prisma
  try {
    await prisma.telemetry.create({
      data: {
        deviceId: sensorId,
        topic: topic,
        payload: JSON.parse(JSON.stringify(payload)),
        metadata: { source: "simulator" },
      },
    });
    console.log("💾 Saved to DB");
  } catch (err) {
    console.error("❌ DB save failed:", err);
  }
}

// ارسال همه سنسورها در هر بازه زمانی
function publishAllSensors() {
  sensors.forEach((sensor) => {
    publishAndSave(sensor);
  });
}
