import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { ordersRoutes } from '../routes/orders';
import IORedis from 'ioredis';
import WebSocket from 'ws';
import { closeQueue } from '../queue/orderQueue';
import { closeDb } from '../db';

describe('WebSocket lifecycle integration (mock)', () => {
  let fastify: any;
  let serverUrl: string;
  beforeAll(async () => {
    fastify = Fastify();
    fastify.register(websocketPlugin as any);
    fastify.register(fp(async (instance: FastifyInstance) => {
      const redis = new IORedis();
      instance.decorate('redis', redis);
    }));
    fastify.register(ordersRoutes);
    await fastify.listen({ port: 0 });
    const addr = fastify.server.address();
    const port = (addr as any).port;
    serverUrl = `ws://127.0.0.1:${port}/api/orders/status`;
  });

  afterAll(async () => {
    await fastify.redis.quit();
    await fastify.close();
    await closeQueue();
    await closeDb();
  });

  it('connects, subscribes and receives messages (simulated)', (done) => {
    // This test will connect but we won't actually enqueue a real job here; we assert websocket wiring
    const ws = new WebSocket(serverUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify({ orderId: 'non-existent' }));
      
      // Wait for subscription to happen, then publish
      setTimeout(async () => {
        const pub = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
        await pub.publish('order:non-existent', JSON.stringify({ status: 'test-msg' }));
        await pub.quit();
      }, 500);
    });
    ws.on('message', (msg: WebSocket.Data) => {
      // server will respond at least with something (error or not)
      expect(msg).toBeTruthy();
      const data = JSON.parse(msg.toString());
      expect(data.status).toBe('test-msg');
      ws.close();
      done();
    });
    ws.on('error', (err: Error) => {
      done(err);
    });
  });
});
