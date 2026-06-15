import { isLocalPreviewHost } from '@tangle-network/tangle-shared-ui/utils/localPreview';
import type { BlueprintPublisherVerification } from './types';

const splitEnvList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const DEFAULT_RESERVED_SLUGS = ['trading', 'sandbox', 'training', 'surplus', 'bazaar'];
const DEFAULT_TRUSTED_EXTERNAL_APP_HOSTS = [
  'cloud.tangle.tools',
  'app.tangle.tools',
  'apps.tangle.tools',
];
const DEFAULT_VERIFIED_PUBLISHERS = ['tangle', 'tangle-labs'];
// Distinct from verified publishers — promoting a publisher to iframe-eligible
// is a governance call, not auto-derived from verification.
const DEFAULT_IFRAME_ELIGIBLE_PUBLISHERS = ['tangle', 'tangle-labs'];

// Wildcard suffixes for hosts that may serve iframe-mode blueprint apps.
// Any host whose registrable suffix matches one of these is treated as a
// trusted-host entry without requiring the operator to enumerate every
// per-blueprint subdomain in the env var. Each iframe app still has to be
// explicitly enabled via its publisher namespace + the manifest's contract
// allowlist; this is just the host-shape gate.
const DEFAULT_IFRAME_HOST_SUFFIXES = [
  '.blueprint.tangle.tools',
  '.blueprint.tangle.sh',
];

export const reservedBlueprintSlugs = new Set([
  ...DEFAULT_RESERVED_SLUGS,
  ...splitEnvList(import.meta.env.VITE_BLUEPRINT_RESERVED_SLUGS),
]);

export const trustedExternalAppHosts = [
  ...new Set([
    ...DEFAULT_TRUSTED_EXTERNAL_APP_HOSTS,
    ...splitEnvList(import.meta.env.VITE_BLUEPRINT_TRUSTED_EXTERNAL_HOSTS),
  ]),
];

export const trustedIframeHostSuffixes = [
  ...new Set([
    ...DEFAULT_IFRAME_HOST_SUFFIXES,
    ...splitEnvList(import.meta.env.VITE_BLUEPRINT_IFRAME_HOST_SUFFIXES).map(
      (suffix) => (suffix.startsWith('.') ? suffix : `.${suffix}`),
    ),
  ]),
];

export const verifiedPublisherNamespaces = new Set([
  ...DEFAULT_VERIFIED_PUBLISHERS,
  ...splitEnvList(import.meta.env.VITE_BLUEPRINT_VERIFIED_PUBLISHERS),
]);

export const iframeEligiblePublisherNamespaces = new Set([
  ...DEFAULT_IFRAME_ELIGIBLE_PUBLISHERS,
  ...splitEnvList(import.meta.env.VITE_BLUEPRINT_IFRAME_PUBLISHERS),
]);

// Same-day kill switch. When false the manifest parser refuses to emit
// mode='iframe' regardless of any other gate — single env flip and every
// iframe app falls back to link-out without a contract or manifest change.
export const isIframeAppsEnabled = (() => {
  const raw = import.meta.env.VITE_BLUEPRINT_IFRAME_ENABLED;
  if (typeof raw !== 'string') return false;
  return raw.trim().toLowerCase() === 'true';
})();

export const getPublisherVerificationForNamespace = (
  namespace?: string,
): BlueprintPublisherVerification => {
  if (!namespace) {
    return 'unverified';
  }

  return verifiedPublisherNamespaces.has(namespace.trim().toLowerCase())
    ? 'verified'
    : 'unverified';
};

export const isIframeEligiblePublisher = (namespace?: string): boolean => {
  if (!namespace) return false;
  return iframeEligiblePublisherNamespaces.has(namespace.trim().toLowerCase());
};

// Local preview hostnames that we accept as iframe sources when the dapp
// itself is running on a local preview host. Lets `pnpm dev` in a blueprint
// repo pair with `yarn local:blueprint-ui-catalog` without env-var fiddling.
const LOCAL_IFRAME_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

export const isIframeAllowedHost = (host: string): boolean => {
  const normalized = host.trim().toLowerCase();
  if (!normalized) return false;
  if (LOCAL_IFRAME_HOSTS.has(normalized) && isLocalPreviewHost()) return true;
  if (trustedExternalAppHosts.includes(normalized)) return true;
  return trustedIframeHostSuffixes.some((suffix) =>
    normalized.endsWith(suffix),
  );
};
