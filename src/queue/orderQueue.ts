import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

export const orderQueue = new Queue('orders', { connection });
export const pub = connection.duplicate();

export async function enqueueOrder(job: any) {
  await orderQueue.add('execute', job, { attempts: 3, backoff: { type: 'exponential', delay: 500 } });
}

export async function closeQueue() {
  await orderQueue.close();
  await pub.quit();
  await connection.quit();
}
