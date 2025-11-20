import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import fp from 'fastify-plugin';
import { ordersRoutes } from '../routes/orders';
import IORedis from 'ioredis';
import { closeQueue } from '../queue/orderQueue';
import { closeDb } from '../db';

describe('API routes', () => {
  let fastify: any;
  beforeAll(async () => {
    fastify = Fastify();
    fastify.register(websocketPlugin as any);
    fastify.register(fp(async (instance:any) => {
      const redis = new IORedis();
      instance.decorate('redis', redis);
    }));
    fastify.register(ordersRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.redis.quit();
    await fastify.close();
    await closeQueue();
    await closeDb();
  });

  it('POST /api/orders/execute returns orderId', async () => {
    const res = await fastify.inject({ method: 'POST', url: '/api/orders/execute', payload: { tokenIn:'A', tokenOut:'B', amount:1 } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.orderId).toBeTruthy();
  });
});
