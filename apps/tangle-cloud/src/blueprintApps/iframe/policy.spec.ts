import { describe, expect, it } from 'vitest';
import { checkRequestAllowed } from './policy';
import type { BlueprintIframeConfig } from './types';

const baseConfig: BlueprintIframeConfig = {
  url: 'https://trading.blueprint.tangle.tools/',
  origin: 'https://trading.blueprint.tangle.tools',
  appId: 'trading-arena',
  allowedChainIds: [1],
  contracts: [
    {
      chainId: 1,
      address: '0x' + 'a'.repeat(40),
    },
  ],
  messages: [],
  allowReadAccount: true,
  allowChainSwitch: false,
  allowPopups: false,
};

const ADDR_ALLOWED = '0x' + 'a'.repeat(40);
const ADDR_DENIED = '0x' + 'b'.repeat(40);

describe('iframe semantic policy', () => {
  it('rejects signTransaction on a chain not in the allowlist', () => {
    const verdict = checkRequestAllowed(
      {
        kind: 'tangle.app.signTransaction',
        correlationId: 'a',
        chainId: 137,
        to: ADDR_ALLOWED,
        data: '0xa9059cbb',
      },
      baseConfig,
    );
    expect(verdict.ok).toBe(false);
  });

  it('rejects signTransaction on a contract not in the allowlist', () => {
    const verdict = checkRequestAllowed(
      {
        kind: 'tangle.app.signTransaction',
        correlationId: 'a',
        chainId: 1,
        to: ADDR_DENIED,
        data: '0xa9059cbb',
      },
      baseConfig,
    );
    expect(verdict.ok).toBe(false);
  });

  it('accepts signTransaction on whitelisted contract', () => {
    const verdict = checkRequestAllowed(
      {
        kind: 'tangle.app.signTransaction',
        correlationId: 'a',
        chainId: 1,
        to: ADDR_ALLOWED,
        data: '0xa9059cbb',
      },
      baseConfig,
    );
    expect(verdict.ok).toBe(true);
  });

  it('rejects selectors outside a per-contract selector allowlist', () => {
    const config: BlueprintIframeConfig = {
      ...baseConfig,
      contracts: [
        {
          chainId: 1,
          address: ADDR_ALLOWED as `0x${string}`,
          selectors: ['0xa9059cbb'],
        },
      ],
    };

    const denied = checkRequestAllowed(
      {
        kind: 'tangle.app.signTransaction',
        correlationId: 'a',
        chainId: 1,
        to: ADDR_ALLOWED,
        data: '0xdeadbeef',
      },
      config,
    );
    expect(denied.ok).toBe(false);

    const accepted = checkRequestAllowed(
      {
        kind: 'tangle.app.signTransaction',
        correlationId: 'b',
        chainId: 1,
        to: ADDR_ALLOWED,
        data: '0xa9059cbb',
      },
      config,
    );
    expect(accepted.ok).toBe(true);
  });

  it('rejects switchChain when the manifest does not opt in', () => {
    const verdict = checkRequestAllowed(
      {
        kind: 'tangle.app.switchChain',
        correlationId: 'a',
        chainId: 1,
      },
      baseConfig,
    );
    expect(verdict.ok).toBe(false);
  });

  it('rejects readAccount when the manifest does not opt in', () => {
    const verdict = checkRequestAllowed(
      { kind: 'tangle.app.readAccount', correlationId: 'a' },
      { ...baseConfig, allowReadAccount: false },
    );
    expect(verdict.ok).toBe(false);
  });
});
