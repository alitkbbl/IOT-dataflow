-- CreateTable
CREATE TABLE "Telemetry" (
    "id" BIGSERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT NOT NULL,
    "topic" TEXT,
    "payload" JSONB NOT NULL,
    "seq" BIGINT,
    "metadata" JSONB,

    CONSTRAINT "Telemetry_pkey" PRIMARY KEY ("id")
);
