import {
  isPlausibleBinaryUri,
  isValidHttpsUri,
  isValidIpfsUri,
  isValidSha256Hex,
} from './types';

/**
 * Validators are load-bearing — they gate the wizard advancing past steps
 * 1 and 2. Each test names the regression a code change would have to
 * survive: shipping a malformed URI or a wrongly-shaped sha256 to the
 * publishBinaryVersion tx is a real footgun on a non-recoverable contract
 * call.
 */

describe('wizard validators', () => {
  describe('isValidIpfsUri', () => {
    it('accepts a CIDv1 base32 ipfs:// URI', () => {
      expect(
        isValidIpfsUri(
          'ipfs://bafybeibcgnz4u5j5fc7gtq3w24adsmgkpdq3ohx6apkdtxqftq6vzqjdda',
        ),
      ).toBe(true);
    });

    it('rejects an https URI passed to the ipfs slot', () => {
      expect(isValidIpfsUri('https://gateway/ipfs/cid')).toBe(false);
    });

    it('rejects a bare ipfs:// with no CID', () => {
      expect(isValidIpfsUri('ipfs://')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidIpfsUri('')).toBe(false);
    });
  });

  describe('isValidHttpsUri', () => {
    it('accepts a raw GitHub URL', () => {
      expect(
        isValidHttpsUri(
          'https://raw.githubusercontent.com/foo/bar/abc1234/binary.bin',
        ),
      ).toBe(true);
    });

    it('rejects an http:// URL — only https is accepted', () => {
      expect(isValidHttpsUri('http://example.com/x')).toBe(false);
    });

    it('rejects URLs with leading whitespace that would survive trim', () => {
      expect(isValidHttpsUri(' https://x')).toBe(false);
    });
  });

  describe('isPlausibleBinaryUri', () => {
    it('accepts an ipfs URI', () => {
      expect(isPlausibleBinaryUri('ipfs://cid')).toBe(true);
    });

    it('accepts an https URI with surrounding whitespace (trim is applied)', () => {
      expect(isPlausibleBinaryUri(' https://example.com/x ')).toBe(true);
    });

    it('rejects a data: URI', () => {
      expect(
        isPlausibleBinaryUri('data:application/octet-stream;base64,xxx'),
      ).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isPlausibleBinaryUri('')).toBe(false);
    });
  });

  describe('isValidSha256Hex', () => {
    it('accepts 0x + 64 hex chars (lowercase)', () => {
      expect(isValidSha256Hex('0x' + 'a'.repeat(64))).toBe(true);
    });

    it('accepts 0x + 64 hex chars (uppercase)', () => {
      expect(isValidSha256Hex('0x' + 'A'.repeat(64))).toBe(true);
    });

    it('rejects missing 0x prefix', () => {
      expect(isValidSha256Hex('a'.repeat(64))).toBe(false);
    });

    it('rejects truncated hash (63 chars after prefix)', () => {
      expect(isValidSha256Hex('0x' + 'a'.repeat(63))).toBe(false);
    });

    it('rejects too-long hash (65 chars after prefix)', () => {
      expect(isValidSha256Hex('0x' + 'a'.repeat(65))).toBe(false);
    });

    it('rejects non-hex characters', () => {
      expect(isValidSha256Hex('0x' + 'z'.repeat(64))).toBe(false);
    });
  });
});
