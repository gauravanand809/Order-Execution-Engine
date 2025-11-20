# Order Execution Engine (Mock)

A robust, scalable backend for executing DEX market orders with real-time updates.

**Live Demo:** [https://order-execution-engine-cr8x.onrender.com/](https://order-execution-engine-cr8x.onrender.com/)

## Overview

This project simulates a high-performance order execution engine for a Decentralized Exchange (DEX). It handles order submission, smart routing between liquidity sources (e.g., Raydium vs Meteora), asynchronous processing, and real-time status updates to the client.

**Chosen Order Type:** Market order — immediate execution at the best available price. This demonstrates the core routing logic, slippage handling, and event-driven architecture.

## Architecture & Design Decisions

The system is built with a microservices-ready architecture in mind, prioritizing concurrency, scalability, and user experience.

### 1. Tech Stack
-   **Fastify:** Chosen for its low overhead and high performance compared to Express.
-   **TypeScript:** Ensures type safety and better maintainability.
-   **PostgreSQL:** Relational DB for reliable storage of order history and structure data.
-   **Redis:** Used for both the job queue (BullMQ) and Pub/Sub (Real-time updates).

### 2. Asynchronous Processing (Queue)
-   **BullMQ:** Orders are not executed immediately upon HTTP request. Instead, they are pushed to a Redis-based queue.
-   **Benefit:** This decouples ingestion from execution. The API remains responsive even during high load. If the DEX interaction is slow, it doesn't block the API.
-   **Scalability:** Multiple workers can process the queue in parallel.

### 3. Real-time Updates (WebSockets)
-   **Redis Pub/Sub:** The worker publishes events (`pending`, `routing`, `submitted`, etc.) to a Redis channel.
-   **WebSocket:** The API subscribes to these channels and pushes updates to the client. This avoids polling and provides an "instant" feel.

### 4. Mock DEX Router
-   Simulates fetching quotes from multiple DEXs (Raydium, Meteora).
-   **Smart Routing:** Compares quotes and selects the one with the best price.
-   **Slippage & Execution:** Simulates network latency and execution results.

## Setup Instructions

### Prerequisites
-   Node.js (v16+)
-   Docker & Docker Compose (for Redis and Postgres)

### Local Development

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Infrastructure**
    Use Docker Compose to start Redis and PostgreSQL:
    ```bash
    docker-compose up -d
    ```

3.  **Configuration**
    Ensure `.env` is set up (created automatically or copy from example):
    ```env
    DB_URL="postgresql://user:password@localhost:5433/order_execution"
    REDIS_URL="redis://localhost:6379"
    ```

4.  **Start the Server**
    ```bash
    npm run start
    ```
    The server will start on `http://localhost:3000`.

5.  **Verify**
    Open `http://localhost:3000` in your browser to see the dashboard.

## API Usage

### Submit Order
```bash
POST /api/orders/execute
Content-Type: application/json

{
  "tokenIn": "SOL",
  "tokenOut": "USDC",
  "amount": 1
}
```

### WebSocket Updates
Connect to `ws://localhost:3000/api/orders/status`
Send message:
```json
{ "orderId": "<your-order-uuid>" }
```
Receive updates:
```json
{ "status": "routing" }
{ "status": "building", "route": { ... } }
{ "status": "confirmed", "txHash": "..." }
```

## Testing

Run the integration tests:
```bash
npm test
