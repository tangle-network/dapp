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
    title: 'Default blueprint view',
    description:
      'Shows blueprint details, operators, service instances, permissions, and request forms when no custom app is configured.',
  };
}
