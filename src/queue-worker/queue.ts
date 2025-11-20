import type { jobDetail } from "../types.js";

import { Queue } from "bullmq";
import { bullConnection } from "../redis-connection.js"; 



export const sequenceJob = new Queue("sequenceJob", { connection: bullConnection });
export const dlq = new Queue("dlq", { connection: bullConnection });

