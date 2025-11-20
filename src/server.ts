import dotenv from 'dotenv';
import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';
import websocketPlugin from '@fastify/websocket';
import fp from 'fastify-plugin';
import IORedis from 'ioredis';
import { ordersRoutes } from './routes/orders';
import { initDb } from './db';
import './queue/worker';
dotenv.config()
const fastify = Fastify({ logger: true });

fastify.register(websocketPlugin as any);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/', // optional: default '/'
});

// expose redis client on fastify instance
fastify.register(fp(async (instance) => {
  const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  instance.decorate('redis', redis);
}));

fastify.register(ordersRoutes);

const start = async () => {
  await initDb();
  await fastify.listen({ port: +(process.env.PORT || 3000), host: '0.0.0.0' });
  fastify.log.info('Server listening');
};

start().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
