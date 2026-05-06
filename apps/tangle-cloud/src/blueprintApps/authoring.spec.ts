import {
  buildBlueprintUiMetadataDocument,
  DEFAULT_BLUEPRINT_UI_DRAFT,
  sanitizeBlueprintUiDraft,
} from './authoring';

describe('blueprint ui authoring', () => {
  it('builds a metadata document with blueprintUi hints', () => {
    const document = buildBlueprintUiMetadataDocument({
      name: 'Trading Agent',
      description: 'Automates strategy execution.',
      category: 'Trading',
      codeRepository: 'https://github.com/tangle/trading-blueprint',
      website: 'https://tangle.tools',
      author: 'Tangle',
      draft: {
        ...DEFAULT_BLUEPRINT_UI_DRAFT,
        requestedSlug: 'trading',
        publisherNamespace: 'tangle',
        resourceNoun: 'bot',
        resourceRoute: 'bots',
      },
    });

    expect(document).toEqual({
      name: 'Trading Agent',
      description: 'Automates strategy execution.',
      author: 'Tangle',
      category: 'Trading',
      image: null,
      logo: null,
      website: 'https://tangle.tools',
      codeRepository: 'https://github.com/tangle/trading-blueprint',
      blueprintUi: {
        displayName: 'Trading Agent',
        description: 'Automates strategy execution.',
        requestedSlug: 'trading',
        publisher: {
          name: 'Tangle',
          namespace: 'tangle',
          verified: false,
        },
        resources: {
          serviceLabel: 'Service',
          itemLabel: 'bot',
          itemRoute: 'bots',
        },
        surfaces: {
          genericOverview: true,
          serviceExplorer: true,
          serviceConsole: false,
          actionsPanel: true,
          resources: true,
          chat: false,
          vaults: false,
          metrics: true,
          permissions: false,
        },
      },
    });
  });

  it('normalizes blank fields and deduplicates surfaces', () => {
    expect(
      sanitizeBlueprintUiDraft({
        ...DEFAULT_BLUEPRINT_UI_DRAFT,
        requestedSlug: ' trading ',
        publisherNamespace: ' tangle ',
        serviceNoun: '',
        resourceNoun: '',
        surfaces: ['chat', 'chat', 'resources'],
      }),
    ).toEqual({
      ...DEFAULT_BLUEPRINT_UI_DRAFT,
      requestedSlug: 'trading',
      publisherNamespace: 'tangle',
      serviceNoun: 'Service',
      resourceNoun: 'Resource',
      surfaces: ['chat', 'resources'],
    });
  });
});
