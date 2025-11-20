import { Worker } from "bullmq";
import IORedis from "ioredis";
import { MockDexRouter } from "../dex/mockDexRouter";
import { updateOrderStatus } from "../repositories/orderRepository";
import { pub } from "./orderQueue";

const connection = new IORedis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
  }
);

const dex = new MockDexRouter();

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

const worker = new Worker(
  "orders",
  async (job) => {
    const order = job.data;
    const channel = `order:${order.id}`;

    console.log(`\n===== [START] ORDER ${order.id} → PENDING =====`);
    console.log(`[PENDING] Order received and queued`);
    await pub.publish(channel, JSON.stringify({ status: "pending" }));
    await updateOrderStatus(order.id, "pending");

    try {
      console.log(`\n----- [ROUTING] ORDER ${order.id} -----`);
      await pub.publish(channel, JSON.stringify({ status: "routing" }));
      await updateOrderStatus(order.id, "routing");

      const [r1, r2] = await Promise.all([
        dex.getRaydiumQuote(order.tokenIn, order.tokenOut, order.amount),
        dex.getMeteoraQuote(order.tokenIn, order.tokenOut, order.amount),
      ]);

      console.log(`\n----- [QUOTES] ORDER ${order.id} -----`);
      console.log(`[QUOTE] Raydium →`, r1);
      console.log(`[QUOTE] Meteora →`, r2);

      const chosen = r1.price > r2.price ? r1 : r2;

      console.log(`\n----- [BUILDING ROUTE] ORDER ${order.id} -----`);
      console.log(`[ROUTE] Selected → ${chosen.dex}`, chosen);
      await pub.publish(
        channel,
        JSON.stringify({ status: "building", route: chosen })
      );
      await updateOrderStatus(order.id, "building");

      await sleep(300);

      console.log(`\n----- [SUBMITTED] ORDER ${order.id} -----`);
      await pub.publish(channel, JSON.stringify({ status: "submitted" }));
      await updateOrderStatus(order.id, "submitted");

      console.log(
        `\n----- [EXECUTING] ORDER ${order.id} on ${chosen.dex} -----`
      );
      const exec = await dex.executeSwap(chosen.dex, order);

      console.log(`\n===== [CONFIRMED] ORDER ${order.id} =====`);
      console.log(`[TX]`, exec);

      await pub.publish(
        channel,
        JSON.stringify({
          status: "confirmed",
          txHash: exec.txHash,
          executedPrice: exec.executedPrice,
        })
      );
      await updateOrderStatus(order.id, "confirmed");
    } catch (err: any) {
      const message = err?.message || String(err);

      console.log(`\n===== [FAILED] ORDER ${order.id} =====`);
      console.log(`[ERROR] ${message}`);

      await pub.publish(
        channel,
        JSON.stringify({ status: "failed", error: message })
      );
      await updateOrderStatus(order.id, "failed", message);

      throw err;
    }
  },
  { connection, concurrency: 10 }
);

export default worker;
