import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

(async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to TimescaleDB via Prisma");
  } catch (err) {
    console.error("❌ Failed to connect DB:", err);
  }
})();
