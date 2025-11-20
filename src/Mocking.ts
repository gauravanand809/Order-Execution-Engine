import { randomUUID } from "crypto";


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


export class SlippageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SlippageError";
  }
}


interface DexConfig {
  latencyRange: [number, number];
  priceVariance: number;
  fee: number;
}

const DEX_CONFIGS: Record<"Raydium" | "Meteora", DexConfig> = {
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

export class MockDexRouter {
  private basePrice = 100; 

  /**
   * Simulates fetching quotes from multiple DEXs.
   * @param request The details of the desired swap.
   * @returns A promise that resolves to an array of quotes from all supported DEXs.
   */
  async getQuotes(request: QuoteRequest): Promise<Quote[]> {
    const raydiumPromise = this.getDexQuote("Raydium", request.amountIn);
    const meteoraPromise = this.getDexQuote("Meteora", request.amountIn);

    return Promise.all([raydiumPromise, meteoraPromise]);
  }

  /**
   * Simulates executing a swap on a specific DEX.
   * @param request The chosen quote and slippage tolerance.
   * @returns A promise that resolves to the result of the swap, including a mock transaction hash.
   */
  async executeSwap(request: ExecuteRequest): Promise<SwapResult> {
    const { quote, slippageTolerance } = request;
    const config = DEX_CONFIGS[quote.provider];

    await this.simulateDelay(config.latencyRange[0] * 2, config.latencyRange[1] * 2);

    const priceMovement = this.getVariance(0.02);
    const executedPrice = quote.price * priceMovement;

    const slippage = Math.abs((executedPrice - quote.price) / quote.price);
    if (slippage > slippageTolerance) {
      throw new SlippageError(
        `Slippage exceeded: ${(slippage * 100).toFixed(2)}%`
      );
    }

    return {
      txHash: `0x${randomUUID().replace(/-/g, "")}`,
      executedPrice,
      status: "success",
    };
  }

 
  private async getDexQuote(provider: "Raydium" | "Meteora", amountIn: number): Promise<Quote> {
    const config = DEX_CONFIGS[provider];

    await this.simulateDelay(config.latencyRange[0], config.latencyRange[1]);

    const price = this.basePrice * this.getVariance(config.priceVariance);
    
    const fee = amountIn * config.fee;
    const amountAfterFee = amountIn - fee;
    
    const amountOut = amountAfterFee * price;

    return { provider, price, amountOut, fee };
  }
  
  private simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private getVariance(variance: number): number {
    return 1 + (Math.random() * 2 - 1) * variance;
  }
}
