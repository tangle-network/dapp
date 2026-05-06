import { describe, expect, it } from 'vitest';
import { isMessageFromIframe } from './origin';

describe('iframe origin validation', () => {
  it('rejects messages where source is not the iframe contentWindow', () => {
    const fakeWindow = {} as WindowProxy;
    const realWindow = {} as WindowProxy;
    const event = {
      origin: 'https://x.blueprint.tangle.tools',
      source: fakeWindow,
    } as unknown as MessageEvent;

    expect(
      isMessageFromIframe(event, {
        expectedOrigin: 'https://x.blueprint.tangle.tools',
        expectedSource: realWindow,
      }),
    ).toBe(false);
  });

  it('rejects messages with mismatched origin', () => {
    const win = {} as WindowProxy;
    const event = {
      origin: 'https://evil.example.com',
      source: win,
    } as unknown as MessageEvent;

    expect(
      isMessageFromIframe(event, {
        expectedOrigin: 'https://x.blueprint.tangle.tools',
        expectedSource: win,
      }),
    ).toBe(false);
  });

  it('rejects when expectedSource is null (iframe not yet mounted)', () => {
    const win = {} as WindowProxy;
    const event = {
      origin: 'https://x.blueprint.tangle.tools',
      source: win,
    } as unknown as MessageEvent;

    expect(
      isMessageFromIframe(event, {
        expectedOrigin: 'https://x.blueprint.tangle.tools',
        expectedSource: null,
      }),
    ).toBe(false);
  });

  it('accepts when origin and source both match', () => {
    const win = {} as WindowProxy;
    const event = {
      origin: 'https://x.blueprint.tangle.tools',
      source: win,
    } as unknown as MessageEvent;

    expect(
      isMessageFromIframe(event, {
        expectedOrigin: 'https://x.blueprint.tangle.tools',
        expectedSource: win,
      }),
    ).toBe(true);
  });

  it('does not match similar but distinct origins (lookalike)', () => {
    const win = {} as WindowProxy;
    const event = {
      origin: 'https://x.blueprint.tangle.tools.evil.com',
      source: win,
    } as unknown as MessageEvent;

    expect(
      isMessageFromIframe(event, {
        expectedOrigin: 'https://x.blueprint.tangle.tools',
        expectedSource: win,
      }),
    ).toBe(false);
  });
});
