import { Job } from "bullmq";
import type { jobDetail } from "../types.js";
import { DexService } from "./dex.service.js";
import type { QuoteRequest, Quote } from "../Mocking.js";
import { JOB_STATUSES, DEFAULT_SLIPPAGE_TOLERANCE } from "../constants/index.js";
import { Logger } from "../utils/logger.js";

export class WorkerService {
  private dexService = new DexService();

  /**
   * Processes an order job through the complete lifecycle
   */
  async processOrder(job: Job<jobDetail>): Promise<any> {
    const jobId = job.id || 'unknown';
    Logger.info(jobId, "Starting order processing", job.data);
    
    const executionLogs: any[] = [];
    
    try {
      // 1. Mark as routing
      executionLogs.push({
        status: JOB_STATUSES.ROUTING,
        timestamp: new Date().toISOString(),
        message: "Starting routing process"
      });
      
      // 2. Fetch quotes in parallel from both DEXs (mocked)
      const quoteRequest: QuoteRequest = {
        inputToken: "SOL",
        outputToken: "USDC",
        amountIn: Number(job.data.amount) || 1
      };
      
      const quotes = await this.fetchQuotesWithLogging(jobId, quoteRequest, executionLogs);
      
      // 3. Compare effective prices and liquidity
      const bestQuote = this.compareQuotes(jobId, quotes, executionLogs);
      
      // 4. Choose the execution venue
      executionLogs.push({
        status: JOB_STATUSES.ROUTING,
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
      
      Logger.info(jobId, `Selected ${bestQuote.provider} as execution venue`, {
        selectedVenue: bestQuote.provider,
        quotesComparison: quotes.map(q => ({
          provider: q.provider,
          price: q.price,
          amountOut: q.amountOut,
          fee: q.fee
        }))
      });
      
      // 5. Compute slippage/minOut
      const slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE;
      const minOut = bestQuote.amountOut * (1 - slippageTolerance);
      
      executionLogs.push({
        status: JOB_STATUSES.ROUTING,
        timestamp: new Date().toISOString(),
        message: "Computed slippage parameters",
        slippageTolerance,
        minOut
      });
      
      // 6. Move to building state
      executionLogs.push({
        status: JOB_STATUSES.BUILDING,
        timestamp: new Date().toISOString(),
        message: "Building transaction"
      });
      
      // 7. Move to submitted state
      executionLogs.push({
        status: JOB_STATUSES.SUBMITTED,
        timestamp: new Date().toISOString(),
        message: "Transaction submitted"
      });
      
      // 8. Execute the swap
      const result = await this.executeSwap(jobId, bestQuote, slippageTolerance, executionLogs);
      
      // 9. Confirm execution
      executionLogs.push({
        status: JOB_STATUSES.CONFIRMED,
        timestamp: new Date().toISOString(),
        message: "Transaction confirmed",
        txHash: result.txHash,
        executedPrice: result.executedPrice
      });
      
      Logger.info(jobId, "Job completed successfully");
      
      return {
        status: "Completed",
        executionLogs,
        finalResult: result
      };
    } catch (error) {
      executionLogs.push({
        status: JOB_STATUSES.FAILED,
        timestamp: new Date().toISOString(),
        message: "Job failed",
        error: error instanceof Error ? error.message : String(error)
      });
      
      Logger.error(jobId, "Job failed", error);
      throw error;
    }
  }

  private async fetchQuotesWithLogging(jobId: string, quoteRequest: QuoteRequest, logs: any[]): Promise<Quote[]> {
    logs.push({
      status: JOB_STATUSES.ROUTING,
      timestamp: new Date().toISOString(),
      message: "Fetching quotes from DEXs in parallel"
    });
    
    Logger.info(jobId, "Fetching quotes from DEXs in parallel");
    
    const quotes = await this.dexService.getQuotes(quoteRequest);
    
    logs.push({
      status: JOB_STATUSES.ROUTING,
      timestamp: new Date().toISOString(),
      message: "Received quotes from DEXs",
      quotes: quotes.map(q => ({
        provider: q.provider,
        price: q.price,
        amountOut: q.amountOut,
        fee: q.fee
      }))
    });
    
    Logger.info(jobId, "Received quotes from DEXs", {
      quotes: quotes.map(q => ({
        provider: q.provider,
        price: q.price,
        amountOut: q.amountOut,
        fee: q.fee
      }))
    });
    
    return quotes;
  }

  private compareQuotes(jobId: string, quotes: Quote[], logs: any[]): Quote {
    logs.push({
      status: JOB_STATUSES.ROUTING,
      timestamp: new Date().toISOString(),
      message: "Comparing quotes from DEXs",
      comparison: quotes.map(q => ({
        provider: q.provider,
        amountOut: q.amountOut,
        price: q.price
      }))
    });
    
    Logger.info(jobId, "Comparing quotes from DEXs", {
      comparison: quotes.map(q => ({
        provider: q.provider,
        amountOut: q.amountOut,
        price: q.price
      }))
    });
    
    const bestQuote = this.dexService.selectBestQuote(quotes);
    
    logs.push({
      status: JOB_STATUSES.ROUTING,
      timestamp: new Date().toISOString(),
      message: `Best quote selected from ${bestQuote.provider}`,
      selectedProvider: bestQuote.provider,
      amountOut: bestQuote.amountOut,
      price: bestQuote.price
    });
    
    Logger.info(jobId, `Best quote selected from ${bestQuote.provider}`, {
      selectedProvider: bestQuote.provider,
      amountOut: bestQuote.amountOut,
      price: bestQuote.price
    });
    
    return bestQuote;
  }

  private async executeSwap(jobId: string, bestQuote: Quote, slippageTolerance: number, logs: any[]) {
    logs.push({
      status: JOB_STATUSES.SUBMITTED,
      timestamp: new Date().toISOString(),
      message: `Executing swap on ${bestQuote.provider}`,
      provider: bestQuote.provider,
      slippageTolerance
    });
    
    Logger.info(jobId, `Executing swap on ${bestQuote.provider}`, {
      provider: bestQuote.provider,
      slippageTolerance
    });
    
    try {
      const result = await this.dexService.executeSwap({
        quote: bestQuote,
        slippageTolerance
      });
      
      logs.push({
        status: JOB_STATUSES.SUBMITTED,
        timestamp: new Date().toISOString(),
        message: "Swap executed successfully",
        txHash: result.txHash
      });
      
      Logger.info(jobId, "Swap executed successfully", { txHash: result.txHash });
      
      return result;
    } catch (error) {
      logs.push({
        status: JOB_STATUSES.FAILED,
        timestamp: new Date().toISOString(),
        message: "Swap execution failed",
        error: error instanceof Error ? error.message : String(error)
      });
      
      Logger.error(jobId, "Swap execution failed", error);
      throw error;
    }
  }
}