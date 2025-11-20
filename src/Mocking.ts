import { randomUUID } from "crypto";

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

export class SlippageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SlippageError";
  }
}

export class MockDexRouter {
  private basePrice = 100; // Mock base price for SOL/USDC

  async getQuote(amount: number): Promise<Quote> {
    // Simulate 200ms delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const variance = () => 1 + (Math.random() * 0.02 - 0.01); // +/- 1%

    const raydiumPrice = this.basePrice * variance();
    const meteoraPrice = this.basePrice * variance();

    const raydiumQuote = {
      provider: "Raydium",
      price: raydiumPrice,
      amountOut: amount * raydiumPrice,
    };

    const meteoraQuote = {
      provider: "Meteora",
      price: meteoraPrice,
      amountOut: amount * meteoraPrice,
    };

    // Return best quote (highest amountOut for selling SOL, but let's assume buying USDC with SOL)
    return raydiumQuote.amountOut > meteoraQuote.amountOut
      ? raydiumQuote
      : meteoraQuote;
  }

  async executeSwap(quote: Quote): Promise<SwapResult> {
    // Simulate 2000ms delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const variance = 1 + (Math.random() * 0.04 - 0.02); // +/- 2% variance
    const finalPrice = quote.price * variance;

    const slippage = Math.abs((finalPrice - quote.price) / quote.price);

    if (slippage > 0.01) {
      throw new SlippageError(
        `Slippage exceeded: ${(slippage * 100).toFixed(2)}%`
      );
    }

    return {
      txHash: `0x${randomUUID().replace(/-/g, "")}`,
      finalPrice,
      status: "success",
    };
  }
}
