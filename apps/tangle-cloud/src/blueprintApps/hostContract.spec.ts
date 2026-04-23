import {
  parseBlueprintMetadataDocument,
  parseBlueprintMetadataJsonText,
} from '@tangle-network/tangle-shared-ui/blueprintApps/authoring';

describe('shared blueprint host contract', () => {
  it('parses rich declarative tier 2 metadata', () => {
    const parsed = parseBlueprintMetadataDocument({
      name: 'Atlas',
      description: 'Operator coordination workspace',
      author: 'Northstar',
      blueprintUi: {
        displayName: 'Atlas Workspace',
        description: 'Shared hosted app for Atlas operators.',
        requestedSlug: 'atlas',
        publisher: {
          name: 'Northstar',
          namespace: 'northstar',
          verified: true,
        },
        resources: {
          serviceLabel: 'Workspace',
          itemLabel: 'Run',
          itemRoute: 'runs',
        },
        surfaces: ['generic-overview', 'resources', 'metrics'],
        theme: {
          accentColor: '#0F766E',
          badgeLabel: 'Curated',
          icon: 'bot',
        },
        overviewCards: [
          {
            id: 'uptime',
            kind: 'stat',
            title: 'Operator Uptime',
            value: '99.9%',
          },
        ],
        actions: [
          {
            id: 'provision',
            label: 'Provision workspace',
            target: 'service',
            fields: [
              {
                key: 'workspace_name',
                label: 'Workspace name',
                input: 'text',
                required: true,
              },
            ],
          },
        ],
        resourceViews: [
          {
            id: 'runs',
            title: 'Run ledger',
            kind: 'table',
            target: 'resource',
            columns: [
              { key: 'status', label: 'Status', emphasis: true },
              { key: 'updated_at', label: 'Updated' },
            ],
          },
        ],
        modules: [
          {
            module: 'metrics-overview',
            slot: 'overview',
            metricKeys: ['success_rate', 'latency_p95'],
          },
        ],
      },
    });

    expect(parsed.blueprintUi?.tier).toBe('declarative');
    expect(parsed.blueprintUi?.theme?.accentColor).toBe('#0F766E');
    expect(parsed.blueprintUi?.overviewCards?.[0]?.title).toBe(
      'Operator Uptime',
    );
    expect(parsed.blueprintUi?.actions?.[0]?.fields?.[0]?.key).toBe(
      'workspace_name',
    );
    expect(parsed.blueprintUi?.resourceViews?.[0]?.columns).toHaveLength(2);
    expect(parsed.blueprintUi?.modules?.[0]?.module).toBe('metrics-overview');
  });

  it('rejects oversized metadata payloads', () => {
    const oversized = JSON.stringify({
      name: 'Large Blueprint',
      description: 'x'.repeat(70_000),
    });

    expect(() => parseBlueprintMetadataJsonText(oversized)).toThrow(
      'Blueprint metadata exceeded',
    );
  });
});
