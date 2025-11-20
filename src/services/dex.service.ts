import { MockDexRouter } from "../Mocking.js";
import type { QuoteRequest, Quote, ExecuteRequest, SwapResult } from "../Mocking.js";

export class DexService {
  private dexRouter = new MockDexRouter();

  /**
   * Fetches quotes from all DEXs in parallel
   */
  async getQuotes(request: QuoteRequest): Promise<Quote[]> {
    return await this.dexRouter.getQuotes(request);
  }

  /**
   * Executes a swap on the chosen DEX
   */
  async executeSwap(request: ExecuteRequest): Promise<SwapResult> {
    return await this.dexRouter.executeSwap(request);
  }

  /**
   * Compares quotes and selects the best one based on amountOut
   */
  selectBestQuote(quotes: Quote[]): Quote {
    if (quotes.length === 0) {
      throw new Error("No quotes available");
    }
    
    return quotes.reduce((best, current) => 
      current.amountOut > best.amountOut ? current : best
    );
  }
}