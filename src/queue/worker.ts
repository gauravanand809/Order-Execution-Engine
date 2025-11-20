import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { MockDexRouter } from '../dex/mockDexRouter';
import { updateOrderStatus } from '../repositories/orderRepository';
import { pub } from './orderQueue';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const dex = new MockDexRouter();

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

const worker = new Worker(
  'orders',
  async (job) => {
    const order = job.data;
    const channel = `order:${order.id}`;

    await pub.publish(channel, JSON.stringify({ status: 'pending' }));
    await updateOrderStatus(order.id, 'pending');

    try {
      await pub.publish(channel, JSON.stringify({ status: 'routing' }));
      await updateOrderStatus(order.id, 'routing');

      const [r1, r2] = await Promise.all([
        dex.getRaydiumQuote(order.tokenIn, order.tokenOut, order.amount),
        dex.getMeteoraQuote(order.tokenIn, order.tokenOut, order.amount)
      ]);

      const chosen = r1.price > r2.price ? r1 : r2;
      await pub.publish(channel, JSON.stringify({ status: 'building', route: chosen }));
      await updateOrderStatus(order.id, 'building');

      // simulate building tx
      await sleep(300);
      await pub.publish(channel, JSON.stringify({ status: 'submitted' }));
      await updateOrderStatus(order.id, 'submitted');

      const exec = await dex.executeSwap(chosen.dex, order);

      await pub.publish(channel, JSON.stringify({ status: 'confirmed', txHash: exec.txHash, executedPrice: exec.executedPrice }));
      await updateOrderStatus(order.id, 'confirmed');
    } catch (err: any) {
      const message = err?.message || String(err);
      await pub.publish(channel, JSON.stringify({ status: 'failed', error: message }));
      await updateOrderStatus(order.id, 'failed', message);
      throw err;
    }
  },
  { connection ,concurrency:10}
);

export default worker;
