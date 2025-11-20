"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullConnection = exports.subClient = exports.pubClient = void 0;
const ioredis_1 = require("ioredis");
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
exports.pubClient = new ioredis_1.Redis(redisUrl);
exports.subClient = exports.pubClient.duplicate();
exports.bullConnection = new ioredis_1.Redis(redisUrl, { maxRetriesPerRequest: null });
//# sourceMappingURL=redis-connection.js.map