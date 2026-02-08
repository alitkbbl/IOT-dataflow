# 🌐 IoT Data Flow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A robust, scalable **IoT** data pipeline enabling real-time data ingestion from virtual devices to TimescaleDB via MQTT and HTTP protocols.

## 📖 Overview

**IoT Data Flow** is a complete backend solution designed to handle high-throughput telemetry data. It simulates IoT devices, captures data through an **EMQX MQTT Broker**, processes it via a **Node.js** service, and stores it efficiently in **TimescaleDB** (PostgreSQL) using **Prisma ORM**. It also provides a comprehensive REST API for querying historical data, trends, and aggregations.

## ✨ Key Features

- 🚀 **Real-time Ingestion**: High-performance MQTT messaging using EMQX 5.x.
- 💾 **Time-Series Storage**: Optimized data storage using TimescaleDB hyper-tables.
- 📊 **Advanced Analytics**: Built-in APIs for trends, aggregations (5m, 1h), and device stats.
- 🛠 **Virtual Simulator**: Custom Node.js script to simulate multiple IoT sensors.
- 🐳 **Dockerized**: Fully containerized environment for easy deployment.
- 📈 **Monitoring**: Prometheus metrics endpoint ready.

## 🏗️ System Architecture
```mermaid
graph LR
subgraph "Data Source"
D1[Virtual Device 1]
D2[Virtual Device 2]
end

subgraph "Message Broker"
MQTT[EMQX Broker]
end

subgraph "Backend Service"
API[Node.js API / Worker]
end

subgraph "Storage"
DB[(TimescaleDB)]
end

Client[Client App]

D1 & D2 -->|MQTT Pub| MQTT
MQTT -->|MQTT Sub| API
API -->|Prisma Write| DB
Client -->|HTTP GET| API
API -->|Prisma Read| DB
```

---

### 📦 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Broker** | EMQX 5.x | Enterprise-grade MQTT broker for IoT |
| **Runtime** | Node.js + Express | API server and data processing worker |
| **Database** | TimescaleDB | PostgreSQL extension for time-series data |
| **ORM** | Prisma | Type-safe database client |
| **Container** | Docker | Application containerization |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+) - *Optional for local dev*
- [Git](https://git-scm.com/)

### Installation
1. **Clone the repository**
   
```bash
   git clone https://github.com/alitkbbl/IOT-dataflow.git
   cd IOT-dataflow
```
2. **Environment ConfigurationCreate a .env file (or use the default provided in docker-compose):**
```bash
   PORT=3000
   DATABASE_URL="postgresql://postgres:password@timescaledb:5432/iot_db?schema=public"
   MQTT_BROKER_URL="mqtt://emqx:1883"
```
3. **Run with Docker (Recommended)**
```bash
   # 🟢 Start all services in detached mode
   docker compose up --build -d

   # 📊 Check running containers
   docker compose ps

   # 📜 Stream logs
   docker compose logs -f
```
4. **Stop Services**
```bash
   docker compose down -v
```

---

## 📡 Usage & Testing

### 1. Ingest Data (MQTT)

You can use the built-in simulator or `mosquitto_pub` to send data manually.

**Using Mosquitto Client:**
```bash
mosquitto_pub -h localhost -p 1883 \
  -t "iot/data/device-001" \
  -m '{"temperature":24.7, "humidity":42, "battery": 95}'
```
### 2. API Endpoints

**Base URL:** `http://localhost:3000`

#### 🩺 System Status
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check service and DB connection status |
| `GET` | `/api/metrics` | Prometheus metrics for monitoring |

#### 📊 Analytics & Data
| Method | Endpoint | Description | Example Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/query` | Retrieve raw telemetry data | `?device_id=sensor-1&limit=10` |
| `GET` | `/api/analytics/device/:id` | Statistical summary (Min/Max/Avg) | `?from=2024-01-01&to=2024-01-02` |
| `GET` | `/api/analytics/trend/:id` | Trend analysis over time | `?from=...&to=...` |
| `GET` | `/api/analytics/aggregate/:id` | Data aggregation (e.g., 5 min) | `?interval=5&from=...` |

---

## 🧪 Example Requests

#### Check Health:
```bash
curl -s http://localhost:3000/api/health
```

#### Get Device Statistics:
```bash
curl "http://localhost:3000/api/analytics/device/sensor-1?from=2024-01-15T00:00:00Z&to=2024-01-15T23:59:59Z"
```

#### Response Preview:
```json
{
  "deviceId": "sensor",
  "count": 150,
  "avg": 24.5,
  "min": 22.1,
  "max": 26.8,
  "period": {
    "from": "2024-01-15T00:00:00Z",
    "to": "2024-01-15T23:59:59Z"
  }
}
```

#### 📊 Metrics (Prometheus)
```bash
curl http://localhost:3000/api/metrics
```

#### 🔎 Query Telemetry Data
```bash
curl "http://localhost:3000/api/query?device_id=sensor-1&from=2024-01-15T00:00:00Z&to=2024-01-15T23:59:59Z&limit=10"
```


#### 📈 Trend Data
```bash
curl "http://localhost:3000/api/analytics/trend/sensor-1?from=2024-01-15T10:00:00Z&to=2024-01-15T11:00:00Z"
```

#### 📊 Aggregated Data (5-minute intervals)
```bash
curl "http://localhost:3000/api/analytics/aggregate/sensor-1?interval=5&from=2024-01-15T10:00:00Z&to=2024-01-15T11:00:00Z"
```


#### 🔄 Reset Everything

```bash

docker compose down -v
docker compose up -d
```
---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software in compliance with the license terms.

