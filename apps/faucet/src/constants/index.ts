import { WEBB_DOC_ROUTES_RECORD } from '@webb-tools/webb-ui-components/constants';
import populateDocsUrl from '@webb-tools/webb-ui-components/utils/populateDocsUrl';

export const TANGLE_DOCS_URL = populateDocsUrl(
  WEBB_DOC_ROUTES_RECORD['tangle-network'].overview,
);
