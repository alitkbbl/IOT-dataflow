/**
 * Endpoint کوئری داده‌ها از TimescaleDB
 */
import express from "express";
import { getTelemetry } from "../db/repository.js";
const router = express.Router();
router.get("/query", async (req, res) => {
    try {
        const { device_id, from, to, limit } = req.query;
        if (!device_id || !from || !to) {
            return res.status(400).json({
                error: "device_id, from, and to query parameters are required",
            });
        }
        const data = await getTelemetry(String(device_id), new Date(String(from)), new Date(String(to)), limit ? Number(limit) : 100);
        res.json({ count: data.length, data });
    }
    catch (err) {
        console.error("Error in /query:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
export default router;
