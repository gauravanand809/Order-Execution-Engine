import { DexQuote, ExecutionResult, Order } from '../types';
import { randomUUID } from 'crypto';

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export class MockDexRouter {
  basePrice = 100; // arbitrary base

  async getRaydiumQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote> {
    await sleep(200 + Math.random() * 200);
    const price = this.basePrice * (0.98 + Math.random() * 0.04);
    return { dex: 'raydium', price, fee: 0.003 };
  }

  async getMeteoraQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote> {
    await sleep(200 + Math.random() * 200);
    const price = this.basePrice * (0.97 + Math.random() * 0.05);
    return { dex: 'meteora', price, fee: 0.002 };
  }

  async executeSwap(dex: 'raydium' | 'meteora', order: Order): Promise<ExecutionResult> {
    const delay = 2000 + Math.random() * 1000;
    await sleep(delay);
    const executedPrice = this.basePrice * (0.98 + Math.random() * 0.04);
    return { txHash: `mock-${dex}-${randomUUID()}`, executedPrice };
  }
}
