import { Worker, Job } from "bullmq";
import { bullConnection } from "../redis-connection.js";
import type { jobDetail } from "../types.js";
import { sequenceJob, dlq } from "./queue.js";

const worker = new Worker<jobDetail>(
  "sequenceJob",
  async (job: Job<jobDetail>) => {
    console.log(`Processing job ${job.id} with data:`, job.data);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));


      console.log(`Job ${job.id} completed successfully`);
      return { status: "Completed" };
    } catch (error) {
      console.error(`Job ${job.id} failed with error:`, error);

      await dlq.add("failed-job", job.data, {
        removeOnComplete: true,
        removeOnFail: true,
      });
      throw error;
    }
  },
  {
    connection: bullConnection,
    concurrency: 5, 
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
