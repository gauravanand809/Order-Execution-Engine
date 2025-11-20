"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexService = void 0;
const Mocking_js_1 = require("../Mocking.js");
class DexService {
    dexRouter = new Mocking_js_1.MockDexRouter();
    /**
     * Fetches quotes from all DEXs in parallel
     */
    async getQuotes(request) {
        return await this.dexRouter.getQuotes(request);
    }
    /**
     * Executes a swap on the chosen DEX
     */
    async executeSwap(request) {
        return await this.dexRouter.executeSwap(request);
    }
    /**
     * Compares quotes and selects the best one based on amountOut
     */
    selectBestQuote(quotes) {
        if (quotes.length === 0) {
            throw new Error("No quotes available");
        }
        return quotes.reduce((best, current) => current.amountOut > best.amountOut ? current : best);
    }
}
exports.DexService = DexService;
//# sourceMappingURL=dex.service.js.map