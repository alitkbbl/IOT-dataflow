import mqtt from "mqtt";
import dotenv from "dotenv";
import { handleIncomingMessage } from "./handler.ts";

dotenv.config();

const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
const topic = process.env.MQTT_TOPIC || "iot/data/#";

console.log(`📡 Connecting to MQTT broker at ${brokerUrl} ...`);

const client = mqtt.connect(brokerUrl);

client.on("connect", () => {
  console.log(`✅ Connected to MQTT broker`);
  client.subscribe(topic, (err) => {
    if (err) {
      console.error("❌ Failed to subscribe to topic:", err);
    } else {
      console.log(`📨 Subscribed to topic: ${topic}`);
    }
  });
});

client.on("message", async (topic, message) => {
  try {
    await handleIncomingMessage(topic, message.toString());
  } catch (err) {
    console.error("❌ Error handling message:", err);
  }
});

client.on("error", (err) => {
  console.error("MQTT Client Error:", err);
});

export default client;
