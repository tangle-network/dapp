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
      category: 'Trading',
      author: 'Tangle',
      codeRepository: 'https://github.com/tangle/trading-blueprint',
      website: 'https://tangle.tools',
      blueprintUi: {
        slug: 'trading',
        publisher: {
          namespace: 'tangle',
        },
        displayName: 'Trading Agent',
        tagline: 'Trading blueprint on Tangle',
        description: 'Automates strategy execution.',
        surfaces: DEFAULT_BLUEPRINT_UI_DRAFT.surfaces,
        resources: {
          serviceNoun: 'service',
          resourceNoun: 'bot',
          resourceRoute: 'bots',
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
      serviceNoun: 'service',
      resourceNoun: 'resource',
      surfaces: ['chat', 'resources'],
    });
  });
});
