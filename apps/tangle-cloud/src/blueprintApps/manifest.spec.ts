import { buildBlueprintManifestFromMetadata } from './manifest';

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

    expect(entry.tier).toBe('external-app');
    expect(entry.manifest.externalApp?.url).toBe(
      'https://apps.acme.test/trading',
    );
    expect(entry.manifest.externalApp?.trust).toBe('restricted');
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
      rawMetadata: {
        blueprintUi: {
          externalApp: {
            url: 'https://cloud.tangle.tools/blueprints/sandbox',
            mode: 'iframe',
          },
        },
      },
    });

    expect(entry.manifest.externalApp?.trust).toBe('trusted');
  });
});
