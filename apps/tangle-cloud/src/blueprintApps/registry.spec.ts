import {
  canPublisherClaimSlug,
  getBlueprintPublisherVerificationLabel,
  getBlueprintExperienceTierLabel,
  getExternalAppTrustLabel,
  getBlueprintPath,
  getBlueprintServicePath,
  getBlueprintSlugPolicyLabel,
  getBlueprintSurfaceLabel,
  isReservedBlueprintSlug,
  isTrustedExternalAppHost,
  resolveBlueprintAppView,
} from './resolver';
import { buildGenericBlueprintAppEntry } from './manifest';
import {
  getBlueprintAppBySlug,
  getBlueprintAppForMetadata,
  protocolGenericBlueprintExperience,
} from './registry';

describe('blueprint app registry', () => {
  it('resolves curated entries by slug and by metadata identity', () => {
    const tradingBySlug = getBlueprintAppBySlug('trading');
    const tradingByMetadata = getBlueprintAppForMetadata({
      publisherNamespace: 'tangle',
      requestedSlug: 'ai-trading',
    });
    const sandboxByMetadata = getBlueprintAppForMetadata({
      publisherNamespace: 'tangle',
      requestedSlug: 'ai-agent-sandbox',
    });
    const trainingBySlug = getBlueprintAppBySlug('training');
    const surplusByMetadata = getBlueprintAppForMetadata({
      publisherNamespace: 'tangle',
      requestedSlug: 'surplus',
    });

    expect(tradingBySlug?.slug).toBe('trading');
    expect(tradingByMetadata?.slug).toBe('trading');
    expect(sandboxByMetadata?.slug).toBe('sandbox');
    expect(trainingBySlug?.slug).toBe('training');
    expect(surplusByMetadata?.slug).toBe('bazaar');
    expect(surplusByMetadata?.manifest.externalApp?.mode).toBe('iframe');
    // Surplus now uses the parent-bridge wallet model (like trading-arena /
    // agent-sandbox): allowReadAccount + allowChainSwitch granted so the
    // connected wallet flows from the parent. allowSameOrigin is retained
    // for own-origin app-state storage.
    expect(surplusByMetadata?.iframe?.allowSameOrigin).toBe(true);
    expect(surplusByMetadata?.iframe?.allowReadAccount).toBe(true);
    expect(surplusByMetadata?.iframe?.allowChainSwitch).toBe(true);
  });

  it('returns null when metadata identity does not match any curated entry', () => {
    expect(
      getBlueprintAppForMetadata({
        publisherNamespace: 'tangle',
        requestedSlug: 'something-else',
      }),
    ).toBeNull();
    // Wrong namespace, even with a curated slug, should not claim the entry.
    expect(
      getBlueprintAppForMetadata({
        publisherNamespace: 'imposter',
        requestedSlug: 'ai-trading',
      }),
    ).toBeNull();
  });

  it('matches on metadata identity case-insensitively', () => {
    const entry = getBlueprintAppForMetadata({
      publisherNamespace: 'TANGLE',
      requestedSlug: 'AI-Trading',
    });
    expect(entry?.slug).toBe('trading');
  });

  it('builds a resolved view with host fallback enabled', () => {
    const trading = getBlueprintAppBySlug('trading');

    expect(trading).toBeTruthy();
    if (!trading) {
      throw new Error('Expected trading blueprint app to exist');
    }

    const resolved = resolveBlueprintAppView(trading);

    expect(resolved.fallbackEnabled).toBe(true);
    expect(resolved.tier).toBe('curated-module');
    expect(getBlueprintPath(resolved)).toBe('/blueprints/trading');
    expect(getBlueprintServicePath(resolved, '7')).toBe(
      '/blueprints/trading/7',
    );
  });

  it('protects reserved first-party slugs while allowing publisher-scoped claims', () => {
    expect(isReservedBlueprintSlug('trading')).toBe(true);
    expect(isReservedBlueprintSlug('training')).toBe(true);
    expect(isReservedBlueprintSlug('surplus')).toBe(true);
    expect(
      canPublisherClaimSlug('trading', {
        namespace: 'alice',
        verification: 'verified',
      }),
    ).toBe(false);
    expect(
      canPublisherClaimSlug('research-agent', {
        namespace: 'alice',
        verification: 'verified',
      }),
    ).toBe(true);
    expect(
      canPublisherClaimSlug('research-agent', {
        namespace: 'alice',
        verification: 'unverified',
      }),
    ).toBe(false);
  });

  it('exposes readable labels for tier, policy, and surfaces', () => {
    expect(getBlueprintExperienceTierLabel('generic')).toBe(
      'Protocol fallback',
    );
    expect(getBlueprintSlugPolicyLabel('publisher-scoped')).toBe(
      'Publisher-scoped slug',
    );
    expect(getBlueprintSurfaceLabel('service-explorer')).toBe(
      'Service explorer',
    );
    expect(getBlueprintPublisherVerificationLabel('verified')).toBe(
      'Verified publisher',
    );
    expect(getExternalAppTrustLabel('trusted')).toBe('Trusted external app');
  });

  it('accepts trusted external app subdomains from policy defaults', () => {
    expect(isTrustedExternalAppHost('cloud.tangle.tools')).toBe(true);
    expect(isTrustedExternalAppHost('apps.acme.test')).toBe(false);
  });

  it('defines the protocol-wide fallback contract', () => {
    expect(protocolGenericBlueprintExperience.tier).toBe('generic');
    expect(protocolGenericBlueprintExperience.fallbackEnabled).toBe(true);
    expect(
      protocolGenericBlueprintExperience.manifest.surfaces.includes(
        'generic-overview',
      ),
    ).toBe(true);
  });

  it('derives generic blueprint host entries from indexed blueprint data', () => {
    const generic = buildGenericBlueprintAppEntry({
      id: 42n,
      name: 'Research Agent',
      author: 'Alice Labs',
      deployer: '0x0000000000000000000000000000000000000001',
      registrationParams: [],
      requestParams: [],
      imgUrl: null,
      category: 'AI',
      description: 'Indexed blueprint',
      instancesCount: 3,
      operatorsCount: 2,
      stakersCount: null,
      tvl: null,
      isBoosted: false,
      githubUrl: null,
      websiteUrl: null,
      twitterUrl: null,
      email: null,
    });

    const resolved = resolveBlueprintAppView(generic);
    expect(resolved.slug).toBe('research-agent');
    expect(getBlueprintPath(resolved)).toBe('/blueprints/42');
    expect(getBlueprintServicePath(resolved, '9')).toBe(
      '/blueprints/42/services/9',
    );
  });

  it('uses canonical namespaced routes for slug-routed blueprint apps', () => {
    const resolved = resolveBlueprintAppView({
      slug: 'research',
      canonicalSlug: '@alice/research',
      blueprintId: 8n,
      publisher: {
        label: 'Alice Labs',
        namespace: 'alice',
        visibility: 'third-party',
        verification: 'verified',
      },
      tier: 'external-app',
      slugPolicy: 'publisher-scoped',
      manifest: {
        displayName: 'Research',
        tagline: 'Research app',
        description: 'External app',
        surfaces: ['generic-overview'],
        resources: {
          serviceNoun: 'service',
          resourceNoun: 'agent',
          resourceRoute: 'agents',
        },
      },
    });

    expect(getBlueprintPath(resolved)).toBe('/blueprints/@alice/research');
    expect(getBlueprintServicePath(resolved, '5')).toBe(
      '/blueprints/@alice/research/5',
    );
  });
});
