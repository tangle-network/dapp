import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import type { BlueprintMode } from '@tangle-network/tangle-shared-ui/blueprintApps/types';
import { dedupeBlueprintsByIdentity } from './dedupe';
import { buildBlueprintIframeUrl } from './iframe/url';

const blueprintFixture = (overrides: {
  id: bigint;
  namespace?: string;
  requestedSlug?: string;
  modes?: BlueprintMode[];
  name?: string;
}): Blueprint => ({
  id: overrides.id,
  name: overrides.name ?? `Blueprint ${overrides.id}`,
  author: '0xabc',
  deployer: '0xabc',
  registrationParams: [],
  requestParams: [],
  imgUrl: null,
  category: null,
  description: null,
  instancesCount: null,
  operatorsCount: 0,
  tvl: null,
  isBoosted: false,
  blueprintUi:
    overrides.namespace || overrides.requestedSlug
      ? {
          displayName: overrides.name ?? `Blueprint ${overrides.id}`,
          description: '',
          publisher: {
            name: 'publisher',
            namespace: overrides.namespace,
            verified: false,
          },
          resources: {
            serviceLabel: 'service',
            itemLabel: 'resource',
            itemRoute: 'custom',
          },
          surfaces: [],
          requestedSlug: overrides.requestedSlug,
          tier: 'generic',
          ...(overrides.modes ? { modes: overrides.modes } : {}),
        }
      : null,
});

describe('dedupeBlueprintsByIdentity', () => {
  it('returns blueprints unchanged when none share an identity', () => {
    const a = blueprintFixture({
      id: 1n,
      namespace: 'tangle',
      requestedSlug: 'foo',
    });
    const b = blueprintFixture({
      id: 2n,
      namespace: 'tangle',
      requestedSlug: 'bar',
    });
    const rows = dedupeBlueprintsByIdentity([a, b]);
    expect(rows.map((r) => r.blueprint.id)).toEqual([1n, 2n]);
    expect(rows.every((r) => r.aliases.length === 0)).toBe(true);
  });

  it('keeps blueprints without an identity as singletons', () => {
    const noIdentity = blueprintFixture({ id: 9n });
    const sandboxA = blueprintFixture({
      id: 10n,
      namespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    });
    const sandboxB = blueprintFixture({
      id: 11n,
      namespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    });
    const rows = dedupeBlueprintsByIdentity([noIdentity, sandboxA, sandboxB]);
    expect(rows).toHaveLength(2);
    const noIdentityRow = rows.find((r) => r.blueprint.id === 9n);
    expect(noIdentityRow?.aliases).toEqual([]);
  });

  it('collapses sibling deployments and picks the lowest-id canonical', () => {
    const high = blueprintFixture({
      id: 20n,
      namespace: 'tangle',
      requestedSlug: 'ai-trading',
    });
    const low = blueprintFixture({
      id: 12n,
      namespace: 'tangle',
      requestedSlug: 'ai-trading',
    });
    const mid = blueprintFixture({
      id: 15n,
      namespace: 'tangle',
      requestedSlug: 'ai-trading',
    });
    const rows = dedupeBlueprintsByIdentity([high, low, mid]);
    expect(rows).toHaveLength(1);
    expect(rows[0].blueprint.id).toBe(12n);
    expect(rows[0].aliases.map((a) => a.blueprintId)).toEqual([15n, 20n]);
  });

  it('matches identities case-insensitively', () => {
    const a = blueprintFixture({
      id: 1n,
      namespace: 'Tangle',
      requestedSlug: 'AI-Trading',
    });
    const b = blueprintFixture({
      id: 2n,
      namespace: 'tangle',
      requestedSlug: 'ai-trading',
    });
    const rows = dedupeBlueprintsByIdentity([a, b]);
    expect(rows).toHaveLength(1);
    expect(rows[0].aliases).toHaveLength(1);
  });

  it('preserves catalog ordering for non-deduped rows', () => {
    const featured = blueprintFixture({ id: 99n });
    const sandboxA = blueprintFixture({
      id: 5n,
      namespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    });
    const sandboxB = blueprintFixture({
      id: 6n,
      namespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    });
    const trailing = blueprintFixture({ id: 7n });
    const rows = dedupeBlueprintsByIdentity([
      featured,
      sandboxA,
      sandboxB,
      trailing,
    ]);
    expect(rows.map((r) => r.blueprint.id)).toEqual([99n, 5n, 7n]);
  });

  it('honors declared modes from any group member (canonical wins)', () => {
    const declaredOnCanonical: BlueprintMode[] = [
      { id: 'cloud', label: 'Cloud', blueprintId: 1 },
      { id: 'tee', label: 'TEE', blueprintId: 2 },
    ];
    const a = blueprintFixture({
      id: 1n,
      namespace: 'tangle',
      requestedSlug: 'foo',
      modes: declaredOnCanonical,
    });
    const b = blueprintFixture({
      id: 2n,
      namespace: 'tangle',
      requestedSlug: 'foo',
    });
    const rows = dedupeBlueprintsByIdentity([a, b]);
    expect(rows[0].modes).toEqual(declaredOnCanonical);
  });

  it('applies dev fallback modes to sandbox sibling group', () => {
    const a = blueprintFixture({
      id: 1n,
      namespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    });
    const b = blueprintFixture({
      id: 2n,
      namespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    });
    const c = blueprintFixture({
      id: 3n,
      namespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    });
    const rows = dedupeBlueprintsByIdentity([a, b, c]);
    expect(rows[0].modes?.map((m) => m.id)).toEqual([
      'cloud',
      'instance',
      'tee',
    ]);
    expect(rows[0].modes?.map((m) => m.blueprintId)).toEqual([1, 2, 3]);
  });

  it('applies dev fallback modes to trading sibling group with 4 members', () => {
    const ids = [1n, 2n, 3n, 4n].map((id) =>
      blueprintFixture({
        id,
        namespace: 'tangle',
        requestedSlug: 'ai-trading',
      }),
    );
    const rows = dedupeBlueprintsByIdentity(ids);
    expect(rows[0].modes?.map((m) => m.id)).toEqual([
      'cloud',
      'instance',
      'tee',
      'validator',
    ]);
  });

  it('skips the dev fallback for unknown sibling identities', () => {
    const a = blueprintFixture({
      id: 1n,
      namespace: 'alice',
      requestedSlug: 'my-thing',
    });
    const b = blueprintFixture({
      id: 2n,
      namespace: 'alice',
      requestedSlug: 'my-thing',
    });
    const rows = dedupeBlueprintsByIdentity([a, b]);
    // No declared modes, no dev fallback entry — modes left undefined,
    // but the catalog still collapses by identity.
    expect(rows).toHaveLength(1);
    expect(rows[0].modes).toBeUndefined();
    expect(rows[0].aliases).toHaveLength(1);
  });

  it('skips the picker for a single-member group (no siblings)', () => {
    const lone = blueprintFixture({
      id: 1n,
      namespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    });
    const rows = dedupeBlueprintsByIdentity([lone]);
    expect(rows).toHaveLength(1);
    expect(rows[0].aliases).toHaveLength(0);
    expect(rows[0].modes).toBeUndefined();
  });
});

describe('buildBlueprintIframeUrl', () => {
  it('appends ?mode=default&blueprintId=<id> when no mode is picked', () => {
    const url = buildBlueprintIframeUrl(
      'https://iframe.blueprint.tangle.tools/',
      { blueprintId: 12n },
    );
    expect(url).toBe(
      'https://iframe.blueprint.tangle.tools/?mode=default&blueprintId=12',
    );
  });

  it('appends ?mode=<id>&blueprintId=<id> for a picked mode', () => {
    const url = buildBlueprintIframeUrl(
      'https://iframe.blueprint.tangle.tools/',
      { mode: 'tee', blueprintId: 17 },
    );
    expect(url).toBe(
      'https://iframe.blueprint.tangle.tools/?mode=tee&blueprintId=17',
    );
  });

  it('overrides a manifest-supplied mode with the parent-picked mode', () => {
    const url = buildBlueprintIframeUrl(
      'https://iframe.blueprint.tangle.tools/?mode=cloud&extra=keep',
      { mode: 'tee', blueprintId: 17 },
    );
    const parsed = new URL(url);
    expect(parsed.searchParams.get('mode')).toBe('tee');
    expect(parsed.searchParams.get('blueprintId')).toBe('17');
    expect(parsed.searchParams.get('extra')).toBe('keep');
  });

  it('omits blueprintId when caller does not pass one', () => {
    const url = buildBlueprintIframeUrl(
      'https://iframe.blueprint.tangle.tools/',
      { mode: 'tee' },
    );
    const parsed = new URL(url);
    expect(parsed.searchParams.get('mode')).toBe('tee');
    expect(parsed.searchParams.get('blueprintId')).toBeNull();
  });

  it('coerces empty / whitespace mode to default', () => {
    const url = buildBlueprintIframeUrl(
      'https://iframe.blueprint.tangle.tools/',
      { mode: '   ', blueprintId: 1 },
    );
    expect(new URL(url).searchParams.get('mode')).toBe('default');
  });

  it('returns the raw string when the manifest URL is malformed', () => {
    // We don't want to swallow a malformed URL — falling through to the
    // iframe element lets the existing failure path surface it.
    expect(
      buildBlueprintIframeUrl('not a url', { mode: 'cloud', blueprintId: 1 }),
    ).toBe('not a url');
  });

  it("forwards the parent shell's light theme as ?theme=light", () => {
    const url = buildBlueprintIframeUrl('https://x.blueprint.tangle.tools/', {
      mode: 'default',
      blueprintId: 7,
      theme: 'light',
    });
    expect(new URL(url).searchParams.get('theme')).toBe('light');
  });

  it("forwards the parent shell's dark theme as ?theme=dark", () => {
    const url = buildBlueprintIframeUrl('https://x.blueprint.tangle.tools/', {
      mode: 'default',
      blueprintId: 7,
      theme: 'dark',
    });
    expect(new URL(url).searchParams.get('theme')).toBe('dark');
  });

  it('omits the theme param when caller does not supply one (back-compat)', () => {
    const url = buildBlueprintIframeUrl('https://x.blueprint.tangle.tools/', {
      mode: 'default',
      blueprintId: 7,
    });
    expect(new URL(url).searchParams.has('theme')).toBe(false);
  });
});
