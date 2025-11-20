"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const queue_js_1 = require("../queue-worker/queue.js");
const bullmq_1 = require("bullmq");
const redis_connection_js_1 = require("../redis-connection.js");
// Create a QueueEvents instance for listening to job events
const queueEvents = new bullmq_1.QueueEvents("sequenceJob", { connection: redis_connection_js_1.bullConnection });
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
async function orderRouter(fastify, opts) {
    fastify.route({
        method: "POST",
        url: "/api/orders/execute",
        schema: orderSchema,
        handler: async (request, reply) => {
            const jobId = (0, uuid_1.v4)();
            const token = jsonwebtoken_1.default.sign({ id: jobId }, process.env.AUTH_SECRET || "MeinNahiBatunga");
            // Enqueue the job
            await queue_js_1.sequenceJob.add(`${jobId}`, {
                id: jobId,
                amount: request.body.amount,
            }, {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
            });
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
            let jobId;
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.AUTH_SECRET || "MeinNahiBatunga");
                jobId = decoded.id;
            }
            catch (err) {
                connection.socket.send(JSON.stringify({ error: "Invalid token" }));
                connection.socket.close();
                return;
            }
            const sendUpdate = (status, data = {}) => {
                connection.socket.send(JSON.stringify({
                    orderId: jobId,
                    status,
                    timestamp: new Date().toISOString(),
                    ...data,
                }));
            };
            // Send initial PENDING event with the orderId and token
            sendUpdate("PENDING", { token });
            // Listen for job events
            const handleJobCompletion = async (args) => {
                if (args.jobId === jobId) {
                    sendUpdate("COMPLETED", { returnValue: args.returnvalue });
                    cleanup();
                    connection.socket.close();
                }
            };
            const handleJobFailure = async (args) => {
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
exports.default = orderRouter;
//# sourceMappingURL=order.js.map