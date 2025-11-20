"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDexRouter = exports.SlippageError = void 0;
const crypto_1 = require("crypto");
class SlippageError extends Error {
    constructor(message) {
        super(message);
        this.name = "SlippageError";
    }
}
exports.SlippageError = SlippageError;
const DEX_CONFIGS = {
    Raydium: {
        latencyRange: [200, 500],
        priceVariance: 0.03,
        fee: 0.0025,
    },
    Meteora: {
        latencyRange: [300, 600],
        priceVariance: 0.04,
        fee: 0.003,
    },
};
class MockDexRouter {
    basePrice = 100;
    /**
     * Simulates fetching quotes from multiple DEXs.
     * @param request The details of the desired swap.
     * @returns A promise that resolves to an array of quotes from all supported DEXs.
     */
    async getQuotes(request) {
        const raydiumPromise = this.getDexQuote("Raydium", request.amountIn);
        const meteoraPromise = this.getDexQuote("Meteora", request.amountIn);
        return Promise.all([raydiumPromise, meteoraPromise]);
    }
    /**
     * Simulates executing a swap on a specific DEX.
     * @param request The chosen quote and slippage tolerance.
     * @returns A promise that resolves to the result of the swap, including a mock transaction hash.
     */
    async executeSwap(request) {
        const { quote, slippageTolerance } = request;
        const config = DEX_CONFIGS[quote.provider];
        await this.simulateDelay(config.latencyRange[0] * 2, config.latencyRange[1] * 2);
        const priceMovement = this.getVariance(0.02);
        const executedPrice = quote.price * priceMovement;
        const slippage = Math.abs((executedPrice - quote.price) / quote.price);
        if (slippage > slippageTolerance) {
            throw new SlippageError(`Slippage exceeded: ${(slippage * 100).toFixed(2)}%`);
        }
        return {
            txHash: `0x${(0, crypto_1.randomUUID)().replace(/-/g, "")}`,
            executedPrice,
            status: "success",
        };
    }
    async getDexQuote(provider, amountIn) {
        const config = DEX_CONFIGS[provider];
        await this.simulateDelay(config.latencyRange[0], config.latencyRange[1]);
        const price = this.basePrice * this.getVariance(config.priceVariance);
        const fee = amountIn * config.fee;
        const amountAfterFee = amountIn - fee;
        const amountOut = amountAfterFee * price;
        return { provider, price, amountOut, fee };
    }
    simulateDelay(min, max) {
        const delay = Math.random() * (max - min) + min;
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
    getVariance(variance) {
        return 1 + (Math.random() * 2 - 1) * variance;
    }
}
exports.MockDexRouter = MockDexRouter;
//# sourceMappingURL=Mocking.js.map