export interface Quote {
    provider: string;
    price: number;
    amountOut: number;
}
export interface SwapResult {
    txHash: string;
    finalPrice: number;
    status: "success" | "failed";
}
export declare class SlippageError extends Error {
    constructor(message: string);
}
export declare class MockDexRouter {
    private basePrice;
    getQuote(amount: number): Promise<Quote>;
    executeSwap(quote: Quote): Promise<SwapResult>;
}
//# sourceMappingURL=Mocking.d.ts.map