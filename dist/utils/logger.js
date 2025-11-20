"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static info(jobId, message, data) {
        console.log(`[INFO] [Job: ${jobId}] ${message}`, data || '');
    }
    static error(jobId, message, error) {
        console.error(`[ERROR] [Job: ${jobId}] ${message}`, error || '');
    }
    static warn(jobId, message, data) {
        console.warn(`[WARN] [Job: ${jobId}] ${message}`, data || '');
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map