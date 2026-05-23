import { isLocalPreviewHost } from '../utils/localPreview';

/**
 * Heuristic: are we serving the dapp from a local preview (localhost, private
 * IPv4) or has the operator force-enabled local-chain mode? When true the
 * blueprint UI loosens a few gates — most notably, IPFS metadata isn't
 * required and `localhost:<port>` is allowed as an iframe source.
 *
 * Extracted from `authoring.ts` so jest specs that exercise the metadata
 * parser don't transitively pull in `import.meta.env`, which @swc/jest
 * leaves untouched and the CommonJS runtime then refuses to parse. The
 * parser is pure JSON-shape validation; the only `import.meta` reference
 * in the module sat in this helper, so isolating it keeps test ergonomics
 * sharp without changing runtime behavior.
 */
const isLocalBlueprintHostRuntime = (): boolean => {
  if (import.meta.env.VITE_FORCE_LOCAL_CHAIN === 'true') {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return isLocalPreviewHost(window.location.hostname);
};

export const requiresIpfsForBlueprintMetadata = (): boolean =>
  !isLocalBlueprintHostRuntime();
