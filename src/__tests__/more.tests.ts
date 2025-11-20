import { MockDexRouter } from '../dex/mockDexRouter';

describe('Additional unit checks', () => {
  it('price variance is within expected range', async () => {
    const d = new MockDexRouter();
    const samples = [];
    for (let i=0;i<20;i++) samples.push((await d.getRaydiumQuote('A','B',1)).price);
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    expect(max/min).toBeLessThan(1.1);
  });

  it('meteora fees smaller than raydium', async () => {
    const d = new MockDexRouter();
    const r = await d.getRaydiumQuote('A','B',1);
    const m = await d.getMeteoraQuote('A','B',1);
    expect(m.fee).toBeLessThanOrEqual(r.fee);
  });
});
