import { WEBB_DOC_ROUTES_RECORD } from '@webb-tools/webb-ui-components/constants';
import populateDocsUrl from '@webb-tools/webb-ui-components/utils/populateDocsUrl';

export const WANT_TO_LEARN_MORE_URL = populateDocsUrl(
  WEBB_DOC_ROUTES_RECORD.concepts['distributed-key-gen#want-to-learn-more']
    .route
);

export const WHAT_IS_TSS_URL = populateDocsUrl(
  WEBB_DOC_ROUTES_RECORD.concepts['tss-governance'].route
);

export const HOW_TSS_WORKS_URL = populateDocsUrl(
  WEBB_DOC_ROUTES_RECORD.concepts['tss-governance']['#how-it-works']
);

export const NODE_OPERATORS_URL = populateDocsUrl(
  WEBB_DOC_ROUTES_RECORD['ecosystem-roles'].relayer['running-relayer'][
    'quick-start'
  ]
);

export const POLKADOT_TANGLE_URL =
  'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc-archive.tangle.tools#/query';
