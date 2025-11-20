import { MockDexRouter } from '../dex/mockDexRouter';

describe('MockDexRouter', () => {
  it('returns quotes for both dexes', async () => {
    const d = new MockDexRouter();
    const r1 = await d.getRaydiumQuote('A', 'B', 1);
    const r2 = await d.getMeteoraQuote('A', 'B', 1);
    expect(r1.price).toBeGreaterThan(0);
    expect(r2.price).toBeGreaterThan(0);
    expect(r1.dex).toBe('raydium');
    expect(r2.dex).toBe('meteora');
  });

  it('executes swap and returns txHash', async () => {
    const d = new MockDexRouter();
    const res = await d.executeSwap('meteora' as any, { id: '1' } as any);
    expect(res.txHash).toMatch(/mock-meteora/);
    expect(res.executedPrice).toBeGreaterThan(0);
  });
});
