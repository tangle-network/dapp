import { describe, expect, it } from 'vitest';
import { buildBlueprintIframeUrl } from './url';

describe('buildBlueprintIframeUrl', () => {
  const base = 'https://trading-arena.blueprint.tangle.tools/';

  it('sets the reserved params', () => {
    const url = new URL(
      buildBlueprintIframeUrl(base, {
        mode: 'instance',
        blueprintId: 13,
        theme: 'dark',
      }),
    );
    expect(url.searchParams.get('mode')).toBe('instance');
    expect(url.searchParams.get('blueprintId')).toBe('13');
    expect(url.searchParams.get('theme')).toBe('dark');
  });

  it('defaults mode to "default" and omits unset optionals', () => {
    const url = new URL(buildBlueprintIframeUrl(base, {}));
    expect(url.searchParams.get('mode')).toBe('default');
    expect(url.searchParams.has('blueprintId')).toBe(false);
    expect(url.searchParams.has('theme')).toBe(false);
    expect(url.searchParams.has('parent')).toBe(false);
  });

  // The embedded app's bridge detection reads `?parent=` (document.referrer is
  // empty under no-referrer + the opaque sandbox origin). Without this the
  // iframe can't tell it's inside Tangle Cloud and never installs the
  // parent-bridge wallet connector.
  it('appends the parent origin when provided', () => {
    const url = new URL(
      buildBlueprintIframeUrl(base, { parent: 'https://cloud.tangle.tools' }),
    );
    expect(url.searchParams.get('parent')).toBe('https://cloud.tangle.tools');
  });

  it('omits parent when not provided', () => {
    const url = new URL(buildBlueprintIframeUrl(base, { mode: 'default' }));
    expect(url.searchParams.has('parent')).toBe(false);
  });

  it('returns the raw string for a malformed URL', () => {
    expect(
      buildBlueprintIframeUrl('not a url', {
        parent: 'https://cloud.tangle.tools',
      }),
    ).toBe('not a url');
  });
});
