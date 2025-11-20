import {Redis} from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const pubClient = new Redis(redisUrl);
export const subClient = pubClient.duplicate();
export const bullConnection = new Redis(redisUrl, { maxRetriesPerRequest: null });
