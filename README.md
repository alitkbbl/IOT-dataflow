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
┌─────────────────┐    HTTP REST     ┌─────────────────┐
│   Client        │ ←─────────────── │   Node.js API   │
│  Applications   │                 │   (Express)     │
└─────────────────┘                 └─────────┬───────┘
                                              │
                                              ↓ Prisma ORM
                                        ┌─────────────────┐
                                        │   TimescaleDB   │
                                        │  (PostgreSQL)   │
                                        └─────────────────┘
```

Sure, here's the table in Markdown format that you can include in your README.md file:
| Component | Technology | Purpose |
| --- | --- | --- |
| MQTT Broker | EMQX 5.x | Real-time message broker |
| API Server | Node.js + Express | Data processing & APIs |
| Database | TimescaleDB | Time-series data storage |
| ORM | Prisma | Database operations |
| Simulator | Custom Node.js | Virtual IoT devices |








