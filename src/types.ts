export type OrderSide = 'buy' | 'sell';

export type OrderStatus =
  | 'pending'
  | 'routing'
  | 'building'
  | 'submitted'
  | 'confirmed'
  | 'failed';

export interface Order {
  id: string;
  type: 'market';
  tokenIn: string;
  tokenOut: string;
  amount: number;
  side: OrderSide;
  createdAt: string;
}

export interface DexQuote {
  dex: 'raydium' | 'meteora';
  price: number;
  fee: number;
}

export interface ExecutionResult {
  txHash: string;
  executedPrice: number;
}
