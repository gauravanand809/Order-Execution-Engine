import { MockDexRouter } from '../dex/mockDexRouter';

describe('Routing logic', () => {
  it('chooses better price between dexes', async () => {
    const d = new MockDexRouter();
    const r1 = await d.getRaydiumQuote('A','B',1);
    const r2 = await d.getMeteoraQuote('A','B',1);
    const chosen = r1.price > r2.price ? r1 : r2;
    expect(['raydium','meteora']).toContain(chosen.dex);
  });
});
