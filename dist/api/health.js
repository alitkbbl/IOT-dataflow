/**
 * بررسی سلامت سیستم و پایگاه داده
 */
import express from "express";
import { checkDBHealth } from "../db/repository.js";
const router = express.Router();
router.get("/health", async (_req, res) => {
    const dbOk = await checkDBHealth();
    const status = {
        status: dbOk ? "ok" : "degraded",
        database: dbOk ? "connected" : "disconnected",
        uptime: `${process.uptime().toFixed(1)}s`,
        timestamp: new Date().toISOString(),
    };
    res.status(dbOk ? 200 : 500).json(status);
});
export default router;
