import type { BlueprintPublisherVerification } from './types';

const splitEnvList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const DEFAULT_RESERVED_SLUGS = ['trading', 'sandbox', 'training'];
const DEFAULT_TRUSTED_EXTERNAL_APP_HOSTS = [
  'cloud.tangle.tools',
  'app.tangle.tools',
  'apps.tangle.tools',
];
const DEFAULT_VERIFIED_PUBLISHERS = ['tangle', 'tangle-labs'];

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

export const verifiedPublisherNamespaces = new Set([
  ...DEFAULT_VERIFIED_PUBLISHERS,
  ...splitEnvList(import.meta.env.VITE_BLUEPRINT_VERIFIED_PUBLISHERS),
]);

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
