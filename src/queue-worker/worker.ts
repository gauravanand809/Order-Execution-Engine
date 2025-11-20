import { Worker, Job } from "bullmq";
import { bullConnection } from "../redis-connection.js";
import type { jobDetail } from "../types.js";
import { sequenceJob, dlq } from "./queue.js";
import { WorkerService } from "../services/worker.service.js";

const workerService = new WorkerService();

const worker = new Worker<jobDetail>(
  "sequenceJob",
  async (job: Job<jobDetail>) => {
    return await workerService.processOrder(job);
  },
  {
    connection: bullConnection,
    concurrency: 10, 
  }
);

worker.on("completed", (job: Job<jobDetail>) => {
  console.log(`Job ${job.id} has completed.`);
});

worker.on("failed", (job, err) => {
  if (job) {
    console.log(`Job ${job.id} has failed with ${err.message}`);
  } else {
    console.log(`An unknown job has failed with ${err.message}`);
  }
});

const gracefulShutdown = async () => {
  console.log("Shutting down worker gracefully...");
  await worker.close();
  await bullConnection.quit();
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

console.log("Worker started and listening for jobs...");