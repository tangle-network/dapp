import { describe, expect, it } from 'vitest';
import { parseIframePolicy } from './manifest';

describe('iframe manifest parser', () => {
  const ADDR = '0x' + 'a'.repeat(40);

  it('returns undefined when url is missing', () => {
    expect(parseIframePolicy({})).toBeUndefined();
  });

  it('parses a minimal iframe block with no contract grants', () => {
    const result = parseIframePolicy({
      url: 'https://trading.blueprint.tangle.tools/',
    });
    expect(result?.origin).toBe('https://trading.blueprint.tangle.tools');
    expect(result?.contracts).toEqual([]);
    expect(result?.allowReadAccount).toBe(false);
  });

  it('parses contract grants with selectors', () => {
    const result = parseIframePolicy({
      url: 'https://x.blueprint.tangle.tools/',
      iframe: {
        appId: 'demo',
        allowedChainIds: [1],
        contracts: [
          {
            chainId: 1,
            address: ADDR,
            selectors: ['0xa9059cbb', '0x095ea7b3'],
          },
        ],
        allowReadAccount: true,
      },
    });
    expect(result?.contracts).toHaveLength(1);
    expect(result?.contracts[0].selectors).toEqual([
      '0xa9059cbb',
      '0x095ea7b3',
    ]);
    expect(result?.allowReadAccount).toBe(true);
  });

  it('drops malformed contract grants', () => {
    const result = parseIframePolicy({
      url: 'https://x.blueprint.tangle.tools/',
      iframe: {
        contracts: [
          { chainId: 1, address: '0xnope' },
          { chainId: 'abc', address: ADDR },
          { chainId: 1, address: ADDR },
        ],
      },
    });
    expect(result?.contracts).toHaveLength(1);
  });

  it('drops malformed selectors', () => {
    const result = parseIframePolicy({
      url: 'https://x.blueprint.tangle.tools/',
      iframe: {
        contracts: [
          {
            chainId: 1,
            address: ADDR,
            selectors: [
              '0xa9059cbb',
              'not-hex',
              '0xtoolong000000000000',
              '0xa9059cb', // too short
            ],
          },
        ],
      },
    });
    expect(result?.contracts[0].selectors).toEqual(['0xa9059cbb']);
  });
});
