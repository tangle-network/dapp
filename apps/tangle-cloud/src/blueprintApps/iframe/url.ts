/**
 * Append the iframe contract's reserved query params to the iframe URL.
 *
 * Reserved names (publishers must not collide):
 *   - `mode`         — which on-chain blueprint variant the user picked
 *   - `blueprintId`  — that variant's numeric ID, for the iframe app to
 *                      read without round-tripping the chain
 *   - `theme`        — `'light' | 'dark'`, so the iframe app's own
 *                      `data-sandbox-theme` can match the parent shell
 *                      instead of rendering a dark void on a light dapp
 *                      (or vice versa)
 *   - `parent`       — the parent (this dapp's) origin, so the embedded app
 *                      can deterministically detect that it's running inside
 *                      Tangle Cloud and install the parent-bridge wallet
 *                      connector. The sandbox may run at an opaque origin,
 *                      so `document.referrer` can be unreliable — `?parent=`
 *                      is the deterministic signal, with referrer as fallback.
 *
 * Other (non-reserved) params on the manifest URL are preserved verbatim —
 * publishers may sign intent into them and we shouldn't drop that.
 *
 * Returning a pure function (separate from the iframe component) means
 * the URL contract has a unit-testable surface and `BlueprintAppFrame`
 * stays a component-only module — react-refresh doesn't tolerate mixed
 * component + helper exports in the same file.
 */
export const buildBlueprintIframeUrl = (
  baseUrl: string,
  options: {
    mode?: string;
    blueprintId?: bigint | number;
    theme?: 'light' | 'dark';
    parent?: string;
  },
): string => {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    // Malformed manifest URL — let the iframe element fail naturally instead
    // of swallowing the bug here. Returning the raw string preserves the
    // failure path the rest of the codebase already handles.
    return baseUrl;
  }
  const modeId = options.mode?.trim() || 'default';
  url.searchParams.set('mode', modeId);
  if (options.blueprintId !== undefined) {
    url.searchParams.set('blueprintId', options.blueprintId.toString());
  }
  if (options.theme === 'light' || options.theme === 'dark') {
    url.searchParams.set('theme', options.theme);
  }
  if (options.parent) {
    url.searchParams.set('parent', options.parent);
  }
  return url.toString();
};
