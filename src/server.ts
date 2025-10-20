/**
 * نقطه شروع برنامه IOT-DATAFLOW
 * Express server + API routes
 */
import express from "express";
import dotenv from "dotenv";
import healthRoute from "./api/health.js";
import metricsRoute from "./api/metrics.js";
import queryRoute from "./api/query.js";
import "./mqtt/index.ts";
import analyticsRoute from "./api/analytics.js";



dotenv.config();

const app = express();
app.use(express.json());

// مسیرهای API
app.use("/api", healthRoute);
app.use("/api", metricsRoute);
app.use("/api", queryRoute);
app.use("/api", analyticsRoute);


// راه‌اندازی سرور
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`🚀 IOT-DATAFLOW API running on port ${PORT}`);
});
