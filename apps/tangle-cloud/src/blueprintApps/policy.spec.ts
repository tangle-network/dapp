import {
  getPublisherVerificationForNamespace,
  reservedBlueprintSlugs,
  trustedExternalAppHosts,
  verifiedPublisherNamespaces,
} from './policy';

describe('blueprint platform policy', () => {
  it('ships safe defaults for reserved slugs and trusted hosts', () => {
    expect(reservedBlueprintSlugs.has('trading')).toBe(true);
    expect(reservedBlueprintSlugs.has('sandbox')).toBe(true);
    expect(trustedExternalAppHosts).toContain('tangle.tools');
    expect(trustedExternalAppHosts).toContain('tangle.network');
  });

  it('marks known publisher namespaces as verified', () => {
    expect(verifiedPublisherNamespaces.has('tangle')).toBe(true);
    expect(getPublisherVerificationForNamespace('tangle')).toBe('verified');
    expect(getPublisherVerificationForNamespace('unknown')).toBe('unverified');
  });
});
