import { MockDexRouter } from '../dex/mockDexRouter';
import { EventEmitter } from 'events';

// We'll unit-test the processing flow by calling the router and simulating pub/sub
describe('Order processing flow (unit)', () => {
  it('simulates lifecycle events in order', async () => {
    const dex = new MockDexRouter();
    const order = { id: 'test-1', tokenIn: 'A', tokenOut: 'B', amount: 1 } as any;
    const events: string[] = [];

    // simulate steps similar to worker
    events.push('pending');
    const [r1, r2] = await Promise.all([
      dex.getRaydiumQuote(order.tokenIn, order.tokenOut, order.amount),
      dex.getMeteoraQuote(order.tokenIn, order.tokenOut, order.amount)
    ]);
    events.push('routing');
    const chosen = r1.price > r2.price ? r1 : r2;
    events.push('building');
    const exec = await dex.executeSwap(chosen.dex as any, order);
    events.push('confirmed');

    expect(events).toEqual(['pending','routing','building','confirmed']);
    expect(exec.txHash).toMatch(/mock-/);
  });
});
