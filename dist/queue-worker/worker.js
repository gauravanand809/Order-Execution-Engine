"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_connection_js_1 = require("../redis-connection.js");
const queue_js_1 = require("./queue.js");
const worker_service_js_1 = require("../services/worker.service.js");
const workerService = new worker_service_js_1.WorkerService();
const worker = new bullmq_1.Worker("sequenceJob", async (job) => {
    return await workerService.processOrder(job);
}, {
    connection: redis_connection_js_1.bullConnection,
    concurrency: 10,
});
worker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed.`);
});
worker.on("failed", (job, err) => {
    if (job) {
        console.log(`Job ${job.id} has failed with ${err.message}`);
    }
    else {
        console.log(`An unknown job has failed with ${err.message}`);
    }
});
const gracefulShutdown = async () => {
    console.log("Shutting down worker gracefully...");
    await worker.close();
    await redis_connection_js_1.bullConnection.quit();
    process.exit(0);
};
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
console.log("Worker started and listening for jobs...");
//# sourceMappingURL=worker.js.map