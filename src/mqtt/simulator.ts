import mqtt from "mqtt";
import { PrismaClient, Telemetry } from "@prisma/client";

const prisma = new PrismaClient();

// setting MQTT
const brokerUrl: string = process.env.MQTT_BROKER_URL || "mqtt://emqx:1883";
const topicBase: string = process.env.MQTT_TOPIC_BASE || "iot/data";
const client = mqtt.connect(brokerUrl, {
  username: process.env.MQTT_USERNAME || "admin",
  password: process.env.MQTT_PASSWORD || "public",
});

const sensors: string[] = ["sensor-1", "sensor-2", "sensor-3"];


interface SensorState {
  temperature: number;
  humidity: number;
}

const sensorData: Record<string, SensorState> = {};
sensors.forEach((s) => {
  sensorData[s] = { temperature: 25, humidity: 50 };
});

// (ms)
const interval: number = parseInt(process.env.PUBLISH_INTERVAL_MS || "5000", 10);

client.on("connect", () => {
  console.log("✅ Connected to MQTT broker:", brokerUrl);
  setInterval(publishAllSensors, interval);
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});

// generate func
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

  if (Math.random() < 0.05) data.temperature += 5;

  return {
    deviceId: sensorId,
    timestamp: new Date().toISOString(),
    temperature: data.temperature,
    humidity: data.humidity,
  };
}

async function publishAndSave(sensorId: string) {
  const payload = generatePayload(sensorId);
  const topic = `${topicBase}/${sensorId}`;

  // MQTT send
  client.publish(topic, JSON.stringify(payload), { qos: 0 }, (err) => {
    if (err) console.error("❌ MQTT Publish failed:", err);
    else console.log("📡 Sent:", payload);
  });

  // save
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

function publishAllSensors() {
  sensors.forEach((sensor) => {
    publishAndSave(sensor);
  });
}
