import type { QuoteRequest, Quote, ExecuteRequest, SwapResult } from "../Mocking.js";
export declare class DexService {
    private dexRouter;
    /**
     * Fetches quotes from all DEXs in parallel
     */
    getQuotes(request: QuoteRequest): Promise<Quote[]>;
    /**
     * Executes a swap on the chosen DEX
     */
    executeSwap(request: ExecuteRequest): Promise<SwapResult>;
    /**
     * Compares quotes and selects the best one based on amountOut
     */
    selectBestQuote(quotes: Quote[]): Quote;
}
//# sourceMappingURL=dex.service.d.ts.map