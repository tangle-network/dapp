import {
  resolveBlueprintMetadataFetchUrl,
  resolveBlueprintMetadataFetchUrls,
} from './metadataFetchUrl';
import { isAllowedBlueprintMetadataUri } from './metadataUri';
import { parseBlueprintUiContract } from './authoring';

// `localPreview` reads `import.meta.env`, which @swc/jest leaves as-is and
// then breaks Node's CommonJS parser. Stub it out — these tests never need
// the localhost-rewrite branch since they only assert pass-through behavior
// for non-localhost URLs. The same stub also keeps `authoring.ts` importable
// here (the local-preview check is its only `import.meta.env` reference).
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

describe('parseBlueprintUiContract — modes', () => {
  const baseContract = {
    displayName: 'Atlas',
    publisher: { name: 'Northstar', namespace: 'northstar' },
    resources: { serviceLabel: 'Service', itemLabel: 'Resource' },
  };

  it('returns undefined when `modes` is absent', () => {
    const parsed = parseBlueprintUiContract(baseContract);
    expect(parsed?.modes).toBeUndefined();
  });

  it('parses a well-formed modes array preserving order and string-coerced ids', () => {
    const parsed = parseBlueprintUiContract({
      ...baseContract,
      modes: [
        {
          id: 'cloud',
          label: 'Cloud',
          description: 'Shared-tenant cloud deployment.',
          blueprintId: 12,
          tagline: 'Recommended',
        },
        {
          id: 'instance',
          label: 'Instance',
          blueprintId: '13',
        },
        {
          id: 'tee',
          label: 'TEE',
          blueprintId: 14,
        },
      ],
    });

    expect(parsed?.modes).toHaveLength(3);
    expect(parsed?.modes?.[0]).toEqual({
      id: 'cloud',
      label: 'Cloud',
      description: 'Shared-tenant cloud deployment.',
      blueprintId: 12,
      tagline: 'Recommended',
    });
    expect(parsed?.modes?.[1]).toEqual({
      id: 'instance',
      label: 'Instance',
      blueprintId: 13,
    });
    expect(parsed?.modes?.[2]?.blueprintId).toBe(14);
  });

  it('drops entries with missing id, missing label, or invalid id chars', () => {
    const parsed = parseBlueprintUiContract({
      ...baseContract,
      modes: [
        { label: 'No id', blueprintId: 1 },
        { id: 'no-label', blueprintId: 2 },
        { id: 'Cloud With Space', label: 'Bad id chars', blueprintId: 3 },
        { id: 'UPPERCASE', label: 'Uppercase id', blueprintId: 4 },
        { id: '-leading-dash', label: 'Leading dash', blueprintId: 5 },
        { id: 'ok', label: 'Survivor', blueprintId: 6 },
      ],
    });

    expect(parsed?.modes).toHaveLength(1);
    expect(parsed?.modes?.[0]?.id).toBe('ok');
  });

  it('drops entries with non-integer or non-positive blueprintId values', () => {
    const parsed = parseBlueprintUiContract({
      ...baseContract,
      modes: [
        { id: 'a', label: 'A', blueprintId: 0 },
        { id: 'b', label: 'B', blueprintId: -1 },
        { id: 'c', label: 'C', blueprintId: 1.5 },
        { id: 'd', label: 'D', blueprintId: 'not-a-number' },
        { id: 'e', label: 'E', blueprintId: null },
        { id: 'f', label: 'F', blueprintId: 7 },
      ],
    });

    expect(parsed?.modes?.map((m) => m.id)).toEqual(['f']);
    expect(parsed?.modes?.[0]?.blueprintId).toBe(7);
  });

  it('returns undefined when every entry is invalid', () => {
    const parsed = parseBlueprintUiContract({
      ...baseContract,
      modes: [{ id: '', label: '', blueprintId: 'x' }],
    });
    expect(parsed?.modes).toBeUndefined();
  });

  it('rejects duplicate ids — first occurrence wins', () => {
    const parsed = parseBlueprintUiContract({
      ...baseContract,
      modes: [
        { id: 'cloud', label: 'First', blueprintId: 1 },
        { id: 'cloud', label: 'Second', blueprintId: 2 },
        { id: 'tee', label: 'Third', blueprintId: 3 },
      ],
    });

    expect(parsed?.modes).toHaveLength(2);
    expect(parsed?.modes?.[0]).toMatchObject({
      id: 'cloud',
      label: 'First',
      blueprintId: 1,
    });
    expect(parsed?.modes?.[1]?.id).toBe('tee');
  });

  it('returns undefined when `modes` is not an array', () => {
    expect(
      parseBlueprintUiContract({ ...baseContract, modes: 'cloud' })?.modes,
    ).toBeUndefined();
    expect(
      parseBlueprintUiContract({ ...baseContract, modes: {} })?.modes,
    ).toBeUndefined();
    expect(
      parseBlueprintUiContract({ ...baseContract, modes: null })?.modes,
    ).toBeUndefined();
  });

  it('caps the modes array at the documented per-blueprint limit', () => {
    const tooMany = Array.from({ length: 16 }, (_, idx) => ({
      id: `mode-${idx}`,
      label: `Mode ${idx}`,
      blueprintId: idx + 1,
    }));
    const parsed = parseBlueprintUiContract({
      ...baseContract,
      modes: tooMany,
    });

    expect(parsed?.modes?.length).toBeLessThanOrEqual(8);
    expect(parsed?.modes?.[0]?.id).toBe('mode-0');
  });
});
