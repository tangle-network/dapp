import { resolveBlueprintMetadataFetchUrl } from './metadataFetchUrl';

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
