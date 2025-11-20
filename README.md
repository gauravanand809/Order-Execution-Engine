# Order Execution Engine (Mock)

**Chosen Order Type:** Market order — immediate execution at current price. Chosen for clarity: market orders exercise routing, slippage handling, and immediate lifecycle events. Limit and sniper orders can be added by adding a watcher that monitors on-chain prices or pending order queue and triggers execution when criteria match.

Overview
- Fastify + TypeScript server
- Mock DEX router simulating Raydium and Meteora quotes and execution
- BullMQ + Redis for queuing and concurrency
- Postgres for order history
- WebSocket subscription for per-order lifecycle updates via Redis pub/sub

Key endpoints
- POST `/api/orders/execute` — submit an order, returns `{ orderId }`
- GET `/api/orders/execute` (WebSocket) — connect and send `{ "orderId": "..." }` to subscribe to status updates

Status events: `pending`, `routing`, `building`, `submitted`, `confirmed`, `failed`.

Quickstart (dev)
1. Install dependencies:
```powershell
npm install
```
2. Start Redis and Postgres locally (or set `REDIS_URL` and `DATABASE_URL`).
3. Start server:
```powershell
npm run start
```
4. Submit an order (example):
```powershell
curl -X POST http://localhost:3000/api/orders/execute -H "Content-Type: application/json" -d '{"tokenIn":"TOKENA","tokenOut":"TOKENB","amount":1}'
```
5. Connect a websocket client to `ws://localhost:3000/api/orders/execute` and send `{ "orderId": "<id>" }` to see events.

Tests
- Run `npm test` to execute Jest tests covering DEX router, routing selection, and lifecycle publishing.

Postman
- A simple Postman collection `postman_collection.json` is included.

Notes
- This is a mock implementation intended to demonstrate architecture, routing decisions, queueing, and WebSocket streaming. Replacing `MockDexRouter` with actual SDK calls (Raydium/Meteora) is straightforward: implement the same `get*Quote` and `executeSwap` methods using the respective SDKs, handle wrapping SOL, and keep the same event publishing flow.
