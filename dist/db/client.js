/**
 * فایل اتصال به پایگاه داده با Prisma
 * این فایل فقط یک بار ساخته می‌شود و در کل پروژه استفاده می‌شود.
 */
const { PrismaClient } = require('@prisma/client');
export const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
});
(async () => {
    try {
        await prisma.$connect();
        console.log("✅ Connected to TimescaleDB via Prisma");
    }
    catch (err) {
        console.error("❌ Failed to connect DB:", err);
    }
})();
