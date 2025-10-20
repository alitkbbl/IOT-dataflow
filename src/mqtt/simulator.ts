import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
const client = mqtt.connect(brokerUrl);

const DEVICE_COUNT = 3;
const INTERVAL_MS = 2000;

client.on("connect", () => {
  console.log("🚀 Virtual IoT Client connected to MQTT broker");

  setInterval(() => {
    for (let i = 1; i <= DEVICE_COUNT; i++) {
      const payload = {
        deviceId: `sensor-${i}`,
        time: new Date().toISOString(),
        payload: {
          temperature: (20 + Math.random() * 5).toFixed(2),
          humidity: (40 + Math.random() * 10).toFixed(2),
        },
      };

      client.publish("iot/data/sensors", JSON.stringify(payload));
      console.log(`📤 Sent data from ${payload.deviceId}`);
    }
  }, INTERVAL_MS);
});

client.on("error", (err) => {
  console.error("❌ Virtual client error:", err);
});
