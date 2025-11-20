"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dlq = exports.sequenceJob = void 0;
const bullmq_1 = require("bullmq");
const redis_connection_js_1 = require("../redis-connection.js");
exports.sequenceJob = new bullmq_1.Queue("sequenceJob", { connection: redis_connection_js_1.bullConnection });
exports.dlq = new bullmq_1.Queue("dlq", { connection: redis_connection_js_1.bullConnection });
//# sourceMappingURL=queue.js.map