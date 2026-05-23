import {
  resolveBlueprintMetadataFetchUrl,
  resolveBlueprintMetadataFetchUrls,
} from './metadataFetchUrl';
import { isAllowedBlueprintMetadataUri } from './metadataUri';

// `localPreview` reads `import.meta.env`, which @swc/jest leaves as-is and
// then breaks Node's CommonJS parser. Stub it out — these tests never need
// the localhost-rewrite branch since they only assert pass-through behavior
// for non-localhost URLs.
jest.mock('../utils/localPreview', () => ({
  isLocalPreviewHost: () => false,
  rewriteLocalhostUrlForBrowser: (value: string) => value,
}));

describe('resolveBlueprintMetadataFetchUrl', () => {
  it('rewrites ipfs:// URIs to the public ipfs.io gateway', () => {
    expect(resolveBlueprintMetadataFetchUrl('ipfs://abc')).toBe(
      'https://ipfs.io/ipfs/abc',
    );
  });

  it('translates a bare github.com repo URL to raw.githubusercontent.com/main/metadata/blueprint-metadata.json', () => {
    expect(resolveBlueprintMetadataFetchUrl('https://github.com/foo/bar')).toBe(
      'https://raw.githubusercontent.com/foo/bar/main/metadata/blueprint-metadata.json',
    );
  });

  it('handles a bare github.com repo URL with a trailing slash', () => {
    expect(
      resolveBlueprintMetadataFetchUrl('https://github.com/foo/bar/'),
    ).toBe(
      'https://raw.githubusercontent.com/foo/bar/main/metadata/blueprint-metadata.json',
    );
  });

  it('strips a .git suffix from a bare github.com repo URL', () => {
    expect(
      resolveBlueprintMetadataFetchUrl('https://github.com/foo/bar.git'),
    ).toBe(
      'https://raw.githubusercontent.com/foo/bar/main/metadata/blueprint-metadata.json',
    );
  });

  it('returns github.com URLs with sub-paths unchanged (only bare repo URLs are translated)', () => {
    const input = 'https://github.com/foo/bar/tree/main/something';
    expect(resolveBlueprintMetadataFetchUrl(input)).toBe(input);
  });

  it('returns unrelated https URLs unchanged', () => {
    const input = 'https://example.com/raw.json';
    expect(resolveBlueprintMetadataFetchUrl(input)).toBe(input);
  });
});

describe('resolveBlueprintMetadataFetchUrls (fallback candidates)', () => {
  it('returns ipfs:// as a single-element list', () => {
    expect(resolveBlueprintMetadataFetchUrls('ipfs://abc')).toEqual([
      'https://ipfs.io/ipfs/abc',
    ]);
  });

  it('expands a bare github.com URL to main first then master', () => {
    expect(
      resolveBlueprintMetadataFetchUrls('https://github.com/foo/bar'),
    ).toEqual([
      'https://raw.githubusercontent.com/foo/bar/main/metadata/blueprint-metadata.json',
      'https://raw.githubusercontent.com/foo/bar/master/metadata/blueprint-metadata.json',
    ]);
  });

  it('expands trailing-slash and .git variants identically', () => {
    const fromTrail = resolveBlueprintMetadataFetchUrls(
      'https://github.com/foo/bar/',
    );
    const fromGit = resolveBlueprintMetadataFetchUrls(
      'https://github.com/foo/bar.git',
    );
    expect(fromTrail).toEqual([
      'https://raw.githubusercontent.com/foo/bar/main/metadata/blueprint-metadata.json',
      'https://raw.githubusercontent.com/foo/bar/master/metadata/blueprint-metadata.json',
    ]);
    expect(fromGit).toEqual(fromTrail);
  });

  it('returns unrelated https URLs as a single-element list', () => {
    expect(
      resolveBlueprintMetadataFetchUrls('https://example.com/raw.json'),
    ).toEqual(['https://example.com/raw.json']);
  });

  it('rewrites ar:// URIs to the arweave.net gateway', () => {
    expect(resolveBlueprintMetadataFetchUrls('ar://aZxYz123')).toEqual([
      'https://arweave.net/aZxYz123',
    ]);
  });

  it('passes data: URIs through verbatim — fetch resolves them inline', () => {
    const dataUri = 'data:application/json;base64,eyJmb28iOiJiYXIifQ==';
    expect(resolveBlueprintMetadataFetchUrls(dataUri)).toEqual([dataUri]);
  });
});

describe('isAllowedBlueprintMetadataUri', () => {
  it('accepts ipfs://, ar://, https://, and data: schemes', () => {
    expect(isAllowedBlueprintMetadataUri('ipfs://bafy123')).toBe(true);
    expect(isAllowedBlueprintMetadataUri('ar://aZxYz123')).toBe(true);
    expect(isAllowedBlueprintMetadataUri('https://example.com/m.json')).toBe(
      true,
    );
    expect(
      isAllowedBlueprintMetadataUri('data:application/json,{"foo":1}'),
    ).toBe(true);
    expect(
      isAllowedBlueprintMetadataUri(
        'data:application/json;base64,eyJmb28iOjF9',
      ),
    ).toBe(true);
  });

  it('rejects http:// (no TLS — MITM risk on mutable metadata)', () => {
    expect(isAllowedBlueprintMetadataUri('http://example.com/m.json')).toBe(
      false,
    );
  });

  it('rejects unsupported data: mime types', () => {
    expect(
      isAllowedBlueprintMetadataUri('data:image/png;base64,iVBORw0KGgo='),
    ).toBe(false);
    expect(
      isAllowedBlueprintMetadataUri('data:application/javascript,alert(1)'),
    ).toBe(false);
  });

  it('rejects other schemes', () => {
    expect(isAllowedBlueprintMetadataUri('file:///etc/passwd')).toBe(false);
    expect(isAllowedBlueprintMetadataUri('ftp://example.com')).toBe(false);
    expect(isAllowedBlueprintMetadataUri('javascript:alert(1)')).toBe(false);
  });

  it('rejects garbage strings', () => {
    expect(isAllowedBlueprintMetadataUri('')).toBe(false);
    expect(isAllowedBlueprintMetadataUri('not a uri')).toBe(false);
  });
});
