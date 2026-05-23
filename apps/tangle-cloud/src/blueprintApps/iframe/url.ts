/**
 * Append the mode + blueprintId query params to the iframe URL. The
 * iframe contract reserves `mode` and `blueprintId` query names. When
 * the manifest URL already declares one of them (publishers shouldn't
 * but we don't want to silently drop signed intent for non-reserved
 * params), we leave OTHER existing params alone — the parent's picked
 * mode replaces the reserved params only.
 *
 * Returning a pure function (separate from the iframe component) means
 * the URL contract has a unit-testable surface and `BlueprintAppFrame`
 * stays a component-only module — react-refresh doesn't tolerate mixed
 * component + helper exports in the same file.
 */
export const buildBlueprintIframeUrl = (
  baseUrl: string,
  options: { mode?: string; blueprintId?: bigint | number },
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
  return url.toString();
};
