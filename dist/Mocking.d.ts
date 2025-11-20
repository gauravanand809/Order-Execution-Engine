export interface QuoteRequest {
    inputToken: string;
    outputToken: string;
    amountIn: number;
}
export interface Quote {
    provider: "Raydium" | "Meteora";
    price: number;
    amountOut: number;
    fee: number;
}
export interface ExecuteRequest {
    quote: Quote;
    slippageTolerance: number;
}
export interface SwapResult {
    txHash: string;
    executedPrice: number;
    status: "success" | "failed";
}
export declare class SlippageError extends Error {
    constructor(message: string);
}
export declare class MockDexRouter {
    private basePrice;
    /**
     * Simulates fetching quotes from multiple DEXs.
     * @param request The details of the desired swap.
     * @returns A promise that resolves to an array of quotes from all supported DEXs.
     */
    getQuotes(request: QuoteRequest): Promise<Quote[]>;
    /**
     * Simulates executing a swap on a specific DEX.
     * @param request The chosen quote and slippage tolerance.
     * @returns A promise that resolves to the result of the swap, including a mock transaction hash.
     */
    executeSwap(request: ExecuteRequest): Promise<SwapResult>;
    private getDexQuote;
    private simulateDelay;
    private getVariance;
}
//# sourceMappingURL=Mocking.d.ts.map