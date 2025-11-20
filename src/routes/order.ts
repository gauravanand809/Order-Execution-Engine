import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sequenceJob } from "../queue-worker/queue.js";
const orderSchema = {
  body: {
    type: "object",
    required: ["amount", "email", "password"],
    properties: {
      amount: {
        type: "number",
      },
      email: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        job_status: {
          type: "string",
        },
        id: {
          type: "string",
        },
        token: {
          type: "string",
        },
      },
      required: ["id", "job_status", "token"],
    },
  },
};

import type { FastifyInstance } from "fastify";
async function orderRouter(fastify: FastifyInstance, opts: object) {
  fastify.post("/api/orders/execute", { schema: orderSchema }, async (request, reply) => {
    const job_id = uuidv4();
    const token = jwt.sign(
      {
        id: job_id,
      },
      process.env.AUTH_SECRET || "MeinNahiBatunga"
    );

    await sequenceJob.add(
      `{job_id}`,
      {
        id: job_id,
        amount: 10000,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );
    reply.code(201);
    return {
      job_status: "PENDING",
      id: job_id,
      token: token,
    };
  });
}

export default orderRouter;
