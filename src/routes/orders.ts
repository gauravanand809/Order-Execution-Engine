import { FastifyInstance } from 'fastify';
import type { Order } from '../types';
import { randomUUID } from 'crypto';
import { enqueueOrder } from '../queue/orderQueue';
import { insertOrder } from '../repositories/orderRepository';

export async function ordersRoutes(fastify: FastifyInstance) {
  fastify.post('/api/orders/execute', async (request, reply) => {
    const body = request.body as any;
    const id = randomUUID();
    const order: Order = {
      id,
      type: 'market',
      tokenIn: body.tokenIn || 'TOKENA',
      tokenOut: body.tokenOut || 'TOKENB',
      amount: body.amount || 1,
      side: body.side || 'buy',
      createdAt: new Date().toISOString()
    };

    await insertOrder(order);
    await enqueueOrder(order);

    return { orderId: id };
  });

  fastify.get('/api/orders/status', { websocket: true }, (connection, req) => {
    // Client should connect and send a JSON message { "orderId": "..." }
    connection.socket.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        const orderId = data.orderId as string;
        if (!orderId) {
          connection.socket.send(JSON.stringify({ error: 'missing orderId' }));
          return;
        }

        const channel = `order:${orderId}`;
        const sub = fastify.redis.duplicate();
        sub.subscribe(channel).then(() => {
          sub.on('message', (ch: string, msg: string) => {
            connection.socket.send(msg);
          });
        });

        connection.socket.on('close', () => {
          try {
            sub.unsubscribe(channel).then(() => sub.quit());
          } catch (_) {}
        });
      } catch (err) {
        connection.socket.send(JSON.stringify({ error: 'invalid message' }));
      }
    });
  });
}
