import { Worker, Job } from "bullmq";
import { bullConnection } from "../redis-connection.js";
import { sequenceJob, dlq } from "./queue.js";
const worker = new Worker("sequenceJob", async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    try {
        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Here you would put your actual job processing logic
        // For example, updating a database, calling an API, etc.
        console.log(`Job ${job.id} completed successfully`);
        return { status: "Completed" };
    }
    catch (error) {
        console.error(`Job ${job.id} failed with error:`, error);
        // Add the failed job to the DLQ
        await dlq.add("failed-job", job.data, {
            removeOnComplete: true,
            removeOnFail: true,
        });
        throw error;
    }
}, {
    connection: bullConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
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
    await bullConnection.quit();
    process.exit(0);
};
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
console.log("Worker started and listening for jobs...");
//# sourceMappingURL=worker.js.map