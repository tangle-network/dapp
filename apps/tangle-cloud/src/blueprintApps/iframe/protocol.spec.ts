import { describe, expect, it } from 'vitest';
import { validateIframeRequest, IFRAME_PROTOCOL_VERSION } from './protocol';

const ADDR = '0x' + 'a'.repeat(40);

describe('iframe protocol validation', () => {
  it('rejects messages without the tangle.app prefix', () => {
    expect(validateIframeRequest({ kind: 'evil.handshake', appId: 'x' })).toBe(
      null,
    );
  });

  it('rejects messages with non-object payloads', () => {
    expect(validateIframeRequest(null)).toBe(null);
    expect(validateIframeRequest(undefined)).toBe(null);
    expect(validateIframeRequest('tangle.app.handshake')).toBe(null);
    expect(validateIframeRequest([1, 2, 3])).toBe(null);
  });

  it('accepts a well-formed handshake', () => {
    const result = validateIframeRequest({
      kind: 'tangle.app.handshake',
      appId: 'trading-arena',
      version: IFRAME_PROTOCOL_VERSION,
    });
    expect(result?.kind).toBe('tangle.app.handshake');
  });

  it('rejects handshake from a future protocol version', () => {
    expect(
      validateIframeRequest({
        kind: 'tangle.app.handshake',
        appId: 'x',
        version: '99',
      }),
    ).toBe(null);
  });

  it('rejects signTransaction with unbounded calldata', () => {
    const longData = '0x' + 'ab'.repeat(200_000);
    expect(
      validateIframeRequest({
        kind: 'tangle.app.signTransaction',
        correlationId: 'abc',
        chainId: 1,
        to: ADDR,
        data: longData,
      }),
    ).toBe(null);
  });

  it('rejects signTransaction with invalid address', () => {
    expect(
      validateIframeRequest({
        kind: 'tangle.app.signTransaction',
        correlationId: 'abc',
        chainId: 1,
        to: '0xnope',
        data: '0x',
      }),
    ).toBe(null);
  });

  it('rejects signTransaction with negative or non-numeric value', () => {
    expect(
      validateIframeRequest({
        kind: 'tangle.app.signTransaction',
        correlationId: 'abc',
        chainId: 1,
        to: ADDR,
        data: '0x',
        value: '-1',
      }),
    ).toBe(null);

    expect(
      validateIframeRequest({
        kind: 'tangle.app.signTransaction',
        correlationId: 'abc',
        chainId: 1,
        to: ADDR,
        data: '0x',
        value: '1e18',
      }),
    ).toBe(null);
  });

  it('rejects correlationIds that are too long or non-printable', () => {
    expect(
      validateIframeRequest({
        kind: 'tangle.app.readAccount',
        correlationId: 'a'.repeat(200),
      }),
    ).toBe(null);

    expect(
      validateIframeRequest({
        kind: 'tangle.app.readAccount',
        correlationId: 'has spaces',
      }),
    ).toBe(null);
  });

  it('rejects signMessage above the size cap', () => {
    expect(
      validateIframeRequest({
        kind: 'tangle.app.signMessage',
        correlationId: 'abc',
        chainId: 1,
        message: 'x'.repeat(10_000),
      }),
    ).toBe(null);
  });

  it('accepts well-formed signTransaction', () => {
    const result = validateIframeRequest({
      kind: 'tangle.app.signTransaction',
      correlationId: 'abc',
      chainId: 1,
      to: ADDR,
      data: '0xa9059cbb',
      value: '0',
    });
    expect(result?.kind).toBe('tangle.app.signTransaction');
  });
});
