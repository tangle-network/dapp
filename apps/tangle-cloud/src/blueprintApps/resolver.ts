import {
  buildCanonicalBlueprintSlug,
  canPublisherClaimSlug as canPublisherClaimSlugBase,
  deriveBlueprintRequestedSlug,
  getBlueprintExperienceTierLabel,
  getBlueprintPath,
  getBlueprintPublisherVerificationLabel,
  getBlueprintServicePath,
  getBlueprintSlugPolicyLabel,
  getBlueprintSurfaceLabel,
  getExternalAppTrustLabel,
  isTrustedExternalAppHost as isTrustedExternalAppHostBase,
  isVerifiedBlueprintPublisher,
  resolveBlueprintAppView,
  sanitizeBlueprintSlugPart,
  toBlueprintAppEntry,
} from '@tangle-network/blueprint-ui';
import type { BlueprintPublisher } from './types';
import { reservedBlueprintSlugs, trustedExternalAppHosts } from './policy';
export {
  buildCanonicalBlueprintSlug,
  deriveBlueprintRequestedSlug,
  getBlueprintExperienceTierLabel,
  getBlueprintPath,
  getBlueprintPublisherVerificationLabel,
  getBlueprintServicePath,
  getBlueprintSlugPolicyLabel,
  getBlueprintSurfaceLabel,
  getExternalAppTrustLabel,
  isVerifiedBlueprintPublisher,
  resolveBlueprintAppView,
  sanitizeBlueprintSlugPart,
  toBlueprintAppEntry,
};

export function isReservedBlueprintSlug(slug: string): boolean {
  return reservedBlueprintSlugs.has(slug);
}

export function canPublisherClaimSlug(
  slug: string,
  publisher?: Pick<BlueprintPublisher, 'namespace' | 'verification'>,
): boolean {
  return canPublisherClaimSlugBase(slug, publisher, reservedBlueprintSlugs);
}

export function isTrustedExternalAppHost(host: string): boolean {
  return isTrustedExternalAppHostBase(host, trustedExternalAppHosts);
}

export function getProtocolGenericExperienceCopy(): {
  title: string;
  description: string;
} {
  return {
    title: 'Protocol-wide fallback',
    description:
      'Every blueprint should get a Tangle-controlled overview and service UI even when no custom app module exists. Declarative manifests and curated modules build on top of this fallback, not instead of it.',
  };
}
