import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sequenceJob } from "../queue-worker/queue.js";
import { QueueEvents } from "bullmq";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { Job } from "bullmq";
import { bullConnection } from "../redis-connection.js";

// Create a QueueEvents instance for listening to job events
const queueEvents = new QueueEvents("sequenceJob", { connection: bullConnection });

const orderSchema = {
  body: {
    type: "object",
    required: ["amount"],
    properties: {
      amount: {
        type: "number",
      },
    },
  },
};

async function orderRouter(fastify: FastifyInstance, opts: object) {
  fastify.route({
    method: "POST",
    url: "/api/orders/execute",
    schema: orderSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const jobId = uuidv4();
      const token = jwt.sign({ id: jobId }, process.env.AUTH_SECRET || "MeinNahiBatunga");

      // Enqueue the job
      await sequenceJob.add(
        `${jobId}`,
        {
          id: jobId,
          amount: (request.body as any).amount,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );

      // Return the orderId immediately
      return { orderId: jobId, token };
    },
    wsHandler: (connection, req) => {
      // Extract jobId from the JWT token in the handshake
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        connection.socket.send(JSON.stringify({ error: "Authorization token missing" }));
        connection.socket.close();
        return;
      }

      let jobId: string;
      try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET || "MeinNahiBatunga") as { id: string };
        jobId = decoded.id;
      } catch (err) {
        connection.socket.send(JSON.stringify({ error: "Invalid token" }));
        connection.socket.close();
        return;
      }

      const sendUpdate = (status: string, data: any = {}) => {
        connection.socket.send(
          JSON.stringify({
            orderId: jobId,
            status,
            timestamp: new Date().toISOString(),
            ...data,
          })
        );
      };

      // Send initial PENDING event with the orderId and token
      sendUpdate("PENDING", { token });

      // Listen for job events
      const handleJobCompletion = async (args: { jobId: string; returnvalue: any }) => {
        if (args.jobId === jobId) {
          sendUpdate("COMPLETED", { returnValue: args.returnvalue });
          cleanup();
          connection.socket.close();
        }
      };

      const handleJobFailure = async (args: { jobId: string; failedReason: string }) => {
        if (args.jobId === jobId) {
          sendUpdate("FAILED", { error: args.failedReason });
          cleanup();
          connection.socket.close();
        }
      };

      const cleanup = () => {
        queueEvents.off('completed', handleJobCompletion);
        queueEvents.off('failed', handleJobFailure);
      };

      // Attach event listeners
      queueEvents.on('completed', handleJobCompletion);
      queueEvents.on('failed', handleJobFailure);

      connection.socket.on("close", () => {
        cleanup();
      });
    },
  });
}

export default orderRouter;