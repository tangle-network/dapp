import { buildBlueprintManifestFromMetadata } from './manifest';

const verifiedMetadata = {
  status: 'verified' as const,
  productionReady: true,
  source: 'ipfs' as const,
  reason: 'verified',
};

const unverifiedMetadata = {
  status: 'unverified' as const,
  productionReady: false,
  source: 'ipfs' as const,
  reason: 'unverified',
};

describe('blueprint app manifest parsing', () => {
  it('falls back to generic protocol rendering when no app metadata exists', () => {
    const { entry, source } = buildBlueprintManifestFromMetadata({
      id: '42',
      blueprintId: 42n,
      owner: '0x0000000000000000000000000000000000000001',
      manager: null,
      metadataUri: 'ipfs://example',
      active: true,
      createdAt: 1n,
      updatedAt: 1n,
      operatorCount: 0n,
      name: 'Research Agent',
      description: 'Protocol indexed blueprint',
      author: 'Alice Labs',
      category: 'AI',
      imageUrl: null,
      codeUrl: null,
      website: null,
      metadataVerification: unverifiedMetadata,
      rawMetadata: null,
    });

    expect(source).toBe('generic');
    expect(entry.tier).toBe('generic');
    expect(entry.slug).toBe('research-agent');
    expect(entry.manifest.resources.serviceNoun).toBe('service');
    expect(entry.publisher.verification).toBe('unverified');
  });

  it('parses declarative blueprint UI metadata', () => {
    const { entry, source } = buildBlueprintManifestFromMetadata({
      id: '7',
      blueprintId: 7n,
      owner: '0x0000000000000000000000000000000000000001',
      manager: null,
      metadataUri: 'ipfs://example',
      active: true,
      createdAt: 1n,
      updatedAt: 1n,
      operatorCount: 0n,
      name: 'Research Agent',
      description: 'Protocol indexed blueprint',
      author: 'Alice Labs',
      category: 'AI',
      imageUrl: null,
      codeUrl: null,
      website: null,
      metadataVerification: verifiedMetadata,
      rawMetadata: {
        blueprintUi: {
          slug: 'research-studio',
          tagline: 'Curated from metadata',
          surfaces: ['generic-overview', 'service-explorer', 'chat'],
          resources: {
            serviceNoun: 'studio',
            resourceNoun: 'agent',
            resourceRoute: 'agents',
          },
          permissions: [
            {
              key: 'session.attach',
              label: 'Session attach',
              scope: 'resource',
            },
          ],
          publisher: {
            namespace: 'alice',
            verification: 'verified',
          },
        },
      },
    });

    expect(source).toBe('metadata');
    expect(entry.tier).toBe('declarative');
    expect(entry.slug).toBe('research-studio');
    expect(entry.slugPolicy).toBe('publisher-scoped');
    expect(entry.manifest.surfaces).toContain('chat');
    expect(entry.manifest.resources.resourceRoute).toBe('agents');
    expect(entry.manifest.permissions?.[0]?.key).toBe('session.attach');
    expect(entry.publisher.verification).toBe('verified');
  });

  it('elevates valid external app config from metadata', () => {
    const { entry } = buildBlueprintManifestFromMetadata({
      id: '8',
      blueprintId: 8n,
      owner: '0x0000000000000000000000000000000000000001',
      manager: null,
      metadataUri: 'ipfs://example',
      active: true,
      createdAt: 1n,
      updatedAt: 1n,
      operatorCount: 0n,
      name: 'External Trading',
      description: 'External UI',
      author: 'Acme',
      category: 'Trading',
      imageUrl: null,
      codeUrl: null,
      website: null,
      metadataVerification: unverifiedMetadata,
      rawMetadata: {
        tangleCloud: {
          slug: 'external-trading',
          externalApp: {
            url: 'https://apps.acme.test/trading',
            mode: 'link',
            label: 'Open Acme app',
          },
        },
      },
    });

    expect(entry.tier).toBe('generic');
    expect(entry.manifest.externalApp).toBeUndefined();
    expect(entry.manifest.description).toContain('unverified');
  });

  it('marks trusted Tangle external app hosts as trusted', () => {
    const { entry } = buildBlueprintManifestFromMetadata({
      id: '9',
      blueprintId: 9n,
      owner: '0x0000000000000000000000000000000000000001',
      manager: null,
      metadataUri: 'ipfs://example',
      active: true,
      createdAt: 1n,
      updatedAt: 1n,
      operatorCount: 0n,
      name: 'Sandbox',
      description: 'Hosted UI',
      author: 'Tangle',
      category: 'AI',
      imageUrl: null,
      codeUrl: null,
      website: null,
      metadataVerification: verifiedMetadata,
      rawMetadata: {
        blueprintUi: {
          publisher: {
            namespace: 'tangle',
            verification: 'verified',
          },
          externalApp: {
            url: 'https://cloud.tangle.tools/blueprints/sandbox',
            mode: 'iframe',
          },
        },
      },
    });

    expect(entry.tier).toBe('external-app');
    expect(entry.manifest.externalApp?.trust).toBe('trusted');
    expect(entry.manifest.externalApp?.mode).toBe('link');
  });

  it('falls back to protocol rendering when metadata is present but not verified', () => {
    const { entry } = buildBlueprintManifestFromMetadata({
      id: '11',
      blueprintId: 11n,
      owner: '0x0000000000000000000000000000000000000001',
      manager: null,
      metadataUri: 'ipfs://example',
      active: true,
      createdAt: 1n,
      updatedAt: 1n,
      operatorCount: 0n,
      name: 'Secure Agent',
      description: 'Protocol indexed blueprint',
      author: 'Alice Labs',
      category: 'AI',
      imageUrl: null,
      codeUrl: null,
      website: null,
      metadataVerification: {
        status: 'invalid',
        productionReady: false,
        source: 'ipfs',
        reason: 'signature mismatch',
      },
      rawMetadata: {
        blueprintUi: {
          slug: 'secure-agent',
          surfaces: ['generic-overview', 'chat'],
        },
      },
    });

    expect(entry.tier).toBe('generic');
    expect(entry.manifest.surfaces).toEqual([
      'generic-overview',
      'service-explorer',
      'actions-panel',
      'permissions',
    ]);
    expect(entry.manifest.description).toContain('signature mismatch');
  });

  it('parses AI Trading iframe metadata into the product app surface', () => {
    const { entry, source } = buildBlueprintManifestFromMetadata({
      id: '78',
      blueprintId: 78n,
      owner: '0x0000000000000000000000000000000000000001',
      manager: null,
      metadataUri: 'ipfs://ai-trading',
      active: true,
      createdAt: 1n,
      updatedAt: 1n,
      operatorCount: 1n,
      name: 'AI Trading Blueprint',
      description: 'Autonomous trading agents',
      author: 'Tangle Network',
      category: 'Trading',
      imageUrl: null,
      codeUrl: null,
      website: null,
      metadataVerification: verifiedMetadata,
      rawMetadata: {
        blueprintUi: {
          displayName: 'AI Trading Desk',
          requestedSlug: 'ai-trading',
          publisher: {
            name: 'Tangle Network',
            namespace: 'tangle',
            verification: 'verified',
          },
          resources: {
            serviceLabel: 'Trading fleet',
            itemLabel: 'Bot',
            itemRoute: 'bots',
          },
          surfaces: ['generic-overview', 'chat', 'metrics', 'resources'],
          externalApp: {
            url: 'https://trading-arena.blueprint.tangle.tools/',
            mode: 'iframe',
            label: 'Open Trading Arena',
            iframe: {
              appId: 'trading-arena',
              allowedChainIds: [31337, 84532],
              allowReadAccount: true,
            },
          },
        },
      },
    });

    expect(source).toBe('metadata');
    expect(entry.slug).toBe('ai-trading');
    expect(entry.publisher.verification).toBe('verified');
    expect(entry.manifest.displayName).toBe('AI Trading Desk');
    expect(entry.manifest.resources.serviceNoun).toBe('Trading fleet');
    expect(entry.manifest.resources.resourceNoun).toBe('Bot');
    expect(entry.manifest.resources.resourceRoute).toBe('bots');
    expect(entry.manifest.surfaces).toContain('chat');
  });
});
