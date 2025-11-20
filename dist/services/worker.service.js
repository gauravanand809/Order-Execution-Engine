"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerService = void 0;
const bullmq_1 = require("bullmq");
const dex_service_js_1 = require("./dex.service.js");
const index_js_1 = require("../constants/index.js");
const logger_js_1 = require("../utils/logger.js");
class WorkerService {
    dexService = new dex_service_js_1.DexService();
    /**
     * Processes an order job through the complete lifecycle
     */
    async processOrder(job) {
        const jobId = job.id || 'unknown';
        logger_js_1.Logger.info(jobId, "Starting order processing", job.data);
        const executionLogs = [];
        try {
            // 1. Mark as routing
            executionLogs.push({
                status: index_js_1.JOB_STATUSES.ROUTING,
                timestamp: new Date().toISOString(),
                message: "Starting routing process"
            });
            // 2. Fetch quotes in parallel from both DEXs (mocked)
            const quoteRequest = {
                inputToken: "SOL",
                outputToken: "USDC",
                amountIn: Number(job.data.amount) || 1
            };
            const quotes = await this.fetchQuotesWithLogging(jobId, quoteRequest, executionLogs);
            // 3. Compare effective prices and liquidity
            const bestQuote = this.compareQuotes(jobId, quotes, executionLogs);
            // 4. Choose the execution venue
            executionLogs.push({
                status: index_js_1.JOB_STATUSES.ROUTING,
                timestamp: new Date().toISOString(),
                message: `Selected ${bestQuote.provider} as execution venue`,
                selectedVenue: bestQuote.provider,
                quotesComparison: quotes.map(q => ({
                    provider: q.provider,
                    price: q.price,
                    amountOut: q.amountOut,
                    fee: q.fee
                }))
            });
            logger_js_1.Logger.info(jobId, `Selected ${bestQuote.provider} as execution venue`, {
                selectedVenue: bestQuote.provider,
                quotesComparison: quotes.map(q => ({
                    provider: q.provider,
                    price: q.price,
                    amountOut: q.amountOut,
                    fee: q.fee
                }))
            });
            // 5. Compute slippage/minOut
            const slippageTolerance = index_js_1.DEFAULT_SLIPPAGE_TOLERANCE;
            const minOut = bestQuote.amountOut * (1 - slippageTolerance);
            executionLogs.push({
                status: index_js_1.JOB_STATUSES.ROUTING,
                timestamp: new Date().toISOString(),
                message: "Computed slippage parameters",
                slippageTolerance,
                minOut
            });
            // 6. Move to building state
            executionLogs.push({
                status: index_js_1.JOB_STATUSES.BUILDING,
                timestamp: new Date().toISOString(),
                message: "Building transaction"
            });
            // 7. Move to submitted state
            executionLogs.push({
                status: index_js_1.JOB_STATUSES.SUBMITTED,
                timestamp: new Date().toISOString(),
                message: "Transaction submitted"
            });
            // 8. Execute the swap
            const result = await this.executeSwap(jobId, bestQuote, slippageTolerance, executionLogs);
            // 9. Confirm execution
            executionLogs.push({
                status: index_js_1.JOB_STATUSES.CONFIRMED,
                timestamp: new Date().toISOString(),
                message: "Transaction confirmed",
                txHash: result.txHash,
                executedPrice: result.executedPrice
            });
            logger_js_1.Logger.info(jobId, "Job completed successfully");
            return {
                status: "Completed",
                executionLogs,
                finalResult: result
            };
        }
        catch (error) {
            executionLogs.push({
                status: index_js_1.JOB_STATUSES.FAILED,
                timestamp: new Date().toISOString(),
                message: "Job failed",
                error: error instanceof Error ? error.message : String(error)
            });
            logger_js_1.Logger.error(jobId, "Job failed", error);
            throw error;
        }
    }
    async fetchQuotesWithLogging(jobId, quoteRequest, logs) {
        logs.push({
            status: index_js_1.JOB_STATUSES.ROUTING,
            timestamp: new Date().toISOString(),
            message: "Fetching quotes from DEXs in parallel"
        });
        logger_js_1.Logger.info(jobId, "Fetching quotes from DEXs in parallel");
        const quotes = await this.dexService.getQuotes(quoteRequest);
        logs.push({
            status: index_js_1.JOB_STATUSES.ROUTING,
            timestamp: new Date().toISOString(),
            message: "Received quotes from DEXs",
            quotes: quotes.map(q => ({
                provider: q.provider,
                price: q.price,
                amountOut: q.amountOut,
                fee: q.fee
            }))
        });
        logger_js_1.Logger.info(jobId, "Received quotes from DEXs", {
            quotes: quotes.map(q => ({
                provider: q.provider,
                price: q.price,
                amountOut: q.amountOut,
                fee: q.fee
            }))
        });
        return quotes;
    }
    compareQuotes(jobId, quotes, logs) {
        logs.push({
            status: index_js_1.JOB_STATUSES.ROUTING,
            timestamp: new Date().toISOString(),
            message: "Comparing quotes from DEXs",
            comparison: quotes.map(q => ({
                provider: q.provider,
                amountOut: q.amountOut,
                price: q.price
            }))
        });
        logger_js_1.Logger.info(jobId, "Comparing quotes from DEXs", {
            comparison: quotes.map(q => ({
                provider: q.provider,
                amountOut: q.amountOut,
                price: q.price
            }))
        });
        const bestQuote = this.dexService.selectBestQuote(quotes);
        logs.push({
            status: index_js_1.JOB_STATUSES.ROUTING,
            timestamp: new Date().toISOString(),
            message: `Best quote selected from ${bestQuote.provider}`,
            selectedProvider: bestQuote.provider,
            amountOut: bestQuote.amountOut,
            price: bestQuote.price
        });
        logger_js_1.Logger.info(jobId, `Best quote selected from ${bestQuote.provider}`, {
            selectedProvider: bestQuote.provider,
            amountOut: bestQuote.amountOut,
            price: bestQuote.price
        });
        return bestQuote;
    }
    async executeSwap(jobId, bestQuote, slippageTolerance, logs) {
        logs.push({
            status: index_js_1.JOB_STATUSES.SUBMITTED,
            timestamp: new Date().toISOString(),
            message: `Executing swap on ${bestQuote.provider}`,
            provider: bestQuote.provider,
            slippageTolerance
        });
        logger_js_1.Logger.info(jobId, `Executing swap on ${bestQuote.provider}`, {
            provider: bestQuote.provider,
            slippageTolerance
        });
        try {
            const result = await this.dexService.executeSwap({
                quote: bestQuote,
                slippageTolerance
            });
            logs.push({
                status: index_js_1.JOB_STATUSES.SUBMITTED,
                timestamp: new Date().toISOString(),
                message: "Swap executed successfully",
                txHash: result.txHash
            });
            logger_js_1.Logger.info(jobId, "Swap executed successfully", { txHash: result.txHash });
            return result;
        }
        catch (error) {
            logs.push({
                status: index_js_1.JOB_STATUSES.FAILED,
                timestamp: new Date().toISOString(),
                message: "Swap execution failed",
                error: error instanceof Error ? error.message : String(error)
            });
            logger_js_1.Logger.error(jobId, "Swap execution failed", error);
            throw error;
        }
    }
}
exports.WorkerService = WorkerService;
//# sourceMappingURL=worker.service.js.map