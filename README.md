# IoT Data Flow Project 🌐

Complete IoT data pipeline from virtual devices to TimescaleDB with MQTT and HTTP support.

## 🏗️ System Architecture

```ascii
┌─────────────────┐    MQTT/HTTP    ┌─────────────────┐
│   Virtual       │ ──────────────→ │   EMQX Broker   │
│   Devices       │                 │   (MQTT)        │
│  (sensor-1,2,3) │                 │                 │
└─────────────────┘                 └─────────┬───────┘
                                              │
                                         Subscribe
                                              │
                                              ↓ MQTT
┌─────────────────┐    HTTP REST    ┌─────────────────┐
│   Client        │ ←───────────────│   Node.js API   │
│  Applications   │                 │   (Express)     │
└─────────────────┘                 └─────────┬───────┘
                                              │
                                              ↓ Prisma ORM
                                        ┌─────────────────┐
                                        │   TimescaleDB   │
                                        │  (PostgreSQL)   │
                                        └─────────────────┘
```
### 📦 Core Components

| Component | Technology | Purpose |
| --- | --- | --- |
| MQTT Broker | EMQX 5.x | Real-time message broker |
| API Server | Node.js + Express | Data processing & APIs |
| Database | TimescaleDB | Time-series data storage |
| ORM | Prisma | Database operations |
| Simulator | Custom Node.js | Virtual IoT devices |


### 🚀 Quick Start

Prerequisites

    Docker & Docker Compose

    Node.js 18+

1. Clone & Setup
```bash

git clone https://github.com/alitkbbl/IOT-dataflow.git
cd IOT-dataflow
```
2. Run with Docker
```bash
# 🟢 Start services
docker compose up --build -d

# 📊 Check status
docker compose ps
# or
docker ps

# 🔍 View logs
docker compose logs -f

# 🔴 Stop services
docker compose down -v

```
### 📡 Test Data Ingestion

#### MQTT Data (using mosquitto_pub)

```bash
mosquitto_pub -h localhost -p 1883 -t "iot/data/device-001" -m '{"temperature":24.7,"humidity":42}'
```

### 🧪 Testing All APIs

#### 🔍 Health Check

```bash

curl http://localhost:3000/api/health
```
Response:
```json

{
  "status": "ok",
  "database": "connected",
  "uptime": "45.2s",
  "timestamp": "2024-01-15T10:30:00.000Z"
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

#### 📈 Analytics APIs

Device Statistics
```bash

curl "http://localhost:3000/api/analytics/device/sensor-1?from=2024-01-15T00:00:00Z&to=2024-01-15T23:59:59Z"
```
Response:
```json

{
  "deviceId": "sensor-1",
  "count": 150,
  "avg": 24.5,
  "min": 22.1,
  "max": 26.8,
  "from": "2024-01-15T00:00:00.000Z",
  "to": "2024-01-15T23:59:59.000Z"
}
```

#### 📈 Trend Data

```bash

curl "http://localhost:3000/api/analytics/trend/sensor-1?from=2024-01-15T10:00:00Z&to=2024-01-15T11:00:00Z"
```

#### 📊 Aggregated Data (5-minute intervals)

```bash

curl "http://localhost:3000/api/analytics/aggregate/sensor-1?interval=5&from=2024-01-15T10:00:00Z&to=2024-01-15T11:00:00Z"
```


### 🔄 Reset Everything

```bash

docker compose down -v
docker compose up -d
```
